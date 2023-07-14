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
  Button,
  VerticalStack,
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
import formatTime from '../services/timeFormatter';

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
      const date = new Date();
      try {
        (async () => {
          const [analytics, lastCarts, logs] = await Promise.all([
            fetch('/api/analytics', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: await JSON.stringify({
                start: new Date(date.getFullYear(), date.getMonth(), 2),
                end: date,
              }),
            }).then(res => res.json()),
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
      title="Dashboard"
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
          <LegacyCard
            sectioned
            title="Inject timer snippet to your Shopify Theme"
            primaryFooterAction={{
              content: 'Inject snippet',
              onAction: () => navigate('/settings'),
            }}
          >
            To allow users to see reservation timers in their carts, inject the
            timer snippet into your current Shopify theme.
          </LegacyCard>
        </Layout.Section>

        <Layout.Section fullWidth>
          <LinearChart
            status={state.status}
            data={
              state.analytics
                ? state.analytics.sales
                : [{ name: 'Sales', data: [] }]
            }
            mainTitle={'Total Sales'}
            chartTitle={'Sales over time'}
            mainTitlePopover={'All sales for the specified time period'}
            chartTitlePopover={
              'This chart shows revenue generated through this app for the specified time period.'
            }
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <ConversionChart
            status={state.status}
            rates={
              state.analytics
                ? state.analytics.conversion_rates
                : [{ name: 'Rates', data: [] }]
            }
          ></ConversionChart>
        </Layout.Section>

        <Layout.Section oneThird>
          <AreaChart
            status={state.status}
            data={
              state.analytics
                ? state.analytics.average_carts_price
                : [{ name: 'Price', data: [] }]
            }
            mainTitle={'Average paid cart value'}
            chartTitle={'Carts price over time'}
            chartTitlePopover={
              'This chart shows the average carts price for specifit time period.'
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
                  { title: 'Reserved Status' },
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
                      <IndexTable.Cell>
                        {formatTime(
                          Date.now() - new Date(last_action).getTime(),
                        )}
                      </IndexTable.Cell>
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
      <FooterHelp>© Simplify Apps. All rights reserved.</FooterHelp>
    </Page>
  );
}
