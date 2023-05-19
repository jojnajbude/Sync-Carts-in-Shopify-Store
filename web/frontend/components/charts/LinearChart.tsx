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
  mainTitle: string;
  chartTitle: string;
  mainTitlePopover: string;
  chartTitlePopover: string;
};

export default function LinearChart({
  status,
  data,
  mainTitle,
  chartTitle,
  mainTitlePopover,
  chartTitlePopover,
}: Props) {
  const context = useContext(SubscribtionContext);

  let total = 0;

  if (mainTitle === 'Total Sales') {
    total = data.length
      ? data[0].data.reduce(
          (acc: any, cur: { value: any }) => acc + cur.value,
          0,
        )
      : 0;
  } else if (mainTitle === 'Total Drop Rate') {
    total = data.length
      ? data[0].data.reduce(
          (acc: any, cur: { value: any }) => acc + cur.value,
          0,
        ) / data.length
      : 0;
  }

  return (
    <LegacyCard sectioned>
      <VerticalStack gap="4">
        <HorizontalStack>
          <Tooltip
            content={mainTitlePopover}
            hasUnderline
            preferredPosition="above"
            activatorWrapper="span"
          >
            <Text fontWeight="bold" variant="headingMd" as="span">
              {mainTitle}
            </Text>
          </Tooltip>
        </HorizontalStack>

        {context.plan ? (
          <Text as="h1" variant="headingLg">
            {mainTitle === 'Total Sales'
              ? formatter(total, context.plan.currency)
              : `${total.toFixed(2)}%`}
          </Text>
        ) : null}

        <HorizontalStack>
          <Tooltip
            content={chartTitlePopover}
            hasUnderline
            preferredPosition="above"
          >
            <Text fontWeight="bold" as="span">
              {chartTitle}
            </Text>
          </Tooltip>
        </HorizontalStack>

        <LineChart theme="Light" state={status} data={data}></LineChart>
      </VerticalStack>
    </LegacyCard>
  );
}
