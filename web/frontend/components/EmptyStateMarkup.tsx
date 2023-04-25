import {
  Layout,
  LegacyCard,
  SkeletonBodyText,
  IndexTable,
  SkeletonThumbnail,
} from '@shopify/polaris';

type Props = {
  rows: number;
};

export default function EmptyStateMarkup({ rows }: Props) {
  return (
    <Layout>
      <Layout.Section>
        <LegacyCard>
          <IndexTable
            headings={[
              { title: '' },
              { title: '' },
              { title: '' },
              { title: '' },
              { title: '' },
              { title: '' },
              { title: '' },
            ]}
            itemCount={rows}
            selectable={false}
          >
            {Array.from(Array(rows), (_, index) => {
              return (
                <IndexTable.Row
                  id={String(index)}
                  key={String(index)}
                  position={1}
                >
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
            })}
          </IndexTable>
        </LegacyCard>
      </Layout.Section>
    </Layout>
  );
}
