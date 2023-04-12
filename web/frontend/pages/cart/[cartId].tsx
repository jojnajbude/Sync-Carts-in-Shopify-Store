import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '../../hooks';
import {
  Page,
  PageActions,
  LegacyCard,
  LegacyStack,
  Layout,
  Text,
  Toast,
  Frame,
  Link,
  Select,
  SkeletonPage,
  SkeletonBodyText,
} from '@shopify/polaris';

import CartBadge from '../../components/CartBadge';
import PopupModal from '../../components/PopupModal';
import ProductsList from '../../components/ProductsList';

import { formatter } from '../../services/formatter';

type Modal = 'remove' | 'unreserve' | 'expand' | 'update';

export default function Cart() {
  const [initialCart, setInitialCart] = useState(null);
  const [cart, setCart] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priority, setPriority] = useState('');
  const [currency, setCurrency] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<Modal>('remove');
  const [activeToast, setActiveToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCartUpdating, setIsCartUpdating] = useState(false);

  const [isTesting, setIsTesting] = useState(true);

  const { cartId } = useParams();
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    let ignore = false;

    if (isLoading && cartId !== 'create') {
      const getCartData = async () => {
        const cartData = await fetch(`/api/carts/get?cartId=${cartId}`);

        if (cartData.ok) {
          const [[cart], customer, [shop]] = await cartData.json();

          if (!ignore) {
            setInitialCart(cart);
            setCurrency(shop.currency);
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
  }, [isLoading]);

  const openModal = (type: Modal) => {
    setModalType(type);
    setShowModal(true);
  };

  const createModal = () => {
    return (
      <PopupModal
        type={modalType}
        selectedRows={[cartId]}
        setShowModal={setShowModal}
        setIsError={setIsError}
        setActiveToast={setActiveToast}
        setIsLoading={setIsLoading}
      />
    );
  };

  const toggleActiveToast = useCallback(
    () => setActiveToast(active => !active),
    [],
  );

  const toastMarkup = () => {
    switch (true) {
      case modalType === 'remove':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'All items successfully removed'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );

      case modalType === 'unreserve':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'All items successfully unreserved'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );

      case modalType === 'expand':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'All items timers successfully expand'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );
      case modalType === 'update':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'Cart updated successfully'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );
    }
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

  const updateCart = async (priority: string) => {
    setIsEditing(false);
    setIsCartUpdating(true);

    const customerUpdate = await fetch(
      `/api/customers/update?customerId=${customer.id}&priority=${priority}`,
    );

    if (customerUpdate.ok) {
      setIsError(false);
    } else {
      setIsError(true);
    }

    setModalType('update');
    toggleActiveToast();
    setIsCartUpdating(false);
  };

  const cancelChanges = () => {
    handlePriorityChange(cart.priority);
    setIsEditing(false);
  };

  if (!isLoading) {
    return (
      <Frame>
        <Page
          breadcrumbs={[{ onAction: () => navigate('/summary') }]}
          title={`Cart #${cartId}`}
          titleMetadata={
            <CartBadge indicator={cart.reserved_indicator}></CartBadge>
          }
          compactTitle
          secondaryActions={[
            {
              content: 'Send notification',
              disabled: true,
              onAction: () => console.log('works'),
            },
            {
              content: 'Edit card',
              disabled: true,
              onAction: () => setIsEditing(true),
            },
            {
              content: 'Delete cart',
              destructive: true,
              onAction: () => openModal('remove'),
            },
          ]}
        >
          <Layout>
            <Layout.Section>
              <ProductsList
                openModal={openModal}
                currency={currency}
                cart={cart}
                setCart={setCart}
                isEdit={isTesting}
              ></ProductsList>

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
                      {`${formatter(cart.total, currency)}`}
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
                      {cart.customer_name}
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
              <PageActions
                primaryAction={{
                  content: 'Save',
                  loading: isCartUpdating,
                  disabled: !isEditing,
                  onAction: () => updateCart(priority),
                }}
                secondaryActions={[
                  {
                    content: 'Discard',
                    disabled: !isEditing,
                    onAction: () => cancelChanges(),
                  },
                ]}
              />
            </Layout.Section>

            {showModal && createModal()}
            {activeToast && toastMarkup()}
          </Layout>
        </Page>
      </Frame>
    );
  } else {
    return (
      <SkeletonPage primaryAction backAction>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned title="Products">
              <LegacyCard.Section>
                <SkeletonBodyText />
              </LegacyCard.Section>
              <LegacyCard.Section>
                <SkeletonBodyText />
              </LegacyCard.Section>
              <LegacyCard.Section>
                <SkeletonBodyText />
              </LegacyCard.Section>
            </LegacyCard>
            <LegacyCard sectioned title="Payment">
              <SkeletonBodyText />
            </LegacyCard>
          </Layout.Section>
          <Layout.Section secondary>
            <LegacyCard title="Customer">
              <LegacyCard.Section>
                <SkeletonBodyText lines={2} />
              </LegacyCard.Section>
              <LegacyCard.Section title="Contact information">
                <SkeletonBodyText lines={2} />
              </LegacyCard.Section>
              <LegacyCard.Section title="Shipping address">
                <SkeletonBodyText lines={4} />
              </LegacyCard.Section>
              <LegacyCard.Section title="Statistic">
                <SkeletonBodyText lines={3} />
              </LegacyCard.Section>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }
}
