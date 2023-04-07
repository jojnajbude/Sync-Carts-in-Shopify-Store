import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomersController } from "./customer.controller.js";
import { Customer } from "./customer.entity.js";
import { CustomerService } from "./customer.service.js";

@Module({
  controllers: [CustomersController],
  providers: [CustomerService],
  imports: [TypeOrmModule.forFeature([Customer])],
  exports: [TypeOrmModule]
})
export class CustomerModule {}