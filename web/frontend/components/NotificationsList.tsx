import { useNavigate } from '@shopify/app-bridge-react';
import { DescriptionList, Link, Text } from '@shopify/polaris';

export default function NotificationsList() {
  const navigate = useNavigate();

  return (
    <DescriptionList
      items={[
        {
          term: (
            <Text as="span">
              <Link onClick={() => navigate('/editor')}>Reminder template</Link>
            </Text>
          ),
          description:
            'Custom email which will be sent by pressing "Send reminder" button on Carts or Summary page.',
        },
        {
          term: (
            <Text as="span">
              <Link onClick={() => navigate('/editor')}>Cart item added</Link>
            </Text>
          ),
          description:
            'Sent automatically to the customer after you add some product to their cart.',
        },
        {
          term: (
            <Text as="span">
              <Link onClick={() => navigate('/editor')}>Item expire soon</Link>
            </Text>
          ),
          description:
            'Sent automatically to the customer when reservation time for the item almost expired.',
        },
        {
          term: (
            <Text as="span">
              <Link onClick={() => navigate('/editor')}>Item expired</Link>
            </Text>
          ),
          description:
            'Sent automatically to the customer when reservation time for item was expired.',
        },
      ]}
    />
  );
}
