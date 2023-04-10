import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Item } from "./item.entity.js";

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private itemRepository: Repository<Item>) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTimes() {
    const reservedItems = await this.itemRepository.findBy({ status: 'reserved' })
    const actualDate = new Date().getTime();

    const expiredItemsIds: number[] = [];

    for (const item of reservedItems) {
      if (item.expireAt === null || item.expireAt.getTime() - actualDate <= 0) {
        expiredItemsIds.push(item.id)
      }
    }

    await this.itemRepository.createQueryBuilder()
      .update(Item)
      .set({status: 'expired'})
      .whereInIds(expiredItemsIds)
      .execute()
  }
}