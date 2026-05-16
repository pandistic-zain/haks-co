"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ProductMediaCarousel } from "@/components/checkout/ProductMediaCarousel";
import { checkoutFeatures, isCurrencyCode, products } from "@/lib/catalog";
import { formatCurrencyAmount } from "@/lib/currency";

type PaymentType = "card" | "paypal" | "crypto" | "bank";

const paymentTabs: { id: PaymentType; label: string; note: string }[] = [
  { id: "card", label: "Card", note: "Visa, Mastercard, AMEX" },
  { id: "paypal", label: "PayPal", note: "Express wallet checkout" },
  { id: "crypto", label: "Crypto", note: "USDT and BTC invoice" },
  { id: "bank", label: "Bank", note: "Private bank transfer" }
];

const productMediaById: Record<string, string[]> = {
  "al-qalea-legacy": ["/images/p1.png", "/images/p2.png", "/images/p3.png"],
  "al-qalea-legacy-brown": ["/images/p2.png", "/images/p3.png", "/images/p1.png"],
  "al-qalea-legacy-gold": ["/images/p3.png", "/images/p1.png", "/images/p2.png"]
};

function formatCardValue(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiryValue(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length < 3) {
    return digits;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function CheckoutExperience() {
  const searchParams = useSearchParams();
  const [paymentType, setPaymentType] = useState<PaymentType>("card");
  const [firstName, setFirstName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const checkout = useMemo(() => {
    const model = searchParams.get("model") || products[0].name;
    const selectedProduct = products.find((product) => product.name === model) ?? products[0];
    const rawCurrency = searchParams.get("currency");
    const currency = isCurrencyCode(rawCurrency) ? rawCurrency : "USD";
    const parsedPrice = Number(searchParams.get("price"));
    const price = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : products[0].baseUsd;

    return {
      model,
      productId: selectedProduct.id,
      rotation: selectedProduct.rotation,
      currency,
      price,
      formattedPrice: formatCurrencyAmount(price, currency)
    };
  }, [searchParams]);

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firstName.trim()) {
      return;
    }
    setOrderPlaced(true);
  }

  return (
    <div className="page-shell relative overflow-hidden">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_16%_46%,rgba(139,32,56,0.16),transparent_48%),radial-gradient(ellipse_at_84%_14%,rgba(255,255,255,0.05),transparent_36%),#050505]" />
      <Navbar backLink />

      <main className="relative z-10 mx-auto grid min-h-screen max-w-[1720px] gap-8 px-5 pb-20 pt-28 md:px-10 lg:grid-cols-[0.74fr_1fr] lg:pt-32 xl:grid-cols-[0.72fr_1fr_0.7fr] xl:px-16">
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62 }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <p className="eyebrow">Your Selection</p>
          <ProductMediaCarousel
            images={productMediaById[checkout.productId] ?? productMediaById["al-qalea-legacy"]}
            modelRotation={checkout.rotation}
            showModel
          />

          <div className="glass-panel mt-6 p-7 md:p-8">
            <h1 className="font-serif text-[clamp(2rem,3.4vw,3.25rem)] font-semibold leading-[0.95] text-white">
              {checkout.model}
            </h1>
            <div className="mt-5 flex flex-col gap-3 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-serif text-4xl font-semibold text-white">{checkout.formattedPrice}</p>
              <span className="w-fit border border-ember/45 bg-ember/15 px-4 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-emberLight">
                In Stock
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                ["Movement", "Swiss Automatic"],
                ["Case Material", "316L Stainless Steel"],
                ["Water Resistance", "100M / 330FT"],
                ["Crystal", "Sapphire Anti-Reflective"],
                ["Warranty", "5 Year International"],
                ["Shipping", "Free / Insured / Tracked"]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-5 text-sm text-white/[0.48]">
                  <span>{label}</span>
                  <strong className="text-right font-medium text-white/[0.8]">{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        <motion.form
          onSubmit={submitOrder}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.04 }}
          className="min-w-0"
        >
          <h2 className="font-serif text-[clamp(2.3rem,4.3vw,4.7rem)] font-semibold leading-[0.92] text-white">
            Complete Your Order
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/[0.56]">
            Secure checkout. All transactions are encrypted and protected.
          </p>

          <section className="glass-panel mt-7 p-6 md:p-8">
            <p className="eyebrow">Delivery Information</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="field-label">First Name</span>
                <input
                  className="field-input"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="James"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="field-label">Last Name</span>
                <input className="field-input" placeholder="Whitmore" />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="field-label">Email Address</span>
                <input className="field-input" type="email" placeholder="james@example.com" />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="field-label">Phone Number</span>
                <input className="field-input" type="tel" placeholder="+1 (555) 000-0000" />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="field-label">Street Address</span>
                <input className="field-input" placeholder="742 Evergreen Terrace, Suite 4" />
              </label>
              <label className="grid gap-2 md:col-span-2 lg:col-span-1">
                <span className="field-label">City</span>
                <input className="field-input" placeholder="New York" />
              </label>
              <label className="grid gap-2">
                <span className="field-label">State / Province</span>
                <input className="field-input" placeholder="NY" />
              </label>
              <label className="grid gap-2">
                <span className="field-label">ZIP / Postal</span>
                <input className="field-input" placeholder="10001" />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="field-label">Country</span>
                <select className="field-input">
                  {[
                    "United States",
                    "United Kingdom",
                    "Germany",
                    "France",
                    "Switzerland",
                    "Japan",
                    "UAE",
                    "Pakistan",
                    "Saudi Arabia",
                    "Canada",
                    "Australia"
                  ].map((country) => (
                    <option key={country} className="bg-obsidian text-white">
                      {country}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="glass-panel mt-6 p-6 md:p-8">
            <p className="eyebrow">Payment Method</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {paymentTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaymentType(tab.id)}
                  className={`payment-tab ${paymentType === tab.id ? "payment-tab-active" : ""}`}
                >
                  <span className="block font-semibold">{tab.label}</span>
                  <span className="mt-1 block text-[0.66rem] uppercase tracking-[0.14em] text-white/[0.34]">{tab.note}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {paymentType === "card" ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-6 grid gap-4"
                >
                  <label className="grid gap-2">
                    <span className="field-label">Card Number</span>
                    <input
                      className="field-input"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(formatCardValue(event.target.value))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                    />
                    <span className="flex gap-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/[0.42]">
                      <span className="bg-white/[0.07] px-3 py-2">Visa</span>
                      <span className="bg-white/[0.07] px-3 py-2">MC</span>
                      <span className="bg-white/[0.07] px-3 py-2">AMEX</span>
                    </span>
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="field-label">Cardholder Name</span>
                      <input className="field-input" placeholder="JAMES WHITMORE" />
                    </label>
                    <label className="grid gap-2">
                      <span className="field-label">Expiry Date</span>
                      <input
                        className="field-input"
                        value={expiry}
                        onChange={(event) => setExpiry(formatExpiryValue(event.target.value))}
                        placeholder="MM / YY"
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                  <label className="grid gap-2">
                    <span className="field-label">CVV / CVC</span>
                    <input className="field-input" placeholder="Security code" maxLength={4} inputMode="numeric" />
                  </label>
                </motion.div>
              ) : (
                <motion.div
                  key="alternate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-6 bg-white/[0.045] p-6 text-center text-sm leading-7 text-white/[0.54]"
                >
                  You will be redirected to complete payment securely through the selected provider.
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="glass-panel mt-6 p-6 md:p-8">
            <div className="flex justify-between py-2 text-sm text-white/[0.55]">
              <span>Subtotal</span>
              <span>{checkout.formattedPrice}</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-white/[0.55]">
              <span>Shipping & Insurance</span>
              <span className="text-[#69c891]">Complimentary</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-white/[0.55]">
              <span>Luxury Tax</span>
              <span>{formatCurrencyAmount(0, checkout.currency)}</span>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-white/[0.08] pt-5 text-white">
              <span className="font-serif text-3xl">Total</span>
              <span className="font-serif text-4xl font-semibold">{checkout.formattedPrice}</span>
            </div>
          </section>

          <button
            type="submit"
            className="relative mt-6 w-full overflow-hidden bg-ember px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emberLight"
          >
            <span className="absolute inset-y-0 left-[-65%] w-1/2 animate-[shimmer_2.7s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
            Confirm & Place Order
          </button>
          <p className="mt-4 text-center text-xs tracking-[0.05em] text-white/[0.38]">
            256-bit SSL encrypted. HAKS & CO never stores card data.
          </p>
        </motion.form>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.66, delay: 0.1 }}
          className="lg:col-span-2 xl:sticky xl:top-28 xl:col-span-1 xl:self-start"
        >
          <p className="eyebrow">Al-Qalea Legacy</p>
          <h2 className="font-serif text-[clamp(2rem,2.8vw,3.2rem)] font-semibold leading-[0.95] text-white">
            Built Around Meaning
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/[0.55]">
            Details inspired by Hak&apos;s & Co identity, chess symbolism, precision engineering, and limited-edition watchmaking.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            {checkoutFeatures.map((feature) => (
              <article
                key={feature.number}
                className="group relative min-h-36 overflow-hidden border border-white/[0.08] p-5"
                style={{ backgroundImage: `url(${feature.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.45))] transition duration-500 group-hover:bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.3))]" />
                <div className="relative z-10">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-emberLight">{feature.number}</span>
                  <h3 className="mt-2 font-serif text-[2rem] font-semibold leading-none text-white">{feature.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-white/[0.74]">{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.aside>
      </main>

      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/[0.86] px-5 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="glass-panel max-w-lg p-8 text-center md:p-10"
            >
              <p className="eyebrow">Order Confirmed</p>
              <h2 className="font-serif text-5xl font-semibold leading-none text-white">Your Watch Is Reserved</h2>
              <p className="mt-5 text-sm leading-8 text-white/[0.62]">
                Your {checkout.model} is on its way. A confirmation has been sent to your email. Estimated delivery:
                5-8 business days.
              </p>
              <Link href="/" className="outline-button mt-8">
                Return to Collections
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
