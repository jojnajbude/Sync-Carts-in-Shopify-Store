import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  Toast,
  Divider,
  LegacyCard,
} from '@shopify/polaris';

import { useAuthenticatedFetch } from '../hooks';

import PopupModal from './PopupModal';
import TablePagination from './Pagination';
import IndexTableFilters from './IndexFilters';
import EmptyStateMarkup from './EmptyStateMarkup';
import CartBadge from './CartBadge';

type Sort = 'ascending' | 'descending';
type Modal = 'remove' | 'unreserve' | 'expand';

export default function CartsTable() {
  const [currency, setCurrency] = useState(null);
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<Sort>('descending');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<Modal>('remove');
  const [activeToast, setActiveToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [tableRowsPerPage, setTableRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const getCarts = async () => {
      try {
        if (isLoading) {
          const shop = await fetch('api/shop');
          const [shopData] = await shop.json();

          const result = await fetch('/api/carts/all');
          const cartData = await result.json();

          if (!ignore) {
            setCurrency(shopData.currency);
            setCarts(cartData);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    getCarts();
    getCurrentTableData();

    return () => {
      ignore = true;
    };
  }, [carts, isLoading, currency]);

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

  const handleSort = useCallback(
    async (index: number, direction: 'ascending' | 'descending') => {
      setIsLoading(true);

      const sortDirection =
        direction === 'descending' ? 'ascending' : 'descending';

      const carts = await fetch(
        `/api/carts/sort?dir=${direction}&index=${index}`,
      );
      const cartsData = await carts.json();

      setCarts(cartsData);
      setSortDirection(sortDirection);
      setIsLoading(false);
    },
    [carts, isLoading, sortDirection],
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

  const paginateData = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getCurrentTableData = () => {
    return carts.slice(
      currentPage * tableRowsPerPage - tableRowsPerPage,
      currentPage * tableRowsPerPage,
    );
  };

  return (
    <Layout>
      <Layout.Section>
        <LegacyCard>
          <IndexTableFilters
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setCarts={setCarts}
            setIsError={setIsError}
            setActiveToast={setActiveToast}
          />
          {!isLoading ? (
            <IndexTable
              onSort={handleSort}
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
              {getCurrentTableData().map(
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
                    onClick={() => navigate(`/cart/${id}`)}
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
                        currency: currency,
                      }).format(cartTotal)}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <CartBadge indicator={reserved_indicator}></CartBadge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{reservation_time}</IndexTable.Cell>
                    <IndexTable.Cell>{qty}</IndexTable.Cell>
                  </IndexTable.Row>
                ),
              )}
            </IndexTable>
          ) : (
            <EmptyStateMarkup rows={tableRowsPerPage} />
          )}
          {showModal && createModal()}
          {activeToast && toastMarkup()}
          <Divider borderStyle="dark" />
          <LegacyCard.Section>
            {carts.length > tableRowsPerPage && (
              <TablePagination
                tableRowsPerPage={tableRowsPerPage}
                totalData={carts.length}
                paginateData={paginateData}
                currentPage={currentPage}
              />
            )}
          </LegacyCard.Section>
        </LegacyCard>
      </Layout.Section>
    </Layout>
  );
}
