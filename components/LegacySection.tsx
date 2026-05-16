import MagicBento from "@/components/MagicBento";

type LegacyCard = {
  title: string;
  description: string;
};

type LegacyPillar = {
  title: string;
  description: string;
};

type LegacySectionProps = {
  cards: readonly LegacyCard[];
  pillars: readonly LegacyPillar[];
};

export function LegacySection({ cards, pillars }: LegacySectionProps) {
  const primaryCard = cards[0];
  const secondaryCard = cards[1];

  const bentoCards = [
    {
      label: "01 Signature Engine",
      title: primaryCard?.title ?? "Swiss Movement",
      description: primaryCard?.description ?? "Engineered for accuracy, endurance, and long lasting performance.",
      color: "rgba(14,14,16,0.98)"
    },
    {
      label: "02 Collector Craft",
      title: secondaryCard?.title ?? "Collector Finish",
      description: secondaryCard?.description ?? "Premium detailing made for people who value distinctive design.",
      color: "rgba(14,14,16,0.98)"
    },
    {
      label: "Limited Edition Presence",
      title: "Crafted For The Extraordinary",
      description: "A statement of success, sophistication, and timeless ambition.",
      className: "magic-bento-card--hero",
      style: {
        backgroundImage:
          "linear-gradient(to bottom, rgba(3,3,4,0.42), rgba(3,3,4,0.86)), url('/images/p3.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    },
    ...pillars.map((pillar, index) => ({
      label: `0${index + 3} Pillar`,
      title: pillar.title,
      description: pillar.description,
      color: "rgba(14,14,16,0.98)"
    }))
  ];

  return (
    <section id="legacy" className="craft-grid relative overflow-hidden bg-obsidian px-5 py-24 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-ember/10 blur-[120px]" />

      <div className="relative">
        <div className="gsap-rise max-w-3xl">
          <p className="eyebrow">Signature Collection</p>
          <h2 className="display-title text-[clamp(3rem,5vw,5.15rem)]">Timeless Maroon Elegance</h2>
          <p className="body-copy mt-7 max-w-xl">
            Inspired by heritage luxury watch houses with a bold contemporary presence. Designed to feel powerful,
            elite, and unforgettable.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-emberLight">Identity</p>
              <p className="mt-2 text-sm font-medium text-white/85">Maroon Signature Tone</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-emberLight">Craft</p>
              <p className="mt-2 text-sm font-medium text-white/85">Collector Grade Finishing</p>
            </div>
          </div>
        </div>

        <div className="gsap-rise legacy-magic-bento mt-12">
          <MagicBento
            cards={bentoCards}
            textAutoHide={false}
            enableStars={false}
            enableSpotlight
            enableBorderGlow
            disableAnimations={false}
            spotlightRadius={260}
            enableTilt={false}
            clickEffect={false}
            enableMagnetism={false}
            glowColor="139, 32, 56"
            gridClassName="legacy-bento-grid"
          />
        </div>
      </div>
    </section>
  );
}
