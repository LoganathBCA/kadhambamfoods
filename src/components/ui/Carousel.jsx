// src/components/ui/Carousel.jsx
// True horizontal sliding carousel — slides sit side-by-side in a flex row
// and the track physically slides left/right with translateX.
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

import img1    from '../../assets/slide1.webp';
import img1Jpg from '../../assets/slide1.jpg';

const img2Url    = new URL('../../assets/slide2.webp', import.meta.url).href;
const img2JpgUrl = new URL('../../assets/slide2.jpg',  import.meta.url).href;
const img3Url    = new URL('../../assets/slide3.webp', import.meta.url).href;
const img3JpgUrl = new URL('../../assets/slide3.jpg',  import.meta.url).href;
const img4Url    = new URL('../../assets/slide4.webp', import.meta.url).href;
const img4JpgUrl = new URL('../../assets/slide4.jpg',  import.meta.url).href;

const LQIP = {
  1: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDADUlKC8oITUvKy88OTU/UIVXUElJUKN1e2GFwarLyL6qurfV8P//1eL/5re6////////////zv//////////////2wBDATk8PFBGUJlXV53/3Lrc///////////////////////////////////////////////////////////wAARCAAUABQDASIAAhEBAxEB/8QAGAABAQADAAAAAAAAAAAAAAAAAAECAwT/xAAYEAEBAQEBAAAAAAAAAAAAAAAAEQIBIf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A4c56XPGWdcLeoNdgtvoIkUAQAH//2Q==',
  2: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDADUlKC8oITUvKy88OTU/UIVXUElJUKN1e2GFwarLyL6qurfV8P//1eL/5re6////////////zv//////////////2wBDATk8PFBGUJlXV53/3Lrc///////////////////////////////////////////////////////////wAARCAAUABQDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAIBAwT/xAAbEAEAAgIDAAAAAAAAAAAAAAAAEQIBIQMS/8EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALnzZee/qW2ZVzbieo6YFIyUzoBVROgBH//2Q==',
  3: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDADUlKC8oITUvKy88OTU/UIVXUElJUKN1e2GFwarLyL6qurfV8P//1eL/5re6////////////zv//////////////2wBDATk8PFBGUJlXV53/3Lrc///////////////////////////////////////////////////////////wAARCAAUABQDASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAAAAECAwT/xAAYEAEBAQEBAAAAAAAAAAAAAAAAERIBIf/EABYBAQEBAAAAAAAAAAAAAAAAAAQCA//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOut3WxjZdR6yrfoZTcAWMBRAAD//2Q==',
  4: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDADUlKC8oITUvKy88OTU/UIVXUElJUKN1e2GFwarLyL6qurfV8P//1eL/5re6////////////zv//////////////2wBDATk8PFBGUJlXV53/3Lrc///////////////////////////////////////////////////////////wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAMBBP/EABoQAQACAwEAAAAAAAAAAAAAAAABAgMREiH/EABYBAQEBAAAAAAAAAAAAAAAAAQQCA//EABYRAQEBAAAAAAAAAAAAAAAAACEBEf/aAAwDAQACEQMRAD8AjpynbyIWv6zpzrSs3kS6FpiUzJuQUbsAH//2Q==',
};

const INTERVAL_MS = 4000; // 4 s per slide
const SLIDE_DURATION = 600; // transition duration ms

const slides = [
  {
    webp: img1, jpg: img1Jpg,
    alt:  'Premium Dry Fruits Collection — Almonds, Cashews, Pistachios & More',
    link: '/shop', cta: 'Shop Now', label: 'Dry Fruits',
    headline: "Nature's Finest Harvest",
    sub: 'Premium nuts & dry fruits, straight from the farm',
    lqip: LQIP[1],
  },
  {
    webp: img2Url, jpg: img2JpgUrl,
    alt:  'Sun-Dried Berries & Fruits — Apricots, Raisins & Figs',
    link: '/shop?search=berries', cta: 'Explore Berries', label: 'Dried Fruits',
    headline: 'Sun-Kissed Goodness',
    sub: 'Sulphur-free, preservative-free dried fruits',
    lqip: LQIP[2],
  },
  {
    webp: img3Url, jpg: img3JpgUrl,
    alt:  'Organic Seeds Collection — Chia, Pumpkin, Flax & More',
    link: '/shop?search=seeds', cta: 'Shop Seeds', label: 'Organic Seeds',
    headline: 'Seeds of Wellness',
    sub: 'Cold-pressed organic seeds for a healthier you',
    lqip: LQIP[3],
  },
  {
    webp: img4Url, jpg: img4JpgUrl,
    alt:  'Farm to Doorstep — Walnuts, Dates & Cranberries',
    link: '/shop', cta: 'View Collection', label: 'Farm Fresh',
    headline: 'From Farm to Table',
    sub: 'Pure goodness delivered to your doorstep',
    lqip: LQIP[4],
  },
];

