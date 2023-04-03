import { Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express";
import { StorefrontService } from "./storefront.service.js";

@Controller('/storefront')
export class StorefrontController {
  constructor (private storefrontService: StorefrontService) {}

  @Get('update')
  async updateData(@Query() query: { cart_id: string }, @Res() res: Response) {
    const cartItems = await this.storefrontService.getData(query.cart_id);

    cartItems ? res.status(200).send(cartItems) : res.status(500).send('Server error');
  }

  @Get('cart/add')
  async handleAdding(@Query() query: { shop: number, variant: number, qty: number }, @Res() res: Response ) {
    const result = await this.storefrontService.handleAdding(query.shop, query.variant, query.qty); 

    result ? res.status(200).send(result) : res.status(500).send('Server error');
  }

  @Post('cart/create')
  async createCart(@Req() req: Request, @Res() res: Response) {
    const shopDomain = req.get('x-shopify-shop-domain');

    if (shopDomain) {
      const cart = await this.storefrontService.createCart(shopDomain, req.body);
      cart ? res.status(200).send(cart) : res.status(500).send('Server error');
    } else {
      res.status(404).send('Unable to identify the store');
    }
  }

  @Post('cart/update')
  async updateCart(@Req() req: Request, @Res() res: Response) {
    const shopDomain = req.get('x-shopify-shop-domain');

    if (shopDomain) {
      const changedItems = await this.storefrontService.updateCart(req.body);
      changedItems ? res.status(200).send(changedItems) : res.status(500).send('Server error');
    } else {
      res.status(404).send('Unable to identify the store');
    }
  }

  @Post('customer/create')
  async createCustomer(@Req() req: Request, @Res() res: Response) {
    const shopDomain = req.get('x-shopify-shop-domain');

    if (shopDomain) {
      const user = await this.storefrontService.createUser(shopDomain, req.body);
      user ? res.status(200).send(user) : res.status(500).send('Server error');
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
}