import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shop } from "../shops/shop.entity.js";

@Injectable()
export class SubscribeService {
  constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>) {}

  async getSubscription(session: shopifySession) {
    const plan = await this.shopRepository.findOneBy({ domain: session.shop });

    return plan ? plan : false;
  }

  async createRecurringApplicationCharge(session: shopifySession, plan: string) {
    let plan_config = null;

    switch (plan) {
      case 'basic':
        plan_config = {
          name: 'Basic plan',
          price: 30.0,
        }
        break;

      case 'premium':
        plan_config = {
          name: 'Premium plan',
          price: 60.0,
        }
        break;

      case 'elite':
        plan_config = {
          name: 'Elite plan',
          price: 100.0,
        }
        break;
    }

    if (plan_config) {
      const recurring_application_charge = new shopify.api.rest.RecurringApplicationCharge({session: session});
      recurring_application_charge.name = plan_config.name;
      recurring_application_charge.price = plan_config.price;
      recurring_application_charge.return_url = `https://${session.shop}/admin/apps/better-carts/subscribe`;
      recurring_application_charge.test = true;
      await recurring_application_charge.save({
        update: true,
      });

      console.log(recurring_application_charge)

      return recurring_application_charge;
    }

    return false;
  }

  async activatePlan(session: shopifySession, charge_id: string) {
    console.log(session, charge_id)

    const plan = await shopify.api.rest.RecurringApplicationCharge.find({
      session,
      id: charge_id,
    });

    if (plan.status === 'active') {
      let plan_config = null;

      switch (plan.name) {
        case 'Basic plan':
          plan_config = {
            name: 'Basic',
            limit: 500,
          }
          break;

        case 'Premium plan':
          plan_config = {
            name: 'Premium',
            limit: 1000,
          }
          break;

        case 'Elite plan':
          plan_config = {
            name: 'Elite',
            limit: 2000,
          }
          break;
      }

      if (plan_config) {
        const activatePlan = await this.shopRepository.update({ domain: session.shop }, { plan: plan_config.name, limit: plan_config.limit, charge_id: Number(charge_id) })

        return activatePlan ? activatePlan : false;
      }      
    }

    return false
  }
}