
"use strict";

/*
  Rezeptfinder v3.0 Cloud
  Bereinigte Version:
  - eine Speicherlogik
  - eine Suchlogik
  - eine Cloud-Logik
  - ein Rezept-Assistent
  - keine alten rf2xx-Patches
*/

const APP_VERSION = "3.4";
const STORAGE_KEY = "rezepte";
const BACKUP_KEY = "rezepte_backup_v3";
const SUPABASE_URL = "https://oxsuwvbfzijbzffkaqeg.supabase.co";
const SUPABASE_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

const KATEGORIEN = [
  "Nicht zugeordnet",
  "Kalte Vorspeisen",
  "Suppen",
  "Warme Vorspeisen",
  "Salate",
  "Saucen und Aufstriche",
  "Hauptspeisen Fleisch",
  "Hauptspeisen Fisch",
  "Hauptspeisen vegetarisch",
  "Beilagen",
  "Dessert",
  "Kuchen und Torten",
  "Bäckerei",
  "Kekse",
  "Brot",
  "Teige",
  "Eis",
  "Getränke",
  "Haltbar machen",
  "Gewürze",
  "Marmeladen und Saucen",
  "Sirup",
  "Pralinen",
  "Sonstiges",
  "Airfryer"
];

const EINHEITEN = [
  "",
  "mg",
  "g",
  "dag",
  "kg",
  "ml",
  "cl",
  "dl",
  "l",
  "TL",
  "EL",
  "Stk.",
  "Prise",
  "Becher",
  "Tasse",
  "Päckchen",
  "Dose",
  "Glas",
  "Bund",
  "Zweig",
  "Blatt",
  "Scheibe",
  "Würfel",
  "Messerspitze",
  "Spritzer",
  "Handvoll"
];

let rezepte = [];
let bearbeitungsIndex = null;
let letzteSuchErgebnisse = [];
let supabaseClient = null;
let backupOffen = false;

function $(id) {
  return document.getElementById(id);
}

function val(id) {
  const el = $(id);
  return el && typeof el.value !== "undefined" ? String(el.value).trim() : "";
}

function setVal(id, value) {
  const el = $(id);
  if (el && typeof el.value !== "undefined") el.value = value ?? "";
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "r_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function normalizeTag(tag) {
  return String(tag || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/proteinarm/g, "protein-arm")
    .replace(/proteinreich/g, "protein-reich")
    .replace(/kohlenhydratarm/g, "kohlenhydrat-arm")
    .replace(/kohlenhydratreich/g, "kohlenhydrat-reich")
    .replace(/fettarm/g, "fett-arm")
    .replace(/fettreich/g, "fett-reich");
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).replace(",", ".").trim();
  if (!raw) return null;
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

function parseList(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") return null;
  if (recipe.geloescht || recipe.deleted || recipe.__deleted || recipe.id === "__rezeptfinder_deleted_keys__") return null;

  const groups = Array.isArray(recipe.zutatenGruppen) && recipe.zutatenGruppen.length
    ? recipe.zutatenGruppen
    : [{ name: "Zutaten", zutaten: Array.isArray(recipe.zutaten) ? recipe.zutaten : [] }];

  const normalizedGroups = groups.map((group, index) => ({
    name: group.name || (index === 0 ? "Zutaten" : "Gruppe " + (index + 1)),
    zutaten: (group.zutaten || []).map(z => {
      if (typeof z === "string") return { menge: "", einheit: "", name: z };
      return {
        menge: z.menge || "",
        einheit: z.einheit || "",
        name: z.name || z.zutat || z.text || ""
      };
    }).filter(z => z.menge || z.einheit || z.name)
  })).filter(g => g.zutaten.length);

  const flat = normalizedGroups.flatMap(g => g.zutaten);

  return {
    id: recipe.id || uid(),
    name: recipe.name || "Unbenanntes Rezept",
    kategorie: recipe.kategorie || "Nicht zugeordnet",
    portionen: recipe.portionen || "",
    schwierigkeit: recipe.schwierigkeit || "",
    zubereitungszeit: recipe.zubereitungszeit || recipe.zeit || "",
    quelle: recipe.quelle || "",
    tags: Array.isArray(recipe.tags)
      ? recipe.tags.map(normalizeTag).filter(Boolean)
      : String(recipe.tags || "").split(",").map(normalizeTag).filter(Boolean),
    zubereitung: recipe.zubereitung || recipe.anleitung || "",
    utensilien: Array.isArray(recipe.utensilien)
      ? recipe.utensilien
      : String(recipe.utensilien || "").split(",").map(x => x.trim()).filter(Boolean),
    notizen: recipe.notizen || "",
    naehrwerte: recipe.naehrwerte || {},
    zutatenGruppen: normalizedGroups,
    zutaten: flat,
    ausprobiert: !!recipe.ausprobiert,
    favorit: !!recipe.favorit,
    bewertung: Number(recipe.bewertung || 0),
    erstelltAm: recipe.erstelltAm || new Date().toISOString(),
    aktualisiertAm: recipe.aktualisiertAm || new Date().toISOString()
  };
}

function recipeSignature(recipe) {
  return [
    recipe.name,
    recipe.kategorie,
    recipe.portionen,
    recipe.quelle,
    recipe.zubereitung,
    JSON.stringify(recipe.zutaten)
  ].map(x => String(x || "").toLowerCase().trim()).join("§");
}

function normalizeRecipeList(list) {
  const seenIds = new Set();
  const seenSig = new Set();
  const out = [];

  for (const item of list || []) {
    const recipe = normalizeRecipe(item);
    if (!recipe) continue;

    if (seenIds.has(recipe.id)) recipe.id = uid();
    seenIds.add(recipe.id);

    const sig = recipeSignature(recipe);
    if (seenSig.has(sig)) continue;
    seenSig.add(sig);

    recipe.tags = applyMacroTagsToRecipe(recipe).tags;
    out.push(recipe);
  }

  return out;
}

function ladeRezepte() {
  const main = normalizeRecipeList(parseList(localStorage.getItem(STORAGE_KEY)));
  const backup = normalizeRecipeList(parseList(localStorage.getItem(BACKUP_KEY)));
  rezepte = main.length ? main : backup;
  window.rezepte = rezepte;
  speichereRezepte(false);
  return rezepte;
}

function speichereRezepte(showMessage = false) {
  rezepte = normalizeRecipeList(rezepte);
  window.rezepte = rezepte;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rezepte));
  localStorage.setItem(BACKUP_KEY, JSON.stringify(rezepte));
  if (showMessage) meldungAnzeigen("Rezept gespeichert.");
  dashboardAktualisieren();
  return rezepte;
}

function macroTagsForValues(protein, carbs, fat) {
  const tags = [];
  if (protein !== null) {
    if (protein < 5) tags.push("protein-arm");
    if (protein >= 12) tags.push("protein-reich");
  }
  if (carbs !== null) {
    if (carbs < 10) tags.push("kohlenhydrat-arm");
    if (carbs >= 30) tags.push("kohlenhydrat-reich");
  }
  if (fat !== null) {
    if (fat < 5) tags.push("fett-arm");
    if (fat >= 20) tags.push("fett-reich");
  }
  return tags;
}

function macroTagsFromNaehrwerte(n) {
  return macroTagsForValues(
    toNumber(n?.eiweiss ?? n?.eiweiß ?? n?.protein),
    toNumber(n?.kohlenhydrate ?? n?.carbs ?? n?.kh),
    toNumber(n?.fett ?? n?.fat)
  );
}

