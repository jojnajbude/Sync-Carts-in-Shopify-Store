import { MediaCard, VideoThumbnail } from '@shopify/polaris';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedFetch } from '../hooks';

export default function MediaCardBanner({ plan }: any) {
  const [isOpen, setIsOpen] = useState(plan ? plan.tutorial : false);
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  return (
    <div style={{ display: !isOpen ? 'none' : 'block' }}>
      <MediaCard
        portrait={true}
        title="Getting Started"
        primaryAction={{
          content: 'Start setup',
          onAction: () => navigate('/faq'),
        }}
        description="Learn how to setup Smart Carts so you can start using your new app!"
        popoverActions={[
          {
            content: 'Dont show this again',
            onAction: () => {
              fetch('/api/shop/tutorial');
              setIsOpen(false);
            },
          },
        ]}
      >
        <iframe
          width="100%"
          height="350"
          src="https://www.youtube.com/embed/y6Qy67hOnhc"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </MediaCard>
    </div>
  );
}
