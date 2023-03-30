import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";
import shopify from "../../utils/shopify.js";
import { Item } from "../items/item.entity.js";

@Injectable()
export class StorefrontService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>
  ) {}

  async getData(user_id: number, shop_id: number, cart_id: string) {
    try {
      let user = await this.customerRepository.findOneBy({ shopify_user_id: user_id });
      const shop = await this.shopsRepository.findOneBy({ shopify_id: shop_id });
      
      if (!user) {
        // const session = JSON.parse(shop.session)

        //     const data = await shopify.api.rest.Customer.find({
        //       session,
        //       id: user_id
        //     })``

        user = await this.customerRepository.save({ shopify_user_id: user_id, shop_id: shop?.id });
      }

      if (cart_id !== 'undefined') {
        let cart = await this.cartRepository.findOneBy({ cart_token: cart_id });

        if (!cart) {
          // cart = await this.cartRepository.findOneBy({ customer_id: user.id, shop_id: shop?.id, cart_token: IsNull() });
          cart = await this.cartRepository.save({ cart_token: cart_id, customer_id: user.id, shop_id: shop?.id });
        }

        return cart;
      }

      return false;
    } catch (err) {
      console.log(err);
      return false
    }
  }

  // async handleCart(id: number, cart_id: string, shop_id: number, user_id: number) {
  //   if (cart_id !== 'undefined') {
  //     let cart = await this.cartRepository.findOneBy({ cart_token: cart_id });

  //     if (!cart) {
  //       const existingCart = await this.cartRepository.findOneBy({ });

  //       if (existingCart) {
  //         cart = await this.cartRepository.save({ id: existingCart.id, cart_token: cart_id })
  //       } else {
  //         cart = await this.cartRepository.save({ customer_id: user_id, shop_id, cart_token: cart_id });
  //       }
  //     }

  //     return cart
  //   }
    
  //   return false
  // }

  async addToCart(customer: number, shop: number, cart_token: string, variant: number, qty: number) {
    if (cart_token === 'undefined') {
    //   const handleAdding = await this.itemRepository.save({ variant_id: variant, qty });
    //   const createdCart = await this.cartRepository.save({ });

    //   return createdCart;
    } else {
      const cart = await this.cartRepository.findOneBy({ cart_token });
      const item = await this.itemRepository.findOneBy({ variant_id: variant, cart_id: cart?.id });

      if (item) {
        const newQty = Number(item.qty) + Number(qty);
        const handleAdding = await this.itemRepository.save({ id: item.id, variant_id: variant, qty: newQty, cart_id: cart?.id });
        return handleAdding;
      } else {
        const handleAdding = await this.itemRepository.save({ variant_id: variant, qty, cart_id: cart?.id });
        return handleAdding;
      }
    }
  }

  async getReserveTime(variant: string, cart_token: string, user: string, shop: string) {
    const cart = await this.cartRepository.findOneBy({ cart_token: cart_token });
    const cartItem = await this.itemRepository.findOneBy({ variant_id: Number(variant), cart_id: cart?.id });

    return cartItem?.createdAt;
  }
}