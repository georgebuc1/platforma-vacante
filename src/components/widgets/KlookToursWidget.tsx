import { useEffect, useRef } from 'react';
import { useOptionalConsent } from '@/hooks/useOptionalConsent';

interface KlookToursWidgetProps {
  src: string;
}

/**
 * Embeds a Klook "Specific City/Category Tours" widget (via Travelpayouts/
 * tpemb.com). Same pattern as KiwiFlightWidget: build and inject the
 * <script> tag manually since React can't execute it from JSX/innerHTML,
 * and clean it up on unmount so switching cities/tabs doesn't leave stale
 * scripts appending duplicate content.
 */
export default function KlookToursWidget({ src }: KlookToursWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const consent = useOptionalConsent();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !consent) return;

    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src = src;

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [src, consent]);

  return consent ? <div ref={containerRef} className="klook-widget-container w-full" /> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Activează cookie-urile opționale pentru a încărca activitățile.</p>;
}
