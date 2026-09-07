import { useEffect, useState } from 'react';
import { hasOptionalConsent } from '@/utils/cookieConsent';

export function useOptionalConsent() {
  const [allowed, setAllowed] = useState(() => hasOptionalConsent());

  useEffect(() => {
    const update = () => setAllowed(hasOptionalConsent());
    window.addEventListener('cookie-consent-changed', update);
    return () => window.removeEventListener('cookie-consent-changed', update);
  }, []);

  return allowed;
}
