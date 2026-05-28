// src/pages/ContactPage.jsx
import { useState, useCallback } from 'react';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import toast from 'react-hot-toast';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateMessage,
  validateSubject,
} from '../utils/validate';
import { Helmet } from 'react-helmet-async';

// ── Inline field error (reserves space so no layout shift) ─────────────────
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

const WhatsAppSVG = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Contact channel data ────────────────────────────────────────────────────
const CHANNELS = [
  {
    icon: 'call',
    label: 'Phone',
    value: '+91 88254 38334',
    desc: 'Mon – Sat, 9 AM – 7 PM IST',
    href: 'tel:+918825438334',
    color: '#2a5c2a',
  },
  {
    icon: 'chat',
    label: 'WhatsApp',
    value: 'Chat Instantly',
    desc: 'Fastest response usually within minutes',
    href: 'https://wa.me/918825438334',
    color: '#25d366',
  },
  {
    icon: 'mail',
    label: 'Email',
    value: 'kadhambamfoods@gmail.com',
    desc: 'We reply within 24 hours',
    href: 'mailto:kadhambamfoods@gmail.com',
    color: '#7d5700',
  },
  {
    icon: 'location_on',
    label: 'Store',
    value: 'No 29/15/16, East Car Street',
    desc: 'Near New Parvathi, Dindigul-624001',
    href: 'https://www.google.com/maps/place/Kadhambam+Dry+Fruits/@10.3631813,77.9722131,17z/data=!3m1!4b1!4m6!3m5!1s0x3b00abf8e6696dcb:0x24a7f6e8f8e15ff4!8m2!3d10.3631813!4d77.9722131!16s%2Fg%2F11yty5b3yz?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D',
    color: '#47281d',
  },
];

