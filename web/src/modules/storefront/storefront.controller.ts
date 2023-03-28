import { Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { StorefrontService } from "./storefront.service.js";

@Controller('/storefront')
export class StorefrontController {
  constructor (private storefrontService: StorefrontService) {}

  @Get('cart/update')
  async updateCartData(@Query() query: { user_id: number, shop_id: number, cart_id: string }, @Res() res: Response) {
    const cart = await this.storefrontService.getCartData(query.user_id, query.shop_id, query.cart_id);

    cart ? res.status(200).send(cart) : res.status(500).send('Server error');
  }

  @Get('cart/add')
  async addToCart(@Query() query: { customer: number, shop: number, cart: string, variant: number, qty: number }, @Res() res: Response ) {
    const req = await this.storefrontService.addToCart(query.customer, query.shop, query.cart, query.variant, query.qty); 

    req ? res.status(200).send(req) : res.status(500).send('Server error');
  }
}