// src/pages/AccountPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUser } from '../services/orderService';
import { signOut } from '../firebase/auth';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

// ── Tracking pipeline ──────────────────────────────────────────────────────────
const TRACKING_PIPELINE = [
  { key: 'Pending',          label: 'Order Placed',     icon: 'receipt_long',    desc: 'Your order has been placed and is awaiting payment verification.' },
  { key: 'Verified',         label: 'Payment Verified', icon: 'verified',        desc: 'Payment confirmed! Your order is being prepared.' },
  { key: 'Packed',           label: 'Packed',           icon: 'inventory_2',     desc: 'Your order has been carefully packed and is ready to ship.' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: 'local_shipping',  desc: 'Your order is on the way to you!' },
  { key: 'Delivered',        label: 'Delivered',        icon: 'check_circle',    desc: 'Your order has been delivered. Enjoy!' },
];

const getStepIndex = (order) => {
  if (order.status === 'Cancelled') return -1;
  if (order.tracking === 'Delivered')        return 4;
  if (order.tracking === 'Out for Delivery') return 3;
  if (order.tracking === 'Packed')           return 2;
  if (order.status === 'Verified')           return 1;
  return 0; // Pending
};

const STATUS_BADGE = {
  Pending:   { cls: 'status-pending',   label: 'Pending' },
  Verified:  { cls: 'status-verified',  label: 'Verified' },
  Cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
};

