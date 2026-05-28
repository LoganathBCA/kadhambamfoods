// src/pages/admin/AdminCategories.jsx
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import toast from 'react-hot-toast';

const EMPTY = { name: '', icon: '', pricingType: 'measurement' };

/** Derive a URL-safe slug from any string */
const toSlug = (str) =>
  str.trim().toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Common Material Symbol names for categories
const ICON_SUGGESTIONS = [
  'eco', 'spa', 'grass', 'local_florist', 'forest',
  'restaurant', 'nutrition', 'grain', 'bakery_dining',
  'category', 'inventory_2', 'shopping_basket',
  'favorite', 'star', 'verified', 'bolt',
];

const TYPE_INFO = {
  measurement: {
    label: 'Measurement',
    desc:  'Products sold by weight only (250g, 500g, 1kg)',
    icon:  'scale',
    color: '#1d6b3a',
    bg:    'rgba(29,107,58,0.08)',
    border:'rgba(29,107,58,0.3)',
  },
  both: {
    label: 'Weight + Count',
    desc:  'Products sold by weight AND count (e.g. 500g / 6 pcs)',
    icon:  'join_inner',
    color: '#0b5394',
    bg:    'rgba(11,83,148,0.08)',
    border:'rgba(11,83,148,0.3)',
  },
  enquiry: {
    label: 'Enquiry Only',
    desc:  'Display only — customers contact you to buy (no Add to Cart)',
    icon:  'contact_support',
    color: '#6b21a8',
    bg:    'rgba(107,33,168,0.08)',
    border:'rgba(107,33,168,0.3)',
  },
};

