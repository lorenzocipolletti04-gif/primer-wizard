// =====================
// PRIMER WIZARD app.js (Complete UI v5: QuickView werkt + prijzen + 1 primaire selectie)
// =====================

console.log("Primer Wizard UI v5 loaded ✅");

// ===== Elements =====
const wizardCard = document.getElementById("wizardCard");
const resultCard = document.getElementById("resultCard");

const stepText = document.getElementById("stepText");
const stepHint = document.getElementById("stepHint");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");

const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

const resultBackBtn = document.getElementById("resultBackBtn");
const startOverBtn = document.getElementById("startOverBtn");
const resultSummary = document.getElementById("resultSummary");
const productList = document.getElementById("productList");

// ===== Settings =====
const SHOP_ORIGIN = "https://www.lakopmaat.nl";
const SHOP_BASE_URL = "https://www.lakopmaat.nl";

// ===== Products (images + prijzen) =====
// Let op: prijzen zijn hardcoded strings. Pas ze aan als je wil.
const PRODUCTS = {
  filler_1k: {
    key: "filler_1k",
    name: "CS 1K Hoog vullende primer",
    brand: "CS",
    code: "151.522",
    url: "/nl/CS-1K-Hoog-vullende-primer",
    ccvProductId: "900611573",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358538274.png",
    price: "€ 21,49",
  },
  plastic: {
    key: "plastic",
    name: "CS Plastic Primer Transparant - 400ml",
    brand: "CS",
    code: "145.986",
    url: "/nl/CS-Plastic-Primer-Transparant-400ml",
    ccvProductId: "900611528",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358537821.png",
    price: "€ 12,17",
  },
  epoxy_2k: {
    key: "epoxy_2k",
    name: "CS 2K Epoxy Fill Primer",
    brand: "CS",
    code: "159.158",
    url: "/nl/CS-2k-Epoxy-Fill-Primer",
    ccvProductId: "900611519",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358537773.png",
    price: "€ 32,50",
  },
  epoxy_1k: {
    key: "epoxy_1k",
    name: "CS 1K Epoxy Primer - 400ml",
    brand: "CS",
    code: "151.958",
    url: "/nl/CS-1K-Epoxy-Primer-400ml",
    ccvProductId: "900611507",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358537689.png",
    price: "€ 15,20",
  },
  etch: {
    key: "etch",
    name: "Finixa Etch primer grijs - 400 ml",
    brand: "Finixa",
    code: "TSP 190",
    url: "/nl/Finixa-Etch-primer-grijs-400-ml",
    ccvProductId: "900588323",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358424376.png",
    price: "€ 13,99",
  },
  zinc: {
    key: "zinc",
    name: "Finixa Zinkspray - 400 ml",
    brand: "Finixa",
    code: "TSP 410",
    url: "/nl/Finixa-Zinkspray-400-ml",
    ccvProductId: "900589553",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358433403.png",
    price: "€ 12,49",
  },
  gloves: {
    key: "gloves",
    name: "Eurogloves Soft Nitrile - 100 stuks",
    brand: "Eurogloves",
    code: "",
    url: "/nl/Eurogloves-Soft-Nitrile",
    ccvProductId: "900590462",
    image: "https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358441479.jpg",
    price: "€ 15,25",
  },
};

// ===== Steps =====
const steps = [
  {
    id: "substrate",
    title: "Welke ondergrond heb je?",
    hint: "Kies de ondergrond waarop je gaat primeren.",
    options: [
      { label: "Blank metaal (staal/verzinkt/aluminium)", value: "blank_metaal" },
      { label: "Kunststof / plastic", value: "kunststof" },
      { label: "Bestaande lak (geschuurd)", value: "bestaande_lak" },
      { label: "Plamuur / polyester filler", value: "plamuur" },
    ],
  },
  {
    id: "goal",
    title: "Wat wil je vooral bereiken?",
    hint: "Dit bepaalt welke primer(s) je nodig hebt.",
    optionsMap: {
      blank_metaal: [
        { label: "Maximale hechting + roestbescherming", value: "max_bescherming" },
        { label: "Snelle spotrepair (kleine plek)", value: "spotrepair" },
      ],
      kunststof: [{ label: "Hechting op kunststof (adhesion promoter)", value: "hechting_kunststof" }],
      bestaande_lak: [
        { label: "Egaliseren / schuurgrond maken", value: "egaliseren" },
        { label: "Vullen (meer opbouw / krassen weg)", value: "vullen" },
      ],
      plamuur: [
        { label: "Vullen en strak schuren", value: "vullen_plamuur" },
        { label: "Snelle basislaag (kleine plek)", value: "spotrepair_plamuur" },
      ],
    },
  },
];

