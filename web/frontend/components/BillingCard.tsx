import {
  LegacyCard,
  LegacyStack,
  TextContainer,
  Heading,
  Button,
  Image,
  VerticalStack,
} from '@shopify/polaris';
import { trophyImage } from '../assets';

type Props = {
  title: string;
  description: string;
  onClick: () => void;
  children?: any;
};

export const BillingCard = ({
  title,
  description,
  onClick,
  children,
}: Props) => {
  return (
    <>
      <LegacyCard sectioned>
        <VerticalStack inlineAlign="center">
          <TextContainer spacing="loose">
            <Heading>{title}</Heading>
          </TextContainer>
          <Image
            source={trophyImage}
            alt="Nice work on building a Shopify app"
            width={120}
          />
          <div style={{ padding: '0 20px' }}>
            <Button onClick={onClick} primary>
              {description}
            </Button>
          </div>
        </VerticalStack>
      </LegacyCard>
      {children}
    </>
  );
};
