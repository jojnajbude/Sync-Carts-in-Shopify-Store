import { Controller, Get } from "@nestjs/common";
import { ShopService } from "./shop.service.js";
import { Shops } from "./shop.entity.js";

@Controller('shops')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get('shop') 
  takeShopData() {
    return this.shopService.getShopData()
  }
}