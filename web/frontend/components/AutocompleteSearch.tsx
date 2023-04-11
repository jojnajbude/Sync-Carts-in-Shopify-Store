import {
  Autocomplete,
  LegacyStack,
  Text,
  Thumbnail,
  AlphaStack,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useState, useCallback } from 'react';

import { formatter } from '../services/formatter';

type Props = {
  type: string;
  setFunction: (value: any) => void;
};

export default function AutocompleteSearch({ type, setFunction }: Props) {
  const paginationInterval = 25;
  const deselectedOptions = Array.from(Array(100)).map((_, index) => ({
    value: `product ${index + 1}`,
    label: `Product ${index + 1}`,
  }));

  const searchSettings = (type: string) => {
    switch (true) {
      case type === 'products':
        return {
          placeholder: 'Search products',
        };

      case type === 'customer':
        return {
          placeholder: 'Search customer',
        };
    }
  };

  const [searchType, setSearchType] = useState(searchSettings(type));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
  const [visibleOptionIndex, setVisibleOptionIndex] =
    useState(paginationInterval);

  const fetch = useAuthenticatedFetch();

  const handleLoadMoreResults = useCallback(() => {
    if (willLoadMoreResults) {
      setIsLoading(true);

      setTimeout(() => {
        const remainingOptionCount = options.length - visibleOptionIndex;
        const nextVisibleOptionIndex =
          remainingOptionCount >= paginationInterval
            ? visibleOptionIndex + paginationInterval
            : visibleOptionIndex + remainingOptionCount;

        setIsLoading(false);
        setVisibleOptionIndex(nextVisibleOptionIndex);

        if (remainingOptionCount <= paginationInterval) {
          setWillLoadMoreResults(false);
        }
      }, 1000);
    }
  }, [willLoadMoreResults, visibleOptionIndex, options.length]);

  const updateText = useCallback(
    async (value: string) => {
      setInputValue(value);
      setIsLoading(true);

      let results = [];

      if (type === 'products') {
        const data = await fetch(`/api/products/get?input=${value}`);
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

      setOptions(results);
      setInputValue;
      setIsLoading(false);
    },
    [deselectedOptions, options],
  );

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label={''}
      value={inputValue}
      placeholder={searchType.placeholder}
      autoComplete="off"
    />
  );

  const addSelectedResult = selected => {
    console.log(selected);
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

        <LegacyStack.Item fill>
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

  const optionList = options.slice(0, visibleOptionIndex);

  return (
    <LegacyStack vertical>
      <Autocomplete
        options={optionList}
        selected={selectedOptions}
        textField={textField}
        onSelect={addSelectedResult}
        loading={isLoading}
        onLoadMoreResults={handleLoadMoreResults}
        willLoadMoreResults={willLoadMoreResults}
      />
    </LegacyStack>
  );
}