let stepIndex = 0;
let answers = {};
let selectedProductIds = new Set();

// =====================
// Boot
// =====================
injectUiStyles();
ensureQuickViewModal();
renderStep();

// =====================
// UI helpers
// =====================
function showWizard() {
  resultCard?.classList.add("hidden");
  wizardCard?.classList.remove("hidden");
}

function showResult() {
  wizardCard?.classList.add("hidden");
  resultCard?.classList.remove("hidden");
}

function updateTopBar() {
  const total = steps.length;
  const current = stepIndex + 1;

  if (stepText) stepText.textContent = `Stap ${current} van ${total}`;
  if (stepHint) stepHint.textContent = steps[stepIndex].hint || "";

  const pct = Math.round((current / total) * 100);
  if (progressBar) progressBar.style.width = pct + "%";
  if (progressLabel) progressLabel.textContent = pct + "%";

  if (backBtn) backBtn.disabled = stepIndex === 0;
}

function getCurrentOptions() {
  const step = steps[stepIndex];
  if (step.options) return step.options;
  const substrate = answers.substrate;
  return step.optionsMap?.[substrate] || [];
}

function renderStep() {
  showWizard();
  updateTopBar();

  const step = steps[stepIndex];
  if (questionEl) questionEl.textContent = step.title;

  const opts = getCurrentOptions();
  if (!optionsEl) return;
  optionsEl.innerHTML = "";

  if (!opts.length) {
    optionsEl.innerHTML = `
      <div class="pw-empty">
        <div class="pw-empty__title">Geen opties beschikbaar</div>
        <div class="pw-empty__text">Ga terug en kies eerst een ondergrond.</div>
      </div>`;
    return;
  }

  const selected = answers[step.id];

  opts.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "optionBtn";
    btn.type = "button";
    btn.textContent = opt.label;
    if (selected === opt.value) btn.classList.add("active");

    btn.addEventListener("click", () => selectOption(step.id, opt.value));
    optionsEl.appendChild(btn);
  });
}

function selectOption(stepId, value) {
  answers[stepId] = value;
  if (stepId === "substrate") delete answers.goal;

  if (stepIndex < steps.length - 1) {
    stepIndex += 1;
    renderStep();
    return;
  }
  renderAdvice();
}

function goBack() {
  if (stepIndex === 0) return;
  stepIndex -= 1;
  renderStep();
}

function resetAll() {
  stepIndex = 0;
  answers = {};
  selectedProductIds = new Set();
  closeQuickView();
  renderStep();
}

function resultBack() {
  stepIndex = Math.max(0, steps.length - 1);
  renderStep();
}

