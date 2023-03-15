import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";

import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";
import { Express } from "express";

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyStaticOptions } from "@nestjs/platform-fastify/interfaces/external/fastify-static-options.interface.js";

import * as dotenv from 'dotenv';
dotenv.config();

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "", 10);
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

// const staticOptions: FastifyStaticOptions = {
//   acceptRanges: true,
//   cacheControl: true,
//   decorateReply: true,
//   dotfiles: 'allow',
//   etag: true,
//   extensions: ['.js'],
//   immutable: true,
//   index: ['1'],
//   lastModified: true,
//   maxAge: '',
//   prefix: '',
//   prefixAvoidTrailingSlash: false,
//   root: STATIC_PATH,
//   schemaHide: true,
//   serve: true,
//   wildcard: true,
//   list: false,
//   setHeaders: (res: any, pathName: any) => {
//     res.setHeader('test', pathName)
//   },
//   preCompressed: false
// }

export class App {
  public async start(server: Express) {
    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter()
    );
    app.useGlobalPipes(new ValidationPipe());
    app.useStaticAssets(STATIC_PATH, { index: false });
    await app.listen(PORT);
  }
}
