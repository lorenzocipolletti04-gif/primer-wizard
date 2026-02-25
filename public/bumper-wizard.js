document.addEventListener("DOMContentLoaded", () => {
  console.log("Bumper Wizard loaded ✅");

  const SHOP_ORIGIN = "https://www.lakopmaat.nl";
  const SHOP_BASE_URL = "https://www.lakopmaat.nl";

  // ========= VUL HIER JE PRODUCTEN IN =========
  // Zet per product: ccvProductId + url (image/price optioneel)
  const PRODUCTS = {
    // Stap 1
    lakstift: {
      key: "lakstift",
      name: "Lakstift op kleur",
      badge: "Kleine schade",
      price: "v.a. € …",
      url: "/nl/...", // TODO
      ccvProductId: "", // TODO
      image: "", // TODO (optioneel)
      notes: "Voor kleine beschadigingen, steenslag en randjes.",
      defaultQty: 1,
    },

    // Grote schade basis
    primer_basis: {
      key: "primer_basis",
      name: "Universele 1K primer (basis)",
      badge: "Primer",
      price: "€ …",
      url: "/nl/...", // TODO
      ccvProductId: "", // TODO
      image: "",
      notes: "Voor geschuurde lak / lichte reparaties.",
      defaultQty: 1,
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
      defaultQty: 1,
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
      defaultQty: 1,
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
      defaultQty: 1,
    },

    spuitbus_kleur: {
      key: "spuitbus_kleur",
      name: "Spuitbus autolak op kleur",
      badge: "Kleur",
      price: "v.a. € …",
      url: "/nl/...", // TODO
      ccvProductId: "", // TODO
      image: "",
      notes: "Voor grotere schades: primer → kleur → (blanke lak).",
      defaultQty: 1,
    },
    blanke_lak: {
      key: "blanke_lak",
      name: "Blanke lak (hoogglans)",
      badge: "Afwerking",
      price: "€ …",
      url: "/nl/...", // TODO
      ccvProductId: "", // TODO
      image: "",
      notes: "Bescherming + glans. (Bij metallic/parelmoer meestal nodig.)",
      defaultQty: 1,
    },
  };

  // ========= Mount =========
  const mount = document.getElementById("bumperWizard");
  if (!mount) {
    console.warn("bumperWizard div niet gevonden ❌");
    return;
  }

  injectStyles();

  // ========= State =========
  const state = {
    step: 1,
    damageSize: null, // "small" | "large"
    selectedIds: new Set(),
    carBrand: "",
    colorCode: "",
  };

  // ========= Render =========
  function render() {
    mount.innerHTML = `
      <div class="bw-wrap">
        <div class="bw-card">
          ${topBar()}
          ${body()}
          ${footer()}
        </div>

        ${sidebar()}
      </div>
    `;

    bind();
  }

  function topBar() {
    const pct = Math.round((state.step / 3) * 100);

    return `
      <div class="bw-top">
        <div>
          <div class="bw-title">Bumperschade keuzehulp</div>
          <div class="bw-sub">Kies je schade, selecteer primer(s) en ga door naar kleur.</div>
        </div>

        <div class="bw-steps">
          <div class="bw-step ${state.step === 1 ? "is-on" : ""}">1</div>
          <div class="bw-step ${state.step === 2 ? "is-on" : ""}">2</div>
          <div class="bw-step ${state.step === 3 ? "is-on" : ""}">3</div>
        </div>
      </div>

      <div class="bw-progress">
        <div class="bw-bar" style="width:${pct}%"></div>
      </div>
    `;
  }

  function body() {
    return `
      <div class="bw-body">
        ${state.step === 1 ? step1() : ""}
        ${state.step === 2 ? step2() : ""}
        ${state.step === 3 ? step3() : ""}
      </div>
    `;
  }

  function footer() {
    return `
      <div class="bw-footer">
        <button class="bw-btn bw-btn--ghost" id="bwBack" ${state.step === 1 ? "disabled" : ""}>Terug</button>

        <div class="bw-footerRight">
          <button class="bw-btn bw-btn--ghost" id="bwReset">Opnieuw</button>
          <button class="bw-btn bw-btn--primary" id="bwNext">${nextLabel()}</button>
        </div>
      </div>
    `;
  }

  function sidebar() {
    const items = getSelectedProducts();

    return `
      <div class="bw-side">
        <div class="bw-sideCard">
          <div class="bw-sideTitle">Jouw selectie</div>

          <div class="bw-sideItems">
            ${
              items.length
                ? items
                    .map(
                      (p) => `<div class="bw-sideItem">• ${escapeHtml(p.name)} ${p.price ? `<span class="bw-sidePrice">${escapeHtml(p.price)}</span>` : ""}</div>`
                    )
                    .join("")
                : `<div class="bw-sideEmpty">Nog niets geselecteerd.</div>`
            }
          </div>

          <button class="bw-btn bw-btn--primary bw-btn--full" id="bwAddAll" ${
            items.length ? "" : "disabled"
          }>
            ${items.length <= 1 ? "Toevoegen aan winkelwagen" : `${items.length} producten toevoegen`}
          </button>

          <div class="bw-sideHint">
            Tip: Bij grotere schade kun je meerdere primers selecteren (bijv. plastic primer + filler).
          </div>
        </div>
      </div>
    `;
  }

  function step1() {
    return `
      <div class="bw-h">Stap 1 — Hoe groot is de schade?</div>

      <div class="bw-grid2">
        <button class="bw-choice ${state.damageSize === "small" ? "is-active" : ""}" data-size="small" type="button">
          <div class="bw-choiceTitle">Kleine schade</div>
          <div class="bw-choiceText">Steenslag / krasje / randje</div>
          <div class="bw-pill">➡️ Lakstift</div>
        </button>

        <button class="bw-choice ${state.damageSize === "large" ? "is-active" : ""}" data-size="large" type="button">
          <div class="bw-choiceTitle">Grotere schade</div>
          <div class="bw-choiceText">Grote kras, geschaafd of reparatieplek</div>
          <div class="bw-pill bw-pill--blue">➡️ Spuiten</div>
        </button>
      </div>

      <div class="bw-note">
        Snelle richtlijn: bij spuiten adviseren we meestal <b>primer → kleur → (blanke lak)</b>.
      </div>
    `;
  }

  function step2() {
    if (state.damageSize !== "large") {
      return `
        <div class="bw-h">Stap 2 — Primer(s)</div>
        <div class="bw-note">
          Je koos “kleine schade”. Primer(s) zijn dan meestal niet nodig. Ga door naar kleur (stap 3).
        </div>
      `;
    }

    return `
      <div class="bw-h">Stap 2 — Kies je primer(s)</div>
      <div class="bw-sub2">Selecteer wat je nodig hebt (meerdere keuzes mogelijk).</div>

      <div class="bw-products">
        ${productCard(PRODUCTS.primer_basis)}
        ${productCard(PRODUCTS.primer_filler)}
        ${productCard(PRODUCTS.primer_epoxy)}
        ${productCard(PRODUCTS.primer_plastic)}
      </div>

      <div class="bw-note">
        <ul class="bw-ul">
          <li><b>Filler</b> = schuurkrassen/opbouw wegwerken</li>
          <li><b>Epoxy</b> = beste op blank metaal / extra bescherming</li>
          <li><b>Plastic primer</b> = op kale bumperkunststof</li>
        </ul>
      </div>
    `;
  }

  function step3() {
    return `
      <div class="bw-h">Stap 3 — Kleur</div>
      <div class="bw-sub2">Vul je merk + kleurcode in (voor jouw lak op maat).</div>

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
        Bij grotere schade voegen we vaak ook <b>spuitbus autolak</b> en <b>blanke lak</b> toe. (Zie selectie rechts.)
      </div>
    `;
  }

  function productCard(p) {
    const id = String(p.ccvProductId || "");
    const selected = id && state.selectedIds.has(id);
    const img = p.image
      ? `<img class="bw-img" src="${escapeHtml(toAbs(p.image))}" alt="" loading="lazy">`
      : `<div class="bw-img bw-img--ph"></div>`;

    return `
      <div class="bw-prod ${selected ? "is-selected" : ""}" data-id="${escapeHtml(id)}">
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
          <button type="button" class="bw-add">${selected ? "✓" : "+"}</button>
        </div>
      </div>
    `;
  }

  function nextLabel() {
    if (state.step === 1) return "Volgende";
    if (state.step === 2) return "Naar kleur";
    return "Klaar";
  }

  // ========= Bind =========
  function bind() {
    mount.querySelectorAll("[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = btn.getAttribute("data-size");
        state.damageSize = size;

        // reset selection, daarna auto-select basis items
        state.selectedIds.clear();

        if (size === "small") {
          autoSelect(PRODUCTS.lakstift);
        } else {
          // bij spuiten: voeg alvast kleur + blanke lak toe (je kunt dit later optioneel maken)
          autoSelect(PRODUCTS.spuitbus_kleur);
          autoSelect(PRODUCTS.blanke_lak);
          // primer kiest gebruiker in stap 2
        }

        render();
      });
    });

    // Selecteer producten (primers)
    mount.querySelectorAll(".bw-add").forEach((b) => {
      b.addEventListener("click", () => {
        const prod = b.closest(".bw-prod");
        const id = prod?.getAttribute("data-id") || "";
        if (!id) return;

        if (state.selectedIds.has(id)) state.selectedIds.delete(id);
        else state.selectedIds.add(id);

        render();
      });
    });

    // inputs
    const brand = mount.querySelector("#bwBrand");
    const color = mount.querySelector("#bwColor");

    if (brand) {
      brand.addEventListener("input", (e) => (state.carBrand = e.target.value || ""));
    }
    if (color) {
      color.addEventListener("input", (e) => (state.colorCode = e.target.value || ""));
    }

    // nav
    mount.querySelector("#bwBack")?.addEventListener("click", () => {
      if (state.step > 1) state.step -= 1;
      render();
    });

    mount.querySelector("#bwReset")?.addEventListener("click", () => {
      state.step = 1;
      state.damageSize = null;
      state.selectedIds.clear();
      state.carBrand = "";
      state.colorCode = "";
      render();
    });

    mount.querySelector("#bwNext")?.addEventListener("click", () => {
      if (state.step === 1) {
        if (!state.damageSize) return pulse(mount.querySelector(".bw-grid2"));
        state.step = 2;
        render();
        return;
      }
      if (state.step === 2) {
        state.step = 3;
        render();
        return;
      }
      // step3 validate
      if (!String(state.carBrand).trim() || !String(state.colorCode).trim()) {
        pulse(mount.querySelector(".bw-form"));
        return;
      }
      // klaar -> focus sidebar knop
      mount.querySelector("#bwAddAll")?.scrollIntoView({ behavior: "smooth", block: "center" });
      pulse(mount.querySelector(".bw-sideCard"));
    });

    // add all
    mount.querySelector("#bwAddAll")?.addEventListener("click", async () => {
      const items = getSelectedProducts();
      if (!items.length) return;

      const btn = mount.querySelector("#bwAddAll");
      const old = btn?.textContent || "";

      if (btn) {
        btn.disabled = true;
        btn.textContent = "Toevoegen…";
      }

      for (let i = 0; i < items.length; i++) {
        if (!items[i].ccvProductId) continue;

        window.parent.postMessage(
          {
            type: "LOM_ADD_TO_CART",
            payload: {
              productId: String(items[i].ccvProductId),
              quantity: 1,
              shopUrl: toAbs(items[i].url),
            },
          },
          SHOP_ORIGIN
        );

        await sleep(350);
      }

      if (btn) {
        btn.textContent = "Toegevoegd ✓";
        setTimeout(() => {
          btn.textContent = old;
          btn.disabled = false;
        }, 1100);
      }
    });
  }

  // ========= Selection helper =========
  function autoSelect(p) {
    if (!p?.ccvProductId) return;
    state.selectedIds.add(String(p.ccvProductId));
  }

  function getSelectedProducts() {
    const all = Object.values(PRODUCTS);
    const ids = Array.from(state.selectedIds);
    return ids
      .map((id) => all.find((p) => String(p.ccvProductId || "") === String(id)))
      .filter(Boolean);
  }

  // ========= Utils =========
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

  // ========= CSS =========
  function injectStyles() {
    if (document.getElementById("bwStyles")) return;

    const css = `
    .bw-wrap{
      display:grid;
      grid-template-columns: 1fr 320px;
      gap:16px;
      align-items:start;
    }
    @media (max-width: 980px){ .bw-wrap{ grid-template-columns: 1fr; } }

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
    @media (max-width: 640px){ .bw-grid2{ grid-template-columns: 1fr; } }

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
    .bw-pill--blue{ background:#dbeafe; color:#1e40af; }

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
    .bw-badge--price{ background:#f1f5f9; color:#0f172a; }

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
    @media (max-width: 640px){ .bw-form{ grid-template-columns: 1fr; } }

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
    @media (max-width: 980px){ .bw-side{ position:static; } }

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
    .bw-sidePrice{ color:#64748b; font-weight:900; margin-left:6px; font-size:12px; }
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

  // ========= Start =========
  render();
});
