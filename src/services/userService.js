// src/services/userService.js
import {
  db, collection, doc, setDoc, getDoc, getDocs,
  query, where, limit, serverTimestamp, writeBatch, Timestamp,
} from '../firebase/firestore';

const COL = 'users';

export const saveUser = async (uid, data) => {
  const ref = doc(db, COL, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  }
};

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, COL, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getUsers = async () => {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Batch delete users older than 30 days (up to 50 at a time).
 */
export const batchDeleteOldUsers = async () => {
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
    if (import.meta.env.DEV) console.log(`[userService] Cleaned ${snap.size} old users`);
  } catch (e) {
    console.warn('[userService] batchDeleteOldUsers failed:', e);
  }
};
