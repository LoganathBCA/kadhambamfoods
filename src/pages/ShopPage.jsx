// src/pages/ShopPage.jsx
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import ProductCard from '../components/ui/ProductCard';
import OfferBar from '../components/ui/OfferBar';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { Helmet } from 'react-helmet-async';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured First' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest First' },
];

// Price range bands (₹). We bucket by the product's base price.
const PRICE_RANGES = [
  { value: 'all',  label: 'Any Price' },
  { value: '0-200',   label: 'Under ₹200' },
  { value: '200-500', label: '₹200 – ₹500' },
  { value: '500-1000',label: '₹500 – ₹1000' },
  { value: '1000+',   label: 'Above ₹1000' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const priceInRange = (price, range) => {
  if (!range || range === 'all') return true;
  const p = Number(price) || 0;
  if (range === '0-200')    return p < 200;
  if (range === '200-500')  return p >= 200  && p < 500;
  if (range === '500-1000') return p >= 500  && p < 1000;
  if (range === '1000+')    return p >= 1000;
  return true;
};

// Safe case-insensitive substring match
const matchesQuery = (text, q) =>
  !q || String(text || '').toLowerCase().includes(q.toLowerCase());

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton grid — shown while products are loading from Firestore
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card__img skeleton" />
    <div className="skeleton-card__body">
      <div className="skeleton" style={{ height: 14, width: '70%' }} />
      <div className="skeleton" style={{ height: 11, width: '45%' }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <div className="skeleton" style={{ height: 22, width: 38, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 22, width: 38, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 22, width: 38, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div className="skeleton" style={{ height: 22, width: '38%' }} />
        <div className="skeleton" style={{ height: 38, width: 38, borderRadius: '50%' }} />
      </div>
    </div>
  </div>
);

const SkeletonGrid = ({ count = 8 }) => (
  <div className="products-grid">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

// Skeleton pill strip (shown while categories load)
const SkeletonPills = () => (
  <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
    {[80, 90, 70, 100, 75].map((w, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ height: 34, width: w, borderRadius: 999, flexShrink: 0 }}
        aria-hidden="true"
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter chip — a dismissible tag showing an active filter
// ─────────────────────────────────────────────────────────────────────────────
const FilterChip = ({ label, onRemove }) => (
  <span className="filter-chip" style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 10px 4px 12px',
    background: 'rgba(25,54,25,0.1)',
    border: '1px solid rgba(25,54,25,0.15)',
    borderRadius: 999, fontSize: 12, fontWeight: 600,
    color: 'var(--color-primary)',
    animation: 'fadeIn 150ms ease',
  }}>
    {label}
    <button
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="filter-chip__close"
      style={{
        background: 'rgba(25,54,25,0.15)', border: 'none', cursor: 'pointer',
        color: 'var(--color-primary)', fontSize: 10, lineHeight: 1,
        padding: 0,
      }}
    >
      ✕
    </button>
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar / drawer filter panel
// Pulled OUT of ShopPage component so it's a stable reference and doesn't
// remount on every ShopPage render.
// ─────────────────────────────────────────────────────────────────────────────
const FilterPanel = ({
  categories,
  activeCategory, setActiveCategory,
  priceRange,     setPriceRange,
  activeFilterCount, onClearAll,
  inDrawer = false,
  onCategoryChange,  // callback for drawer auto-close
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
    {/* ── Categories ── */}
    <div>
      <p style={{
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: 'var(--color-on-surface-variant)',
        marginBottom: 12,
      }}>
        Categories
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              if (inDrawer && onCategoryChange) onCategoryChange();
            }}
            aria-pressed={activeCategory === cat.id}
            className="filter-panel-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
              textAlign: 'left', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.id
                ? 'linear-gradient(135deg, #2a5c2a, #193619)'
                : 'transparent',
              color: activeCategory === cat.id ? 'white' : 'var(--color-on-surface)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {cat.icon && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, fontVariationSettings: "'FILL' 1", opacity: 0.8 }}
                >
                  {cat.icon}
                </span>
              )}
              {cat.name}
            </span>
            {activeCategory === cat.id && (
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15 }}>
                check
              </span>
            )}
          </button>
        ))}
      </div>
    </div>

    {/* ── Price Range ── */}
    <div>
      <p style={{
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: 'var(--color-on-surface-variant)',
        marginBottom: 12,
      }}>
        Price Range
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {PRICE_RANGES.map(pr => (
          <button
            key={pr.value}
            onClick={() => setPriceRange(pr.value)}
            aria-pressed={priceRange === pr.value}
            className="filter-panel-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
              textAlign: 'left', border: 'none', cursor: 'pointer',
              background: priceRange === pr.value
                ? 'linear-gradient(135deg, #2a5c2a, #193619)'
                : 'transparent',
              color: priceRange === pr.value ? 'white' : 'var(--color-on-surface)',
            }}
          >
            {pr.label}
            {priceRange === pr.value && (
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15 }}>
                check
              </span>
            )}
          </button>
        ))}
      </div>
    </div>

    {/* ── Clear all ── */}
    {activeFilterCount > 0 && (
      <button
        className="btn btn-outline btn-sm"
        style={{ width: '100%' }}
        onClick={onClearAll}
      >
        <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>
          filter_list_off
        </span>
        Clear Filters ({activeFilterCount})
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main ShopPage
// ─────────────────────────────────────────────────────────────────────────────
const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();


  // ── Data state ─────────────────────────────────────────────────────────────
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // ── Filter state ───────────────────────────────────────────────────────────
  // Initialize from URL so deep-links / bookmarks work
  const [activeCategory,  setActiveCategory]  = useState(searchParams.get('cat')   || 'all');
  const [priceRange,      setPriceRange]      = useState(searchParams.get('price') || 'all');
  const [sort,            setSort]            = useState(searchParams.get('sort')  || 'featured');
  const [searchQuery,     setSearchQuery]     = useState(searchParams.get('search') || '');

  // ── UI state ───────────────────────────────────────────────────────────────
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode,         setViewMode]         = useState('grid');
  const searchInputRef = useRef(null);

  // ── Load data from Firestore ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        if (cancelled) return;
        setProducts(prods);
        setCategories([{ id: 'all', name: 'All', icon: 'grid_view' }, ...cats]);
      })
      .catch((err) => {
        if (cancelled) return;
        setError('Could not load products. Please check your connection and try again.');
        if (import.meta.env.DEV) console.error('[ShopPage] load error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Sync URL → state (e.g. header search navigates here with ?search=…) ───
  useEffect(() => {
    const urlSearch   = searchParams.get('search') || '';
    const urlCat      = searchParams.get('cat')    || 'all';
    const urlPrice    = searchParams.get('price')  || 'all';
    const urlSort     = searchParams.get('sort')   || 'featured';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(urlSearch);
    setActiveCategory(urlCat);
    setPriceRange(urlPrice);
    setSort(urlSort);
  }, [searchParams]);

  // ── Sync state → URL (keeps URL bookmarkable) ─────────────────────────────
  // Debounced so typing in search doesn't spam history
  const syncTimeout = useRef(null);
  useEffect(() => {
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      const params = {};
      if (searchQuery)            params.search = searchQuery;
      if (activeCategory !== 'all') params.cat  = activeCategory;
      if (priceRange !== 'all')   params.price  = priceRange;
      if (sort !== 'featured')    params.sort   = sort;
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(syncTimeout.current);
  }, [searchQuery, activeCategory, priceRange, sort, setSearchParams]);

  // ── Filtering + sorting (memoized) ────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = products.filter(p => {
      // Category
      if (activeCategory !== 'all' && p.categoryId !== activeCategory) return false;
      // Price range
      if (!priceInRange(p.price, priceRange)) return false;
      // Search — match name, tagline, description, tags
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hit =
          matchesQuery(p.name,        q) ||
          matchesQuery(p.tagline,     q) ||
          matchesQuery(p.description, q) ||
          (Array.isArray(p.tags) && p.tags.some(t => matchesQuery(t, q)));
        if (!hit) return false;
      }
      return true;
    });

    // Sort
    switch (sort) {
      case 'price-asc':
        r = [...r].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        r = [...r].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'newest':
        // Firestore already returns newest first, but sort by createdAt millis as fallback
        r = [...r].sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });
        break;
      // 'featured' — keep Firestore order (already sorted by createdAt desc)
      default:
        break;
    }

    return r;
  }, [products, activeCategory, priceRange, sort, searchQuery]);

  // ── Active filter count ────────────────────────────────────────────────────
  const activeFilterCount = useMemo(() =>
    (activeCategory !== 'all' ? 1 : 0) +
    (priceRange !== 'all'     ? 1 : 0) +
    (searchQuery              ? 1 : 0),
    [activeCategory, priceRange, searchQuery],
  );

  // ── Clear all filters ─────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setActiveCategory('all');
    setPriceRange('all');
    setSearchQuery('');
    setSort('featured');
    setSearchParams({}, { replace: true });
    setFilterDrawerOpen(false);
  }, [setSearchParams]);

  // ── Category change (from pill strip) ─────────────────────────────────────
  const handleCategoryClick = useCallback((catId) => {
    setActiveCategory(catId);
  }, []);

  // ── Inline search submit (search box inside shop page) ────────────────────
  const handleInlineSearch = useCallback((e) => {
    e.preventDefault();
    const q = searchInputRef.current?.value?.trim() || '';
    setSearchQuery(q);
    if (!q) searchInputRef.current?.focus();
  }, []);

  // ── Shared label lookups ───────────────────────────────────────────────────
  const activeCategoryName = useMemo(() =>
    categories.find(c => c.id === activeCategory)?.name ?? '',
    [categories, activeCategory],
  );
  const activePriceLabel = useMemo(() =>
    PRICE_RANGES.find(pr => pr.value === priceRange)?.label ?? '',
    [priceRange],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="page-body-pad">
      <Helmet>
        <title>Shop Dry Fruits Online – Almonds, Cashews, Walnuts & More | Kadhambam</title>
        <meta name="description" content="Shop 100+ varieties of premium sulphur-free dry fruits, organic nuts, and dried berries online. Almonds, cashews, walnuts, pistachios, dates & more from Kadhambam Tamil Nadu. Fast delivery." />
        <link rel="canonical" href="https://kadhambam.com/shop" />
        <meta property="og:title" content="Shop Premium Dry Fruits Online – Kadhambam" />
        <meta property="og:description" content="100+ varieties of natural dry fruits & nuts. No preservatives, no sulphur. Delivered across Tamil Nadu." />
        <meta property="og:url" content="https://kadhambam.com/shop" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://kadhambam.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Shop', 'item': 'https://kadhambam.com/shop' },
          ]
        })}</script>
      </Helmet>
      <Header />
      <OfferBar />

      {/* ── Shop Hero ── */}
      <main id="main-content">
        <section style={{
        background: 'linear-gradient(160deg, var(--color-surface-container-low) 0%, var(--color-surface-container) 100%)',
        padding: 'clamp(28px, 6vw, 64px) var(--margin-mobile) clamp(20px, 4vw, 32px)',
        borderBottom: '1px solid rgba(195,200,190,0.4)',
      }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-on-surface-variant)', marginBottom: 'clamp(12px, 3vw, 20px)' }}>
            <Link to="/" className="breadcrumb-link" style={{ color: 'inherit' }}>
              Home
            </Link>
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>chevron_right</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Shop</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(10px, 2vw, 16px)', marginBottom: 'clamp(16px, 3vw, 28px)' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.15, marginBottom: 8,
              }}>
                Pantry
              </h1>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'var(--color-on-surface-variant)', maxWidth: 460, lineHeight: 1.6 }}>
                Sun-dried fruits, cold-pressed seeds &amp; organic nuts straight from the farm.
              </p>
            </div>

            {/* Result count chip — shows skeleton pill while loading */}
            <div className="result-count-chip" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: 'clamp(6px, 1.2vw, 8px) clamp(10px, 2vw, 16px)',
              background: loading ? 'var(--color-surface-container)' : 'rgba(25,54,25,0.08)',
              borderRadius: 99, fontSize: 13, fontWeight: 700,
              color: 'var(--color-primary)',
              minWidth: 110,
            }}>
              {loading ? (
                <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6 }} aria-hidden="true" />
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15, fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                </>
              )}
            </div>
          </div>

          {/* Inline search bar */}
          <form
            onSubmit={handleInlineSearch}
            className="shop-search-form"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-surface-container-lowest)',
              border: `1.5px solid ${searchQuery ? 'var(--color-primary)' : 'rgba(195,200,190,0.5)'}`,
              borderRadius: 14, padding: '0 4px 0 16px',
              marginBottom: 'clamp(12px, 3vw, 20px)',
              maxWidth: 520,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: searchQuery ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', flexShrink: 0 }}>
              search
            </span>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search products…"
              defaultValue={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 14, fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface)',
                padding: '11px 0',
              }}
              aria-label="Search products"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (searchInputRef.current) searchInputRef.current.value = '';
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="shop-search-clear"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-on-surface-variant)', padding: '8px 4px' }}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>close</span>
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 10, padding: '8px 16px', flexShrink: 0 }}
            >
              Search
            </button>
          </form>

          {/* Category pills row + mobile filter button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="scrollbar-hide"
              role="group"
              aria-label="Product categories"
              style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1, paddingBottom: 2 }}
            >
              {loading ? (
                <SkeletonPills />
              ) : (
                categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`pill${activeCategory === cat.id ? ' active' : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    aria-pressed={activeCategory === cat.id}
                    style={{ gap: 6, flexShrink: 0 }}
                  >
                    {cat.icon && cat.id !== 'all' && (
                      <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
                        {cat.icon}
                      </span>
                    )}
                    {cat.name}
                  </button>
                ))
              )}
            </div>

            {/* Mobile filter button */}
            <button
              className="shop-filter-btn"
              onClick={() => setFilterDrawerOpen(true)}
              aria-expanded={filterDrawerOpen}
              aria-controls="filter-drawer"
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>tune</span>
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #2a5c2a, #193619)',
                  color: 'white', fontSize: 10, fontWeight: 800,
                  borderRadius: 99, padding: '1px 7px', minWidth: 20, textAlign: 'center',
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Mobile Filter Drawer ── */}
      {filterDrawerOpen && (
        <div id="filter-drawer" style={{ position: 'fixed', inset: 0, zIndex: 900 }} role="dialog" aria-modal="true" aria-label="Product filters">
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface-container-lowest)',
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px',
            paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
            maxHeight: '80vh',
            overflowY: 'auto',
            animation: 'slideUp 250ms cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: 'var(--color-outline-variant)', borderRadius: 99, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
                Filters
                {activeFilterCount > 0 && (
                  <span style={{ fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--color-secondary)', marginLeft: 8 }}>
                    ({activeFilterCount} active)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                aria-label="Close filters"
                className="filter-drawer__close"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-container)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>close</span>
              </button>
            </div>

            <FilterPanel
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              activeFilterCount={activeFilterCount}
              onClearAll={clearAll}
              inDrawer={true}
              onCategoryChange={() => {}} // keep drawer open so user can combine filters
            />

            <button
              className="btn btn-primary filter-drawer__apply"
              style={{ width: '100%', marginTop: 24 }}
              onClick={() => setFilterDrawerOpen(false)}
            >
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>check</span>
              Show {filtered.length} Result{filtered.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Layout: Sidebar + Grid ── */}
      <div className="shop-layout">
        {/* Desktop Sidebar */}
        <aside className="shop-sidebar" aria-label="Filters">
          <div style={{
            position: 'sticky', top: 88,
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 20,
            border: '1px solid rgba(195,200,190,0.4)',
            boxShadow: '0 2px 12px rgba(61,43,31,0.06)',
            padding: '24px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(195,200,190,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>tune</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16, color: 'var(--color-primary)' }}>Filters</span>
              {activeFilterCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: 'var(--color-secondary)', background: 'rgba(125,87,0,0.1)', padding: '2px 8px', borderRadius: 99 }}>
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <FilterPanel
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              activeFilterCount={activeFilterCount}
              onClearAll={clearAll}
            />
          </div>
        </aside>

        {/* Products Area */}
        <div className="shop-main">
          {/* Grid Toolbar */}
          <div className="shop-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', minWidth: 0 }}>
              {loading ? (
                <span className="skeleton" style={{ display: 'inline-block', height: 14, width: 130, borderRadius: 4, verticalAlign: 'middle' }} aria-hidden="true" />
              ) : (
                <>
                  Showing{' '}
                  <strong style={{ color: 'var(--color-primary)' }}>{filtered.length}</strong>
                  {' '}of{' '}
                  <strong style={{ color: 'var(--color-primary)' }}>{products.length}</strong>
                  {' '}products
                </>
              )}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {/* Sort */}
              <label htmlFor="shop-sort" className="sr-only">Sort by</label>
              <div className="shop-sort-wrap" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-surface-container-lowest)',
                border: '1.5px solid rgba(195,200,190,0.5)',
                borderRadius: 10, padding: '7px 12px',
              }}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--color-on-surface-variant)' }}>sort</span>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', outline: 'none' }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* View mode toggle */}
              <div role="group" aria-label="View mode" style={{ display: 'flex', background: 'var(--color-surface-container)', borderRadius: 10, padding: 3, gap: 2 }}>
                {[{ mode: 'grid', icon: 'grid_view', label: 'Grid view' }, { mode: 'list', icon: 'view_list', label: 'List view' }].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    aria-label={label}
                    aria-pressed={viewMode === mode}
                    className="view-toggle-btn"
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: viewMode === mode ? 'var(--color-surface-container-lowest)' : 'transparent',
                      color: viewMode === mode ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      boxShadow: viewMode === mode ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>{icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Active filter chips ── */}
          {activeFilterCount > 0 && !loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }} role="group" aria-label="Active filters">
              {searchQuery && (
                <FilterChip
                  label={`Search: "${searchQuery}"`}
                  onRemove={() => {
                    setSearchQuery('');
                    if (searchInputRef.current) searchInputRef.current.value = '';
                  }}
                />
              )}
              {activeCategory !== 'all' && (
                <FilterChip
                  label={`Category: ${activeCategoryName}`}
                  onRemove={() => setActiveCategory('all')}
                />
              )}
              {priceRange !== 'all' && (
                <FilterChip
                  label={activePriceLabel}
                  onRemove={() => setPriceRange('all')}
                />
              )}
              {activeFilterCount > 1 && (
                <button
                  onClick={clearAll}
                  className="clear-all-btn"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: 'transparent', border: '1px solid var(--color-error)',
                    color: 'var(--color-error)', cursor: 'pointer',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>filter_list_off</span>
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* ── Product grid / list / states ── */}

          {/* Error state */}
          {error && (
            <div className="empty-state" style={{ minHeight: 360, flexDirection: 'column', gap: 16 }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 64, color: 'var(--color-error)', opacity: 0.6 }}>
                wifi_off
              </span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--color-primary)', textAlign: 'center', maxWidth: 320 }}>
                {error}
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => window.location.reload()}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>refresh</span>
                Try again
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {!error && loading && <SkeletonGrid count={8} />}

          {/* Empty (no results) */}
          {!error && !loading && filtered.length === 0 && (
            <div className="empty-state" style={{ minHeight: 'clamp(240px, 40vw, 360px)', flexDirection: 'column', gap: 12 }}>
              <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 64, color: 'var(--color-outline)' }}>
                search_off
              </span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, color: 'var(--color-primary)' }}>
                No products found
              </p>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
                {searchQuery
                  ? `No results for "${searchQuery}"${activeCategory !== 'all' ? ` in ${activeCategoryName}` : ''}. Try a different search term.`
                  : 'Try adjusting your category or price filter.'}
              </p>
              <button className="btn btn-secondary btn-sm" onClick={clearAll}>
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>filter_list_off</span>
                Clear All Filters
              </button>
            </div>
          )}

          {/* Grid view */}
          {!error && !loading && filtered.length > 0 && viewMode === 'grid' && (
            <div className="products-grid" role="list" aria-label="Products">
              {filtered.map(p => (
                <div key={p.id} role="listitem">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {!error && !loading && filtered.length > 0 && viewMode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="list" aria-label="Products">
              {filtered.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none' }} role="listitem">
                    <div
                      className="shop-list-item"
                      style={{
                        display: 'flex', gap: 'clamp(10px, 2vw, 14px)', alignItems: 'center',
                        background: 'var(--color-surface-container-lowest)',
                        borderRadius: 'clamp(12px, 2vw, 16px)',
                        border: '1px solid rgba(195,200,190,0.4)',
                        padding: 'clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px)',
                        boxShadow: '0 2px 8px rgba(61,43,31,0.05)',
                      }}
                    >
                    <div className="shop-list-item__thumb" style={{ width: 'clamp(56px, 12vw, 68px)', height: 'clamp(56px, 12vw, 68px)', borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface-container)' }}>
                      {p.image
                        ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌿</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'var(--color-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </p>
                      {p.tagline && (
                        <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.tagline}
                        </p>
                      )}
                      {p.badge && (
                        <span className={`badge badge-${p.badge === 'Organic' ? 'organic' : p.badge === 'Bestseller' ? 'bestseller' : 'new'}`} style={{ display: 'inline-flex', marginTop: 2 }}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p className="shop-list-item__price" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
                        {p.pricingType === 'enquiry' ? 'on request' : 'from / 250g'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--color-on-surface-variant)', opacity: 0.5, flexShrink: 0 }}>
                      chevron_right
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      </main>
      <Footer />
      <MobileNav />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
