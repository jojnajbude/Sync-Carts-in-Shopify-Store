import { Page, Layout, FooterHelp } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';

import { ProductsCard } from '../components';

export default function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section></Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
