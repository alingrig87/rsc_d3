import type { Preview } from '@storybook/react';
import React from 'react';
import { Provider, defaultTheme } from '@adobe/react-spectrum';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <Provider theme={defaultTheme} colorScheme="light">
        <Story />
      </Provider>
    ),
  ],
};

export default preview;
