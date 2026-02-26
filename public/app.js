// =====================
// PRIMER WIZARD app.js (UI v7)
// - Wizard vragen → haalt advies + producten uit D1 via /api/advice
// - Quick View modal (CSP-proof)
// - Bulk add-to-cart via postMessage naar CCVShop
// =====================

console.log("Primer Wizard UI v7 loaded ✅");

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

// ===== State =====
let stepIndex = 0;
let answers = {};
let selectedProductIds = new Set();
let lastAdviceProducts = [];

// Quick view state
let quickViewProduct = null;

// =====================
// Boot
// =====================
injectUiStyles();
ensureQuickViewModal();
renderStep();

// =====================
// Wizard steps (dynamisch)
// =====================
function getFlowSteps() {
  // Stap 1: hoofdgroep
  const flow = [
    {
      id: "group",
      title: "Waarop ga je primeren?",
      hint: "Kies de ondergrond. Daarna stellen we 1–2 korte vervolgvragen.",
      options: [
        { label: "Blank metaal", value: "metaal" },
        { label: "Kunststof / plastic", value: "kunststof" },
        { label: "Bestaande lak (geschuurd)", value: "bestaande_lak" },
        { label: "Plamuur / polyester", value: "plamuur" },
      ],
    },
  ];

  // Metaal subtype
  if (answers.group === "metaal") {
    flow.push({
      id: "substrate",
      title: "Welk metaal is het?",
      hint: "Voor verschillende metalen is de beste basis anders.",
      options: [
        { label: "Staal (blank metaal)", value: "staal" },
        { label: "Aluminium", value: "aluminium" },
        { label: "Verzinkt (galvaniseerd)", value: "verzinkt" },
      ],
    });
  }

  // Doel / situatie
  flow.push({
    id: "situation",
    title: "Wat is je doel?",
    hint: "We kiezen op basis van bescherming vs snelheid of vulling.",
    options: situationOptionsFor(answers.group),
  });

  return flow;
}

function situationOptionsFor(group) {
  if (group === "metaal") {
    return [
      { label: "Maximale hechting + bescherming", value: "max_bescherming" },
      { label: "Snelle spotrepair (kleine plek)", value: "spotrepair" },
    ];
  }
  if (group === "kunststof") {
    return [
      { label: "Duurzame hechting (bumpers/trim)", value: "max_bescherming" },
      { label: "Snelle spotrepair", value: "spotrepair" },
    ];
  }
  if (group === "bestaande_lak") {
    return [
      { label: "Egaliseren / schuurgrond", value: "egaliseren" },
      { label: "Vullen (meer opbouw/krassen weg)", value: "vullen" },
    ];
  }
  if (group === "plamuur") {
    return [
      { label: "Vullen en strak schuren", value: "vullen" },
      { label: "Snelle spotrepair", value: "spotrepair" },
    ];
  }
  return [];
}

function resolveSubstrateId() {
  // DB verwacht substrate_id: staal|aluminium|verzinkt|kunststof|bestaande_lak|plamuur
  if (answers.group === "metaal") return answers.substrate || null;
  if (answers.group === "kunststof") return "kunststof";
  if (answers.group === "bestaande_lak") return "bestaande_lak";
  if (answers.group === "plamuur") return "plamuur";
  return null;
}

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

function updateTopBar(flow) {
  const total = flow.length;
  const current = stepIndex + 1;

  if (stepText) stepText.textContent = `Stap ${current} van ${total}`;
  if (stepHint) stepHint.textContent = flow[stepIndex].hint || "";

  const pct = Math.round((current / total) * 100);
  if (progressBar) progressBar.style.width = pct + "%";
  if (progressLabel) progressLabel.textContent = pct + "%";

  if (backBtn) backBtn.disabled = stepIndex === 0;
}

