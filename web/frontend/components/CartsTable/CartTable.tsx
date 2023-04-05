import { useCallback, useEffect, useState } from 'react';
import {
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  AlphaCard,
  Badge,
  Toast,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../../hooks';

import { Cart } from '../../types/cart';
import { Item } from '../../types/items';
import PopupModal from '../PopupModal/PopupModal';
import TablePagination from '../Pagination/Pagination';

type Sort = 'ascending' | 'descending';
type Modal = 'remove' | 'unreserve' | 'expand';

export default function CartsTable() {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<Sort>('descending');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<Modal>('remove');
  const [activeToast, setActiveToast] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    let ignore = false;

    const getCarts = async () => {
      try {
        if (isLoading) {
          const result = await fetch('/api/carts/all');
          const cartData = await result.json();

          if (!ignore) {
            setCarts(cartData);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    getCarts();

    return () => {
      ignore = true;
    };
  }, [carts, isLoading]);

  const resourceName = {
    singular: 'cart',
    plural: 'carts',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(carts);

  const promotedBulkActions = [
    {
      content: 'Expand timers',
      onAction: () => openModal('expand'),
    },
    {
      content: 'Un-reserve all items',
      onAction: () => openModal('unreserve'),
    },
  ];
  const bulkActions = [
    {
      content: 'Send reminder',
      onAction: () => {
        setIsError(true);
        setActiveToast(true);
      },
    },
    {
      content: 'Remove all items',
      onAction: () => openModal('remove'),
    },
  ];

  const createBadge = (indicator: string) => {
    switch (true) {
      case indicator === 'all':
        return (
          <Badge status="success" progress="complete">
            All items reserved
          </Badge>
        );

      case indicator === 'part':
        return (
          <Badge status="attention" progress="partiallyComplete">
            Partially reserved
          </Badge>
        );

      case indicator === 'no':
        return (
          <Badge status="warning" progress="incomplete">
            No items reserved
          </Badge>
        );
    }
  };

  const handleSort = useCallback(
    async (index: number, direction: 'ascending' | 'descending') => {
      setIsLoading(true);

      const sortDirection =
        direction === 'descending' ? 'ascending' : 'descending';

      const carts = await fetch(
        `/api/carts/get?dir=${direction}&index=${index}`,
      );
      const cartsData = await carts.json();

      setCarts(cartsData);
      setSortDirection(sortDirection);
      setIsLoading(false);
    },
    [carts],
  );

  const openModal = (type: Modal) => {
    setModalType(type);
    setShowModal(true);
  };

  const createModal = () => {
    return (
      <PopupModal
        type={modalType}
        selectedRows={selectedResources}
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
    }
  };

  return (
    <Layout>
      <Layout.Section>
        <AlphaCard>
          {
            <IndexTable
              onSort={handleSort}
              loading={isLoading}
              resourceName={resourceName}
              itemCount={carts.length}
              defaultSortDirection={sortDirection}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              bulkActions={bulkActions}
              promotedBulkActions={promotedBulkActions}
              sortable={[true, true, true, true, true, true]}
              headings={[
                { title: 'Cart ID' },
                { title: 'Customer' },
                { title: 'Cart Total' },
                { title: 'Reserved Indicator' },
                { title: 'Shortest expire time for items' },
                { title: 'Items Quantity' },
              ]}
            >
              {carts.map(
                (
                  {
                    id,
                    customer_name,
                    qty,
                    total: cartTotal,
                    reservation_time,
                    reserved_indicator,
                  },
                  index,
                ) => (
                  <IndexTable.Row
                    id={id}
                    key={id}
                    selected={selectedResources.includes(id)}
                    position={index}
                  >
                    <IndexTable.Cell>
                      <Text fontWeight="semibold" as="span">
                        {id}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{customer_name}</IndexTable.Cell>
                    <IndexTable.Cell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(cartTotal)}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {createBadge(reserved_indicator)}
                    </IndexTable.Cell>
                    <IndexTable.Cell>{reservation_time}</IndexTable.Cell>
                    <IndexTable.Cell>{qty}</IndexTable.Cell>
                  </IndexTable.Row>
                ),
              )}
            </IndexTable>
          }
          {showModal && createModal()}
          {activeToast && toastMarkup()}
          {carts.length > 25 && <TablePagination />}
        </AlphaCard>
      </Layout.Section>
    </Layout>
  );
}
