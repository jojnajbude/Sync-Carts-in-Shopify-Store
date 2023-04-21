import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { query, Request, Response } from "express";
import shopify from "../utils/shopify.js";
import { ProductService } from "./product.service.js";

@Controller("/api/products")
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('get')
  async getProduct(@Query() query: { id: string }, @Res() res: Response) {
    const product = await this.productService.getProduct(query.id, res.locals.shopify.session);

    product ? res.status(200).send(product) : res.status(404).send('Not found');
  }

  @Get('find')
  async getProductsByTitle(@Query() query: { input: string }, @Req() req: Request, @Res() res: Response) {   
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
      apiVersion: LATEST_API_VERSION
    });

    const productsList = await this.productService.getProductsByTitle(query.input, client);

    productsList ? res.status(200).send(productsList) : res.status(404).send('Not found')
  }
}
