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
  const context = useContext(SubscribtionContext);
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
            {formatter(18537, context.plan.currency)}
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

        <LineChart theme="Light" status={status} data={data}></LineChart>
      </VerticalStack>
    </LegacyCard>
  );
}
