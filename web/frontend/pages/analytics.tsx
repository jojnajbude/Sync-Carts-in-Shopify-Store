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
  Text,
} from '@shopify/polaris';
import { CalendarMinor } from '@shopify/polaris-icons';

import CircleChart from '../components/charts/CircleChart';
import LinearChart from '../components/charts/LinearChart';
import RowBarChart from '../components/charts/RowBarChart';
import AreaChart from '../components/charts/AreaChart';
import ConversionChart from '../components/charts/ConversionChart';
import TopChart from '../components/charts/TopChart';

import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

import '@shopify/polaris-viz/build/esm/styles.css';
import '../styles/styles.css';

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

  const handleAverageTime = (average_open_time: any) => {
    const averageTime =
      average_open_time.data.reduce(
        (acc: any, cur: { value: any }) => acc + cur.value,
        0,
      ) / average_open_time.data.length;

    const days = Math.floor(averageTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (averageTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((averageTime % (1000 * 60 * 60)) / (1000 * 60));

    if (!days && !hours && !minutes) return 'Less than a minute';

    return `${days ? days + ' days' : ''} ${hours ? hours + ' hours' : ''} ${
      minutes ? minutes + ' minutes' : ''
    }`;
  };

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
                disableDatesAfter={new Date()}
                allowRange
              />

              <Divider></Divider>
              <HorizontalStack align="end" gap="4">
                <Button onClick={togglePopoverActive}>Cancel</Button>
                <Button
                  primary
                  onClick={() => {
                    setStatus('Loading');
                    togglePopoverActive();
                  }}
                >
                  Apply
                </Button>
              </HorizontalStack>
            </VerticalStack>
          </Popover>
        </Layout.Section>

        <Layout.Section oneHalf>
          <LinearChart
            status={status}
            data={analytics ? analytics.sales : []}
            mainTitle={'Total Sales'}
            chartTitle={'Sales over time'}
            mainTitlePopover={'All sales for the specified time period'}
            chartTitlePopover={
              'This chart shows revenue generated through this app for the specified time period.'
            }
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <LinearChart
            status={status}
            data={analytics ? analytics.drop_rate : []}
            mainTitle={'Total Drop Rate'}
            chartTitle={'Drop Rate over time'}
            mainTitlePopover={'Item Drop Rate for the specified time period'}
            chartTitlePopover={
              'This chart shows all items which was dropped for the specified time period.'
            }
          ></LinearChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <AreaChart
            status={status}
            data={
              analytics
                ? analytics.average_carts_price
                : [{ name: '-', data: [] }]
            }
            mainTitle={'Average paid cart value'}
            chartTitle={'Carts price over time'}
            chartTitlePopover={
              'This chart shows the average carts price for specifit time period.'
            }
          ></AreaChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <LegacyCard sectioned>
            <VerticalStack gap="4">
              <Text fontWeight="bold" variant="headingMd" as="span">
                {'Average cart lifespan'}
              </Text>

              {analytics ? (
                <Text as="h1" variant="bodyLg">
                  {handleAverageTime(analytics.average_open_time[0])}
                </Text>
              ) : (
                '-'
              )}
            </VerticalStack>
          </LegacyCard>
          <ConversionChart
            status={status}
            rates={analytics ? analytics.conversion_rates : []}
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
            data={analytics ? analytics.devices : []}
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
                ? [
                    analytics.top_abandoned_products,
                    analytics.top_abandoned_customers,
                  ]
                : []
            }
          ></TopChart>
        </Layout.Section>
      </Layout>

      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
