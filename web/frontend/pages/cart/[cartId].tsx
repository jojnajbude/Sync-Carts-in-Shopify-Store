import { useNavigate, useParams } from 'react-router-dom';
import { Page, Badge, LegacyCard } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useAuthenticatedFetch } from '../../hooks';

export default function PageExample() {
  const { cartId } = useParams();
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  useEffect(() => {

  }, [])

  return (
    <Page
      breadcrumbs={[{ onAction: () => navigate(-1) }]}
      title={`Cart #${cartId}`}
      titleMetadata={<Badge status="success">All items reserved</Badge>}
      subtitle="Perfect for any pet"
      compactTitle
      primaryAction={{ content: 'Save', disabled: true }}
      secondaryActions={[
        {
          content: 'Duplicate',
          accessibilityLabel: 'Secondary action label',
          onAction: () => alert('Duplicate action'),
        },
        {
          content: 'View on your store',
          onAction: () => alert('View on your store action'),
        },
      ]}
      actionGroups={[
        {
          title: 'Promote',
          actions: [
            {
              content: 'Share on Facebook',
              accessibilityLabel: 'Individual action label',
              onAction: () => alert('Share on Facebook action'),
            },
          ],
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <LegacyCard title="Credit card" sectioned>
        <p>Credit card information</p>
      </LegacyCard>
    </Page>
  );
}
