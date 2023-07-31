import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from 'fs';
import { NextFunction, Request, Response } from "express";
import { Repository } from "typeorm";
import { Analytics } from "../modules/analytics/analytics.entity.js";
import { Shop } from "../modules/shops/shop.entity.js";
import shopify from "../utils/shopify.js";
import path from "path";
import { AnalyticsService } from "../modules/analytics/analytics.service.js";

@Injectable()
export class getShopDataMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>,
    private analyticsService: AnalyticsService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;
    console.log(session)

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
        const initialTimers = await JSON.stringify({
          max_priority: 336,
          high_priority: 72,
          normal_priority: 24,
          low_priority: 8,
          min_priority: 1,
        })

        const newShop = await this.shopsRepository.insert({ 
          domain: shopifyShopData.permanent_domain, 
          shopify_id: shopifyShopData.id, 
          email: shopifyShopData.email,
          session: sessionJSON, 
          currency: shopifyShopData.currency,
          priorities: initialTimers,
          cart_reminder_html: getTemplate('cart-reminder', 'html'),
          cart_updated_html: getTemplate('cart-updated', 'html'),
          expiring_soon_html: getTemplate('expiring-soon', 'html'),
          expired_items_html: getTemplate('expired-items', 'html'),
          cart_reminder_json: getTemplate('cart-reminder', 'json'),
          cart_updated_json: getTemplate('cart-updated', 'json'),
          expiring_soon_json: getTemplate('expiring-soon', 'json'),
          expired_items_json: getTemplate('expired-items', 'json'),
        });

        await this.analyticsService.createNewDayEntities(newShop.identifiers[0].id);
        next();
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  }
}

function getTemplate(type: string, format: string) {
  return fs.readFileSync(path.resolve(process.cwd(), `src/templates/${type}.${format}`), { encoding: 'utf8' });
}