// We clone the first slide at the end to create a seamless infinite loop:
// track = [slide0, slide1, slide2, slide3, slide0_clone]
// When we reach index 4 (clone), we instantly jump back to index 0 without animation.
const TRACK = [...slides, slides[0]];

// ── Single slide image with LQIP blur-up
const SlideImage = ({ slide, isFirst, active }) => {
  const [loaded, setLoaded] = useState(isFirst);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* LQIP blur placeholder */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${slide.lqip})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(10px)', transform: 'scale(1.05)',
        }} />
      )}
      <picture>
        <source srcSet={slide.webp} type="image/webp" />
        <img
          src={slide.jpg}
          alt={slide.alt}
          loading={isFirst ? 'eager' : 'lazy'}
          decoding={isFirst ? 'sync' : 'async'}
          fetchPriority={isFirst ? 'high' : 'low'}
          draggable={false}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 400ms ease',
            // Subtle Ken Burns zoom only on active slide
            transform: active ? 'scale(1.04)' : 'scale(1)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '400ms, 7000ms',
            transitionTimingFunction: 'ease, linear',
            pointerEvents: 'none',
          }}
        />
      </picture>
    </div>
  );
};

const Carousel = () => {
  // current index into TRACK (0 … slides.length)
  const [index, setIndex]         = useState(0);
  const [animated, setAnimated]   = useState(true); // false during instant jump
  const timerRef                   = useRef(null);
  const transitioning              = useRef(false);

  // Touch / drag state
  const dragStartX  = useRef(0);
  const dragDeltaX  = useRef(0);
  const isDragging  = useRef(false);

  const slideTo = useCallback((i, withAnim = true) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setAnimated(withAnim);
    setIndex(i);
    setTimeout(() => { transitioning.current = false; }, withAnim ? SLIDE_DURATION : 0);
  }, []);

  const goNext = useCallback(() => {
    setIndex(prev => {
      const next = prev + 1;
      setAnimated(true);
      transitioning.current = true;
      setTimeout(() => { transitioning.current = false; }, SLIDE_DURATION);
      return next;
    });
  }, []);

  const goPrev = useCallback(() => {
    setIndex(prev => {
      if (prev === 0) return prev; // already at start
      const next = prev - 1;
      setAnimated(true);
      transitioning.current = true;
      setTimeout(() => { transitioning.current = false; }, SLIDE_DURATION);
      return next;
    });
  }, []);

  // When we land on the cloned slide (index === slides.length),
  // wait for transition to finish then instantly jump to index 0
  useEffect(() => {
    if (index === slides.length) {
      const t = setTimeout(() => {
        setAnimated(false);
        setIndex(0);
        setTimeout(() => { transitioning.current = false; }, 50);
      }, SLIDE_DURATION);
      return () => clearTimeout(t);
    }
  }, [index]);

  // Auto-advance timer
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, INTERVAL_MS);
  }, [goNext]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  { goPrev(); startTimer(); }
      if (e.key === 'ArrowRight') { goNext(); startTimer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, startTimer]);

  // Touch / drag handlers
  const onDragStart = (clientX) => {
    isDragging.current  = true;
    dragStartX.current  = clientX;
    dragDeltaX.current  = 0;
    clearInterval(timerRef.current);
  };
  const onDragMove = (clientX) => {
    if (!isDragging.current) return;
    dragDeltaX.current = clientX - dragStartX.current;
  };
  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if      (dragDeltaX.current < -40) { goNext(); }
    else if (dragDeltaX.current >  40) { goPrev(); }
    startTimer();
  };

  const realIndex = index % slides.length;

  return (
    <section
      className="carousel-section"
      aria-label="Featured product carousel"
      aria-roledescription="carousel"
    >
      <div className="carousel-wrapper">
        <div
          className="carousel-container"
          style={{ cursor: 'grab', userSelect: 'none' }}
          onTouchStart={e  => onDragStart(e.touches[0].clientX)}
          onTouchMove={e   => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
          onMouseDown={e   => onDragStart(e.clientX)}
          onMouseMove={e   => { if (isDragging.current) onDragMove(e.clientX); }}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          role="region"
          aria-live="polite"
        >
          {/* ── Sliding track: all slides in a flex row ── */}
          <div
            className="carousel-track"
            style={{
              display: 'flex',
              width: `${TRACK.length * 100}%`,
              height: '100%',
              transform: `translateX(-${(index / TRACK.length) * 100}%)`,
              transition: animated
                ? `transform ${SLIDE_DURATION}ms cubic-bezier(0.77, 0, 0.175, 1)`
                : 'none',
              willChange: 'transform',
            }}
          >
            {TRACK.map((slide, i) => {
              const origIdx = i % slides.length;
              return (
                <div
                  key={i}
                  style={{
                    width: `${100 / TRACK.length}%`,
                    flexShrink: 0,
                    position: 'relative',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                  aria-roledescription="slide"
                  aria-label={`Slide ${origIdx + 1} of ${slides.length}: ${slide.label}`}
                  aria-hidden={i !== index}
                >
                  <SlideImage
                    slide={slide}
                    isFirst={origIdx === 0 && i === 0}
                    active={i === index}
                  />

                  {/* Left gradient for text readability */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to right, rgba(15,35,15,0.72) 0%, rgba(0,0,0,0.28) 45%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  {/* Bottom fade */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 100%)',
                    pointerEvents: 'none',
                  }} />

                  {/* Text content — only active slide */}
                  {i === index && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      padding: 'clamp(20px, 5vw, 56px)',
                      zIndex: 5, pointerEvents: 'none',
                    }}>
                      {/* Label pill */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 14px',
                        background: 'rgba(200,236,194,0.2)',
                        border: '1px solid rgba(200,236,194,0.35)',
                        borderRadius: 99,
                        fontSize: 'clamp(9px, 1vw, 11px)', fontWeight: 800,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: '#c8ecc2', marginBottom: 'clamp(10px, 2vw, 16px)',
                        width: 'fit-content',
                        animation: 'slide-in-left 400ms cubic-bezier(0.16,1,0.3,1) both',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 12, fontVariationSettings: "'FILL' 1" }}>eco</span>
                        {slide.label}
                      </span>

                      {/* Headline */}
                      <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(20px, 4.5vw, 52px)', fontWeight: 700,
                        color: 'white', lineHeight: 1.1,
                        marginBottom: 'clamp(8px, 1.5vw, 14px)',
                        maxWidth: '12em',
                        textShadow: '0 2px 12px rgba(0,0,0,0.25)',
                        animation: 'slide-in-left 450ms 60ms cubic-bezier(0.16,1,0.3,1) both',
                      }}>
                        {slide.headline}
                      </h2>

                      {/* Sub */}
                      <p style={{
                        fontSize: 'clamp(11px, 1.6vw, 15px)',
                        color: 'rgba(255,255,255,0.82)',
                        marginBottom: 'clamp(14px, 3vw, 28px)',
                        maxWidth: '28em', lineHeight: 1.55,
                        animation: 'slide-in-left 500ms 120ms cubic-bezier(0.16,1,0.3,1) both',
                      }}>
                        {slide.sub}
                      </p>

                      {/* CTA */}
                      <div className="carousel-cta-container" style={{ animation: 'slide-in-left 550ms 180ms cubic-bezier(0.16,1,0.3,1) both', pointerEvents: 'auto' }}>
                        <Link to={slide.link} aria-label={`${slide.cta} — ${slide.headline}`}>
                          <button className="carousel-cta-btn" style={{
                            padding: 'clamp(10px, 1.3vw, 13px) clamp(20px, 2.5vw, 30px)',
                            borderRadius: 99,
                            background: 'white', color: '#193619',
                            fontWeight: 800, fontSize: 'clamp(11px, 1.2vw, 14px)',
                            border: 'none', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
                            letterSpacing: '0.02em', whiteSpace: 'nowrap',
                          }}>
                            {slide.cta}
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 'clamp(13px, 1.3vw, 16px)' }}>arrow_forward</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Prev / Next arrows */}
          <button
            className="carousel-btn carousel-btn-prev"
            onClick={e => { e.stopPropagation(); goPrev(); startTimer(); }}
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>chevron_left</span>
          </button>
          <button
            className="carousel-btn carousel-btn-next"
            onClick={e => { e.stopPropagation(); goNext(); startTimer(); }}
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>chevron_right</span>
          </button>

          {/* Progress dots */}
          <div
            role="tablist"
            aria-label="Slides"
            style={{
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 8, zIndex: 10, alignItems: 'center',
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === realIndex}
                aria-label={`Go to slide ${i + 1}`}
                onClick={e => { e.stopPropagation(); slideTo(i); startTimer(); }}
                style={{
                  padding: 0, border: 'none', cursor: 'pointer', background: 'transparent',
                  position: 'relative',
                  width: i === realIndex ? 36 : 8, height: 8,
                  borderRadius: 99,
                  transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)',
                  overflow: 'hidden', flexShrink: 0,
                }}
              >
                <span style={{ position: 'absolute', inset: 0, borderRadius: 99, background: 'rgba(255,255,255,0.35)' }} />
                {i === realIndex && (
                  <span style={{
                    position: 'absolute', top: 0, left: 0, height: '100%',
                    borderRadius: 99, background: 'white',
                    animation: `carousel-progress ${INTERVAL_MS}ms linear both`,
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <div aria-live="polite" aria-atomic="true" style={{
            position: 'absolute', top: 14, right: 16,
            background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(6px)',
            color: 'rgba(255,255,255,0.88)',
            fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 99, zIndex: 10, letterSpacing: '0.06em',
          }}>
            {realIndex + 1} / {slides.length}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes carousel-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default Carousel;
