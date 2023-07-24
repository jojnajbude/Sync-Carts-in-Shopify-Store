import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";
import shopify from "../../utils/shopify.js";
import { Item } from "../items/item.entity.js";
import { LogsService } from "../log/logs.service.js";
import { AnalyticsService } from "../analytics/analytics.service.js";

@Injectable()
export class StorefrontService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    private logService: LogsService,
    private analyticsService: AnalyticsService,
  ) {}

  async updateData(cart_id: string, customer_id: string, shop_id: string, os: string) {
    try {
      const shopData = await this.shopsRepository.findOneBy({ shopify_id: Number(shop_id) });

      if (shopData && shopData.carts < shopData.limit) {
        let user = await this.customerRepository.findOneBy({ shopify_user_id: Number(customer_id) });

        if (!user) {
          const session = JSON.parse(shopData?.session);

          const shopifyCustomer = await shopify.api.rest.Customer.find({
            session: session,
            id: customer_id
          });
    
          user = await this.customerRepository.save({ 
            name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`, 
            shopify_user_id: shopifyCustomer.id, 
            shop_id: shopData?.id,
            priority: 'normal',
            email: shopifyCustomer.email,
            location: shopifyCustomer.default_address.country_name,
          }) 
        }

        if (cart_id === 'undefined') {
          const newCart = await this.cartRepository.findOneBy({ customer_id: user?.id });

          if (newCart?.cart_token) {
            return { type: 'Ok' };
          }

          if (newCart) {
            const newItems = await this.itemRepository.findBy({ cart_id: newCart.id });

            await this.itemRepository.remove(newItems);
            await this.cartRepository.remove(newCart);

            return {
              type: 'New cart',
              data: {
                cart: newCart, 
                items: newItems
              }
            };
          }


          return true;
        } else {
          const cart = await this.cartRepository.findOneBy({ cart_token: cart_id });

          if (cart && !cart.os) {
            await this.cartRepository.update({ id: cart.id }, { os: os })
            await this.analyticsService.updateDevices(cart.shop_id, os)
          }

          if(cart && cart?.customer_id !== user?.id) {
            await this.cartRepository.update({ id: cart?.id }, { customer_id: user?.id })
            await this.analyticsService.updateLocations(cart.shop_id, user.location)
          }

          const items = await this.itemRepository.findBy({ cart_id: cart?.id });
          const addedItems = items.filter(item => item.status === 'added');
          const unsyncedItems = items.filter(item => item.status === 'unsynced');
          const removedItems = items.filter(item => item.status === 'removed');
          const recountItems = items.filter(item => item.status === 'recount');

          const response: any = {
            data: {}
          };

          if (addedItems.length) {
            await this.itemRepository.remove(addedItems);

            response.type = 'Update';
            response.data.addedItems = addedItems;
          }

          if (unsyncedItems.length) {
            await this.itemRepository.remove(unsyncedItems);

            response.type = 'Update';
            response.data.updatedItems = unsyncedItems;
          }

          if (removedItems.length) {
            await this.itemRepository.remove(removedItems);

            response.type = 'Update';
            response.data.removedItems = removedItems;
          }

          if (recountItems) {
            for (const item of recountItems) {
              await this.itemRepository.update({ id: item.id }, { status: 'reserved', expire_at: await this.countExpireDate(item.created_at, user.priority, JSON.parse(shopData.priorities) )})
            }
          }

          if (response.type) {
            return response;
          }
        }
      }
    
      return { type: 'Ok' };
    } catch(err) {
      console.log(err);
      return false;
    }
    
  }

  async handleAdding(shop: string, variant: number, qty: number) {
    try {
      const store = await this.shopsRepository.findOneBy({ domain: shop })

      if (store && store.carts < store.limit) {
        if (store && store.session) {
          const session = JSON.parse(store?.session);
    
          const variantRes = await shopify.api.rest.Variant.find({
            session,
            id: variant,
          });
    
          const [variantsReserved] = await this.itemRepository.query(
            `select sum(qty)
            from items
            where variant_id = ${variant}
            AND status IN ('reserved', 'recount', 'added', 'unsynced')`
          );
    
          if (Number(variantsReserved.sum) + Number(qty) > variantRes.inventory_quantity) {
            return 'All items reserved';
          }
        }
      }
      
      return 'Can reserve';
    } catch(err) {
      console.log(err);
      return false;
    } 
  }

  async createCart(shop: string, cartData: any) {
    try {
      const store = await this.shopsRepository.findOneBy({ domain: shop });

      if (store) {
        const cart = await this.cartRepository.save({ cart_token: cartData.token, shop_id: store?.id });
        await this.shopsRepository.update({ id: store.id }, { carts: store.carts + 1 });
        await this.analyticsService.updateConversionRate(store.id, 'add');

        return cart;
      }
      
      return undefined;
    } catch(err) {
      console.log(err);
    }
  }

  async updateCart(cartData: any, shop: string) {
    try {
      const store = await this.shopsRepository.findOneBy({ domain: shop });

      if (store && store.carts < store.limit) {
        const session = JSON.parse(store.session);

        let cart: Cart | null | undefined = await this.cartRepository.findOneBy({ cart_token: cartData.token })
        if (!cart) {
          cart = await this.createCart(shop, cartData)
          if (!cart) {
            return false;
          }
        }

        let customer = null;

        if (cart.customer_id) {
          customer = await this.customerRepository.findOneBy({ id: cart.customer_id });
        }

        const items = await this.itemRepository.createQueryBuilder('items')
          .leftJoin('items.cart', 'carts')
          .where('carts.cart_token = :token', { token: cartData.token })
          .getMany();

        const updatedItems = [];

        if (items.length > cartData.line_items.length) {
          const deletedItem = items.find(item => !cartData.line_items.find((line_item: { id: number; }) => line_item.id === Number(item.variant_id)))

          if (deletedItem) {
            const removeItem = await this.itemRepository.remove(deletedItem)
            await this.cartRepository.update({ id: cart.id }, { last_action: new Date() })

            const log = {
              type: 'delete',
              domain: shop,
              date: new Date(),
              customer_name: customer?.name,
              product_name: deletedItem.title,
              link_id: `${deletedItem.product_id}`,
              cart_id: deletedItem.cart_id,
            }
        
            await this.logService.createLog(log);

            return removeItem
          }
        }

        for (const line_item of cartData.line_items) {
          const item = items.find(item => Number(item.variant_id) === line_item.variant_id)

          if (item && Number(item.qty) !== line_item.quantity) {
            updatedItems.push(await this.itemRepository.save({ id: item.id, qty: line_item.quantity }));

            const log = {
              type: 'qty',
              domain: shop,
              date: new Date(),
              customer_name: customer ? customer.name : null,
              product_name: item.title,
              link_id: `${item.product_id}`,
              qty: line_item.quantity,
              cart_id: item.cart_id,
            }

            await this.logService.createLog(log);
          } else if (!item) {
            const product = await shopify.api.rest.Product.find({
              session,
              id: line_item.product_id,
            })
    
            const variant = product.variants.find((variant: { id: number; }) => variant.id === line_item.variant_id)
    
            const imgSrc = await shopify.api.rest.Image.find({
              session,
              product_id: product.id,
              id: variant.image_id,
            })
    
            let expireTime = null;

            if (customer) {
              expireTime = this.countExpireDate(new Date(), customer.priority, JSON.parse(store.priorities));

              updatedItems.push(await this.itemRepository.save({ 
                variant_id: line_item.variant_id, 
                qty: line_item.quantity, 
                cart_id: cart?.id, 
                price: line_item.price, 
                title: product.title, 
                image_link: imgSrc ? imgSrc.src : null, 
                product_id: variant.product_id,
                expire_at: await expireTime,
              }))

              const log = {
                type: 'add',
                domain: shop,
                date: new Date(),
                customer_name: customer ? customer.name : null,
                product_name: product.title,
                link_id: `${variant.product_id}`,
                cart_id: cart?.id,
              }

              await this.logService.createLog(log);
            } else {
              expireTime = this.countExpireDate(new Date(), 'unknown', JSON.parse(store.priorities));
              const newItem = { 
                variant_id: line_item.variant_id,
                variant_title: line_item.variant.title,
                qty: line_item.quantity, 
                cart_id: cart?.id, 
                price: line_item.price, 
                title: product.title, 
                image_link: imgSrc.src, 
                product_id: variant.product_id,
                status: 'recount',
                expire_at: await expireTime,
              }

              updatedItems.push(await this.itemRepository.save(newItem))

              const log = {
                type: 'created',
                domain: shop,
                date: new Date(),
                customer_name: null,
                product_name: product.title,
                link_id: `${variant.product_id}`,
                cart_id: cart?.id,
              }

              await this.logService.createLog(log);
            }
          }
        }
        await this.cartRepository.update({ id: cart.id }, { last_action: new Date() })

        return updatedItems;
      }

      return false;
    } catch(err) {
      console.log(err);
      return false;
    }
  }

  async getReserveTime(variant: string, cart_token: string, shop: number) {
    try {
      const shopData = await this.shopsRepository.findOneBy({ shopify_id: shop })

      if (shopData && shopData.carts < shopData.limit) {
        const cart = await this.cartRepository.findOneBy({ cart_token: cart_token });
        const cartItem = await this.itemRepository.findOneBy({ variant_id: Number(variant), cart_id: cart?.id });

        return cartItem?.status === 'reserved' ? cartItem : false;
      }
      
      return false;
    } catch(err) {
      console.log(err);
      return false;
    }
    
  }

  async countExpireDate(startDate: Date, priority: string, priorities: any) {
    try {
      let reservationTime = 0;

      switch(true) {
        case priority === 'max':
          reservationTime = priorities.max_priority;
          break;
        case priority === 'high':
          reservationTime = priorities.high_priority;
          break;
        case priority === 'normal':
          reservationTime = priorities.normal_priority;
          break;
        case priority === 'low':
          reservationTime = priorities.low_priority;
          break;
        case priority === 'min':
          reservationTime = priorities.min_priority;
          break;
        default:
          reservationTime = 24;
          break;
      }
      
      const expandTime = 3600000 * reservationTime;

      return new Date(startDate.getTime() + expandTime);
    } catch(err) {
      console.log(err);
    }
  }

  async handleOrderPaid(cart_token: string, totalPrice: number) {
    try {
      const [cart] = await this.cartRepository.query(
        `select carts.*, shops.domain, customers.name 
        from carts
        left join customers on customers.id = carts.customer_id
        left join shops on shops.id = carts.shop_id
        where carts.cart_token = '${cart_token}'`
      );

      if (!cart) {
        // TODO: Handle if cart not found
        return [];
      }
  
      const paidCart = await this.cartRepository.update({ cart_token },{ closed_at: new Date(), final_price: totalPrice });
      const paidItems = await this.itemRepository.createQueryBuilder()
        .update()
        .set({ status: 'paid' })
        .where({ cart_id: cart.id })
        .returning('*')
        .execute();
  
      await this.cartRepository.update({ id: cart.id }, { last_action: new Date() })

      await this.analyticsService.addSale(cart.shop_id, totalPrice);
      await this.analyticsService.updateConversionRate(cart.shop_id, 'paid');
      await this.analyticsService.updateTopSold(cart.shop_id, paidItems.raw);
  
      const log = {
        type: 'paid',
        domain: cart.domain,
        date: new Date(),
        customer_name: cart.name,
        cart_id: cart.id,
      }
  
      await this.logService.createLog(log);
  
      return [paidCart, paidItems]
    } catch(err) {
      console.log(err);
    }
  }

  async handleAppUninstalled(shop: string) {
    try {
      const shopEntity = await this.shopsRepository.findOneBy({ domain: shop });

      if (shopEntity) {
        console.log('uninstalled hook')
        const session = JSON.parse(shopEntity.session);
        console.log(session)

        return await this.shopsRepository.update({ domain: shop }, { plan: 'Free', limit: 25, charge_id: undefined, session: undefined });
      } else {
        return false;
      }
    } catch(err) {
      console.log(err);
    }
  }

  async updateTime(oldItems: any[], cart_token: string) {
    try {
      const items = await this.itemRepository.query(
        `select * from items
        left join carts on carts.id = items.cart_id
        where cart_token = '${cart_token}'`
      )

      for (const oldItem of oldItems) {
        const index = items.findIndex((item: any) => String(item.variant_id) === String(oldItem.variant_id))

        items[index].expire_at = oldItem.expire_at;
      }

      await this.itemRepository.save(items)
    } catch(err) {
      return false;
    }
  }
}