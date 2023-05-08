import { useContext, useEffect, useReducer } from 'react';
import { useAuthenticatedFetch, useNavigate } from '@shopify/app-bridge-react';
import {
  Page,
  Layout,
  FooterHelp,
  IndexTable,
  LegacyCard,
  SkeletonBodyText,
  Banner,
  EmptySearchResult,
} from '@shopify/polaris';

import AreaChart from '../components/charts/AreaChart';
import ConversionChart from '../components/charts/ConversionChart';
import LinearChart from '../components/charts/LinearChart';
import CartBadge from '../components/CartBadge';
import LogActivity from '../components/LogActivity';

import { Cart } from '../types/cart';
import { Analytics } from '../types/analytics';
import { Logs } from '../types/logs';
import { SubscribtionContext } from '../context/SubscribtionContext';
import MediaCardBanner from '../components/MediaCard';

type State = {
  isLoading: boolean;
  analytics: Analytics;
  status: 'Loading' | 'Error' | 'Success';
  carts: Cart[];
  logs: Logs[];
  plan_banner: boolean;
};

type Action = {
  type: 'Error' | 'setStates';
  analytics?: Analytics;
  lastCarts?: Cart[];
  logs?: Logs[];
};

const initialState: State = {
  isLoading: true,
  analytics: null,
  status: 'Loading',
  carts: [],
  logs: [],
  plan_banner: false,
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
        plan_banner: true,
      };

    case 'Error':
      return { ...state, status: 'Error', isLoading: false };
  }
}

export default function HomePage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const context = useContext(SubscribtionContext);

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isLoading) {
      try {
        (async () => {
          const [analytics, lastCarts, logs] = await Promise.all([
            fetch('/api/analytics').then(res => res.json()),
            fetch('/api/carts/last').then(res => res.json()),
            fetch('/api/logs').then(res => res.json()),
          ]);

          dispatch({ type: 'setStates', analytics, lastCarts, logs });
        })();
      } catch (err) {
        dispatch({ type: 'Error' });
      }
    }
  }, [state, context.plan]);

  const emptyStateMarkup = (
    <EmptySearchResult title={''} description={'No carts yet'} />
  );

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
        disabled: !context.plan || context.plan.carts >= context.plan.limit,
      }}
      secondaryActions={[
        {
          content: 'View all carts',
          onAction: () => navigate('/summary'),
        },
      ]}
    >
      <Layout>
        {context.plan && context.plan.carts >= context.plan.limit && (
          <Layout.Section>
            <Banner
              title="Cart limit reached!"
              action={{
                content: 'Upgrade plan',
                onAction: () => navigate('/subscribe'),
              }}
              status="warning"
            >
              <p>Upgrade plan to take control of all shopping carts!</p>
            </Banner>
          </Layout.Section>
        )}

        {context.plan ? (
          <Layout.Section>
            <MediaCardBanner plan={context.plan}></MediaCardBanner>
          </Layout.Section>
        ) : null}

        <Layout.Section fullWidth>
          <LinearChart
            status={state.status}
            data={
              state.analytics
                ? state.analytics.total_sales
                : [{ name: 'Sales', data: [] }]
            }
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <ConversionChart
            status={state.status}
            data={
              state.analytics
                ? state.analytics.conversion_rates
                : [{ name: 'Rates', data: [] }]
            }
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
                emptyState={emptyStateMarkup}
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
