import {
  HorizontalStack,
  LegacyCard,
  Text,
  Tooltip,
  VerticalStack,
} from '@shopify/polaris';
import { LineChart } from '@shopify/polaris-viz';
import { useContext } from 'react';
import { SubscribtionContext } from '../../context/SubscribtionContext';
import { formatter } from '../../services/formatter';

type Props = {
  status: string;
  data: any;
};

export default function LinearChart({ status, data }: Props) {
  const testData = [
    {
      "name": "Apr 1 – Apr 14, 2020",
      "data": [{
          "value": 1000,
          "key": "2020-03-29T12:00:00.647Z"
        },
        {
          "value": 333,
          "key": "2020-04-01T12:00:00Z"
        },
        {
          "value": 797,
          "key": "2020-04-02T12:00:00Z"
        },
        {
          "value": 234,
          "key": "2020-04-03T12:00:00"
        },
        {
          "value": 534,
          "key": "2020-04-04T12:00:00"
        },
        {
          "value": 132,
          "key": "2020-04-05T12:00:00"
        },
        {
          "value": 159,
          "key": "2020-04-06T12:00:00"
        },
        {
          "value": 239,
          "key": "2020-04-07T12:00:00"
        },
        {
          "value": 708,
          "key": "2020-04-08T12:00:00"
        },
        {
          "value": 234,
          "key": "2020-04-09T12:00:00"
        },
        {
          "value": 645,
          "key": "2020-04-10T12:00:00"
        },
        {
          "value": 543,
          "key": "2020-04-11T12:00:00"
        },
        {
          "value": 89,
          "key": "2020-04-12T12:00:00"
        },
        {
          "value": 849,
          "key": "2020-04-13T12:00:00"
        },
        {
          "value": 129,
          "key": "2020-04-14T12:00:00"
        }
      ]
    },
    {
      "name": "Previous month",
      "data": [
        {
          "value": 709,
          "key": "2020-03-02T12:00:00"
        },
        {
          "value": 238,
          "key": "2020-03-01T12:00:00"
        },
        {
          "value": 190,
          "key": "2020-03-03T12:00:00"
        },
        {
          "value": 90,
          "key": "2020-03-04T12:00:00"
        },
        {
          "value": 237,
          "key": "2020-03-05T12:00:00"
        },
        {
          "value": 580,
          "key": "2020-03-07T12:00:00"
        },
        {
          "value": 172,
          "key": "2020-03-06T12:00:00"
        },
        {
          "value": 12,
          "key": "2020-03-08T12:00:00"
        },
        {
          "value": 390,
          "key": "2020-03-09T12:00:00"
        },
        {
          "value": 43,
          "key": "2020-03-10T12:00:00"
        },
        {
          "value": 710,
          "key": "2020-03-11T12:00:00"
        },
        {
          "value": 791,
          "key": "2020-03-12T12:00:00"
        },
        {
          "value": 623,
          "key": "2020-03-13T12:00:00"
        },
        {
          "value": 21,
          "key": "2020-03-14T12:00:00"
        }
      ],
      "color": "red",
      "isComparison": true
    }
  ]
  const context = useContext(SubscribtionContext);

  const total = data[0].data.reduce(
    (acc: any, cur: { value: any }) => acc + cur.value,
    0,
  );

  return (
    <LegacyCard sectioned>
      <VerticalStack gap="4">
        <HorizontalStack>
          <Tooltip
            content="All sales for the specified time period"
            hasUnderline
            preferredPosition="above"
            activatorWrapper="span"
          >
            <Text fontWeight="bold" variant="headingMd" as="span">
              Total Sales
            </Text>
          </Tooltip>
        </HorizontalStack>

        {context.plan ? (
          <Text as="h1" variant="headingLg">
            {formatter(total, context.plan.currency)}
          </Text>
        ) : null}

        <HorizontalStack>
          <Tooltip
            content="This chart shows total sales through Better Carts for the specified time period."
            hasUnderline
          >
            <Text fontWeight="bold" as="span">
              Sales over time
            </Text>
          </Tooltip>
        </HorizontalStack>

        <LineChart theme="Light" status={status} data={testData}></LineChart>
      </VerticalStack>
    </LegacyCard>
  );
}
