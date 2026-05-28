// src/pages/OrderSuccessPage.jsx
import { useLocation, Link, Navigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { Helmet } from 'react-helmet-async';

const OrderSuccessPage = () => {
  const { state } = useLocation();

  // If accessed directly without going through checkout, redirect home
  if (!state?.orderId) {
    return <Navigate to="/" replace />;
  }

  const {
    orderId,
    customerName = 'Customer',
    email       = '',
    phone       = '',
    address     = '',
    items       = [],
    subtotal    = 0,
    deliveryFee = 0,
    total       = 0,
    utr         = '',
    upiVpa      = '',
    upiTxnId    = '',
  } = state;

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>Order Placed Successfully – Kadhambam Dry Fruits</title>
        <meta name="description" content="Your order has been placed with Kadhambam. We will verify your UPI payment and confirm within 24 hours." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Header />
      <div className="success-page">
        <div className="success-card" style={{ maxWidth: 520, width: '100%' }}>

          {/* Animated checkmark */}
          <div className="success-icon" style={{ animation: 'modal-in 400ms ease' }}>
            <span className="material-symbols-outlined" style={{
              fontFamily: 'Material Symbols Outlined',
              fontSize: 40, color: 'var(--color-primary)',
              fontVariationSettings: "'FILL' 1",
            }}>check_circle</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>
            Order Placed!
          </h1>

          {/* Payment pending message */}
          <p style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-on-surface)',
            lineHeight: 1.5,
            marginBottom: 24,
            padding: '16px 20px',
            background: 'var(--color-primary-fixed)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-primary-fixed-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>
              schedule
            </span>
            We will confirm your payment in a while.
          </p>

          {/* ── Order Summary Card ── */}
          <div style={{
            background: 'var(--color-surface-container)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-outline-variant)',
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-low)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>
                Order Details
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginBottom: 2 }}>Order ID</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-primary)', wordBreak: 'break-all' }}>{orderId}</p>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 12px', borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                  background: 'rgba(186,138,0,0.12)', color: 'var(--color-secondary)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13, fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  Pending Verification
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)', marginBottom: 10 }}>
                Customer Info
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }}>person</span>
                  <span style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{customerName}</span>
                </div>
                {phone && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }}>call</span>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>{phone}</span>
                  </div>
                )}
                {email && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }}>mail</span>
                    <span style={{ color: 'var(--color-on-surface-variant)', wordBreak: 'break-all' }}>{email}</span>
                  </div>
                )}
                {address && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }}>location_on</span>
                    <span style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Ordered */}
            {items.length > 0 && (
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-outline-variant)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)', marginBottom: 10 }}>
                  Items Ordered
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-surface-container-low)', overflow: 'hidden', flexShrink: 0 }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌿</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{item.weight} × {item.qty}</p>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-primary)', flexShrink: 0 }}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Subtotal</span>
                <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Delivery</span>
                <span>₹{Number(deliveryFee).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total Paid</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18, color: 'var(--color-primary)' }}>
                  ₹{Number(total).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* UPI Payment Info */}
            <div style={{ padding: '14px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)', marginBottom: 10 }}>
                Payment Details
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {utr && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>UTR / Transaction ID:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.04em', wordBreak: 'break-all', fontSize: 13 }}>{utr}</span>
                  </div>
                )}
                {upiTxnId && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>Merchant Ref (tr):</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-on-surface)', letterSpacing: '0.03em', wordBreak: 'break-all' }}>{upiTxnId}</span>
                  </div>
                )}
                {upiVpa && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>Paid to UPI ID:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-on-surface)', wordBreak: 'break-all' }}>{upiVpa}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              to="/account"
              className="btn btn-primary"
              style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>receipt_long</span>
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="btn btn-outline"
              style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Continue Shopping
            </Link>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 20, lineHeight: 1.6, textAlign: 'center' }}>
            📦 Our team will verify your UPI payment and dispatch your order within 24 hours.
            You'll receive a WhatsApp update once your order is confirmed.
          </p>
        </div>
      </div>
      <MobileNav />
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
