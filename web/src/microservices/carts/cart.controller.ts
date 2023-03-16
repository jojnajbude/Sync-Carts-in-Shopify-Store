import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { CartService } from "./cart.service.js";

@Controller('/api/carts')
export class CartController {
  constructor (private cartService: CartService) {}

  @Get('all')
  async getShopCarts(@Res() res: Response) {
    const carts = await this.cartService.getShopCarts()
    res.status(201).send(carts)
  }
}