import {
  Button,
  Collapsible,
  FooterHelp,
  HorizontalStack,
  Layout,
  LegacyCard,
  Page,
} from '@shopify/polaris';
import { useState, useCallback } from 'react';

export default function NotFound() {
  const [open, setOpen] = useState(true);

  const handleToggle = useCallback(() => setOpen(open => !open), []);

  return (
    <Page title="FAQ">
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <HorizontalStack>
              <Button
                onClick={handleToggle}
                ariaExpanded={open}
                ariaControls="basic-collapsible"
              >
                Toggle
              </Button>
              <Collapsible
                open={open}
                id="basic-collapsible"
                transition={{
                  duration: '500ms',
                  timingFunction: 'ease-in-out',
                }}
                expandOnPrint
              >
                <p>
                  Your mailing list lets you contact customers or visitors who
                  have shown an interest in your store. Reach out to them with
                  exclusive offers or updates about your products.
                </p>
              </Collapsible>
            </HorizontalStack>
          </LegacyCard>
        </Layout.Section>
      </Layout>

      <FooterHelp>
        © Blake Rogers. All rights reserved.{' '}
        <a
          target="_blank"
          href="mailto:demigod177712@gmail.com"
          rel="noreferrer"
        >
          Contact us
        </a>
      </FooterHelp>
    </Page>
  );
}
