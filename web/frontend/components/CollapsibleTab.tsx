import {
  Button,
  Collapsible,
  Divider,
  HorizontalStack,
  Icon,
  LegacyCard,
  List,
  ProgressBar,
  Text,
  VerticalStack,
} from '@shopify/polaris';
import {
  CircleTickMajor,
  CircleDownMajor,
  ChevronDownMinor,
  ChevronUpMinor,
  QuestionMarkMajor,
} from '@shopify/polaris-icons';
import { useState, useCallback } from 'react';
import { useNavigate } from '@shopify/app-bridge-react';

export default function CollapsibleTab() {
  const [open, setOpen] = useState(true);
  const [firstTabOpen, setFirstTabOpen] = useState(false);
  const [secondTabOpen, setSecondTabOpen] = useState(false);
  const [firstChecked, setFirstChecked] = useState(false);
  const [secondChecked, setSecondChecked] = useState(false);

  const tasks = [firstChecked, secondChecked];

  const navigate = useNavigate();

  const handleToggle = useCallback(() => setOpen(open => !open), []);

  return (
    <LegacyCard
      title="Setup guide"
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
      <LegacyCard.Section>
        <VerticalStack gap="2">
          <Text as="span">
            Use this step by step guide to get started with Better Carts
          </Text>

          {/* <HorizontalStack blockAlign="center" gap="2">
            <Text as="span" color="subdued">
              {`${tasks.reduce((sum, curr) => sum + (curr ? 1 : 0), 0)} of ${
                tasks.length
              } tasks complete`}
            </Text>

            <ProgressBar
              progress={
                (tasks.reduce((sum, curr) => sum + (curr ? 1 : 0), 0) /
                  tasks.length) *
                100
              }
              size="small"
            />
          </HorizontalStack> */}
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
                <Button
                  removeUnderline
                  plain
                  onClick={() => setFirstTabOpen(!firstTabOpen)}
                >
                  <Text
                    as="h1"
                    fontWeight="bold"
                    color={firstChecked ? 'success' : 'subdued'}
                  >
                    Add Better Carts embed block to your shopify theme.
                  </Text>
                </Button>
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
                    Switch on <b>Better Carts</b> embed section
                  </List.Item>
                </List>

                <div style={{ maxWidth: 250 }}>
                  <Button
                    primary
                    onClick={() => {
                      setFirstChecked(true);
                      navigate(
                        `${window.location.ancestorOrigins[0]}/admin/themes`,
                        { target: 'new' },
                      );
                    }}
                  >
                    Add embed block
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
                <Button
                  removeUnderline
                  plain
                  onClick={() => setSecondTabOpen(!secondTabOpen)}
                >
                  <Text
                    as="h1"
                    fontWeight="bold"
                    color={secondChecked ? 'success' : 'subdued'}
                  >
                    Add Reservation Timer snippet to your shop cart.
                  </Text>
                </Button>
              </HorizontalStack>
            </HorizontalStack>

            <Collapsible
              open={secondTabOpen}
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
                    Open theme code editor by clicking dots button in your
                    current theme and select <b>Edit code</b>
                  </List.Item>
                  <List.Item>
                    Select your cart section or snippet file
                  </List.Item>
                  <List.Item>
                    Insert the following code in cart line item:
                    <br></br>
                    <i>
                      {
                        "{%  render 'reserve-timer', variant_id: item.variant_id, color: 'red' %}"
                      }
                    </i>
                  </List.Item>
                  <List.Item>
                    {
                      "Optional: you can set any color your want by replacing 'red' to another color ('purple', 'yellow' etc.) or hex-code"
                    }
                  </List.Item>
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
              </VerticalStack>
            </Collapsible>
          </VerticalStack>
        </LegacyCard.Section>
      </Collapsible>
    </LegacyCard>
  );
}
