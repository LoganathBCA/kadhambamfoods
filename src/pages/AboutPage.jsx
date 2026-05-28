// src/pages/AboutPage.jsx
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import shop1 from '../assets/shop1.jpg';
import shop2 from '../assets/shop2.jpg';
import shop3 from '../assets/shop3.jpg';
import shop4 from '../assets/shop4.jpg';
import { Helmet } from 'react-helmet-async';

// ─── Data ───────────────────────────────────────────────────────────────────
const STORY_BLOCKS = [
  {
    eyebrow: 'Our Store',
    title: 'A Treasure Trove of Premium Dry Fruits',
    body: `Step into Kadhambam and you’ll find yourself surrounded by hundreds of premium varieties from golden cashews and crimson cranberries to fragrant rose petals and hearty walnuts. Our flagship store is stocked floor-to-ceiling with the finest produce sourced directly from ethical farms.\n\nEvery jar, every bin, every shelf tells the story of a farmer who poured their heart into the harvest. We are proud to be the bridge that brings that dedication straight to your table.`,
    image: shop1,
    alt: 'Kadhambam store interior showing shelves of dry fruits and nuts',
    reverse: false,
    badge: { icon: 'storefront', label: 'Our Flagship Store' },
    points: ['200+ premium varieties', 'Refill in-store from bulk bins', 'No artificial preservatives'],
  },
  {
    eyebrow: 'Premium Selection',
    title: 'Chocolates & Gourmet Imports You’ll Love',
    body: `Beyond dry fruits, Kadhambam curates a handpicked selection of premium chocolates and imported gourmet treats. From Ferrero Rocher collections to artisan truffle boxes, our confectionery section brings world-class indulgence to your neighbourhood.\n\nWe believe gifting should be thoughtful. Our premium gift hampers, combining exotic nuts with fine chocolates, are crafted for every occasion Diwali, birthdays, corporate events, and more.`,
    image: shop2,
    alt: 'Premium chocolates and confectionery display at Kadhambam',
    reverse: true,
    badge: { icon: 'redeem', label: 'Gift Hampers Available' },
    points: ['Ferrero Rocher & artisan truffles', 'Custom gift hampers', 'Ideal for every occasion'],
  },
  {
    eyebrow: 'Dried Fruits & Spices',
    title: 'Colours of Nature in Every Jar',
    body: `The vibrant section of our store is a feast for the eyes glass jars filled with sun-dried figs, golden pineapple rings, tart cranberries, and fragrant dried apricots. Each variety is meticulously sourced and hand-checked for quality, colour, and freshness before stocking.\n\nOur sulphur-free dried fruits retain their natural colour and nutritional integrity. What you see is what nature intended — no artificial enhancement, just pure goodness.`,
    image: shop3,
    alt: 'Colourful dried fruits and spices in glass jars at Kadhambam',
    reverse: false,
    badge: { icon: 'eco', label: 'Sulphur-Free & Natural' },
    points: ['Sulphur-free dried fruits', 'Natural colour & flavour', 'Hand-checked every batch'],
  },
  {
    eyebrow: 'Our Space',
    title: 'A Store Designed for Discovery',
    body: `Our beautifully designed store invites you to explore, smell, and discover at your own pace. With wide aisles, well-lit displays, and knowledgeable staff, shopping at Kadhambam is an experience in itself — not just a transaction.\n\nWe’ve created a space where food lovers, health enthusiasts, and gift-seekers can all find exactly what they’re looking for. Come visit us and let the aromas guide you.`,
    image: shop4,
    alt: 'Wide view of Kadhambam store interior with premium displays',
    reverse: true,
    badge: { icon: 'apartment', label: 'Visit Us In-Store' },
    points: ['Welcoming & well-lit space', 'Expert staff to assist you', 'Explore 200+ varieties in person'],
  },
];

const VALUES = [
  { icon: 'eco', title: 'Sustainably Sourced', desc: 'Partnered with ethical farms committed to responsible, regenerative agriculture.' },
  { icon: 'verified', title: 'Quality Tested', desc: 'Every batch is lab-tested for purity, freshness, and safety before dispatch.' },
  { icon: 'local_shipping', title: 'Farm to Doorstep', desc: 'Direct sourcing means fresher products and fair wages for our farmers.' },
  { icon: 'favorite', title: 'Made with Love', desc: 'Hand-selected, carefully packaged, and delivered with genuine care.' },
];



const STATS = [
  { value: '100+', label: 'Varieties', icon: 'agriculture' },
  { value: '10K+', label: 'Happy Families', icon: 'groups' },
  { value: '100%', label: 'Natural', icon: 'eco' },
  { value: '0', label: 'Preservatives', icon: 'no_food' },
];

