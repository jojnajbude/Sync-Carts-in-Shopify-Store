import { Module } from "@nestjs/common";
import { StorefrontController } from "./storefront.controller.js";
import { StorefrontService } from "./storefront.service.js";

@Module({
  controllers: [StorefrontController],
  providers: [StorefrontService],
})
export class StorefrontModule {}