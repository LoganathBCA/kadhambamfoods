// src/pages/admin/AdminOrders.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getOrders, updateOrderStatus, updateOrderTracking } from '../../services/orderService';
import toast from 'react-hot-toast';

const REFRESH_INTERVAL_SEC = 60;

const TRACKING_STEPS = ['Packed', 'Out for Delivery', 'Delivered'];

const TRACKING_ICONS = {
  Packed: 'inventory_2',
  'Out for Delivery': 'local_shipping',
  Delivered: 'check_circle',
};

// ── Hoisted sub-components (outside AdminOrders to prevent re-mount on every render) ──

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TrackingStepper = ({ order, trackingLoading, onTracking }) => {
  const currentIdx = TRACKING_STEPS.indexOf(order.tracking);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, width: '100%' }}>
      {TRACKING_STEPS.map((step, idx) => {
        const isDone = currentIdx >= idx;
        const isNext = idx === currentIdx + 1;
        const isLoading = trackingLoading[order.id] === step;
        return (
          <button
            key={step}
            onClick={() => isNext ? onTracking(order.id, step) : undefined}
            disabled={!isNext || isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 10,
              border: `1.5px solid ${isDone ? '#193619' : isNext ? '#2a5c2a' : 'var(--color-outline-variant)'}`,
              background: isDone
                ? 'linear-gradient(135deg, #2a5c2a, #193619)'
                : isNext
                  ? 'rgba(25,54,25,0.07)'
                  : 'transparent',
              color: isDone ? 'white' : isNext ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontSize: 12, fontWeight: 600,
              cursor: isNext ? 'pointer' : 'default',
              opacity: !isDone && !isNext ? 0.5 : 1,
              transition: 'all 150ms ease',
              textAlign: 'left',
            }}
            title={isNext ? `Click to mark as "${step}"` : isDone ? 'Completed' : 'Not yet'}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontFamily: 'Material Symbols Outlined',
                fontSize: 15,
                fontVariationSettings: isDone ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {isLoading ? 'progress_activity' : TRACKING_ICONS[step]}
            </span>
            {step}
            {isDone && !isLoading && (
              <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.85 }}>✓</span>
            )}
            {isNext && !isLoading && (
              <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}>Click</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const OrderActions = ({ order, cancelConfirm, onVerify, onCancel, onCancelDismiss, onWhatsApp }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    {order.status === 'Pending' && (
      <>
        <button
          className="admin-btn-verify"
          onClick={() => onVerify(order.id)}
          style={{ padding: '7px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
        >✓ Verify</button>
        {cancelConfirm === order.id ? (
          <>
            <button
              onClick={() => onCancel(order.id)}
              style={{ padding: '7px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', animation: 'modal-in 150ms ease' }}
            >Confirm Cancel?</button>
            <button
              onClick={onCancelDismiss}
              style={{ padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-variant)', color: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none' }}
            >No</button>
          </>
        ) : (
          <button
            className="admin-btn-cancel"
            onClick={() => onCancel(order.id)}
            style={{ padding: '7px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-container)', color: 'var(--color-error)', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
          >✗ Cancel</button>
        )}
      </>
    )}
    <button
      className="admin-btn-whatsapp"
      onClick={() => onWhatsApp(order)}
      style={{ padding: '7px 12px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #25d366, #1da851)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}
      title="Send WhatsApp message"
    >
      <WhatsAppIcon size={14} /> WhatsApp
    </button>
  </div>
);

const downloadCSV = (orders) => {
  const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 'UTR', 'UPI Txn ID (tr)', 'Status', 'Tracking', 'Date'];
  const rows = orders.map(o => [
    o.id,
    o.customerName || '',
    o.email || '',
    o.phone || '',
    o.address || '',
    (o.items || []).map(i => `${i.name}×${i.qty}(${i.weight})`).join('; '),
    o.total || 0,
    o.utr || '',
    o.upiTxnId || '',
    o.status || '',
    o.tracking || '',
    o.createdAt?.toDate ? o.createdAt.toDate().toISOString() : '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kadhambam_orders_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SEC);
  const [trackingLoading, setTrackingLoading] = useState({});
  const [cancelConfirm, setCancelConfirm] = useState(null); // orderId or null
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const load = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    getOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const startAutoRefresh = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    setCountdown(REFRESH_INTERVAL_SEC);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL_SEC : prev - 1));
    }, 1000);
    intervalRef.current = setInterval(() => {
      load(false);
      setCountdown(REFRESH_INTERVAL_SEC);
    }, REFRESH_INTERVAL_SEC * 1000);
  }, [load]);

  const handleManualRefresh = useCallback(() => {
    load(true);
    startAutoRefresh();
    toast.success('Orders refreshed');
  }, [load, startAutoRefresh]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    startAutoRefresh();
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [load, startAutoRefresh]);

  const handleVerify = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'Verified');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Verified', tracking: null } : o));
      toast.success('Order verified!');
    } catch {
      toast.error('Failed to verify order');
    }
  };

  const handleCancel = async (orderId) => {
    if (cancelConfirm !== orderId) { setCancelConfirm(orderId); return; }
    setCancelConfirm(null);
    try {
      await updateOrderStatus(orderId, 'Cancelled');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  const handleTracking = async (orderId, step) => {
    setTrackingLoading(prev => ({ ...prev, [orderId]: step }));
    try {
      await updateOrderTracking(orderId, step);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking: step } : o));
      toast.success(`Order marked as "${step}"`);
    } catch {
      toast.error('Failed to update tracking');
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleWhatsApp = (order) => {
    const digits = (order.phone || '').replace(/\D/g, '');
    // Prepend India country code if only 10 digits given
    const cleanPhone = digits.length === 10 ? '91' + digits : digits;
    const trackingMsg = order.tracking ? ` Current status: ${order.tracking}.` : '';
    const msg = `Hello ${order.customerName}, your payment verification is successful and your order (${order.id}) is prepared for delivery.${trackingMsg}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);


  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(17px, 3.5vw, 20px)', fontWeight: 700, color: 'var(--color-primary)' }}>Orders</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Auto-refresh countdown */}
            <div title="Auto-refreshes every 60 seconds" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-variant)', color: 'var(--color-on-surface-variant)', fontSize: 11, fontWeight: 600, border: '1px solid var(--color-outline-variant)', userSelect: 'none' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: countdown <= 10 ? 'var(--color-error, #e53935)' : 'var(--color-primary)', animation: 'pulse 1.4s infinite' }} />
              {countdown}s
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleManualRefresh} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 10px' }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15 }}>refresh</span>
              <span className="admin-btn-label">Refresh</span>
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => downloadCSV(orders)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 10px' }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15 }}>download</span>
              <span className="admin-btn-label">CSV</span>
            </button>
          </div>
        </div>

        <div className="admin-page-content">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all', 'Pending', 'Verified', 'Cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 600, border: '1.5px solid', borderColor: filter === f ? 'var(--color-primary)' : 'var(--color-outline-variant)', background: filter === f ? 'var(--color-primary)' : 'transparent', color: filter === f ? 'white' : 'var(--color-on-surface-variant)', cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
                {f === 'all' ? 'All' : f} <span style={{ fontWeight: 400, opacity: 0.8 }}>({f === 'all' ? orders.length : orders.filter(o => o.status === f).length})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-on-surface-variant)' }}>No orders found</div>
          ) : (
            <>
              {/* ── DESKTOP TABLE (hidden on mobile) ── */}
              <div className="admin-table-wrap orders-desktop-table" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 110 }}>Order ID</th><th>Customer</th><th style={{ width: 110 }}>Phone</th><th>Items</th>
                      <th style={{ width: 80 }}>Total</th><th style={{ width: 140 }}>UTR</th><th style={{ width: 90 }}>Date</th><th style={{ width: 90 }}>Status</th>
                      <th style={{ width: 200 }}>Tracking / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id}>
                        <td style={{ width: 110, maxWidth: 110 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span
                              title={order.id}
                              style={{
                                fontFamily: 'monospace', fontSize: 11,
                                display: 'block',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                maxWidth: 80,
                                color: 'var(--color-on-surface-variant)',
                              }}
                            >
                              {order.id}
                            </span>
                            <button
                              title="Copy Order ID"
                              onClick={() => { navigator.clipboard.writeText(order.id); toast.success('Order ID copied'); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13 }}>content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{order.customerName || '-'}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{order.email || ''}</p>
                        </td>
                        <td style={{ fontSize: 13 }}>{order.phone || '-'}</td>
                        <td style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', maxWidth: 160 }}>
                          {(order.items || []).map(i => `${i.name} ×${i.qty}`).join(', ')}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{order.total?.toLocaleString('en-IN') || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                          <div>{order.utr || '-'}</div>
                          {order.upiTxnId && (
                            <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 10, marginTop: 2 }} title="Merchant Reference (tr)">
                              tr: {order.upiTxnId}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 12 }}>{formatDate(order.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${order.status === 'Verified' ? 'status-verified' : order.status === 'Cancelled' ? 'status-cancelled' : 'status-pending'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ minWidth: 240 }}>
                          {order.status === 'Verified' ? (
                            <TrackingStepper
                              order={order}
                              trackingLoading={trackingLoading}
                              onTracking={handleTracking}
                            />
                          ) : order.status === 'Cancelled' ? (
                            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>—</span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>Verify first</span>
                          )}
                          <div style={{ marginTop: 8 }}>
                            <OrderActions
                              order={order}
                              cancelConfirm={cancelConfirm}
                              onVerify={handleVerify}
                              onCancel={handleCancel}
                              onCancelDismiss={() => setCancelConfirm(null)}
                              onWhatsApp={handleWhatsApp}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS (hidden on desktop) ── */}
              <div className="orders-mobile-cards">
                {filtered.map((order) => (
                  <div key={order.id} style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 16, border: '1px solid var(--color-outline-variant)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(61,43,31,0.06)' }}>
                    {/* Card header */}
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 'clamp(13px, 2.5vw, 14px)', color: 'var(--color-primary)', marginBottom: 2 }}>{order.customerName || 'Unknown'}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--color-on-surface-variant)', wordBreak: 'break-all' }}>{order.id}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 3 }}>📞 {order.phone || '-'} · {formatDate(order.createdAt)}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className={`status-badge ${order.status === 'Verified' ? 'status-verified' : order.status === 'Cancelled' ? 'status-cancelled' : 'status-pending'}`}>
                          {order.status}
                        </span>
                        <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16, color: 'var(--color-primary)', marginTop: 6 }}>
                          ₹{order.total?.toLocaleString('en-IN') || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Items + UTR */}
                    <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-outline-variant)', fontSize: 12 }}>
                      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>
                        {(order.items || []).map(i => `${i.name} ×${i.qty}`).join(', ')}
                      </p>
                      {order.utr && <p style={{ fontFamily: 'monospace', color: 'var(--color-secondary)', fontWeight: 600, margin: 0 }}>UTR: {order.utr}</p>}
                      {order.upiTxnId && <p style={{ fontFamily: 'monospace', color: 'var(--color-on-surface-variant)', fontSize: 11, marginTop: 3, marginBottom: 0 }}>tr: {order.upiTxnId}</p>}
                    </div>

                    {/* Tracking (verified only) */}
                    {order.status === 'Verified' && (
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-outline-variant)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>Tracking</p>
                        <TrackingStepper
                          order={order}
                          trackingLoading={trackingLoading}
                          onTracking={handleTracking}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ padding: '10px 14px' }}>
                      <OrderActions
                        order={order}
                        cancelConfirm={cancelConfirm}
                        onVerify={handleVerify}
                        onCancel={handleCancel}
                        onCancelDismiss={() => setCancelConfirm(null)}
                        onWhatsApp={handleWhatsApp}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .orders-desktop-table { display: none; }
        .orders-mobile-cards  { display: flex; flex-direction: column; gap: 14px; }
        @media (min-width: 900px) {
          .orders-desktop-table { display: block; }
          .orders-mobile-cards  { display: none; }
        }
        .admin-btn-label { display: none; }
        @media (min-width: 600px) {
          .admin-btn-label { display: inline; }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;

