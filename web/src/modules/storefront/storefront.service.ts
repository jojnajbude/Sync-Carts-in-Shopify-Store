import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";
import shopify from "../../utils/shopify.js";
import { Item } from "../items/item.entity.js";

@Injectable()
export class StorefrontService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>
  ) {}

  async getData(cart_id: string, customer_id: string) {
    if (customer_id !== 'undefined') {
      const cart = await this.cartRepository.findOneBy({ cart_token: cart_id });
      const user = await this.customerRepository.findOneBy({ shopify_user_id: Number(customer_id) })

      if(cart?.customer_id !== user?.id) {
        await this.cartRepository.update({ id: cart?.id }, { customer_id: user?.id })
      }
    }

    const cartItems = await this.itemRepository.createQueryBuilder('items')
      .leftJoin('items.cart', 'carts')
      .where('carts.cart_token = :token', { token: cart_id })
      .getMany();

    return cartItems;
  }

  async handleAdding(shop: number, variant: number, qty: number) {
    const store = await this.shopsRepository.findOneBy({ shopify_id: shop })

    if (store && store.session) {
      const session = JSON.parse(store?.session);

      const variantRes = await shopify.api.rest.Variant.find({
        session,
        id: variant,
      });

      const [variantsReserved] = await this.itemRepository.query(
        `select sum(qty)
        from items
        where variant_id = ${variant}
        AND status = 'reserved'`
      );

      if (Number(variantsReserved.sum) + Number(qty) >= variantRes.inventory_quantity) {
        return 'All items reserved';
      }

      return 'Can reserve';
    }
  }

  async createCart(shop: string, cartData: any) {
    const store = await this.shopsRepository.findOneBy({ domain: shop });
    const cart = await this.cartRepository.save({ cart_token: cartData.token, shop_id: store?.id });

    return cart;
  }

  async updateCart(cartData: any, shop: string) {
    const store = await this.shopsRepository.findOneBy({ domain: shop });
    let session = null

    if (store) {
      session = JSON.parse(store?.session);
    }

    let cart = await this.cartRepository.findOneBy({ cart_token: cartData.token })

    if (!cart) {
       cart = await this.createCart(shop, cartData)
    }

    const items = await this.itemRepository.createQueryBuilder('items')
      .leftJoin('items.cart', 'carts')
      .where('carts.cart_token = :token', { token: cartData.token })
      .getMany();

    const updatedItems = [];

    if (items.length > cartData.line_items.length) {
      const deletedItem = items.find(item => !cartData.line_items.find((line_item: { id: number; }) => line_item.id === Number(item.variant_id)))

      if (deletedItem) {
        const removeItem = await this.itemRepository.remove(deletedItem)

        return removeItem
      }
    }

    for (const line_item of cartData.line_items) {
      const item = items.find(item => Number(item.variant_id) === line_item.variant_id)

      if (item && Number(item.qty) !== line_item.quantity) {
        updatedItems.push(await this.itemRepository.save({ id: item.id, qty: line_item.quantity }))
      } else if (!item) {
        const customer = await this.customerRepository.findOneBy({ id: cart.customer_id });

        let reservationTime = 0;

        switch(true) {
          case customer?.priority === 'max':
            reservationTime = 336;
            break;
          case customer?.priority === 'high':
            reservationTime = 72;
            break;
          case customer?.priority === 'normal':
            reservationTime = 24;
            break;
          case customer?.priority === 'low':
            reservationTime = 8;
            break;
          case customer?.priority === 'min':
            reservationTime = 1;
            break;
        }

        const product = await shopify.api.rest.Product.find({
          session,
          id: line_item.product_id,
        })

        const variant = product.variants.find((variant: { id: number; }) => variant.id === line_item.variant_id)

        const imgSrc = await shopify.api.rest.Image.find({
          session,
          product_id: product.id,
          id: variant.image_id,
        })

        const expireTime = this.countExpireDate(new Date(), reservationTime);
        console.log(expireTime);

        updatedItems.push(await this.itemRepository.save({ 
          variant_id: line_item.variant_id, 
          qty: line_item.quantity, 
          cart_id: cart?.id, 
          price: line_item.price, 
          title: product.title, 
          image_link: imgSrc.src, 
          product_id: variant.product_id,
          expireAt: expireTime,
        }))
      }
    }

    return updatedItems;
  }

  async createUser(shop: string, user: any) {
    const shopData = await this.shopsRepository.findOneBy({ domain: shop });
    const customer = await this.customerRepository.save({ shopify_user_id: user.id, shop_id: shopData?.id, name: `${user.first_name} ${user.last_name}` });

    return customer;
  }

  async updateUser(user: any) {
    const customer = await this.customerRepository.findOneBy({ shopify_user_id: user.id });

    // logic of updating name or email or phone
    // add when receive access

    return customer
  }

  async getReserveTime(variant: string, cart_token: string, user: string, shop: string) {
    const cart = await this.cartRepository.findOneBy({ cart_token: cart_token });
    const cartItem = await this.itemRepository.findOneBy({ variant_id: Number(variant), cart_id: cart?.id });
    console.log(cartItem)

    return cartItem?.status === 'reserved' ? cartItem : false;
  }

  countExpireDate(startDate: Date, time: number) {
    const expandTime = 3600000 * time;

    return new Date(startDate.getTime() + expandTime);
  }
}