import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { DataSource } from "typeorm";
import shopify from "../utils/shopify.js";

@Injectable()
export class getShopDataMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;

    try {
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session, fields: 'id,name' })

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const [shop] = await queryRunner.query(`SELECT * FROM shops WHERE shop_name = '${shopifyShopData.name}'`)
      console.log(shop)

      await queryRunner.release()

      if (shop) {
        next();
      } else {
        console.log('data doesnt exist')
        next();
        // данные магазина отсутствуют в базе данных
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error')
    }
  }
}
