import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { AnalyticsService } from "./analytics.service.js";

@Controller('/api/analytics')
export class AnalyticsController {
  constructor (private analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Res() res: Response) {
    const domain = res.locals.shopify.session.shop;

    const analytics = await this.analyticsService.getAnalytics(domain);

    analytics ? res.status(200).send(analytics) : res.status(500).send('Server error');
  }
}