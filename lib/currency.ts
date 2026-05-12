import { CurrencyCode, currencyMeta, fallbackUsdRates } from "@/lib/catalog";

export function convertUsd(
  amountUsd: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number>
) {
  return amountUsd * (rates[currency] ?? fallbackUsdRates[currency]);
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode) {
  if (currency === "PKR") {
    return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
  }

  return new Intl.NumberFormat(currencyMeta[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export async function getClientCurrencyRates() {
  const cacheKey = "haksCurrencyRatesCache";
  const twelveHours = 12 * 60 * 60 * 1000;
  const now = Date.now();

  try {
    const cached = window.localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached) as {
        time?: number;
        rates?: Partial<Record<CurrencyCode, number>>;
      };

      if (parsed.time && parsed.rates && now - parsed.time < twelveHours) {
        return { ...fallbackUsdRates, ...parsed.rates };
      }
    }

    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = (await response.json()) as {
      result?: string;
      rates?: Partial<Record<CurrencyCode, number>>;
    };

    if (data.result !== "success" || !data.rates) {
      return fallbackUsdRates;
    }

    const rates: Record<CurrencyCode, number> = {
      USD: 1,
      GBP: data.rates.GBP ?? fallbackUsdRates.GBP,
      PKR: data.rates.PKR ?? fallbackUsdRates.PKR,
      INR: data.rates.INR ?? fallbackUsdRates.INR,
      CNY: data.rates.CNY ?? fallbackUsdRates.CNY
    };

    window.localStorage.setItem(cacheKey, JSON.stringify({ time: now, rates }));
    return rates;
  } catch {
    return fallbackUsdRates;
  }
}
