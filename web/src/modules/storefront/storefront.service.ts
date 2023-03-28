import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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

  async getCartData(user_id: number, shop_id: number, cart_id: string) {
    try {
      let user = await this.customerRepository.findOneBy({ shop_id: shop_id, shopify_user_id: user_id })

      if (user) {
        return await this.handleCart(user.id, cart_id, shop_id, user_id)
        
      } else {
        const shop = await this.shopsRepository.findOneBy({ shopify_id: shop_id })

        if(shop && shop.session) {
          const session = JSON.parse(shop.session)

          const data = await shopify.api.rest.Customer.find({
            session,
            id: user_id
          })

          // update insert into logic when permissions will be given
          const newUser = await this.customerRepository.save({ cart_id, shop_id, shopify_user_id: user_id })

          return await this.handleCart(newUser.id, cart_id, shop_id, user_id)
        }
      }
    } catch (err) {
      console.log(err);
      return false
    }
  }

  async handleCart(id: number, cart_id: string, shop_id: number, user_id: number) {
    if (cart_id !== 'undefined') {
      let cart = await this.cartRepository.findOneBy({ cart_token: cart_id })

      if (!cart) {
        await this.cartRepository.insert({ customer_id: user_id, shop_id, cart_token: cart_id })
        await this.customerRepository.update({ id }, { cart_id })

        cart = await this.cartRepository.findOneBy({ cart_token: cart_id })
      }

      return cart
    }
    
    return false
  }

  async addToCart(customer: number, shop: number, cart: string, variant: number, qty: number) {
    const item = await this.itemRepository.findOneBy({ variant_id: variant, cart_id: cart, shop, customer });

    if (item) {
      const newQty = Number(item.qty) + Number(qty);
      console.log(newQty, item.qty, qty)
      const handleAdding = await this.itemRepository.save({ id: item.id, variant_id: variant, qty: newQty, cart_id: cart, shop, customer });
      return handleAdding;
    } else {
      const handleAdding = await this.itemRepository.save({ variant_id: variant, qty, cart_id: cart, shop, customer });
      return handleAdding;
    }
  }
}