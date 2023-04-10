import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
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

    carts ? res.status(200).send(carts) : res.status(500).send('Server error')
  }

  @Get('sort')
  async getSortedCarts(@Query() query: { dir: 'ascending' | 'descending', index: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;

    const sortedCarts = await this.cartService.getSortedCarts(session, query.dir, query.index)

    sortedCarts ? res.status(200).send(sortedCarts) : res.status(500).send('Server error')
  }

  @Post('expand')
  async expandTimers(@Body() body: number[], @Query() query: { ms: string }, @Res() res: Response) {
    const newTimers = await this.cartService.expandTimers(body, query.ms);

    newTimers ? res.status(200).send(newTimers) : res.status(500).send('Server error')
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