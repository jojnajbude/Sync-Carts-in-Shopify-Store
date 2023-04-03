import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { CartService } from "./cart.service.js";

@Controller('/api/carts')
export class CartController {
  constructor (private cartService: CartService) {}

  @Get('all')
  async getShopCarts(@Res() res: Response) {
    const session = res.locals.shopify.session;

    const carts = await this.cartService.getShopCarts(session)

    carts ? res.status(200).send(carts) : res.status(404).send('Not found')
  }
}