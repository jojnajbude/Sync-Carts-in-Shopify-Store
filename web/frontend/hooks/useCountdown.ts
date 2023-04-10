import { useEffect, useState } from 'react';

const useCountdown = (expiredAt: string) => {
  const endDate = new Date(expiredAt).getTime();

  const [countDown, setCountDown] = useState(endDate - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(endDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdown };
