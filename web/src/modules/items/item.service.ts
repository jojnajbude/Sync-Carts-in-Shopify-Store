import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { LogsService } from "../log/logs.service.js";
import { Item } from "./item.entity.js";

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    private logService: LogsService
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkTimes() {
    const reservedItems = await this.itemRepository.query(
      `select * from items
      left join carts on carts.id = items.cart_id
      left join customers on customers.id = carts.customer_id
      where items.status = 'reserved'`
    )
    const actualDate = new Date().getTime();

    const expiredItemsIds: number[] = [];

    for (const item of reservedItems) {
      if (item.expireAt === null || item.expireAt.getTime() - actualDate <= 0) {
        expiredItemsIds.push(item.id)

        const log = {
          type: 'expire',
          domain: item.domain,
          date: new Date(),
          customer_name: item.name,
          product_name: item.title,
          link_id: `${item.product_id}`,
        }
    
        const newLog = await this.logService.createLog(log);
      }
    }

    const result = await this.itemRepository.update({ id: In(expiredItemsIds)}, { status: 'expired'})
  }
}