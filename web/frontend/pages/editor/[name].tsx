import {
  AlphaCard,
  Frame,
  Layout,
  Page,
  SkeletonBodyText,
  SkeletonPage,
  Toast,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../../hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EmailEditor } from 'react-email-editor';
import { useParams } from 'react-router-dom';

type NameParams = {
  name: 'reminder' | 'update' | 'soon' | 'expired';
};

export default function EmailCustomizer() {
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeToast, setActiveToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  const fetch = useAuthenticatedFetch();
  const emailEditorRef = useRef(null);
  const { name } = useParams<NameParams>();

  const title = {
    reminder: 'Cart reminder template',
    update: 'Cart updated template',
    soon: 'Item expire soon template',
    expired: 'Item expired template',
  };

  useEffect(() => {
    if (isLoading) {
      const takeTemplate = async () => {
        const template = await fetch(`/api/notifications/get?name=${name}`);
        const templateJson = await template.json();

        setTemplate(templateJson);
        setIsLoading(false);
      };

      takeTemplate();
    }
  }, [isLoading]);

  const exportHtml = async () => {
    emailEditorRef.current.editor.exportHtml((data: any) => {
      const { design, html } = data;
      saveTemplate(name, html, design);
    });
  };

  const saveTemplate = async (name: string, html: object, design: string) => {
    const template = await fetch('/api/notifications/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await JSON.stringify({
        name,
        html,
        design,
      }),
    });

    setIsLoading(true);

    if (template.ok) {
      setIsSuccess(true);
    } else {
      setIsSuccess(false);
    }

    setActiveToast(true);
  };

  const onReady = async () => {
    emailEditorRef.current.editor.loadDesign(template);
  };

  const createToast = (isSuccess: boolean) => {
    return isSuccess ? (
      <Toast
        content="Email template successfully updated"
        onDismiss={toggleActiveToast}
      />
    ) : (
      <Toast
        content="Something went wrong. Please trye again later."
        error
        onDismiss={toggleActiveToast}
      />
    );
  };

  const toggleActiveToast = useCallback(
    () => setActiveToast(activeToast => !activeToast),
    [],
  );

  return (
    <Page
      fullWidth
      title={title[name]}
      primaryAction={{
        content: 'Save template',
        onAction: () => exportHtml(),
        loading: isLoading,
      }}
    >
      <Frame>
        <Layout>
          <Layout.Section fullWidth>
            {isLoading ? (
              <SkeletonPage primaryAction>
                <Layout>
                  <Layout.Section>
                    <AlphaCard>
                      <SkeletonBodyText />
                    </AlphaCard>
                  </Layout.Section>
                  <Layout.Section>
                    <AlphaCard>
                      <SkeletonBodyText lines={12} />
                    </AlphaCard>
                  </Layout.Section>
                </Layout>
              </SkeletonPage>
            ) : (
              <EmailEditor
                minHeight={750}
                ref={emailEditorRef}
                onReady={onReady}
                options={{
                  mergeTags: [
                    {
                      name: 'Item title',
                      value: '{{item_title}}',
                    },
                    {
                      name: 'Item quantity',
                      value: '{{item_qty}}',
                    },
                    {
                      name: 'Item price',
                      value: '{{item_price}}',
                    },
                    {
                      name: 'Shop email',
                      value: '{{shop_email}}',
                    },
                    {
                      name: 'Cart link',
                      value: '{{link}}',
                    },
                    {
                      name: 'Image link',
                      value: '{{item_image}}',
                    },
                  ],
                }}
              />
            )}
          </Layout.Section>
        </Layout>
        {activeToast && createToast(isSuccess)}
      </Frame>
    </Page>
  );
}
