import { useCallback, useEffect, useState } from 'react'
import {
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  AlphaCard,
  Badge,
} from '@shopify/polaris'
import { useAuthenticatedFetch } from '../../hooks'
import { useGetShopCartsQuery } from '../../services/api'

export default function CartsTable() {
  const [carts, setCarts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useAuthenticatedFetch()
  // const carts = useGetShopCartsQuery()
  console.log(carts)

  useEffect(() => {
    const getShop = async () => {
      try {
        if (isLoading) {
          const result = await fetch('/api/carts/all')
          const cartData = await result.json()
          setCarts(cartData)
          setIsLoading(false)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getShop()
  }, [carts, isLoading])

  const resourceName = {
    singular: 'cart',
    plural: 'carts',
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(carts)

  const promotedBulkActions = [
    {
      content: 'Expend timers',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
    {
      content: 'Un-reserve all items',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
  ]
  const bulkActions = [
    {
      content: 'Send reminder',
      onAction: () => console.log('Todo: implement bulk add tags'),
    },
    {
      content: 'Remove all items',
      onAction: () => console.log('Todo: implement bulk remove tags'),
    },
  ]

  const createBadge = (indicator: string) => {
    switch (true) {
      case indicator === 'all':
        return (
          <Badge status="success" progress="complete">
            All items reserved
          </Badge>
        )

      case indicator === 'part':
        return (
          <Badge status="attention" progress="partiallyComplete">
            Partially reserved
          </Badge>
        )

      case indicator === 'no':
        return (
          <Badge status="warning" progress="incomplete">
            No items reserved
          </Badge>
        )
    }
  }

  const handleSort = useCallback(
    (index: number, direction: 'ascending' | 'descending') =>
      setCarts(sortCarts(carts, index, direction)),
    [carts]
  )

  function sortCarts(
    carts: any,
    index: number,
    direction: 'ascending' | 'descending'
  ): any {
    return carts.sort((rowA, rowB) => {
      const key = Object.keys(rowA)[index]
      const amountA = rowA[key]
      const amountB = rowB[key]

      console.log(amountA, amountB)

      if (typeof amountA === 'number') {
        return direction === 'descending'
          ? amountB - amountA
          : amountA - amountB
      } else {
        return direction === 'descending'
          ? amountB.localeCompare(amountA)
          : amountA.localeCompare(amountB)
      }
    })
  }

  return (
    <Layout>
      <Layout.Section>
        <AlphaCard>
          {
            <IndexTable
              resourceName={resourceName}
              itemCount={carts.length}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSort={handleSort}
              defaultSortDirection="descending"
              sortColumnIndex={4}
              onSelectionChange={handleSelectionChange}
              hasMoreItems
              bulkActions={bulkActions}
              promotedBulkActions={promotedBulkActions}
              sortable={[true, true, true, true, true, true, true, true]}
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
                    <IndexTable.Cell>{cartTotal}</IndexTable.Cell>
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
        </AlphaCard>
      </Layout.Section>
    </Layout>
  )
}
