import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Layout,
  Page,
  FooterHelp,
  Button,
  Popover,
  DatePicker,
  LegacyCard,
  Divider,
  VerticalStack,
  HorizontalStack,
} from '@shopify/polaris';
import { CalendarMinor } from '@shopify/polaris-icons';

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
  const [popoverActive, setPopoverActive] = useState(false);
  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(),
  });

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'Loading') {
      const fetchData = async () => {
        const analyticsData = await fetch(`/api/analytics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: await JSON.stringify(selectedDates),
        });

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

  const handleMonthChange = useCallback(
    (month: number, year: number) => setDate({ month, year }),
    [],
  );

  const togglePopoverActive = useCallback(
    () => setPopoverActive(popoverActive => !popoverActive),
    [],
  );

  const activator = (
    <Button icon={CalendarMinor} size="slim" onClick={togglePopoverActive}>
      {`${selectedDates.start.toDateString().split(' ').slice(1).join(' ')} 
        - 
        ${selectedDates.end.toDateString().split(' ').slice(1).join(' ')}`}
    </Button>
  );

  return (
    <Page
      fullWidth
      backAction={{ onAction: () => navigate(-1) }}
      title="Analytics"
    >
      <Layout>
        <Layout.Section fullWidth>
          <Popover
            active={popoverActive}
            activator={activator}
            autofocusTarget="first-node"
            onClose={togglePopoverActive}
            sectioned
          >
            <VerticalStack gap="4">
              <DatePicker
                month={month}
                year={year}
                onChange={setSelectedDates}
                onMonthChange={handleMonthChange}
                selected={selectedDates}
                allowRange
              />

              <Divider></Divider>
              <HorizontalStack align="end" gap="4">
                <Button onClick={togglePopoverActive}>Cancel</Button>
                <Button primary onClick={() => setStatus('Loading')}>Apply</Button>
              </HorizontalStack>
            </VerticalStack>
          </Popover>
        </Layout.Section>

        <Layout.Section oneHalf>
          <LinearChart
            status={status}
            data={analytics ? analytics.sales : []}
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <LinearChart
            status={status}
            data={analytics ? analytics.sales : []}
          ></LinearChart>
        </Layout.Section>

        {/* <Layout.Section oneHalf>
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
            data={analytics ? [analytics.top_sold] : []}
          ></TopChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <TopChart
            title="Top Abandoned"
            status={status}
            data={
              analytics
                ? [analytics.top_abandoned, analytics.top_abandoned_customers]
                : []
            }
          ></TopChart>
        </Layout.Section> */}
      </Layout>
      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
