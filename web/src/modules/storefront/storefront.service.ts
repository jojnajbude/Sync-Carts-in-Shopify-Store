import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
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

  async getData(user_id: number, shop_id: number, cart_id: string) {
    try {
      let user = await this.customerRepository.findOneBy({ shopify_user_id: user_id });
      const shop = await this.shopsRepository.findOneBy({ shopify_id: shop_id });
      
      if (!user) {
        // const session = JSON.parse(shop.session)

        //     const data = await shopify.api.rest.Customer.find({
        //       session,
        //       id: user_id
        //     })``

        user = await this.customerRepository.save({ shopify_user_id: user_id, shop_id: shop?.id });
      }

      if (cart_id !== 'undefined') {
        let cart = await this.cartRepository.findOneBy({ cart_token: cart_id });

        if (!cart) {
          cart = await this.cartRepository.findOneBy({ customer_id: user.id, shop_id: shop?.id, cart_token: IsNull() });

          if (cart) {
            cart = await this.cartRepository.save({ id: cart.id, cart_token: cart_id, customer_id: user.id, shop_id: shop?.id });
          }
        }

        return cart;
      }

      return false;
    } catch (err) {
      console.log(err);
      return false
    }
  }

  async addToCart(customer: number, shop: number, cart_token: string, variant: number, qty: number) {
    const store = await this.shopsRepository.findOneBy({ shopify_id: shop })

    if (store && store.session) {
      const session = JSON.parse(store?.session);

      const variantRes = await shopify.api.rest.Variant.find({
        session,
        id: variant,
      })

      const [variantsReserved] = await this.itemRepository.query(
        `select sum(qty)
        from items
        where variant_id = ${variant}
        AND status = 'reserved'`
      )

      if (Number(variantsReserved.sum) >= variantRes.inventory_quantity) {
        return 'All items reserved'
      }

      const price = variantRes.price;

      if (cart_token === 'undefined') {
        const user = await this.customerRepository.findOneBy({ shopify_user_id: customer })
        const createdCart = await this.cartRepository.insert({ customer_id: user?.id, shop_id: store?.id });
        const handleAdding = await this.itemRepository.save({ variant_id: variant, qty, cart_id: createdCart.raw[0].id, price });

        return handleAdding;
      } else {
        const cart = await this.cartRepository.findOneBy({ cart_token });
        const item = await this.itemRepository.findOneBy({ variant_id: variant, cart_id: cart?.id });

        if (item) {
          const newQty = Number(item.qty) + Number(qty);
          const handleAdding = await this.itemRepository.save({ id: item.id, variant_id: variant, qty: newQty, cart_id: cart?.id, price });
          return handleAdding;
        } else {
          const handleAdding = await this.itemRepository.save({ variant_id: variant, qty, cart_id: cart?.id, price });
          return handleAdding;
        }
      }
    }
  }

  async getReserveTime(variant: string, cart_token: string, user: string, shop: string) {
    const cart = await this.cartRepository.findOneBy({ cart_token: cart_token });
    const cartItem = await this.itemRepository.findOneBy({ variant_id: Number(variant), cart_id: cart?.id });

    return cartItem?.createdAt;
  }
}