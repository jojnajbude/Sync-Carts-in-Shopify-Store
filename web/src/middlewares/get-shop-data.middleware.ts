import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from 'fs';
import { NextFunction, Request, Response } from "express";
import { Repository } from "typeorm";
import { Analytics } from "../modules/analytics/analytics.entity.js";
import { Shop } from "../modules/shops/shop.entity.js";
import shopify from "../utils/shopify.js";
import path from "path";

@Injectable()
export class getShopDataMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;

    try {
      const [shopifyShopData] = await shopify.api.rest.Shop.all({ session });

      const shop = await this.shopsRepository.findOneBy({ shopify_id: shopifyShopData.id });

      const sessionJSON = await JSON.stringify(session);
      if (shop) {
        if (shop.session !== sessionJSON) {
          await this.shopsRepository.update({ shopify_id: shopifyShopData.id }, { session: sessionJSON });
        }

        next();
      } else {
        const newShop = await this.shopsRepository.insert({ 
          domain: shopifyShopData.domain, 
          shopify_id: shopifyShopData.id, 
          session: sessionJSON, 
          currency: shopifyShopData.currency ,
          cart_reminder_html: getTemplate('cart-reminder'),
          cart_updated_html: getTemplate('cart-updated'),
          expiring_soon_html: getTemplate('expiring-soon'),
          expired_items_html: getTemplate('expired-items'),
        });

        await this.analyticsRepository.insert({ shop_id: newShop.identifiers[0].id })
        next();
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  }
}


function getTemplate(type: string) {
  return JSON.stringify(fs.readFileSync(path.resolve(process.cwd(), `src/templates/${type}.html`), { encoding: 'utf8' }));
}
