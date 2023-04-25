import { useEffect, useReducer } from 'react';
import { useAuthenticatedFetch, useNavigate } from '@shopify/app-bridge-react';
import {
  Page,
  Layout,
  FooterHelp,
  IndexTable,
  LegacyCard,
  SkeletonBodyText,
} from '@shopify/polaris';

import AreaChart from '../components/charts/AreaChart';
import ConversionChart from '../components/charts/ConversionChart';
import LinearChart from '../components/charts/LinearChart';
import CartBadge from '../components/CartBadge';
import LogActivity from '../components/LogActivity';

import { Cart } from '../types/cart';
import { Analytics } from '../types/analytics';
import { Logs } from '../types/logs';

type State = {
  isLoading: boolean;
  analytics: Analytics;
  status: 'Loading' | 'Error' | 'Success';
  carts: Cart[];
  logs: Logs[];
};

type Action = {
  type: 'Error' | 'setStates';
  analytics?: Analytics;
  lastCarts?: Cart[];
  logs?: Logs[];
};

export default function HomePage() {
  const initialState: State = {
    isLoading: true,
    analytics: null,
    status: 'Loading',
    carts: null,
    logs: [],
  };

  function reducer(state: State, action: Action) {
    switch (action.type) {
      case 'setStates':
        return {
          isLoading: false,
          analytics: action.analytics,
          status: 'Success',
          carts: action.lastCarts,
          logs: action.logs,
        };

      case 'Error':
        return { ...state, status: 'Error', isLoading: false };
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isLoading) {
      const fetchData = async () => {
        const analyticsData = await fetch('/api/analytics');
        const lastCartsData = await fetch('/api/carts/last');
        const handleLogs = await fetch('/api/logs');

        if (analyticsData.ok && lastCartsData.ok && handleLogs.ok) {
          const analytics = await analyticsData.json();
          const lastCarts = await lastCartsData.json();
          const logs = await handleLogs.json();

          dispatch({ type: 'setStates', analytics, lastCarts, logs });
        } else {
          dispatch({ type: 'Error' });
        }
      };

      fetchData();
    }
  }, [state]);

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
            status={state.status}
            data={state.analytics ? state.analytics.total_sales : []}
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <ConversionChart
            status={state.status}
            data={state.analytics ? state.analytics.conversion_rates : []}
          ></ConversionChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <AreaChart
            title={'Average paid carts price'}
            status={state.status}
            data={
              state.analytics
                ? state.analytics.average_price
                : [{ name: 'Price', data: [] }]
            }
          ></AreaChart>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard title="Recently active carts" sectioned>
            {!state.isLoading ? (
              <IndexTable
                selectable={false}
                resourceName={resourceName}
                itemCount={state.carts.length}
                headings={[
                  { title: 'Customer' },
                  { title: 'Items Quantity' },
                  { title: 'Reserved Indicator' },
                  { title: 'Last action' },
                ]}
              >
                {state.carts.map(
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
              <SkeletonBodyText lines={10} />
            )}
          </LegacyCard>
        </Layout.Section>

        <Layout.Section secondary>
          <LegacyCard sectioned title="Recent activity">
            <LogActivity
              logs={state.logs}
              isLoading={state.isLoading}
            ></LogActivity>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