const REVIEWS = [
  {
    name: 'user',
    reviewCount: 1,
    rating: 5.0,
    tags: ['Good quantity', 'Readily available', 'Smooth delivery process', 'Quick service', 'Pocket-friendly'],
    text: "I had a great experience with Kadhambam Dry Fruits. They have a smooth delivery process, so my order arrived quickly and without any issues. The service was very fast, and I didn't have to wait long for help when I needed it. The dry fruits were readily available, which made it easy to find what I wanted. They also offered good quantity in their packages, so I got plenty of products. Plus, the prices were pocket-friendly! Overall, Kadhambam Dry Fruits is highly recommended!",
    initials: 'U',
    color: '#1a73e8',
  },
  {
    name: 'Abdul',
    reviewCount: 2,
    rating: 5.0,
    tags: ['Great quality', 'Good quantity', 'Quick service', 'Seamless experience', 'Pocket-friendly'],
    text: "I recently tried Kadhambam Dry Fruits and was thoroughly impressed! The quantity offered is generous, making it a pocket-friendly choice for quality snacks. Their quick service ensured I received my order promptly, enhancing the overall experience. The dry fruits are fresh and of great quality, perfect for healthy snacking. If you're looking for a seamless shopping experience with excellent products, Kadhambam is a must-try! Highly recommend!",
    initials: 'A',
    color: '#e8710a',
  },
  {
    name: 'Angel Iswariya',
    reviewCount: 1,
    rating: 5.0,
    tags: ['Great quality', 'Fresh', 'Nutritious', 'Polite staff', 'Quick service', 'Seamless experience', 'Pocket-friendly'],
    text: "Kadhambam Dry Fruits is amazing! The quality of the dry fruits is great and very fresh. I love how nutritious they are. The staff is polite and helpful, making my visit pleasant. Service is quick, so I never wait long. Overall, it's a seamless experience every time I go there. Plus, the prices are pocket-friendly! I highly recommend Kadhambam for all your dry fruit needs!",
    initials: 'AI',
    color: '#9b1c1c',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
const AboutPage = () => (
  <div className="page-body-pad">
    <Helmet>
      <title>About Kadhambam – Our Story, Mission & Tamil Nadu Dry Fruit Heritage</title>
      <meta name="description" content="Learn about Kadhambam Dry Fruits – born in Tamil Nadu, committed to delivering 100% natural, sulphur-free dry fruits direct from ethical farms to your doorstep." />
      <link rel="canonical" href="https://kadhambam.com/about" />
      <meta property="og:title" content="About Kadhambam – Rooted in Nature, Delivered with Care" />
      <meta property="og:description" content="Our story: bridging Tamil Nadu farmers and mindful consumers since 2020. 100% natural, preservative-free dry fruits." />
      <meta property="og:url" content="https://kadhambam.com/about" />
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://kadhambam.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'About', 'item': 'https://kadhambam.com/about' },
        ]
      })}</script>
    </Helmet>
    <Header />

    {/* ── HERO ── */}
    <section style={{
      background: 'linear-gradient(160deg, #193619 0%, #2a5c2a 55%, #1e4a1e 100%)',
      padding: 'clamp(44px, 10vw, 112px) var(--margin-mobile)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 'min(300px, 50vw)', height: 'min(300px, 50vw)', borderRadius: '50%', background: 'rgba(200,236,194,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 'min(220px, 40vw)', height: 'min(220px, 40vw)', borderRadius: '50%', background: 'rgba(200,236,194,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', left: '10%', width: 'min(120px, 25vw)', height: 'min(120px, 25vw)', borderRadius: '50%', background: 'rgba(200,236,194,0.04)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 18px',
          background: 'rgba(200,236,194,0.15)',
          border: '1px solid rgba(200,236,194,0.2)',
          borderRadius: 99,
          fontSize: 11, fontWeight: 800,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(200,236,194,0.9)',
          marginBottom: 'clamp(14px, 3vw, 24px)',
        }}>
          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>info</span>
          About Us
        </span>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(32px, 6vw, 60px)',
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.1,
          marginBottom: 'clamp(14px, 3vw, 24px)',
          letterSpacing: '-0.01em',
        }}>
          Natural Purity,<br />
          <span style={{ color: '#c8ecc2' }}>Delivered with Heart</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'rgba(200,236,194,0.85)',
          lineHeight: 1.8,
          maxWidth: 520,
          margin: '0 auto clamp(20px, 4vw, 36px)',
        }}>
          We are Kadhambam — a bridge between conscious farmers and mindful consumers,
          delivering nature's finest harvest to your doorstep, without compromise.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/shop">
            <button className="about-hero-btn-primary" style={{
              padding: 'clamp(11px, 2vw, 13px) clamp(22px, 4vw, 28px)',
              borderRadius: 99,
              background: 'white',
              color: '#193619',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>storefront</span>
              Shop Our Range
            </button>
          </Link>
          <a href="#our-story">
            <button className="about-hero-btn-ghost" style={{
              padding: 'clamp(11px, 2vw, 13px) clamp(22px, 4vw, 28px)',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              border: '1.5px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backdropFilter: 'blur(8px)',
            }}
            >
              Read Our Story
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>arrow_downward</span>
            </button>
          </a>
        </div>
      </div>
    </section>

    {/* ── STATS STRIP ── */}
    <div style={{
      background: 'var(--color-surface-container)',
      borderBottom: '1px solid var(--color-outline-variant)',
    }}>
      <div className="stats-strip" style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: '0 var(--margin-mobile)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
      }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            textAlign: 'center',
            padding: 'clamp(16px, 3vw, 28px) clamp(12px, 2.5vw, 20px)',
            borderRight: (i % 2 === 0) ? '1px solid var(--color-outline-variant)' : 'none',
            borderBottom: (i < 2) ? '1px solid var(--color-outline-variant)' : 'none',
          }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--color-primary)', display: 'block', marginBottom: 6, fontVariationSettings: "'FILL' 1" }}>
              {s.icon}
            </span>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-on-surface-variant)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .stats-strip { grid-template-columns: repeat(4, 1fr) !important; }
          .stats-strip > div { border-bottom: none !important; }
          .stats-strip > div:nth-child(2) { border-right: 1px solid var(--color-outline-variant) !important; }
        }
      `}</style>
    </div>

    <main id="main-content" className="our-story">
      {/* ── STORY BLOCKS ── */}
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--margin-mobile)' }}>
        {STORY_BLOCKS.map((block, i) => (
          <div key={i}
            className={`about-block${block.reverse ? ' reverse' : ''}`}
            style={{
              borderBottom: i < STORY_BLOCKS.length - 1 ? '1px solid var(--color-outline-variant)' : 'none',
            }}
          >
            {/* Image */}
            <div className="about-block__image" style={{ position: 'relative' }}>
              <img
                src={block.image}
                alt={block.alt}
                className="about-block__img-zoom"
              />
              {/* Decorative label on image */}
              {block.badge && (
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(10px, 2vw, 20px)', left: 'clamp(10px, 2vw, 20px)',
                  background: 'rgba(25,54,25,0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 12,
                  padding: 'clamp(7px, 1.5vw, 10px) clamp(10px, 2vw, 16px)',
                  display: 'flex', alignItems: 'center', gap: 'clamp(5px, 1vw, 8px)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: '#c8ecc2', fontVariationSettings: "'FILL' 1" }}>
                    {block.badge.icon}
                  </span>
                  <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
                    {block.badge.label}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="about-block__content">
              <span style={{
                display: 'inline-flex',
                padding: '4px 14px',
                background: 'rgba(25,54,25,0.08)',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                alignSelf: 'flex-start',
              }}>
                {block.eyebrow}
              </span>

              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(24px, 3vw, 34px)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                lineHeight: 1.2,
              }}>
                {block.title}
              </h2>

              {block.body.split('\n\n').map((para, j) => (
                <p key={j} style={{
                  fontSize: 16,
                  color: 'var(--color-on-surface-variant)',
                  lineHeight: 1.85,
                }}>
                  {para}
                </p>
              ))}

              {/* Highlights checklist */}
              {block.points && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.5vw, 10px)', marginTop: 8 }}>
                  {block.points.map(point => (
                    <li key={point} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-on-surface)' }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2a5c2a, #193619)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13, color: 'white', fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                      <span style={{ fontWeight: 500 }}>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── VALUES ── */}
      <section style={{
        padding: 'clamp(40px, 8vw, 96px) var(--margin-mobile)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 48px)' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 16px',
            background: 'rgba(25,54,25,0.08)',
            borderRadius: 99, fontSize: 11, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--color-primary)', marginBottom: 14,
          }}>
            Our Values
          </span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2,
          }}>
            What We Stand For
          </h2>
        </div>

        <div className="about-values-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px, 2.5vw, 20px)',
        }}>
          {VALUES.map((val, i) => (
            <div key={val.title} className="about-value-card" style={{
              padding: 'clamp(22px, 4vw, 32px) clamp(16px, 3vw, 24px)',
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 24,
              border: '1px solid rgba(195,200,190,0.4)',
              boxShadow: '0 2px 12px rgba(61,43,31,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              textAlign: 'center',
              cursor: 'default',
            }}
            >
              <div style={{
                width: 'clamp(48px, 10vw, 64px)', height: 'clamp(48px, 10vw, 64px)', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(25,54,25,0.12), rgba(25,54,25,0.06))',
                border: '1px solid rgba(25,54,25,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{
                  fontFamily: 'Material Symbols Outlined',
                  fontSize: 28, color: 'var(--color-primary)',
                  fontVariationSettings: "'FILL' 1",
                }}>
                  {val.icon}
                </span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18, fontWeight: 700,
                color: 'var(--color-primary)',
                lineHeight: 1.2,
              }}>
                {val.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.7 }}>
                {val.desc}
              </p>

              {/* Number indicator */}
              <span style={{
                marginTop: 'auto',
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--color-surface-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                color: 'var(--color-on-surface-variant)',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section style={{
        padding: 'clamp(40px, 8vw, 96px) var(--margin-mobile)',
        background: 'linear-gradient(160deg, var(--color-surface-container-low), var(--color-surface-container))',
      }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 48px)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 16px',
              background: 'rgba(25,54,25,0.08)',
              borderRadius: 99, fontSize: 11, fontWeight: 800,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--color-primary)', marginBottom: 14,
            }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
              Customer Reviews
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2,
            }}>
              What Our Customers Say
            </h2>
            {/* Google rating row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#f59e0b' }}>5.0</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>on Google</span>
            </div>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 24,
                border: '1px solid rgba(195,200,190,0.4)',
                boxShadow: '0 4px 20px rgba(61,43,31,0.07)',
                padding: 'clamp(20px, 4vw, 28px)',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                {/* Reviewer header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: r.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 18, fontWeight: 800, color: 'white',
                    letterSpacing: '-0.02em',
                  }}>
                    {r.initials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-on-surface)', textTransform: 'capitalize' }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{r.reviewCount} review{r.reviewCount !== 1 ? 's' : ''}</p>
                  </div>
                  {/* Google G logo placeholder */}
                  <div style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', background: 'white', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 900, color: '#4285f4' }}>G</div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#188038', borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 14, fontWeight: 800, color: 'white',
                  }}>
                    {r.rating.toFixed(1)}
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, color: 'white', fontVariationSettings: "'FILL' 1" }}>star</span>
                  </span>
                </div>

                {/* Highlight tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {r.tags.map(tag => (
                    <span key={tag} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 99,
                      border: '1.5px solid rgba(25,54,25,0.2)',
                      fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)',
                      background: 'var(--color-surface-container)',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13, color: '#188038', fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Review text */}
                <p style={{
                  fontSize: 14, color: 'var(--color-on-surface-variant)',
                  lineHeight: 1.8, margin: 0,
                }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        padding: '0 var(--margin-mobile) clamp(40px, 8vw, 96px)',
      }}>
        <div style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #193619 0%, #2a5c2a 55%, #1e4a1e 100%)',
          borderRadius: 'clamp(18px, 4vw, 28px)',
          padding: 'clamp(28px, 6vw, 64px) clamp(20px, 5vw, 56px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 28,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(25,54,25,0.3)',
        }}>
          {/* BG pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(200,236,194,0.1) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, flex: '1 1 260px' }}>
            <p style={{
              fontSize: 11, fontWeight: 800,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(200,236,194,0.7)', marginBottom: 10,
            }}>
              Ready to taste the difference?
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(22px, 3.5vw, 32px)',
              fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 10,
            }}>
              Experience Nature's Finest Harvest
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(200,236,194,0.75)', lineHeight: 1.6 }}>
              From our farmers' hands to your table — no shortcuts, no compromise.
            </p>
          </div>

          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap',
            position: 'relative', zIndex: 1,
          }}>
            <Link to="/shop">
              <button className="about-hero-btn-primary" style={{
                padding: 'clamp(11px, 2vw, 14px) clamp(22px, 4vw, 28px)',
                borderRadius: 99,
                background: 'white',
                color: '#193619',
                fontWeight: 700, fontSize: 15,
                border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
              }}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>shopping_bag</span>
                Shop Now
              </button>
            </Link>
            <a href="https://wa.me/918825438334" target="_blank" rel="noopener noreferrer">
              <button className="about-hero-btn-ghost" style={{
                padding: 'clamp(11px, 2vw, 14px) clamp(20px, 3.5vw, 24px)',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                fontWeight: 700, fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backdropFilter: 'blur(8px)',
                whiteSpace: 'nowrap',
              }}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>chat</span>
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </section>
    </main>

    <Footer />
    <MobileNav />
  </div>
);

export default AboutPage;
