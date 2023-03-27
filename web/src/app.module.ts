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
import { ShopModule } from "./microservices/shops/shop.module.js";
import { CartModule } from "./microservices/carts/cart.module.js";
import { StorefrontModule } from "./microservices/storefront/storefront.module.js";
import { ProductModule } from "./product/product.module.js";
import { getShopDataMiddleware } from "./middlewares/getShopData.middleware.js";
import { Shop } from "./microservices/shops/shop.entity.js";
import { Item } from "./microservices/items/item.entity.js";
import { Customer } from "./microservices/customers/customer.entity.js";
import { Cart } from "./microservices/carts/cart.entity.js";

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
    ProductModule,
    ShopModule,
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
  }
}
