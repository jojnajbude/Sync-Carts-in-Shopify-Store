import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../carts/cart.entity.js";
import { Customer } from "../customers/customer.entity.js";
import { Item } from "../items/item.entity.js";
import { Shop } from "../shops/shop.entity.js";
import { Analytics } from "./analytics.entity.js";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Shop) private shopsRepository: Repository<Shop>, 
    @InjectRepository(Customer) private customerRepository: Repository<Customer>, 
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>
  ) {}

  async getAnalytics(domain: string) {
    const [analytics] = await this.analyticsRepository.query(
      `select analytics.* from analytics
      left join shops on shops.id = analytics.shop_id
      where shops.domain = '${domain}'`
    )

    analytics.locations = JSON.parse(analytics.locations);
    analytics.total_sales = JSON.parse(analytics.total_sales);

    return analytics ? analytics : false;
  }

  async getLocationsStatistic(domain: string) {
    const shop = await this.shopsRepository.findOneBy({ domain });
    if (shop) {
      const statistic = await this.customerRepository.query(
        `select customers.location, COUNT(customers.location)
        from customers
        left join carts
        on carts.customer_id = customers.id
        where carts.shop_id = ${shop?.id}
        group by location
        order by count DESC`
      );
  
      if (!statistic.length) {
        return false;
      }
  
      const result: any = {
        name: 'Country',
        data: [],
      };
  
      for (const country of statistic) {
        result.data.push({
          key: country.location,
          value: Number(country.count),
        })
      };
  
      const locations = await this.analyticsRepository.update({ shop_id: shop?.id }, { locations: JSON.stringify([result])})
    }
    
  }

  async getTotalSales(domain: string) {
    const sales = await this.itemRepository.query(
      `select date_trunc('day', carts.closed_at) as day, SUM(items.qty) as sales
      from items
      left join carts on carts.id = items.cart_id
      left join shops on shops.id = carts.shop_id
      where 
        items.status = 'paid' 
        AND shops.domain = '${domain}'
        AND date_trunc('month', carts.closed_at) = date_trunc('month', NOW())
      group by day`
    )

    console.log(sales);

    if (!sales.length) {
      return false;
    }

    const result: any = {
      name: 'Sales',
      data: [],
    };

    for (const point of sales) {
      const date = this.getDate(point.day);
      console.log(date);

      result.data.push({
        key: date,
        value: Number(point.sales),
      })
    };

    const shop = await this.shopsRepository.findOneBy({ domain });

    const totalSales = await this.analyticsRepository.update({ shop_id: shop?.id }, { total_sales: JSON.stringify([result])})
  }

  getDate(date: Date) {
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();
  
    return [
      date.getFullYear(),
        (month>9 ? '' : '0') + month,
        (day>9 ? '' : '0') + day
    ].join('-');
  } 
}