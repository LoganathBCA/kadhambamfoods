// src/pages/CartPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { useCart, DELIVERY_PER_SLAB_KG, getDeliverySlab } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const CartPage = () => {
  const { cartItems, cartTotal, cartCount, cartWeightKg, deliveryFee, removeFromCart, updateQty, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  const grandTotal = cartTotal + deliveryFee;

  const handleRemove = (item) => {
    removeFromCart(item.key);
    toast.success(`${item.name} removed`, { duration: 2000 });
  };

  const handleClearCart = () => {
    clearCart();
    setConfirmClear(false);
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (!user) {
      toast('Please sign in to checkout', { icon: '🔒', duration: 3000 });
      navigate('/login?next=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-body-pad">
        <Header />
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'var(--color-surface-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 8,
          }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 48, color: 'var(--color-primary)' }}>
              shopping_cart
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--color-primary)' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: 280, textAlign: 'center', lineHeight: 1.6 }}>
            Add some dry fruits or nuts to get started!
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>storefront</span>
              Browse Products
            </Link>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>Your Cart – Kadhambam Dry Fruits</title>
        <meta name="description" content="Review your cart and proceed to checkout. Buy premium dry fruits and organic nuts from Kadhambam." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Header />
      <main id="main-content" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-10) var(--margin-mobile)' }}>
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          {/* Back to store */}
          <Link to="/shop" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: 16, transition: 'color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
          >
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>arrow_back</span>
            Back to Store
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>
              Your Cart
              <span style={{ fontSize: 16, fontWeight: 400, fontFamily: 'var(--font-sans)', marginLeft: 10, color: 'var(--color-on-surface-variant)' }}>
                ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </span>
            </h1>
            {confirmClear ? (
              <div role="status" aria-live="assertive" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--color-error)', fontWeight: 600 }}>Clear all items?</span>
                <button
                  onClick={handleClearCart}
                  aria-label="Yes, clear all cart items"
                  style={{ fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-error)', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontFamily: 'var(--font-sans)' }}
                >Yes, Clear</button>
                <button
                  onClick={() => setConfirmClear(false)}
                  aria-label="Cancel, keep cart items"
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface-variant)', background: 'var(--color-surface-container)', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontFamily: 'var(--font-sans)' }}
                >Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                aria-label="Clear all items from cart"
                style={{ fontSize: 13, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-error-container)', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 600, transition: 'all 150ms ease' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>delete_sweep</span>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Delivery charge info — slab system */}
        {(() => {
          const slab      = cartWeightKg > 0 ? getDeliverySlab(cartWeightKg) : 0;
          const prevSlabKg = Math.max(0, slab - 1);
          const progressPct = slab > 0
            ? ((cartWeightKg - prevSlabKg) / 1) * 100   // progress within current 1-kg band
            : 0;
          return (
            <div style={{
              background: 'var(--color-primary-fixed)',
              borderRadius: 'var(--radius-xl)',
              padding: '14px 20px',
              marginBottom: 24,
              border: '1px solid var(--color-primary-fixed-dim)',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, verticalAlign: 'middle' }}>local_shipping</span>
                  Delivery charge: ₹{deliveryFee.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>
                  ₹{DELIVERY_PER_SLAB_KG} per kg slab
                </span>
              </div>

              {cartWeightKg > 0 && (
                <>
                  {/* Weight progress within current slab */}
                  <div style={{ height: 5, background: 'rgba(25,54,25,0.15)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, progressPct)}%`,
                      background: 'var(--color-primary)',
                      borderRadius: 99,
                      transition: 'width 400ms ease',
                    }} />
                  </div>

                  {/* Weight label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-primary)', opacity: 0.8, marginBottom: 10 }}>
                    <span>Total weight: {cartWeightKg >= 1 ? `${cartWeightKg.toFixed(2)} kg` : `${Math.round(cartWeightKg * 1000)} g`}</span>
                    <span>Slab {slab} of {slab} · ₹{deliveryFee}</span>
                  </div>

                  {/* Slab tier pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4].map(s => {
                      const isActive  = s === slab;
                      const isPassed  = s < slab;
                      return (
                        <span key={s} style={{
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 10px', borderRadius: 99,
                          background: isActive ? 'var(--color-primary)' : isPassed ? 'var(--color-primary-a15)' : 'rgba(25,54,25,0.06)',
                          color: isActive ? 'white' : 'var(--color-primary)',
                          border: `1px solid ${isActive ? 'transparent' : 'rgba(25,54,25,0.15)'}`,
                          transition: 'all 250ms ease',
                        }}>
                          {s === 1 ? '≤1kg' : `${s-1}–${s}kg`} • ₹{s * DELIVERY_PER_SLAB_KG}
                        </span>
                      );
                    })}
                    {slab > 4 && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'var(--color-primary)', color: 'white' }}>
                        {slab-1}–{slab}kg • ₹{deliveryFee}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })()}


        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'start' }}>
          {/* Cart items */}
          <div>
            <ul
              aria-label={`Cart items, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-outline-variant)', overflow: 'hidden', listStyle: 'none', margin: 0, padding: 0 }}
            >
              {cartItems.map((item, idx) => (
                <li key={item.key} className="cart-item" style={{ borderBottom: idx < cartItems.length - 1 ? '1px solid var(--color-outline-variant)' : 'none' }}>
                  <div className="cart-item__image">
                    <img
                      src={item.image || `https://placehold.co/80x80/fdecd1/2f4d2e?text=${encodeURIComponent(item.name[0])}`}
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item__details">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__weight">{item.weight}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div className="qty-controls" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          className="qty-btn"
                          onClick={() => item.qty > 1 ? updateQty(item.key, item.qty - 1) : handleRemove(item)}
                          aria-label={item.qty === 1 ? `Remove ${item.name} from cart` : `Decrease quantity of ${item.name}, currently ${item.qty}`}
                          style={{ color: item.qty === 1 ? 'var(--color-error)' : undefined }}
                        >
                          {item.qty === 1 ? '\uD83D\uDDD1' : '−'}
                        </button>
                        <span
                          className="qty-value"
                          aria-live="polite"
                          aria-atomic="true"
                          aria-label={`${item.name} quantity: ${item.qty}`}
                        >
                          {item.qty}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          aria-label={`Increase quantity of ${item.name}, currently ${item.qty}`}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18, color: 'var(--color-primary)' }}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    style={{ color: 'var(--color-error)', alignSelf: 'flex-start', padding: 4, marginLeft: -4 }}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>close</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Order summary */}
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-outline-variant)',
            padding: 28,
            position: 'sticky',
            top: 88,
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20 }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {cartItems.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={item.image || `https://placehold.co/40x40/fdecd1/2f4d2e?text=${encodeURIComponent(item.name[0])}`}
                    alt={item.name}
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name} × {item.qty}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>Delivery</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>
                    {cartWeightKg >= 1 ? `${cartWeightKg.toFixed(2)} kg` : `${Math.round(cartWeightKg * 1000)} g`} • Slab {getDeliverySlab(cartWeightKg)} • ₹{DELIVERY_PER_SLAB_KG}/slab
                  </span>
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>₹{deliveryFee.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--color-outline-variant)' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleCheckout}
              aria-label={`Proceed to checkout, total ₹${grandTotal.toLocaleString('en-IN')}`}
            >
              Proceed to Checkout
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>arrow_forward</span>
            </button>

            <Link
              to="/shop"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>storefront</span>
              Back to Store
            </Link>

            {/* Trust badges */}
            <div role="list" aria-label="Trust badges" style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { icon: 'lock', label: 'Secure payment' },
                { icon: 'verified', label: 'Quality guaranteed' },
                { icon: 'local_shipping', label: 'Fast delivery' },
              ].map(({ icon, label }) => (
                <span key={icon} role="listitem" title={label} aria-label={label}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--color-primary)', opacity: 0.6 }}>{icon}</span>
                </span>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 6 }}>
              Secure UPI Payment · Quality Guaranteed
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default CartPage;
