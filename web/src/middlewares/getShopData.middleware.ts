import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NextFunction, Request, Response } from "express";
import { Repository } from "typeorm";
import { Shop } from "../modules/shops/shop.entity.js";
import shopify from "../utils/shopify.js";

@Injectable()
export class getShopDataMiddleware implements NestMiddleware {
  constructor(@InjectRepository(Shop) private shopsRepository: Repository<Shop>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;
    const sessionJSON = await JSON.stringify(session);

    try {
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session });

      const shop = await this.shopsRepository.findOneBy({ shopify_id: shopifyShopData.id });

      if (shop) {
        if (shop.session !== session) {
          await this.shopsRepository.update({ shopify_id: shopifyShopData.id }, { session: sessionJSON });
        }

        next();
      } else {
        await this.shopsRepository.insert({ domain: shopifyShopData.domain, shopify_id: shopifyShopData.id, session: sessionJSON });
        next();
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  }
}
