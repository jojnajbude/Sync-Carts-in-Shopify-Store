import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
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
  Banner,
  FooterHelp,
} from '@shopify/polaris';

import CartBadge from '../../components/CartBadge';
import PopupModal from '../../components/PopupModal';
import ProductsList from '../../components/ProductsList';
import CustomerCard from '../../components/CustomerCard';
import InfoBanner from '../../components/Banner';

import { formatter } from '../../services/formatter';
import { Cart } from '../../types/cart';
import { SubscribtionContext } from '../../context/SubscribtionContext';

import { io } from 'socket.io-client';
import { useSocket } from '../../hooks/useSocket';

type Modal =
  | 'remove'
  | 'unreserve'
  | 'expand'
  | 'update'
  | 'reminder'
  | 'emailError'
  | 'remove-cart';

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
  const [isUnvalidInputs, setIsUnvalidInputs] = useState<string>('none');
  const [isPriorityChange, setIsPriorityChange] = useState(false);

  const [cartTotalPrice, setCartTotalPrice] = useState(0);

  const { cartId } = useParams();

  const {
    socket,
    data: items,
    isOnline,
    synchronize,

  } = useSocket(customer, cartId);

  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
  const context = useContext(SubscribtionContext);

  useEffect(() => {
    if (!items || !Array.isArray(items)) {
      return;
    }

    setInitialCart((current: Cart) => ({
      ...current,
      items: [...items],
    }))
    setCart((current: Cart) => ({
      ...current,
      items: [...items],
    }))
  }, [items]);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return;
    }

    setCartTotalPrice(cart.items.reduce((acc: number, cur: any) => acc + Number(cur.qty) * Number(cur.price), 0));
  }, [cart]);

  useEffect(() => {
    const jsonCart = JSON.stringify(cart);
    const jsonInitialCart = JSON.stringify(initialCart);

    if (jsonCart !== jsonInitialCart) {
      synchronize({
        admin: true,
        cart: initialCart
      });
    }  
  }, [initialCart])

  useEffect(() => {
    let ignore = false;

    if (isLoading && cartId !== 'create') {
      const getCartData = async () => {
        const cartData = await fetch(`/api/carts/get?cartId=${cartId}`);

        if (cartData.ok) {
          const [[cart], customer, [shop]] = await cartData.json();
          console.log(cart, customer, shop)
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
    } else if (isLoading && cartId === 'create' && context.plan) {
      const createCart = () => {
        const newCart: Cart = {
          items: [],
          id: 0,
          customer_name: '',
          customer_shopify_id: '',
          priority: 'max',
          shop_domain: '',
          total: 0,
          reserved_indicator: 'all',
          reservation_time: '',
          qty: 0,
          last_action: '',
        };

        setIsEditing(true);
        setInitialCart(newCart);
        setInitialCustomer(null);
        setCurrency(context.plan.currency);
        setCustomer(null);
        setCart(newCart);
        setIsLoading(false);
      };

      if (!ignore) {
        createCart();
      }
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
      case modalType === 'reminder':
        return (
          <Toast
            content="Email reminder was sent."
            onDismiss={toggleActiveToast}
          />
        );

      case modalType === 'emailError':
        return (
          <Toast
            content="Can't send email. Try again later."
            error={true}
            onDismiss={toggleActiveToast}
          />
        );
    }
  };

  const saveCart = async () => {
    if (cart.items.find((item: { qty: any }) => Number(item.qty) <= 0)) {
      setIsUnvalidInputs('qty');
      return;
    } else if (!cart.items.length) {
      setIsUnvalidInputs('empty');
      return;
    } else if (!customer) {
      setIsUnvalidInputs('user');
      return;
    } else {
      setIsUnvalidInputs('none');
    }

    setIsSaving(true);

    if (cartId === 'create') {
      const newCartData = await fetch('/api/carts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart, customer }),
      });

      if (newCartData.ok) {
        navigate(`/summary`);
      }
    } else {
      if (customer.priority !== initialCustomer.priority) {
        await fetch(
          `/api/customers/update?customerId=${customer.id}&priority=${customer.priority}`,
        );
      }
      if (
        initialCart.qty !== cart.qty ||
        initialCart.total !== cart.total ||
        initialCart.items.length !== cart.items.length
      ) {
        await fetch('/api/carts/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([cart, customer]),
        });
      }

      setIsSaving(false);
      setIsEditing(false);
      setIsPriorityChange(false);
      setIsLoading(true);
    }
  };

  const cancelChanges = () => {
    setIsUnvalidInputs('none');
    setCart(initialCart);
    setCustomer(initialCustomer);
    setIsLoading(true);
    setIsEditing(false);
  };

  const sendReminder = async (type: string, cart: any, customer: any) => {
    const emailSend = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify({ type, cart, customer }),
    });

    if (!emailSend.ok) {
      setModalType('emailError');
      setActiveToast(true);
      return;
    }

    setModalType('reminder');
    setActiveToast(true);
  };

  if (cartId === 'create' && context && context.plan && context.plan.carts >= context.plan.limit) {
    return (
      <Page backAction={{ onAction: () => navigate('/summary') }}>
        <Layout>
          <Layout.Section>
            <Banner
              title="Cart limit reached!"
              action={{
                content: 'Upgrade plan',
                onAction: () => navigate('/subscribe'),
              }}
              status="warning"
            >
              <p>Upgrade plan to take control of all shopping carts!</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (!isLoading) {
    return (
      <Frame>
        <Page
          backAction={{ onAction: () => navigate('/summary') }}
          title={
            cartId !== 'create'
              ? `${
                  cart.customer_name || customer.first_name + customer.last_name
                } cart`
              : 'Create cart'
          }
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
                    onAction: () => sendReminder('reminder', cart, customer),
                  },
                  {
                    content: 'Edit cart',
                    disabled: cart.reserved_indicator === 'paid',
                    onAction: () => setIsEditing(true),
                  },
                  {
                    content: 'Delete cart',
                    destructive: cart.reserved_indicator !== 'paid',
                    disabled: cart.reserved_indicator === 'paid',
                    onAction: () => openModal('remove'),
                  },
                ]
              : []
          }
        >
          <Layout>
            {isUnvalidInputs !== 'none' && (
              <InfoBanner type={isUnvalidInputs}></InfoBanner>
            )}

            <Layout.Section>
              <ProductsList
                openModal={openModal}
                currency={currency}
                cart={cart}
                setCart={setCart}
                isEditing={isEditing}
                setIsUnvalidInputs={setIsUnvalidInputs}
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
                          ? formatter(cartTotalPrice, currency)
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
                isOnline={isOnline}
                setCart={setCart}
                customer={customer}
                initialCustomer={initialCustomer}
                setCustomer={setCustomer}
                setIsUnvalidInputs={setIsUnvalidInputs}
                setIsPriorityChange={setIsPriorityChange}
                setIsLoading={setIsLoading}
                setIsEditing={setIsEditing}
              ></CustomerCard>

              <PageActions
                primaryAction={{
                  content: 'Save',
                  disabled:
                    (!isEditing && !isPriorityChange) ||
                    isUnvalidInputs !== 'none',
                  loading: isSaving,
                  onAction: () => saveCart(),
                }}
                secondaryActions={[
                  {
                    content: 'Discard',
                    disabled: !isEditing && !isPriorityChange,
                    onAction: () => cancelChanges(),
                  },
                ]}
              />
            </Layout.Section>

            {showModal && createModal()}
            {activeToast && toastMarkup()}
          </Layout>

          <FooterHelp>© Simplify Apps. All rights reserved.</FooterHelp>
        </Page>
      </Frame>
    );
  }

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
