const CONSENT_KEY = 'vacanta-mea-cookie-consent';

export type CookieConsent = 'accepted' | 'necessary' | null;

export function getCookieConsent(): CookieConsent {
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'necessary' ? value : null;
}

export function setCookieConsent(value: Exclude<CookieConsent, null>) {
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('cookie-consent-changed'));
}

export function hasOptionalConsent() {
  return getCookieConsent() === 'accepted';
}
