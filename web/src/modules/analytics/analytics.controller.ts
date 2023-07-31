import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { AnalyticsService } from "./analytics.service.js";

@Controller('/api/analytics')
export class AnalyticsController {
  constructor (
    private analyticsService: AnalyticsService) {}

  @Post()
  async getAnalytics(@Body() body: any, @Res() res: Response) {
    const domain = res.locals.shopify.session.shop;

    const analytics = await this.analyticsService.getAnalytics(domain, body);

    analytics ? res.status(200).send(analytics) : res.status(404).send({
      error: {
        message: 'Analytics not found'
      }
    });
  }
}