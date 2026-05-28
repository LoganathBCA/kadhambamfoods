// src/services/orderService.js
// ─────────────────────────────────────────────────────────────────────────────
// All writes to Firestore are:
//  1. WHITELISTED — only known fields are written (mass-assignment protection)
//  2. SANITIZED   — all string values are stripped of HTML/XSS content
//  3. TYPE-CHECKED — numbers are explicitly cast to Number()
// ─────────────────────────────────────────────────────────────────────────────
import {
  db, collection, doc, addDoc, getDocs,
  updateDoc, query, where, orderBy,
  limit, serverTimestamp, writeBatch, Timestamp,
} from '../firebase/firestore';
import { sanitize } from '../utils/validate';

const COL = 'orders';

/**
 * Whitelisted + sanitized order fields.
 * Any extra keys passed from the form are silently dropped.
 *
 * @param {Object} raw — raw order data from the checkout form
 * @returns {Object} safe data ready for Firestore
 */
const buildSafeOrderPayload = (raw) => ({
  // Strings — sanitized and capped
  userId:       sanitize(String(raw.userId       || 'guest')).slice(0, 128),
  customerName: sanitize(String(raw.customerName || '')).slice(0, 80),
  email:        sanitize(String(raw.email        || '')).slice(0, 254),
  phone:        String(raw.phone || '').replace(/\D/g, '').slice(0, 10),  // digits only
  address:      sanitize(String(raw.address      || '')).slice(0, 350),
  utr:          sanitize(String(raw.utr          || '')).replace(/\s/g, '').toUpperCase().slice(0, 22),
  upiVpa:       sanitize(String(raw.upiVpa       || '')).slice(0, 60),
  upiTxnId:     sanitize(String(raw.upiTxnId     || '')).slice(0, 50),
  status:       'Pending',   // always server-determined; never trust client value

  // Numbers — explicitly cast; invalid values become 0
  subtotal:     Number(raw.subtotal)    || 0,
  deliveryFee:  Number(raw.deliveryFee) || 0,
  total:        Number(raw.total)       || 0,

  // Array of cart items — each item sanitized
  items: Array.isArray(raw.items)
    ? raw.items.map((item) => ({
        id:     sanitize(String(item.id    || '')).slice(0, 64),
        name:   sanitize(String(item.name  || '')).slice(0, 150),
        weight: sanitize(String(item.weight || '')).slice(0, 20),
        price:  Number(item.price) || 0,
        qty:    Math.max(1, Math.round(Number(item.qty) || 1)),
        image:  sanitize(String(item.image || '')).slice(0, 500),
      }))
    : [],

  // Firestore server timestamp — always overridden server-side
  createdAt: serverTimestamp(),
});

// ── CRUD Operations ───────────────────────────────────────────────────────────

export const createOrder = async (rawOrderData) => {
  const safe = buildSafeOrderPayload(rawOrderData);
  return addDoc(collection(db, COL), safe);
};

export const getOrders = async () => {
  const q    = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getOrdersByUser = async (userId) => {
  if (!userId || typeof userId !== 'string') return [];
  const q = query(
    collection(db, COL),
    where('userId', '==', userId.slice(0, 128)),
    orderBy('createdAt', 'desc')
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // Common cause: missing composite index for (userId ASC, createdAt DESC).
    // Deploy firestore.indexes.json or create it in the Firebase Console.
    if (import.meta.env.DEV) console.error('[orderService] getOrdersByUser failed — check Firestore composite index:', e);
    throw e; // Re-throw so callers can show proper error UI
  }
};

export const updateOrderStatus = async (id, status) => {
  // Whitelist valid statuses — never write arbitrary client strings
  const VALID_STATUSES = ['Pending', 'Verified', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];
  const safeStatus = VALID_STATUSES.includes(status) ? status : 'Pending';
  return updateDoc(doc(db, COL, id), { status: safeStatus, updatedAt: serverTimestamp() });
};

export const updateOrderTracking = async (id, tracking) => {
  return updateDoc(doc(db, COL, id), {
    tracking: sanitize(String(tracking || '')).slice(0, 200),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Batch delete orders older than 30 days (up to 50 at a time).
 */
export const batchDeleteOldOrders = async () => {
  try {
    const cutoff = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const q = query(
      collection(db, COL),
      where('createdAt', '<', cutoff),
      limit(50)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(doc(db, COL, d.id)));
    await batch.commit();
    if (import.meta.env.DEV) console.log(`[orderService] Cleaned ${snap.size} old orders`);
  } catch (e) {
    console.warn('[orderService] batchDeleteOldOrders failed:', e);
  }
};
