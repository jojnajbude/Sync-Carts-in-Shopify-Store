import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shop } from "../shops/shop.entity.js";
import { SubscribeController } from "./subscribe.controller.js";
import { SubscribeService } from "./subscribe.service.js";


@Module({
  controllers: [SubscribeController],
  providers: [SubscribeService],
  imports: [TypeOrmModule.forFeature([Shop])],
})
export class SubscribeModule {}