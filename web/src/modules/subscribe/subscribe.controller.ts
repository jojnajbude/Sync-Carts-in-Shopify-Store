import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { SubscribeService } from "./subscribe.service.js";

@Controller("/api/subscribe")
export class SubscribeController {
  constructor(private subscribeService: SubscribeService) {}

  @Get()
  async createRecurringApplicationCharge(@Res() res: Response) {
    const session = res.locals.shopify.session;
    const charge = await this.subscribeService.createRecurringApplicationCharge(session);
  
    charge ? res.status(200).send(charge) : res.status(500).send('Server error')
  }

  @Get('usage_charge')
  async createUsageCharge(@Query() query: { charge_id: string }, @Res () res: Response) {
    const session = res.locals.shopify.session;
    const charge = await this.subscribeService.createUsageCharge(session, Number(query.charge_id))
  }
}
