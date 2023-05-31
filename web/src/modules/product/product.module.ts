import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Item } from "../items/item.entity.js";
import { ProductController } from "./product.controller.js";
import { ProductService } from "./product.service.js";

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Item])]
})
export class ProductModule {}
