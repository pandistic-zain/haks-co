export type CurrencyCode = "GBP" | "USD" | "PKR" | "INR" | "CNY";

export const currencyMeta: Record<
  CurrencyCode,
  { symbol: string; locale: string; label: string }
> = {
  GBP: { symbol: "GBP", locale: "en-GB", label: "GBP" },
  USD: { symbol: "$", locale: "en-US", label: "USD" },
  PKR: { symbol: "PKR", locale: "en-PK", label: "PKR" },
  INR: { symbol: "INR", locale: "en-IN", label: "INR" },
  CNY: { symbol: "CNY", locale: "zh-CN", label: "CNY" }
};

export const fallbackUsdRates: Record<CurrencyCode, number> = {
  USD: 1,
  GBP: 0.7875,
  PKR: 278,
  INR: 83,
  CNY: 7.2
};

export const products = [
  {
    id: "al-qalea-legacy",
    name: "Hak's & Co Al-Qalea Legacy",
    shortName: "Al-Qalea Legacy",
    baseUsd: 8400,
    description: "Swiss automatic movement with a bold collector focused presence.",
    finish: "Brushed steel / onyx dial",
    rotation: 0
  },
  {
    id: "al-qalea-legacy-brown",
    name: "Hak's & Co Al-Qalea Legacy Brown",
    shortName: "Legacy Brown",
    baseUsd: 12900,
    description: "Elegant luxury design inspired by timeless watchmaking tradition.",
    finish: "Rose gold / tobacco strap",
    rotation: 0.68
  },
  {
    id: "al-qalea-legacy-gold",
    name: "Hak's & Co Al-Qalea Legacy Gold",
    shortName: "Legacy Gold",
    baseUsd: 18500,
    description: "A statement piece created for sophistication, precision, and power.",
    finish: "Gold case / maroon accents",
    rotation: 1.2
  }
] as const;

export const articleSlides = [
  {
    tag: "Visual Legacy",
    title: "Every Scroll Reveals Another Statement",
    description:
      "Explore a cinematic showcase where each background changes smoothly while the message remains focused and elegant.",
    image: "/images/p2.png"
  },
  {
    tag: "Precision In Motion",
    title: "Engineered For Those Who Lead",
    description:
      "A bold expression of control, accuracy, and presence. Every detail reflects the discipline of luxury watchmaking.",
    image: "/images/p1.png"
  },
  {
    tag: "Modern Heritage",
    title: "Crafted Beyond The Moment",
    description:
      "From polished metal to timeless silhouettes, each piece is created to feel rare, powerful, and unforgettable.",
    image: "/images/p3.png"
  }
] as const;

export const valueCards = [
  {
    title: "Swiss Movement",
    description: "Engineered for accuracy, endurance, and long lasting performance."
  },
  {
    title: "Collector Finish",
    description: "Premium detailing made for people who value distinctive design."
  }
] as const;

export const pillars = [
  {
    title: "Precision",
    description: "Swiss-grade excellence refined to perfection."
  },
  {
    title: "Luxury",
    description: "Premium finishes with deep maroon sophistication."
  },
  {
    title: "Heritage",
    description: "Inspired by iconic watchmaking traditions."
  }
] as const;

export const checkoutFeatures = [
  {
    number: "01",
    title: "Swiss And Japanese Precision",
    description:
      "Engineered with precision influence and reliable everyday performance for collectors who value accuracy.",
    image: "/images/p1.png"
  },
  {
    number: "02",
    title: "Inspired By Chess",
    description:
      "The brand identity is shaped around power, strategy, and becoming the best version of yourself.",
    image: "/images/p2.png"
  },
  {
    number: "03",
    title: "Al-Qalea Legacy",
    description:
      "A limited-edition design created as a statement piece with ambitious craftsmanship and modern presence.",
    image: "/images/p3.png"
  },
  {
    number: "04",
    title: "Individual Character",
    description:
      "Designed for people who break conventions, celebrate individuality, and wear something with purpose.",
    image: "/images/p1.png"
  },
  {
    number: "05",
    title: "Worldwide Shipping",
    description:
      "Checkout is built for international customers with delivery details, secure payment, and order confirmation.",
    image: "/images/p2.png"
  }
] as const;

export function isCurrencyCode(value: string | null): value is CurrencyCode {
  return value === "GBP" || value === "USD" || value === "PKR" || value === "INR" || value === "CNY";
}
