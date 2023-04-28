import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout, Page, FooterHelp } from '@shopify/polaris';

import CircleChart from '../components/charts/CircleChart';
import LinearChart from '../components/charts/LinearChart';
import RowBarChart from '../components/charts/RowBarChart';
import AreaChart from '../components/charts/AreaChart';
import ConversionChart from '../components/charts/ConversionChart';
import TopChart from '../components/charts/TopChart';

import '@shopify/polaris-viz/build/esm/styles.css';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

type Status = 'Loading' | 'Error' | 'Success';

export default function EmptyStateExample() {
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState<Status>('Loading');
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'Loading') {
      const fetchData = async () => {
        const analyticsData = await fetch('/api/analytics');

        if (analyticsData.ok) {
          const analytics = await analyticsData.json();

          setAnalytics(analytics);
          setStatus('Success');
        } else {
          setStatus('Error');
        }
      };

      fetchData();
    }
  }, [status]);

  return (
    <Page
      fullWidth
      backAction={{ onAction: () => navigate(-1) }}
      title="Analytics"
    >
      <Layout>
        <Layout.Section oneHalf>
          <LinearChart
            status={status}
            data={analytics ? analytics.total_sales : []}
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <AreaChart
            title={'Average cart open time (in minutes)'}
            status={status}
            data={
              analytics
                ? analytics.average_open_time
                : [{ name: 'Time', data: [] }]
            }
          ></AreaChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <AreaChart
            title={'Average paid carts price (in shop currency)'}
            status={status}
            data={
              analytics
                ? analytics.average_price
                : [{ name: 'Price', data: [] }]
            }
          ></AreaChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <ConversionChart
            status={status}
            data={analytics ? analytics.conversion_rates : []}
          ></ConversionChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <RowBarChart
            status={status}
            data={analytics ? analytics.locations : []}
          ></RowBarChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <CircleChart
            status={status}
            data={analytics ? analytics.device_statistic : []}
          ></CircleChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <TopChart
            title="Top Sold Products"
            status={status}
            data={analytics ? analytics.top_sold : []}
          ></TopChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <TopChart
            title="Top Abandoned Products"
            status={status}
            data={analytics ? analytics.top_abandoned : []}
          ></TopChart>
        </Layout.Section>
      </Layout>
      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
