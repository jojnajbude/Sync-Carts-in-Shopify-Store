import { useNavigate } from 'react-router-dom';
import { Page, Button, Frame, FooterHelp, Banner } from '@shopify/polaris';
import CartsTable from '../components/CartTable';
import { useContext } from 'react';
import { SubscribtionContext } from '../context/SubscribtionContext';

export default function cartsSummary() {
  const navigate = useNavigate();
  const context = useContext(SubscribtionContext);

  return (
    <Page
      title="Carts"
      fullWidth
      primaryAction={
        <Button
          primary
          onClick={() => navigate('/cart/create')}
          // disabled={!context.plan || context.plan.carts >= context.plan.limit}
        >
          Create new cart
        </Button>
      }
      backAction={{ onAction: () => navigate(-1) }}
    >
      <Frame>
        <CartsTable></CartsTable>
        <FooterHelp>© Simplify Apps. All rights reserved.</FooterHelp>
      </Frame>
    </Page>
  );
}
