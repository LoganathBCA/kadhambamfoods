// src/services/categoryService.js
import {
  db, collection, doc, addDoc, getDocs,
  updateDoc, deleteDoc, serverTimestamp,
} from '../firebase/firestore';

const COL = 'categories';

export const getCategories = async () => {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addCategory = async (data) => {
  return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
};

export const updateCategory = async (id, data) => {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteCategory = async (id) => {
  return deleteDoc(doc(db, COL, id));
};
