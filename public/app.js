const wizard = document.getElementById("wizard");
const resultDiv = document.getElementById("result");

wizard.innerHTML = `<div class="card"><h2>Kies je ondergrond</h2></div>`;

const steps = [
  {
    question: "Welke ondergrond heb je?",
    key: "substrate",
    options: [
      { label: "Blank metaal", value: "blank_metaal" },
      { label: "Kunststof", value: "kunststof" },
      { label: "Bestaande lak", value: "bestaande_lak" },
      { label: "Plamuur", value: "plamuur" }
    ]
  },
  {
    question: "Wat wil je bereiken?",
    key: "situation",
    optionsMap: {
      blank_metaal: [{ label: "Hechting + bescherming", value: "hechting_bescherming" }],
      kunststof: [{ label: "Hechting op kunststof", value: "hechting_kunststof" }],
      bestaande_lak: [{ label: "Egaliseren (filler)", value: "egaliseren" }],
      plamuur: [{ label: "Vullen en schuren", value: "vullen" }]
    }
  }
];

let answers = {};
let stepIndex = 0;

function renderStep() {
  const step = steps[stepIndex];
  wizard.innerHTML = `<div class="card"><h2>${step.question}</h2></div>`;
  const card = wizard.querySelector(".card");

  let options = step.options;
  if (!options && step.optionsMap) {
    options = step.optionsMap[answers.substrate] || [];
  }

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt.label;
    btn.onclick = () => {
      answers[step.key] = opt.value;
      stepIndex++;
      if (stepIndex < steps.length) renderStep();
      else fetchAdvice();
    };
    card.appendChild(btn);
  });
}

async function fetchAdvice() {
  wizard.innerHTML = `<div class="card"><h2>Advies ophalen…</h2></div>`;
  const res = await fetch(`/api/advice?substrate=${encodeURIComponent(answers.substrate)}&situation=${encodeURIComponent(answers.situation)}`);
  const data = await res.json();

  wizard.classList.add("hidden");
  resultDiv.classList.remove("hidden");

  let html = `<div class="card"><h2>Advies</h2><p>${data.summary || ""}</p>`;

  (data.products || []).forEach(p => {
    html += `
      <div style="margin-top:15px;">
        <strong>${p.brand} - ${p.name}</strong><br>
        Code: ${p.code || "-"}<br>
        ${p.url ? `<a href="${p.url}" target="_blank" rel="noreferrer">Bekijk product</a>` : ""}
      </div>
    `;
  });

  html += `<br><button onclick="location.reload()">Opnieuw</button></div>`;
  resultDiv.innerHTML = html;
}

renderStep();
