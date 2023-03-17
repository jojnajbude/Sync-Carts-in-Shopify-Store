import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { ShopService } from "./shop.service.js";
import { Shop } from "./shop.entity.js";

@Controller('/api/shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get() 
  async getShopData(@Res() res: Response) {
    const shop = await this.shopService.getShopData(res.locals.shopify.session)
    res.status(200).send(shop)
  }
}