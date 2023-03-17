import { useCallback, useEffect, useState } from 'react'
import {
  Page,
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  AlphaCard,
  Button,
  Badge,
  Icon,
  EmptySearchResult,
} from '@shopify/polaris'
import { useAuthenticatedFetch, useAppQuery } from '../hooks'

export default function cartsSummary() {
  const [carts, setCarts] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    const getShop = async () => {
      try {
        const result = await fetch('/api/carts/all')
        const cartData = await result.json()
        setCarts(cartData)
      } catch (error) {
        console.log(error)
      }
    }

    getShop()
  })

  const initialCarts = [
    {
      id: '3414',
      qty: '24',
      cartTotal: `$1833`,
      shortestTime: '1 hour 23 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '2677',
      qty: '13',
      cartTotal: `$2117`,
      shortestTime: '7 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'part',
    },
    {
      id: '1133',
      qty: '2',
      cartTotal: `$863`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '12',
      qty: '76',
      cartTotal: `$12`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '64634',
      qty: '4',
      cartTotal: `$654`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'part',
    },
    {
      id: '746',
      qty: '762',
      cartTotal: `$32`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '45784',
      qty: '23',
      cartTotal: `$543`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '11533',
      qty: '1',
      cartTotal: `$123`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '424135',
      qty: '7657',
      cartTotal: `$864`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'part',
    },
    {
      id: '123',
      qty: '3',
      cartTotal: `$431`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '653',
      qty: '43',
      cartTotal: `$982`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'part',
    },
    {
      id: '747567',
      qty: '23',
      cartTotal: `$127`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'part',
    },
    {
      id: '789878',
      qty: '76',
      cartTotal: `$1`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '65463',
      qty: '976',
      cartTotal: `$23`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '99753',
      qty: '456',
      cartTotal: `$47`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '65763',
      qty: '1234',
      cartTotal: `$54`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '54785',
      qty: '2',
      cartTotal: `$87`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '246576',
      qty: '134',
      cartTotal: `$123`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '2368',
      qty: '344',
      cartTotal: `$674`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '7647',
      qty: '312',
      cartTotal: `$1321`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '24357',
      qty: '423',
      cartTotal: `$8712`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '2467',
      qty: '423',
      cartTotal: `$6433`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
    {
      id: '32468',
      qty: '45',
      cartTotal: `$7890`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'part',
    },
    {
      id: '14342',
      qty: '31',
      cartTotal: `$1275`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'all',
    },
    {
      id: '235678',
      qty: '432',
      cartTotal: `$2617`,
      shortestTime: '6 hours 5 minutes',
      customer: 'Blake Rogers',
      email: 'email@email',
      reservedIndicator: 'no',
    },
  ]

  const resourceName = {
    singular: 'cart',
    plural: 'carts',
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(initialCarts)

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

  // const rowMarkup = carts.map(
  //   (
  //     { id, qty, cartTotal, shortestTime, customer, email, reservedIndicator },
  //     index
  //   ) => (
  //     <IndexTable.Row
  //       id={id}
  //       key={id}
  //       selected={selectedResources.includes(id)}
  //       position={index}
  //     >
  //       <IndexTable.Cell>
  //         <Text fontWeight="semibold" as="span">
  //           {id}
  //         </Text>
  //       </IndexTable.Cell>
  //       <IndexTable.Cell>{customer}</IndexTable.Cell>
  //       <IndexTable.Cell>{cartTotal}</IndexTable.Cell>
  //       <IndexTable.Cell>{createBadge(reservedIndicator)}</IndexTable.Cell>
  //       <IndexTable.Cell>{shortestTime}</IndexTable.Cell>
  //       <IndexTable.Cell>{qty}</IndexTable.Cell>
  //     </IndexTable.Row>
  //   )
  // )

  return (
    <Page
      title="Carts summary"
      fullWidth
      primaryAction={<Button primary>Create new cart</Button>}
    >
      <Layout>
        <Layout.Section>
          <AlphaCard>
            {
              <IndexTable
                resourceName={resourceName}
                itemCount={initialCarts.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
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
                    { id, qty, cartTotal, shortestTime, customer, email, reservedIndicator },
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
                      <IndexTable.Cell>{customer}</IndexTable.Cell>
                      <IndexTable.Cell>{cartTotal}</IndexTable.Cell>
                      <IndexTable.Cell>{createBadge(reservedIndicator)}</IndexTable.Cell>
                      <IndexTable.Cell>{shortestTime}</IndexTable.Cell>
                      <IndexTable.Cell>{qty}</IndexTable.Cell>
                    </IndexTable.Row>
                  )
                )}
              </IndexTable>
            }
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
