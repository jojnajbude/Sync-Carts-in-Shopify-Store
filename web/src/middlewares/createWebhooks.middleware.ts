import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response, Request } from "express";
import { Webhook } from "../types/webhook.js";
import shopify from "../utils/shopify.js";

@Injectable()
export class createWebhooks implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;

    const webhooks: Webhook[] = await shopify.api.rest.Webhook.all({
      session
    })

    const cartCreate = webhooks.find(webhook => webhook.address.includes('/cart/create'));
    const cartUpdate = webhooks.find(webhook => webhook.address.includes('/cart/update'));
    // const customerCreate = webhooks.find(webhook => webhook.address.includes('/customer/create'));
    const customerUpdate = webhooks.find(webhook => webhook.address.includes('/customer/update'));
    const orderPaid = webhooks.find(webhook => webhook.address.includes('/order/paid'));

    if (!cartCreate) {
      const cartCreateWebhook = new shopify.api.rest.Webhook({session});
      cartCreateWebhook.address = 'https://better-carts.dev-test.pro/storefront/cart/create';
      cartCreateWebhook.topic = 'carts/create';
      cartCreateWebhook.format = 'json';
      await cartCreateWebhook.save({
        update: true
      })
    }

    if (!cartUpdate) {
      const cartUpdateWebhook = new shopify.api.rest.Webhook({session});
      cartUpdateWebhook.address = 'https://better-carts.dev-test.pro/storefront/cart/update';
      cartUpdateWebhook.topic = 'carts/update';
      cartUpdateWebhook.format = 'json';
      await cartUpdateWebhook.save({
        update: true
      })
    }

    // if (!customerCreate) {
    //   const customerCreateWebhook = new shopify.api.rest.Webhook({session});
    //   customerCreateWebhook.address = 'https://better-carts.dev-test.pro/storefront/customer/create';
    //   customerCreateWebhook.topic = 'customers/create';
    //   customerCreateWebhook.format = 'json';
    //   await customerCreateWebhook.save({
    //     update: true
    //   })
    // }

    if (!customerUpdate) {
      const customerUpdateWebhook = new shopify.api.rest.Webhook({session});
      customerUpdateWebhook.address = 'https://better-carts.dev-test.pro/storefront/customer/update';
      customerUpdateWebhook.topic = 'customers/update';
      customerUpdateWebhook.format = 'json';
      await customerUpdateWebhook.save({
        update: true
      })
    }

    if (!orderPaid) {
      const customerUpdateWebhook = new shopify.api.rest.Webhook({session});
      customerUpdateWebhook.address = 'https://better-carts.dev-test.pro/storefront/order/paid';
      customerUpdateWebhook.topic = 'orders/paid';
      customerUpdateWebhook.format = 'json';
      await customerUpdateWebhook.save({
        update: true
      })
    }

    next();
  }
}