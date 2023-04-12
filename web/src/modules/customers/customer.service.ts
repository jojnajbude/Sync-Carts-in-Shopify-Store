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

  async getCustomersByInput(inputText: string, client: any) {
    const data = await client.query({
      data: `{
        customers (first: 25, query: "displayName:${inputText}*") {
          edges {
            node {
              id
              displayName
              email
            }
          }
        }
      }`
    })

    return data.body.data.customers.edges;
  }

  async updateCustomerPriority(id: string, priority: string) {
    const query = `select *
    from items
    left join carts
    on items.cart_id = carts.id
    left join customers
    on carts.customer_id = customers.id
    where customer_id = ${id}`
    return await this.customerRepository.update({ shopify_user_id: Number(id) }, { priority: priority });
  }
}