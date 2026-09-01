import { useEffect, useRef } from 'react';

/**
 * Embeds the Travelpayouts flight search widget (via tpemb.com).
 * React can't execute <script> tags from dangerouslySetInnerHTML, so we
 * build and inject the script element manually and clean it up on unmount
 * (important in a SPA, since this component can mount/unmount as the
 * person navigates between pages).
 */
export default function TravelpayoutsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.async = true;
    script.src =
      'https://tpemb.com/content?currency=usd&trs=565952&shmarker=769203&locale=en&stops=any&show_hotels=true&powered_by=true&border_radius=0&plain=true&color_button=%2300A991&color_button_text=%23ffffff&promo_id=3414&campaign_id=111';
    script.charset = 'utf-8';

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="tp-widget-container w-full" />;
}
