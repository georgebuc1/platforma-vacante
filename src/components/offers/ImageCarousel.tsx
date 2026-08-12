import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  mainImage: string;
  galleryImages?: string[];
  alt: string;
}

export default function ImageCarousel({
  mainImage,
  galleryImages = [],
  alt,
}: ImageCarouselProps) {
  const images = useMemo(() => {
    const list = [mainImage, ...galleryImages.filter(Boolean)];

    // elimină imaginile duplicate
    return [...new Set(list)];
  }, [mainImage, galleryImages]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const hasMultipleImages = images.length > 1;

  const previousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img
        src={images[currentIndex]}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500"
      />

      {hasMultipleImages && (
        <>
          {/* Previous */}
          <button
            type="button"
            aria-label="Imaginea anterioară"
            onClick={previousImage}
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              flex h-10 w-10 items-center justify-center
              rounded-full
              border border-white/20
              bg-slate-900/35
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all duration-200
              hover:bg-slate-900/60
              hover:border-white/35
              hover:scale-105
              active:scale-95
            "
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Next */}
          <button
            type="button"
            aria-label="Imaginea următoare"
            onClick={nextImage}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              flex h-10 w-10 items-center justify-center
              rounded-full
              border border-white/20
              bg-slate-900/35
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all duration-200
              hover:bg-slate-900/60
              hover:border-white/35
              hover:scale-105
              active:scale-95
            "
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Image indicators */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/30 px-2.5 py-1.5 backdrop-blur-sm">
            {images.map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Imaginea ${index + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`
                  rounded-full transition-all duration-200
                  ${
                    index === currentIndex
                      ? 'h-2 w-5 bg-white shadow-sm'
                      : 'h-2 w-2 bg-white/50 hover:bg-white/80'
                  }
                `}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}