function applyMacroTagsToRecipe(recipe) {
  const autoTags = new Set(["protein-arm", "protein-reich", "kohlenhydrat-arm", "kohlenhydrat-reich", "fett-arm", "fett-reich"]);
  const existing = Array.isArray(recipe.tags) ? recipe.tags.map(normalizeTag).filter(Boolean) : [];
  const manual = existing.filter(t => !autoTags.has(t));
  const automatic = macroTagsFromNaehrwerte(recipe.naehrwerte || {});
  recipe.tags = [...new Set([...manual, ...automatic])];
  return recipe;
}

function macroTagsFromForm() {
  return macroTagsForValues(
    toNumber(val("eiweissInput")),
    toNumber(val("kohlenhydrateInput")),
    toNumber(val("fettInput"))
  );
}

function applyMacroTagsToForm() {
  const input = $("tagsInput");
  if (!input) return;

  const autoTags = new Set(["protein-arm", "protein-reich", "kohlenhydrat-arm", "kohlenhydrat-reich", "fett-arm", "fett-reich"]);
  const manual = String(input.value || "")
    .split(",")
    .map(normalizeTag)
    .filter(Boolean)
    .filter(tag => !autoTags.has(tag));

  input.value = [...new Set([...manual, ...macroTagsFromForm()])].join(", ");
}

function optionHtml(selected) {
  const selectedNorm = String(selected || "").toLowerCase();
  const all = [...EINHEITEN];
  if (selected && !all.some(e => e.toLowerCase() === selectedNorm)) all.push(selected);
  return all.map(e => `<option value="${esc(e)}"${String(e).toLowerCase() === selectedNorm ? " selected" : ""}>${esc(e)}</option>`).join("");
}

function zutatZeileHtml(zutat = {}) {
  return `
    <div class="zutaten-zeile zutat-zeile">
      <input type="text" class="zutat-menge" placeholder="Menge" value="${esc(zutat.menge || "")}">
      <select class="zutat-einheit">${optionHtml(zutat.einheit || "")}</select>
      <input type="text" class="zutat-name" placeholder="Zutat" value="${esc(zutat.name || "")}">
      <button type="button" class="zutat-original-loeschen" onclick="zutatZeileLoeschen(this)">🗑</button>
    </div>
  `;
}

function zutatengruppeHtml(name = "Zutaten", zutaten = [{ menge: "", einheit: "", name: "" }]) {
  return `
    <div class="zutatengruppe">
      <input type="text" class="zutaten-gruppenname" value="${esc(name)}" placeholder="Gruppenname">
      <div class="zutaten-zeilen">
        ${zutaten.map(zutatZeileHtml).join("")}
      </div>
      <button type="button" onclick="zutatZeileHinzufuegen(this)">Zutat hinzufügen</button>
      <button type="button" onclick="zutatengruppeLoeschen(this)">Gruppe löschen</button>
    </div>
  `;
}

function zutatenGruppeHinzufuegen(name = "Zutaten", zutaten = [{ menge: "", einheit: "", name: "" }]) {
  const container = $("zutatenGruppen");
  if (!container) return;
  const groupName = typeof name === "string" ? name : "Zutaten";
  container.insertAdjacentHTML("beforeend", zutatengruppeHtml(groupName, Array.isArray(zutaten) ? zutaten : [{ menge: "", einheit: "", name: "" }]));
}

function zutatZeileHinzufuegen(button) {
  const group = button?.closest?.(".zutatengruppe");
  const rows = group?.querySelector?.(".zutaten-zeilen");
  if (rows) rows.insertAdjacentHTML("beforeend", zutatZeileHtml());
}

function zutatZeileLoeschen(button) {
  const row = button?.closest?.(".zutaten-zeile, .zutat-zeile");
  const group = row?.closest?.(".zutatengruppe");
  if (row) row.remove();

  const groups = Array.from(document.querySelectorAll("#zutatenGruppen .zutatengruppe"));
  if (group && !group.querySelector(".zutaten-zeile, .zutat-zeile") && groups.indexOf(group) > 0) group.remove();
}

function zutatengruppeLoeschen(button) {
  const group = button?.closest?.(".zutatengruppe");
  const groups = Array.from(document.querySelectorAll("#zutatenGruppen .zutatengruppe"));
  if (group && groups.length > 1) group.remove();
}

function zutatenAusFormular() {
  const groups = [];
  document.querySelectorAll("#zutatenGruppen .zutatengruppe").forEach((group, index) => {
    const name = group.querySelector(".zutaten-gruppenname")?.value?.trim() || (index === 0 ? "Zutaten" : "Gruppe " + (index + 1));
    const zutaten = [];
    group.querySelectorAll(".zutaten-zeile, .zutat-zeile").forEach(row => {
      const menge = row.querySelector(".zutat-menge")?.value?.trim() || "";
      const einheit = row.querySelector(".zutat-einheit")?.value?.trim() || "";
      const name = row.querySelector(".zutat-name")?.value?.trim() || "";
      if (menge || einheit || name) zutaten.push({ menge, einheit, name });
    });
    if (zutaten.length) groups.push({ name, zutaten });
  });
  return { groups, flat: groups.flatMap(g => g.zutaten) };
}

function naehrwerteAusFormular() {
  return {
    kalorien: val("kalorienInput"),
    eiweiss: val("eiweissInput"),
    kohlenhydrate: val("kohlenhydrateInput"),
    fett: val("fettInput"),
    zucker: val("zuckerInput"),
    ballaststoffe: val("ballaststoffeInput"),
    salz: val("salzInput")
  };
}

function rezeptAusFormular(existing = null, isEdit = false) {
  applyMacroTagsToForm();
  const zutaten = zutatenAusFormular();

  const recipe = {
    id: isEdit && existing?.id ? existing.id : uid(),
    name: val("nameInput"),
    kategorie: val("kategorieInput") || "Nicht zugeordnet",
    portionen: val("portionenInput"),
    schwierigkeit: val("schwierigkeitInput"),
    zubereitungszeit: val("zubereitungszeitInput"),
    quelle: val("quelleInput"),
    tags: val("tagsInput").split(",").map(normalizeTag).filter(Boolean),
    zubereitung: val("zubereitungInput"),
    utensilien: val("utensilienInput").split(",").map(x => x.trim()).filter(Boolean),
    notizen: val("notizenInput"),
    naehrwerte: naehrwerteAusFormular(),
    zutatenGruppen: zutaten.groups,
    zutaten: zutaten.flat,
    ausprobiert: val("ausprobiertInput") === "true",
    favorit: existing ? !!existing.favorit : false,
    bewertung: existing ? Number(existing.bewertung || 0) : 0,
    erstelltAm: existing?.erstelltAm || new Date().toISOString(),
    aktualisiertAm: new Date().toISOString()
  };

  return applyMacroTagsToRecipe(recipe);
}

function rezeptSpeichern() {
  const index = Number.isInteger(bearbeitungsIndex) ? bearbeitungsIndex : null;
  const isEdit = index !== null && rezepte[index];
  const existing = isEdit ? rezepte[index] : null;
  const recipe = rezeptAusFormular(existing, isEdit);

  if (!recipe.name) return meldungAnzeigen("Bitte einen Rezeptnamen eingeben.", true);
  if (!recipe.portionen) return meldungAnzeigen("Bitte Grundportionen eingeben.", true);
  if (!recipe.zutaten.length) return meldungAnzeigen("Bitte mindestens eine Zutat eingeben.", true);
  if (!recipe.zubereitung) return meldungAnzeigen("Bitte eine Zubereitung eingeben.", true);

  if (isEdit) rezepte[index] = recipe;
  else rezepte.push(recipe);

  bearbeitungsIndex = null;
  speichereRezepte(true);
  formularLeeren();
  zurUebersicht();
  return false;
}

