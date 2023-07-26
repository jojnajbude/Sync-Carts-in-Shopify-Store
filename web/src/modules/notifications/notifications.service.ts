import { Injectable } from "@nestjs/common";
// @ts-ignore
import ElasticEmail from '@elasticemail/elasticemail-client'; 
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shop } from "../shops/shop.entity.js";
import { Item } from "../items/item.entity.js";

import { config } from 'dotenv';
config();

const client = ElasticEmail.ApiClient.instance;
const apikey = client.authentications['apikey'];
apikey.apiKey = process.env.ELASTIC_TOKEN;
const emailsApi = new ElasticEmail.EmailsApi();

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    ) {}

  async getTemplate(domain: string, name: string) {
    try {
      const shopData = await this.shopRepository.findOneBy({ domain });

      switch (name) {
        case 'reminder':
          return shopData?.cart_reminder_json

        case 'update':
          return shopData?.cart_updated_json

        case 'soon':
          return shopData?.expiring_soon_json

        case 'expired':
          return shopData?.expired_items_json
      }
    } catch (err) {
      return false;
    }
  }

  async saveTemplate(domain: string, name: string, design: any, html: string) {
    try {
      const template_json = JSON.stringify(design);

      switch (name) {
        case 'reminder':
          await this.shopRepository.update({ domain }, { cart_reminder_json: template_json, cart_reminder_html: html });
          break;

        case 'update':
          await this.shopRepository.update({ domain }, { cart_updated_json: template_json, cart_updated_html: html });
          break;

        case 'soon':
          await this.shopRepository.update({ domain }, { expiring_soon_json: template_json, expiring_soon_html: html });
          break;

        case 'expired':
          await this.shopRepository.update({ domain }, { expired_items_json: template_json, expired_items_html: html });
          break;
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  async sendEmail(type: string, shop: any, emails: string[]) {
    const content = await this.handleContent(type, shop)

    const subject = ((type: string) => {
      switch (type) {
        case 'reminder':
          return 'Your shopping cart reminder'

        case 'update':
          return 'Your cart was updated'

        case 'soon':
          return 'Items in your cart will expire soon'

        case 'expired':
          return 'The items in your cart have expired'
      }
    })(type);

    let from = shop.email_domain ? shop.email_domain : "YourCart@smartcartsapp.com";

    if (shop.email_from_name) {
      from = `${shop.email_from_name} <${from}>`
    }

    const emailData = {
      Recipients: {
        To: emails
      },
      Content: {
        Body: [
          {
            ContentType: "HTML",
            Charset: "utf-8",
            Content: content
          },
        ],
        From: from,
        Subject: subject
      }
    }

    const callback = (error: any, data: any, response: any) => {
      if (error) {
          console.error(error);
      } else {
          console.log('API called successfully.');
          console.log('Email sent.');
      }
    };

    emailsApi.emailsTransactionalPost(emailData, callback);
  }

  async sendMultipleEmails(ids: number[], dataType: 'carts' | 'items', emailType: string) {
    let emailsData = null;

    switch (dataType) {
      case 'items':
        emailsData = await this.itemRepository.query(
          `select customers.email as customer_email, shops.*
          from items
          left join carts on carts.id = items.cart_id
          left join customers on customers.id = carts.customer_id
          left join shops on shops.id = carts.shop_id
          where items.id IN (${ids})`
        )
        break;

      case 'carts':
        emailsData = await this.itemRepository.query(
          `select customers.email as customer_email, shops.*
          from carts
          left join customers on customers.id = carts.customer_id
          left join shops on shops.id = carts.shop_id
          where carts.id IN (${ids})`
        )
        break;
    }

    const sendedEmails: string[] = [];

    for (const data of emailsData) {
      if (!sendedEmails.includes(data.customer_email)) {
        const shop = { 
          cart_reminder_html: data.cart_reminder_html,
          cart_updated_html: data.cart_updated_html,
          expiring_soon_html: data.expiring_soon_html,
          expired_items_html: data.expired_items_html,
          domain: data.domain,
          email: data.email,
          email_from_name: data.email_from_name,
        }

        const emails = [data.customer_email];

        sendedEmails.push(data.customer_email);
        this.sendEmail(emailType, shop, emails)
      }
    }
  }

  async handleContent(type: string, shop: any) {
    let template = null;

    switch (type) {
      case 'reminder':
        template = shop.cart_reminder_html
        break;

      case 'update':
        template = shop.cart_updated_html
        break;

      case 'soon':
        template = shop.expiring_soon_html
        break;

      case 'expired':
        template = shop.expired_items_html
        break;
    }
    
    template = template.replace('{{link}}', `https://${shop.domain}/cart`);
    template = template.replace('{{shop_email}}', `${shop.email}`);

    return template;
  }

  async addNewDomain(domain: string, shop: string) {
    const newDomain = await fetch(`https://api.elasticemail.com/v2/domain/add?apikey=${process.env.ELASTIC_TOKEN}&domain=${domain}`);
    const response = await newDomain.json()
    
    if (response.success) {
      await this.shopRepository.update({ domain: shop }, { email_domain: domain });
    }

    return response
  }

  async verifyDomain(domain: string, shop: string) {
    const verifySpf = await fetch(`https://api.elasticemail.com/v2/domain/verifyspf?apikey=${process.env.ELASTIC_TOKEN}&domain=${domain}`);
    const spfStatus = await verifySpf.json();

    const verifyDkim = await fetch(`https://api.elasticemail.com/v2/domain/verifydkim?apikey=${process.env.ELASTIC_TOKEN}&domain=${domain}`)
    const dkimStatus = await verifyDkim.json();

    if (spfStatus.success && dkimStatus.success) {
      await this.shopRepository.update({ domain: shop }, { domain_verified: JSON.stringify({ spfStatus: true, dkimStatus: true }) });
    }

    return { spfStatus: spfStatus.success, dkimStatus: dkimStatus.success }
  }
}
