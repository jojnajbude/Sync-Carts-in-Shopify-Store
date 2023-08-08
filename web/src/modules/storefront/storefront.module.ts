import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Item } from "../items/item.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { StorefrontController } from "./storefront.controller.js";
import { StorefrontService } from "./storefront.service.js";
import { ShopModule } from "../shops/shop.module.js";
import { LogModule } from "../log/logs.module.js";
import { AnalyticsModule } from "../analytics/analytics.module.js";
import { CartModule } from "../carts/cart.module.js";

@Module({
  controllers: [StorefrontController],
  providers: [StorefrontService],
  imports: [TypeOrmModule.forFeature([Shop, Customer, Cart, Item]), 
    CartModule,
    LogModule,
    ShopModule,
    AnalyticsModule,
  ],
  exports: [StorefrontService],
})
export class StorefrontModule {}