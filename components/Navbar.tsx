"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import currencyIcons from "currency-icons";
import { CurrencyCode, currencyMeta } from "@/lib/catalog";
import { MiniWatch } from "@/components/MiniWatch";

type NavbarProps = {
  selectedCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  showCurrency?: boolean;
  backLink?: boolean;
};

const currencies = Object.keys(currencyMeta) as CurrencyCode[];
const iconMap = currencyIcons as Record<string, { icon?: string }>;

export function Navbar({
  selectedCurrency = "GBP",
  onCurrencyChange,
  showCurrency = false,
  backLink = false
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`nav-glass nav-reveal ${isScrolled ? "nav-scrolled" : "nav-top"}`}
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Image
          src="/images/favicon.png"
          alt="HAKS & CO logo"
          width={42}
          height={42}
          priority
          className="hidden h-9 w-9 object-contain sm:block md:h-[42px] md:w-[42px]"
        />
        <span className="brand-wordmark whitespace-nowrap">HAKS & CO</span>
      </Link>

      <div className="flex items-center justify-center">
        <MiniWatch />
      </div>

      <div className="flex items-center justify-end gap-5">
        {!backLink && (
          <nav className="hidden items-center gap-6 lg:flex">
            <a className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-emberLight" href="#collections">
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.25" />
                <path d="M8 9.5h8M8 13.5h5.5" />
                </svg>
              </span>
              Collections
            </a>
            <a className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-emberLight" href="#craftsmanship">
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4.2 6.2 10h2.5v6h6.6v-6h2.5L12 4.2Z" />
                <path d="M10 13.2h4" />
                </svg>
              </span>
              Craftsmanship
            </a>
            <a className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-emberLight" href="#legacy">
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 5 1.35 2.65L16 9l-2.65 1.35L12 13l-1.35-2.65L8 9l2.65-1.35L12 5Z" />
                <circle cx="12" cy="9" r="0.2" />
                </svg>
              </span>
              Legacy
            </a>
          </nav>
        )}

        {showCurrency && (
          <label className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-white transition hover:border-white/25 hover:bg-white/[0.07]">
            {iconMap[selectedCurrency]?.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconMap[selectedCurrency].icon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 rounded-full object-cover opacity-95 brightness-0 invert"
              />
            ) : null}
            <select
              className="cursor-pointer border-0 bg-transparent text-xs font-semibold uppercase tracking-[0.12em] text-white outline-none"
              aria-label="Select currency"
              value={selectedCurrency}
              onChange={(event) => onCurrencyChange?.(event.target.value as CurrencyCode)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency} className="bg-obsidian text-white">
                  {currency}
                </option>
              ))}
            </select>
          </label>
        )}

        {backLink && (
          <Link
            href="/"
            className="hidden text-xs uppercase tracking-[0.18em] text-white/70 transition hover:text-emberLight md:block"
          >
            Back to Collections
          </Link>
        )}
      </div>
    </motion.header>
  );
}
