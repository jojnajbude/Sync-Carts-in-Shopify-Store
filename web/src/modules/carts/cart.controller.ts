import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
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

  @Post('unreserve')
  async unreserveItems(@Body() body: number[], @Res() res: Response) {
    const unreservedItems = await this.cartService.unreserveItems(body)

    unreservedItems ? res.status(200).send(unreservedItems) : res.status(500).send('Server error')
  }

  @Post('remove')
  async removeItems(@Body() body: number[], @Res() res: Response) {
    const removedItems = await this.cartService.removeItems(body)

    removedItems ? res.status(200).send(removedItems) : res.status(500).send('Server error')
  }
}