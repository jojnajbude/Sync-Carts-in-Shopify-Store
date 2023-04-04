import { Page, Button } from '@shopify/polaris';
import CartsTable from '../components/CartsTable/CartTable';

export default function cartsSummary() {
  return (
    <Page
      title="Carts summary"
      fullWidth
      primaryAction={<Button primary>Create new cart</Button>}
    >
      <CartsTable></CartsTable>
    </Page>
  );
}
