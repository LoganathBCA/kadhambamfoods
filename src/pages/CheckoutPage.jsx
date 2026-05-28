// src/pages/CheckoutPage.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { useCart, DELIVERY_PER_SLAB_KG, getDeliverySlab } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import toast from 'react-hot-toast';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateCity,
  validatePincode,
  validateUTR,
  sanitize,
} from '../utils/validate';
import { Helmet } from 'react-helmet-async';

// ── Business UPI credentials ───────────────────────────────────────────────────
const UPI_VPA  = import.meta.env.VITE_UPI_VPA  || 'gpay-12191589851@okbizaxis';
const UPI_NAME = 'Kadhambam Dry Fruits';

// Generate unique transaction reference: ORD-[TIMESTAMP]-[RANDOM]
const generateTransactionId = () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

// ── Inline field error ─────────────────────────────────────────────────────────
const FieldError = ({ id, message }) => (
  <div
    id={id}
    role={message ? 'alert' : undefined}
    aria-live="polite"
    style={{ minHeight: 22, display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 4 }}
  >
    {message && (
      <>
        <span
          className="material-symbols-outlined"
          style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, color: 'var(--color-error)', fontVariationSettings: "'FILL' 1", flexShrink: 0, marginTop: 1 }}
        >
          error
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.4, animation: 'validation-shake 200ms ease both' }}>
          {message}
        </span>
      </>
    )}
  </div>
);

// ── Labeled input row ──────────────────────────────────────────────────────────
const FormField = ({ id, label, required, error, hint, children }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="label" htmlFor={id} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      {label}
      {required && <span style={{ color: 'var(--color-error)', fontSize: 14 }}>*</span>}
    </label>
    {children}
    <FieldError id={`${id}-error`} message={error} />
    {hint && !error && (
      <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{hint}</p>
    )}
  </div>
);

