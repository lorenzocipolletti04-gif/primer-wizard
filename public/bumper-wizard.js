
// =====================
// BUMPERSCHADE WIZARD (homepage)
// - Stap 1: grootte schade -> Lakstift of Spuiten
// - Stap 2: (alleen bij spuiten) kies primer(s) + toevoegen
// - Stap 3: kleur: merk auto + kleurcode + "waar vind ik kleurcode" blok
// - Eind: samenvatting + producten toevoegen aan winkelwagen
// =====================

console.log("Bumper Wizard loaded ✅");

const SHOP_ORIGIN = "https://www.lakopmaat.nl";
const SHOP_BASE_URL = "https://www.lakopmaat.nl";

// ======= VUL HIER JE PRODUCTEN IN =======
// Zet per product: ccvProductId + url + prijs (optioneel) + image (optioneel)
const PRODUCTS = {
  lakstift: {
    key: "lakstift",
    name: "Lakstift op kleur",
    badge: "Aanrader",
    price: "v.a. € …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "", // TODO
    notes: "Voor kleine beschadigingen, steenslag en randjes.",
  },
  spuitbus_kleur: {
    key: "spuitbus_kleur",
    name: "Spuitbus autolak op kleur",
    badge: "Kleur",
    price: "v.a. € …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "", // TODO
    notes: "Voor grotere schades: strak resultaat na primer + lakopbouw.",
  },
  blanke_lak: {
    key: "blanke_lak",
    name: "Blanke lak (hoogglans)",
    badge: "Afwerking",
    price: "€ …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "", // TODO
    notes: "Bescherming + glans. (Bij metallic/parelmoer meestal nodig.)",
  },

  // Primers
  primer_normaal: {
    key: "primer_normaal",
    name: "Universele 1K primer (basis)",
    badge: "Primer",
    price: "€ …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "",
    notes: "Voor geschuurde lak / lichte reparaties.",
  },
  primer_filler: {
    key: "primer_filler",
    name: "Filler / hoogvullende primer",
    badge: "Filler",
    price: "€ …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "",
    notes: "Vult schuurkrassen en kleine oneffenheden. Strakker resultaat.",
  },
  primer_epoxy: {
    key: "primer_epoxy",
    name: "Epoxy primer (hechting + bescherming)",
    badge: "Epoxy",
    price: "€ …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "",
    notes: "Beste keuze op blank metaal / extra bescherming.",
  },
  primer_plastic: {
    key: "primer_plastic",
    name: "Plastic primer (hechting op kunststof)",
    badge: "Kunststof",
    price: "€ …",
    url: "/nl/...", // TODO
    ccvProductId: "", // TODO
    image: "",
    notes: "Voor kale bumperkunststof of lastige hechting.",
  },
};

// ======= Wizard mount =======
const mount =
  document.getElementById("bumperWizard") ||
  (() => {
    const d = document.createElement("div");
    d.id = "bumperWizard";
    document.body.appendChild(d);
    return d;
  })();

injectStyles();
renderWizard();

// ======= State =======
const state = {
  step: 1,
  damageSize: null, // "small" | "large"
  // primers multi select
  selected: new Set(),
  // kleur info
  carBrand: "",
  colorCode: "",
};

function renderWizard() {
  mount.innerHTML = `
    <div class="bw-wrap">
      <div class="bw-card">
        <div class="bw-top">
          <div>
            <div class="bw-title">Bumperschade keuzehulp</div>
            <div class="bw-sub">Beantwoord een paar vragen en voeg direct de juiste producten toe.</div>
          </div>
          <div class="bw-steps">
            <div class="bw-step ${state.step === 1 ? "is-on" : ""}">1</div>
            <div class="bw-step ${state.step === 2 ? "is-on" : ""}">2</div>
            <div class="bw-step ${state.step === 3 ? "is-on" : ""}">3</div>
          </div>
        </div>

        <div class="bw-progress">
          <div class="bw-bar" style="width:${Math.round((state.step / 3) * 100)}%"></div>
        </div>

        <div class="bw-body">
          ${state.step === 1 ? step1() : ""}
          ${state.step === 2 ? step2() : ""}
          ${state.step === 3 ? step3() : ""}
        </div>

        <div class="bw-footer">
          <button class="bw-btn bw-btn--ghost" id="bwBack" ${state.step === 1 ? "disabled" : ""}>Terug</button>
          <div class="bw-footerRight">
            <button class="bw-btn bw-btn--ghost" id="bwReset">Opnieuw</button>
            <button class="bw-btn bw-btn--primary" id="bwNext">${nextLabel()}</button>
          </div>
        </div>
      </div>

      ${renderSummaryCard()}
    </div>
  `;

  bindEvents();
}

