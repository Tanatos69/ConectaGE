"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // user cancelled or API unavailable
    }
  }

  return (
    <>
      <div className="space-y-2">
        {/* Main image */}
        <div
          className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-secondary"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[idx]}
            alt={`${title} — imagen ${idx + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 65vw"
            className="object-cover"
          />
          <button
            onClick={(e) => { e.stopPropagation(); share(); }}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background"
            aria-label="Compartir anuncio"
          >
            <Share2 className="size-4" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                {idx + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === idx
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <Image src={src} alt={`Miniatura ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes"
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/20 text-white"
            aria-label="Cerrar galería"
          >
            <X className="size-6" />
          </button>
          <div className="relative h-[80vh] w-[90vw] max-w-4xl">
            <Image src={images[idx]} alt={title} fill sizes="90vw" className="object-contain" />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-white/20 text-white"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-white/20 text-white"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
