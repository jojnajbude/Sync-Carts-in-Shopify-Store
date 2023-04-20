import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "../carts/cart.entity.js"
import { Shop } from "../shops/shop.entity.js";
import { Item } from "../items/item.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsService } from "./analytics.service.js";
import { Analytics } from "./analytics.entity.js";

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports: [TypeOrmModule.forFeature([Cart, Shop, Item, Customer, Analytics])],
  exports: [TypeOrmModule]
})
export class AnalyticsModule {}