import { useState, useCallback } from 'react';
import {
  Modal,
  TextContainer,
  TextField,
  Select,
  Button,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../../hooks';

type Props = {
  type: 'remove' | 'unreserve' | 'expand';
  selectedRows: string[];
  setShowModal: (state: boolean) => void;
  setIsError: (state: boolean) => void;
  setActiveToast: (state: boolean) => void;
  setIsLoading: (state: boolean) => void;
};

export default function PopupModal({
  type,
  selectedRows,
  setShowModal,
  setIsError,
  setActiveToast,
  setIsLoading,
}: Props) {
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('24');
  const [selectValue, setSelectValue] = useState('hours');
  const fetch = useAuthenticatedFetch();

  const handleTextFieldChange = useCallback(
    (value: string) => setTextFieldValue(value),
    [],
  );

  const handleSelectChange = useCallback(
    (value: string) => setSelectValue(value),
    [],
  );

  const unreserveAllItems = async () => {
    setIsModalLoading(true);

    const response = await fetch('api/carts/unreserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify(selectedRows),
    });

    setIsModalLoading(false);
    setShowModal(false);

    response.ok ? setIsError(false) : setIsError(true);

    setActiveToast(true);
    setIsLoading(true);
  };

  const removeAllItems = async () => {
    setIsModalLoading(true);

    const response = await fetch('/api/carts/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify(selectedRows),
    });

    setIsModalLoading(false);
    setShowModal(false);

    response.ok ? setIsError(false) : setIsError(true);

    setActiveToast(true);
    setIsLoading(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const configureModal = (() => {
    switch (true) {
      case type === 'remove':
        return {
          title: 'Remove all items from carts?',
          text: 'This action will remove all products from the selected carts. The next time when customer visits the shop, his cart will be updated. This action cannot be undone.',
          primaryButtonText: 'Remove all items',
          primaryAction: removeAllItems,
          destructive: true,
          secondaryButtonText: 'Cancel',
          sencodaryAction: closeModal,
          toastTextOk: 'All items was removed',
          toastTextError: 'An error occurred. Try again later',
        };

      case type == 'unreserve':
        return {
          title: 'Unreserve all items?',
          text: 'This action will cancel all product timers from the selected carts. Еhey will not be marked as expired',
          primaryButtonText: 'Unreserve all items',
          primaryAction: unreserveAllItems,
          destructive: false,
          secondaryButtonText: 'Cancel',
          sencodaryAction: closeModal,
          toastTextOk: 'All items was unreseved',
          toastTextError: 'An error occurred. Try again later',
        };

      case type === 'expand':
        return {
          title: 'Expand reservation time',
          toastTextOk: 'All items was successfully expend',
          toastTextError: 'An error occurred. Try again later',
        };
    }
  })();

  const expandTime = async () => {
    setIsModalLoading(true);

    const msInHour = 3600000;
    const msInDay = 86400000;
    const msInWeek = 604800000;
    const msInMonth = 2629743833.3;

    let expandTimeInMs = 0;

    switch (true) {
      case selectValue === 'hours':
        expandTimeInMs = Number(textFieldValue) * msInHour;
        break;

      case selectValue === 'days':
        expandTimeInMs = Number(textFieldValue) * msInDay;
        break;

      case selectValue === 'weeks':
        expandTimeInMs = Number(textFieldValue) * msInWeek;
        break;

      case selectValue === 'months':
        expandTimeInMs = Number(textFieldValue) * msInMonth;
        break;
    }

    const response = await fetch(`api/carts/expand?ms=${expandTimeInMs}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify(selectedRows),
    });

    setIsModalLoading(false);
    setShowModal(false);

    response.ok ? setIsError(false) : setIsError(true);

    setActiveToast(true);
    setIsLoading(true);
  };

  return (
    <div style={{ height: '500px' }}>
      {isModalLoading ? (
        <Modal
          title={configureModal.title}
          loading={true}
          open={true}
          onClose={closeModal}
        >
          <Modal.Section>
            <TextContainer>
              <p>{configureModal.text}</p>
            </TextContainer>
          </Modal.Section>
        </Modal>
      ) : (
        <Modal
          open={true}
          onClose={closeModal}
          title={configureModal.title}
          primaryAction={
            type !== 'expand'
              ? {
                  content: configureModal.primaryButtonText,
                  destructive: configureModal.destructive,
                  onAction: configureModal.primaryAction,
                }
              : null
          }
          secondaryActions={
            type !== 'expand'
              ? [
                  {
                    content: configureModal.secondaryButtonText,
                    onAction: configureModal.sencodaryAction,
                  },
                ]
              : null
          }
        >
          <Modal.Section>
            {type === 'expand' ? (
              <TextField
                label="Set time to expand"
                type="number"
                value={textFieldValue}
                onChange={handleTextFieldChange}
                autoComplete="off"
                connectedLeft={
                  <Select
                    value={selectValue}
                    label="Weight unit"
                    onChange={handleSelectChange}
                    labelHidden
                    options={['hours', 'days', 'weeks', 'months']}
                  />
                }
                connectedRight={<Button onClick={expandTime}>Submit</Button>}
              />
            ) : (
              <TextContainer>
                <p>{configureModal.text}</p>
              </TextContainer>
            )}
          </Modal.Section>
        </Modal>
      )}
    </div>
  );
}
