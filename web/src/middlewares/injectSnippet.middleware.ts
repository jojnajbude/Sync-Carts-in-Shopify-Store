import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import shopify from "../utils/shopify.js";

@Injectable()
export class injectSnippet implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;

    try {
      const themes = await shopify.api.rest.Theme.all({
        session,
        fields: 'id'
      })

      for (const theme of themes) {
        const asset = await new shopify.api.rest.Asset({session})
        asset.theme_id = theme.id;
        asset.key = "snippets/reserve-timer.liquid";
        asset.value= "<h1>Extend time:</h1>";
        await asset.save({
          update: true,
        });
      }
      
      next()
    } catch (err) {
      console.log(err)
    }
  }
}