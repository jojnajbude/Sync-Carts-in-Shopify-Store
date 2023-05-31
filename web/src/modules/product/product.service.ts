import { Injectable } from "@nestjs/common";
import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Item } from "../items/item.entity.js";

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
  constructor(
    @InjectRepository(Item) private itemRepository: Repository<Item>,
  ) {}

  async getProduct(id: string, session: shopifySession) {
    const product = await shopify.api.rest.Product.find({
      session,
      id,
    })

    const reservedItemsQty = await this.itemRepository.query(
      `select SUM(qty), variant_id from items
      where product_id = '${id}'
      and status IN ('reserved', 'recount', 'added', 'unsynced') 
      group by variant_id`
    )

    reservedItemsQty.forEach((item: { variant_id: any; sum: any; }) => {
      const productVariant = product.variants.findIndex((variant: { id: any; }) => variant.id === Number(item.variant_id));
      product.variants[productVariant].inventory_quantity = product.variants[productVariant].inventory_quantity - Number(item.sum);
    })

    return product;
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

    const productIds = [];

    for (const product of data.body.data.products.edges) {
      productIds.push(product.node.id.split('/')[4]);
    }

    const items = await this.itemRepository
      .createQueryBuilder('item')
      .select('SUM(item.qty)', 'qty')
      .addSelect('item.product_id', 'product_id')
      .where('item.product_id IN (:...productIds)', { productIds })
      .andWhere('item.status IN (:...statuses)', { statuses: ['reserved', 'recount', 'added', 'unsynced'] })
      .groupBy('item.product_id')
      .getRawMany();

    for (const item of items) {
      const product = data.body.data.products.edges.findIndex((product: { node: { id: string; }; }) => product.node.id.split('/')[4] === item.product_id);
      data.body.data.products.edges[product].node.totalInventory = data.body.data.products.edges[product].node.totalInventory - Number(item.qty);
    }

    return data.body.data.products.edges;
  }
}
