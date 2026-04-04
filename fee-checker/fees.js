// ─── Country → Currency mapping ────────────────────────────────────────────
const COUNTRY_CURRENCY = {
  "United States": "USD", "Mexico": "MXN", "United Kingdom": "GBP",
  "European Union": "EUR", "Germany": "EUR", "France": "EUR", "Spain": "EUR",
  "Italy": "EUR", "Netherlands": "EUR", "Canada": "CAD", "Australia": "AUD",
  "India": "INR", "Philippines": "PHP", "Brazil": "BRL", "Japan": "JPY",
  "China": "CNY", "South Korea": "KRW", "Nigeria": "NGN", "Ghana": "GHS",
  "Kenya": "KES", "Colombia": "COP", "Guatemala": "GTQ", "El Salvador": "USD",
  "Dominican Republic": "DOP", "Jamaica": "JMD", "Pakistan": "PKR",
  "Bangladesh": "BDT", "Vietnam": "VND", "Indonesia": "IDR", "Thailand": "THB",
  "New Zealand": "NZD", "Singapore": "SGD", "Hong Kong": "HKD",
  "United Arab Emirates": "AED", "Saudi Arabia": "SAR", "Egypt": "EGP",
  "Morocco": "MAD", "South Africa": "ZAR", "Poland": "PLN", "Sweden": "SEK",
  "Norway": "NOK", "Denmark": "DKK", "Switzerland": "CHF", "Israel": "ILS",
  "Turkey": "TRY", "Argentina": "ARS", "Chile": "CLP", "Peru": "PEN"
};

// ─── Platform fee rules ─────────────────────────────────────────────────────
const PLATFORMS = {
  paypal: {
    name: "PayPal",
    color: "#003087",
    calcFee(amount, fromCurrency, toCurrency) {
      const intl = fromCurrency !== toCurrency;
      const flatFee = intl ? 0.99 : 0;
      const pctFee = intl
        ? (amount <= 3000 ? amount * 0.05 : amount * 0.035)
        : 0;
      const cappedPct = Math.min(pctFee, 4.99);
      const fxSpreadPct = intl ? 0.04 : 0;
      const fxSpreadAmt = amount * fxSpreadPct;
      const totalFee = flatFee + cappedPct + fxSpreadAmt;
      return {
        flatFee: +flatFee.toFixed(2),
        percentFee: +cappedPct.toFixed(2),
        fxSpread: +fxSpreadAmt.toFixed(2),
        fxSpreadPct: fxSpreadPct * 100,
        totalFee: +totalFee.toFixed(2),
        note: intl ? "PayPal adds a 4% FX markup on top of flat & % fees" : "No fee for domestic USD transfers"
      };
    }
  },

  venmo: {
    name: "Venmo",
    color: "#3d95ce",
    calcFee(amount, fromCurrency, toCurrency) {
      if (fromCurrency !== "USD" || toCurrency !== "USD") {
        return { error: "Venmo only supports USD domestic transfers" };
      }
      const pctFee = amount * 0.019;
      return {
        flatFee: 0,
        percentFee: +pctFee.toFixed(2),
        fxSpread: 0,
        fxSpreadPct: 0,
        totalFee: +pctFee.toFixed(2),
        note: "1.9% fee when paying with debit card or bank. Free between friends via balance."
      };
    }
  },

  wise: {
    name: "Wise",
    color: "#163300",
    calcFee(amount, fromCurrency, toCurrency) {
      const intl = fromCurrency !== toCurrency;
      const fixedFee = intl ? 1.5 : 0;
      const pctFee = amount * (intl ? 0.0041 : 0);
      const fxSpreadAmt = 0; // Wise uses mid-market rate
      const totalFee = fixedFee + pctFee;
      return {
        flatFee: +fixedFee.toFixed(2),
        percentFee: +pctFee.toFixed(2),
        fxSpread: 0,
        fxSpreadPct: 0,
        totalFee: +totalFee.toFixed(2),
        note: "Wise uses the real mid-market rate — no hidden FX markup."
      };
    }
  },

  westernunion: {
    name: "Western Union",
    color: "#ffdd00",
    textColor: "#000",
    calcFee(amount, fromCurrency, toCurrency) {
      const intl = fromCurrency !== toCurrency;
      let flatFee = 0;
      if (amount <= 500) flatFee = 5.0;
      else if (amount <= 1000) flatFee = 8.0;
      else flatFee = amount * 0.013;
      const fxSpreadPct = intl ? 0.03 : 0;
      const fxSpreadAmt = amount * fxSpreadPct;
      const totalFee = flatFee + fxSpreadAmt;
      return {
        flatFee: +flatFee.toFixed(2),
        percentFee: 0,
        fxSpread: +fxSpreadAmt.toFixed(2),
        fxSpreadPct: fxSpreadPct * 100,
        totalFee: +totalFee.toFixed(2),
        note: intl ? "3% FX spread is a hidden cost on top of the flat transfer fee." : ""
      };
    }
  },

  remitly: {
    name: "Remitly",
    color: "#1352a1",
    calcFee(amount, fromCurrency, toCurrency) {
      const intl = fromCurrency !== toCurrency;
      if (!intl) return { error: "Remitly is for international transfers only" };
      const flatFee = amount < 500 ? 2.99 : 0;
      const fxSpreadPct = 0.015;
      const fxSpreadAmt = amount * fxSpreadPct;
      const totalFee = flatFee + fxSpreadAmt;
      return {
        flatFee: +flatFee.toFixed(2),
        percentFee: 0,
        fxSpread: +fxSpreadAmt.toFixed(2),
        fxSpreadPct: fxSpreadPct * 100,
        totalFee: +totalFee.toFixed(2),
        note: "Economy transfers are cheaper but slower (3–5 days)."
      };
    }
  },

  zelle: {
    name: "Zelle",
    color: "#6d1ed4",
    calcFee(amount, fromCurrency, toCurrency) {
      if (fromCurrency !== "USD" || toCurrency !== "USD") {
        return { error: "Zelle only supports USD domestic transfers" };
      }
      return {
        flatFee: 0,
        percentFee: 0,
        fxSpread: 0,
        fxSpreadPct: 0,
        totalFee: 0,
        note: "Completely free for domestic USD transfers between US bank accounts."
      };
    }
  }
};

// ─── Live exchange rate fetch ───────────────────────────────────────────────
async function getExchangeRate(from, to) {
  if (from === to) return 1;
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await res.json();
    return data.rates?.[to] ?? null;
  } catch {
    return null;
  }
}

// ─── Full calculation for all platforms ────────────────────────────────────
async function calculateAll(amount, fromCurrency, toCurrency) {
  const midRate = await getExchangeRate(fromCurrency, toCurrency);

  return Object.entries(PLATFORMS).map(([key, platform]) => {
    const fees = platform.calcFee(amount, fromCurrency, toCurrency);
    if (fees.error) {
      return { key, name: platform.name, color: platform.color, textColor: platform.textColor, error: fees.error };
    }

    const amountAfterFee = amount - fees.flatFee - fees.percentFee;
    const effectiveRate = midRate ? midRate * (1 - fees.fxSpreadPct / 100) : null;
    const recipientGets = effectiveRate ? +(amountAfterFee * effectiveRate).toFixed(2) : null;

    return {
      key,
      name: platform.name,
      color: platform.color,
      textColor: platform.textColor || "#fff",
      fees,
      midRate,
      effectiveRate: effectiveRate ? +effectiveRate.toFixed(4) : null,
      recipientGets,
      toCurrency,
      fromCurrency
    };
  });
}
