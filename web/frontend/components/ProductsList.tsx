import {
  LegacyCard,
  ResourceList,
  LegacyStack,
  Thumbnail,
  VerticalStack,
  Text,
  DataTable,
  TextField,
  Button,
  Icon,
} from '@shopify/polaris';
import { CancelMajor } from '@shopify/polaris-icons';

import Counter from './Counter';
import AutocompleteSearch from './AutocompleteSearch';
import { formatter } from '../services/formatter';

import { Cart, Item } from '../types/cart';
import { useAuthenticatedFetch } from '../hooks';

type Props = {
  openModal: (value: 'remove' | 'unreserve' | 'expand' | 'update') => void;
  currency: string;
  cart: Cart;
  setCart: (value: Cart) => void;
  isEditing: boolean;
  setIsUnvalidInputs: (value: string) => void;
};

export default function ProductsList({
  openModal,
  currency,
  cart,
  setCart,
  isEditing,
  setIsUnvalidInputs,
}: Props) {
  const fetch = useAuthenticatedFetch();

  const handleChange = async (newValue: string, item: Item) => {
    setIsUnvalidInputs('none');

    const updatedCart = { ...cart };
    const index = updatedCart.items.findIndex(
      cartItem => cartItem.id === item.id,
    );

    updatedCart.items[index].qty = newValue;
    updatedCart.items[index].reserved_indicator = 'unsynced';

    const total = updatedCart.items.reduce(
      (acc: number, cur: Item) => acc + Number(cur.qty) * Number(cur.price),
      0,
    );

    const qty = updatedCart.items.reduce(
      (acc: number, cur: Item) => acc + Number(cur.qty),
      0,
    );

    updatedCart.total = total;
    updatedCart.qty = qty;

    if (!item.inventory_quantity) {
      const product = await fetch(
        `/api/products/variant?id=${item.variant_id}`,
      );

      if (product.ok) {
        const productData = await product.json();

        const updatedCart = { ...cart };
        const index = updatedCart.items.findIndex(
          cartItem => cartItem.id === item.id,
        );

        updatedCart.items[index].inventory_quantity =
          productData.inventory_quantity;

        if (newValue > productData.inventory_quantity) {
          setIsUnvalidInputs('more');
          return;
        }
      }
    }

    if (Number(newValue) > 10000 || +newValue > item.inventory_quantity) {
      setIsUnvalidInputs('more');
      return;
    }

    setCart(updatedCart);
  };

  const removeItem = (item: Item) => {
    const updatedCart = { ...cart };
    const updatedItems = updatedCart.items.filter(
      cartItem => cartItem.id !== item.id,
    );
    updatedCart.items = updatedItems;

    const total = updatedCart.items.reduce(
      (acc: number, cur: Item) => acc + Number(cur.qty) * Number(cur.price),
      0,
    );

    const qty = updatedCart.items.reduce(
      (acc: number, cur: Item) => acc + Number(cur.qty),
      0,
    );

    updatedCart.total = total;
    updatedCart.qty = qty;

    setCart(updatedCart);
  };

  const setEditableTable = (items: Item[]) => {
    return items.map(item => {
      const product = (
        <LegacyStack>
          <Thumbnail source={item.image_link} alt={item.title} size="medium" />

          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {item.title}
          </Text>
        </LegacyStack>
      );

      const qty = (
        <TextField
          label=""
          type="number"
          min={1}
          // max={item.inventory_quantity}
          error={item.qty > item.inventory_quantity}
          value={String(item.qty)}
          onChange={newValue => handleChange(newValue, item)}
          autoComplete="off"
        ></TextField>
      );

      const close = (
        <Button
          plain
          size="medium"
          icon={<Icon source={CancelMajor} color="subdued" />}
          onClick={() => removeItem(item)}
        ></Button>
      );

      return [
        product,
        qty,
        formatter(Number(item.price) * Number(item.qty), currency),
        close,
      ];
    });
  };

  return (
    <LegacyCard
      title="Products"
      actions={
        !isEditing
          ? [
              {
                content: 'Unreserve items',
                disabled: cart.reserved_indicator === 'paid',
                onAction: () => openModal('unreserve'),
              },
            ]
          : []
      }
      sectioned={!isEditing}
    >
      {!isEditing ? (
        <ResourceList
          resourceName={{ singular: 'product', plural: 'products' }}
          items={cart ? cart.items : []}
          renderItem={item => {
            const {
              id,
              image_link,
              expire_at,
              price,
              qty,
              title,
              product_id,
              status,
              variant_title,
            } = item;

            return (
              <ResourceList.Item
                id={String(id)}
                url={`https://${cart.shop_domain}/admin/products/${product_id}`}
                accessibilityLabel={`View details for ${title}`}
              >
                <LegacyStack>
                  <Thumbnail source={image_link} alt={title} size="large" />

                  <LegacyStack.Item fill>
                    <VerticalStack gap="3">
                      <Text variant="bodyMd" fontWeight="bold" as="h3">
                        {title}
                      </Text>

                      {variant_title && variant_title !== 'Default Title' ? (
                        <Text variant="bodySm" as="span" color="subdued">
                          {`Variant: ${variant_title}`}
                        </Text>
                      ) : null}

                      <Counter expireAt={expire_at} status={status}></Counter>

                      <Text variant="bodyMd" as="h3">
                        {`Amount: ${qty}`}
                      </Text>
                    </VerticalStack>
                  </LegacyStack.Item>

                  <LegacyStack.Item>
                    <Text variant="bodyMd" as="h3" alignment="end">
                      {`${formatter(price, currency)} x ${qty}`}
                    </Text>
                    <Text variant="bodyMd" as="h3" alignment="end">
                      {formatter(Number(price) * Number(qty), currency)}
                    </Text>
                  </LegacyStack.Item>
                </LegacyStack>
              </ResourceList.Item>
            );
          }}
        />
      ) : (
        <>
          <LegacyCard.Section>
            <AutocompleteSearch
              type={'products'}
              cart={cart}
              currency={currency}
              setCart={setCart}
              setIsUnvalidInputs={setIsUnvalidInputs}
            ></AutocompleteSearch>
          </LegacyCard.Section>

          {cart.items.length ? (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text']}
              headings={['Product', 'Quantity', 'Total', '']}
              rows={setEditableTable(cart.items)}
              hoverable={false}
            ></DataTable>
          ) : null}
        </>
      )}
    </LegacyCard>
  );
}
