import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./cart.entity.js";

@Injectable()
export class CartService {
  constructor(@InjectRepository(Cart) private cartRepository: Repository<Cart>) {}

  getShopCarts() {
    return [{id: 1, shopName: 'Dima'}]
  }
}