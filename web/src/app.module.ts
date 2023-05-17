import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { readFileSync } from "fs";
import { Request, Response, NextFunction } from "express";
import { join } from "path";

import shopify from "./utils/shopify.js";
import GDPRWebhookHandlers from "./utils/gdpr.js";

import { ShopModule } from "./modules/shops/shop.module.js";
import { CartModule } from "./modules/carts/cart.module.js";
import { StorefrontModule } from "./modules/storefront/storefront.module.js";
import { ProductModule } from "./modules/product/product.module.js";
import { CustomerModule } from "./modules/customers/customer.module.js";
import { ItemsModule } from "./modules/items/item.module.js";
import { AnalyticsModule } from "./modules/analytics/analytics.module.js";
import { LogModule } from "./modules/log/logs.module.js";
import { SubscribeModule } from "./modules/subscribe/subscribe.module.js";
import { NotificationsModule } from "./modules/notifications/notifications.module.js";

import { Shop } from "./modules/shops/shop.entity.js";
import { Item } from "./modules/items/item.entity.js";
import { Customer } from "./modules/customers/customer.entity.js";
import { Cart } from "./modules/carts/cart.entity.js";
import { Analytics } from "./modules/analytics/analytics.entity.js";

import { injectSnippet } from "./middlewares/inject-snippet.middleware.js";
import { createWebhooks } from "./middlewares/create-webhooks.middleware.js";
import { getShopDataMiddleware } from "./middlewares/get-shop-data.middleware.js";

import { migration1683619416755 } from "../migrations/1683619416755-migration.js";

import * as dotenv from 'dotenv';
dotenv.config();

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT!,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Shop, Item, Customer, Cart, Analytics],
      synchronize: true,
      // migrations: [migration1683619416755],
      // ssl: {
      //   ca: process.env.SSL_CERT,
      // },
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI!,
    ),
    ScheduleModule.forRoot(),
    ShopModule,
    CustomerModule,
    ProductModule,
    CartModule,
    ItemsModule,
    StorefrontModule,
    AnalyticsModule,
    LogModule,
    SubscribeModule,
    NotificationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Authentication Middleware
    consumer.apply(shopify.auth.begin()).forRoutes({
      path: shopify.config.auth.path,
      method: RequestMethod.GET,
    });
    consumer.apply(shopify.auth.callback()).forRoutes({
      path: shopify.config.auth.callbackPath,
      method: RequestMethod.GET,
    });

    // Validate Authenticated Session Middleware for Backend Routes
    consumer
      .apply(shopify.validateAuthenticatedSession())
      .forRoutes({ path: "/api/*", method: RequestMethod.ALL });

    // Webhooks
    consumer
      .apply(
        ...shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
      )
      .forRoutes({
        path: shopify.config.webhooks.path,
        method: RequestMethod.POST,
      });

    // Ensure Installed On Shop Middleware for Client Routes.
    // Except for backend routes /api/(.*)
    consumer
      .apply(
        shopify.ensureInstalledOnShop(),
        (_req: Request, res: Response, _next: NextFunction) => {
          return res
            .status(200)
            .set("Content-Type", "text/html")
            .send(readFileSync(join(STATIC_PATH, "index.html")));
        }
      )
      .exclude(
        { path: "/api/(.*)", method: RequestMethod.ALL },
        { path: "/storefront/(.*)", method: RequestMethod.ALL }
      )
      .forRoutes({ path: "/*", method: RequestMethod.ALL });

    consumer
      .apply(getShopDataMiddleware)
      .exclude({ path: "/storefront/(.*)", method: RequestMethod.ALL })
      .forRoutes({ path: "/api/subscribe/get", method: RequestMethod.ALL})

    consumer
      .apply(injectSnippet)
      .exclude(
        // { path: "/api/(.*)", method: RequestMethod.ALL },
        { path: "/storefront/(.*)", method: RequestMethod.ALL }
      )
      .forRoutes({ path: "/api/subscribe/get", method: RequestMethod.ALL })

    consumer
      .apply(createWebhooks)
      .exclude(
        { path: "/storefront/(.*)", method: RequestMethod.ALL }
      )
      .forRoutes({ path: "/api/subscribe/get", method: RequestMethod.ALL })
  }
}