function rezeptLoeschen(index) {
  const i = Number(index);
  if (!Number.isInteger(i) || !rezepte[i]) return false;
  if (!confirm(`Möchtest du "${rezepte[i].name}" wirklich löschen?`)) return false;
  rezepte.splice(i, 1);
  speichereRezepte();
  rezeptSucheAusfuehren();
  meldungAnzeigen("Rezept gelöscht.");
  return false;
}

function rezeptBearbeiten(index) {
  const i = Number(index);
  if (!Number.isInteger(i) || !rezepte[i]) return false;
  const r = rezepte[i];
  bearbeitungsIndex = i;

  setVal("nameInput", r.name);
  setVal("kategorieInput", r.kategorie);
  setVal("schwierigkeitInput", r.schwierigkeit);
  setVal("ausprobiertInput", String(!!r.ausprobiert));
  setVal("zubereitungszeitInput", r.zubereitungszeit);
  setVal("quelleInput", r.quelle);
  setVal("portionenInput", r.portionen);
  setVal("utensilienInput", Array.isArray(r.utensilien) ? r.utensilien.join(", ") : "");
  setVal("zubereitungInput", r.zubereitung);
  setVal("kalorienInput", r.naehrwerte?.kalorien || "");
  setVal("eiweissInput", r.naehrwerte?.eiweiss || "");
  setVal("kohlenhydrateInput", r.naehrwerte?.kohlenhydrate || "");
  setVal("fettInput", r.naehrwerte?.fett || "");
  setVal("zuckerInput", r.naehrwerte?.zucker || "");
  setVal("ballaststoffeInput", r.naehrwerte?.ballaststoffe || "");
  setVal("salzInput", r.naehrwerte?.salz || "");
  setVal("notizenInput", r.notizen || "");
  setVal("tagsInput", Array.isArray(r.tags) ? r.tags.join(", ") : "");

  const container = $("zutatenGruppen");
  if (container) {
    container.innerHTML = "";
    const groups = r.zutatenGruppen?.length ? r.zutatenGruppen : [{ name: "Zutaten", zutaten: r.zutaten || [] }];
    groups.forEach(g => zutatenGruppeHinzufuegen(g.name, g.zutaten));
  }

  bereichAnzeigen("formularBereich");
  return false;
}

function rezeptAnzeigen(index) {
  const i = Number(index);
  if (!Number.isInteger(i) || !rezepte[i]) return false;
  const r = rezepte[i];

  const output = $("ergebnisse");
  if (!output) return false;

  alleHauptbereicheVerstecken();
  output.hidden = false;
  output.style.display = "";
  output.classList.remove("versteckt");

  const tags = Array.isArray(r.tags) ? r.tags.join(", ") : "";
  const utensilien = Array.isArray(r.utensilien) ? r.utensilien.join(", ") : "";

  output.innerHTML = `
    <div class="rezept-detail box">
      <h2>${esc(r.name)}</h2>
      <p><strong>Kategorie:</strong> ${esc(r.kategorie)}</p>
      ${r.portionen ? `<p><strong>Portionen:</strong> ${esc(r.portionen)}</p>` : ""}
      ${r.quelle ? `<p><strong>Quelle:</strong> ${esc(r.quelle)}</p>` : ""}
      ${r.schwierigkeit ? `<p><strong>Schwierigkeit:</strong> ${esc(r.schwierigkeit)}</p>` : ""}
      ${r.zubereitungszeit ? `<p><strong>Zeit:</strong> ${esc(r.zubereitungszeit)}</p>` : ""}
      <h3>Zutaten</h3>
      ${zutatenHtml(r)}
      <h3>Zubereitung</h3>
      <p>${esc(r.zubereitung).replace(/\n/g, "<br>")}</p>
      ${utensilien ? `<h3>Utensilien</h3><p>${esc(utensilien)}</p>` : ""}
      ${naehrwerteHtml(r)}
      ${tags ? `<h3>Tags</h3><p>${esc(tags)}</p>` : ""}
      ${r.notizen ? `<h3>Notizen</h3><p>${esc(r.notizen).replace(/\n/g, "<br>")}</p>` : ""}
      <div class="button-gruppe">
        <button type="button" onclick="rezeptBearbeiten(${i})">Bearbeiten</button>
        <button type="button" onclick="rezeptLoeschen(${i})">Löschen</button>
        <button type="button" onclick="rezeptSucheAusfuehren()">Zurück zur Suche</button>
      </div>
    </div>
  `;
  return false;
}

