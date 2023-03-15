import { useCallback, useState } from 'react'
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
import { DeleteMajor } from '@shopify/polaris-icons'

export default function cartsSummary() {
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
  ]

  const resourceName = {
    singular: 'cart',
    plural: 'carts',
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(initialCarts)

  const promotedBulkActions = [
    {
      content: 'Freeze timers',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
    {
      content: 'Unfreeze timers',
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

  const rowMarkup = initialCarts.map(
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
        <IndexTable.Cell>
          <Text fontWeight="semibold" as="span">
            {qty}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{cartTotal}</IndexTable.Cell>
        <IndexTable.Cell>{shortestTime}</IndexTable.Cell>
        <IndexTable.Cell>{customer}</IndexTable.Cell>
        <IndexTable.Cell>{email}</IndexTable.Cell>
        <IndexTable.Cell>{createBadge(reservedIndicator)}</IndexTable.Cell>
      </IndexTable.Row>
    )
  )

  return (
    <Page
      title="Carts summary"
      fullWidth
      primaryAction={<Button primary>Create new cart</Button>}
    >
      <Layout>
        <Layout.Section>
          <AlphaCard>
            {initialCarts.length ? (
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
                  { title: 'Items Quantity' },
                  { title: 'Cart Total' },
                  { title: 'Shortest time for reserved items' },
                  { title: 'Customer' },
                  { title: 'Email' },
                  { title: 'ReservedIndicator' },
                ]}
              >
                {rowMarkup}
              </IndexTable>
            ) : (
              <EmptySearchResult
                title={'No carts yet'}
                description={'Try changing the filters or search term'}
                withIllustration
              />
            )}
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
