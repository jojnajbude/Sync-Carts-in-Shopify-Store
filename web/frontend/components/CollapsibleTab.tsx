import {
  Button,
  Collapsible,
  Divider,
  HorizontalStack,
  Icon,
  LegacyCard,
  List,
  Select,
  Text,
  VerticalStack,
} from '@shopify/polaris';
import {
  CircleTickMajor,
  CircleDownMajor,
  ChevronDownMinor,
  ChevronUpMinor,
  CircleAlertMajor,
} from '@shopify/polaris-icons';
import { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import {
  Toast,
  useAuthenticatedFetch,
  useNavigate,
} from '@shopify/app-bridge-react';
import { SubscribtionContext } from '../context/SubscribtionContext';
import { themes } from '../constants/themes';

import { useMediaQuery } from 'react-responsive';

export default function CollapsibleTab() {
  const fetch = useAuthenticatedFetch();
  const context = useContext(SubscribtionContext);
  const [toastText, setToastText] = useState(null);
  const [open, setOpen] = useState(true);
  const [firstTabOpen, setFirstTabOpen] = useState(false);
  const [secondTabOpen, setSecondTabOpen] = useState(false);
  const [thirdTabOpen, setThirdTabOpen] = useState(false);
  const [firstChecked, setFirstChecked] = useState(false);
  const [secondChecked, setSecondChecked] = useState(false);
  const [thirdChecked, setThirdChecked] = useState(
    context.plan?.email_domain ? true : false,
  );
  const [selectedTheme, setSelectedTheme] = useState(undefined);
  const [shopThemes, setShopThemes] = useState<
    {
      id: number;
      name: string;
      role: string;
    }[]
  >([]);
  const mainShopTheme = useMemo(() => {
    return shopThemes.find(theme => theme.role === 'main');
  }, [shopThemes]);

  const handleSelectChange = useCallback(
    (value: string) => setSelectedTheme(value),
    [],
  );

  const navigate = useNavigate();

  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });

  const handleToggle = useCallback(() => setOpen(open => !open), []);

  const injectSnippet = async (theme: string) => {
    const editTheme = await fetch(`/api/shop/theme/edit?name=${theme}`);

    setToastText('Timer successfully injected');
  };

  useEffect(() => {
    fetch('api/shop/themes')
      .then(res => res.json())
      .then((data: { id: number; name: string; role: string }[]) => {
        setShopThemes(data);
      });
  }, []);

  return (
    <LegacyCard
      title="Setup is as easy as 1-2-3!"
      actions={[
        {
          content: (
            <Button
              plain
              icon={
                <Icon
                  source={open ? ChevronUpMinor : ChevronDownMinor}
                  color="subdued"
                />
              }
            ></Button>
          ),
          onAction: () => handleToggle(),
        },
      ]}
    >
      {toastText ? (
        <Toast content={toastText} onDismiss={() => setToastText(null)} />
      ) : null}
      <LegacyCard.Section>
        <VerticalStack gap="2">
          <Text as="span">
            There are only two simple steps needed to get your app running! Then
            a third optional step to make the shopping experience just that much
            better for your customers. If you ever need help, please contact
            support and we can set it up for you!
          </Text>
        </VerticalStack>
      </LegacyCard.Section>

      <Divider></Divider>

      <Collapsible
        open={open}
        id="basic-collapsible"
        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
        expandOnPrint
      >
        <LegacyCard.Section>
          <VerticalStack gap="4">
            <HorizontalStack gap="2">
              <HorizontalStack gap="2">
                <Icon
                  source={firstChecked ? CircleTickMajor : CircleDownMajor}
                  color={firstChecked ? 'success' : 'subdued'}
                ></Icon>
                <button
                  className="plain-button"
                  onClick={() => setFirstTabOpen(!firstTabOpen)}
                >
                  <Text
                    as="h1"
                    fontWeight="bold"
                    color={firstChecked ? 'success' : 'subdued'}
                  >
                    1. Add Smart Carts embed block to your shopify theme.
                  </Text>
                </button>
              </HorizontalStack>
            </HorizontalStack>

            <Collapsible
              open={firstTabOpen}
              id="basic-collapsible"
              transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
              expandOnPrint
            >
              <VerticalStack gap="4">
                <List type="number">
                  <List.Item>
                    Go to <b>Online Store</b> sales channel
                  </List.Item>
                  <List.Item>
                    Click green <b>Customize</b> button in your current theme
                  </List.Item>
                  <List.Item>
                    Go to <b>App embeds</b> section in the aside bar
                  </List.Item>
                  <List.Item>
                    Switch on <b>Smart Carts</b> embed section
                  </List.Item>
                </List>

                <div style={{ maxWidth: 250 }}>
                  <Button
                    primary
                    onClick={() => {
                      setFirstChecked(true);
                      let url = `${window.location.ancestorOrigins[0]}/admin/themes`;

                      if (mainShopTheme) {
                        url += `/${mainShopTheme.id}/editor?context=apps`;
                      }

                      navigate(url, { target: 'new' });
                    }}
                  >
                    Take me there
                  </Button>
                </div>
              </VerticalStack>
            </Collapsible>
          </VerticalStack>
        </LegacyCard.Section>

        <LegacyCard.Section>
          <VerticalStack gap="4">
            <HorizontalStack gap="2">
              <HorizontalStack gap="2">
                <Icon
                  source={secondChecked ? CircleTickMajor : CircleDownMajor}
                  color={secondChecked ? 'success' : 'subdued'}
                ></Icon>
                <button
                  className="plain-button"
                  onClick={() => setSecondTabOpen(!secondTabOpen)}
                >
                  <Text
                    as="h1"
                    fontWeight="bold"
                    color={secondChecked ? 'success' : 'subdued'}
                  >
                    2. Install reserve timer into your theme
                  </Text>
                </button>
              </HorizontalStack>
            </HorizontalStack>

            <Collapsible
              open={secondTabOpen}
              id="basic-collapsible"
              transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
              expandOnPrint
            >
              <VerticalStack gap="4">
                <div style={{ maxWidth: '200px' }}>
                  <Select
                    label="Theme"
                    options={[
                      {
                        label: '---',
                        value: undefined,
                      },
                      ...themes,
                    ]}
                    onChange={handleSelectChange}
                    value={selectedTheme}
                  />
                </div>

                {selectedTheme && (
                  <>
                    <div style={{ marginTop: '10px' }}>
                      <Button
                        primary
                        onClick={() => injectSnippet(selectedTheme)}
                      >
                        Inject in current theme
                      </Button>
                    </div>
                    <iframe
                      width={isMobile ? '380' : '560'}
                      height={isMobile ? '250' : '315'}
                      src={
                        themes.find(theme => theme.value === selectedTheme)
                          .video
                      }
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>

                    <List type="number">
                      {themes
                        .find(theme => theme.value === selectedTheme)
                        .steps.map((step, index) => (
                          <List.Item key={index}>{step}</List.Item>
                        ))}
                    </List>
                    <div style={{ maxWidth: 250 }}>
                      <Button
                        primary
                        onClick={() => {
                          setSecondChecked(true);
                          navigate(
                            `${window.location.ancestorOrigins[0]}/admin/themes`,
                            { target: 'new' },
                          );
                        }}
                      >
                        Add Reservation Timer
                      </Button>
                    </div>
                  </>
                )}


                <Divider></Divider>

                <HorizontalStack gap="2">
                  <Icon source={CircleAlertMajor} color="subdued"></Icon>
                  <div style={{ width: '95%' }}>
                    <Text as="h1" fontWeight="bold" color="subdued">
                      Before deleting the app, make sure you remove the
                      &apos;reserve-timer.liquid&apos; snippet from your Shopify
                      Theme, and all added custom code (see &quot;Add
                      Reservation Timer snippet your shop cart&quot; section)
                    </Text>
                  </div>
                </HorizontalStack>
              </VerticalStack>
            </Collapsible>
          </VerticalStack>
        </LegacyCard.Section>

        <LegacyCard.Section>
          <VerticalStack gap="4">
            <HorizontalStack gap="2">
              <HorizontalStack gap="2">
                <Icon
                  source={thirdChecked ? CircleTickMajor : CircleDownMajor}
                  color={thirdChecked ? 'success' : 'subdued'}
                ></Icon>
                <button
                  className="plain-button"
                  onClick={() => setThirdTabOpen(!thirdTabOpen)}
                >
                  <Text
                    as="h1"
                    fontWeight="bold"
                    color={thirdChecked ? 'success' : 'subdued'}
                  >
                    3. Verify your custom domain for email notifications.
                  </Text>
                </button>
              </HorizontalStack>
            </HorizontalStack>

            <Collapsible
              open={thirdTabOpen}
              id="basic-collapsible"
              transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
              expandOnPrint
            >
              <VerticalStack gap="4">
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/sXi915qhkj4"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
                <List type="number">
                  <List.Item>
                    Go to <b>Settings</b>, then find <b>Verify domain</b>{' '}
                    section.
                  </List.Item>
                  <List.Item>
                    Inside section, enter your domain and click on the{' '}
                    <b>Verify</b> button.
                  </List.Item>
                  <List.Item>
                    Go to your domain provider and add a 2 TXT records with the{' '}
                    given values.
                  </List.Item>
                  <List.Item>
                    Click <b>Verify domain</b> button. If all good, status
                    badges will change for <b>Verified</b>.{' '}
                    <i>
                      Note: it can take up to 24 hours to verify your domain.
                    </i>
                  </List.Item>
                </List>

                <div style={{ maxWidth: 250 }}>
                  <Button
                    primary
                    onClick={() => {
                      navigate('/settings');
                    }}
                  >
                    Add Custom Domain
                  </Button>
                </div>
              </VerticalStack>
            </Collapsible>
          </VerticalStack>
        </LegacyCard.Section>
      </Collapsible>
    </LegacyCard>
  );
}
