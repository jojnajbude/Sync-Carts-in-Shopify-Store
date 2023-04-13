import {
  LegacyCard,
  Button,
  LegacyStack,
  Link,
  Text,
  Icon,
  Select,
} from '@shopify/polaris';
import { CancelMajor } from '@shopify/polaris-icons';

import AutocompleteSearch from './AutocompleteSearch';

type Props = {
  isEditing: boolean;
  cart: any;
  customer: any;
  setCart: (value: any) => void;
  setCustomer: (value: any) => void;
};

export default function CustomerCard({
  isEditing,
  cart,
  customer,
  setCart,
  setCustomer,
}: Props) {
  const priorityLevels = [
    { label: 'Minimal', value: 'min' },
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Max', value: 'max' },
  ];

  console.log(customer);

  const handlePriorityChange = (value: string) => {
    const updatedCart = { ...cart };
    updatedCart.priority = value;

    setCart(updatedCart);
  };

  const removeUser = () => {
    setCustomer(null);
  };

  if (customer) {
    return (
      <LegacyCard
        title="Customer"
        actions={
          isEditing
            ? [
                {
                  content: (
                    <Button
                      plain
                      icon={<Icon source={CancelMajor} color="subdued" />}
                    ></Button>
                  ),
                  onAction: () => removeUser(),
                },
              ]
            : []
        }
      >
        <LegacyCard.Section>
          <LegacyStack vertical>
            <Link
              url={`https://${cart.shop_domain}/admin/customers/${customer.id}`}
            >
              {`${customer.first_name} ${customer.last_name}`}
            </Link>

            <Text color="subdued" as="span">
              {`${customer.orders_count} orders`}
            </Text>
          </LegacyStack>
        </LegacyCard.Section>

        <LegacyCard.Section title="Contact information">
          <LegacyStack vertical>
            <Text color="subdued" as="span">
              {customer.email
                ? `Email: ${customer.email}`
                : 'No email provided'}
            </Text>
            <Text color="subdued" as="span">
              {customer.phone
                ? `Phone: ${customer.phone}`
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
              {`Item drop rate: ${customer.itemDropRate}%`}
            </Text>
            <Text color="subdued" as="span">
              {`Item drop count: ${customer.itemDropCount} items`}
            </Text>

            {isEditing ? (
              <Select
                label="Priority"
                labelInline
                options={priorityLevels}
                onChange={handlePriorityChange}
                value={customer.priority}
              />
            ) : (
              <Text color="subdued" as="span">
                {`Priority level: ${customer.priority}`}
              </Text>
            )}
          </LegacyStack>
        </LegacyCard.Section>
      </LegacyCard>
    );
  } else {
    return (
      <LegacyCard title="Customer" sectioned>
        <AutocompleteSearch
          type={'customer'}
          setCustomer={setCustomer}
        ></AutocompleteSearch>
      </LegacyCard>
    );
  }
}