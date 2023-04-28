import {
  LegacyCard,
  DataTable,
  Link,
  SkeletonBodyText,
  Text,
} from '@shopify/polaris';

type Props = {
  title: string;
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function TopChart({ title, status, data }: Props) {
  let rows = [];

  if (status !== 'Loading') {
    rows = data.map(
      (product: {
        domain: string;
        product_id: string;
        title: string;
        sold: string;
      }) => [
        <Link
          removeUnderline
          url={`https://${product.domain}/admin/products/${product.product_id}`}
          key={product.title}
        >
          {product.title}
        </Link>,
        Number(product.sold),
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
    <LegacyCard title={title} sectioned>
      {status === 'Loading' ? (
        <SkeletonBodyText lines={10} />
      ) : (
        <DataTable
          columnContentTypes={['text', 'text']}
          headings={[]}
          rows={rows}
          increasedTableDensity
        />
      )}
    </LegacyCard>
  );
}
