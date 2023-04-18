import {
  LegacyCard,
  ResourceList,
  ResourceItem,
  Text,
  LegacyStack,
  Thumbnail,
} from '@shopify/polaris';
import { Product, Variant } from '../types/product';

import { formatter } from '../services/formatter';
import { Item } from '../types/cart';

type Props = {
  product: Product;
  addItemToCart: (value: Item | Variant) => void;
  currency: string;
};

export default function VariantsList({
  product,
  addItemToCart,
  currency,
}: Props) {
  return (
    <LegacyCard>
      <ResourceList
        items={product.variants}
        renderItem={variant => {
          const { id, title, inventory_quantity, price, image_id } = variant;

          if (!image_id) {
            variant.image_link = product.image.src;
          } else {
            variant.image_link = product.images.find(
              (image: { id: number }) => image.id === image_id,
            ).src;
          }

          return (
            <ResourceItem
              id={String(id)}
              onClick={() => addItemToCart(variant)}
              media={
                <Thumbnail
                  size="small"
                  source={variant.image_link}
                  alt={title}
                ></Thumbnail>
              }
            >
              <LegacyStack distribution="fillEvenly">
                <Text variant="bodyMd" fontWeight="bold" as="h3">
                  {title}
                </Text>
                <Text variant="bodyMd" as="h3" alignment="end">
                  {`${inventory_quantity} available`}
                </Text>
                <Text variant="bodyMd" as="h3" alignment="end">
                  {formatter(price, currency)}
                </Text>
              </LegacyStack>
            </ResourceItem>
          );
        }}
      />
    </LegacyCard>
  );
}
