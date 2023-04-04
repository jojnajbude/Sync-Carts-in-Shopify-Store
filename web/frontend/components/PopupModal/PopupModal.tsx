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
  type: 'remove' | 'un-reserve' | 'expend';
  selectedRows: string[];
  setShowModal: (state: boolean) => void;
};

export default function PopupModal({
  type,
  selectedRows,
  setShowModal,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('24');
  const [selectValue, setSelectValue] = useState('hr');
  const fetch = useAuthenticatedFetch();

  const handleTextFieldChange = useCallback(
    (value: string) => setTextFieldValue(value),
    []
  );

  const handleSelectChange = useCallback(
    (value: string) => setSelectValue(value),
    []
  );

  const unreserveAllItems = async () => {
    setIsLoading(true);

    const reserveItems = await fetch('api/carts/unreserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify(selectedRows),
    });

    setShowModal(false);
  };

  const removeAllItems = async () => {
    setIsLoading(true);

    const removeItems = await fetch('/api/carts/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify(selectedRows),
    });

    setShowModal(false);
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
        };

      case type == 'un-reserve':
        return {
          title: 'Unreserve all items?',
          text: 'This action will cancel all product timers from the selected carts. Еhey will not be marked as expired',
          primaryButtonText: 'Unreserve all items',
          primaryAction: unreserveAllItems,
          destructive: false,
          secondaryButtonText: 'Cancel',
          sencodaryAction: closeModal,
        };

      case type === 'expend':
        return {
          title: 'Expand reservation time',
        };
    }
  })();

  const expandTime = () => {
    console.log(textFieldValue, selectValue);
  };

  return (
    <div style={{ height: '500px' }}>
      {isLoading ? (
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
            type !== 'expend'
              ? {
                  content: configureModal.primaryButtonText,
                  destructive: configureModal.destructive,
                  onAction: configureModal.primaryAction,
                }
              : null
          }
          secondaryActions={
            type !== 'expend'
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
            {type === 'expend' ? (
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
