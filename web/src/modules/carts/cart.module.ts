import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller.js";
import { CartService } from "./cart.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./cart.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { Item } from "../items/item.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { CustomerModule } from "../customers/customer.module.js";
import { ShopModule } from "../shops/shop.module.js";
import { StorefrontModule } from "../storefront/storefront.module.js";

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [TypeOrmModule.forFeature([Cart, Shop, Item, Customer]), CustomerModule, ShopModule, StorefrontModule],
  exports: [TypeOrmModule]
})
export class CartModule {}
