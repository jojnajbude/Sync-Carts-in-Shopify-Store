import { LegacyCard } from '@shopify/polaris';
import { StackedAreaChart } from '@shopify/polaris-viz';

type Props = {
  title: string;
  status: string;
  data: any;
};

export default function AreaChart({ title, status, data }: Props) {
  return (
    <LegacyCard title={title} sectioned>
      <StackedAreaChart
        showLegend={false}
        data={data}
        theme="Light"
        state={status}
      ></StackedAreaChart>
    </LegacyCard>
  );
}
