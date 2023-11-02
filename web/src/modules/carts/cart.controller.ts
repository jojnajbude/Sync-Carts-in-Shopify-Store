import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { ShopService } from "../shops/shop.service.js";
import { CartService } from "./cart.service.js";
import {SynchronizeGateway} from "../../synchronize/synchronize.gateway";

@Controller('/api/carts')
export class CartController {
  constructor (private cartService: CartService, private shopService: ShopService) {}

  @Post('create')
  async createNewCart(@Body() body: any, @Res() res: Response) {
    const { cart, customer } = body;
    const session = res.locals.shopify.session;
    const newCart = await this.cartService.createNewCart(cart, customer, session);

    newCart ? res.status(201).send(newCart) : res.status(400).send('Bad request');
  }

  @Post('update')
  async updateCartItems(@Body() body: any, @Res() res: Response) {
    const [cart, customer] = body;

    const newCart = await this.cartService.updateCartItems(cart, customer);

    newCart ? res.status(201).send(newCart) : res.status(400).send('Bad request');
  }

  @Get('last')
  async getLastActivityCarts(@Res() res: Response) {
    const session = res.locals.shopify.session;

    const carts = await this.cartService.getLastActivityCarts(session)

    carts ? res.status(200).send(carts) : res.status(404).send('Not found')
  }

  @Get('get')
  async getCart(@Query() query: { cartId: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;

    const cart = await this.cartService.getCart(query.cartId, session);

    cart ? res.status(200).send(cart) : res.status(404).send('Not found')
  }

  @Get('filter')
  async getFilteredCarts(@Query() query: { index: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;

    const carts = await this.cartService.getFilteredCarts(session, query.index);

    carts ? res.status(200).send(carts) : res.status(400).send('Bad request')
  }

  @Get('sort')
  async getSortedCarts(@Query() query: { dir: 'ascending' | 'descending', index: string, shop?: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;

    const sortedCarts = await this.cartService.getSortedCarts(session, query.dir, query.index)

    if (query.shop) {
      const [shop] = await this.shopService.getShopData(session);
      sortedCarts ? res.status(200).send({ shop, sortedCarts }) : res.status(500).send('Server error')
    } else {
      sortedCarts ? res.status(200).send(sortedCarts) : res.status(500).send('Server error')
    }
  }

  @Post('expand')
  async expandTimers(@Body() body: number[], @Query() query: { ms: string }, @Res() res: Response) {
    const newTimers = await this.cartService.expandTimers(body, query.ms);

    newTimers ? res.status(200).send(newTimers) : res.status(404).send('Not found')
  }

  @Post('unreserve')
  async unreserveItems(@Body() body: number[], @Res() res: Response) {
    const unreservedItems = await this.cartService.unreserveItems(body)

    unreservedItems ? res.status(200).send(unreservedItems) : res.status(404).send('Not found')
  }

  @Post('remove')
  async removeItems(@Body() body: number[], @Res() res: Response) {
    const removedItems = await this.cartService.removeItems(body)

    removedItems
      ? res.status(200).send(removedItems)
      : res.status(400).send('Bad request')
  }
}