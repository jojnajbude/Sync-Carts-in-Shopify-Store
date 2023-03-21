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
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session })

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const [shop] = await queryRunner.query(`SELECT * FROM shops WHERE shop_name = '${shopifyShopData.name}'`)

      if (shop) {
        await queryRunner.release()
        next();
      } else {
        await queryRunner.query(`INSERT INTO shops (id, shop_name) VALUES (DEFAULT, '${shopifyShopData.name}') RETURNING id`)
        await queryRunner.release()
        next()
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error')
    }
  }
}