// =====================
// Advice engine (local)
// =====================
function buildAdvice(substrate, goal) {
  const out = { summary: "", products: [] };

  const push = (p, stepLabel, notes) => {
    if (!p) return;
    out.products.push({
      stepLabel,
      brand: p.brand || "",
      code: p.code || "",
      name: p.name || "",
      notes: notes || "",
      url: p.url || "",
      ccvProductId: p.ccvProductId || "",
      image: p.image || "",
      price: p.price || "",
    });
  };

  if (substrate === "kunststof") {
    out.summary =
      "Voor kunststof heb je een kunststof primer nodig voor goede hechting. Breng dun aan, laat flashen, daarna kun je verder met je lakopbouw.";
    push(PRODUCTS.plastic, "Beste keuze", "Dun aanbrengen. Zorg voor een schone, vetvrije ondergrond.");
    push(PRODUCTS.gloves, "Tip", "Handschoenen voorkomen vet/vingerafdrukken.");
    return out;
  }

  if (substrate === "plamuur") {
    out.summary =
      "Op plamuur werkt een hoogvullende primer het best: je vult schuurkrassen en krijgt een strakke, egale ondergrond.";
    push(PRODUCTS.filler_1k, "Beste keuze", "Hoog vullend, ideaal om plamuurkrassen te vullen en strak te schuren.");
    push(PRODUCTS.gloves, "Tip", "Handschoenen voorkomen vet/vingerafdrukken.");
    return out;
  }

  if (substrate === "bestaande_lak") {
    if (goal === "egaliseren") {
      out.summary =
        "Op geschuurde lak is een primer/filler perfect om te egaliseren en een goede basis te maken voor de lak.";
      push(PRODUCTS.filler_1k, "Beste keuze", "Egaliseert en vult lichte schuurkrassen.");
      push(PRODUCTS.gloves, "Tip", "Werk schoon en vetvrij voor het beste resultaat.");
      return out;
    }

    out.summary = "Wil je meer opbouw en krassen wegwerken? Dan is een hoogvullende primer de juiste keuze.";
    push(PRODUCTS.filler_1k, "Beste keuze", "Meer vulling/opbouw voor een strak eindresultaat.");
    push(PRODUCTS.gloves, "Tip", "Handschoenen houden de ondergrond vetvrij.");
    return out;
  }

  if (substrate === "blank_metaal") {
    if (goal === "spotrepair") {
      out.summary =
        "Voor een snelle spotrepair op blank metaal kun je een etch primer gebruiken. Wil je meer bescherming, kies epoxy.";
      push(PRODUCTS.etch, "Snelle keuze", "Dunne laag voor hechting op metaal (spotrepair).");
      push(PRODUCTS.epoxy_1k, "Beste bescherming", "Epoxy geeft betere (anti)corrosie dan etch.");
      push(PRODUCTS.gloves, "Tip", "Blank metaal is gevoelig: werk vetvrij.");
      return out;
    }

    out.summary =
      "Voor blank metaal is epoxy de beste basis: top hechting én (anti)corrosie. Kies 2K voor maximale performance, of 1K als snelle/handige optie.";
    push(PRODUCTS.epoxy_2k, "Beste keuze", "Maximale hechting en corrosiebescherming (professioneel).");
    push(PRODUCTS.epoxy_1k, "Alternatief", "Goede epoxy basis in 1K spuitbus (handig/DIY).");
    push(PRODUCTS.zinc, "Optioneel", "Extra roestbescherming (bijv. laswerk/holtes).");
    push(PRODUCTS.gloves, "Tip", "Handschoenen voorkomen vette afdrukken.");
    return out;
  }

  out.summary = "Geen advies beschikbaar. Kies een ondergrond en doel.";
  return out;
}

// =====================
// Selection rules
// primair (best/alt/fast) => max 1 tegelijk
// optioneel/tip => extra toegestaan
// =====================
function badgeType(label) {
  const s = String(label || "").toLowerCase();
  if (s.includes("beste")) return "best";
  if (s.includes("alternatief")) return "alt";
  if (s.includes("snelle")) return "fast";
  if (s.includes("optioneel")) return "opt";
  if (s.includes("tip")) return "tip";
  return "default";
}
function isPrimaryLabel(label) {
  const t = badgeType(label);
  return t === "best" || t === "alt" || t === "fast";
}

// Kies exact 1 primaire default: best > fast > alt
function applyDefaultSelection(products) {
  normalizePrimarySelection(products);
  if (selectedProductIds.size > 0) return;

  const primaries = products.filter((p) => p.ccvProductId && isPrimaryLabel(p.stepLabel));
  const pick =
    primaries.find((p) => badgeType(p.stepLabel) === "best") ||
    primaries.find((p) => badgeType(p.stepLabel) === "fast") ||
    primaries.find((p) => badgeType(p.stepLabel) === "alt") ||
    null;

  if (pick?.ccvProductId) selectedProductIds.add(String(pick.ccvProductId));
}

