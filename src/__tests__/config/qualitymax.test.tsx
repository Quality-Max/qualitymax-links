import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import QualityMaxHub from '../../components/QualityMaxHub/QualityMaxHub';
import { getHubContent } from '../../components/QualityMaxHub/content';
import { getRuntimeConfig } from '../../config/runtimeConfig';
import AnalyticsTracker from '../../analytics/AnalyticsTracker';

const defaultContent = () =>
  getHubContent(getRuntimeConfig({ QUALITYMAX_BRANDING: 'true' }));

describe('QualityMax branding', () => {
  test('runtime overrides replace or clear branded defaults without exposing config', () => {
    const content = getHubContent(
      getRuntimeConfig({
        QUALITYMAX_BRANDING: 'true',
        NAME: 'Event links',
        FOOTER: '',
        CUSTOM_BUTTON_NAME: 'platform,docs,extra,extra',
        CUSTOM_BUTTON_URL:
          'https://example.com,,https://extra.example,https://duplicate.example',
        CUSTOM_BUTTON_TEXT: 'Custom platform,Docs,Extra,Extra',
        CUSTOM_BUTTON_ALT_TEXT: 'Custom platform,Docs,Extra,Extra',
        GA_TRACKING_ID: 'G-PUBLIC-TEST',
      }),
    );
    expect(content.title).toBe('Event links');
    expect(content.footer).toBe('');
    expect(content.links.map(link => link.url)).toEqual([
      'https://example.com',
      'https://extra.example',
    ]);
    expect(content.links[0].label).toBe('Custom platform');
    expect(content).not.toHaveProperty('GA_TRACKING_ID');
    expect(
      getRuntimeConfig({ QUALITYMAX_BRANDING: 'true' }).UMAMI_WEBSITE_ID,
    ).toBeUndefined();
  });

  test('all twelve destinations have text alternatives and matching mascot event names', () => {
    render(<QualityMaxHub {...defaultContent()} />);
    const nav = screen.getByRole('navigation', { name: 'All destinations' });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(12);
    expect(
      new Set(Array.from(links, link => link.dataset.analyticsEvent)).size,
    ).toBe(12);
    expect(
      screen.getByRole('link', { name: 'Left front paw: Book a demo' }),
    ).toHaveAttribute('href', 'https://calendar.app.google/66H2NEs2MoATZ93i6');
    expect(
      screen.getByRole('link', { name: 'Forehead: YouTube' }),
    ).toHaveAttribute('href', 'https://www.youtube.com/@Quality-Max-dev');
    expect(
      screen.getByRole('link', { name: 'Right cheek: qmax-code GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/Quality-Max/qmax-code');
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('data-analytics-event');
      expect(link).not.toHaveAttribute('data-umami-event');
    }
  });

  test('extra links cannot collide with a mascot destination ID', () => {
    const content = getHubContent(
      getRuntimeConfig({
        QUALITYMAX_BRANDING: 'true',
        CUSTOM_BUTTON_NAME: 'qualitymax-github,qm-gh',
        CUSTOM_BUTTON_URL:
          'https://github.com/Quality-Max/qualitymax,https://extra.example',
        CUSTOM_BUTTON_TEXT: 'QualityMax GitHub,Extra resource',
        CUSTOM_BUTTON_ALT_TEXT: 'QualityMax GitHub,Extra resource',
      }),
    );
    render(<QualityMaxHub {...content} />);
    expect(
      screen.getByRole('link', { name: 'Extra resource' }),
    ).toHaveAttribute('href', 'https://extra.example');
    expect(new Set(content.links.map(link => link.id)).size).toBe(2);
  });

  test('a failed kitten image leaves all text destinations available', () => {
    render(<QualityMaxHub {...defaultContent()} />);
    fireEvent.error(screen.getByAltText(/Max, the black QualityMax kitten/));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Every destination is still linked below',
    );
    expect(
      screen.queryByRole('link', { name: 'Forehead: YouTube' }),
    ).not.toBeInTheDocument();
    expect(
      screen
        .getByRole('navigation', { name: 'All destinations' })
        .querySelectorAll('a'),
    ).toHaveLength(12);
  });

  test('each navigation surface records exactly one event through the shared tracker', () => {
    window.umami = { track: jest.fn() };
    const track = window.umami.track;
    render(
      <>
        <QualityMaxHub {...defaultContent()} />
        <AnalyticsTracker
          umamiWebsiteId="public-test"
          umamiAppUrl="https://analytics.example.com"
        />
      </>,
    );
    const mascotLink = screen.getByRole('link', { name: 'Forehead: YouTube' });
    fireEvent.click(mascotLink);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenLastCalledWith('youtube-button');
    fireEvent.click(
      screen.getAllByRole('link', { name: 'QualityMax on YouTube' })[0],
    );
    expect(track).toHaveBeenCalledTimes(2);
    fireEvent.click(
      screen.getAllByRole('link', { name: 'QualityMax on YouTube' })[1],
    );
    expect(track).toHaveBeenCalledTimes(3);
    delete window.umami;
  });
});
