import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { getAllCarts } from "../../constants/query.js";

@Injectable()
export class CartService {
  constructor(private dataSource: DataSource) {}

  async getShopCarts(session: Object) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const data = await queryRunner.query(getAllCarts);

      return data;
    } catch (err) {
      console.log(err)
    }
  }
}