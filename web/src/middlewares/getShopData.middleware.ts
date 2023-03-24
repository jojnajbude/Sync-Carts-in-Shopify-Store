import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { DataSource } from "typeorm";
import shopify from "../utils/shopify.js";

@Injectable()
export class getShopDataMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;
    const sessionJSON = await JSON.stringify(session)

    try {
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session })

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const [shop] = await queryRunner.query(`SELECT * FROM shops WHERE shopify_shop_id = '${shopifyShopData.id}'`)

      if (shop) {
        if (shop.shop_session !== session) {
          queryRunner.query(`UPDATE shops SET shop_session = '${sessionJSON}' WHERE shopify_shop_id = '${shopifyShopData.id}'`)
        }

        await queryRunner.release()
        next();
      } else {
        await queryRunner.query(`INSERT INTO shops (id, shop_domain, shopify_shop_id, shop_session) VALUES (DEFAULT, '${shopifyShopData.domain}', ${shopifyShopData.id}, '${sessionJSON}')`)
        await queryRunner.release()
        next()
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error')
    }
  }
}
