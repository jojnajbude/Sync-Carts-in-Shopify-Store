import {
  Page,
  FooterHelp,
  Layout,
  LegacyCard,
  TextField,
  Form,
  FormLayout,
} from '@shopify/polaris';
import { useCallback, useState } from 'react';

export default function Settings() {
  const [value, setValue] = useState('1');

  const handleChange = useCallback(
    (newValue: string) => setValue(newValue),
    [],
  );

  const handleSubmit = () => {};

  return (
    <Page
      title="Settings"
      primaryAction={{ content: 'Save', disabled: true }}
      secondaryActions={[
        {
          content: 'Create discount',
          onAction: () => {},
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard title="Notifications">
            <LegacyCard.Section>
              <Form onSubmit={handleSubmit}>
                <FormLayout>
                  <TextField
                    label="Item added to cart"
                    value={value}
                    onChange={handleChange}
                    multiline={4}
                    autoComplete="off"
                  />

                  <TextField
                    label="Cart reminder"
                    value={value}
                    onChange={handleChange}
                    multiline={4}
                    autoComplete="off"
                  />

                  <TextField
                    label="Item will expire soon"
                    value={value}
                    onChange={handleChange}
                    multiline={4}
                    autoComplete="off"
                  />

                  <TextField
                    label="Item was expired"
                    value={value}
                    onChange={handleChange}
                    multiline={4}
                    autoComplete="off"
                  />
                </FormLayout>
              </Form>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section secondary>
          <LegacyCard title="Reservation">
            <LegacyCard.Section>
              <Form onSubmit={handleSubmit}>
                <FormLayout>
                  <TextField
                    label="MAX priority"
                    type="number"
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />

                  <TextField
                    label="MAX priority"
                    type="number"
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />

                  <TextField
                    label="MAX priority"
                    type="number"
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />

                  <TextField
                    label="MAX priority"
                    type="number"
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />

                  <TextField
                    label="MAX priority"
                    type="number"
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />
                </FormLayout>
              </Form>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
      </Layout>

      <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
    </Page>
  );
}
