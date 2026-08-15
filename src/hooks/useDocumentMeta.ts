import { useEffect } from 'react';

const SITE_NAME = 'Vacanța Mea';
const DEFAULT_DESCRIPTION =
  'Găsește vacanța potrivită în funcție de buget, perioadă și preferințele tale. Vacanță în banii tăi!';

/**
 * Sets document.title and the meta description tag for the current page.
 *
 * NOTE: this only affects the browser tab title and helps Google indexing
 * (Googlebot executes JS), but it does NOT change what link-preview bots
 * (WhatsApp, Facebook, etc.) see when a page is shared — those read the
 * static tags in index.html and generally do not execute JavaScript.
 * Fixing that properly would require server-side rendering / prerendering.
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Vacanță în banii tăi`;
    document.title = fullTitle;

    const desc = description || DEFAULT_DESCRIPTION;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);
  }, [title, description]);
}
