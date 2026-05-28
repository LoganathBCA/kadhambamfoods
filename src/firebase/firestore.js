// src/firebase/firestore.js
import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

export {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
};

// Collection references
export const usersCol = () => collection(db, 'users');
export const productsCol = () => collection(db, 'products');
export const ordersCol = () => collection(db, 'orders');
export const categoriesCol = () => collection(db, 'categories');
