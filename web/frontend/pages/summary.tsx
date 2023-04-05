import { Page, Button, Frame, FooterHelp } from '@shopify/polaris';
import CartsTable from '../components/CartsTable/CartTable';

export default function cartsSummary() {
  return (
    <Page
      title="Carts summary"
      fullWidth
      primaryAction={<Button primary>Create new cart</Button>}
    >
      <Frame>
        <CartsTable></CartsTable>
        <FooterHelp>Blake Rogers. All rights reserved.</FooterHelp>
      </Frame>
    </Page>
  );
}
