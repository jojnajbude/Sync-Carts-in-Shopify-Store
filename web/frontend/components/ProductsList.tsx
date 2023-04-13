import { useState, useCallback } from 'react';
import {
  LegacyCard,
  ResourceList,
  LegacyStack,
  Thumbnail,
  AlphaStack,
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

import { Cart } from '../types/cart';
import { setCustomer } from '@shopify/app-bridge/actions/Cart';
import { update } from '@shopify/app-bridge/actions/MarketingExternalActivityTopBar';

type Props = {
  openModal: (value: 'remove' | 'unreserve' | 'expand' | 'update') => void;
  currency: string;
  cart: Cart;
  setCart: (value: any) => void;
  isEditing: boolean;
};

export default function ProductsList({
  openModal,
  currency,
  cart,
  setCart,
  isEditing,
}: Props) {
  const handleChange = (newValue: string, item: any) => {
    const updatedCart = { ...cart };
    const index = updatedCart.items.findIndex(
      cartItem => cartItem.id === item.id,
    );

    updatedCart.items[index].qty = newValue;

    setCart(updatedCart);
  };

  const removeItem = (item: any) => {
    const updatedCart = { ...cart };
    const updatedItems = updatedCart.items.filter(
      cartItem => cartItem.id !== item.id,
    );
    updatedCart.items = updatedItems;

    setCart(updatedCart);
  };

  const setEditableTable = (items: any[]) => {
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
          value={item.qty}
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

      return [product, qty, formatter(item.price * item.qty, currency), close];
    });
  };

  return (
    <LegacyCard
      title="Products"
      actions={
        !isEditing
          ? [
              {
                content: 'Reset reservation timers',
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
                <LegacyStack>
                  <Thumbnail source={image_link} alt={title} size="large" />

                  <LegacyStack.Item fill>
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
      ) : (
        <>
          <LegacyCard.Section>
            <AutocompleteSearch
              type={'products'}
              cart={cart}
              setCart={setCart}
              setCustomer={setCustomer}
            ></AutocompleteSearch>
          </LegacyCard.Section>

          <DataTable
            columnContentTypes={['text', 'text', 'text', 'text']}
            headings={['Product', 'Quantity', 'Total', '']}
            rows={setEditableTable(cart.items)}
            hoverable={false}
          ></DataTable>
        </>
      )}
    </LegacyCard>
  );
}