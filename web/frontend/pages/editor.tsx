import { Layout, LegacyCard, Page } from '@shopify/polaris';
import { useRef } from 'react';
import EmailEditor from 'react-email-editor';

export default function EmailCustomizer() {
  const emailEditorRef = useRef(null);

  const exportHtml = () => {
    emailEditorRef.current.editor.exportHtml(data => {
      const { design, html } = data;
      console.log('exportHtml', html);
    });
  };

  const onReady = () => {
    // editor is ready
    // you can load your template here;
    // const templateJson = {};
    // emailEditorRef.current.editor.loadDesign(templateJson);
  };

  return (
    <Page
      fullWidth
      primaryAction={{ content: 'Save template', onAction: () => exportHtml }}
    >
      <Layout>
        <Layout.Section fullWidth>
          <EmailEditor
            minHeight={750}
            ref={emailEditorRef}
            onReady={onReady}
            options={{
              mergeTags: [
                {
                  name: 'First name',
                  value: '{{first_name}}',
                },
              ],
              specialLinks: [
                {
                  name: 'Cart link',
                  href: '{{link}}',
                  target: '_blank',
                },
              ],
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
