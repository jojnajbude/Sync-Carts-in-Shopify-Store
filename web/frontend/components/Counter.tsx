import { InlineError, Badge, Text } from '@shopify/polaris';
import { useCountdown } from '../hooks/useCountdown';

type Props = {
  expireAt: string;
  status: string;
};

export default function Counter({ expireAt, status }: Props) {
  const [days, hours, minutes, seconds] = useCountdown(expireAt);

  if (days + hours + minutes + seconds <= 0 || status === 'expired') {
    return (
      <Text as="p" color="critical">
        {`Reservation time expired!`}
      </Text>
    );
  } else if (status === 'unreserved') {
    return (
      <Text as="p" color="subdued">
        {`This item isn't reserved`}
      </Text>
    );
  } else {
    return (
      <Text as="p" color={hours >= 2 ? 'success' : 'warning'}>
        {`Reserve time: ${days < 10 ? '0' + days : days}:${
          hours < 10 ? '0' + hours : hours
        }:${minutes < 10 ? '0' + minutes : minutes}:${
          seconds < 10 ? '0' + seconds : seconds
        }`}
      </Text>
    );
  }
}