// ── UPI QR + UTR two-step panel ───────────────────────────────────────────────
const UpiQrPaymentPanel = ({
  upiUrl, grandTotal, upiVpa,
  form, errors, handleChange, handleBlur,
  showUtrStep, setShowUtrStep,
  utrInputRef,
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{
      background: 'var(--color-surface-container-lowest)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-outline-variant)',
      overflow: 'hidden',
    }}>

      {/* ── Card header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), #2a5c2a)',
        padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 28px)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>📱</span>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            Pay via UPI
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 3 }}>
            Follow the 2 steps below to complete your payment
          </p>
        </div>
      </div>

      <div style={{ padding: 'clamp(16px, 4vw, 24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ════════════════════════════════════
            STEP 1 — Scan / Screenshot & Pay
            ════════════════════════════════════ */}
        <div style={{
          borderRadius: 14,
          border: `2px solid ${showUtrStep ? 'rgba(46,125,50,0.20)' : 'var(--color-primary)'}`,
          overflow: 'hidden',
          transition: 'border-color 300ms ease',
          opacity: showUtrStep ? 0.60 : 1,
        }}>

          {/* Step 1 header */}
          <div style={{
            background: showUtrStep ? 'var(--color-surface-container)' : 'var(--color-primary)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background 300ms ease',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: showUtrStep ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.22)',
              color: showUtrStep ? 'var(--color-on-surface-variant)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 15, flexShrink: 0,
            }}>
              {showUtrStep ? '✓' : '1'}
            </div>
            <span style={{
              fontWeight: 800, fontSize: 15,
              color: showUtrStep ? 'var(--color-on-surface-variant)' : '#fff',
            }}>
              Scan &amp; Pay the QR Code
            </span>
            {showUtrStep && (
              <button
                type="button"
                onClick={() => setShowUtrStep(false)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: '1.5px solid var(--color-outline-variant)',
                  borderRadius: 8, padding: '3px 12px',
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--color-primary)', cursor: 'pointer',
                }}
              >
                Show QR ↩
              </button>
            )}
          </div>

          {/* Step 1 body */}
          {!showUtrStep && (
            <div style={{ padding: 'clamp(14px, 3vw, 20px)', animation: 'fade-in 300ms ease' }}>

              {/* How-to card */}
              <div style={{
                background: isMobile ? 'rgba(255,152,0,0.08)' : 'rgba(33,150,243,0.07)',
                border: `1.5px solid ${isMobile ? 'rgba(255,152,0,0.35)' : 'rgba(33,150,243,0.30)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 20,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>
                  {isMobile ? '📸' : '📷'}
                </span>
                <div>
                  <p style={{
                    fontWeight: 800, fontSize: 14,
                    color: isMobile ? '#bf360c' : '#0d47a1',
                    marginBottom: 8, lineHeight: 1.3,
                  }}>
                    {isMobile
                      ? 'On Your Phone — Screenshot & Upload'
                      : 'On Desktop — Scan with Your Phone'}
                  </p>

                  {isMobile ? (
                    <>
                      <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                          📸 <strong>Take a screenshot</strong> of this page right now
                        </li>
                        <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                          Open <strong>GPay / PhonePe / Paytm</strong>
                        </li>
                        <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                          Tap <strong>Scan QR</strong> → gallery icon → choose the screenshot → Pay ₹{grandTotal.toLocaleString('en-IN')}
                        </li>
                      </ol>
                      <p style={{ marginTop: 10, fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        💡 Or use a <strong>second phone</strong> to scan the QR code below directly
                      </p>
                    </>
                  ) : (
                    <>
                      <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                          Open <strong>GPay / PhonePe / Paytm</strong> on your phone
                        </li>
                        <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                          Tap <strong>Scan QR</strong> and point your camera at the code below
                        </li>
                        <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                          Confirm the amount — ₹{grandTotal.toLocaleString('en-IN')} — and Pay
                        </li>
                      </ol>
                      <p style={{ marginTop: 10, fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        💡 Or use a <strong>second phone</strong> to scan with its camera app
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* QR code — centred */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 14, textAlign: 'center',
              }}>
                <div style={{
                  padding: 14, background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                  display: 'inline-flex', lineHeight: 0,
                }}>
                  <QRCodeSVG
                    value={upiUrl}
                    size={Math.min(220, window.innerWidth - 120)}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    level="M"
                    includeMargin={true}
                  />
                </div>

                <div className="amount">₹{grandTotal.toLocaleString('en-IN')}</div>

                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginBottom: 5 }}>Pay to UPI ID</p>
                  <span className="vpa" style={{ wordBreak: 'break-all' }}>{upiVpa}</span>
                </div>

                {/* Done CTA */}
                <button
                  type="button"
                  id="upi-payment-done-btn"
                  onClick={() => setShowUtrStep(true)}
                  style={{
                    width: '100%', maxWidth: 340,
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #1b6b1b, #2e7d32)',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    border: 'none', borderRadius: 14, cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(46,125,50,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(46,125,50,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(46,125,50,0.35)'; }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>✅</span>
                  I Have Completed the Payment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════
            STEP 2 — Copy UTR & Confirm
            ════════════════════════════════════ */}
        <div style={{
          borderRadius: 14,
          border: `2px solid ${showUtrStep ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
          overflow: 'hidden',
          transition: 'border-color 300ms ease',
        }}>

          {/* Step 2 header */}
          <div style={{
            background: showUtrStep ? 'var(--color-primary)' : 'var(--color-surface-container)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background 300ms ease',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: showUtrStep ? 'rgba(255,255,255,0.22)' : 'var(--color-outline-variant)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 15, flexShrink: 0,
            }}>
              2
            </div>
            <span style={{
              fontWeight: 800, fontSize: 15,
              color: showUtrStep ? '#fff' : 'var(--color-on-surface-variant)',
            }}>
              Paste UTR Number &amp; Confirm Order
            </span>
            {!showUtrStep && (
              <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                background: 'var(--color-outline-variant)',
                color: 'var(--color-on-surface-variant)',
                borderRadius: 6, padding: '2px 8px', flexShrink: 0,
              }}>
                After Step 1 ↑
              </span>
            )}
          </div>

          {/* Step 2 body */}
          <div style={{
            padding: 'clamp(14px, 3vw, 20px)',
            opacity: showUtrStep ? 1 : 0.42,
            pointerEvents: showUtrStep ? 'auto' : 'none',
            transition: 'opacity 300ms ease',
          }}>

            {/* UTR instruction card */}
            <div style={{
              background: 'rgba(33,150,243,0.07)',
              border: '1.5px solid rgba(33,150,243,0.28)',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 18,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🔢</span>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: '#0d47a1', marginBottom: 8, lineHeight: 1.3 }}>
                  Where to find your UTR Number
                </p>
                <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                    Open your UPI app → go to <strong>Transaction History</strong>
                  </li>
                  <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                    Tap the payment you just made → <strong>copy the UTR / Ref No.</strong>
                  </li>
                  <li style={{ fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
                    Paste it in the box below and press <strong>Confirm Order</strong>
                  </li>
                </ol>

                {/* 24-hour promise */}
                <div style={{
                  marginTop: 12,
                  background: 'rgba(46,125,50,0.10)',
                  border: '1px solid rgba(46,125,50,0.28)',
                  borderRadius: 10, padding: '9px 13px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>⏱️</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1b5e20', lineHeight: 1.45, margin: 0 }}>
                    We will verify your payment and confirm your order within{' '}
                    <span style={{ textDecoration: 'underline dotted' }}>24 hours</span>
                  </p>
                </div>
              </div>
            </div>

            {/* UTR input field */}
            <FormField
              id="co-utr"
              label="UPI Reference Number (UTR)"
              required
              error={errors.utr}
              hint="12-digit number found in your UPI app under Transaction History"
            >
              <input
                ref={utrInputRef}
                id="co-utr"
                className={`input${errors.utr ? ' input-error' : ''}`}
                type="text"
                value={form.utr}
                onChange={handleChange('utr')}
                onBlur={handleBlur('utr', validateUTR)}
                placeholder="e.g. 426812345678"
                maxLength={22}
                style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: 16 }}
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                aria-describedby={errors.utr ? 'co-utr-error' : 'co-utr-hint'}
                aria-invalid={!!errors.utr}
              />
            </FormField>

            {/* App name badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                <span key={app} style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--color-on-surface-variant)',
                  background: 'var(--color-surface-container)',
                  borderRadius: 6, padding: '3px 10px',
                }}>{app}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};



// ── Main component ─────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { user }                                               = useAuth();
  const { cartItems, cartTotal, cartWeightKg, deliveryFee, clearCart } = useCart();
  const navigate                                               = useNavigate();
  const grandTotal                                             = cartTotal + deliveryFee;

  const [form, setForm] = useState({
    name:    user?.displayName || '',
    email:   user?.email       || '',
    phone:   '',
    address: '',
    city:    '',
    pincode: '',
    utr:     '',
  });
  const [errors,       setErrors]       = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  // Payment step state — lifted here so handleSubmit can auto-reveal UTR step on error
  const [showUtrStep,  setShowUtrStep]  = useState(false);
  const utrInputRef = useRef(null);

  // One unique transaction ID per checkout session
  const transactionId = useState(() => generateTransactionId())[0];

  // Dynamic UPI URI — QR-only, no deep-link anchor
  const upiUrl = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(UPI_NAME)}&mc=5422&tr=${transactionId}&am=${grandTotal.toFixed(2)}&cu=INR`;

  const handleChange = useCallback((field) => (e) => {
    const raw = e.target.value;
    setForm(prev => ({ ...prev, [field]: raw }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleBlur = useCallback((field, validator) => () => {
    const err = validator(form[field]);
    if (err) setErrors(prev => ({ ...prev, [field]: err }));
  }, [form]);

  const validate = useCallback(() => {
    const e = {};
    const nameErr    = validateName(form.name);
    const phoneErr   = validatePhone(form.phone);
    const emailErr   = form.email.trim() ? validateEmail(form.email) : null;
    const addressErr = validateAddress(form.address);
    const cityErr    = validateCity(form.city);
    const pincodeErr = validatePincode(form.pincode);
    const utrErr     = validateUTR(form.utr);

    if (nameErr)    e.name    = nameErr;
    if (phoneErr)   e.phone   = phoneErr;
    if (emailErr)   e.email   = emailErr;
    if (addressErr) e.address = addressErr;
    if (cityErr)    e.city    = cityErr;
    if (pincodeErr) e.pincode = pincodeErr;
    if (utrErr)     e.utr     = utrErr;

    setErrors(e);

    // If UTR is the only / first error, auto-open the UTR step & focus the field
    if (e.utr && !showUtrStep) {
      setShowUtrStep(true);
      setTimeout(() => {
        utrInputRef.current?.focus();
        utrInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return false;
    }

    // Scroll to first visible error
    if (Object.keys(e).length > 0) {
      const firstKey = Object.keys(e)[0];
      document.getElementById(`co-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return Object.keys(e).length === 0;
  }, [form, showUtrStep]);

  // ── EmailJS placeholder — wire your service here ───────────────────────────
  const notifyOrderViaEmail = (orderDetails) => {
    // TODO: Replace with your EmailJS call, e.g.:
    // emailjs.send('SERVICE_ID', 'TEMPLATE_ID', {
    //   order_id: orderDetails.orderId,
    //   customer: orderDetails.customerName,
    //   utr:      orderDetails.utr,
    //   total:    orderDetails.total,
    //   to_email: orderDetails.email,
    // }, 'PUBLIC_KEY');
    if (import.meta.env.DEV) {
      console.log('[EmailJS placeholder] Order notification payload:', orderDetails);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted errors before placing your order.', { duration: 3000 });
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        userId:       user.uid,
        customerName: sanitize(form.name),
        email:        sanitize(form.email),
        phone:        sanitize(form.phone).replace(/\D/g, ''),
        address:      `${sanitize(form.address)}, ${sanitize(form.city)} - ${sanitize(form.pincode)}`,
        items:        cartItems,
        subtotal:     cartTotal,
        deliveryFee,
        total:        grandTotal,
        upiVpa:       UPI_VPA,
        upiTxnId:     transactionId,
        utr:          sanitize(form.utr).replace(/\s/g, '').toUpperCase(),
        status:       'Pending',
      };

      const order = await createOrder(orderPayload);

      notifyOrderViaEmail({
        orderId:      order.id,
        customerName: orderPayload.customerName,
        email:        orderPayload.email,
        phone:        orderPayload.phone,
        address:      orderPayload.address,
        items:        cartItems,
        subtotal:     cartTotal,
        deliveryFee,
        total:        grandTotal,
        utr:          orderPayload.utr,
        upiVpa:       UPI_VPA,
        upiTxnId:     transactionId,
      });

      clearCart();
      navigate('/order-success', {
        state: {
          orderId:      order.id,
          customerName: sanitize(form.name),
          email:        sanitize(form.email),
          phone:        sanitize(form.phone).replace(/\D/g, ''),
          address:      `${sanitize(form.address)}, ${sanitize(form.city)} - ${sanitize(form.pincode)}`,
          items:        cartItems,
          subtotal:     cartTotal,
          deliveryFee,
          total:        grandTotal,
          utr:          sanitize(form.utr).replace(/\s/g, '').toUpperCase(),
          upiVpa:       UPI_VPA,
          upiTxnId:     transactionId,
        },
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('[checkout]', err);
      toast.error('Failed to place order. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="page-body-pad">
        <Header />
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 56, color: 'var(--color-outline-variant)' }}>shopping_cart</span>
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>storefront</span>
            Shop Now
          </Link>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-body-pad">
        <Header />
        <div className="empty-state" style={{ minHeight: '60vh', flexDirection: 'column', gap: 20 }}>
          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 56, color: 'var(--color-primary)' }}>lock</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-primary)' }}>Sign in to Checkout</h2>
          <p style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', maxWidth: 320 }}>
            Please sign in with your Google account to place an order and track your delivery.
          </p>
          <Link to="/login?next=/checkout" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>login</span>
            Sign In to Continue
          </Link>
          <Link to="/cart" style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>← Back to Cart</Link>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>Checkout – Kadhambam Dry Fruits</title>
        <meta name="description" content="Complete your order. Enter delivery details and pay securely via UPI QR code." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Header />
      <main id="main-content">
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(16px,4vw,40px) var(--margin-mobile)' }}>
          <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)', marginBottom: 28 }}>
            Checkout
          </h1>

          <form onSubmit={handleSubmit} noValidate aria-label="Checkout form" id="checkout-form">
            <div className="checkout-layout" style={{ maxWidth: '100%', padding: 0, margin: 0 }}>

              {/* ── Left column ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Delivery Details */}
                <div style={{
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-outline-variant)',
                  padding: 'clamp(16px, 4vw, 28px)',
                }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20 }}>
                    Delivery Details
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
                    <FormField id="co-name" label="Full Name" required error={errors.name}>
                      <input id="co-name" className={`input${errors.name ? ' input-error' : ''}`} type="text"
                        value={form.name} onChange={handleChange('name')} onBlur={handleBlur('name', validateName)}
                        placeholder="Your full name" autoComplete="name" maxLength={80}
                        aria-describedby={errors.name ? 'co-name-error' : undefined} aria-invalid={!!errors.name} spellCheck={false}
                      />
                    </FormField>

                    <FormField id="co-phone" label="Phone Number" required error={errors.phone} hint="10-digit Indian mobile number">
                      <input id="co-phone" className={`input${errors.phone ? ' input-error' : ''}`} type="tel"
                        value={form.phone} onChange={handleChange('phone')} onBlur={handleBlur('phone', validatePhone)}
                        placeholder="9876543210" autoComplete="tel" maxLength={10}
                        inputMode="numeric" pattern="[6-9][0-9]{9}"
                        aria-describedby={errors.phone ? 'co-phone-error' : undefined} aria-invalid={!!errors.phone}
                      />
                    </FormField>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <FormField id="co-email" label="Email Address" error={errors.email} hint="Optional — for order confirmation">
                      <input id="co-email" className={`input${errors.email ? ' input-error' : ''}`} type="email"
                        value={form.email} onChange={handleChange('email')}
                        onBlur={() => { if (form.email.trim()) { const err = validateEmail(form.email); if (err) setErrors(p => ({ ...p, email: err })); } }}
                        placeholder="email@example.com" autoComplete="email" maxLength={254} inputMode="email"
                        aria-describedby={errors.email ? 'co-email-error' : undefined} aria-invalid={!!errors.email}
                      />
                    </FormField>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <FormField id="co-address" label="Street Address" required error={errors.address}>
                      <textarea id="co-address" className={`input${errors.address ? ' input-error' : ''}`}
                        value={form.address} onChange={handleChange('address')} onBlur={handleBlur('address', validateAddress)}
                        placeholder="Door no, Street name, Area, Landmark" rows={2}
                        autoComplete="street-address" maxLength={300} style={{ resize: 'vertical' }}
                        aria-describedby={errors.address ? 'co-address-error' : undefined} aria-invalid={!!errors.address}
                      />
                    </FormField>
                  </div>

                  <div className="checkout-form-row">
                    <FormField id="co-city" label="City" required error={errors.city}>
                      <input id="co-city" className={`input${errors.city ? ' input-error' : ''}`} type="text"
                        value={form.city} onChange={handleChange('city')} onBlur={handleBlur('city', validateCity)}
                        placeholder="Chennai" autoComplete="address-level2" maxLength={60}
                        aria-describedby={errors.city ? 'co-city-error' : undefined} aria-invalid={!!errors.city} spellCheck={false}
                      />
                    </FormField>

                    <FormField id="co-pincode" label="Pincode" required error={errors.pincode}>
                      <input id="co-pincode" className={`input${errors.pincode ? ' input-error' : ''}`} type="text"
                        value={form.pincode} onChange={handleChange('pincode')} onBlur={handleBlur('pincode', validatePincode)}
                        placeholder="600001" autoComplete="postal-code" maxLength={6}
                        inputMode="numeric" pattern="\d{6}"
                        aria-describedby={errors.pincode ? 'co-pincode-error' : undefined} aria-invalid={!!errors.pincode}
                      />
                    </FormField>
                  </div>
                </div>

                {/* UPI QR Panel */}
                <UpiQrPaymentPanel
                  upiUrl={upiUrl}
                  grandTotal={grandTotal}
                  upiVpa={UPI_VPA}
                  form={form}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  showUtrStep={showUtrStep}
                  setShowUtrStep={setShowUtrStep}
                  utrInputRef={utrInputRef}
                />
              </div>

              {/* ── Right column: Order Summary ── */}
              <div>
                <div style={{
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-outline-variant)',
                  padding: 'clamp(16px, 4vw, 28px)',
                  position: 'sticky', top: 88,
                }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20 }}>
                    Order Summary
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {cartItems.map((item) => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{item.weight} × {item.qty}</p>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)', flexShrink: 0 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <span style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                        <span style={{ display: 'block' }}>Delivery</span>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>
                          {cartWeightKg >= 1 ? `${cartWeightKg.toFixed(2)} kg` : `${Math.round(cartWeightKg * 1000)} g`} • ₹{DELIVERY_PER_SLAB_KG}/slab
                        </span>
                      </span>
                      <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600, flexShrink: 0 }}>₹{deliveryFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 12, marginTop: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 22, color: 'var(--color-primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* UTR hint when not on UTR step yet */}
                  {!showUtrStep && (
                    <div style={{
                      background: 'rgba(255,193,7,0.1)',
                      border: '1px solid rgba(255,193,7,0.3)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      marginBottom: 14,
                      fontSize: 12,
                      color: 'var(--color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                      <span>Complete UPI payment & enter UTR number before confirming order.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    id="checkout-submit-btn"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    {submitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 700ms linear infinite' }} />
                        Confirming Order...
                      </span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>check_circle</span>
                        Confirm Order
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', textAlign: 'center', marginTop: 12 }}>
                    🔒 Your order details are securely saved
                  </p>
                </div>
              </div>

            </div>
          </form>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default CheckoutPage;
