// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import Carousel from '../components/ui/Carousel';
import OfferBar from '../components/ui/OfferBar';
import ProductCard from '../components/ui/ProductCard';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';


const WhatsAppSVG = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── About section data ──────────────────────────────────────────────────────
const STATS = [
  { value: '100+', label: 'Varieties', icon: 'agriculture' },
  { value: '10K+', label: 'Happy Families', icon: 'groups' },
  { value: '100%', label: 'Natural', icon: 'eco' },
  { value: '0', label: 'Preservatives', icon: 'no_food' },
];

const VALUES = [
  { icon: 'eco', title: 'Sustainably Sourced', desc: 'Partnered with ethical farms committed to regenerative agriculture.' },
  { icon: 'verified', title: 'Quality Tested', desc: 'Every batch is lab-tested for purity, freshness, and safety.' },
  { icon: 'local_shipping', title: 'Farm to Doorstep', desc: 'Direct sourcing fresher products and fair wages for farmers.' },
  { icon: 'favorite', title: 'Made with Love', desc: 'Hand-selected, carefully packaged, and delivered with care.' },
];

// ─── Contact channels ────────────────────────────────────────────────────────
const CHANNELS = [
  { icon: 'call', label: 'Phone', value: '+91 88254 38334', href: 'tel:+918825438334', color: '#2a5c2a' },
  { icon: 'chat', label: 'WhatsApp', value: 'Chat Instantly', href: 'https://wa.me/918825438334', color: '#25d366' },
  { icon: 'mail', label: 'Email', value: 'kadhambamfoods@gmail.com', href: 'mailto:kadhambamfoods@gmail.com', color: '#7d5700' },
  { icon: 'location_on', label: 'Store', value: 'Dindigul – 624001', href: 'https://www.google.com/maps/place/Kadhambam+Dry+Fruits/@10.3631813,77.9722131,17z/data=!3m1!4b1!4m6!3m5!1s0x3b00abf8e6696dcb:0x24a7f6e8f8e15ff4!8m2!3d10.3631813!4d77.9722131!16s%2Fg%2F11yty5b3yz?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D', color: '#47281d' },
];

const FAQ = [
  { q: 'Do you deliver across Tamil Nadu?', a: 'Yes! We currently deliver across Tamil Nadu. Delivery typically takes 2–4 business days depending on your location.' },
  { q: 'Are your products preservative-free?', a: 'Absolutely. Every product at Kadhambam is 100% natural no artificial preservatives, no added sulfur, no chemicals.' },
  { q: 'Do you offer bulk / wholesale pricing?', a: 'Yes, we do! Drop us an email at kadhambamfoods@gmail.com or WhatsApp us with your requirements.' },
];


