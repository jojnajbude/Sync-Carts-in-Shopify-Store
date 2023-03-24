import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { CartService } from "./cart.service.js";
import { DataSource } from "typeorm";
import shopify from "../../utils/shopify.js";

@Controller('/api/carts')
export class CartController {
  constructor (private cartService: CartService, private dataSource: DataSource) {}

  @Get('all')
  async getShopCarts(@Res() res: Response) {
    const session = res.locals.shopify.session;
    const [shopifyShopData] = await shopify.api.rest.Shop.all({ session })

    const [customer] = await shopify.api.rest.Customer.all({
      session: session,
    })

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const [shop] = await queryRunner.query(`SELECT * FROM shops WHERE shopify_shop_id = '${shopifyShopData.id}'`)

    const carts = await this.cartService.getShopCarts(shop.id)
    res.status(200).send(carts)
  }
}