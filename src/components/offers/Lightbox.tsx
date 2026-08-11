import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 rounded-full bg-white/20 p-2 hover:bg-white/40 transition"
      >
        <X className="h-7 w-7 text-white" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-6 rounded-full bg-white/20 p-3 hover:bg-white/40 transition"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <button
            onClick={onNext}
            className="absolute right-6 rounded-full bg-white/20 p-3 hover:bg-white/40 transition"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </>
      )}

      <img
        src={images[currentIndex]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />
    </div>
  );
}