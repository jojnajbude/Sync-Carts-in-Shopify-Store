import { LegacyCard } from '@shopify/polaris';
import { FunnelChart } from '@shopify/polaris-viz';

export default function AreaChart() {
  const data = [
    {
      data: [
        {
          value: 126,
          key: 'Visitors',
        },
        {
          value: 48,
          key: 'Opened carts',
        },
        {
          value: 12,
          key: 'Orders created',
        },
        {
          value: 10,
          key: 'Orders paid',
        },
      ],
      name: 'Conversion',
    },
  ];

  return (
    <LegacyCard title="Conversion rates" sectioned>
      <FunnelChart data={data} theme="Light"></FunnelChart>
    </LegacyCard>
  );
}
