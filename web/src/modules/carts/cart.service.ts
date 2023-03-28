import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import shopify from "../../utils/shopify.js";
import { Shop } from "../shops/shop.entity.js";
import { Cart } from "./cart.entity.js";

@Injectable()
export class CartService {
  constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>, @InjectRepository(Cart) private cartRepository: Repository<Cart>) {}

  async getShopCarts(session: Object) {
    try {
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session })

      const [customer] = await shopify.api.rest.Customer.all({
        session: session,
      })
      
      const shop = await this.shopRepository.findOneBy({ shopify_id: shopifyShopData.id })

      if (shop) {
        const carts = await this.cartRepository.findBy({ shop_id: shop.id });

        return carts
      }
    } catch (err) {
      console.log(err)
    }
  }
}