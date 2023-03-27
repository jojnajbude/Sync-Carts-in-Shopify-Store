import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NextFunction, Request, Response } from "express";
import { Repository } from "typeorm";
import { Shop } from "../microservices/shops/shop.entity.js";
import shopify from "../utils/shopify.js";

@Injectable()
export class getShopDataMiddleware implements NestMiddleware {
  constructor(@InjectRepository(Shop) private shopsRepository: Repository<Shop>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;
    const sessionJSON = await JSON.stringify(session)

    try {
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session })

      // const queryRunner = this.dataSource.createQueryRunner();
      // await queryRunner.connect();

      // const [shop] = await queryRunner.query(`SELECT * FROM shops WHERE shopify_shop_id = '${shopifyShopData.id}'`)

      const shop = await this.shopsRepository.findOneBy({ shopify_id: shopifyShopData.id })

      if (shop) {
        if (shop.session !== session) {
          // queryRunner.query(`UPDATE shops SET shop_session = '${sessionJSON}' WHERE shopify_shop_id = '${shopifyShopData.id}'`)
          await this.shopsRepository.update({ shopify_id: shopifyShopData.id }, { session: sessionJSON })
        }

        // await queryRunner.release()
        next();
      } else {
        // await queryRunner.query(`INSERT INTO shops (id, shop_domain, shopify_shop_id, shop_session) VALUES (DEFAULT, '${shopifyShopData.domain}', ${shopifyShopData.id}, '${sessionJSON}')`)
        // await queryRunner.release()
        await this.shopsRepository.insert({ domain: shopifyShopData.domain, shopify_id: shopifyShopData.id, session: sessionJSON })
        next()
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error')
    }
  }
}
