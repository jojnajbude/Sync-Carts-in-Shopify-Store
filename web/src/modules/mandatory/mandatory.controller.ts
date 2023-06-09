import { Body, Controller, Get, Headers, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { MandatoryService } from "./mandatory.service.js";
import crypto from "crypto";

@Controller('/storefront/mandatory')
export class MandatoryController {
  constructor(
    private mandatoryService: MandatoryService,
  ) {}

  @Post('customers/data_request')
  async viewStoredData(@Headers() headers: any, @Body() body: any, @Res() res: Response) {
    const hmac = headers['x-shopify-hmac-sha256'];

    const genHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET?.toString() || '')
      .update(Buffer.from(JSON.stringify(body)))
      .digest('base64');

    if (genHash !== hmac) {
      res.status(401).send('Unauthorized');
    }

    const { customer } = body;

    const dataRequest = await this.mandatoryService.viewStoredData(customer);

    res.status(200).send(dataRequest);
  }

  @Post('customers/redact')
  async eraseStoredData(@Headers() headers: any, @Body() body: any, @Res() res: Response) {
    const hmac = headers['x-shopify-hmac-sha256'];

    const genHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET?.toString() || '')
      .update(Buffer.from(JSON.stringify(body)))
      .digest('base64');

    if (genHash !== hmac) {
      res.status(401).send('Unauthorized');
    }

    const { customer } = body;

    const dataRequest = await this.mandatoryService.eraseStoredData(customer);

    res.status(200).send(dataRequest);
  }

  @Post('shop/redact')
  async eraseShopData(@Headers() headers: any, @Body() body: any, @Res() res: Response) {
    const hmac = headers['x-shopify-hmac-sha256'];

    const genHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET?.toString() || '')
      .update(Buffer.from(JSON.stringify(body)))
      .digest('base64');

    if (genHash !== hmac) {
      res.status(401).send('Unauthorized');
    }

    const { shop_domain } = body;

    const dataRequest = await this.mandatoryService.eraseShopData(shop_domain);

    res.status(200).send(dataRequest);
  }
}