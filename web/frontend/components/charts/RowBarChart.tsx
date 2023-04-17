import { LegacyCard } from '@shopify/polaris';
import { SimpleBarChart } from '@shopify/polaris-viz';

export default function RowBarChart() {
  const data = [
    {
      name: 'Country',
      data: [
        {
          key: 'USA',
          value: 512,
        },
        {
          key: 'England',
          value: 413,
        },
        {
          key: 'Italy',
          value: 383,
        },
        {
          key: 'Ukraine',
          value: 289,
        },
        {
          key: 'Germany',
          value: 176,
        },
        {
          key: 'Poland',
          value: 98,
        },
      ],
    },
  ];

  return (
    <LegacyCard title="Carts by location" sectioned>
      <SimpleBarChart
        showLegend={false}
        data={data}
        theme="Light"
      ></SimpleBarChart>
    </LegacyCard>
  );
}