function zutatenHtml(recipe) {
  const groups = recipe.zutatenGruppen?.length ? recipe.zutatenGruppen : [{ name: "Zutaten", zutaten: recipe.zutaten || [] }];
  return groups.map(g => `
    <h4>${esc(g.name || "Zutaten")}</h4>
    <ul>${(g.zutaten || []).map(z => `<li>${esc([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>
  `).join("");
}

function naehrwerteHtml(recipe) {
  const n = recipe.naehrwerte || {};
  const values = [
    n.kalorien ? `${esc(n.kalorien)} kcal` : "",
    n.eiweiss ? `${esc(n.eiweiss)} g Eiweiß` : "",
    n.kohlenhydrate ? `${esc(n.kohlenhydrate)} g Kohlenhydrate` : "",
    n.fett ? `${esc(n.fett)} g Fett` : "",
    n.zucker ? `${esc(n.zucker)} g Zucker` : "",
    n.ballaststoffe ? `${esc(n.ballaststoffe)} g Ballaststoffe` : "",
    n.salz ? `${esc(n.salz)} g Salz` : ""
  ].filter(Boolean);
  return values.length ? `<h3>Nährwerte pro 100 g</h3><p>${values.join(" · ")}</p>` : "";
}

function formularLeeren() {
  ["nameInput", "zubereitungszeitInput", "quelleInput", "portionenInput", "utensilienInput", "zubereitungInput", "kalorienInput", "eiweissInput", "kohlenhydrateInput", "fettInput", "zuckerInput", "ballaststoffeInput", "salzInput", "notizenInput", "tagsInput"].forEach(id => setVal(id, ""));
  setVal("kategorieInput", "Nicht zugeordnet");
  setVal("schwierigkeitInput", "");
  setVal("ausprobiertInput", "false");
  const container = $("zutatenGruppen");
  if (container) {
    container.innerHTML = "";
    zutatenGruppeHinzufuegen("Zutaten");
  }
  bearbeitungsIndex = null;
}

function alleHauptbereicheVerstecken() {
  ["sucheBereich", "rezeptSucheBereich", "formularBereich", "einkaufBereich", "backupBereich", "textImportBereich", "datenpruefungBereich"].forEach(id => {
    const el = $(id);
    if (el) {
      el.classList.add("versteckt");
      el.hidden = true;
      el.style.display = "none";
    }
  });
}

function bereichAnzeigen(id) {
  alleHauptbereicheVerstecken();
  const el = $(id);
  if (el) {
    el.classList.remove("versteckt");
    el.hidden = false;
    el.style.display = "";
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function zurUebersicht() {
  alleHauptbereicheVerstecken();
  const output = $("ergebnisse");
  if (output) {
    output.innerHTML = "";
    output.hidden = true;
    output.style.display = "none";
  }
  document.body.classList.add("rf205-start", "startseite-clean");
}

function neuesRezeptOeffnen() {
  formularLeeren();
  bereichAnzeigen("formularBereich");
}

function rezeptHinzufuegenToggle() {
  neuesRezeptOeffnen();
}

function alleRezepteAnzeigen() {
  bereichAnzeigen("rezeptSucheBereich");
  zeigeSuchErgebnisse(sortRecipes(rezepte.map((r, index) => ({ ...r, index }))));
}

function alleRezepteStartAnzeigen() {
  alleRezepteAnzeigen();
}

function rezeptSucheToggle() {
  bereichAnzeigen("rezeptSucheBereich");
}

function sortRecipes(list) {
  return [...list].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "de", { sensitivity: "base", numeric: true }));
}

function selectedTagValue() {
  const el = $("suchTagInput") || $("suchTagsInput");
  if (!el) return "";
  if (el.multiple) return Array.from(el.selectedOptions || []).map(o => o.value || o.textContent || "").join(" ");
  return el.value || "";
}

function ingredientText(recipe) {
  return (recipe.zutaten || []).map(z => [z.menge, z.einheit, z.name].filter(Boolean).join(" ")).join(" ").toLowerCase();
}

function rezeptSucheAusfuehren() {
  const nameQ = val("suchNameInput").toLowerCase();
  const zutQ = val("suchZutatenInput").toLowerCase();
  const tagQ = selectedTagValue().toLowerCase();
  const quelleQ = val("suchQuelleInput").toLowerCase();
  const status = val("suchAusprobiertInput");
  const cats = Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv"))
    .map(el => el.dataset.kategorie || "")
    .filter(Boolean);

  let results = rezepte.map((r, index) => ({ ...r, index }));
  results = results.filter(r => {
    const tags = (r.tags || []).join(" ").toLowerCase();
    return (!nameQ || r.name.toLowerCase().includes(nameQ)) &&
      (!zutQ || ingredientText(r).includes(zutQ)) &&
      (!tagQ || tags.includes(tagQ)) &&
      (!quelleQ || String(r.quelle || "").toLowerCase().includes(quelleQ)) &&
      (!status || String(!!r.ausprobiert) === status) &&
      (!cats.length || cats.includes(r.kategorie));
  });

  zeigeSuchErgebnisse(sortRecipes(results));
  return false;
}

function filterAnwenden() {
  alleRezepteAnzeigen();
  return false;
}

function zeigeSuchErgebnisse(results) {
  letzteSuchErgebnisse = results;
  const output = $("ergebnisse");
  if (!output) return;

  output.hidden = false;
  output.style.display = "";
  output.classList.remove("versteckt");

  if (!results.length) {
    output.innerHTML = "<p>Keine Rezepte gefunden.</p>";
    return;
  }

  output.innerHTML = results.map(r => `
    <div class="rezeptkarte box">
      <h3>${esc(r.name)}</h3>
      <p><strong>Kategorie:</strong> ${esc(r.kategorie)}</p>
      ${r.quelle ? `<p><strong>Quelle:</strong> ${esc(r.quelle)}</p>` : ""}
      ${r.portionen ? `<p><strong>Portionen:</strong> ${esc(r.portionen)}</p>` : ""}
      <div class="button-gruppe">
        <button type="button" onclick="rezeptAnzeigen(${r.index})">Ansehen</button>
        <button type="button" onclick="rezeptBearbeiten(${r.index})">Bearbeiten</button>
        <button type="button" onclick="rezeptLoeschen(${r.index})">Löschen</button>
      </div>
    </div>
  `).join("");
}

function sucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchQuelleInput"].forEach(id => setVal(id, ""));
  const tag = $("suchTagInput") || $("suchTagsInput");
  if (tag) Array.from(tag.options || []).forEach(o => o.selected = false);
  rezeptSucheAusfuehren();
}

function rezeptSucheZuruecksetzen() {
  sucheZuruecksetzen();
}

function kategorienAufAlleSetzen() {
  document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel").forEach(btn => {
    btn.classList.toggle("aktiv", !btn.dataset.kategorie);
  });
}

function kategorieKachelUmschalten(button) {
  if (!button) return;
  const container = button.parentElement;
  if (!container) return;

  if (!button.dataset.kategorie) {
    container.querySelectorAll(".kategorie-kachel").forEach(b => b.classList.remove("aktiv"));
    button.classList.add("aktiv");
    return;
  }

  const all = container.querySelector('.kategorie-kachel[data-kategorie=""]');
  if (all) all.classList.remove("aktiv");
  button.classList.toggle("aktiv");
}

function optionenFuellen() {
  const category = $("kategorieInput");
  if (category) category.innerHTML = KATEGORIEN.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join("");

  const categorySearch = $("suchKategorieKacheln");
  if (categorySearch) {
    categorySearch.innerHTML = `<button type="button" class="kategorie-kachel aktiv" data-kategorie="" onclick="kategorieKachelUmschalten(this)">Alle</button>` +
      KATEGORIEN.map(k => `<button type="button" class="kategorie-kachel" data-kategorie="${esc(k)}" onclick="kategorieKachelUmschalten(this)">${esc(k)}</button>`).join("");
  }

  updateTagAndSourceOptions();
}

function updateTagAndSourceOptions() {
  const sources = [...new Set(rezepte.map(r => r.quelle).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const sourceSelect = $("suchQuelleInput");
  if (sourceSelect) sourceSelect.innerHTML = `<option value="">Alle Quellen</option>` + sources.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");

  const tags = [...new Set(rezepte.flatMap(r => r.tags || []))].sort((a, b) => a.localeCompare(b, "de"));
  const tagSelect = $("suchTagInput") || $("suchTagsInput");
  if (tagSelect) tagSelect.innerHTML = tags.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
}

function meldungAnzeigen(text, error = false) {
  const el = $("meldung") || $("cloudStatus");
  if (el) {
    el.textContent = text;
    el.style.color = error ? "crimson" : "";
  } else {
    console.log(text);
  }
}

function dashboardAktualisieren() {
  const count = $("anzahlRezepte");
  if (count) count.textContent = rezepte.length;
  const cats = $("anzahlKategorien");
  if (cats) cats.textContent = new Set(rezepte.map(r => r.kategorie).filter(Boolean)).size;
  updateTagAndSourceOptions();
}

function cleanLine(line) {
  return String(line || "").replace(/^[•\-\u2022]\s*/, "").replace(/^\d+\.\s*/, "").trim();
}

function sectionOf(line) {
  const l = cleanLine(line).toLowerCase();
  if (/^quelle\b/.test(l)) return "quelle";
  if (/^portionen?\b/.test(l)) return "portionen";
  if (/^zutaten\b/.test(l)) return "zutaten";
  if (/^zubereitung\b/.test(l)) return "zubereitung";
  if (/^utensilien\b/.test(l)) return "utensilien";
  if (/^nährwerte\b|^naehrwerte\b/.test(l)) return "naehrwerte";
  if (/^notizen?\b/.test(l)) return "notizen";
  return "";
}

function parseIngredient(line) {
  const text = cleanLine(line);
  const m = text.match(/^(\d+(?:[,.]\d+)?(?:\s*-\s*\d+(?:[,.]\d+)?)?)\s*([a-zA-ZäöüÄÖÜß.]+)?\s+(.+)$/);
  if (m) return { menge: m[1].replace(",", "."), einheit: m[2] || "", name: m[3] || "" };
  return { menge: "", einheit: "", name: text };
}

function parseNaehrwerte(text) {
  const t = String(text || "").replace(/\n/g, " ");
  const get = regex => {
    const m = t.match(regex);
    return m ? m[1].replace(",", ".") : "";
  };
  return {
    kalorien: get(/(\d+(?:[,.]\d+)?)\s*kcal/i),
    eiweiss: get(/(\d+(?:[,.]\d+)?)\s*g\s*(?:eiweiß|eiweiss|protein)/i),
    kohlenhydrate: get(/(\d+(?:[,.]\d+)?)\s*g\s*kohlenhydrate/i),
    fett: get(/(\d+(?:[,.]\d+)?)\s*g\s*fett/i),
    zucker: get(/(\d+(?:[,.]\d+)?)\s*g\s*zucker/i),
    ballaststoffe: get(/(\d+(?:[,.]\d+)?)\s*g\s*ballaststoffe/i),
    salz: get(/(\d+(?:[,.]\d+)?)\s*g\s*salz/i)
  };
}

function parseRecipeText(text) {
  const lines = String(text || "").split(/\r?\n/).map(cleanLine).filter(Boolean);
  const recipe = {
    name: lines[0] || "",
    quelle: "",
    portionen: "",
    zutatenGruppen: [],
    zubereitung: [],
    utensilien: [],
    notizen: "",
    naehrwerte: {}
  };

  let section = "";
  let currentGroup = null;
  let nutritionText = "";

  const ensureGroup = name => {
    currentGroup = { name: name || "Zutaten", zutaten: [] };
    recipe.zutatenGruppen.push(currentGroup);
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const sec = sectionOf(line);

    if (sec) {
      section = sec;
      const q = line.match(/^Quelle\s*:\s*(.+)$/i);
      if (q) recipe.quelle = q[1].trim();
      const p = line.match(/^Portionen?\s*:\s*(.+)$/i);
      if (p) {
        const n = p[1].match(/\d+(?:[,.]\d+)?/);
        recipe.portionen = n ? n[0].replace(",", ".") : p[1].trim();
      }
      if (sec === "naehrwerte") nutritionText += " " + line;
      continue;
    }

    if (section === "quelle") recipe.quelle = line.replace(/^Quelle\s*:\s*/i, "");
    else if (section === "portionen") {
      const n = line.match(/\d+(?:[,.]\d+)?/);
      recipe.portionen = n ? n[0].replace(",", ".") : line;
    } else if (section === "zutaten") {
      if (/^für\s+/i.test(line)) {
        ensureGroup(line.replace(/^für\s+/i, "").trim());
      } else {
        if (!currentGroup) ensureGroup("Zutaten");
        currentGroup.zutaten.push(parseIngredient(line));
      }
    } else if (section === "zubereitung") recipe.zubereitung.push(line);
    else if (section === "utensilien") recipe.utensilien.push(line);
    else if (section === "naehrwerte") nutritionText += " " + line;
    else if (section === "notizen") recipe.notizen += (recipe.notizen ? "\n" : "") + line;
  }

  recipe.naehrwerte = parseNaehrwerte(nutritionText);
  if (!recipe.zutatenGruppen.length) recipe.zutatenGruppen = [{ name: "Zutaten", zutaten: [] }];
  return recipe;
}

function rezeptAnalysierenDirekt() {
  const input = $("textImportInput");
  const preview = $("assistentVorschau");
  if (!input || !preview) return false;

  const parsed = parseRecipeText(input.value);
  preview.hidden = false;
  preview.style.display = "";
  preview.classList.remove("versteckt");
  preview.innerHTML = `
    <div class="box">
      <h3>${esc(parsed.name || "Unbenanntes Rezept")}</h3>
      <p><strong>Quelle:</strong> ${esc(parsed.quelle)}</p>
      <p><strong>Portionen:</strong> ${esc(parsed.portionen)}</p>
      ${parsed.zutatenGruppen.map(g => `<h4>${esc(g.name)}</h4><ul>${g.zutaten.map(z => `<li>${esc([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>`).join("")}
      <button type="button" onclick="assistentInsFormular()">Ins Formular übernehmen</button>
    </div>
  `;
  window.assistentDaten = parsed;
  return false;
}

function assistentInsFormular() {
  const r = window.assistentDaten;
  if (!r) return false;

  formularLeeren();
  setVal("nameInput", r.name);
  setVal("quelleInput", r.quelle);
  setVal("portionenInput", r.portionen);
  setVal("zubereitungInput", r.zubereitung.join("\n"));
  setVal("utensilienInput", r.utensilien.join(", "));
  setVal("notizenInput", r.notizen);
  setVal("kalorienInput", r.naehrwerte.kalorien || "");
  setVal("eiweissInput", r.naehrwerte.eiweiss || "");
  setVal("kohlenhydrateInput", r.naehrwerte.kohlenhydrate || "");
  setVal("fettInput", r.naehrwerte.fett || "");
  setVal("zuckerInput", r.naehrwerte.zucker || "");
  setVal("ballaststoffeInput", r.naehrwerte.ballaststoffe || "");
  setVal("salzInput", r.naehrwerte.salz || "");

  const container = $("zutatenGruppen");
  if (container) {
    container.innerHTML = "";
    r.zutatenGruppen.forEach(g => zutatenGruppeHinzufuegen(g.name, g.zutaten));
  }
  applyMacroTagsToForm();

  const input = $("textImportInput");
  const preview = $("assistentVorschau");
  if (input) input.value = "";
  if (preview) preview.innerHTML = "";
  bereichAnzeigen("formularBereich");
  return false;
}

function textImportToggle() {
  bereichAnzeigen("textImportBereich");
}

function einkaufslisteErstellen() {
  const list = $("einkaufsliste");
  if (list && !list.innerHTML.trim()) list.innerHTML = "<li>Keine Zutaten ausgewählt.</li>";
}

function einkaufslisteDrucken() {
  window.print();
}

function einkaufslisteZuruecksetzen() {
  const list = $("einkaufsliste");
  if (list) list.innerHTML = "";
}

function datenqualitaetPruefen() {
  const output = $("datenpruefungInhalt") || $("ergebnisse");
  if (!output) return;
  const problems = rezepte.map((r, index) => {
    const p = [];
    if (!r.name) p.push("Name fehlt");
    if (!r.portionen) p.push("Portionen fehlen");
    if (!r.zutaten.length) p.push("Zutaten fehlen");
    if (!r.zubereitung) p.push("Zubereitung fehlt");
    if (!r.tags.length) p.push("Tags fehlen");
    return { r, index, p };
  }).filter(x => x.p.length);

  output.innerHTML = problems.length
    ? problems.map(x => `<div class="box"><h3>${esc(x.r.name)}</h3><ul>${x.p.map(p => `<li>${esc(p)}</li>`).join("")}</ul><button onclick="rezeptBearbeiten(${x.index})">Rezept bearbeiten</button></div>`).join("")
    : "<p>Alle Rezepte sehen gut aus.</p>";
}

function datenpruefungToggle() {
  bereichAnzeigen("datenpruefungBereich");
  datenqualitaetPruefen();
}

function cloudInit() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase || !SUPABASE_KEY || SUPABASE_KEY.includes("PASTE_")) {
    return null;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return supabaseClient;
}

function cloudStatus(text, error = false) {
  const el = $("cloudStatus");
  if (el) {
    el.textContent = text;
    el.style.color = error ? "crimson" : "";
  }
}

async function cloudSpeichernAlle() {
  const client = cloudInit();
  if (!client) {
    cloudStatus("Supabase ist nicht verbunden.", true);
    return false;
  }

  cloudStatus("speichere in Cloud ...");
  const rows = rezepte.map(r => ({
    id: String(r.id),
    name: r.name || "Unbenanntes Rezept",
    daten: r,
    aktualisiert_am: new Date().toISOString()
  }));

  const { error } = await client.from("rezepte").upsert(rows, { onConflict: "id" });
  if (error) {
    cloudStatus("Cloud-Speichern fehlgeschlagen: " + error.message, true);
    return false;
  }

  cloudStatus(`${rows.length} Rezept(e) in Cloud gespeichert.`);
  return false;
}

async function cloudLaden() {
  const client = cloudInit();
  if (!client) {
    cloudStatus("Supabase ist nicht verbunden.", true);
    return false;
  }

  cloudStatus("lade aus Cloud ...");
  const { data, error } = await client.from("rezepte").select("*");
  if (error) {
    cloudStatus("Cloud-Laden fehlgeschlagen: " + error.message, true);
    return false;
  }

  rezepte = normalizeRecipeList((data || []).map(row => row.daten || row.rezept || row));
  speichereRezepte();
  cloudStatus(`${rezepte.length} Rezept(e) aus Cloud geladen.`);
  return false;
}

function ausCloudLaden() {
  return cloudLaden();
}

function cloudBackupsAnzeigen() {
  const area = $("backupBereich") || $("ergebnisse");
  if (!area) return false;
  backupOffen = !backupOffen;
  if (!backupOffen) {
    area.classList.add("versteckt");
    area.hidden = true;
    return false;
  }
  bereichAnzeigen(area.id);
  area.innerHTML = "<h2>Cloud-Backups</h2><p>Backup-Anzeige ist in v3.0 vorbereitet. Aktuell wird die Haupt-Cloud geladen/gespeichert.</p>";
  return false;
}

function backupErstellen() {
  const blob = new Blob([JSON.stringify(rezepte, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "rezeptfinder-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function dateiImportieren(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    rezepte = normalizeRecipeList(parseList(reader.result));
    speichereRezepte();
    meldungAnzeigen("Backup importiert.");
  };
  reader.readAsText(file);
}


function rezeptAssistentZuruecksetzen() {
  const input = $("textImportInput");
  const preview = $("assistentVorschau");
  if (input) input.value = "";
  if (preview) {
    preview.innerHTML = "";
    preview.hidden = true;
    preview.style.display = "none";
    preview.classList.add("versteckt");
  }
  window.assistentDaten = null;
  return false;
}

function appInit() {
  ladeRezepte();
  optionenFuellen();
  if (!$("zutatenGruppen")?.children.length) formularLeeren();

  const saveButton = $("saveRecipeButton");
  if (saveButton) saveButton.onclick = rezeptSpeichern;

  ["eiweissInput", "kohlenhydrateInput", "fettInput"].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("input", applyMacroTagsToForm);
  });

  dashboardAktualisieren();
}

window.addEventListener("load", appInit);

// Inline compatibility
window.rezepte = rezepte;
window.rezeptSpeichern = rezeptSpeichern;
window.rf155RezeptSpeichern = rezeptSpeichern;
window.rezeptBearbeiten = rezeptBearbeiten;
window.rezeptLoeschen = rezeptLoeschen;
window.rezeptAnzeigen = rezeptAnzeigen;
window.rezeptAnsehen = rezeptAnzeigen;
window.neuesRezeptOeffnen = neuesRezeptOeffnen;
window.rezeptHinzufuegenToggle = rezeptHinzufuegenToggle;
window.alleRezepteAnzeigen = alleRezepteAnzeigen;
window.alleRezepteStartAnzeigen = alleRezepteStartAnzeigen;
window.rezeptSucheToggle = rezeptSucheToggle;
window.rezeptSucheAusfuehren = rezeptSucheAusfuehren;
window.filterAnwenden = filterAnwenden;
window.sucheZuruecksetzen = sucheZuruecksetzen;
window.rezeptSucheZuruecksetzen = rezeptSucheZuruecksetzen;
window.kategorieKachelUmschalten = kategorieKachelUmschalten;
window.kategorienAufAlleSetzen = kategorienAufAlleSetzen;
window.formularLeeren = formularLeeren;
window.zutatenGruppeHinzufuegen = zutatenGruppeHinzufuegen;
window.zutatZeileHinzufuegen = zutatZeileHinzufuegen;
window.zutatZeileLoeschen = zutatZeileLoeschen;
window.zutatengruppeLoeschen = zutatengruppeLoeschen;
window.zurUebersicht = zurUebersicht;
window.bereichAnzeigen = bereichAnzeigen;
window.textImportToggle = textImportToggle;
window.rezeptAnalysierenDirekt = rezeptAnalysierenDirekt;
window.rezeptAssistentZuruecksetzen = rezeptAssistentZuruecksetzen;
window.rezeptAnalysierenDirektFinal = rezeptAnalysierenDirekt;
window.rf153AssistentVorschau = rezeptAnalysierenDirekt;
window.assistentInsFormular = assistentInsFormular;
window.einkaufslisteErstellen = einkaufslisteErstellen;
window.einkaufslisteDrucken = einkaufslisteDrucken;
window.einkaufslisteZuruecksetzen = einkaufslisteZuruecksetzen;
window.datenpruefungToggle = datenpruefungToggle;
window.datenqualitaetPruefen = datenqualitaetPruefen;
window.cloudSpeichernAlle = cloudSpeichernAlle;
window.cloudLaden = cloudLaden;
window.ausCloudLaden = ausCloudLaden;
window.cloudBackupsAnzeigen = cloudBackupsAnzeigen;
window.backupErstellen = backupErstellen;
window.dateiImportieren = dateiImportieren;

window.rf31Diagnose = function() {
  return {
    version: APP_VERSION,
    rezepte: Array.isArray(window.rezepte) ? window.rezepte.length : null,
    localStorageRezepte: parseList(localStorage.getItem(STORAGE_KEY)).length,
    hatAssistentReset: typeof window.rezeptAssistentZuruecksetzen === "function"
  };
};


// =====================================================
// v3.2 Startseiten-Buttons verbinden
// =====================================================

function bindStartButtonsV32() {
  const bindings = {
    rf207CloudSpeichern: cloudSpeichernAlle,
    rf207CloudLaden: cloudLaden,
    rf207CloudBackups: cloudBackupsAnzeigen,
    rf207BackupDownload: backupErstellen,
    rf207RezepteSuchen: rezeptSucheToggle,
    rf207RezeptHinzufuegen: neuesRezeptOeffnen,
    rf207AlleRezepte: alleRezepteAnzeigen,
    rf207Einkaufsliste: function () {
      bereichAnzeigen("einkaufBereich");
      einkaufslisteErstellen();
      return false;
    },
    rf207RezeptAssistent: textImportToggle,
    rf207RezeptePruefen: datenpruefungToggle
  };

  Object.entries(bindings).forEach(([id, fn]) => {
    const button = document.getElementById(id);
    if (!button || typeof fn !== "function") return;

    button.type = "button";
    button.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return fn();
    };
  });

  const saveButton = document.getElementById("saveRecipeButton");
  if (saveButton) {
    saveButton.type = "button";
    saveButton.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return rezeptSpeichern();
    };
  }

  const analyzeButton = document.getElementById("rezeptAnalysierenButton");
  if (analyzeButton) {
    analyzeButton.type = "button";
    analyzeButton.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return rezeptAnalysierenDirekt();
    };
  }
}

window.bindStartButtonsV32 = bindStartButtonsV32;

window.addEventListener("load", function() {
  bindStartButtonsV32();
  setTimeout(bindStartButtonsV32, 250);
  setTimeout(bindStartButtonsV32, 1000);
});



// =====================================================
// v3.3 Tag-Mehrfachauswahl + Suche repariert
// =====================================================

function getSelectedTagsV33() {
  const el = document.getElementById("suchTagInput") || document.getElementById("suchTagsInput");
  if (!el) return [];

  if (el.tagName && el.tagName.toLowerCase() === "select") {
    return Array.from(el.selectedOptions || [])
      .map(option => normalizeTag(option.value || option.textContent || ""))
      .filter(Boolean);
  }

  return String(el.value || "")
    .split(",")
    .map(normalizeTag)
    .filter(Boolean);
}

function updateTagAndSourceOptionsV33() {
  const sources = [...new Set(rezepte.map(r => r.quelle).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "de"));

  const sourceSelect = document.getElementById("suchQuelleInput");
  if (sourceSelect) {
    const current = sourceSelect.value || "";
    sourceSelect.innerHTML =
      `<option value="">Alle Quellen</option>` +
      sources.map(s => `<option value="${esc(s)}"${s === current ? " selected" : ""}>${esc(s)}</option>`).join("");
  }

  const tags = [...new Set(rezepte.flatMap(r => Array.isArray(r.tags) ? r.tags : []))]
    .map(normalizeTag)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "de"));

  const tagSelect = document.getElementById("suchTagInput") || document.getElementById("suchTagsInput");
  if (tagSelect) {
    const selected = new Set(getSelectedTagsV33());

    tagSelect.setAttribute("multiple", "multiple");
    tagSelect.multiple = true;
    tagSelect.size = Math.min(Math.max(tags.length || 1, 4), 10);

    tagSelect.innerHTML = tags.map(tag =>
      `<option value="${esc(tag)}"${selected.has(tag) ? " selected" : ""}>${esc(tag)}</option>`
    ).join("");
  }
}

function rezeptSucheAusfuehrenV33() {
  const nameQ = val("suchNameInput").toLowerCase();
  const zutQ = val("suchZutatenInput").toLowerCase();
  const selectedTags = getSelectedTagsV33();
  const quelleQ = val("suchQuelleInput").toLowerCase();
  const status = val("suchAusprobiertInput");

  const cats = Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv"))
    .map(el => el.dataset.kategorie || "")
    .filter(Boolean);

  let results = rezepte.map((r, index) => ({ ...r, index }));

  results = results.filter(r => {
    const recipeTags = Array.isArray(r.tags)
      ? r.tags.map(normalizeTag)
      : String(r.tags || "").split(",").map(normalizeTag).filter(Boolean);

    const tagOk =
      !selectedTags.length ||
      selectedTags.some(tag => recipeTags.includes(tag));

    const nameOk = !nameQ || String(r.name || "").toLowerCase().includes(nameQ);
    const zutOk = !zutQ || ingredientText(r).includes(zutQ);
    const quelleOk = !quelleQ || String(r.quelle || "").toLowerCase().includes(quelleQ);
    const statusOk = !status || String(!!r.ausprobiert) === status;
    const catOk = !cats.length || cats.includes(r.kategorie);

    return nameOk && zutOk && tagOk && quelleOk && statusOk && catOk;
  });

  zeigeSuchErgebnisse(sortRecipes(results));
  return false;
}

function rezeptSucheToggleV33() {
  updateTagAndSourceOptionsV33();
  bereichAnzeigen("rezeptSucheBereich");
  return false;
}

// Überschreiben der v3.2 Funktionen
window.rezeptSucheAusfuehren = rezeptSucheAusfuehrenV33;
window.filterAnwenden = function() {
  zeigeSuchErgebnisse(sortRecipes(rezepte.map((r, index) => ({ ...r, index }))));
  return false;
};
window.rezeptSucheToggle = rezeptSucheToggleV33;
window.updateTagAndSourceOptions = updateTagAndSourceOptionsV33;

try {
  rezeptSucheAusfuehren = rezeptSucheAusfuehrenV33;
  filterAnwenden = window.filterAnwenden;
  rezeptSucheToggle = rezeptSucheToggleV33;
  updateTagAndSourceOptions = updateTagAndSourceOptionsV33;
} catch(e) {}

function bindSearchButtonsV33() {
  const searchOpen = document.getElementById("rf207RezepteSuchen");
  if (searchOpen) {
    searchOpen.type = "button";
    searchOpen.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return rezeptSucheToggleV33();
    };
  }

  document.querySelectorAll("button").forEach(button => {
    const text = (button.textContent || "").trim().toLowerCase();
    const onclick = button.getAttribute("onclick") || "";

    if (text === "suchen" || onclick.includes("rezeptSucheAusfuehren")) {
      button.type = "button";
      button.onclick = function(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return rezeptSucheAusfuehrenV33();
      };
    }

    if (text === "alle anzeigen" || onclick.includes("filterAnwenden")) {
      button.type = "button";
      button.onclick = function(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return window.filterAnwenden();
      };
    }
  });
}

window.addEventListener("load", function() {
  updateTagAndSourceOptionsV33();
  bindSearchButtonsV33();
  setTimeout(updateTagAndSourceOptionsV33, 300);
  setTimeout(bindSearchButtonsV33, 300);
  setTimeout(bindSearchButtonsV33, 1000);
});

window.rf33Diagnose = function() {
  return {
    rezepte: rezepte.length,
    tags: [...new Set(rezepte.flatMap(r => Array.isArray(r.tags) ? r.tags : []))],
    selectedTags: getSelectedTagsV33(),
    suchTagMultiple: !!(document.getElementById("suchTagInput") && document.getElementById("suchTagInput").multiple)
  };
};


// =====================================================
// v3.4 Alle Rezepte eigenständig + Startseite sauber + Rezepte prüfen vollständig
// =====================================================

function clearResultsV34() {
  const output = document.getElementById("ergebnisse");
  if (output) {
    output.innerHTML = "";
    output.hidden = true;
    output.style.display = "none";
    output.classList.add("versteckt");
  }
}

function showResultsV34(results) {
  const output = document.getElementById("ergebnisse");
  if (!output) return;

  output.hidden = false;
  output.style.display = "";
  output.classList.remove("versteckt");

  if (!results.length) {
    output.innerHTML = "<p>Keine Rezepte gefunden.</p>";
    return;
  }

  output.innerHTML = results.map(r => `
    <div class="rezeptkarte box">
      <h3>${esc(r.name)}</h3>
      <p><strong>Kategorie:</strong> ${esc(r.kategorie || "Nicht zugeordnet")}</p>
      ${r.quelle ? `<p><strong>Quelle:</strong> ${esc(r.quelle)}</p>` : ""}
      ${r.portionen ? `<p><strong>Portionen:</strong> ${esc(r.portionen)}</p>` : ""}
      <div class="button-gruppe">
        <button type="button" onclick="rezeptAnzeigen(${r.index})">Ansehen</button>
        <button type="button" onclick="rezeptBearbeiten(${r.index})">Bearbeiten</button>
        <button type="button" onclick="rezeptLoeschen(${r.index})">Löschen</button>
      </div>
    </div>
  `).join("");
}

// Alle Rezepte anzeigen: eigene Funktion, keine Suchfilter, immer A-Z.
// Öffnet nur die Ergebnisliste, nicht den Suche-Bereich.
function alleRezepteAnzeigenV34() {
  alleHauptbereicheVerstecken();

  const results = sortRecipes(rezepte.map((r, index) => ({ ...r, index })));
  letzteSuchErgebnisse = results;

  showResultsV34(results);
  return false;
}

// Rezepte suchen: öffnet nur die Suchmaske, zeigt noch keine Rezepte unten an.
function rezeptSucheToggleV34() {
  clearResultsV34();
  bereichAnzeigen("rezeptSucheBereich");

  if (typeof updateTagAndSourceOptionsV33 === "function") {
    updateTagAndSourceOptionsV33();
  } else if (typeof updateTagAndSourceOptions === "function") {
    updateTagAndSourceOptions();
  }

  return false;
}

// Suche: nur wenn man wirklich auf Suchen klickt.
function rezeptSucheAusfuehrenV34() {
  const nameQ = val("suchNameInput").toLowerCase();
  const zutQ = val("suchZutatenInput").toLowerCase();
  const selectedTags = typeof getSelectedTagsV33 === "function" ? getSelectedTagsV33() : [];
  const quelleQ = val("suchQuelleInput").toLowerCase();
  const status = val("suchAusprobiertInput");

  const cats = Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv"))
    .map(el => el.dataset.kategorie || "")
    .filter(Boolean);

  let results = rezepte.map((r, index) => ({ ...r, index }));

  results = results.filter(r => {
    const recipeTags = Array.isArray(r.tags)
      ? r.tags.map(normalizeTag)
      : String(r.tags || "").split(",").map(normalizeTag).filter(Boolean);

    const tagOk = !selectedTags.length || selectedTags.some(tag => recipeTags.includes(tag));
    const nameOk = !nameQ || String(r.name || "").toLowerCase().includes(nameQ);
    const zutOk = !zutQ || ingredientText(r).includes(zutQ);
    const quelleOk = !quelleQ || String(r.quelle || "").toLowerCase().includes(quelleQ);
    const statusOk = !status || String(!!r.ausprobiert) === status;
    const catOk = !cats.length || cats.includes(r.kategorie);

    return nameOk && zutOk && tagOk && quelleOk && statusOk && catOk;
  });

  results = sortRecipes(results);
  letzteSuchErgebnisse = results;
  showResultsV34(results);
  return false;
}

// Datenprüfung wieder vollständig
function datenqualitaetPruefenV34() {
  const pruefbereich = document.getElementById("datenpruefungBereich");
  const output = document.getElementById("datenpruefungInhalt") || document.getElementById("ergebnisse");

  if (pruefbereich) {
    pruefbereich.hidden = false;
    pruefbereich.style.display = "";
    pruefbereich.classList.remove("versteckt");
  }

  if (!output) return false;

  const problems = rezepte.map((r, index) => {
    const p = [];

    if (!String(r.name || "").trim()) p.push("Name fehlt");
    if (!String(r.kategorie || "").trim()) p.push("Kategorie fehlt");
    if (!String(r.portionen || "").trim()) p.push("Grundportionen fehlen");
    if (!Array.isArray(r.zutaten) || r.zutaten.length === 0) p.push("Zutaten fehlen");
    if (!Array.isArray(r.zutatenGruppen) || r.zutatenGruppen.length === 0) p.push("Zutatengruppen fehlen");
    if (!String(r.zubereitung || "").trim()) p.push("Zubereitung fehlt");
    if (!Array.isArray(r.utensilien) || r.utensilien.length === 0) p.push("Utensilien fehlen");
    if (!String(r.quelle || "").trim()) p.push("Quelle fehlt");
    if (!Array.isArray(r.tags) || r.tags.length === 0) p.push("Tags fehlen");

    const n = r.naehrwerte || {};
    if (!String(n.kalorien || "").trim()) p.push("Kalorien fehlen");
    if (!String(n.eiweiss || "").trim()) p.push("Eiweiß fehlt");
    if (!String(n.kohlenhydrate || "").trim()) p.push("Kohlenhydrate fehlen");
    if (!String(n.fett || "").trim()) p.push("Fett fehlt");

    return { r, index, p };
  }).filter(x => x.p.length);

  output.hidden = false;
  output.style.display = "";
  output.classList.remove("versteckt");

  if (!problems.length) {
    output.innerHTML = "<p>Alle Rezepte sind vollständig.</p>";
    return false;
  }

  output.innerHTML = problems.map(x => `
    <div class="box">
      <h3>${esc(x.r.name || "Unbenanntes Rezept")}</h3>
      <p><strong>Fehlende Punkte:</strong></p>
      <ul>${x.p.map(problem => `<li>${esc(problem)}</li>`).join("")}</ul>
      <button type="button" onclick="rezeptBearbeiten(${x.index})">Bearbeiten</button>
      <button type="button" onclick="rezeptAnzeigen(${x.index})">Ansehen</button>
    </div>
  `).join("");

  return false;
}

function datenpruefungToggleV34() {
  clearResultsV34();
  alleHauptbereicheVerstecken();
  const bereich = document.getElementById("datenpruefungBereich");
  if (bereich) {
    bereich.hidden = false;
    bereich.style.display = "";
    bereich.classList.remove("versteckt");
  }
  return datenqualitaetPruefenV34();
}

// Startbuttons neu verbinden und unerwünschte Ergebnisliste verhindern.
function bindButtonsV34() {
  const searchBtn = document.getElementById("rf207RezepteSuchen");
  if (searchBtn) {
    searchBtn.type = "button";
    searchBtn.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return rezeptSucheToggleV34();
    };
  }

  const allBtn = document.getElementById("rf207AlleRezepte");
  if (allBtn) {
    allBtn.type = "button";
    allBtn.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return alleRezepteAnzeigenV34();
    };
  }

  const checkBtn = document.getElementById("rf207RezeptePruefen");
  if (checkBtn) {
    checkBtn.type = "button";
    checkBtn.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return datenpruefungToggleV34();
    };
  }

  const assistantBtn = document.getElementById("rf207RezeptAssistent");
  if (assistantBtn) {
    assistantBtn.type = "button";
    assistantBtn.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      clearResultsV34();
      return textImportToggle();
    };
  }

  const addBtn = document.getElementById("rf207RezeptHinzufuegen");
  if (addBtn) {
    addBtn.type = "button";
    addBtn.onclick = function(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      clearResultsV34();
      return neuesRezeptOeffnen();
    };
  }

  document.querySelectorAll("button").forEach(button => {
    const text = (button.textContent || "").trim().toLowerCase();
    const onclick = button.getAttribute("onclick") || "";

    if (text === "suchen" || onclick.includes("rezeptSucheAusfuehren")) {
      button.type = "button";
      button.onclick = function(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return rezeptSucheAusfuehrenV34();
      };
    }

    if (text === "alle anzeigen" || onclick.includes("filterAnwenden")) {
      button.type = "button";
      button.onclick = function(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return alleRezepteAnzeigenV34();
      };
    }
  });
}

