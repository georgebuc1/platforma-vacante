import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

const SHOW_AFTER_PX = 400;

export default function ScrollToTopPlane() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Înapoi sus"
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-40
        flex h-12 w-12 items-center justify-center
        rounded-full bg-cta-500 text-white shadow-lg
        hover:bg-cta-400 hover:-translate-y-0.5
        transition-all duration-200
        animate-fade-in
      "
    >
      <Plane className="h-5 w-5 -rotate-45" />
    </button>
  );
}
