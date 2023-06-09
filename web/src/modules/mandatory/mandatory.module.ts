import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { MandatoryController } from "./mandatory.controller.js";
import { MandatoryService } from "./mandatory.service.js";

@Module({
  controllers: [MandatoryController],
  providers: [MandatoryService],
  imports: [TypeOrmModule.forFeature([Customer, Shop])],
  exports: []
})
export class MandatoryModule {}