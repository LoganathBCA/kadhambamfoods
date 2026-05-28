// src/firebase/auth.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

/**
 * Google sign-in: try popup first (desktop-friendly), fall back to redirect
 * (mobile-friendly / when popups are blocked by the browser).
 */
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    // Popup blocked, closed, or cross-origin failure → fall back to redirect
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/internal-error'
    ) {
      return signInWithRedirect(auth, googleProvider);
    }
    throw err; // Re-throw other errors (e.g. network)
  }
};

/**
 * Consume redirect result after the page reloads from signInWithRedirect.
 * Should be called once on app mount (AuthContext).
 */
export const getGoogleRedirectResult = () => getRedirectResult(auth);

export const signOut = () => firebaseSignOut(auth);

export const updateUserProfile = (displayName, photoURL) =>
  updateProfile(auth.currentUser, { displayName, photoURL });

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);
