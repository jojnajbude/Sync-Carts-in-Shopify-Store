import {
  Text,
  Layout,
  LegacyCard,
  Page,
  ProgressBar,
  HorizontalStack,
  VerticalStack,
  Badge,
  SkeletonDisplayText,
  SkeletonBodyText,
  Banner,
  Button,
  Frame,
  Modal,
  Toast,
} from '@shopify/polaris';
import { useNavigate } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from '../hooks';
import { BillingCard } from '../components/BillingCard';
import { useLocation } from 'react-router-dom';
import { useCallback, useContext, useEffect, useState } from 'react';
import { SubscribtionContext } from '../context/SubscribtionContext';

export default function Subscribe() {
  const context = useContext(SubscribtionContext);
  const [plan, setPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState('success');

  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const search = useLocation().search;
  const charge_id = new URLSearchParams(search).get('charge_id');

  useEffect(() => {
    if (context.plan !== null) {
      const checkCharge = async () => {
        if (charge_id) {
          setPlan(null);

          const activePlan = await fetch(
            `/api/subscribe/active?charge_id=${charge_id}`,
          );
        }

        setPlan(context.plan);
      };

      checkCharge();
    }
  }, [context]);

  const createSubscribe = async (plan: string) => {
    setSelectedPlan(plan);

    const createSubscribe = await fetch(`/api/subscribe?plan=${plan}`);

    if (createSubscribe.ok) {
      const subscribe = await createSubscribe.json();

      navigate(subscribe.confirmation_url);
    }
  };

  const cancelSubscribe = async () => {
    const cancelSubscribe = await fetch('/api/subscribe/cancel');

    setIsModalOpen(false);

    if (cancelSubscribe.ok) {
      setToastType('success');
    } else {
      setToastType('error');
    }

    setIsToastOpen(true);
  };

  const handleModal = useCallback(
    () => setIsModalOpen(!isModalOpen),
    [isModalOpen],
  );

  const toastMarkup = (type: string) =>
    type === 'success' ? (
      <Toast
        content="Subscription cancelled"
        onDismiss={() => setIsToastOpen(false)}
      />
    ) : (
      <Toast
        content="Something went wrong. Please try again later."
        error
        onDismiss={() => setIsToastOpen(false)}
      />
    );

  return (
    <Page
      title="Subscribe"
      backAction={{ onAction: () => navigate('/') }}
      primaryAction={
        plan ? (
          <div style={{ color: '#bf0711' }}>
            <Button
              disabled={plan.plan === 'free'}
              monochrome
              outline
              onClick={handleModal}
            >
              Cancel subscription
            </Button>
          </div>
        ) : null
      }
    >
      <Frame>
        {plan ? (
          <Layout>
            {context.plan && context.plan.carts >= context.plan.limit && (
              <Layout.Section>
                <Banner title="Cart limit reached!" status="warning">
                  <p>Upgrade plan to take control of all shopping carts!</p>
                </Banner>
              </Layout.Section>
            )}

            {context.plan.status === 'cancelled' && (
              <Layout.Section>
                <Banner title="Your subscription was cancelled">
                  <p>You can still use your subscribe privilege</p>
                  <p>
                    Plan will be set to free at the beginning of next month.
                  </p>
                </Banner>
              </Layout.Section>
            )}

            <Layout.Section fullWidth>
              <LegacyCard>
                <LegacyCard.Section>
                  <HorizontalStack align="space-evenly" wrap={false}>
                    <VerticalStack>
                      <Text alignment="center" as="p" fontWeight="bold">
                        Current plan
                      </Text>
                      <Text alignment="center" as="span">
                        {plan.plan}
                      </Text>
                    </VerticalStack>

                    <VerticalStack>
                      <Text alignment="center" as="p" fontWeight="bold">
                        Status
                      </Text>
                      <HorizontalStack gap="2">
                        {plan.status === 'cancelled' ? (
                          <Badge>Cancelled</Badge>
                        ) : (
                          <Badge status="success">Active</Badge>
                        )}

                        {plan.carts >= plan.limit && (
                          <Badge status="critical">Limit Expired</Badge>
                        )}
                      </HorizontalStack>
                    </VerticalStack>
                  </HorizontalStack>
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <Text
                    as="span"
                    variant="bodyMd"
                    color="subdued"
                  >{`${plan.carts}/${plan.limit} carts`}</Text>

                  <ProgressBar
                    progress={(plan.carts / plan.limit) * 100}
                    size="medium"
                  />
                </LegacyCard.Section>
              </LegacyCard>
            </Layout.Section>

            <Layout.Section oneThird>
              <BillingCard
                title="Basic"
                currentPlan={plan.plan}
                limit={500}
                info="Take your first step in managing your shopping carts with our Basic plan! Control up to 500 baskets and see how our subscription can improve your store's performance."
                price={30}
                description="Choose Basic"
                onClick={() => {
                  createSubscribe('Basic');
                }}
                selectedPlan={selectedPlan}
              />
            </Layout.Section>

            <Layout.Section oneThird>
              <BillingCard
                title="Premium"
                currentPlan={plan.plan}
                limit={1000}
                info="Upgrade to our Premium plan and take your business to the next level! With the ability to manage up to 1000 shopping carts, you'll have greater control and flexibility to optimize your sales strategy."
                price={60}
                description="Choose Premium"
                onClick={() => {
                  createSubscribe('Premium');
                }}
                selectedPlan={selectedPlan}
              />
            </Layout.Section>

            <Layout.Section oneThird>
              <BillingCard
                title="Elite"
                currentPlan={plan.plan}
                limit={2000}
                info="Get the ultimate control over your store's shopping carts with our Elite plan! Enjoy unlimited access to our powerful subscription features and manage as many baskets as you need to take your business to new heights."
                price={100}
                description="Choose Elite"
                onClick={() => {
                  createSubscribe('Elite');
                }}
                selectedPlan={selectedPlan}
              />
            </Layout.Section>

            <div style={{ height: '500px' }}>
              <Modal
                open={isModalOpen}
                onClose={handleModal}
                title="Cancel subscribe?"
                primaryAction={{
                  content: 'Stop subscribtion',
                  onAction: cancelSubscribe,
                  destructive: true,
                }}
                secondaryActions={[
                  {
                    content: 'Cancel',
                    onAction: handleModal,
                  },
                ]}
              >
                <Modal.Section>
                  <Text as="p">Are you sure you want to cancel subscribe?</Text>
                </Modal.Section>
              </Modal>
            </div>

            {isToastOpen && toastMarkup(toastType)}
          </Layout>
        ) : (
          <Layout>
            <Layout.Section fullWidth>
              <LegacyCard>
                <LegacyCard.Section>
                  <HorizontalStack align="space-evenly" wrap={false}>
                    <VerticalStack>
                      <SkeletonDisplayText size="medium" />
                    </VerticalStack>

                    <VerticalStack>
                      <SkeletonDisplayText size="medium" />
                    </VerticalStack>
                  </HorizontalStack>
                </LegacyCard.Section>

                <LegacyCard.Section>
                  <SkeletonBodyText lines={1} />
                </LegacyCard.Section>
              </LegacyCard>
            </Layout.Section>

            <Layout.Section oneThird>
              <LegacyCard sectioned>
                <VerticalStack gap="4">
                  <SkeletonBodyText lines={6} />
                  <SkeletonDisplayText size="large" />
                </VerticalStack>
              </LegacyCard>
            </Layout.Section>

            <Layout.Section oneThird>
              <LegacyCard sectioned>
                <VerticalStack gap="4">
                  <SkeletonBodyText lines={6} />
                  <SkeletonDisplayText size="large" />
                </VerticalStack>
              </LegacyCard>
            </Layout.Section>

            <Layout.Section oneThird>
              <LegacyCard sectioned>
                <VerticalStack gap="4">
                  <SkeletonBodyText lines={6} />
                  <SkeletonDisplayText size="large" />
                </VerticalStack>
              </LegacyCard>
            </Layout.Section>
          </Layout>
        )}
      </Frame>
    </Page>
  );
}
