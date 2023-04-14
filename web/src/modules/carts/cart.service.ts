import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, Repository } from "typeorm";
import { Item } from "../items/item.entity.js";
import { shopifySession } from "../../types/session.js";
import { Shop } from "../shops/shop.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Cart } from "./cart.entity.js";
import shopify from "../../utils/shopify.js";
import { CustomerService } from "../customers/customer.service.js";
import { ShopService } from "../shops/shop.service.js";
import { StorefrontService } from "../storefront/storefront.service.js";

type TableRow = {
  id: any;
  customer_name: any;
  total: number;
  reserved_indicator: string;
  reservation_time: string;
  qty: number;
  items: any[];
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
  ) {}

  async getShopCarts(session: shopifySession) {
    try {
      // const carts = await this.itemRepository.createQueryBuilder('items')
      //   .select(['items.*', 'customers.name'])
      //   .leftJoin('items.cart', 'carts')
      //   .leftJoin('carts.customer', 'customers')
      //   .leftJoin('carts.shop', 'shops')
      //   .where('shops.domain = :domain', { domain: session.shop })
      //   .getMany();

      const carts = await this.itemRepository.query(
        `select items.*, customers.name, customers.shopify_user_id
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

  async createNewCart(cart: any, customer: any, session: shopifySession) {
    const [shop] = await this.shopsService.getShopData(session);
    const shopData = await this.shopsRepository.findOneBy({ shopify_id: shop.id });
    const customerData = await this.customerRepository.findOneBy({ shopify_user_id: customer.id })

    const newCart = await this.cartRepository.save({ customer_id: customerData?.id, shop_id: shopData?.id });

    const items = [];

    for (const item of cart.items) {
      let reservationTime = 0;

        switch(true) {
          case customerData?.priority === 'max':
            reservationTime = 336;
            break;
          case customerData?.priority === 'high':
            reservationTime = 72;
            break;
          case customerData?.priority === 'normal':
            reservationTime = 24;
            break;
          case customerData?.priority === 'low':
            reservationTime = 8;
            break;
          case customerData?.priority === 'min':
            reservationTime = 1;
            break;
        }

      const expireTime = this.storefrontService.countExpireDate(new Date(), reservationTime);
      const newItem = {
        variant_id: item.id,
        product_id: item.product_id,
        qty: item.qty,
        expireAt: expireTime,
        status: 'reserved',
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

  async getCart(cartId: string, session: shopifySession) {
    const cartItems = await this.itemRepository.query(
      `select items.*, customers.name, customers.id as customer_id, customers.shopify_user_id, customers.priority
      from items
      left join carts
      on items.cart_id = carts.id
      left join customers
      on carts.customer_id = customers.id
      where items.cart_id = ${cartId}`
    )

    const customer = await this.customerService.getCustomer(session, cartItems[0].shopify_user_id)

    const shop = await shopify.api.rest.Shop.all({
      session,
    });

    const cart = await this.handleData(cartItems, session.shop);

    return cart && customer && shop ? [cart, customer, shop] : false
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
    }

    const filteredTable = table?.filter(cart => cart.reserved_indicator === indicator);

    return filteredTable
  }

  async expandTimers(ids: number[], time: string) {
    const items = await this.itemRepository.find({ where: { cart_id: In(ids) }});
    
    for (const item of items) {
      item.status = 'reserved';
      item.expireAt = new Date(new Date().getTime() + Number(time));
    }

    const newTimers = await this.itemRepository.save(items);
    return newTimers
  }

  async unreserveItems(ids: number[]) {
    const updateItems = await this.itemRepository.update({ cart_id: In(ids) }, { status: 'unreserved' })

    return updateItems
  }

  async removeItems(ids: number[]) {
    const removedItems = await this.itemRepository.delete({ cart_id: In(ids)})

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
        });
      }
    }

    for (const cart of table) {
      if (cart.items.every(item => item.status === 'reserved')) {
        cart.reserved_indicator = 'all';
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
        const dateA = new Date(a.expireAt);
        const dateB = new Date(b.expireAt);
        return dateA.getTime() - dateB.getTime();
      })[0].expireAt;

      cart.qty = qty;
      cart.total = total;
      cart.reservation_time = new Date(shortestDate).toLocaleString();
    }

    return table;
  }

  sortCarts(carts: TableRow[], index: number, direction: 'ascending' | 'descending') {
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