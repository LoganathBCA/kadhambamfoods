// src/pages/LoginPage.jsx
import { useState, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { signInWithEmail, registerWithEmail, signInWithGoogle, updateUserProfile } from '../firebase/auth';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import {
  sanitize,
  validateName,
  validateEmail,
  validatePassword,
  passwordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
} from '../utils/validate';
import { Helmet } from 'react-helmet-async';

// ── Password strength indicator ───────────────────────────────────────────────
const PasswordStrengthBar = ({ password }) => {
  const score  = passwordStrength(password);
  const pct    = password.length ? Math.round((score / 4) * 100) : 0;
  const label  = password.length ? STRENGTH_LABELS[score] : '';
  const color  = STRENGTH_COLORS[score];

  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      {/* Track */}
      <div style={{
        height: 4, borderRadius: 99,
        background: 'var(--color-surface-container)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 300ms ease, background 300ms ease',
        }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 4,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.02em' }}>
          {label}
        </span>
        {score < 2 && password.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
            Tip: add numbers &amp; symbols
          </span>
        )}
      </div>
    </div>
  );
};

// ── Inline field error ────────────────────────────────────────────────────────
const FieldError = ({ id, message }) => {
  if (!message) return <div style={{ minHeight: 20 }} />; // Reserve space — prevents layout shift
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      style={{
        minHeight: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 5,
        animation: 'validation-shake 200ms ease both',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontFamily: 'Material Symbols Outlined',
          fontSize: 14,
          color: 'var(--color-error)',
          fontVariationSettings: "'FILL' 1",
          flexShrink: 0,
        }}
      >
        error
      </span>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.3 }}>
        {message}
      </span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('next') || location.state?.from?.pathname || '/';

  const [mode, setMode]               = useState('login');   // 'login' | 'register'
  const [form, setForm]               = useState({ email: '', password: '', name: '' });
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [, setTouched]                = useState({});

  // Clear the error for a field the moment the user changes it
  const handleChange = useCallback((field) => (e) => {
    const raw = e.target.value;
    setForm((prev) => ({ ...prev, [field]: raw }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  // Mark field as touched on blur — triggers inline validation
  const handleBlur = useCallback((field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate just this one field on blur
    const blurValidators = {
      name:     () => mode === 'register' ? validateName(form.name) : null,
      email:    () => validateEmail(form.email),
      password: () => validatePassword(form.password, mode === 'register'),
    };
    const err = blurValidators[field]?.();
    if (err) setErrors((prev) => ({ ...prev, [field]: err }));
  }, [form, mode]);

  const validate = useCallback(() => {
    const e = {};
    if (mode === 'register') {
      const nameErr = validateName(form.name);
      if (nameErr) e.name = nameErr;
    }
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;

    const passErr = validatePassword(form.password, mode === 'register');
    if (passErr) e.password = passErr;

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, mode]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(form.email.trim(), form.password);
        toast.success('Welcome back! 👋');
      } else {
        // Sanitize name before storing to Firebase Auth profile
        const cleanName = sanitize(form.name);
        await registerWithEmail(form.email.trim(), form.password);
        if (cleanName) await updateUserProfile(cleanName, null);
        toast.success('Account created! Welcome to Kadhambam 🌿');
      }
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential'    ? 'Incorrect email or password. Please try again.' :
        err.code === 'auth/user-not-found'        ? 'No account found with this email.' :
        err.code === 'auth/wrong-password'        ? 'Incorrect password. Please try again.' :
        err.code === 'auth/user-disabled'         ? 'This account has been disabled. Please contact support.' :
        err.code === 'auth/email-already-in-use'  ? 'This email is already registered. Sign in instead.' :
        err.code === 'auth/invalid-email'         ? 'Please enter a valid email address.' :
        err.code === 'auth/too-many-requests'     ? 'Too many failed attempts. Please wait a few minutes and try again.' :
        err.code === 'auth/network-request-failed'? 'Network error. Please check your connection.' :
        'Authentication failed. Please try again.';  // Don't expose raw error in production
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      // If signInWithRedirect was triggered, result is undefined and the
      // page will navigate to Google — don't toast or navigate here.
      if (result) {
        toast.success('Signed in with Google! 🎉');
        navigate(from, { replace: true });
      }
      // If redirect: page reloads → AuthContext picks up the session
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const msg =
        err.code === 'auth/popup-closed-by-user'    ? 'Sign-in cancelled.' :
        err.code === 'auth/popup-blocked'           ? 'Popup blocked by browser. Please allow popups or try again.' :
        err.code === 'auth/unauthorized-domain'     ? 'This domain is not authorized in Firebase Console. Please add it to your Authorized Domains.' :
        err.code === 'auth/operation-not-allowed'   ? 'Google Sign-In is disabled in Firebase Console. Please enable it under Authentication.' :
        err.code === 'auth/network-request-failed'  ? 'Network error. Please check your connection.' :
        `Google sign-in failed (${err.code || 'unknown error'}). Please try again.`;
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setTouched({});
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Sign In – Kadhambam Dry Fruits</title>
        <meta name="description" content="Sign in to your Kadhambam account to place orders and track deliveries." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-card__logo">
          <img src={logo} alt="Kadhambam logo" width={52} height={52} />
          <h1>Kadhambam</h1>
          <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
            {mode === 'login'
              ? 'Welcome back! Sign in to continue.'
              : 'Create your account to get started.'}
          </p>
        </div>

        {/* Mode toggle tabs */}
        <div style={{
          display: 'flex', gap: 0,
          background: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-md)',
          padding: 3, marginBottom: 20,
        }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '8px 0',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13,
                background: mode === m ? 'var(--color-surface)' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                transition: 'all 200ms ease',
                letterSpacing: '0.01em',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Google Sign-In */}
        <button
          className="google-btn"
          onClick={handleGoogle}
          disabled={loading}
          type="button"
          aria-label="Continue with Google"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">or</div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} noValidate aria-label={mode === 'login' ? 'Sign in form' : 'Create account form'}>

          {/* Name — register only */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                className={`input${errors.name ? ' input-error' : ''}`}
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={80}
                aria-describedby={errors.name ? 'auth-name-error' : undefined}
                aria-invalid={!!errors.name}
                spellCheck={false}
              />
              <FieldError id="auth-name-error" message={errors.name} />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              className={`input${errors.email ? ' input-error' : ''}`}
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder="email@example.com"
              autoComplete="email"
              maxLength={254}
              aria-describedby={errors.email ? 'auth-email-error' : undefined}
              aria-invalid={!!errors.email}
              inputMode="email"
            />
            <FieldError id="auth-email-error" message={errors.email} />
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="label" style={{ margin: 0 }} htmlFor="auth-password">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => toast('Password reset: contact support or use Google sign-in.', { icon: 'ℹ️' })}
                  style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="input-password-wrap">
              <input
                id="auth-password"
                className={`input${errors.password ? ' input-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                maxLength={128}
                aria-describedby={errors.password ? 'auth-password-error' : mode === 'register' ? 'auth-password-hint' : undefined}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <FieldError id="auth-password-error" message={errors.password} />

            {/* Password strength meter — register only */}
            {mode === 'register' && (
              <>
                <PasswordStrengthBar password={form.password} />
                {!errors.password && (
                  <p
                    id="auth-password-hint"
                    style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 4 }}
                  >
                    Must be at least 8 characters with a letter and a number.
                  </p>
                )}
              </>
            )}
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 700ms linear infinite' }} />
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Switch mode */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}
              <button onClick={() => switchMode('register')} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Register
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => switchMode('login')} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Sign In
              </button>
            </>
          )}
        </p>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
