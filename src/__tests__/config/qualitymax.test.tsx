import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../../components/Home/Home';
import { getRuntimeConfig } from '../../config/runtimeConfig';

describe('QualityMax branding', () => {
  test('runtime overrides can replace or clear branded defaults', () => {
    const config = getRuntimeConfig({
      QUALITYMAX_BRANDING: 'true',
      META_TITLE: 'Event links',
      FOOTER: '',
    });
    expect(config.META_TITLE).toBe('Event links');
    expect(config.FOOTER).toBe('');
    expect(config.GA_TRACKING_ID).toBeUndefined();
    expect(config.UMAMI_WEBSITE_ID).toBeUndefined();
  });

  test('renders the intended destinations and distinct click event names', () => {
    render(<Home config={getRuntimeConfig({ QUALITYMAX_BRANDING: 'true' })} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(6);
    expect(links[0]).toHaveAttribute(
      'href',
      'https://calendar.app.google/66H2NEs2MoATZ93i6',
    );
    expect(links[0]).toHaveAttribute('data-analytics-event', 'demo-button');
    expect(
      screen.getByRole('link', { name: 'Get 9lives for Playwright' }),
    ).toHaveAttribute('href', 'https://9lives.run/');
    expect(
      new Set(links.map(link => link.getAttribute('data-analytics-event')))
        .size,
    ).toBe(6);
    for (const link of links) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