// ── Order Tracking Stepper ─────────────────────────────────────────────────────
const TrackingStepper = ({ order }) => {
  if (order.status === 'Cancelled') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px',
        background: 'rgba(186,26,26,0.06)',
        borderRadius: 12,
        border: '1px solid rgba(186,26,26,0.15)',
      }}>
        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: '#ba1a1a', fontVariationSettings: "'FILL' 1" }}>
          cancel
        </span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#ba1a1a' }}>Order Cancelled</p>
          <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
            This order was cancelled. Contact us if you have questions.
          </p>
        </div>
      </div>
    );
  }

  const activeIdx = getStepIndex(order);

  return (
    <div style={{ padding: '16px 0 8px' }}>
      {/* Mobile: vertical */}
      <div className="tracking-stepper">
        {TRACKING_PIPELINE.map((step, idx) => {
          const done = idx <= activeIdx;
          const active = idx === activeIdx;
          return (
            <div key={step.key} className="tracking-step">
              {/* Connector line above (except first) */}
              {idx > 0 && (
                <div className="tracking-connector" style={{
                  background: idx <= activeIdx ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Icon circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done
                    ? 'linear-gradient(135deg, #2a5c2a, #193619)'
                    : 'var(--color-surface-container)',
                  border: `2px solid ${done ? '#193619' : active ? '#2a5c2a' : 'var(--color-outline-variant)'}`,
                  boxShadow: active ? '0 0 0 3px rgba(25,54,25,0.15)' : 'none',
                  transition: 'all 250ms ease',
                }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontFamily: 'Material Symbols Outlined',
                      fontSize: 18,
                      color: done ? 'white' : 'var(--color-on-surface-variant)',
                      fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {step.icon}
                  </span>
                </div>
                {/* Text */}
                <div style={{ paddingTop: 4 }}>
                  <p style={{
                    fontSize: 13, fontWeight: active ? 700 : done ? 600 : 500,
                    color: done ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                    marginBottom: 2,
                  }}>
                    {step.label}
                    {active && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, padding: '2px 8px',
                        background: 'rgba(25,54,25,0.1)', borderRadius: 99,
                        color: 'var(--color-primary)', fontWeight: 700, verticalAlign: 'middle',
                      }}>
                        Current
                      </span>
                    )}
                  </p>
                  {active && (
                    <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const AccountPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [expandedTracking, setExpandedTracking] = useState({});

  const loadOrders = useCallback(() => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    setFetchError(false);
    getOrdersByUser(user.uid)
      .then((data) => { setOrders(data); })
      .catch((err) => {
        console.error('[AccountPage] Failed to load orders:', err);
        setFetchError(true);
        toast.error('Could not load your orders. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const toggleTracking = (orderId) => {
    setExpandedTracking(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getTrackingLabel = (order) => {
    if (order.status === 'Cancelled') return 'Cancelled';
    if (order.tracking) return order.tracking;
    if (order.status === 'Verified') return 'Verified';
    return 'Pending';
  };

  const filteredOrders = orders.filter(o => orderFilter === 'all' || o.status === orderFilter);

  return (
    <div className="page-body-pad">
      <Helmet>
        <title>My Account & Orders – Kadhambam Dry Fruits</title>
        <meta name="description" content="View your order history, track deliveries, and manage your Kadhambam account." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Header />
      <main id="main-content" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-10) var(--margin-mobile)' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, flexWrap: 'wrap', rowGap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-primary-fixed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 36, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>person</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || 'My Account'}
            </h1>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
          <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        {/* Orders header + filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
            My Orders
          </h2>
          {orders.length > 0 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              {['all', 'Pending', 'Verified', 'Cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  style={{
                    padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: '1.5px solid',
                    borderColor: orderFilter === f ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    background: orderFilter === f ? 'var(--color-primary)' : 'transparent',
                    color: orderFilter === f ? 'white' : 'var(--color-on-surface-variant)',
                    cursor: 'pointer', transition: 'all 150ms',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : fetchError ? (
          <div className="empty-state" style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(186,26,26,0.12)', padding: 48 }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 48, color: '#ba1a1a' }}>error_outline</span>
            <p style={{ color: '#ba1a1a', fontWeight: 600 }}>Failed to load orders</p>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>There was a problem fetching your orders. Please try again.</p>
            <button className="btn btn-primary btn-sm" onClick={loadOrders}>
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-outline-variant)', padding: 48 }}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 48, color: 'var(--color-outline)' }}>receipt_long</span>
            <p>You haven't placed any orders yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/shop')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredOrders.map((order) => {
              const badge = STATUS_BADGE[order.status] || STATUS_BADGE.Pending;
              const trackingOpen = expandedTracking[order.id];
              const trackingLabel = getTrackingLabel(order);
              return (
                <div key={order.id} style={{
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-outline-variant)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(61,43,31,0.06)',
                }}>
                  {/* Order header */}
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-outline-variant)' }}>
                    {/* Top row: status badge + date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className={`status-badge ${badge.cls}`}>{badge.label}</span>
                        {order.tracking && order.status !== 'Cancelled' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 11, fontWeight: 700,
                            color: trackingLabel === 'Delivered' ? '#2a5c2a' : 'var(--color-secondary)',
                            background: trackingLabel === 'Delivered' ? 'rgba(25,54,25,0.08)' : 'rgba(125,87,0,0.08)',
                            padding: '3px 10px', borderRadius: 99,
                          }}>
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13, fontVariationSettings: "'FILL' 1" }}>
                              {trackingLabel === 'Delivered' ? 'check_circle' : trackingLabel === 'Out for Delivery' ? 'local_shipping' : 'inventory_2'}
                            </span>
                            {trackingLabel}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>{formatDate(order.createdAt)}</p>
                    </div>
                    {/* Order ID + UTR details — word-break so monospace IDs wrap on narrow screens */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Order ID</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-primary)', wordBreak: 'break-all' }}>{order.id}</span>
                      </div>
                      {order.utr && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontWeight: 600, flexShrink: 0 }}>UTR</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface)', wordBreak: 'break-all' }}>{order.utr}</span>
                        </div>
                      )}
                      {order.upiTxnId && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontWeight: 600, flexShrink: 0 }}>Ref</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-on-surface-variant)', wordBreak: 'break-all' }}>{order.upiTxnId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '14px 20px' }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: i < (order.items.length - 1) ? '1px solid var(--color-outline-variant)' : 'none', marginBottom: i < (order.items.length - 1) ? 10 : 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-surface-container)', overflow: 'hidden', flexShrink: 0 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{item.weight} × {item.qty}</p>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)', flexShrink: 0 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--color-outline-variant)' }}>
                      <span style={{ fontWeight: 700 }}>Order Total</span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-primary)', fontSize: 18 }}>
                        ₹{order.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Track Order toggle button */}
                  {order.status !== 'Cancelled' && (
                    <div style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
                      <button
                        onClick={() => toggleTracking(order.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '13px 20px', background: trackingOpen ? 'rgba(25,54,25,0.04)' : 'transparent',
                          border: 'none', cursor: 'pointer', transition: 'background 150ms',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                            local_shipping
                          </span>
                          Track Order
                        </span>
                        <span className="material-symbols-outlined" style={{
                          fontFamily: 'Material Symbols Outlined', fontSize: 20, color: 'var(--color-primary)',
                          transform: trackingOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 250ms ease',
                        }}>
                          expand_more
                        </span>
                      </button>

                      {trackingOpen && (
                        <div style={{ padding: '0 20px 20px' }}>
                          <TrackingStepper order={order} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No {orderFilter === 'all' ? '' : orderFilter} orders found.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      <MobileNav />

      <style>{`
        .tracking-stepper {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .tracking-step {
          position: relative;
          padding-left: 0;
          display: flex;
          flex-direction: column;
        }
        .tracking-connector {
          width: 2px;
          height: 20px;
          margin-left: 17px;
          margin-bottom: 4px;
          border-radius: 2px;
          transition: background 300ms ease;
        }
      `}</style>
    </div>
  );
};

export default AccountPage;
