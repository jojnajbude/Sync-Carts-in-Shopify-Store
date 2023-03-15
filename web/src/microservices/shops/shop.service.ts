import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shops } from "./shop.entity.js";

@Injectable()
export class ShopService {
  constructor(@InjectRepository(Shops) private shopsRepository: Repository<Shops>) {}

  getShopData() {
    return [{shop: 'Dima'}]
  }
}