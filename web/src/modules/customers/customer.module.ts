import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Item } from "../items/item.entity.js";
import { CustomersController } from "./customer.controller.js";
import { Customer } from "./customer.entity.js";
import { CustomerService } from "./customer.service.js";

@Module({
  controllers: [CustomersController],
  providers: [CustomerService],
  imports: [TypeOrmModule.forFeature([Customer, Cart, Item])],
  exports: [TypeOrmModule]
})
export class CustomerModule {}