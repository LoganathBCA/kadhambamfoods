// src/hooks/useSeo.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralised SEO helper.  Use on every page:
//
//   useSeo({
//     title: 'Shop – Kadhambam Dry Fruits',
//     description: '…',
//     canonical: '/shop',
//     og: { image: '/og-shop.jpg' },
//     jsonLd: { '@context': '…', '@type': 'BreadcrumbList', … },
//   });
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// Site-wide constants — update if domain changes
export const SITE_NAME   = 'Kadhambam Dry Fruits';
export const SITE_URL    = 'https://kadhambam.com';         // ← set your real domain
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
export const TWITTER_HANDLE  = '@kadhambamfoods';          // optional

/**
 * useSeo — injects per-page SEO tags via react-helmet-async.
 *
 * @param {Object} opts
 * @param {string}  opts.title        — Full <title> string (no suffix needed)
 * @param {string}  opts.description  — Meta description (120-155 chars ideal)
 * @param {string}  [opts.canonical]  — Path or full URL for rel=canonical
 * @param {boolean} [opts.noIndex]    — Pass true for private/admin pages
 * @param {Object}  [opts.og]         — Overrides for OG tags { title, description, image, type }
 * @param {Object|Object[]} [opts.jsonLd] — JSON-LD structured data object(s)
 * @param {string}  [opts.keywords]   — Comma-separated keywords (optional; low modern SEO value)
 */
const useSeo = ({
  title,
  description,
  canonical,
  noIndex = false,
  og = {},
  jsonLd = null,
  keywords = '',
} = {}) => {
  const canonicalUrl = canonical
    ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`)
    : null;

  const ogTitle       = og.title       || title;
  const ogDescription = og.description || description;
  const ogImage       = og.image       || DEFAULT_OG_IMAGE;
  const ogType        = og.type        || 'website';

  // Serialise JSON-LD (supports single object or array)
  const jsonLdScripts = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];

  // Return Helmet JSX so it can be rendered in-component, OR just call
  // the hook and let callers render <Helmet> themselves.
  // We expose both patterns — this hook just returns a <Helmet> element.
  return (
    <Helmet>
      <title>{title}</title>
      {description  && <meta name="description"   content={description} />}
      {keywords     && <meta name="keywords"       content={keywords} />}
      {noIndex      && <meta name="robots"         content="noindex,nofollow" />}
      {!noIndex     && <meta name="robots"         content="index,follow" />}
      {canonicalUrl && <link rel="canonical"       href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={ogType} />
      {ogTitle       && <meta property="og:title"       content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {canonicalUrl  && <meta property="og:url"         content={canonicalUrl} />}
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"      content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      {ogTitle       && <meta name="twitter:title"       content={ogTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      <meta name="twitter:image"       content={ogImage} />

      {/* JSON-LD structured data */}
      {jsonLdScripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};

export default useSeo;
