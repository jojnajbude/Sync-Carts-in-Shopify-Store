import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller.js";
import { CartService } from "./cart.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./cart.entity.js";

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [TypeOrmModule.forFeature([Cart])]
})
export class CartModule {}
