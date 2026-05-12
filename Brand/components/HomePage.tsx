"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { WatchModel, WatchModelController } from "@/components/three/WatchModel";
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
          posY: isMobileTour ? -0.34 : -0.44,
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
          defaults: { ease: "power2.inOut" },
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
            scrub: 1.05,
            anticipatePin: 1,
            fastScrollEnd: true,
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
              watchTourRef.current?.setInteractive(true);
              watchTourRef.current?.resetToIdle();
            }
          }
        });

        const k = isMobileTour
          ? {
              p1: -0.52,
              p2: -0.8,
              p3: -1.04,
              p4: -1.24,
              c1: 7.35,
              c2: 7.1,
              c3: 6.95,
              c4: 7.55,
              y1: 0.04,
              y2: -0.08,
              y3: -0.18,
              y4: -0.28
            }
          : {
              p1: -0.68,
              p2: -1.02,
              p3: -1.34,
              p4: -1.64,
              c1: 7.45,
              c2: 7.1,
              c3: 6.85,
              c4: 8.05,
              y1: 0.02,
              y2: -0.12,
              y3: -0.24,
              y4: -0.36
            };

        timeline
          .to(state, { rotY: -0.42, rotX: 0.34, posX: -0.08, posY: k.p1, scale: 1.03, duration: 1.2, onUpdate: apply }, 0)
          .to(state, { camZ: k.c1, camX: -0.18, camY: k.y1, key: 5.8, ember: 3.1, panelGlow: 0.3, duration: 1.2, onUpdate: apply }, 0)
          .to(state, { rotY: 0.25, rotX: 0.21, posX: 0.18, posY: k.p2, scale: 1.08, duration: 1.2, onUpdate: apply }, 1)
          .to(state, { camZ: k.c2, camX: 0.16, camY: k.y2, fill: 3.0, key: 5.6, panelGlow: 0.36, duration: 1.2, onUpdate: apply }, 1)
          .to(state, { rotY: 1.16, rotX: 0.28, rotZ: -0.26, posX: 0.1, posY: k.p3, scale: 1.1, duration: 1.2, onUpdate: apply }, 2)
          .to(state, { camZ: k.c3, camX: 0.32, camY: k.y3, ember: 3.4, ambient: 2.2, panelGlow: 0.42, duration: 1.2, onUpdate: apply }, 2)
          .to(state, { rotY: 2.15, rotX: 0.3, rotZ: -0.18, posX: 0, posY: k.p4, scale: 0.98, duration: 1.2, onUpdate: apply }, 3)
          .to(state, { camZ: k.c4, camX: 0, camY: k.y4, key: 4.95, fill: 2.35, ember: 2.45, ambient: 2.75, panelGlow: 0.25, duration: 1.2, onUpdate: apply }, 3);

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

        <section
          id="craftsmanship"
          ref={craftSectionRef}
          className="relative bg-[#080808]"
        >
          <div
            ref={craftPinRef}
            className="relative flex w-full overflow-hidden px-5 py-8 md:px-10 lg:px-20"
            style={{
              height: `calc(100dvh - ${navHeight}px)`
            }}
          >
            <div
              ref={craftPanelRef}
              className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_72%_50%,rgba(139,32,56,0.22),transparent_62%)] transition-[background] duration-500"
            />

            <div
              className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:gap-10"
            >
              <div className="max-w-none pr-0 lg:pr-8">
                <p className="eyebrow">Interactive Preview</p>
                <h2 className="display-title max-w-[15ch] text-balance text-[clamp(2rem,4.2vw,4.25rem)] leading-[0.94]">
                  The Masterpiece Up Close
                </h2>
                <p className="body-copy mt-5 max-w-[52ch] text-[clamp(1rem,1.15vw,1.35rem)] leading-[1.55]">
                  Scroll through a guided narrative from architecture to wrist presence. The watch intentionally drops
                  lower through each chapter to reveal silhouette, structure, and mechanical identity.
                </p>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-emberLight">
                    Chapter {craftChapterIndex + 1} / {craftChapters.length}
                  </p>
                  <h3 className="mt-3 max-w-[18ch] font-serif text-[clamp(2.1rem,3.2vw,3.7rem)] leading-[0.95] text-white">
                    {craftChapters[craftChapterIndex].title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/[0.7] md:text-base">
                    {craftChapters[craftChapterIndex].description}
                  </p>
                  <p className="mt-3 text-[0.72rem] uppercase tracking-[0.18em] text-white/[0.48]">
                    {craftChapterIndex === 0 && "Opening the silhouette and outer case stance"}
                    {craftChapterIndex === 1 && "Reframing toward dial depth and visual hierarchy"}
                    {craftChapterIndex === 2 && "Dropping lower for crown mechanics and side detailing"}
                    {craftChapterIndex === 3 && "Final wrist-level posture and balanced profile reveal"}
                  </p>
                  <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      ref={craftProgressBarRef}
                      className="h-full origin-left scale-x-0 bg-ember"
                    />
                  </div>
                </div>
              </div>

              <div>
                <WatchModel
                  ref={watchTourRef}
                  className="h-[360px] w-full md:h-[min(58vh,560px)]"
                  targetSize={4}
                  cameraZ={8}
                  allowZoom
                  interactive={false}
                />
                <p className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-white/[0.36]">
                  {tourCompleted
                    ? "Tour complete. Drag to inspect the watch."
                    : "Scroll to continue the guided cinematic tour."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="collections" className="bg-obsidian px-5 py-24 md:px-10 lg:px-20">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="eyebrow">Featured Models</p>
            <h2 className="display-title text-[clamp(3rem,6vw,5.4rem)]">Signature 3D Collection</h2>
            <p className="body-copy mx-auto mt-6 max-w-2xl">
              Each model is presented with a transparent 3D viewer, restrained copy, and direct checkout entry.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {products.map((product, index) => {
              const link = productLinks[index];

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.62, delay: index * 0.08 }}
                  className="group relative overflow-hidden border border-white/[0.055] bg-white/[0.018] px-5 pb-9 pt-2 text-center transition duration-500 hover:-translate-y-2 hover:bg-white/[0.035]"
                >
                  <div className="absolute inset-x-8 top-8 h-28 bg-ember/[0.15] blur-3xl transition duration-500 group-hover:bg-ember/25" />
                  <WatchModel
                    className="relative mx-auto h-64 w-full"
                    targetSize={2.82}
                    cameraZ={6.8}
                    initialRotationY={product.rotation}
                    autoRotateSpeed={0.006 + index * 0.002}
                    interactive={false}
                    allowZoom={false}
                  />
                  <h3 className="mt-[-1.25rem] font-serif text-3xl font-semibold leading-none text-white">{product.name}</h3>
                  <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-white/[0.58]">{product.description}</p>
                  <p className="mt-5 text-xs uppercase tracking-[0.2em] text-emberLight">{product.finish}</p>
                  <div className="mt-5 font-serif text-3xl font-semibold text-white">
                    {link.price}
                    <span className="mt-1 block font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-emberLight">
                      Free worldwide shipping
                    </span>
                  </div>
                  <Link href={link.href} className="outline-button mt-7">
                    Buy Now
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section id="legacy" className="craft-grid grid gap-10 bg-obsidian px-5 py-24 md:px-10 lg:grid-cols-2 lg:px-20">
          <div className="gsap-rise max-w-xl">
            <p className="eyebrow">Signature Collection</p>
            <h2 className="display-title text-[clamp(3rem,5vw,4.8rem)]">Timeless Maroon Elegance</h2>
            <p className="body-copy mt-7">
              Inspired by heritage luxury watch houses with a bold contemporary presence. Designed to feel powerful,
              elite, and unforgettable.
            </p>
          </div>

          <div className="grid gap-6">
            {valueCards.map((card) => (
              <div key={card.title} className="gsap-rise glass-panel p-8 md:p-11">
                <h3 className="font-serif text-4xl font-semibold text-white">{card.title}</h3>
                <p className="body-copy mt-3">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-cover bg-center px-5 py-24 text-center"
          style={{ backgroundImage: "url(/images/p3.png)" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.88))]" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="eyebrow">Limited Edition Presence</p>
            <h2 className="display-title text-[clamp(3rem,7vw,5.5rem)]">Crafted For The Extraordinary</h2>
            <p className="mt-6 text-base leading-8 text-white/[0.74]">
              A statement of success, sophistication, and timeless ambition.
            </p>
          </div>
        </section>

        <section className="grid gap-6 bg-obsidian px-5 py-24 md:px-10 lg:grid-cols-3 lg:px-20">
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55 }}
              className="glass-panel p-8 md:p-11"
            >
              <h3 className="font-serif text-[clamp(2.3rem,4vw,3.4rem)] font-semibold leading-none text-white">{pillar.title}</h3>
              <p className="body-copy mt-5">{pillar.description}</p>
            </motion.div>
          ))}
        </section>
      </main>

      {showSkipTour && !tourCompleted && tourReady && tourInView && (
        <button
          type="button"
          onClick={handleSkipTour}
          className="fixed bottom-6 right-6 z-[120] rounded-full border border-white/[0.2] bg-black/[0.75] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:bg-ember/75"
        >
          Skip Tour
        </button>
      )}

      <footer className="bg-[#020202] px-5 py-16 text-center text-white/[0.45]">
        <div className="font-serif text-4xl font-semibold tracking-[0.18em] text-white">HAKS & CO</div>
        <p className="mt-4 text-sm">Luxury Watch House 2026</p>
      </footer>
    </div>
  );
}
