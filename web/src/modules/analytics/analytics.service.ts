import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThanOrEqual, Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Item } from "../items/item.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { Analytics } from "./analytics.entity.js";

interface IAnalytics {
  sales: { name: string, data: object[] }[];
  drop_rate: { name: string, data: object[] }[];
  average_open_time: { name: string, data: object[] }[];
  average_carts_price: { name: string, data: object[] }[];
  conversion_rates: { name: string, data: object[] }[];
  locations: { name: string, data: object[] }[];
  devices: { name: string, data: object[] }[];
  top_sold: { name: string, data: object[] }[];
  top_abandoned_products: { name: string, data: object[] }[];
  top_abandoned_customers: { name: string, data: object[] }[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async updateData() {
    const shops = await this.shopsRepository.query(`select * from shops`);

    for (const shop of shops) {
      this.createNewDayEntities(shop.id)
    }
  }

  async createNewDayEntities(id: number) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const templates = [
      { shop_id: id, type: 'sales', value: JSON.stringify({ key: today.toDateString(), value: 0 }), date: today.toISOString() },
      { shop_id: id, type: 'drop_rate', value: JSON.stringify({ key: yesterday.toDateString(), value: await this.countDropRate(id) }), date: yesterday.toISOString() },
      { shop_id: id, type: 'average_open_time', value: JSON.stringify({ key: yesterday.toDateString(), value: await this.countAverageOpenTime(id) }), date: yesterday.toISOString() },
      { shop_id: id, type: 'average_carts_price', value: JSON.stringify({ key: yesterday.toDateString(), value: await this.countAverageCartsPrice(id) }), date: yesterday.toISOString() },
      { shop_id: id, type: 'conversion_rates', value: JSON.stringify({ key: today.toDateString(), value: [{ key: 'Opens', value: 0 }, { key: 'Paid', value: 0 }] }), date: today.toISOString() },
      { shop_id: id, type: 'locations', value: JSON.stringify({ key: today.toDateString(), value: {} }), date: today.toISOString() },
      { shop_id: id, type: 'devices', value: JSON.stringify({ key: today.toDateString(), value: {} }), date: today.toISOString() },
      { shop_id: id, type: 'top_sold', value: JSON.stringify({ key: today.toDateString(), value: [] }), date: today.toISOString() },
      { shop_id: id, type: 'top_abandoned_products', value: JSON.stringify({ key: today.toDateString(), value: [] }), date: today.toISOString() },
      { shop_id: id, type: 'top_abandoned_customers', value: JSON.stringify({ key: today.toDateString(), value: [] }), date: today.toISOString() },
    ];

    await this.analyticsRepository
      .createQueryBuilder()
      .insert()
      .into(Analytics)
      .values(templates)
      .execute()
  }

  async getAnalytics(domain: string, body: any) {
    const startDate = new Date(body.start.split('T')[0])
    const endDate = new Date(body.end.split('T')[0])
    endDate.setDate(endDate.getDate() + 1)

    const data = await this.analyticsRepository.query(
      `select analytics.*, shops.domain
      from analytics
      left join shops on shops.id = analytics.shop_id
      where domain = '${domain}'
      AND date between timestamp '${startDate.toISOString().slice(0, -1)}' AND timestamp '${endDate.toISOString().slice(0, -1)}'`
    );

    const analytics: IAnalytics = {
      sales: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      drop_rate: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      average_open_time: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      average_carts_price: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      conversion_rates: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      locations: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      devices: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      top_sold: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      top_abandoned_products: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
      top_abandoned_customers: [
        {
          name: `${startDate.toDateString()} - ${endDate.toDateString()}`,
          data: []
        }
      ],
    };

    for (const analysis of data) {
      switch(analysis.type) {
        case 'sales':
          analytics.sales[0].data.push(JSON.parse(analysis.value))
          break;

        case 'drop_rate':
          analytics.drop_rate[0].data.push(JSON.parse(analysis.value))
          break;
        
        case 'average_open_time':
          analytics.average_open_time[0].data.push(JSON.parse(analysis.value))
          break;

        case 'average_carts_price':
          analytics.average_carts_price[0].data.push(JSON.parse(analysis.value))
          break;

        case 'conversion_rates':
          analytics.conversion_rates[0].data.push(JSON.parse(analysis.value))
          break;

        case 'locations':
          analytics.locations[0].data.push(JSON.parse(analysis.value))
          break;

        case 'devices':
          analytics.devices[0].data.push(JSON.parse(analysis.value))
          break;

        case 'top_sold':
          analytics.top_sold[0].data.push(JSON.parse(analysis.value))
          break;

        case 'top_abandoned_products':
          analytics.top_abandoned_products[0].data.push(JSON.parse(analysis.value))
          break;

        case 'top_abandoned_customers':
          analytics.top_abandoned_customers[0].data.push(JSON.parse(analysis.value));
          break;
      }
    }

    return analytics;
  }

