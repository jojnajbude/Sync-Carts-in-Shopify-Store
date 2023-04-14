import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShopController } from "./shop.controller.js";
import { Shop } from "./shop.entity.js";
import { ShopService } from "./shop.service.js";

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [TypeOrmModule.forFeature([Shop])],
  exports: [ShopService, TypeOrmModule]
})
export class ShopModule {}