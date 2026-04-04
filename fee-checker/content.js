(function () {
  // Selectors to try per platform when reading the amount the user typed
  const AMOUNT_SELECTORS = [
    'input[name="amount"]',
    'input[data-testid*="amount"]',
    'input[id*="amount"]',
    'input[aria-label*="amount" i]',
    'input[placeholder*="0.00"]',
    'input[placeholder*="$"]',
    'input[type="number"]',
    'input[data-testid="amount-input"]',
    'input[id*="sourceAmount"]',
  ];

  function readAmount() {
    for (const sel of AMOUNT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && el.value) {
        const val = parseFloat(el.value);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    return null;
  }

  function injectHint(inputEl) {
    if (document.getElementById("fee-checker-hint")) return;

    const hint = document.createElement("div");
    hint.id = "fee-checker-hint";
    hint.style.cssText = `
      all: initial;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 7px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      color: #7c6af7;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
      user-select: none;
    `;
    hint.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="5.5" stroke="#7c6af7"/>
        <path d="M6 5.5V8.5M6 3.5V4.5" stroke="#7c6af7" stroke-linecap="round"/>
      </svg>
      Check hidden fees
    `;

    hint.addEventListener("click", () => {
      const amount = readAmount();
      if (amount) {
        chrome.storage.local.set({ detectedAmount: amount });
      }
      // Chrome can't programmatically open the popup from a content script,
      // so we show a small toast instructing the user
      showToast(amount);
    });

    inputEl.parentNode.insertBefore(hint, inputEl.nextSibling);
  }

  function showToast(amount) {
    let toast = document.getElementById("fee-checker-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "fee-checker-toast";
      toast.style.cssText = `
        all: initial;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        background: #161820;
        border: 1px solid rgba(124,106,247,0.4);
        border-radius: 12px;
        padding: 12px 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        color: #f0f0f0;
        max-width: 260px;
        line-height: 1.5;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      `;
      document.body.appendChild(toast);
    }

    const amountText = amount ? `$${amount}` : "the amount";
    toast.innerHTML = `
      <div style="font-weight:600;color:#7c6af7;margin-bottom:4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Fee Checker</div>
      Detected ${amountText}. Click the <strong>Fee Checker icon</strong> in your toolbar to see the full breakdown.
    `;
    toast.style.display = "block";

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = "none"; }, 4500);
  }

  // Watch for amount inputs appearing (React apps render async)
  function tryInject() {
    for (const sel of AMOUNT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) { injectHint(el); return; }
    }
  }

  const observer = new MutationObserver(tryInject);
  observer.observe(document.body, { childList: true, subtree: true });
  tryInject();
})();
