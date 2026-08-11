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
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <img
        src={images[currentIndex]}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500"
      />

      {hasMultipleImages && (
        <>
          <button
            onClick={previousImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
  {images.map((_, index) => (
    <button
      key={index}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex(index);
      }}
      className={`h-2 w-2 rounded-full transition-all ${
        index === currentIndex
          ? 'bg-white'
          : 'bg-white/50 hover:bg-white/80'
      }`}
    />
  ))}
</div>


        </>
      )}
    </div>
  );
}