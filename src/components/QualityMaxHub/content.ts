import type { RuntimeConfig } from '../../config/runtimeConfig';
import { DESTINATIONS, type Destination } from './destinations';

// Only public display content crosses the server/client boundary.
export function getHubContent(config: RuntimeConfig) {
  const names = (config.CUSTOM_BUTTON_NAME || '').split(',');
  const urls = (config.CUSTOM_BUTTON_URL || '').split(',');
  const texts = (config.CUSTOM_BUTTON_TEXT || '').split(',');
  const alts = (config.CUSTOM_BUTTON_ALT_TEXT || '').split(',');
  const links: Destination[] = [];
  names.forEach((rawName, index) => {
    const name = rawName.trim();
    const url = urls[index]?.trim();
    // Match LittleLink's configurable lists; an empty URL disables the link.
    if (!name || !url || links.some(link => link.event === `${name}-button`))
      return;
    const original = DESTINATIONS.find(link => link.event === `${name}-button`);
    links.push({
      ...original,
      id: original?.id || `custom:${name}`,
      event: `${name}-button`,
      variant: original?.variant || 'quiet',
      label: texts[index]?.trim() || original?.label || name,
      aria:
        alts[index]?.trim() || texts[index]?.trim() || original?.aria || name,
      url,
    });
  });
  return {
    links,
    title: config.NAME ?? '',
    subtitle: config.BIO ?? '',
    footer: config.FOOTER ?? '',
    target: config.BUTTON_TARGET === '_self' ? '_self' : '_blank',
  };
}
