// ============================================================
// Supabase Storage Helpers
// ============================================================

import { supabase } from "./supabase";

const BUCKET_NAME = "magnma-images";

/**
 * Upload a file to Supabase Storage and return its public URL.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<{ url: string; error: Error | null }> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fullPath = `${path}.${fileExt}`;

  // Infer content type from extension to avoid application/octet-stream rejections
  const extToMime: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
  };
  const contentType = extToMime[fileExt] || file.type || "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fullPath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType,
    });

  if (uploadError) {
    return { url: "", error: new Error(uploadError.message) };
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
  return { url: data.publicUrl, error: null };
}

/**
 * Upload multiple files and return their public URLs.
 */
export async function uploadMultipleImages(
  files: File[],
  basePath: string
): Promise<{ urls: string[]; error: Error | null }> {
  const urls: string[] = [];
  for (const file of files) {
    const timestamp = Date.now();
    const { url, error } = await uploadImage(file, `${basePath}/${timestamp}`);
    if (error) {
      return { urls, error };
    }
    urls.push(url);
  }
  return { urls, error: null };
}