const AdminCategories = () => {
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(false);
  const [form,          setForm]          = useState(EMPTY);
  const [editing,       setEditing]       = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errors,        setErrors]        = useState({});

  const load = () => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setErrors({});
    setModal(true);
  };

  const openEdit = (c) => {
    setForm({
      name:        c.name        ?? '',
      icon:        c.icon        ?? '',
      pricingType: c.pricingType ?? 'measurement',
    });
    setEditing(c.id);
    setErrors({});
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setErrors({});
  };

  // Live slug derived from name
  const liveSlug = toSlug(form.name);

  // Slug collision check (excluding current item when editing)
  const slugCollision = liveSlug
    ? categories.find(c => c.slug === liveSlug && c.id !== editing)
    : null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    if (slugCollision)     e.name = `Slug "${liveSlug}" is already used by "${slugCollision.name}". Use a different name.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        icon:        form.icon.trim(),
        pricingType: form.pricingType,
        slug:        liveSlug,
      };

      if (editing) {
        await updateCategory(editing, payload);
        toast.success('Category updated!');
      } else {
        await addCategory(payload);
        toast.success('Category added!');
      }
      load();
      closeModal();
    } catch {
      toast.error('Save failed — please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCategory(deleteConfirm.id);
      setCategories(prev => prev.filter(c => c.id !== deleteConfirm.id));
      toast.success('Category deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">

        {/* ── Topbar ── */}
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 700, color: 'var(--color-primary)' }}>
              Categories
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 17 }}>add</span>
            Add Category
          </button>
        </div>

        {/* ── Content ── */}
        <div className="admin-page-content">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 56, color: 'var(--color-outline)' }}>category</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>No categories yet</p>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>Categories appear as filter pills on the Shop page.</p>
              <button className="btn btn-primary btn-sm" onClick={openAdd}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>add</span>
                Add First Category
              </button>
            </div>
          ) : (
            <>
              {/* Type legend */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 'clamp(14px, 3vw, 20px)', flexWrap: 'wrap' }}>
                {Object.entries(TYPE_INFO).map(([key, t]) => (
                  <div key={key} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    background: t.bg, border: `1px solid ${t.border}`,
                    borderRadius: 10, fontSize: 12, fontWeight: 600, color: t.color,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15, fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                    <span>{t.label}</span>
                    <span style={{ fontWeight: 400, opacity: 0.8 }}>— {t.desc}</span>
                  </div>
                ))}
              </div>

              {/* Category cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 'clamp(10px, 2vw, 16px)' }}>
                {categories.map((cat, i) => {
                  const t = TYPE_INFO[cat.pricingType] || TYPE_INFO.measurement;
                  return (
                    <div key={cat.id} style={{
                      background: 'var(--color-surface-container-lowest)',
                      borderRadius: 20,
                      border: '1px solid rgba(195,200,190,0.4)',
                      padding: 'clamp(14px, 3vw, 18px)',
                      display: 'flex', flexDirection: 'column', gap: 14,
                      boxShadow: '0 2px 10px rgba(61,43,31,0.05)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Icon preview */}
                        <div style={{
                          width: 50, height: 50, borderRadius: 14,
                          background: `hsl(${(i * 47) % 360}, 30%, 92%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span className="material-symbols-outlined" style={{
                            fontFamily: 'Material Symbols Outlined',
                            fontSize: 26,
                            color: `hsl(${(i * 47) % 360}, 45%, 35%)`,
                            fontVariationSettings: "'FILL' 1",
                          }}>
                            {cat.icon || 'category'}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-on-surface)', marginBottom: 3 }}>{cat.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontFamily: 'monospace', background: 'var(--color-surface-container)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                            /{cat.slug}
                          </p>
                        </div>
                      </div>

                      {/* Pricing type badge */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px',
                        background: t.bg, border: `1px solid ${t.border}`,
                        borderRadius: 8, fontSize: 12, fontWeight: 700, color: t.color,
                        alignSelf: 'flex-start',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                        {t.label}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(cat)} className="btn btn-outline btn-xs" style={{ flex: 1 }}>
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: cat.id, name: cat.name })}
                          className="btn btn-xs"
                          style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', border: 'none' }}
                          aria-label={`Delete category ${cat.name}`}
                        >
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editing ? 'Edit category' : 'Add category'} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-box" style={{ maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2a5c2a, #193619)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'white' }}>category</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>
                  {editing ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>
              <button className="header__icon-btn" onClick={closeModal} aria-label="Close modal">
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined' }}>close</span>
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSave} noValidate style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Category Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="cat-name">
                  Category Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="cat-name"
                  className={`input${errors.name ? ' input-error' : ''}`}
                  value={form.name}
                  onChange={e => {
                    setForm(f => ({ ...f, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Nuts & Seeds"
                  autoFocus
                />
                {errors.name && (
                  <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>error</span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* URL Slug — read-only, auto-generated */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">
                  URL Slug
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)', marginLeft: 6 }}>auto-generated · read-only</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--color-outline)', fontFamily: 'monospace' }}>/</span>
                  <div style={{
                    paddingLeft: 22, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                    borderRadius: 10, border: `1.5px solid ${slugCollision ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
                    background: 'var(--color-surface-container)',
                    fontFamily: 'monospace', fontSize: 14,
                    color: liveSlug ? 'var(--color-on-surface)' : 'var(--color-outline)',
                    minHeight: 42, display: 'flex', alignItems: 'center',
                    userSelect: 'none',
                  }}>
                    {liveSlug || <span style={{ opacity: 0.5 }}>will appear here…</span>}
                  </div>
                </div>
                {slugCollision && !errors.name && (
                  <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>error</span>
                    This slug is already taken by "{slugCollision.name}" — change the name
                  </p>
                )}
              </div>

              {/* Pricing Type */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" style={{ marginBottom: 10 }}>
                  Pricing Type <span style={{ color: 'var(--color-error)' }}>*</span>
                  {editing && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)', marginLeft: 6 }}>
                      (cannot be changed after creation)
                    </span>
                  )}
                </label>
                {/* Stacked on mobile (1-col), 3-col on wider screens */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {Object.entries(TYPE_INFO).map(([key, t]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={!!editing}
                      onClick={() => setForm(f => ({ ...f, pricingType: key }))}
                      aria-pressed={form.pricingType === key}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 14,
                        border: `2px solid ${form.pricingType === key ? t.color : 'var(--color-outline-variant)'}`,
                        background: form.pricingType === key ? t.bg : 'transparent',
                        cursor: editing ? 'default' : 'pointer',
                        opacity: editing && form.pricingType !== key ? 0.45 : 1,
                        transition: 'all 150ms ease',
                        display: 'flex', flexDirection: 'column', gap: 5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-symbols-outlined" style={{
                          fontFamily: 'Material Symbols Outlined', fontSize: 18,
                          color: form.pricingType === key ? t.color : 'var(--color-on-surface-variant)',
                          fontVariationSettings: "'FILL' 1",
                        }}>{t.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: form.pricingType === key ? t.color : 'var(--color-on-surface)' }}>
                          {t.label}
                        </span>
                        {form.pricingType === key && (
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, color: t.color, marginLeft: 'auto', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', lineHeight: 1.4, margin: 0 }}>{t.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Info hint based on selection */}
                <div style={{
                  marginTop: 10, padding: '10px 14px',
                  background: 'var(--color-surface-container)',
                  borderRadius: 10, fontSize: 12,
                  color: 'var(--color-on-surface-variant)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15, flexShrink: 0, marginTop: 1 }}>info</span>
                  <span>
                    {form.pricingType === 'measurement'
                      ? 'Customers will select: 250g · 500g · 1kg. Prices auto-calculated from base price.'
                      : form.pricingType === 'both'
                      ? 'Customers will select: 250g/3pcs · 500g/6pcs · 1kg/12pcs. Prices auto-calculated from base price.'
                      : "Product is shown for browsing only. Customers click 'Contact Us' to enquire. No Add to Cart button shown."
                    }
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="cat-icon">Icon (Material Symbol name)</label>
                <div style={{ position: 'relative' }}>
                  {form.icon && (
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>
                      {form.icon}
                    </span>
                  )}
                  <input
                    id="cat-icon"
                    className="input"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="eco, spa, grain…"
                    style={{ paddingLeft: form.icon ? 36 : 14 }}
                  />
                </div>
                {/* Quick icon grid */}
                <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 8, marginBottom: 8 }}>Quick pick:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ICON_SUGGESTIONS.map(icon => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      title={icon}
                      aria-label={`Use icon ${icon}`}
                      aria-pressed={form.icon === icon}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: `1.5px solid ${form.icon === icon ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        background: form.icon === icon ? 'rgba(25,54,25,0.08)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 150ms ease',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: form.icon === icon ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', fontVariationSettings: "'FILL' 1" }}>
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !!slugCollision} style={{ minWidth: 130 }}>
                  {saving
                    ? <><span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, animation: 'spin 700ms linear infinite' }}>progress_activity</span> Saving…</>
                    : editing ? 'Update Category' : 'Add Category'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 28, color: 'var(--color-error)', fontVariationSettings: "'FILL' 1" }}>delete</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 8 }}>Delete Category?</h3>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                "<strong>{deleteConfirm.name}</strong>" will be removed. Products in this category won't be deleted but will become uncategorized.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
