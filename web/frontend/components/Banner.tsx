import { useState } from 'react';
import { Layout, Banner } from '@shopify/polaris';

type Props = {
  type: 'none' | 'qty' | 'empty' | 'user' | 'more';
};

export default function InfoBanner({ type }: Props) {
  const [banner, setBanner] = useState(type);

  const config = {
    title: '',
    info: '',
  };

  switch (true) {
    case banner === 'qty':
      config.title = 'To save this draft cart, changes needs to be made:';
      config.info = 'Quantity must be greater than or equal to 1';
      break;

    case banner === 'empty':
      config.title = 'To save this draft cart, changes needs to be made:';
      config.info = "Cart can't be empty";
      break;

    case banner === 'user':
      config.title = 'To save this draft cart, changes needs to be made:';
      config.info = 'Cart must have customer';
      break;

    case banner === 'more':
      config.title = 'To save this draft cart, changes needs to be made:';
      config.info = 'Quantity must be equal or less of available at store';
      break;
  }

  return (
    <Layout.Section>
      <Banner title={config.title} status="critical">
        <p>{config.info}</p>
      </Banner>
    </Layout.Section>
  );
}
