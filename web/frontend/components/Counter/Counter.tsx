import { InlineError, Badge } from '@shopify/polaris';
import { useCountdown } from '../../hooks/useCountdown';

type Props = {
  createdAt: string;
  priority: string;
};

export default function Counter({ createdAt, priority }: Props) {
  const [days, hours, minutes, seconds] = useCountdown(createdAt, priority);

  if (days + hours + minutes + seconds <= 0) {
    return (
      <InlineError message="Reservation time expired!" fieldID={createdAt} />
    );
  } else {
    return <Badge status="info">{`Reserve time: ${days}:${hours}:${minutes}:${seconds}`}</Badge>;
  }
}
