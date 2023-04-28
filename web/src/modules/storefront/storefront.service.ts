import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";
import shopify from "../../utils/shopify.js";
import { Item } from "../items/item.entity.js";
import { LogsService } from "../log/logs.service.js";

@Injectable()
export class StorefrontService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    private logService: LogsService
  ) {}

  async updateData(cart_id: string, customer_id: string, shop_id: string, os: string) {
    const shopData = await this.shopsRepository.findOneBy({ shopify_id: Number(shop_id) });

    if (shopData && shopData.carts < shopData.limit) {
      let user = await this.customerRepository.findOneBy({ shopify_user_id: Number(customer_id) });

      if (!user?.os) {
        await this.customerRepository.update({ id: user?.id }, { os: os });
      }

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
          location: shopifyCustomer.default_address.country_name,
          os: os,
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

        if(cart?.customer_id !== user?.id) {
          await this.cartRepository.update({ id: cart?.id }, { customer_id: user?.id })
        }

        const items = await this.itemRepository.findBy({ cart_id: cart?.id });
        const addedItems = items.filter(item => item.status === 'added');
        const unsyncedItems = items.filter(item => item.status === 'unsynced');
        const removedItems = items.filter(item => item.status === 'removed');

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

        if (response.type) {
          return response;
        }
      }
    }
  
    return { type: 'Ok' };
  }

  async handleAdding(shop: string, variant: number, qty: number) {
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
          AND status = 'reserved'`
        );
  
        if (Number(variantsReserved.sum) + Number(qty) > variantRes.inventory_quantity) {
          return 'All items reserved';
        }
      }
    }  
    
    return 'Can reserve';
  }

  async createCart(shop: string, cartData: any) {
    const store = await this.shopsRepository.findOneBy({ domain: shop });

    if (store) {
      const cart = await this.cartRepository.save({ cart_token: cartData.token, shop_id: store?.id });
      const updatePlan = await this.shopsRepository.update({ id: store.id }, { carts: store.carts + 1 })

      return cart;
    }
    
    return null;
  }

  async updateCart(cartData: any, shop: string) {
    const store = await this.shopsRepository.findOneBy({ domain: shop });

    if (store) {
      const session = JSON.parse(store.session);

      let cart = await this.cartRepository.findOneBy({ cart_token: cartData.token })

      if (!cart) {
        cart = await this.createCart(shop, cartData)
        
        if (!cart) {
          return false;
        }
      }

      const customer = await this.customerRepository.findOneBy({ id: cart.customer_id });

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
          }
      
          const newLog = await this.logService.createLog(log);

          return removeItem
        }
      }

      for (const line_item of cartData.line_items) {
        const item = items.find(item => Number(item.variant_id) === line_item.variant_id)

        if (item && Number(item.qty) !== line_item.quantity) {
          updatedItems.push(await this.itemRepository.save({ id: item.id, qty: line_item.quantity }))
        } else if (!item) {
          if (customer) {
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
    
            const expireTime = this.countExpireDate(new Date(), customer?.priority, JSON.parse(store.priorities));
    
            updatedItems.push(await this.itemRepository.save({ 
              variant_id: line_item.variant_id, 
              qty: line_item.quantity, 
              cart_id: cart?.id, 
              price: line_item.price, 
              title: product.title, 
              image_link: imgSrc.src, 
              product_id: variant.product_id,
              expire_at: await expireTime,
            }))

            const log = {
              type: 'add',
              domain: shop,
              date: new Date(),
              customer_name: customer?.name,
              product_name: product.title,
              link_id: `${variant.product_id}`,
            }
        
            const newLog = await this.logService.createLog(log);
          }
        }
      }
      await this.cartRepository.update({ id: cart.id }, { last_action: new Date() })

      return updatedItems;
    }
  }

  async updateUser(user: any) {
    const customer = await this.customerRepository.findOneBy({ shopify_user_id: user.id });

    // logic of updating name or email or phone
    // add when receive access

    return customer
  }

  async getReserveTime(variant: string, cart_token: string, user: string, shop: string) {
    const cart = await this.cartRepository.findOneBy({ cart_token: cart_token });
    const cartItem = await this.itemRepository.findOneBy({ variant_id: Number(variant), cart_id: cart?.id });

    return cartItem?.status === 'reserved' ? cartItem : false;
  }

  async countExpireDate(startDate: Date, priority: string, priorities: any) {
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
  }

  async handleOrderPaid(cart_token: string, totalPrice: number) {
    // const cart = await this.cartRepository.findOneBy({ cart_token })
    const cart = await this.cartRepository.query(
      `select * from carts
      left join customers on customers.id = carts.customer_id
      left join shops on shops.id = carts.shop_id
      where carts.cart_token = ${cart_token}`
    )
    const paidCart = await this.cartRepository.update({ cart_token },{ closed_at: new Date(), final_price: totalPrice });
    const paidItems = await this.itemRepository.createQueryBuilder()
      .update()
      .set({ status: 'paid' })
      .where({ cart_id: cart?.id })
      .execute();

    await this.cartRepository.update({ id: cart?.id }, { last_action: new Date() })

    const log = {
      type: 'paid',
      domain: cart.domain,
      date: new Date(),
      customer_name: cart.customer_name,
    }

    const newLog = await this.logService.createLog(log);

    return [paidCart, paidItems]
  }
}