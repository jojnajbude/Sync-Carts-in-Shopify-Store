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
} from '@shopify/polaris';
import { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscribtionContext } from './../context/SubscribtionContext';

type State = {
  max_priority: number;
  high_priority: number;
  normal_priority: number;
  low_priority: number;
  min_priority: number;
  add_email: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const context = useContext(SubscribtionContext);

  useEffect(() => {
    if (isLoading) {
      const getSettings = async () => {
        const settingsData = await fetch('/api/shop/settings');

        if (settingsData.ok) {
          const settings = await settingsData.json();
          const state: State = { ...settings[0], ...settings[1] };

          initialState = state;
          dispatch({ type: 'setStates', states: state });
          setIsLoading(false);
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
      dispatch({ type: 'setToast', value: true });
    }
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
                  You can set the time for which customers can reserve products
                  depending on their priority level
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
                  Email notification
                </Text>
                <Text color="subdued" as="p">
                  You can write your own text for each type of email
                  notification
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
                <FormLayout>
                  <TextField
                    label="Item added to cart"
                    value={state.add_email}
                    onChange={newValue =>
                      dispatch({ type: 'changeAddEmail', value: newValue })
                    }
                    multiline={4}
                    autoComplete="off"
                  />

                  <TextField
                    label="Cart reminder"
                    value={state.reminder_email}
                    onChange={newValue =>
                      dispatch({ type: 'changeReminderEmail', value: newValue })
                    }
                    multiline={4}
                    autoComplete="off"
                  />

                  <TextField
                    label="Item will expire soon"
                    value={state.expire_soon_email}
                    onChange={newValue =>
                      dispatch({
                        type: 'changeExpireSoonEmail',
                        value: newValue,
                      })
                    }
                    multiline={4}
                    autoComplete="off"
                  />

                  <TextField
                    label="Item was expired"
                    value={state.expired_email}
                    onChange={newValue =>
                      dispatch({ type: 'changeExpiredEmail', value: newValue })
                    }
                    multiline={4}
                    autoComplete="off"
                  />
                </FormLayout>
              )}
            </LegacyCard>
          </Layout.Section>
        </Layout>

        {state.activeToast ? (
          <Toast
            content="Settings successfully updated"
            onDismiss={() => dispatch({ type: 'setToast', value: false })}
          />
        ) : null}

        <FooterHelp>© Blake Rogers. All rights reserved.</FooterHelp>
      </Page>
    </Frame>
  );
}
