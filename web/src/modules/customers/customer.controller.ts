import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { CustomerService } from "./customer.service.js";


@Controller('/api/customers')
export class CustomersController {
  constructor(private customerService: CustomerService) {}

  @Get('get') 
  async getShopData(@Query() query: { customerId: string }, @Res() res: Response) {
    const customer = await this.customerService.getCustomer(res.locals.shopify.session, query.customerId);
    console.log(customer)

    customer ? res.status(200).send(customer) : res.status(404).send('Not found')
  }
}