// src/components/ui/OfferBar.jsx
import { useEffect, useState } from 'react';
import { getOfferBar } from '../../services/offerBarService';

/**
 * Scrolling offer ticker bar.
 * - Fetches settings from Firestore (settings/offerBar)
 * - Shows only when `enabled = true`
 * - Pure CSS infinite marquee — no JS animation loop
 */
const OfferBar = () => {
  const [bar, setBar] = useState(null);

  useEffect(() => {
    getOfferBar().then(setBar).catch(() => {});
  }, []);

  if (!bar || !bar.enabled || !bar.items?.length) return null;

  // Duplicate items so the seamless loop works even with few items
  const track = [...bar.items, ...bar.items, ...bar.items];

  return (
    <>
      <div
        className="offer-bar"
        style={{
          background: bar.bgColor || 'var(--color-primary)',
          color: bar.textColor || 'var(--color-on-primary)',
        }}
        aria-label="Current offers"
      >
        <div className="offer-bar__track">
          {track.map((item, i) => (
            <span key={i} className="offer-bar__item">
              {item}
              <span className="offer-bar__sep" aria-hidden="true">•</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .offer-bar {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          padding: 9px 0;
          position: relative;
          z-index: 90;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          /* Fade edges */
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        .offer-bar__track {
          display: inline-flex;
          align-items: center;
          gap: 0;
          animation: offer-scroll 35s linear infinite;
          will-change: transform;
        }

        /* Pause on hover so users can read, only on devices that support hover */
        @media (hover: hover) {
          .offer-bar:hover .offer-bar__track {
            animation-play-state: paused;
          }
        }

        @keyframes offer-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }

        .offer-bar__item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 0 24px;
          font-family: var(--font-sans);
        }

        .offer-bar__sep {
          opacity: 0.45;
          font-size: 10px;
        }

        @media (max-width: 639px) {
          .offer-bar__item {
            font-size: 12px;
            padding: 0 16px;
          }
          .offer-bar {
            padding: 7px 0;
          }
        }
      `}</style>
    </>
  );
};

export default OfferBar;
