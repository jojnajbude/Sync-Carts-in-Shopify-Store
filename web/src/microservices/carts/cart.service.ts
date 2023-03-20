import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { query } from "express";
import { Repository, DataSource } from "typeorm";
import { Cart } from "./cart.entity.js";

@Injectable()
export class CartService {
  constructor(@InjectRepository(Cart) private cartRepository: Repository<Cart>, private dataSource: DataSource) {}

  async getShopCarts(shopId: number) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();

      const carts = await queryRunner.query(`SELECT id, customer_name, total, reserved_indicator, reservation_time, qty FROM carts WHERE shop_id = '${shopId}'`)

      await queryRunner.release()
      return carts
    } catch (err) {
      console.log(err)
    }
  }
}