function normalizePrimarySelection(products) {
  const primaryIds = products
    .filter((p) => p.ccvProductId && isPrimaryLabel(p.stepLabel))
    .map((p) => String(p.ccvProductId));

  const selectedPrimaries = primaryIds.filter((id) => selectedProductIds.has(id));
  if (selectedPrimaries.length <= 1) return;

  // behoud er 1 op prioriteit: best > fast > alt
  const byId = new Map(products.map((p) => [String(p.ccvProductId || ""), p]));
  const scored = selectedPrimaries
    .map((id) => {
      const p = byId.get(id);
      const t = badgeType(p?.stepLabel);
      const score = t === "best" ? 3 : t === "fast" ? 2 : t === "alt" ? 1 : 0;
      return { id, score };
    })
    .sort((a, b) => b.score - a.score);

  const keep = scored[0]?.id;
  selectedPrimaries.forEach((id) => {
    if (id !== keep) selectedProductIds.delete(id);
  });
}

function deselectOtherPrimaries(products, keepId) {
  products.forEach((p) => {
    if (!p.ccvProductId) return;
    const id = String(p.ccvProductId);
    if (id === keepId) return;
    if (isPrimaryLabel(p.stepLabel)) selectedProductIds.delete(id);
  });
}

// =====================
// Render advice (cards + CTA)
// =====================
function renderAdvice() {
  showResult();
  if (resultSummary) resultSummary.textContent = "Advies maken…";
  if (productList) productList.innerHTML = "";

  const data = buildAdvice(answers.substrate, answers.goal);
  if (resultSummary) resultSummary.textContent = data.summary || "";

  const products = data.products || [];

  applyDefaultSelection(products);

  const cardsHtml = products.map(renderUpsellCard).join("");

  if (!productList) return;

  productList.innerHTML = `
    <div class="pw-panel">
      <div class="pw-section-title">Maak je aankoop compleet</div>

      <div class="pw-upsell-list">
        ${cardsHtml || `<div class="pw-empty"><div class="pw-empty__title">Geen producten</div></div>`}
      </div>

      <div class="pw-orderbar">
        <button type="button" class="pw-order-button" id="pwOrderBtn">Bestellen</button>
      </div>
    </div>
  `;

  bindUpsellEvents(products);
  updateOrderButton();
}

function renderUpsellCard(p) {
  const id = p.ccvProductId ? String(p.ccvProductId) : "";
  const selected = id && selectedProductIds.has(id);
  const url = p.url ? toAbsoluteUrl(p.url) : "";
  const t = badgeType(p.stepLabel);
  const isPrimary = isPrimaryLabel(p.stepLabel);

  const badgeMain = p.stepLabel ? `<span class="pw-badge pw-badge--${t}">${escapeHtml(p.stepLabel)}</span>` : "";
  const badges = [
    badgeMain,
    p.brand ? `<span class="pw-badge pw-badge--meta">${escapeHtml(p.brand)}</span>` : "",
    p.code ? `<span class="pw-badge pw-badge--meta">${escapeHtml(p.code)}</span>` : "",
  ].join("");

  const img = p.image
    ? `<img class="pw-upsell-img" src="${escapeHtml(toAbsoluteUrl(p.image))}" alt="" loading="lazy">`
    : `<div class="pw-upsell-img pw-upsell-img--placeholder" aria-hidden="true"></div>`;

  const priceHtml = p.price ? `<div class="pw-price">${escapeHtml(p.price)}</div>` : "";
  const quickBtn = url ? `<button type="button" class="pw-quickbtn">Snel bekijken</button>` : "";

  return `
    <div class="pw-upsell-card ${selected ? "is-selected" : ""} ${t === "best" ? "is-best" : ""}"
         data-id="${escapeHtml(id)}"
         data-primary="${isPrimary ? "1" : "0"}"
         data-url="${escapeHtml(url)}">

      ${img}

      <div class="pw-upsell-meta">
        <div class="pw-upsell-badges">${badges}</div>
        <div class="pw-upsell-name" title="${escapeHtml(p.name || "")}">${escapeHtml(p.name || "")}</div>
        ${priceHtml}
        ${p.notes ? `<div class="pw-upsell-notes">${escapeHtml(p.notes)}</div>` : ""}
        <div class="pw-actions">
          ${quickBtn}
        </div>
      </div>

      <button type="button" class="pw-upsell-add" ${id ? "" : "disabled"} aria-label="Toevoegen">
        ${selected ? "✓" : "+"}
      </button>
    </div>
  `;
}

