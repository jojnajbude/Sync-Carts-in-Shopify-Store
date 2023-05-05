import {
  Autocomplete,
  LegacyStack,
  Text,
  Thumbnail,
  Modal,
  Icon,
  VerticalStack,
  LegacyCard,
} from '@shopify/polaris';
import { SearchMinor } from '@shopify/polaris-icons';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useCallback, useReducer } from 'react';

import VariantsList from './VariantsList';
import { formatter } from '../services/formatter';

import { Cart, Item } from '../types/cart';
import { Customer } from '../types/customer';

type Props = {
  type: string;
  cart?: Cart;
  currency?: string;
  setCart?: (value: Cart) => void;
  setCustomer?: (value: Customer) => void;
  setIsUnvalidInputs: (value: string) => void;
};

type State = {
  isModalOpen: boolean;
  product: object | null;
  selectedOptions: string[];
  inputValue: string;
  options: string[];
  isLoading: boolean;
  willLoadMoreResults: boolean;
  visibleOptionIndex: number;
};

type Action = {
  type:
    | 'setLoading'
    | 'changeVisibleOptionIndex'
    | 'setLoadMoreResults'
    | 'setInputValue'
    | 'setVariantModal'
    | 'closeModal'
    | 'setOptions';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
};

type GraphQlProduct = {
  node: {
    title: string;
    image: { url: string };
    totalInventory: string;
    priceRangeV2: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    id: string;
  };
};

type GraphQlCustomer = {
  node: {
    id: string;
    displayName: string;
    email: string;
    hasCart: boolean;
  };
};

