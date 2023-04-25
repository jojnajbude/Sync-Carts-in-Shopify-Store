import {
  IndexTable,
  Text,
  HorizontalStack,
  VerticalStack,
  Scrollable,
  Link,
  Spinner,
} from '@shopify/polaris';
import formatTime from '../services/timeFormatter';

type Props = {
  logs: {
    _id: string;
    type: string;
    domain: string;
    date: string;
    customer_name: string;
    product_name: string;
    link_id: string;
  }[];
  isLoading: boolean;
};

export default function LogActivity({ logs, isLoading }: Props) {
  const rowMarkup = logs.map(
    (
      { _id, type, domain, date, customer_name, product_name, link_id },
      index,
    ) => {
      let textMarkup = null;

      switch (type) {
        case 'paid':
          textMarkup = (
            <Text as="span" variant="bodySm">
              {customer_name} paid for his cart
            </Text>
          );
          break;

        case 'expire':
          textMarkup = (
            <Text as="span" variant="bodySm">
              {customer_name}`s{' '}
              <Link
                removeUnderline
                url={`https://${domain}/admin/products/${link_id}`}
                external={true}
              >
                {product_name}
              </Link>{' '}
              just expired
            </Text>
          );
          break;

        case 'add':
          textMarkup = (
            <Text as="span" variant="bodySm">
              {customer_name} add{' '}
              <Link
                removeUnderline
                url={`https://${domain}/admin/products/${link_id}`}
                external={true}
              >
                {product_name}
              </Link>{' '}
              to cart
            </Text>
          );
          break;

        case 'delete':
          textMarkup = (
            <Text as="span" variant="bodySm">
              {customer_name} removed{' '}
              <Link
                removeUnderline
                url={`https://${domain}/admin/products/${link_id}`}
                external={true}
              >
                {product_name}
              </Link>{' '}
              from cart
            </Text>
          );
          break;
      }

      const currentDate = new Date();
      const time = currentDate.getTime() - new Date(date).getTime();

      return (
        <IndexTable.Row id={_id} key={_id} position={index}>
          <div style={{ padding: '12px 16px', width: '100%' }}>
            <VerticalStack gap="1">
              <Text as="span" variant="bodySm" color="subdued">
                {formatTime(time)}
              </Text>
              <HorizontalStack align="start" gap="1">
                {textMarkup}
              </HorizontalStack>
            </VerticalStack>
          </div>
        </IndexTable.Row>
      );
    },
  );

  if (isLoading) {
    return <Spinner></Spinner>;
  } else {
    return (
      <IndexTable
        itemCount={logs.length}
        condensed
        headings={[{ title: 'Date' }, { title: 'Message' }]}
      >
        <Scrollable shadow style={{ height: '415px' }}>
          {rowMarkup}
        </Scrollable>
      </IndexTable>
    );
  }
}
