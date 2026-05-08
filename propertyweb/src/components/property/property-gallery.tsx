"use client";

import { useState } from "react";
import { mediaAbsoluteUrl } from "@/lib/api";
import { ImageLightbox } from "@/components/property/image-lightbox";
import { Home } from "lucide-react";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const heroSrc = images.length ? mediaAbsoluteUrl(images[0]) : null;
  const thumbs = images.slice(1, 5);

  function openAt(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div>
        {heroSrc ? (
          <button
            onClick={() => openAt(0)}
            className="block w-full cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-lift"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={title}
              className="aspect-video w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                1 / {images.length}
              </span>
            )}
          </button>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted/30">
            <Home className="size-16 text-muted-foreground/30" />
          </div>
        )}
        {thumbs.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {thumbs.map((u, i) => (
              <button
                key={u}
                onClick={() => openAt(i + 1)}
                className="cursor-pointer overflow-hidden rounded-xl border transition-all hover:shadow-lift"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaAbsoluteUrl(u)}
                  alt={`Photo ${i + 2}`}
                  className="aspect-video w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </button>
            ))}
            {images.length > 5 && (
              <button
                onClick={() => openAt(5)}
                className="flex aspect-video items-center justify-center rounded-xl border bg-muted/30 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
              >
                +{images.length - 5} more
              </button>
            )}
          </div>
        )}
      </div>

      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
