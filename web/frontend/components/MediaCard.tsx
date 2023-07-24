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
        title="Overview of Smart Carts"
        description="We've made a short video going over the full functionality of Smart Carts, so you can use it to the fullest extent!"
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
