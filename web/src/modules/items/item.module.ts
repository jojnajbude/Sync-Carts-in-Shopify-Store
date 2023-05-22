import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsModule } from "../analytics/analytics.module.js";
import { LogModule } from "../log/logs.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";
import { ItemsController } from "./item.controller.js";
import { Item } from "./item.entity.js";
import { ItemsService } from "./item.service.js";

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
  imports: [TypeOrmModule.forFeature([Item]), LogModule, NotificationsModule, AnalyticsModule]
})
export class ItemsModule {}