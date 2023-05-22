import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { AnalyticsService } from "../analytics/analytics.service.js";
import { LogsService } from "../log/logs.service.js";
import { NotificationsService } from "../notifications/notifications.service.js";
import { Item } from "./item.entity.js";

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    private logService: LogsService,
    private notificationsService: NotificationsService,
    private analyticsService: AnalyticsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTimes() {
    const reservedItems = await this.itemRepository.query(
      `select items.id, items.expire_at, shops.id as shop_id, shops.domain, customers.shopify_user_id as customer_id, customers.name, items.title, items.product_id 
      from items
      left join carts on carts.id = items.cart_id
      left join customers on customers.id = carts.customer_id
      left join shops on shops.id = carts.shop_id
      where items.status = 'reserved'`
    )
    const actualDate = new Date().getTime();

    const expiredItemsIds: number[] = [];
    const expiredItems: any[] = [];
    const soonExpiredItemsIds: any[] = [];

    for (const item of reservedItems) {
      if ((item.expire_at.getTime() - actualDate) / 3600000 <= 2 && (item.expire_at.getTime() - actualDate) / 3600000 > 2) {
        soonExpiredItemsIds.push(item);
      }

      if (item.expire_at === null || item.expire_at.getTime() - actualDate <= 0) {
        expiredItemsIds.push(item.id)
        expiredItems.push(item);

        const log = {
          type: 'expire',
          domain: item.domain,
          date: new Date(),
          customer_name: item.name,
          product_name: item.title,
          link_id: `${item.product_id}`,
          cart_id: item.cart_id,
        }
    
        const newLog = await this.logService.createLog(log);
      }
    }

    if (soonExpiredItemsIds.length) {
      await this.notificationsService.sendMultipleEmails(soonExpiredItemsIds, 'items', 'soon');
    }

    if (expiredItemsIds.length) {
      await this.notificationsService.sendMultipleEmails(expiredItemsIds, 'items', 'expired');
      await this.itemRepository.update({ id: In(expiredItemsIds)}, { status: 'expired' });
      await this.analyticsService.updateTopAbandonedProducts(expiredItems);
      await this.analyticsService.updateTopAbandonedCustomers(expiredItems);
    }
  }
}