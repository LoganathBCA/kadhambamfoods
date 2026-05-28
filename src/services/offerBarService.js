// src/services/offerBarService.js
import { db, doc, getDoc, setDoc, serverTimestamp } from '../firebase/firestore';

const SETTINGS_DOC = doc(db, 'settings', 'offerBar');

/** Default offer bar state — used when doc doesn't exist yet or on any read error */
export const OFFER_BAR_DEFAULT = {
  enabled: false,
  bgColor: '#193619',
  textColor: '#ffffff',
  items: [
    '🌿 Free delivery on orders above ₹499 across Tamil Nadu!',
    '✨ 100% Natural — No preservatives, no additives.',
    '🛒 New arrivals every week — fresh from the farm!',
  ],
};

/**
 * Fetch offer bar settings.
 * Always resolves (never rejects) — falls back to defaults on any error.
 */
export const getOfferBar = async () => {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    if (snap.exists()) {
      return { ...OFFER_BAR_DEFAULT, ...snap.data() };
    }
    return { ...OFFER_BAR_DEFAULT };
  } catch {
    // Permission denied or network error — return defaults silently
    return { ...OFFER_BAR_DEFAULT };
  }
};

/**
 * Save offer bar settings (admin only).
 * Throws on error so the admin UI can show a toast.
 */
export const saveOfferBar = async (data) => {
  // Strip the updatedAt from data before merging to avoid stale timestamps
  const clean = { ...data };
  delete clean.updatedAt;
  await setDoc(SETTINGS_DOC, { ...clean, updatedAt: serverTimestamp() }, { merge: true });
};
