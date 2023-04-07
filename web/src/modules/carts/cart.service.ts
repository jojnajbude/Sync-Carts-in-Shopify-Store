import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Item } from "../items/item.entity.js";
import { shopifySession } from "../../types/session.js";
import { Shop } from "../shops/shop.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Cart } from "./cart.entity.js";

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
    @InjectRepository(Item) private itemRepository: Repository<Item>
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

  async getCart(cartId: string, session: shopifySession) {
    const cartItems = await this.itemRepository.query(
      `select items.*, customers.name, customers.shopify_user_id, customers.priority
      from items
      left join carts
      on items.cart_id = carts.id
      left join customers
      on carts.customer_id = customers.id
      where items.cart_id = ${cartId}`
    )

    const cart = await this.handleData(cartItems, session.shop);

    return cart ? cart : false
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
    const oldDates = await this.itemRepository.find({ where: { cart_id: In(ids) }});
    
    for (const item of oldDates) {
      item.createdAt = new Date(item.createdAt.getTime() + Number(time));
    }

    const newTimers = await this.itemRepository.save(oldDates);
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
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      })[0].createdAt;

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