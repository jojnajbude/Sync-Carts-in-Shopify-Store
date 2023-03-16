import { BrowserRouter } from 'react-router-dom'
import { NavigationMenu } from '@shopify/app-bridge-react'
import Routes from './Routes'

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from './components/providers'

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)')

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: 'Carts summary',
                  destination: '/summary',
                },
                {
                  label: 'Analytics',
                  destination: '/analytics',
                },
                {
                  label: 'Settings',
                  destination: '/settings',
                },
              ]}
            />
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  )
}
