import {
  LegacyCard,
  Text,
  Button,
  VerticalStack,
  HorizontalStack,
} from '@shopify/polaris';
import { SubscribtionContext } from '../context/SubscribtionContext';
import { useContext } from 'react';

type Props = {
  title: string;
  currentPlan: string;
  limit: number;
  info: string;
  price: number;
  description: string;
  onClick: () => void;
  children?: any;
};

export const BillingCard = ({
  title,
  currentPlan,
  limit,
  info,
  price,
  description,
  onClick,
  children,
}: Props) => {
  const context = useContext(SubscribtionContext);

  return (
    <>
      <LegacyCard sectioned>
        <VerticalStack gap="4">
          <Text as="h2" variant="headingXl">
            {title}
          </Text>

          <Text as="p" variant="bodySm" color="subdued">
            {info}
          </Text>

          <div>
            <Text as="p" variant="bodySm" color="subdued">
              {`Starting at`}
            </Text>

            <HorizontalStack gap="2" blockAlign="baseline">
              <Text
                as="p"
                fontWeight="bold"
                variant="heading3xl"
                color="success"
              >
                {`$${price}`}
              </Text>

              <Text as="p" variant="bodyMd">
                {`USD/month`}
              </Text>
            </HorizontalStack>

            <Text as="p" variant="bodySm" color="subdued">
              {`Billed monthly`}
            </Text>
          </div>

          <Button
            onClick={onClick}
            primary
            disabled={currentPlan === title || context.plan.carts >= limit}
          >
            {description}
          </Button>
        </VerticalStack>
      </LegacyCard>
      {children}
    </>
  );
};
