import { BrowserRouter } from 'react-router-dom';
import { NavigationMenu } from '@shopify/app-bridge-react';
import Routes from './Routes';

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from './components/providers';
import { PolarisVizProvider } from '@shopify/polaris-viz';
import { SubscribtionContextProvider } from './context/SubscribtionContext';

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <PolarisVizProvider>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: 'Carts',
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
                  {
                    label: 'Subscriptions',
                    destination: '/subscribe',
                  },
                  {
                    label: 'FAQ',
                    destination: '/faq',
                  },
                ]}
              />
              <SubscribtionContextProvider>
                <Routes pages={pages} />
              </SubscribtionContextProvider>
            </PolarisVizProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
