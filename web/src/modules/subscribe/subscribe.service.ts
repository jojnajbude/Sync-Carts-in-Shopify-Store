import { Injectable } from "@nestjs/common";
import shopify from "../../utils/shopify.js";
import { shopifySession } from "../../types/session.js";

@Injectable()
export class SubscribeService {
  async createRecurringApplicationCharge(session: shopifySession) {
    const recurring_application_charge = new shopify.api.rest.RecurringApplicationCharge({session: session});
    recurring_application_charge.name = 'Starter plan';
    recurring_application_charge.price = 10.0;
    recurring_application_charge.capped_amount = 100;
    recurring_application_charge.terms = '$1 for 100 carts'
    recurring_application_charge.return_url = `https://${session.shop}/admin/apps/better-carts/subscribe`;
    recurring_application_charge.test = true;
    await recurring_application_charge.save({
      update: true,
    });

    return recurring_application_charge;
  }

  async createUsageCharge(session: shopifySession, charge_id: number) {
    const usage_charge = new shopify.api.rest.UsageCharge({session: session});
    usage_charge.recurring_application_charge_id = charge_id;
    usage_charge.description = "100 carts plan";
    usage_charge.price = 10.0;
    await usage_charge.save({
      update: true,
    });

    console.log(usage_charge)
  }
}
