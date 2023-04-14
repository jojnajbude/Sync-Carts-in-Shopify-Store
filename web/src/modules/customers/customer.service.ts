import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "./customer.entity.js";
import { Repository, In } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Item } from "../items/item.entity.js";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
  ) {}

  async getCustomer(session: shopifySession, customerId: string) {
    const customer = await shopify.api.rest.Customer.find({
      session,
      id: customerId
    });
    
    const customerData = await this.customerRepository.findOneBy({ shopify_user_id: customer.id })
    const customerCarts = await this.cartRepository.find({ where: {customer_id: customerData?.id }})
    const customerCartsIds = customerCarts.map(cart => cart.id);
    const customersAllItems = await this.itemRepository.find({ where: { cart_id: In(customerCartsIds)}})

    const allCustomerItemsQty = customersAllItems.reduce((acc, cur) => acc + Number(cur.qty), 0);

    const itemDropCount = customersAllItems
    .filter(item => item.status === 'expired')
    .reduce((acc, cur) => acc + Number(cur.qty), 0)

    const itemDropRate = Math.round((itemDropCount / allCustomerItemsQty) * 100) || 0;
    
    customer.itemDropCount = itemDropCount;
    customer.itemDropRate = itemDropRate;
    customer.priority = customerData?.priority;

    return customer;
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

    const customersIds = [];

    for (const customer of data.body.data.customers.edges) {
      const id = customer.node.id.split('/').slice(-1)[0];
      customersIds.push(id)
    }

    const customersData = await this.customerRepository.query(
      `select customers.*, carts.id as cart_id 
      from customers
      left join carts
      on customers.id = carts.customer_id
      where customers.shopify_user_id In (${customersIds})`
    )

    for (const customer of data.body.data.customers.edges) {
      const id = customer.node.id.split('/').slice(-1)[0];
      const index = customersData.findIndex((user: { shopify_user_id: any; }) => id === user.shopify_user_id);
      if (index !== -1) {
        if (customersData[index].cart_id) {
          customer.node.hasCart = true;
          continue;
        }
      }

      customer.node.hasCart = false;
    }

    return data.body.data.customers.edges;
  }

  async updateCustomerPriority(id: string, priority: string) {
    return await this.customerRepository.update({ shopify_user_id: Number(id) }, { priority: priority });
  }
}