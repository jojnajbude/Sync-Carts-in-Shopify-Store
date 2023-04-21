import { useEffect, useState } from 'react';
import { useAuthenticatedFetch, useNavigate } from '@shopify/app-bridge-react';
import {
  Page,
  Layout,
  FooterHelp,
  IndexTable,
  LegacyCard,
} from '@shopify/polaris';

import EmptyStateMarkup from '../components/EmptyStateMarkup';
import AreaChart from '../components/charts/AreaChart';
import ConversionChart from '../components/charts/ConversionChart';
import LinearChart from '../components/charts/LinearChart';
import CartBadge from '../components/CartBadge';
import LogActivity from '../components/LogActivity';
import { Cart } from '../types/cart';

type Status = 'Loading' | 'Error' | 'Success';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState<Status>('Loading');
  const [carts, setCarts] = useState(null);

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        const analyticsData = await fetch('/api/analytics');
        const lastCartsData = await fetch('/api/carts/last');

        if (analyticsData.ok && lastCartsData.ok) {
          const analytics = await analyticsData.json();
          const lastCarts = await lastCartsData.json();

          setAnalytics(analytics);
          setCarts(lastCarts);
          setStatus('Success');
          setIsLoading(false);
        } else {
          setStatus('Error');
        }
      };

      fetchData();
    }
  }, [isLoading]);

  const resourceName = {
    singular: 'cart',
    plural: 'carts',
  };

  return (
    <Page
      divider
      title="Better Carts Dashboard"
      primaryAction={{
        content: 'Create new cart',
        onAction: () => navigate('/cart/create'),
      }}
      secondaryActions={[
        {
          content: 'View all carts',
          onAction: () => navigate('/summary'),
        },
      ]}
    >
      <Layout>
        <Layout.Section fullWidth>
          <LinearChart
            status={status}
            data={analytics ? analytics.total_sales : []}
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <ConversionChart
            status={status}
            data={analytics ? analytics.conversion_rates : []}
          ></ConversionChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <AreaChart
            title={'Average paid carts price'}
            status={status}
            data={analytics ? analytics.average_price : []}
          ></AreaChart>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard title="Recently active carts" sectioned>
            {!isLoading ? (
              <IndexTable
                selectable={false}
                resourceName={resourceName}
                itemCount={carts.length}
                headings={[
                  { title: 'Customer' },
                  { title: 'Items Quantity' },
                  { title: 'Reserved Indicator' },
                  { title: 'Last action' },
                ]}
              >
                {carts.map(
                  (
                    {
                      id,
                      customer_name,
                      qty,
                      reserved_indicator,
                      last_action,
                    }: Cart,
                    index: number,
                  ) => (
                    <IndexTable.Row
                      id={String(id)}
                      key={id}
                      position={index}
                      onClick={() => navigate(`/cart/${id}`)}
                    >
                      <IndexTable.Cell>{customer_name}</IndexTable.Cell>
                      <IndexTable.Cell>{qty}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <CartBadge indicator={reserved_indicator}></CartBadge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{last_action}</IndexTable.Cell>
                    </IndexTable.Row>
                  ),
                )}
              </IndexTable>
            ) : (
              <EmptyStateMarkup rows={10} />
            )}
          </LegacyCard>
        </Layout.Section>

        <Layout.Section secondary>
          <LegacyCard sectioned title="Log activity">
            <LogActivity></LogActivity>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
