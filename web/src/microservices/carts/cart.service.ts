import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Cart } from "./cart.entity.js";

@Injectable()
export class CartService {
  constructor(@InjectRepository(Cart) private cartRepository: Repository<Cart>, private dataSource: DataSource) {}

  async getShopCarts(shopId: number) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();

      const carts = await queryRunner.query(`SELECT * FROM carts WHERE shop_id = '${shopId}'`)
      console.log(carts)
      return carts
    } catch (err) {
      console.log(err)
    }
  }
}