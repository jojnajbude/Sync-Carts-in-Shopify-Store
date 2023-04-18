import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Item } from "../items/item.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { StorefrontController } from "./storefront.controller.js";
import { StorefrontService } from "./storefront.service.js";
import { ShopModule } from "../shops/shop.module.js";

@Module({
  controllers: [StorefrontController],
  providers: [StorefrontService],
  imports: [TypeOrmModule.forFeature([Shop, Customer, Cart, Item]), ShopModule],
  exports: [StorefrontService],
})
export class StorefrontModule {}