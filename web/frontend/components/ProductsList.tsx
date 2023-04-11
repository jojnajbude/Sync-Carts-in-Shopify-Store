import {
  LegacyCard,
  ResourceList,
  LegacyStack,
  Thumbnail,
  AlphaStack,
  Text,
} from '@shopify/polaris';
import Counter from './Counter';
import { formatter } from '../services/formatter';

import { Cart } from '../types/cart';

type Props = {
  openModal: (value: 'remove' | 'unreserve' | 'expand' | 'update') => void;
  currency: string;
  cart: Cart;
};

export default function ProductsList({ openModal, currency, cart }: Props) {
  return (
    <LegacyCard
      title="Products"
      actions={[
        {
          content: 'Reset reservation timers',
          onAction: () => openModal('unreserve'),
        },
      ]}
      sectioned
    >
      <ResourceList
        resourceName={{ singular: 'product', plural: 'products' }}
        items={cart.items}
        renderItem={item => {
          const {
            id,
            image_link,
            expireAt,
            price,
            qty,
            title,
            product_id,
            status,
          } = item;

          return (
            <ResourceList.Item
              id={id}
              url={`https://${cart.shop_domain}/admin/products/${product_id}`}
              accessibilityLabel={`View details for ${title}`}
            >
              <LegacyStack distribution="fill">
                <Thumbnail source={image_link} alt={title} size="large" />

                <LegacyStack.Item>
                  <AlphaStack gap="3">
                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                      {title}
                    </Text>

                    <Counter expireAt={expireAt} status={status}></Counter>

                    <Text variant="bodyMd" as="h3">
                      {`Amount: ${qty}`}
                    </Text>
                  </AlphaStack>
                </LegacyStack.Item>

                <LegacyStack.Item>
                  <Text variant="bodyMd" as="h3" alignment="end">
                    {`${formatter(price, currency)} x ${qty}`}
                  </Text>
                </LegacyStack.Item>

                <LegacyStack.Item>
                  <Text variant="bodyMd" as="h3" alignment="end">
                    {formatter(Number(price) * Number(qty), currency)}
                  </Text>
                </LegacyStack.Item>
              </LegacyStack>
            </ResourceList.Item>
          );
        }}
      />
    </LegacyCard>
  );
}
