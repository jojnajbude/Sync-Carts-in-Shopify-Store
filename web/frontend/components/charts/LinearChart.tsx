import { LegacyCard } from '@shopify/polaris';
import { LineChart } from '@shopify/polaris-viz';

export default function LinearChart() {
  const data = [
    {
      name: 'Sales',
      data: [
        {
          value: 333,
          key: '2020-04-01',
        },
        {
          value: 797,
          key: '2020-04-02',
        },
        {
          value: 234,
          key: '2020-04-03',
        },
        {
          value: 534,
          key: '2020-04-04',
        },
        {
          value: 132,
          key: '2020-04-05',
        },
        {
          value: 159,
          key: '2020-04-06',
        },
        {
          value: 239,
          key: '2020-04-07',
        },
        {
          value: 708,
          key: '2020-04-08',
        },
        {
          value: 234,
          key: '2020-04-09',
        },
        {
          value: 645,
          key: '2020-04-10',
        },
        {
          value: 543,
          key: '2020-04-11',
        },
        {
          value: 89,
          key: '2020-04-12',
        },
        {
          value: 849,
          key: '2020-04-13',
        },
        {
          value: 129,
          key: '2020-04-14',
        },
      ],
    },
  ];

  return (
    <LegacyCard title="Total sales through Better Carts" sectioned>
      <LineChart showLegend={false} data={data} theme="Light"></LineChart>
    </LegacyCard>
  );
}
