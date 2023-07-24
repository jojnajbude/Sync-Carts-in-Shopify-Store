import { useAuthenticatedFetch } from '../hooks';
import {
  Page,
  FooterHelp,
  Layout,
  LegacyCard,
  TextField,
  FormLayout,
  Text,
  Divider,
  VerticalStack,
  SkeletonBodyText,
  Toast,
  Frame,
  Button,
  Modal,
  Banner,
  Link,
  HorizontalStack,
  Badge,
  Select,
} from '@shopify/polaris';
import { DuplicateMinor } from '@shopify/polaris-icons';
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsList from '../components/NotificationsList';
import { SubscribtionContext } from '../context/SubscribtionContext';

type State = {
  max_priority: number;
  high_priority: number;
  normal_priority: number;
  low_priority: number;
  min_priority: number;
  add_email: string;
  email_from_name: string;
  reminder_email: string;
  expire_soon_email: string;
  expired_email: string;
  isEdit: boolean;
  isLoading: boolean;
  activeToast: boolean;
};

type Action = {
  type:
    | 'setStates'
    | 'changeMax'
    | 'changeHigh'
    | 'changeNormal'
    | 'changeLow'
    | 'changeMin'
    | 'changeFromName'
    | 'changeAddEmail'
    | 'changeReminderEmail'
    | 'changeExpireSoonEmail'
    | 'changeExpiredEmail'
    | 'setIsEdit'
    | 'discardChanges'
    | 'setToast';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  states?: State;
};

let initialState: State = {
  max_priority: 336,
  high_priority: 72,
  normal_priority: 24,
  low_priority: 8,
  min_priority: 1,
  email_from_name: '',
  add_email: '',
  reminder_email: '',
  expire_soon_email: '',
  expired_email: '',
  isEdit: false,
  isLoading: true,
  activeToast: false,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'setStates':
      return {
        ...action.states,
        isEdit: false,
        isLoading: false,
        activeToast: false,
      };

    case 'changeMax':
      return { ...state, max_priority: action.value, isEdit: true };

    case 'changeHigh':
      return { ...state, high_priority: action.value, isEdit: true };

    case 'changeNormal':
      return { ...state, normal_priority: action.value, isEdit: true };

    case 'changeLow':
      return { ...state, low_priority: action.value, isEdit: true };

    case 'changeMin':
      return { ...state, min_priority: action.value, isEdit: true };

    case 'changeFromName':
      return { ...state, email_from_name: action.value, isEdit: true };

    case 'changeAddEmail':
      return { ...state, add_email: action.value, isEdit: true };

    case 'changeReminderEmail':
      return { ...state, reminder_email: action.value, isEdit: true };

    case 'changeExpireSoonEmail':
      return { ...state, expire_soon_email: action.value, isEdit: true };

    case 'changeExpiredEmail':
      return { ...state, expired_email: action.value, isEdit: true };

    case 'setIsEdit':
      return { ...state, isEdit: false };

    case 'setToast':
      return { ...state, activeToast: action.value };

    case 'discardChanges':
      return {
        ...initialState,
        isEdit: false,
        isLoading: false,
        activeToast: false,
      };
  }
}

