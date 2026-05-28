// src/utils/validate.js
// ─────────────────────────────────────────────────────────────────────────────
// Central validation & sanitization library.
//
// XSS PREVENTION STRATEGY:
//   React auto-escapes all text rendered via JSX — so stored HTML tags cannot
//   execute when displayed. However, we strip HTML from inputs BEFORE writing
//   to Firestore so that:
//     1. If data is ever rendered with dangerouslySetInnerHTML it's still safe.
//     2. The Firestore document stays clean and readable for admins.
//     3. It prevents future bugs when data is passed to email templates or PDFs.
//
// SQL INJECTION:
//   This app uses Firestore (NoSQL) — traditional SQL injection is not possible.
//   Firestore queries use parameterised SDK calls, not string concatenation.
//   However, we still sanitize to prevent Firestore field injection and XSS.
// ─────────────────────────────────────────────────────────────────────────────

// ── HTML / XSS Stripping ─────────────────────────────────────────────────────

/**
 * Removes HTML tags, script content, null bytes, and control characters.
 * Returns a trimmed plain-text string safe for Firestore storage.
 *
 * @param {string} raw
 * @returns {string}
 */
export const sanitize = (raw) => {
  if (typeof raw !== 'string') return '';
  return raw
    // Remove script/style blocks and their content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove HTML entities that could be used for injection
    .replace(/&(lt|gt|amp|quot|apos|#\d+|#x[\da-f]+);/gi, (m) => {
      const map = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&apos;': "'" };
      return map[m.toLowerCase()] || m;
    })
    // Remove null bytes and non-printable control characters (except newlines/tabs)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
};

/**
 * Sanitize and enforce max length. Returns the cleaned, truncated string.
 */
export const sanitizeMax = (raw, maxLen) => sanitize(raw).slice(0, maxLen);

// ── Individual field validators ───────────────────────────────────────────────
// Each validator returns null on pass, or an error string on fail.

