import { Injectable } from "@nestjs/common";
import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";

export const DEFAULT_PRODUCTS_COUNT = 5;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

@Injectable()
export class ProductService {
  async getProduct(id: string, session: shopifySession) {
    return await shopify.api.rest.Product.find({
      session,
      id,
    })
  }

  async getVariant(id: string, session: shopifySession) {
    return await shopify.api.rest.Variant.find({
      session,
      id,
    })
  }

  async getProductsByTitle(inputText: string, client: any) {
    const data = await client.query({
      data: `{
        products (first: 25, query: "title:${inputText}*") {
          edges {
            node {
              id
              title
              image: featuredImage {
                id
                url
                altText
              }
              options {
                id
                name
                position
                values
              }
              totalInventory
              priceRangeV2 {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }`
    })

    return data.body.data.products.edges;
  }
}
