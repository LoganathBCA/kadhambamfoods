// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getGoogleRedirectResult } from '../firebase/auth';
import { saveUser } from '../services/userService';

const AuthContext = createContext(null);

// Admin check via UID (most secure) OR email fallback
const ADMIN_UIDS = (import.meta.env.VITE_ADMIN_UIDS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = Boolean(
    user &&
    (ADMIN_UIDS.includes(user.uid) || ADMIN_EMAILS.includes(user.email))
  );

  useEffect(() => {
    // Always reset to loading whenever this effect mounts/remounts
    // (handles React StrictMode double-invocation in dev)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    getGoogleRedirectResult().catch((err) => {
      if (err && err.code && err.code !== 'auth/no-current-user') {
        console.error('Firebase redirect auth error:', err);
      }
    });

    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);           // only set false AFTER we have the real state
      if (firebaseUser) {
        try {
          await saveUser(firebaseUser.uid, {
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL:    firebaseUser.photoURL    || '',
          });
        } catch { /* silently fail if Firestore not configured yet */ }
      }
    });

    return () => unsub();
  }, []);

  // ── Block the ENTIRE tree until Firebase has resolved the session ──
  // This is the key fix: route guards never see user=null during the
  // async IndexedDB read that restores the persisted session on refresh.
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-background, #fff8f2)',
          zIndex: 9999,
        }}
        aria-label="Loading session…"
        role="status"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="spinner" />
          <p style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 15,
            color: 'var(--color-primary, #193619)',
            fontWeight: 600,
            opacity: 0.7,
          }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
