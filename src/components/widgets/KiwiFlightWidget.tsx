import { useEffect, useRef } from 'react';
import { useOptionalConsent } from '@/hooks/useOptionalConsent';

/**
 * Embeds the Kiwi.com "flight search" widget (via Travelpayouts/tpemb.com).
 * React can't execute <script> tags from dangerouslySetInnerHTML, so we
 * build and inject the script element manually and clean it up on unmount
 * (important in a SPA, since this component can mount/unmount as the
 * person navigates between pages).
 */
export default function KiwiFlightWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const consent = useOptionalConsent();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !consent) return;

    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src =
      'https://tpemb.com/content?currency=eur&trs=565952&shmarker=769203.769203&locale=ro&powered_by=true&limit=4&primary_color=00AE98&results_background_color=FFFFFF&form_background_color=FFFFFF&promo_id=4563&campaign_id=111';

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [consent]);

  return consent ? <div ref={containerRef} className="kiwi-widget-container w-full" /> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Activează cookie-urile opționale pentru a încărca instrumentul de căutare.</p>;
}
