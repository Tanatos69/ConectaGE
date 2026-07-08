/**
 * Client-side image compression for uploads. Downscales to a max dimension
 * and re-encodes as WebP (JPEG fallback for old Safari), stepping quality
 * down until the result fits the byte target. Keeps the Supabase free-tier
 * 1GB storage / 5GB egress caps stretching much further than raw camera
 * photos (often 3–8MB each) would allow.
 */

interface CompressOptions {
  /** Longest side of the output, px. Never upscales. */
  maxDimension: number;
  /** Aim for at most this many bytes (best effort, quality floor applies). */
  targetBytes: number;
}

/** Compression presets used across the app. */
export const LISTING_PHOTO_PRESET: CompressOptions = {
  maxDimension: 1600,
  targetBytes: 380_000,
};

export const AVATAR_PRESET: CompressOptions = {
  maxDimension: 500,
  targetBytes: 150_000,
};

function supportsWebP(): boolean {
  try {
    return document
      .createElement("canvas")
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a new, smaller File. If anything goes wrong (corrupt image, odd
 * format the canvas can't decode), the ORIGINAL file is returned unchanged —
 * a failed optimization must never block an upload.
 */
export async function compressImage(file: File, options: CompressOptions): Promise<File> {
  try {
    // Skip non-images and tiny files that are already under target.
    if (!file.type.startsWith("image/") || file.size <= options.targetBytes) {
      return file;
    }

    const img = await loadImage(file);
    const scale = Math.min(1, options.maxDimension / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const useWebP = supportsWebP();
    const mime = useWebP ? "image/webp" : "image/jpeg";
    const ext = useWebP ? "webp" : "jpg";

    let quality = 0.82;
    let blob: Blob | null = null;
    for (let i = 0; i < 5; i++) {
      blob = await toBlob(canvas, mime, quality);
      if (!blob) return file;
      if (blob.size <= options.targetBytes || quality <= 0.4) break;
      quality = Math.max(0.4, quality - 0.12);
    }
    if (!blob) return file;

    // Only keep the re-encode if it actually helped.
    if (blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${base}.${ext}`, { type: mime });
  } catch {
    return file;
  }
}