function step1() {
  return `
    <div class="bw-h">Stap 1 — Hoe groot is de schade?</div>
    <div class="bw-grid2">
      <button class="bw-choice ${state.damageSize === "small" ? "is-active" : ""}" data-size="small" type="button">
        <div class="bw-choiceTitle">Kleine schade</div>
        <div class="bw-choiceText">Steenslag / krasje / klein randje</div>
        <div class="bw-pill">➡️ Lakstift</div>
      </button>

      <button class="bw-choice ${state.damageSize === "large" ? "is-active" : ""}" data-size="large" type="button">
        <div class="bw-choiceTitle">Grotere schade</div>
        <div class="bw-choiceText">Grote kras, geschaafd of reparatieplek</div>
        <div class="bw-pill">➡️ Spuiten</div>
      </button>
    </div>

    <div class="bw-note">
      Tip: Bij “spuiten” adviseren we meestal: primer → kleur → blanke lak (afhankelijk van kleur/laksysteem).
    </div>
  `;
}

function step2() {
  // alleen bij large
  if (state.damageSize !== "large") {
    return `
      <div class="bw-h">Stap 2 — Niet nodig</div>
      <div class="bw-note">Je koos “kleine schade”. Je kunt direct naar kleur (stap 3) om je lakstift op kleur te maken.</div>
    `;
  }

  return `
    <div class="bw-h">Stap 2 — Kies je primer(s)</div>
    <div class="bw-sub2">Selecteer wat je nodig hebt. Je kunt meerdere kiezen.</div>

    <div class="bw-products">
      ${productCard(PRODUCTS.primer_normaal, true)}
      ${productCard(PRODUCTS.primer_filler, true)}
      ${productCard(PRODUCTS.primer_epoxy, true)}
      ${productCard(PRODUCTS.primer_plastic, true)}
    </div>

    <div class="bw-note">
      Snelle richtlijn:
      <ul class="bw-ul">
        <li><b>Filler</b> = krassen/opbouw wegwerken</li>
        <li><b>Epoxy</b> = beste op blank metaal / bescherming</li>
        <li><b>Plastic primer</b> = op kale kunststof bumper</li>
      </ul>
    </div>
  `;
}

function step3() {
  return `
    <div class="bw-h">Stap 3 — Kleur bepalen</div>
    <div class="bw-sub2">Vul je merk + kleurcode in. Daarmee kunnen we jouw kleur klaarmaken.</div>

    <div class="bw-form">
      <div class="bw-field">
        <label>Merk auto *</label>
        <input id="bwBrand" type="text" placeholder="Bijv. Volkswagen, BMW, Ford…" value="${escapeHtml(
          state.carBrand
        )}">
      </div>
      <div class="bw-field">
        <label>Kleurcode *</label>
        <input id="bwColor" type="text" placeholder="Bijv. LA7W, 1G3, Z157…" value="${escapeHtml(
          state.colorCode
        )}">
      </div>
    </div>

    <details class="bw-details">
      <summary>Waar vind ik de kleurcode?</summary>
      <div class="bw-detailsBody">
        <p>De kleurcode staat meestal op een sticker/plaatje op één van deze plekken:</p>
        <ul class="bw-ul">
          <li>In de <b>deurstijl</b> (bestuurders- of passagierskant)</li>
          <li>Onder de <b>motorkap</b> (slotplaat / spatbord)</li>
          <li>In de <b>kofferbak</b> (reservewielbak / zijwand)</li>
          <li>In het <b>serviceboekje</b> of onderhoudssticker</li>
        </ul>
        <p>Tip: zoek op “kleurcode sticker + jouw merk/model” als je ‘m niet direct vindt.</p>
      </div>
    </details>

    <div class="bw-note">
      Na invullen kun je hieronder je producten in 1 klik toevoegen.
    </div>
  `;
}

