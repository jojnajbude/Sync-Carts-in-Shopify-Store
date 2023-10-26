import {
  HorizontalStack,
  LegacyCard,
  Tooltip,
  VerticalStack,
  Text,
} from '@shopify/polaris';
import { StackedAreaChart } from '@shopify/polaris-viz';
import { SubscribtionContext } from '../../context/SubscribtionContext';
import { useContext } from 'react';
import { formatter } from '../../services/formatter';

type Props = {
  status: string;
  data: any;
  mainTitle: string;
  chartTitle: string;
  chartTitlePopover: string;
};

export default function AreaChart({
  status,
  data,
  mainTitle,
  chartTitle,
  chartTitlePopover,
}: Props) {
  const context = useContext(SubscribtionContext);
  const total = data[0].data.length
    ? data[0].data.reduce(
        (acc: any, cur: { value: any }) => acc + cur.value,
        0,
      ) / data[0].data.length
    : 0;

  return (
    <LegacyCard sectioned>
      <VerticalStack gap="4">
        <HorizontalStack>
          <Text fontWeight="bold" variant="headingMd" as="span">
            {mainTitle}
          </Text>
        </HorizontalStack>

        <Text as="h1" variant="headingLg">
          {context.plan ? formatter(total * 100, context.plan.currency) : null}
        </Text>

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

        <StackedAreaChart
          showLegend={false}
          data={data}
          theme="Light"
          state={status}
        ></StackedAreaChart>
      </VerticalStack>
    </LegacyCard>
  );
}
