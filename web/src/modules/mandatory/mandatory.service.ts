import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";

@Injectable()
export class MandatoryService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
  ) {}

  async viewStoredData(customer: any) {
    const customerData = await this.customerRepository.findOneBy({ shopify_user_id: customer.id });

    customerData ? customerData : {}
  }

  async eraseStoredData(customer: any) {
    const removedCustomer = await this.customerRepository.delete({ shopify_user_id: customer.id });

    removedCustomer ? removedCustomer : {}
  }

  async eraseShopData(shop_domain: string) {
    const removedStore = await this.shopRepository.delete({ domain: shop_domain });

    removedStore ? removedStore : {}
  }
}
