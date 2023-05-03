import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Response } from "express";
import { Shop } from "../shops/shop.entity.js";
import { NotificationsService } from "./notifications.service.js";

@Controller('/api/notifications')
export class NotificationsController {
  constructor(
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
    private notificationService: NotificationsService
  ) {}

  @Post('save')
  async saveTemplate(@Body() body: any, @Res() res: Response) {
    const session = res.locals.shopify.session;
    const { name, design, html } = body;

    const savedTemplate = await this.notificationService.saveTemplate(session.shop, name, design, html);

    savedTemplate ? res.status(200).send('saved') : res.status(500).send('Server error')
  }

  @Get('get')
  async getTemplate(@Query() query: { name: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;

    const template = await this.notificationService.getTemplate(session.shop, query.name);

    template ? res.status(200).send(template) : res.status(500).send('Server error')
  }

  @Post('send')
  async sendEmail(@Body() body: any, @Res() res: Response) {
    const session = res.locals.shopify.session;
    const { type, cart, customer } = body;
    const shop = await this.shopRepository.findOneBy({ domain: session.shop })

    await this.notificationService.sendEmail(type, shop, [customer.email]);
  }
}