// src/pages/admin/AdminOffers.jsx
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getOfferBar, saveOfferBar, OFFER_BAR_DEFAULT } from '../../services/offerBarService';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  { bg: '#193619', text: '#ffffff', label: 'Forest' },
  { bg: '#7d5700', text: '#ffffff', label: 'Amber' },
  { bg: '#ba1a1a', text: '#ffffff', label: 'Red' },
  { bg: '#1a5276', text: '#ffffff', label: 'Ocean' },
  { bg: '#4a235a', text: '#ffffff', label: 'Purple' },
  { bg: '#f5f5f0', text: '#193619', label: 'Cream' },
];

const AdminOffers = () => {
  const [settings, setSettings] = useState({ ...OFFER_BAR_DEFAULT });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    // getOfferBar never rejects — always resolves with data or defaults
    getOfferBar()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);


  const handleSave = async () => {
    setSaving(true);
    try {
      await saveOfferBar(settings);
      toast.success('Offer bar saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    const val = newItem.trim();
    if (!val) return;
    setSettings(s => ({ ...s, items: [...s.items, val] }));
    setNewItem('');
  };

  const handleDeleteItem = (i) => {
    setSettings(s => ({ ...s, items: s.items.filter((_, idx) => idx !== i) }));
  };

  const handleMoveUp = (i) => {
    if (i === 0) return;
    const items = [...settings.items];
    [items[i - 1], items[i]] = [items[i], items[i - 1]];
    setSettings(s => ({ ...s, items }));
  };

  const handleMoveDown = (i) => {
    if (i === settings.items.length - 1) return;
    const items = [...settings.items];
    [items[i], items[i + 1]] = [items[i + 1], items[i]];
    setSettings(s => ({ ...s, items }));
  };

  const startEdit = (i) => {
    setEditIndex(i);
    setEditValue(settings.items[i]);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    const items = [...settings.items];
    items[editIndex] = editValue.trim() || items[editIndex];
    setSettings(s => ({ ...s, items }));
    setEditIndex(null);
    setEditValue('');
  };

  /* ── Live preview ── */
  const preview = settings.items.length > 0
    ? [...settings.items, ...settings.items].join('  •  ')
    : 'No offer items yet — add some below';

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">

        {/* Page header */}
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 700, color: 'var(--color-primary)' }}>
              Offer Bar
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
              Scrolling announcement bar shown on Home & Shop pages
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>
              {saving ? 'progress_activity' : 'save'}
            </span>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner" style={{ marginTop: 80 }}><div className="spinner" /></div>
        ) : (
          <div className="admin-page-content">

            {/* ── Enable Toggle Card ── */}
            <div style={{
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)',
              marginBottom: 'clamp(14px, 2.5vw, 20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-on-surface)', marginBottom: 3 }}>
                  Offer Bar Status
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                  {settings.enabled ? '✅ Currently LIVE on website' : '⏸ Hidden from website'}
                </p>
              </div>
              {/* Toggle switch */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: settings.enabled ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
                  {settings.enabled ? 'ON' : 'OFF'}
                </span>
                <div
                  onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
                  style={{
                    width: 52,
                    height: 28,
                    borderRadius: 14,
                    background: settings.enabled ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 200ms ease',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 3,
                    left: settings.enabled ? 27 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    transition: 'left 200ms ease',
                  }} />
                </div>
              </label>
            </div>

            {/* ── Live Preview ── */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
                Live Preview
              </p>
              <div style={{
                background: settings.bgColor,
                color: settings.textColor,
                borderRadius: 12,
                padding: '10px 20px',
                overflow: 'hidden',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                border: '1px solid rgba(0,0,0,0.08)',
                opacity: settings.enabled ? 1 : 0.5,
                transition: 'all 200ms ease',
              }}>
                {preview}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="offer-admin-grid">

              {/* ── Color Theme Card ── */}
              <div style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-outline-variant)',
                padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)',
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16 }}>
                  Bar Color Theme
                </h3>
                {/* Presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px, 1.5vw, 10px)', marginBottom: 'clamp(14px, 3vw, 20px)' }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.label}
                      onClick={() => setSettings(s => ({ ...s, bgColor: c.bg, textColor: c.text }))}
                      title={c.label}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: c.bg,
                        border: settings.bgColor === c.bg ? '3px solid var(--color-primary)' : '2px solid var(--color-outline-variant)',
                        cursor: 'pointer',
                        transition: 'transform 120ms ease, border 120ms ease',
                        transform: settings.bgColor === c.bg ? 'scale(1.15)' : 'scale(1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 700, color: c.text, letterSpacing: '0.02em' }}>{c.label[0]}</span>
                    </button>
                  ))}
                </div>
                {/* Custom */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ margin: 0, flex: '1 1 140px' }}>
                    <label className="label">Background Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="color" value={settings.bgColor}
                        onChange={e => setSettings(s => ({ ...s, bgColor: e.target.value }))}
                        style={{ width: 40, height: 36, padding: 2, border: '1.5px solid var(--color-outline-variant)', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                      />
                      <input className="input" value={settings.bgColor}
                        onChange={e => setSettings(s => ({ ...s, bgColor: e.target.value }))}
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0, flex: '1 1 140px' }}>
                    <label className="label">Text Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="color" value={settings.textColor}
                        onChange={e => setSettings(s => ({ ...s, textColor: e.target.value }))}
                        style={{ width: 40, height: 36, padding: 2, border: '1.5px solid var(--color-outline-variant)', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                      />
                      <input className="input" value={settings.textColor}
                        onChange={e => setSettings(s => ({ ...s, textColor: e.target.value }))}
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Offer Items Card ── */}
              <div style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-outline-variant)',
                padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)',
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>
                  Offer Messages
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
                  Messages scroll one after another. Drag to reorder.
                </p>

                {/* Item list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {settings.items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--color-on-surface-variant)', fontSize: 14, background: 'var(--color-surface-container)', borderRadius: 12 }}>
                      No offer messages yet. Add one below.
                    </div>
                  ) : settings.items.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'var(--color-surface-container)',
                      borderRadius: 12, padding: '10px 12px',
                      border: '1px solid var(--color-outline-variant)',
                      transition: 'box-shadow 150ms ease',
                    }}>
                      {/* Reorder arrows */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                        <button onClick={() => handleMoveUp(i)} disabled={i === 0}
                          style={{ opacity: i === 0 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>arrow_upward</span>
                        </button>
                        <button onClick={() => handleMoveDown(i)} disabled={i === settings.items.length - 1}
                          style={{ opacity: i === settings.items.length - 1 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>arrow_downward</span>
                        </button>
                      </div>

                      {/* Text / edit field */}
                      {editIndex === i ? (
                        <input
                          autoFocus
                          className="input"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditIndex(null); }}
                          style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
                        />
                      ) : (
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.5 }}>{item}</span>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {editIndex === i ? (
                          <button className="btn btn-primary btn-xs" onClick={saveEdit}>
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>check</span>
                          </button>
                        ) : (
                          <button className="btn btn-outline btn-xs" onClick={() => startEdit(i)} title="Edit">
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>edit</span>
                          </button>
                        )}
                        <button className="btn btn-danger btn-xs" onClick={() => handleDeleteItem(i)} title="Delete">
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new item */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="label" htmlFor="new-offer-item">New Offer Message</label>
                    <input
                      id="new-offer-item"
                      className="input"
                      placeholder="🎉 Free delivery on orders above ₹499!"
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddItem}
                    disabled={!newItem.trim()}
                    style={{ flexShrink: 0, marginBottom: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>add</span>
                    Add
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 6 }}>
                  Tip: Use emojis to make messages eye-catching. Press Enter to add quickly.
                </p>
              </div>
            </div>

            {/* Save button (bottom) */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSave}
                disabled={saving}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>
                  {saving ? 'progress_activity' : 'save'}
                </span>
                {saving ? 'Saving…' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}

        <style>{`
          @media (min-width: 700px) {
            .offer-admin-grid {
              grid-template-columns: 1fr 1.4fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminOffers;
