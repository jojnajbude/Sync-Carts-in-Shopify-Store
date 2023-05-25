import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Analytics } from './src/modules/analytics/analytics.entity.js';
import { Cart } from './src/modules/carts/cart.entity.js';
import { Customer } from './src/modules/customers/customer.entity.js';
import { Item } from './src/modules/items/item.entity.js';
import { Shop } from './src/modules/shops/shop.entity.js';
import { migrations1685025094041 } from './migrations/1685025094041-migrations.js';
 
config();
 
const configService = new ConfigService();
 
export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: [Shop, Item, Customer, Cart, Analytics],
  migrations: [migrations1685025094041],
  ssl: {
    ca: configService.get('SSL_CERT'),
  }
});