function bindUpsellEvents(products) {
  if (!productList) return;

  // Event delegation: werkt altijd (ook na re-render)
  productList.onclick = (e) => {
    const t = e.target;

    // Snel bekijken
    const quickBtn = t?.closest?.(".pw-quickbtn");
    if (quickBtn) {
      e.preventDefault();
      e.stopPropagation();
      const card = quickBtn.closest(".pw-upsell-card");
      const url = card?.getAttribute("data-url") || "";
      if (url) openQuickView(url);
      return;
    }

    // + / ✓ selectie
    const addBtn = t?.closest?.(".pw-upsell-add");
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();

      const card = addBtn.closest(".pw-upsell-card");
      const id = card?.getAttribute("data-id") || "";
      if (!id) return;

      const isPrimary = card?.getAttribute("data-primary") === "1";

      if (selectedProductIds.has(id)) {
        selectedProductIds.delete(id);
      } else {
        if (isPrimary) deselectOtherPrimaries(products, id);
        selectedProductIds.add(id);
      }

      normalizePrimarySelection(products);
      syncCardSelections();
      updateOrderButton();
      return;
    }
  };

  const orderBtn = productList.querySelector("#pwOrderBtn");
  if (orderBtn) orderBtn.onclick = () => bulkAddSelected(products);
}

function syncCardSelections() {
  if (!productList) return;
  const cards = productList.querySelectorAll(".pw-upsell-card");
  cards.forEach((card) => {
    const id = card.getAttribute("data-id") || "";
    const selected = id && selectedProductIds.has(id);
    const btn = card.querySelector(".pw-upsell-add");
    if (!btn) return;

    if (selected) {
      card.classList.add("is-selected");
      btn.textContent = "✓";
    } else {
      card.classList.remove("is-selected");
      btn.textContent = "+";
    }
  });
}

function updateOrderButton() {
  const btn = productList?.querySelector("#pwOrderBtn");
  if (!btn) return;

  const count = selectedProductIds.size;

  if (count <= 0) {
    btn.textContent = "Bestellen";
    btn.disabled = true;
    btn.classList.add("is-disabled");
    return;
  }

  btn.disabled = false;
  btn.classList.remove("is-disabled");

  btn.textContent = count === 1 ? "Bestellen" : `${count} producten bestellen`;
}

// =====================
// Bulk add to cart (quantity altijd 1)
// =====================
async function bulkAddSelected(products) {
  const btn = productList?.querySelector("#pwOrderBtn");
  if (!btn) return;

  const selected = products
    .filter((p) => p.ccvProductId && selectedProductIds.has(String(p.ccvProductId)))
    .map((p) => ({
      productId: String(p.ccvProductId),
      quantity: 1,
      shopUrl: toAbsoluteUrl(p.url),
    }));

  if (!selected.length) return;

  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Toevoegen…";

  for (let i = 0; i < selected.length; i++) {
    window.parent.postMessage({ type: "LOM_ADD_TO_CART", payload: selected[i] }, SHOP_ORIGIN);
    await new Promise((r) => setTimeout(r, 350));
  }

  btn.textContent = "Toegevoegd ✓";
  setTimeout(() => {
    btn.textContent = oldText;
    btn.disabled = false;
    updateOrderButton();
  }, 1100);
}

