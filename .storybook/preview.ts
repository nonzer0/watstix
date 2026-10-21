import type { Preview } from '@storybook/react-vite';
import { sb } from 'storybook/test';
import { applyTheme, isThemePreference } from '../src/utils/theme';

import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '../src/index.css';
import '../src/tokens.css';
import '../src/typography.css';

// Page stories render real views; keep them off the network.
sb.mock(import('../src/services/jobService.ts'));
sb.mock(import('../src/services/interviewPhaseService.ts'));
sb.mock(import('../src/services/jobPostingService.ts'));

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'system',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      applyTheme(isThemePreference(theme) ? theme : 'system');
      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
