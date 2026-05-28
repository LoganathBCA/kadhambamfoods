// src/components/ui/ProductCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getOptimizedUrl } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';

const OptimizedImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  const fallbackSrc = `https://placehold.co/400x500/fdecd1/2f4d2e?text=${encodeURIComponent(alt)}`;
  const rawSrc = error ? fallbackSrc : (src || fallbackSrc);

  // For Cloudinary URLs: inject w_400,q_auto,f_auto transformations so the
  // CDN delivers the optimal format (WebP/AVIF) and size for the card thumbnail.
  // For all other URLs (placeholders, external): use as-is.
  const imgSrc = getOptimizedUrl(rawSrc, { width: 400, quality: 'auto' });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* LQIP — visible while real image loads */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--color-surface-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{
            fontFamily: 'Material Symbols Outlined', fontSize: 40,
            color: 'var(--color-outline-variant)',
            fontVariationSettings: "'FILL' 0, 'wght' 200",
            animation: 'pulse-slow 1.8s ease-in-out infinite',
          }}>
            nutrition
          </span>
        </div>
      )}

      {/* Real image — Cloudinary handles format negotiation via f_auto */}
      <img
        src={imgSrc} alt={alt} className={className}
        loading="lazy" decoding="async" fetchPriority="low"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 400ms ease, transform 600ms cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      />
    </div>
  );
};

/** Build weight options — uses admin-set custom variants if available,
 *  otherwise falls back to auto-calculation from base price. */
const buildVariants = (product) => {
  // Use stored custom variants when admin has set them
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants
      .filter(v => v.label && Number(v.price) > 0)
      .map(v => ({ label: v.label, price: Number(v.price) }));
  }
  // Auto-calculate fallback
  const base = Number(product.price) || 0;
  if (product.pricingType === 'both') {
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

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  // Weight variants — auto-generated, never stored in admin
  const variants = buildVariants(product);
  const [selectedVariant, setSelectedVariant] = useState(variants[1] || variants[0]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product, selectedVariant.label, selectedVariant.price);
    toast.success(`Added to cart! 🛒`, { duration: 1800, style: { fontSize: 13 } });
    setTimeout(() => setAdding(false), 800);
  };

  const displayPrice = Number(selectedVariant?.price || product.price || 0).toLocaleString('en-IN');

  return (
    <article className="product-card" aria-label={product.name}>
      {/* ── Image area ── */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card__image-wrap">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="product-card__image"
          />
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="product-card__body">
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="text-headline-sm" style={{
            color: 'var(--color-primary)',
            marginBottom: 4,
            fontSize: 'clamp(13px, 3vw, 17px)',
            lineHeight: 1.3,
          }}>
            {product.name}
          </h3>
          {product.tagline && (
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--color-on-surface-variant)', marginBottom: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.tagline}
            </p>
          )}
        </Link>

        {/* Enquiry: price + Contact Us (no weight selector) */}
        {product.pricingType === 'enquiry' ? (
          <div className="product-card__meta" style={{ marginTop: 'auto' }}>
            <span className="product-card__price">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
            <Link
              to="/contact"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', borderRadius: 99,
                background: 'linear-gradient(135deg, #6b21a8, #4c1d95)',
                color: 'white', fontSize: 11, fontWeight: 700,
                textDecoration: 'none', letterSpacing: '0.03em',
                boxShadow: '0 3px 10px rgba(107,33,168,0.35)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, fontVariationSettings: "'FILL' 1" }}>contact_support</span>
              Contact Us
            </Link>
          </div>
        ) : (
          <>
            {/* Weight selector */}
            <div className="weight-selector" role="group" aria-label="Select weight">
              {variants.map((v) => (
                <button
                  key={v.label}
                  className={`weight-btn${selectedVariant?.label === v.label ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVariant(v); }}
                  aria-pressed={selectedVariant?.label === v.label}
                  aria-label={`${v.label} — ₹${Number(v.price).toLocaleString('en-IN')}`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Price + Add button */}
            <div className="product-card__meta">
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 2 }}>
                  {selectedVariant?.label}
                </span>
                <span className="product-card__price">₹{displayPrice}</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                aria-label={`${adding ? 'Added' : 'Add'} ${product.name} ${selectedVariant?.label || ''} ₹${displayPrice} to cart`}
                aria-live="polite"
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none',
                  background: 'linear-gradient(135deg, #2a5c2a, #193619)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: adding ? 'default' : 'pointer',
                  transition: 'all 180ms ease',
                  boxShadow: adding ? '0 0 0 3px rgba(25,54,25,0.2)' : '0 3px 10px rgba(25,54,25,0.3)',
                  transform: adding ? 'scale(0.9)' : 'scale(1)',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontFamily: 'Material Symbols Outlined', fontSize: 18,
                  fontVariationSettings: adding ? "'FILL' 1" : "'FILL' 0",
                }}>
                  {adding ? 'check' : 'add'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
