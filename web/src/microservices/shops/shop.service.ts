import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shop } from "./shop.entity.js";
import shopify from "../../utils/shopify.js";

@Injectable()
export class ShopService {
  constructor(@InjectRepository(Shop) private shopsRepository: Repository<Shop>) {}

  async getShopData(session: any) {
    return await shopify.api.rest.Shop.all({
      session,
    });
  }
}