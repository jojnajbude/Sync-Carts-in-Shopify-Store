import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Item } from "../items/item.entity.js";
import { shopifySession } from "../../types/session.js";
import { Shop } from "../shops/shop.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Cart } from "./cart.entity.js";

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
        `select items.*, customers.name 
        from items
        left join carts
        on items.cart_id = carts.id
        left join customers
        on carts.customer_id = customers.id
        left join shops
        on  carts.shop_id = shops.id
        where shops.domain = '${session.shop}'`
      );

      return carts;
    } catch (err) {
      console.log(err)
    }
  }

  async unreserveItems(ids: number[]) {
    const updateItems = await this.itemRepository.update({ cart_id: In(ids)}, { status: 'unreserved' })

    return updateItems.affected
  }

  async removeItems(ids: number[]) {
    const removedItems = await this.itemRepository.delete({ cart_id: In(ids)})
    console.log(removedItems)

    return removedItems.affected
  }
}