import { MediaCard } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

export default function MediaCardBanner() {
  const navigate = useNavigate();

  return (
    <MediaCard
      title="Getting Started"
      primaryAction={{
        content: 'Learn about getting started',
        onAction: () => navigate('/faq'),
      }}
      description="Discover how to set up Better Carts functionality."
      popoverActions={[{ content: 'Dont show this again', onAction: () => {} }]}
    >
      <img
        alt=""
        width="100%"
        height="100%"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        src="https://thumbs.dreamstime.com/b/shopping-cart-fire-fast-shopping-concept-shopping-cart-fire-fast-shopping-concept-184933462.jpg"
      />
    </MediaCard>
  );
}