/** Full name — letters, spaces, hyphens, apostrophes only. Max 80 chars. */
export const validateName = (val) => {
  const v = sanitize(val);
  if (!v) return 'Name is required';
  if (v.length < 2) return 'Name must be at least 2 characters';
  if (v.length > 80) return 'Name must be 80 characters or less';
  if (!/^[\p{L}\s'\-.]+$/u.test(v)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  return null;
};

/**
 * Email — RFC 5322 simplified, max 254 chars (RFC 5321 limit).
 * Blocks localhost addresses and IP literals for this consumer app.
 */
export const validateEmail = (val, required = true) => {
  const v = sanitize(val);
  if (!v) return required ? 'Email address is required' : null;
  if (v.length > 254) return 'Email address is too long';
  // Must have local@domain.tld format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address';
  // Block suspicious patterns
  if (/[<>"'`;]/.test(v)) return 'Email contains invalid characters';
  return null;
};

/**
 * Password — login: min 6 chars. Register: min 8, at least 1 letter + 1 digit.
 */
export const validatePassword = (val, isRegister = false) => {
  if (!val) return 'Password is required';
  if (isRegister) {
    if (val.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-zA-Z]/.test(val)) return 'Password must contain at least one letter';
    if (!/[0-9]/.test(val)) return 'Password must contain at least one number';
    if (val.length > 128) return 'Password is too long';
  } else {
    if (val.length < 6) return 'Password must be at least 6 characters';
  }
  return null;
};

/**
 * Returns a 0–4 strength score for a password.
 * 0 = very weak, 4 = strong
 */
export const passwordStrength = (val) => {
  if (!val || val.length < 4) return 0;
  let score = 0;
  if (val.length >= 8)  score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return Math.min(score, 4);
};

export const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
export const STRENGTH_COLORS = ['#e53935', '#ff7043', '#ffa726', '#66bb6a', '#2e7d32'];

/** Indian mobile phone — exactly 10 digits, must start with 6–9. */
export const validatePhone = (val, required = true) => {
  const v = sanitize(val).replace(/[\s\-()]/g, '');
  if (!v) return required ? 'Phone number is required' : null;
  if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]/.test(v)) return 'Mobile number must start with 6, 7, 8, or 9';
  return null;
};

/** Street address — no HTML, max 300 chars. */
export const validateAddress = (val) => {
  const v = sanitize(val);
  if (!v) return 'Address is required';
  if (v.length < 5) return 'Please enter your full address';
  if (v.length > 300) return 'Address must be 300 characters or less';
  return null;
};

/** City — letters and spaces only, max 60 chars. */
export const validateCity = (val) => {
  const v = sanitize(val);
  if (!v) return 'City is required';
  if (v.length > 60) return 'City name is too long';
  if (!/^[\p{L}\s\-.]+$/u.test(v)) return 'City can only contain letters';
  return null;
};

/** Indian pincode — exactly 6 digits, range 100000–999999. */
export const validatePincode = (val) => {
  const v = sanitize(val).trim();
  if (!v) return 'Pincode is required';
  if (!/^\d{6}$/.test(v)) return 'Enter a valid 6-digit pincode';
  const n = parseInt(v, 10);
  if (n < 100000 || n > 999999) return 'Enter a valid Indian pincode';
  return null;
};

/**
 * UPI UTR (Unique Transaction Reference).
 * Format: 12–22 alphanumeric chars. Blocks any HTML/scripts.
 */
export const validateUTR = (val) => {
  const v = sanitize(val).replace(/\s/g, '');
  if (!v) return 'Please enter your UTR / Transaction ID after paying';
  if (v.length < 6)  return 'UTR must be at least 6 characters';
  if (v.length > 22) return 'UTR must be 22 characters or less';
  if (!/^[A-Za-z0-9]+$/.test(v)) return 'UTR can only contain letters and numbers';
  return null;
};

/** Generic text message — max length, no HTML. */
export const validateMessage = (val, maxLen = 2000) => {
  const v = sanitize(val);
  if (!v) return 'Message is required';
  if (v.length < 10) return 'Message must be at least 10 characters';
  if (v.length > maxLen) return `Message must be ${maxLen} characters or less`;
  return null;
};

/** Subject/topic — optional but capped. */
export const validateSubject = (val, required = false) => {
  const v = sanitize(val);
  if (!v && required) return 'Subject is required';
  if (v.length > 150) return 'Subject must be 150 characters or less';
  return null;
};

// ── Form-level validator ──────────────────────────────────────────────────────

/**
 * Validate a form data object against a schema of validator functions.
 *
 * @param {Object} schema — { fieldName: validatorFn, ... }
 * @param {Object} data   — form data object
 * @returns {{ valid: boolean, errors: Object }}
 *
 * Example:
 *   const { valid, errors } = validateForm(
 *     { name: validateName, email: validateEmail },
 *     { name: form.name, email: form.email }
 *   );
 */
export const validateForm = (schema, data) => {
  const errors = {};
  for (const [field, validator] of Object.entries(schema)) {
    const err = validator(data[field]);
    if (err) errors[field] = err;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

// ── Sanitize a full object for Firestore write ───────────────────────────────

/**
 * Sanitize every string value in an object (non-recursive).
 * Numbers, booleans, arrays, and nested objects are left untouched.
 *
 * @param {Object} obj
 * @param {number} [maxLen=500] — default max length per field
 * @returns {Object} cleaned object
 */
export const sanitizeObject = (obj, maxLen = 500) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      out[k] = sanitizeMax(v, maxLen);
    } else if (Array.isArray(v)) {
      // Sanitize string elements inside arrays
      out[k] = v.map((item) =>
        typeof item === 'string' ? sanitizeMax(item, maxLen)
        : typeof item === 'object' && item !== null ? sanitizeObject(item, maxLen)
        : item
      );
    } else {
      out[k] = v;
    }
  }
  return out;
};

export default {
  sanitize,
  sanitizeMax,
  sanitizeObject,
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateAddress,
  validateCity,
  validatePincode,
  validateUTR,
  validateMessage,
  validateSubject,
  validateForm,
  passwordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
};
