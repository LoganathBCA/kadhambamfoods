/* eslint-disable react-refresh/only-export-components */
// src/context/CartContext.jsx
import { createContext, useContext, useReducer, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delivery slab rate — every 1 kg (or part thereof) costs this much.
 * 0–1 kg → ₹40  |  1–2 kg → ₹80  |  2–3 kg → ₹120  |  and so on…
 */
export const DELIVERY_PER_SLAB_KG = 40;
const CART_KEY     = 'kadhambam_cart';
const CART_VERSION = 1; // bump this to wipe old incompatible carts

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — weight & delivery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse weight strings like "250g", "500g", "1kg", "500g / 6 pcs", "6 pcs / 500g" → number in kg.
 * Extracts the weight component from anywhere within the string.
 */
export const parseWeightKg = (weightStr) => {
  if (!weightStr) return 0;
  const s = String(weightStr).trim().toLowerCase();

  // 1. Check for a number followed by 'kg', 'kilogram', or 'kilo' anywhere in the string
  const kgMatch = s.match(/([\d.]+)\s*(?:kg|kilogram|kilo)s?/);
  if (kgMatch) {
    return parseFloat(kgMatch[1]) || 0;
  }

  // 2. Check for a number followed by 'g' or 'gram' anywhere in the string
  // Uses a negative lookahead to prevent matching 'g' as part of other words like 'kg'
  const gMatch = s.match(/([\d.]+)\s*(?:grams?|g)(?![a-z])/);
  if (gMatch) {
    return (parseFloat(gMatch[1]) || 0) / 1000;
  }

  return 0;
};

/**
 * Returns the delivery slab number for a given total weight.
 * Protects against floating-point precision issues by rounding to 4 decimal places before ceiling.
 * e.g. 0.3 kg → slab 1 (₹40), 1.0000000000000002 kg → slab 1 (₹40), 1.2 kg → slab 2 (₹80)
 */
export const getDeliverySlab = (totalKg) => {
  const rounded = Math.round(totalKg * 10000) / 10000;
  return Math.ceil(rounded);
};

/**
 * Calculate total delivery fee from an array of cart items.
 * Slab rule: every 1 kg (or part) = ₹40.
 * 0–1 kg → ₹40 | 1–2 kg → ₹80 | 2–3 kg → ₹120 …
 */
export const calcDelivery = (items) => {
  const totalKg = items.reduce(
    (sum, item) => sum + parseWeightKg(item.weight) * item.qty,
    0,
  );
  if (totalKg === 0) return 0;
  return getDeliverySlab(totalKg) * DELIVERY_PER_SLAB_KG;
};


// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers — safe read / write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate and sanitize a single cart item.
 * Returns null if the item is fundamentally broken (no key/id).
 */
const sanitizeItem = (item) => {
  if (!item || typeof item !== 'object') return null;
  // Must have a stable key and product id
  const key = item.key || (item.id && item.weight ? `${item.id}_${item.weight}` : null);
  if (!key) return null;

  // JSON.stringify converts NaN → null, so check for null explicitly too
  if (item.price === null || item.price === undefined) return null;
  const price = Number(item.price);
  const qty   = Number(item.qty);

  // Discard items with invalid numeric fields (price must be > 0 for real products)
  if (!isFinite(price) || price <= 0) return null;
  if (!isFinite(qty)   || qty   <= 0) return null;

  return {
    key,
    id:     item.id     || key.split('_')[0],
    name:   item.name   || 'Unknown Product',
    price:  price,
    image:  item.image  || '',
    weight: item.weight || '',
    qty:    Math.max(1, Math.floor(qty)),
  };
};

/** Read cart from localStorage; returns a clean, validated array */
const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Version check — if stored version differs, wipe and start fresh
    if (parsed && parsed.__v !== CART_VERSION) {
      localStorage.removeItem(CART_KEY);
      return [];
    }

    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    // Sanitize every item; drop any that fail validation
    return items.map(sanitizeItem).filter(Boolean);
  } catch {
    // Corrupt JSON — clear and start fresh
    try { localStorage.removeItem(CART_KEY); } catch { /* ignore */ }
    return [];
  }
};