function productCard(p, selectable) {
  const id = String(p.ccvProductId || "");
  const selected = id && state.selected.has(id);
  const img = p.image
    ? `<img class="bw-img" src="${escapeHtml(toAbs(p.image))}" alt="" loading="lazy">`
    : `<div class="bw-img bw-img--ph"></div>`;

  return `
    <div class="bw-prod ${selected ? "is-selected" : ""}" data-id="${escapeHtml(id)}" data-key="${escapeHtml(
    p.key || ""
  )}">
      ${img}
      <div class="bw-prodMid">
        <div class="bw-badges">
          ${p.badge ? `<span class="bw-badge">${escapeHtml(p.badge)}</span>` : ""}
          ${p.price ? `<span class="bw-badge bw-badge--price">${escapeHtml(p.price)}</span>` : ""}
        </div>
        <div class="bw-prodName">${escapeHtml(p.name || "")}</div>
        ${p.notes ? `<div class="bw-prodNotes">${escapeHtml(p.notes)}</div>` : ""}
      </div>

      <div class="bw-prodRight">
        ${
          p.url
            ? `<a class="bw-link" href="${escapeHtml(toAbs(p.url))}" target="_blank" rel="noreferrer">Open</a>`
            : ""
        }
        ${
          selectable
            ? `<button type="button" class="bw-add">${selected ? "✓" : "+"}</button>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderSummaryCard() {
  const items = computeCartItems();

  return `
    <div class="bw-side">
      <div class="bw-sideCard">
        <div class="bw-sideTitle">Jouw selectie</div>
        <div class="bw-sideItems">
          ${items.length ? items.map((x) => `<div class="bw-sideItem">• ${escapeHtml(x.name)}</div>`).join("") : `<div class="bw-sideEmpty">Nog niets geselecteerd.</div>`}
        </div>

        <button class="bw-btn bw-btn--primary bw-btn--full" id="bwAddAll" ${items.length ? "" : "disabled"}>
          ${items.length <= 1 ? "Toevoegen aan winkelwagen" : `${items.length} producten toevoegen`}
        </button>

        <div class="bw-sideHint">
          Tip: Je kunt in stap 2 meerdere primers selecteren. (Bijv. plastic primer + filler primer.)
        </div>
      </div>
    </div>
  `;
}

function nextLabel() {
  if (state.step === 1) return "Volgende";
  if (state.step === 2) return "Naar kleur";
  return "Klaar";
}

// ======= Events =======
function bindEvents() {
  // Step1 choices
  mount.querySelectorAll("[data-size]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.getAttribute("data-size");
      state.damageSize = size;

      // autoselect logica
      state.selected.clear();
      if (size === "small") {
        autoSelect(PRODUCTS.lakstift);
      } else {
        // bij spuiten: zet alvast spuitbus kleur + blanke lak geselecteerd (optioneel)
        autoSelect(PRODUCTS.spuitbus_kleur);
        autoSelect(PRODUCTS.blanke_lak);
        // primer niet auto selecteren, dat kiest user in stap 2
      }

      renderWizard();
    });
  });

  // Primer select (+)
  mount.querySelectorAll(".bw-add").forEach((b) => {
    b.addEventListener("click", () => {
      const prod = b.closest(".bw-prod");
      const id = prod?.getAttribute("data-id") || "";
      if (!id) return;

      if (state.selected.has(id)) state.selected.delete(id);
      else state.selected.add(id);

      renderWizard();
    });
  });

  // Inputs
  const brand = mount.querySelector("#bwBrand");
  const color = mount.querySelector("#bwColor");
  if (brand) {
    brand.addEventListener("input", (e) => {
      state.carBrand = e.target.value || "";
    });
  }
  if (color) {
    color.addEventListener("input", (e) => {
      state.colorCode = e.target.value || "";
    });
  }

  // Nav
  mount.querySelector("#bwBack")?.addEventListener("click", () => {
    if (state.step > 1) state.step -= 1;
    renderWizard();
  });

  mount.querySelector("#bwReset")?.addEventListener("click", () => {
    state.step = 1;
    state.damageSize = null;
    state.selected.clear();
    state.carBrand = "";
    state.colorCode = "";
    renderWizard();
  });

  mount.querySelector("#bwNext")?.addEventListener("click", () => {
    if (state.step === 1) {
      if (!state.damageSize) return pulse(mount.querySelector(".bw-grid2"));
      state.step = 2;
      renderWizard();
      return;
    }
    if (state.step === 2) {
      state.step = 3;
      renderWizard();
      return;
    }
    // step 3 validate
    if (!String(state.carBrand).trim() || !String(state.colorCode).trim()) {
      pulse(mount.querySelector(".bw-form"));
      return;
    }
    // klaar -> scroll naar selectie knop
    mount.querySelector("#bwAddAll")?.scrollIntoView({ behavior: "smooth", block: "center" });
    pulse(mount.querySelector(".bw-sideCard"));
  });

  // Add all
  mount.querySelector("#bwAddAll")?.addEventListener("click", async () => {
    const items = computeCartItems();
    if (!items.length) return;

    // voeg 1 voor 1 toe (stabiel)
    for (let i = 0; i < items.length; i++) {
      window.postMessage(
        {
          type: "LOM_ADD_TO_CART",
          payload: {
            productId: String(items[i].ccvProductId),
            quantity: 1,
            shopUrl: toAbs(items[i].url),
            // optioneel: je kunt hier carBrand/colorCode later meegeven als je parent dat opvangt
          },
        },
        SHOP_ORIGIN
      );
      await sleep(350);
    }
    // mini feedback
    const btn = mount.querySelector("#bwAddAll");
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "Toegevoegd ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = old;
        btn.disabled = false;
      }, 1100);
    }
  });
}

