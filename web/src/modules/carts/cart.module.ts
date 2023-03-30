import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller.js";
import { CartService } from "./cart.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./cart.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { Item } from "../items/item.entity.js";

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [TypeOrmModule.forFeature([Cart, Shop, Item])],
  exports: [TypeOrmModule]
})
export class CartModule {}
