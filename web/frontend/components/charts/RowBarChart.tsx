import { LegacyCard } from '@shopify/polaris';
import { SimpleBarChart } from '@shopify/polaris-viz';
import { useEffect, useState } from 'react';

type Props = {
  status: 'Loading' | 'Error' | 'Success';
  data: any;
};

export default function RowBarChart({ status, data }: Props) {
  // const [locations, setLocations] = useState(null);

  // useEffect(() => {
  //   if (status === 'Success' && data[0].data.length) {
  //     const locations = {
  //       name: data[0].name,
  //       data: [],
  //     };

  //     data[0].data.forEach((item: any) => {
  //       for (const key in item.value) {
  //         if (locations.data.find(location => location.key === key)) {
  //           locations.data.find(location => location.key === key).value +=
  //             item.value[key];
  //         } else {
  //           locations.data.push({
  //             key: key,
  //             value: item.value[key],
  //           });
  //         }
  //       }
  //     });

  //     setLocations([locations]);
  //   }
  // }, [status, data]);

  const locations = {
    name: data.length ? data[0].name : '-',
    data: [],
  };

  if (data.length) {
    data[0].data.forEach((item: any) => {
      for (const key in item.value) {
        if (locations.data.find(location => location.key === key)) {
          locations.data.find(location => location.key === key).value +=
            item.value[key];
        } else {
          locations.data.push({
            key: key,
            value: item.value[key],
          });
        }
      }
    });
  }

  console.log(locations)

  return (
    <LegacyCard title="Carts by location" sectioned>
      {status === 'Success' && (
        <SimpleBarChart
          showLegend={false}
          data={[locations]}
          theme="Light"
          state={status}
        ></SimpleBarChart>
      )}
    </LegacyCard>
  );
}
