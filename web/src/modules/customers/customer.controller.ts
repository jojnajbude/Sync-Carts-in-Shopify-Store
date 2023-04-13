import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { CustomerService } from "./customer.service.js";
import shopify from "../../utils/shopify.js";
import { LATEST_API_VERSION } from "@shopify/shopify-api";


@Controller('/api/customers')
export class CustomersController {
  constructor(private customerService: CustomerService) {}

  @Get('get') 
  async getCustomer(@Query() query: { customerId: string }, @Res() res: Response) {
    const customer = await this.customerService.getCustomer(res.locals.shopify.session, query.customerId);

    customer ? res.status(200).send(customer) : res.status(404).send('Not found')
  }

  @Get('get/all')
  async getCustomersByInput(@Query() query: { input: string }, @Res() res: Response) {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
      apiVersion: LATEST_API_VERSION
    });

    const customers = await this.customerService.getCustomersByInput(query.input, client);

    customers ? res.status(200).send(customers) : res.status(404).send('Not found')
  }

  @Get('update')
  async updateCustomerPriority(@Query() query: { customerId: string, priority: string }, @Res() res: Response) {
    const customer = await this.customerService.updateCustomerPriority(query.customerId, query.priority);

    customer ? res.status(200).send(customer) : res.status(500).send('Server error');
  }
}