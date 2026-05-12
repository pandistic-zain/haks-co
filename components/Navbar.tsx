"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CurrencyCode, currencyMeta } from "@/lib/catalog";
import { MiniWatch } from "@/components/MiniWatch";

type NavbarProps = {
  selectedCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  showCurrency?: boolean;
  backLink?: boolean;
};

const currencies = Object.keys(currencyMeta) as CurrencyCode[];

export function Navbar({
  selectedCurrency = "GBP",
  onCurrencyChange,
  showCurrency = false,
  backLink = false
}: NavbarProps) {
  return (
    <motion.header
      className="nav-glass nav-reveal"
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
            <a className="text-xs uppercase tracking-[0.18em] text-white/70 transition hover:text-emberLight" href="#collections">
              Collections
            </a>
            <a className="text-xs uppercase tracking-[0.18em] text-white/70 transition hover:text-emberLight" href="#craftsmanship">
              Craftsmanship
            </a>
            <a className="text-xs uppercase tracking-[0.18em] text-white/70 transition hover:text-emberLight" href="#legacy">
              Legacy
            </a>
          </nav>
        )}

        {showCurrency && (
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white">
            <span className="hidden min-w-8 text-right text-white/80 sm:inline">
              {currencyMeta[selectedCurrency].symbol}
            </span>
            <select
              className="cursor-pointer border-0 bg-transparent text-xs uppercase tracking-[0.18em] text-white outline-none"
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
