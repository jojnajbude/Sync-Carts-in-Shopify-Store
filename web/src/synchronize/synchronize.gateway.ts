import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import {Injectable, Req} from "@nestjs/common";
import { Server, Socket } from 'socket.io';
import {Cart} from "../modules/carts/cart.entity.js";
import {IsNull, LessThan, MoreThanOrEqual, Repository} from "typeorm";

import { InjectRepository } from '@nestjs/typeorm'
import {Customer} from "../modules/customers/customer.entity.js";
import {Shop} from "../modules/shops/shop.entity.js";
import {Item} from "../modules/items/item.entity.js";
import { Analytics } from '../modules/analytics/analytics.entity.js';
import shopify from '../utils/shopify.js';


type SyncProps = {
  customer: string;
  data: any;
  shop: Number;
}

@WebSocketGateway({
  path: '/storefront/synchronize',
  cors: {
    origin: '*'
  }
})
@Injectable()
export class SynchronizeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>,
  ) {
  }

  @WebSocketServer()
  public server: Server;

  afterInit(@ConnectedSocket() client: Socket): void {
    console.log('Initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    console.log('Connected');

    client.on('disconnecting', () => {
      client.rooms.forEach(async (room: string) => {
        if (room !== client.id) {
          const sockets = await this.server.in(room).fetchSockets();
  
          const online = sockets.filter(socket => socket.id !== client.id).length > 1;
  
          client.broadcast.in(room).emit('online', online);
        }
      });
    })
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    // console.log('Disconnected');           
  }

  @SubscribeMessage('session')
  async handleSession(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() request: Request): Promise<void> {
    const { customer: customerId, os, shop, admin, cartId } = body || {};

    console.log('customer', customerId);

    if (customerId) {
      client.join(String(customerId));

      const sockets = await this.server.in(String(customerId)).fetchSockets();

      const online = sockets.filter(socket => socket.id !== client.id).length > 0;

      client.in(String(customerId)).emit('online', online);
    } else if (!customerId || (admin && customerId)){
      client.join('admin');

      return;
    }

    let customerModel = await this.customerRepository.findOne({ where: {
      shopify_user_id: Number(customerId || 0)
    }});

    if (!customerModel) {
      const shopModel = await this.shopRepository.findOneBy({ shopify_id: Number(shop || 0) });

      if (!shopModel) {
        console.log('no shop');
        return;
      }

      const shopifyUser = await shopify.api.rest.Customer.find({
        session: JSON.parse(shopModel.session),
        id: customerId
      });

      if (!shopifyUser) {
        console.log('no shopify user');
        return;
      }

      customerModel = await this.customerRepository.save({
        name: shopifyUser.last_name && shopifyUser.first_name ? `${shopifyUser.first_name} ${shopifyUser.last_name}` : shopifyUser.email,
        shopify_user_id: shopifyUser.id, 
        shop_id: shopModel?.id,
        priority: 'normal',
        email: shopifyUser.email,
        location: shopifyUser.default_address ? shopifyUser.default_address.country_name : 'Unknown',
      });
    }

    const cart = cartId
      ? await this.cartRepository.findOne({
        where: {
          id: cartId
        }
      })
      : await this.cartRepository.findOne({
      where: {
        customer_id: customerModel.id,
        closed_at: IsNull()
      }
    });

    if (!cart) {
      this.server.in(client.id).emit('synchronize', {
        create: true
      });
      return;
    }

    if (os) {
      const cartOS = JSON.parse(cart.os);

      if (!cartOS) {
        cart.os = JSON.stringify([os]);
      } else if (!cartOS.includes(os)) {
        cartOS.push(os);
        cart.os = JSON.stringify(cartOS);
      }


      this.cartRepository.save(cart);

      this.updateDeviceAnalytics(cart, os);
    }

    const items = await this.itemRepository.findBy({ cart_id: cart.id });

    this.server.in(String(customerId)).emit('synchronize', items);
  }

  @SubscribeMessage('synchronize')
  async handleMessage(@MessageBody() { customer: customerId, data, shop: shopId }: SyncProps, @ConnectedSocket() client: Socket): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: {
        shopify_user_id: Number(customerId || 0)
      }
    });

    if (!customer) {
      console.log('no customer');
      return;
    }

    let cart = await this.cartRepository.findOne({
      where: {
        customer_id: customer.id,
        closed_at: IsNull()
      }
    });

    const shop = await this.shopRepository.findOneBy({
      shopify_id: Number(shopId)
    })

    if (!shop) {
      console.log('no shop');
      return;
    }

    if (!cart) {
      cart = await this.cartRepository.save({
        customer_id: customer.id,
        shop_id: shop.id,
      });

      this.updateLocationAnalytics(customer, shop);
      this.updateConversionRate(shop.id, 'add');

      const expireTime = this.countExpireDate(new Date(), customer.priority, JSON.parse(shop.priorities));

      const items: Item[] = data.items.map(async (item: any)  => {
        return ({
          variant_id: item.id,
          variant_title: item.variant_title,
          product_id: item.product_id,
          qty: item.quantity,
          expire_at: expireTime,
          cart_id: cart?.id,
          price: this.formatPrice(item.price),
          title: item.title,
          image_link: item.image,
        })
      });

      await Promise.all(items)
          .then(res => this.itemRepository.save(res));
    } else if(cart && data.admin && data.cart) {
      client.broadcast.to(String(customerId)).emit('synchronize', data.cart.items);
      return;
    } else if (cart && data.items) {
      let cartItems = await this.itemRepository.findBy({ cart_id: cart.id });

      const promises = data.items.map(async (item: any) => {
        const cartItem = cartItems.find((cartItem: Item) => Number(cartItem.variant_id) === Number(item.id));

        console.log('price', item.price, this.formatPrice(item.price));

        if (!cartItem) {
          const expireTime = this.countExpireDate(new Date(), customer.priority, JSON.parse(shop.priorities));

          await this.itemRepository.save({
            variant_id: item.id,
            variant_title: item.variant_title,
            product_id: item.product_id,
            qty: item.quantity,
            expire_at: expireTime,
            cart_id: cart?.id,
            price: this.formatPrice(item.price),
            title: item.title,
            image_link: item.image,
          });

          return;
        } else {
          cartItem.qty = item.quantity;
          cartItem.price = this.formatPrice(item.price);
          cartItem.title = item.title;
          cartItem.image_link = item.image;

          await this.itemRepository.save(cartItem);
        }

        cartItems = cartItems.filter((item: Item) => item.id !== cartItem.id);

        return;
      });

      await Promise.all(promises);

      await this.itemRepository.remove(cartItems);
    } else if (data.form_type = 'product') {
      const cartItem = await this.itemRepository.findOneBy({
        cart_id: cart.id,
        variant_id: Number(data.id)
      });

      if (cartItem) {
        cartItem.qty = Number(cartItem.qty) + Number(data.quantity);

        await this.itemRepository.save(cartItem);
      } else {
        const expireTime = this.countExpireDate(new Date(), customer.priority, JSON.parse(shop.priorities));

        await this.itemRepository.save({
          variant_id: Number(data.id),
          product_id: Number(data['product-id']),
          qty: Number(data.quantity),
          expire_at: expireTime,
          cart_id: cart.id,
          variant_title: data.variants.find((variant: any) => variant.id === Number(data.id)).title,
          price: this.formatPrice(data.price),
          title: data.title,
          image_link: data.featured_image,
        });
      }
    }

    const items = await this.itemRepository.createQueryBuilder('item')
      .where('item.cart_id = :cart_id', { cart_id: cart.id })
      .orderBy('item.created_at', 'ASC')
      .getMany();

    cart.last_action = new Date();
    await this.cartRepository.save(cart);

    this.server.to(customerId).emit('synchronize', items);

    this.server.to('admin').emit('update');
  }

  @SubscribeMessage('update')
  async handleExpandTimers(@MessageBody() { customer: customerId, shop: shopId }: SyncProps,@ConnectedSocket() client: Socket) {
    const cartItems = await this.itemRepository.query(`
      SELECT * FROM items
      LEFT JOIN carts ON items.cart_id = carts.id
      LEFT JOIN CUSTOMERS ON carts.customer_id = customers.id
      WHERE customers.shopify_user_id = ${customerId}
    `)

    console.log(cartItems)

    client.emit('update', cartItems);
  }

  countExpireDate(startDate: Date, priority: string, priorities: any) {
    try {
      let reservationTime = 0;

      switch(true) {
        case priority === 'max':
          reservationTime = priorities.max_priority;
          break;
        case priority === 'high':
          reservationTime = priorities.high_priority;
          break;
        case priority === 'normal':
          reservationTime = priorities.normal_priority;
          break;
        case priority === 'low':
          reservationTime = priorities.low_priority;
          break;
        case priority === 'min':
          reservationTime = priorities.min_priority;
          break;
        default:
          reservationTime = 24;
          break;
      }

      const expandTime = 3600000 * reservationTime;

      return new Date(startDate.getTime() + expandTime);
    } catch(err) {
      console.log(err);
    }
  }

  async updateDeviceAnalytics(cart: Cart, os: string) {
    const shop_id = cart.shop_id;

    const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
        .where({ shop_id })
        .andWhere({ type: 'devices' })
        .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
        .andWhere({ date: LessThan(nextDay.toISOString())})
        .getOne()
        || await this.analyticsRepository.save({
          shop_id,
          type: 'devices', 
          value: JSON.stringify({ key: currentDate.toDateString(), value: {} }),
          date: currentDate.toISOString()
        });

      if (analytics) {
        const devices = JSON.parse(analytics.value);
        devices.value[os] = devices.value[os] ? devices.value[os] + 1 : 1;

        await this.analyticsRepository.createQueryBuilder('analytics')
          .update(Analytics)
          .set({ value: JSON.stringify(devices) })
          .where({ id: analytics.id })
          .execute()
      }
  }

  async updateLocationAnalytics(customer: Customer, shop: Shop) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0);

    const location = customer.location;

    const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
      .where({ shop_id: shop.id })
      .andWhere({ type: 'locations' })
      .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
      .andWhere({ date: LessThan(nextDay.toISOString())})
      .getOne();

    if (analytics) {
      const locations = JSON.parse(analytics.value);
      locations.value[location] = locations.value[location] ? locations.value[location] + 1 : 1;

      await this.analyticsRepository.createQueryBuilder('analytics')
        .update(Analytics)
        .set({ value: JSON.stringify(locations) })
        .where({ id: analytics.id })
        .execute()
    }
  }

  async updateConversionRate(shop_id: number, type: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0);

    const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
      .where({ shop_id })
      .andWhere({ type: 'conversion_rates' })
      .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
      .andWhere({ date: LessThan(nextDay.toISOString())})
      .getOne()
      || await this.analyticsRepository.save({
        shop_id, 
        type: 'conversion_rates',
        value: JSON.stringify({
          key: currentDate.toDateString(),
          value: [
            {
              key: 'Opens',
              value: 0
            }, 
            {
              key: 'Paid',
              value: 0 
            }
          ]
        }),
        date: currentDate.toISOString() });

    if (analytics) {
      const rate = JSON.parse(analytics.value);
      rate.value[type === 'add' ? 0: 1].value += 1;

      await this.analyticsRepository.createQueryBuilder('analytics')
        .update(Analytics)
        .set({ value: JSON.stringify(rate) })
        .where({ id: analytics.id })
        .execute()
    }
  }

  formatPrice(price: string | number) {
    const stringPrice = String(price);

    return stringPrice.includes('.')
      ? stringPrice
      : stringPrice.slice(0, -2) + '.' + stringPrice.slice(-2);
  }
}
