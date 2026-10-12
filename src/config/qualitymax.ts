import type { EnvName } from './envNames';

// Public content only. Account credentials belong in the provider, never here.
import { DESTINATIONS } from '../components/QualityMaxHub/destinations';

const buttons = DESTINATIONS.map(link => [
  link.event.replace(/-button$/, ''),
  link.label,
  link.url,
  link.aria,
]);

export const QUALITYMAX_DEFAULTS: Partial<Record<EnvName, string>> = {
  THEME: 'Light',
  LANG: 'en',
  META_TITLE: 'QualityMax · qmax.run',
  META_DESCRIPTION: 'AI writes the code. QualityMax verifies it.',
  META_AUTHOR: 'QualityMax',
  META_INDEX_STATUS: 'noindex,follow',
  OG_TITLE: 'QualityMax · qmax.run',
  OG_DESCRIPTION: 'AI writes the code. QualityMax verifies it.',
  OG_SITE_NAME: 'QualityMax',
  OG_URL: 'https://qmax.run/',
  FAVICON_URL: '/qualitymax/favicon.png',
  AVATAR_URL: '/qualitymax/logo-white.svg',
  AVATAR_ALT: 'QualityMax',
  NAME: 'AI writes the code.',
  BIO: 'QualityMax verifies it.',
  BUTTON_TARGET: '_blank',
  BUTTON_ORDER: buttons.map(([name]) => name).join(','),
  CUSTOM_BUTTON_NAME: buttons.map(([name]) => name).join(','),
  CUSTOM_BUTTON_TEXT: buttons.map(([, text]) => text).join(','),
  CUSTOM_BUTTON_ALT_TEXT: buttons
    .map(([, , , aria]) => aria.replaceAll(',', ' —'))
    .join(','),
  CUSTOM_BUTTON_URL: buttons.map(([, , url]) => url).join(','),
  CUSTOM_BUTTON_COLOR: buttons
    .map((_, index) => (index === 0 ? '#6366f1' : '#F6F3EC'))
    .join(','),
  CUSTOM_BUTTON_TEXT_COLOR: buttons
    .map((_, index) => (index === 0 ? '#ffffff' : '#19134F'))
    .join(','),
  FOOTER: 'Independent verification for AI-generated code.',
};