// Globale Funktionen überschreiben
window.alleRezepteAnzeigen = alleRezepteAnzeigenV34;
window.alleRezepteStartAnzeigen = alleRezepteAnzeigenV34;
window.rezeptSucheToggle = rezeptSucheToggleV34;
window.rezeptSucheAusfuehren = rezeptSucheAusfuehrenV34;
window.filterAnwenden = alleRezepteAnzeigenV34;
window.datenqualitaetPruefen = datenqualitaetPruefenV34;
window.datenpruefungToggle = datenpruefungToggleV34;

try {
  alleRezepteAnzeigen = alleRezepteAnzeigenV34;
  alleRezepteStartAnzeigen = alleRezepteAnzeigenV34;
  rezeptSucheToggle = rezeptSucheToggleV34;
  rezeptSucheAusfuehren = rezeptSucheAusfuehrenV34;
  filterAnwenden = alleRezepteAnzeigenV34;
  datenqualitaetPruefen = datenqualitaetPruefenV34;
  datenpruefungToggle = datenpruefungToggleV34;
} catch(e) {}

window.addEventListener("load", function() {
  bindButtonsV34();
  setTimeout(bindButtonsV34, 300);
  setTimeout(bindButtonsV34, 1000);
});

window.rf34Diagnose = function() {
  return {
    rezepte: rezepte.length,
    alleRezepteButton: !!document.getElementById("rf207AlleRezepte"),
    sucheButton: !!document.getElementById("rf207RezepteSuchen"),
    pruefenButton: !!document.getElementById("rf207RezeptePruefen")
  };
};
