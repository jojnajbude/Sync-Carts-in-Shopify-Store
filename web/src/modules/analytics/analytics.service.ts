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
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>,
  ) {
    // this.createNewDayEntities(61)
    this.updateLocations(61, 'Ukraine')
  }

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
      // { shop_id: id, type: 'sales', value: JSON.stringify({ key: today.toDateString(), value: 0 }), date: today.toISOString() },
      // { shop_id: id, type: 'drop_rate', value: JSON.stringify({ key: yesterday.toDateString(), value: await this.countDropRate(id) }), date: yesterday.toISOString() },
      // { shop_id: id, type: 'average_open_time', value: JSON.stringify({ key: yesterday.toDateString(), value: await this.countAverageOpenTime(id) }), date: yesterday.toISOString() },
      // { shop_id: id, type: 'average_carts_price', value: JSON.stringify({ key: yesterday.toDateString(), value: await this.countAverageCartsPrice(id) }), date: yesterday.toISOString() },
      // { shop_id: id, type: 'conversion_rates', value: JSON.stringify({ key: today.toDateString(), value: [{ key: 'Opens', value: 0 }, { key: 'Paid', value: 0 }] }), date: today.toISOString() },
      { shop_id: id, type: 'locations', value: JSON.stringify({ key: today.toDateString(), value: {} }), date: today.toISOString() },
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
    } catch (error) {
      console.log(error);
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

    console.log(carts);

    const totalCartsPrice = carts.reduce((acc: number, cart: any) => {
      return acc + Number(cart.final_price);
    }, 0);

    console.log(totalCartsPrice)

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

  // async getAnalytics(domain: string) {
  //   const [analytics] = await this.analyticsRepository.query(
  //     `select analytics.* from analytics
  //     left join shops on shops.id = analytics.shop_id
  //     where shops.domain = '${domain}'`
  //   )

  //   if (analytics) {
  //     analytics.locations = JSON.parse(analytics.locations);
  //     analytics.total_sales = JSON.parse(analytics.total_sales);
  //     analytics.average_open_time = JSON.parse(analytics.average_open_time);
  //     analytics.average_price = JSON.parse(analytics.average_price);
  //     analytics.conversion_rates = JSON.parse(analytics.conversion_rates);
  //     analytics.device_statistic = JSON.parse(analytics.device_statistic);
  //     analytics.top_sold = JSON.parse(analytics.top_sold);
  //     analytics.top_abandoned = JSON.parse(analytics.top_abandoned);
  //     analytics.top_abandoned_customers = JSON.parse(analytics.top_abandoned_customers);

  //     return analytics;
  //   }

  //   return false;
  // }

  // async getLocationsStatistic(domain: string) {
  //   const shop = await this.shopsRepository.findOneBy({ domain });
  //   if (shop) {
  //     const statistic = await this.customerRepository.query(
  //       `select customers.location, COUNT(customers.location)
  //       from customers
  //       left join carts
  //       on carts.customer_id = customers.id
  //       where carts.shop_id = ${shop?.id}
  //       group by location
  //       order by count DESC`
  //     );
  
  //     if (!statistic.length) {
  //       return false;
  //     }
  
  //     const result: any = {
  //       name: 'Country',
  //       data: [],
  //     };
  
  //     for (const country of statistic) {
  //       result.data.push({
  //         key: country.location,
  //         value: Number(country.count),
  //       })
  //     };
  
  //     const locations = await this.analyticsRepository.update({ shop_id: shop?.id }, { locations: JSON.stringify([result])})
  //   }
    
  // }

  // async getTotalSales(domain: string) {
  //   const sales = await this.itemRepository.query(
  //     `select date_trunc('day', carts.closed_at) as day, SUM(items.qty) as sales
  //     from items
  //     left join carts on carts.id = items.cart_id
  //     left join shops on shops.id = carts.shop_id
  //     where 
  //       items.status = 'paid' 
  //       AND shops.domain = '${domain}'
  //       AND date_trunc('month', carts.closed_at) = date_trunc('month', NOW())
  //     group by day`
  //   )

  //   const result: any = {
  //     name: 'Sales',
  //     data: [],
  //   };

  //   for (const point of sales) {
  //     const date = this.getDate(point.day);

  //     result.data.push({
  //       key: date,
  //       value: Number(point.sales),
  //     })
  //   };

  //   const shop = await this.shopsRepository.findOneBy({ domain });

  //   const totalSales = await this.analyticsRepository.update({ shop_id: shop?.id }, { total_sales: JSON.stringify([result])})
  // }

  // getDate(date: Date) {
  //   const month = date.getMonth() + 1; // getMonth() is zero-based
  //   const day = date.getDate();
  
  //   return [
  //     date.getFullYear(),
  //       (month>9 ? '' : '0') + month,
  //       (day>9 ? '' : '0') + day
  //   ].join('-');
  // } 

  // async getAverageOpenTime(domain: string) {
  //   const shopCarts = await this.cartRepository.query(
  //     `SELECT *
  //     FROM carts
  //     LEFT JOIN shops ON shops.id = carts.shop_id
  //     WHERE shops.domain = '${domain}'
  //       AND EXTRACT(YEAR FROM carts.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  //       AND carts.closed_at IS NOT NULL`
  //   );

  //   if (!shopCarts) {
  //     return false;
  //   }

  //   const statistic = this.calculateAverageCartTime(shopCarts)

  //   const result = {
  //     name: 'Time',
  //     data: statistic
  //   }

  //   const shop = await this.shopsRepository.findOneBy({ domain });

  //   const averageOpenTime = await this.analyticsRepository.update({ shop_id: shop?.id }, { average_open_time: JSON.stringify([result])})
  // }

  // calculateAverageCartTime(carts: any) {
  //   const monthlyStats: any = {};

  //   carts.forEach((cart: { created_at: string | number | Date; closed_at: string | number | Date; }) => {
  //     const createdAt = new Date(cart.created_at);
  //     const closedAt = new Date(cart.closed_at);

  //     const key = `${createdAt.getFullYear()}-${String(
  //       createdAt.getMonth() + 1
  //     ).padStart(2, "0")}`;

  //     if (!monthlyStats[key]) {
  //       monthlyStats[key] = {
  //         totalTime: 0,
  //         count: 0,
  //       };
  //     }

  //     const diff = closedAt.getTime() - createdAt.getTime();

  //     monthlyStats[key].count++;
  //     monthlyStats[key].totalTime += diff;
  //   });

  //   const data = Object.keys(monthlyStats).map((key) => {
  //     const avgTimeInMinutes = monthlyStats[key].totalTime / monthlyStats[key].count / 1000 / 60;
  //     const value = `${Math.floor(avgTimeInMinutes).toString()}`;
  //     return { key: key, value: value };
  //   });

  //   const result = this.addMissingMonths(data);

  //   return result;
  // }

  // addMissingMonths(data: any) {
  //   const result: any = {};

  //   for (let i = 0; i <= new Date().getMonth(); i++) {
  //     const month = String(i + 1).padStart(2, '0');
  //     result[`2023-${month}`] = { key: `2023-${month}`, value: '0' };
  //   }

  //   for (const item of data) {
  //     result[item.key] = item;
  //   }

  //   return Object.values(result);
  // }
  
  // async getAverageCartPrice(domain: string) {
  //   const cartsPrices = await this.cartRepository.query(
  //     `SELECT carts.closed_at, carts.final_price FROM carts
  //     LEFT JOIN shops ON shops.id = carts.shop_id
  //     WHERE shops.domain = '${domain}' AND carts.closed_at IS NOT NULL`
  //   )

  //   if (cartsPrices.length) {
  //     const currentDate = new Date();
  //     const startDate = new Date(cartsPrices[0].closed_at);
  //     const startYear = startDate.getFullYear();
  //     const startMonth = startDate.getMonth();
  //     const endYear = currentDate.getFullYear();
  //     const endMonth = currentDate.getMonth();
  //     const monthlyPrices: any = {};
    
  //     for (let year = startYear; year <= endYear; year++) {
  //       const monthStart = year === startYear ? startMonth : 0;
  //       const monthEnd = year === endYear ? endMonth : 11;
    
  //       for (let month = monthStart; month <= monthEnd; month++) {
  //         const key = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  //         const pricesInMonth = cartsPrices.filter((item: { closed_at: string | number | Date; }) => {
  //           const itemDate = new Date(item.closed_at);
  //           return itemDate.getFullYear() === year && itemDate.getMonth() === month;
  //         }).map((item: { final_price: string; }) => parseFloat(item.final_price));
    
  //         const averagePrice = pricesInMonth.length > 0 ? (pricesInMonth.reduce((sum: any, price: any) => sum + price, 0) / pricesInMonth.length).toFixed(2) : '0';
    
  //         monthlyPrices[key] = averagePrice;
  //       }
  //     }
    
  //     const data = Object.entries(monthlyPrices).map(([key, value]) => ({ key, value }));
  //     const statistic = this.addMissingMonths(data)

  //     const result = {
  //       name: 'Time',
  //       data: statistic
  //     }

  //     const shop = await this.shopsRepository.findOneBy({ domain });

  //     const averageCartsPrice = await this.analyticsRepository.update({ shop_id: shop?.id }, { average_price: JSON.stringify([result])})
  //   } else {
  //     const result = {
  //       name: 'Time',
  //       data: []
  //     }

  //     const shop = await this.shopsRepository.findOneBy({ domain });

  //     const averageCartsPrice = await this.analyticsRepository.update({ shop_id: shop?.id }, { average_price: JSON.stringify([result])})
  //   }
  // }

  // async getConversionRates(domain: string) {
  //   const shopCarts = await this.cartRepository.query(
  //     `select carts.closed_at from carts
  //     left join shops on shops.id = carts.shop_id
  //     where shops.domain = '${domain}'`
  //   )

  //   const statistic = [
  //     {
  //       value: 0,
  //       key: 'Opened carts',
  //     },
  //     {
  //       value: 0,
  //       key: 'Carts paid',
  //     },
  //   ];

  //   for (const cart of shopCarts) {
  //     if (cart.closed_at !== null) {
  //       statistic[1].value += 1;
  //     }

  //     statistic[0].value += 1;
  //   }

  //   const result = {
  //     name: 'Conversion',
  //     data: statistic
  //   }

  //   const shop = await this.shopsRepository.findOneBy({ domain });

  //   const conversionRate = await this.analyticsRepository.update({ shop_id: shop?.id }, { conversion_rates: JSON.stringify([result])})
  // }

  // async getDeviceStatistic(domain: string) {
  //   const devicesCount = await this.customerRepository.query(
  //     `select customers.os as key, count(*) as value from customers
  //     left join shops on shops.id = customers.shop_id
  //     where shops.domain = '${domain}'
  //     group by customers.os`
  //   )

  //   const result = [];

  //   for (const device of devicesCount) {
  //     result.push({
  //       data: [device],
  //       name: device.key,
  //     })
  //   }

  //   const shop = await this.shopsRepository.findOneBy({ domain });
  //   const deviceStatistic = await this.analyticsRepository.update({ shop_id: shop?.id }, { device_statistic: JSON.stringify(result)});
  // }

  // async getTopSoldProducts(domain: string) {
  //   const topSoldProducts = await this.itemRepository.query(
  //     `select items.title, items.product_id, SUM(items.qty) as sold, shops.domain from items
  //     left join carts on carts.id = items.cart_id
  //     left join shops on shops.id = carts.shop_id
  //     where items.status = 'paid' AND shops.domain = '${domain}'
  //     group by items.title, items.product_id, shops.domain
  //     order by sold desc
  //     limit 10`
  //   )
  //   const shop = await this.shopsRepository.findOneBy({ domain });
  //   const top_sold = await this.analyticsRepository.update({ shop_id: shop?.id }, { top_sold: JSON.stringify(topSoldProducts)});
  // }

  // async getTopAbandonedProducts(domain: string) {
  //   const topAbandonedProducts = await this.itemRepository.query(
  //     `select items.title, items.product_id, SUM(items.qty) as sold, shops.domain from items
  //     left join carts on carts.id = items.cart_id
  //     left join shops on shops.id = carts.shop_id
  //     where items.status = 'expired' AND shops.domain = '${domain}'
  //     group by items.title, items.product_id, shops.domain
  //     order by sold desc
  //     limit 10`
  //   )
  //   const shop = await this.shopsRepository.findOneBy({ domain });
  //   const top_abandoned = await this.analyticsRepository.update({ shop_id: shop?.id }, { top_abandoned: JSON.stringify(topAbandonedProducts)});
  // }

  // async getTopAbandonedCustomers(domain: string) {
  //   const topAbandonedCustomers = await this.itemRepository.query(
  //     `select customers.name, customers.shopify_user_id, shops.domain, SUM(items.qty) as sold
  //     from items
  //     left join carts on carts.id = items.cart_id
  //     left join customers on customers.id = carts.customer_id
  //     left join shops on shops.id = carts.shop_id
  //     where items.status = 'expired' AND shops.domain = '${domain}'
  //     group by customers.name, customers.shopify_user_id, shops.domain
  //     order by sold desc
  //     limit 10`
  //   )
  //   const shop = await this.shopsRepository.findOneBy({ domain });
  //   const top_abandoned_customers = await this.analyticsRepository.update({ shop_id: shop?.id }, { top_abandoned_customers: JSON.stringify(topAbandonedCustomers)});
  // }

  // @Cron(CronExpression.EVERY_MINUTE) 
  // async updateAnalytics() {
  //   const shops = await this.shopsRepository.query(`select * from shops`);

  //   for (const shop of shops) {
  //     await this.getLocationsStatistic(shop.domain);
  //     await this.getTotalSales(shop.domain);
  //     await this.getAverageOpenTime(shop.domain);
  //     await this.getAverageCartPrice(shop.domain);
  //     await this.getConversionRates(shop.domain);
  //     await this.getDeviceStatistic(shop.domain);
  //     await this.getTopSoldProducts(shop.domain);
  //     await this.getTopAbandonedProducts(shop.domain);
  //     await this.getTopAbandonedCustomers(shop.domain);
  //   }
  // }
}