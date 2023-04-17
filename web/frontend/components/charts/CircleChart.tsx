import { LegacyCard } from '@shopify/polaris';
import { DonutChart } from '@shopify/polaris-viz';

export default function CircleChart() {
  const data = [
    {
      data: [
        {
          key: 'iOS',
          value: 53,
        },
      ],
      name: 'iOS',
    },
    {
      data: [
        {
          key: 'Android',
          value: 46,
        },
      ],
      name: 'Android',
    },
    {
      data: [
        {
          key: 'Windows',
          value: 40,
        },
      ],
      name: 'Windows',
    },
    {
      data: [
        {
          key: 'Other',
          value: 10,
        },
      ],
      name: 'Other',
    },
  ];

  return (
    <LegacyCard title="Carts opened by device" sectioned>
      <DonutChart
        data={data}
        legendFullWidth
        legendPosition="left"
        theme="Light"
      />
    </LegacyCard>
  );
}
