import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";

@Injectable()
export class CustomerService {
  constructor() {}

  async getCustomer(session: shopifySession, customerId: string) {
    return await shopify.api.rest.Customer.find({
      session,
      id: customerId
    });
  }
}