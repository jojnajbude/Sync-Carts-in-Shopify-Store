import { useCallback, useEffect, useState } from 'react';
import {
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  AlphaCard,
  Badge,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../../hooks';

import { Cart } from '../../types/cart';
import { Item } from '../../types/items';
import PopupModal from '../PopupModal/PopupModal';

type Sort = 'ascending' | 'descending';
type Modal = 'remove' | 'un-reserve' | 'expend';

export default function CartsTable() {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<Sort>('descending');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<Modal>('remove');
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    let ignore = false;

    const getCarts = async () => {
      try {
        if (isLoading) {
          const result = await fetch('/api/carts/all');
          const cartData = await result.json();

          if (cartData.length) {
            const table: Cart[] = [];

            for (const item of cartData) {
              const index = table.findIndex((cart) => cart.id === item.cart_id);
              if (index !== -1) {
                table[index].items.push(item);
              } else {
                table.push({
                  id: item.cart_id,
                  customer_name: item.name,
                  total: 0,
                  reserved_indicator: '',
                  reservation_time: undefined,
                  qty: 0,
                  items: [item],
                });
              }
            }

            for (const cart of table) {
              if (cart.items.every((item) => item.status === 'reserved')) {
                cart.reserved_indicator = 'all';
              } else if (
                cart.items.find((item) => item.status === 'reserved')
              ) {
                cart.reserved_indicator = 'part';
              } else {
                cart.reserved_indicator = 'no';
              }

              const total = cart.items.reduce(
                (acc: number, cur: Item) =>
                  acc + Number(cur.qty) * Number(cur.price),
                0
              );

              const qty = cart.items.reduce(
                (acc: number, cur: Item) => acc + Number(cur.qty),
                0
              );

              const shortestDate = cart.items.sort((a: Item, b: Item) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA.getTime() - dateB.getTime();
              })[0].createdAt;

              cart.qty = qty;
              cart.total = total;
              cart.reservation_time = new Date(shortestDate).toLocaleString();
            }

            if (!ignore) {
              setCarts(table);
              setIsLoading(false);
            }
          } else {
            if (!ignore) {
              setCarts(cartData);
              setIsLoading(false);
            }
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
      onAction: () => openModal('expend'),
    },
    {
      content: 'Un-reserve all items',
      onAction: () => openModal('un-reserve'),
    },
  ];
  const bulkActions = [
    {
      content: 'Send reminder',
      onAction: () => console.log('Todo: implement bulk add tags'),
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

  // const isDate = (str: string) => {
  //   const [y, M, d] = str.split(/[- : T Z]/);

  //   return y && Number(M) <= 12 && Number(d) <= 31 ? true : false;
  // };

  const sortCarts = (
    carts: Cart[],
    index: number,
    direction: 'ascending' | 'descending'
  ): Cart[] => {
    return [...carts].sort((rowA: Cart, rowB: Cart) => {
      const amountA = rowA[Object.keys(rowA)[index] as keyof Cart];
      const amountB = rowB[Object.keys(rowB)[index] as keyof Cart];

      if (typeof amountA === 'number' && typeof amountB === 'number') {
        return direction === 'descending'
          ? amountB - amountA
          : amountA - amountB;
      } else if (typeof amountA === 'string' && typeof amountB === 'string') {
        // if (isDate(amountA)) {
        //   return direction === 'descending'
        //     ? new Date(amountB).getTime() - new Date(amountA).getTime()
        //     : new Date(amountA).getTime() - new Date(amountB).getTime();
        // }

        return direction === 'descending'
          ? amountB.localeCompare(amountA)
          : amountA.localeCompare(amountB);
      }
    });
  };

  const handleSort = useCallback(
    (index: number, direction: 'ascending' | 'descending') => {
      const sortDirection =
        direction === 'descending' ? 'ascending' : 'descending';

      setCarts(sortCarts(carts, index, direction));
      setSortDirection(sortDirection);
    },
    [carts]
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
      />
    );
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
              hasMoreItems
              bulkActions={bulkActions}
              promotedBulkActions={promotedBulkActions}
              sortable={[true, true, true, true, true, true]}
              headings={[
                { title: 'Cart ID' },
                { title: 'Customer' },
                { title: 'Cart Total' },
                { title: 'Reserved Indicator' },
                { title: 'Shortest time for reserved items' },
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
                  index
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
                )
              )}
            </IndexTable>
          }
          {showModal && createModal()}
        </AlphaCard>
      </Layout.Section>
    </Layout>
  );
}
