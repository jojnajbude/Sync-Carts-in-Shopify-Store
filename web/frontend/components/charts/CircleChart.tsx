import { LegacyCard } from '@shopify/polaris';
import { DonutChart } from '@shopify/polaris-viz';

type Props = {
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function CircleChart({ status, data }: Props) {
  const finalData: any[] = [];

  if (data.length) {
    data[0].data.forEach((item: any) => {
      for (const key in item.value) {
        if (finalData.find(device => device.name === key)) {
          finalData.find(device => device.name === key).data.value +=
            item.value[key];
        } else {
          finalData.push({
            name: key,
            data: {
              key: key,
              value: item.value[key],
            },
          });
        }
      }
    });
  }

  return (
    <LegacyCard title="Carts opened by device" sectioned>
      <DonutChart
        data={finalData}
        legendFullWidth
        legendPosition="left"
        theme="Light"
        state={status}
      />
    </LegacyCard>
  );
}
