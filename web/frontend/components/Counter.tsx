import { Text } from '@shopify/polaris';
import { useCountdown } from '../hooks/useCountdown';

type Props = {
  expireAt: Date;
  status: string;
};

export default function Counter({ expireAt, status }: Props) {
  const [days, hours, minutes, seconds] = useCountdown(expireAt);

  if (status === 'removed') {
    return (
      <Text as="p" color="subdued">
        {`Waiting for remove`}
      </Text>
    );
  } else if (days + hours + minutes + seconds <= 0 || status === 'expired') {
    return (
      <Text as="p" color="critical">
        {`Reservation expired!`}
      </Text>
    );
  } else if (status === 'unreserved') {
    return (
      <Text as="p" color="subdued">
        {`This item isn't reserved`}
      </Text>
    );
  } else if (status === 'expiring') {
    return (
      <Text as="p" color={days || hours >= 2 ? 'success' : 'warning'}>
        {days ? (days > 1 ? `${days} days ` : `${days} day `) : null}
        {hours ? (hours > 1 ? `${hours} hours ` : `${hours} hour `) : null}
        {minutes
          ? minutes > 1
            ? `${minutes} minutes`
            : `${minutes} minute`
          : null}
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
