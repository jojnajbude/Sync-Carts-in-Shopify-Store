import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '../../hooks';
import {
  Page,
  LegacyCard,
  LegacyStack,
  Layout,
  Text,
  ResourceList,
  Thumbnail,
  Link,
  Select,
  AlphaStack,
} from '@shopify/polaris';

import CartBadge from '../../components/Badge/CartBadge';
import Counter from '../../components/Counter/Counter';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priority, setPriority] = useState('');

  const { cartId } = useParams();
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    let ignore = false;

    if (isLoading && cartId !== 'create') {
      const getCartData = async () => {
        const cartData = await fetch(`/api/carts/get?cartId=${cartId}`);

        if (cartData.ok) {
          const [cart] = await cartData.json();
          const customerData = await fetch(
            `/api/customers/get?customerId=${cart.customer_shopify_id}`,
          );

          const customer = await customerData.json();

          const shop = await fetch(`/api/shop`);
          const [shopData] = await shop.json();

          customer.currency = shopData.currency;

          if (!ignore) {
            setCustomer(customer);
            setPriority(cart.priority);
            setCart(cart);
            setIsLoading(false);
          }
        }
      };

      getCartData();
    }

    return () => {
      ignore = true;
    };
  }, [cart]);

  console.log(cart);

  const priorityLevels = [
    { label: 'Minimal', value: 'min' },
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Max', value: 'max' },
  ];

  const handlePriorityChange = useCallback(
    (value: string) => setPriority(value),
    [],
  );

  const removeCart = async (cartId: string) => {
    const response = await fetch('/api/carts/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify([cartId]),
    });

    navigate(-1);
  };

  const formatter = (price: number) => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: customer.currency || 'USD',
    });

    return formatter.format(price);
  };

  if (cart) {
    return (
      <Page
        breadcrumbs={[{ onAction: () => navigate(-1) }]}
        title={`Cart #${cartId}`}
        titleMetadata={
          <CartBadge indicator={cart.reserved_indicator}></CartBadge>
        }
        compactTitle
        secondaryActions={[
          {
            content: 'Send notification',
            onAction: () => {},
          },
          {
            content: 'Mark as paid',
            onAction: () => {},
          },
          {
            content: 'Delete cart',
            destructive: true,
            onAction: () => removeCart(cartId),
          },
        ]}
      >
        <Layout>
          <Layout.Section>
            <LegacyCard
              title="Products"
              actions={[{ content: 'Reset reservation timers' }]}
              sectioned
            >
              <ResourceList
                resourceName={{ singular: 'product', plural: 'products' }}
                items={cart.items}
                renderItem={item => {
                  const {
                    id,
                    image_link,
                    createdAt,
                    price,
                    qty,
                    title,
                    variant_id,
                  } = item;

                  console.log(id, image_link, createdAt, price, qty, title);

                  return (
                    <ResourceList.Item
                      id={id}
                      url={`https://${cart.shop_domain}/admin/products/${variant_id}`}
                      accessibilityLabel={`View details for ${title}`}
                    >
                      <LegacyStack distribution="fill">
                        <Thumbnail
                          source={image_link}
                          alt={title}
                          size="large"
                        />

                        <LegacyStack.Item>
                          <AlphaStack gap="3">
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {title}
                            </Text>

                            <Counter
                              createdAt={createdAt}
                              priority={cart.priority}
                            ></Counter>

                            <Text variant="bodyMd" as="h3">
                              {`Amount: ${qty}`}
                            </Text>
                          </AlphaStack>
                        </LegacyStack.Item>

                        <LegacyStack.Item>
                          <Text variant="bodyMd" as="h3" alignment="end">
                            {`${formatter(price)} x ${qty}`}
                          </Text>
                        </LegacyStack.Item>

                        <LegacyStack.Item>
                          <Text variant="bodyMd" as="h3" alignment="end">
                            {formatter(Number(price) * Number(qty))}
                          </Text>
                        </LegacyStack.Item>
                      </LegacyStack>
                    </ResourceList.Item>
                  );
                }}
              />
            </LegacyCard>

            <LegacyCard title="Payment" sectioned>
              <LegacyStack distribution="fill">
                <LegacyStack.Item>
                  <Text variant="bodyMd" fontWeight="bold" as="h4">
                    Total
                  </Text>
                </LegacyStack.Item>

                <LegacyStack.Item fill>
                  <Text variant="bodyMd" as="h4">
                    {`${cart.qty} items`}
                  </Text>
                </LegacyStack.Item>

                <LegacyStack.Item>
                  <Text variant="bodyMd" as="p" alignment="end">
                    {`${formatter(cart.total)}`}
                  </Text>
                </LegacyStack.Item>
              </LegacyStack>
            </LegacyCard>
          </Layout.Section>

          <Layout.Section secondary>
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
          </Layout.Section>
        </Layout>
      </Page>
    );
  } else {
    return <div></div>;
  }
}
