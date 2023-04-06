import { BrowserRouter } from 'react-router-dom';
import { NavigationMenu } from '@shopify/app-bridge-react';
import Routes from './Routes';

import { Provider } from 'react-redux';
import { store } from '../frontend/services/store';

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from './components/providers';

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <Provider store={store}>
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
                  {
                    label: 'Cart',
                    destination: '/cart',
                  },
                ]}
              />
              <Routes pages={pages} />
            </QueryProvider>
          </Provider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
