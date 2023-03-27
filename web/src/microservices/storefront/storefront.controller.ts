import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { StorefrontService } from "./storefront.service.js";
import { AddToCart } from "./storefront.dto.js";

@Controller('/storefront')
export class StorefrontController {
  constructor (private storefrontService: StorefrontService) {}

  @Get('cart/update')
  async updateCartData(@Query() query: { user_id: string, shop_id: string, cart_id: string }, @Res() res: Response) {
    const cart = await this.storefrontService.getCartData(query.user_id, query.shop_id, query.cart_id);

    res.status(200).send(cart)
  }

  @Get('cart/add')
  async addToCart(@Query() query: { customer: string, shop: string, variant: string, qty: string }, @Res() res: Response ) {
    const reqStatus = await this.storefrontService.addToCart(query.customer, query.shop, query.variant, query.qty); 

    res.status(200).send('ok')
  }
}