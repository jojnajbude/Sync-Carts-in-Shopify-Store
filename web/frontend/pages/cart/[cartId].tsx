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
  SkeletonPage,
  SkeletonBodyText,
} from '@shopify/polaris';

import CartBadge from '../../components/CartBadge';
import PopupModal from '../../components/PopupModal';
import ProductsList from '../../components/ProductsList';
import CustomerCard from '../../components/CustomerCard';

import { formatter } from '../../services/formatter';
import { Cart } from '../../types/cart';

type Modal = 'remove' | 'unreserve' | 'expand' | 'update';

export default function CartPage() {
  const [initialCart, setInitialCart] = useState(null);
  const [initialCustomer, setInitialCustomer] = useState(null);
  const [cart, setCart] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<Modal>('remove');
  const [activeToast, setActiveToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
            setInitialCustomer(customer);
            setCurrency(shop.currency);
            setCustomer(customer);
            setCart(cart);
            setIsLoading(false);
          }
        }
      };

      getCartData();
    } else if (isLoading && cartId === 'create') {
      const createCart = async () => {
        const newCart: Cart = {
          items: [],
        };

        const shopData = await fetch('/api/shop');
        const [shop] = await shopData.json();

        setIsEditing(true);
        setInitialCart(newCart);
        setInitialCustomer(null);
        setCurrency(shop.currency);
        setCustomer(null);
        setCart(newCart);
        setIsLoading(false);
      };

      createCart();
    }

    return () => {
      ignore = true;
    };
  }, [isLoading]);

  console.log(cart);
  console.log(customer);

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

  const saveCart = async () => {
    setIsSaving(true);

    if (cartId === 'create') {
      const newCartData = await fetch('/api/carts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: await JSON.stringify({ cart, customer }),
      });
      const newCart = await newCartData.json();

      if (newCartData.ok) {
        navigate(`/cart/${newCart.id}`);
      }
    } else {
      // customer changed

      // customer priority changed
      if (customer.priority !== initialCustomer.priority) {
        const newPriority = await fetch(
          `/api/customers/update?customerId=${customer.id}&priority=${customer.priority}`,
        );
      }

      // cart items changed
      const totalInitialQty = initialCart.items.reduce(
        (acc: number, cur: { qty: number | string }) => acc + Number(cur.qty),
        0,
      );

      const totalQty = cart.items.reduce(
        (acc: number, cur: { qty: number | string }) => acc + Number(cur.qty),
        0,
      );

      if (
        cart.items.length !== initialCart.items.length ||
        totalInitialQty !== totalQty
      ) {
        const updateCart = await fetch('/api/carts/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: await JSON.stringify(cart),
        });
        const newCart = await updateCart.json();
        console.log(newCart);
      }

      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const cancelChanges = () => {
    setCart(initialCart);
    setCustomer(initialCustomer);
    setIsEditing(false);
  };

  if (!isLoading) {
    return (
      <Frame>
        <Page
          breadcrumbs={[{ onAction: () => navigate('/summary') }]}
          title={cartId !== 'create' ? `Cart #${cartId}` : 'Create cart'}
          titleMetadata={
            cartId !== 'create' && cart ? (
              <CartBadge indicator={cart.reserved_indicator}></CartBadge>
            ) : null
          }
          compactTitle
          secondaryActions={
            !isEditing
              ? [
                  {
                    content: 'Send notification',
                    disabled: true,
                    onAction: () => console.log('works'),
                  },
                  {
                    content: 'Edit cart',
                    onAction: () => setIsEditing(true),
                  },
                  {
                    content: 'Delete cart',
                    destructive: true,
                    onAction: () => openModal('remove'),
                  },
                ]
              : []
          }
        >
          <Layout>
            <Layout.Section>
              <ProductsList
                openModal={openModal}
                currency={currency}
                cart={cart}
                setCart={setCart}
                isEditing={isEditing}
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
                      {`${cart.items.length ? cart.qty : 0} items`}
                    </Text>
                  </LegacyStack.Item>

                  <LegacyStack.Item>
                    <Text variant="bodyMd" as="p" alignment="end">
                      {`${
                        cart.items.length
                          ? formatter(cart.total, currency)
                          : formatter(0, currency)
                      }`}
                    </Text>
                  </LegacyStack.Item>
                </LegacyStack>
              </LegacyCard>
            </Layout.Section>

            <Layout.Section secondary>
              <CustomerCard
                isEditing={isEditing}
                cart={cart}
                setCart={setCart}
                customer={customer}
                setCustomer={setCustomer}
              ></CustomerCard>

              <PageActions
                primaryAction={{
                  content: 'Save',
                  disabled: !isEditing,
                  loading: isSaving,
                  onAction: () => saveCart(),
                }}
                secondaryActions={[
                  {
                    content: 'Discard',
                    disabled: !isEditing && isSaving,
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
