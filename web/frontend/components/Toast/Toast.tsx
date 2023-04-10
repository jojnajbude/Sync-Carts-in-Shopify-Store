import { useState, useCallback } from 'react';
import { Toast } from '@shopify/polaris';

type Props = {
  modalType: 'remove' | 'unreserve' | 'expand';
  isActive: boolean;
  errorMarkup: boolean;
};

export default function CartToast({ modalType, isActive, errorMarkup }: Props) {
  const [activeToast, setActiveToast] = useState(isActive);
  const [isError, setIsError] = useState(errorMarkup);

  const toggleActiveToast = useCallback(
    () => setActiveToast(active => !active),
    [],
  );

  const generateToast = () => {
    switch (true) {
      case modalType === 'remove':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'All items successfully removed'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );

      case modalType === 'unreserve':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'All items successfully unreserved'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );

      case modalType === 'expand':
        return (
          <Toast
            content={
              isError
                ? 'Something went wrong. Try again later.'
                : 'All items timers successfully expand'
            }
            error={isError}
            onDismiss={toggleActiveToast}
          />
        );
    }
  };

  return activeToast ? generateToast() : null;
}