/**
 * Write cart to localStorage synchronously.
 * Handles QuotaExceededError gracefully — logs a warning but never throws.
 */
const saveCart = (items) => {
  try {
    const payload = { __v: CART_VERSION, items };
    localStorage.setItem(CART_KEY, JSON.stringify(payload));
  } catch (e) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      // Storage full — try removing old data and retrying once
      try {
        localStorage.removeItem(CART_KEY);
        localStorage.setItem(CART_KEY, JSON.stringify({ __v: CART_VERSION, items: [] }));
      } catch { /* nothing we can do */ }
      console.warn('[CartContext] localStorage quota exceeded — cart cleared');
    }
    // Other errors (e.g. private browsing on some browsers) — silently ignore
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Reducer — every action also persists to localStorage synchronously
// (synchronous write means a hard refresh immediately after any action will
//  always see the current state, not the state before the last effect flush)
// ─────────────────────────────────────────────────────────────────────────────

const cartReducer = (state, action) => {
  let nextState;

  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, weight, variantPrice, qty: initQty } = action.payload;
      const key = `${product.id}_${weight}`;
      const existing = state.find((i) => i.key === key);
      const price = variantPrice != null ? Number(variantPrice) : Number(product.price);
      const safePrice = isFinite(price) && price >= 0 ? price : 0;
      const addQty = Math.max(1, Math.floor(Number(initQty) || 1));

      if (existing) {
        nextState = state.map((i) =>
          i.key === key ? { ...i, qty: i.qty + addQty } : i,
        );
      } else {
        nextState = [
          ...state,
          {
            key,
            id:     product.id,
            name:   product.name    || 'Unknown',
            price:  safePrice,
            image:  product.image   || '',
            weight: weight          || '',
            qty:    addQty,
          },
        ];
      }
      break;
    }

    case 'REMOVE_ITEM':
      nextState = state.filter((i) => i.key !== action.payload.key);
      break;

    case 'UPDATE_QTY': {
      const { key, qty } = action.payload;
      const safeQty = Math.max(1, Math.floor(Number(qty) || 1));
      nextState = state.map((i) =>
        i.key === key ? { ...i, qty: safeQty } : i,
      );
      break;
    }

    case 'CLEAR_CART':
      nextState = [];
      break;

    // Internal: re-load from storage (e.g. another tab changed it)
    case 'HYDRATE_CART':
      nextState = action.payload.items;
      break;

    default:
      return state; // no-op — don't persist
  }

  // Persist synchronously so the data is on disk before React re-renders
  saveCart(nextState);
  return nextState;
};

// ─────────────────────────────────────────────────────────────────────────────
// Context + Provider
// ─────────────────────────────────────────────────────────────────────────────

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // loadCart is called once as the lazy initializer — safe, no side-effects
  const [cartItems, dispatch] = useReducer(cartReducer, undefined, loadCart);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (product, weight = '500g', variantPrice = null, qty = 1) =>
      dispatch({ type: 'ADD_ITEM', payload: { product, weight, variantPrice, qty } }),
    [],
  );

  const removeFromCart = useCallback(
    (key) => dispatch({ type: 'REMOVE_ITEM', payload: { key } }),
    [],
  );

  const updateQty = useCallback(
    (key, qty) => dispatch({ type: 'UPDATE_QTY', payload: { key, qty } }),
    [],
  );

  const clearCart = useCallback(
    () => dispatch({ type: 'CLEAR_CART' }),
    [],
  );

  // ── Derived values ────────────────────────────────────────────────────────
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartWeightKg = cartItems.reduce(
    (sum, i) => sum + parseWeightKg(i.weight) * i.qty,
    0,
  );
  const deliveryFee = calcDelivery(cartItems);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        cartWeightKg,
        deliveryFee,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
