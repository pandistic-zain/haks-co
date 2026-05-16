"use client";

import { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WatchModel, type WatchModelController } from "@/components/three/WatchModel";

type CraftChapter = {
  title: string;
  description: string;
};

type CraftTourSectionProps = {
  navHeight: number;
  craftSectionRef: RefObject<HTMLElement | null>;
  craftPinRef: RefObject<HTMLDivElement | null>;
  craftPanelRef: RefObject<HTMLDivElement | null>;
  craftProgressBarRef: RefObject<HTMLDivElement | null>;
  watchTourRef: RefObject<WatchModelController | null>;
  craftChapterIndex: number;
  craftChapters: readonly CraftChapter[];
};

export function CraftTourSection({
  navHeight,
  craftSectionRef,
  craftPinRef,
  craftPanelRef,
  craftProgressBarRef,
  watchTourRef,
  craftChapterIndex,
  craftChapters
}: CraftTourSectionProps) {
  return (
    <section id="craftsmanship" ref={craftSectionRef} className="relative bg-[#080808]">
      <div
        ref={craftPinRef}
        className="relative flex w-full overflow-visible px-5 py-8 md:px-10 lg:px-20"
        style={{
          height: `calc(100dvh - ${navHeight}px)`
        }}
      >
        <div
          ref={craftPanelRef}
          className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_72%_50%,rgba(139,32,56,0.22),transparent_62%)] transition-[background] duration-500"
        />

        <div className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
          <div className="max-w-none pr-0 lg:pr-8">
            <p className="mb-4 inline-flex items-center text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-emberLight/95">
              Interactive Preview
            </p>
            <h2 className="max-w-[14ch] text-balance font-serif text-5xl font-semibold leading-[0.95] text-white md:text-6xl">
              The Masterpiece Up Close
            </h2>
            <p className="mt-5 max-w-[52ch] text-base font-medium leading-8 text-white/[0.64] md:text-lg">
              Scroll through a guided narrative from architecture to wrist presence. The watch intentionally drops
              lower through each chapter to reveal silhouette, structure, and mechanical identity.
            </p>

            <div className="mt-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={craftChapterIndex}
                  initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emberLight">
                    Chapter {craftChapterIndex + 1} / {craftChapters.length}
                  </p>
                  <h3 className="mt-3 max-w-[16ch] font-serif text-4xl font-medium leading-none text-white md:text-5xl">
                    {craftChapters[craftChapterIndex].title}
                  </h3>
                  <p className="mt-4 max-w-[48ch] text-base leading-7 text-white/[0.68]">
                    {craftChapters[craftChapterIndex].description}
                  </p>
                  <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                    {craftChapterIndex === 0 && "Opening the silhouette and outer case stance"}
                    {craftChapterIndex === 1 && "Reframing toward dial depth and visual hierarchy"}
                    {craftChapterIndex === 2 && "Dropping lower for crown mechanics and side detailing"}
                    {craftChapterIndex === 3 && "Final wrist-level posture and balanced profile reveal"}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  ref={craftProgressBarRef}
                  className="h-full origin-left scale-x-0 bg-gradient-to-r from-ember to-emberLight"
                />
              </div>
            </div>
          </div>

          <div className="relative z-20">
            <div className="h-[min(58vh,560px)] w-full overflow-visible">
              <div className="origin-top translate-y-16 scale-[1.24] md:translate-y-20 md:scale-[1.34]">
                <WatchModel
                  ref={watchTourRef}
                  className="h-full w-full"
                  targetSize={4.35}
                  cameraZ={7.15}
                  autoRotateSpeed={0}
                  allowZoom
                  interactive={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
