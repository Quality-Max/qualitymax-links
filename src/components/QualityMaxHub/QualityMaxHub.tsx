'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GROUPS, ICONS, type Destination } from './destinations';
import type { getHubContent } from './content';

type Props = ReturnType<typeof getHubContent>;
type Leader = { id: string; x1: number; y1: number; x2: number; y2: number };

export default function QualityMaxHub({
  links,
  title,
  subtitle,
  footer,
  target,
}: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const image = artwork.current;
    if (image?.complete && image.naturalWidth === 0) setImageFailed(true);
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let frame = 0;
    let disposed = false;
    const schedule = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!element.offsetWidth || window.innerWidth < 900 || imageFailed) {
          setLeaders([]);
          return;
        }
        const box = element.getBoundingClientRect();
        const scale = box.width / 1120;
        const next: Leader[] = [];
        links.forEach(link => {
          if (!link.desk || !link.region) return;
          const anchor = Array.from(
            element.querySelectorAll<HTMLElement>('[data-callout]'),
          ).find(node => node.dataset.callout === link.id);
          if (!anchor) return;
          const rect = anchor.getBoundingClientRect();
          const x = (rect.left - box.left) / scale;
          const y = (rect.top - box.top) / scale;
          const w = rect.width / scale;
          const h = rect.height / scale;
          const side = link.desk.side;
          const x1 =
            side === 'r'
              ? x + w + 6
              : side === 'l'
                ? x - 6
                : side === 'tl'
                  ? x + Math.min(40, w / 2)
                  : side === 'tr'
                    ? x + w - Math.min(40, w / 2)
                    : x + w / 2;
          const y1 =
            side === 'r' || side === 'l'
              ? y + h / 2
              : side === 'b'
                ? y + h + 5
                : y - 5;
          next.push({
            id: link.id,
            x1,
            y1,
            x2: 335 + (450 * link.region.x) / 100,
            y2: 64 + (540 * link.region.y) / 100,
          });
        });
        setLeaders(next);
      });
    };
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(schedule);
    observer?.observe(element);
    window.addEventListener('resize', schedule);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [links, imageFailed]);

  const linkProps = (link: Destination) => ({
    href: link.url,
    target,
    rel: 'noopener noreferrer',
    'data-analytics-event': link.event,
    onMouseEnter: () => setActive(link.id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(link.id),
    onBlur: () => setActive(null),
  });
  const knownIds = new Set(GROUPS.flatMap(group => group.ids));
  const groups = [
    ...GROUPS,
    {
      title: 'More links',
      ids: links.filter(link => !knownIds.has(link.id)).map(link => link.id),
    },
  ];
  const platform = links.find(link => link.id === 'platform');

  return (
    <div className="qmax-hub">
      <div className="qmax-container">
        <header className="qmax-header">
          {platform ? (
            <a
              {...linkProps(platform)}
              aria-label="QualityMax home"
              className="qmax-brand"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qualitymax/logo-wordmark-color.svg"
                alt="QualityMax"
                width="168"
                height="28"
              />
            </a>
          ) : (
            <span className="qmax-brand">QualityMax</span>
          )}
          <span className="qmax-domain">qmax.run</span>
        </header>
        <main>
          <div className="qmax-intro">
            <h1>
              {title}
              <br />
              <span>{subtitle}</span>
            </h1>
            <p>Meet Max. Pick a spot to explore.</p>
          </div>
          <nav
            aria-label="Max the kitten navigation"
            className="qmax-mascot-nav"
          >
            <div className="qmax-stage" ref={stage}>
              <svg
                className="qmax-leaders"
                aria-hidden="true"
                viewBox="0 0 1120 680"
              >
                {leaders.map(line => (
                  <g
                    key={line.id}
                    className={active === line.id ? 'is-active' : ''}
                  >
                    <line
                      {...{
                        x1: line.x1,
                        y1: line.y1,
                        x2: line.x2,
                        y2: line.y2,
                      }}
                    />
                    <circle cx={line.x1} cy={line.y1} r="1.5" />
                    <circle
                      cx={line.x2}
                      cy={line.y2}
                      r={active === line.id ? 3.5 : 2}
                    />
                  </g>
                ))}
              </svg>
              <div className="qmax-artwork">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={artwork}
                  src="/qualitymax/max.webp"
                  width="1145"
                  height="1374"
                  alt="Max, the black QualityMax kitten wearing a purple collar and a QualityMax pyramid tag"
                  draggable={false}
                  onError={() => setImageFailed(true)}
                  hidden={imageFailed}
                />
                {!imageFailed &&
                  links
                    .filter(link => link.region)
                    .map(link => {
                      const region = link.region!;
                      return (
                        <a
                          key={link.id}
                          {...linkProps(link)}
                          aria-label={`${link.part}: ${link.label}`}
                          title={`${link.part}: ${link.label}`}
                          className={`qmax-hotspot ${active === link.id ? 'is-active' : ''}`}
                          style={{
                            left: `${region.x}%`,
                            top: `${region.y}%`,
                            width: `${region.w}%`,
                            height: `${region.h}%`,
                          }}
                        >
                          <span aria-hidden="true" />
                        </a>
                      );
                    })}
                {imageFailed && (
                  <p className="qmax-image-fallback" role="status">
                    Max didn’t load. Every destination is still linked below.
                  </p>
                )}
              </div>
              {links
                .filter(link => link.desk)
                .map(link => {
                  const slot = link.desk!;
                  return (
                    <div
                      key={link.id}
                      className="qmax-callout-slot"
                      style={{
                        left: `${(slot.x / 1120) * 100}%`,
                        top: `${(slot.y / 680) * 100}%`,
                        width: `${(slot.w / 1120) * 100}%`,
                        justifyContent:
                          slot.align === 'end'
                            ? 'flex-end'
                            : slot.align === 'center'
                              ? 'center'
                              : 'flex-start',
                      }}
                    >
                      <a
                        {...linkProps(link)}
                        aria-label={link.aria}
                        data-callout={link.id}
                        className={`qmax-callout qmax-${link.variant} ${active === link.id ? 'is-active' : ''}`}
                      >
                        {link.icon && (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                          >
                            <path d={ICONS[link.icon]} fill="currentColor" />
                          </svg>
                        )}
                        <span>{link.label}</span>
                        {!link.icon && link.variant === 'quiet' && (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M7 17 17 7M7 7h10v10" />
                          </svg>
                        )}
                      </a>
                    </div>
                  );
                })}
            </div>
          </nav>
          <nav className="qmax-all-links" aria-labelledby="all-links">
            <h2 id="all-links">All destinations</h2>
            <div className="qmax-link-groups">
              {groups.map(group => {
                const destinations = group.ids
                  .map(id => links.find(link => link.id === id))
                  .filter((link): link is Destination => Boolean(link));
                return (
                  destinations.length > 0 && (
                    <div key={group.title}>
                      <h3>{group.title}</h3>
                      <ul>
                        {destinations.map(link => (
                          <li key={link.id}>
                            <a
                              {...linkProps(link)}
                              aria-label={link.aria}
                              className={active === link.id ? 'is-active' : ''}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                );
              })}
            </div>
          </nav>
        </main>
        {footer && <footer className="qmax-footer">{footer}</footer>}
      </div>
    </div>
  );
}
