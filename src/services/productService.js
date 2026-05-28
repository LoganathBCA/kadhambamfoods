// src/services/productService.js
import {
  db, collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
} from '../firebase/firestore';

const COL = 'products';

export const getProducts = async (categoryId = null) => {
  let q = categoryId
    ? query(collection(db, COL), where('categoryId', '==', categoryId), orderBy('createdAt', 'desc'))
    : query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getProduct = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addProduct = async (data) => {
  return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
};

export const updateProduct = async (id, data) => {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  return deleteDoc(doc(db, COL, id));
};
