import {
  LegacyCard,
  DataTable,
  Link,
  SkeletonBodyText,
  Text,
  Button,
  ButtonGroup,
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  title: string;
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function TopChart({ title, status, data }: Props) {
  const [isFirstButtonActive, setIsFirstButtonActive] = useState(true);

  const handleFirstButtonClick = useCallback(() => {
    if (isFirstButtonActive) return;

    setIsFirstButtonActive(true);
  }, [isFirstButtonActive]);

  const handleSecondButtonClick = useCallback(() => {
    if (!isFirstButtonActive) return;

    setIsFirstButtonActive(false);
  }, [isFirstButtonActive]);

  let rows = [];

  if (status !== 'Loading' && isFirstButtonActive) {
    rows = data[0].map(
      (product: {
        domain: string;
        product_id: string;
        title: string;
        sold: string;
      }) => [
        <Link
          removeUnderline
          external
          target="_blank"
          url={`https://${product.domain}/admin/products/${product.product_id}`}
          key={product.title}
        >
          {product.title}
        </Link>,
        Number(product.sold),
      ],
    );
  } else if (status !== 'Loading' && !isFirstButtonActive) {
    rows = data[1].map(
      (customer: {
        domain: string;
        name: string;
        shopify_user_id: string;
        sold: string;
      }) => [
        <Link
          removeUnderline
          external
          target="_blank"
          url={`https://${customer.domain}/admin/customers/${customer.shopify_user_id}`}
          key={customer.name}
        >
          {customer.name}
        </Link>,
        Number(customer.sold),
      ],
    );
  }

  if (status !== 'Loading' && !rows.length) {
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
