import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import shopify from "../../utils/shopify.js";

@Injectable()
export class StorefrontService {
  constructor(private dataSource: DataSource) {}

  async getCartData(user_id: string, shop_id: string, cart_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const [user] = await queryRunner.query(`SELECT * FROM customers WHERE shop_id=${shop_id} AND shopify_user_id=${user_id}`)

    if (user) {
      if (cart_id !== 'undefined') {
        let cart = await queryRunner.query(`SELECT * FROM carts WHERE cart_token = '${cart_id}'`)

        if (!cart.length) {
          await queryRunner.query(`INSERT INTO carts (id, customer_id, customer_name, email, shop_id, cart_token) VALUES (DEFAULT, ${user.shopify_user_id}, '${user.name}', '${user.email}', ${shop_id}, '${cart_id}')`)
          await queryRunner.query(`UPDATE customers SET cart_id = ${cart_id} WHERE id = ${user.id}`)

          cart = await queryRunner.query(`SELECT * FROM carts WHERE cart_token = '${cart_id}'`)
        }

        return cart
      }
      
      return false
    } else {
      // const [session] = await queryRunner.query(`SELECT shop_session FROM shops WHERE shopify_shop_id=${shop_id}`)

      // const data = await shopify.api.rest.Customer.find({
      //   session: session.shop_session,
      //   id: user_id
      // })
      // console.log(data)

      // queryRunner.query(`INSERT INTO customers (id, shop_id, name, email, phone_number) VALUES (DEFAULT, ${shop_id})`)
    }
  }
}