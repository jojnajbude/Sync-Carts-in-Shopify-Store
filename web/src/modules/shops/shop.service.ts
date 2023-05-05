import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { shopifySession } from "../../types/session.js";
import shopify from "../../utils/shopify.js";
import { Shop } from "./shop.entity.js";

@Injectable()
export class ShopService {
  constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>) {}

  async getShopData(session: shopifySession) {
    return await shopify.api.rest.Shop.all({
      session,
    });
  }

  async getShopSettings(domain: string) {
    const shopData = await this.shopRepository.findOneBy({ domain });

    if (shopData) {
      const priorities = JSON.parse(shopData.priorities)

      return [priorities]
    }

    return false
  }

  async updateShopSettings(domain: string, body: any) {
    const { 
      max_priority, 
      high_priority, 
      normal_priority, 
      low_priority, 
      min_priority, 
      add_email,
      expire_soon_email,
      expired_email,
      reminder_email
    } = body;

    const updatedPriorities = {
      max_priority, high_priority, normal_priority, low_priority, min_priority
    }

    const templates = { add_email, expire_soon_email, expired_email, reminder_email }

    const updateSettings = await this.shopRepository.update({ domain }, { priorities: JSON.stringify(updatedPriorities), 
    })

    return updateSettings;
  }
}