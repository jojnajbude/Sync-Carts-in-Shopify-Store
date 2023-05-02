import { Injectable } from "@nestjs/common";
// @ts-ignore
import ElasticEmail from '@elasticemail/elasticemail-client'; 
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shop } from "../shops/shop.entity.js";

const client = ElasticEmail.ApiClient.instance;
const apikey = client.authentications['apikey'];
apikey.apiKey = "042A1A09D17EA1C97B294AB78AC142952799232D03C0CD7717B010F9A92D7E2BB417A673BC95131FEDC4DE8DCF8FB5C2";
const emailsApi = new ElasticEmail.EmailsApi();

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>) {}

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

  async sendEmail(type: string, shop: any, cart: any, customer: any) {
    const content = this.handleContent(type, shop)

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
    })(type)

    const emailData = {
      Recipients: {
        To: [customer.email]
      },
      Content: {
        Body: [
          {
            ContentType: "HTML",
            Charset: "utf-8",
            Content: content
          },
        ],
        From: "demigod177712@gmail.com",
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

  async sendMultipleEmails(ids: number[], type: 'carts' | 'items') {

  }

  handleContent(type: string, shop: any) {
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
}
