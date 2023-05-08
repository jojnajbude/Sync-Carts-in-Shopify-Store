import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { ShopService } from "./shop.service.js";

@Controller('/api/shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get() 
  async getShopData(@Res() res: Response) {
    const shop = await this.shopService.getShopData(res.locals.shopify.session)
    res.status(200).send(shop)
  }

  @Get('settings')
  async getShopSettings(@Res() res: Response) {
    const settings = await this.shopService.getShopSettings(res.locals.shopify.session.shop)

    settings ? res.status(200).send(settings) : res.status(500).send('Server error')
  }

  @Post('update')
  async updateShopSettings(@Body() body: any, @Res() res: Response) {
    const updates = await this.shopService.updateShopSettings(res.locals.shopify.session.shop, body)

    updates ? res.status(200).send(updates) : res.status(500).send('Server error')  
  }

  @Get('tutorial')
  async disableTutorial(@Res() res: Response) {
    const domain = res.locals.shopify.session.shop;
    this.shopService.disableTutorial(domain);
  }
}