export default function Settings() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [activeModal, setActiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    spfStatus: false,
    dkimStatus: false,
  });
  const [toastText, setToastText] = useState('Settings successfully updated');
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const context = useContext(SubscribtionContext);

  useEffect(() => {
    if (isLoading) {
      const getSettings = async () => {
        const themes = await fetch('/api/shop/themes');
        const themeData = await themes.json();
        const settingsData = await fetch('/api/shop/settings');

        if (settingsData.ok) {
          const settings = await settingsData.json();
          const state: State = {
            ...settings.priorities,
            email_from_name: settings.email_from_name || '',
          };

          initialState = state;
          dispatch({ type: 'setStates', states: state });
          setThemes(themeData);
          setSelectedTheme(themeData[0].name);
          setIsLoading(false);
        }

        if (context.plan) {
          setTextFieldValue(context.plan?.email_domain || '');

          if (context.plan.domain_verified) {
            const status = JSON.parse(context.plan.domain_verified);
            setVerificationStatus({
              spfStatus: status.spfStatus,
              dkimStatus: status.dkimStatus,
            });
          }
        }
      };

      getSettings();
    }
  }, [isLoading]);

  const handleSubmit = async () => {
    dispatch({ type: 'setIsEdit', value: false });

    const updateSettings = await fetch('/api/shop/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    if (updateSettings.ok) {
      setToastText('Settings successfully updated');
      dispatch({ type: 'setToast', value: true });
    }
  };

  const handleTextFieldChange = useCallback(
    (value: string) => setTextFieldValue(value),
    [],
  );

  const addDomain = async (textFieldValue: string) => {
    setActiveModal(true);

    if (context.plan?.email_domain) {
      return;
    }

    const newDomainData = await fetch(
      `/api/notifications/domain/add?domain=${textFieldValue}`,
    );

    if (newDomainData.ok) {
      const newDomain = await newDomainData.json();
      setTextFieldValue(newDomain);
    }
  };

  const verifyDomain = async () => {
    setIsVerifying(true);
    const verificationsStatus = await fetch(
      `/api/notifications/domain/verify?domain=${textFieldValue}`,
    );

    if (verificationsStatus.ok) {
      const status = await verificationsStatus.json();

      if (status.spfStatus && status.dkimStatus) {
        setIsVerifying(false);
        setToastText('Settings successfully updated');
        dispatch({ type: 'setToast', value: true });
      }
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastText('Copied to clipboard');
    dispatch({ type: 'setToast', value: true });
  };

  return (
    <Frame>
      <Page
        title="Settings"
        primaryAction={{
          content: 'Save',
          disabled: !state.isEdit,
          onAction: handleSubmit,
        }}
        secondaryActions={[
          {
            content: 'Discard',
            disabled: !state.isEdit,
            onAction: () => dispatch({ type: 'discardChanges' }),
          },
        ]}
        backAction={{ onAction: () => navigate(-1) }}
      >
        <Layout>
          <Layout.Section oneThird>
            <div style={{ marginTop: 'var(--p-space-5)' }}>
              <VerticalStack gap={'4'}>
                <Text id="storeDetails" variant="headingMd" as="h2">
                  Reservation time
                </Text>
                <Text color="subdued" as="p">
                  You can set how long customers items are reserved for
                  depending on their priority level. A customers priority level
                  can be changed from within a customers cart.
                </Text>
              </VerticalStack>
            </div>
          </Layout.Section>

          <Layout.Section oneHalf>
            <LegacyCard sectioned>
              {isLoading ? (
                <SkeletonBodyText lines={5} />
              ) : (
                <FormLayout>
                  <TextField
                    label="Max priority"
                    type="number"
                    value={state.max_priority}
                    onChange={newValue =>
                      dispatch({ type: 'changeMax', value: newValue })
                    }
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />
                  <TextField
                    label="High priority"
                    type="number"
                    value={state.high_priority}
                    onChange={newValue =>
                      dispatch({ type: 'changeHigh', value: newValue })
                    }
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />
                  <TextField
                    label="Normal priority"
                    type="number"
                    value={state.normal_priority}
                    onChange={newValue =>
                      dispatch({ type: 'changeNormal', value: newValue })
                    }
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />
                  <TextField
                    label="Low priority"
                    type="number"
                    value={state.low_priority}
                    onChange={newValue =>
                      dispatch({ type: 'changeLow', value: newValue })
                    }
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />
                  <TextField
                    label="Min priority"
                    type="number"
                    value={state.min_priority}
                    onChange={newValue =>
                      dispatch({ type: 'changeMin', value: newValue })
                    }
                    autoComplete="off"
                    suffix={'hours'}
                    min={1}
                    max={1000}
                  />
                </FormLayout>
              )}
            </LegacyCard>
          </Layout.Section>

          <Layout.Section fullWidth>
            <Divider></Divider>
          </Layout.Section>

          <Layout.Section oneThird>
            <div style={{ marginTop: 'var(--p-space-5)' }}>
              <VerticalStack gap={'4'}>
                <Text id="storeDetails" variant="headingMd" as="h2">
                  Email notifications
                </Text>
                <Text color="subdued" as="p">
                  Edit our email templates for a more personalized customer
                  experience.
                </Text>
              </VerticalStack>
            </div>
          </Layout.Section>

          <Layout.Section oneHalf>
            <LegacyCard sectioned>
              {isLoading ? (
                <FormLayout>
                  <SkeletonBodyText />
                  <SkeletonBodyText />
                  <SkeletonBodyText />
                  <SkeletonBodyText />
                </FormLayout>
              ) : (
                <NotificationsList></NotificationsList>
              )}
            </LegacyCard>
          </Layout.Section>

          <Layout.Section fullWidth>
            <Divider></Divider>
          </Layout.Section>

          <Layout.Section oneThird>
            <div style={{ marginTop: 'var(--p-space-5)' }}>
              <VerticalStack gap={'4'}>
                <Text id="storeDetails" variant="headingMd" as="h2">
                  Verify domain
                </Text>
                <Text color="subdued" as="p">
                  {
                    'This is where you can configure the app to send emails from your own custom domain.'
                  }
                </Text>
              </VerticalStack>
            </div>
          </Layout.Section>

          <Layout.Section oneHalf>
            <LegacyCard sectioned title="Verify domain">
              {isLoading ? (
                <FormLayout>
                  <SkeletonBodyText />
                </FormLayout>
              ) : (
                <TextField
                  label="Domain"
                  type="text"
                  placeholder="some-domain.com"
                  value={textFieldValue}
                  onChange={handleTextFieldChange}
                  autoComplete="off"
                  disabled={context.plan?.email_domain}
                  connectedRight={
                    <Button
                      primary
                      onClick={() => addDomain(textFieldValue)}
                      disabled={!textFieldValue}
                    >
                      Verify
                    </Button>
                  }
                />
              )}
            </LegacyCard>
          </Layout.Section>

          <Layout.Section oneThird>
            <div style={{ marginTop: 'var(--p-space-5)' }}>
              <VerticalStack gap={'4'}>
                <Text id="fromNameSettingsHeader" variant="headingMd" as="h2">
                  Email settings
                </Text>
                <Text color="subdued" as="p">
                  {'This is where you can configure From Name for App emails.'}
                </Text>
              </VerticalStack>
            </div>
          </Layout.Section>

          <Layout.Section oneHalf>
            <LegacyCard sectioned title="Email From settings">
              {isLoading ? (
                <FormLayout>
                  <SkeletonBodyText />
                </FormLayout>
              ) : (
                <TextField
                  label="From Name"
                  type="text"
                  placeholder="John Doe"
                  value={state.email_from_name}
                  onChange={newValue =>
                    dispatch({ type: 'changeFromName', value: newValue })
                  }
                  autoComplete="off"
                />
              )}
            </LegacyCard>
          </Layout.Section>
        </Layout>

        {state.activeToast ? (
          <Toast
            content={toastText}
            onDismiss={() => dispatch({ type: 'setToast', value: false })}
          />
        ) : null}

        <Modal
          large
          open={activeModal}
          onClose={() => setActiveModal(false)}
          title="Verify domain"
          primaryAction={{
            content: 'Verify domain',
            loading: isVerifying,
            onAction: () => verifyDomain(),
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setActiveModal(false),
            },
          ]}
        >
          <Modal.Section>
            <Banner>
              <p>
                Learn more about how to verify domains with your domain service
                provider{' '}
                <Link monochrome onClick={() => navigate('/faq')}>
                  Learn more
                </Link>
              </p>
            </Banner>
          </Modal.Section>
          <Modal.Section>
            <HorizontalStack gap="4">
              <div>
                <p style={{ paddingBottom: '10px' }}>Status</p>
                <Badge
                  progress={
                    verificationStatus.spfStatus ? 'complete' : 'incomplete'
                  }
                  status={verificationStatus.spfStatus ? 'success' : 'info'}
                >
                  {verificationStatus.spfStatus ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              <div style={{ width: '100px' }}>
                <TextField
                  autoComplete="off"
                  label="Type"
                  type="text"
                  value="TXT"
                  connectedRight={
                    <Button
                      icon={DuplicateMinor}
                      onClick={() => copyText('TXT')}
                    ></Button>
                  }
                ></TextField>
              </div>

              <div>
                <TextField
                  autoComplete="off"
                  label="Host/Name/Value"
                  type="text"
                  value="@"
                  connectedRight={
                    <Button
                      icon={DuplicateMinor}
                      onClick={() => copyText('@')}
                    ></Button>
                  }
                ></TextField>
              </div>

              <div style={{ flexGrow: 1 }}>
                <TextField
                  autoComplete="off"
                  label="Value/Points To"
                  type="text"
                  value="v=spf1 a mx include:_spf.elasticemail.com ~all"
                  connectedRight={
                    <Button
                      icon={DuplicateMinor}
                      onClick={() =>
                        copyText(
                          'v=spf1 a mx include:_spf.elasticemail.com ~all',
                        )
                      }
                    ></Button>
                  }
                ></TextField>
              </div>
            </HorizontalStack>
          </Modal.Section>

          <Modal.Section>
            <HorizontalStack gap="4">
              <div>
                <p style={{ paddingBottom: '10px' }}>Status</p>
                <Badge
                  progress={
                    verificationStatus.dkimStatus ? 'complete' : 'incomplete'
                  }
                  status={verificationStatus.dkimStatus ? 'success' : 'info'}
                >
                  {verificationStatus.dkimStatus ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              <div style={{ width: '100px' }}>
                <TextField
                  autoComplete="off"
                  label="Type"
                  type="text"
                  value="TXT"
                  connectedRight={
                    <Button
                      icon={DuplicateMinor}
                      onClick={() => copyText('TXT')}
                    ></Button>
                  }
                ></TextField>
              </div>

              <div>
                <TextField
                  autoComplete="off"
                  label="Host/Name/Value"
                  type="text"
                  value="api._domainkey"
                  connectedRight={
                    <Button
                      icon={DuplicateMinor}
                      onClick={() => copyText('api._domainkey')}
                    ></Button>
                  }
                ></TextField>
              </div>

              <div style={{ flexGrow: 1 }}>
                <TextField
                  autoComplete="off"
                  label="Value/Points To"
                  type="text"
                  value="k=rsa;t=s;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCbmGbQMzYeMvxwtNQoXN0waGYaciuKx8mtMh5czguT4EZlJXuCt6V+l56mmt3t68FEX5JJ0q4ijG71BGoFRkl87uJi7LrQt1ZZmZCvrEII0YO4mp8sDLXC8g1aUAoi8TJgxq2MJqCaMyj5kAm3Fdy2tzftPCV/lbdiJqmBnWKjtwIDAQAB"
                  connectedRight={
                    <Button
                      icon={DuplicateMinor}
                      onClick={() =>
                        copyText(
                          'k=rsa;t=s;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCbmGbQMzYeMvxwtNQoXN0waGYaciuKx8mtMh5czguT4EZlJXuCt6V+l56mmt3t68FEX5JJ0q4ijG71BGoFRkl87uJi7LrQt1ZZmZCvrEII0YO4mp8sDLXC8g1aUAoi8TJgxq2MJqCaMyj5kAm3Fdy2tzftPCV/lbdiJqmBnWKjtwIDAQAB',
                        )
                      }
                    ></Button>
                  }
                ></TextField>
              </div>
            </HorizontalStack>
          </Modal.Section>
        </Modal>

        <FooterHelp>© Simplify Apps. All rights reserved.</FooterHelp>
      </Page>
    </Frame>
  );
}