// =====================
// Quick view modal (iframe)
// =====================
function ensureQuickViewModal() {
  if (document.getElementById("pwQuickView")) return;

  const el = document.createElement("div");
  el.id = "pwQuickView";
  el.className = "pw-qv hidden";
  el.innerHTML = `
    <div class="pw-qv__backdrop" data-qv-close="1"></div>
    <div class="pw-qv__panel" role="dialog" aria-modal="true">
      <div class="pw-qv__top">
        <div class="pw-qv__title">Snel bekijken</div>
        <button type="button" class="pw-qv__close" data-qv-close="1" aria-label="Sluiten">✕</button>
      </div>
      <iframe class="pw-qv__frame" title="Snel bekijken" loading="lazy"></iframe>
      <div class="pw-qv__bottom">
        <a class="pw-qv__open" target="_blank" rel="noreferrer">Open in nieuw tabblad</a>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  el.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-qv-close") === "1") closeQuickView();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQuickView();
  });
}

function openQuickView(url) {
  const wrap = document.getElementById("pwQuickView");
  if (!wrap) return;

  const frame = wrap.querySelector(".pw-qv__frame");
  const openA = wrap.querySelector(".pw-qv__open");

  if (frame) frame.src = url;
  if (openA) openA.href = url;

  wrap.classList.remove("hidden");
  document.documentElement.classList.add("pw-noscroll");
  document.body.classList.add("pw-noscroll");
}

function closeQuickView() {
  const wrap = document.getElementById("pwQuickView");
  if (!wrap) return;

  const frame = wrap.querySelector(".pw-qv__frame");
  if (frame) frame.src = "about:blank";

  wrap.classList.add("hidden");
  document.documentElement.classList.remove("pw-noscroll");
  document.body.classList.remove("pw-noscroll");
}

// =====================
// Utils
// =====================
function toAbsoluteUrl(pathOrUrl) {
  const s = String(pathOrUrl || "");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (!s.startsWith("/")) return SHOP_BASE_URL + "/" + s;
  return SHOP_BASE_URL + s;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =====================
// Styles
// =====================
function injectUiStyles() {
  if (document.getElementById("pwUiV5Styles")) return;

  const css = `
  .pw-panel{
    background:#fff;
    border:1px solid #e9edf3;
    border-radius:16px;
    padding:18px;
  }
  @media (max-width: 520px){
    .pw-panel{
      margin-left:-12px;
      margin-right:-12px;
      border-radius:18px;
    }
  }

  .pw-section-title{
    font-weight:900;
    font-size:16px;
    margin:0 0 12px;
    color:#0f172a;
  }

  .pw-upsell-list{ display:grid; gap:12px; margin-top:10px; }

  .pw-upsell-card{
    display:grid;
    grid-template-columns:64px 1fr 44px;
    align-items:center;
    gap:14px;
    border:1px solid #e6edf7;
    border-radius:16px;
    padding:14px;
    background:#fff;
    box-shadow:0 8px 22px rgba(16,24,40,.06);
  }
  .pw-upsell-card.is-selected{
    border-color:#d7e2f2;
    box-shadow:0 12px 26px rgba(16,24,40,.10);
  }
  .pw-upsell-card.is-best{
    border-color: rgba(34,197,94,.35);
  }

  .pw-upsell-img{
    width:64px; height:64px; border-radius:14px;
    background:#f6f7fb;
    border:1px solid #eef2f7;
    object-fit:contain;
    display:block;
  }

  .pw-upsell-meta{ min-width:0; }

  .pw-upsell-badges{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    margin-bottom:8px;
  }

  .pw-badge{
    font-size:11px;
    font-weight:900;
    padding:5px 10px;
    border-radius:999px;
    letter-spacing:.4px;
    text-transform:uppercase;
    line-height:1;
    white-space:nowrap;
  }
  .pw-badge--best{ background:#dcfce7; color:#166534; }
  .pw-badge--alt{ background:#dbeafe; color:#1e40af; }
  .pw-badge--fast{ background:#ede9fe; color:#5b21b6; }
  .pw-badge--opt{ background:#f1f5f9; color:#475569; }
  .pw-badge--tip{ background:#fff7ed; color:#9a3412; }
  .pw-badge--meta{
    background:#ffffff;
    border:1px solid #e5eaf3;
    color:#0f172a;
    text-transform:none;
    letter-spacing:0;
    font-weight:800;
  }

  .pw-upsell-name{
    font-weight:900;
    font-size:13.5px;
    line-height:1.2;
    margin:0 0 6px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    color:#0f172a;
  }

  .pw-price{
    font-weight:900;
    font-size:13px;
    color:#0f172a;
    margin:0 0 6px;
  }

  .pw-upsell-notes{
    font-size:12.5px;
    color:#64748b;
    margin:0 0 8px;
  }

  .pw-actions{
    display:flex;
    align-items:center;
    gap:8px;
  }

  .pw-quickbtn{
    border:1px solid #e5eaf3;
    background:#fff;
    color:#0f172a;
    font-weight:900;
    font-size:12px;
    padding:7px 10px;
    border-radius:999px;
    cursor:pointer;
  }
  .pw-quickbtn:hover{ background:#f6f8fc; }

  .pw-upsell-add{
    width:40px; height:40px;
    border-radius:12px;
    border:0;
    background:#111;
    color:#fff;
    font-size:22px;
    line-height:1;
    cursor:pointer;
    display:grid;
    place-items:center;
  }
  .pw-upsell-add:disabled{
    opacity:.45;
    cursor:not-allowed;
  }
  .pw-upsell-card.is-selected .pw-upsell-add{
    background:#e8eef7;
    color:#111;
    border:1px solid #d7e2f2;
  }

  .pw-orderbar{ margin-top:14px; }

  .pw-order-button{
    width:100%;
    height:46px;
    border:0;
    border-radius:14px;
    background:#22c55e;
    color:#fff;
    font-weight:900;
    font-size:14px;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
  }
  .pw-order-button.is-disabled{
    opacity:.55;
    cursor:not-allowed;
  }

  .pw-empty{
    border:1px dashed #dbe4f2;
    border-radius:14px;
    padding:12px;
    color:#64748b;
    background:#fff;
  }
  .pw-empty__title{ font-weight:900; color:#0f172a; margin-bottom:6px; }
  .pw-empty__text{ font-size:13px; }

  /* Quick View modal */
  .pw-noscroll{ overflow:hidden !important; }

  .pw-qv{
    position:fixed;
    inset:0;
    z-index:9999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:16px;
  }
  .pw-qv.hidden{ display:none; }

  .pw-qv__backdrop{
    position:absolute;
    inset:0;
    background:rgba(15,23,42,.55);
    backdrop-filter: blur(2px);
  }

  .pw-qv__panel{
    position:relative;
    width:min(980px, 96vw);
    height:min(78vh, 720px);
    background:#fff;
    border-radius:18px;
    box-shadow: 0 30px 80px rgba(0,0,0,.25);
    overflow:hidden;
    display:flex;
    flex-direction:column;
  }

  .pw-qv__top{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:12px 14px;
    border-bottom:1px solid #eef2f7;
  }
  .pw-qv__title{
    font-weight:900;
    color:#0f172a;
  }
  .pw-qv__close{
    width:36px;height:36px;
    border-radius:12px;
    border:1px solid #e5eaf3;
    background:#fff;
    cursor:pointer;
    font-weight:900;
  }
  .pw-qv__close:hover{ background:#f6f8fc; }

  .pw-qv__frame{
    width:100%;
    height:100%;
    border:0;
    background:#fff;
  }

  .pw-qv__bottom{
    padding:10px 14px;
    border-top:1px solid #eef2f7;
    display:flex;
    justify-content:flex-end;
  }
  .pw-qv__open{
    font-weight:900;
    font-size:12px;
    color:#2563eb;
    text-decoration:none;
  }
  .pw-qv__open:hover{ text-decoration:underline; }

  @media (max-width: 520px){
    .pw-qv__panel{
      width: 96vw;
      height: 86vh;
      border-radius:16px;
    }
  }
  `;

  const style = document.createElement("style");
  style.id = "pwUiV5Styles";
  style.textContent = css;
  document.head.appendChild(style);
}

// =====================
// Events
// =====================
backBtn?.addEventListener("click", goBack);
resetBtn?.addEventListener("click", resetAll);
resultBackBtn?.addEventListener("click", resultBack);
startOverBtn?.addEventListener("click", resetAll);
