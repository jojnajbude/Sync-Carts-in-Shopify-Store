import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { StorefrontService } from "./storefront.service.js";
import { AddToCart } from "./storefront.dto.js";

@Controller('/storefront')
export class StorefrontController {
  constructor (private storefrontService: StorefrontService) {}

  @Get('cart/update')
  async updateCartData(@Query() query: { user_id: number, shop_id: string }, @Res() res: Response) {
    const cart = await this.storefrontService.getCartData(query.user_id, query.shop_id);

    res.status(200).send(cart)
  }

  @Post('cart/add')
  async getShopCarts(@Body() addToCart: AddToCart, @Res() res: Response ) {
    // const cartData = await this.storefrontService.getCartData(customer_id, shop_id, product)

    res.status(200).send({ id: 'working' })
  }
}