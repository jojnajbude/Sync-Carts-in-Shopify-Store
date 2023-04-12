import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '../../hooks';
import {
  Page,
  PageActions,
  LegacyCard,
  LegacyStack,
  Layout,
  Text,
  ResourceList,
  Thumbnail,
  Link,
  Select,
  AlphaStack,
  Toast,
  Frame,
  SkeletonPage,
  SkeletonBodyText,
} from '@shopify/polaris';

import ProductsList from '../../components/ProductsList';
import CartBadge from '../../components/CartBadge';
import Counter from '../../components/Counter';
import PopupModal from '../../components/PopupModal';
import AutocompleteSearch from '../../components/AutocompleteSearch';

type Modal = 'remove' | 'unreserve' | 'expand' | 'update';

export default function CartEdit() {
  const { state } = useLocation();

  const [cart, setIsCart] = useState(state ? state.cart : null);
  const [customer, setCustomer] = useState(state ? state.customer : null);
  const [priority, setPriority] = useState(state ? state.priority : 'normal');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  const formatter = (price: number) => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: state ? state.currency : 'USD',
    });

    return formatter.format(price);
  };

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

  const openModal = (type: Modal) => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <Frame>
      <Page
        breadcrumbs={[{ onAction: () => navigate(-1) }]}
        title={`Cart editor`}
        compactTitle
      >
        <Layout>
          <Layout.Section>
            <LegacyCard title="Products" sectioned>
              <AutocompleteSearch
                type={'products'}
                setFunction={setIsCart}
              ></AutocompleteSearch>
              {cart && (
                <ProductsList
                  openModal={openModal}
                  currency={state.currency}
                  cart={cart}
                ></ProductsList>
              )}
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
                    {`${cart ? cart.qty : 0} items`}
                  </Text>
                </LegacyStack.Item>

                <LegacyStack.Item>
                  <Text variant="bodyMd" as="p" alignment="end">
                    {`${customer ? formatter(cart.total) : formatter(0)}`}
                  </Text>
                </LegacyStack.Item>
              </LegacyStack>
            </LegacyCard>
          </Layout.Section>

          <Layout.Section secondary>
            {customer ? (
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
            ) : (
              <LegacyCard title="Customer" sectioned>
                <AutocompleteSearch
                  type={'customer'}
                  setFunction={setCustomer}
                ></AutocompleteSearch>
              </LegacyCard>
            )}
          </Layout.Section>

          {/* {showModal && createModal()}
          {activeToast && toastMarkup()} */}
        </Layout>

        <PageActions
          primaryAction={{
            content: 'Save',
            loading: false,
            disabled: !isEditing,
            onAction: () => {},
          }}
          secondaryActions={[
            {
              content: 'Discard',
              disabled: !isEditing,
              onAction: () => {},
            },
          ]}
        />
      </Page>
    </Frame>
  );
}
