"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { CraftTourSection } from "@/components/CraftTourSection";
import { LegacySection } from "@/components/LegacySection";
import { ProductCard } from "@/components/ProductCard";
import { SkipTourButton } from "@/components/SkipTourButton";
import { WatchModelController } from "@/components/three/WatchModel";
import {
  CurrencyCode,
  articleSlides,
  fallbackUsdRates,
  pillars,
  products,
  valueCards
} from "@/lib/catalog";
import { convertUsd, formatCurrencyAmount, getClientCurrencyRates } from "@/lib/currency";

const validCurrencies: CurrencyCode[] = ["GBP", "USD", "PKR", "INR", "CNY"];

const craftChapters = [
  {
    title: "Case Architecture",
    description: "Sculpted case profile with balanced lugs and maroon-accented surfaces."
  },
  {
    title: "Dial Geometry",
    description: "Deep dial layering and precision contrasts tuned for low-light elegance."
  },
  {
    title: "Crown Engineering",
    description: "Tactile crown proportions built for control and durable mechanical feel."
  },
  {
    title: "Wrist Presence",
    description: "Final full-profile stance designed for authority without visual noise."
  }
] as const;

export function HomePage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const craftSectionRef = useRef<HTMLElement | null>(null);
  const craftPinRef = useRef<HTMLDivElement | null>(null);
  const craftPanelRef = useRef<HTMLDivElement | null>(null);
  const craftProgressBarRef = useRef<HTMLDivElement | null>(null);
  const watchTourRef = useRef<WatchModelController | null>(null);
  const craftTimelineRef = useRef<{
    timeline: { progress: (value?: number) => number; kill: () => void };
    trigger: { kill: () => void; scroll: (position: number) => void; end: number };
  } | null>(null);

  const [activeArticle, setActiveArticle] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>("GBP");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(fallbackUsdRates);
  const [craftChapterIndex, setCraftChapterIndex] = useState(0);
  const [showSkipTour, setShowSkipTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourReady, setTourReady] = useState(false);
  const [tourInView, setTourInView] = useState(false);
  const [navHeight, setNavHeight] = useState(72);
  const navHeightRef = useRef(72);
  const activeCraftChapterRef = useRef(0);
  const tourCompletedRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("haksCurrency");

    if (validCurrencies.includes(stored as CurrencyCode)) {
      setCurrency(stored as CurrencyCode);
    }

    getClientCurrencyRates().then(setRates);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("haksCurrency", currency);
  }, [currency]);

  useEffect(() => {
    const nav = document.querySelector(".nav-glass") as HTMLElement | null;

    if (!nav) {
      return;
    }

    const updateNavHeight = () => {
      const measured = Math.round(nav.getBoundingClientRect().height) || 72;
      navHeightRef.current = measured;
      setNavHeight((previous) => (previous === measured ? previous : measured));
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateNavHeight);
      observer.observe(nav);
    }

    return () => {
      window.removeEventListener("resize", updateNavHeight);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const section = articleRef.current;

      if (!section) {
        return;
      }

      const totalScroll = section.offsetHeight - window.innerHeight;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(0.999, -rect.top / totalScroll));
      const nextIndex = Math.floor(progress * articleSlides.length);

      setActiveArticle((current) => (current === nextIndex ? current : nextIndex));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const scopeElement = rootRef.current;

    if (!scopeElement) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let clearLoadListener: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollModule]) => {
      if (cancelled) {
        return;
      }

      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollModule;

      gsap.registerPlugin(ScrollTrigger);
      gsap.ticker.lagSmoothing(520, 18);

      const ctx = gsap.context(() => {
        const setStoryProgress = (value: number) => {
          if (craftProgressBarRef.current) {
            gsap.set(craftProgressBarRef.current, {
              scaleX: Math.max(0, Math.min(1, value))
            });
          }
        };

        const setChapter = (chapter: number) => {
          if (activeCraftChapterRef.current !== chapter) {
            activeCraftChapterRef.current = chapter;
            setCraftChapterIndex(chapter);
          }
        };

        const setCompleted = (completed: boolean) => {
          if (tourCompletedRef.current !== completed) {
            tourCompletedRef.current = completed;
            setTourCompleted(completed);
          }
        };

        gsap.to(".hero-video", {
          scale: 1.08,
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.from(".gsap-rise", {
          opacity: 0,
          y: 34,
          duration: 0.85,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".craft-grid",
            start: "top 78%"
          }
        });

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (
          reduceMotion ||
          !craftSectionRef.current ||
          !craftPinRef.current ||
          !watchTourRef.current ||
          !craftPanelRef.current
        ) {
          watchTourRef.current?.resetToIdle();
          watchTourRef.current?.setInteractive(true);
          setTourCompleted(true);
          setShowSkipTour(false);
          setTourInView(false);
          setTourReady(true);
          setStoryProgress(1);
          return;
        }

        watchTourRef.current.resetToIdle();
        watchTourRef.current.setInteractive(false);
        setCompleted(false);
        setChapter(0);
        setShowSkipTour(true);
        setTourReady(true);
        setStoryProgress(0);

        const isMobileTour = window.matchMedia("(max-width: 768px)").matches;

        const state = {
          rotX: 0.38,
          rotY: -0.95,
          rotZ: -0.2,
          posX: isMobileTour ? 0.03 : 0.06,
          posY: isMobileTour ? -0.78 : -0.92,
          scale: isMobileTour ? 0.92 : 0.96,
          camX: 0,
          camY: isMobileTour ? 0.08 : 0.12,
          camZ: isMobileTour ? 7.45 : 8,
          key: 4.9,
          fill: 2.2,
          ember: 2.8,
          ambient: 2.45,
          panelGlow: 0.22
        };

        const apply = () => {
          watchTourRef.current?.setPose({
            rotX: state.rotX,
            rotY: state.rotY,
            rotZ: state.rotZ,
            posX: state.posX,
            posY: state.posY,
            scale: state.scale
          });
          watchTourRef.current?.setCamera({
            x: state.camX,
            y: state.camY,
            z: state.camZ
          });
          watchTourRef.current?.setLighting({
            key: state.key,
            fill: state.fill,
            ember: state.ember,
            ambient: state.ambient
          });

          if (craftPanelRef.current) {
            craftPanelRef.current.style.background =
              `radial-gradient(ellipse at 72% 50%, rgba(139, 32, 56, ${state.panelGlow}), transparent 62%)`;
          }
        };

        apply();

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "craft-tour",
            trigger: craftSectionRef.current,
            start: () => `top top+=${navHeightRef.current}`,
            end: () =>
              "+=" +
              Math.round(
                window.innerHeight * (window.innerWidth < 768 ? 2.7 : 3.15)
              ),
            pin: craftPinRef.current,
            pinType: "fixed",
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            fastScrollEnd: false,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const chapterCount = craftChapters.length;
              const scaledProgress = self.progress * chapterCount;
              const chapter = Math.min(chapterCount - 1, Math.floor(scaledProgress));
              const chapterProgress = Math.max(
                0,
                Math.min(1, scaledProgress - chapter)
              );
              setStoryProgress(chapterProgress);
              setChapter(chapter);
              setCompleted(self.progress > 0.985);
            },
            onToggle: (self) => {
              setTourInView(self.isActive);
            },
            onEnter: () => {
              setTourInView(true);
              setCompleted(false);
              setStoryProgress(0);
              watchTourRef.current?.setInteractive(false);
            },
            onEnterBack: () => {
              setTourInView(true);
              setCompleted(false);
              watchTourRef.current?.setInteractive(false);
            },
            onLeaveBack: () => {
              setTourInView(false);
              setStoryProgress(0);
            },
            onLeave: () => {
              setTourInView(false);
              setCompleted(true);
              setStoryProgress(1);
              watchTourRef.current?.setInteractive(false);
            }
          }
        });

        const k = isMobileTour
          ? {
              p1: -0.68,
              p2: -0.84,
              p3: -1.0,
              p4: -0.78,
              c1: 7.0,
              c2: 6.82,
              c3: 6.74,
              c4: 7.08,
              y1: 0.03,
              y2: -0.02,
              y3: -0.06,
              y4: 0.02
            }
          : {
              p1: -0.82,
              p2: -1.0,
              p3: -1.18,
              p4: -0.9,
              c1: 7.2,
              c2: 6.92,
              c3: 6.82,
              c4: 7.28,
              y1: 0.02,
              y2: -0.04,
              y3: -0.08,
              y4: 0.02
            };

        timeline
          .to(state, { rotY: 0.12, rotX: 0.22, rotZ: -0.05, posX: -0.05, posY: k.p1, scale: 1.08, duration: 1.2, onUpdate: apply }, 0)
          .to(state, { camZ: k.c1, camX: -0.08, camY: k.y1, key: 5.85, ember: 2.9, panelGlow: 0.3, duration: 1.2, onUpdate: apply }, 0)
          .to(state, { rotY: 0.58, rotX: 0.18, rotZ: -0.04, posX: 0.08, posY: k.p2, scale: 1.12, duration: 1.2, onUpdate: apply }, 1)
          .to(state, { camZ: k.c2, camX: 0.1, camY: k.y2, fill: 3.05, key: 5.75, panelGlow: 0.34, duration: 1.2, onUpdate: apply }, 1)
          .to(state, { rotY: 0.92, rotX: 0.2, rotZ: -0.07, posX: 0.04, posY: k.p3, scale: 1.14, duration: 1.2, onUpdate: apply }, 2)
          .to(state, { camZ: k.c3, camX: 0.16, camY: k.y3, ember: 3.15, ambient: 2.45, panelGlow: 0.38, duration: 1.2, onUpdate: apply }, 2)
          .to(state, { rotY: 0.44, rotX: 0.18, rotZ: -0.03, posX: 0, posY: k.p4, scale: 1.06, duration: 1.2, onUpdate: apply }, 3)
          .to(state, { camZ: k.c4, camX: 0, camY: k.y4, key: 5.35, fill: 2.8, ember: 2.55, ambient: 2.7, panelGlow: 0.28, duration: 1.2, onUpdate: apply }, 3);

        const trigger = timeline.scrollTrigger;
        if (trigger) {
          craftTimelineRef.current = { timeline, trigger };
        }

        // Ensure trigger measurements are computed after layout settles.
        requestAnimationFrame(() => ScrollTrigger.refresh(true));
        window.setTimeout(() => ScrollTrigger.refresh(true), 180);

        if (document.fonts?.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh(true));
        }

        const onLoad = () => ScrollTrigger.refresh(true);
        window.addEventListener("load", onLoad);
        clearLoadListener = () => window.removeEventListener("load", onLoad);
      }, scopeElement);

      cleanup = () => {
        craftTimelineRef.current?.timeline.kill();
        craftTimelineRef.current?.trigger.kill();
        craftTimelineRef.current = null;
        clearLoadListener?.();
        ctx.revert();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const activeSlide = articleSlides[activeArticle];

  const productLinks = useMemo(() => {
    return products.map((product) => {
      const price = Math.round(convertUsd(product.baseUsd, currency, rates));
      const params = new URLSearchParams({
        model: product.name,
        price: String(price),
        currency
      });

      return {
        id: product.id,
        href: `/checkout?${params.toString()}`,
        price: formatCurrencyAmount(price, currency)
      };
    });
  }, [currency, rates]);

  const handleSkipTour = () => {
    const timelineHandle = craftTimelineRef.current;

    if (!timelineHandle) {
      return;
    }

    timelineHandle.timeline.progress(1);
    timelineHandle.trigger.scroll(timelineHandle.trigger.end + 2);
    setTourCompleted(true);
    tourCompletedRef.current = true;
    setCraftChapterIndex(craftChapters.length - 1);
    activeCraftChapterRef.current = craftChapters.length - 1;
    if (craftProgressBarRef.current) {
      craftProgressBarRef.current.style.transform = "scaleX(1)";
    }
    watchTourRef.current?.resetToIdle();
    watchTourRef.current?.setInteractive(true);
  };

  return (
    <div ref={rootRef} className="page-shell">
      <Navbar selectedCurrency={currency} onCurrencyChange={setCurrency} showCurrency />

      <main>
        <section className="hero-section noise-overlay relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 pb-20 pt-32 text-center">
          <video
            className="hero-video absolute inset-0 h-full w-full object-cover opacity-80"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/watch.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.34),rgba(0,0,0,0.9)_78%,#050505)]" />
          <motion.div
            className="relative z-10 mx-auto max-w-4xl"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">Prestige Beyond Time</p>
            <h1 className="display-title text-[clamp(3.4rem,10vw,8.5rem)]">TIME TO CONQUER</h1>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-8 text-white/[0.78] md:text-lg">
              Precision engineered masterpieces crafted for collectors, leaders, and visionaries.
            </p>
            <a href="#collections" className="primary-button mt-10">
              Discover Collection
            </a>
          </motion.div>
        </section>

        <section ref={articleRef} className="relative h-[300vh] bg-obsidian">
          <div className="sticky top-0 h-screen overflow-hidden">
            {articleSlides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                  index === activeArticle ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.36),rgba(0,0,0,0.9))]" />
              </div>
            ))}

            <div className="relative z-10 flex h-full items-center px-6 md:px-16 lg:px-20">
              <motion.div
                key={activeSlide.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl"
              >
                <p className="eyebrow">{activeSlide.tag}</p>
                <h2 className="display-title text-[clamp(3rem,7vw,5.6rem)]">{activeSlide.title}</h2>
                <p className="mt-7 max-w-xl text-base leading-8 text-white/[0.74] md:text-lg">{activeSlide.description}</p>
              </motion.div>
            </div>
          </div>
        </section>

        <CraftTourSection
          navHeight={navHeight}
          craftSectionRef={craftSectionRef}
          craftPinRef={craftPinRef}
          craftPanelRef={craftPanelRef}
          craftProgressBarRef={craftProgressBarRef}
          watchTourRef={watchTourRef}
          craftChapterIndex={craftChapterIndex}
          craftChapters={craftChapters}
        />

        <section id="collections" className="bg-obsidian px-5 py-24 md:px-10 lg:px-20">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="eyebrow">Featured Models</p>
            <h2 className="display-title text-[clamp(3rem,6vw,5.4rem)]">Signature 3D Collection</h2>
            <p className="body-copy mx-auto mt-6 max-w-2xl">
              Each model is presented with a transparent 3D viewer, restrained copy, and direct checkout entry.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {products.map((product, index) => {
              const link = productLinks[index];

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  price={link.price}
                  href={link.href}
                  index={index}
                />
              );
            })}
          </div>
        </section>

        <LegacySection cards={valueCards} pillars={pillars} />
      </main>

      {showSkipTour && !tourCompleted && tourReady && tourInView && (
        <SkipTourButton onClick={handleSkipTour} />
      )}

      <footer className="bg-[#020202] px-5 py-16 text-center text-white/[0.45]">
        <div className="font-serif text-4xl font-semibold tracking-[0.18em] text-white">HAKS & CO</div>
        <p className="mt-4 text-sm">Luxury Watch House 2026</p>
        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/55">
          Proposal Presented By{" "}
          <a
            href="https://loopmtech.com"
            target="_blank"
            rel="noreferrer"
            className="text-white transition hover:text-emberLight"
          >
            loopmtech.com
          </a>
        </p>
      </footer>
    </div>
  );
}
