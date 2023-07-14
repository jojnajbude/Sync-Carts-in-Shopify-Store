export const themes = [
  {
    label: 'Free themes',
    value: 'free',
    steps: [
      <>Confirm that you have the Smart Carts embed block turned on</>,
      <>
        Make sure you are signed in to an account when you add items to your
        cart. If the reservation timer still does not show up, please follow the
        steps below:
      </>,
      <>
        Go to <b>Online Store </b>sales channel
      </>,
      <>
        Open the code editor on your active theme by clicking the 3 dots next to
        your active theme, then select <b>&quot;Edit code&quot;</b>
      </>,
      <>
        Copy this code
        <p>
          <code>
            {
              '{%  render "reserve-timer", variant_id: item.variant_id, color: "red" %}'
            }
          </code>
        </p>
      </>,
      <>
        Open <b>cart-drawer.liquid</b> under the snippets section, insert the
        given code on line 175
      </>,
      <>
        Open <b>main-cart-items.liquid</b> under the Sections section, insert
        the given code on line 132
      </>,
      <>
        Select <b>cart-notification-product.liquid</b> under the Sections
        section, insert the given code on line 29
      </>,
      <>
        <i>
          Note: if you have made changes to the code, the line number may be
          different. We recommend you watch the video guide.
        </i>
      </>,
      <>
        {
          'Optional: You can change the "color: red" to any color you would like (Black, Pink, etc) or you can use a Hex-code.'
        }
      </>,
      <>Make sure and save your changes!</>,
    ],
    video: 'https://www.youtube.com/embed/mb3bv9_RdOU',
  },
  {
    label: 'Capital',
    value: 'capital',
    steps: [
      <>Confirm that you have the Smart Carts embed block turned on</>,
      <>
        Make sure you are signed in to an account when you add items to your
        cart. If the reservation timer still does not show up, please follow the
        steps below:
      </>,
      <>
        Go to <b>Online Store </b>sales channel
      </>,
      <>
        Open the code editor on your active theme by clicking the 3 dots next to
        your active theme, then select <b>&quot;Edit code&quot;</b>
      </>,
      <>
        Copy this code
        <pre>
          <code>
            {
              '{%  render "reserve-timer", variant_id: item.variant_id, color: "red" %}'
            }
          </code>
        </pre>
      </>,
      <>
        Open <b>cart-content.liquid</b> under the snippets section, insert the
        given code on line 40
      </>,
      <>
        <i>
          Note: if you have made changes to the code, the line number may be
          different. We recommend you watch the video guide.
        </i>
      </>,
      <>
        {
          'Optional: You can change the "color: red" to any color you would like (Black, Pink, etc) or you can use a Hex-code.'
        }
      </>,
      <>Make sure and save your changes!</>,
    ],
    video: 'https://www.youtube.com/embed/_paStWTunEk',
  },
  {
    label: 'Icon',
    value: 'icon',
    steps: [
      <>Confirm that you have the Smart Carts embed block turned on</>,
      <>
        Make sure you are signed in to an account when you add items to your
        cart. If the reservation timer still does not show up, please follow the
        steps below:
      </>,
      <>
        Go to <b>Online Store </b>sales channel
      </>,
      <>
        Open the code editor on your active theme by clicking the 3 dots next to
        your active theme, then select <b>&quot;Edit code&quot;</b>
      </>,
      <>
        Copy this code
        <pre>
          <code>
            {
              '{%  render "reserve-timer", variant_id: item.variant_id, color: "red" %}'
            }
          </code>
        </pre>
      </>,
      <>
        Open <b>cart-form.liquid</b> under the snippets section, insert the
        given code on line 77
      </>,
      <>
        <i>
          Note: if you have made changes to the code, the line number may be
          different. We recommend you watch the video guide.
        </i>
      </>,
      <>
        {
          'Optional: You can change the "color: red" to any color you would like (Black, Pink, etc) or you can use a Hex-code.'
        }
      </>,
      <>Make sure and save your changes!</>,
    ],
    video: 'https://www.youtube.com/embed/oLGXxzH-4YU',
  },
  {
    label: 'Impulse',
    value: 'impulse',
    steps: [
      <>Confirm that you have the Smart Carts embed block turned on</>,
      <>
        Make sure you are signed in to an account when you add items to your
        cart. If the reservation timer still does not show up, please follow the
        steps below:
      </>,
      <>
        Go to <b>Online Store </b>sales channel
      </>,
      <>
        Open the code editor on your active theme by clicking the 3 dots next to
        your active theme, then select <b>&quot;Edit code&quot;</b>
      </>,
      <>
        Copy this code
        <pre>
          <code>
            {
              '{% render "reserve-timer", variant_id: product.variant_id, color: "red" %}'
            }
          </code>
        </pre>
      </>,
      <>
        Open <b>cart-item.liquid</b> under the snippets section, insert the
        given code on line 28
      </>,
      <>
        <i>
          Note: if you have made changes to the code, the line number may be
          different. We recommend you watch the video guide.
        </i>
      </>,
      <>
        {
          'Optional: You can change the "color: red" to any color you would like (Black, Pink, etc) or you can use a Hex-code.'
        }
      </>,
      <>Make sure and save your changes!</>,
    ],
    video: 'https://www.youtube.com/embed/P43Ng-G5LYQ',
  },
  {
    label: 'Story',
    value: 'story',
    steps: [
      <>Confirm that you have the Smart Carts embed block turned on</>,
      <>
        Make sure you are signed in to an account when you add items to your
        cart. If the reservation timer still does not show up, please follow the
        steps below:
      </>,
      <>
        Go to <b>Online Store </b>sales channel
      </>,
      <>
        Open the code editor on your active theme by clicking the 3 dots next to
        your active theme, then select <b>&quot;Edit code&quot;</b>
      </>,
      <>
        Copy this code
        <pre>
          <code>
            {
              '{% render "reserve-timer", variant_id: line_item.variant_id, color: "red" %}'
            }
          </code>
        </pre>
      </>,
      <>
        Open <b>cart-line-items.liquid</b> under the snippets section, insert
        given code on line 44
      </>,
      <>
        <i>
          Note: if you have made changes to the code, the line number may be
          different. We recommend you watch the video guide.
        </i>
      </>,
      <>
        {
          'Optional: You can change the "color: red" to any color you would like (Black, Pink, etc) or you can use a Hex-code.'
        }
      </>,
      <>Make sure and save your changes!</>,
    ],
    video: 'https://www.youtube.com/embed/DAiidAAF86Q',
  },
  {
    label: 'Testament',
    value: 'testament',
    steps: [
      <>Confirm that you have the Smart Carts embed block turned on</>,
      <>
        Make sure you are signed in to an account when you add items to your
        cart. If the reservation timer still does not show up, please follow the
        steps below:
      </>,
      <>
        Go to <b>Online Store </b>sales channel
      </>,
      <>
        Open the code editor on your active theme by clicking the 3 dots next to
        your active theme, then select <b>&quot;Edit code&quot;</b>
      </>,
      <>
        Copy this code
        <pre>
          <code>
            {
              '{%  render "reserve-timer", variant_id: item.variant_id, color: "red" %}'
            }
          </code>
        </pre>
      </>,
      <>
        Open <b>cart-line-items.liquid</b> under the snippets section, insert
        the the given code on line 44
      </>,
      <>
        <i>
          Note: if you have made changes to the code, the line number may be
          different. We recommend you watch the video guide.
        </i>
      </>,
      <>
        {
          'Optional: You can change the "color: red" to any color you would like (Black, Pink, etc) or you can use a Hex-code.'
        }
      </>,
      <>Make sure and save your changes!</>,
    ],
    video: 'https://www.youtube.com/embed/0X0FV7534iQ',
  },
];
