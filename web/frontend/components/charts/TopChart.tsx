import {
  LegacyCard,
  DataTable,
  Link,
  SkeletonBodyText,
  Text,
  Button,
  ButtonGroup,
} from '@shopify/polaris';
import { SubscribtionContext } from '../../context/SubscribtionContext';
import { useCallback, useContext, useState } from 'react';

type Props = {
  title: string;
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function TopChart({ title, status, data }: Props) {
  const [isFirstButtonActive, setIsFirstButtonActive] = useState(true);
  const context = useContext(SubscribtionContext);

  const handleFirstButtonClick = useCallback(() => {
    if (isFirstButtonActive) return;

    setIsFirstButtonActive(true);
  }, [isFirstButtonActive]);

  const handleSecondButtonClick = useCallback(() => {
    if (!isFirstButtonActive) return;

    setIsFirstButtonActive(false);
  }, [isFirstButtonActive]);

  let rows: any[] = [];

  if (
    status !== 'Loading' &&
    data.length &&
    context.plan &&
    isFirstButtonActive
  ) {
    data[0][0].data.forEach((day: any) => {
      day.value.forEach(
        (product: {
          product_id: string;
          product_title: string;
          value: string;
        }) =>
          rows.push([
            <Link
              removeUnderline
              external
              target="_blank"
              url={`https://${context.plan.domain}/admin/products/${product.product_id}`}
              key={product.product_title}
            >
              {product.product_title}
            </Link>,
            Number(product.value),
          ]),
      );
    });

    rows = rows.sort((a: any, b: any) => b[1] - a[1]);
  } else if (status !== 'Loading' && !isFirstButtonActive) {
    data[1][0].data.forEach((day: any) => {
      day.value.forEach(
        (customer: {
          customer_name: string;
          shopify_user_id: string;
          value: string;
        }) => {
          rows.push([
            <Link
              removeUnderline
              external
              target="_blank"
              url={`https://${context.plan.domain}/admin/customers/${customer.shopify_user_id}`}
              key={customer.customer_name}
            >
              {customer.customer_name}
            </Link>,
            Number(customer.value),
          ]);
        },
      );
    });

    rows = rows.sort((a: any, b: any) => b[1] - a[1]);
  }

  if (status !== 'Loading' && !data.length) {
    return (
      <LegacyCard title={title} sectioned>
        <Text as="span" alignment="center" color="subdued">
          No statistic yet
        </Text>
      </LegacyCard>
    );
  }

  return (
    <LegacyCard>
      {status === 'Loading' ? (
        <SkeletonBodyText lines={10} />
      ) : (
        <>
          <LegacyCard.Header title={title}>
            {title === 'Top Abandoned' && (
              <ButtonGroup segmented>
                <Button
                  size="micro"
                  pressed={isFirstButtonActive}
                  onClick={handleFirstButtonClick}
                >
                  Products
                </Button>
                <Button
                  size="micro"
                  pressed={!isFirstButtonActive}
                  onClick={handleSecondButtonClick}
                >
                  Customers
                </Button>
              </ButtonGroup>
            )}
          </LegacyCard.Header>
          <LegacyCard.Section>
            <DataTable
              columnContentTypes={['text', 'text']}
              headings={[]}
              rows={rows}
              increasedTableDensity
            />
          </LegacyCard.Section>
        </>
      )}
    </LegacyCard>
  );
}
