import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Item } from "../items/item.entity.js";
import { shopifySession } from "../../types/session.js";
import { Shop } from "../shops/shop.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Cart } from "./cart.entity.js";
import shopify from "../../utils/shopify.js";
import { CustomerService } from "../customers/customer.service.js";
import { ShopService } from "../shops/shop.service.js";
import { StorefrontService } from "../storefront/storefront.service.js";
import { NotificationsService } from "../notifications/notifications.service.js";

type TableRow = {
  id: any;
  customer_name: any;
  total: number;
  reserved_indicator: string;
  reservation_time: string;
  qty: number;
  items: any[];
  customer_shopify_id: string;
  shop_domain: string;
  priority: string | undefined;
  last_action: string;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    private readonly customerService: CustomerService,
    private readonly shopsService: ShopService,
    private readonly storefrontService: StorefrontService,
    private readonly notificationsService: NotificationsService
  ) {}

  async getShopCarts(session: shopifySession) {
    try {
      const carts = await this.itemRepository.query(
        `select items.*, customers.name, customers.priority, customers.shopify_user_id, carts.last_action
        from items
        left join carts
        on items.cart_id = carts.id
        left join customers
        on carts.customer_id = customers.id
        left join shops
        on  carts.shop_id = shops.id
        where shops.domain = '${session.shop}'`
      );

      const table = this.handleData(carts, session.shop);

      return table;
    } catch (err) {
      console.log(err)
    }
  }

  async getLastActivityCarts(session: shopifySession) {
    const carts = await this.getShopCarts(session);

    if (carts) {
      let lastCarts = this.sortCarts(carts, 10, 'descending');
      if (lastCarts.length > 10) {
        lastCarts = lastCarts.slice(0, 10);
      }
      return lastCarts
    }
  
    return false;
  }

  async createNewCart(cart: any, customer: any, session: shopifySession) {
    const [shop] = await this.shopsService.getShopData(session);
    const shopData = await this.shopsRepository.findOneBy({ shopify_id: shop.id });

    if (shopData) {
      let customerData = await this.customerRepository.findOneBy({ shopify_user_id: customer.id })

      if (!customerData) {
        customerData = await this.customerRepository.save({ 
          name: `${customer.first_name} ${customer.last_name}`, 
          shopify_user_id: customer.id, 
          shop_id: shopData?.id,
          priority: customer.priority || 'normal',
          location: customer.default_address.country_name,
          email: customer.email
        })
      }

      const newCart = await this.cartRepository.save({ customer_id: customerData?.id, shop_id: shopData?.id });

      const items = [];

      for (const item of cart.items) {
        const expireTime = this.storefrontService.countExpireDate(new Date(), customerData.priority, JSON.parse(shopData.priorities));
        const newItem = {
          variant_id: item.id,
          product_id: item.product_id,
          qty: item.qty,
          expire_at: await expireTime,
          status: item.reserved_indicator,
          cart_id: newCart.id,
          price: item.price,
          title: item.title,
          image_link: item.image_link,
        }

        items.push(newItem);
      }

      const newItems = await this.itemRepository.save(items);

      return newItems ? newCart : false;
    }
  }

  async getCart(cartId: string, session: shopifySession) {
    try {
      const cartItems = await this.itemRepository.query(
        `select items.*, customers.name, customers.id as customer_id, customers.shopify_user_id, customers.priority
        from items
        left join carts
        on items.cart_id = carts.id
        left join customers
        on carts.customer_id = customers.id
        where items.cart_id = ${cartId}`
      )

      let customer = null;
  
      if (cartItems[0].shopify_user_id) {
        customer = await this.customerService.getCustomer(session, cartItems[0].shopify_user_id)
      }
  
      const shop = await shopify.api.rest.Shop.all({
        session,
      });
  
      const cart = await this.handleData(cartItems, session.shop);
  
      return cart && shop ? [cart, customer, shop] : false
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async updateCartItems(cart: any, customer: any) {
    const shop = await this.shopsRepository.findOneBy({ domain: cart.shop_domain });

    if (shop) {
      const oldItems = await this.itemRepository.findBy({ cart_id: cart.id });

      for (const oldItem of oldItems) {
        if (!cart.items.find((item: any) => item.variant_id == oldItem.variant_id)) {
          await this.itemRepository.save({ id: oldItem.id, status: 'removed' })
        }
      }

      for (const item of cart.items) {
        const existItemIndex = oldItems.findIndex(oldItem => oldItem.variant_id === item.variant_id);

        if (existItemIndex !== -1) {
          if (oldItems[existItemIndex].qty !== item.qty) {
            const expireTime = this.storefrontService.countExpireDate(new Date(), customer.priority, JSON.parse(shop.priorities))
            await this.itemRepository.save({ id: oldItems[existItemIndex].id, qty: item.qty, status: 'unsynced', expire_at: await expireTime })
          }
        } else {
          console.log(item)
          const expireTime = this.storefrontService.countExpireDate(new Date(), customer.priority, JSON.parse(shop.priorities))
          await this.itemRepository.save({ 
            cart_id: cart.id, 
            variant_id: item.variant_id, 
            qty: item.qty, 
            status: item.reserved_indicator, 
            price: item.price, 
            title: item.title, 
            image_link: item.image_link, 
            product_id: item.product_id,
            expire_at: await expireTime,
            variant_title: item.variant_title,
          })
        }
      }

      await this.cartRepository.update({ id: cart.id }, { last_action: new Date() })
      await this.notificationsService.sendEmail('update', shop, [customer.email]);

      return true
    }
  }

  async getSortedCarts(session: shopifySession, direction: 'ascending' | 'descending', index: string,) {
    const table = await this.getShopCarts(session);

    if (table) {
      const sortedTable = await this.sortCarts(table, Number(index), direction);
      
      return sortedTable;
    }

    return false
  }

  async getFilteredCarts(session: shopifySession, index: string) {
    const table = await this.getShopCarts(session);

    let indicator = '';

    switch (true) {
      case index === '1':
        indicator = 'all'
        break;
      case index === '2':
        indicator = 'part'
        break;
      case index === '3':
        indicator = 'no'
        break;
      case index === '4':
        indicator = 'paid'
        break;
    }

    const filteredTable = table?.filter(cart => cart.reserved_indicator === indicator);

    return filteredTable
  }

  async expandTimers(ids: number[], time: string) {
    const items = await this.itemRepository.find({ where: { cart_id: In(ids) }});
    
    for (const item of items) {
      item.status = 'reserved';
      item.expire_at = new Date(new Date().getTime() + Number(time));
    }

    const newTimers = await this.itemRepository.save(items);
    await this.cartRepository.update({ id: In(ids) }, { last_action: new Date() })
    return newTimers
  }

  async unreserveItems(ids: number[]) {
    const updateItems = await this.itemRepository.update({ cart_id: In(ids) }, { status: 'unreserved' })
    await this.cartRepository.update({ id: In(ids) }, { last_action: new Date() })

    return updateItems
  }

  async removeItems(ids: number[]) {
    const removedItems = await this.itemRepository.update({ cart_id: In(ids)}, { status: 'removed'})
    await this.cartRepository.update({ id: In(ids) }, { last_action: new Date() })

    return removedItems
  }

  handleData(data: any, shop: string) {
    const table = [];

    for (const item of data) {
      const index = table.findIndex(cart => cart.id === item.cart_id);
      if (index !== -1) {
        table[index].items.push(item);
      } else {
        table.push({
          id: item.cart_id,
          customer_name: item.name,
          total: 0,
          reserved_indicator: '',
          reservation_time: '',
          qty: 0,
          items: [item],
          customer_shopify_id: item.shopify_user_id,
          shop_domain: shop,
          priority: item.priority,
          last_action: String(new Date(item.last_action))
        });
      }
    }

    for (const cart of table) {
      if (cart.items.every(item => item.status === 'paid')) {
        cart.reserved_indicator = 'paid';
      } else if (cart.items.every(item => item.status === 'reserved')) {
        cart.reserved_indicator = 'all';
      } else if (cart.items.find(item => item.status === 'unsynced' || item.status === 'removed' || item.status === 'added')) {
        cart.reserved_indicator = 'unsynced'; 
      } else if (cart.items.find(item => item.status === 'reserved')) {
        cart.reserved_indicator = 'part';
      } else {
        cart.reserved_indicator = 'no';
      }

      const total = cart.items.reduce(
        (acc: number, cur: Item) =>
          acc + Number(cur.qty) * Number(cur.price),
        0,
      );

      const qty = cart.items.reduce(
        (acc: number, cur: Item) => acc + Number(cur.qty),
        0,
      );

      const shortestDate = cart.items.sort((a: Item, b: Item) => {
        const dateA = new Date(a.expire_at);
        const dateB = new Date(b.expire_at);
        return dateA.getTime() - dateB.getTime();
      })[0].expire_at;
      cart.qty = qty;
      cart.total = total;
      cart.reservation_time = new Date(shortestDate).toString();
    }

    return table.filter(cart => cart.customer_name !== null);
  }

  sortCarts(carts: TableRow[], index: number, direction: 'ascending' | 'descending') {
    if (index === 6) {
      return [...carts].sort((rowA: TableRow, rowB: TableRow) => {
        const dateA = new Date(rowA['last_action']);
        const dateB = new Date(rowB['last_action']);

        return direction === 'descending'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
    }

    return [...carts].sort((rowA: TableRow, rowB: TableRow) => {
      const amountA = rowA[Object.keys(rowA)[index] as keyof TableRow];
      const amountB = rowB[Object.keys(rowB)[index] as keyof TableRow];

      if (typeof amountA === 'number' && typeof amountB === 'number') {
        return direction === 'descending'
          ? amountB - amountA
          : amountA - amountB;
      } else if (typeof amountA === 'string' && typeof amountB === 'string') {
        return direction === 'descending'
          ? amountB.localeCompare(amountA)
          : amountA.localeCompare(amountB);
      } else {
        return 0
      }
    });
  };
}