import {
  LegacyCard,
  DataTable,
  Link,
  SkeletonBodyText,
} from '@shopify/polaris';
import { Key, ReactElement, JSXElementConstructor, ReactFragment } from 'react';

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
