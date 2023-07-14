import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { shopifySession } from "../../types/session.js";
import shopify from "../../utils/shopify.js";
import { Shop } from "./shop.entity.js";

const freeThemeIds = [887, 1841, 1864, 1499, 1500, 1891, 1356, 857, 1567, 1431, 1368, 1363, 1434];

@Injectable()
export class ShopService {
  constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>) {}

  async getShopData(session: shopifySession) {
    return await shopify.api.rest.Shop.all({
      session,
    });
  }

  async getShopSettings(domain: string) {
    const shopData = await this.shopRepository.findOneBy({ domain });

    if (shopData) {
      const priorities = JSON.parse(shopData.priorities)

      return [priorities]
    }

    return false
  }

  async updateShopSettings(domain: string, body: any) {
    const { 
      max_priority, 
      high_priority, 
      normal_priority, 
      low_priority, 
      min_priority, 
      add_email,
      expire_soon_email,
      expired_email,
      reminder_email
    } = body;

    const updatedPriorities = {
      max_priority, high_priority, normal_priority, low_priority, min_priority
    }

    const templates = { add_email, expire_soon_email, expired_email, reminder_email }

    const updateSettings = await this.shopRepository.update({ domain }, { priorities: JSON.stringify(updatedPriorities), 
    })

    return updateSettings;
  }

  async disableTutorial(domain: string) {
    await this.shopRepository.update({ domain }, { tutorial: false })
  }

  async getThemes(session: shopifySession) {
    const themes = await shopify.api.rest.Theme.all({
      session,
      fields: 'name'
    })

    return themes;
  }

  async injectSnippet(session: shopifySession, themeName: string) {
    const themes = await shopify.api.rest.Theme.all({
      session
    });
    const theme = themes.filter((el: any) => el.name === themeName)[0];

    if (freeThemeIds.includes(theme.theme_store_id)) {
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

      return true
    } else {
      return false;
    }
  }
}