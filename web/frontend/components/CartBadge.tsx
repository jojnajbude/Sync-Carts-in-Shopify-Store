import { Badge } from '@shopify/polaris';

type Props = {
  indicator: 'all' | 'part' | 'no';
};

export default function CartBadge({ indicator }: Props) {
  switch (true) {
    case indicator === 'all':
      return (
        <Badge status="success" progress="complete">
          All items reserved
        </Badge>
      );

    case indicator === 'part':
      return (
        <Badge status="attention" progress="partiallyComplete">
          Partially reserved
        </Badge>
      );

    case indicator === 'no':
      return (
        <Badge status="warning" progress="incomplete">
          No items reserved
        </Badge>
      );
  }
}
