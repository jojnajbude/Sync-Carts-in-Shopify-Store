import {
  LegacyCard,
  ResourceList,
  ResourceItem,
  Text,
  LegacyStack,
  Thumbnail,
} from '@shopify/polaris';

import { formatter } from '../services/formatter';

type Props = {
  product: any;
  addItemToCart: (value: any) => void;
};

export default function VariantsList({ product, addItemToCart }: Props) {
  console.log(product);
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
            );
          }

          return (
            <ResourceItem
              id={id}
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
                  {formatter(price)}
                </Text>
              </LegacyStack>
            </ResourceItem>
          );
        }}
      />
    </LegacyCard>
  );
}