// ======= Helpers =======
function autoSelect(p) {
  if (!p?.ccvProductId) return;
  state.selected.add(String(p.ccvProductId));
}

function computeCartItems() {
  // basis selectie op basis van pad:
  const out = [];

  // Kleine schade: lakstift (al autoselected). Grote schade: spuitbus kleur + blanke lak (autoselected)
  // plus primer(s) die user kiest in stap 2
  const all = Object.values(PRODUCTS);

  const selectedIds = Array.from(state.selected);
  selectedIds.forEach((id) => {
    const p = all.find((x) => String(x.ccvProductId || "") === String(id));
    if (p && p.ccvProductId) out.push(p);
  });

  return out;
}

function toAbs(pathOrUrl) {
  const s = String(pathOrUrl || "");
  if (!s) return "";
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pulse(el) {
  if (!el) return;
  el.classList.remove("bw-pulse");
  void el.offsetWidth;
  el.classList.add("bw-pulse");
  setTimeout(() => el.classList.remove("bw-pulse"), 450);
}

// ======= CSS =======
function injectStyles() {
  if (document.getElementById("bwStyles")) return;

  const css = `
  .bw-wrap{
    display:grid;
    grid-template-columns: 1fr 320px;
    gap:16px;
    align-items:start;
  }
  @media (max-width: 980px){
    .bw-wrap{ grid-template-columns: 1fr; }
  }

  .bw-card{
    background:#fff;
    border:1px solid #e9edf3;
    border-radius:18px;
    box-shadow:0 10px 24px rgba(16,24,40,.06);
    overflow:hidden;
  }

  .bw-top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
    padding:18px;
  }

  .bw-title{ font-weight:950; font-size:18px; color:#0f172a; }
  .bw-sub{ margin-top:4px; color:#64748b; font-size:13px; }

  .bw-steps{ display:flex; gap:8px; }
  .bw-step{
    width:30px;height:30px;border-radius:12px;
    display:grid;place-items:center;
    border:1px solid #e5eaf3;
    font-weight:900;
    color:#64748b;
    background:#fff;
  }
  .bw-step.is-on{
    color:#0f172a;
    border-color:#cfe2ff;
    background:#eff6ff;
  }

  .bw-progress{ height:8px; background:#f1f5f9; }
  .bw-bar{ height:8px; background:#22c55e; width:33%; }

  .bw-body{ padding:18px; }
  .bw-h{ font-weight:950; font-size:16px; color:#0f172a; margin-bottom:10px; }
  .bw-sub2{ color:#64748b; font-size:13px; margin-bottom:12px; }

  .bw-grid2{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:12px;
  }
  @media (max-width: 640px){
    .bw-grid2{ grid-template-columns: 1fr; }
  }

  .bw-choice{
    text-align:left;
    border:1px solid #e6edf7;
    border-radius:16px;
    padding:14px;
    background:#fff;
    cursor:pointer;
    box-shadow:0 8px 22px rgba(16,24,40,.06);
  }
  .bw-choice.is-active{
    border-color: rgba(34,197,94,.35);
    box-shadow:0 12px 28px rgba(16,24,40,.10);
  }
  .bw-choiceTitle{ font-weight:950; color:#0f172a; }
  .bw-choiceText{ color:#64748b; font-size:13px; margin-top:6px; }
  .bw-pill{
    display:inline-block;
    margin-top:10px;
    padding:6px 10px;
    border-radius:999px;
    background:#dcfce7;
    color:#166534;
    font-weight:900;
    font-size:12px;
  }

  .bw-note{
    margin-top:12px;
    border:1px solid #e5eaf3;
    background:#f8fafc;
    border-radius:14px;
    padding:12px;
    color:#475569;
    font-size:13px;
  }
  .bw-ul{ margin:8px 0 0; padding-left:18px; }
  .bw-ul li{ margin:4px 0; }

  .bw-products{ display:grid; gap:10px; }

  .bw-prod{
    display:grid;
    grid-template-columns: 60px 1fr 54px;
    gap:12px;
    align-items:center;
    border:1px solid #e6edf7;
    border-radius:16px;
    padding:12px;
    background:#fff;
    box-shadow:0 8px 22px rgba(16,24,40,.06);
  }
  .bw-prod.is-selected{ border-color:#d7e2f2; box-shadow:0 12px 26px rgba(16,24,40,.10); }

  .bw-img{
    width:60px;height:60px;border-radius:14px;
    border:1px solid #eef2f7;
    background:#f6f7fb;
    object-fit:contain;
    display:block;
  }
  .bw-img--ph{ background:linear-gradient(135deg,#f1f5f9,#fff); }

  .bw-badges{ display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; }
  .bw-badge{
    font-size:11px;
    font-weight:950;
    padding:5px 10px;
    border-radius:999px;
    background:#eff6ff;
    color:#1e40af;
  }
  .bw-badge--price{
    background:#f1f5f9;
    color:#0f172a;
  }

  .bw-prodName{ font-weight:950; color:#0f172a; font-size:13.5px; line-height:1.2; }
  .bw-prodNotes{ margin-top:6px; color:#64748b; font-size:12.5px; }

  .bw-prodRight{
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:8px;
  }
  .bw-link{
    font-size:12px;
    font-weight:900;
    color:#2563eb;
    text-decoration:none;
  }
  .bw-link:hover{ text-decoration:underline; }

  .bw-add{
    width:40px;height:40px;border-radius:12px;
    border:0;background:#111;color:#fff;
    font-size:22px;line-height:1;
    cursor:pointer;
    display:grid;place-items:center;
  }
  .bw-prod.is-selected .bw-add{
    background:#e8eef7;
    color:#111;
    border:1px solid #d7e2f2;
  }

  .bw-form{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:12px;
  }
  @media (max-width: 640px){
    .bw-form{ grid-template-columns: 1fr; }
  }
  .bw-field label{
    display:block;
    font-size:12px;
    font-weight:900;
    color:#0f172a;
    margin-bottom:6px;
  }
  .bw-field input{
    width:100%;
    border:1px solid #e5eaf3;
    border-radius:14px;
    padding:12px 12px;
    outline:none;
    font-size:14px;
  }
  .bw-field input:focus{
    border-color:#cfe2ff;
    box-shadow:0 0 0 4px rgba(59,130,246,.12);
  }

  .bw-details{
    margin-top:12px;
    border:1px solid #e5eaf3;
    border-radius:14px;
    padding:10px 12px;
    background:#fff;
  }
  .bw-details summary{
    cursor:pointer;
    font-weight:950;
    color:#0f172a;
  }
  .bw-detailsBody{ margin-top:10px; color:#475569; font-size:13px; }

  .bw-footer{
    padding:14px 18px;
    border-top:1px solid #eef2f7;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }
  .bw-footerRight{ display:flex; gap:10px; }

  .bw-btn{
    height:42px;
    padding:0 14px;
    border-radius:14px;
    font-weight:950;
    cursor:pointer;
    border:1px solid #e5eaf3;
    background:#fff;
    color:#0f172a;
  }
  .bw-btn:disabled{ opacity:.55; cursor:not-allowed; }
  .bw-btn--ghost:hover{ background:#f6f8fc; }

  .bw-btn--primary{
    border:0;
    background:#22c55e;
    color:#fff;
  }
  .bw-btn--primary:hover{ filter:brightness(.98); }
  .bw-btn--full{ width:100%; }

  .bw-side{ position:sticky; top:14px; }
  @media (max-width: 980px){
    .bw-side{ position:static; }
  }
  .bw-sideCard{
    background:#fff;
    border:1px solid #e9edf3;
    border-radius:18px;
    box-shadow:0 10px 24px rgba(16,24,40,.06);
    padding:16px;
  }
  .bw-sideTitle{ font-weight:950; color:#0f172a; margin-bottom:10px; }
  .bw-sideItems{ display:grid; gap:6px; margin-bottom:12px; }
  .bw-sideItem{ color:#0f172a; font-size:13px; }
  .bw-sideEmpty{ color:#64748b; font-size:13px; }
  .bw-sideHint{ margin-top:10px; color:#64748b; font-size:12.5px; }

  .bw-pulse{ animation:bwPulse .45s ease; }
  @keyframes bwPulse{
    0%{ transform:scale(1); }
    50%{ transform:scale(1.01); }
    100%{ transform:scale(1); }
  }
  `;

  const style = document.createElement("style");
  style.id = "bwStyles";
  style.textContent = css;
  document.head.appendChild(style);
}
