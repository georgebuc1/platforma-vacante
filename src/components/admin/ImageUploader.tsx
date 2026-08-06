import { useEffect, useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { uploadOfferImage, deleteOfferImage } from '@/services/imageService';
import { showToast } from '@/components/common/Toast';

interface ImageUploaderProps {
  initialImages: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface UploadItem {
  id: string;
  previewUrl: string;
  progress: number;
  error?: string;
}

export default function ImageUploader({ initialImages, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(() => {
    setImages(initialImages);
    imagesRef.current = initialImages;
  }, [initialImages]);

  const updateImages = (next: string[]) => {
    imagesRef.current = next;
    setImages(next);
    onChange(next);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    const slotsAvailable = maxImages - imagesRef.current.length;
    const filesToUpload = files.slice(0, slotsAvailable);
    if (files.length > slotsAvailable) {
      showToast(`Maximum ${maxImages} imagini per ofertă.`, 'error');
    }

    const uploadPromises = filesToUpload.map(async (file) => {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setUploads((prev) => [...prev, { id, previewUrl, progress: 0 }]);

      try {
        const result = await uploadOfferImage(file, {
          onProgress: (pct) => {
            setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: pct } : u)));
          },
        });
        const next = [...imagesRef.current, result.publicUrl];
        imagesRef.current = next;
        setImages(next);
        onChange(next);
        setUploads((prev) => prev.filter((u) => u.id !== id));
        URL.revokeObjectURL(previewUrl);
        showToast('Imagine încărcată cu succes.', 'success');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Eroare la încărcare.';
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, error: errorMsg } : u)));
        showToast(errorMsg, 'error');
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.id !== id));
          URL.revokeObjectURL(previewUrl);
        }, 3000);
      }
    });

    await Promise.allSettled(uploadPromises);
  };

  const handleRemove = async (index: number) => {
    const url = imagesRef.current[index];
    if (!url) return;
    try {
      await deleteOfferImage(url);
    } catch {
      // ignore
    }
    updateImages(imagesRef.current.filter((_, i) => i !== index));
    showToast('Imaginea a fost ștearsă.', 'success');
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...imagesRef.current];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    updateImages(next);
    showToast('Ordinea imaginilor a fost actualizată.', 'success');
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 && uploads.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/50 transition-colors py-12 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="text-sm font-semibold text-slate-600">Selectează imagini</div>
          <div className="text-xs text-slate-400">JPG, PNG sau WEBP — maxim 5 MB fiecare</div>
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 cursor-move transition-all ${
                  dragIndex === index ? 'opacity-50' : ''
                } ${dragOverIndex === index ? 'ring-2 ring-brand-500' : ''}`}
              >
                <img src={url} alt={`Imagine ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-md bg-brand-600 text-white text-xs font-bold px-2 py-0.5">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-error-600 text-white hover:bg-error-700 shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Șterge imaginea"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
            {uploads.map((upload) => (
              <div key={upload.id} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100">
                <img src={upload.previewUrl} alt="Se încarcă" className="h-full w-full object-cover opacity-60" />
                {upload.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-error-50/90 p-2">
                    <AlertCircle className="h-5 w-5 text-error-600" />
                    <span className="text-xs text-error-700 text-center">{upload.error}</span>
                  </div>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-white font-medium">{upload.progress}%</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full bg-white transition-all duration-200 ease-out" style={{ width: `${upload.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {images.length < maxImages && (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm">
              <Upload className="h-4 w-4" /> Adaugă imagini
            </button>
          )}
        </>
      )}
    </div>
  );
}
