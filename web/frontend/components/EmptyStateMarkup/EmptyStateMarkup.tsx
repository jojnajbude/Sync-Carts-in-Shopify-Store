import {
  Layout,
  LegacyCard,
  SkeletonBodyText,
  IndexTable,
  SkeletonThumbnail,
} from '@shopify/polaris';
import React from 'react';

type Props = {
  rows: number;
};

export default function EmptyStateMarkup({ rows }: Props) {
  const markupRow = (
    <IndexTable.Row id={'1'} position={1}>
      <IndexTable.Cell>
        <SkeletonThumbnail size="extraSmall" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonBodyText lines={1} />
      </IndexTable.Cell>
    </IndexTable.Row>
  );

  return (
    <Layout>
      <Layout.Section>
        <LegacyCard>
          <IndexTable
            headings={[
              { title: '' },
              { title: 'Cart ID' },
              { title: 'Customer' },
              { title: 'Cart Total' },
              { title: 'Reserved Indicator' },
              { title: 'Shortest expire time for items' },
              { title: 'Items Quantity' },
            ]}
            itemCount={rows}
            selectable={false}
          >
            {Array(rows).fill(markupRow)}
          </IndexTable>
        </LegacyCard>
      </Layout.Section>
    </Layout>
  );
}