  async addSale(shop_id: number, totalPrice: number) {
    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      nextDay.setHours(0, 0, 0, 0);

      const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
        .where({ shop_id })
        .andWhere({ type: 'sales' })
        .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
        .andWhere({ date: LessThan(nextDay.toISOString())})
        .getOne();

      if (analytics) {
        const sales = JSON.parse(analytics.value);
        sales.value += totalPrice;

        await this.analyticsRepository.createQueryBuilder('analytics')
          .update(Analytics)
          .set({ value: JSON.stringify(sales) })
          .where({ id: analytics.id })
          .execute()
      }
    } catch (err) {
      console.log(err);
    }
  }

  async countDropRate(shop_id: number) {
    const shopItems = await this.itemRepository.query(
      `select * from items
      left join carts on carts.id = items.cart_id
      where carts.shop_id = ${shop_id}
      AND items.expire_at between NOW() - INTERVAL '1 day' AND NOW()`
    );

    const droppedItems = shopItems.filter((item: any) => item.status === 'expired');

    if (!droppedItems.length) return 0;

    return (droppedItems.length / shopItems.length) * 100;
  }

  async countAverageOpenTime(shop_id: number) {
    const carts = await this.cartRepository.query(
      `select * from carts
      where shop_id = ${shop_id}
      AND closed_at between NOW() - INTERVAL '1 day' AND NOW()`
    );

    const totalOpenTime = carts.reduce((acc: number, cart: any) => {
      const openTime = new Date(cart.closed_at).getTime() - new Date(cart.created_at).getTime();
      return acc + openTime;
    }, 0);

    return Math.floor(totalOpenTime / carts.length);
  }

  async countAverageCartsPrice(shop_id: number) {
    const carts = await this.cartRepository.query(
      `select * from carts
      where shop_id = ${shop_id}
      AND carts.final_price IS NOT NULL
      AND carts.closed_at between NOW() - INTERVAL '1 day' AND NOW()`
    );

    const totalCartsPrice = carts.reduce((acc: number, cart: any) => {
      return acc + Number(cart.final_price);
    }, 0);

    return Math.floor(totalCartsPrice / carts.length);
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
      .getOne();

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

  async updateLocations(shop_id: number, location: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0);

    const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
      .where({ shop_id })
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

  async updateDevices(shop_id: number, device: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
      .where({ shop_id })
      .andWhere({ type: 'devices' })
      .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
      .andWhere({ date: LessThan(nextDay.toISOString())})
      .getOne();

    if (analytics) {
      const devices = JSON.parse(analytics.value);
      devices.value[device] = devices.value[device] ? devices.value[device] + 1 : 1;

      await this.analyticsRepository.createQueryBuilder('analytics')
        .update(Analytics)
        .set({ value: JSON.stringify(devices) })
        .where({ id: analytics.id })
        .execute()
    }
  }

  async updateTopSold(shop_id: number, paidItems: any[]) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
      .where({ shop_id })
      .andWhere({ type: 'top_sold' })
      .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
      .andWhere({ date: LessThan(nextDay.toISOString())})
      .getOne();

    if (analytics) {
      const sold_products = JSON.parse(analytics.value);

      for (const item of paidItems) {
        const product = sold_products.value.find((product: any) => product.product_id === item.product_id);

        if (product) {
          sold_products.value.find((product: any) => product.product_id === item.product_id).value += item.qty;
        } else {
          sold_products.value.push({ product_id: item.product_id, product_title: item.title, value: item.qty });
        }
      }

      await this.analyticsRepository.createQueryBuilder('analytics')
        .update(Analytics)
        .set({ value: JSON.stringify(sold_products) })
        .where({ id: analytics.id })
        .execute()
    }
  }

  async updateTopAbandonedProducts(expiredItems: any[]) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    for (const item of expiredItems) {
      const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
        .where({ shop_id: item.shop_id })
        .andWhere({ type: 'top_abandoned_products' })
        .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
        .andWhere({ date: LessThan(nextDay.toISOString())})
        .getOne();

      if (analytics) {
        const abandoned_products = JSON.parse(analytics.value);

        const product = abandoned_products.value.find((product: any) => product.product_id === item.product_id);

        if (product) {
          abandoned_products.value.find((product: any) => product.product_id === item.product_id).value += item.qty;
        } else {
          abandoned_products.value.push({ product_id: item.product_id, product_title: item.title, value: item.qty });

        await this.analyticsRepository.createQueryBuilder('analytics')
          .update(Analytics)
          .set({ value: JSON.stringify(abandoned_products) })
          .where({ id: analytics.id })
          .execute()
        }
      }
    }
  } 

  async updateTopAbandonedCustomers(expiredItems: any[]) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    for (const item of expiredItems) {
      const analytics = await this.analyticsRepository.createQueryBuilder('analytics')
        .where({ shop_id: item.shop_id })
        .andWhere({ type: 'top_abandoned_customers' })
        .andWhere({ date: MoreThanOrEqual(currentDate.toISOString())})
        .andWhere({ date: LessThan(nextDay.toISOString())})
        .getOne();

      if (analytics) {
        const abandoned_customers = JSON.parse(analytics.value);

        const customer = abandoned_customers.value.find((customer: any) => customer.customer_id === item.customer_id);

        if (customer) {
          abandoned_customers.value.find((customer: any) => customer.customer_id === item.customer_id).value += item.qty;
        } else {
          abandoned_customers.value.push({ shopify_user_id: item.shopify_user_id, customer_name: item.name, value: item.qty });

        await this.analyticsRepository.createQueryBuilder('analytics')
          .update(Analytics)
          .set({ value: JSON.stringify(abandoned_customers) })
          .where({ id: analytics.id })
          .execute()
        }
      }
    }
  }
}