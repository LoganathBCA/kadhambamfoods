// src/components/layout/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { signOut } from '../../firebase/auth';

import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const NAV_ITEMS = [
  { label: 'Home',    to: '/',        end: true },
  { label: 'Shop',    to: '/shop',    end: false },
  { label: 'About',   to: '/about',   end: false },
  { label: 'Contact', to: '/contact', end: false },
];

const Header = () => {
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled,        setScrolled]        = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [accountOpen,     setAccountOpen]     = useState(false);

  const accountRef     = useRef(null);
  const mobileCloseRef = useRef(null);
  const accountBtnRef  = useRef(null);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawers on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape key — for both dropdowns and mobile menu
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (accountOpen)    { setAccountOpen(false);    accountBtnRef.current?.focus(); }
        if (mobileMenuOpen) { setMobileMenuOpen(false); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [accountOpen, mobileMenuOpen]);

  // Trap focus in mobile menu when open
  useEffect(() => {
    if (mobileMenuOpen && mobileCloseRef.current) mobileCloseRef.current.focus();
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Sign out failed — please try again');
    }
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}`} role="banner">
        <div className="header__inner">

          {/* ── Logo ── */}
          <Link to="/" className="header__logo" aria-label="Kadhambam — go to homepage">
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              style={{ height: 52, width: 52, objectFit: 'contain', borderRadius: '50%' }}
            />
            <span className="header__logo-text" aria-hidden="true">Kadhambam</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            className="header__nav"
            aria-label="Primary navigation"
            style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {NAV_ITEMS.map(({ label, to, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  position: 'relative',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  textDecoration: 'none',
                  paddingBottom: 4,
                  transition: 'color 150ms ease',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                })}
                aria-current={undefined}  /* NavLink sets this automatically — do NOT override */
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute', bottom: -4, left: 0, right: 0,
                        height: 2,
                        background: 'var(--color-primary)',
                        borderRadius: 99,
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 250ms ease',
                        transformOrigin: 'left',
                      }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="header__actions">

            {/* Cart */}
            <button
              className="header__icon-btn"
              onClick={() => navigate('/cart')}
              aria-label={cartCount > 0 ? `Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : 'Cart, empty'}
              style={{ position: 'relative' }}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>shopping_cart</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>

            {/* Account (desktop) */}
            {user ? (
              <div ref={accountRef} className="hidden-mobile" style={{ position: 'relative' }}>
                <button
                  ref={accountBtnRef}
                  id="account-menu-toggle"
                  className="header__icon-btn profile-avatar-btn"
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-label={`Account menu for ${user.displayName || user.email}`}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls="account-dropdown"
                  style={{ padding: 0, background: 'none', border: 'none' }}
                >
                  <div className="profile-avatar-circle" style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2a5c2a, #193619)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: (accountOpen || location.pathname === '/account')
                      ? '0 0 0 3px rgba(25,54,25,0.30), 0 2px 8px rgba(25,54,25,0.35)'
                      : '0 0 0 2px rgba(25,54,25,0.20), 0 2px 6px rgba(25,54,25,0.20)',
                    transition: 'box-shadow 150ms ease, transform 150ms ease',
                    flexShrink: 0,
                  }}>
                    {(user.displayName || user.email) ? (
                      <span style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'white',
                        lineHeight: 1,
                        fontFamily: 'var(--font-sans)',
                        userSelect: 'none',
                      }}>
                        {(user.displayName || user.email).charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined" aria-hidden="true" style={{
                        fontFamily: 'Material Symbols Outlined',
                        fontSize: 22,
                        color: 'white',
                        fontVariationSettings: "'FILL' 1",
                        lineHeight: 1,
                      }}>person</span>
                    )}
                  </div>
                </button>

                {accountOpen && (
                  <div
                    id="account-dropdown"
                    role="menu"
                    aria-labelledby="account-menu-toggle"
                    style={{
                      position: 'absolute', right: 0, top: '110%', width: 210,
                      background: 'var(--color-surface-container-lowest)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-modal)',
                      zIndex: 200,
                      overflow: 'hidden',
                      animation: 'modal-in 150ms ease',
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-outline-variant)' }} aria-hidden="true">
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-on-surface)' }}>
                        {user.displayName || user.email}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      role="menuitem"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 14, color: 'var(--color-on-surface)', transition: 'background 150ms', textDecoration: 'none' }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--color-primary)' }}>receipt_long</span>
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className="account-menu-item"
                        onClick={() => setAccountOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, transition: 'background 150ms', textDecoration: 'none' }}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>admin_panel_settings</span>
                        Admin Panel
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      className="account-menu-item account-menu-item--danger"
                      onClick={handleSignOut}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--color-error)', textAlign: 'left', transition: 'background 150ms', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="header__icon-btn hidden-mobile"
                aria-label="Sign in to your account"
                onClick={() => navigate('/login')}
                style={{
                  color: 'var(--color-primary)',
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{
                  fontFamily: 'Material Symbols Outlined',
                  fontSize: 22,
                  fontVariationSettings: location.pathname === '/login' ? "'FILL' 1" : "'FILL' 0",
                }}>person</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              className="header__icon-btn header__hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-panel"
              aria-haspopup="dialog"
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu open"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          id="mobile-menu-panel"
        >
          {/* Overlay — keyboard-closable via Escape (handled in useEffect) */}
          <div
            className="mobile-menu__overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-menu__panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
                Kadhambam
              </span>
              <button
                ref={mobileCloseRef}
                className="header__icon-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined' }}>close</span>
              </button>
            </div>

            <nav className="mobile-menu__nav" aria-label="Mobile navigation">
              {NAV_ITEMS.map(({ label, to, end }) => (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: 17, fontWeight: isActive ? 700 : 500, padding: '12px 0',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    transition: 'color 150ms ease',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: 17, fontWeight: isActive ? 700 : 500, padding: '12px 0',
                    color: 'var(--color-primary)', textDecoration: 'none',
                    borderBottom: '1px solid var(--color-outline-variant)',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      Admin Panel
                      {isActive && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                    </>
                  )}
                </NavLink>
              )}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              {user ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px rgba(25,54,25,0.15)', flexShrink: 0 }}>
                      {(user.displayName || user.email) ? (
                        <span style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1, fontFamily: 'var(--font-sans)', userSelect: 'none' }}>
                          {(user.displayName || user.email).charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 24, color: 'white', fontVariationSettings: "'FILL' 1" }}>person</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-on-surface)' }}>{user.displayName || 'My Account'}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-outline"
                    style={{ width: '100%', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>receipt_long</span>
                    My Orders
                  </Link>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                    onClick={handleSignOut}
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
