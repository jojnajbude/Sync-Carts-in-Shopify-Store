import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "./customer.entity.js";
import { Repository } from "typeorm";

@Injectable()
export class CustomerService {
  constructor(@InjectRepository(Customer) private customerRepository: Repository<Customer>) {}

  async getCustomer(session: shopifySession, customerId: string) {
    return await shopify.api.rest.Customer.find({
      session,
      id: customerId
    });
  }

  async updateCustomerPriority(id: string, priority: string) {
    return await this.customerRepository.update({ shopify_user_id: Number(id) }, { priority: priority });
  }
}