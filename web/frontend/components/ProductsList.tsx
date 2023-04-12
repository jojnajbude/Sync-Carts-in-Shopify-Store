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

type Props = {
  openModal: (value: 'remove' | 'unreserve' | 'expand' | 'update') => void;
  currency: string;
  cart: Cart;
  setCart: (value: any) => void;
  isEdit: boolean;
};

export default function ProductsList({
  openModal,
  currency,
  cart,
  setCart,
  isEdit,
}: Props) {
  const handleChange = useCallback(
    (newValue: string) => console.log(newValue),
    [],
  );

  const setEditableTable = (items: any[]) => {
    return items.map(item => {
      const product = (
        <LegacyStack>
          <Thumbnail source={item.image_link} alt={item.title} size="small" />

          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {item.title}
          </Text>
        </LegacyStack>
      );

      const qty = (
        <TextField
          label="Quantity"
          type="number"
          value={item.qty}
          onChange={handleChange}
          autoComplete="off"
        ></TextField>
      );

      const close = (
        <Button plain destructive>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <Icon source={CancelMajor} color="base" />
        </Button>
      );

      return [product, qty, formatter(item.price * item.qty, currency), close];
    });
  };

  return (
    <LegacyCard
      title="Products"
      actions={[
        {
          content: 'Reset reservation timers',
          onAction: () => openModal('unreserve'),
        },
      ]}
      sectioned={!isEdit}
    >
      {!isEdit ? (
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
              setFunction={setCart}
            ></AutocompleteSearch>
          </LegacyCard.Section>

          <DataTable
            columnContentTypes={['text', 'numeric', 'numeric', 'text']}
            headings={['Product', 'Quantity', 'Total', '']}
            rows={setEditableTable(cart.items)}
            hoverable={false}
          ></DataTable>
        </>
      )}
    </LegacyCard>
  );
}
