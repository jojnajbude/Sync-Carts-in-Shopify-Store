import { useEffect, useState } from 'react'
import {
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  AlphaCard,
  Badge,
} from '@shopify/polaris'
import { useAuthenticatedFetch } from '../../hooks'

import { Cart } from '../../types/cart'
import { Item } from '../../types/items'

export default function CartsTable() {
  const [carts, setCarts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    let ignore = false

    const getCarts = async () => {
      try {
        if (isLoading) {
          const result = await fetch('/api/carts/all')
          const cartData = await result.json()
          const table: Cart[] = []
          console.log(cartData)

          for (const item of cartData) {
            const index = table.findIndex((cart) => cart.id === item.cart_id)
            if (index !== -1) {
              table[index].items.push(item)
            } else {
              table.push({
                id: item.cart_id,
                customer_name: item.name,
                items: [item],
                total: 0,
                reserved_indicator: '',
                reservation_time: undefined,
                qty: 0,
              })
            }
          }

          for (const cart of table) {
            if (cart.items.every((item) => item.createdAt)) {
              cart.reserved_indicator = 'all'
            } else if (cart.items.find((item) => item.createdAt)) {
              cart.reserved_indicator = 'part'
            } else {
              cart.reserved_indicator = 'no'
            }

            const total = cart.items.reduce(
              (acc: number, cur: Item) =>
                acc + Number(cur.qty) * Number(cur.price),
              0
            )

            const qty = cart.items.reduce(
              (acc: number, cur: Item) => acc + Number(cur.qty),
              0
            )

            const shortestDate = cart.items.sort((a: Item, b: Item) => {
              const dateA = new Date(a.createdAt)
              const dateB = new Date(b.createdAt)
              return dateA.getTime() - dateB.getTime()
            })[0].createdAt

            cart.qty = qty
            cart.total = total
            cart.reservation_time = shortestDate
          }

          if (!ignore) {
            setCarts(table)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    getCarts()

    return () => {
      ignore = true
    }
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

  // const handleSort = useCallback(
  //   (index: number, direction: 'ascending' | 'descending') =>
  //     setCarts(sortCarts(carts, index, direction)),
  //   [carts]
  // )

  // function sortCarts(
  //   carts: Cart[],
  //   index: number,
  //   direction: 'ascending' | 'descending'
  // ): Cart[] {
  //   return carts.sort((rowA: Cart, rowB: Cart) => {
  //     const key = Object.keys(rowA)[index]
  //     const amountA = rowA[key]
  //     const amountB = rowB[key]

  //     console.log(amountA, amountB)

  //     if (typeof amountA === 'number') {
  //       return direction === 'descending'
  //         ? amountB - amountA
  //         : amountA - amountB
  //     } else {
  //       return direction === 'descending'
  //         ? amountB.localeCompare(amountA)
  //         : amountA.localeCompare(amountB)
  //     }
  //   })
  // }

  return (
    <Layout>
      <Layout.Section>
        <AlphaCard>
          {
            <IndexTable
              loading={carts.length ? false : true}
              resourceName={resourceName}
              itemCount={carts.length}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              // onSort={handleSort}
              defaultSortDirection="descending"
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
        </AlphaCard>
      </Layout.Section>
    </Layout>
  )
}
