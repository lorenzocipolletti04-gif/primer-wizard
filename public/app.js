// =====================
// PRIMER WIZARD app.js (UI v2: cards zoals foto 2/3 + 1 groene CTA, geen qty/help)
// =====================

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

// ===== Products (jouw echte URL's + ID's) =====
const PRODUCTS = {
  filler_1k: {
    key: "filler_1k",
    name: "CS 1K Hoogvullende primer",
    brand: "CS",
    code: "151.522",
    url: "/nl/cs-1k-hoogvullende-primer",
    ccvProductId: "900611573",
    image: "", // optioneel
  },
  plastic: {
    key: "plastic",
    name: "CS Plastic Primer Transparant - 400ml",
    brand: "CS",
    code: "145.986",
    url: "/nl/CS-Plastic-Primer-Transparant-400ml",
    ccvProductId: "900611528",
    image: "",
  },
  epoxy_2k: {
    key: "epoxy_2k",
    name: "CS 2K Epoxy Fill Primer",
    brand: "CS",
    code: "159.158",
    url: "/nl/CS-2k-Epoxy-Fill-Primer",
    ccvProductId: "900611519",
    image: "",
  },
  epoxy_1k: {
    key: "epoxy_1k",
    name: "CS 1K Epoxy Primer - 400ml",
    brand: "CS",
    code: "151.958",
    url: "/nl/CS-1K-Epoxy-Primer-400ml",
    ccvProductId: "900611507",
    image: "",
  },
  etch: {
    key: "etch",
    name: "Finixa Etch primer grijs - 400 ml",
    brand: "Finixa",
    code: "TSP 190",
    url: "/nl/Finixa-Etch-primer-grijs-400-ml",
    ccvProductId: "900588323",
    image: "",
  },
  zinc: {
    key: "zinc",
    name: "Finixa Zinkspray - 400 ml",
    brand: "Finixa",
    code: "TSP 410",
    url: "/nl/Finixa-Zinkspray-400-ml",
    ccvProductId: "900589553",
    image: "",
  },
  gloves: {
    key: "gloves",
    name: "Eurogloves Soft Nitrile",
    brand: "Eurogloves",
    code: "",
    url: "/nl/Eurogloves-Soft-Nitrile",
    ccvProductId: "900590462",
    image: "",
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
// Inject CSS (zodat jij 1 bestand hebt)
// =====================
injectUiStyles();

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

  if (stepId === "substrate") {
    delete answers.goal;
  }

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

// default selectie regels
function shouldDefaultSelect(stepLabel) {
  const s = String(stepLabel || "").toLowerCase();
  if (s.includes("beste")) return true;
  if (s.includes("snelle")) return true;
  if (s.includes("alternatief")) return true;
  if (s.includes("tip") || s.includes("optioneel")) return false;
  return true;
}

// =====================
// Render advice (cards + 1 CTA)
// =====================
function renderAdvice() {
  showResult();
  if (resultSummary) resultSummary.textContent = "Advies maken…";
  if (productList) productList.innerHTML = "";

  const data = buildAdvice(answers.substrate, answers.goal);
  if (resultSummary) resultSummary.textContent = data.summary || "";

  const products = data.products || [];

  // init defaults (alleen als nog niets gekozen)
  if (selectedProductIds.size === 0) {
    products.forEach((p) => {
      if (p.ccvProductId && shouldDefaultSelect(p.stepLabel)) {
        selectedProductIds.add(String(p.ccvProductId));
      }
    });
  }

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

  const badges = [
    p.stepLabel ? `<span class="pw-badge">${escapeHtml(p.stepLabel)}</span>` : "",
    p.brand ? `<span class="pw-badge">${escapeHtml(p.brand)}</span>` : "",
    p.code ? `<span class="pw-badge">${escapeHtml(p.code)}</span>` : "",
  ].join("");

  const img = p.image
    ? `<img class="pw-upsell-img" src="${escapeHtml(toAbsoluteUrl(p.image))}" alt="" loading="lazy">`
    : `<div class="pw-upsell-img pw-upsell-img--placeholder" aria-hidden="true"></div>`;

  return `
    <div class="pw-upsell-card ${selected ? "is-selected" : ""}" data-id="${escapeHtml(id)}">
      ${img}

      <div class="pw-upsell-meta">
        <div class="pw-upsell-badges">${badges}</div>
        <div class="pw-upsell-name" title="${escapeHtml(p.name || "")}">${escapeHtml(p.name || "")}</div>
        ${p.notes ? `<div class="pw-upsell-notes">${escapeHtml(p.notes)}</div>` : ""}
        ${url ? `<a class="pw-viewlink" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Bekijk product</a>` : ""}
      </div>

      <button type="button" class="pw-upsell-add" ${id ? "" : "disabled"} aria-label="Toevoegen">
        ${selected ? "✓" : "+"}
      </button>
    </div>
  `;
}

function bindUpsellEvents(products) {
  const addBtns = productList.querySelectorAll(".pw-upsell-add");

  addBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".pw-upsell-card");
      const id = card?.getAttribute("data-id") || "";
      if (!id) return;

      if (selectedProductIds.has(id)) {
        selectedProductIds.delete(id);
        card.classList.remove("is-selected");
        btn.textContent = "+";
      } else {
        selectedProductIds.add(id);
        card.classList.add("is-selected");
        btn.textContent = "✓";
      }

      updateOrderButton();
    });
  });

  const orderBtn = productList.querySelector("#pwOrderBtn");
  if (orderBtn) orderBtn.addEventListener("click", () => bulkAddSelected(products));
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

  if (count === 1) btn.textContent = "Bestellen";
  else btn.textContent = `${count} producten bestellen`;
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
// Styles (embedded)
// =====================
function injectUiStyles() {
  if (document.getElementById("pwUiV2Styles")) return;

  const css = `
  .pw-panel{
    background:#fff;
    border:1px solid #e9edf3;
    border-radius:16px;
    padding:18px;
  }
  .pw-section-title{
    font-weight:800;
    font-size:16px;
    margin:0 0 12px;
    color:#0f172a;
  }
  .pw-upsell-list{ display:grid; gap:12px; margin-top:10px; }
  .pw-upsell-card{
    display:grid;
    grid-template-columns:56px 1fr 44px;
    align-items:center;
    gap:12px;
    border:1px solid #eef2f7;
    border-radius:14px;
    padding:12px;
    background:#fff;
    box-shadow:0 6px 18px rgba(16,24,40,.06);
  }
  .pw-upsell-card.is-selected{
    border-color:#d7e2f2;
    box-shadow:0 10px 22px rgba(16,24,40,.08);
  }
  .pw-upsell-img{
    width:56px; height:56px; border-radius:12px;
    background:#f6f7fb;
    border:1px solid #eef2f7;
    object-fit:contain;
  }
  .pw-upsell-img--placeholder{ display:block; }
  .pw-upsell-meta{ min-width:0; }
  .pw-upsell-badges{ display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; }
  .pw-badge{
    font-size:12px;
    padding:4px 10px;
    border-radius:999px;
    border:1px solid #e5eaf3;
    color:#0f172a;
    background:#fff;
    white-space:nowrap;
  }
  .pw-upsell-name{
    font-weight:800;
    font-size:13px;
    line-height:1.2;
    margin:0 0 6px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    color:#0f172a;
  }
  .pw-upsell-notes{
    font-size:12px;
    color:#64748b;
    margin:0 0 6px;
  }
  .pw-viewlink{
    font-size:12px;
    font-weight:700;
    color:#2563eb;
    text-decoration:none;
  }
  .pw-viewlink:hover{ text-decoration:underline; }

  .pw-upsell-add{
    width:40px; height:40px;
    border-radius:10px;
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
    height:44px;
    border:0;
    border-radius:12px;
    background:#22c55e;
    color:#fff;
    font-weight:900;
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
  .pw-empty__title{ font-weight:800; color:#0f172a; margin-bottom:6px; }
  .pw-empty__text{ font-size:13px; }
  `;

  const style = document.createElement("style");
  style.id = "pwUiV2Styles";
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

// start
renderStep();
