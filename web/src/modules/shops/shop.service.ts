import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";

@Injectable()
export class ShopService {
  constructor() {}

  async getShopData(session: any) {
    return await shopify.api.rest.Shop.all({
      session,
    });
  }
}