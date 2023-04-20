import { LegacyCard } from '@shopify/polaris';
import { LineChart } from '@shopify/polaris-viz';

type Props = {
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function LinearChart({ status, data }: Props) {
  return (
    <LegacyCard title="Total sales through Better Carts" sectioned>
      <LineChart
        showLegend={false}
        data={data}
        theme="Light"
        status={status}
      ></LineChart>
    </LegacyCard>
  );
}
