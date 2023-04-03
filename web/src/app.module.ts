import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";

import { readFileSync } from "fs";
import { Request, Response, NextFunction } from "express";
import { join } from "path";

import shopify from "./utils/shopify.js";
import GDPRWebhookHandlers from "./utils/gdpr.js";
import { ShopModule } from "./modules/shops/shop.module.js";
import { CartModule } from "./modules/carts/cart.module.js";
import { StorefrontModule } from "./modules/storefront/storefront.module.js";
import { ProductModule } from "./product/product.module.js";
import { getShopDataMiddleware } from "./middlewares/getShopData.middleware.js";
import { Shop } from "./modules/shops/shop.entity.js";
import { Item } from "./modules/items/item.entity.js";
import { Customer } from "./modules/customers/customer.entity.js";
import { Cart } from "./modules/carts/cart.entity.js";
import { injectSnippet } from "./middlewares/injectSnippet.middleware.js";
import { createWebhooks } from "./middlewares/createWebhooks.middleware.js";

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'dmitrijromanenko',
      password: '1191994',
      database: 'better_carts',
      entities: [Shop, Item, Customer, Cart],
      synchronize: true,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://romanenkodmytriy:1191994spiri@bettercarts.zp3jd1t.mongodb.net/better-carts?retryWrites=true&w=majority',
      {
        connectionName: 'logs',
      }),
    ShopModule,
    ProductModule,
    CartModule,
    StorefrontModule,
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
      .forRoutes({ path: "/*", method: RequestMethod.ALL})

    consumer
      .apply(injectSnippet)
      .forRoutes({ path: "/", method: RequestMethod.ALL })

      consumer
      .apply(createWebhooks)
      .exclude({ path: "/storefront/(.*)", method: RequestMethod.ALL })
      .forRoutes({ path: "/*", method: RequestMethod.ALL })
  }
}
