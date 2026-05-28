// src/components/layout/MobileNav.jsx
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';


const MobileNav = () => {
  const { cartCount } = useCart();
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/shop', label: 'Shop', icon: 'storefront' },
    { to: '/cart', label: 'Cart', icon: 'shopping_bag', showBadge: true },
    { to: user ? '/account' : '/login', label: 'Account', icon: 'person' },
  ];

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
      {navItems.map(({ to, label, icon, end, showBadge }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) => `mobile-bottom-nav__item${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          {({ isActive }) => (
            <>
              <span style={{ position: 'relative', display: 'inline-flex', lineHeight: 1 }}>
                {icon === 'person' && user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Account'}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isActive ? '2px solid var(--color-primary)' : '2px solid transparent'
                    }}
                  />
                ) : (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontFamily: 'Material Symbols Outlined', fontSize: 24 }}
                  >
                    {icon}
                  </span>
                )}
                {showBadge && cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -8,
                    minWidth: 16, height: 16, borderRadius: '50%',
                    background: 'var(--color-secondary)', color: 'white',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                  }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
