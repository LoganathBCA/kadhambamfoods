// src/pages/ProductDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { getProduct } from '../services/productService';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

/** Build weight options — uses admin-set custom variants if available,
 *  otherwise falls back to auto-calculation from base price. */
const buildVariants = (p) => {
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    return p.variants
      .filter(v => v.label && Number(v.price) > 0)
      .map(v => ({ label: v.label, price: Number(v.price) }));
  }
  const base = Number(p.price) || 0;
  if (p.pricingType === 'both') {
    return [
      { label: '250g / 3 pcs', price: Math.round(base * 0.5) },
      { label: '500g / 6 pcs', price: base },
      { label: '1kg / 12 pcs', price: Math.round(base * 2) },
    ];
  }
  return [
    { label: '250g', price: Math.round(base * 0.5) },
    { label: '500g', price: base },
    { label: '1kg',  price: Math.round(base * 2) },
  ];
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty]                       = useState(1);
  const [adding, setAdding]                 = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        setProduct(p);
        // Auto-select the middle (500g) variant
        const vars = buildVariants(p);
        setSelectedVariant(vars[1] || vars[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-body-pad">
      <Header />
      <div className="loading-spinner"><div className="spinner" /></div>
      <MobileNav />
    </div>
  );

  if (!product) return (
    <div className="page-body-pad">
      <Header />
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <p>Product not found.</p>
        <Link to="/shop" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Back to Shop
        </Link>
      </div>
      <MobileNav />
    </div>
  );

  const variants     = buildVariants(product);
  const activePrice  = selectedVariant?.price ?? Number(product.price);
  const totalPrice   = activePrice * qty;

  const handleAddToCart = () => {
    if (adding) return;
    setAdding(true);
    addToCart(product, selectedVariant?.label || '', activePrice, qty);
    toast.success(
      qty > 1
        ? `${qty}× ${product.name} (${selectedVariant?.label}) added!`
        : `${product.name} (${selectedVariant?.label}) added to cart!`,
      { icon: '🛒', duration: 2000 }
    );
    setTimeout(() => setAdding(false), 1000);
  };

  const productUrl = `https://kadhambam.com/product/${id}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.image || 'https://kadhambam.com/og-cover.jpg',
      description: product.description || `Premium quality ${product.name}, carefully hand-selected and packaged to preserve maximum freshness and nutritional value. 100% natural, sulphur-free.`,
      brand: { '@type': 'Brand', name: 'Kadhambam' },
      offers: variants.map(v => ({
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'INR',
        price: v.price,
        name: v.label,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Kadhambam Dry Fruits' },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kadhambam.com/' },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://kadhambam.com/shop' },
        { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
      ],
    },
  ];

  const metaDesc = product.description
    ? `${product.description.slice(0, 120)} – Buy online at Kadhambam, Tamil Nadu.`
    : `Buy premium ${product.name} online from Kadhambam. 100% natural, sulphur-free. Delivered across Tamil Nadu. Starting ₹${Math.min(...variants.map(v => v.price)).toLocaleString('en-IN')}.`;

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>{product.name} – Buy Online | Kadhambam Dry Fruits</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={productUrl} />
        <meta property="og:title"       content={`${product.name} | Kadhambam Dry Fruits`} />
        <meta property="og:description" content={metaDesc} />
        {product.image && <meta property="og:image" content={product.image} />}
        <meta property="og:type"        content="product" />
        <meta property="og:url"         content={productUrl} />
        <meta property="product:price:amount"   content={String(activePrice)} />
        <meta property="product:price:currency" content="INR" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={`${product.name} | Kadhambam`} />
        <meta name="twitter:description" content={metaDesc} />
        {product.image && <meta name="twitter:image" content={product.image} />}
        {jsonLd.map((schema, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>


      <Header />
      <main id="main-content" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) var(--margin-mobile)' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-on-surface-variant)', marginBottom: 'clamp(16px, 4vw, 32px)' }}>
          <ol style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
            <li><Link to="/" style={{ color: 'inherit' }}>Home</Link></li>
            <li aria-hidden="true"><span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>chevron_right</span></li>
            <li><Link to="/shop" style={{ color: 'inherit' }}>Shop</Link></li>
            <li aria-hidden="true"><span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>chevron_right</span></li>
            <li><span aria-current="page" style={{ color: 'var(--color-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{product.name}</span></li>
          </ol>
        </nav>

        {/* Layout: image + info — 2-col on md+, stacked on mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 5vw, 48px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(20px, 5vw, 40px)', alignItems: 'start' }}>

            {/* Product image */}
            <div style={{
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              aspectRatio: '4/5',
              background: 'var(--color-surface-container-low)',
              boxShadow: 'var(--shadow-card-hover)',
            }}>
              <img
                src={product.image || `https://placehold.co/600x750/fdecd1/2f4d2e?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Product info column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
              <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>{product.name}</h1>

              {product.tagline && (
                <p style={{ fontStyle: 'italic', color: 'var(--color-on-surface-variant)', fontSize: 16 }}>{product.tagline}</p>
              )}
              {product.description && (
                <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.8, fontSize: 15 }}>{product.description}</p>
              )}

              {/* Live price — updates with weight selection */}
              <p style={{ fontSize: 'clamp(28px, 7vw, 36px)', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
                ₹{Number(activePrice).toLocaleString('en-IN')}
              </p>

              {/* Weight selector — hidden for enquiry */}
              {product.pricingType !== 'enquiry' && (
                <div>
                  <p className="label" style={{ marginBottom: 10 }}>
                    {product.pricingType === 'both' ? 'Select Variant' : 'Select Weight'}
                  </p>
                  <div className="weight-selector" role="group" aria-label={product.pricingType === 'both' ? 'Select variant' : 'Select weight'}>
                    {variants.map((v) => (
                      <button
                        key={v.label}
                        className={`weight-btn${selectedVariant?.label === v.label ? ' active' : ''}`}
                        onClick={() => setSelectedVariant(v)}
                        aria-pressed={selectedVariant?.label === v.label}
                        aria-label={`${v.label} — ₹${Number(v.price).toLocaleString('en-IN')}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty stepper — hidden for enquiry */}
              {product.pricingType !== 'enquiry' && (
                <div>
                  <p className="label" id="qty-label" style={{ marginBottom: 10 }}>Quantity</p>
                  <div className="qty-controls" role="group" aria-labelledby="qty-label">
                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label={`Decrease quantity, currently ${qty}`} disabled={qty <= 1}>−</button>
                    <span className="qty-value" aria-live="polite" aria-atomic="true" aria-label={`Quantity: ${qty}`}>{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(qty + 1)} aria-label={`Increase quantity, currently ${qty}`}>+</button>
                  </div>
                </div>
              )}

              {/* Add to Cart OR Contact Us */}
              {product.pricingType === 'enquiry' ? (
                <div style={{
                  padding: '20px 24px',
                  background: 'rgba(107,33,168,0.06)',
                  border: '1.5px solid rgba(107,33,168,0.25)',
                  borderRadius: 16,
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 24, color: '#6b21a8', fontVariationSettings: "'FILL' 1" }}>contact_support</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#6b21a8' }}>Enquiry Only Product</p>
                      <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>This product is available on request. Contact us to place your order.</p>
                    </div>
                  </div>
                  <Link
                    to="/contact"
                    className="btn btn-lg"
                    style={{
                      width: '100%', textDecoration: 'none', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6b21a8, #4c1d95)',
                      color: 'white', border: 'none',
                      boxShadow: '0 4px 16px rgba(107,33,168,0.35)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>phone_in_talk</span>
                    Contact Us to Order
                  </Link>
                </div>
              ) : (
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleAddToCart} disabled={adding}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>shopping_cart</span>
                  {adding ? 'Added!' : `Add to Cart — ₹${totalPrice.toLocaleString('en-IN')}`}
                </button>
              )}

              {/* Trust highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                {[
                  { icon: 'eco',            text: 'Sustainably Sourced' },
                  { icon: 'verified',       text: 'Quality Tested' },
                  { icon: 'local_shipping', text: 'Fast Delivery' },
                  { icon: 'lock',           text: 'Secure Checkout' },
                ].map((h) => (
                  <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--color-primary)' }}>{h.icon}</span>
                    {h.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <MobileNav />

      {/* Sticky mobile Add-to-Cart bar — hidden on desktop, hidden for enquiry */}
      {product.pricingType !== 'enquiry' && (
        <div className="sticky-atc-bar" role="complementary" aria-label="Quick add to cart">
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 14, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
              {selectedVariant?.label} · ₹{totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ flexShrink: 0, padding: '10px 20px' }}
            onClick={handleAddToCart}
            disabled={adding}
            aria-label={`Add ${product.name} ${selectedVariant?.label || ''} to cart ₹${totalPrice.toLocaleString('en-IN')}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>shopping_cart</span>
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
