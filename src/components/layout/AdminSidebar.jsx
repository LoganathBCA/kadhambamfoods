// src/components/layout/AdminSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../../firebase/auth';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',            label: 'Dashboard', icon: 'dashboard',       end: true  },
  { to: '/admin/orders',     label: 'Orders',    icon: 'receipt_long',    end: false },
  { to: '/admin/products',   label: 'Products',  icon: 'inventory_2',     end: false },
  { to: '/admin/categories', label: 'Categories',icon: 'category',        end: false },
  { to: '/admin/offers',     label: 'Offers',    icon: 'campaign',        end: false },
];

const AdminSidebar = () => {
  const navigate  = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };



  return (
    <>
      {/* ════════════════════════════════════════════
          DESKTOP SIDEBAR (≥ 900px)
      ════════════════════════════════════════════ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          Kadhambam
          <br />
          <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Admin Panel</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="material-symbols-outlined"
                style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 12px' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>storefront</span>
            View Store
          </NavLink>
          <button onClick={handleSignOut}
            className="admin-sidebar-signout"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 14, color: 'rgba(255,255,255,0.6)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          MOBILE TOP BAR (< 900px)
      ════════════════════════════════════════════ */}
      <div className="admin-mobile-topbar">
        {/* Brand + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-primary)' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'white' }}>
            Kadhambam <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Admin</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NavLink to="/"
              style={{ display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8, color: 'rgba(255,255,255,0.7)' }}
              title="View Store"
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>storefront</span>
            </NavLink>
            <button onClick={handleSignOut}
              style={{ display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Sign Out"
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>logout</span>
            </button>
          </div>
        </div>

        {/* Nav tab strip */}
        <nav style={{
          display: 'flex',
          background: 'var(--color-primary)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          overflowX: 'auto',
          gap: 0,
          padding: '0 6px 6px',
        }} className="scrollbar-hide">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                flex: '1 0 auto',
                minWidth: 56,
              })}
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined"
                    style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {n.icon}
                  </span>
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
