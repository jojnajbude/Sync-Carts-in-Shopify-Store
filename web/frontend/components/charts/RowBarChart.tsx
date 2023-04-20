import { LegacyCard } from '@shopify/polaris';
import { SimpleBarChart } from '@shopify/polaris-viz';

type Props = {
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function RowBarChart({ status, data }: Props) {
  return (
    <LegacyCard title="Carts by location" sectioned>
      <SimpleBarChart
        showLegend={false}
        data={data}
        theme="Light"
        state={status}
      ></SimpleBarChart>
    </LegacyCard>
  );
}
