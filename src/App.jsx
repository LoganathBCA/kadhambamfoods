// src/App.jsx
import { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Lazy-loaded Pages
const HomePage          = lazy(() => import('./pages/HomePage'));
const ShopPage          = lazy(() => import('./pages/ShopPage'));
const AboutPage         = lazy(() => import('./pages/AboutPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage  = lazy(() => import('./pages/OrderSuccessPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const AccountPage       = lazy(() => import('./pages/AccountPage'));
const ContactPage       = lazy(() => import('./pages/ContactPage'));

// Lazy-loaded Admin pages
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOffers     = lazy(() => import('./pages/admin/AdminOffers'));

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// WhatsApp SVG icon component
const WhatsAppSVG = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Floating WhatsApp button (shown on all public pages)
const FloatingWhatsApp = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const phone = '918825438334'; // update with real number
  const message = encodeURIComponent('Hello! I\'d like to know more about Kadhambam products.');
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <span className="floating-whatsapp__ring" />
        <WhatsAppSVG size={26} />
        <span className="floating-whatsapp__label">Chat with us</span>
      </a>
    </>
  );
};

// Back to top button (shows after scrolling 400px)
const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`back-to-top${visible ? ' visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>arrow_upward</span>
    </button>
  );
};

const App = () => (
  <>
    {/* ── Skip to main content — WCAG 2.4.1 Bypass Blocks ── */}
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <ScrollToTop />
    <BackToTop />
    <FloatingWhatsApp />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: 'Hanken Grotesk, system-ui, sans-serif',
          fontSize: 14,
          borderRadius: 12,
          background: '#fff8f2',
          color: '#231a0a',
          border: '1px solid #c3c8be',
          boxShadow: '0px 4px 20px rgba(61,43,31,0.08)',
          zIndex: 9999,
        },
        success: {
          iconTheme: { primary: '#193619', secondary: '#fff8f2' },
        },
        error: {
          iconTheme: { primary: '#ba1a1a', secondary: '#fff' },
        },
      }}
    />

    <Suspense fallback={<div className="page-body-pad"><div className="loading-spinner"><div className="spinner" /></div></div>}>
      <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />

      {/* Protected */}
      <Route path="/checkout" element={
        <ProtectedRoute><CheckoutPage /></ProtectedRoute>
      } />
      <Route path="/account" element={
        <ProtectedRoute><AccountPage /></ProtectedRoute>
      } />

      {/* Admin protected + admin-only */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/admin/orders" element={
        <AdminRoute><AdminOrders /></AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute><AdminProducts /></AdminRoute>
      } />
      <Route path="/admin/categories" element={
        <AdminRoute><AdminCategories /></AdminRoute>
      } />
      <Route path="/admin/offers" element={
        <AdminRoute><AdminOffers /></AdminRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '120px', lineHeight: 1 }}>🌿</div>
          <h1 style={{ fontFamily: 'Noto Serif, serif', fontSize: 56, fontWeight: 700, color: '#193619' }}>404</h1>
          <p style={{ fontSize: 18, color: '#434840', maxWidth: 360 }}>We couldn't find what you were looking for. It may have moved or never existed.</p>
          <Link to="/" style={{ padding: '14px 32px', background: '#193619', color: 'white', borderRadius: 999, fontWeight: 600, fontSize: 15, display: 'inline-block', marginTop: 8 }}>
            Back to Home
          </Link>
        </div>
      } />
      </Routes>
    </Suspense>
  </>
);

export default App;
