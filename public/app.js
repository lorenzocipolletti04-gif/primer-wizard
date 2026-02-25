// =====================
// PRIMER WIZARD (Tooltec / lakopmaat.nl)
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
  },
  plastic: {
    key: "plastic",
    name: "CS Plastic Primer Transparant - 400ml",
    brand: "CS",
    code: "145.986",
    url: "/nl/CS-Plastic-Primer-Transparant-400ml",
    ccvProductId: "900611528",
  },
  epoxy_2k: {
    key: "epoxy_2k",
    name: "CS 2K Epoxy Fill Primer",
    brand: "CS",
    code: "159.158",
    url: "/nl/CS-2k-Epoxy-Fill-Primer",
    ccvProductId: "900611519",
  },
  epoxy_1k: {
    key: "epoxy_1k",
    name: "CS 1K Epoxy Primer - 400ml",
    brand: "CS",
    code: "151.958",
    url: "/nl/CS-1K-Epoxy-Primer-400ml",
    ccvProductId: "900611507",
  },
  etch: {
    key: "etch",
    name: "Finixa Etch primer grijs - 400 ml",
    brand: "Finixa",
    code: "TSP 190",
    url: "/nl/Finixa-Etch-primer-grijs-400-ml",
    ccvProductId: "900588323",
  },
  zinc: {
    key: "zinc",
    name: "Finixa Zinkspray - 400 ml",
    brand: "Finixa",
    code: "TSP 410",
    url: "/nl/Finixa-Zinkspray-400-ml",
    ccvProductId: "900589553",
  },
  gloves: {
    key: "gloves",
    name: "Eurogloves Soft Nitrile",
    brand: "Eurogloves",
    code: "",
    url: "/nl/Eurogloves-Soft-Nitrile",
    ccvProductId: "900590462",
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

// =====================
// UI helpers
// =====================
function showWizard() {
  resultCard.classList.add("hidden");
  wizardCard.classList.remove("hidden");
}

function showResult() {
  wizardCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

function updateTopBar() {
  const total = steps.length;
  const current = stepIndex + 1;
  stepText.textContent = `Stap ${current} van ${total}`;
  stepHint.textContent = steps[stepIndex].hint || "";

  const pct = Math.round((current / total) * 100);
  progressBar.style.width = pct + "%";
  progressLabel.textContent = pct + "%";

  backBtn.disabled = stepIndex === 0;
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
  questionEl.textContent = step.title;

  const opts = getCurrentOptions();
  optionsEl.innerHTML = "";

  if (!opts.length) {
    optionsEl.innerHTML = `
      <div class="product">
        <div class="productName">Geen opties beschikbaar</div>
        <div class="productNotes">Ga terug en kies eerst een ondergrond.</div>
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

  // als ondergrond verandert, reset goal
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
    });
  };

  // ---- Kunststof ----
  if (substrate === "kunststof") {
    out.summary =
      "Voor kunststof heb je een kunststof primer nodig voor goede hechting. Breng dun aan, laat flashen, daarna kun je verder met je lakopbouw.";
    push(PRODUCTS.plastic, "Beste keuze", "Dun aanbrengen. Zorg voor een schone, vetvrije ondergrond.");
    push(PRODUCTS.gloves, "Tip", "Handschoenen voorkomen vet/vingerafdrukken.");
    return out;
  }

  // ---- Plamuur ----
  if (substrate === "plamuur") {
    out.summary =
      "Op plamuur werkt een hoogvullende primer het best: je vult schuurkrassen en krijgt een strakke, egale ondergrond.";
    push(PRODUCTS.filler_1k, "Beste keuze", "Hoog vullend, ideaal om plamuurkrassen te vullen en strak te schuren.");
    push(PRODUCTS.gloves, "Tip", "Handschoenen voorkomen vet/vingerafdrukken.");
    return out;
  }

  // ---- Bestaande lak ----
  if (substrate === "bestaande_lak") {
    if (goal === "egaliseren") {
      out.summary =
        "Op geschuurde lak is een primer/filler perfect om te egaliseren en een goede basis te maken voor de lak.";
      push(PRODUCTS.filler_1k, "Beste keuze", "Egaliseert en vult lichte schuurkrassen.");
      push(PRODUCTS.gloves, "Tip", "Werk schoon en vetvrij voor het beste resultaat.");
      return out;
    }

    // vullen
    out.summary =
      "Wil je meer opbouw en krassen wegwerken? Dan is een hoogvullende primer de juiste keuze.";
    push(PRODUCTS.filler_1k, "Beste keuze", "Meer vulling/opbouw voor een strak eindresultaat.");
    push(PRODUCTS.gloves, "Tip", "Handschoenen houden de ondergrond vetvrij.");
    return out;
  }

  // ---- Blank metaal ----
  if (substrate === "blank_metaal") {
    if (goal === "spotrepair") {
      out.summary =
        "Voor een snelle spotrepair op blank metaal kun je een etch primer gebruiken. Wil je meer bescherming, kies epoxy.";
      push(PRODUCTS.etch, "Snelle keuze", "Dunne laag voor hechting op metaal (spotrepair).");
      push(PRODUCTS.epoxy_1k, "Beste bescherming", "Epoxy geeft betere (anti)corrosie dan etch.");
      push(PRODUCTS.gloves, "Tip", "Blank metaal is gevoelig: werk vetvrij.");
      return out;
    }

    // maximale bescherming
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

function renderAdvice() {
  showResult();
  resultSummary.textContent = "Advies maken…";
  productList.innerHTML = "";

  const substrate = answers.substrate;
  const goal = answers.goal;

  const data = buildAdvice(substrate, goal);

  resultSummary.textContent = data.summary || "";

  const products = data.products || [];
  productList.innerHTML = products
    .map((p, idx) => {
      const cls = idx === 0 ? "product recommended" : "product";

      const badges = [
        p.stepLabel ? `<span class="badge">${escapeHtml(p.stepLabel)}</span>` : "",
        p.brand ? `<span class="badge">${escapeHtml(p.brand)}</span>` : "",
        p.code ? `<span class="badge">${escapeHtml(p.code)}</span>` : "",
      ].join("");

      const url = p.url ? toAbsoluteUrl(p.url) : "";
      const viewBtn = url
        ? `<a class="viewBtn" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Bekijk product</a>`
        : "";

      const addBtn =
        p.ccvProductId && url
          ? `<button class="addToCartBtn" type="button"
                data-ccv-id="${escapeHtml(p.ccvProductId)}"
                data-shop-url="${escapeHtml(url)}">Voeg toe aan winkelwagen</button>`
          : "";

      return `
        <div class="${cls}">
          <div class="productHead">${badges}</div>
          <div class="productName">${escapeHtml(p.name || "")}</div>
          ${p.notes ? `<div class="productNotes">${escapeHtml(p.notes)}</div>` : ""}
          <div class="productActions">${viewBtn}${addBtn}</div>
        </div>
      `;
    })
    .join("");

  bindAddToCartButtons();
}

// =====================
// Add to cart (postMessage to parent)
// =====================
function bindAddToCartButtons() {
  productList.querySelectorAll(".addToCartBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.getAttribute("data-ccv-id");
      const shopUrl = btn.getAttribute("data-shop-url");
      if (!productId || !shopUrl) return;

      // in iframe: naar parent (lakopmaat.nl) sturen
      window.parent.postMessage(
        {
          type: "LOM_ADD_TO_CART",
          payload: {
            productId: String(productId),
            quantity: 1,
            shopUrl: String(shopUrl),
          },
        },
        SHOP_ORIGIN
      );

      const old = btn.textContent;
      btn.textContent = "Toevoegen…";
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = old;
        btn.disabled = false;
      }, 1200);
    });
  });
}


window.parent.postMessage({ type:"LOM_ADD_TO_CART", payload:{...}}, SHOP_ORIGIN);

// extra: vraag parent om pas NA 600ms de minicart te refreshen/openen
setTimeout(() => {
  window.parent.postMessage({ type:"LOM_REFRESH_MINICART" }, SHOP_ORIGIN);
}, 600);




// optioneel: feedback van parent (als je dat later bouwt)
window.addEventListener("message", (event) => {
  if (event.origin !== "https://www.lakopmaat.nl" && event.origin !== "https://lakopmaat.nl") return;
  const data = event.data || {};
  if (data.type !== "LOM_ADD_TO_CART_RESULT") return;
  // hier kunnen we later een toast maken
});

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
// Events
// =====================
backBtn?.addEventListener("click", goBack);
resetBtn?.addEventListener("click", resetAll);
resultBackBtn?.addEventListener("click", resultBack);
startOverBtn?.addEventListener("click", resetAll);

// start
renderStep();
