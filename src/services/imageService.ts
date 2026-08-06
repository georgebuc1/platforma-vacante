/**
 * Supabase Storage service — handles image uploads, deletions, and URL generation
 * for the "offers" public bucket.
 */

import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'offers';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
}

/**
 * Upload an image file to the offers bucket with a unique filename.
 * Uses XMLHttpRequest for upload progress tracking.
 * Returns the public URL of the uploaded file.
 * Throws a user-friendly Romanian error message on failure.
 */
export async function uploadOfferImage(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Format neacceptat. Folosește JPG, PNG sau WEBP.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Imaginea este prea mare. Dimensiunea maximă este 5 MB.');
  }

  // Generate unique filename: YYYYMMDD-uuid.ext
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const uniquePart = crypto.randomUUID();
  const fileName = `${datePart}-${uniquePart}.${ext}`;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${fileName}`;

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token || supabaseKey;

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'false');

    if (options?.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          options.onProgress!(pct);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        resolve({ path: fileName, publicUrl: urlData.publicUrl });
      } else {
        reject(new Error('Nu s-a putut încărca imaginea. Încearcă din nou.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Eroare de conexiune la încărcarea imaginii.'));
    };

    xhr.send(file);
  });
}

/**
 * Extract the storage path from a public URL.
 * Returns null if the URL doesn't belong to our bucket.
 */
export function extractStoragePath(publicUrl: string): string | null {
  if (!publicUrl) return null;
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split('/offers/');
    if (parts.length < 2) return null;
    return decodeURIComponent(parts[1]);
  } catch {
    return null;
  }
}

/**
 * Delete an image from the offers bucket by its public URL.
 * Silently ignores errors (e.g. if the image was already deleted or is an external URL).
 */
export async function deleteOfferImage(publicUrl: string): Promise<void> {
  const path = extractStoragePath(publicUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error('Failed to delete image:', error.message);
  }
}
