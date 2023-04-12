import { LegacyStack, Thumbnail, Text } from '@shopify/polaris';

type Props = {
  item: any;
};

export default function ProductRow({ item }: Props) {
  const product = (
    <LegacyStack>
      <Thumbnail source={item.image_link} alt={item.title} size="small" />

      <Text variant="bodyMd" fontWeight="bold" as="h3">
        {item.title}
      </Text>
    </LegacyStack>
  );

  return [product, item.qty, item.price * item.qty, ''];
}
