import { LegacyCard } from '@shopify/polaris';
import { DonutChart } from '@shopify/polaris-viz';

type Props = {
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function CircleChart({ status, data }: Props) {
  data.forEach((os: { name: string; data: { value: any; key: string }[] }) => {
    if (!os.name) {
      os.name = 'Other';
      os.data.key = 'Other';
    }

    os.data[0].value = Number(os.data[0].value);
  });

  return (
    <LegacyCard title="Carts opened by device" sectioned>
      <DonutChart
        data={data}
        legendFullWidth
        legendPosition="left"
        theme="Light"
        state={status}
      />
    </LegacyCard>
  );
}
