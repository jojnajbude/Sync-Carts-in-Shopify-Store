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
      });

      for (const theme of themes) {
        const asset = await new shopify.api.rest.Asset({session})
        asset.theme_id = theme.id;
        asset.key = "snippets/reserve-timer.liquid";
        asset.value = snippet;
        await asset.save({
          update: true,
        });
      }

      const theme = themes.find((theme: any) => theme.role === 'main');

      if (!theme) throw new Error('Theme not found');

      if (!theme.theme_store_id) throw new Error('Custom themes not supported');
      
      next()
    } catch (err) {
      console.log(err)
      next()
    }
  }

  async injectSnippet(session: any, theme: any) {
    const snippetRow = '{%  render "reserve-timer", variant_id: item.variant_id, color: "red" %}';
    const key = '<path d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z" fill="white" stroke="#EB001B" stroke-width="0.7"></svg></div>'

    const cartDrawerAsset = await shopify.api.rest.Asset.all({
      session,
      theme_id: theme.id,
      asset: {"key": "snippets/cart-drawer.liquid"}
    })

    const mainCartItemsAsset = await shopify.api.rest.Asset.all({
      session,
      theme_id: theme.id,
      asset: {"key": "sections/main-cart-items.liquid"}
    })

    if (!cartDrawerAsset.includes(snippetRow)) {
      const noSpacesCartDrawer = cartDrawerAsset[0].value.replace(/>\s+|\s+</g, function(elem : any) {
        return elem.trim();
      });

      const splittedCodeCartDrawer = noSpacesCartDrawer.split(key);
      const injectedSnippetCartDrawer = [splittedCodeCartDrawer[0], key, snippetRow, splittedCodeCartDrawer[1]].join('');

      const updatedCartDrawer = await new shopify.api.rest.Asset({session})
      updatedCartDrawer.theme_id = theme.id;
      updatedCartDrawer.key = "snippets/cart-drawer.liquid";
      updatedCartDrawer.value = injectedSnippetCartDrawer;
      await updatedCartDrawer.save({
        update: true,
      });
    }

    if (!mainCartItemsAsset.includes(snippetRow)) {
      const noSpacesMainCart = mainCartItemsAsset[0].value.replace(/>\s+|\s+</g, function(elem : any) {
        return elem.trim();
      });
  
      const splittedCodeMainCart = noSpacesMainCart.split(key);
      const injectedSnippetMainCart = [splittedCodeMainCart[0], key, snippetRow, splittedCodeMainCart[1]].join('');
  
      const updatedMainCart = await new shopify.api.rest.Asset({session})
      updatedMainCart.theme_id = theme.id;
      updatedMainCart.key = "sections/main-cart-items.liquid";
      updatedMainCart.value = injectedSnippetMainCart;
      await updatedMainCart.save({
        update: true,
      });
    }
  }
}