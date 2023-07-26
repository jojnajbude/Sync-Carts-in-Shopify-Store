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

    res.status(200).send('OK');
  }

  @Get('domain/add')
  async addDomain(@Query() query: { domain: string }, @Res() res: Response) {
    const domain = await this.notificationService.addNewDomain(query.domain, res.locals.shopify.session.shop);

    domain ? res.status(200).send(domain) : res.status(500).send('Server error')
  }

  @Get('domain/verify')
  async verifyDomain(@Query() query: { domain: string }, @Res() res: Response) {
    const verificationStatus = await this.notificationService.verifyDomain(query.domain, res.locals.shopify.session.shop);

    verificationStatus ? res.status(200).send(verificationStatus) : res.status(500).send('Server error')
  }
}