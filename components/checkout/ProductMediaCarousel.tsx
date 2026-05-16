"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WatchModel } from "@/components/three/WatchModel";

type ProductMediaCarouselProps = {
  images: string[];
  modelRotation?: number;
  showModel?: boolean;
};

type Slide =
  | { id: string; type: "model" }
  | { id: string; type: "image"; src: string };

export function ProductMediaCarousel({
  images,
  modelRotation = 0,
  showModel = true
}: ProductMediaCarouselProps) {
  const slides = useMemo<Slide[]>(() => {
    const imageSlides = images.map((src, index) => ({
      id: `image-${index}-${src}`,
      type: "image" as const,
      src
    }));

    if (!showModel) {
      return imageSlides;
    }

    return [{ id: "model-slide", type: "model" }, ...imageSlides];
  }, [images, showModel]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const slide = slides[activeIndex];
  const goTo = (index: number) => setActiveIndex(index);
  const goPrev = () => setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <div className="relative h-[280px] overflow-hidden border border-white/[0.08] bg-white/[0.02] md:h-[360px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {slide.type === "model" ? (
            <WatchModel
              className="h-full w-full"
              targetSize={3.1}
              cameraZ={7}
              initialRotationY={modelRotation}
              interactive={false}
              allowZoom={false}
              autoRotateSpeed={0.0032}
            />
          ) : (
            <Image
              src={slide.src}
              alt="Product gallery image"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              priority={activeIndex === 0}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous media"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.24] bg-black/[0.5] text-white transition hover:bg-black/[0.72]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 stroke-current"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next media"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.24] bg-black/[0.5] text-white transition hover:bg-black/[0.72]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 stroke-current"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to media ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition ${
                  index === activeIndex ? "w-8 bg-emberLight" : "w-4 bg-white/[0.35]"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
