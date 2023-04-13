import {
  Autocomplete,
  LegacyStack,
  Text,
  Thumbnail,
  AlphaStack,
  Modal,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useCallback, useReducer } from 'react';

import { formatter } from '../services/formatter';
import VariantsList from './VariantsList';

type Props = {
  type: string;
  cart?: any;
  setCart?: (value: any) => void;
  setCustomer?: (value: any) => void;
};

type State = {
  isModalOpen: boolean;
  product: object | null;
  selectedOptions: any[];
  inputValue: string;
  options: any[];
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

  value?: any;
};

export default function AutocompleteSearch({
  type,
  cart,
  setCart,
  setCustomer,
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
  console.log(state);

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
      dispatch({ type: 'setInputValue', value });
      dispatch({ type: 'setLoading', value: true });

      let results = [];

      if (type === 'products') {
        const data = await fetch(`/api/products/find?input=${value}`);
        const products = await data.json();

        console.log(products);

        results = products.map((product: any) => ({
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

        results = customers.map((customer: any) => ({
          label: createCustomerOption(
            customer.node.displayName,
            customer.node.email,
          ),
          value: customer.node.id.split('/').slice(-1),
        }));
      }

      dispatch({ type: 'setOptions', value: results });
      dispatch({ type: 'setLoading', value: false });
    },
    [state.options],
  );

  const handleSelect = async ([selected]: string[]) => {
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
      console.log(customer);

      setCustomer(customer);
    }
  };

  const addItemToCart = async (variant: any) => {
    variant.qty = 1;
    const changedCart = { ...cart };

    const hasItem = changedCart.items.findIndex(
      (item: { variant_id: string }) => +item.variant_id === variant.id,
    );

    console.log(variant.id, changedCart.items);

    if (hasItem !== -1) {
      changedCart.items[hasItem].qty =
        Number(changedCart.items[hasItem].qty) + 1;
    } else {
      variant.variant_id = variant.id;
      changedCart.items = [...changedCart.items, variant];
    }

    setCart(changedCart);
    dispatch({ type: 'closeModal' });
  };

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
          <AlphaStack gap="3">
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {title}
            </Text>
          </AlphaStack>
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

  const createCustomerOption = (name: string, email: string) => {
    return (
      <LegacyStack>
        <LegacyStack.Item fill>
          <AlphaStack gap="3">
            <Text variant="bodyMd" as="p">
              {name}
            </Text>
            <Text variant="bodyMd" as="p" color="subdued">
              {email}
            </Text>
          </AlphaStack>
        </LegacyStack.Item>
      </LegacyStack>
    );
  };

  const optionList = state.options.slice(0, state.visibleOptionIndex);

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
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
              addItemToCart={addItemToCart}
            ></VariantsList>
          )}
        </Modal>
      )}
    </LegacyStack>
  );
}
