import { LegacyCard } from '@shopify/polaris';
import { FunnelChart } from '@shopify/polaris-viz';

type Props = {
  status: string;
  data: any;
};

export default function AreaChart({ status, data }: Props) {
  return (
    <LegacyCard title="Conversion rates" sectioned>
      <FunnelChart data={data} theme="Light" state={status}></FunnelChart>
    </LegacyCard>
  );
}
