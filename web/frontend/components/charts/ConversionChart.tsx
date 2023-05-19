import { LegacyCard } from '@shopify/polaris';
import { FunnelChart } from '@shopify/polaris-viz';
import { useEffect, useState } from 'react';

type Props = {
  status: string;
  rates: any;
};

export default function AreaChart({ status, rates }: Props) {
  const finalData = [
    {
      name: rates.length ? rates[0].name : '-',
      data: [
        { key: 'Opens', value: 0 },
        { key: 'Paid', value: 0 },
      ],
    },
  ];

  if (rates.length) {
    for (const rate of rates[0].data) {
      finalData[0].data[0].value += rate.value[0].value;
      finalData[0].data[1].value += rate.value[1].value;
    }
  }

  return (
    <LegacyCard title="Conversion rates" sectioned>
      <FunnelChart data={finalData} theme="Light" state={status}></FunnelChart>
    </LegacyCard>
  );
}