function renderStep() {
  showWizard();

  const flow = getFlowSteps();
  stepIndex = clamp(stepIndex, 0, flow.length - 1);

  updateTopBar(flow);

  const step = flow[stepIndex];
  if (questionEl) questionEl.textContent = step.title;

  if (!optionsEl) return;
  optionsEl.innerHTML = "";

  const opts = step.options || [];
  if (!opts.length) {
    optionsEl.innerHTML = `
      <div class="pw-empty">
        <div class="pw-empty__title">Geen opties beschikbaar</div>
        <div class="pw-empty__text">Ga terug en maak eerst een keuze.</div>
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
  const flow = getFlowSteps();

  answers[stepId] = value;

  // Bij wissel van hoofdgroep: reset onderliggende keuzes
  if (stepId === "group") {
    delete answers.substrate;
    delete answers.situation;
  }
  if (stepId === "substrate") {
    // niets speciaals
  }

  // Ga naar volgende stap of toon resultaat
  const nextFlow = getFlowSteps();
  const lastIndex = nextFlow.length - 1;

  if (stepIndex < lastIndex) {
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
  lastAdviceProducts = [];
  closeQuickView();
  renderStep();
}

function resultBack() {
  // terug naar laatste vraag
  const flow = getFlowSteps();
  stepIndex = Math.max(0, flow.length - 1);
  renderStep();
}

// Bind buttons
backBtn?.addEventListener("click", goBack);
resetBtn?.addEventListener("click", resetAll);
resultBackBtn?.addEventListener("click", resultBack);
startOverBtn?.addEventListener("click", resetAll);

// =====================
// Advice (via API)
// =====================
async function renderAdvice() {
  showResult();
  if (resultSummary) resultSummary.textContent = "Advies ophalen…";
  if (productList) productList.innerHTML = "";

  const substrate = resolveSubstrateId();
  const situation = answers.situation || null;

  if (!substrate || !situation) {
    if (resultSummary) resultSummary.textContent = "Maak je keuzes af om advies te krijgen.";
    return;
  }

  try {
    const q = new URLSearchParams({ substrate, situation });
    const res = await fetch(`/api/advice?${q.toString()}`, { cache: "no-store" });

    if (!res.ok) {
      const txt = await safeText(res);
      throw new Error(`API ${res.status}: ${txt || "unknown"}`);
    }

    const data = await res.json();
    const products = Array.isArray(data.products) ? data.products : [];
    lastAdviceProducts = products;

    if (resultSummary) resultSummary.textContent = data.summary || "";
    renderProducts(products);
  } catch (err) {
    console.error("renderAdvice failed:", err);
    if (resultSummary) resultSummary.textContent = "Sorry — advies laden lukt nu niet. Probeer opnieuw.";
  }
}

function renderProducts(products) {
  if (!productList) return;

  // 1 primaire selectie: selecteer automatisch de eerste Stap 1 met ccvProductId
  applyDefaultSelection(products);

  const cardsHtml = products.map(renderUpsellCard).join("");

  productList.innerHTML = `
    <div class="pw-panel">
      <div class="pw-section-title">Aanbevolen producten</div>

      <div class="pw-upsell-list">
        ${cardsHtml || `<div class="pw-empty"><div class="pw-empty__title">Geen producten</div></div>`}
      </div>

      <div class="pw-orderbar">
        <button type="button" class="pw-order-button" id="pwOrderBtn">Bestellen</button>
      </div>
    </div>
  `;

  bindUpsellEvents(products);
  syncCardSelections();
  updateOrderButton();
}

// =====================
// Selection rules (1 primaire)
// =====================
function badgeType(label) {
  const s = String(label || "").toLowerCase();
  if (s.includes("stap 1")) return "best";
  if (s.includes("stap 2")) return "alt";
  if (s.includes("stap 3")) return "opt";
  return "default";
}
function isPrimaryLabel(label) {
  return badgeType(label) === "best"; // alleen stap 1 is primair
}

function applyDefaultSelection(products) {
  normalizePrimarySelection(products);
  if (selectedProductIds.size > 0) return;

  const primaries = products.filter((p) => p.ccvProductId && isPrimaryLabel(p.stepLabel));
  const pick = primaries[0] || null;
  if (pick?.ccvProductId) selectedProductIds.add(String(pick.ccvProductId));
}

function normalizePrimarySelection(products) {
  const primaryIds = products
    .filter((p) => p.ccvProductId && isPrimaryLabel(p.stepLabel))
    .map((p) => String(p.ccvProductId));

  const selectedPrimaries = primaryIds.filter((id) => selectedProductIds.has(id));
  if (selectedPrimaries.length <= 1) return;

  // Houd de eerste geselecteerde primaire, drop de rest
  selectedPrimaries.slice(1).forEach((id) => selectedProductIds.delete(id));
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
// Render cards
// =====================
function renderUpsellCard(p) {
  const id = p.ccvProductId ? String(p.ccvProductId) : "";
  const selected = id && selectedProductIds.has(id);
  const url = p.url ? toAbsoluteUrl(p.url) : "";
  const t = badgeType(p.stepLabel);
  const isPrimary = isPrimaryLabel(p.stepLabel);

  const badgeMain = p.stepLabel
    ? `<span class="pw-badge pw-badge--${t}">${escapeHtml(p.stepLabel)}</span>`
    : "";

  const badges = [
    badgeMain,
    p.brand ? `<span class="pw-badge pw-badge--meta">${escapeHtml(p.brand)}</span>` : "",
    p.code ? `<span class="pw-badge pw-badge--meta">${escapeHtml(p.code)}</span>` : "",
  ].join("");

  const imgUrl = p.imageUrl ? toAbsoluteUrl(p.imageUrl) : "";
  const img = imgUrl
    ? `<img class="pw-upsell-img" src="${escapeHtml(imgUrl)}" alt="" loading="lazy">`
    : `<div class="pw-upsell-img pw-upsell-img--placeholder" aria-hidden="true"></div>`;

  const priceHtml = p.price ? `<div class="pw-price">${escapeHtml(p.price)}</div>` : "";

  return `
    <div class="pw-upsell-card ${selected ? "is-selected" : ""} ${t === "best" ? "is-best" : ""}"
         data-id="${escapeHtml(id)}"
         data-primary="${isPrimary ? "1" : "0"}"
         data-url="${escapeHtml(url)}"
         data-name="${escapeHtml(p.name || "") }"
         data-price="${escapeHtml(p.price || "") }"
         data-img="${escapeHtml(imgUrl)}"
         data-notes="${escapeHtml(p.notes || "") }"
         data-badgelabel="${escapeHtml(p.stepLabel || "") }"
         data-badgetype="${escapeHtml(t)}">
      ${img}

      <div class="pw-upsell-meta">
        <div class="pw-upsell-badges">${badges}</div>
        <div class="pw-upsell-name" title="${escapeHtml(p.name || "")}">${escapeHtml(p.name || "")}</div>
        ${priceHtml}
        ${p.notes ? `<div class="pw-upsell-notes">${escapeHtml(p.notes)}</div>` : ""}
        <div class="pw-actions">
          ${url ? `<button type="button" class="pw-quickbtn">Snel bekijken</button>` : ""}
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

  productList.onclick = (e) => {
    const t = e.target;

    // Snel bekijken
    const quickBtn = t?.closest?.(".pw-quickbtn");
    if (quickBtn) {
      e.preventDefault();
      e.stopPropagation();
      const card = quickBtn.closest(".pw-upsell-card");
      if (!card) return;
      const product = extractProductFromCard(card);
      openQuickView(product);
      return;
    }

    // + / ✓ selecteren
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

function extractProductFromCard(card) {
  const id = card.getAttribute("data-id") || "";
  return {
    id,
    name: card.getAttribute("data-name") || "",
    price: card.getAttribute("data-price") || "",
    image: card.getAttribute("data-img") || "",
    notes: card.getAttribute("data-notes") || "",
    url: card.getAttribute("data-url") || "",
    badgeLabel: card.getAttribute("data-badgelabel") || "",
    badgeType: card.getAttribute("data-badgetype") || "default",
  };
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
// Bulk add to cart
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
    await wait(350);
  }

  btn.textContent = "Toegevoegd ✓";
  setTimeout(() => {
    btn.textContent = oldText;
    btn.disabled = false;
    updateOrderButton();
  }, 1100);
}

// =====================
// Quick view modal (zonder iframe)
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

      <div class="pw-qv__body">
        <div class="pw-qv__media">
          <img class="pw-qv__img" alt="" />
        </div>

        <div class="pw-qv__info">
          <div class="pw-qv__badges"></div>
          <div class="pw-qv__name"></div>
          <div class="pw-qv__price"></div>
          <div class="pw-qv__notes"></div>

          <div class="pw-qv__actions">
            <a class="pw-qv__link" target="_top" rel="noopener">Open product</a>
            <button type="button" class="pw-qv__add">Toevoegen</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  el.addEventListener("click", (e) => {
    const close = e.target?.getAttribute?.("data-qv-close");
    if (close) closeQuickView();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQuickView();
  });
}

function openQuickView(p) {
  quickViewProduct = p;
  const root = document.getElementById("pwQuickView");
  if (!root) return;

  root.classList.remove("hidden");
  document.body.classList.add("pw-noscroll");

  const img = root.querySelector(".pw-qv__img");
  const name = root.querySelector(".pw-qv__name");
  const price = root.querySelector(".pw-qv__price");
  const notes = root.querySelector(".pw-qv__notes");
  const badges = root.querySelector(".pw-qv__badges");
  const link = root.querySelector(".pw-qv__link");
  const addBtn = root.querySelector(".pw-qv__add");

  if (img) img.src = p.image || "";
  if (name) name.textContent = p.name || "";
  if (price) price.textContent = p.price || "";
  if (notes) notes.textContent = p.notes || "";
  if (badges) badges.innerHTML = p.badgeLabel ? `<span class="pw-badge pw-badge--${escapeHtml(p.badgeType)}">${escapeHtml(p.badgeLabel)}</span>` : "";
  if (link) link.href = p.url || "#";

  if (addBtn) {
    const selected = p.id && selectedProductIds.has(String(p.id));
    addBtn.textContent = selected ? "Geselecteerd ✓" : "Toevoegen";
    addBtn.disabled = !p.id;
    addBtn.onclick = () => {
      if (!p.id) return;
      const isPrimary = p.badgeType === "best";

      if (selectedProductIds.has(String(p.id))) {
        selectedProductIds.delete(String(p.id));
      } else {
        if (isPrimary) deselectOtherPrimaries(lastAdviceProducts, String(p.id));
        selectedProductIds.add(String(p.id));
      }
      normalizePrimarySelection(lastAdviceProducts);
      syncCardSelections();
      updateOrderButton();
      closeQuickView();
    };
  }
}

function closeQuickView() {
  quickViewProduct = null;
  const root = document.getElementById("pwQuickView");
  if (!root) return;
  root.classList.add("hidden");
  document.body.classList.remove("pw-noscroll");
}

// =====================
// Utils
// =====================
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toAbsoluteUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return SHOP_BASE_URL + url;
  return url;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function safeText(res) {
  try {
    return await res.text();
  } catch (e) {
    return "";
  }
}

// =====================
// CSS inject (kleine aanvullingen)
// =====================
function injectUiStyles() {
  const css = `
    .pw-noscroll{overflow:hidden;}
    .pw-qv.hidden{display:none;}
    .pw-qv{position:fixed;inset:0;z-index:9999;}
    .pw-qv__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);}
    .pw-qv__panel{position:relative;max-width:860px;margin:5vh auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 25px 70px rgba(0,0,0,.25);}
    .pw-qv__top{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(0,0,0,.08)}
    .pw-qv__title{font-weight:700}
    .pw-qv__close{background:transparent;border:0;font-size:18px;cursor:pointer;padding:6px 10px}
    .pw-qv__body{display:grid;grid-template-columns:1fr 1.2fr;gap:14px;padding:16px}
    .pw-qv__media{display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.03);border-radius:12px;min-height:240px}
    .pw-qv__img{max-width:100%;max-height:340px;object-fit:contain}
    .pw-qv__name{font-weight:800;font-size:18px;margin-top:8px}
    .pw-qv__price{margin-top:6px;font-weight:700}
    .pw-qv__notes{margin-top:10px;line-height:1.4;color:rgba(0,0,0,.75)}
    .pw-qv__actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
    .pw-qv__link{display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border-radius:12px;border:1px solid rgba(0,0,0,.14);text-decoration:none;color:#111}
    .pw-qv__add{display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border-radius:12px;border:0;background:#111;color:#fff;cursor:pointer}
    @media (max-width: 760px){
      .pw-qv__panel{margin:0;border-radius:0;max-width:none;height:100%;}
      .pw-qv__body{grid-template-columns:1fr;}
      .pw-qv__media{min-height:200px;}
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
