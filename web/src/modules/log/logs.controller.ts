import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { LogsService } from "./logs.service.js";

@Controller('/api/logs')
export class LogsController {
  constructor (private logsService: LogsService) {}

  @Get()
  async getLogs(@Res() res: Response) {
    const domain = res.locals.shopify.session.shop;

    const shopLogs = await this.logsService.findAllLogs(domain);

    res.status(200).send(shopLogs);
  }
}