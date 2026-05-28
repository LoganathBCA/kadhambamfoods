// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, pending: 0, cancelled: 0, products: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stats
    Promise.all([getOrders(), getProducts()])
      .then(([orders, products]) => {
        const pending = orders.filter(o => o.status === 'Pending').length;
        const cancelled = orders.filter(o => o.status === 'Cancelled').length;
        const revenue = orders
          .filter(o => o.status === 'Verified')
          .reduce((sum, o) => sum + (o.total || 0), 0);
        setStats({ orders: orders.length, pending, cancelled, products: products.length, revenue });
        setRecentOrders(orders.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.orders, icon: 'receipt_long', color: 'var(--color-primary)' },
    { label: 'Pending', value: stats.pending, icon: 'pending', color: 'var(--color-secondary)' },
    { label: 'Cancelled', value: stats.cancelled, icon: 'cancel', color: 'var(--color-error)' },
    { label: 'Products', value: stats.products, icon: 'inventory_2', color: 'var(--color-tertiary)' },
  ];

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 700, color: 'var(--color-primary)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="admin-page-content">
          {/* Stats */}
          <div className="stats-grid">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p className="stat-card__label">{s.label}</p>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: s.color, opacity: 0.7 }}>{s.icon}</span>
                </div>
                <p className="stat-card__value" style={{ color: s.color }}>
                  {loading ? '-' : s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue card */}
          <div className="admin-revenue-card" style={{
            background: 'var(--color-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(14px, 3vw, 28px) clamp(14px, 4vw, 32px)',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.75, marginBottom: 4 }}>
                Verified Revenue
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 700 }}>
                {loading ? '-' : `₹${stats.revenue.toLocaleString('en-IN')}`}
              </p>
            </div>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 'clamp(32px, 8vw, 48px)', opacity: 0.3 }}>payments</span>
          </div>

          {/* Recent orders */}
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 'clamp(10px, 2vw, 16px)' }}>
            Recent Orders
          </h2>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', padding: 32 }}>No orders yet</td></tr>
                  ) : recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.id.slice(0, 12)}…</td>
                      <td>{order.customerName || '-'}</td>
                      <td style={{ fontWeight: 600 }}>₹{order.total?.toLocaleString('en-IN')}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${order.status === 'Verified' ? 'status-verified' : 'status-pending'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