const FAQ = [
  { q: 'Do you deliver across Tamil Nadu?', a: 'Yes! We currently deliver across Tamil Nadu. Delivery typically takes 2–4 business days depending on your location.' },
  { q: 'What is your return policy?', a: 'Contact us, we will help you with that.' },
  { q: 'Are your products preservative-free?', a: 'Absolutely. Every product at Kadhambam is 100% natural no artificial preservatives, no added sulfur, no chemicals.' },
  { q: 'Do you offer bulk / wholesale pricing?', a: 'Yes, we do! Drop us an email at kadhambamfoods@gmail.com or WhatsApp us with your requirements.' },
  { q: 'How can I track my order?', a: 'We dont send tracking link via sms and email you will get payment verfication msg by whatsapp and trcking by my orders in site.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const MAX_MESSAGE = 2000;

const ContactPage = () => {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [honeypot, setHoneypot] = useState(''); // bot trap — humans leave this blank

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }, [errors]);

  // Per-field blur validation
  const handleBlur = useCallback((field, validatorFn) => () => {
    const err = validatorFn(form[field]);
    if (err) setErrors((prev) => ({ ...prev, [field]: err }));
  }, [form]);

  const validate = () => {
    const e = {};
    const nameErr    = validateName(form.name);
    const emailErr   = validateEmail(form.email);
    const phoneErr   = form.phone.trim() ? validatePhone(form.phone, false) : null;
    const subjectErr = form.subject.trim() ? validateSubject(form.subject, false) : null;
    const msgErr     = validateMessage(form.message, MAX_MESSAGE);
    if (nameErr)    e.name    = nameErr;
    if (emailErr)   e.email   = emailErr;
    if (phoneErr)   e.phone   = phoneErr;
    if (subjectErr) e.subject = subjectErr;
    if (msgErr)     e.message = msgErr;
    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.getElementById(`cf-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Honeypot check — bots fill hidden fields, humans don't
    if (honeypot) return; // Silently drop bot submissions
    if (!validate()) return;
    setSending(true);
    // TODO: replace with actual Firestore / EmailJS call
    // Data is already sanitized before this point
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon 🌿");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
      setSending(false);
    }, 1200);
  };

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>Contact Kadhambam – Call, WhatsApp or Email Us | Dindigul, Tamil Nadu</title>
        <meta name="description" content="Contact Kadhambam Dry Fruits. Call +91 88254 38334, WhatsApp us, or email kadhambamfoods@gmail.com. Store located in Dindigul, Tamil Nadu 624001." />
        <link rel="canonical" href="https://kadhambam.com/contact" />
        <meta property="og:title" content="Contact Kadhambam Dry Fruits – We'd Love to Hear from You" />
        <meta property="og:description" content="Reach us by phone, WhatsApp, or email. Store in Dindigul, Tamil Nadu. Fast response guaranteed." />
        <meta property="og:url" content="https://kadhambam.com/contact" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://kadhambam.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Contact', 'item': 'https://kadhambam.com/contact' },
          ]
        })}</script>
      </Helmet>
      <Header />

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #193619 0%, #2a5c2a 55%, #1e4a1e 100%)',
        padding: 'clamp(44px, 10vw, 104px) var(--margin-mobile)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 'min(280px, 50vw)', height: 'min(280px, 50vw)', borderRadius: '50%', background: 'rgba(200,236,194,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 'min(200px, 40vw)', height: 'min(200px, 40vw)', borderRadius: '50%', background: 'rgba(200,236,194,0.05)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 620, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 18px',
            background: 'rgba(200,236,194,0.15)',
            border: '1px solid rgba(200,236,194,0.2)',
            borderRadius: 99,
            fontSize: 11, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(200,236,194,0.9)',
            marginBottom: 'clamp(14px, 3vw, 22px)',
          }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>support_agent</span>
            Get in Touch
          </span>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 6vw, 58px)',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: 'clamp(12px, 2.5vw, 18px)',
          }}>
            We'd Love to<br />
            <span style={{ color: '#c8ecc2' }}>Hear from You</span>
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: 'rgba(200,236,194,0.8)',
            lineHeight: 1.8,
            maxWidth: 480,
            margin: '0 auto',
          }}>
            Questions, feedback, wholesale enquiries, or just saying hello our team is here for you.
          </p>
        </div>
      </section>

      <main id="main-content">
        {/* ── CONTACT CHANNELS STRIP ── */}
        <div style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 56px) var(--margin-mobile)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
          gap: 'clamp(10px, 2vw, 16px)',
        }}>
          {CHANNELS.map(ch => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div className="contact-channel-card" style={{
                padding: 'clamp(16px, 3vw, 24px) clamp(14px, 2.5vw, 20px)',
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'clamp(14px, 2.5vw, 20px)',
                border: '1px solid rgba(195,200,190,0.4)',
                boxShadow: '0 2px 12px rgba(61,43,31,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                cursor: 'pointer',
                height: '100%',
              }}
              >
                <div style={{
                  width: 'clamp(38px, 8vw, 48px)', height: 'clamp(38px, 8vw, 48px)', borderRadius: 'clamp(10px, 2vw, 14px)',
                  background: ch.color + '15',
                  border: `1px solid ${ch.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 24, color: ch.color, fontVariationSettings: "'FILL' 1" }}>
                    {ch.icon}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--color-on-surface-variant)', marginBottom: 3 }}>
                    {ch.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {ch.value}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                    {ch.desc}
                  </p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: ch.color }}>
                  Contact
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>arrow_forward</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* ── FORM + INFO ── */}
        <section className="contact-layout-section">
          {/* ── Contact Form ── */}
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 24,
            padding: 'clamp(22px, 4vw, 44px)',
            border: '1px solid rgba(195,200,190,0.4)',
            boxShadow: '0 4px 24px rgba(61,43,31,0.07)',
          }}>
            <div style={{ marginBottom: 'clamp(18px, 3vw, 28px)' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: 6,
              }}>
                Send Us a Message
              </h2>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                Fill in the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Honeypot — bots fill this; valid users never see it */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                <label htmlFor="cf-hp">Leave this field empty</label>
                <input
                  id="cf-hp"
                  name="website"
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Name + Email row */}
              <div className="contact-form-row" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" htmlFor="cf-name">
                    Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    id="cf-name"
                    name="name"
                    type="text"
                    className={`input${errors.name ? ' input-error' : ''}`}
                    placeholder="Ravi Kumar"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur('name', validateName)}
                    maxLength={80}
                    autoComplete="name"
                    aria-describedby={errors.name ? 'cf-name-error' : undefined}
                    aria-invalid={!!errors.name}
                    spellCheck={false}
                  />
                  <FieldError id="cf-name-error" message={errors.name} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" htmlFor="cf-email">
                    Email <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    className={`input${errors.email ? ' input-error' : ''}`}
                    placeholder="ravi@email.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur('email', validateEmail)}
                    maxLength={254}
                    autoComplete="email"
                    inputMode="email"
                    aria-describedby={errors.email ? 'cf-email-error' : undefined}
                    aria-invalid={!!errors.email}
                  />
                  <FieldError id="cf-email-error" message={errors.email} />
                </div>
              </div>

              {/* Phone (optional) */}
              <div className="form-group" style={{ margin: '12px 0 0' }}>
                <label className="label" htmlFor="cf-phone">
                  Phone Number <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  className={`input${errors.phone ? ' input-error' : ''}`}
                  placeholder="8825438334"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur('phone', (v) => v.trim() ? validatePhone(v, false) : null)}
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
                  aria-invalid={!!errors.phone}
                />
                <FieldError id="cf-phone-error" message={errors.phone} />
              </div>

              {/* Subject */}
              <div className="form-group" style={{ margin: '12px 0 0' }}>
                <label className="label" htmlFor="cf-subject">Subject</label>
                <select
                  id="cf-subject"
                  name="subject"
                  className={`input${errors.subject ? ' input-error' : ''}`}
                  value={form.subject}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                  aria-describedby={errors.subject ? 'cf-subject-error' : undefined}
                >
                  <option value="">Select a topic…</option>
                  <option value="order">Order Enquiry</option>
                  <option value="product">Product Question</option>
                  <option value="wholesale">Wholesale / Bulk</option>
                  <option value="return">Return / Refund</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
                <FieldError id="cf-subject-error" message={errors.subject} />
              </div>

              {/* Message with character counter */}
              <div className="form-group" style={{ margin: '12px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label className="label" htmlFor="cf-message" style={{ margin: 0 }}>
                    Message <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: form.message.length > MAX_MESSAGE * 0.9
                      ? 'var(--color-error)'
                      : 'var(--color-on-surface-variant)',
                    transition: 'color 200ms',
                  }}>
                    {form.message.length}/{MAX_MESSAGE}
                  </span>
                </div>
                <textarea
                  id="cf-message"
                  name="message"
                  className={`input${errors.message ? ' input-error' : ''}`}
                  placeholder="Tell us how we can help…"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur('message', (v) => validateMessage(v, MAX_MESSAGE))}
                  maxLength={MAX_MESSAGE}
                  style={{ resize: 'vertical', minHeight: 120, marginTop: 6 }}
                  aria-describedby={errors.message ? 'cf-message-error' : undefined}
                  aria-invalid={!!errors.message}
                />
                <FieldError id="cf-message-error" message={errors.message} />
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`btn btn-primary btn-lg${sending ? ' loading' : ''}`}
                style={{ width: '100%', marginTop: 20 }}
                aria-busy={sending}
              >
                {sending ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, animation: 'spin 700ms linear infinite' }}>progress_activity</span>
                    Sending…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>send</span>
                    Send Message
                  </>
                )}
              </button>
            </form>

          </div>

          {/* ── Side Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Map placeholder */}
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              background: 'var(--color-surface-container)',
              border: '1px solid rgba(195,200,190,0.4)',
              aspectRatio: 'auto',
              minHeight: 'clamp(200px, 35vw, 280px)',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
            }}>
              {/* Decorative map grid */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(195,200,190,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(195,200,190,0.3) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />
              <div style={{
                width: 'clamp(44px, 10vw, 56px)', height: 'clamp(44px, 10vw, 56px)', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2a5c2a, #193619)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(25,54,25,0.35)',
                position: 'relative', zIndex: 1,
              }}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 28, color: 'white', fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.4 }}>No 29/15/16, Near New Parvathi,</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.4 }}>Opposite Subramaniam Textiles,</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.4, marginBottom: 4 }}>East Car Street, Bazaar</p>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>Dindigul-624001, Tamil Nadu</p>
              </div>
              <a
                href="https://www.google.com/maps/place/Kadhambam+Dry+Fruits/@10.3631813,77.9722131,17z/data=!3m1!4b1!4m6!3m5!1s0x3b00abf8e6696dcb:0x24a7f6e8f8e15ff4!8m2!3d10.3631813!4d77.9722131!16s%2Fg%2F11yty5b3yz?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'relative', zIndex: 1,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 20px',
                  borderRadius: 99,
                  background: 'white',
                  color: '#193619',
                  fontWeight: 700, fontSize: 13,
                  boxShadow: '0 2px 10px rgba(25,54,25,0.18)',
                  textDecoration: 'none',
                }}
                className="contact-maps-btn"
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>open_in_new</span>
                Open in Maps
              </a>
            </div>

            {/* Business hours card */}
            <div style={{
              padding: 'clamp(18px, 3vw, 24px)',
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 20,
              border: '1px solid rgba(195,200,190,0.4)',
              boxShadow: '0 2px 12px rgba(61,43,31,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(12px, 2.5vw, 18px)' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(25,54,25,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>schedule</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, color: 'var(--color-primary)' }}>Business Hours</h3>
              </div>
              {[
                { day: 'Monday – Sunday', hours: '9:15 AM – 10:30 PM', open: true },
              ].map(row => (
                <div key={row.day} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(195,200,190,0.3)',
                }}>
                  <span style={{ fontSize: 14, color: 'var(--color-on-surface)', fontWeight: 500 }}>{row.day}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: row.open ? 'var(--color-primary)' : 'var(--color-error)',
                  }}>
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/918825438334" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="contact-whatsapp-cta" style={{
                padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3vw, 22px)',
                background: 'linear-gradient(135deg, #25d366, #1da851)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,211,102,0.25)',
              }}
              >
                <div style={{ width: 'clamp(38px, 8vw, 46px)', height: 'clamp(38px, 8vw, 46px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <WhatsAppSVG size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: 'white', marginBottom: 2 }}>Chat on WhatsApp</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Get a reply in minutes</p>
                </div>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>arrow_forward</span>
              </div>
            </a>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{
          background: 'linear-gradient(160deg, var(--color-surface-container-low), var(--color-surface-container))',
          padding: 'clamp(40px, 8vw, 96px) var(--margin-mobile)',
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 44px)' }}>
              <span style={{
                display: 'inline-block', padding: '4px 16px',
                background: 'rgba(25,54,25,0.08)', borderRadius: 99,
                fontSize: 11, fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--color-primary)', marginBottom: 14,
              }}>
                ❓ FAQs
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2 }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-surface-container-lowest)',
                    borderRadius: 16,
                    border: `1px solid ${openFaq === i ? 'rgba(25,54,25,0.2)' : 'rgba(195,200,190,0.4)'}`,
                    overflow: 'hidden',
                    transition: 'border-color 200ms ease',
                    boxShadow: openFaq === i ? '0 4px 20px rgba(25,54,25,0.08)' : 'none',
                  }}
                >
                  <button
                    className="contact-faq-btn"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'clamp(14px, 2.5vw, 18px) clamp(14px, 3vw, 20px)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: 600, color: 'var(--color-on-surface)', flex: 1, lineHeight: 1.4 }}>
                      {item.q}
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontFamily: 'Material Symbols Outlined',
                        fontSize: 22,
                        color: 'var(--color-primary)',
                        flexShrink: 0,
                        transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 250ms ease',
                      }}
                    >
                      expand_more
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{
                      padding: '0 clamp(14px, 3vw, 20px) clamp(14px, 3vw, 20px)',
                      fontSize: 'clamp(13px, 2.5vw, 15px)',
                      color: 'var(--color-on-surface-variant)',
                      lineHeight: 1.8,
                      borderTop: '1px solid rgba(195,200,190,0.3)',
                      paddingTop: 16,
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div style={{ textAlign: 'center', marginTop: 'clamp(24px, 5vw, 36px)' }}>
              <p style={{ fontSize: 15, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
                Still have questions? We're happy to help.
              </p>
              <a
                href="mailto:kadhambamfoods@gmail.com"
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>mail</span>
                Email Us Directly
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />

      {/* Responsive grid styles */}
      <style>{`
        .contact-layout-section {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 0 var(--margin-mobile) clamp(48px, 8vw, 96px);
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(24px, 4vw, 40px);
        }
        @media (min-width: 900px) {
          .contact-layout-section {
            grid-template-columns: 1.4fr 1fr;
          }
        }
        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 560px) {
          .contact-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;


