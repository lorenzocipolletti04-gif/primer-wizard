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

// Wizard definities
const steps = [
  {
    id: "substrate",
    title: "Welke ondergrond heb je?",
    hint: "Kies de ondergrond waarop je gaat primeren.",
    options: [
      { label: "Blank metaal (staal/verzinkt/aluminium)", value: "blank_metaal" },
      { label: "Kunststof / plastic", value: "kunststof" },
      { label: "Bestaande lak (geschuurd)", value: "bestaande_lak" },
      { label: "Plamuur / polyester filler", value: "plamuur" }
    ]
  },
  {
    id: "situation",
    title: "Wat wil je vooral bereiken?",
    hint: "Dit bepaalt welke primer(s) je nodig hebt.",
    optionsMap: {
      blank_metaal: [
        { label: "Hechting + (anti)corrosie op metaal", value: "hechting_bescherming" },
        { label: "Snelle spot repair (kleine plek)", value: "snelle_spot" }
      ],
      kunststof: [
        { label: "Hechting op kunststof (adhesion promoter)", value: "hechting_kunststof" }
      ],
      bestaande_lak: [
        { label: "Egaliseren / schuurgrond (primer/filler)", value: "egaliseren" }
      ],
      plamuur: [
        { label: "Vullen en strak schuren (primer/filler)", value: "vullen" }
      ]
    }
  }
];

let stepIndex = 0;
let answers = {};

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

  const pct = Math.round(((current - 1) / total) * 100);
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = `${pct}%`;

  backBtn.disabled = stepIndex === 0;
}

function getCurrentOptions() {
  const step = steps[stepIndex];
  if (step.options) return step.options;

  const substrate = answers.substrate;
  return (step.optionsMap && step.optionsMap[substrate]) ? step.optionsMap[substrate] : [];
}

function renderStep() {
  showWizard();
  updateTopBar();

  const step = steps[stepIndex];
  questionEl.textContent = step.title;

  const opts = getCurrentOptions();
  optionsEl.innerHTML = "";

  if (!opts.length) {
    const msg = document.createElement("div");
    msg.className = "product";
    msg.innerHTML = `<div class="productName">Geen opties beschikbaar</div>
                     <div class="productNotes">Ga terug en kies eerst een ondergrond.</div>`;
    optionsEl.appendChild(msg);
    return;
  }

  opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "optionBtn";
    btn.type = "button";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => selectOption(step.id, opt.value));
    optionsEl.appendChild(btn);
  });
}

function selectOption(stepId, value) {
  answers[stepId] = value;

  if (stepId === "substrate") {
    delete answers["situation"];
  }

  if (stepIndex < steps.length - 1) {
    stepIndex += 1;
    renderStep();
    return;
  }

  fetchAdvice();
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
  showWizard();
  stepIndex = Math.max(0, steps.length - 1);
  renderStep();
}

async function fetchAdvice() {
  showResult();
  resultSummary.textContent = "Advies ophalen…";
  productList.innerHTML = "";

  const substrate = answers.substrate;
  const situation = answers.situation;

  const url = `/api/advice?substrate=${encodeURIComponent(substrate)}&situation=${encodeURIComponent(situation)}`;

  try {
    const res = await fetch(url, { headers: { "accept": "application/json" } });
    if (!res.ok) {
      const txt = await res.text();
      resultSummary.textContent = `Er ging iets mis (${res.status}).`;
      productList.innerHTML = `<div class="product"><div class="productName">API fout</div>
        <div class="productNotes" style="white-space:pre-wrap;">${escapeHtml(txt)}</div></div>`;
      return;
    }

    const data = await res.json();
    resultSummary.textContent = data.summary || "";

    const products = data.products || [];
    productList.innerHTML = products.map(p => `
      <div class="product">
        <div class="productHead">
          ${p.stepLabel ? `<span class="badge">${escapeHtml(p.stepLabel)}</span>` : ""}
          <span class="badge">${escapeHtml(p.brand || "")}</span>
          ${p.code ? `<span class="badge">${escapeHtml(p.code)}</span>` : ""}
        </div>
        <div class="productName">${escapeHtml(p.name || "")}</div>
        ${p.notes ? `<div class="productNotes">${escapeHtml(p.notes)}</div>` : ""}

        <div class="productActions">
          ${p.url ? `<a class="viewBtn" href="${p.url}" target="_blank" rel="noreferrer">Bekijk product</a>` : ""}
          ${p.ccvProductId ? `<button class="addToCartBtn" type="button" data-ccv-id="${escapeHtml(p.ccvProductId)}">Voeg toe aan winkelwagen</button>` : ""}
        </div>
      </div>
    `).join("");

    // Add-to-cart knoppen (werkt via parent script op lakopmaat.nl)
    productList.querySelectorAll(".addToCartBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-ccv-id");
        if (!productId) return;

        window.parent.postMessage(
          { type: "CCV_ADD_TO_CART", productId, qty: 1 },
          "https://www.lakopmaat.nl"
        );

        const old = btn.textContent;
        btn.textContent = "Toegevoegd…";
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = old;
          btn.disabled = false;
        }, 1200);
      });
    });

  } catch (e) {
    resultSummary.textContent = "Er ging iets mis bij het ophalen van het advies.";
    productList.innerHTML = `<div class="product"><div class="productNotes">${escapeHtml(String(e))}</div></div>`;
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

backBtn.addEventListener("click", goBack);
resetBtn.addEventListener("click", resetAll);
resultBackBtn.addEventListener("click", resultBack);
startOverBtn.addEventListener("click", resetAll);

renderStep();
