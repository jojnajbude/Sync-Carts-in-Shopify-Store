import { LegacyCard } from '@shopify/polaris';
import { StackedAreaChart } from '@shopify/polaris-viz';

type Props = {
  type: 'time' | 'paid';
};

export default function AreaChart({ type }: Props) {
  let data = [];

  if (type == 'time') {
    data = [
      {
        name: 'Days',
        data: [
          {
            key: 'January',
            value: 12,
          },
          {
            key: 'February',
            value: 4,
          },
          {
            key: 'March',
            value: 7,
          },
          {
            key: 'April',
            value: 1,
          },
          {
            key: 'May',
            value: 7,
          },
          {
            key: 'June',
            value: 9,
          },
          {
            key: 'July',
            value: 14,
          },
        ],
      },
    ];
  } else if (type === 'paid') {
    data = [
      {
        name: 'Price',
        data: [
          {
            key: 'January',
            value: 383,
          },
          {
            key: 'February',
            value: 417,
          },
          {
            key: 'March',
            value: 683,
          },
          {
            key: 'April',
            value: 1100,
          },
          {
            key: 'May',
            value: 412,
          },
          {
            key: 'June',
            value: 132,
          },
          {
            key: 'July',
            value: 86,
          },
        ],
      },
    ];
  }

  return (
    <LegacyCard
      title={
        type === 'time'
          ? 'Average cart open time (in days)'
          : 'Average paid carts price (in shop currency)'
      }
      sectioned
    >
      <StackedAreaChart
        showLegend={false}
        data={data}
        theme="Light"
      ></StackedAreaChart>
    </LegacyCard>
  );
}
