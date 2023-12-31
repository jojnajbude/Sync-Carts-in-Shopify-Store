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

    settings ? res.status(200).send(settings) : res.status(404).send('Can\'t find settings for that shop')
  }

  @Post('update')
  async updateShopSettings(@Body() body: any, @Res() res: Response) {
    const updates = await this.shopService.updateShopSettings(res.locals.shopify.session.shop, body)

    updates ? res.status(200).send(updates) : res.status(400).send('Bad request')  
  }

  @Get('tutorial')
  async disableTutorial(@Res() res: Response) {
    const domain = res.locals.shopify.session.shop;
    this.shopService.disableTutorial(domain);
  }

  @Get('themes')
  async getThemes(@Res() res: Response) {
    const session = res.locals.shopify.session;

    const themes = await this.shopService.getThemes(session);

    themes ? res.status(200).send(themes) : res.status(400).send('Incorrect request')  
  }

  @Get('theme/edit')
  async injectSnippet(@Query() query: { name: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;

    const editedTheme = await this.shopService.injectSnippet(session, query.name);

    editedTheme ? res.status(200).send(editedTheme) : res.status(400).send('Incorrect data')  
  }
}