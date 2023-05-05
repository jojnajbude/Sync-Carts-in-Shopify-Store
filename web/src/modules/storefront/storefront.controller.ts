import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express";
import { StorefrontService } from "./storefront.service.js";

@Controller('/storefront')
export class StorefrontController {
  constructor (private storefrontService: StorefrontService) {}

  @Get('update')
  async updateData(@Query() query: { cart_id: string, customer: string, shop_id: string, os: string }, @Res() res: Response) {
    const cartItems = await this.storefrontService.updateData(query.cart_id, query.customer, query.shop_id, query.os);

    cartItems ? res.status(200).send(cartItems) : res.status(500).send('Server error');
  }

  @Get('cart/add')
  async handleAdding(@Query() query: { shop: string, variant: number, qty: number }, @Res() res: Response ) {
    const result = await this.storefrontService.handleAdding(query.shop, query.variant, query.qty); 

    result ? res.status(200).send(result) : res.status(500).send('Server error');
  }

  @Post('cart/update')
  async updateCart(@Req() req: Request, @Res() res: Response) {
    const shopDomain = req.get('x-shopify-shop-domain');

    if (shopDomain) {
      const changedItems = await this.storefrontService.updateCart(req.body, shopDomain);
      changedItems ? res.status(200).send(changedItems) : res.status(500).send('Server error');
    } else {
      res.status(404).send('Unable to identify the store');
    }
  }

  @Post('customer/update')
  async updateCustomer(@Req() req: Request, @Res() res: Response) {
    const user = await this.storefrontService.updateUser( req.body);

    user ? res.status(200).send(user) : res.status(500).send('Server error');
  }

  @Get('time')
  async getReserveTime(@Query() query: { item: string, cart: string, user: string, shop: string }, @Res() res: Response) {
    const time = await this.storefrontService.getReserveTime(query.item, query.cart, query.user, query.shop)

    time ? res.status(200).send(time) : res.status(404).send(false);
  }

  @Post('order/paid')
  async handleOrderPaid(@Req() req: Request, @Res() res: Response) {
    const cart_token = req.body.cart_token;
    const totalPrice = Number(req.body.current_total_price);

    const paidCart = await this.storefrontService.handleOrderPaid(cart_token, totalPrice);

    paidCart ? res.status(200).send(paidCart) : res.status(500).send('Server error'); 
  }

  @Post('app/uninstalled')
  async removeShopData(@Body() body: any, @Res() res: Response) {
    const shopify_id = body.id;
    const removedShop = await this.storefrontService.removeShop(shopify_id);
  } 
}