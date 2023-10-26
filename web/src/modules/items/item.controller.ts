import { Response } from "express";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { ItemsService } from "./item.service.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Item } from "./item.entity.js";
import countExpireDate from "../../utils/countExpireDate.js";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";

@Controller('/api/items')
export class ItemsController {
  constructor (
    private itemsService: ItemsService,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
  ) {}

  @Post()
  async createItem(@Body() body: any, @Res() res: Response) {
    const {
      variant,
      cartID,
    } = body;

    const cart = await this.cartRepository.findOneBy({ id: cartID });

    if (!cart) {
      res.status(400).send({
        error: {
          message: 'no cart'
        }
      });
      return;
    }

    const customer = await this.customerRepository.findOneBy({ id: cart.customer_id });

    if (!customer) {
      res.status(400).send({
        error: {
          message: 'no customer'
        }
      });
      return;
    }

    const shop = await this.shopRepository.findOneBy({ id: cart.shop_id });

    if (!shop) {
      res.status(400).send({
        error: {
          message: 'no shop'
        }
      });
      return;
    }

    let item = await this.itemRepository.findOneBy({
      variant_id: variant.id,
      cart_id: cart.id
    });

    if (item) {
      item.qty = Number(item.qty) + Number(variant.qty);

      await this.itemRepository.save(item);
      

      res.status(200).send(item);
      return;
    }

    const expireTime = countExpireDate(new Date(), customer.priority, JSON.parse(shop.priorities));

    item = await this.itemRepository.save({
      variant_id: Number(variant.id),
      variant_title: variant.title,
      product_id: Number(variant.product_id),
      qty: Number(variant.qty),
      expire_at: expireTime,
      cart_id: cart.id,
      price: variant.price,
      title: variant.title,
      image_link: variant.image_link,
    });

    res.send(item);
  }
}