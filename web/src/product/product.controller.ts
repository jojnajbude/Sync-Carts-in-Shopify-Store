import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { Request, Response } from "express";
import shopify from "../utils/shopify.js";
import { ProductService } from "./product.service.js";

@Controller("/api/products")
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('get')
  async getProductsByTitle(@Query() query: { input: string }, @Req() req: Request, @Res() res: Response) {   
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
      apiVersion: LATEST_API_VERSION
    });

    const productsList = await this.productService.getProductsByTitle(query.input, client);

    productsList ? res.status(200).send(productsList) : res.status(404).send('Not found')
  }

  @Get("create")
  async create(@Res() res: Response) {
    let status = 200;
    let error = null;

    try {
      await this.productService.create(res.locals.shopify.session);
    } catch (e: any) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  }

  @Get("count")
  async count(@Res() res: Response) {
    const countData = await this.productService.count(
      res.locals.shopify.session
    );
    res.status(200).send(countData);
  }
}
