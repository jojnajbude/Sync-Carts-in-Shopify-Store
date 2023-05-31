import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { SubscribeService } from "./subscribe.service.js";

@Controller("/api/subscribe")
export class SubscribeController {
  constructor(private subscribeService: SubscribeService) {}

  @Get('get')
  async getSubscription(@Res() res: Response) {
    console.log("here")
    const session = res.locals.shopify.session;

    const plan = await this.subscribeService.getSubscription(session);

    plan ? res.status(200).send(plan) : res.status(500).send('Server error');
  }

  @Get()
  async createRecurringApplicationCharge(@Query() query: { plan: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;
    const charge = await this.subscribeService.createRecurringApplicationCharge(session, query.plan);
  
    charge ? res.status(200).send(charge) : res.status(500).send('Server error')
  }

  @Get('active')
  async activatePlan(@Query() query: { charge_id: string }, @Res() res: Response) {
    const session = res.locals.shopify.session;
    const activePlan = await this.subscribeService.activatePlan(session, query.charge_id)

    activePlan ? res.status(200).send(activePlan) : res.status(500).send('Server error');
  }

  @Get('cancel')
  async cancelSubscribe(@Res() res: Response) {
    const session = res.locals.shopify.session;
    const canceledPlan = await this.subscribeService.cancelPlan(session);

    canceledPlan ? res.status(200).send(canceledPlan) : res.status(500).send('Server error');
  }
}
