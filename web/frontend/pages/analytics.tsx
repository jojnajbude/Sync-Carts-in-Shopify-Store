import { useNavigate } from 'react-router-dom';

import { Layout, Page, FooterHelp } from '@shopify/polaris';

import CircleChart from '../components/charts/CircleChart';
import LinearChart from '../components/charts/LinearChart';
import RowBarChart from '../components/charts/RowBarChart';
import AreaChart from '../components/charts/AreaChart';
import ConversionChart from '../components/charts/ConversionChart';
import TopChart from '../components/charts/TopChart';

import '@shopify/polaris-viz/build/esm/styles.css';

export default function EmptyStateExample() {
  const navigate = useNavigate();

  return (
    <Page
      fullWidth
      breadcrumbs={[{ onAction: () => navigate(-1) }]}
      title="Analytics"
    >
      <Layout>
        <Layout.Section oneHalf>
          <LinearChart></LinearChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <AreaChart type={'time'}></AreaChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <AreaChart type={'paid'}></AreaChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <ConversionChart></ConversionChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <RowBarChart></RowBarChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <CircleChart></CircleChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <TopChart type={'sold'}></TopChart>
        </Layout.Section>

        <Layout.Section oneHalf>
          <TopChart type={'abandoned'}></TopChart>
        </Layout.Section>
      </Layout>
      <FooterHelp>Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
