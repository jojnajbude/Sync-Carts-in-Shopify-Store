import { useCallback } from 'react';
import { LegacyCard, LegacyStack, Link, Text, Select } from '@shopify/polaris';

import { Cart } from '../../types/cart';

type Props = {
  cart: Cart;
  customer: any;
  priority: 'min' | 'low' | 'normal' | 'high' | 'max';
  setPriority: (value: string) => void;
  setIsEditing: (value: boolean) => void;
};

export default function CartCustomer({
  cart,
  customer,
  priority,
  setPriority,
  setIsEditing,
}: Props) {
  const priorityLevels = [
    { label: 'Minimal', value: 'min' },
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Max', value: 'max' },
  ];

  const handlePriorityChange = useCallback((value: string) => {
    setIsEditing(true);
    setPriority(value);
  }, []);

  return (
    <LegacyCard title="Customer">
      <LegacyCard.Section>
        <LegacyStack vertical>
          <Link
            url={`https://${cart.shop_domain}/admin/customers/${cart.customer_shopify_id}`}
          >
            {/* {cart.customer_name} */}
            Name Surname
          </Link>

          <Text color="subdued" as="span">
            {`${customer.orders_count} orders`}
          </Text>
        </LegacyStack>
      </LegacyCard.Section>

      <LegacyCard.Section title="Contact information">
        <LegacyStack vertical>
          <Text color="subdued" as="span">
            {'email' in customer
              ? `Email: ${customer.email}`
              : 'No email provided'}
          </Text>
          <Text color="subdued" as="span">
            {'phone' in customer
              ? `Phone: ${customer.email}`
              : 'No phone provided'}
          </Text>
        </LegacyStack>
      </LegacyCard.Section>

      <LegacyCard.Section title="Shipping address">
        <LegacyStack vertical>
          {customer.default_address.address1 && (
            <Text color="subdued" as="span">
              {customer.default_address.address1}
            </Text>
          )}

          {customer.default_address.city && (
            <Text color="subdued" as="span">
              {customer.default_address.city}
            </Text>
          )}

          {customer.default_address.country && (
            <Text color="subdued" as="span">
              {customer.default_address.country}
            </Text>
          )}

          {customer.default_address.zip && (
            <Text color="subdued" as="span">
              {customer.default_address.zip}
            </Text>
          )}
        </LegacyStack>
      </LegacyCard.Section>

      <LegacyCard.Section title="Statistic">
        <LegacyStack vertical>
          <Text color="subdued" as="span">
            Item drop rate:
          </Text>
          <Text color="subdued" as="span">
            Item drop count:
          </Text>

          <Select
            label="Priority"
            labelInline
            options={priorityLevels}
            onChange={handlePriorityChange}
            value={priority}
          />
        </LegacyStack>
      </LegacyCard.Section>
    </LegacyCard>
  );
}
