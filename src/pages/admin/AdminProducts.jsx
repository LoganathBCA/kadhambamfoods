// src/pages/admin/AdminProducts.jsx
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { uploadImage } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '',
  tagline: '',
  description: '',
  price: '',
  categoryId: '',
  image: '',
};

// Default weight variants to pre-fill when adding a new product with weights
const DEFAULT_VARIANTS = [
  { label: '250g', price: '' },
  { label: '500g', price: '' },
  { label: '1kg',  price: '' },
];

const AdminProducts = () => {
  const [products,      setProducts]      = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [variants,      setVariants]      = useState(DEFAULT_VARIANTS);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [search,        setSearch]        = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errors,        setErrors]        = useState({});

  const load = () => {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  // Derive pricingType from the currently selected category
  const selectedCat = categories.find(c => c.id === form.categoryId);
  const pricingType = selectedCat?.pricingType || 'measurement';


  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setVariants(DEFAULT_VARIANTS.map(v => ({ ...v })));
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name:        p.name        ?? '',
      tagline:     p.tagline     ?? '',
      description: p.description ?? '',
      price:       String(p.price ?? ''),
      categoryId:  p.categoryId  ?? '',
      image:       p.image       ?? '',
    });
    setEditing(p.id);
    setErrors({});
    setImageFile(null);
    setImagePreview(p.image || null);
    // Restore saved custom variants or generate defaults with empty prices (so they don't lock down in Firestore)
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      setVariants(p.variants.map(v => ({ label: v.label, price: String(v.price) })));
    } else {
      const cat  = categories.find(c => c.id === p.categoryId);
      const pt   = p.pricingType || cat?.pricingType || 'measurement';
      setVariants(
        pt === 'both'
          ? [
              { label: '250g / 3 pcs', price: '' },
              { label: '500g / 6 pcs', price: '' },
              { label: '1kg / 12 pcs', price: '' },
            ]
          : [
              { label: '250g', price: '' },
              { label: '500g', price: '' },
              { label: '1kg',  price: '' },
            ]
      );
    }
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setVariants(DEFAULT_VARIANTS.map(v => ({ ...v })));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024)    return toast.error('Image must be under 5 MB');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                       e.name  = 'Product name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                                  e.price = 'Enter a valid price greater than 0';
    if (!form.categoryId)                        e.categoryId = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        setUploading(true);
        const res = await uploadImage(imageFile, 'kadhambam/products');
        imageUrl  = res.secure_url;
        setUploading(false);
      }

      // Clean and store custom variants (only if weight-based pricing)
      const cleanVariants = pricingType !== 'enquiry'
        ? variants
            .filter(v => v.label.trim() && Number(v.price) > 0)
            .map(v => ({ label: v.label.trim(), price: Number(v.price) }))
        : [];

      const data = {
        name:        form.name.trim(),
        tagline:     form.tagline.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        categoryId:  form.categoryId,
        image:       imageUrl,
        pricingType,
        variants:    cleanVariants,   // saved to Firestore
      };

      if (editing) {
        await updateProduct(editing, data);
        toast.success('Product updated!');
      } else {
        await addProduct(data);
        toast.success('Product added!');
      }
      load();
      closeModal();
    } catch (err) {
      toast.error(err?.message || 'Save failed — please try again');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct(deleteConfirm.id);
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
      toast.success('Product deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const setField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const visibleProducts = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.tagline || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">

        {/* ── Topbar ── */}
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 700, color: 'var(--color-primary)' }}>
              Products
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
              {products.length} product{products.length !== 1 ? 's' : ''} in store
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--color-on-surface-variant)' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: '1.5px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface)', outline: 'none', width: 'clamp(140px, 30vw, 200px)' }}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 17 }}>add</span>
              Add Product
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="admin-page-content">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : visibleProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 56, color: 'var(--color-outline)' }}>inventory_2</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
                {search ? `No products matching "${search}"` : 'No products yet'}
              </p>
              {!search && (
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>add</span>
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── Mobile card list (shown < 640px) ── */}
              <div className="admin-product-card-list">
                {visibleProducts.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  const pt  = p.pricingType || cat?.pricingType || 'measurement';
                  return (
                    <div key={p.id} className="admin-product-card-item">
                      {/* Left: image */}
                      <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: 'var(--color-surface-container)', flexShrink: 0 }}>
                        {p.image
                          ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--color-outline)' }}>image</span>
                            </div>
                        }
                      </div>

                      {/* Middle: info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>
                          {cat?.name || 'Uncategorized'} · ₹{Number(p.price).toLocaleString('en-IN')}
                        </p>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                          background: pt === 'enquiry' ? 'rgba(107,33,168,0.08)' : pt === 'both' ? 'rgba(11,83,148,0.08)' : 'rgba(29,107,58,0.08)',
                          color:      pt === 'enquiry' ? '#6b21a8'             : pt === 'both' ? '#0b5394'             : '#1d6b3a',
                        }}>
                          {pt === 'enquiry' ? 'Enquiry' : pt === 'both' ? 'Wt+Cnt' : 'Measure'}
                        </span>
                      </div>

                      {/* Right: action buttons — always visible */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => openEdit(p)}
                          className="btn btn-outline btn-xs"
                          aria-label={`Edit ${p.name}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}
                          className="btn btn-xs"
                          style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                          aria-label={`Delete ${p.name}`}
                        >
                          <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>delete</span>
                          Del
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop table (shown ≥ 640px) ── */}
              <div className="admin-table-wrap admin-table-desktop">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Image</th>
                      <th>Name &amp; Tagline</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Base Price</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map(p => {
                      const cat = categories.find(c => c.id === p.categoryId);
                      const pt  = p.pricingType || cat?.pricingType || 'measurement';
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: 'var(--color-surface-container)' }}>
                              {p.image
                                ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--color-outline)' }}>image</span>
                                  </div>
                              }
                            </div>
                          </td>
                          <td>
                            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)', marginBottom: 2 }}>{p.name}</p>
                            {p.tagline && <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>{p.tagline}</p>}
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                            {cat?.name || <span style={{ color: 'var(--color-outline)', fontStyle: 'italic' }}>Uncategorized</span>}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                              background: pt === 'enquiry' ? 'rgba(107,33,168,0.08)' : pt === 'both' ? 'rgba(11,83,148,0.08)' : 'rgba(29,107,58,0.08)',
                              color:      pt === 'enquiry' ? '#6b21a8'             : pt === 'both' ? '#0b5394'             : '#1d6b3a',
                            }}>
                              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 12, fontVariationSettings: "'FILL' 1" }}>
                                {pt === 'enquiry' ? 'contact_support' : pt === 'both' ? 'join_inner' : 'scale'}
                              </span>
                              {pt === 'enquiry' ? 'Enquiry' : pt === 'both' ? 'Wt+Cnt' : 'Measure'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)' }}>
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => openEdit(p)} className="btn btn-outline btn-xs">
                                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>edit</span>
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}
                                className="btn btn-xs"
                                style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', border: 'none' }}
                                aria-label={`Delete ${p.name}`}
                              >
                                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editing ? 'Edit product' : 'Add product'} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-box" style={{ maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2a5c2a, #193619)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'white' }}>{editing ? 'edit' : 'add'}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button className="header__icon-btn" onClick={closeModal} aria-label="Close modal">
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined' }}>close</span>
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSave} noValidate style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Product Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="prod-name">
                  Product Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="prod-name"
                  className={`input${errors.name ? ' input-error' : ''}`}
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="e.g. Cashews"
                  autoFocus
                />
                {errors.name && <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4 }}>{errors.name}</p>}
              </div>

              {/* Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="prod-category">
                  Category <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  id="prod-category"
                  className={`input${errors.categoryId ? ' input-error' : ''}`}
                  value={form.categoryId}
                  onChange={e => {
                    const newCatId = e.target.value;
                    setForm(f => ({ ...f, categoryId: newCatId }));
                    if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }));

                    // Update variant labels if they haven't been customized yet
                    const newCat = categories.find(c => c.id === newCatId);
                    const newPt = newCat?.pricingType || 'measurement';
                    setVariants(prev => {
                      // Synchronize the labels to match the new pricing type while preserving any entered prices
                      if (prev.length === 3) {
                        return newPt === 'both'
                          ? [
                              { label: '250g / 3 pcs', price: prev[0].price },
                              { label: '500g / 6 pcs', price: prev[1].price },
                              { label: '1kg / 12 pcs', price: prev[2].price },
                            ]
                          : [
                              { label: '250g', price: prev[0].price },
                              { label: '500g', price: prev[1].price },
                              { label: '1kg',  price: prev[2].price },
                            ];
                      }
                      // Fallback if rows were added or deleted
                      return newPt === 'both'
                        ? [
                            { label: '250g / 3 pcs', price: '' },
                            { label: '500g / 6 pcs', price: '' },
                            { label: '1kg / 12 pcs', price: '' },
                          ]
                        : [
                            { label: '250g', price: '' },
                            { label: '500g', price: '' },
                            { label: '1kg',  price: '' },
                          ];
                    });
                  }}
                >
                  <option value="">Select a category…</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}  ({c.pricingType === 'enquiry' ? 'Enquiry Only' : c.pricingType === 'both' ? 'Weight + Count' : 'Measurement'})
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4 }}>{errors.categoryId}</p>}
                {/* Show resolved pricingType hint */}
                {form.categoryId && (
                  <p style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>info</span>
                    Pricing type: <strong>
                      {pricingType === 'enquiry' ? 'Enquiry Only (no Add to Cart)' : pricingType === 'both' ? 'Weight + Count (250g/3pcs, 500g/6pcs, 1kg/12pcs)' : 'Measurement (250g, 500g, 1kg)'}
                    </strong>
                  </p>
                )}
              </div>

              {/* Tagline */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="prod-tagline">Tagline</label>
                <input
                  id="prod-tagline"
                  className="input"
                  value={form.tagline}
                  onChange={setField('tagline')}
                  placeholder="e.g. Rich in Antioxidants"
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={setField('description')}
                  placeholder="Detailed product description…"
                  style={{ resize: 'vertical', minHeight: 80 }}
                />
              </div>

              {/* Base Price */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label" htmlFor="prod-price">
                  Base / Reference Price (₹) <span style={{ color: 'var(--color-error)' }}>*</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)', marginLeft: 6 }}>
                    {pricingType !== 'enquiry' ? 'used as fallback if no custom variants set' : 'reference price'}
                  </span>
                </label>
                <input
                  id="prod-price"
                  className={`input${errors.price ? ' input-error' : ''}`}
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={setField('price')}
                  placeholder="e.g. 850"
                />
                {errors.price && <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4 }}>{errors.price}</p>}
              </div>

              {/* ── Custom Weight Variants ── only for measurement / both types */}
              {pricingType !== 'enquiry' && (
                <div style={{ background: 'var(--color-surface-container)', borderRadius: 16, padding: '16px', border: '1.5px solid rgba(25,54,25,0.12)' }}>
                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>scale</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-primary)' }}>Custom Weight Variants</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setVariants(
                            pricingType === 'both'
                              ? [
                                  { label: '250g / 3 pcs', price: '' },
                                  { label: '500g / 6 pcs', price: '' },
                                  { label: '1kg / 12 pcs', price: '' },
                                ]
                              : [
                                  { label: '250g', price: '' },
                                  { label: '500g', price: '' },
                                  { label: '1kg',  price: '' },
                                ]
                          );
                        }}
                        className="btn btn-outline btn-xs"
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>restart_alt</span>
                        Reset to Auto
                      </button>
                      <button
                        type="button"
                        onClick={() => setVariants(prev => [...prev, { label: '', price: '' }])}
                        className="btn btn-outline btn-xs"
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>add</span>
                        Add Row
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginBottom: 12, lineHeight: 1.5 }}>
                    Set your own weight labels and prices. These override the auto-calculated prices shown on the product card.
                  </p>

                  {/* Column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 60px', gap: 8, marginBottom: 6, padding: '0 2px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Label</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Price (₹)</span>
                    <span></span>
                  </div>

                  {/* Variant rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {variants.map((v, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 60px', gap: 8, alignItems: 'center' }}>
                        {/* Label input */}
                        <input
                          type="text"
                          className="input"
                          placeholder={pricingType === 'both' ? '250g / 3 pcs' : '250g'}
                          value={v.label}
                          onChange={e => {
                            const updated = [...variants];
                            updated[i] = { ...updated[i], label: e.target.value };
                            setVariants(updated);
                          }}
                          style={{ padding: '8px 10px', fontSize: 13 }}
                          aria-label={`Variant ${i + 1} label`}
                        />
                        {/* Price input */}
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>₹</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="input"
                            placeholder="0"
                            value={v.price}
                            onChange={e => {
                              const updated = [...variants];
                              updated[i] = { ...updated[i], price: e.target.value };
                              setVariants(updated);
                            }}
                            style={{ paddingLeft: 22, padding: '8px 10px 8px 22px', fontSize: 13 }}
                            aria-label={`Variant ${i + 1} price`}
                          />
                        </div>
                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (i === 0) return;
                              const updated = [...variants];
                              [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
                              setVariants(updated);
                            }}
                            disabled={i === 0}
                            title="Move up"
                            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (i === variants.length - 1) return;
                              const updated = [...variants];
                              [updated[i + 1], updated[i]] = [updated[i], updated[i + 1]];
                              setVariants(updated);
                            }}
                            disabled={i === variants.length - 1}
                            title="Move down"
                            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', cursor: i === variants.length - 1 ? 'default' : 'pointer', opacity: i === variants.length - 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>arrow_downward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                            title="Remove variant"
                            style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--color-error-container)', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {variants.length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '12px 0' }}>
                      No variants added. Click <strong>Add Row</strong> or auto-prices from base price will be used.
                    </p>
                  )}

                  {/* Live preview */}
                  {variants.some(v => v.label && Number(v.price) > 0) ? (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-outline-variant)' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Preview (Custom prices)</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {variants
                          .filter(v => v.label && Number(v.price) > 0)
                          .map((v, i) => (
                            <span key={i} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'rgba(25,54,25,0.08)', border: '1px solid rgba(25,54,25,0.18)', color: 'var(--color-primary)', fontWeight: 700 }}>
                              {v.label} → ₹{Number(v.price).toLocaleString('en-IN')}
                            </span>
                          ))}
                      </div>
                    </div>
                  ) : (
                    form.price && Number(form.price) > 0 && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-outline-variant)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Preview (Auto-calculated fallback)</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {(pricingType === 'both'
                            ? [
                                { label: '250g / 3 pcs', price: Math.round(Number(form.price) * 0.5) },
                                { label: '500g / 6 pcs', price: Number(form.price) },
                                { label: '1kg / 12 pcs', price: Math.round(Number(form.price) * 2) },
                              ]
                            : [
                                { label: '250g', price: Math.round(Number(form.price) * 0.5) },
                                { label: '500g', price: Number(form.price) },
                                { label: '1kg',  price: Math.round(Number(form.price) * 2) },
                              ]
                          ).map((v, i) => (
                            <span key={i} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'rgba(25,54,25,0.04)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                              {v.label} → ₹{v.price.toLocaleString('en-IN')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Image Upload */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Product Image</label>
                <div
                  style={{
                    border: '2px dashed var(--color-outline-variant)',
                    borderRadius: 14, padding: 20, textAlign: 'center',
                    background: 'var(--color-surface-container-lowest)',
                    transition: 'border-color 150ms', cursor: 'pointer',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload product image"
                  onClick={() => document.getElementById('product-img-input').click()}
                  onKeyDown={e => e.key === 'Enter' && document.getElementById('product-img-input').click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onDragLeave={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'var(--color-outline-variant)';
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Image must be less than 5 MB');
                        return;
                      }
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={imagePreview} alt="preview" style={{ height: 100, borderRadius: 10, objectFit: 'cover' }} />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(form.image || null); }}
                        style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: 'var(--color-error)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 36, color: 'var(--color-outline)', display: 'block', marginBottom: 8 }}>upload</span>
                      <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>Click or drag image here</p>
                      <p style={{ fontSize: 11, color: 'var(--color-outline)', marginTop: 4 }}>PNG, JPG up to 5 MB</p>
                    </>
                  )}
                </div>
                <input id="product-img-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                {imageFile && (
                  <p style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>attach_file</span>
                    {imageFile.name} — uploads on save
                  </p>
                )}
              </div>

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16, marginTop: 4 }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 140 }}>
                  {uploading
                    ? <><span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, animation: 'spin 700ms linear infinite' }}>progress_activity</span> Uploading…</>
                    : saving
                    ? <><span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, animation: 'spin 700ms linear infinite' }}>progress_activity</span> Saving…</>
                    : editing ? 'Update Product' : 'Add Product'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 28, color: 'var(--color-error)', fontVariationSettings: "'FILL' 1" }}>delete</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 8 }}>Delete Product?</h3>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                "<strong>{deleteConfirm.name}</strong>" will be permanently removed from your store.
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

export default AdminProducts;
