import { CalloutCard, FooterHelp, Layout, Page } from '@shopify/polaris';
import MediaCardBanner from '../components/MediaCard';
import { SubscribtionContext } from '../context/SubscribtionContext';
import { useContext } from 'react';
import CollapsibleTab from '../components/CollapsibleTab';

export default function SupportPage() {
  const context = useContext(SubscribtionContext);

  return (
    <Page title="Support">
      <Layout>
        <Layout.Section>
          <CalloutCard
            title="Need any help?"
            illustration="https://seeklogo.com/images/M/mail-icon-logo-28FE0635D0-seeklogo.com.png"
            primaryAction={{
              content: 'Contact us',
              url: 'mailto:Support@SimplifyApps.dev',
              external: true,
              target: '_blank',
            }}
          >
            <p>
              We are here to help, from installing the reservation timer, to
              answering general questions!
            </p>
          </CalloutCard>
        </Layout.Section>
        {context.plan ? (
          <Layout.Section>
            <MediaCardBanner plan={context.plan}></MediaCardBanner>
          </Layout.Section>
        ) : null}
        <Layout.Section>
          <CollapsibleTab />
        </Layout.Section>
      </Layout>

      <FooterHelp>© Simplify Apps. All rights reserved.</FooterHelp>
    </Page>
  );
}
