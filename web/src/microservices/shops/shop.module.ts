import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shop } from "./shop.entity.js";
import { ShopController } from "./shop.controller.js";
import { ShopService } from "./shop.service.js";

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [TypeOrmModule.forFeature([Shop])]
})
export class ShopModule {}