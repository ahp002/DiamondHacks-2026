const $ = id => document.getElementById(id);

// ─── Populate country dropdown ─────────────────────────────────────────────
function populateCountries() {
  const sel = $("to-country");
  const countries = Object.keys(COUNTRY_CURRENCY).sort();
  countries.forEach(country => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = `${country} (${COUNTRY_CURRENCY[country]})`;
    if (country === "Mexico") opt.selected = true;
    sel.appendChild(opt);
  });
}

// ─── Render results ────────────────────────────────────────────────────────
function renderResults(results, amount, fromCurrency, toCurrency, midRate) {
  const output = $("output");

  // Filter out errors to find best/worst recipient amounts
  const valid = results.filter(r => !r.error && r.recipientGets !== null);
  valid.sort((a, b) => b.recipientGets - a.recipientGets);
  const bestAmount = valid[0]?.recipientGets;
  const worstAmount = valid[valid.length - 1]?.recipientGets;
  const saving = bestAmount && worstAmount ? +(bestAmount - worstAmount).toFixed(2) : null;

  let html = `<div class="results">`;

  if (midRate && midRate !== 1) {
    html += `
      <div class="results-header">
        <span class="results-title">Platform comparison</span>
        <span class="rate-pill">1 ${fromCurrency} = ${midRate.toFixed(4)} ${toCurrency}</span>
      </div>`;
  } else {
    html += `<div class="results-header"><span class="results-title">Platform comparison</span></div>`;
  }

  // Sort: valid results (best first) then errored ones
  const sorted = [
    ...valid,
    ...results.filter(r => r.error)
  ];

  sorted.forEach((r, i) => {
    const isBest = r.recipientGets === bestAmount && !r.error;
    const isWorst = r.recipientGets === worstAmount && !r.error && valid.length > 1;

    html += `<div class="card ${r.error ? "disabled" : ""} ${isBest ? "best" : ""} ${isWorst ? "worst" : ""}">`;
    if (isBest) html += `<div class="best-tag">Best deal</div>`;

    html += `
      <div class="card-top">
        <div class="platform-dot" style="background:${r.color}"></div>
        <span class="platform-name">${r.name}</span>
      </div>`;

    if (r.error) {
      html += `<div class="card-error">${r.error}</div>`;
    } else {
      const { fees } = r;
      const fxBadClass = fees.fxSpread > 0 ? "highlight" : "good";
      const fxLabel = fees.fxSpread > 0
        ? `-$${fees.fxSpread} (${fees.fxSpreadPct}%)`
        : "None";

      html += `
        <div class="fee-grid">
          <div class="fee-cell">
            <div class="fee-cell-label">Flat fee</div>
            <div class="fee-cell-value ${fees.flatFee > 0 ? "highlight" : "good"}">
              ${fees.flatFee > 0 ? `-$${fees.flatFee}` : "Free"}
            </div>
          </div>
          <div class="fee-cell">
            <div class="fee-cell-label">% fee</div>
            <div class="fee-cell-value ${fees.percentFee > 0 ? "highlight" : "good"}">
              ${fees.percentFee > 0 ? `-$${fees.percentFee}` : "Free"}
            </div>
          </div>
          <div class="fee-cell">
            <div class="fee-cell-label">FX spread</div>
            <div class="fee-cell-value ${fxBadClass}">${fxLabel}</div>
          </div>
        </div>`;

      html += `
        <div class="fee-cell" style="background:var(--surface2);border-radius:7px;padding:7px 9px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div class="fee-cell-label">Total cost to you</div>
            <div class="fee-cell-value total">-$${fees.totalFee} ${fromCurrency}</div>
          </div>
          ${r.recipientGets !== null ? `
          <div style="text-align:right">
            <div class="fee-cell-label">Recipient gets</div>
            <div class="fee-cell-value ${isBest ? "good" : ""}" style="font-size:14px;font-weight:700">
              ${r.recipientGets.toLocaleString()} ${toCurrency}
            </div>
          </div>` : ""}
        </div>`;

      if (fees.note) {
        html += `<div class="card-note">${fees.note}</div>`;
      }
    }

    html += `</div>`; // .card
  });

  // Savings summary
  if (saving && saving > 0) {
    html += `
      <div class="summary-box">
        <span class="summary-label">Max savings vs. worst option</span>
        <span class="summary-saving">+${saving} ${toCurrency}</span>
      </div>`;
  }

  html += `</div>`; // .results
  output.innerHTML = html;
}

// ─── Main calculate function ───────────────────────────────────────────────
async function calculate() {
  const amount = parseFloat($("amount").value);
  const fromCurrency = $("from-currency").value;
  const toCountry = $("to-country").value;
  const toCurrency = COUNTRY_CURRENCY[toCountry] || "USD";

  if (!amount || amount <= 0) {
    $("output").innerHTML = `<div class="state-msg"><strong>Enter an amount</strong>Please enter a valid transfer amount.</div>`;
    return;
  }

  $("calc-btn").disabled = true;
  $("output").innerHTML = `<div class="state-msg"><span class="spinner"></span>Fetching live rates...</div>`;

  try {
    const results = await calculateAll(amount, fromCurrency, toCurrency);
    const validResult = results.find(r => r.midRate);
    const midRate = validResult?.midRate ?? null;

    chrome.storage.local.set({ amount, fromCurrency, toCountry });
    renderResults(results, amount, fromCurrency, toCurrency, midRate);
  } catch (err) {
    $("output").innerHTML = `<div class="state-msg"><strong>Error</strong>Could not fetch exchange rates. Check your connection.</div>`;
  } finally {
    $("calc-btn").disabled = false;
  }
}

// ─── Init ──────────────────────────────────────────────────────────────────
async function init() {
  populateCountries();

  // Restore last used values
  const saved = await chrome.storage.local.get(["amount", "fromCurrency", "toCountry", "detectedAmount", "detectedFrom"]);

  if (saved.detectedAmount) {
    $("amount").value = saved.detectedAmount;
    $("detected-badge").classList.add("show");
    await chrome.storage.local.remove("detectedAmount");
  } else if (saved.amount) {
    $("amount").value = saved.amount;
  }

  if (saved.fromCurrency) $("from-currency").value = saved.fromCurrency;
  if (saved.toCountry) $("to-country").value = saved.toCountry;

  $("calc-btn").addEventListener("click", calculate);
  $("amount").addEventListener("keydown", e => { if (e.key === "Enter") calculate(); });

  // Auto-run if we have saved values
  if (saved.amount || saved.detectedAmount) calculate();
}

init();
