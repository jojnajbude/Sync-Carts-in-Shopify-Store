import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Shop } from "../shops/shop.entity.js";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class SubscribeService {
  constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>) {}

  async getSubscription(session: shopifySession) {
    try {
      const plan = await this.shopRepository.findOneBy({ domain: session.shop });

      return plan ? plan : false;
    } catch(err) {
      console.log(err);
    }
  }

  async createRecurringApplicationCharge(session: shopifySession, plan: string) {
    try {
      let plan_config = null;

      switch (plan) {
        case 'Starter':
          plan_config = {
            name: 'Starter plan',
            price: 30.0,
          }
          break;

        case 'Growth':
          plan_config = {
            name: 'Growth plan',
            price: 60.0,
          }
          break;

        case 'Pro':
          plan_config = {
            name: 'Pro plan',
            price: 100.0,
          }
          break;
      }

      if (plan_config) {
        const recurring_application_charge = new shopify.api.rest.RecurringApplicationCharge({session: session});
        recurring_application_charge.name = plan_config.name;
        recurring_application_charge.price = plan_config.price;
        recurring_application_charge.return_url = `https://${session.shop}/admin/apps/better-carts-1/subscribe`;
        recurring_application_charge.test = null;
        await recurring_application_charge.save({
          update: true,
        });

        return recurring_application_charge;
      }
    } catch(err) {
      console.log(err);
    }
  }

  async setFreePlan(session: shopifySession) {
    try {
      const shop = await this.shopRepository.findOneBy({ domain: session.shop });

      if (shop?.plan !== 'Free') {
        const cancelledPlan = await shopify.api.rest.RecurringApplicationCharge.delete({
          session,
          id: shop?.charge_id,
        });

        const freePlan = await this.shopRepository.update({ domain: session.shop }, { plan: 'Free', limit: 25, charge_id: 0, status: 'active' });

        return freePlan ? true : false;
      }
    } catch(err) {
      console.log(err);
    }
  }

  async activatePlan(session: shopifySession, charge_id: string) {
    try {
      const plan = await shopify.api.rest.RecurringApplicationCharge.find({
        session,
        id: charge_id,
      });
  
      if (plan.status === 'active') {
        let plan_config = null;
  
        switch (plan.name) {
          case 'Starter plan':
            plan_config = {
              name: 'Starter',
              limit: 500,
            }
            break;
  
          case 'Growth plan':
            plan_config = {
              name: 'Growth',
              limit: 1000,
            }
            break;
  
          case 'Pro plan':
            plan_config = {
              name: 'Pro',
              limit: 3000,
            }
            break;
        }
  
        if (plan_config) {
          const activatePlan = await this.shopRepository.update({ domain: session.shop }, { plan: plan_config.name, limit: plan_config.limit, charge_id: Number(charge_id), status: 'active' })
  
          return activatePlan ? plan_config : false;
        }      
      }
  
      return false
    } catch(err) {
      console.log(err);
    }
  }

  async cancelPlan(session: shopifySession) {
    try {
      const shopData = await this.shopRepository.findOneBy({ domain: session.shop });
      
      if (shopData) {
        const cancelSubscribe = await shopify.api.rest.RecurringApplicationCharge.delete({
          session,
          id: shopData.charge_id,
        })

        await this.shopRepository.update({ id: shopData.id }, { status: 'cancelled' })

        return cancelSubscribe;
      }
    } catch(err) {
      console.log(err);
    }

    return false;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async refreshSubscribes() {
    try {
      await this.shopRepository.update({}, { carts: 0 })
      const shops = await this.shopRepository.findBy({ status: 'cancelled' });

      if (shops.length) {
        const ids = shops.map(shop => shop.id);

        await this.shopRepository.update({ id: In(ids) }, { plan: 'Free', status: 'active' })
      }
    } catch (err) {
      console.log(err);
    }
  }
}
