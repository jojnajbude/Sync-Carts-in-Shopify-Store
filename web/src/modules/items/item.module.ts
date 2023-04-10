import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItemsController } from "./item.controller.js";
import { Item } from "./item.entity.js";
import { ItemsService } from "./item.service.js";

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
  imports: [TypeOrmModule.forFeature([Item])]
})
export class ItemsModule {}