export default function AutocompleteSearch({
  type,
  cart,
  currency,
  setCart,
  setCustomer,
  setIsUnvalidInputs,
}: Props) {
  const paginationInterval = 25;

  const initialState: State = {
    isModalOpen: false,
    product: null,
    selectedOptions: [],
    inputValue: '',
    options: [],
    isLoading: false,
    willLoadMoreResults: true,
    visibleOptionIndex: paginationInterval,
  };

  function reducer(state: State, action: Action) {
    switch (action.type) {
      case 'setLoading':
        return { ...state, isLoading: action.value };

      case 'changeVisibleOptionIndex':
        return { ...state, visibleOptionIndex: action.value };

      case 'setLoadMoreResults':
        return { ...state, willLoadMoreResults: action.value };

      case 'setInputValue':
        return { ...state, inputValue: action.value };

      case 'setOptions':
        return { ...state, options: action.value };

      case 'setVariantModal':
        return { ...state, isModalOpen: true, product: action.value };

      case 'closeModal':
        return { ...state, isModalOpen: false, product: null };

      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const fetch = useAuthenticatedFetch();

  const handleLoadMoreResults = useCallback(() => {
    if (state.willLoadMoreResults) {
      dispatch({ type: 'setLoading', value: true });

      setTimeout(() => {
        const remainingOptionCount =
          state.options.length - state.visibleOptionIndex;
        const nextVisibleOptionIndex =
          remainingOptionCount >= paginationInterval
            ? state.visibleOptionIndex + paginationInterval
            : state.visibleOptionIndex + remainingOptionCount;

        dispatch({ type: 'setLoading', value: false });
        dispatch({
          type: 'changeVisibleOptionIndex',
          value: nextVisibleOptionIndex,
        });

        if (remainingOptionCount <= paginationInterval) {
          dispatch({ type: 'setLoadMoreResults', value: false });
        }
      }, 1000);
    }
  }, [
    state.willLoadMoreResults,
    state.visibleOptionIndex,
    state.options.length,
  ]);

  const updateText = useCallback(
    async (value: string) => {
      setIsUnvalidInputs('none');
      dispatch({ type: 'setInputValue', value });
      dispatch({ type: 'setLoading', value: true });

      let results = [];

      if (type === 'products') {
        const data = await fetch(`/api/products/find?input=${value}`);
        const products = await data.json();

        results = products.map((product: GraphQlProduct) => ({
          label: createProductOption(
            product.node.title,
            product.node.image.url,
            product.node.totalInventory,
            product.node.priceRangeV2.minVariantPrice.amount,
            product.node.priceRangeV2.minVariantPrice.currencyCode,
          ),
          value: product.node.id,
        }));
      } else {
        const data = await fetch(`/api/customers/get/all?input=${value}`);
        const customers = await data.json();

        results = customers.map((customer: GraphQlCustomer) => ({
          label: createCustomerOption(
            customer.node.displayName,
            customer.node.email,
            customer.node.hasCart,
          ),
          disabled: customer.node.hasCart,
          value: customer.node.id.split('/').slice(-1),
        }));
      }

      dispatch({ type: 'setOptions', value: results });
      dispatch({ type: 'setLoading', value: false });
    },
    [state.options],
  );

  const handleSelect = async ([selected]: string[]) => {
    setIsUnvalidInputs('none');
    if (type === 'products') {
      dispatch({ type: 'setVariantModal', value: null });

      const productId = selected.split('/').slice(-1)[0];

      const data = await fetch(`/api/products/get?id=${productId}`);
      const productWithVariants = await data.json();

      dispatch({ type: 'setVariantModal', value: productWithVariants });
    } else {
      const customerId = selected;
      const customerData = await fetch(
        `/api/customers/get?customerId=${customerId}`,
      );
      const customer = await customerData.json();

      setCustomer(customer);
    }
  };

  const addItemToCart = async (variant: Item) => {
    variant.qty = 1;
    const changedCart = { ...cart };

    const hasItem = changedCart.items.findIndex(
      (item: Item) => +item.variant_id === variant.id,
    );

    if (hasItem !== -1) {
      changedCart.items[hasItem].qty =
        Number(changedCart.items[hasItem].qty) + 1;

      changedCart.items[hasItem].reserved_indicator = 'unsynced';
    } else {
      variant.variant_id = variant.id;
      variant.reserved_indicator = 'added';
      changedCart.items = [...changedCart.items, variant];
    }

    if (!changedCart.total) {
      changedCart.qty = 1;
      changedCart.total = Number(variant.price);
    } else {
      const total = changedCart.items.reduce(
        (acc: number, cur: Item) => acc + Number(cur.qty) * Number(cur.price),
        0,
      );

      const qty = changedCart.items.reduce(
        (acc: number, cur: Item) => acc + Number(cur.qty),
        0,
      );

      changedCart.total = total;
      changedCart.qty = qty;
    }

    setCart(changedCart);
    dispatch({ type: 'closeModal' });
  };

  const emptyState = (
    <>
      <Icon color="subdued" source={SearchMinor} />
      <div style={{ textAlign: 'center' }}>
        <Text color="subdued" as="span">
          Could not find any results
        </Text>
      </div>
    </>
  );

  const createProductOption = (
    title: string,
    url: string,
    totalInventory: string,
    price: string,
    currency: string,
  ) => {
    return (
      <LegacyStack>
        <Thumbnail source={url} alt={title} size="small" />

        <LegacyStack.Item>
          <VerticalStack gap="3">
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {title}
            </Text>
          </VerticalStack>
        </LegacyStack.Item>

        <LegacyStack.Item>
          <Text variant="bodyMd" as="h3" alignment="end">
            {`${totalInventory} available`}
          </Text>
        </LegacyStack.Item>

        <LegacyStack.Item>
          <Text variant="bodyMd" as="h3" alignment="end">
            {formatter(Number(price), currency)}
          </Text>
        </LegacyStack.Item>
      </LegacyStack>
    );
  };

  const createCustomerOption = (
    name: string,
    email: string,
    hasCart: boolean,
  ) => {
    return (
      <LegacyStack>
        <LegacyStack.Item fill>
          <VerticalStack gap="3">
            <Text variant="bodySm" as="span">
              {name}
            </Text>
            <Text variant="bodySm" as="span" color="subdued">
              {email}
            </Text>
            {hasCart && (
              <Text variant="bodySm" as="span" color="success">
                This customer already has а cart
              </Text>
            )}
          </VerticalStack>
        </LegacyStack.Item>
      </LegacyStack>
    );
  };

  const optionList = state.options.slice(0, state.visibleOptionIndex);

  const textField = (
    <Autocomplete.TextField
      prefix={<Icon source={SearchMinor} color="base" />}
      onChange={updateText}
      onFocus={() => updateText(state.inputValue)}
      label={''}
      value={state.inputValue}
      placeholder={type === 'products' ? 'Search products' : 'Search customer'}
      autoComplete="off"
    />
  );

  return (
    <LegacyStack vertical>
      <Autocomplete
        options={optionList}
        selected={state.selectedOptions}
        textField={textField}
        onSelect={selected => handleSelect(selected)}
        loading={state.isLoading}
        onLoadMoreResults={handleLoadMoreResults}
        willLoadMoreResults={state.willLoadMoreResults}
        emptyState={emptyState}
      />
      {state.isModalOpen && (
        <Modal
          open={state.isModalOpen}
          title="Select variant"
          loading={!state.product}
          onClose={() => dispatch({ type: 'closeModal' })}
        >
          {state.product && (
            <VariantsList
              product={state.product}
              currency={currency}
              addItemToCart={addItemToCart}
            ></VariantsList>
          )}
        </Modal>
      )}
    </LegacyStack>
  );
}
