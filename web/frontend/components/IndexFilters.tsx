import { IndexFilters, useSetIndexFiltersMode } from '@shopify/polaris';
import type { AlphaTabProps } from '@shopify/polaris';
import React, { useState, useCallback } from 'react';
import { Cart } from '../types/cart';
import { useAuthenticatedFetch } from '@shopify/app-bridge-react';

type Props = {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setCarts: (carts: Cart[]) => void;
  setIsError: (val: boolean) => void;
  setActiveToast: (val: boolean) => void;
};

const IndexTableFilters: React.FC<Props> = ({
  isLoading,
  setIsLoading,
  setCarts,
  setIsError,
  setActiveToast,
}) => {
  const [itemStrings, setItemStrings] = useState([
    'All carts',
    'All items reserved',
    'Partially reserved',
    'No items reserved',
  ]);
  const [selected, setSelected] = useState(0);
  const [queryValue, setQueryValue] = useState<string>('');

  const fetch = useAuthenticatedFetch();
  const { mode, setMode } = useSetIndexFiltersMode();

  const handleFiltering = async (index: number) => {
    setIsLoading(true);

    let result = null;

    if (index === 0) {
      result = await fetch('/api/carts/sort?dir=ascending&index=0');
    } else {
      result = await fetch(`/api/carts/filter?index=${index}`);
    }

    const carts = await result.json();
    setCarts(carts);
    setIsLoading(false);
  };

  const tabs: AlphaTabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => handleFiltering(index),
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: 'rename',
              onPrimaryAction: async (value: string) => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                setItemStrings(newItemsStrings);
                return true;
              },
            },
          ],
  }));

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );

  return (
    <IndexFilters
      hideFilters
      hideQueryField
      queryValue={queryValue}
      queryPlaceholder="Search by customers"
      onQueryChange={handleFiltersQueryChange}
      onQueryClear={() => setQueryValue('')}
      cancelAction={{
        onAction: null,
        loading: false,
      }}
      tabs={tabs}
      selected={selected}
      onSelect={setSelected}
      canCreateNewView={false}
      filters={[]}
      onClearAll={null}
      mode={mode}
      setMode={setMode}
      loading={isLoading}
    />
  );
};

export default IndexTableFilters;
