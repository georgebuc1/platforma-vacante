import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

const SHOW_AFTER_PX = 400;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Înapoi sus"
      title="Înapoi sus"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-40
        flex h-12 w-12 items-center justify-center
        rounded-full
        bg-cta-500 text-white
        shadow-card-hover
        transition-all duration-300
        hover:bg-cta-400 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-cta-500 focus:ring-offset-2
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {/* Rotită ca să pară un avion care urcă, în ton cu tema site-ului */}
      <Plane className="h-5 w-5 -rotate-45" />
    </button>
  );
}
