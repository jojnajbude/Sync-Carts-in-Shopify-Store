import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express";
import { StorefrontService } from "./storefront.service.js";
import { CartService } from "../carts/cart.service.js";

@Controller('/storefront')
export class StorefrontController {
  constructor (private storefrontService: StorefrontService, private cartService: CartService) {}

  @Get('update')
  async updateData(@Query() query: { cart_id: string, customer: string, shop_id: string, os: string }, @Res() res: Response) {
    const cartItems = await this.storefrontService.updateData(query.cart_id, query.customer, query.shop_id, query.os);

    cartItems ? res.status(200).send(cartItems) : res.status(200).send({ type: 'error', message: 'Server error' });
  }

  @Get('cart/get')
  async getCart(@Query() query: { cart_id: string, shop: number }, @Res() res: Response) {
    const session = await this.storefrontService.getSession(query.shop);
    const cartId = await this.storefrontService.getCartId(query.cart_id);
    
    const cart = cartId ? await this.cartService.getCart(String(cartId), session) : null;

    cart ? res.status(200).send(cart[0]) : res.status(400).send({ type: 'error', message: 'Invalid data' });
  }

  @Get('cart/add')
  async handleAdding(@Query() query: { shop: string, variant: number, qty: number }, @Res() res: Response ) {
    const result = await this.storefrontService.handleAdding(query.shop, query.variant, query.qty); 

    result ? res.status(200).send(result) : res.status(200).send('Server error');
  }

  @Post('cart/create')
  async createCart(@Req() req: Request, @Res() res: Response) {
    const shopDomain = req.get('x-shopify-shop-domain');

    if (shopDomain) {
      const cart = await this.storefrontService.updateCart(req.body, shopDomain);
      cart ? res.status(200).send(cart) : res.status(200).send('Server error');
    } else {
      res.status(404).send('Unable to identify the store');
    }
  }

  @Get('cart/last-updated/items')
  async lastUpdatedItems(@Query() query: { customer: string }, @Res() res: Response) {
    const items = await this.storefrontService.getLastUpdatedItems(query.customer);

    res.status(200).send(items);
  }

  @Get('cart/last-updated')
  async lastUpdated(@Query() query: { customer: string, shop: string }, @Res() res: Response) {
    const lastUpdated = await this.storefrontService.updateLastActivity(query.customer);

    lastUpdated ? res.status(200).send(lastUpdated) : res.status(404).send({
      type: 'error',
      message: 'Not found'
    });
  }

  @Post('cart/update')
  async updateCart(@Req() req: Request, @Res() res: Response) {
    res.sendStatus(200);
    return;
    //
    // const shopDomain = req.get('x-shopify-shop-domain');
    //
    // if (shopDomain) {
    //   const changedItems = await this.storefrontService.updateCart(req.body, shopDomain);
    //   changedItems ? res.status(200).send(changedItems) : res.status(200).send('Server error');
    // } else {
    //   res.status(404).send('Unable to identify the store');
    // }
  }

  @Post('app/uninstalled')
  async handleAppUninstalled(@Req() req: Request, @Res() res: Response) {
    const shopDomain = req.get('x-shopify-shop-domain');

    if (shopDomain) {
      this.storefrontService.handleAppUninstalled(shopDomain);
      //TODO: You have 503 Errors. I've removed await for now
      res.status(200).send('OK');
    } else {
      // Please do not respond non 200's for webhooks in this case
      res.status(200).send('Unable to identify the store');
    }
  }

  @Get('time')
  async getReserveTime(@Query() query: { item: string, cart: string, user: string, shop: number }, @Res() res: Response) {
    const time = await this.storefrontService.getReserveTime(query.item, query.cart, query.shop)

    time ? res.status(200).send(time) : res.status(404).send(false);
  }

  @Post('order/paid')
  async handleOrderPaid(@Req() req: Request, @Res() res: Response) {
    const cart_token = req.body.cart_token;
    const totalPrice = Number(req.body.current_total_price);

    const paidCart = await this.storefrontService.handleOrderPaid(cart_token, totalPrice);

    paidCart ? res.status(200).send(paidCart) : res.status(200).send('Server error'); 
  }

  @Post('update/time')
  async handleTimeUpdate(@Body() body: any, @Res() res: Response) {
    const [ oldItems, cart_token ] = body;

    await this.storefrontService.updateTime(oldItems, cart_token)
  }
}