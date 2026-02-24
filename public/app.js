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

// Wizard definities (je kunt later makkelijk stappen toevoegen)
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
        // later evt: { label: "Alleen sealen / wet-on-wet", value: "sealen" }
      ],
      plamuur: [
        { label: "Vullen en strak schuren (primer/filler)", value: "vullen" }
      ]
    }
  }
];

let stepIndex = 0;
let answers = {};

// Zet UI in wizard-modus
function showWizard() {
  resultCard.classList.add("hidden");
  wizardCard.classList.remove("hidden");
}

// Zet UI in resultaat-modus
function showResult() {
  wizardCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

// Progress + step header updaten
function updateTopBar() {
  const total = steps.length;
  const current = stepIndex + 1;

  stepText.textContent = `Stap ${current} van ${total}`;
  stepHint.textContent = steps[stepIndex].hint || "";

  const pct = Math.round(((current - 1) / total) * 100); // 0% op stap 1, 50% op stap 2 (bij 2 stappen)
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = `${pct}%`;

  backBtn.disabled = stepIndex === 0;
}

// Opties voor huidige stap ophalen
function getCurrentOptions() {
  const step = steps[stepIndex];
  if (step.options) return step.options;

  // afhankelijk van substrate
  const substrate = answers.substrate;
  return (step.optionsMap && step.optionsMap[substrate]) ? step.optionsMap[substrate] : [];
}

// Stap renderen
function renderStep() {
  showWizard();
  updateTopBar();

  const step = steps[stepIndex];
  questionEl.textContent = step.title;

  const opts = getCurrentOptions();
  optionsEl.innerHTML = "";

  if (!opts.length) {
    // Als stap 2 geen opties heeft (bijv. substrate nog niet gekozen)
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

// Selectie verwerken
function selectOption(stepId, value) {
  answers[stepId] = value;

  // Als substrate wordt aangepast: situation resetten
  if (stepId === "substrate") {
    delete answers["situation"];
  }

  if (stepIndex < steps.length - 1) {
    stepIndex += 1;
    renderStep();
    return;
  }

  // Laatste stap gekozen -> advies ophalen
  fetchAdvice();
}

// Terug knop
function goBack() {
  if (stepIndex === 0) return;
  stepIndex -= 1;
  renderStep();
}

// Reset
function resetAll() {
  stepIndex = 0;
  answers = {};
  renderStep();
}

// Resultaat terug (naar laatste stap)
function resultBack() {
  showWizard();
  stepIndex = Math.max(0, steps.length - 1);
  renderStep();
}

// API call
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
        ${p.url ? `<div class="productLink"><a href="${p.url}" target="_blank" rel="noreferrer">Bekijk product</a></div>` : ""}
      </div>
    `).join("");

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

// Events
backBtn.addEventListener("click", goBack);
resetBtn.addEventListener("click", resetAll);
resultBackBtn.addEventListener("click", resultBack);
startOverBtn.addEventListener("click", resetAll);

// Start
renderStep();
