import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src = src;

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [src]);

  return <div ref={containerRef} className="klook-widget-container w-full" />;
}
