import {
  LegacyCard,
  ResourceList,
  ResourceItem,
  Text,
  LegacyStack,
  Thumbnail,
  Icon,
} from '@shopify/polaris';
import { ProductsMajor } from '@shopify/polaris-icons';
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
  const filterOutOfStock = product.variants.filter(
    variant => variant.inventory_quantity !== 0,
  );

  const emptyStateMarkup = (
    <>
      <LegacyCard sectioned>
        <Icon color="subdued" source={ProductsMajor} />
        <div style={{ textAlign: 'center' }}>
          <Text color="subdued" as="span">
            Could not find any available variants. Check if this product is out
            of stock.
          </Text>
        </div>
      </LegacyCard>
    </>
  );

  return (
    <LegacyCard>
      <ResourceList
        emptyState={emptyStateMarkup}
        items={filterOutOfStock}
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
