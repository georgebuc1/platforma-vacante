import { useEffect, useRef } from 'react';

/**
 * Embeds the Localrent.com "Rental Cars Search Form" widget (via
 * Travelpayouts/tpemb.com). Same injection pattern as the other widgets.
 */
export default function LocalrentWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src =
      'https://tpemb.com/content?trs=565952&shmarker=769203.769203&powered_by=true&country=123&lang=en&width=100&background=light&logo=true&header=true&gearbox=false&cars=false&border=true&footer=true&campaign_id=87&promo_id=4322';

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="localrent-widget-container w-full" />;
}
