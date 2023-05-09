import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import shopify from "../utils/shopify.js";
import * as fs from 'fs';
import path from "path";

@Injectable()
export class injectSnippet implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = res.locals.shopify.session;

    const snippet = fs.readFileSync(path.resolve(process.cwd(), './src/snippet/reserve-timer.liquid')).toString('utf8');

    try {
      const themes = await shopify.api.rest.Theme.all({
        session,
        fields: 'id'
      })

      for (const theme of themes) {
        const asset = await new shopify.api.rest.Asset({session})
        asset.theme_id = theme.id;
        asset.key = "snippets/reserve-timer.liquid";
        asset.value = snippet;
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