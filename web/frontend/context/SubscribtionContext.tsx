import { useAuthenticatedFetch } from '../hooks';
import React, { createContext, useEffect, useState } from 'react';

export type SubscribtionContext = {
  plan: any;
  setPlan: (plan: any) => void;
};

const initialContext = null as unknown as SubscribtionContext;

const SubscribtionContext = createContext(initialContext);

type Props = {
  children: JSX.Element;
};

const SubscribtionContextProvider: React.FC<Props> = ({ children }) => {
  const [plan, setPlan] = useState(initialContext);
  const [isLoading, setIsLoading] = useState(true);
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    if (isLoading) {
      const plan = fetch('/api/subscribe/get')
        .then(res => res.json())
        .then(data => {
          setPlan(data);
          setIsLoading(false);
        });
    }
  }, [plan]);

  return (
    <SubscribtionContext.Provider
      value={{
        plan,
        setPlan,
      }}
    >
      {children}
    </SubscribtionContext.Provider>
  );
};

export { SubscribtionContextProvider, SubscribtionContext };
