import { Button, Layout, LegacyCard, Page } from '@shopify/polaris';
import { useNavigate } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from '../hooks';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BillingCard } from '../components/BillingCard';

export default function Subscribe() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const search = useLocation().search;
  const charge_id = new URLSearchParams(search).get('charge_id');

  const checkCharge = async () => {
    if (charge_id) {
      console.log('here');
      const usageCharge = await fetch(
        `/api/subscribe/usage_charge?charge_id=${charge_id}`,
      );
    }
  };

  useEffect(() => {
    checkCharge();
  });

  const testSubscribe = async () => {
    const createSubscribe = await fetch('/api/subscribe');

    if (createSubscribe.ok) {
      const subscribe = await createSubscribe.json();

      console.log(subscribe.confirmation_url);
      navigate(subscribe.confirmation_url);
    }
  };

  return (
    <Page title="Subscribe">
      <Layout>
        <Layout.Section oneThird>
          <BillingCard
            title="Starter plan"
            description="Pick a plan"
            onClick={() => {
              testSubscribe();
            }}
          />
        </Layout.Section>
        <Layout.Section oneThird>
          <BillingCard
            title="Advanced plan"
            description="Pick a plan"
            onClick={() => {
              testSubscribe();
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