// ─── Main ─────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories([{ id: 'all', name: 'All' }, ...cats]);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>Kadhambam Dry Fruits – Premium Sulphur-Free Dry Fruits &amp; Nuts, Tamil Nadu</title>
        <meta name="description" content="Buy premium sulphur-free dry fruits and organic nuts online. Almonds, cashews, walnuts, dates &amp; 100+ varieties delivered across Tamil Nadu from Kadhambam. Delivery at ₹40/kg." />
        <link rel="canonical" href="https://kadhambam.com/" />
        <meta property="og:title" content="Kadhambam – Premium Dry Fruits &amp; Nuts from Tamil Nadu" />
        <meta property="og:description" content="100% natural, sulphur-free dry fruits sourced directly from Tamil Nadu farms. Fast delivery across Tamil Nadu." />
        <meta property="og:url" content="https://kadhambam.com/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': FAQ.map(item => ({
            '@type': 'Question',
            'name': item.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
          }))
        })}</script>
      </Helmet>
      <Header isLandingPage={true} />
      <OfferBar />


      {/* ── CAROUSEL ONLY ── */}
      <Carousel />

      <main id="main-content">
        {/* ══════════════════════════════════════════════════
            SHOP SECTION
        ══════════════════════════════════════════════════ */}
        <section id="shop" style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'clamp(24px, 6vw, 96px) var(--margin-mobile)',
          scrollMarginTop: 'clamp(64px, 10vw, 72px)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 4vw, 40px)' }}>
            <span style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(25,54,25,0.08)', borderRadius: 99, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 10 }}>
              Our Collection
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 38px)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8, lineHeight: 1.2 }}>
              Nature’s Pantry
            </h2>
            <p style={{ fontSize: 'clamp(13px, 3vw, 16px)', color: 'var(--color-on-surface-variant)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Premium sun-dried fruits and organic nuts sourced directly from sustainable farms, delivered across Tamil Nadu.
            </p>
          </div>

          {/* Category pills */}
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat.id} className={`pill${activeCategory === cat.id ? ' active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-card__img skeleton" />
                  <div className="skeleton-card__body">
                    <div className="skeleton" style={{ height: 18, width: '70%' }} />
                    <div className="skeleton" style={{ height: 13, width: '50%' }} />
                    <div className="skeleton" style={{ height: 26, width: '40%', marginTop: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 48, color: 'var(--color-outline)' }}>inventory_2</span>
              <p style={{ fontSize: 16, color: 'var(--color-on-surface-variant)' }}>
                {products.length === 0 ? 'Products coming soon check back shortly!' : 'No products in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* View All CTA fixed: Link with btn class, no nested button */}
          {!loading && filtered.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 'clamp(32px, 6vw, 52px)' }}>
              <Link
                to="/shop"
                className="btn btn-secondary btn-lg"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                View All Products
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>arrow_forward</span>
              </Link>
            </div>
          )}
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(195,200,190,0.5), transparent)' }} />

        {/* ══════════════════════════════════════════════════
            ABOUT SECTION
        ══════════════════════════════════════════════════ */}
        <section id="about" style={{
          background: 'linear-gradient(160deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 100%)',
          padding: 'clamp(40px, 8vw, 96px) var(--margin-mobile)',
          scrollMarginTop: 'clamp(64px, 10vw, 72px)',
        }}>
          <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
            {/* Hero text */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 48px)' }}>
              <span style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(25,54,25,0.08)', borderRadius: 99, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 14 }}>
                About Kadhambam
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.15, marginBottom: 14 }}>
                Rooted in Nature,<br />Delivered with Care
              </h2>
              <p style={{ fontSize: 16, color: 'var(--color-on-surface-variant)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
                Born in Tamil Nadu, Kadhambam bridges conscientious farmers and mindful consumers
                delivering nature's finest harvest to your doorstep without shortcuts or preservatives.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, background: 'var(--color-surface-container-lowest)', borderRadius: 20, border: '1px solid rgba(195,200,190,0.4)', overflow: 'hidden', marginBottom: 48, boxShadow: '0 4px 24px rgba(61,43,31,0.07)' }} className="stats-grid-landing">
              {STATS.map((s, i) => (
                <div key={s.label} style={{ textAlign: 'center', padding: 'clamp(16px, 3vw, 28px) clamp(10px, 2vw, 16px)', borderRight: i % 2 === 0 ? '1px solid rgba(195,200,190,0.3)' : 'none', borderBottom: i < 2 ? '1px solid rgba(195,200,190,0.3)' : 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--color-primary)', display: 'block', marginBottom: 6, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Values grid */}
            <div className="values-grid" style={{ marginBottom: 40 }}>
              {VALUES.map(val => (
                <div key={val.title} className="value-card-hp" style={{ padding: 'clamp(20px, 4vw, 28px) clamp(16px, 3vw, 22px)', background: 'var(--color-surface-container-lowest)', borderRadius: 20, border: '1px solid rgba(195,200,190,0.4)', boxShadow: '0 2px 10px rgba(61,43,31,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', cursor: 'default' }}
              >
                  <div style={{ width: 'clamp(44px, 8vw, 56px)', height: 'clamp(44px, 8vw, 56px)', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(25,54,25,0.1), rgba(25,54,25,0.05))', border: '1px solid rgba(25,54,25,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 26, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>{val.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>{val.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.7 }}>{val.desc}</p>
                </div>
              ))}
            </div>

            {/* Read more CTA fixed: Link with btn class */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to="/about"
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>auto_stories</span>
                Read Our Full Story
              </Link>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(195,200,190,0.5), transparent)' }} />

        {/* ══════════════════════════════════════════════════
            CONTACT SECTION
        ══════════════════════════════════════════════════ */}
        <section id="contact" style={{
          padding: 'clamp(40px, 8vw, 96px) var(--margin-mobile)',
          scrollMarginTop: 'clamp(64px, 10vw, 72px)',
        }}>
          <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 48px)' }}>
              <span style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(25,54,25,0.08)', borderRadius: 99, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 14 }}>
                Contact Us
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.15, marginBottom: 12 }}>
                We'd Love to Hear from You
              </h2>
              <p style={{ fontSize: 16, color: 'var(--color-on-surface-variant)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
                Questions, feedback, or just saying hello our team is always here.
              </p>
            </div>

            {/* Channel cards */}
            <div className="contact-channels-grid" style={{ marginBottom: 'clamp(32px, 5vw, 52px)' }}>
              {CHANNELS.map(ch => (
                <a key={ch.label} href={ch.href} target={ch.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div className="channel-card-hp" style={{ padding: 'clamp(14px, 3vw, 20px) clamp(12px, 2.5vw, 18px)', background: 'var(--color-surface-container-lowest)', borderRadius: 18, border: '1px solid rgba(195,200,190,0.4)', boxShadow: '0 2px 10px rgba(61,43,31,0.05)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', height: '100%' }}
                >
                    <div style={{ width: 'clamp(36px, 7vw, 44px)', height: 'clamp(36px, 7vw, 44px)', borderRadius: 12, background: ch.color + '18', border: `1px solid ${ch.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: ch.color, fontVariationSettings: "'FILL' 1" }}>{ch.icon}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--color-on-surface-variant)', marginBottom: 3 }}>{ch.label}</p>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{ch.value}</p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: ch.color }}>
                      Contact <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13 }}>arrow_forward</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Form + FAQ */}
            <div className="contact-faq-full">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20 }}>Quick Answers</h3>
              <div className="contact-faq-grid">
                {FAQ.map((item, i) => (
                  <div key={i} style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 16, border: `1px solid ${openFaq === i ? 'rgba(25,54,25,0.2)' : 'rgba(195,200,190,0.4)'}`, overflow: 'hidden', transition: 'border-color 200ms ease, box-shadow 200ms ease', boxShadow: openFaq === i ? '0 4px 16px rgba(25,54,25,0.08)' : 'none' }}>
                    <button className="faq-btn-hp" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', flex: 1, lineHeight: 1.4 }}>{item.q}</span>
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: 'var(--color-primary)', flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 250ms ease' }}>expand_more</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 18px 18px', fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.8, borderTop: '1px solid rgba(195,200,190,0.3)', paddingTop: 14 }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom row — View Contact Page + WhatsApp */}
              <div className="contact-faq-bottom">
                <Link
                  to="/contact"
                  className="btn btn-outline"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 1, minWidth: 0 }}
                >
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>open_in_new</span>
                  View Full Contact Page
                </Link>

                <a href="https://wa.me/918825438334" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                  <div className="whatsapp-cta-hp" style={{ padding: 'clamp(14px, 3vw, 18px) clamp(16px, 3vw, 20px)', background: 'linear-gradient(135deg, #25d366, #1da851)', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,211,102,0.22)', height: '100%' }}>
                    <div style={{ width: 'clamp(36px, 8vw, 42px)', height: 'clamp(36px, 8vw, 42px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <WhatsAppSVG size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 2 }}>Chat on WhatsApp</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Get a reply in minutes</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>arrow_forward</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />



    </div>
  );
};

export default HomePage;
