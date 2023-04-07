import { useEffect, useState } from 'react';

const useCountdown = (createdAt: string, priority: string) => {
  const msInHour = 3600000;

  const reserveTime = () => {
    switch (true) {
      case priority === 'max':
        return msInHour * 336;

      case priority === 'high':
        return msInHour * 72;

      case priority === 'normal':
        return msInHour * 24;

      case priority === 'low':
        return msInHour * 8;

      case priority === 'min':
        return msInHour * 1;
    }
  };

  const startDate = new Date(createdAt);
  const endDate = new Date(reserveTime() + startDate.getTime()).getTime();

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
