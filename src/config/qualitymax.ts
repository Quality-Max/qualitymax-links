import type { EnvName } from './envNames';

// Public content only. Account credentials belong in the provider, never here.
const buttons = [
  ['demo', 'Book a demo', 'https://calendar.app.google/66H2NEs2MoATZ93i6'],
  [
    'proof',
    'See a verified code fix',
    'https://qualitymax.io/verified-patch-sample',
  ],
  ['platform', 'Explore QualityMax', 'https://qualitymax.io/'],
  ['9lives', 'Get 9lives for Playwright', 'https://9lives.run/'],
  ['qmax-code', 'Meet qmax-code', 'https://qualitymax.io/qmax-code'],
  ['docs', 'Read the documentation', 'https://docs.qualitymax.io/'],
] as const;

export const QUALITYMAX_DEFAULTS: Partial<Record<EnvName, string>> = {
  THEME: 'Dark',
  LANG: 'en',
  META_TITLE: 'QualityMax | Links',
  META_DESCRIPTION: 'AI writes the code. QualityMax verifies it.',
  META_AUTHOR: 'QualityMax',
  META_INDEX_STATUS: 'noindex,follow',
  OG_TITLE: 'QualityMax | Links',
  OG_DESCRIPTION: 'AI writes the code. QualityMax verifies it.',
  OG_SITE_NAME: 'QualityMax',
  FAVICON_URL: '/qualitymax/favicon.png',
  AVATAR_URL: '/qualitymax/logo-white.svg',
  AVATAR_ALT: 'QualityMax',
  NAME: 'AI writes the code.',
  BIO: 'QualityMax verifies it.',
  BUTTON_TARGET: '_blank',
  BUTTON_ORDER: buttons.map(([name]) => name).join(','),
  CUSTOM_BUTTON_NAME: buttons.map(([name]) => name).join(','),
  CUSTOM_BUTTON_TEXT: buttons.map(([, text]) => text).join(','),
  CUSTOM_BUTTON_ALT_TEXT: buttons.map(([, text]) => text).join(','),
  CUSTOM_BUTTON_URL: buttons.map(([, , url]) => url).join(','),
  CUSTOM_BUTTON_COLOR: buttons
    .map((_, index) => (index === 0 ? '#6366f1' : '#18181b'))
    .join(','),
  CUSTOM_BUTTON_TEXT_COLOR: buttons.map(() => '#ffffff').join(','),
  FOOTER: 'Independent verification for AI-generated code.',
};
