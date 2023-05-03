import {
  Button,
  Checkbox,
  Collapsible,
  FooterHelp,
  HorizontalStack,
  Icon,
  Layout,
  LegacyCard,
  Page,
} from '@shopify/polaris';
import { CircleTickMajor } from '@shopify/polaris-icons';
import { useState, useCallback } from 'react';

export default function NotFound() {
  const [open, setOpen] = useState(true);

  const handleToggle = useCallback(() => setOpen(open => !open), []);

  const [checked, setChecked] = useState(false);
  const handleChange = useCallback(
    (newChecked: boolean) => setChecked(newChecked),
    [],
  );

  return (
    <Page title="FAQ">
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <HorizontalStack>
              {/* <Text as="h1">Setup guide</Text> */}
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
                <Checkbox
                  label={
                    <Icon
                      color="primary"
                      source={CircleTickMajor}
                    />
                  }
                  checked={checked}
                  onChange={handleChange}
                />
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
