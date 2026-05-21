

var assistentDaten = null;


function zurUebersicht() {
  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function hauptbereichToggle(id, formularLeerenSoll = false, alleRezepteAnzeigenSoll = false, datenpruefungSoll = false) {
  const bereich = document.getElementById(id);
  const istSchonOffen = bereich && !bereich.classList.contains("versteckt");

  if (istSchonOffen) {
    zurUebersicht();
    return;
  }

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;

  if (formularLeerenSoll) {
    formularLeeren();
  }

  if (bereich) {
    bereich.classList.remove("versteckt");
  }

  if (id === "einkaufBereich") {
    einkaufslisteErstellen();
  }

  if (alleRezepteAnzeigenSoll) {
    document.getElementById("sortierungInput").value = "name";
    kategorienAufAlleSetzen();

    let ergebnisse = rezepte.map((rezept, index) => ({
      ...rezept,
      index,
      vorhandene: [],
      fehlende: []
    }));

    ergebnisse = sortieren(ergebnisse);
    letzteSuchErgebnisse = ergebnisse;
    zeigeErgebnisse(ergebnisse);
  }

  if (datenpruefungSoll) {
    datenqualitaetPruefen();
    datenpruefungOffen = true;
  }

  window.scrollTo({
    top: bereich ? bereich.offsetTop - 20 : 0,
    behavior: "smooth"
  });
}

function bereichAnzeigen(id) {
  alleHauptbereicheVerstecken();

  const bereich = document.getElementById(id);
  if (bereich) {
    bereich.classList.remove("versteckt");
  }

  if (id === "einkaufBereich") {
    einkaufslisteErstellen();
  }

  window.scrollTo({
    top: bereich ? bereich.offsetTop - 20 : 0,
    behavior: "smooth"
  });
}

function rezeptNeuStarten() {
  const bereich = document.getElementById("formularBereich");
  const istSchonOffen = bereich && !bereich.classList.contains("versteckt");

  if (istSchonOffen) {
    zurUebersicht();
    return;
  }

  hauptbereichToggle("formularBereich", true);
}

function alleRezepteStartAnzeigen() {
  const bereich = document.getElementById("sucheBereich");
  const istSchonOffen = bereich && !bereich.classList.contains("versteckt");

  if (istSchonOffen) {
    zurUebersicht();
    return;
  }

  hauptbereichToggle("sucheBereich", false, true);
}

function datenpruefungToggle() {
  hauptbereichToggle("datenpruefungBereich", false, false, true);
}

const KATEGORIEN=["Nicht zugeordnet","Kalte Vorspeisen","Suppen","Warme Vorspeisen","Salate","Saucen und Aufstriche","Hauptspeisen Fleisch","Hauptspeisen Fisch","Hauptspeisen vegetarisch","Beilagen","Dessert","Kuchen und Torten","Bäckerei","Kekse","Brot","Teige","Eis","Getränke","Haltbar machen","Gewürze","Marmeladen und Saucen","Sirup","Pralinen","Sonstiges","Airfryer"];
const EINHEITEN=["","mg","g","dag","kg","ml","cl","dl","l","TL","EL","Stk.","Prise","Becher","Tasse","Päckchen","Dose","Glas","Bund","Zweig","Blatt","Scheibe","Würfel","Messerspitze","Spritzer","Handvoll"];
let rezepte=datenLaden("rezepte",[]),bearbeitungsIndex=null,letzteSuchErgebnisse=[],timerListe={},datenpruefungOffen=false,zuletztGeloeschtesRezept=null,zuletztGeloeschterIndex=null;
function datenSpeichern(k,d){localStorage.setItem(k,JSON.stringify(d))}function datenLaden(k,s){try{const d=localStorage.getItem(k);return d?JSON.parse(d):s}catch{return s}}function speichern(){datenSpeichern("rezepte",rezepte)}
function init(){optionenFuellen();datenstrukturReparieren();zutatenGruppeHinzufuegen("Zutaten");dashboardAktualisieren();document.getElementById("ergebnisse").innerHTML=""}
function optionenFuellen(){document.getElementById("kategorieInput").innerHTML=KATEGORIEN.map(k=>`<option>${k}</option>`).join("");document.getElementById("suchKategorieKacheln").innerHTML=`<button class="kategorie-kachel aktiv" data-kategorie="" onclick="kategorieKachelUmschalten(this)">Alle</button>`+KATEGORIEN.map(k=>`<button class="kategorie-kachel" data-kategorie="${k}" onclick="kategorieKachelUmschalten(this)">${k}</button>`).join("")}
function datenstrukturReparieren(){rezepte=rezepte.map(r=>{delete r.bild;let gruppen=r.zutatenGruppen||[{name:"Zutaten",zutaten:(r.zutaten||[]).map(zutatNormalisieren)}];gruppen=gruppen.map(g=>({name:g.name||"Zutaten",zutaten:(g.zutaten||[]).map(zutatNormalisieren)}));return{id:r.id||crypto.randomUUID(),favorit:r.favorit||false,bewertung:r.bewertung||0,portionen:r.portionen||"",schwierigkeit:r.schwierigkeit||"",zubereitungszeit:r.zubereitungszeit||"",quelle:r.quelle||"",notizen:r.notizen||(Array.isArray(r.varianten)?r.varianten.join(", "):""),tags:r.tags||[],utensilien:r.utensilien||[],name:r.name||"Unbenanntes Rezept",kategorie:r.kategorie||"Nicht zugeordnet",zutatenGruppen:gruppen,zutaten:zutatenAusGruppen(gruppen),zubereitung:r.zubereitung||r.anleitung||""}});speichern()}
function alleHauptbereicheVerstecken(){["sucheBereich","formularBereich","einkaufBereich","backupBereich","textImportBereich","datenpruefungBereich"].forEach(id=>document.getElementById(id)?.classList.add("versteckt"))}
function bereichAnzeigen(id){datenpruefungOffen=false;alleHauptbereicheVerstecken();document.getElementById(id)?.classList.remove("versteckt");if(id==="einkaufBereich")einkaufslisteErstellen();if(id!=="formularBereich"&&id!=="sucheBereich")document.getElementById("ergebnisse").innerHTML="";document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
function neuesRezeptOeffnen(){bereichAnzeigen("formularBereich");formularLeeren();document.getElementById("ergebnisse").innerHTML=""}
function alleRezepteAnzeigen(){bereichAnzeigen("sucheBereich");kategorienAufAlleSetzen();filterAnwenden()}
function schnellfilterToggle(){document.getElementById("schnellfilterInhalt").classList.toggle("versteckt")}
function rezeptSpeichern(){const name=textTitel(v("nameInput")),kategorie=v("kategorieInput")||"Nicht zugeordnet",portionen=Number(v("portionenInput")),schwierigkeit=v("schwierigkeitInput"),zubereitungszeit=v("zubereitungszeitInput"),quelle=v("quelleInput"),zutatenGruppen=zutatenGruppenAusFormularLesen(),zutaten=zutatenAusGruppen(zutatenGruppen),zubereitung=v("zubereitungInput"),utensilien=v("utensilienInput").split(",").map(x=>textTitel(x.trim())).filter(Boolean),notizen=v("notizenInput"),tags=v("tagsInput").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);if(!name||!portionen||!zubereitung||zutaten.length===0){meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.",true);return}const warn=zutatenPruefen(zutaten);if(warn.length&&!confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n"+warn.join("\n")+"\n\nTrotzdem speichern?"))return;const alt=bearbeitungsIndex===null?{}:rezepte[bearbeitungsIndex];const rezept={id:alt.id||crypto.randomUUID(),favorit:alt.favorit||false,bewertung:alt.bewertung||0,name,kategorie,portionen,schwierigkeit,zubereitungszeit,quelle,zutatenGruppen,zutaten,zubereitung,utensilien,notizen,tags};if(bearbeitungsIndex===null)rezepte.push(rezept);else rezepte[bearbeitungsIndex]=rezept;bearbeitungsIndex=null;speichern();formularLeeren();dashboardAktualisieren();document.getElementById("ergebnisse").innerHTML="";alleHauptbereicheVerstecken();meldungAnzeigen("Rezept gespeichert.")}
function formularLeeren(){bearbeitungsIndex=null;["nameInput","portionenInput","zubereitungszeitInput","quelleInput","zubereitungInput","utensilienInput","notizenInput","tagsInput"].forEach(id=>document.getElementById(id).value="");document.getElementById("kategorieInput").value="Nicht zugeordnet";document.getElementById("schwierigkeitInput").value="";document.getElementById("zutatenGruppen").innerHTML="";zutatenGruppeHinzufuegen("Zutaten")}
function rezeptBearbeiten(i){const r=rezepte[i];bereichAnzeigen("formularBereich");bearbeitungsIndex=i;document.getElementById("nameInput").value=r.name;document.getElementById("kategorieInput").value=r.kategorie||"Nicht zugeordnet";document.getElementById("portionenInput").value=r.portionen||"";document.getElementById("schwierigkeitInput").value=r.schwierigkeit||"";document.getElementById("zubereitungszeitInput").value=r.zubereitungszeit||"";document.getElementById("quelleInput").value=r.quelle||"";document.getElementById("zubereitungInput").value=r.zubereitung||"";document.getElementById("utensilienInput").value=(r.utensilien||[]).join(", ");document.getElementById("notizenInput").value=r.notizen||"";document.getElementById("tagsInput").value=(r.tags||[]).join(", ");zutatenGruppenInsFormularLaden(r.zutatenGruppen||[{name:"Zutaten",zutaten:r.zutaten||[]}])}
function zutatenGruppeHinzufuegen(name="Zutaten",zutaten=[]){const box=document.createElement("div");box.className="zutatengruppe";box.innerHTML=`<div class="zutatengruppe-kopf"><input class="zutaten-gruppenname" placeholder="Gruppe, z. B. Teig, Fülle, Glasur" value="${esc(name)}"><button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button></div><div class="zutaten-zeilen"></div><button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>`;document.getElementById("zutatenGruppen").appendChild(box);const z=box.querySelector(".zutaten-zeilen");(zutaten.length?zutaten:[{}]).forEach(x=>{const d=zutatAnalysieren(x);zutatenZeileHinzufuegen(z,d.originalMenge||"",d.originalEinheit||d.einheit||"",d.name||"")})}
function zutatenZeileHinzufuegen(bereich,menge="",einheit="",name=""){bereich=bereich||document.querySelector(".zutaten-zeilen");const div=document.createElement("div");div.className="zutaten-zeile";div.innerHTML=`<input class="zutat-menge" placeholder="Menge" value="${esc(menge)}"><select class="zutat-einheit">${EINHEITEN.map(e=>`<option value="${e}" ${norm(e)===norm(einheit)?"selected":""}>${e||"Einheit"}</option>`).join("")}</select><input class="zutat-name" placeholder="Zutat" value="${esc(name)}"><button type="button" onclick="this.parentElement.remove()">X</button>`;bereich.appendChild(div)}
function zutatenGruppenAusFormularLesen(){return[...document.querySelectorAll(".zutatengruppe")].map(g=>({name:g.querySelector(".zutaten-gruppenname").value.trim()||"Zutaten",zutaten:[...g.querySelectorAll(".zutaten-zeile")].map(z=>({menge:z.querySelector(".zutat-menge").value.trim(),einheit:z.querySelector(".zutat-einheit").value.trim(),name:textTitel(z.querySelector(".zutat-name").value.trim())})).filter(z=>z.name)})).filter(g=>g.zutaten.length)}
function zutatenGruppenInsFormularLaden(gruppen){document.getElementById("zutatenGruppen").innerHTML="";(gruppen.length?gruppen:[{name:"Zutaten",zutaten:[]}]).forEach(g=>zutatenGruppeHinzufuegen(g.name,g.zutaten||[]))}
function kategorienAufAlleSetzen(){document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel").forEach(k=>k.classList.remove("aktiv"));document.querySelector("#suchKategorieKacheln .kategorie-kachel[data-kategorie='']")?.classList.add("aktiv")}
function kategorieKachelUmschalten(btn){if(btn.dataset.kategorie===""){kategorienAufAlleSetzen()}else{document.querySelector("#suchKategorieKacheln .kategorie-kachel[data-kategorie='']")?.classList.remove("aktiv");btn.classList.toggle("aktiv");if(!document.querySelector("#suchKategorieKacheln .kategorie-kachel.aktiv:not([data-kategorie=''])"))kategorienAufAlleSetzen()}filterAnwenden()}
function aktiveKategorien(){return[...document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv")].map(x=>x.dataset.kategorie).filter(Boolean)}
function sucheRezepte(){const eing=v("zutatenInput").toLowerCase().split(",").map(x=>x.trim()).filter(Boolean);if(!eing.length){meldungAnzeigen("Bitte mindestens eine Zutat eingeben.",true);return}let erg=rezepte.map((r,i)=>{const zut=zutatenAusRezept(r);const vorhandene=zut.filter(z=>eing.some(e=>zutatPasst(e,z)));const fehlende=zut.filter(z=>!eing.some(e=>zutatPasst(e,z)));return{...r,index:i,vorhandene,fehlende}}).filter(r=>r.vorhandene.length>0);erg=filterBasis(erg);if(!erg.length){document.getElementById("ergebnisse").innerHTML=`<section class="box"><h2>Keine Treffer</h2><p>Kein Rezept enthält diese Zutat.</p></section>`;return}erg.sort((a,b)=>b.vorhandene.length-a.vorhandene.length);letzteSuchErgebnisse=erg;zeigeErgebnisse(erg)}
function filterAnwenden(){let erg=rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]}));erg=sortieren(filterBasis(erg));letzteSuchErgebnisse=erg;zeigeErgebnisse(erg)}
function filterBasis(liste){const name=norm(v("nameSucheInput")),kat=aktiveKategorien(),bew=v("bewertungFilter"),tag=norm(v("tagSucheInput"));return liste.filter(r=>(!name||norm(r.name).includes(name))&&(!kat.length||kat.includes(r.kategorie))&&(!bew||(r.bewertung||0)>=Number(bew))&&(!tag||(r.tags||[]).some(t=>norm(t).includes(tag))))}
function sortieren(l){const s=v("sortierungInput");return l.sort((a,b)=>s==="kategorie"?(a.kategorie.localeCompare(b.kategorie)||a.name.localeCompare(b.name)):s==="bewertung"?((b.bewertung||0)-(a.bewertung||0)||a.name.localeCompare(b.name)):s==="favorit"?(Number(b.favorit)-Number(a.favorit)||a.name.localeCompare(b.name)):a.name.localeCompare(b.name))}
function nurFavoritenAnzeigen(){zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})).filter(r=>r.favorit))}
function sucheZuruecksetzen(){["nameSucheInput","zutatenInput","tagSucheInput"].forEach(id=>document.getElementById(id).value="");document.getElementById("bewertungFilter").value="";kategorienAufAlleSetzen();document.getElementById("ergebnisse").innerHTML="";letzteSuchErgebnisse=[]}

function utensilienHtml(rezept) {
  const utensilien = rezept.utensilien || [];

  if (utensilien.length === 0) {
    return "<li>keine</li>";
  }

  return utensilien.map(utensil => `<li>${utensil}</li>`).join("");
}

function zeigeErgebnisse(liste,offenId=null){const b=document.getElementById("ergebnisse");b.innerHTML="";if(!rezepte.length){b.innerHTML="<p>Noch keine Rezepte gespeichert.</p>";return}if(!liste.length){b.innerHTML="<p>Keine Rezepte gefunden.</p>";return}liste.forEach(r=>{const d=document.createElement("div");d.className="rezept"+(offenId===r.id?" offen":"");d.innerHTML=`<div class="rezept-kopf" onclick="rezeptAufklappen(this)"><h2>${r.favorit?"❤️":"🤍"} ${esc(r.name)}</h2><div class="kategorie-label">${esc(r.kategorie)}</div></div><div class="rezept-details"><p><strong>Portionen:</strong> ${r.portionen||"nicht angegeben"}</p><p><strong>Schwierigkeit:</strong> ${r.schwierigkeit||"nicht angegeben"}</p><p><strong>Zubereitungszeit:</strong> ${r.zubereitungszeit||"nicht angegeben"}</p><p><strong>Quelle:</strong> ${r.quelle||"nicht angegeben"}</p>
<h3>Zutaten</h3>${zutatenGruppenHtml(r)}<p class="vorhanden"><strong>Vorhanden:</strong> ${(r.vorhandene||[]).map(zutatAlsText).join(", ")||"nicht geprüft"}</p><p class="fehlend"><strong>Fehlt:</strong> ${(r.fehlende||[]).map(zutatAlsText).join(", ")||"nicht geprüft"}</p><h3>Zubereitung</h3><ol>${zubereitungsSchritte(r.zubereitung).map(s=>`<li>${esc(s)}</li>`).join("")}</ol><p><strong>Notizen:</strong> ${r.notizen||"keine"}</p><p><strong>Tags:</strong> ${(r.tags||[]).join(", ")||"keine"}</p><button onclick="rezeptBearbeiten(${r.index})">Bearbeiten</button><button onclick="rezeptDuplizieren(${r.index})">Duplizieren</button><button onclick="rezeptLoeschen(${r.index})">Löschen</button><button onclick="rezeptDrucken(${r.index})">Drucken / PDF</button><button onclick="favoritUmschalten(${r.index})">${r.favorit?"Favorit entfernen":"Als Favorit speichern"}</button><div class="bewertung"><strong>Bewertung:</strong> ${sterneAnzeigen(r.index,r.bewertung||0)}</div><div class="zutat-ersetzen-box"><h4>Zur Einkaufsliste hinzufügen</h4><button onclick="rezeptZurEinkaufsliste(${r.index},'alle')">Alle Zutaten hinzufügen</button><details><summary>Einzelne Zutaten auswählen</summary>${einkaufsAuswahlHtml(r)}<button onclick="rezeptZurEinkaufsliste(${r.index},'auswahl')">Ausgewählte Zutaten hinzufügen</button></details></div><p><strong>Portionenrechner</strong></p><input type="number" min="1" id="zielPortionen-${r.index}" placeholder="Gewünschte Portionen"><button onclick="portionenBerechnen(${r.index})">Portionen berechnen</button><div id="portionenErgebnis-${r.index}"></div><button onclick="kochmodusStarten(${r.index})">Kochmodus starten</button><div id="kochmodus-${r.index}" class="kochmodus"></div></div>`;b.appendChild(d)})}
function rezeptAufklappen(e){e.parentElement.classList.toggle("offen")}function zutatenGruppenHtml(r){return(r.zutatenGruppen||[{name:"Zutaten",zutaten:r.zutaten||[]}]).map(g=>`<div class="zutaten-gruppe-anzeige"><h4>${esc(g.name||"Zutaten")}</h4><ul>${(g.zutaten||[]).map(z=>`<li>${esc(zutatAlsText(z))}</li>`).join("")}</ul></div>`).join("")}
function einkaufsAuswahlHtml(r){return(r.zutatenGruppen||[]).map((g,gi)=>`<div><strong>${esc(g.name)}</strong>${(g.zutaten||[]).map((z,zi)=>`<label><input type="checkbox" class="einkauf-zutat-${r.index}" data-gruppe="${gi}" data-zutat="${zi}"> ${esc(zutatAlsText(z))}</label><br>`).join("")}</div>`).join("")}
function dashboardAktualisieren(){document.getElementById("anzahlRezepte").textContent=rezepte.length;document.getElementById("anzahlFavoriten").textContent=rezepte.filter(r=>r.favorit).length;document.getElementById("anzahlKategorien").textContent=new Set(rezepte.map(r=>r.kategorie)).size;const bew=rezepte.map(r=>r.bewertung||0).filter(Boolean);document.getElementById("durchschnittBewertung").textContent=(bew.length?bew.reduce((a,b)=>a+b,0)/bew.length:0).toFixed(1);document.getElementById("letztesRezept").textContent=rezepte.length?`Zuletzt hinzugefügt: ${rezepte.at(-1).name}`:"Noch keine Rezepte gespeichert.";backupHinweisAktualisieren()}
function meldungAnzeigen(t,fehler=false){const m=document.getElementById("meldung");m.textContent=t;m.className=fehler?"meldung fehler":"meldung";m.style.display="block";setTimeout(()=>m.style.display="none",4000)}
function rezeptLoeschen(i){if(!confirm("Möchtest du dieses Rezept wirklich löschen?"))return;zuletztGeloeschtesRezept=rezepte[i];zuletztGeloeschterIndex=i;rezepte.splice(i,1);speichern();dashboardAktualisieren();document.getElementById("ergebnisse").innerHTML="";zeigeRueckgaengigButton()}function zeigeRueckgaengigButton(){let b=document.getElementById("undoButton");if(!b){b=document.createElement("button");b.id="undoButton";b.textContent="Löschen rückgängig machen";b.onclick=rezeptWiederherstellen;document.body.appendChild(b)}b.style.display="block";clearTimeout(b.timeout);b.timeout=setTimeout(()=>b.style.display="none",10000)}function rezeptWiederherstellen(){if(!zuletztGeloeschtesRezept)return;rezepte.splice(zuletztGeloeschterIndex,0,zuletztGeloeschtesRezept);zuletztGeloeschtesRezept=null;zuletztGeloeschterIndex=null;document.getElementById("undoButton").style.display="none";speichern();dashboardAktualisieren()}
function rezeptDuplizieren(i){const k=JSON.parse(JSON.stringify(rezepte[i]));k.id=crypto.randomUUID();k.name+=" Kopie";rezepte.push(k);speichern();dashboardAktualisieren();zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})),k.id)}function favoritUmschalten(i){const id=rezepte[i].id;rezepte[i].favorit=!rezepte[i].favorit;speichern();dashboardAktualisieren();zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})),id)}function sterneAnzeigen(i,b){let s="";for(let x=1;x<=5;x++)s+=`<button class="stern-button" onclick="bewertungSetzen(${i},${x})">${x<=b?"★":"☆"}</button>`;return s}function bewertungSetzen(i,w){const id=rezepte[i].id;rezepte[i].bewertung=w;speichern();dashboardAktualisieren();zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})),id)}
function rezeptZurEinkaufsliste(i,modus){const r=rezepte[i];let zut=[];if(modus==="alle")zut=zutatenAusRezept(r);else{document.querySelectorAll(`.einkauf-zutat-${i}:checked`).forEach(cb=>zut.push(r.zutatenGruppen[+cb.dataset.gruppe].zutaten[+cb.dataset.zutat]));if(!zut.length){meldungAnzeigen("Bitte mindestens eine Zutat auswählen.",true);return}}datenSpeichern("einkaufsliste",[...datenLaden("einkaufsliste",[]),...zut]);bereichAnzeigen("einkaufBereich");einkaufslisteErstellen()}
function einkaufslisteErstellen(){const ul=document.getElementById("einkaufsliste"),list=datenLaden("einkaufsliste",[]);ul.innerHTML="";if(!list.length){ul.innerHTML="<li>Die Einkaufsliste wurde gelöscht oder ist leer.</li>";return}const ab=datenLaden("abgehakteEinkaufsliste",[]);einkaufZusammenfassen(list).forEach(it=>{const text=it.menge?`${mengeMitSchoenerEinheit(it.menge,it.basisEinheit)} ${it.name}`:it.original.join(", ");const li=document.createElement("li");li.innerHTML=`<label><input type="checkbox" onchange="einkaufsItemAbhaken(this)"> <span>${esc(text)}</span></label>`;if(ab.includes(text)){li.querySelector("input").checked=true;li.querySelector("span").classList.add("abgehakt")}ul.appendChild(li)})}
function einkaufZusammenfassen(zutaten){const o={};zutaten.forEach(z=>{const d=zutatAnalysieren(z),key=norm(d.name)+"|"+d.basisEinheit;if(!o[key])o[key]={name:d.name,basisEinheit:d.basisEinheit,menge:0,original:[]};if(d.menge)o[key].menge+=d.menge;else o[key].original.push(zutatAlsText(z))});return Object.values(o).sort((a,b)=>a.name.localeCompare(b.name))}function einkaufsItemAbhaken(cb){const s=cb.nextElementSibling,w=s.textContent;let a=datenLaden("abgehakteEinkaufsliste",[]);if(cb.checked){s.classList.add("abgehakt");if(!a.includes(w))a.push(w)}else{s.classList.remove("abgehakt");a=a.filter(x=>x!==w)}datenSpeichern("abgehakteEinkaufsliste",a)}function einkaufslisteZuruecksetzen(){datenSpeichern("einkaufsliste",[]);datenSpeichern("abgehakteEinkaufsliste",[]);document.getElementById("einkaufsliste").innerHTML="<li>Die Einkaufsliste wurde gelöscht.</li>"}
function einkaufslisteDrucken(){const list=einkaufZusammenfassen(datenLaden("einkaufsliste",[]));const f=window.open("","_blank");f.document.write(`<!doctype html><html><head><meta charset="UTF-8"><title>Einkaufsliste</title><style>body{font-family:Arial;padding:30px}li{margin-bottom:8px}</style></head><body><h1>Einkaufsliste</h1><ul>${list.map(it=>`<li>${it.menge?`${mengeMitSchoenerEinheit(it.menge,it.basisEinheit)} ${it.name}`:it.original.join(", ")}</li>`).join("")}</ul><script>window.print()<\/script></body></html>`);f.document.close()}
function portionenBerechnen(i){const r=rezepte[i],ziel=Number(v(`zielPortionen-${i}`)),out=document.getElementById(`portionenErgebnis-${i}`);out.innerHTML="";if(!ziel||!r.portionen){meldungAnzeigen("Bitte Portionen prüfen.",true);return}const f=ziel/r.portionen;(r.zutatenGruppen||[]).forEach(g=>{const div=document.createElement("div");div.className="zutaten-gruppe-anzeige";div.innerHTML=`<h4>${esc(g.name)}</h4><ul>${(g.zutaten||[]).map(z=>`<li>${zutatUmrechnen(z,f)}</li>`).join("")}</ul>`;out.appendChild(div)})}function zutatUmrechnen(z,f){const d=zutatAnalysieren(z);if(!d.menge||!d.einheit)return`⚠️ ${esc(zutatAlsText(z))} konnte nicht berechnet werden`;return`${mengeMitSchoenerEinheit(d.menge*f,d.basisEinheit)} ${d.name}`}
function kochmodusStarten(i){const r=rezepte[i],box=document.getElementById(`kochmodus-${i}`),sch=zubereitungsSchritte(r.zubereitung);box.innerHTML=`<h3>Kochmodus</h3><button onclick="kochmodusZuruecksetzen(${i})">Kochmodus zurücksetzen</button><h4>Besondere Utensilien / Utensilien</h4><p>${(r.utensilien||[]).join(", ")||"keine"}</p><h4>Zutaten</h4>${zutatenGruppenHtml(r)}<h4>Schritte</h4><div id="kochschritte-${i}"></div>`;const ziel=box.querySelector(`#kochschritte-${i}`),fort=datenLaden(`kochfortschritt-${r.id}`,[]);sch.forEach((s,si)=>{const zut=zutatenFuerSchrittFinden(zutatenAusRezept(r),s),ut=utensilienFuerSchrittFinden(r.utensilien||[],s),div=document.createElement("div");div.className="kochschritt";div.innerHTML=`<label><input type="checkbox" onchange="kochschrittAbhaken(this,${i},${si})"><span><strong>Schritt ${si+1}:</strong> ${esc(s)}</span></label>${timerHtmlErstellen(s,i,si)}${zut.length?`<p><strong>Benötigte Zutaten:</strong> ${zut.map(z=>z.text).join(", ")}</p>`:""}${ut.length?`<p><strong>Benötigte Utensilien:</strong> ${ut.join(", ")}</p>`:""}`;ziel.appendChild(div);if(fort.includes(si)){div.querySelector("input").checked=true;div.querySelector("span").classList.add("abgehakt")}})}function kochschrittAbhaken(cb,i,si){const r=rezepte[i],key=`kochfortschritt-${r.id}`;let f=datenLaden(key,[]);cb.nextElementSibling.classList.toggle("abgehakt",cb.checked);if(cb.checked&&!f.includes(si))f.push(si);if(!cb.checked)f=f.filter(x=>x!==si);datenSpeichern(key,f)}function kochmodusZuruecksetzen(i){localStorage.removeItem(`kochfortschritt-${rezepte[i].id}`);kochmodusStarten(i)}function zutatenFuerSchrittFinden(zutaten,schritt){const sn=norm(schritt);return zutaten.map((z,i)=>{const d=zutatAnalysieren(z),n=norm(d.name);return{index:i,text:zutatAlsText(z),such:[n,...zutatenSuchwoerter(n)]}}).filter(z=>z.such.some(w=>sn.includes(norm(w))))}function utensilienFuerSchrittFinden(ut,schritt){const sn=norm(schritt);return ut.filter(u=>sn.includes(norm(u)))}function zutatenSuchwoerter(n){const g=[["parmesan","kaese","käse"],["mozzarella","kaese","käse"],["spaghetti","nudeln","pasta"],["eier","ei"],["tomaten","tomate"],["kartoffeln","kartoffel"],["zwiebeln","zwiebel"]];let s=[n];g.forEach(a=>{if(a.map(norm).includes(norm(n)))s.push(...a)});return[...new Set(s)]}
function timerHtmlErstellen(s,i,si){const z=zeitAusTextFinden(s);if(!z)return"";return`<div class="timer-box"><input id="timer-wert-${i}-${si}" value="${z.original}"><button id="timer-start-${i}-${si}" onclick="timerManuellStarten(${i},${si})">Timer starten</button><button id="timer-stop-${i}-${si}" onclick="timerStoppen(${i},${si})" style="display:none">Stoppen</button><span id="timer-anzeige-${i}-${si}"></span><div id="timer-meldung-${i}-${si}" class="timer-meldung"></div></div>`}function timerManuellStarten(i,si){const sek=zeitZuSekunden(v(`timer-wert-${i}-${si}`).toLowerCase());if(!sek){meldungAnzeigen("Bitte gültige Zeit eingeben.",true);return}timerStartenMitZeit(i,si,sek)}function timerStartenMitZeit(i,si,sek){const id=`${i}-${si}`,a=document.getElementById(`timer-anzeige-${id}`),start=document.getElementById(`timer-start-${id}`),stop=document.getElementById(`timer-stop-${id}`),m=document.getElementById(`timer-meldung-${id}`);if(timerListe[id])clearInterval(timerListe[id]);start.disabled=true;stop.style.display="inline-block";m.textContent="";timerListe[id]=setInterval(()=>{const min=Math.floor(sek/60),s=sek%60;a.textContent=`${min.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;if(sek<=0){clearInterval(timerListe[id]);start.disabled=false;stop.style.display="none";m.textContent="⏰ Timer fertig!";m.classList.add("timer-fertig");timerTonAbspielen();return}sek--},1000)}function timerStoppen(i,si){const id=`${i}-${si}`;if(timerListe[id])clearInterval(timerListe[id]);document.getElementById(`timer-anzeige-${id}`).textContent="Timer gestoppt.";document.getElementById(`timer-start-${id}`).disabled=false;document.getElementById(`timer-stop-${id}`).style.display="none"}function timerTonAbspielen(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.2;o.start();setTimeout(()=>{o.stop();c.close()},800)}catch{}}
function rezepteExportieren(){const blob=new Blob([JSON.stringify({app:"rezeptfinder",version: 1.60432,exportDatum:new Date().toISOString(),rezepte},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`rezepte-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();localStorage.setItem("letztesBackupDatum",new Date().toISOString());dashboardAktualisieren()}function rezepteImportieren(){const file=document.getElementById("importDatei").files[0];if(!file){meldungAnzeigen("Bitte Datei auswählen.",true);return}const r=new FileReader();r.onload=e=>{try{const d=JSON.parse(e.target.result);if(!d.rezepte)throw 0;rezepte=d.rezepte;datenstrukturReparieren();dashboardAktualisieren();meldungAnzeigen("Import abgeschlossen.")}catch{meldungAnzeigen("Ungültige Backup-Datei.",true)}};r.readAsText(file)}function backupHinweisAktualisieren(){const e=document.getElementById("backupHinweis"),d=localStorage.getItem("letztesBackupDatum");if(!d){e.textContent="Noch kein Backup erstellt.";return}const tage=Math.floor((new Date()-new Date(d))/(864e5));e.textContent=tage>=7?`Letztes Backup vor ${tage} Tagen. Bitte wieder exportieren.`:`Letztes Backup vor ${tage} Tagen.`}function alleDatenLoeschen(){if(!confirm("Wirklich alle Daten löschen?"))return;rezepte=[];speichern();datenSpeichern("einkaufsliste",[]);dashboardAktualisieren();
rezeptDesTagesAufStartseite();document.getElementById("ergebnisse").innerHTML=""}
function rezeptDrucken(i){const r=rezepte[i],f=window.open("","_blank");f.document.write(`<!doctype html><html><head><meta charset="UTF-8"><title>${r.name}</title><style>body{font-family:Arial;padding:40px;line-height:1.6}.rezeptkarte{max-width:800px;margin:auto}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.info-box{border:1px solid #ddd;padding:10px;border-radius:8px;background:#f8f8f8}h2{border-bottom:2px solid #ddd;padding-bottom:5px}li{margin-bottom:8px}</style></head><body><div class="rezeptkarte"><h1>${r.name}</h1><p>${r.kategorie}</p><div class="info-grid"><div class="info-box"><b>Portionen:</b><br>${r.portionen||"nicht angegeben"}</div><div class="info-box"><b>Schwierigkeit:</b><br>${r.schwierigkeit||"nicht angegeben"}</div><div class="info-box"><b>Zeit:</b><br>${r.zubereitungszeit||"nicht angegeben"}</div><div class="info-box"><b>Quelle:</b><br>${r.quelle||"nicht angegeben"}</div></div><h2>Utensilien</h2><p>${(r.utensilien||[]).join(", ")||"keine"}</p><h2>Zutaten</h2>${zutatenGruppenHtml(r)}<h2>Zubereitung</h2><ol>${zubereitungsSchritte(r.zubereitung).map(s=>`<li>${s}</li>`).join("")}</ol>${r.notizen?`<h2>Notizen</h2><p>${r.notizen}</p>`:""}</div><script>window.print()<\/script></body></html>`);f.document.close()}
function rezeptTextAnalysieren(){const d=rezeptTextParsen(v("textImportInput"));bereichAnzeigen("formularBereich");document.getElementById("nameInput").value=d.name;document.getElementById("kategorieInput").value=d.kategorie;document.getElementById("portionenInput").value=d.portionen;document.getElementById("schwierigkeitInput").value=d.schwierigkeit;document.getElementById("zubereitungszeitInput").value=d.zubereitungszeit;document.getElementById("quelleInput").value=d.quelle;document.getElementById("utensilienInput").value=d.utensilien.join(", ");document.getElementById("zubereitungInput").value=d.zubereitung.join(". ");document.getElementById("notizenInput").value=d.notizen;document.getElementById("tagsInput").value=d.tags.join(", ");zutatenGruppenInsFormularLaden(d.zutatenGruppen)}function rezeptTextParsen(text){const zeilen=text.split("\n").map(x=>x.trim()).filter(Boolean),d={name:"",kategorie:"Nicht zugeordnet",portionen:"",schwierigkeit:"",zubereitungszeit:"",quelle:"",utensilien:[],tags:[],zutatenGruppen:[],zubereitung:[],notizen:""};let bereich="",gruppe=null;zeilen.forEach(z=>{const k=z.toLowerCase();if(k.startsWith("name:")){d.name=wert(z);return}if(k.startsWith("kategorie:")){d.kategorie=wert(z);return}if(k.startsWith("portionen:")){d.portionen=wert(z);return}if(k.startsWith("schwierigkeit:")){d.schwierigkeit=wert(z);return}if(k.startsWith("zubereitungszeit:")){d.zubereitungszeit=wert(z);return}if(k.startsWith("quelle:")){d.quelle=wert(z);return}if(k.startsWith("utensilien:")){d.utensilien=wert(z).split(",").map(x=>textTitel(x.trim())).filter(Boolean);return}if(k.startsWith("tags:")){d.tags=wert(z).split(",").map(x=>x.trim()).filter(Boolean);return}if(k==="zutaten:"){bereich="zutaten";return}if(k==="zubereitung:"){bereich="zubereitung";return}if(k==="notizen:"){bereich="notizen";return}if(bereich==="zutaten"){if(z.endsWith(":")){gruppe={name:z.slice(0,-1),zutaten:[]};d.zutatenGruppen.push(gruppe);return}if(!gruppe){gruppe={name:"Zutaten",zutaten:[]};d.zutatenGruppen.push(gruppe)}gruppe.zutaten.push(zutatNormalisieren(z))}if(bereich==="zubereitung")d.zubereitung.push(z.replace(/\.$/,""));if(bereich==="notizen")d.notizen+=(d.notizen?"\n":"")+z});if(!d.name&&zeilen[0])d.name=zeilen[0];if(!d.zutatenGruppen.length)d.zutatenGruppen=[{name:"Zutaten",zutaten:[]}];return d}function wert(z){return z.split(":").slice(1).join(":").trim()}
function datenpruefungToggle(){if(datenpruefungOffen){document.getElementById("datenpruefungBereich").classList.add("versteckt");datenpruefungOffen=false;return}datenqualitaetPruefen();datenpruefungOffen=true}function datenqualitaetPruefen(){alleHauptbereicheVerstecken();document.getElementById("datenpruefungBereich").classList.remove("versteckt");const ign=datenLaden("ignorierteProbleme",{}),probleme=[];rezepte.forEach((r,i)=>{let p=[];if(!r.name)p.push("Name fehlt");if(!r.kategorie||r.kategorie==="Nicht zugeordnet")p.push("Kategorie nicht zugeordnet");if(!r.portionen)p.push("Grundportionen fehlen");if(!r.zubereitung)p.push("Zubereitung fehlt");if(!r.schwierigkeit)p.push("Schwierigkeit fehlt");if(!(r.tags||[]).length)p.push("Tags fehlen");if(!r.bewertung)p.push("Bewertung fehlt");zutatenAusRezept(r).forEach(z=>{const d=zutatAnalysieren(z);if(!d.menge)p.push(`Menge fehlt bei ${d.name||"Zutat"}`);if(!d.einheit)p.push(`Einheit fehlt bei ${d.name||"Zutat"}`)});const dop=doppelteZutatenFinden(zutatenAusRezept(r));if(dop.length)p.push(`Doppelte Zutaten: ${dop.join(", ")}`);p=p.filter(x=>!(ign[r.id]||[]).includes(x));if(p.length)probleme.push({index:i,id:r.id,name:r.name,probleme:p,hatDoppelteZutaten:dop.length>0})});zeigeDatenqualitaet(probleme)}function zeigeDatenqualitaet(probleme){const b=document.getElementById("datenpruefungInhalt");b.innerHTML=probleme.length?`<p>${probleme.length} Rezept(e) mit möglichen Problemen gefunden.</p>`:"<p>Alles sieht gut aus.</p>";probleme.forEach(e=>{const div=document.createElement("div");div.className="rezept";div.innerHTML=`<div class="rezept-kopf"><h3>${e.name}</h3></div><div class="rezept-details" style="display:block"><ul>${e.probleme.map(p=>`<li>${p} <button onclick='problemIgnorieren(${JSON.stringify(e.id)},${JSON.stringify(p)})'>ignorieren</button></li>`).join("")}</ul><button onclick="alleProblemeIgnorieren('${e.id}',${e.index})">Alle Punkte ignorieren</button><button onclick="rezeptBearbeiten(${e.index})">Rezept bearbeiten</button>${e.hatDoppelteZutaten?`<button onclick="doppelteZutatenZusammenfuehren(${e.index})">Doppelte Zutaten zusammenführen</button>`:""}</div>`;b.appendChild(div)})}function problemIgnorieren(id,p){let ign=datenLaden("ignorierteProbleme",{});ign[id]=[...new Set([...(ign[id]||[]),p])];datenSpeichern("ignorierteProbleme",ign);datenqualitaetPruefen()}function alleProblemeIgnorieren(id,i){let ign=datenLaden("ignorierteProbleme",{});const all=[];document.querySelectorAll("#datenpruefungInhalt li").forEach(li=>all.push(li.childNodes[0].textContent.trim()));ign[id]=[...new Set([...(ign[id]||[]),...all])];datenSpeichern("ignorierteProbleme",ign);datenqualitaetPruefen()}function doppelteZutatenFinden(zut){const n=zut.map(z=>norm(zutatAnalysieren(z).name));return[...new Set(n.filter((x,i)=>x&&n.indexOf(x)!==i))]}function doppelteZutatenZusammenfuehren(i){const r=rezepte[i];(r.zutatenGruppen||[]).forEach(g=>{const map={};(g.zutaten||[]).forEach(z=>{const d=zutatAnalysieren(z),key=norm(d.name)+"|"+d.basisEinheit;if(!map[key])map[key]={menge:0,einheit:d.basisEinheit||d.einheit,name:d.name,original:null};if(d.menge)map[key].menge+=d.menge;else map[key].original=z});g.zutaten=Object.values(map).map(x=>x.menge?{menge:zahlFormatieren(x.menge),einheit:x.einheit,name:x.name}:x.original)});r.zutaten=zutatenAusRezept(r);speichern();meldungAnzeigen("Doppelte Zutaten zusammengeführt.");datenqualitaetPruefen()}
function schnellfilterFavoriten(){zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})).filter(r=>r.favorit))}function schnellfilterFuenfSterne(){zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})).filter(r=>r.bewertung===5))}function schnellfilterSchnell(){zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})).filter(r=>{const z=zeitAusTextFinden(r.zubereitungszeit||"");return z&&z.sekunden<=1800}))}function schnellfilterOhneSpezialgeraete(){zeigeErgebnisse(rezepte.map((r,i)=>({...r,index:i,vorhandene:[],fehlende:[]})).filter(r=>!(r.utensilien||[]).length))}function rezeptDesTages(){if(!rezepte.length)return meldungAnzeigen("Noch keine Rezepte vorhanden.",true);const i=Math.floor(Math.random()*rezepte.length);zeigeErgebnisse([{...rezepte[i],index:i,vorhandene:[],fehlende:[]}],rezepte[i].id)}
function zutatenAusGruppen(g){return(g||[]).flatMap(x=>x.zutaten||[])}function zutatenAusRezept(r){return zutatenAusGruppen(r.zutatenGruppen||[{name:"Zutaten",zutaten:r.zutaten||[]}])}function zutatNormalisieren(z){const d=zutatAnalysieren(z);return{menge:d.originalMenge||"",einheit:d.originalEinheit||d.einheit||"",name:textTitel(d.name||"")}}function zubereitungsSchritte(t){return String(t||"").split(".").map(x=>x.trim()).filter(Boolean)}function zutatAlsText(z){return typeof z==="string"?z:`${z.menge||""} ${z.einheit||""} ${z.name||""}`.replace(/\s+/g," ").trim()}function zutatAnalysieren(z){if(typeof z==="object"){const e=einheitNormalisieren(z.einheit||"");return{originalMenge:z.menge||"",originalEinheit:z.einheit||"",menge:z.menge?bruchZuZahl(String(z.menge))*e.faktor:0,einheit:e.anzeige,basisEinheit:e.basis,name:z.name||""}}const m=String(z).match(/^((?:\d+\s+)?\d+\/\d+|\d+(?:[.]\d+)?)\s*([a-zA-ZäöüÄÖÜß.]*)\s+(.+)$/);if(!m)return{originalMenge:"",originalEinheit:"",menge:0,einheit:"",basisEinheit:"",name:String(z).trim()};const e=einheitNormalisieren(m[2]);return{originalMenge:m[1],originalEinheit:e.anzeige,menge:bruchZuZahl(m[1])*e.faktor,einheit:e.anzeige,basisEinheit:e.basis,name:textTitel(m[3].trim())}}function einheitNormalisieren(e){const n=norm(e),map={mg:["g",.001,"mg"],g:["g",1,"g"],gramm:["g",1,"g"],dag:["g",10,"dag"],kg:["g",1000,"kg"],ml:["ml",1,"ml"],cl:["ml",10,"cl"],dl:["ml",100,"dl"],l:["ml",1000,"l"],tl:["TL",1,"TL"],el:["EL",1,"EL"],stk:["Stk.",1,"Stk."],stueck:["Stk.",1,"Stk."],prise:["Prise",1,"Prise"],priese:["Prise",1,"Prise"],becher:["Becher",1,"Becher"],tasse:["Tasse",1,"Tasse"],paeckchen:["Päckchen",1,"Päckchen"],päckchen:["Päckchen",1,"Päckchen"],dose:["Dose",1,"Dose"],glas:["Glas",1,"Glas"],bund:["Bund",1,"Bund"],zweig:["Zweig",1,"Zweig"],blatt:["Blatt",1,"Blatt"],scheibe:["Scheibe",1,"Scheibe"],wuerfel:["Würfel",1,"Würfel"],würfel:["Würfel",1,"Würfel"],messerspitze:["Messerspitze",1,"Messerspitze"],spritzer:["Spritzer",1,"Spritzer"],handvoll:["Handvoll",1,"Handvoll"]};const v=map[n];return v?{basis:v[0],faktor:v[1],anzeige:v[2]}:{basis:e||"",faktor:1,anzeige:e||""}}function mengeMitSchoenerEinheit(m,e){if(e==="g"&&m>=1000)return`${zahlFormatieren(m/1000)} kg`;if(e==="ml"&&m>=1000)return`${zahlFormatieren(m/1000)} l`;return`${zahlFormatieren(m)} ${e}`}function bruchZuZahl(t){t=String(t).replace(",",".").trim();if(t.includes(" ")){const a=t.split(" ");return Number(a[0])+bruchZuZahl(a[1])}if(t.includes("/")){const a=t.split("/");return Number(a[0])/Number(a[1])}return Number(t)}function zahlFormatieren(n){return Number.isInteger(n)?String(n):Number(n).toFixed(2).replace(".",",")}function norm(t){return String(t||"").toLowerCase().trim().replaceAll("ä","ae").replaceAll("ö","oe").replaceAll("ü","ue").replaceAll("ß","ss").replaceAll(".","")}function textTitel(t){t=String(t||"").trim();return t?t.charAt(0).toUpperCase()+t.slice(1):""}function zutatPasst(s,z){const sn=norm(s),d=zutatAnalysieren(z),nn=norm(d.name);return nn.includes(sn)||sn.includes(nn)||zutatenSuchwoerter(nn).some(w=>norm(w).includes(sn))}function zutatenPruefen(z){const w=[];z.forEach(x=>{if(!x.menge)w.push(`"${x.name}" hat keine Mengenangabe.`);if(!x.einheit)w.push(`"${x.name}" hat keine Einheit.`)});return w}function zeitAusTextFinden(t){const m=String(t).toLowerCase().match(/(\d+(?:[.]\d+)?)\s*(h|min|sec|s)\b/);return m?{sekunden:zeitZuSekunden(m[0]),original:m[0]}:null}function zeitZuSekunden(t){const m=String(t).match(/^(\d+(?:[.]\d+)?)\s*(h|min|sec|s)$/);if(!m)return null;const v=Number(m[1].replace(",","."));return m[2]==="h"?v*3600:m[2]==="min"?v*60:v}function v(id){return document.getElementById(id)?.value.trim()||""}function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
// init() deaktiviert: Start erfolgt über safeInitV114()
// ===== TOGGLE FIX 1.8.5 =====

function rezeptHinzufuegenToggle() {
  const bereich = document.getElementById("formularBereich");
  const offen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";

  if (offen) return;

  formularLeeren();
  bereich.classList.remove("versteckt");
}

function alleRezepteToggle() {
  const bereich = document.getElementById("sucheBereich");
  const offen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";

  if (offen) return;

  bereich.classList.remove("versteckt");

  const ergebnisse = rezepte.map((rezept, index) => ({
    ...rezept,
    index,
    vorhandene: [],
    fehlende: []
  }));

  zeigeErgebnisse(ergebnisse);
}



// ===============================
// FIX 1.8.7: Hauptbuttons, Zufallsmenü, Rezept-Assistent
// ===============================

function alleHauptbereicheVerstecken() {
  ["sucheBereich", "rezeptSucheBereich", "formularBereich", "backupBereich", "einkaufBereich", "textImportBereich", "datenpruefungBereich"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add("versteckt");
  });
}

function zurUebersicht() {
  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function einfachenBereichToggle(id) {
  const bereich = document.getElementById(id);
  if (!bereich) {
    meldungAnzeigen("Dieser Bereich wurde nicht gefunden.", true);
    return;
  }

  const istOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;

  if (istOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  if (id === "einkaufBereich") {
    einkaufslisteErstellen();
  }

  window.scrollTo({
    top: bereich.offsetTop - 20,
    behavior: "smooth"
  });
}

function zufallsmenueToggle() {
  einfachenBereichToggle("menueBereich");
}

function rezeptAssistentToggle() {
  einfachenBereichToggle("textImportBereich");
}

function rezeptHinzufuegenToggle() {
  const bereich = document.getElementById("formularBereich");
  const istOffen = bereich && !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;

  if (istOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  formularLeeren();
  bereich.classList.remove("versteckt");
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

function alleRezepteToggle() {
  const bereich = document.getElementById("sucheBereich");
  const istOffen = bereich && !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;

  if (istOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");
  document.getElementById("sortierungInput").value = "name";
  kategorienAufAlleSetzen();

  const ergebnisse = rezepte
    .map((rezept, index) => ({
      ...rezept,
      index,
      vorhandene: [],
      fehlende: []
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  letzteSuchErgebnisse = ergebnisse;
  zeigeErgebnisse(ergebnisse);
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

function hauptbereichToggle(id, formularLeerenSoll = false, alleRezepteAnzeigenSoll = false, datenpruefungSoll = false) {


  if (id === "textImportBereich") {
    rezeptAssistentToggle();
    return;
  }

  if (id === "formularBereich") {
    rezeptHinzufuegenToggle();
    return;
  }

  if (id === "sucheBereich" && alleRezepteAnzeigenSoll) {
    alleRezepteToggle();
    return;
  }

  if (datenpruefungSoll) {
    const bereich = document.getElementById("datenpruefungBereich");
    const istOffen = bereich && !bereich.classList.contains("versteckt");

    alleHauptbereicheVerstecken();
    document.getElementById("ergebnisse").innerHTML = "";

    if (istOffen) {
      datenpruefungOffen = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    datenqualitaetPruefen();
    datenpruefungOffen = true;
    return;
  }

  einfachenBereichToggle(id);
}





















function rezeptDesTagesAufStartseite() {
  const box = document.getElementById("rezeptDesTagesBox");
  if (!box) return;

  if (!rezepte || rezepte.length === 0) {
    box.innerHTML = "<h3>Rezept des Tages</h3><p>Noch kein Rezept verfügbar.</p>";
    return;
  }

  const heute = new Date().toISOString().slice(0, 10);
  const index = Math.abs(
    heute.split("").reduce((summe, zeichen) => summe + zeichen.charCodeAt(0), 0)
  ) % rezepte.length;

  const rezept = rezepte[index];

  box.innerHTML = `
    <h3>Rezept des Tages</h3>
    <p><strong>${rezept.name}</strong></p>
    <p>${rezept.kategorie || "Keine Kategorie"}</p>
    <button onclick="zeigeRezeptDesTages(${index})">Rezept anzeigen</button>
  `;
}

function zeigeRezeptDesTages(index) {
  const rezept = {
    ...rezepte[index],
    index,
    vorhandene: [],
    fehlende: []
  };

  zeigeErgebnisse([rezept], rezept.id);
}



// ===============================
// VERSION 1.9 FIX: MENÜ & REZEPT-ASSISTENT
// ===============================




function alleHauptbereicheVerstecken() {
  ["sucheBereich", "rezeptSucheBereich", "formularBereich", "backupBereich", "einkaufBereich", "textImportBereich", "datenpruefungBereich"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add("versteckt");
  });
}

function einfacherBereichOeffnen(id) {
  const bereich = document.getElementById(id);

  if (!bereich) {
    meldungAnzeigen("Der Bereich wurde nicht gefunden.", true);
    return;
  }

  const warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();
  document.getElementById("ergebnisse").innerHTML = "";
  datenpruefungOffen = false;

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  if (id === "einkaufBereich") {
    einkaufslisteErstellen();
  }

  window.scrollTo({
    top: bereich.offsetTop - 20,
    behavior: "smooth"
  });
}




function rezeptAssistentToggle() {
  einfacherBereichOeffnen("textImportBereich");
}













function rezeptAssistentAnalysieren() {
  const text = document.getElementById("textImportInput").value.trim();
  const vorschau = document.getElementById("assistentVorschau");

  if (!text) {
    meldungAnzeigen("Bitte zuerst einen Rezepttext einfügen.", true);
    return;
  }

  assistentDaten = rezeptAssistentParsen(text);

  vorschau.innerHTML = `
    <h3>Vorschau</h3>

    <p><strong>Name:</strong> ${assistentDaten.name || "nicht erkannt"}</p>
    <p><strong>Kategorie:</strong> ${assistentDaten.kategorie}</p>
    <p><strong>Portionen:</strong> ${assistentDaten.portionen || "nicht erkannt"}</p>

    <h4>Zutaten</h4>
    ${assistentDaten.zutatenGruppen.map(gruppe => `
      <div>
        <strong>${gruppe.name}</strong>
        <ul>
          ${gruppe.zutaten.map(zutat => `<li>${zutatAlsText(zutat)}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h4>Utensilien</h4>
    <ul>
      ${
        assistentDaten.utensilien.length > 0
          ? assistentDaten.utensilien.map(u => `<li>${u}</li>`).join("")
          : "<li>keine erkannt</li>"
      }
    </ul>

    <h4>Zubereitung</h4>
    <ol>
      ${assistentDaten.zubereitung.map(schritt => `<li>${schritt}</li>`).join("")}
    </ol>

    <button onclick="assistentInsFormularUebernehmen()">Ins Formular übernehmen</button>
  `;
}

function rezeptAssistentParsen(text) {
  const zeilen = text
    .split("\n")
    .map(z => z.trim())
    .filter(z => z !== "");

  const daten = {
    name: "",
    kategorie: "Nicht zugeordnet",
    portionen: "",
    schwierigkeit: "",
    zubereitungszeit: "",
    quelle: "",
    utensilien: [],
    tags: [],
    zutatenGruppen: [],
    zubereitung: [],
    notizen: ""
  };

  const utensilienWoerter = [
    "Pfanne", "Topf", "Mixer", "Schneebesen", "Backform", "Springform",
    "Nudelmaschine", "Eismaschine", "Waffeleisen", "Airfryer", "Sieb",
    "Reibe", "Pürierstab", "Backblech", "Küchenmaschine", "Kochtopf",
    "Auflaufform", "Teigrolle", "Nudelholz"
  ];

  let bereich = "";
  let aktuelleGruppe = null;

  zeilen.forEach((zeile, index) => {
    const klein = zeile.toLowerCase();

    if (index === 0 && !zeile.includes(":")) {
      daten.name = zeile;
      return;
    }

    if (klein.startsWith("name:")) {
      daten.name = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("kategorie:")) {
      daten.kategorie = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("portionen:")) {
      daten.portionen = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("zubereitungszeit:")) {
      daten.zubereitungszeit = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("utensilien:")) {
      daten.utensilien = wertNachDoppelpunkt(zeile)
        .split(",")
        .map(u => textTitel(u.trim()))
        .filter(u => u !== "");
      return;
    }

    if (klein === "zutaten:") {
      bereich = "zutaten";
      return;
    }

    if (klein === "zubereitung:" || klein === "anleitung:") {
      bereich = "zubereitung";
      return;
    }

    if (klein === "notizen:") {
      bereich = "notizen";
      return;
    }

    if (bereich === "zutaten") {
      if (zeile.endsWith(":")) {
        aktuelleGruppe = {
          name: zeile.replace(":", ""),
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
        return;
      }

      if (!aktuelleGruppe) {
        aktuelleGruppe = {
          name: "Zutaten",
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
      }

      aktuelleGruppe.zutaten.push(zutatAusTextzeile(zeile));
      return;
    }

    if (bereich === "zubereitung") {
      daten.zubereitung.push(
        zeile
          .replace(/^\d+\.\s*/, "")
          .replace(/\.$/, "")
      );
      return;
    }

    if (bereich === "notizen") {
      daten.notizen += (daten.notizen ? "\n" : "") + zeile;
    }
  });

  if (daten.zutatenGruppen.length === 0) {
    daten.zutatenGruppen.push({
      name: "Zutaten",
      zutaten: []
    });
  }

  const gesamterText = textNormalisieren(text);
  const gefundeneUtensilien = utensilienWoerter.filter(utensil =>
    gesamterText.includes(textNormalisieren(utensil))
  );

  daten.utensilien = [...new Set([...daten.utensilien, ...gefundeneUtensilien])];

  return daten;
}

function assistentInsFormularUebernehmen() {
  if (!assistentDaten) {
    meldungAnzeigen("Bitte zuerst ein Rezept analysieren.", true);
    return;
  }

  einfacherBereichOeffnen("formularBereich");

  document.getElementById("nameInput").value = assistentDaten.name || "";
  document.getElementById("kategorieInput").value = assistentDaten.kategorie || "Nicht zugeordnet";
  document.getElementById("portionenInput").value = assistentDaten.portionen || "";
  document.getElementById("schwierigkeitInput").value = assistentDaten.schwierigkeit || "";
  document.getElementById("zubereitungszeitInput").value = assistentDaten.zubereitungszeit || "";
  document.getElementById("quelleInput").value = assistentDaten.quelle || "";
  document.getElementById("utensilienInput").value = assistentDaten.utensilien.join(", ");
  document.getElementById("zubereitungInput").value = assistentDaten.zubereitung.join(". ");
  document.getElementById("notizenInput").value = assistentDaten.notizen || "";
  document.getElementById("tagsInput").value = assistentDaten.tags.join(", ");

  zutatenGruppenInsFormularLaden(assistentDaten.zutatenGruppen);

  meldungAnzeigen("Rezept wurde ins Formular übernommen. Bitte prüfen und speichern.");
}



// ===============================
// NOTFALL-FIX 1.9.1: stabile Buttons
// ===============================

function safeHideAll() {
  ["sucheBereich", "rezeptSucheBereich", "formularBereich", "backupBereich", "einkaufBereich", "textImportBereich", "datenpruefungBereich"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add("versteckt");
  });
}

function safeToggle(id) {
  const bereich = document.getElementById(id);

  if (!bereich) {
    alert("Der Bereich " + id + " wurde nicht gefunden.");
    return;
  }

  const warOffen = !bereich.classList.contains("versteckt");

  safeHideAll();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  if (id === "einkaufBereich" && typeof einkaufslisteErstellen === "function") {
    einkaufslisteErstellen();
  }

  window.scrollTo({
    top: bereich.offsetTop - 20,
    behavior: "smooth"
  });
}

function rezeptHinzufuegenToggle() {
  const bereich = document.getElementById("formularBereich");
  const warOffen = bereich && !bereich.classList.contains("versteckt");

  safeHideAll();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (typeof formularLeeren === "function") {
    formularLeeren();
  }

  bereich.classList.remove("versteckt");
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

function alleRezepteToggle() {
  const bereich = document.getElementById("sucheBereich");
  const warOffen = bereich && !bereich.classList.contains("versteckt");

  safeHideAll();

  const ergebnisseBereich = document.getElementById("ergebnisse");
  if (ergebnisseBereich) ergebnisseBereich.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  const ergebnisse = rezepte.map((rezept, index) => ({
    ...rezept,
    index,
    vorhandene: [],
    fehlende: []
  })).sort((a, b) => a.name.localeCompare(b.name));

  letzteSuchErgebnisse = ergebnisse;
  zeigeErgebnisse(ergebnisse);

  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}




function rezeptAssistentToggle() {
  safeToggle("textImportBereich");
}

function einfacherBereichOeffnen(id) {
  safeToggle(id);
}

function hauptbereichToggle(id, formularLeerenSoll = false, alleRezepteAnzeigenSoll = false, datenpruefungSoll = false) {
  if (id === "formularBereich") {
    rezeptHinzufuegenToggle();
    return;
  }

  if (id === "sucheBereich" && alleRezepteAnzeigenSoll) {
    alleRezepteToggle();
    return;
  }


  if (id === "textImportBereich") {
    rezeptAssistentToggle();
    return;
  }

  if (datenpruefungSoll) {
    const bereich = document.getElementById("datenpruefungBereich");
    const warOffen = bereich && !bereich.classList.contains("versteckt");

    safeHideAll();

    const ergebnisse = document.getElementById("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";

    if (warOffen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (typeof datenqualitaetPruefen === "function") {
      datenqualitaetPruefen();
    } else {
      bereich.classList.remove("versteckt");
    }

    return;
  }

  safeToggle(id);
}

function bereichAnzeigen(id) {
  safeToggle(id);
}

function datenpruefungToggle() {
  hauptbereichToggle("datenpruefungBereich", false, false, true);
}



// ===============================
// STABILER BUTTON-FIX 1.9.2
// ===============================

function appBereiche() {
  return ["sucheBereich", "rezeptSucheBereich", "formularBereich", "backupBereich", "einkaufBereich", "textImportBereich", "datenpruefungBereich"];
}

function alleHauptbereicheVerstecken() {
  appBereiche().forEach(function(id) {
    var element = document.getElementById(id);
    if (element) element.classList.add("versteckt");
  });
}

function safeToggle(id) {
  var bereich = document.getElementById(id);

  if (!bereich) {
    alert("Der Bereich '" + id + "' wurde nicht gefunden.");
    return;
  }

  var warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  var ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  if (id === "einkaufBereich" && typeof einkaufslisteErstellen === "function") {
    einkaufslisteErstellen();
  }

  window.scrollTo({
    top: bereich.offsetTop - 20,
    behavior: "smooth"
  });
}

function bereichAnzeigen(id) {
  safeToggle(id);
}

function einfacherBereichOeffnen(id) {
  safeToggle(id);
}

function hauptbereichToggle(id, formularLeerenSoll, alleRezepteAnzeigenSoll, datenpruefungSoll) {
  if (id === "formularBereich") {
    rezeptHinzufuegenToggle();
    return;
  }

  if (id === "sucheBereich" && alleRezepteAnzeigenSoll) {
    alleRezepteToggle();
    return;
  }


  if (id === "textImportBereich") {
    rezeptAssistentToggle();
    return;
  }

  if (datenpruefungSoll) {
    datenpruefungToggle();
    return;
  }

  safeToggle(id);
}

function rezeptHinzufuegenToggle() {
  var bereich = document.getElementById("formularBereich");
  if (!bereich) return;

  var warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  var ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (typeof formularLeeren === "function") formularLeeren();

  bereich.classList.remove("versteckt");
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

function alleRezepteToggle() {
  var bereich = document.getElementById("sucheBereich");
  if (!bereich) return;

  var warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  var ergebnisseBereich = document.getElementById("ergebnisse");
  if (ergebnisseBereich) ergebnisseBereich.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  var ergebnisse = rezepte.map(function(rezept, index) {
    return Object.assign({}, rezept, {
      index: index,
      vorhandene: [],
      fehlende: []
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  letzteSuchErgebnisse = ergebnisse;
  zeigeErgebnisse(ergebnisse);

  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}




function rezeptAssistentToggle() {
  safeToggle("textImportBereich");
}

function datenpruefungToggle() {
  var bereich = document.getElementById("datenpruefungBereich");
  if (!bereich) return;

  var warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  var ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (typeof datenqualitaetPruefen === "function") {
    datenqualitaetPruefen();
  } else {
    bereich.classList.remove("versteckt");
  }
}














// ===============================
// ZUFALLSMENÜ ENTFERNT 1.9.3
// ===============================

function zufallsmenueBereichOeffnen() {
  meldungAnzeigen("Das Zufallsmenü wurde entfernt.");
}


// ===============================
// FIX 1.9.5: sichere Suchfelder & Kategorieanzeige
// ===============================

function inputWert(id) {
  const element = document.getElementById(id);
  return element ? element.value : "";
}

function ausgewaehlteSuchKategorien() {
  const aktiveKacheln = document.querySelectorAll(".kategorie-kachel.aktiv");

  return Array.from(aktiveKacheln)
    .map(kachel => kachel.dataset.kategorie)
    .filter(kategorie => kategorie !== "");
}

function kategorienAufAlleSetzen() {
  document.querySelectorAll(".kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alle = document.querySelector(".kategorie-kachel[data-kategorie='']");
  if (alle) alle.classList.add("aktiv");
  filterAnwenden();
}

function kategorieKachelUmschalten(button) {
  const istAlle = button.dataset.kategorie === "";
  const alleButton = document.querySelector(".kategorie-kachel[data-kategorie='']");

  if (istAlle) {
    document.querySelectorAll(".kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
    button.classList.add("aktiv");
  } else {
    if (alleButton) alleButton.classList.remove("aktiv");
    button.classList.toggle("aktiv");

    const aktiveAndere = document.querySelectorAll(".kategorie-kachel.aktiv:not([data-kategorie=''])");
    if (aktiveAndere.length === 0 && alleButton) alleButton.classList.add("aktiv");
  }

  filterAnwenden();
}

function filterBasis(liste) {
  const nameSuche = textNormalisieren(inputWert("nameSucheInput") || inputWert("suchbegriffInput"));
  const kategorien = ausgewaehlteSuchKategorien();
  const bewertungFilter = inputWert("bewertungFilter");
  const tagSuche = textNormalisieren(inputWert("tagSucheInput") || inputWert("suchbegriffInput"));

  return liste.filter(rezept => {
    const namePasst = nameSuche === "" || textNormalisieren(rezept.name).includes(nameSuche);
    const kategoriePasst = kategorien.length === 0 || kategorien.includes(rezept.kategorie);
    const bewertungPasst = bewertungFilter === "" || (rezept.bewertung || 0) >= Number(bewertungFilter);
    const tags = rezept.tags || [];
    const tagPasst = tagSuche === "" || tags.some(tag => textNormalisieren(tag).includes(tagSuche));

    return namePasst && kategoriePasst && bewertungPasst && tagPasst;
  });
}

function sucheAlles() {
  const zutatenText = inputWert("zutatenInput").trim();

  if (zutatenText) {
    sucheRezepte();
  } else {
    filterAnwenden();
  }
}

function sucheZuruecksetzen() {
  ["nameSucheInput", "suchbegriffInput", "zutatenInput", "tagSucheInput", "bewertungFilter"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  kategorienAufAlleSetzen();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}



// ===============================
// FIX 1.10: Übersicht zuverlässig aktualisieren
// ===============================

function dashboardAktualisieren() {
  const anzahlRezepte = document.getElementById("anzahlRezepte");
  const anzahlFavoriten = document.getElementById("anzahlFavoriten");
  const durchschnittBewertung = document.getElementById("durchschnittBewertung");
  const anzahlKategorien = document.getElementById("anzahlKategorien");
  const letztesRezept = document.getElementById("letztesRezept");

  if (anzahlRezepte) {
    anzahlRezepte.textContent = rezepte.length;
  }

  if (anzahlFavoriten) {
    anzahlFavoriten.textContent = rezepte.filter(rezept => rezept.favorit).length;
  }

  const bewertungen = rezepte
    .map(rezept => Number(rezept.bewertung || 0))
    .filter(bewertung => bewertung > 0);

  const durchschnitt =
    bewertungen.length > 0
      ? bewertungen.reduce((summe, wert) => summe + wert, 0) / bewertungen.length
      : 0;

  if (durchschnittBewertung) {
    durchschnittBewertung.textContent = durchschnitt.toFixed(1);
  }

  const kategorien = new Set(
    rezepte
      .map(rezept => rezept.kategorie)
      .filter(kategorie => kategorie && kategorie !== "")
  );

  if (anzahlKategorien) {
    anzahlKategorien.textContent = kategorien.size;
  }

  if (letztesRezept) {
    letztesRezept.textContent =
      rezepte.length > 0
        ? `Zuletzt hinzugefügt: ${rezepte[rezepte.length - 1].name}`
        : "Noch keine Rezepte gespeichert.";
  }

  if (typeof backupHinweisAktualisieren === "function") {
    backupHinweisAktualisieren();
  }
}

window.addEventListener("load", function () {
  if (typeof datenstrukturReparieren === "function") {
    datenstrukturReparieren();
  }

  dashboardAktualisieren();

  if (typeof rezeptDesTagesAufStartseite === "function") {
    rezeptDesTagesAufStartseite();
  }
});



// ===============================
// FIX 1.11: Übersicht liest echte gespeicherte Rezepte
// ===============================

function rezepteAusSpeicherLesen() {
  const roh = localStorage.getItem("rezepte");

  if (!roh) {
    return [];
  }

  try {
    const daten = JSON.parse(roh);

    if (Array.isArray(daten)) {
      return daten;
    }

    if (daten && Array.isArray(daten.rezepte)) {
      return daten.rezepte;
    }

    return [];
  } catch (fehler) {
    console.warn("Rezepte konnten nicht aus dem Speicher gelesen werden:", fehler);
    return [];
  }
}

function rezepteSynchronisieren() {
  const gespeicherteRezepte = rezepteAusSpeicherLesen();

  if (Array.isArray(gespeicherteRezepte)) {
    rezepte = gespeicherteRezepte;
  }

  return rezepte;
}

function dashboardAktualisieren() {
  rezepteSynchronisieren();

  const anzahlRezepte = document.getElementById("anzahlRezepte");
  const anzahlFavoriten = document.getElementById("anzahlFavoriten");
  const durchschnittBewertung = document.getElementById("durchschnittBewertung");
  const anzahlKategorien = document.getElementById("anzahlKategorien");
  const letztesRezept = document.getElementById("letztesRezept");

  if (anzahlRezepte) {
    anzahlRezepte.textContent = rezepte.length;
  }

  const favoriten = rezepte.filter(rezept => rezept && rezept.favorit);

  if (anzahlFavoriten) {
    anzahlFavoriten.textContent = favoriten.length;
  }

  const bewertungen = rezepte
    .map(rezept => Number(rezept && rezept.bewertung ? rezept.bewertung : 0))
    .filter(bewertung => bewertung > 0);

  const durchschnitt =
    bewertungen.length > 0
      ? bewertungen.reduce((summe, wert) => summe + wert, 0) / bewertungen.length
      : 0;

  if (durchschnittBewertung) {
    durchschnittBewertung.textContent = durchschnitt.toFixed(1);
  }

  const kategorien = new Set(
    rezepte
      .map(rezept => rezept && rezept.kategorie ? rezept.kategorie : "")
      .filter(kategorie => kategorie !== "")
  );

  if (anzahlKategorien) {
    anzahlKategorien.textContent = kategorien.size;
  }

  if (letztesRezept) {
    letztesRezept.textContent =
      rezepte.length > 0
        ? `Zuletzt hinzugefügt: ${rezepte[rezepte.length - 1].name || "Unbenanntes Rezept"}`
        : "Noch keine Rezepte gespeichert.";
  }

  if (typeof rezeptDesTagesAufStartseite === "function") {
    rezeptDesTagesAufStartseite();
  }

  if (typeof backupHinweisAktualisieren === "function") {
    backupHinweisAktualisieren();
  }
}

function speichern() {
  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  dashboardAktualisieren();
}

function appStartAktualisieren() {
  rezepteSynchronisieren();

  if (typeof datenstrukturReparieren === "function" && rezepte.length > 0) {
    datenstrukturReparieren();
    rezepteSynchronisieren();
  }

  dashboardAktualisieren();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) {
    ergebnisse.innerHTML = "";
  }
}

window.addEventListener("DOMContentLoaded", appStartAktualisieren);
window.addEventListener("focus", dashboardAktualisieren);



// ===============================
// FIX 1.12: Übersicht niemals mit leerem Speicher überschreiben
// ===============================

function gespeicherteRezepteFinden() {
  const moeglicheKeys = ["rezepte", "rezepte_backup_vor_import"];

  for (const key of moeglicheKeys) {
    const roh = localStorage.getItem(key);

    if (!roh) continue;

    try {
      const daten = JSON.parse(roh);

      if (Array.isArray(daten) && daten.length > 0) {
        return daten;
      }

      if (daten && Array.isArray(daten.rezepte) && daten.rezepte.length > 0) {
        return daten.rezepte;
      }
    } catch (fehler) {
      console.warn("Speicher konnte nicht gelesen werden:", key, fehler);
    }
  }

  return [];
}

function aktuelleRezepteFuerDashboard() {
  if (Array.isArray(rezepte) && rezepte.length > 0) {
    return rezepte;
  }

  const gespeicherte = gespeicherteRezepteFinden();

  if (gespeicherte.length > 0) {
    rezepte = gespeicherte;
    return rezepte;
  }

  return [];
}

function dashboardAktualisieren() {
  const liste = aktuelleRezepteFuerDashboard();

  const anzahlRezepte = document.getElementById("anzahlRezepte");
  const anzahlFavoriten = document.getElementById("anzahlFavoriten");
  const durchschnittBewertung = document.getElementById("durchschnittBewertung");
  const anzahlKategorien = document.getElementById("anzahlKategorien");
  const letztesRezept = document.getElementById("letztesRezept");

  if (anzahlRezepte) {
    anzahlRezepte.textContent = liste.length;
  }

  if (anzahlFavoriten) {
    anzahlFavoriten.textContent = liste.filter(rezept => rezept && rezept.favorit).length;
  }

  const bewertungen = liste
    .map(rezept => Number(rezept && rezept.bewertung ? rezept.bewertung : 0))
    .filter(bewertung => bewertung > 0);

  const durchschnitt =
    bewertungen.length > 0
      ? bewertungen.reduce((summe, wert) => summe + wert, 0) / bewertungen.length
      : 0;

  if (durchschnittBewertung) {
    durchschnittBewertung.textContent = durchschnitt.toFixed(1);
  }

  const kategorien = new Set(
    liste
      .map(rezept => rezept && rezept.kategorie ? rezept.kategorie : "")
      .filter(kategorie => kategorie !== "")
  );

  if (anzahlKategorien) {
    anzahlKategorien.textContent = kategorien.size;
  }

  if (letztesRezept) {
    letztesRezept.textContent =
      liste.length > 0
        ? `Zuletzt hinzugefügt: ${liste[liste.length - 1].name || "Unbenanntes Rezept"}`
        : "Noch keine Rezepte gespeichert.";
  }

  if (typeof backupHinweisAktualisieren === "function") {
    backupHinweisAktualisieren();
  }
}

function speichern() {
  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  dashboardAktualisieren();
}

function dashboardMehrfachAktualisieren() {
  dashboardAktualisieren();

  setTimeout(dashboardAktualisieren, 100);
  setTimeout(dashboardAktualisieren, 500);
  setTimeout(dashboardAktualisieren, 1000);
}

window.addEventListener("DOMContentLoaded", dashboardMehrfachAktualisieren);
window.addEventListener("load", dashboardMehrfachAktualisieren);
window.addEventListener("focus", dashboardAktualisieren);



// ===============================
// HARD-FIX 1.13: Dashboard zählt direkt aus der aktiven Rezeptliste
// ===============================

function dashboardRezepteErmitteln() {
  // 1. Wichtigster Fall: Die App hat die Rezepte bereits aktiv geladen.
  if (typeof rezepte !== "undefined" && Array.isArray(rezepte) && rezepte.length > 0) {
    return rezepte;
  }

  // 2. Falls localStorage ein normales Rezeptarray enthält.
  const raw = localStorage.getItem("rezepte");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        if (typeof rezepte !== "undefined") {
          rezepte = parsed;
        }
        return parsed;
      }

      if (parsed && Array.isArray(parsed.rezepte)) {
        if (typeof rezepte !== "undefined") {
          rezepte = parsed.rezepte;
        }
        return parsed.rezepte;
      }
    } catch (error) {
      console.warn("Rezepte konnten nicht gelesen werden:", error);
    }
  }

  // 3. Suche nach anderen localStorage-Einträgen, die Rezeptlisten enthalten.
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    try {
      const value = JSON.parse(localStorage.getItem(key));

      if (Array.isArray(value) && value.length > 0 && value[0] && value[0].name && value[0].zutaten) {
        if (typeof rezepte !== "undefined") {
          rezepte = value;
        }
        return value;
      }

      if (value && Array.isArray(value.rezepte) && value.rezepte.length > 0) {
        if (typeof rezepte !== "undefined") {
          rezepte = value.rezepte;
        }
        return value.rezepte;
      }
    } catch {
      // ignorieren
    }
  }

  return [];
}

function dashboardAktualisieren() {
  const liste = dashboardRezepteErmitteln();

  const anzahlRezepte = document.getElementById("anzahlRezepte");
  const anzahlFavoriten = document.getElementById("anzahlFavoriten");
  const durchschnittBewertung = document.getElementById("durchschnittBewertung");
  const anzahlKategorien = document.getElementById("anzahlKategorien");
  const letztesRezept = document.getElementById("letztesRezept");
  const dashboardDebug = document.getElementById("dashboardDebug");

  if (anzahlRezepte) anzahlRezepte.textContent = liste.length;

  if (anzahlFavoriten) {
    anzahlFavoriten.textContent = liste.filter(r => r && r.favorit).length;
  }

  const bewertungen = liste
    .map(r => Number(r && r.bewertung ? r.bewertung : 0))
    .filter(wert => wert > 0);

  const durchschnitt = bewertungen.length
    ? bewertungen.reduce((a, b) => a + b, 0) / bewertungen.length
    : 0;

  if (durchschnittBewertung) durchschnittBewertung.textContent = durchschnitt.toFixed(1);

  const kategorien = new Set(
    liste
      .map(r => r && r.kategorie ? r.kategorie : "")
      .filter(Boolean)
  );

  if (anzahlKategorien) anzahlKategorien.textContent = kategorien.size;

  if (letztesRezept) {
    letztesRezept.textContent = liste.length
      ? `Zuletzt hinzugefügt: ${liste[liste.length - 1].name || "Unbenanntes Rezept"}`
      : "Noch keine Rezepte gespeichert.";
  }

  if (dashboardDebug) {
    dashboardDebug.textContent = `Dashboard geprüft: ${liste.length} Rezept(e) geladen.`;
  }

  if (typeof backupHinweisAktualisieren === "function") {
    backupHinweisAktualisieren();
  }
}

function speichern() {
  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  dashboardAktualisieren();
}

function dashboardNachladen() {
  dashboardAktualisieren();
  setTimeout(dashboardAktualisieren, 200);
  setTimeout(dashboardAktualisieren, 800);
  setTimeout(dashboardAktualisieren, 1500);
  setTimeout(dashboardAktualisieren, 3000);
}

// Alle alten Startprobleme umgehen:
document.addEventListener("DOMContentLoaded", dashboardNachladen);
window.addEventListener("load", dashboardNachladen);
window.addEventListener("focus", dashboardAktualisieren);

// Auch nach jedem Klick kurz neu zählen.
document.addEventListener("click", function () {
  setTimeout(dashboardAktualisieren, 100);
});



// ===============================
// FIX 1.14: sicherer App-Start und Übersicht
// ===============================

function optionenFuellen() {
  const kategorieInput = document.getElementById("kategorieInput");
  if (kategorieInput && typeof KATEGORIEN !== "undefined") {
    kategorieInput.innerHTML = KATEGORIEN.map(k => `<option>${k}</option>`).join("");
  }

  const suchKategorieKacheln = document.getElementById("suchKategorieKacheln");
  if (suchKategorieKacheln && typeof KATEGORIEN !== "undefined") {
    suchKategorieKacheln.innerHTML =
      `<button class="kategorie-kachel aktiv" data-kategorie="" onclick="kategorieKachelUmschalten(this)">Alle</button>` +
      KATEGORIEN.map(k => `<button class="kategorie-kachel" data-kategorie="${k}" onclick="kategorieKachelUmschalten(this)">${k}</button>`).join("");
  }

  const kategorienFilter = document.getElementById("kategorienFilter");
  if (kategorienFilter && kategorienFilter.children.length === 0 && typeof KATEGORIEN !== "undefined") {
    kategorienFilter.innerHTML =
      `<button class="kategorie-kachel aktiv" data-kategorie="" onclick="kategorieKachelUmschalten(this)">Alle</button>` +
      KATEGORIEN.map(k => `<button class="kategorie-kachel" data-kategorie="${k}" onclick="kategorieKachelUmschalten(this)">${k}</button>`).join("");
  }
}

function dashboardRezepteDirektLesen() {
  // Erst die aktive App-Liste verwenden
  if (typeof rezepte !== "undefined" && Array.isArray(rezepte) && rezepte.length > 0) {
    return rezepte;
  }

  // Dann den normalen Speicher verwenden
  try {
    const roh = localStorage.getItem("rezepte");
    if (roh) {
      const daten = JSON.parse(roh);
      if (Array.isArray(daten)) {
        rezepte = daten;
        return daten;
      }
      if (daten && Array.isArray(daten.rezepte)) {
        rezepte = daten.rezepte;
        return daten.rezepte;
      }
    }
  } catch (fehler) {
    console.warn("Rezepte konnten nicht geladen werden:", fehler);
  }

  return [];
}

function dashboardAktualisieren() {
  const liste = dashboardRezepteDirektLesen();

  const anzahlRezepte = document.getElementById("anzahlRezepte");
  const anzahlFavoriten = document.getElementById("anzahlFavoriten");
  const durchschnittBewertung = document.getElementById("durchschnittBewertung");
  const anzahlKategorien = document.getElementById("anzahlKategorien");
  const letztesRezept = document.getElementById("letztesRezept");
  const dashboardDebug = document.getElementById("dashboardDebug");

  if (anzahlRezepte) anzahlRezepte.textContent = String(liste.length);

  if (anzahlFavoriten) {
    anzahlFavoriten.textContent = String(liste.filter(r => r && r.favorit).length);
  }

  const bewertungen = liste
    .map(r => Number(r && r.bewertung ? r.bewertung : 0))
    .filter(w => w > 0);

  const durchschnitt = bewertungen.length
    ? bewertungen.reduce((a, b) => a + b, 0) / bewertungen.length
    : 0;

  if (durchschnittBewertung) durchschnittBewertung.textContent = durchschnitt.toFixed(1);

  const kategorien = new Set(
    liste
      .map(r => r && r.kategorie ? r.kategorie : "")
      .filter(Boolean)
  );

  if (anzahlKategorien) anzahlKategorien.textContent = String(kategorien.size);

  if (letztesRezept) {
    letztesRezept.textContent = liste.length
      ? `Zuletzt hinzugefügt: ${liste[liste.length - 1].name || "Unbenanntes Rezept"}`
      : "Noch keine Rezepte gespeichert.";
  }

  if (dashboardDebug) {
    dashboardDebug.textContent = `Übersicht aktualisiert: ${liste.length} Rezept(e) gefunden.`;
  }
}

function speichern() {
  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  dashboardAktualisieren();
}

function safeInitV114() {
  try {
    optionenFuellen();
  } catch (fehler) {
    console.warn("Optionen konnten nicht gefüllt werden:", fehler);
  }

  try {
    if (typeof datenstrukturReparieren === "function") {
      datenstrukturReparieren();
    }
  } catch (fehler) {
    console.warn("Datenstruktur-Reparatur übersprungen:", fehler);
  }

  try {
    const gruppen = document.getElementById("zutatenGruppen");
    if (gruppen && gruppen.children.length === 0 && typeof zutatenGruppeHinzufuegen === "function") {
      zutatenGruppeHinzufuegen("Zutaten");
    }
  } catch (fehler) {
    console.warn("Zutatengruppe konnte nicht hinzugefügt werden:", fehler);
  }

  dashboardAktualisieren();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", safeInitV114);
window.addEventListener("load", function () {
  safeInitV114();
  setTimeout(dashboardAktualisieren, 250);
  setTimeout(dashboardAktualisieren, 1000);
});
window.addEventListener("focus", dashboardAktualisieren);



// ===============================
// CLEANUP 1.15: alte Verweise entschärfen
// ===============================

function elementWert(id) {
  const element = document.getElementById(id);
  return element ? element.value : "";
}

function rezeptDesTagesAufStartseite() {
  const box = document.getElementById("rezeptDesTagesBox");
  if (!box) return;

  const liste = (typeof dashboardRezepteDirektLesen === "function")
    ? dashboardRezepteDirektLesen()
    : (Array.isArray(rezepte) ? rezepte : []);

  if (!liste || liste.length === 0) {
    box.innerHTML = "<h3>Rezept des Tages</h3><p>Noch kein Rezept verfügbar.</p>";
    return;
  }

  const heute = new Date().toISOString().slice(0, 10);
  const index = Math.abs(
    heute.split("").reduce((summe, zeichen) => summe + zeichen.charCodeAt(0), 0)
  ) % liste.length;

  const rezept = liste[index];

  box.innerHTML = `
    <h3>Rezept des Tages</h3>
    <p><strong>${rezept.name || "Unbenanntes Rezept"}</strong></p>
    <p>${rezept.kategorie || "Keine Kategorie"}</p>
    <button onclick="zeigeRezeptDesTages(${index})">Rezept anzeigen</button>
  `;
}

function zeigeRezeptDesTages(index) {
  const liste = (typeof dashboardRezepteDirektLesen === "function")
    ? dashboardRezepteDirektLesen()
    : (Array.isArray(rezepte) ? rezepte : []);

  if (!liste[index]) {
    meldungAnzeigen("Rezept des Tages konnte nicht geöffnet werden.", true);
    return;
  }

  const rezept = {
    ...liste[index],
    index,
    vorhandene: [],
    fehlende: []
  };

  zeigeErgebnisse([rezept], rezept.id);
}

function schnellfilterToggle() {
  const bereich = document.getElementById("schnellfilterInhalt");
  if (bereich) {
    bereich.classList.toggle("versteckt");
  }
}

function optionenFuellen() {
  const kategorieInput = document.getElementById("kategorieInput");

  if (kategorieInput && typeof KATEGORIEN !== "undefined") {
    kategorieInput.innerHTML = KATEGORIEN.map(k => `<option>${k}</option>`).join("");
  }

  const suchKategorieKacheln = document.getElementById("suchKategorieKacheln");
  if (suchKategorieKacheln && typeof KATEGORIEN !== "undefined") {
    suchKategorieKacheln.innerHTML =
      `<button class="kategorie-kachel aktiv" data-kategorie="" onclick="kategorieKachelUmschalten(this)">Alle</button>` +
      KATEGORIEN.map(k => `<button class="kategorie-kachel" data-kategorie="${k}" onclick="kategorieKachelUmschalten(this)">${k}</button>`).join("");
  }

  const kategorienFilter = document.getElementById("kategorienFilter");
  if (kategorienFilter && kategorienFilter.children.length === 0 && typeof KATEGORIEN !== "undefined") {
    kategorienFilter.innerHTML =
      `<button class="kategorie-kachel aktiv" data-kategorie="" onclick="kategorieKachelUmschalten(this)">Alle</button>` +
      KATEGORIEN.map(k => `<button class="kategorie-kachel" data-kategorie="${k}" onclick="kategorieKachelUmschalten(this)">${k}</button>`).join("");
  }
}

function filterBasis(liste) {
  const nameSuche = textNormalisieren(
    elementWert("nameSucheInput") || elementWert("suchbegriffInput")
  );

  const kategorien = ausgewaehlteSuchKategorien();
  const bewertungFilter = elementWert("bewertungFilter");
  const tagSuche = textNormalisieren(
    elementWert("tagSucheInput") || elementWert("suchbegriffInput")
  );

  return liste.filter(rezept => {
    const namePasst = nameSuche === "" || textNormalisieren(rezept.name || "").includes(nameSuche);
    const kategoriePasst = kategorien.length === 0 || kategorien.includes(rezept.kategorie);
    const bewertungPasst = bewertungFilter === "" || (rezept.bewertung || 0) >= Number(bewertungFilter);
    const tags = rezept.tags || [];
    const tagPasst = tagSuche === "" || tags.some(tag => textNormalisieren(tag).includes(tagSuche));

    return namePasst && kategoriePasst && bewertungPasst && tagPasst;
  });
}

function dashboardAktualisieren() {
  const liste = (typeof dashboardRezepteDirektLesen === "function")
    ? dashboardRezepteDirektLesen()
    : (Array.isArray(rezepte) ? rezepte : []);

  const anzahlRezepte = document.getElementById("anzahlRezepte");
  const anzahlFavoriten = document.getElementById("anzahlFavoriten");
  const durchschnittBewertung = document.getElementById("durchschnittBewertung");
  const anzahlKategorien = document.getElementById("anzahlKategorien");
  const letztesRezept = document.getElementById("letztesRezept");
  const dashboardDebug = document.getElementById("dashboardDebug");

  if (anzahlRezepte) anzahlRezepte.textContent = String(liste.length);
  if (anzahlFavoriten) anzahlFavoriten.textContent = String(liste.filter(r => r && r.favorit).length);

  const bewertungen = liste
    .map(r => Number(r && r.bewertung ? r.bewertung : 0))
    .filter(wert => wert > 0);

  const durchschnitt = bewertungen.length
    ? bewertungen.reduce((a, b) => a + b, 0) / bewertungen.length
    : 0;

  if (durchschnittBewertung) durchschnittBewertung.textContent = durchschnitt.toFixed(1);

  const kategorien = new Set(
    liste.map(r => r && r.kategorie ? r.kategorie : "").filter(Boolean)
  );

  if (anzahlKategorien) anzahlKategorien.textContent = String(kategorien.size);

  if (letztesRezept) {
    letztesRezept.textContent = liste.length
      ? `Zuletzt hinzugefügt: ${liste[liste.length - 1].name || "Unbenanntes Rezept"}`
      : "Noch keine Rezepte gespeichert.";
  }

  if (dashboardDebug) {
    dashboardDebug.textContent = `Übersicht aktualisiert: ${liste.length} Rezept(e) gefunden.`;
  }

  rezeptDesTagesAufStartseite();
}

window.addEventListener("load", function () {
  optionenFuellen();
  dashboardAktualisieren();
});



// ===============================
// FIX 1.16: Rezept-Assistent Analyse repariert
// ===============================

function wertNachDoppelpunkt(zeile) {
  return String(zeile || "").split(":").slice(1).join(":").trim();
}

function zutatAusTextzeile(zeile) {
  const daten = zutatAnalysieren(zeile);

  return {
    menge: daten.originalMenge || "",
    einheit: daten.originalEinheit || daten.einheit || "",
    name: textTitel(daten.name || zeile)
  };
}

function rezeptAssistentAnalysieren() {
  const input = document.getElementById("textImportInput");
  const vorschau = document.getElementById("assistentVorschau");

  if (!input || !vorschau) {
    meldungAnzeigen("Der Rezept-Assistent konnte nicht geöffnet werden.", true);
    return;
  }

  const text = input.value.trim();

  if (!text) {
    meldungAnzeigen("Bitte zuerst einen Rezepttext einfügen.", true);
    return;
  }

  try {
    assistentDaten = rezeptAssistentParsen(text);

    vorschau.innerHTML = `
      <h3>Vorschau</h3>

      <p><strong>Name:</strong> ${assistentDaten.name || "nicht erkannt"}</p>
      <p><strong>Kategorie:</strong> ${assistentDaten.kategorie || "Nicht zugeordnet"}</p>
      <p><strong>Portionen:</strong> ${assistentDaten.portionen || "nicht erkannt"}</p>
      <p><strong>Zubereitungszeit:</strong> ${assistentDaten.zubereitungszeit || "nicht erkannt"}</p>

      <h4>Zutaten</h4>
      ${assistentDaten.zutatenGruppen.map(gruppe => `
        <div>
          <strong>${gruppe.name}</strong>
          <ul>
            ${gruppe.zutaten.map(zutat => `<li>${zutatAlsText(zutat)}</li>`).join("")}
          </ul>
        </div>
      `).join("")}

      <h4>Utensilien</h4>
      <ul>
        ${
          assistentDaten.utensilien.length > 0
            ? assistentDaten.utensilien.map(u => `<li>${u}</li>`).join("")
            : "<li>keine erkannt</li>"
        }
      </ul>

      <h4>Zubereitung</h4>
      <ol>
        ${
          assistentDaten.zubereitung.length > 0
            ? assistentDaten.zubereitung.map(schritt => `<li>${schritt}</li>`).join("")
            : "<li>keine Schritte erkannt</li>"
        }
      </ol>

      <button onclick="assistentInsFormularUebernehmen()">Ins Formular übernehmen</button>
    `;
  } catch (fehler) {
    console.error("Fehler beim Rezept-Assistenten:", fehler);
    meldungAnzeigen("Der Text konnte nicht analysiert werden. Bitte prüfe das Format.", true);
  }
}

function rezeptAssistentParsen(text) {
  const zeilen = text
    .split("\n")
    .map(z => z.trim())
    .filter(z => z !== "");

  const daten = {
    name: "",
    kategorie: "Nicht zugeordnet",
    portionen: "",
    schwierigkeit: "",
    zubereitungszeit: "",
    quelle: "",
    utensilien: [],
    tags: [],
    zutatenGruppen: [],
    zubereitung: [],
    notizen: ""
  };

  const utensilienWoerter = [
    "Pfanne", "Topf", "Mixer", "Schneebesen", "Backform", "Springform",
    "Nudelmaschine", "Eismaschine", "Waffeleisen", "Airfryer", "Sieb",
    "Reibe", "Pürierstab", "Backblech", "Küchenmaschine", "Kochtopf",
    "Auflaufform", "Teigrolle", "Nudelholz", "Messer", "Schüssel"
  ];

  let bereich = "";
  let aktuelleGruppe = null;

  zeilen.forEach((zeile, index) => {
    const klein = zeile.toLowerCase();

    if (index === 0 && !zeile.includes(":")) {
      daten.name = zeile;
      return;
    }

    if (klein.startsWith("name:")) {
      daten.name = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("kategorie:")) {
      daten.kategorie = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("portionen:")) {
      daten.portionen = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("zubereitungszeit:")) {
      daten.zubereitungszeit = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("quelle:")) {
      daten.quelle = wertNachDoppelpunkt(zeile);
      return;
    }

    if (klein.startsWith("utensilien:") || klein.startsWith("besondere utensilien:")) {
      daten.utensilien = wertNachDoppelpunkt(zeile)
        .split(",")
        .map(u => textTitel(u.trim()))
        .filter(u => u !== "");
      return;
    }

    if (klein === "zutaten:") {
      bereich = "zutaten";
      return;
    }

    if (klein === "zubereitung:" || klein === "anleitung:") {
      bereich = "zubereitung";
      return;
    }

    if (klein === "notizen:") {
      bereich = "notizen";
      return;
    }

    if (bereich === "zutaten") {
      if (zeile.endsWith(":")) {
        aktuelleGruppe = {
          name: zeile.replace(":", ""),
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
        return;
      }

      if (!aktuelleGruppe) {
        aktuelleGruppe = {
          name: "Zutaten",
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
      }

      aktuelleGruppe.zutaten.push(zutatAusTextzeile(zeile));
      return;
    }

    if (bereich === "zubereitung") {
      daten.zubereitung.push(
        zeile
          .replace(/^\d+\.\s*/, "")
          .replace(/\.$/, "")
      );
      return;
    }

    if (bereich === "notizen") {
      daten.notizen += (daten.notizen ? "\n" : "") + zeile;
    }
  });

  if (!daten.name && zeilen.length > 0) {
    daten.name = zeilen[0];
  }

  if (daten.zutatenGruppen.length === 0) {
    daten.zutatenGruppen.push({
      name: "Zutaten",
      zutaten: []
    });
  }

  const gesamterText = textNormalisieren(text);
  const gefundeneUtensilien = utensilienWoerter.filter(utensil =>
    gesamterText.includes(textNormalisieren(utensil))
  );

  daten.utensilien = [...new Set([...daten.utensilien, ...gefundeneUtensilien])];

  return daten;
}

function assistentInsFormularUebernehmen() {
  if (!assistentDaten) {
    meldungAnzeigen("Bitte zuerst ein Rezept analysieren.", true);
    return;
  }

  safeToggle("formularBereich");

  document.getElementById("nameInput").value = assistentDaten.name || "";
  document.getElementById("kategorieInput").value = assistentDaten.kategorie || "Nicht zugeordnet";
  document.getElementById("portionenInput").value = assistentDaten.portionen || "";
  document.getElementById("schwierigkeitInput").value = assistentDaten.schwierigkeit || "";
  document.getElementById("zubereitungszeitInput").value = assistentDaten.zubereitungszeit || "";
  document.getElementById("quelleInput").value = assistentDaten.quelle || "";
  document.getElementById("utensilienInput").value = assistentDaten.utensilien.join(", ");
  document.getElementById("zubereitungInput").value = assistentDaten.zubereitung.join(". ");
  document.getElementById("notizenInput").value = assistentDaten.notizen || "";
  document.getElementById("tagsInput").value = assistentDaten.tags.join(", ");

  zutatenGruppenInsFormularLaden(assistentDaten.zutatenGruppen);

  meldungAnzeigen("Rezept wurde ins Formular übernommen. Bitte prüfen und speichern.");
}



// ===============================
// FIX 1.17: Rezept analysieren Button direkt repariert
// ===============================

function rezeptAssistentZutatAusZeileDirekt(zeile) {
  const text = String(zeile || "").trim();
  const match = text.match(/^((?:\d+\s+)?\d+\/\d+|\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜß.]*)\s+(.+)$/);

  if (!match) {
    return {
      menge: "",
      einheit: "",
      name: textTitel(text)
    };
  }

  return {
    menge: match[1],
    einheit: einheitNormalisieren(match[2]).anzeige || match[2],
    name: textTitel(match[3])
  };
}

function rezeptAssistentWertNachDoppelpunktDirekt(zeile) {
  return String(zeile || "").split(":").slice(1).join(":").trim();
}

function rezeptAnalysierenDirekt() {
  const input = document.getElementById("textImportInput");
  const vorschau = document.getElementById("assistentVorschau");

  if (!input || !vorschau) {
    alert("Der Rezept-Assistent ist nicht vollständig geladen.");
    return;
  }

  const text = input.value.trim();

  if (!text) {
    vorschau.innerHTML = "<p>Bitte zuerst einen Rezepttext einfügen.</p>";
    return;
  }

  const zeilen = text
    .split(/\r?\n/)
    .map(zeile => zeile.trim())
    .filter(zeile => zeile !== "");

  const daten = {
    name: "",
    kategorie: "Nicht zugeordnet",
    portionen: "",
    zubereitungszeit: "",
    quelle: "",
    utensilien: [],
    tags: [],
    zutatenGruppen: [],
    zubereitung: [],
    notizen: ""
  };

  const utensilienWoerter = [
    "Pfanne", "Topf", "Mixer", "Schneebesen", "Backform", "Springform",
    "Nudelmaschine", "Eismaschine", "Waffeleisen", "Airfryer", "Sieb",
    "Reibe", "Pürierstab", "Backblech", "Küchenmaschine", "Kochtopf",
    "Auflaufform", "Teigrolle", "Nudelholz", "Messer", "Schüssel"
  ];

  let bereich = "";
  let aktuelleGruppe = null;

  zeilen.forEach((zeile, index) => {
    const klein = zeile.toLowerCase();

    if (index === 0 && !zeile.includes(":")) {
      daten.name = zeile;
      return;
    }

    if (klein.startsWith("name:")) {
      daten.name = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("kategorie:")) {
      daten.kategorie = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("portionen:")) {
      daten.portionen = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("zubereitungszeit:")) {
      daten.zubereitungszeit = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("quelle:")) {
      daten.quelle = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("utensilien:") || klein.startsWith("besondere utensilien:")) {
      daten.utensilien = rezeptAssistentWertNachDoppelpunktDirekt(zeile)
        .split(",")
        .map(u => textTitel(u.trim()))
        .filter(u => u !== "");
      return;
    }

    if (klein === "zutaten:") {
      bereich = "zutaten";
      return;
    }

    if (klein === "zubereitung:" || klein === "anleitung:") {
      bereich = "zubereitung";
      return;
    }

    if (klein === "notizen:") {
      bereich = "notizen";
      return;
    }

    if (bereich === "zutaten") {
      if (zeile.endsWith(":")) {
        aktuelleGruppe = {
          name: zeile.replace(":", ""),
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
        return;
      }

      if (!aktuelleGruppe) {
        aktuelleGruppe = {
          name: "Zutaten",
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
      }

      aktuelleGruppe.zutaten.push(rezeptAssistentZutatAusZeileDirekt(zeile));
      return;
    }

    if (bereich === "zubereitung") {
      daten.zubereitung.push(
        zeile
          .replace(/^\d+\.\s*/, "")
          .replace(/\.$/, "")
      );
      return;
    }

    if (bereich === "notizen") {
      daten.notizen += (daten.notizen ? "\n" : "") + zeile;
    }
  });

  if (!daten.name && zeilen.length > 0) {
    daten.name = zeilen[0];
  }

  if (daten.zutatenGruppen.length === 0) {
    daten.zutatenGruppen.push({
      name: "Zutaten",
      zutaten: []
    });
  }

  const gesamterText = textNormalisieren(text);
  const automatischGefunden = utensilienWoerter.filter(utensil =>
    gesamterText.includes(textNormalisieren(utensil))
  );

  daten.utensilien = [...new Set([...daten.utensilien, ...automatischGefunden])];

  assistentDaten = daten;

  vorschau.innerHTML = `
    <h3>Vorschau</h3>

    <p><strong>Name:</strong> ${daten.name || "nicht erkannt"}</p>
    <p><strong>Kategorie:</strong> ${daten.kategorie || "Nicht zugeordnet"}</p>
    <p><strong>Portionen:</strong> ${daten.portionen || "nicht erkannt"}</p>
    <p><strong>Zubereitungszeit:</strong> ${daten.zubereitungszeit || "nicht erkannt"}</p>

    <h4>Zutaten</h4>
    ${daten.zutatenGruppen.map(gruppe => `
      <div>
        <strong>${gruppe.name}</strong>
        <ul>
          ${gruppe.zutaten.map(zutat => `<li>${zutatAlsText(zutat)}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h4>Utensilien</h4>
    <ul>
      ${
        daten.utensilien.length > 0
          ? daten.utensilien.map(u => `<li>${u}</li>`).join("")
          : "<li>keine erkannt</li>"
      }
    </ul>

    <h4>Zubereitung</h4>
    <ol>
      ${
        daten.zubereitung.length > 0
          ? daten.zubereitung.map(schritt => `<li>${schritt}</li>`).join("")
          : "<li>keine Schritte erkannt</li>"
      }
    </ol>

    <button type="button" onclick="assistentInsFormularUebernehmenDirekt()">Ins Formular übernehmen</button>
  `;
}

function assistentInsFormularUebernehmenDirekt() {
  if (!assistentDaten) {
    alert("Bitte zuerst ein Rezept analysieren.");
    return;
  }

  safeToggle("formularBereich");

  document.getElementById("nameInput").value = assistentDaten.name || "";
  document.getElementById("kategorieInput").value = assistentDaten.kategorie || "Nicht zugeordnet";
  document.getElementById("portionenInput").value = assistentDaten.portionen || "";
  document.getElementById("zubereitungszeitInput").value = assistentDaten.zubereitungszeit || "";
  document.getElementById("quelleInput").value = assistentDaten.quelle || "";
  document.getElementById("utensilienInput").value = assistentDaten.utensilien.join(", ");
  document.getElementById("zubereitungInput").value = assistentDaten.zubereitung.join(". ");
  document.getElementById("notizenInput").value = assistentDaten.notizen || "";
  document.getElementById("tagsInput").value = assistentDaten.tags.join(", ");

  zutatenGruppenInsFormularLaden(assistentDaten.zutatenGruppen);

  meldungAnzeigen("Rezept wurde ins Formular übernommen. Bitte prüfen und speichern.");
}

function rezeptAssistentAnalysieren() {
  rezeptAnalysierenDirekt();
}

window.addEventListener("load", function () {
  const button = document.getElementById("rezeptAnalysierenButton");
  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      rezeptAnalysierenDirekt();
    });
  }
});



// ===============================
// FIX 1.18: fehlende Text-Hilfsfunktion für Rezept-Assistent
// ===============================

function textNormalisieren(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replaceAll(".", "");
}



// ===============================
// FIX 1.19: Rezept-Assistent erneut analysieren & zurücksetzen
// ===============================

function rezeptAssistentZuruecksetzen() {
  const input = document.getElementById("textImportInput");
  const vorschau = document.getElementById("assistentVorschau");

  if (input) input.value = "";
  if (vorschau) vorschau.innerHTML = "";

  assistentDaten = null;
  meldungAnzeigen("Rezept-Assistent zurückgesetzt.");
}

function rezeptAnalysierenDirekt() {
  const input = document.getElementById("textImportInput");
  const vorschau = document.getElementById("assistentVorschau");

  if (!input || !vorschau) {
    alert("Der Rezept-Assistent ist nicht vollständig geladen.");
    return;
  }

  const text = input.value.trim();

  // Wichtig: Alte Vorschau und alte Analyse vor jeder neuen Analyse entfernen
  vorschau.innerHTML = "";
  assistentDaten = null;

  if (!text) {
    vorschau.innerHTML = "<p>Bitte zuerst einen Rezepttext einfügen.</p>";
    return;
  }

  const zeilen = text
    .split(/\r?\n/)
    .map(zeile => zeile.trim())
    .filter(zeile => zeile !== "");

  const daten = {
    name: "",
    kategorie: "Nicht zugeordnet",
    portionen: "",
    zubereitungszeit: "",
    quelle: "",
    utensilien: [],
    tags: [],
    zutatenGruppen: [],
    zubereitung: [],
    notizen: ""
  };

  const utensilienWoerter = [
    "Pfanne", "Topf", "Mixer", "Schneebesen", "Backform", "Springform",
    "Nudelmaschine", "Eismaschine", "Waffeleisen", "Airfryer", "Sieb",
    "Reibe", "Pürierstab", "Backblech", "Küchenmaschine", "Kochtopf",
    "Auflaufform", "Teigrolle", "Nudelholz", "Messer", "Schüssel"
  ];

  let bereich = "";
  let aktuelleGruppe = null;

  zeilen.forEach((zeile, index) => {
    const klein = zeile.toLowerCase();

    if (index === 0 && !zeile.includes(":")) {
      daten.name = zeile;
      return;
    }

    if (klein.startsWith("name:")) {
      daten.name = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("kategorie:")) {
      daten.kategorie = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("portionen:")) {
      daten.portionen = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("zubereitungszeit:")) {
      daten.zubereitungszeit = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("quelle:")) {
      daten.quelle = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("utensilien:") || klein.startsWith("besondere utensilien:")) {
      daten.utensilien = rezeptAssistentWertNachDoppelpunktDirekt(zeile)
        .split(",")
        .map(u => textTitel(u.trim()))
        .filter(u => u !== "");
      return;
    }

    if (klein === "zutaten:") {
      bereich = "zutaten";
      return;
    }

    if (klein === "zubereitung:" || klein === "anleitung:") {
      bereich = "zubereitung";
      return;
    }

    if (klein === "notizen:") {
      bereich = "notizen";
      return;
    }

    if (bereich === "zutaten") {
      if (zeile.endsWith(":")) {
        aktuelleGruppe = {
          name: zeile.replace(":", ""),
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
        return;
      }

      if (!aktuelleGruppe) {
        aktuelleGruppe = {
          name: "Zutaten",
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
      }

      aktuelleGruppe.zutaten.push(rezeptAssistentZutatAusZeileDirekt(zeile));
      return;
    }

    if (bereich === "zubereitung") {
      daten.zubereitung.push(
        zeile
          .replace(/^\d+\.\s*/, "")
          .replace(/\.$/, "")
      );
      return;
    }

    if (bereich === "notizen") {
      daten.notizen += (daten.notizen ? "\n" : "") + zeile;
    }
  });

  if (!daten.name && zeilen.length > 0) {
    daten.name = zeilen[0];
  }

  if (daten.zutatenGruppen.length === 0) {
    daten.zutatenGruppen.push({
      name: "Zutaten",
      zutaten: []
    });
  }

  const gesamterText = textNormalisieren(text);
  const automatischGefunden = utensilienWoerter.filter(utensil =>
    gesamterText.includes(textNormalisieren(utensil))
  );

  daten.utensilien = [...new Set([...daten.utensilien, ...automatischGefunden])];

  assistentDaten = daten;

  vorschau.innerHTML = `
    <h3>Vorschau</h3>

    <p><strong>Name:</strong> ${daten.name || "nicht erkannt"}</p>
    <p><strong>Kategorie:</strong> ${daten.kategorie || "Nicht zugeordnet"}</p>
    <p><strong>Portionen:</strong> ${daten.portionen || "nicht erkannt"}</p>
    <p><strong>Zubereitungszeit:</strong> ${daten.zubereitungszeit || "nicht erkannt"}</p>

    <h4>Zutaten</h4>
    ${daten.zutatenGruppen.map(gruppe => `
      <div>
        <strong>${gruppe.name}</strong>
        <ul>
          ${gruppe.zutaten.map(zutat => `<li>${zutatAlsText(zutat)}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h4>Utensilien</h4>
    <ul>
      ${
        daten.utensilien.length > 0
          ? daten.utensilien.map(u => `<li>${u}</li>`).join("")
          : "<li>keine erkannt</li>"
      }
    </ul>

    <h4>Zubereitung</h4>
    <ol>
      ${
        daten.zubereitung.length > 0
          ? daten.zubereitung.map(schritt => `<li>${schritt}</li>`).join("")
          : "<li>keine Schritte erkannt</li>"
      }
    </ol>

    <button type="button" onclick="assistentInsFormularUebernehmenDirekt()">Ins Formular übernehmen</button>
  `;
}

window.addEventListener("load", function () {
  const resetButton = document.getElementById("rezeptAssistentResetButton");
  if (resetButton) {
    resetButton.addEventListener("click", function (event) {
      event.preventDefault();
      rezeptAssistentZuruecksetzen();
    });
  }
});



// ===============================
// FIX 1.20: Rezept-Assistent erkennt Zubereitung robuster
// ===============================

function rezeptAssistentSchritteAusText(text) {
  const zeilen = String(text || "")
    .split(/\r?\n/)
    .map(zeile => zeile.trim())
    .filter(zeile => zeile !== "");

  let startIndex = zeilen.findIndex(zeile => {
    const klein = zeile.toLowerCase();
    return klein === "zubereitung:" ||
           klein === "zubereitung" ||
           klein === "anleitung:" ||
           klein === "anleitung" ||
           klein === "zubereitungsschritte:" ||
           klein === "zubereitungsschritte";
  });

  if (startIndex === -1) {
    // Falls keine Überschrift gefunden wird: nach typischen Schrittzeilen suchen.
    const schrittZeilen = zeilen.filter(zeile =>
      /^\d+[\.)]\s+/.test(zeile) ||
      /^schritt\s*\d+/i.test(zeile)
    );

    if (schrittZeilen.length > 0) {
      return schrittZeilen.map(zeile =>
        zeile
          .replace(/^\d+[\.)]\s*/, "")
          .replace(/^schritt\s*\d+[:.)]?\s*/i, "")
          .replace(/\.$/, "")
          .trim()
      ).filter(Boolean);
    }

    return [];
  }

  const schritteRoh = [];
  for (let i = startIndex + 1; i < zeilen.length; i++) {
    const zeile = zeilen[i];
    const klein = zeile.toLowerCase();

    // Bei einem neuen Hauptbereich stoppen
    if (
      klein === "notizen:" ||
      klein === "notizen" ||
      klein === "zutaten:" ||
      klein === "zutaten" ||
      klein === "utensilien:" ||
      klein === "utensilien" ||
      klein === "quelle:" ||
      klein === "quelle"
    ) {
      break;
    }

    schritteRoh.push(zeile);
  }

  // Wenn jeder Schritt in eigener Zeile steht
  if (schritteRoh.length > 1) {
    return schritteRoh.map(zeile =>
      zeile
        .replace(/^\d+[\.)]\s*/, "")
        .replace(/^schritt\s*\d+[:.)]?\s*/i, "")
        .replace(/\.$/, "")
        .trim()
    ).filter(Boolean);
  }

  // Wenn alles in einer Zeile / einem Absatz steht
  return schritteRoh
    .join(" ")
    .split(/(?:\.\s+|;\s+|\n+)/)
    .map(schritt =>
      schritt
        .replace(/^\d+[\.)]\s*/, "")
        .replace(/^schritt\s*\d+[:.)]?\s*/i, "")
        .replace(/\.$/, "")
        .trim()
    )
    .filter(Boolean);
}

function rezeptAnalysierenDirekt() {
  const input = document.getElementById("textImportInput");
  const vorschau = document.getElementById("assistentVorschau");

  if (!input || !vorschau) {
    alert("Der Rezept-Assistent ist nicht vollständig geladen.");
    return;
  }

  const text = input.value.trim();

  vorschau.innerHTML = "";
  assistentDaten = null;

  if (!text) {
    vorschau.innerHTML = "<p>Bitte zuerst einen Rezepttext einfügen.</p>";
    return;
  }

  const zeilen = text
    .split(/\r?\n/)
    .map(zeile => zeile.trim())
    .filter(zeile => zeile !== "");

  const daten = {
    name: "",
    kategorie: "Nicht zugeordnet",
    portionen: "",
    zubereitungszeit: "",
    quelle: "",
    utensilien: [],
    tags: [],
    zutatenGruppen: [],
    zubereitung: [],
    notizen: ""
  };

  const utensilienWoerter = [
    "Pfanne", "Topf", "Mixer", "Schneebesen", "Backform", "Springform",
    "Nudelmaschine", "Eismaschine", "Waffeleisen", "Airfryer", "Sieb",
    "Reibe", "Pürierstab", "Backblech", "Küchenmaschine", "Kochtopf",
    "Auflaufform", "Teigrolle", "Nudelholz", "Messer", "Schüssel"
  ];

  let bereich = "";
  let aktuelleGruppe = null;

  zeilen.forEach((zeile, index) => {
    const klein = zeile.toLowerCase();

    if (index === 0 && !zeile.includes(":")) {
      daten.name = zeile;
      return;
    }

    if (klein.startsWith("name:")) {
      daten.name = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("kategorie:")) {
      daten.kategorie = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("portionen:")) {
      daten.portionen = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("zubereitungszeit:")) {
      daten.zubereitungszeit = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("quelle:")) {
      daten.quelle = rezeptAssistentWertNachDoppelpunktDirekt(zeile);
      return;
    }

    if (klein.startsWith("utensilien:") || klein.startsWith("besondere utensilien:")) {
      daten.utensilien = rezeptAssistentWertNachDoppelpunktDirekt(zeile)
        .split(",")
        .map(u => textTitel(u.trim()))
        .filter(u => u !== "");
      return;
    }

    if (klein === "zutaten:" || klein === "zutaten") {
      bereich = "zutaten";
      return;
    }

    if (klein === "zubereitung:" || klein === "zubereitung" || klein === "anleitung:" || klein === "anleitung") {
      bereich = "zubereitung";
      return;
    }

    if (klein === "notizen:" || klein === "notizen") {
      bereich = "notizen";
      return;
    }

    if (bereich === "zutaten") {
      if (zeile.endsWith(":")) {
        aktuelleGruppe = {
          name: zeile.replace(":", ""),
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
        return;
      }

      if (!aktuelleGruppe) {
        aktuelleGruppe = {
          name: "Zutaten",
          zutaten: []
        };
        daten.zutatenGruppen.push(aktuelleGruppe);
      }

      daten.zutatenGruppen[daten.zutatenGruppen.length - 1].zutaten.push(
        rezeptAssistentZutatAusZeileDirekt(zeile)
      );
      return;
    }

    if (bereich === "zubereitung") {
      daten.zubereitung.push(
        zeile
          .replace(/^\d+[\.)]\s*/, "")
          .replace(/^schritt\s*\d+[:.)]?\s*/i, "")
          .replace(/\.$/, "")
          .trim()
      );
      return;
    }

    if (bereich === "notizen") {
      daten.notizen += (daten.notizen ? "\n" : "") + zeile;
    }
  });

  // Zusätzliche robuste Zubereitungs-Erkennung überschreibt nur, wenn sie etwas findet.
  const erkannteSchritte = rezeptAssistentSchritteAusText(text);
  if (erkannteSchritte.length > 0) {
    daten.zubereitung = erkannteSchritte;
  }

  if (!daten.name && zeilen.length > 0) {
    daten.name = zeilen[0];
  }

  if (daten.zutatenGruppen.length === 0) {
    daten.zutatenGruppen.push({
      name: "Zutaten",
      zutaten: []
    });
  }

  const gesamterText = textNormalisieren(text);
  const automatischGefunden = utensilienWoerter.filter(utensil =>
    gesamterText.includes(textNormalisieren(utensil))
  );

  daten.utensilien = [...new Set([...daten.utensilien, ...automatischGefunden])];

  assistentDaten = daten;

  vorschau.innerHTML = `
    <h3>Vorschau</h3>

    <p><strong>Name:</strong> ${daten.name || "nicht erkannt"}</p>
    <p><strong>Kategorie:</strong> ${daten.kategorie || "Nicht zugeordnet"}</p>
    <p><strong>Portionen:</strong> ${daten.portionen || "nicht erkannt"}</p>
    <p><strong>Zubereitungszeit:</strong> ${daten.zubereitungszeit || "nicht erkannt"}</p>

    <h4>Zutaten</h4>
    ${daten.zutatenGruppen.map(gruppe => `
      <div>
        <strong>${gruppe.name}</strong>
        <ul>
          ${gruppe.zutaten.map(zutat => `<li>${zutatAlsText(zutat)}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h4>Utensilien</h4>
    <ul>
      ${
        daten.utensilien.length > 0
          ? daten.utensilien.map(u => `<li>${u}</li>`).join("")
          : "<li>keine erkannt</li>"
      }
    </ul>

    <h4>Zubereitung</h4>
    <ol>
      ${
        daten.zubereitung.length > 0
          ? daten.zubereitung.map(schritt => `<li>${schritt}</li>`).join("")
          : "<li>keine Schritte erkannt</li>"
      }
    </ol>

    <button type="button" onclick="assistentInsFormularUebernehmenDirekt()">Ins Formular übernehmen</button>
  `;
}



// ===============================
// FIX 1.21: echte Rezeptsuche getrennt von Alle Rezepte anzeigen
// ===============================

function rezeptSucheToggle() {
  safeToggle("rezeptSucheBereich");
  rezeptSucheKategorienFuellen();
}

function rezeptSucheKategorienFuellen() {
  const bereich = document.getElementById("suchKategorieKacheln");
  if (!bereich) return;
  if (bereich.children.length > 0) return;

  const kategorien = typeof KATEGORIEN !== "undefined" ? KATEGORIEN : [];

  bereich.innerHTML =
    `<button class="such-kategorie-kachel aktiv" data-kategorie="" onclick="suchKategorieUmschalten(this)">Alle</button>` +
    kategorien.map(kategorie =>
      `<button class="such-kategorie-kachel" data-kategorie="${kategorie}" onclick="suchKategorieUmschalten(this)">${kategorie}</button>`
    ).join("");
}

function suchKategorieUmschalten(button) {
  const istAlle = button.dataset.kategorie === "";
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");

  if (istAlle) {
    document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
    button.classList.add("aktiv");
  } else {
    if (alleButton) alleButton.classList.remove("aktiv");
    button.classList.toggle("aktiv");

    const aktiveAndere = document.querySelectorAll(".such-kategorie-kachel.aktiv:not([data-kategorie=''])");
    if (aktiveAndere.length === 0 && alleButton) {
      alleButton.classList.add("aktiv");
    }
  }
}

function ausgewaehlteRezeptSucheKategorien() {
  return Array.from(document.querySelectorAll(".such-kategorie-kachel.aktiv"))
    .map(kachel => kachel.dataset.kategorie)
    .filter(kategorie => kategorie !== "");
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(zutat => zutat !== "");

  let ergebnisse = rezepte.map((rezept, index) => {
    const zutaten = zutatenAusRezept(rezept);

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          !suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    return {
      ...rezept,
      index,
      vorhandene,
      fehlende
    };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst =
      nameText === "" ||
      textNormalisieren(rezept.name || "").includes(nameText);

    const zutatenPassen =
      suchZutaten.length === 0 ||
      rezept.vorhandene.length > 0;

    const tags = rezept.tags || [];
    const tagPasst =
      tagText === "" ||
      tags.some(tag => textNormalisieren(tag).includes(tagText));

    const kategoriePasst =
      kategorien.length === 0 ||
      kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) =>
      String(a.kategorie || "").localeCompare(String(b.kategorie || "")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (ergebnisse.length === 0) {
    document.getElementById("ergebnisse").innerHTML = `
      <section class="box">
        <h2>Keine Treffer</h2>
        <p>Es wurde kein passendes Rezept gefunden.</p>
      </section>
    `;
    return;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

window.addEventListener("load", function () {
  rezeptSucheKategorienFuellen();
});



// ===============================
// FIX 1.21.2: Rezeptsuche nach Quelle
// ===============================

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const quelleText = textNormalisieren(document.getElementById("suchQuelleInput")?.value || "");
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(zutat => zutat !== "");

  let ergebnisse = rezepte.map((rezept, index) => {
    const zutaten = zutatenAusRezept(rezept);

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          !suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    return {
      ...rezept,
      index,
      vorhandene,
      fehlende
    };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst =
      nameText === "" ||
      textNormalisieren(rezept.name || "").includes(nameText);

    const zutatenPassen =
      suchZutaten.length === 0 ||
      rezept.vorhandene.length > 0;

    const tags = rezept.tags || [];
    const tagPasst =
      tagText === "" ||
      tags.some(tag => textNormalisieren(tag).includes(tagText));

    const quellePasst =
      quelleText === "" ||
      textNormalisieren(rezept.quelle || "").includes(quelleText);

    const kategoriePasst =
      kategorien.length === 0 ||
      kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) =>
      String(a.kategorie || "").localeCompare(String(b.kategorie || "")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (ergebnisse.length === 0) {
    document.getElementById("ergebnisse").innerHTML = `
      <section class="box">
        <h2>Keine Treffer</h2>
        <p>Es wurde kein passendes Rezept gefunden.</p>
      </section>
    `;
    return;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput", "suchQuelleInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}



// ===============================
// FIX 1.21.5: Trefferanzahl und Quellen-Auswahl
// ===============================

function quellenAusRezepten() {
  const liste = Array.isArray(rezepte) ? rezepte : [];
  const quellen = liste
    .map(rezept => (rezept.quelle || "").trim())
    .filter(quelle => quelle !== "" && quelle !== "Nicht zugeordnet");

  return ["Nicht zugeordnet", ...new Set(quellen)].sort((a, b) => a.localeCompare(b));
}

function quellenListeAktualisieren() {
  const datalist = document.getElementById("quellenListe");
  if (!datalist) return;

  datalist.innerHTML = quellenAusRezepten()
    .map(quelle => `<option value="${quelle}"></option>`)
    .join("");
}

function quelleNormalisierenBeimSpeichern() {
  const input = document.getElementById("quelleInput");
  if (!input) return;

  if (!input.value.trim()) {
    input.value = "Nicht zugeordnet";
  }
}

function rezeptHinzufuegen() {
  quelleNormalisierenBeimSpeichern();

  const name = document.getElementById("nameInput").value.trim();
  const kategorie = document.getElementById("kategorieInput").value || "Nicht zugeordnet";
  const portionen = Number(document.getElementById("portionenInput").value);
  const schwierigkeit = document.getElementById("schwierigkeitInput").value;
  const zubereitungszeit = document.getElementById("zubereitungszeitInput").value.trim();
  const quelle = document.getElementById("quelleInput").value.trim() || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = document.getElementById("zubereitungInput").value.trim();
  const utensilienText = document.getElementById("utensilienInput").value;
  const notizenText = document.getElementById("notizenInput").value.trim();
  const tagsText = document.getElementById("tagsInput").value;

  if (!name || zutaten.length === 0 || !zubereitung || !portionen) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const rezeptDaten = {
    id: bearbeitungsIndex === null ? crypto.randomUUID() : rezepte[bearbeitungsIndex].id,
    favorit: bearbeitungsIndex === null ? false : rezepte[bearbeitungsIndex].favorit || false,
    bewertung: bearbeitungsIndex === null ? 0 : rezepte[bearbeitungsIndex].bewertung || 0,
    name: textTitel(name),
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien: utensilienText.split(",").map(u => textTitel(u.trim())).filter(u => u !== ""),
    notizen: notizenText,
    tags: tagsText.toLowerCase().split(",").map(tag => tag.trim()).filter(tag => tag !== "")
  };

  if (bearbeitungsIndex === null) {
    rezepte.push(rezeptDaten);
    meldungAnzeigen("Rezept gespeichert.");
  } else {
    rezepte[bearbeitungsIndex] = rezeptDaten;
    bearbeitungsIndex = null;
    meldungAnzeigen("Rezept geändert.");
  }

  speichern();
  quellenListeAktualisieren();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
  safeToggle("dashboard");
}

function formularLeeren() {
  bearbeitungsIndex = null;
  document.getElementById("nameInput").value = "";
  document.getElementById("kategorieInput").value = "Nicht zugeordnet";
  document.getElementById("portionenInput").value = "";
  document.getElementById("schwierigkeitInput").value = "";
  document.getElementById("zubereitungszeitInput").value = "";
  document.getElementById("quelleInput").value = "Nicht zugeordnet";
  document.getElementById("zubereitungInput").value = "";
  document.getElementById("utensilienInput").value = "";
  document.getElementById("notizenInput").value = "";
  document.getElementById("tagsInput").value = "";
  document.getElementById("zutatenGruppen").innerHTML = "";
  zutatenGruppeHinzufuegen("Zutaten");
  quellenListeAktualisieren();
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const quelleText = textNormalisieren(document.getElementById("suchQuelleInput")?.value || "");
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(zutat => zutat !== "");

  let ergebnisse = rezepte.map((rezept, index) => {
    const zutaten = zutatenAusRezept(rezept);

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          !suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    return {
      ...rezept,
      index,
      vorhandene,
      fehlende
    };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst =
      nameText === "" ||
      textNormalisieren(rezept.name || "").includes(nameText);

    const zutatenPassen =
      suchZutaten.length === 0 ||
      rezept.vorhandene.length > 0;

    const tags = rezept.tags || [];
    const tagPasst =
      tagText === "" ||
      tags.some(tag => textNormalisieren(tag).includes(tagText));

    const quellePasst =
      quelleText === "" ||
      textNormalisieren(rezept.quelle || "").includes(quelleText);

    const kategoriePasst =
      kategorien.length === 0 ||
      kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) =>
      String(a.kategorie || "").localeCompare(String(b.kategorie || "")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (trefferAnzeige) {
    trefferAnzeige.textContent =
      ergebnisse.length === 1
        ? "1 Treffer gefunden"
        : `${ergebnisse.length} Treffer gefunden`;
  }

  if (ergebnisse.length === 0) {
    document.getElementById("ergebnisse").innerHTML = `
      <section class="box">
        <h2>Keine Treffer</h2>
        <p>Es wurde kein passendes Rezept gefunden.</p>
      </section>
    `;
    return;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput", "suchQuelleInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

window.addEventListener("load", function () {
  quellenListeAktualisieren();
});



// ===============================
// FIX 1.21.6: Quellen-Dropdown in der Suche
// ===============================

function suchQuellenDropdownAktualisieren() {
  const select = document.getElementById("suchQuelleInput");
  if (!select || select.tagName !== "SELECT") return;

  const bisherigeAuswahl = select.value;
  const quellen = quellenAusRezepten();

  select.innerHTML =
    `<option value="">Alle Quellen</option>` +
    quellen.map(quelle => `<option value="${quelle}">${quelle}</option>`).join("");

  if (Array.from(select.options).some(option => option.value === bisherigeAuswahl)) {
    select.value = bisherigeAuswahl;
  }
}

function quellenListeAktualisieren() {
  const datalist = document.getElementById("quellenListe");
  if (datalist) {
    datalist.innerHTML = quellenAusRezepten()
      .map(quelle => `<option value="${quelle}"></option>`)
      .join("");
  }

  suchQuellenDropdownAktualisieren();
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const quelleAuswahl = document.getElementById("suchQuelleInput")?.value || "";
  const quelleText = textNormalisieren(quelleAuswahl);
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(zutat => zutat !== "");

  let ergebnisse = rezepte.map((rezept, index) => {
    const zutaten = zutatenAusRezept(rezept);

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          !suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    return {
      ...rezept,
      index,
      vorhandene,
      fehlende
    };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst =
      nameText === "" ||
      textNormalisieren(rezept.name || "").includes(nameText);

    const zutatenPassen =
      suchZutaten.length === 0 ||
      rezept.vorhandene.length > 0;

    const tags = rezept.tags || [];
    const tagPasst =
      tagText === "" ||
      tags.some(tag => textNormalisieren(tag).includes(tagText));

    const quellePasst =
      quelleText === "" ||
      textNormalisieren(rezept.quelle || "Nicht zugeordnet") === quelleText;

    const kategoriePasst =
      kategorien.length === 0 ||
      kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) =>
      String(a.kategorie || "").localeCompare(String(b.kategorie || "")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (trefferAnzeige) {
    trefferAnzeige.textContent =
      ergebnisse.length === 1
        ? "1 Treffer gefunden"
        : `${ergebnisse.length} Treffer gefunden`;
  }

  if (ergebnisse.length === 0) {
    document.getElementById("ergebnisse").innerHTML = `
      <section class="box">
        <h2>Keine Treffer</h2>
        <p>Es wurde kein passendes Rezept gefunden.</p>
      </section>
    `;
    return;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const quelleSelect = document.getElementById("suchQuelleInput");
  if (quelleSelect) quelleSelect.value = "";

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

window.addEventListener("load", function () {
  quellenListeAktualisieren();
  suchQuellenDropdownAktualisieren();
});



// ===============================
// FIX 1.21.7: Alle Rezepte nach Quelle sortieren
// ===============================

function sortieren(liste) {
  const sortierungInput = document.getElementById("sortierungInput");
  const sortierung = sortierungInput ? sortierungInput.value : "name";

  const kopie = [...liste];

  if (sortierung === "bewertung") {
    kopie.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "neu") {
    kopie.sort((a, b) => (b.index || 0) - (a.index || 0));
  } else if (sortierung === "quelle") {
    kopie.sort((a, b) =>
      String(a.quelle || "Nicht zugeordnet").localeCompare(String(b.quelle || "Nicht zugeordnet")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else {
    kopie.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  return kopie;
}



// ===============================
// FIX 1.21.8: Quelle-Sortierung bei Alle Rezepte anzeigen wirklich aktiv
// ===============================

function sortieren(liste) {
  const sortierungInput = document.getElementById("sortierungInput");
  const sortierung = sortierungInput ? sortierungInput.value : "name";

  const kopie = [...liste];

  if (sortierung === "quelle") {
    kopie.sort((a, b) => {
      const quelleA = String(a.quelle || "Nicht zugeordnet");
      const quelleB = String(b.quelle || "Nicht zugeordnet");
      const quellenVergleich = quelleA.localeCompare(quelleB);

      if (quellenVergleich !== 0) {
        return quellenVergleich;
      }

      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  } else if (sortierung === "bewertung") {
    kopie.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "neu") {
    kopie.sort((a, b) => (b.index || 0) - (a.index || 0));
  } else {
    kopie.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  return kopie;
}

function alleRezepteToggle() {
  const bereich = document.getElementById("sucheBereich");
  const warOffen = bereich && !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  const ergebnisseBereich = document.getElementById("ergebnisse");
  if (ergebnisseBereich) ergebnisseBereich.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  bereich.classList.remove("versteckt");

  let ergebnisse = rezepte.map((rezept, index) => ({
    ...rezept,
    index,
    vorhandene: [],
    fehlende: []
  }));

  ergebnisse = filterBasis(ergebnisse);
  ergebnisse = sortieren(ergebnisse);

  letzteSuchErgebnisse = ergebnisse;
  zeigeErgebnisse(ergebnisse);

  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

function filterAnwenden() {
  let ergebnisse = rezepte.map((rezept, index) => ({
    ...rezept,
    index,
    vorhandene: [],
    fehlende: []
  }));

  ergebnisse = filterBasis(ergebnisse);
  ergebnisse = sortieren(ergebnisse);

  letzteSuchErgebnisse = ergebnisse;
  zeigeErgebnisse(ergebnisse);
}





// ===============================
// FIX 1.23: Nährwerte
// ===============================

function naehrwerteAusFormular() {
  return {
    kalorien: Number(document.getElementById("kalorienInput")?.value || 0),
    eiweiss: Number(document.getElementById("eiweissInput")?.value || 0),
    kohlenhydrate: Number(document.getElementById("kohlenhydrateInput")?.value || 0),
    fett: Number(document.getElementById("fettInput")?.value || 0),
    zucker: Number(document.getElementById("zuckerInput")?.value || 0),
    ballaststoffe: Number(document.getElementById("ballaststoffeInput")?.value || 0),
    salz: Number(document.getElementById("salzInput")?.value || 0)
  };
}

function naehrwerteHtml(naehrwerte) {
  if (!naehrwerte) return "";

  const werte = [
    ["Kalorien", naehrwerte.kalorien, "kcal"],
    ["Eiweiß", naehrwerte.eiweiss, "g"],
    ["Kohlenhydrate", naehrwerte.kohlenhydrate, "g"],
    ["Fett", naehrwerte.fett, "g"],
    ["Zucker", naehrwerte.zucker, "g"],
    ["Ballaststoffe", naehrwerte.ballaststoffe, "g"],
    ["Salz", naehrwerte.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  if (werte.length === 0) return "";

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>
        ${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}
      </ul>
    </div>
  `;
}



// ===============================
// FIX 1.23.2: Nährwerte sichtbar und speicherbar
// ===============================

function naehrwerteAusFormular() {
  return {
    kalorien: Number(document.getElementById("kalorienInput")?.value || 0),
    eiweiss: Number(document.getElementById("eiweissInput")?.value || 0),
    kohlenhydrate: Number(document.getElementById("kohlenhydrateInput")?.value || 0),
    fett: Number(document.getElementById("fettInput")?.value || 0),
    zucker: Number(document.getElementById("zuckerInput")?.value || 0),
    ballaststoffe: Number(document.getElementById("ballaststoffeInput")?.value || 0),
    salz: Number(document.getElementById("salzInput")?.value || 0)
  };
}

function naehrwerteInsFormular(naehrwerte) {
  const n = naehrwerte || {};
  if (document.getElementById("kalorienInput")) document.getElementById("kalorienInput").value = n.kalorien || "";
  if (document.getElementById("eiweissInput")) document.getElementById("eiweissInput").value = n.eiweiss || "";
  if (document.getElementById("kohlenhydrateInput")) document.getElementById("kohlenhydrateInput").value = n.kohlenhydrate || "";
  if (document.getElementById("fettInput")) document.getElementById("fettInput").value = n.fett || "";
  if (document.getElementById("zuckerInput")) document.getElementById("zuckerInput").value = n.zucker || "";
  if (document.getElementById("ballaststoffeInput")) document.getElementById("ballaststoffeInput").value = n.ballaststoffe || "";
  if (document.getElementById("salzInput")) document.getElementById("salzInput").value = n.salz || "";
}

function naehrwerteHtml(naehrwerte) {
  if (!naehrwerte) return "";

  const werte = [
    ["Kalorien", naehrwerte.kalorien, "kcal"],
    ["Eiweiß", naehrwerte.eiweiss, "g"],
    ["Kohlenhydrate", naehrwerte.kohlenhydrate, "g"],
    ["Fett", naehrwerte.fett, "g"],
    ["Zucker", naehrwerte.zucker, "g"],
    ["Ballaststoffe", naehrwerte.ballaststoffe, "g"],
    ["Salz", naehrwerte.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  if (werte.length === 0) return "";

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>
        ${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}
      </ul>
    </div>
  `;
}

function rezeptHinzufuegen() {
  quelleNormalisierenBeimSpeichern && quelleNormalisierenBeimSpeichern();

  const name = document.getElementById("nameInput").value.trim();
  const kategorie = document.getElementById("kategorieInput").value || "Nicht zugeordnet";
  const portionen = Number(document.getElementById("portionenInput").value);
  const schwierigkeit = document.getElementById("schwierigkeitInput").value;
  const zubereitungszeit = document.getElementById("zubereitungszeitInput").value.trim();
  const quelle = document.getElementById("quelleInput").value.trim() || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = document.getElementById("zubereitungInput").value.trim();
  const utensilienText = document.getElementById("utensilienInput").value;
  const notizenText = document.getElementById("notizenInput").value.trim();
  const tagsText = document.getElementById("tagsInput").value;

  if (!name || zutaten.length === 0 || !zubereitung || !portionen) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const rezeptDaten = {
    id: bearbeitungsIndex === null ? crypto.randomUUID() : rezepte[bearbeitungsIndex].id,
    favorit: bearbeitungsIndex === null ? false : rezepte[bearbeitungsIndex].favorit || false,
    bewertung: bearbeitungsIndex === null ? 0 : rezepte[bearbeitungsIndex].bewertung || 0,
    name: textTitel(name),
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien: utensilienText.split(",").map(u => textTitel(u.trim())).filter(u => u !== ""),
    notizen: notizenText,
    tags: tagsText.toLowerCase().split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
    naehrwerte: naehrwerteAusFormular()
  };

  if (bearbeitungsIndex === null) {
    rezepte.push(rezeptDaten);
    meldungAnzeigen("Rezept gespeichert.");
  } else {
    rezepte[bearbeitungsIndex] = rezeptDaten;
    bearbeitungsIndex = null;
    meldungAnzeigen("Rezept geändert.");
  }

  speichern();
  if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
}

function formularLeeren() {
  bearbeitungsIndex = null;
  document.getElementById("nameInput").value = "";
  document.getElementById("kategorieInput").value = "Nicht zugeordnet";
  document.getElementById("portionenInput").value = "";
  document.getElementById("schwierigkeitInput").value = "";
  document.getElementById("zubereitungszeitInput").value = "";
  document.getElementById("quelleInput").value = "Nicht zugeordnet";
  document.getElementById("zubereitungInput").value = "";
  document.getElementById("utensilienInput").value = "";
  document.getElementById("notizenInput").value = "";
  document.getElementById("tagsInput").value = "";
  naehrwerteInsFormular({});
  document.getElementById("zutatenGruppen").innerHTML = "";
  zutatenGruppeHinzufuegen("Zutaten");
  if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
}



// ===============================
// FIX 1.24: Nährwerte pro 100 g, Quellen-Dropdown, Nährwertrechner
// ===============================

function quellenAusRezepten() {
  const liste = Array.isArray(rezepte) ? rezepte : [];
  const quellen = liste
    .map(rezept => (rezept.quelle || "Nicht zugeordnet").trim())
    .filter(quelle => quelle !== "");

  return [...new Set(["Nicht zugeordnet", ...quellen])].sort((a, b) => a.localeCompare(b));
}

function suchQuellenDropdownAktualisieren() {
  const select = document.getElementById("suchQuelleInput");
  if (!select) return;

  const bisherigeAuswahl = select.value;
  const quellen = quellenAusRezepten();

  select.innerHTML =
    `<option value="">Alle Quellen</option>` +
    quellen.map(quelle => `<option value="${quelle}">${quelle}</option>`).join("");

  if (Array.from(select.options).some(option => option.value === bisherigeAuswahl)) {
    select.value = bisherigeAuswahl;
  }
}

function quellenListeAktualisieren() {
  const datalist = document.getElementById("quellenListe");

  if (datalist) {
    datalist.innerHTML = quellenAusRezepten()
      .map(quelle => `<option value="${quelle}"></option>`)
      .join("");
  }

  suchQuellenDropdownAktualisieren();
}

function naehrwerteHtml(naehrwerte, rezeptIndex = null) {
  if (!naehrwerte) return "";

  const werte = [
    ["Kalorien", naehrwerte.kalorien, "kcal"],
    ["Eiweiß", naehrwerte.eiweiss, "g"],
    ["Kohlenhydrate", naehrwerte.kohlenhydrate, "g"],
    ["Fett", naehrwerte.fett, "g"],
    ["Zucker", naehrwerte.zucker, "g"],
    ["Ballaststoffe", naehrwerte.ballaststoffe, "g"],
    ["Salz", naehrwerte.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  if (werte.length === 0) return "";

  const rechnerId = rezeptIndex !== null ? `naehrwertRechner_${rezeptIndex}` : `naehrwertRechner_${Math.random().toString(36).slice(2)}`;
  const ergebnisId = rezeptIndex !== null ? `naehrwertErgebnis_${rezeptIndex}` : `naehrwertErgebnis_${Math.random().toString(36).slice(2)}`;

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>
        ${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}
      </ul>

      <div class="naehrwert-rechner">
        <h4>Nährwertrechner</h4>
        <label for="${rechnerId}">Gegessene Menge in g</label>
        <input type="number" id="${rechnerId}" min="0" step="1" placeholder="z. B. 250">
        <button type="button" onclick="naehrwerteBerechnen(${rezeptIndex}, '${rechnerId}', '${ergebnisId}')">Berechnen</button>
        <div id="${ergebnisId}" class="naehrwert-ergebnis"></div>
      </div>
    </div>
  `;
}

function naehrwerteBerechnen(rezeptIndex, inputId, ergebnisId) {
  const input = document.getElementById(inputId);
  const ergebnis = document.getElementById(ergebnisId);

  if (!input || !ergebnis) return;

  const gramm = Number(input.value || 0);

  if (!gramm || gramm <= 0) {
    ergebnis.innerHTML = "<p>Bitte eine gegessene Menge in Gramm eingeben.</p>";
    return;
  }

  const rezept = rezepte[rezeptIndex];

  if (!rezept || !rezept.naehrwerte) {
    ergebnis.innerHTML = "<p>Für dieses Rezept sind keine Nährwerte gespeichert.</p>";
    return;
  }

  const faktor = gramm / 100;
  const n = rezept.naehrwerte;

  const zeilen = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ]
    .filter(w => Number(w[1]) > 0)
    .map(w => {
      const wert = Number(w[1]) * faktor;
      const ausgabe = w[2] === "kcal" ? Math.round(wert) : wert.toFixed(1);
      return `<li><strong>${w[0]}:</strong> ${ausgabe} ${w[2]}</li>`;
    })
    .join("");

  ergebnis.innerHTML = `
    <p><strong>Nährwerte für ${gramm} g:</strong></p>
    <ul>${zeilen}</ul>
  `;
}

function rezeptSucheToggle() {
  safeToggle("rezeptSucheBereich");
  rezeptSucheKategorienFuellen();
  suchQuellenDropdownAktualisieren();
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const quelleAuswahl = document.getElementById("suchQuelleInput")?.value || "";
  const quelleText = textNormalisieren(quelleAuswahl);
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(zutat => zutat !== "");

  let ergebnisse = rezepte.map((rezept, index) => {
    const zutaten = zutatenAusRezept(rezept);

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat =>
          !suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
        )
      : [];

    return {
      ...rezept,
      index,
      vorhandene,
      fehlende
    };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst =
      nameText === "" ||
      textNormalisieren(rezept.name || "").includes(nameText);

    const zutatenPassen =
      suchZutaten.length === 0 ||
      rezept.vorhandene.length > 0;

    const tags = rezept.tags || [];
    const tagPasst =
      tagText === "" ||
      tags.some(tag => textNormalisieren(tag).includes(tagText));

    const rezeptQuelle = textNormalisieren(rezept.quelle || "Nicht zugeordnet");
    const quellePasst =
      quelleText === "" ||
      rezeptQuelle === quelleText;

    const kategoriePasst =
      kategorien.length === 0 ||
      kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) =>
      String(a.kategorie || "").localeCompare(String(b.kategorie || "")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else if (sortierung === "quelle") {
    ergebnisse.sort((a, b) =>
      String(a.quelle || "Nicht zugeordnet").localeCompare(String(b.quelle || "Nicht zugeordnet")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (trefferAnzeige) {
    trefferAnzeige.textContent =
      ergebnisse.length === 1
        ? "1 Treffer gefunden"
        : `${ergebnisse.length} Treffer gefunden`;
  }

  if (ergebnisse.length === 0) {
    document.getElementById("ergebnisse").innerHTML = `
      <section class="box">
        <h2>Keine Treffer</h2>
        <p>Es wurde kein passendes Rezept gefunden.</p>
      </section>
    `;
    return;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const quelleSelect = document.getElementById("suchQuelleInput");
  if (quelleSelect) quelleSelect.value = "";

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

window.addEventListener("load", function () {
  quellenListeAktualisieren();
  suchQuellenDropdownAktualisieren();
});



// ===============================
// FIX 1.24.1: Nährwertrechner zuverlässig über Rezept-ID
// ===============================

function naehrwerteHtml(naehrwerte, rezeptIndex = null, rezeptId = "") {
  if (!naehrwerte) return "";

  const werte = [
    ["Kalorien", naehrwerte.kalorien, "kcal"],
    ["Eiweiß", naehrwerte.eiweiss, "g"],
    ["Kohlenhydrate", naehrwerte.kohlenhydrate, "g"],
    ["Fett", naehrwerte.fett, "g"],
    ["Zucker", naehrwerte.zucker, "g"],
    ["Ballaststoffe", naehrwerte.ballaststoffe, "g"],
    ["Salz", naehrwerte.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  if (werte.length === 0) return "";

  const basis = String(rezeptId || rezeptIndex || Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_-]/g, "");
  const rechnerId = `naehrwertRechner_${basis}`;
  const ergebnisId = `naehrwertErgebnis_${basis}`;

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>
        ${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}
      </ul>

      <div class="naehrwert-rechner">
        <h4>Nährwertrechner</h4>
        <label for="${rechnerId}">Gegessene Menge in g</label>
        <input type="number" id="${rechnerId}" min="0" step="1" placeholder="z. B. 250">
        <button type="button" onclick="naehrwerteBerechnen('${rezeptId}', ${rezeptIndex === null ? "null" : rezeptIndex}, '${rechnerId}', '${ergebnisId}')">Berechnen</button>
        <div id="${ergebnisId}" class="naehrwert-ergebnis"></div>
      </div>
    </div>
  `;
}

function naehrwerteBerechnen(rezeptId, rezeptIndex, inputId, ergebnisId) {
  const input = document.getElementById(inputId);
  const ergebnis = document.getElementById(ergebnisId);

  if (!input || !ergebnis) return;

  const gramm = Number(input.value || 0);

  if (!gramm || gramm <= 0) {
    ergebnis.innerHTML = "<p>Bitte eine gegessene Menge in Gramm eingeben.</p>";
    return;
  }

  let rezept = null;

  if (rezeptId) {
    rezept = rezepte.find(r => r.id === rezeptId);
  }

  if (!rezept && rezeptIndex !== null && rezeptIndex !== undefined && rezepte[rezeptIndex]) {
    rezept = rezepte[rezeptIndex];
  }

  if (!rezept || !rezept.naehrwerte) {
    ergebnis.innerHTML = "<p>Für dieses Rezept sind keine Nährwerte gespeichert.</p>";
    return;
  }

  const faktor = gramm / 100;
  const n = rezept.naehrwerte;

  const zeilen = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ]
    .filter(w => Number(w[1]) > 0)
    .map(w => {
      const wert = Number(w[1]) * faktor;
      const ausgabe = w[2] === "kcal" ? Math.round(wert) : wert.toFixed(1);
      return `<li><strong>${w[0]}:</strong> ${ausgabe} ${w[2]}</li>`;
    })
    .join("");

  ergebnis.innerHTML = `
    <p><strong>Nährwerte für ${gramm} g:</strong></p>
    <ul>${zeilen}</ul>
  `;
}



// ===============================
// FIX 1.24.2: Nährwertrechner direkt beim Portionsrechner anzeigen
// ===============================

function naehrwerteRechnerHtml(rezept) {
  if (!rezept || !rezept.naehrwerte) return "";

  const werteVorhanden = Object.values(rezept.naehrwerte).some(wert => Number(wert) > 0);
  if (!werteVorhanden) return "";

  const basis = String(rezept.id || rezept.index || Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_-]/g, "");
  const inputId = `naehrwertPortionInput_${basis}`;
  const ergebnisId = `naehrwertPortionErgebnis_${basis}`;

  return `
    <div class="portionsrechner naehrwert-rechner">
      <h3>Nährwerte berechnen</h3>
      <p>Die Nährwerte sind pro 100 g gespeichert. Gib ein, wie viele Gramm du gegessen hast.</p>

      <label for="${inputId}">Gegessene Menge in g</label>
      <input type="number" id="${inputId}" min="0" step="1" placeholder="z. B. 250">

      <button type="button" onclick="naehrwerteBerechnen('${rezept.id || ""}', ${rezept.index ?? "null"}, '${inputId}', '${ergebnisId}')">
        Nährwerte berechnen
      </button>

      <div id="${ergebnisId}" class="naehrwert-ergebnis"></div>
    </div>
  `;
}

function naehrwerteBerechnen(rezeptId, rezeptIndex, inputId, ergebnisId) {
  const input = document.getElementById(inputId);
  const ergebnis = document.getElementById(ergebnisId);

  if (!input || !ergebnis) return;

  const gramm = Number(input.value || 0);

  if (!gramm || gramm <= 0) {
    ergebnis.innerHTML = "<p>Bitte eine gegessene Menge in Gramm eingeben.</p>";
    return;
  }

  let rezept = null;

  if (rezeptId) {
    rezept = rezepte.find(r => r.id === rezeptId);
  }

  if (!rezept && rezeptIndex !== null && rezeptIndex !== undefined && rezepte[rezeptIndex]) {
    rezept = rezepte[rezeptIndex];
  }

  if (!rezept || !rezept.naehrwerte) {
    ergebnis.innerHTML = "<p>Für dieses Rezept sind keine Nährwerte gespeichert.</p>";
    return;
  }

  const faktor = gramm / 100;
  const n = rezept.naehrwerte;

  const zeilen = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ]
    .filter(w => Number(w[1]) > 0)
    .map(w => {
      const wert = Number(w[1]) * faktor;
      const ausgabe = w[2] === "kcal" ? Math.round(wert) : wert.toFixed(1);
      return `<li><strong>${w[0]}:</strong> ${ausgabe} ${w[2]}</li>`;
    })
    .join("");

  ergebnis.innerHTML = `
    <p><strong>Nährwerte für ${gramm} g:</strong></p>
    <ul>${zeilen}</ul>
  `;
}



// ===============================
// FIX 1.24.3: Nährwertrechner wirklich in Rezeptanzeige unter Portionsrechner
// ===============================

function naehrwerteAusFormular() {
  return {
    kalorien: Number(document.getElementById("kalorienInput")?.value || 0),
    eiweiss: Number(document.getElementById("eiweissInput")?.value || 0),
    kohlenhydrate: Number(document.getElementById("kohlenhydrateInput")?.value || 0),
    fett: Number(document.getElementById("fettInput")?.value || 0),
    zucker: Number(document.getElementById("zuckerInput")?.value || 0),
    ballaststoffe: Number(document.getElementById("ballaststoffeInput")?.value || 0),
    salz: Number(document.getElementById("salzInput")?.value || 0)
  };
}

function naehrwerteVorhanden(rezept) {
  return !!(rezept && rezept.naehrwerte && Object.values(rezept.naehrwerte).some(wert => Number(wert) > 0));
}

function naehrwerteKurzHtml(rezept) {
  if (!naehrwerteVorhanden(rezept)) return "";

  const n = rezept.naehrwerte;
  const werte = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}</ul>
    </div>
  `;
}

function naehrwerteRechnerHtml(rezept) {
  if (!naehrwerteVorhanden(rezept)) return "";

  const basis = String(rezept.id || rezept.index || Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_-]/g, "");
  const inputId = `naehrwertMenge_${basis}`;
  const ergebnisId = `naehrwertErgebnis_${basis}`;

  return `
    <div class="portionsrechner naehrwert-rechner">
      <h3>Nährwerte berechnen</h3>
      <p>Die Nährwerte sind pro 100 g gespeichert.</p>
      <input type="number" id="${inputId}" min="0" step="1" placeholder="Gegessene Menge in g, z. B. 250">
      <button type="button" onclick="naehrwerteBerechnen('${rezept.id || ""}', ${rezept.index ?? "null"}, '${inputId}', '${ergebnisId}')">Nährwerte berechnen</button>
      <div id="${ergebnisId}" class="naehrwert-ergebnis"></div>
    </div>
  `;
}

function naehrwerteBerechnen(rezeptId, rezeptIndex, inputId, ergebnisId) {
  const input = document.getElementById(inputId);
  const ergebnis = document.getElementById(ergebnisId);
  if (!input || !ergebnis) return;

  const gramm = Number(input.value || 0);
  if (!gramm || gramm <= 0) {
    ergebnis.innerHTML = "<p>Bitte eine Menge in Gramm eingeben.</p>";
    return;
  }

  let rezept = rezeptId ? rezepte.find(r => r.id === rezeptId) : null;
  if (!rezept && rezeptIndex !== null && rezeptIndex !== undefined) {
    rezept = rezepte[rezeptIndex];
  }

  if (!naehrwerteVorhanden(rezept)) {
    ergebnis.innerHTML = "<p>Für dieses Rezept sind keine Nährwerte gespeichert.</p>";
    return;
  }

  const faktor = gramm / 100;
  const n = rezept.naehrwerte;

  const zeilen = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ]
    .filter(w => Number(w[1]) > 0)
    .map(w => {
      const wert = Number(w[1]) * faktor;
      const ausgabe = w[2] === "kcal" ? Math.round(wert) : wert.toFixed(1);
      return `<li><strong>${w[0]}:</strong> ${ausgabe} ${w[2]}</li>`;
    })
    .join("");

  ergebnis.innerHTML = `<p><strong>Nährwerte für ${gramm} g:</strong></p><ul>${zeilen}</ul>`;
}

function rezeptSpeichern() {
  const name = textTitel(v("nameInput"));
  const kategorie = v("kategorieInput") || "Nicht zugeordnet";
  const portionen = Number(v("portionenInput"));
  const schwierigkeit = v("schwierigkeitInput");
  const zubereitungszeit = v("zubereitungszeitInput");
  const quelle = v("quelleInput") || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = v("zubereitungInput");
  const utensilien = v("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
  const notizen = v("notizenInput");
  const tags = v("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);

  if (!name || !portionen || !zubereitung || zutaten.length === 0) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const warn = zutatenPruefen(zutaten);
  if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) return;

  const alt = bearbeitungsIndex === null ? {} : rezepte[bearbeitungsIndex];

  const rezept = {
    id: alt.id || crypto.randomUUID(),
    favorit: alt.favorit || false,
    bewertung: alt.bewertung || 0,
    name,
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien,
    notizen,
    tags,
    naehrwerte: naehrwerteAusFormular()
  };

  if (bearbeitungsIndex === null) rezepte.push(rezept);
  else rezepte[bearbeitungsIndex] = rezept;

  bearbeitungsIndex = null;
  speichern();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
  alleHauptbereicheVerstecken();
  meldungAnzeigen("Rezept gespeichert.");
}

function zeigeErgebnisse(liste, offenId = null) {
  const b = document.getElementById("ergebnisse");
  b.innerHTML = "";

  if (!rezepte.length) {
    b.innerHTML = "<p>Noch keine Rezepte gespeichert.</p>";
    return;
  }

  if (!liste.length) {
    b.innerHTML = "<p>Keine Rezepte gefunden.</p>";
    return;
  }

  liste.forEach(r => {
    const d = document.createElement("div");
    d.className = "rezept" + (offenId === r.id ? " offen" : "");

    d.innerHTML = `
      <div class="rezept-kopf" onclick="rezeptAufklappen(this)">
        <h2>${r.favorit ? "❤️" : "🤍"} ${esc(r.name)}</h2>
        <div class="kategorie-label">${esc(r.kategorie)}</div>
      </div>

      <div class="rezept-details">
        <p><strong>Portionen:</strong> ${r.portionen || "nicht angegeben"}</p>
        <p><strong>Schwierigkeit:</strong> ${r.schwierigkeit || "nicht angegeben"}</p>
        <p><strong>Zubereitungszeit:</strong> ${r.zubereitungszeit || "nicht angegeben"}</p>
        <p><strong>Quelle:</strong> ${r.quelle || "nicht angegeben"}</p>

        ${naehrwerteKurzHtml(r)}

        <h3>Zutaten</h3>
        ${zutatenGruppenHtml(r)}

        <p class="vorhanden"><strong>Vorhanden:</strong> ${(r.vorhandene || []).map(zutatAlsText).join(", ") || "nicht geprüft"}</p>
        <p class="fehlend"><strong>Fehlt:</strong> ${(r.fehlende || []).map(zutatAlsText).join(", ") || "nicht geprüft"}</p>

        <h3>Zubereitung</h3>
        <ol>${zubereitungsSchritte(r.zubereitung).map(s => `<li>${esc(s)}</li>`).join("")}</ol>

        <h3>Besondere Utensilien / Utensilien</h3>
        <ul>${utensilienHtml(r)}</ul>

        <button onclick="rezeptBearbeiten(${r.index})">Bearbeiten</button>
        <button onclick="rezeptLoeschen(${r.index})">Löschen</button>
        <button onclick="favoritUmschalten(${r.index})">${r.favorit ? "Favorit entfernen" : "Als Favorit speichern"}</button>

        <div class="bewertung">
          <strong>Bewertung:</strong> ${sterneAnzeigen(r.index, r.bewertung || 0)}
        </div>

        <div class="zutat-ersetzen-box">
          <h4>Zur Einkaufsliste hinzufügen</h4>
          <button onclick="rezeptZurEinkaufsliste(${r.index}, 'alle')">Alle Zutaten hinzufügen</button>
          <details>
            <summary>Einzelne Zutaten auswählen</summary>
            ${einkaufsAuswahlHtml(r)}
            <button onclick="rezeptZurEinkaufsliste(${r.index}, 'auswahl')">Ausgewählte Zutaten hinzufügen</button>
          </details>
        </div>

        <p><strong>Portionenrechner</strong></p>
        <input type="number" min="1" id="zielPortionen-${r.index}" placeholder="Gewünschte Portionen">
        <button onclick="portionenBerechnen(${r.index})">Portionen berechnen</button>
        <div id="portionenErgebnis-${r.index}"></div>

        ${naehrwerteRechnerHtml(r)}

        <button onclick="kochmodusStarten(${r.index})">Kochmodus starten</button>
        <div id="kochmodus-${r.index}" class="kochmodus"></div>
      </div>
    `;

    b.appendChild(d);
  });
}



// ===============================
// FIX 1.24.4: Nährwerte bleiben erhalten und Rechner ist sichtbar
// ===============================

function naehrwerteAusFormular() {
  return {
    kalorien: Number(document.getElementById("kalorienInput")?.value || 0),
    eiweiss: Number(document.getElementById("eiweissInput")?.value || 0),
    kohlenhydrate: Number(document.getElementById("kohlenhydrateInput")?.value || 0),
    fett: Number(document.getElementById("fettInput")?.value || 0),
    zucker: Number(document.getElementById("zuckerInput")?.value || 0),
    ballaststoffe: Number(document.getElementById("ballaststoffeInput")?.value || 0),
    salz: Number(document.getElementById("salzInput")?.value || 0)
  };
}

function naehrwerteVorhanden(rezept) {
  return !!(rezept && rezept.naehrwerte && Object.values(rezept.naehrwerte).some(wert => Number(wert) > 0));
}

function naehrwerteKurzHtml(rezept) {
  if (!naehrwerteVorhanden(rezept)) {
    return `
      <div class="naehrwerte-box">
        <h3>Nährwerte pro 100 g</h3>
        <p>Noch keine Nährwerte gespeichert.</p>
      </div>
    `;
  }

  const n = rezept.naehrwerte;
  const werte = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}</ul>
    </div>
  `;
}

function naehrwerteRechnerHtml(rezept) {
  const basis = String(rezept.id || rezept.index || Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_-]/g, "");
  const inputId = `naehrwertMenge_${basis}`;
  const ergebnisId = `naehrwertErgebnis_${basis}`;

  return `
    <div class="portionsrechner naehrwert-rechner">
      <h3>Nährwerte berechnen</h3>
      <p>Gib ein, wie viele Gramm du gegessen hast. Die Berechnung nutzt die gespeicherten Werte pro 100 g.</p>
      <input type="number" id="${inputId}" min="0" step="1" placeholder="Gegessene Menge in g, z. B. 250">
      <button type="button" onclick="naehrwerteBerechnen('${rezept.id || ""}', ${rezept.index ?? "null"}, '${inputId}', '${ergebnisId}')">Nährwerte berechnen</button>
      <div id="${ergebnisId}" class="naehrwert-ergebnis"></div>
    </div>
  `;
}

function naehrwerteBerechnen(rezeptId, rezeptIndex, inputId, ergebnisId) {
  const input = document.getElementById(inputId);
  const ergebnis = document.getElementById(ergebnisId);

  if (!input || !ergebnis) return;

  const gramm = Number(input.value || 0);

  if (!gramm || gramm <= 0) {
    ergebnis.innerHTML = "<p>Bitte eine Menge in Gramm eingeben.</p>";
    return;
  }

  let rezept = rezeptId ? rezepte.find(r => r.id === rezeptId) : null;

  if (!rezept && rezeptIndex !== null && rezeptIndex !== undefined) {
    rezept = rezepte[rezeptIndex];
  }

  if (!naehrwerteVorhanden(rezept)) {
    ergebnis.innerHTML = "<p>Für dieses Rezept sind noch keine Nährwerte gespeichert. Trage sie zuerst beim Bearbeiten des Rezepts ein.</p>";
    return;
  }

  const faktor = gramm / 100;
  const n = rezept.naehrwerte;

  const zeilen = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ]
    .filter(w => Number(w[1]) > 0)
    .map(w => {
      const wert = Number(w[1]) * faktor;
      const ausgabe = w[2] === "kcal" ? Math.round(wert) : wert.toFixed(1);
      return `<li><strong>${w[0]}:</strong> ${ausgabe} ${w[2]}</li>`;
    })
    .join("");

  ergebnis.innerHTML = `<p><strong>Nährwerte für ${gramm} g:</strong></p><ul>${zeilen}</ul>`;
}

function datenstrukturReparieren() {
  rezepte = rezepte.map(r => {
    delete r.bild;

    let gruppen = r.zutatenGruppen || [
      {
        name: "Zutaten",
        zutaten: (r.zutaten || []).map(zutatNormalisieren)
      }
    ];

    gruppen = gruppen.map(g => ({
      name: g.name || "Zutaten",
      zutaten: (g.zutaten || []).map(zutatNormalisieren)
    }));

    return {
      id: r.id || crypto.randomUUID(),
      favorit: r.favorit || false,
      bewertung: r.bewertung || 0,
      portionen: r.portionen || "",
      schwierigkeit: r.schwierigkeit || "",
      zubereitungszeit: r.zubereitungszeit || "",
      quelle: r.quelle || "",
      notizen: r.notizen || (Array.isArray(r.varianten) ? r.varianten.join(", ") : ""),
      tags: r.tags || [],
      utensilien: r.utensilien || [],
      naehrwerte: r.naehrwerte || {},
      name: r.name || "Unbenanntes Rezept",
      kategorie: r.kategorie || "Nicht zugeordnet",
      zutatenGruppen: gruppen,
      zutaten: zutatenAusGruppen(gruppen),
      zubereitung: r.zubereitung || r.anleitung || ""
    };
  });

  speichern();
}

function rezeptSpeichern() {
  const name = textTitel(v("nameInput"));
  const kategorie = v("kategorieInput") || "Nicht zugeordnet";
  const portionen = Number(v("portionenInput"));
  const schwierigkeit = v("schwierigkeitInput");
  const zubereitungszeit = v("zubereitungszeitInput");
  const quelle = v("quelleInput") || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = v("zubereitungInput");
  const utensilien = v("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
  const notizen = v("notizenInput");
  const tags = v("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);

  if (!name || !portionen || !zubereitung || zutaten.length === 0) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const warn = zutatenPruefen(zutaten);
  if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) return;

  const alt = bearbeitungsIndex === null ? {} : rezepte[bearbeitungsIndex];

  const rezept = {
    id: alt.id || crypto.randomUUID(),
    favorit: alt.favorit || false,
    bewertung: alt.bewertung || 0,
    name,
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien,
    notizen,
    tags,
    naehrwerte: naehrwerteAusFormular()
  };

  if (bearbeitungsIndex === null) rezepte.push(rezept);
  else rezepte[bearbeitungsIndex] = rezept;

  bearbeitungsIndex = null;
  speichern();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
  alleHauptbereicheVerstecken();
  meldungAnzeigen("Rezept gespeichert.");
}

function zeigeErgebnisse(liste, offenId = null) {
  const b = document.getElementById("ergebnisse");
  b.innerHTML = "";

  if (!rezepte.length) {
    b.innerHTML = "<p>Noch keine Rezepte gespeichert.</p>";
    return;
  }

  if (!liste.length) {
    b.innerHTML = "<p>Keine Rezepte gefunden.</p>";
    return;
  }

  liste.forEach(r => {
    const d = document.createElement("div");
    d.className = "rezept" + (offenId === r.id ? " offen" : "");

    d.innerHTML = `
      <div class="rezept-kopf" onclick="rezeptAufklappen(this)">
        <h2>${r.favorit ? "❤️" : "🤍"} ${esc(r.name)}</h2>
        <div class="kategorie-label">${esc(r.kategorie)}</div>
      </div>

      <div class="rezept-details">
        <p><strong>Portionen:</strong> ${r.portionen || "nicht angegeben"}</p>
        <p><strong>Schwierigkeit:</strong> ${r.schwierigkeit || "nicht angegeben"}</p>
        <p><strong>Zubereitungszeit:</strong> ${r.zubereitungszeit || "nicht angegeben"}</p>
        <p><strong>Quelle:</strong> ${r.quelle || "nicht angegeben"}</p>

        ${naehrwerteKurzHtml(r)}

        <h3>Zutaten</h3>
        ${zutatenGruppenHtml(r)}

        <p class="vorhanden"><strong>Vorhanden:</strong> ${(r.vorhandene || []).map(zutatAlsText).join(", ") || "nicht geprüft"}</p>
        <p class="fehlend"><strong>Fehlt:</strong> ${(r.fehlende || []).map(zutatAlsText).join(", ") || "nicht geprüft"}</p>

        <h3>Zubereitung</h3>
        <ol>${zubereitungsSchritte(r.zubereitung).map(s => `<li>${esc(s)}</li>`).join("")}</ol>

        <h3>Besondere Utensilien / Utensilien</h3>
        <ul>${utensilienHtml(r)}</ul>

        <button onclick="rezeptBearbeiten(${r.index})">Bearbeiten</button>
        <button onclick="rezeptLoeschen(${r.index})">Löschen</button>
        <button onclick="favoritUmschalten(${r.index})">${r.favorit ? "Favorit entfernen" : "Als Favorit speichern"}</button>

        <div class="bewertung">
          <strong>Bewertung:</strong> ${sterneAnzeigen(r.index, r.bewertung || 0)}
        </div>

        <div class="zutat-ersetzen-box">
          <h4>Zur Einkaufsliste hinzufügen</h4>
          <button onclick="rezeptZurEinkaufsliste(${r.index}, 'alle')">Alle Zutaten hinzufügen</button>
          <details>
            <summary>Einzelne Zutaten auswählen</summary>
            ${einkaufsAuswahlHtml(r)}
            <button onclick="rezeptZurEinkaufsliste(${r.index}, 'auswahl')">Ausgewählte Zutaten hinzufügen</button>
          </details>
        </div>

        <p><strong>Portionenrechner</strong></p>
        <input type="number" min="1" id="zielPortionen-${r.index}" placeholder="Gewünschte Portionen">
        <button onclick="portionenBerechnen(${r.index})">Portionen berechnen</button>
        <div id="portionenErgebnis-${r.index}"></div>

        ${naehrwerteRechnerHtml(r)}

        <button onclick="kochmodusStarten(${r.index})">Kochmodus starten</button>
        <div id="kochmodus-${r.index}" class="kochmodus"></div>
      </div>
    `;

    b.appendChild(d);
  });
}



// ===============================
// FIX 1.24.5: Nährwerte wirklich speichern, bearbeiten und anzeigen
// ===============================

function naehrwerteAusFormular() {
  return {
    kalorien: Number(document.getElementById("kalorienInput")?.value || 0),
    eiweiss: Number(document.getElementById("eiweissInput")?.value || 0),
    kohlenhydrate: Number(document.getElementById("kohlenhydrateInput")?.value || 0),
    fett: Number(document.getElementById("fettInput")?.value || 0),
    zucker: Number(document.getElementById("zuckerInput")?.value || 0),
    ballaststoffe: Number(document.getElementById("ballaststoffeInput")?.value || 0),
    salz: Number(document.getElementById("salzInput")?.value || 0)
  };
}

function naehrwerteInsFormular(naehrwerte) {
  const n = naehrwerte || {};

  const felder = {
    kalorienInput: n.kalorien,
    eiweissInput: n.eiweiss,
    kohlenhydrateInput: n.kohlenhydrate,
    fettInput: n.fett,
    zuckerInput: n.zucker,
    ballaststoffeInput: n.ballaststoffe,
    salzInput: n.salz
  };

  Object.entries(felder).forEach(([id, wert]) => {
    const element = document.getElementById(id);
    if (element) element.value = Number(wert || 0) > 0 ? wert : "";
  });
}

function naehrwerteVorhanden(rezept) {
  return !!(rezept && rezept.naehrwerte && Object.values(rezept.naehrwerte).some(wert => Number(wert) > 0));
}

function naehrwerteKurzHtml(rezept) {
  if (!naehrwerteVorhanden(rezept)) {
    return `
      <div class="naehrwerte-box">
        <h3>Nährwerte pro 100 g</h3>
        <p>Noch keine Nährwerte gespeichert.</p>
      </div>
    `;
  }

  const n = rezept.naehrwerte;
  const werte = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>${werte.map(w => `<li><strong>${w[0]}:</strong> ${w[1]} ${w[2]}</li>`).join("")}</ul>
    </div>
  `;
}

function datenstrukturReparieren() {
  rezepte = rezepte.map(r => {
    delete r.bild;

    let gruppen = r.zutatenGruppen || [
      {
        name: "Zutaten",
        zutaten: (r.zutaten || []).map(zutatNormalisieren)
      }
    ];

    gruppen = gruppen.map(g => ({
      name: g.name || "Zutaten",
      zutaten: (g.zutaten || []).map(zutatNormalisieren)
    }));

    return {
      id: r.id || crypto.randomUUID(),
      favorit: r.favorit || false,
      bewertung: r.bewertung || 0,
      portionen: r.portionen || "",
      schwierigkeit: r.schwierigkeit || "",
      zubereitungszeit: r.zubereitungszeit || "",
      quelle: r.quelle || "",
      notizen: r.notizen || (Array.isArray(r.varianten) ? r.varianten.join(", ") : ""),
      tags: r.tags || [],
      utensilien: r.utensilien || [],
      naehrwerte: r.naehrwerte || {},
      name: r.name || "Unbenanntes Rezept",
      kategorie: r.kategorie || "Nicht zugeordnet",
      zutatenGruppen: gruppen,
      zutaten: zutatenAusGruppen(gruppen),
      zubereitung: r.zubereitung || r.anleitung || ""
    };
  });

  speichern();
}

function rezeptSpeichern() {
  const name = textTitel(v("nameInput"));
  const kategorie = v("kategorieInput") || "Nicht zugeordnet";
  const portionen = Number(v("portionenInput"));
  const schwierigkeit = v("schwierigkeitInput");
  const zubereitungszeit = v("zubereitungszeitInput");
  const quelle = v("quelleInput") || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = v("zubereitungInput");
  const utensilien = v("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
  const notizen = v("notizenInput");
  const tags = v("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const naehrwerte = naehrwerteAusFormular();

  if (!name || !portionen || !zubereitung || zutaten.length === 0) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const warn = zutatenPruefen(zutaten);
  if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) return;

  const alt = bearbeitungsIndex === null ? {} : rezepte[bearbeitungsIndex];

  const rezept = {
    id: alt.id || crypto.randomUUID(),
    favorit: alt.favorit || false,
    bewertung: alt.bewertung || 0,
    name,
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien,
    notizen,
    tags,
    naehrwerte
  };

  if (bearbeitungsIndex === null) rezepte.push(rezept);
  else rezepte[bearbeitungsIndex] = rezept;

  bearbeitungsIndex = null;
  speichern();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
  alleHauptbereicheVerstecken();
  meldungAnzeigen("Rezept gespeichert.");
}

// Manche Buttons in älteren Versionen rufen rezeptHinzufuegen() auf.
function rezeptHinzufuegen() {
  rezeptSpeichern();
}

function rezeptBearbeiten(index) {
  const rezept = rezepte[index];
  if (!rezept) return;

  bearbeitungsIndex = index;
  safeToggle("formularBereich");

  document.getElementById("nameInput").value = rezept.name || "";
  document.getElementById("kategorieInput").value = rezept.kategorie || "Nicht zugeordnet";
  document.getElementById("portionenInput").value = rezept.portionen || "";
  document.getElementById("schwierigkeitInput").value = rezept.schwierigkeit || "";
  document.getElementById("zubereitungszeitInput").value = rezept.zubereitungszeit || "";
  document.getElementById("quelleInput").value = rezept.quelle || "Nicht zugeordnet";
  document.getElementById("zubereitungInput").value = rezept.zubereitung || "";
  document.getElementById("utensilienInput").value = (rezept.utensilien || []).join(", ");
  document.getElementById("notizenInput").value = rezept.notizen || "";
  document.getElementById("tagsInput").value = (rezept.tags || []).join(", ");

  naehrwerteInsFormular(rezept.naehrwerte || {});

  if (typeof zutatenGruppenInsFormularLaden === "function") {
    zutatenGruppenInsFormularLaden(rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }]);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formularLeeren() {
  bearbeitungsIndex = null;

  ["nameInput", "portionenInput", "zubereitungszeitInput", "zubereitungInput", "utensilienInput", "notizenInput", "tagsInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const kategorie = document.getElementById("kategorieInput");
  if (kategorie) kategorie.value = "Nicht zugeordnet";

  const schwierigkeit = document.getElementById("schwierigkeitInput");
  if (schwierigkeit) schwierigkeit.value = "";

  const quelle = document.getElementById("quelleInput");
  if (quelle) quelle.value = "Nicht zugeordnet";

  naehrwerteInsFormular({});

  const gruppen = document.getElementById("zutatenGruppen");
  if (gruppen) {
    gruppen.innerHTML = "";
    zutatenGruppeHinzufuegen("Zutaten");
  }

  if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
}



// ===============================
// FIX 1.24.6: Beim neuen Rezept automatisch 10 Zutaten-Zeilen
// ===============================

function zutatenZeilenAufMinimum(minimum = 10) {
  const gruppenContainer = document.getElementById("zutatenGruppen");
  if (!gruppenContainer) return;

  let ersteGruppe = gruppenContainer.querySelector(".zutaten-gruppe");

  if (!ersteGruppe) {
    zutatenGruppeHinzufuegen("Zutaten");
    ersteGruppe = gruppenContainer.querySelector(".zutaten-gruppe");
  }

  if (!ersteGruppe) return;

  let zutatenContainer =
    ersteGruppe.querySelector(".zutaten-liste") ||
    ersteGruppe.querySelector(".zutaten-container") ||
    ersteGruppe;

  let aktuelleZeilen = ersteGruppe.querySelectorAll(".zutat-zeile, .zutaten-zeile").length;

  // Falls die App keine Klassen nutzt, zählen wir Menge-Felder.
  if (aktuelleZeilen === 0) {
    aktuelleZeilen = ersteGruppe.querySelectorAll("input").length / 3;
  }

  for (let i = aktuelleZeilen; i < minimum; i++) {
    if (typeof zutatZeileHinzufuegen === "function") {
      zutatZeileHinzufuegen(ersteGruppe);
    } else if (typeof zutatHinzufuegen === "function") {
      zutatHinzufuegen(ersteGruppe);
    } else {
      // Fallback: einfache Zutatenzeile erzeugen
      const zeile = document.createElement("div");
      zeile.className = "zutat-zeile";
      zeile.innerHTML = `
        <input type="text" class="zutat-menge" placeholder="Menge">
        <input type="text" class="zutat-einheit" placeholder="Einheit">
        <input type="text" class="zutat-name" placeholder="Zutat">
      `;
      zutatenContainer.appendChild(zeile);
    }
  }
}

function rezeptHinzufuegenToggle() {
  const bereich = document.getElementById("formularBereich");
  if (!bereich) return;

  const warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  formularLeeren();
  zutatenZeilenAufMinimum(10);

  bereich.classList.remove("versteckt");
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

function formularLeeren() {
  bearbeitungsIndex = null;

  ["nameInput", "portionenInput", "zubereitungszeitInput", "zubereitungInput", "utensilienInput", "notizenInput", "tagsInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const kategorie = document.getElementById("kategorieInput");
  if (kategorie) kategorie.value = "Nicht zugeordnet";

  const schwierigkeit = document.getElementById("schwierigkeitInput");
  if (schwierigkeit) schwierigkeit.value = "";

  const quelle = document.getElementById("quelleInput");
  if (quelle) quelle.value = "Nicht zugeordnet";

  if (typeof naehrwerteInsFormular === "function") {
    naehrwerteInsFormular({});
  }

  const gruppen = document.getElementById("zutatenGruppen");
  if (gruppen) {
    gruppen.innerHTML = "";
    zutatenGruppeHinzufuegen("Zutaten");
    zutatenZeilenAufMinimum(10);
  }

  if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
}



// ===============================
// FIX 1.24.7: 10 Zutatenpunkte innerhalb einer Zutatenkategorie
// ===============================

function zutatZeilenInGruppe(gruppe) {
  if (!gruppe) return [];

  const zeilen = Array.from(gruppe.querySelectorAll(".zutat-zeile"));

  if (zeilen.length > 0) return zeilen;

  // Fallback für ältere Struktur
  return Array.from(gruppe.querySelectorAll(".zutaten-zeile, .zutat-row"));
}

function zutatZeileDirektErzeugen() {
  const zeile = document.createElement("div");
  zeile.className = "zutat-zeile";

  zeile.innerHTML = `
    <input type="text" class="zutat-menge" placeholder="Menge">
    <input type="text" class="zutat-einheit" placeholder="Einheit">
    <input type="text" class="zutat-name" placeholder="Zutat">
    <button type="button" onclick="this.parentElement.remove()">Entfernen</button>
  `;

  return zeile;
}

function zutatZeileZurGruppeHinzufuegenDirekt(gruppe) {
  if (!gruppe) return;

  const liste =
    gruppe.querySelector(".zutaten-liste") ||
    gruppe.querySelector(".zutaten-container") ||
    gruppe;

  // Wenn es die Originalfunktion gibt und sie eine Gruppe akzeptiert, zuerst versuchen.
  if (typeof zutatZeileHinzufuegen === "function") {
    try {
      const vorher = zutatZeilenInGruppe(gruppe).length;
      zutatZeileHinzufuegen(gruppe);
      const nachher = zutatZeilenInGruppe(gruppe).length;
      if (nachher > vorher) return;
    } catch (fehler) {
      // Fallback darunter
    }
  }

  if (typeof zutatHinzufuegen === "function") {
    try {
      const vorher = zutatZeilenInGruppe(gruppe).length;
      zutatHinzufuegen(gruppe);
      const nachher = zutatZeilenInGruppe(gruppe).length;
      if (nachher > vorher) return;
    } catch (fehler) {
      // Fallback darunter
    }
  }

  liste.appendChild(zutatZeileDirektErzeugen());
}

function ersteZutatenGruppeFindenOderErstellen() {
  const container = document.getElementById("zutatenGruppen");
  if (!container) return null;

  let gruppe = container.querySelector(".zutaten-gruppe");

  if (!gruppe) {
    zutatenGruppeHinzufuegen("Zutaten");
    gruppe = container.querySelector(".zutaten-gruppe");
  }

  return gruppe;
}

function zutatenZeilenAufMinimum(minimum = 10) {
  const gruppe = ersteZutatenGruppeFindenOderErstellen();
  if (!gruppe) return;

  let aktuelleZeilen = zutatZeilenInGruppe(gruppe).length;

  while (aktuelleZeilen < minimum) {
    zutatZeileZurGruppeHinzufuegenDirekt(gruppe);
    aktuelleZeilen = zutatZeilenInGruppe(gruppe).length;

    // Sicherheitsabbruch, falls irgendeine fremde Struktur nicht erkannt wird.
    if (aktuelleZeilen > 30) break;
  }
}

function formularLeeren() {
  bearbeitungsIndex = null;

  ["nameInput", "portionenInput", "zubereitungszeitInput", "zubereitungInput", "utensilienInput", "notizenInput", "tagsInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const kategorie = document.getElementById("kategorieInput");
  if (kategorie) kategorie.value = "Nicht zugeordnet";

  const schwierigkeit = document.getElementById("schwierigkeitInput");
  if (schwierigkeit) schwierigkeit.value = "";

  const quelle = document.getElementById("quelleInput");
  if (quelle) quelle.value = "Nicht zugeordnet";

  if (typeof naehrwerteInsFormular === "function") {
    naehrwerteInsFormular({});
  }

  const gruppen = document.getElementById("zutatenGruppen");
  if (gruppen) {
    gruppen.innerHTML = "";
    zutatenGruppeHinzufuegen("Zutaten");
    zutatenZeilenAufMinimum(10);
  }

  if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
}

function rezeptHinzufuegenToggle() {
  const bereich = document.getElementById("formularBereich");
  if (!bereich) return;

  const warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  formularLeeren();

  bereich.classList.remove("versteckt");
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}



// ===============================
// FIX 1.24.8: 10 echte Zutatenzeilen in EINER Zutatenkategorie
// ===============================

function zutatenGruppeMitZehnLeerenZeilenErstellen() {
  const container = document.getElementById("zutatenGruppen");
  if (!container) return;

  container.innerHTML = "";

  // Originalfunktion verwenden, damit die Struktur exakt zur App passt.
  zutatenGruppeHinzufuegen("Zutaten", []);

  const gruppe = container.querySelector(".zutatengruppe");
  const zeilenContainer = gruppe ? gruppe.querySelector(".zutaten-zeilen") : null;

  if (!zeilenContainer) return;

  // Die Originalfunktion erzeugt bei leeren Zutaten bereits 1 Zeile.
  // Wir entfernen alle leeren Zeilen und erzeugen exakt 10 normale App-Zeilen.
  zeilenContainer.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    zutatenZeileHinzufuegen(zeilenContainer, "", "", "");
  }
}

function formularLeeren() {
  bearbeitungsIndex = null;

  ["nameInput", "portionenInput", "zubereitungszeitInput", "zubereitungInput", "utensilienInput", "notizenInput", "tagsInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const kategorie = document.getElementById("kategorieInput");
  if (kategorie) kategorie.value = "Nicht zugeordnet";

  const schwierigkeit = document.getElementById("schwierigkeitInput");
  if (schwierigkeit) schwierigkeit.value = "";

  const quelle = document.getElementById("quelleInput");
  if (quelle) quelle.value = "Nicht zugeordnet";

  if (typeof naehrwerteInsFormular === "function") {
    naehrwerteInsFormular({});
  }

  zutatenGruppeMitZehnLeerenZeilenErstellen();

  if (typeof quellenListeAktualisieren === "function") {
    quellenListeAktualisieren();
  }
}

function rezeptHinzufuegenToggle() {
  const bereich = document.getElementById("formularBereich");
  if (!bereich) return;

  const warOffen = !bereich.classList.contains("versteckt");

  alleHauptbereicheVerstecken();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  formularLeeren();

  bereich.classList.remove("versteckt");
  window.scrollTo({ top: bereich.offsetTop - 20, behavior: "smooth" });
}

// Bearbeiten darf NICHT auf 10 leere Zeilen setzen, sondern muss gespeicherte Zutaten anzeigen.
function rezeptBearbeiten(index) {
  const rezept = rezepte[index];
  if (!rezept) return;

  bearbeitungsIndex = index;
  safeToggle("formularBereich");

  document.getElementById("nameInput").value = rezept.name || "";
  document.getElementById("kategorieInput").value = rezept.kategorie || "Nicht zugeordnet";
  document.getElementById("portionenInput").value = rezept.portionen || "";
  document.getElementById("schwierigkeitInput").value = rezept.schwierigkeit || "";
  document.getElementById("zubereitungszeitInput").value = rezept.zubereitungszeit || "";
  document.getElementById("quelleInput").value = rezept.quelle || "Nicht zugeordnet";
  document.getElementById("zubereitungInput").value = rezept.zubereitung || "";
  document.getElementById("utensilienInput").value = (rezept.utensilien || []).join(", ");
  document.getElementById("notizenInput").value = rezept.notizen || "";
  document.getElementById("tagsInput").value = (rezept.tags || []).join(", ");

  if (typeof naehrwerteInsFormular === "function") {
    naehrwerteInsFormular(rezept.naehrwerte || {});
  }

  zutatenGruppenInsFormularLaden(
    rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }]
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}



// ===============================
// FIX 1.24.9: automatische Nährwert-Tags
// ===============================

function automatischeNaehrwertTags(naehrwerte) {
  if (!naehrwerte) return [];

  const tags = [];

  const kalorien = Number(naehrwerte.kalorien || 0);
  const eiweiss = Number(naehrwerte.eiweiss || 0);
  const kohlenhydrate = Number(naehrwerte.kohlenhydrate || 0);
  const fett = Number(naehrwerte.fett || 0);

  if (eiweiss > 0) {
    if (eiweiss >= 15) tags.push("proteinreich");
    if (eiweiss < 5) tags.push("proteinarm");
  }

  if (kohlenhydrate > 0) {
    if (kohlenhydrate < 10) tags.push("kh-arm");
    if (kohlenhydrate >= 30) tags.push("kh-reich");
  }

  if (fett > 0) {
    if (fett < 5) tags.push("fettarm");
    if (fett >= 20) tags.push("fettreich");
  }

  if (kalorien > 0) {
    if (kalorien < 150) tags.push("kalorienarm");
    if (kalorien >= 300) tags.push("kalorienreich");
  }

  return tags;
}

function tagsMitAutomatischenNaehrwertTags(tags, naehrwerte) {
  const manuelleTags = (tags || [])
    .map(tag => String(tag).trim().toLowerCase())
    .filter(Boolean);

  const automatischeTags = automatischeNaehrwertTags(naehrwerte);

  return [...new Set([...manuelleTags, ...automatischeTags])];
}

function rezeptSpeichern() {
  const name = textTitel(v("nameInput"));
  const kategorie = v("kategorieInput") || "Nicht zugeordnet";
  const portionen = Number(v("portionenInput"));
  const schwierigkeit = v("schwierigkeitInput");
  const zubereitungszeit = v("zubereitungszeitInput");
  const quelle = v("quelleInput") || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = v("zubereitungInput");
  const utensilien = v("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
  const notizen = v("notizenInput");
  const tagsManuell = v("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const naehrwerte = naehrwerteAusFormular();
  const tags = tagsMitAutomatischenNaehrwertTags(tagsManuell, naehrwerte);

  if (!name || !portionen || !zubereitung || zutaten.length === 0) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const warn = zutatenPruefen(zutaten);
  if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) return;

  const alt = bearbeitungsIndex === null ? {} : rezepte[bearbeitungsIndex];

  const rezept = {
    id: alt.id || crypto.randomUUID(),
    favorit: alt.favorit || false,
    bewertung: alt.bewertung || 0,
    name,
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien,
    notizen,
    tags,
    naehrwerte
  };

  if (bearbeitungsIndex === null) rezepte.push(rezept);
  else rezepte[bearbeitungsIndex] = rezept;

  bearbeitungsIndex = null;
  speichern();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
  alleHauptbereicheVerstecken();
  meldungAnzeigen("Rezept gespeichert. Automatische Nährwert-Tags wurden ergänzt.");
}

function rezeptHinzufuegen() {
  rezeptSpeichern();
}

function naehrwertTagsHtml(rezept) {
  const autoTags = automatischeNaehrwertTags(rezept.naehrwerte || {});
  if (autoTags.length === 0) return "";

  return `
    <div class="naehrwert-tags">
      <strong>Nährwert-Einteilung:</strong>
      ${autoTags.map(tag => `<span class="tag-chip">${tag}</span>`).join("")}
    </div>
  `;
}

// Sichtbare Einteilung zusätzlich in der geöffneten Rezeptkarte anzeigen
const alteNaehrwerteKurzHtml_1249 = naehrwerteKurzHtml;
function naehrwerteKurzHtml(rezept) {
  return alteNaehrwerteKurzHtml_1249(rezept) + naehrwertTagsHtml(rezept);
}



// ===============================
// FIX 1.25: automatische Nährwert-Einteilung wirklich speichern und anzeigen
// ===============================

const AUTOMATISCHE_NAEHRWERT_TAGS = [
  "proteinreich",
  "proteinarm",
  "kh-arm",
  "kh-reich",
  "fettarm",
  "fettreich",
  "kalorienarm",
  "kalorienreich"
];

function automatischeNaehrwertTags(naehrwerte) {
  const n = naehrwerte || {};
  const tags = [];

  const kalorien = Number(n.kalorien || 0);
  const eiweiss = Number(n.eiweiss || 0);
  const kohlenhydrate = Number(n.kohlenhydrate || 0);
  const fett = Number(n.fett || 0);

  if (eiweiss > 0) {
    if (eiweiss >= 15) tags.push("proteinreich");
    if (eiweiss < 5) tags.push("proteinarm");
  }

  if (kohlenhydrate > 0) {
    if (kohlenhydrate < 10) tags.push("kh-arm");
    if (kohlenhydrate >= 30) tags.push("kh-reich");
  }

  if (fett > 0) {
    if (fett < 5) tags.push("fettarm");
    if (fett >= 20) tags.push("fettreich");
  }

  if (kalorien > 0) {
    if (kalorien < 150) tags.push("kalorienarm");
    if (kalorien >= 300) tags.push("kalorienreich");
  }

  return tags;
}

function manuelleTagsBereinigen(tags) {
  return (tags || [])
    .map(tag => String(tag).trim().toLowerCase())
    .filter(tag => tag !== "" && !AUTOMATISCHE_NAEHRWERT_TAGS.includes(tag));
}

function tagsMitAutomatischenNaehrwertTags(tags, naehrwerte) {
  return [
    ...new Set([
      ...manuelleTagsBereinigen(tags),
      ...automatischeNaehrwertTags(naehrwerte)
    ])
  ];
}

function naehrwertTagsHtml(rezept) {
  const autoTags = automatischeNaehrwertTags(rezept && rezept.naehrwerte ? rezept.naehrwerte : {});
  if (autoTags.length === 0) return "";

  return `
    <div class="naehrwert-tags">
      <strong>Nährwert-Einteilung:</strong>
      ${autoTags.map(tag => `<span class="tag-chip">${tag}</span>`).join("")}
    </div>
  `;
}

function rezeptSpeichern() {
  const name = textTitel(v("nameInput"));
  const kategorie = v("kategorieInput") || "Nicht zugeordnet";
  const portionen = Number(v("portionenInput"));
  const schwierigkeit = v("schwierigkeitInput");
  const zubereitungszeit = v("zubereitungszeitInput");
  const quelle = v("quelleInput") || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = v("zubereitungInput");
  const utensilien = v("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
  const notizen = v("notizenInput");
  const tagsManuell = v("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const naehrwerte = naehrwerteAusFormular();
  const tags = tagsMitAutomatischenNaehrwertTags(tagsManuell, naehrwerte);

  if (!name || !portionen || !zubereitung || zutaten.length === 0) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return;
  }

  const warn = zutatenPruefen(zutaten);
  if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) return;

  const alt = bearbeitungsIndex === null ? {} : rezepte[bearbeitungsIndex];

  const rezept = {
    id: alt.id || crypto.randomUUID(),
    favorit: alt.favorit || false,
    bewertung: alt.bewertung || 0,
    name,
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien,
    notizen,
    tags,
    naehrwerte
  };

  if (bearbeitungsIndex === null) rezepte.push(rezept);
  else rezepte[bearbeitungsIndex] = rezept;

  bearbeitungsIndex = null;
  speichern();
  formularLeeren();
  dashboardAktualisieren();
  document.getElementById("ergebnisse").innerHTML = "";
  alleHauptbereicheVerstecken();
  meldungAnzeigen("Rezept gespeichert. Automatische Nährwert-Tags wurden ergänzt.");
}

function rezeptHinzufuegen() {
  rezeptSpeichern();
}

function datenstrukturReparieren() {
  rezepte = rezepte.map(r => {
    delete r.bild;

    let gruppen = r.zutatenGruppen || [
      {
        name: "Zutaten",
        zutaten: (r.zutaten || []).map(zutatNormalisieren)
      }
    ];

    gruppen = gruppen.map(g => ({
      name: g.name || "Zutaten",
      zutaten: (g.zutaten || []).map(zutatNormalisieren)
    }));

    const naehrwerte = r.naehrwerte || {};
    const tags = tagsMitAutomatischenNaehrwertTags(r.tags || [], naehrwerte);

    return {
      id: r.id || crypto.randomUUID(),
      favorit: r.favorit || false,
      bewertung: r.bewertung || 0,
      portionen: r.portionen || "",
      schwierigkeit: r.schwierigkeit || "",
      zubereitungszeit: r.zubereitungszeit || "",
      quelle: r.quelle || "",
      notizen: r.notizen || (Array.isArray(r.varianten) ? r.varianten.join(", ") : ""),
      tags,
      utensilien: r.utensilien || [],
      naehrwerte,
      name: r.name || "Unbenanntes Rezept",
      kategorie: r.kategorie || "Nicht zugeordnet",
      zutatenGruppen: gruppen,
      zutaten: zutatenAusGruppen(gruppen),
      zubereitung: r.zubereitung || r.anleitung || ""
    };
  });

  speichern();
}

// Anzeige: an bestehende Nährwertbox anhängen, falls vorhanden
if (typeof naehrwerteKurzHtml === "function") {
  const naehrwerteKurzHtmlVor125 = naehrwerteKurzHtml;
  naehrwerteKurzHtml = function(rezept) {
    return naehrwerteKurzHtmlVor125(rezept) + naehrwertTagsHtml(rezept);
  };
}



// ===============================
// FIX 1.25 FINAL: Speichern nutzt garantiert automatische Nährwert-Tags
// ===============================

function rezeptSpeichern() {
  const name = textTitel(v("nameInput"));
  const kategorie = v("kategorieInput") || "Nicht zugeordnet";
  const portionen = Number(v("portionenInput"));
  const schwierigkeit = v("schwierigkeitInput");
  const zubereitungszeit = v("zubereitungszeitInput");
  const quelle = v("quelleInput") || "Nicht zugeordnet";
  const zutatenGruppen = zutatenGruppenAusFormularLesen();
  const zutaten = zutatenAusGruppen(zutatenGruppen);
  const zubereitung = v("zubereitungInput");
  const utensilien = v("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
  const notizen = v("notizenInput");
  const manuelleTags = v("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const naehrwerte = naehrwerteAusFormular();
  const tags = tagsMitAutomatischenNaehrwertTags(manuelleTags, naehrwerte);

  if (!name || !portionen || !zubereitung || zutaten.length === 0) {
    meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
    return false;
  }

  const warn = zutatenPruefen(zutaten);
  if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) return false;

  const alt = bearbeitungsIndex === null ? {} : rezepte[bearbeitungsIndex];

  const rezept = {
    id: alt.id || crypto.randomUUID(),
    favorit: alt.favorit || false,
    bewertung: alt.bewertung || 0,
    name,
    kategorie,
    portionen,
    schwierigkeit,
    zubereitungszeit,
    quelle,
    zutatenGruppen,
    zutaten,
    zubereitung,
    utensilien,
    notizen,
    tags,
    naehrwerte
  };

  if (bearbeitungsIndex === null) {
    rezepte.push(rezept);
  } else {
    rezepte[bearbeitungsIndex] = rezept;
  }

  bearbeitungsIndex = null;
  speichern();

  if (typeof formularLeeren === "function") formularLeeren();
  if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  if (typeof alleHauptbereicheVerstecken === "function") alleHauptbereicheVerstecken();

  meldungAnzeigen("Rezept gespeichert. Automatische Nährwert-Tags wurden ergänzt.");
  return true;
}

function rezeptHinzufuegen() {
  return rezeptSpeichern();
}



// ===============================
// FIX 1.25.1: Rezeptsuche mit Quelle repariert
// ===============================

function quellenAusRezepten() {
  const liste = Array.isArray(rezepte) ? rezepte : [];
  const quellen = liste
    .map(rezept => (rezept.quelle || "Nicht zugeordnet").trim())
    .filter(quelle => quelle !== "");

  return [...new Set(["Nicht zugeordnet", ...quellen])].sort((a, b) => a.localeCompare(b));
}

function suchQuellenDropdownAktualisieren() {
  const select = document.getElementById("suchQuelleInput");
  if (!select) return;

  const bisherigeAuswahl = select.value || "";
  const quellen = quellenAusRezepten();

  select.innerHTML =
    `<option value="">Alle Quellen</option>` +
    quellen.map(quelle => `<option value="${quelle}">${quelle}</option>`).join("");

  if (Array.from(select.options).some(option => option.value === bisherigeAuswahl)) {
    select.value = bisherigeAuswahl;
  }
}

function rezeptSucheToggle() {
  safeToggle("rezeptSucheBereich");
  rezeptSucheKategorienFuellen();
  suchQuellenDropdownAktualisieren();
}

function rezeptSucheAusfuehren() {
  try {
    const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
    const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
    const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
    const quelleAuswahl = document.getElementById("suchQuelleInput")?.value || "";
    const quelleText = textNormalisieren(quelleAuswahl);
    const kategorien = typeof ausgewaehlteRezeptSucheKategorien === "function"
      ? ausgewaehlteRezeptSucheKategorien()
      : [];
    const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
    const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

    const suchZutaten = zutatenText
      .split(",")
      .map(zutat => zutat.trim())
      .filter(zutat => zutat !== "");

    let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => {
      const zutaten = typeof zutatenAusRezept === "function"
        ? zutatenAusRezept(rezept)
        : (rezept.zutaten || []);

      const vorhandene = suchZutaten.length > 0
        ? zutaten.filter(zutat =>
            suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
          )
        : [];

      const fehlende = suchZutaten.length > 0
        ? zutaten.filter(zutat =>
            !suchZutaten.some(eingabeZutat => zutatPasst(eingabeZutat, zutat))
          )
        : [];

      return {
        ...rezept,
        index,
        vorhandene,
        fehlende
      };
    });

    ergebnisse = ergebnisse.filter(rezept => {
      const namePasst =
        nameText === "" ||
        textNormalisieren(rezept.name || "").includes(nameText);

      const zutatenPassen =
        suchZutaten.length === 0 ||
        rezept.vorhandene.length > 0;

      const tags = rezept.tags || [];
      const tagPasst =
        tagText === "" ||
        tags.some(tag => textNormalisieren(tag).includes(tagText));

      const rezeptQuelle = textNormalisieren(rezept.quelle || "Nicht zugeordnet");
      const quellePasst =
        quelleText === "" ||
        rezeptQuelle === quelleText;

      const kategoriePasst =
        kategorien.length === 0 ||
        kategorien.includes(rezept.kategorie);

      return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
    });

    if (sortierung === "bewertung") {
      ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
    } else if (sortierung === "kategorie") {
      ergebnisse.sort((a, b) =>
        String(a.kategorie || "").localeCompare(String(b.kategorie || "")) ||
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    } else if (sortierung === "quelle") {
      ergebnisse.sort((a, b) =>
        String(a.quelle || "Nicht zugeordnet").localeCompare(String(b.quelle || "Nicht zugeordnet")) ||
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    } else {
      ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    }

    letzteSuchErgebnisse = ergebnisse;

    if (trefferAnzeige) {
      trefferAnzeige.textContent =
        ergebnisse.length === 1
          ? "1 Treffer gefunden"
          : `${ergebnisse.length} Treffer gefunden`;
    }

    const ergebnisBox = document.getElementById("ergebnisse");

    if (ergebnisse.length === 0) {
      ergebnisBox.innerHTML = `
        <section class="box">
          <h2>Keine Treffer</h2>
          <p>Es wurde kein passendes Rezept gefunden.</p>
        </section>
      `;
      return;
    }

    zeigeErgebnisse(ergebnisse);
  } catch (fehler) {
    console.error("Fehler in der Rezeptsuche:", fehler);
    const ergebnisBox = document.getElementById("ergebnisse");
    if (ergebnisBox) {
      ergebnisBox.innerHTML = `
        <section class="box">
          <h2>Fehler bei der Suche</h2>
          <p>Die Suche konnte nicht ausgeführt werden. Bitte lade die Seite neu.</p>
        </section>
      `;
    }
  }
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const quelleSelect = document.getElementById("suchQuelleInput");
  if (quelleSelect) quelleSelect.value = "";

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

window.addEventListener("load", function () {
  suchQuellenDropdownAktualisieren();
});



// ===============================
// FIX 1.25.2: Rezeptsuche und Ergebnisanzeige stabilisiert
// ===============================

function quellenAusRezepten() {
  const liste = Array.isArray(rezepte) ? rezepte : [];
  const quellen = liste
    .map(rezept => String(rezept.quelle || "Nicht zugeordnet").trim())
    .filter(quelle => quelle !== "");

  return [...new Set(["Nicht zugeordnet", ...quellen])].sort((a, b) => a.localeCompare(b));
}

function suchQuellenDropdownAktualisieren() {
  const select = document.getElementById("suchQuelleInput");
  if (!select) return;

  const bisherigeAuswahl = select.value || "";
  const quellen = quellenAusRezepten();

  select.innerHTML =
    `<option value="">Alle Quellen</option>` +
    quellen.map(quelle => `<option value="${esc(quelle)}">${esc(quelle)}</option>`).join("");

  if (Array.from(select.options).some(option => option.value === bisherigeAuswahl)) {
    select.value = bisherigeAuswahl;
  }
}

function rezeptSucheKategorienFuellen() {
  const bereich = document.getElementById("suchKategorieKacheln");
  if (!bereich) return;
  if (bereich.children.length > 0) return;

  const kategorien = typeof KATEGORIEN !== "undefined" ? KATEGORIEN : [];

  bereich.innerHTML =
    `<button class="such-kategorie-kachel aktiv" data-kategorie="" onclick="suchKategorieUmschalten(this)">Alle</button>` +
    kategorien.map(kategorie =>
      `<button class="such-kategorie-kachel" data-kategorie="${esc(kategorie)}" onclick="suchKategorieUmschalten(this)">${esc(kategorie)}</button>`
    ).join("");
}

function suchKategorieUmschalten(button) {
  const istAlle = button.dataset.kategorie === "";
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");

  if (istAlle) {
    document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
    button.classList.add("aktiv");
  } else {
    if (alleButton) alleButton.classList.remove("aktiv");
    button.classList.toggle("aktiv");

    const aktiveAndere = document.querySelectorAll(".such-kategorie-kachel.aktiv:not([data-kategorie=''])");
    if (aktiveAndere.length === 0 && alleButton) alleButton.classList.add("aktiv");
  }
}

function ausgewaehlteRezeptSucheKategorien() {
  return Array.from(document.querySelectorAll(".such-kategorie-kachel.aktiv"))
    .map(kachel => kachel.dataset.kategorie)
    .filter(kategorie => kategorie !== "");
}

function rezeptSucheToggle() {
  safeToggle("rezeptSucheBereich");
  rezeptSucheKategorienFuellen();
  suchQuellenDropdownAktualisieren();
}

function einfacheZutatenAusRezept(rezept) {
  if (typeof zutatenAusRezept === "function") {
    return zutatenAusRezept(rezept);
  }

  if (Array.isArray(rezept.zutaten)) {
    return rezept.zutaten;
  }

  if (Array.isArray(rezept.zutatenGruppen)) {
    return rezept.zutatenGruppen.flatMap(gruppe => gruppe.zutaten || []);
  }

  return [];
}

function einfacheZutatPasst(suchwort, zutat) {
  if (typeof zutatPasst === "function") {
    return zutatPasst(suchwort, zutat);
  }

  return textNormalisieren(zutat.name || zutat || "").includes(textNormalisieren(suchwort));
}

function sichereNaehrwerteKurzHtml(rezept) {
  if (typeof naehrwerteKurzHtml === "function") {
    try {
      return naehrwerteKurzHtml(rezept);
    } catch (fehler) {
      console.warn("Nährwerte konnten nicht angezeigt werden:", fehler);
    }
  }

  return "";
}

function sichereNaehrwerteRechnerHtml(rezept) {
  if (typeof naehrwerteRechnerHtml === "function") {
    try {
      return naehrwerteRechnerHtml(rezept);
    } catch (fehler) {
      console.warn("Nährwertrechner konnte nicht angezeigt werden:", fehler);
    }
  }

  return "";
}

function zeigeErgebnisse(liste, offenId = null) {
  const box = document.getElementById("ergebnisse");
  if (!box) return;

  box.innerHTML = "";

  if (!Array.isArray(liste) || liste.length === 0) {
    box.innerHTML = "<p>Keine Rezepte gefunden.</p>";
    return;
  }

  liste.forEach(rezept => {
    const div = document.createElement("div");
    div.className = "rezept" + (offenId === rezept.id ? " offen" : "");

    const zutatenHtml = typeof zutatenGruppenHtml === "function"
      ? zutatenGruppenHtml(rezept)
      : "";

    const utensilienAnzeige = typeof utensilienHtml === "function"
      ? utensilienHtml(rezept)
      : ((rezept.utensilien || []).map(u => `<li>${esc(u)}</li>`).join("") || "<li>keine</li>");

    const einkaufHtml = typeof einkaufsAuswahlHtml === "function"
      ? einkaufsAuswahlHtml(rezept)
      : "";

    div.innerHTML = `
      <div class="rezept-kopf" onclick="rezeptAufklappen(this)">
        <h2>${rezept.favorit ? "❤️" : "🤍"} ${esc(rezept.name || "Unbenanntes Rezept")}</h2>
        <div class="kategorie-label">${esc(rezept.kategorie || "Nicht zugeordnet")}</div>
      </div>

      <div class="rezept-details">
        <p><strong>Portionen:</strong> ${rezept.portionen || "nicht angegeben"}</p>
        <p><strong>Schwierigkeit:</strong> ${rezept.schwierigkeit || "nicht angegeben"}</p>
        <p><strong>Zubereitungszeit:</strong> ${rezept.zubereitungszeit || "nicht angegeben"}</p>
        <p><strong>Quelle:</strong> ${rezept.quelle || "nicht angegeben"}</p>

        ${sichereNaehrwerteKurzHtml(rezept)}

        <h3>Zutaten</h3>
        ${zutatenHtml}

        <p class="vorhanden"><strong>Vorhanden:</strong> ${(rezept.vorhandene || []).map(zutatAlsText).join(", ") || "nicht geprüft"}</p>
        <p class="fehlend"><strong>Fehlt:</strong> ${(rezept.fehlende || []).map(zutatAlsText).join(", ") || "nicht geprüft"}</p>

        <h3>Zubereitung</h3>
        <ol>${zubereitungsSchritte(rezept.zubereitung || "").map(s => `<li>${esc(s)}</li>`).join("")}</ol>

        <h3>Besondere Utensilien / Utensilien</h3>
        <ul>${utensilienAnzeige}</ul>

        <button onclick="rezeptBearbeiten(${rezept.index})">Bearbeiten</button>
        <button onclick="rezeptLoeschen(${rezept.index})">Löschen</button>
        <button onclick="favoritUmschalten(${rezept.index})">${rezept.favorit ? "Favorit entfernen" : "Als Favorit speichern"}</button>

        <div class="bewertung">
          <strong>Bewertung:</strong> ${sterneAnzeigen(rezept.index, rezept.bewertung || 0)}
        </div>

        <div class="zutat-ersetzen-box">
          <h4>Zur Einkaufsliste hinzufügen</h4>
          <button onclick="rezeptZurEinkaufsliste(${rezept.index}, 'alle')">Alle Zutaten hinzufügen</button>
          <details>
            <summary>Einzelne Zutaten auswählen</summary>
            ${einkaufHtml}
            <button onclick="rezeptZurEinkaufsliste(${rezept.index}, 'auswahl')">Ausgewählte Zutaten hinzufügen</button>
          </details>
        </div>

        <p><strong>Portionenrechner</strong></p>
        <input type="number" min="1" id="zielPortionen-${rezept.index}" placeholder="Gewünschte Portionen">
        <button onclick="portionenBerechnen(${rezept.index})">Portionen berechnen</button>
        <div id="portionenErgebnis-${rezept.index}"></div>

        ${sichereNaehrwerteRechnerHtml(rezept)}

        <button onclick="kochmodusStarten(${rezept.index})">Kochmodus starten</button>
        <div id="kochmodus-${rezept.index}" class="kochmodus"></div>
      </div>
    `;

    box.appendChild(div);
  });
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const quelleAuswahl = document.getElementById("suchQuelleInput")?.value || "";
  const quelleText = textNormalisieren(quelleAuswahl);
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(Boolean);

  let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => {
    const zutaten = einfacheZutatenAusRezept(rezept);

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat => suchZutaten.some(eingabe => einfacheZutatPasst(eingabe, zutat)))
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat => !suchZutaten.some(eingabe => einfacheZutatPasst(eingabe, zutat)))
      : [];

    return { ...rezept, index, vorhandene, fehlende };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst = nameText === "" || textNormalisieren(rezept.name || "").includes(nameText);
    const zutatenPassen = suchZutaten.length === 0 || rezept.vorhandene.length > 0;
    const tagPasst = tagText === "" || (rezept.tags || []).some(tag => textNormalisieren(tag).includes(tagText));
    const quellePasst = quelleText === "" || textNormalisieren(rezept.quelle || "Nicht zugeordnet") === quelleText;
    const kategoriePasst = kategorien.length === 0 || kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) => String(a.kategorie || "").localeCompare(String(b.kategorie || "")) || String(a.name || "").localeCompare(String(b.name || "")));
  } else if (sortierung === "quelle") {
    ergebnisse.sort((a, b) => String(a.quelle || "Nicht zugeordnet").localeCompare(String(b.quelle || "Nicht zugeordnet")) || String(a.name || "").localeCompare(String(b.name || "")));
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (trefferAnzeige) {
    trefferAnzeige.textContent = ergebnisse.length === 1 ? "1 Treffer gefunden" : `${ergebnisse.length} Treffer gefunden`;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput", "suchTagInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const quelleSelect = document.getElementById("suchQuelleInput");
  if (quelleSelect) quelleSelect.value = "";

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

window.addEventListener("load", function () {
  rezeptSucheKategorienFuellen();
  suchQuellenDropdownAktualisieren();
});



// ===============================
// FIX 1.26: automatische Backups
// ===============================

const AUTO_BACKUP_KEY = "rezeptfinder_auto_backups_v1";
const AUTO_BACKUP_MAX = 8;

function autoBackupLesen() {
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_KEY);
    const daten = raw ? JSON.parse(raw) : [];
    return Array.isArray(daten) ? daten : [];
  } catch (fehler) {
    console.warn("Automatische Backups konnten nicht gelesen werden:", fehler);
    return [];
  }
}

function autoBackupSchreiben(backups) {
  localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backups.slice(0, AUTO_BACKUP_MAX)));
}

function automatischesBackupErstellen(grund = "Änderung") {
  try {
    if (!Array.isArray(rezepte) || rezepte.length === 0) return;

    const backups = autoBackupLesen();

    const snapshot = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      zeit: new Date().toISOString(),
      grund,
      anzahl: rezepte.length,
      rezepte: JSON.parse(JSON.stringify(rezepte))
    };

    backups.unshift(snapshot);
    autoBackupSchreiben(backups);

    const hinweis = document.getElementById("backupHinweis");
    if (hinweis) {
      hinweis.textContent = `Automatische Sicherung erstellt: ${rezepte.length} Rezept(e).`;
    }
  } catch (fehler) {
    console.warn("Automatisches Backup fehlgeschlagen:", fehler);
  }
}

function datumLesbar(iso) {
  try {
    return new Date(iso).toLocaleString("de-DE");
  } catch {
    return iso || "Unbekannt";
  }
}

function automatischeBackupsAnzeigen() {
  const container = document.getElementById("autoBackupListe");
  if (!container) return;

  const backups = autoBackupLesen();

  if (backups.length === 0) {
    container.innerHTML = "<p>Noch keine automatische Sicherung vorhanden.</p>";
    return;
  }

  container.innerHTML = backups.map((backup, index) => `
    <div class="auto-backup-eintrag">
      <strong>${datumLesbar(backup.zeit)}</strong><br>
      <span>${backup.anzahl || 0} Rezept(e) · ${backup.grund || "Sicherung"}</span><br>
      <button type="button" onclick="automatischesBackupWiederherstellen(${index})">Wiederherstellen</button>
      <button type="button" onclick="automatischesBackupHerunterladen(${index})">Herunterladen</button>
    </div>
  `).join("");
}

function automatischesBackupWiederherstellen(index) {
  const backups = autoBackupLesen();
  const backup = backups[index];

  if (!backup || !Array.isArray(backup.rezepte)) {
    meldungAnzeigen("Dieses automatische Backup konnte nicht gelesen werden.", true);
    return;
  }

  if (!confirm(`Backup vom ${datumLesbar(backup.zeit)} mit ${backup.rezepte.length} Rezept(en) wiederherstellen? Aktuelle Daten werden ersetzt.`)) {
    return;
  }

  if (Array.isArray(rezepte) && rezepte.length > 0) {
    automatischesBackupErstellen("Vor Wiederherstellung");
  }

  rezepte = JSON.parse(JSON.stringify(backup.rezepte));
  speichern();

  if (typeof datenstrukturReparieren === "function") {
    datenstrukturReparieren();
  }

  dashboardAktualisieren();
  automatischeBackupsAnzeigen();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  meldungAnzeigen("Automatisches Backup wurde wiederhergestellt.");
}

function automatischesBackupHerunterladen(index) {
  const backups = autoBackupLesen();
  const backup = backups[index];

  if (!backup || !Array.isArray(backup.rezepte)) {
    meldungAnzeigen("Dieses automatische Backup konnte nicht heruntergeladen werden.", true);
    return;
  }

  const blob = new Blob([JSON.stringify(backup.rezepte, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `rezeptfinder-auto-backup-${backup.zeit.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function backupExportieren() {
  const blob = new Blob([JSON.stringify(rezepte, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  const datum = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `rezeptfinder-backup-${datum}.json`;
  a.click();
  URL.revokeObjectURL(a.href);

  localStorage.setItem("rezeptfinder_letzter_manueller_export", new Date().toISOString());
  meldungAnzeigen("Backup wurde heruntergeladen.");
}

function backupWarnungAktualisieren() {
  const hinweis = document.getElementById("backupHinweis");
  if (!hinweis) return;

  const letzterExport = localStorage.getItem("rezeptfinder_letzter_manueller_export");
  const anzahl = Array.isArray(rezepte) ? rezepte.length : 0;

  if (anzahl === 0) {
    hinweis.textContent = "Noch keine Rezepte gespeichert.";
    return;
  }

  if (!letzterExport) {
    hinweis.textContent = "Wichtig: Du hast noch kein manuelles Backup heruntergeladen.";
    return;
  }

  hinweis.textContent = `Letztes manuelles Backup: ${datumLesbar(letzterExport)}`;
}

// Speichern überschreiben: vor dem Überschreiben automatisch sichern
const speichernVorAutoBackup126 = typeof speichern === "function" ? speichern : null;
function speichern() {
  try {
    const vorhandene = localStorage.getItem("rezepte");
    if (vorhandene) {
      const alteRezepte = JSON.parse(vorhandene);
      if (Array.isArray(alteRezepte) && alteRezepte.length > 0) {
        const aktuelleBackups = autoBackupLesen();
        const letzter = aktuelleBackups[0];
        const gleicherStand = letzter && JSON.stringify(letzter.rezepte) === JSON.stringify(alteRezepte);

        if (!gleicherStand) {
          const snapshot = {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            zeit: new Date().toISOString(),
            grund: "Vor Änderung",
            anzahl: alteRezepte.length,
            rezepte: alteRezepte
          };
          aktuelleBackups.unshift(snapshot);
          autoBackupSchreiben(aktuelleBackups);
        }
      }
    }
  } catch (fehler) {
    console.warn("Backup vor Speichern fehlgeschlagen:", fehler);
  }

  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  backupWarnungAktualisieren();
}

window.addEventListener("load", function () {
  backupWarnungAktualisieren();
  automatischeBackupsAnzeigen();
});



// ===============================
// FIX 1.27: verwendete Tags vorschlagen und in Suche auswählen
// ===============================

function tagsAusRezepten() {
  const liste = Array.isArray(rezepte) ? rezepte : [];
  const tags = [];

  liste.forEach(rezept => {
    (rezept.tags || []).forEach(tag => {
      const sauber = String(tag || "").trim().toLowerCase();
      if (sauber) tags.push(sauber);
    });
  });

  return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
}

function tagsListeAktualisieren() {
  const datalist = document.getElementById("tagsListe");
  if (datalist) {
    datalist.innerHTML = tagsAusRezepten()
      .map(tag => `<option value="${esc(tag)}"></option>`)
      .join("");
  }

  suchTagsDropdownAktualisieren();
}

function suchTagsDropdownAktualisieren() {
  const select = document.getElementById("suchTagInput");
  if (!select) return;

  const bisher = select.value || "";
  const tags = tagsAusRezepten();

  select.innerHTML =
    `<option value="">Alle Tags</option>` +
    tags.map(tag => `<option value="${esc(tag)}">${esc(tag)}</option>`).join("");

  if (Array.from(select.options).some(option => option.value === bisher)) {
    select.value = bisher;
  }
}

function rezeptSucheToggle() {
  safeToggle("rezeptSucheBereich");
  rezeptSucheKategorienFuellen();
  if (typeof suchQuellenDropdownAktualisieren === "function") suchQuellenDropdownAktualisieren();
  suchTagsDropdownAktualisieren();
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagText = textNormalisieren(document.getElementById("suchTagInput")?.value || "");
  const quelleAuswahl = document.getElementById("suchQuelleInput")?.value || "";
  const quelleText = textNormalisieren(quelleAuswahl);
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(Boolean);

  let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => {
    const zutaten = typeof einfacheZutatenAusRezept === "function"
      ? einfacheZutatenAusRezept(rezept)
      : (typeof zutatenAusRezept === "function" ? zutatenAusRezept(rezept) : (rezept.zutaten || []));

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat => suchZutaten.some(eingabe => {
          if (typeof einfacheZutatPasst === "function") return einfacheZutatPasst(eingabe, zutat);
          if (typeof zutatPasst === "function") return zutatPasst(eingabe, zutat);
          return textNormalisieren(zutat.name || zutat || "").includes(textNormalisieren(eingabe));
        }))
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat => !suchZutaten.some(eingabe => {
          if (typeof einfacheZutatPasst === "function") return einfacheZutatPasst(eingabe, zutat);
          if (typeof zutatPasst === "function") return zutatPasst(eingabe, zutat);
          return textNormalisieren(zutat.name || zutat || "").includes(textNormalisieren(eingabe));
        }))
      : [];

    return { ...rezept, index, vorhandene, fehlende };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst = nameText === "" || textNormalisieren(rezept.name || "").includes(nameText);
    const zutatenPassen = suchZutaten.length === 0 || rezept.vorhandene.length > 0;
    const tagPasst = tagText === "" || (rezept.tags || []).some(tag => textNormalisieren(tag) === tagText);
    const quellePasst = quelleText === "" || textNormalisieren(rezept.quelle || "Nicht zugeordnet") === quelleText;
    const kategoriePasst = kategorien.length === 0 || kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) => String(a.kategorie || "").localeCompare(String(b.kategorie || "")) || String(a.name || "").localeCompare(String(b.name || "")));
  } else if (sortierung === "quelle") {
    ergebnisse.sort((a, b) => String(a.quelle || "Nicht zugeordnet").localeCompare(String(b.quelle || "Nicht zugeordnet")) || String(a.name || "").localeCompare(String(b.name || "")));
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (trefferAnzeige) {
    trefferAnzeige.textContent = ergebnisse.length === 1 ? "1 Treffer gefunden" : `${ergebnisse.length} Treffer gefunden`;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const tagSelect = document.getElementById("suchTagInput");
  if (tagSelect) tagSelect.value = "";

  const quelleSelect = document.getElementById("suchQuelleInput");
  if (quelleSelect) quelleSelect.value = "";

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}

// Beim Speichern und Start Tag-Vorschläge aktualisieren
const speichernVorTags127 = typeof speichern === "function" ? speichern : null;
function speichern() {
  if (speichernVorTags127) {
    speichernVorTags127();
  } else {
    localStorage.setItem("rezepte", JSON.stringify(rezepte));
  }

  tagsListeAktualisieren();
}

window.addEventListener("load", function () {
  tagsListeAktualisieren();
  suchTagsDropdownAktualisieren();
});



// ===============================
// FIX 1.28: mehrere Tags in der Suche auswählen
// ===============================

function ausgewaehlteSuchTags() {
  const select = document.getElementById("suchTagInput");
  if (!select) return [];

  return Array.from(select.selectedOptions || [])
    .map(option => textNormalisieren(option.value))
    .filter(Boolean);
}

function suchTagsDropdownAktualisieren() {
  const select = document.getElementById("suchTagInput");
  if (!select) return;

  const bisher = Array.from(select.selectedOptions || []).map(option => option.value);
  const tags = tagsAusRezepten();

  select.innerHTML = tags
    .map(tag => `<option value="${esc(tag)}">${esc(tag)}</option>`)
    .join("");

  Array.from(select.options).forEach(option => {
    option.selected = bisher.includes(option.value);
  });
}

function rezeptSucheAusfuehren() {
  const nameText = textNormalisieren(document.getElementById("suchNameInput")?.value || "");
  const zutatenText = textNormalisieren(document.getElementById("suchZutatenInput")?.value || "");
  const tagAuswahl = ausgewaehlteSuchTags();
  const quelleAuswahl = document.getElementById("suchQuelleInput")?.value || "";
  const quelleText = textNormalisieren(quelleAuswahl);
  const kategorien = ausgewaehlteRezeptSucheKategorien();
  const sortierung = document.getElementById("suchSortierungInput")?.value || "name";
  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");

  const suchZutaten = zutatenText
    .split(",")
    .map(zutat => zutat.trim())
    .filter(Boolean);

  let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => {
    const zutaten = typeof einfacheZutatenAusRezept === "function"
      ? einfacheZutatenAusRezept(rezept)
      : (typeof zutatenAusRezept === "function" ? zutatenAusRezept(rezept) : (rezept.zutaten || []));

    const vorhandene = suchZutaten.length > 0
      ? zutaten.filter(zutat => suchZutaten.some(eingabe => {
          if (typeof einfacheZutatPasst === "function") return einfacheZutatPasst(eingabe, zutat);
          if (typeof zutatPasst === "function") return zutatPasst(eingabe, zutat);
          return textNormalisieren(zutat.name || zutat || "").includes(textNormalisieren(eingabe));
        }))
      : [];

    const fehlende = suchZutaten.length > 0
      ? zutaten.filter(zutat => !suchZutaten.some(eingabe => {
          if (typeof einfacheZutatPasst === "function") return einfacheZutatPasst(eingabe, zutat);
          if (typeof zutatPasst === "function") return zutatPasst(eingabe, zutat);
          return textNormalisieren(zutat.name || zutat || "").includes(textNormalisieren(eingabe));
        }))
      : [];

    return { ...rezept, index, vorhandene, fehlende };
  });

  ergebnisse = ergebnisse.filter(rezept => {
    const namePasst = nameText === "" || textNormalisieren(rezept.name || "").includes(nameText);
    const zutatenPassen = suchZutaten.length === 0 || rezept.vorhandene.length > 0;

    const rezeptTags = (rezept.tags || []).map(tag => textNormalisieren(tag));
    const tagPasst =
      tagAuswahl.length === 0 ||
      tagAuswahl.some(tag => rezeptTags.includes(tag));

    const quellePasst = quelleText === "" || textNormalisieren(rezept.quelle || "Nicht zugeordnet") === quelleText;
    const kategoriePasst = kategorien.length === 0 || kategorien.includes(rezept.kategorie);

    return namePasst && zutatenPassen && tagPasst && quellePasst && kategoriePasst;
  });

  if (sortierung === "bewertung") {
    ergebnisse.sort((a, b) => (b.bewertung || 0) - (a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    ergebnisse.sort((a, b) => String(a.kategorie || "").localeCompare(String(b.kategorie || "")) || String(a.name || "").localeCompare(String(b.name || "")));
  } else if (sortierung === "quelle") {
    ergebnisse.sort((a, b) => String(a.quelle || "Nicht zugeordnet").localeCompare(String(b.quelle || "Nicht zugeordnet")) || String(a.name || "").localeCompare(String(b.name || "")));
  } else {
    ergebnisse.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  letzteSuchErgebnisse = ergebnisse;

  if (trefferAnzeige) {
    trefferAnzeige.textContent = ergebnisse.length === 1 ? "1 Treffer gefunden" : `${ergebnisse.length} Treffer gefunden`;
  }

  zeigeErgebnisse(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const tagSelect = document.getElementById("suchTagInput");
  if (tagSelect) {
    Array.from(tagSelect.options).forEach(option => option.selected = false);
  }

  const quelleSelect = document.getElementById("suchQuelleInput");
  if (quelleSelect) quelleSelect.value = "";

  const sortierung = document.getElementById("suchSortierungInput");
  if (sortierung) sortierung.value = "name";

  document.querySelectorAll(".such-kategorie-kachel").forEach(kachel => kachel.classList.remove("aktiv"));
  const alleButton = document.querySelector(".such-kategorie-kachel[data-kategorie='']");
  if (alleButton) alleButton.classList.add("aktiv");

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  const trefferAnzeige = document.getElementById("suchTrefferAnzeige");
  if (trefferAnzeige) trefferAnzeige.textContent = "";

  letzteSuchErgebnisse = [];
  meldungAnzeigen("Suche zurückgesetzt.");
}



// ===============================
// VERSION 1.29 CLOUD: Supabase-Verbindung
// ===============================

const SUPABASE_URL = "https://pkobmwkljznvhmlrnfqb.supabase.co";
const SUPABASE_KEY = "sb_publishable_BLAWDMMEdsmaGSEUjXcVTA_J19pb-Oe";
let supabaseClient = null;
let cloudAktiv = false;
let cloudSpeichertGerade = false;

function cloudStatus(text, istFehler = false) {
  const element = document.getElementById("cloudStatusText");
  if (element) {
    element.textContent = text;
    element.style.color = istFehler ? "#dc2626" : "#166534";
  }
  console.log("Cloud:", text);
}

function cloudInit() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      cloudStatus("Supabase konnte nicht geladen werden. Internet prüfen.", true);
      return false;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    cloudAktiv = true;
    cloudStatus("verbunden");
    return true;
  } catch (fehler) {
    console.error("Cloud-Verbindung fehlgeschlagen:", fehler);
    cloudStatus("Verbindung fehlgeschlagen", true);
    return false;
  }
}

function rezeptFuerCloud(rezept) {
  const kopie = JSON.parse(JSON.stringify(rezept || {}));

  // Supabase row-id und Rezept-id sollen gleich bleiben, wenn möglich.
  if (!kopie.id) {
    kopie.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  }

  return kopie;
}

async function cloudLaden() {
  if (!cloudAktiv && !cloudInit()) return;

  try {
    cloudStatus("lade Rezepte ...");

    const { data, error } = await supabaseClient
      .from("rezepte")
      .select("id, name, daten, aktualisiert_am")
      .order("aktualisiert_am", { ascending: false });

    if (error) throw error;

    const cloudRezepte = (data || [])
      .map(row => {
        const rezept = row.daten || {};
        rezept.id = rezept.id || row.id;
        return rezept;
      })
      .filter(rezept => rezept && rezept.name);

    if (cloudRezepte.length === 0) {
      cloudStatus("Cloud ist leer");
      return;
    }

    const lokalAnzahl = Array.isArray(rezepte) ? rezepte.length : 0;

    if (lokalAnzahl > 0) {
      const ok = confirm(`Cloud enthält ${cloudRezepte.length} Rezept(e). Lokale App enthält ${lokalAnzahl} Rezept(e). Lokale Daten durch Cloud ersetzen?`);
      if (!ok) {
        cloudStatus("Laden abgebrochen");
        return;
      }
    }

    rezepte = cloudRezepte;
    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    if (typeof datenstrukturReparieren === "function") {
      datenstrukturReparieren();
    }

    if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    if (typeof tagsListeAktualisieren === "function") tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();

    const ergebnisse = document.getElementById("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";

    cloudStatus(`${rezepte.length} Rezept(e) aus Cloud geladen`);
  } catch (fehler) {
    console.error("Cloud-Laden fehlgeschlagen:", fehler);
    cloudStatus("Laden fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  }
}

async function cloudSpeichernAlle() {
  if (!cloudAktiv && !cloudInit()) return;
  if (cloudSpeichertGerade) return;

  try {
    cloudSpeichertGerade = true;

    const liste = Array.isArray(rezepte) ? rezepte : [];

    if (liste.length === 0) {
      cloudStatus("keine Rezepte zum Speichern");
      return;
    }

    cloudStatus("speichere in Cloud ...");

    const rows = liste.map(rezept => {
      const r = rezeptFuerCloud(rezept);
      rezept.id = r.id;

      return {
        id: r.id,
        name: r.name || "Unbenanntes Rezept",
        daten: r,
        aktualisiert_am: new Date().toISOString()
      };
    });

    const { error } = await supabaseClient
      .from("rezepte")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;

    localStorage.setItem("rezepte", JSON.stringify(rezepte));
    cloudStatus(`${rows.length} Rezept(e) in Cloud gespeichert`);
  } catch (fehler) {
    console.error("Cloud-Speichern fehlgeschlagen:", fehler);
    cloudStatus("Speichern fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  } finally {
    cloudSpeichertGerade = false;
  }
}

async function cloudRezeptLoeschen(rezeptId) {
  if (!cloudAktiv && !cloudInit()) return;
  if (!rezeptId) return;

  try {
    const { error } = await supabaseClient
      .from("rezepte")
      .delete()
      .eq("id", rezeptId);

    if (error) throw error;
    cloudStatus("Rezept auch aus Cloud gelöscht");
  } catch (fehler) {
    console.warn("Cloud-Löschen fehlgeschlagen:", fehler);
    cloudStatus("Cloud-Löschen fehlgeschlagen", true);
  }
}

// Lokales Speichern erweitern: erst lokal sichern, dann Cloud aktualisieren.
const speichernVorCloud129 = typeof speichern === "function" ? speichern : null;
function speichern() {
  if (speichernVorCloud129) {
    speichernVorCloud129();
  } else {
    localStorage.setItem("rezepte", JSON.stringify(rezepte));
  }

  // Fire-and-forget, damit die App nicht hängen bleibt.
  if (cloudAktiv) {
    cloudSpeichernAlle();
  }
}

// Löschen erweitern, falls die alte Funktion vorhanden ist.
const rezeptLoeschenVorCloud129 = typeof rezeptLoeschen === "function" ? rezeptLoeschen : null;
function rezeptLoeschen(index) {
  const rezept = Array.isArray(rezepte) ? rezepte[index] : null;
  const rezeptId = rezept && rezept.id;

  if (rezeptLoeschenVorCloud129) {
    rezeptLoeschenVorCloud129(index);
  }

  if (cloudAktiv && rezeptId) {
    cloudRezeptLoeschen(rezeptId);
  }
}

window.addEventListener("load", function () {
  cloudInit();

  // Beim Start erst prüfen, ob Cloud Daten hat. Nicht automatisch ersetzen, um nichts zu überschreiben.
  setTimeout(async function () {
    if (!cloudAktiv) return;

    try {
      const { data, error } = await supabaseClient
        .from("rezepte")
        .select("id", { count: "exact" })
        .limit(1);

      if (error) throw error;

      const lokalAnzahl = Array.isArray(rezepte) ? rezepte.length : 0;

      if ((data || []).length > 0 && lokalAnzahl === 0) {
        cloudStatus("Cloud hat Rezepte. Klicke auf „Aus Cloud laden“.");
      } else if (lokalAnzahl > 0) {
        cloudStatus(`verbunden · ${lokalAnzahl} lokale Rezept(e)`);
      } else {
        cloudStatus("verbunden · noch keine Rezepte");
      }
    } catch (fehler) {
      console.warn("Cloud-Prüfung fehlgeschlagen:", fehler);
      cloudStatus("Cloud-Prüfung fehlgeschlagen", true);
    }
  }, 800);
});



// ===============================
// VERSION 1.29.2 CLOUD: automatisches Laden und Speichern
// ===============================

let cloudAutoSyncAktiv = true;
let cloudAutoSaveTimer = null;
let cloudHatBeimStartGeladen = false;

async function cloudAnzahlLesen() {
  if (!cloudAktiv && !cloudInit()) return 0;

  const { count, error } = await supabaseClient
    .from("rezepte")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

async function cloudAutoLadenBeimStart() {
  if (!cloudAktiv && !cloudInit()) return;

  try {
    cloudStatus("prüfe Cloud ...");

    const cloudAnzahl = await cloudAnzahlLesen();
    const lokalAnzahl = Array.isArray(rezepte) ? rezepte.length : 0;

    if (cloudAnzahl > 0 && lokalAnzahl === 0) {
      cloudStatus("lade automatisch aus Cloud ...");

      const { data, error } = await supabaseClient
        .from("rezepte")
        .select("id, name, daten, aktualisiert_am")
        .order("aktualisiert_am", { ascending: false });

      if (error) throw error;

      rezepte = (data || [])
        .map(row => {
          const rezept = row.daten || {};
          rezept.id = rezept.id || row.id;
          return rezept;
        })
        .filter(rezept => rezept && rezept.name);

      localStorage.setItem("rezepte", JSON.stringify(rezepte));

      if (typeof datenstrukturReparieren === "function") datenstrukturReparieren();
      if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
      if (typeof tagsListeAktualisieren === "function") tagsListeAktualisieren();
      if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();

      cloudHatBeimStartGeladen = true;
      cloudStatus(`${rezepte.length} Rezept(e) automatisch geladen`);
      return;
    }

    if (lokalAnzahl > 0 && cloudAnzahl === 0) {
      cloudStatus("lokale Rezepte gefunden · speichere automatisch in Cloud ...");
      await cloudSpeichernAlle();
      return;
    }

    if (lokalAnzahl > 0 && cloudAnzahl > 0) {
      cloudStatus(`verbunden · lokal ${lokalAnzahl}, Cloud ${cloudAnzahl}`);
      return;
    }

    cloudStatus("verbunden · noch keine Rezepte");
  } catch (fehler) {
    console.error("Automatisches Cloud-Laden fehlgeschlagen:", fehler);
    cloudStatus("Auto-Sync fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  }
}

function cloudAutoSpeichernVerzoegert() {
  if (!cloudAutoSyncAktiv || !cloudAktiv) return;

  clearTimeout(cloudAutoSaveTimer);
  cloudAutoSaveTimer = setTimeout(function () {
    if (Array.isArray(rezepte) && rezepte.length > 0) {
      cloudSpeichernAlle();
    }
  }, 1000);
}

// Speichern final erweitern: nach jedem lokalen Speichern automatisch Cloud aktualisieren.
const speichernVorCloudAutosync1292 = typeof speichern === "function" ? speichern : null;
function speichern() {
  if (speichernVorCloudAutosync1292) {
    speichernVorCloudAutosync1292();
  } else {
    localStorage.setItem("rezepte", JSON.stringify(rezepte));
  }

  cloudAutoSpeichernVerzoegert();
}

// Nach dem Laden automatisch synchronisieren.
window.addEventListener("load", function () {
  setTimeout(cloudAutoLadenBeimStart, 1200);
});



// ===============================
// VERSION 1.29.3 CLOUD: Auto-Speichern zuverlässig
// ===============================

let cloudAutoSaveAktiv = true;
let cloudAutoSaveTimerFinal = null;
let cloudLetzterGespeicherterStand = "";

function cloudRezepteSignatur() {
  try {
    return JSON.stringify(Array.isArray(rezepte) ? rezepte : []);
  } catch {
    return String(Date.now());
  }
}

async function cloudSpeichernAlleDirekt() {
  if (!cloudAutoSaveAktiv) return;

  if (!cloudAktiv) {
    cloudInit();
  }

  if (!cloudAktiv || !supabaseClient) {
    cloudStatus("Cloud nicht verbunden – automatische Speicherung nicht möglich", true);
    return;
  }

  const liste = Array.isArray(rezepte) ? rezepte : [];

  if (liste.length === 0) {
    cloudStatus("keine Rezepte zum automatischen Speichern");
    return;
  }

  const signatur = cloudRezepteSignatur();
  if (signatur === cloudLetzterGespeicherterStand) {
    cloudStatus("Cloud aktuell");
    return;
  }

  try {
    cloudStatus("speichere automatisch in Cloud ...");

    const rows = liste.map(rezept => {
      const r = JSON.parse(JSON.stringify(rezept || {}));

      if (!r.id) {
        r.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
        rezept.id = r.id;
      }

      return {
        id: String(r.id),
        name: r.name || "Unbenanntes Rezept",
        daten: r,
        aktualisiert_am: new Date().toISOString()
      };
    });

    const { error } = await supabaseClient
      .from("rezepte")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;

    cloudLetzterGespeicherterStand = cloudRezepteSignatur();
    cloudStatus(`${rows.length} Rezept(e) automatisch in Cloud gespeichert`);
  } catch (fehler) {
    console.error("Automatisches Cloud-Speichern fehlgeschlagen:", fehler);
    cloudStatus("Auto-Speichern fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  }
}

function cloudAutoSpeichernJetzt() {
  clearTimeout(cloudAutoSaveTimerFinal);
  cloudAutoSaveTimerFinal = setTimeout(function () {
    cloudSpeichernAlleDirekt();
  }, 500);
}

// Diese Version überschreibt alle vorherigen Speichern-Wrapper final.
const speichernVorCloudFinal1293 = typeof speichern === "function" ? speichern : null;
function speichern() {
  // Direkt localStorage schreiben, damit kein alter Wrapper Auto-Sync verhindert.
  try {
    localStorage.setItem("rezepte", JSON.stringify(rezepte));
  } catch (fehler) {
    console.warn("Lokales Speichern fehlgeschlagen:", fehler);
  }

  // Zusätzliche alte Funktionen, falls vorhanden.
  try {
    if (typeof backupWarnungAktualisieren === "function") backupWarnungAktualisieren();
    if (typeof tagsListeAktualisieren === "function") tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
  } catch (fehler) {
    console.warn("Nach-Speichern-Aktualisierung übersprungen:", fehler);
  }

  cloudAutoSpeichernJetzt();
}

// Auch beim Rezept-Speichern nach erfolgreichem Speichern ausdrücklich Cloud-Sync starten.
const rezeptSpeichernVorCloudFinal1293 = typeof rezeptSpeichern === "function" ? rezeptSpeichern : null;
function rezeptSpeichern() {
  let ergebnis;

  if (rezeptSpeichernVorCloudFinal1293) {
    ergebnis = rezeptSpeichernVorCloudFinal1293();
  }

  setTimeout(cloudSpeichernAlleDirekt, 800);
  return ergebnis;
}

function rezeptHinzufuegen() {
  return rezeptSpeichern();
}

// Manueller Button nutzt dieselbe robuste Funktion.
function cloudSpeichernAlle() {
  return cloudSpeichernAlleDirekt();
}

window.addEventListener("load", function () {
  setTimeout(function () {
    if (!cloudAktiv) cloudInit();
    cloudLetzterGespeicherterStand = "";
  }, 500);
});



// ===============================
// VERSION 1.29.4 CLOUD: echter Auto-Sync per Änderungsprüfung
// ===============================

let cloudAutoSyncLetzterStand1294 = "";
let cloudAutoSyncLaeuft1294 = false;
let cloudAutoSyncGestartet1294 = false;

function cloudAktuelleSignatur1294() {
  try {
    return JSON.stringify(Array.isArray(rezepte) ? rezepte : []);
  } catch {
    return "";
  }
}

async function cloudSpeichernAlleDirekt1294(grund = "Auto-Sync") {
  if (cloudAutoSyncLaeuft1294) return;

  if (!cloudAktiv) {
    cloudInit();
  }

  if (!cloudAktiv || !supabaseClient) {
    cloudStatus("Cloud nicht verbunden – Auto-Sync wartet", true);
    return;
  }

  const liste = Array.isArray(rezepte) ? rezepte : [];

  if (liste.length === 0) {
    cloudStatus("Cloud verbunden · keine Rezepte");
    return;
  }

  try {
    cloudAutoSyncLaeuft1294 = true;
    cloudStatus(`${grund}: speichere in Cloud ...`);

    const rows = liste.map(rezept => {
      const r = JSON.parse(JSON.stringify(rezept || {}));

      if (!r.id) {
        r.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
        rezept.id = r.id;
      }

      return {
        id: String(r.id),
        name: r.name || "Unbenanntes Rezept",
        daten: r,
        aktualisiert_am: new Date().toISOString()
      };
    });

    const { error } = await supabaseClient
      .from("rezepte")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;

    cloudAutoSyncLetzterStand1294 = cloudAktuelleSignatur1294();
    cloudLetzterGespeicherterStand = cloudAutoSyncLetzterStand1294;
    cloudStatus(`${rows.length} Rezept(e) automatisch in Cloud gespeichert`);
  } catch (fehler) {
    console.error("Auto-Sync fehlgeschlagen:", fehler);
    cloudStatus("Auto-Sync fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  } finally {
    cloudAutoSyncLaeuft1294 = false;
  }
}

function cloudAutoSyncPruefen1294() {
  const signatur = cloudAktuelleSignatur1294();

  if (!signatur || signatur === "[]") return;

  if (signatur !== cloudAutoSyncLetzterStand1294) {
    cloudSpeichernAlleDirekt1294("Auto-Sync");
  }
}

function cloudAutoSyncStarten1294() {
  if (cloudAutoSyncGestartet1294) return;
  cloudAutoSyncGestartet1294 = true;

  cloudAutoSyncLetzterStand1294 = cloudAktuelleSignatur1294();

  // Regelmäßige Prüfung, unabhängig davon welche Speichern-Funktion benutzt wurde.
  setInterval(cloudAutoSyncPruefen1294, 3000);

  // Zusätzlich kurz nach jedem Klick auf "Rezept speichern".
  document.addEventListener("click", function (event) {
    const ziel = event.target;
    if (!ziel || !ziel.textContent) return;

    const text = ziel.textContent.toLowerCase();
    if (text.includes("rezept speichern") || text.includes("speichern")) {
      setTimeout(cloudAutoSyncPruefen1294, 1000);
      setTimeout(cloudAutoSyncPruefen1294, 3000);
    }
  });

  // Beim Verlassen noch einmal versuchen.
  window.addEventListener("beforeunload", function () {
    cloudAutoSyncPruefen1294();
  });

  cloudStatus("Auto-Sync aktiv");
}

// Manueller Button bleibt, nutzt aber dieselbe robuste Speicherfunktion.
function cloudSpeichernAlle() {
  return cloudSpeichernAlleDirekt1294("Manuelles Speichern");
}

// Falls eine Speicherfunktion aufgerufen wird, danach sofort Auto-Sync prüfen.
const speichernVorCloud1294 = typeof speichern === "function" ? speichern : null;
function speichern() {
  if (speichernVorCloud1294) {
    speichernVorCloud1294();
  } else {
    localStorage.setItem("rezepte", JSON.stringify(rezepte));
  }

  setTimeout(cloudAutoSyncPruefen1294, 800);
}

window.addEventListener("load", function () {
  setTimeout(function () {
    if (!cloudAktiv) cloudInit();
    cloudAutoSyncStarten1294();
  }, 1500);
});



// ===============================
// VERSION 1.29.5 CLOUD: Rezept speichern repariert
// ===============================

// Die vorherigen Wrapper haben sich gegenseitig überschrieben.
// Deshalb direkt den Klick-Handler neu setzen.

window.addEventListener("load", function () {
  setTimeout(function () {
    const speichernButtons = Array.from(document.querySelectorAll("button"));

    speichernButtons.forEach(button => {
      const text = (button.textContent || "").toLowerCase();

      if (text.includes("rezept speichern")) {
        button.onclick = async function () {
          try {
            // Originalfunktion direkt aufrufen
            if (typeof rezeptSpeichernVorCloudFinal1293 === "function") {
              rezeptSpeichernVorCloudFinal1293();
            } else if (typeof rezeptSpeichernVorCloud1293 === "function") {
              rezeptSpeichernVorCloud1293();
            }

            // Danach automatisch Cloud-Sync
            setTimeout(function () {
              if (typeof cloudSpeichernAlleDirekt1294 === "function") {
                cloudSpeichernAlleDirekt1294("Auto-Sync");
              } else if (typeof cloudSpeichernAlleDirekt === "function") {
                cloudSpeichernAlleDirekt();
              }
            }, 1200);

          } catch (fehler) {
            console.error("Speichern fehlgeschlagen:", fehler);
            alert("Rezept konnte nicht gespeichert werden.");
          }
        };
      }
    });
  }, 1500);
});



// ===============================
// VERSION 1.29.6 CLOUD: Speichern vollständig repariert
// ===============================

// Vorherige kaputte Wrapper deaktivieren
window.rezeptSpeichernVorCloudFinal1293 = undefined;
window.rezeptSpeichernVorCloud1293 = undefined;

// Direkte stabile Speicherfunktion
async function rezeptSpeichernCloudSicher() {
  try {
    const original = typeof rezeptSpeichernOriginal1296 === "function"
      ? rezeptSpeichernOriginal1296
      : null;

    if (!original) {
      alert("Originale Speicherfunktion wurde nicht gefunden.");
      return false;
    }

    // Rezept normal speichern
    const result = original();

    // Danach automatisch Cloud speichern
    setTimeout(async function () {
      try {
        if (typeof cloudSpeichernAlleDirekt1294 === "function") {
          await cloudSpeichernAlleDirekt1294("Auto-Sync");
        } else if (typeof cloudSpeichernAlleDirekt === "function") {
          await cloudSpeichernAlleDirekt();
        } else if (typeof cloudSpeichernAlle === "function") {
          await cloudSpeichernAlle();
        }
      } catch (e) {
        console.error("Cloud Auto-Sync Fehler:", e);
      }
    }, 1200);

    return result;

  } catch (fehler) {
    console.error("Rezept speichern Fehler:", fehler);
    alert("Rezept konnte nicht gespeichert werden.");
    return false;
  }
}

// Aktuelle funktion sichern
if (typeof rezeptSpeichern === "function") {
  window.rezeptSpeichernOriginal1296 = rezeptSpeichern;
}

// Final überschreiben
rezeptSpeichern = rezeptSpeichernCloudSicher;

// Auch Rezept hinzufügen verbinden
rezeptHinzufuegen = rezeptSpeichernCloudSicher;



// ===============================
// VERSION 1.29.7 CLOUD: stabile Speicherfunktion ohne alte Wrapper
// ===============================

function formularTextWert(id) {
  const element = document.getElementById(id);
  return element ? String(element.value || "").trim() : "";
}

function rezeptSpeichernDirektCloud() {
  try {
    const name = textTitel(formularTextWert("nameInput"));
    const kategorie = formularTextWert("kategorieInput") || "Nicht zugeordnet";
    const portionen = Number(formularTextWert("portionenInput"));
    const schwierigkeit = formularTextWert("schwierigkeitInput");
    const zubereitungszeit = formularTextWert("zubereitungszeitInput");
    const quelle = formularTextWert("quelleInput") || "Nicht zugeordnet";
    const zutatenGruppen = zutatenGruppenAusFormularLesen();
    const zutaten = zutatenAusGruppen(zutatenGruppen);
    const zubereitung = formularTextWert("zubereitungInput");
    const utensilien = formularTextWert("utensilienInput")
      .split(",")
      .map(x => textTitel(x.trim()))
      .filter(Boolean);
    const notizen = formularTextWert("notizenInput");
    const manuelleTags = formularTextWert("tagsInput")
      .split(",")
      .map(x => x.trim().toLowerCase())
      .filter(Boolean);
    const naehrwerte = typeof naehrwerteAusFormular === "function" ? naehrwerteAusFormular() : {};
    const tags = typeof tagsMitAutomatischenNaehrwertTags === "function"
      ? tagsMitAutomatischenNaehrwertTags(manuelleTags, naehrwerte)
      : manuelleTags;

    if (!name || !portionen || !zubereitung || zutaten.length === 0) {
      meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
      return false;
    }

    const warn = typeof zutatenPruefen === "function" ? zutatenPruefen(zutaten) : [];
    if (warn.length && !confirm("Bei den Zutaten gibt es mögliche Fehler:\n\n" + warn.join("\n") + "\n\nTrotzdem speichern?")) {
      return false;
    }

    const alt = bearbeitungsIndex === null ? {} : (rezepte[bearbeitungsIndex] || {});

    const rezept = {
      id: alt.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      favorit: alt.favorit || false,
      bewertung: alt.bewertung || 0,
      name,
      kategorie,
      portionen,
      schwierigkeit,
      zubereitungszeit,
      quelle,
      zutatenGruppen,
      zutaten,
      zubereitung,
      utensilien,
      notizen,
      tags,
      naehrwerte
    };

    if (bearbeitungsIndex === null || bearbeitungsIndex === undefined) {
      rezepte.push(rezept);
    } else {
      rezepte[bearbeitungsIndex] = rezept;
    }

    bearbeitungsIndex = null;

    // Lokal speichern, ohne alte speichern()-Wrapper zu verwenden
    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    // UI aktualisieren
    if (typeof formularLeeren === "function") formularLeeren();
    if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    if (typeof tagsListeAktualisieren === "function") tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();

    const ergebnisse = document.getElementById("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";

    if (typeof alleHauptbereicheVerstecken === "function") alleHauptbereicheVerstecken();

    meldungAnzeigen("Rezept gespeichert. Cloud-Speicherung läuft ...");

    // Cloud-Sync danach direkt ausführen
    setTimeout(function () {
      if (typeof cloudSpeichernAlleDirekt1297 === "function") {
        cloudSpeichernAlleDirekt1297();
      }
    }, 600);

    return true;
  } catch (fehler) {
    console.error("Rezept speichern Fehler:", fehler);
    alert("Rezept konnte nicht gespeichert werden: " + (fehler.message || "unbekannter Fehler"));
    return false;
  }
}

async function cloudSpeichernAlleDirekt1297() {
  try {
    if (!cloudAktiv) cloudInit();

    if (!cloudAktiv || !supabaseClient) {
      cloudStatus("Cloud nicht verbunden – Rezept wurde nur lokal gespeichert", true);
      return;
    }

    const liste = Array.isArray(rezepte) ? rezepte : [];

    if (liste.length === 0) {
      cloudStatus("Keine Rezepte zum Speichern");
      return;
    }

    cloudStatus("speichere automatisch in Cloud ...");

    const rows = liste.map(rezept => {
      const r = JSON.parse(JSON.stringify(rezept || {}));

      if (!r.id) {
        r.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
        rezept.id = r.id;
      }

      return {
        id: String(r.id),
        name: r.name || "Unbenanntes Rezept",
        daten: r,
        aktualisiert_am: new Date().toISOString()
      };
    });

    const result = await supabaseClient
      .from("rezepte")
      .upsert(rows, { onConflict: "id" });

    if (result.error) throw result.error;

    cloudStatus(rows.length + " Rezept(e) automatisch in Cloud gespeichert");
  } catch (fehler) {
    console.error("Cloud-Speichern fehlgeschlagen:", fehler);
    cloudStatus("Cloud-Speichern fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  }
}

// Namen angleichen, falls andere Buttons/Funktionen sie aufrufen
function rezeptSpeichern() {
  return rezeptSpeichernDirektCloud();
}

function rezeptHinzufuegen() {
  return rezeptSpeichernDirektCloud();
}

function cloudSpeichernAlle() {
  return cloudSpeichernAlleDirekt1297();
}

// Nach dem Start wird nur geladen/geprüft, aber die Speicherfunktion nicht mehr überschrieben.
window.addEventListener("load", function () {
  setTimeout(function () {
    if (!cloudAktiv) cloudInit();
    cloudStatus("Cloud verbunden · Auto-Speichern aktiv");
  }, 1000);
});



// ===============================
// VERSION 1.29.8 CLOUD: Audit-Fixes
// - Nährwertanzeige ohne Rekursion
// - Tags-Datalist abgesichert
// - alte optionale IDs abgesichert
// ===============================

function tagsAusRezepten() {
  const quelle = Array.isArray(rezepte) ? rezepte : [];
  const alleTags = [];

  quelle.forEach(rezept => {
    (rezept.tags || []).forEach(tag => {
      const sauber = String(tag || "").trim().toLowerCase();
      if (sauber) alleTags.push(sauber);
    });
  });

  return [...new Set(alleTags)].sort((a, b) => a.localeCompare(b));
}

function tagsListeAktualisieren() {
  const datalist = document.getElementById("tagsListe");
  if (datalist) {
    datalist.innerHTML = tagsAusRezepten()
      .map(tag => `<option value="${esc(tag)}"></option>`)
      .join("");
  }

  if (typeof suchTagsDropdownAktualisieren === "function") {
    try {
      suchTagsDropdownAktualisieren();
    } catch (fehler) {
      console.warn("Such-Tags konnten nicht aktualisiert werden:", fehler);
    }
  }
}

function naehrwerteVorhanden(rezept) {
  return !!(
    rezept &&
    rezept.naehrwerte &&
    Object.values(rezept.naehrwerte).some(wert => Number(wert) > 0)
  );
}

function automatischeNaehrwertTags(naehrwerte) {
  const n = naehrwerte || {};
  const tags = [];

  const kalorien = Number(n.kalorien || 0);
  const eiweiss = Number(n.eiweiss || 0);
  const kohlenhydrate = Number(n.kohlenhydrate || 0);
  const fett = Number(n.fett || 0);

  if (eiweiss > 0) {
    if (eiweiss >= 15) tags.push("proteinreich");
    if (eiweiss < 5) tags.push("proteinarm");
  }

  if (kohlenhydrate > 0) {
    if (kohlenhydrate < 10) tags.push("kh-arm");
    if (kohlenhydrate >= 30) tags.push("kh-reich");
  }

  if (fett > 0) {
    if (fett < 5) tags.push("fettarm");
    if (fett >= 20) tags.push("fettreich");
  }

  if (kalorien > 0) {
    if (kalorien < 150) tags.push("kalorienarm");
    if (kalorien >= 300) tags.push("kalorienreich");
  }

  return tags;
}

function naehrwertTagsHtml(rezept) {
  const autoTags = automatischeNaehrwertTags(rezept && rezept.naehrwerte ? rezept.naehrwerte : {});
  if (autoTags.length === 0) return "";

  return `
    <div class="naehrwert-tags">
      <strong>Nährwert-Einteilung:</strong>
      ${autoTags.map(tag => `<span class="tag-chip">${esc(tag)}</span>`).join("")}
    </div>
  `;
}

// Finale, sichere Version ohne Bezug auf alte naehrwerteKurzHtml-Wrapper.
// Dadurch keine Maximum-call-stack-Endlosschleife mehr.
function naehrwerteKurzHtml(rezept) {
  if (!naehrwerteVorhanden(rezept)) {
    return `
      <div class="naehrwerte-box">
        <h3>Nährwerte pro 100 g</h3>
        <p>Noch keine Nährwerte gespeichert.</p>
      </div>
    `;
  }

  const n = rezept.naehrwerte;
  const werte = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ].filter(w => Number(w[1]) > 0);

  return `
    <div class="naehrwerte-box">
      <h3>Nährwerte pro 100 g</h3>
      <ul>${werte.map(w => `<li><strong>${esc(w[0])}:</strong> ${w[1]} ${w[2]}</li>`).join("")}</ul>
    </div>
    ${naehrwertTagsHtml(rezept)}
  `;
}

window.addEventListener("load", function () {
  tagsListeAktualisieren();
});



// ===============================
// VERSION 1.29.9 CLOUD: Button-Fixes nach Button-Test
// ===============================

// Kategorie-Kacheln robust gegen fehlenden Klick-Kontext machen.
function kategorieKachelUmschalten(btn) {
  if (!btn) return;

  const kategorie = btn.dataset ? (btn.dataset.kategorie || "") : "";

  if (kategorie === "") {
    kategorienAufAlleSetzen();
  } else {
    const alleButton = document.querySelector("#suchKategorieKacheln .kategorie-kachel[data-kategorie='']");
    if (alleButton) alleButton.classList.remove("aktiv");

    if (btn.classList && typeof btn.classList.toggle === "function") {
      btn.classList.toggle("aktiv");
    }

    const aktive = document.querySelector("#suchKategorieKacheln .kategorie-kachel.aktiv:not([data-kategorie=''])");
    if (!aktive) kategorienAufAlleSetzen();
  }

  if (typeof filterAnwenden === "function") {
    filterAnwenden();
  }
}

// Alle-Kategorien-Button robust machen.
function kategorienAufAlleSetzen() {
  document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel").forEach(k => {
    if (k.classList) k.classList.remove("aktiv");
  });

  const alle = document.querySelector("#suchKategorieKacheln .kategorie-kachel[data-kategorie='']");
  if (alle && alle.classList) alle.classList.add("aktiv");
}

// Suche/Filter robust machen.
function aktiveKategorien() {
  return Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv"))
    .map(x => x.dataset ? x.dataset.kategorie : "")
    .filter(Boolean);
}

function filterBasis(liste) {
  const kategorien = typeof aktiveKategorien === "function" ? aktiveKategorien() : [];
  if (!kategorien.length) return liste;

  return liste.filter(rezept => kategorien.includes(rezept.kategorie));
}

function filterAnwenden() {
  let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => ({
    ...rezept,
    index,
    vorhandene: [],
    fehlende: []
  }));

  ergebnisse = filterBasis(ergebnisse);

  if (typeof sortieren === "function") {
    ergebnisse = sortieren(ergebnisse);
  }

  letzteSuchErgebnisse = ergebnisse;

  if (typeof zeigeErgebnisse === "function") {
    zeigeErgebnisse(ergebnisse);
  }
}

// Alte Such-Zurücksetzen-Funktion robust machen.
function sucheZuruecksetzen() {
  ["nameSucheInput", "zutatenInput", "tagSucheInput"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  const bewertung = document.getElementById("bewertungFilter");
  if (bewertung) bewertung.value = "";

  kategorienAufAlleSetzen();

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  letzteSuchErgebnisse = [];
}

// Sicherstellen, dass Tag-Datalist im DOM vorhanden ist, falls Browser alte Datei lädt.
window.addEventListener("load", function () {
  if (!document.getElementById("tagsListe")) {
    const input = document.getElementById("tagsInput");
    if (input) {
      input.setAttribute("list", "tagsListe");
      const datalist = document.createElement("datalist");
      datalist.id = "tagsListe";
      input.insertAdjacentElement ? input.insertAdjacentElement("afterend", datalist) : input.parentElement?.appendChild(datalist);
    }
  }
});



// ===============================
// VERSION 1.30.0 CLOUD: Löschen repariert
// ===============================

// Finale stabile Löschfunktion
function rezeptLoeschen(index) {
  try {
    const liste = Array.isArray(rezepte) ? rezepte : [];

    if (index === undefined || index === null || !liste[index]) {
      alert("Rezept konnte nicht gefunden werden.");
      return false;
    }

    const rezept = liste[index];

    const bestaetigung = confirm(`Rezept "${rezept.name}" wirklich löschen?`);
    if (!bestaetigung) return false;

    const rezeptId = rezept.id || null;

    // Lokal löschen
    liste.splice(index, 1);

    // LocalStorage aktualisieren
    localStorage.setItem("rezepte", JSON.stringify(liste));

    // UI aktualisieren
    if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    if (typeof tagsListeAktualisieren === "function") tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();

    // Ergebnisse neu anzeigen
    if (typeof filterAnwenden === "function") {
      filterAnwenden();
    } else if (typeof zeigeErgebnisse === "function") {
      zeigeErgebnisse(liste);
    }

    meldungAnzeigen(`Rezept "${rezept.name}" gelöscht.`);

    // Auch aus Cloud löschen
    if (rezeptId && cloudAktiv && supabaseClient) {
      supabaseClient
        .from("rezepte")
        .delete()
        .eq("id", String(rezeptId))
        .then(result => {
          if (result && result.error) {
            console.warn("Cloud-Löschen fehlgeschlagen:", result.error);
          } else {
            cloudStatus("Rezept auch aus Cloud gelöscht");
          }
        })
        .catch(fehler => {
          console.warn("Cloud-Löschen Fehler:", fehler);
        });
    }

    return true;

  } catch (fehler) {
    console.error("Rezept löschen Fehler:", fehler);
    alert("Rezept konnte nicht gelöscht werden.");
    return false;
  }
}



// ===============================
// VERSION 1.30.1 CLOUD: offene Fehler behoben
// ===============================

// Mengen richtig formatieren ohne mg -> 0,00 g Fehler
function portionsMengeFormatieren(menge, einheit) {
  const wert = Number(menge);

  if (!isFinite(wert)) return menge;

  const kleineEinheiten = ["mg", "ml"];

  if (kleineEinheiten.includes(String(einheit).toLowerCase())) {
    return Number(wert.toFixed(1));
  }

  if (wert < 1) {
    return Number(wert.toFixed(2));
  }

  if (wert < 10) {
    return Number(wert.toFixed(1));
  }

  return Number(wert.toFixed(0));
}

// Finale stabile Portionsberechnung
function portionenBerechnen(rezeptIndex, zielPortionen) {
  const rezept = rezepte[rezeptIndex];
  if (!rezept) return "";

  const original = Number(rezept.portionen || 1);
  const ziel = Number(zielPortionen || original);

  if (!original || !ziel) return "";

  const faktor = ziel / original;

  const gruppen = rezept.zutatenGruppen || [{
    name: "Zutaten",
    zutaten: rezept.zutaten || []
  }];

  return gruppen.map(gruppe => `
    <div class="portion-gruppe">
      <h4>${esc(gruppe.name || "Zutaten")}</h4>
      <ul>
        ${(gruppe.zutaten || []).map(z => {
          const neueMenge = Number(z.menge || 0) * faktor;
          const formatiert = portionsMengeFormatieren(neueMenge, z.einheit);

          return `
            <li>
              ${formatiert} ${esc(z.einheit || "")} ${esc(z.name || "")}
            </li>
          `;
        }).join("")}
      </ul>
    </div>
  `).join("");
}

// Favoriten stabil
function favoritUmschalten(index) {
  try {
    if (!rezepte[index]) return;

    rezepte[index].favorit = !rezepte[index].favorit;

    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    if (typeof filterAnwenden === "function") {
      filterAnwenden();
    } else if (typeof zeigeErgebnisse === "function") {
      zeigeErgebnisse(letzteSuchErgebnisse || rezepte);
    }

    if (typeof cloudSpeichernAlleDirekt1297 === "function") {
      cloudSpeichernAlleDirekt1297();
    }
  } catch (e) {
    console.error("Favorit Fehler:", e);
  }
}

// Sternebewertung stabil
function bewertungSetzen(index, sterne) {
  try {
    if (!rezepte[index]) return;

    rezepte[index].bewertung = Number(sterne || 0);

    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    if (typeof filterAnwenden === "function") {
      filterAnwenden();
    } else if (typeof zeigeErgebnisse === "function") {
      zeigeErgebnisse(letzteSuchErgebnisse || rezepte);
    }

    if (typeof cloudSpeichernAlleDirekt1297 === "function") {
      cloudSpeichernAlleDirekt1297();
    }
  } catch (e) {
    console.error("Bewertung Fehler:", e);
  }
}


// =====================================================
// VERSION 1.30.2 CLOUD: finaler bereinigter Funktionsblock
// =====================================================

function rfText(id) {
  const element = document.getElementById(id);
  return element ? String(element.value || "").trim() : "";
}

function rfZahlAusText(wert) {
  if (wert === undefined || wert === null) return 0;
  const zahl = Number(String(wert).replace(",", ".").trim());
  return isFinite(zahl) ? zahl : 0;
}

function rfMengeFormatieren(menge, einheit) {
  const wert = Number(menge);
  const e = String(einheit || "").trim().toLowerCase();
  if (!isFinite(wert)) return "";

  if (e === "mg" || e === "ml") return Number(wert.toFixed(1)).toString().replace(".", ",");
  if (wert === 0) return "0";
  if (Math.abs(wert) < 1) return Number(wert.toFixed(2)).toString().replace(".", ",");
  if (Math.abs(wert) < 10) return Number(wert.toFixed(1)).toString().replace(".", ",");
  return Number(wert.toFixed(0)).toString().replace(".", ",");
}

function rfZutatAlsText(zutat, faktor) {
  const mengeOriginal = rfZahlAusText(zutat.menge);
  const mengeText = mengeOriginal ? rfMengeFormatieren(mengeOriginal * faktor, zutat.einheit) : "";
  return `${mengeText} ${zutat.einheit || ""} ${zutat.name || ""}`.trim();
}

function portionenBerechnen(index) {
  try {
    const rezept = rezepte[index];
    if (!rezept) return;

    const input = document.getElementById(`zielPortionen-${index}`);
    const ausgabe = document.getElementById(`portionenErgebnis-${index}`);
    if (!ausgabe) return;

    const zielPortionen = Number(input ? input.value : 0);
    if (!zielPortionen || zielPortionen <= 0) {
      ausgabe.innerHTML = "<p>Bitte gewünschte Portionen eingeben.</p>";
      return;
    }

    const originalPortionen = Number(rezept.portionen || 1);
    if (!originalPortionen || originalPortionen <= 0) {
      ausgabe.innerHTML = "<p>Für dieses Rezept sind keine gültigen Grundportionen gespeichert.</p>";
      return;
    }

    const faktor = zielPortionen / originalPortionen;
    const gruppen = rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }];

    ausgabe.innerHTML = `
      <div class="portionen-ergebnis">
        <h4>Zutaten für ${zielPortionen} Portion(en)</h4>
        ${gruppen.map(gruppe => `
          <div class="portion-gruppe">
            <strong>${esc(gruppe.name || "Zutaten")}</strong>
            <ul>
              ${(gruppe.zutaten || []).map(zutat => `<li>${esc(rfZutatAlsText(zutat, faktor))}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>
    `;
  } catch (fehler) {
    console.error("Portionen berechnen Fehler:", fehler);
    alert("Portionen konnten nicht berechnet werden.");
  }
}

function automatischeNaehrwertTags(naehrwerte) {
  const n = naehrwerte || {};
  const tags = [];
  const kalorien = Number(n.kalorien || 0);
  const eiweiss = Number(n.eiweiss || 0);
  const kohlenhydrate = Number(n.kohlenhydrate || 0);
  const fett = Number(n.fett || 0);

  if (eiweiss > 0) {
    if (eiweiss >= 15) tags.push("proteinreich");
    if (eiweiss < 5) tags.push("proteinarm");
  }
  if (kohlenhydrate > 0) {
    if (kohlenhydrate < 10) tags.push("kh-arm");
    if (kohlenhydrate >= 30) tags.push("kh-reich");
  }
  if (fett > 0) {
    if (fett < 5) tags.push("fettarm");
    if (fett >= 20) tags.push("fettreich");
  }
  if (kalorien > 0) {
    if (kalorien < 150) tags.push("kalorienarm");
    if (kalorien >= 300) tags.push("kalorienreich");
  }
  return tags;
}

function tagsMitAutomatischenNaehrwertTags(tags, naehrwerte) {
  const auto = ["proteinreich", "proteinarm", "kh-arm", "kh-reich", "fettarm", "fettreich", "kalorienarm", "kalorienreich"];
  const manuell = (tags || []).map(t => String(t || "").trim().toLowerCase()).filter(t => t && !auto.includes(t));
  return [...new Set([...manuell, ...automatischeNaehrwertTags(naehrwerte)])];
}

function tagsAusRezepten() {
  const tags = [];
  (Array.isArray(rezepte) ? rezepte : []).forEach(r => (r.tags || []).forEach(t => {
    const tag = String(t || "").trim().toLowerCase();
    if (tag) tags.push(tag);
  }));
  return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
}

function tagsListeAktualisieren() {
  const datalist = document.getElementById("tagsListe");
  if (datalist) datalist.innerHTML = tagsAusRezepten().map(t => `<option value="${esc(t)}"></option>`).join("");
  if (typeof suchTagsDropdownAktualisieren === "function") {
    try { suchTagsDropdownAktualisieren(); } catch (e) { console.warn(e); }
  }
}

function naehrwerteVorhanden(rezept) {
  return !!(rezept && rezept.naehrwerte && Object.values(rezept.naehrwerte).some(w => Number(w) > 0));
}

function naehrwertTagsHtml(rezept) {
  const tags = automatischeNaehrwertTags(rezept && rezept.naehrwerte ? rezept.naehrwerte : {});
  if (!tags.length) return "";
  return `<div class="naehrwert-tags"><strong>Nährwert-Einteilung:</strong> ${tags.map(t => `<span class="tag-chip">${esc(t)}</span>`).join("")}</div>`;
}

function naehrwerteKurzHtml(rezept) {
  if (!naehrwerteVorhanden(rezept)) {
    return `<div class="naehrwerte-box"><h3>Nährwerte pro 100 g</h3><p>Noch keine Nährwerte gespeichert.</p></div>`;
  }
  const n = rezept.naehrwerte;
  const werte = [
    ["Kalorien", n.kalorien, "kcal"], ["Eiweiß", n.eiweiss, "g"], ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"], ["Zucker", n.zucker, "g"], ["Ballaststoffe", n.ballaststoffe, "g"], ["Salz", n.salz, "g"]
  ].filter(w => Number(w[1]) > 0);
  return `<div class="naehrwerte-box"><h3>Nährwerte pro 100 g</h3><ul>${werte.map(w => `<li><strong>${esc(w[0])}:</strong> ${w[1]} ${w[2]}</li>`).join("")}</ul></div>${naehrwertTagsHtml(rezept)}`;
}

function rezeptSpeichernDirektCloud() {
  try {
    const name = textTitel(rfText("nameInput"));
    const kategorie = rfText("kategorieInput") || "Nicht zugeordnet";
    const portionen = Number(rfText("portionenInput"));
    const schwierigkeit = rfText("schwierigkeitInput");
    const zubereitungszeit = rfText("zubereitungszeitInput");
    const quelle = rfText("quelleInput") || "Nicht zugeordnet";
    const zutatenGruppen = zutatenGruppenAusFormularLesen();
    const zutaten = zutatenAusGruppen(zutatenGruppen);
    const zubereitung = rfText("zubereitungInput");
    const utensilien = rfText("utensilienInput").split(",").map(x => textTitel(x.trim())).filter(Boolean);
    const notizen = rfText("notizenInput");
    const tagsManuell = rfText("tagsInput").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
    const naehrwerte = typeof naehrwerteAusFormular === "function" ? naehrwerteAusFormular() : {};
    const tags = tagsMitAutomatischenNaehrwertTags(tagsManuell, naehrwerte);

    if (!name || !portionen || !zubereitung || zutaten.length === 0) {
      meldungAnzeigen("Bitte Name, Grundportionen, Zutaten und Zubereitung ausfüllen.", true);
      return false;
    }

    const alt = bearbeitungsIndex === null || bearbeitungsIndex === undefined ? {} : (rezepte[bearbeitungsIndex] || {});
    const rezept = { id: alt.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), favorit: alt.favorit || false, bewertung: alt.bewertung || 0,
      name, kategorie, portionen, schwierigkeit, zubereitungszeit, quelle, zutatenGruppen, zutaten, zubereitung, utensilien, notizen, tags, naehrwerte };

    if (bearbeitungsIndex === null || bearbeitungsIndex === undefined) rezepte.push(rezept);
    else rezepte[bearbeitungsIndex] = rezept;

    bearbeitungsIndex = null;
    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    if (typeof formularLeeren === "function") formularLeeren();
    if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();

    const ergebnisse = document.getElementById("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";
    if (typeof alleHauptbereicheVerstecken === "function") alleHauptbereicheVerstecken();

    meldungAnzeigen("Rezept gespeichert. Cloud-Speicherung läuft ...");
    setTimeout(() => { if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle(); }, 600);
    return true;
  } catch (fehler) {
    console.error("Rezept speichern Fehler:", fehler);
    alert("Rezept konnte nicht gespeichert werden: " + (fehler.message || "unbekannter Fehler"));
    return false;
  }
}

function rezeptSpeichern() { return rezeptSpeichernDirektCloud(); }
function rezeptHinzufuegen() { return rezeptSpeichernDirektCloud(); }

async function cloudSpeichernAlle() {
  try {
    if (!cloudAktiv) cloudInit();
    if (!cloudAktiv || !supabaseClient) { cloudStatus("Cloud nicht verbunden – lokal gespeichert", true); return; }
    const liste = Array.isArray(rezepte) ? rezepte : [];
    if (!liste.length) { cloudStatus("Keine Rezepte zum Speichern"); return; }
    cloudStatus("speichere in Cloud ...");
    const rows = liste.map(rezept => {
      const r = JSON.parse(JSON.stringify(rezept || {}));
      if (!r.id) { r.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); rezept.id = r.id; }
      return { id: String(r.id), name: r.name || "Unbenanntes Rezept", daten: r, aktualisiert_am: new Date().toISOString() };
    });
    const result = await supabaseClient.from("rezepte").upsert(rows, { onConflict: "id" });
    if (result.error) throw result.error;
    cloudStatus(rows.length + " Rezept(e) in Cloud gespeichert");
  } catch (fehler) {
    console.error("Cloud-Speichern Fehler:", fehler);
    cloudStatus("Cloud-Speichern fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  }
}

function rezeptLoeschen(index) {
  try {
    if (!rezepte[index]) { alert("Rezept konnte nicht gefunden werden."); return false; }
    const rezept = rezepte[index];
    if (!confirm(`Rezept "${rezept.name}" wirklich löschen?`)) return false;
    const rezeptId = rezept.id;
    rezepte.splice(index, 1);
    localStorage.setItem("rezepte", JSON.stringify(rezepte));
    if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();
    if (typeof filterAnwenden === "function") filterAnwenden();
    else if (typeof zeigeErgebnisse === "function") zeigeErgebnisse(rezepte.map((r, i) => ({...r, index: i})));
    meldungAnzeigen(`Rezept "${rezept.name}" gelöscht.`);
    if (rezeptId && cloudAktiv && supabaseClient) supabaseClient.from("rezepte").delete().eq("id", String(rezeptId));
    return true;
  } catch (fehler) {
    console.error("Rezept löschen Fehler:", fehler);
    alert("Rezept konnte nicht gelöscht werden.");
    return false;
  }
}

function favoritUmschalten(index) {
  if (!rezepte[index]) return;
  rezepte[index].favorit = !rezepte[index].favorit;
  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  if (typeof filterAnwenden === "function") filterAnwenden();
  else if (typeof zeigeErgebnisse === "function") zeigeErgebnisse(rezepte.map((r, i) => ({...r, index: i})));
  cloudSpeichernAlle();
}

function bewertungSetzen(index, sterne) {
  if (!rezepte[index]) return;
  rezepte[index].bewertung = Number(sterne || 0);
  localStorage.setItem("rezepte", JSON.stringify(rezepte));
  if (typeof filterAnwenden === "function") filterAnwenden();
  else if (typeof zeigeErgebnisse === "function") zeigeErgebnisse(rezepte.map((r, i) => ({...r, index: i})));
  cloudSpeichernAlle();
}

function kategorieKachelUmschalten(btn) {
  if (!btn) return;
  const kategorie = btn.dataset ? (btn.dataset.kategorie || "") : "";
  if (kategorie === "") kategorienAufAlleSetzen();
  else {
    const alleButton = document.querySelector("#suchKategorieKacheln .kategorie-kachel[data-kategorie='']");
    if (alleButton) alleButton.classList.remove("aktiv");
    if (btn.classList) btn.classList.toggle("aktiv");
    const aktive = document.querySelector("#suchKategorieKacheln .kategorie-kachel.aktiv:not([data-kategorie=''])");
    if (!aktive) kategorienAufAlleSetzen();
  }
  if (typeof filterAnwenden === "function") filterAnwenden();
}

function kategorienAufAlleSetzen() {
  document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel").forEach(k => k.classList.remove("aktiv"));
  const alle = document.querySelector("#suchKategorieKacheln .kategorie-kachel[data-kategorie='']");
  if (alle) alle.classList.add("aktiv");
}

function aktiveKategorien() {
  return Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv")).map(x => x.dataset ? x.dataset.kategorie : "").filter(Boolean);
}

function filterBasis(liste) {
  const kategorien = aktiveKategorien();
  if (!kategorien.length) return liste;
  return liste.filter(r => kategorien.includes(r.kategorie));
}

function filterAnwenden() {
  let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => ({...rezept, index, vorhandene: [], fehlende: []}));
  ergebnisse = filterBasis(ergebnisse);
  if (typeof sortieren === "function") ergebnisse = sortieren(ergebnisse);
  letzteSuchErgebnisse = ergebnisse;
  if (typeof zeigeErgebnisse === "function") zeigeErgebnisse(ergebnisse);
}

window.addEventListener("load", function () { tagsListeAktualisieren(); });



// ===============================
// VERSION 1.31 CLOUD STABLE
// Diese Version basiert auf der getesteten v1.30.2.
// Bestätigt funktionierend:
// - Speichern
// - Cloud-Speicherung
// - Löschen
// - Favoriten
// - Sternebewertung
// - Suche nach Quelle und Tags
// - Mehrfach-Tags
// - Nährwerte
// - Portionsrechner mit mg-Erhalt
// ===============================



// =====================================================
// VERSION 1.33 CLOUD OFFLINE
// Cloud-Backups / Versionierung + Offline-Modus mit späterer Synchronisierung
// =====================================================

const OFFLINE_QUEUE_KEY = "rezeptfinder_offline_queue_v1";
const CLOUD_BACKUP_TABLE = "rezept_backups";
let offlineSyncLaeuft = false;
let letzteCloudBackupSignatur = "";

function offlineQueueLesen() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const daten = raw ? JSON.parse(raw) : [];
    return Array.isArray(daten) ? daten : [];
  } catch {
    return [];
  }
}

function offlineQueueSchreiben(queue) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  offlineStatusAktualisieren();
}

function offlineAktionMerken(typ, daten) {
  const queue = offlineQueueLesen();
  queue.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    typ,
    zeit: new Date().toISOString(),
    daten
  });
  offlineQueueSchreiben(queue);
}

function offlineStatusAktualisieren() {
  const element = document.getElementById("offlineStatusText");
  if (!element) return;

  const queue = offlineQueueLesen();
  if (queue.length === 0) {
    element.textContent = "Offline-Sync: alles synchronisiert";
    element.style.color = "#166534";
  } else {
    element.textContent = `Offline-Sync: ${queue.length} Änderung(en) warten auf Synchronisierung`;
    element.style.color = "#b45309";
  }
}

function istOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

function rezepteSnapshot() {
  return JSON.parse(JSON.stringify(Array.isArray(rezepte) ? rezepte : []));
}

async function cloudBackupErstellen(grund = "Automatisches Backup") {
  if (!cloudAktiv) cloudInit();

  const snapshot = rezepteSnapshot();
  if (snapshot.length === 0) return;

  if (!cloudAktiv || !supabaseClient || !istOnline()) {
    offlineAktionMerken("backup", { grund, rezepte: snapshot });
    cloudStatus("Offline: Backup wird später synchronisiert");
    return;
  }

  const signatur = JSON.stringify(snapshot);
  if (signatur === letzteCloudBackupSignatur) return;

  try {
    const result = await supabaseClient.from(CLOUD_BACKUP_TABLE).insert({
      grund,
      anzahl: snapshot.length,
      daten: snapshot,
      erstellt_am: new Date().toISOString()
    });

    if (result.error) throw result.error;
    letzteCloudBackupSignatur = signatur;
  } catch (fehler) {
    console.warn("Cloud-Backup konnte nicht erstellt werden:", fehler);
    offlineAktionMerken("backup", { grund, rezepte: snapshot });
  }
}

async function cloudBackupsAnzeigen() {
  const panel = document.getElementById("cloudBackupPanel");
  if (!panel) return;

  if (!cloudAktiv) cloudInit();

  if (!cloudAktiv || !supabaseClient || !istOnline()) {
    panel.innerHTML = "<p>Cloud-Backups können gerade nicht geladen werden. Du bist offline oder nicht verbunden.</p>";
    return;
  }

  try {
    panel.innerHTML = "<p>Cloud-Backups werden geladen ...</p>";

    const { data, error } = await supabaseClient
      .from(CLOUD_BACKUP_TABLE)
      .select("id, erstellt_am, grund, anzahl")
      .order("erstellt_am", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      panel.innerHTML = "<p>Noch keine Cloud-Backups vorhanden.</p>";
      return;
    }

    panel.innerHTML = `
      <h3>Cloud-Backups</h3>
      <p>Hier kannst du ältere Versionen deiner Rezeptliste wiederherstellen.</p>
      ${data.map(backup => `
        <div class="cloud-backup-eintrag">
          <strong>${new Date(backup.erstellt_am).toLocaleString("de-DE")}</strong><br>
          <span>${backup.anzahl || 0} Rezept(e) · ${backup.grund || "Backup"}</span><br>
          <button type="button" onclick="cloudBackupWiederherstellen('${backup.id}')">Wiederherstellen</button>
        </div>
      `).join("")}
    `;
  } catch (fehler) {
    console.error("Cloud-Backups laden Fehler:", fehler);
    panel.innerHTML = `<p>Cloud-Backups konnten nicht geladen werden: ${fehler.message || "unbekannter Fehler"}</p>`;
  }
}

async function cloudBackupWiederherstellen(id) {
  if (!confirm("Dieses Cloud-Backup wirklich wiederherstellen? Deine aktuelle Rezeptliste wird ersetzt.")) return;

  if (!cloudAktiv) cloudInit();

  try {
    const { data, error } = await supabaseClient
      .from(CLOUD_BACKUP_TABLE)
      .select("daten, erstellt_am")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data || !Array.isArray(data.daten)) {
      alert("Dieses Backup konnte nicht gelesen werden.");
      return;
    }

    await cloudBackupErstellen("Vor Backup-Wiederherstellung");

    rezepte = JSON.parse(JSON.stringify(data.daten));
    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    if (typeof datenstrukturReparieren === "function") datenstrukturReparieren();
    if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    if (typeof tagsListeAktualisieren === "function") tagsListeAktualisieren();
    if (typeof quellenListeAktualisieren === "function") quellenListeAktualisieren();

    const ergebnisse = document.getElementById("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";

    await cloudSpeichernAlle();
    cloudStatus("Cloud-Backup wurde wiederhergestellt");
    cloudBackupsAnzeigen();
  } catch (fehler) {
    console.error("Backup wiederherstellen Fehler:", fehler);
    alert("Backup konnte nicht wiederhergestellt werden: " + (fehler.message || "unbekannter Fehler"));
  }
}

const cloudSpeichernAlleVorOffline133 = typeof cloudSpeichernAlle === "function" ? cloudSpeichernAlle : null;

async function cloudSpeichernAlle() {
  try {
    if (!cloudAktiv) cloudInit();

    const liste = Array.isArray(rezepte) ? rezepte : [];

    if (liste.length === 0) {
      cloudStatus("Keine Rezepte zum Speichern");
      return;
    }

    if (!cloudAktiv || !supabaseClient || !istOnline()) {
      offlineAktionMerken("save_all", { rezepte: rezepteSnapshot() });
      cloudStatus("Offline: Änderung lokal gespeichert und für Sync vorgemerkt", true);
      return;
    }

    await cloudBackupErstellen("Vor Cloud-Speicherung");

    cloudStatus("speichere in Cloud ...");

    const rows = liste.map(rezept => {
      const r = JSON.parse(JSON.stringify(rezept || {}));
      if (!r.id) {
        r.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
        rezept.id = r.id;
      }

      return {
        id: String(r.id),
        name: r.name || "Unbenanntes Rezept",
        daten: r,
        aktualisiert_am: new Date().toISOString()
      };
    });

    const result = await supabaseClient.from("rezepte").upsert(rows, { onConflict: "id" });
    if (result.error) throw result.error;

    localStorage.setItem("rezepte", JSON.stringify(rezepte));
    cloudStatus(rows.length + " Rezept(e) in Cloud gespeichert");
    offlineStatusAktualisieren();
  } catch (fehler) {
    console.error("Cloud-Speichern Fehler:", fehler);
    offlineAktionMerken("save_all", { rezepte: rezepteSnapshot() });
    cloudStatus("Speichern fehlgeschlagen – Änderung für späteren Sync vorgemerkt", true);
  }
}

async function offlineSyncJetzt() {
  if (offlineSyncLaeuft) return;
  offlineSyncLaeuft = true;

  try {
    if (!cloudAktiv) cloudInit();

    if (!cloudAktiv || !supabaseClient || !istOnline()) {
      cloudStatus("Offline-Sync nicht möglich: keine Verbindung", true);
      return;
    }

    const queue = offlineQueueLesen();

    if (queue.length === 0) {
      cloudStatus("Keine Offline-Änderungen offen");
      offlineStatusAktualisieren();
      return;
    }

    cloudStatus(`synchronisiere ${queue.length} Offline-Änderung(en) ...`);

    let letzterSnapshot = null;
    const backups = [];

    queue.forEach(aktion => {
      if (aktion.typ === "save_all" && aktion.daten && Array.isArray(aktion.daten.rezepte)) {
        letzterSnapshot = aktion.daten.rezepte;
      }
      if (aktion.typ === "backup" && aktion.daten && Array.isArray(aktion.daten.rezepte)) {
        backups.push(aktion);
      }
    });

    for (const backup of backups) {
      await supabaseClient.from(CLOUD_BACKUP_TABLE).insert({
        grund: backup.daten.grund || "Offline-Backup",
        anzahl: backup.daten.rezepte.length,
        daten: backup.daten.rezepte,
        erstellt_am: backup.zeit || new Date().toISOString()
      });
    }

    if (letzterSnapshot) {
      const aktuelleRezepte = rezepte;
      rezepte = JSON.parse(JSON.stringify(letzterSnapshot));
      await cloudSpeichernAlle();
      rezepte = aktuelleRezepte;
    }

    offlineQueueSchreiben([]);
    cloudStatus("Offline-Änderungen synchronisiert");
  } catch (fehler) {
    console.error("Offline-Sync Fehler:", fehler);
    cloudStatus("Offline-Sync fehlgeschlagen: " + (fehler.message || "unbekannter Fehler"), true);
  } finally {
    offlineSyncLaeuft = false;
    offlineStatusAktualisieren();
  }
}

window.addEventListener("load", function () {
  offlineStatusAktualisieren();

  window.addEventListener("online", function () {
    cloudStatus("Online – Offline-Daten werden synchronisiert ...");
    offlineSyncJetzt();
  });

  window.addEventListener("offline", function () {
    cloudStatus("Offline – Änderungen werden lokal vorgemerkt", true);
    offlineStatusAktualisieren();
  });

  setTimeout(function () {
    if (istOnline()) offlineSyncJetzt();
  }, 2000);
});



// =====================================================
// VERSION 1.34: Rezept-Assistent übernimmt Tags und Nährwerte
// =====================================================

function assistentFeldSetzen(id, wert) {
  const element = document.getElementById(id);
  if (!element) return;
  if (wert === undefined || wert === null || wert === "") return;
  element.value = wert;
}

function assistentZahlAusText(text) {
  if (text === undefined || text === null) return "";
  const match = String(text).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) return "";
  const zahl = Number(match[0]);
  return isFinite(zahl) ? zahl : "";
}

function assistentTagsAusText(text) {
  const tags = [];
  const zeilen = String(text || "").split(/\n/);

  zeilen.forEach(zeile => {
    const trimmed = zeile.trim();

    if (/^(tags?|schlagworte?)\s*:/i.test(trimmed)) {
      const nachDoppelpunkt = trimmed.split(":").slice(1).join(":");
      nachDoppelpunkt
        .split(/[,;#]/)
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .forEach(t => tags.push(t));
    }

    const hashTags = trimmed.match(/#[\p{L}\p{N}_-]+/gu);
    if (hashTags) {
      hashTags
        .map(t => t.replace("#", "").trim().toLowerCase())
        .filter(Boolean)
        .forEach(t => tags.push(t));
    }
  });

  return [...new Set(tags)];
}

function assistentNaehrwerteAusText(text) {
  const t = String(text || "");
  const n = {};

  const muster = [
    ["kalorien", /(kalorien|kcal|energie)\s*:?\s*([\d,.]+)/i],
    ["eiweiss", /(eiweiß|eiweiss|protein)\s*:?\s*([\d,.]+)/i],
    ["kohlenhydrate", /(kohlenhydrate|kh)\s*:?\s*([\d,.]+)/i],
    ["fett", /(fett)\s*:?\s*([\d,.]+)/i],
    ["zucker", /(zucker)\s*:?\s*([\d,.]+)/i],
    ["ballaststoffe", /(ballaststoffe)\s*:?\s*([\d,.]+)/i],
    ["salz", /(salz)\s*:?\s*([\d,.]+)/i]
  ];

  muster.forEach(([key, regex]) => {
    const match = t.match(regex);
    if (match && match[2] !== undefined) {
      n[key] = assistentZahlAusText(match[2]);
    }
  });

  return n;
}

function assistentTagsUndNaehrwerteInFormularUebernehmen(text, analyseDaten = null) {
  const quelleText = String(text || "");

  let tags = assistentTagsAusText(quelleText);

  if (analyseDaten && Array.isArray(analyseDaten.tags)) {
    tags = tags.concat(analyseDaten.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean));
  }

  tags = [...new Set(tags)];

  if (tags.length > 0) {
    const vorhandeneTags = (document.getElementById("tagsInput")?.value || "")
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const neueTags = [...new Set([...vorhandeneTags, ...tags])];
    assistentFeldSetzen("tagsInput", neueTags.join(", "));
  }

  const n = {
    ...assistentNaehrwerteAusText(quelleText),
    ...(analyseDaten && analyseDaten.naehrwerte ? analyseDaten.naehrwerte : {})
  };

  const mapping = {
    kalorien: "kalorienInput",
    eiweiss: "eiweissInput",
    eiweiß: "eiweissInput",
    protein: "eiweissInput",
    kohlenhydrate: "kohlenhydrateInput",
    fett: "fettInput",
    zucker: "zuckerInput",
    ballaststoffe: "ballaststoffeInput",
    salz: "salzInput"
  };

  Object.entries(mapping).forEach(([key, id]) => {
    if (n[key] !== undefined && n[key] !== null && n[key] !== "") {
      assistentFeldSetzen(id, assistentZahlAusText(n[key]));
    }
  });
}

function assistentTextHolen() {
  return (
    document.getElementById("rezeptAssistentText")?.value ||
    document.getElementById("importText")?.value ||
    document.getElementById("assistentText")?.value ||
    document.getElementById("rezeptImportText")?.value ||
    document.querySelector("textarea")?.value ||
    ""
  );
}

const rezeptAnalysierenDirektVor134 = typeof rezeptAnalysierenDirekt === "function" ? rezeptAnalysierenDirekt : null;

function rezeptAnalysierenDirekt() {
  let ergebnis;

  if (rezeptAnalysierenDirektVor134) {
    ergebnis = rezeptAnalysierenDirektVor134();
  }

  setTimeout(function () {
    assistentTagsUndNaehrwerteInFormularUebernehmen(assistentTextHolen());
  }, 100);

  return ergebnis;
}

if (typeof rezeptAnalysieren === "function") {
  const rezeptAnalysierenVor134 = rezeptAnalysieren;
  rezeptAnalysieren = function() {
    const ergebnis = rezeptAnalysierenVor134();
    setTimeout(function () {
      assistentTagsUndNaehrwerteInFormularUebernehmen(assistentTextHolen());
    }, 100);
    return ergebnis;
  };
}



// =====================================================
// VERSION 1.35: Rezept-Assistent Vorschau vollständig
// =====================================================

function assistentAktuelleFormularDaten() {
  return {
    name: document.getElementById("nameInput")?.value || "",
    kategorie: document.getElementById("kategorieInput")?.value || "",
    portionen: document.getElementById("portionenInput")?.value || "",
    schwierigkeit: document.getElementById("schwierigkeitInput")?.value || "",
    zubereitungszeit: document.getElementById("zubereitungszeitInput")?.value || "",
    quelle: document.getElementById("quelleInput")?.value || "",
    tags: document.getElementById("tagsInput")?.value || "",
    naehrwerte: {
      kalorien: document.getElementById("kalorienInput")?.value || "",
      eiweiss: document.getElementById("eiweissInput")?.value || "",
      kohlenhydrate: document.getElementById("kohlenhydrateInput")?.value || "",
      fett: document.getElementById("fettInput")?.value || "",
      zucker: document.getElementById("zuckerInput")?.value || "",
      ballaststoffe: document.getElementById("ballaststoffeInput")?.value || "",
      salz: document.getElementById("salzInput")?.value || ""
    }
  };
}

function assistentNaehrwerteVorschauHtml(n) {
  const zeilen = [
    ["Kalorien", n.kalorien, "kcal"],
    ["Eiweiß", n.eiweiss, "g"],
    ["Kohlenhydrate", n.kohlenhydrate, "g"],
    ["Fett", n.fett, "g"],
    ["Zucker", n.zucker, "g"],
    ["Ballaststoffe", n.ballaststoffe, "g"],
    ["Salz", n.salz, "g"]
  ].filter(x => String(x[1] || "").trim() !== "");

  if (!zeilen.length) return "<p>Keine Nährwerte erkannt.</p>";

  return `
    <ul>
      ${zeilen.map(z => `<li><strong>${esc(z[0])}:</strong> ${esc(z[1])} ${z[2]}</li>`).join("")}
    </ul>
  `;
}

function assistentTagsVorschauHtml(tagsText) {
  const tags = String(tagsText || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  if (!tags.length) return "<p>Keine Tags erkannt.</p>";

  return tags.map(tag => `<span class="tag-chip">${esc(tag)}</span>`).join("");
}

function assistentVorschauAktualisieren() {
  const daten = assistentAktuelleFormularDaten();

  const moeglicheContainer = [
    "rezeptAssistentVorschau",
    "assistentVorschau",
    "analyseVorschau",
    "rezeptAnalyseVorschau"
  ];

  let container = null;

  for (const id of moeglicheContainer) {
    const element = document.getElementById(id);
    if (element) {
      container = element;
      break;
    }
  }

  if (!container) {
    // Falls die alte App keinen eigenen Vorschau-Container hat, einen unter dem Assistenten erzeugen.
    const assistentBereich =
      document.getElementById("rezeptAssistentBereich") ||
      document.getElementById("assistentBereich");

    if (!assistentBereich) return;

    container = document.createElement("div");
    container.id = "rezeptAssistentVorschau";
    container.className = "assistent-vorschau box";
    assistentBereich.appendChild(container);
  }

  container.innerHTML = `
    <h3>Vorschau der übernommenen Daten</h3>

    <p><strong>Name:</strong> ${esc(daten.name || "nicht erkannt")}</p>
    <p><strong>Kategorie:</strong> ${esc(daten.kategorie || "nicht erkannt")}</p>
    <p><strong>Portionen:</strong> ${esc(daten.portionen || "nicht erkannt")}</p>
    <p><strong>Schwierigkeit:</strong> ${esc(daten.schwierigkeit || "nicht erkannt")}</p>
    <p><strong>Zubereitungszeit:</strong> ${esc(daten.zubereitungszeit || "nicht erkannt")}</p>
    <p><strong>Quelle:</strong> ${esc(daten.quelle || "Nicht zugeordnet")}</p>

    <h4>Tags</h4>
    <div class="assistent-tags-vorschau">
      ${assistentTagsVorschauHtml(daten.tags)}
    </div>

    <h4>Nährwerte pro 100 g</h4>
    <div class="assistent-naehrwerte-vorschau">
      ${assistentNaehrwerteVorschauHtml(daten.naehrwerte)}
    </div>

    <p class="hinweis-klein">Diese Vorschau zeigt die Werte, die aktuell im Formular stehen und gespeichert würden.</p>
  `;
}

// Nach Analyse zuerst Daten übernehmen, dann Vorschau aus den Formularfeldern bauen.
const rezeptAnalysierenDirektVor135 = typeof rezeptAnalysierenDirekt === "function" ? rezeptAnalysierenDirekt : null;

function rezeptAnalysierenDirekt() {
  let ergebnis;

  if (rezeptAnalysierenDirektVor135) {
    ergebnis = rezeptAnalysierenDirektVor135();
  }

  setTimeout(function () {
    if (typeof assistentTagsUndNaehrwerteInFormularUebernehmen === "function") {
      const text =
        document.getElementById("rezeptAssistentText")?.value ||
        document.getElementById("importText")?.value ||
        document.getElementById("assistentText")?.value ||
        document.getElementById("rezeptImportText")?.value ||
        document.querySelector("textarea")?.value ||
        "";

      assistentTagsUndNaehrwerteInFormularUebernehmen(text);
    }

    assistentVorschauAktualisieren();
  }, 150);

  return ergebnis;
}

// Auch beim Reset Vorschau leeren.
if (typeof rezeptAssistentZuruecksetzen === "function") {
  const rezeptAssistentZuruecksetzenVor135 = rezeptAssistentZuruecksetzen;
  rezeptAssistentZuruecksetzen = function() {
    const ergebnis = rezeptAssistentZuruecksetzenVor135();

    const container =
      document.getElementById("rezeptAssistentVorschau") ||
      document.getElementById("assistentVorschau") ||
      document.getElementById("analyseVorschau") ||
      document.getElementById("rezeptAnalyseVorschau");

    if (container) container.innerHTML = "";

    return ergebnis;
  };
}



// =====================================================
// VERSION 1.35.1: Rezept-Assistent Button vollständig repariert
// =====================================================

function assistentTextSicherHolen() {
  const ids = [
    "rezeptAssistentText",
    "rezeptAssistentInput",
    "assistentText",
    "importText",
    "rezeptImportText"
  ];

  for (const id of ids) {
    const element = document.getElementById(id);
    if (element && String(element.value || "").trim()) {
      return String(element.value || "");
    }
  }

  const textarea = document.querySelector("#rezeptAssistentBereich textarea") || document.querySelector("textarea");
  return textarea ? String(textarea.value || "") : "";
}

function assistentErsterTreffer(text, muster) {
  const match = String(text || "").match(muster);
  return match && match[1] !== undefined ? match[1].trim() : "";
}

function assistentAbschnitt(text, startWoerter, stoppWoerter) {
  const zeilen = String(text || "").split(/\n/);
  const startIndex = zeilen.findIndex(zeile =>
    startWoerter.some(wort => zeile.trim().toLowerCase().startsWith(wort.toLowerCase()))
  );

  if (startIndex === -1) return "";

  const sammlung = [];
  for (let i = startIndex + 1; i < zeilen.length; i++) {
    const zeile = zeilen[i];
    const klein = zeile.trim().toLowerCase();

    if (stoppWoerter.some(wort => klein.startsWith(wort.toLowerCase()))) break;
    sammlung.push(zeile);
  }

  return sammlung.join("\n").trim();
}

function assistentZutatenParsen(text) {
  const zutatenText = assistentAbschnitt(text, ["zutaten:"], [
    "zubereitung:",
    "anleitung:",
    "schritte:",
    "utensilien:",
    "nährwerte",
    "naehrwerte",
    "tags:",
    "quelle:"
  ]);

  if (!zutatenText) return [];

  return zutatenText
    .split(/\n/)
    .map(zeile => zeile.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .map(zeile => {
      const match = zeile.match(/^([\d,.\/]+)?\s*([a-zA-ZäöüÄÖÜß]+\.?|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (!match) return { menge: "", einheit: "", name: zeile };

      return {
        menge: match[1] || "",
        einheit: match[2] || "",
        name: match[3] || zeile
      };
    });
}

function assistentZubereitungParsen(text) {
  const zubereitung = assistentAbschnitt(text, ["zubereitung:", "anleitung:", "schritte:"], [
    "utensilien:",
    "nährwerte",
    "naehrwerte",
    "tags:",
    "quelle:"
  ]);

  return zubereitung
    .split(/\n/)
    .map(zeile => zeile.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function assistentUtensilienParsen(text) {
  const wert = assistentErsterTreffer(text, /(?:^|\n)\s*Utensilien\s*:\s*(.+)/i);
  if (wert) return wert;

  const abschnitt = assistentAbschnitt(text, ["utensilien:"], [
    "zubereitung:",
    "zutaten:",
    "nährwerte",
    "naehrwerte",
    "tags:"
  ]);

  return abschnitt
    .split(/\n|,/)
    .map(x => x.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function assistentTagsParsenDirekt(text) {
  if (typeof assistentTagsAusText === "function") {
    const tags = assistentTagsAusText(text);
    if (tags.length) return tags.join(", ");
  }

  const tags = assistentErsterTreffer(text, /(?:^|\n)\s*(?:Tags?|Schlagworte?)\s*:\s*(.+)/i);
  return tags;
}

function assistentNaehrwerteDirektParsen(text) {
  if (typeof assistentNaehrwerteAusText === "function") {
    return assistentNaehrwerteAusText(text);
  }

  function zahl(regex) {
    const match = String(text || "").replace(",", ".").match(regex);
    return match ? match[2] : "";
  }

  return {
    kalorien: zahl(/(kalorien|kcal|energie)\s*:?\s*([\d.]+)/i),
    eiweiss: zahl(/(eiweiß|eiweiss|protein)\s*:?\s*([\d.]+)/i),
    kohlenhydrate: zahl(/(kohlenhydrate|kh)\s*:?\s*([\d.]+)/i),
    fett: zahl(/(fett)\s*:?\s*([\d.]+)/i),
    zucker: zahl(/(zucker)\s*:?\s*([\d.]+)/i),
    ballaststoffe: zahl(/(ballaststoffe)\s*:?\s*([\d.]+)/i),
    salz: zahl(/(salz)\s*:?\s*([\d.]+)/i)
  };
}

function assistentZutatenInsFormular(zutaten) {
  if (!Array.isArray(zutaten) || zutaten.length === 0) return;

  const container = document.getElementById("zutatenGruppen");
  if (!container) return;

  container.innerHTML = "";

  if (typeof zutatenGruppeHinzufuegen === "function") {
    try {
      zutatenGruppeHinzufuegen("Zutaten", zutaten);
      return;
    } catch (e) {
      console.warn("Zutatengruppe mit Daten konnte nicht direkt geladen werden:", e);
    }
  }

  // Fallback für die bekannte Struktur
  const gruppe = document.createElement("div");
  gruppe.className = "zutatengruppe";
  gruppe.innerHTML = `
    <input class="zutaten-gruppenname" value="Zutaten">
    <div class="zutaten-zeilen"></div>
  `;
  const zeilen = gruppe.querySelector(".zutaten-zeilen");

  zutaten.forEach(zutat => {
    const zeile = document.createElement("div");
    zeile.className = "zutaten-zeile";
    zeile.innerHTML = `
      <input class="zutat-menge" value="${esc(zutat.menge || "")}" placeholder="Menge">
      <input class="zutat-einheit" value="${esc(zutat.einheit || "")}" placeholder="Einheit">
      <input class="zutat-name" value="${esc(zutat.name || "")}" placeholder="Zutat">
    `;
    zeilen.appendChild(zeile);
  });

  container.appendChild(gruppe);
}

function rezeptAnalysierenDirekt() {
  try {
    const text = assistentTextSicherHolen();

    if (!text.trim()) {
      alert("Bitte zuerst einen Rezepttext einfügen.");
      return false;
    }

    const name = assistentErsterTreffer(text, /(?:^|\n)\s*Name\s*:\s*(.+)/i);
    const kategorie = assistentErsterTreffer(text, /(?:^|\n)\s*Kategorie\s*:\s*(.+)/i);
    const portionen = assistentErsterTreffer(text, /(?:^|\n)\s*Portionen\s*:\s*(.+)/i);
    const schwierigkeit = assistentErsterTreffer(text, /(?:^|\n)\s*Schwierigkeit\s*:\s*(.+)/i);
    const zubereitungszeit = assistentErsterTreffer(text, /(?:^|\n)\s*(?:Zubereitungszeit|Zeit)\s*:\s*(.+)/i);
    const quelle = assistentErsterTreffer(text, /(?:^|\n)\s*Quelle\s*:\s*(.+)/i);
    const tags = assistentTagsParsenDirekt(text);
    const naehrwerte = assistentNaehrwerteDirektParsen(text);
    const zutaten = assistentZutatenParsen(text);
    const zubereitung = assistentZubereitungParsen(text);
    const utensilien = assistentUtensilienParsen(text);

    assistentFeldSetzen("nameInput", name);
    assistentFeldSetzen("kategorieInput", kategorie);
    assistentFeldSetzen("portionenInput", assistentZahlAusText(portionen));
    assistentFeldSetzen("schwierigkeitInput", schwierigkeit);
    assistentFeldSetzen("zubereitungszeitInput", zubereitungszeit);
    assistentFeldSetzen("quelleInput", quelle || "Nicht zugeordnet");
    assistentFeldSetzen("tagsInput", tags);
    assistentFeldSetzen("zubereitungInput", zubereitung);
    assistentFeldSetzen("utensilienInput", utensilien);

    assistentFeldSetzen("kalorienInput", naehrwerte.kalorien);
    assistentFeldSetzen("eiweissInput", naehrwerte.eiweiss || naehrwerte.protein);
    assistentFeldSetzen("kohlenhydrateInput", naehrwerte.kohlenhydrate);
    assistentFeldSetzen("fettInput", naehrwerte.fett);
    assistentFeldSetzen("zuckerInput", naehrwerte.zucker);
    assistentFeldSetzen("ballaststoffeInput", naehrwerte.ballaststoffe);
    assistentFeldSetzen("salzInput", naehrwerte.salz);

    assistentZutatenInsFormular(zutaten);

    if (typeof assistentVorschauAktualisieren === "function") {
      assistentVorschauAktualisieren();
    }

    if (typeof meldungAnzeigen === "function") {
      meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");
    }

    return true;
  } catch (fehler) {
    console.error("Rezept-Assistent Fehler:", fehler);
    alert("Rezept konnte nicht analysiert werden: " + (fehler.message || "unbekannter Fehler"));
    return false;
  }
}



// =====================================================
// VERSION 1.35.2: Rezept analysieren Button endgültig repariert
// Wichtig: echtes Textfeld heißt textImportInput
// =====================================================

function assistentTextSicherHolen() {
  const ids = [
    "textImportInput",
    "rezeptAssistentText",
    "rezeptAssistentInput",
    "assistentText",
    "importText",
    "rezeptImportText"
  ];

  for (const id of ids) {
    const element = document.getElementById(id);
    if (element && String(element.value || "").trim()) {
      return String(element.value || "");
    }
  }

  const textarea = document.querySelector("textarea");
  return textarea ? String(textarea.value || "") : "";
}

function assistentFeldSetzen(id, wert) {
  const element = document.getElementById(id);
  if (!element) return;
  if (wert === undefined || wert === null || wert === "") return;
  element.value = wert;
}

function assistentZahlAusText(text) {
  if (text === undefined || text === null) return "";
  const match = String(text).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) return "";
  const zahl = Number(match[0]);
  return isFinite(zahl) ? zahl : "";
}

function assistentErsterTreffer(text, muster) {
  const match = String(text || "").match(muster);
  return match && match[1] !== undefined ? match[1].trim() : "";
}

function assistentAbschnitt(text, startWoerter, stoppWoerter) {
  const zeilen = String(text || "").split(/\n/);
  const startIndex = zeilen.findIndex(zeile =>
    startWoerter.some(wort => zeile.trim().toLowerCase().startsWith(wort.toLowerCase()))
  );

  if (startIndex === -1) return "";

  const sammlung = [];
  for (let i = startIndex + 1; i < zeilen.length; i++) {
    const zeile = zeilen[i];
    const klein = zeile.trim().toLowerCase();
    if (stoppWoerter.some(wort => klein.startsWith(wort.toLowerCase()))) break;
    sammlung.push(zeile);
  }

  return sammlung.join("\n").trim();
}

function assistentTagsAusText(text) {
  const tags = [];
  String(text || "").split(/\n/).forEach(zeile => {
    const trimmed = zeile.trim();

    if (/^(tags?|schlagworte?)\s*:/i.test(trimmed)) {
      trimmed.split(":").slice(1).join(":")
        .split(/[,;#]/)
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .forEach(t => tags.push(t));
    }

    const hashTags = trimmed.match(/#[\p{L}\p{N}_-]+/gu);
    if (hashTags) {
      hashTags
        .map(t => t.replace("#", "").trim().toLowerCase())
        .filter(Boolean)
        .forEach(t => tags.push(t));
    }
  });

  return [...new Set(tags)];
}

function assistentNaehrwerteAusText(text) {
  const t = String(text || "");
  const n = {};

  const muster = [
    ["kalorien", /(kalorien|kcal|energie)\s*:?\s*([\d,.]+)/i],
    ["eiweiss", /(eiweiß|eiweiss|protein)\s*:?\s*([\d,.]+)/i],
    ["kohlenhydrate", /(kohlenhydrate|kh)\s*:?\s*([\d,.]+)/i],
    ["fett", /(fett)\s*:?\s*([\d,.]+)/i],
    ["zucker", /(zucker)\s*:?\s*([\d,.]+)/i],
    ["ballaststoffe", /(ballaststoffe)\s*:?\s*([\d,.]+)/i],
    ["salz", /(salz)\s*:?\s*([\d,.]+)/i]
  ];

  muster.forEach(([key, regex]) => {
    const match = t.match(regex);
    if (match && match[2] !== undefined) n[key] = assistentZahlAusText(match[2]);
  });

  return n;
}

function assistentZutatenParsen(text) {
  const zutatenText = assistentAbschnitt(text, ["zutaten:"], [
    "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:"
  ]);

  if (!zutatenText) return [];

  return zutatenText
    .split(/\n/)
    .map(zeile => zeile.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .map(zeile => {
      const match = zeile.match(/^([\d,.\/]+)?\s*([a-zA-ZäöüÄÖÜß]+\.?|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (!match) return { menge: "", einheit: "", name: zeile };
      return { menge: match[1] || "", einheit: match[2] || "", name: match[3] || zeile };
    });
}

function assistentZubereitungParsen(text) {
  return assistentAbschnitt(text, ["zubereitung:", "anleitung:", "schritte:"], [
    "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:"
  ])
    .split(/\n/)
    .map(zeile => zeile.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function assistentUtensilienParsen(text) {
  const wert = assistentErsterTreffer(text, /(?:^|\n)\s*Utensilien\s*:\s*(.+)/i);
  if (wert) return wert;

  return assistentAbschnitt(text, ["utensilien:"], [
    "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:"
  ])
    .split(/\n|,/)
    .map(x => x.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function assistentZutatenInsFormular(zutaten) {
  if (!Array.isArray(zutaten) || zutaten.length === 0) return;

  const container = document.getElementById("zutatenGruppen");
  if (!container) return;

  container.innerHTML = "";

  try {
    if (typeof zutatenGruppeHinzufuegen === "function") {
      zutatenGruppeHinzufuegen("Zutaten", zutaten);
      return;
    }
  } catch (e) {
    console.warn("Zutaten-Gruppe direkt laden fehlgeschlagen, Fallback wird genutzt.", e);
  }

  const gruppe = document.createElement("div");
  gruppe.className = "zutatengruppe";
  gruppe.innerHTML = `
    <input class="zutaten-gruppenname" value="Zutaten">
    <div class="zutaten-zeilen"></div>
  `;

  const zeilen = gruppe.querySelector(".zutaten-zeilen");

  zutaten.forEach(zutat => {
    const zeile = document.createElement("div");
    zeile.className = "zutaten-zeile";
    zeile.innerHTML = `
      <input class="zutat-menge" value="${esc(zutat.menge || "")}" placeholder="Menge">
      <input class="zutat-einheit" value="${esc(zutat.einheit || "")}" placeholder="Einheit">
      <input class="zutat-name" value="${esc(zutat.name || "")}" placeholder="Zutat">
    `;
    zeilen.appendChild(zeile);
  });

  container.appendChild(gruppe);
}

function rezeptAnalysierenDirekt() {
  try {
    const text = assistentTextSicherHolen();

    if (!text.trim()) {
      alert("Bitte zuerst einen Rezepttext einfügen.");
      return false;
    }

    const name = assistentErsterTreffer(text, /(?:^|\n)\s*Name\s*:\s*(.+)/i) || text.split(/\n/).map(x => x.trim()).filter(Boolean)[0] || "";
    const kategorie = assistentErsterTreffer(text, /(?:^|\n)\s*Kategorie\s*:\s*(.+)/i);
    const portionen = assistentErsterTreffer(text, /(?:^|\n)\s*Portionen\s*:\s*(.+)/i);
    const schwierigkeit = assistentErsterTreffer(text, /(?:^|\n)\s*Schwierigkeit\s*:\s*(.+)/i);
    const zubereitungszeit = assistentErsterTreffer(text, /(?:^|\n)\s*(?:Zubereitungszeit|Zeit)\s*:\s*(.+)/i);
    const quelle = assistentErsterTreffer(text, /(?:^|\n)\s*Quelle\s*:\s*(.+)/i);
    const tags = assistentTagsAusText(text).join(", ");
    const naehrwerte = assistentNaehrwerteAusText(text);
    const zutaten = assistentZutatenParsen(text);
    const zubereitung = assistentZubereitungParsen(text);
    const utensilien = assistentUtensilienParsen(text);

    assistentFeldSetzen("nameInput", name);
    assistentFeldSetzen("kategorieInput", kategorie);
    assistentFeldSetzen("portionenInput", assistentZahlAusText(portionen));
    assistentFeldSetzen("schwierigkeitInput", schwierigkeit);
    assistentFeldSetzen("zubereitungszeitInput", zubereitungszeit);
    assistentFeldSetzen("quelleInput", quelle || "Nicht zugeordnet");
    assistentFeldSetzen("tagsInput", tags);
    assistentFeldSetzen("zubereitungInput", zubereitung);
    assistentFeldSetzen("utensilienInput", utensilien);

    assistentFeldSetzen("kalorienInput", naehrwerte.kalorien);
    assistentFeldSetzen("eiweissInput", naehrwerte.eiweiss);
    assistentFeldSetzen("kohlenhydrateInput", naehrwerte.kohlenhydrate);
    assistentFeldSetzen("fettInput", naehrwerte.fett);
    assistentFeldSetzen("zuckerInput", naehrwerte.zucker);
    assistentFeldSetzen("ballaststoffeInput", naehrwerte.ballaststoffe);
    assistentFeldSetzen("salzInput", naehrwerte.salz);

    assistentZutatenInsFormular(zutaten);

    if (typeof assistentVorschauAktualisieren === "function") assistentVorschauAktualisieren();
    if (typeof meldungAnzeigen === "function") meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");

    return true;
  } catch (fehler) {
    console.error("Rezept analysieren Fehler:", fehler);
    alert("Rezept konnte nicht analysiert werden: " + (fehler.message || "unbekannter Fehler"));
    return false;
  }
}

window.addEventListener("load", function () {
  const button = document.getElementById("rezeptAnalysierenButton");
  if (button) {
    button.onclick = rezeptAnalysierenDirekt;
  }
});



// =====================================================
// VERSION 1.35.3: Rezept-Assistent sichtbar + finaler Button
// =====================================================

function assistentTextSicherHolenFinal() {
  const element = document.getElementById("textImportInput");
  if (element && String(element.value || "").trim()) return String(element.value || "");

  const ids = ["rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
  for (const id of ids) {
    const e = document.getElementById(id);
    if (e && String(e.value || "").trim()) return String(e.value || "");
  }

  const textarea = document.querySelector("textarea");
  return textarea ? String(textarea.value || "") : "";
}

function assistentWertFinal(text, regex) {
  const match = String(text || "").match(regex);
  return match && match[1] !== undefined ? match[1].trim() : "";
}

function assistentZahlFinal(text) {
  const match = String(text || "").replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) return "";
  const zahl = Number(match[0]);
  return isFinite(zahl) ? zahl : "";
}

function assistentSetFinal(id, wert) {
  const element = document.getElementById(id);
  if (!element) return;
  if (wert === undefined || wert === null || wert === "") return;
  element.value = wert;
}

function assistentAbschnittFinal(text, starts, stops) {
  const zeilen = String(text || "").split(/\r?\n/);
  const startIndex = zeilen.findIndex(zeile => starts.some(s => zeile.trim().toLowerCase().startsWith(s.toLowerCase())));
  if (startIndex < 0) return "";

  const out = [];
  for (let i = startIndex + 1; i < zeilen.length; i++) {
    const z = zeilen[i];
    const klein = z.trim().toLowerCase();
    if (stops.some(s => klein.startsWith(s.toLowerCase()))) break;
    out.push(z);
  }
  return out.join("\n").trim();
}

function assistentTagsFinal(text) {
  const tags = [];
  String(text || "").split(/\r?\n/).forEach(zeile => {
    const t = zeile.trim();
    if (/^(tags?|schlagworte?)\s*:/i.test(t)) {
      t.split(":").slice(1).join(":")
        .split(/[,;#]/)
        .map(x => x.trim().toLowerCase())
        .filter(Boolean)
        .forEach(x => tags.push(x));
    }

    const hashtags = t.match(/#[\p{L}\p{N}_-]+/gu);
    if (hashtags) {
      hashtags.map(x => x.replace("#", "").trim().toLowerCase()).filter(Boolean).forEach(x => tags.push(x));
    }
  });

  return [...new Set(tags)].join(", ");
}

function assistentNaehrwerteFinal(text) {
  const t = String(text || "");
  const n = {};
  const muster = [
    ["kalorien", /(kalorien|kcal|energie)\s*:?\s*([\d,.]+)/i],
    ["eiweiss", /(eiweiß|eiweiss|protein)\s*:?\s*([\d,.]+)/i],
    ["kohlenhydrate", /(kohlenhydrate|kh)\s*:?\s*([\d,.]+)/i],
    ["fett", /(fett)\s*:?\s*([\d,.]+)/i],
    ["zucker", /(zucker)\s*:?\s*([\d,.]+)/i],
    ["ballaststoffe", /(ballaststoffe)\s*:?\s*([\d,.]+)/i],
    ["salz", /(salz)\s*:?\s*([\d,.]+)/i]
  ];

  muster.forEach(([key, regex]) => {
    const m = t.match(regex);
    if (m && m[2] !== undefined) n[key] = assistentZahlFinal(m[2]);
  });

  return n;
}

function assistentZutatenFinal(text) {
  const zutatenText = assistentAbschnittFinal(text, ["zutaten:"], [
    "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:"
  ]);

  if (!zutatenText) return [];

  return zutatenText
    .split(/\r?\n/)
    .map(z => z.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .filter(z => !/^[a-zA-ZäöüÄÖÜß ]+:$/.test(z)) // Untergruppenüberschriften wie "Teig:" überspringen
    .map(z => {
      const m = z.match(/^([\d,.\/]+)?\s*([a-zA-ZäöüÄÖÜß]+\.?|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (!m) return { menge: "", einheit: "", name: z };
      return { menge: m[1] || "", einheit: m[2] || "", name: m[3] || z };
    });
}

function assistentZubereitungFinal(text) {
  return assistentAbschnittFinal(text, ["zubereitung:", "anleitung:", "schritte:"], [
    "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:"
  ])
    .split(/\r?\n/)
    .map(z => z.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function assistentUtensilienFinal(text) {
  const direkt = assistentWertFinal(text, /(?:^|\n)\s*Utensilien\s*:\s*(.+)/i);
  if (direkt) return direkt;

  return assistentAbschnittFinal(text, ["utensilien:"], [
    "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:"
  ])
    .split(/\n|,/)
    .map(x => x.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function assistentZutatenInsFormularFinal(zutaten) {
  if (!Array.isArray(zutaten) || !zutaten.length) return;

  const container = document.getElementById("zutatenGruppen");
  if (!container) return;

  container.innerHTML = "";

  if (typeof zutatenGruppeHinzufuegen === "function") {
    try {
      zutatenGruppeHinzufuegen("Zutaten", zutaten);
      return;
    } catch (e) {
      console.warn("Zutaten direkt laden fehlgeschlagen:", e);
    }
  }
}

function assistentFormularSichtbarMachenFinal() {
  const formular = document.getElementById("formularBereich");
  if (formular) {
    formular.classList.remove("versteckt");
  }

  // Nicht alle Bereiche verstecken, sonst verschwindet ggf. die Vorschau.
  const nameInput = document.getElementById("nameInput");
  if (nameInput && typeof nameInput.scrollIntoView === "function") {
    nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function assistentVorschauFinal(daten) {
  const container = document.getElementById("assistentVorschau");
  if (!container) return;

  container.innerHTML = `
    <h3>Vorschau der übernommenen Daten</h3>
    <p><strong>Name:</strong> ${esc(daten.name || "nicht erkannt")}</p>
    <p><strong>Kategorie:</strong> ${esc(daten.kategorie || "nicht erkannt")}</p>
    <p><strong>Portionen:</strong> ${esc(daten.portionen || "nicht erkannt")}</p>
    <p><strong>Zeit:</strong> ${esc(daten.zubereitungszeit || "nicht erkannt")}</p>
    <p><strong>Quelle:</strong> ${esc(daten.quelle || "Nicht zugeordnet")}</p>
    <p><strong>Tags:</strong> ${esc(daten.tags || "keine Tags erkannt")}</p>
    <h4>Nährwerte pro 100 g</h4>
    <ul>
      <li><strong>Kalorien:</strong> ${esc(daten.naehrwerte.kalorien || "-")} kcal</li>
      <li><strong>Eiweiß:</strong> ${esc(daten.naehrwerte.eiweiss || "-")} g</li>
      <li><strong>Kohlenhydrate:</strong> ${esc(daten.naehrwerte.kohlenhydrate || "-")} g</li>
      <li><strong>Fett:</strong> ${esc(daten.naehrwerte.fett || "-")} g</li>
      <li><strong>Zucker:</strong> ${esc(daten.naehrwerte.zucker || "-")} g</li>
      <li><strong>Ballaststoffe:</strong> ${esc(daten.naehrwerte.ballaststoffe || "-")} g</li>
      <li><strong>Salz:</strong> ${esc(daten.naehrwerte.salz || "-")} g</li>
    </ul>
    <p><strong>Zutaten erkannt:</strong> ${daten.zutaten.length}</p>
    <p><strong>Zubereitung:</strong> ${daten.zubereitung ? "erkannt" : "nicht erkannt"}</p>
  `;
}

function rezeptAnalysierenDirektFinal() {
  try {
    const text = assistentTextSicherHolenFinal();

    if (!text.trim()) {
      const v = document.getElementById("assistentVorschau");
      if (v) v.innerHTML = "<p>Bitte zuerst einen Rezepttext einfügen.</p>";
      alert("Bitte zuerst einen Rezepttext einfügen.");
      return false;
    }

    const ersteZeile = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean)[0] || "";

    const daten = {
      name: assistentWertFinal(text, /(?:^|\n)\s*Name\s*:\s*(.+)/i) || ersteZeile,
      kategorie: assistentWertFinal(text, /(?:^|\n)\s*Kategorie\s*:\s*(.+)/i),
      portionen: assistentZahlFinal(assistentWertFinal(text, /(?:^|\n)\s*Portionen\s*:\s*(.+)/i)),
      schwierigkeit: assistentWertFinal(text, /(?:^|\n)\s*Schwierigkeit\s*:\s*(.+)/i),
      zubereitungszeit: assistentWertFinal(text, /(?:^|\n)\s*(?:Zubereitungszeit|Zeit)\s*:\s*(.+)/i),
      quelle: assistentWertFinal(text, /(?:^|\n)\s*Quelle\s*:\s*(.+)/i) || "Nicht zugeordnet",
      tags: assistentTagsFinal(text),
      naehrwerte: assistentNaehrwerteFinal(text),
      zutaten: assistentZutatenFinal(text),
      zubereitung: assistentZubereitungFinal(text),
      utensilien: assistentUtensilienFinal(text)
    };

    assistentSetFinal("nameInput", daten.name);
    assistentSetFinal("kategorieInput", daten.kategorie);
    assistentSetFinal("portionenInput", daten.portionen);
    assistentSetFinal("schwierigkeitInput", daten.schwierigkeit);
    assistentSetFinal("zubereitungszeitInput", daten.zubereitungszeit);
    assistentSetFinal("quelleInput", daten.quelle);
    assistentSetFinal("tagsInput", daten.tags);
    assistentSetFinal("zubereitungInput", daten.zubereitung);
    assistentSetFinal("utensilienInput", daten.utensilien);

    assistentSetFinal("kalorienInput", daten.naehrwerte.kalorien);
    assistentSetFinal("eiweissInput", daten.naehrwerte.eiweiss);
    assistentSetFinal("kohlenhydrateInput", daten.naehrwerte.kohlenhydrate);
    assistentSetFinal("fettInput", daten.naehrwerte.fett);
    assistentSetFinal("zuckerInput", daten.naehrwerte.zucker);
    assistentSetFinal("ballaststoffeInput", daten.naehrwerte.ballaststoffe);
    assistentSetFinal("salzInput", daten.naehrwerte.salz);

    assistentZutatenInsFormularFinal(daten.zutaten);
    assistentVorschauFinal(daten);
    assistentFormularSichtbarMachenFinal();

    if (typeof meldungAnzeigen === "function") {
      meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");
    }

    return true;
  } catch (fehler) {
    console.error("Rezept analysieren Fehler FINAL:", fehler);
    alert("Rezept konnte nicht analysiert werden: " + (fehler.message || "unbekannter Fehler"));
    return false;
  }
}

// Alte Namen ebenfalls auf die finale Funktion legen.
function rezeptAnalysierenDirekt() {
  return rezeptAnalysierenDirektFinal();
}

window.addEventListener("load", function () {
  const button = document.getElementById("rezeptAnalysierenButton");
  if (button) {
    button.onclick = rezeptAnalysierenDirektFinal;
  }
});



// =====================================================
// VERSION 1.35.4: Rezept-Assistent HARD FIX
// Der Button ruft window.rezeptAnalysierenDirektFinal() auf.
// Keine Abhängigkeit von alten Assistent-Funktionen.
// =====================================================

(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(text, error) {
    var el = byId("assistentStatus");
    if (el) {
      el.textContent = text || "";
      el.style.color = error ? "#dc2626" : "#166534";
    }
  }

  function safeEsc(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setField(id, value) {
    var el = byId(id);
    if (!el) return;
    if (value === undefined || value === null || value === "") return;
    el.value = value;
  }

  function numberFrom(value) {
    var match = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!match) return "";
    var n = Number(match[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function cleanLines(text) {
    return String(text || "").split(/\r?\n/).map(function (line) { return line.trim(); });
  }

  function firstNonEmptyLine(text) {
    var lines = cleanLines(text).filter(Boolean);
    return lines.length ? lines[0] : "";
  }

  function valueAfterLabel(text, labels) {
    var lines = cleanLines(text);
    var lowerLabels = labels.map(function (l) { return l.toLowerCase(); });

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var lower = line.toLowerCase();

      for (var j = 0; j < lowerLabels.length; j++) {
        var label = lowerLabels[j];
        if (lower.indexOf(label + ":") === 0) {
          return line.split(":").slice(1).join(":").trim();
        }
      }
    }

    return "";
  }

  function sectionBetween(text, startLabels, stopLabels) {
    var lines = String(text || "").split(/\r?\n/);
    var start = -1;

    for (var i = 0; i < lines.length; i++) {
      var lower = lines[i].trim().toLowerCase();
      for (var s = 0; s < startLabels.length; s++) {
        if (lower.indexOf(startLabels[s].toLowerCase()) === 0) {
          start = i;
          break;
        }
      }
      if (start !== -1) break;
    }

    if (start === -1) return "";

    var out = [];
    for (var j = start + 1; j < lines.length; j++) {
      var l = lines[j].trim().toLowerCase();
      var stop = false;
      for (var k = 0; k < stopLabels.length; k++) {
        if (l.indexOf(stopLabels[k].toLowerCase()) === 0) {
          stop = true;
          break;
        }
      }
      if (stop) break;
      out.push(lines[j]);
    }

    return out.join("\n").trim();
  }

  function parseTags(text) {
    var tags = [];
    var raw = valueAfterLabel(text, ["tags", "tag", "schlagworte"]);
    if (raw) {
      raw.split(/[,;#]/).forEach(function (tag) {
        tag = tag.trim().toLowerCase();
        if (tag) tags.push(tag);
      });
    }

    String(text || "").split(/\s+/).forEach(function (part) {
      if (part.charAt(0) === "#") {
        var tag = part.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (tag) tags.push(tag);
      }
    });

    var unique = [];
    tags.forEach(function (tag) {
      if (unique.indexOf(tag) === -1) unique.push(tag);
    });

    return unique.join(", ");
  }

  function parseNutrition(text) {
    function v(labels) {
      for (var i = 0; i < labels.length; i++) {
        var value = valueAfterLabel(text, [labels[i]]);
        if (value) return numberFrom(value);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function parseIngredients(text) {
    var block = sectionBetween(text, ["zutaten:"], [
      "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:"
    ]);

    if (!block) return [];

    var result = [];
    block.split(/\r?\n/).forEach(function (line) {
      line = line.replace(/^[-*•]\s*/, "").trim();
      if (!line) return;

      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(line)) return;

      var match = line.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (match) {
        result.push({
          menge: match[1] || "",
          einheit: match[2] || "",
          name: match[3] || line
        });
      } else {
        result.push({ menge: "", einheit: "", name: line });
      }
    });

    return result;
  }

  function parsePreparation(text) {
    return sectionBetween(text, ["zubereitung:", "anleitung:", "schritte:"], [
      "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:"
    ])
      .split(/\r?\n/)
      .map(function (line) { return line.replace(/^\d+\.\s*/, "").trim(); })
      .filter(Boolean)
      .join("\n");
  }

  function parseUtensils(text) {
    var direct = valueAfterLabel(text, ["utensilien", "besondere utensilien"]);
    if (direct) return direct;

    return sectionBetween(text, ["utensilien:"], [
      "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:"
    ])
      .split(/\r?\n|,/)
      .map(function (x) { return x.replace(/^[-*•]\s*/, "").trim(); })
      .filter(Boolean)
      .join(", ");
  }

  function loadIngredientsToForm(ingredients) {
    if (!ingredients || !ingredients.length) return;

    var container = byId("zutatenGruppen");
    if (!container) return;

    container.innerHTML = "";

    if (typeof zutatenGruppeHinzufuegen === "function") {
      try {
        zutatenGruppeHinzufuegen("Zutaten", ingredients);
        return;
      } catch (e) {
        console.warn("zutatenGruppeHinzufuegen failed, fallback used", e);
      }
    }

    var group = document.createElement("div");
    group.className = "zutatengruppe";
    group.innerHTML =
      '<div class="zutatengruppe-kopf"><input class="zutaten-gruppenname" value="Zutaten"></div>' +
      '<div class="zutaten-zeilen"></div>';
    var rows = group.querySelector(".zutaten-zeilen");

    ingredients.forEach(function (z) {
      var row = document.createElement("div");
      row.className = "zutaten-zeile";
      row.innerHTML =
        '<input class="zutat-menge" value="' + safeEsc(z.menge || "") + '">' +
        '<input class="zutat-einheit" value="' + safeEsc(z.einheit || "") + '">' +
        '<input class="zutat-name" value="' + safeEsc(z.name || "") + '">';
      rows.appendChild(row);
    });

    container.appendChild(group);
  }

  function getAssistantText() {
    var ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (var i = 0; i < ids.length; i++) {
      var el = byId(ids[i]);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    var textarea = document.querySelector("textarea");
    return textarea ? String(textarea.value || "") : "";
  }

  function updatePreview(data) {
    var preview = byId("assistentVorschau");
    if (!preview) return;

    preview.innerHTML =
      '<h3>Vorschau der übernommenen Daten</h3>' +
      '<p><strong>Name:</strong> ' + safeEsc(data.name || "nicht erkannt") + '</p>' +
      '<p><strong>Kategorie:</strong> ' + safeEsc(data.kategorie || "nicht erkannt") + '</p>' +
      '<p><strong>Portionen:</strong> ' + safeEsc(data.portionen || "nicht erkannt") + '</p>' +
      '<p><strong>Zeit:</strong> ' + safeEsc(data.zeit || "nicht erkannt") + '</p>' +
      '<p><strong>Quelle:</strong> ' + safeEsc(data.quelle || "Nicht zugeordnet") + '</p>' +
      '<p><strong>Tags:</strong> ' + safeEsc(data.tags || "keine Tags erkannt") + '</p>' +
      '<h4>Nährwerte pro 100 g</h4>' +
      '<ul>' +
      '<li><strong>Kalorien:</strong> ' + safeEsc(data.n.kalorien || "-") + ' kcal</li>' +
      '<li><strong>Eiweiß:</strong> ' + safeEsc(data.n.eiweiss || "-") + ' g</li>' +
      '<li><strong>Kohlenhydrate:</strong> ' + safeEsc(data.n.kohlenhydrate || "-") + ' g</li>' +
      '<li><strong>Fett:</strong> ' + safeEsc(data.n.fett || "-") + ' g</li>' +
      '<li><strong>Zucker:</strong> ' + safeEsc(data.n.zucker || "-") + ' g</li>' +
      '<li><strong>Ballaststoffe:</strong> ' + safeEsc(data.n.ballaststoffe || "-") + ' g</li>' +
      '<li><strong>Salz:</strong> ' + safeEsc(data.n.salz || "-") + ' g</li>' +
      '</ul>' +
      '<p><strong>Zutaten erkannt:</strong> ' + data.ingredients.length + '</p>' +
      '<p><strong>Zubereitung:</strong> ' + (data.preparation ? "erkannt" : "nicht erkannt") + '</p>';
  }

  function showForm() {
    var form = byId("formularBereich");
    if (form && form.classList) form.classList.remove("versteckt");
    var name = byId("nameInput");
    if (name && name.scrollIntoView) {
      try { name.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { name.scrollIntoView(); }
    }
  }

  window.rezeptAnalysierenDirektFinal = function () {
    try {
      var text = getAssistantText();

      if (!text.trim()) {
        setStatus("Bitte zuerst einen Rezepttext einfügen.", true);
        var p = byId("assistentVorschau");
        if (p) p.innerHTML = "<p>Bitte zuerst einen Rezepttext einfügen.</p>";
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      var data = {
        name: valueAfterLabel(text, ["name"]) || firstNonEmptyLine(text),
        kategorie: valueAfterLabel(text, ["kategorie"]),
        portionen: numberFrom(valueAfterLabel(text, ["portionen"])),
        schwierigkeit: valueAfterLabel(text, ["schwierigkeit"]),
        zeit: valueAfterLabel(text, ["zubereitungszeit", "zeit"]),
        quelle: valueAfterLabel(text, ["quelle"]) || "Nicht zugeordnet",
        tags: parseTags(text),
        n: parseNutrition(text),
        ingredients: parseIngredients(text),
        preparation: parsePreparation(text),
        utensils: parseUtensils(text)
      };

      setField("nameInput", data.name);
      setField("kategorieInput", data.kategorie);
      setField("portionenInput", data.portionen);
      setField("schwierigkeitInput", data.schwierigkeit);
      setField("zubereitungszeitInput", data.zeit);
      setField("quelleInput", data.quelle);
      setField("tagsInput", data.tags);
      setField("zubereitungInput", data.preparation);
      setField("utensilienInput", data.utensils);

      setField("kalorienInput", data.n.kalorien);
      setField("eiweissInput", data.n.eiweiss);
      setField("kohlenhydrateInput", data.n.kohlenhydrate);
      setField("fettInput", data.n.fett);
      setField("zuckerInput", data.n.zucker);
      setField("ballaststoffeInput", data.n.ballaststoffe);
      setField("salzInput", data.n.salz);

      loadIngredientsToForm(data.ingredients);
      updatePreview(data);
      showForm();

      setStatus("Rezept wurde analysiert und ins Formular übernommen.", false);
      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");
      }

      return true;
    } catch (e) {
      console.error("Rezept-Assistent finaler Fehler:", e);
      setStatus("Fehler beim Analysieren: " + (e.message || "unbekannter Fehler"), true);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rezeptAnalysierenDirekt = window.rezeptAnalysierenDirektFinal;

  function bindButton() {
    var button = byId("rezeptAnalysierenButton");
    if (button) button.onclick = window.rezeptAnalysierenDirektFinal;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindButton);
  } else {
    bindButton();
  }

  window.addEventListener("load", bindButton);
})();


// VERSION 1.36 ausprobiert-status

function rezeptAusprobiertText(wert) {
  return wert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
}

function migriereAusprobiertStatus() {
  try {
    if (!Array.isArray(rezepte)) return;

    let geaendert = false;

    rezepte.forEach(function(rezept) {
      if (typeof rezept.ausprobiert === "undefined") {
        rezept.ausprobiert = false;
        geaendert = true;
      }
    });

    if (geaendert && typeof lokaleRezepteSpeichern === "function") {
      lokaleRezepteSpeichern();
    }
  } catch(e) {
    console.error(e);
  }
}

window.addEventListener("load", function() {
  setTimeout(migriereAusprobiertStatus, 500);
});

const rezeptAusFormularLesenVor136 =
typeof rezeptAusFormularLesen === "function"
? rezeptAusFormularLesen
: null;

if (rezeptAusFormularLesenVor136) {
  rezeptAusFormularLesen = function() {
    const rezept = rezeptAusFormularLesenVor136();

    const feld = document.getElementById("ausprobiertInput");

    rezept.ausprobiert =
      feld ? feld.value === "true" : false;

    return rezept;
  };
}

const formularZuruecksetzenVor136 =
typeof formularZuruecksetzen === "function"
? formularZuruecksetzen
: null;

if (formularZuruecksetzenVor136) {
  formularZuruecksetzen = function() {
    formularZuruecksetzenVor136();

    const feld = document.getElementById("ausprobiertInput");
    if (feld) feld.value = "false";
  };
}



// =====================================================
// VERSION 1.37: Status sichtbar + Nährwert-Einteilung nur einmal
// =====================================================

function rezeptAusprobiertText(wert) {
  return wert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
}

function rezeptAusprobiertBadgeHtml(rezept) {
  const ausprobiert = !!(rezept && rezept.ausprobiert);
  return `<div class="rezept-ausprobiert ${ausprobiert ? "status-ja" : "status-nein"}">${rezeptAusprobiertText(ausprobiert)}</div>`;
}

function migriereAusprobiertStatus() {
  try {
    if (!Array.isArray(rezepte)) return;
    let geaendert = false;

    rezepte.forEach(rezept => {
      if (typeof rezept.ausprobiert === "undefined") {
        rezept.ausprobiert = false;
        geaendert = true;
      }
    });

    if (geaendert) {
      localStorage.setItem("rezepte", JSON.stringify(rezepte));
      if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle();
    }
  } catch (e) {
    console.warn("Ausprobiert-Migration fehlgeschlagen:", e);
  }
}

function ausprobiertAusFormular() {
  const feld = document.getElementById("ausprobiertInput");
  return feld ? feld.value === "true" : false;
}

function ausprobiertInsFormular(rezept) {
  const feld = document.getElementById("ausprobiertInput");
  if (feld) feld.value = rezept && rezept.ausprobiert ? "true" : "false";
}

// Speichern final ergänzen: unabhängig von alter Speicherlogik
const rezeptSpeichernDirektCloudVor137 = typeof rezeptSpeichernDirektCloud === "function" ? rezeptSpeichernDirektCloud : null;
function rezeptSpeichernDirektCloud() {
  const ergebnis = rezeptSpeichernDirektCloudVor137 ? rezeptSpeichernDirektCloudVor137() : false;

  try {
    if (ergebnis && Array.isArray(rezepte) && rezepte.length > 0) {
      // Wenn gerade ein neues Rezept gespeichert wurde, ist es normalerweise das letzte.
      // Beim Bearbeiten wird die alte Funktion bereits ersetzt; wir stellen danach sicher,
      // dass jedes Rezept ein Statusfeld besitzt.
      rezepte.forEach(rezept => {
        if (typeof rezept.ausprobiert === "undefined") rezept.ausprobiert = false;
      });

      const aktuelles = rezepte[rezepte.length - 1];
      if (aktuelles && document.getElementById("ausprobiertInput")) {
        aktuelles.ausprobiert = ausprobiertAusFormular();
      }

      localStorage.setItem("rezepte", JSON.stringify(rezepte));
      if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle();
    }
  } catch (e) {
    console.warn("Status beim Speichern konnte nicht übernommen werden:", e);
  }

  return ergebnis;
}

function rezeptSpeichern() {
  return rezeptSpeichernDirektCloud();
}

// Bearbeiten ergänzen
const rezeptBearbeitenVor137 = typeof rezeptBearbeiten === "function" ? rezeptBearbeiten : null;
function rezeptBearbeiten(index) {
  const ergebnis = rezeptBearbeitenVor137 ? rezeptBearbeitenVor137(index) : undefined;
  try {
    ausprobiertInsFormular(rezepte[index]);
  } catch (e) {
    console.warn("Status konnte nicht ins Formular geladen werden:", e);
  }
  return ergebnis;
}

// Formular leeren ergänzen
const formularLeerenVor137 = typeof formularLeeren === "function" ? formularLeeren : null;
function formularLeeren() {
  const ergebnis = formularLeerenVor137 ? formularLeerenVor137() : undefined;
  ausprobiertInsFormular({ ausprobiert: false });
  return ergebnis;
}

// Doppelte Nährwert-Einteilung vermeiden
function naehrwertTagsHtml(rezept) {
  const autoTags = typeof automatischeNaehrwertTags === "function"
    ? automatischeNaehrwertTags(rezept && rezept.naehrwerte ? rezept.naehrwerte : {})
    : [];

  if (!autoTags || autoTags.length === 0) return "";

  return `
    <div class="naehrwert-tags naehrwert-tags-einmalig">
      <strong>Nährwert-Einteilung:</strong>
      ${autoTags.map(tag => `<span class="tag-chip">${esc(tag)}</span>`).join("")}
    </div>
  `;
}

function entferneDoppelteNaehrwertTags(container) {
  if (!container || !container.querySelectorAll) return;
  const boxen = Array.from(container.querySelectorAll(".naehrwert-tags"));
  boxen.slice(1).forEach(box => box.remove());
}

// Status in vorhandene Ergebnis-Karten nachträglich einfügen
function statusBadgesNachtragen() {
  try {
    const container = document.getElementById("ergebnisse");
    if (!container || !Array.isArray(letzteSuchErgebnisse)) return;

    entferneDoppelteNaehrwertTags(container);

    const karten = Array.from(container.querySelectorAll(".rezept-karte, .karte, article, .rezept-card"));
    if (!karten.length) return;

    karten.forEach((karte, i) => {
      if (karte.querySelector(".rezept-ausprobiert")) return;
      const rezept = letzteSuchErgebnisse[i] || rezepte[i];
      if (!rezept) return;

      const badge = document.createElement("div");
      badge.className = "rezept-ausprobiert " + (rezept.ausprobiert ? "status-ja" : "status-nein");
      badge.textContent = rezeptAusprobiertText(!!rezept.ausprobiert);
      karte.appendChild(badge);
    });
  } catch (e) {
    console.warn("Status-Badges konnten nicht ergänzt werden:", e);
  }
}

// Anzeige-Funktionen wrappen
const zeigeErgebnisseVor137 = typeof zeigeErgebnisse === "function" ? zeigeErgebnisse : null;
function zeigeErgebnisse(liste) {
  const ergebnis = zeigeErgebnisseVor137 ? zeigeErgebnisseVor137(liste) : undefined;

  setTimeout(function () {
    statusBadgesNachtragen();
  }, 0);

  return ergebnis;
}

// Falls Rezeptkarten als HTML-String gebaut werden, finalen Container trotzdem ergänzen.
const filterAnwendenVor137 = typeof filterAnwenden === "function" ? filterAnwenden : null;
function filterAnwenden() {
  const ergebnis = filterAnwendenVor137 ? filterAnwendenVor137() : undefined;
  setTimeout(statusBadgesNachtragen, 0);
  return ergebnis;
}

window.addEventListener("load", function () {
  migriereAusprobiertStatus();
  ausprobiertInsFormular({ ausprobiert: false });
  setTimeout(statusBadgesNachtragen, 500);
});



// =====================================================
// VERSION 1.38: Doppelte Nährwert-Einteilung FINAL FIX
// =====================================================

function entferneAlleDoppeltenNaehrwertEinteilungen() {
  try {
    const kandidaten = Array.from(document.querySelectorAll("*"));

    kandidaten.forEach(el => {
      const text = (el.textContent || "").trim();

      if (
        text.includes("Nährwert-Einteilung:") &&
        el.children.length === 0
      ) {
        const parent = el.parentElement;
        if (!parent) return;

        const gleiche = Array.from(parent.children).filter(child =>
          (child.textContent || "").trim() === text
        );

        gleiche.slice(1).forEach(d => d.remove());
      }
    });

    // zusätzliche Container-Variante
    const container = document.querySelectorAll(".naehrwert-tags, .naehrwert-tags-einmalig");

    if (container.length > 1) {
      container.forEach((el, index) => {
        if (index > 0) el.remove();
      });
    }
  } catch (e) {
    console.warn("Doppelte Nährwert-Einteilung konnte nicht entfernt werden", e);
  }
}

// Mehrfach ausführen damit dynamisch erzeugte Karten ebenfalls bereinigt werden
window.addEventListener("load", function() {
  setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 200);
  setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 1000);
  setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 2500);
});

const zeigeErgebnisseVor138 =
typeof zeigeErgebnisse === "function"
? zeigeErgebnisse
: null;

if (zeigeErgebnisseVor138) {
  zeigeErgebnisse = function(liste) {
    const erg = zeigeErgebnisseVor138(liste);

    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 50);
    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 300);

    return erg;
  };
}

const filterAnwendenVor138 =
typeof filterAnwenden === "function"
? filterAnwenden
: null;

if (filterAnwendenVor138) {
  filterAnwenden = function() {
    const erg = filterAnwendenVor138();

    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 50);
    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 300);

    return erg;
  };
}



// =====================================================
// VERSION 1.39: Ausprobiert-Status in Rezeptansicht anzeigen
// =====================================================

function rezeptAusprobiertTextFinal(wert) {
  return wert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
}

function rezeptStatusBadgeHtmlFinal(rezept) {
  const ausprobiert = !!(rezept && rezept.ausprobiert);
  return `
    <div class="rezept-ausprobiert ${ausprobiert ? "status-ja" : "status-nein"}">
      ${rezeptAusprobiertTextFinal(ausprobiert)}
    </div>
  `;
}

function statusInRezeptAnsichtNachtragen() {
  try {
    const container = document.getElementById("ergebnisse");
    if (!container) return;

    // Falls eine Detailansicht offen ist, suchen wir die größte Rezeptkarte / Detailbox.
    const moeglicheBoxen = Array.from(container.querySelectorAll(".rezept-detail, .rezept-details, .rezept-karte, .karte, article, section, div"));

    moeglicheBoxen.forEach(box => {
      if (!box || !box.textContent) return;
      if (box.querySelector && box.querySelector(".rezept-ausprobiert")) return;

      const name = (box.querySelector("h2, h3")?.textContent || "").trim();
      if (!name) return;

      const rezept = (Array.isArray(rezepte) ? rezepte : []).find(r =>
        String(r.name || "").trim() === name
      );

      if (!rezept) return;

      box.insertAdjacentHTML("afterbegin", rezeptStatusBadgeHtmlFinal(rezept));
    });
  } catch (e) {
    console.warn("Status in Rezeptansicht konnte nicht ergänzt werden:", e);
  }
}

// Rezept-Detail-Funktionen abfangen
const rezeptAnzeigenVor139 = typeof rezeptAnzeigen === "function" ? rezeptAnzeigen : null;
if (rezeptAnzeigenVor139) {
  rezeptAnzeigen = function(index) {
    const result = rezeptAnzeigenVor139(index);
    setTimeout(statusInRezeptAnsichtNachtragen, 50);
    return result;
  };
}

const rezeptDetailsAnzeigenVor139 = typeof rezeptDetailsAnzeigen === "function" ? rezeptDetailsAnzeigen : null;
if (rezeptDetailsAnzeigenVor139) {
  rezeptDetailsAnzeigen = function(index) {
    const result = rezeptDetailsAnzeigenVor139(index);
    setTimeout(statusInRezeptAnsichtNachtragen, 50);
    return result;
  };
}

const rezeptOeffnenVor139 = typeof rezeptOeffnen === "function" ? rezeptOeffnen : null;
if (rezeptOeffnenVor139) {
  rezeptOeffnen = function(index) {
    const result = rezeptOeffnenVor139(index);
    setTimeout(statusInRezeptAnsichtNachtragen, 50);
    return result;
  };
}

// Auch nach jeder Ergebnisanzeige versuchen
const zeigeErgebnisseStatusVor139 = typeof zeigeErgebnisse === "function" ? zeigeErgebnisse : null;
if (zeigeErgebnisseStatusVor139) {
  zeigeErgebnisse = function(liste) {
    const result = zeigeErgebnisseStatusVor139(liste);
    setTimeout(statusInRezeptAnsichtNachtragen, 100);
    return result;
  };
}

window.addEventListener("load", function() {
  setTimeout(statusInRezeptAnsichtNachtragen, 700);
});



// =====================================================
// VERSION 1.40: Suche nach ausprobiert / nicht ausprobiert
// =====================================================

function suchAusprobiertWert() {
  const feld = document.getElementById("suchAusprobiertInput");
  return feld ? feld.value : "";
}

function filterAusprobiertAnwenden(liste) {
  const wert = suchAusprobiertWert();

  if (wert === "") return liste;

  const gesucht = wert === "true";

  return (liste || []).filter(rezept => {
    return !!rezept.ausprobiert === gesucht;
  });
}

// Rezeptsuche erweitern
const rezeptSucheAusfuehrenVor140 =
  typeof rezeptSucheAusfuehren === "function"
    ? rezeptSucheAusfuehren
    : null;

if (rezeptSucheAusfuehrenVor140) {
  rezeptSucheAusfuehren = function() {
    const ergebnis = rezeptSucheAusfuehrenVor140();

    try {
      const wert = suchAusprobiertWert();

      if (wert !== "" && Array.isArray(letzteSuchErgebnisse)) {
        letzteSuchErgebnisse = filterAusprobiertAnwenden(letzteSuchErgebnisse);

        if (typeof zeigeErgebnisse === "function") {
          zeigeErgebnisse(letzteSuchErgebnisse);
        }

        const treffer = document.getElementById("suchTrefferAnzeige");
        if (treffer) {
          treffer.textContent = `${letzteSuchErgebnisse.length} Treffer`;
        }
      }
    } catch(e) {
      console.warn("Status-Suchfilter fehlgeschlagen:", e);
    }

    return ergebnis;
  };
}

// Alle-Rezepte-Anzeige / Filter ebenfalls erweitern
const filterAnwendenVor140 =
  typeof filterAnwenden === "function"
    ? filterAnwenden
    : null;

if (filterAnwendenVor140) {
  filterAnwenden = function() {
    const ergebnis = filterAnwendenVor140();

    try {
      const wert = suchAusprobiertWert();

      if (wert !== "" && Array.isArray(letzteSuchErgebnisse)) {
        letzteSuchErgebnisse = filterAusprobiertAnwenden(letzteSuchErgebnisse);

        if (typeof zeigeErgebnisse === "function") {
          zeigeErgebnisse(letzteSuchErgebnisse);
        }
      }
    } catch(e) {
      console.warn("Status-Filter fehlgeschlagen:", e);
    }

    return ergebnis;
  };
}

// Suche zurücksetzen erweitert
const rezeptSucheZuruecksetzenVor140 =
  typeof rezeptSucheZuruecksetzen === "function"
    ? rezeptSucheZuruecksetzen
    : null;

if (rezeptSucheZuruecksetzenVor140) {
  rezeptSucheZuruecksetzen = function() {
    const ergebnis = rezeptSucheZuruecksetzenVor140();

    const feld = document.getElementById("suchAusprobiertInput");
    if (feld) feld.value = "";

    return ergebnis;
  };
}



// =====================================================
// VERSION 1.41: Suche/Alle-Rezepte Statusfilter stabil repariert
// =====================================================

function statusFilterWert141() {
  const feld = document.getElementById("suchAusprobiertInput");
  return feld ? feld.value : "";
}

function rezeptStatusPasst141(rezept) {
  const wert = statusFilterWert141();
  if (wert === "") return true;

  const ausprobiert = !!(rezept && rezept.ausprobiert);
  return wert === "true" ? ausprobiert : !ausprobiert;
}

function rezeptNamePasst141(rezept) {
  const feld = document.getElementById("suchNameInput");
  const suchtext = feld ? feld.value.trim().toLowerCase() : "";
  if (!suchtext) return true;
  return String(rezept.name || "").toLowerCase().includes(suchtext);
}

function rezeptZutatenPassen141(rezept) {
  const feld = document.getElementById("suchZutatenInput");
  const suchtext = feld ? feld.value.trim().toLowerCase() : "";
  if (!suchtext) return true;

  const suchteile = suchtext.split(",").map(x => x.trim()).filter(Boolean);
  const zutatenText = [
    ...(rezept.zutaten || []).map(z => z.name || ""),
    ...((rezept.zutatenGruppen || []).flatMap(g => (g.zutaten || []).map(z => z.name || "")))
  ].join(" ").toLowerCase();

  return suchteile.every(teil => zutatenText.includes(teil));
}

function rezeptQuellePasst141(rezept) {
  const feld = document.getElementById("suchQuelleInput");
  const wert = feld ? feld.value.trim() : "";
  if (!wert) return true;
  return String(rezept.quelle || "Nicht zugeordnet") === wert;
}

function rezeptTagsPassen141(rezept) {
  const feld = document.getElementById("suchTagInput");
  if (!feld) return true;

  const ausgewaehlt = Array.from(feld.selectedOptions || [])
    .map(o => o.value)
    .filter(Boolean);

  if (!ausgewaehlt.length) return true;

  const rezeptTags = (rezept.tags || []).map(t => String(t).toLowerCase());
  return ausgewaehlt.every(tag => rezeptTags.includes(String(tag).toLowerCase()));
}

function rezeptKategorienPassen141(rezept) {
  const aktive = Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv"))
    .map(x => x.dataset ? x.dataset.kategorie : "")
    .filter(Boolean);

  if (!aktive.length) return true;
  return aktive.includes(rezept.kategorie || "Nicht zugeordnet");
}

function sortiereRezepte141(liste) {
  const feld = document.getElementById("suchSortierungInput");
  const sortierung = feld ? feld.value : "name";

  const kopie = [...liste];

  if (sortierung === "bewertung") {
    kopie.sort((a, b) => Number(b.bewertung || 0) - Number(a.bewertung || 0));
  } else if (sortierung === "kategorie") {
    kopie.sort((a, b) => String(a.kategorie || "").localeCompare(String(b.kategorie || "")));
  } else {
    kopie.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  return kopie;
}

function berechneSuchErgebnisse141() {
  let ergebnisse = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => ({
    ...rezept,
    index,
    vorhandene: [],
    fehlende: []
  }));

  ergebnisse = ergebnisse.filter(rezept =>
    rezeptNamePasst141(rezept) &&
    rezeptZutatenPassen141(rezept) &&
    rezeptQuellePasst141(rezept) &&
    rezeptTagsPassen141(rezept) &&
    rezeptKategorienPassen141(rezept) &&
    rezeptStatusPasst141(rezept)
  );

  return sortiereRezepte141(ergebnisse);
}

function zeigeSuchErgebnisse141(ergebnisse) {
  letzteSuchErgebnisse = ergebnisse;

  if (typeof zeigeErgebnisse === "function") {
    zeigeErgebnisse(ergebnisse);
  }

  const treffer = document.getElementById("suchTrefferAnzeige");
  if (treffer) {
    treffer.textContent = `${ergebnisse.length} Treffer`;
  }

  if (typeof statusBadgesNachtragen === "function") {
    setTimeout(statusBadgesNachtragen, 50);
  }

  if (typeof entferneAlleDoppeltenNaehrwertEinteilungen === "function") {
    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 50);
  }
}

// Diese Funktionen ersetzen die kaputten Wrapper aus v1.40 vollständig.
function rezeptSucheAusfuehren() {
  const ergebnisse = berechneSuchErgebnisse141();
  zeigeSuchErgebnisse141(ergebnisse);
}

function filterAnwenden() {
  const ergebnisse = berechneSuchErgebnisse141();
  zeigeSuchErgebnisse141(ergebnisse);
}

function alleRezepteToggle() {
  if (typeof hauptbereichToggle === "function") {
    hauptbereichToggle("NICHT_VORHANDENER_BEREICH_ALT");
  }

  // Bei "Alle Rezepte anzeigen" sollen alle Rezepte erscheinen,
  // aber der Statusfilter darf wirken, falls ausgewählt.
  const name = document.getElementById("suchNameInput");
  const zutaten = document.getElementById("suchZutatenInput");
  const quelle = document.getElementById("suchQuelleInput");
  const tags = document.getElementById("suchTagInput");

  if (name) name.value = "";
  if (zutaten) zutaten.value = "";
  if (quelle) quelle.value = "";
  if (tags) Array.from(tags.options || []).forEach(o => o.selected = false);

  const ergebnisse = berechneSuchErgebnisse141();
  zeigeSuchErgebnisse141(ergebnisse);
}

function rezeptSucheZuruecksetzen() {
  ["suchNameInput", "suchZutatenInput"].forEach(id => {
    const feld = document.getElementById(id);
    if (feld) feld.value = "";
  });

  const quelle = document.getElementById("suchQuelleInput");
  if (quelle) quelle.value = "";

  const status = document.getElementById("suchAusprobiertInput");
  if (status) status.value = "";

  const tags = document.getElementById("suchTagInput");
  if (tags) Array.from(tags.options || []).forEach(o => o.selected = false);

  const treffer = document.getElementById("suchTrefferAnzeige");
  if (treffer) treffer.textContent = "";

  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";

  letzteSuchErgebnisse = [];
}

// Filter bei Änderung sofort neu anwenden, aber nur wenn Ergebnisse sichtbar sind.
window.addEventListener("load", function() {
  const status = document.getElementById("suchAusprobiertInput");
  if (status) {
    status.addEventListener("change", function() {
      const ergebnisse = document.getElementById("ergebnisse");
      if (ergebnisse && ergebnisse.innerHTML.trim()) {
        rezeptSucheAusfuehren();
      }
    });
  }
});



// =====================================================
// VERSION 1.42: Button-Fix für "Alle Rezepte" und "Rezept hinzufügen"
// =====================================================

function alleAppBereiche142() {
  return [
    "sucheBereich",
    "rezeptSucheBereich",
    "formularBereich",
    "einkaufBereich",
    "textImportBereich",
    "datenpruefungBereich"
  ];
}

function bereicheVerstecken142() {
  alleAppBereiche142().forEach(function(id) {
    const element = document.getElementById(id);
    if (element && element.classList) {
      element.classList.add("versteckt");
    }
  });
}

function bereichZeigen142(id) {
  const element = document.getElementById(id);
  if (element && element.classList) {
    element.classList.remove("versteckt");
  }
  return element;
}

function ergebnisseLeeren142() {
  const ergebnisse = document.getElementById("ergebnisse");
  if (ergebnisse) ergebnisse.innerHTML = "";
}

function rezeptKarteHtml142(rezept, index) {
  const name = esc(rezept.name || "Unbenanntes Rezept");
  const kategorie = esc(rezept.kategorie || "Nicht zugeordnet");
  const quelle = esc(rezept.quelle || "Nicht zugeordnet");
  const status = rezept.ausprobiert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
  const statusClass = rezept.ausprobiert ? "status-ja" : "status-nein";
  const tags = (rezept.tags || []).map(tag => `<span class="tag-chip">${esc(tag)}</span>`).join(" ");

  return `
    <article class="rezept-karte">
      <h3>${name}</h3>
      <p><strong>Kategorie:</strong> ${kategorie}</p>
      <p><strong>Quelle:</strong> ${quelle}</p>
      <div class="rezept-ausprobiert ${statusClass}">${status}</div>
      <div class="tags">${tags}</div>
      <div class="button-gruppe">
        <button type="button" onclick="rezeptAnzeigenDirekt142(${index})">Rezept anzeigen</button>
        <button type="button" onclick="rezeptBearbeiten(${index})">Bearbeiten</button>
        <button type="button" onclick="rezeptLoeschen(${index})">Löschen</button>
      </div>
    </article>
  `;
}

function zeigeErgebnisseDirekt142(liste) {
  const ergebnisse = document.getElementById("ergebnisse");
  if (!ergebnisse) return;

  const daten = Array.isArray(liste) ? liste : [];

  if (daten.length === 0) {
    ergebnisse.innerHTML = `<div class="box"><p>Keine Rezepte gefunden.</p></div>`;
    return;
  }

  ergebnisse.innerHTML = daten.map((rezept, pos) => {
    const echterIndex = typeof rezept.index === "number"
      ? rezept.index
      : (Array.isArray(rezepte) ? rezepte.indexOf(rezept) : pos);

    return rezeptKarteHtml142(rezept, echterIndex >= 0 ? echterIndex : pos);
  }).join("");

  if (typeof entferneAlleDoppeltenNaehrwertEinteilungen === "function") {
    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 50);
  }
}

function rezeptAnzeigenDirekt142(index) {
  const rezept = rezepte[index];
  const ergebnisse = document.getElementById("ergebnisse");
  if (!rezept || !ergebnisse) return;

  const zutatenGruppen = rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }];

  ergebnisse.innerHTML = `
    <article class="rezept-detail box">
      <button type="button" onclick="alleRezepteToggle()">Zurück zur Übersicht</button>
      <h2>${esc(rezept.name || "Unbenanntes Rezept")}</h2>
      <div class="rezept-ausprobiert ${rezept.ausprobiert ? "status-ja" : "status-nein"}">
        ${rezept.ausprobiert ? "Schon ausprobiert" : "Noch nicht ausprobiert"}
      </div>
      <p><strong>Kategorie:</strong> ${esc(rezept.kategorie || "Nicht zugeordnet")}</p>
      <p><strong>Portionen:</strong> ${esc(rezept.portionen || "")}</p>
      <p><strong>Zeit:</strong> ${esc(rezept.zubereitungszeit || "")}</p>
      <p><strong>Quelle:</strong> ${esc(rezept.quelle || "Nicht zugeordnet")}</p>

      <h3>Zutaten</h3>
      ${zutatenGruppen.map(gruppe => `
        <h4>${esc(gruppe.name || "Zutaten")}</h4>
        <ul>
          ${(gruppe.zutaten || []).map(z => `<li>${esc([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}
        </ul>
      `).join("")}

      <h3>Zubereitung</h3>
      <p>${esc(rezept.zubereitung || "").replace(/\n/g, "<br>")}</p>

      ${typeof naehrwerteKurzHtml === "function" ? naehrwerteKurzHtml(rezept) : ""}
    </article>
  `;

  if (typeof entferneAlleDoppeltenNaehrwertEinteilungen === "function") {
    setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 50);
  }
}

function statusFilterWert142() {
  const feld = document.getElementById("suchAusprobiertInput");
  return feld ? feld.value : "";
}

function statusPasst142(rezept) {
  const wert = statusFilterWert142();
  if (wert === "") return true;
  return wert === "true" ? !!rezept.ausprobiert : !rezept.ausprobiert;
}

function alleRezepteDaten142() {
  return (Array.isArray(rezepte) ? rezepte : [])
    .map((rezept, index) => {
      if (typeof rezept.ausprobiert === "undefined") rezept.ausprobiert = false;
      return { ...rezept, index };
    })
    .filter(statusPasst142)
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

function alleRezepteToggle() {
  bereicheVerstecken142();

    const suchBereich = document.getElementById("sucheBereich");
  if (suchBereich && suchBereich.classList) {
    suchBereich.classList.remove("versteckt");
  }

  // Suchfelder leeren, Statusfilter aber bewusst behalten.
  const name = document.getElementById("suchNameInput");
  const zutaten = document.getElementById("suchZutatenInput");
  const quelle = document.getElementById("suchQuelleInput");
  const tags = document.getElementById("suchTagInput");

  if (name) name.value = "";
  if (zutaten) zutaten.value = "";
  if (quelle) quelle.value = "";
  if (tags) Array.from(tags.options || []).forEach(o => o.selected = false);

  const daten = alleRezepteDaten142();
  letzteSuchErgebnisse = daten;
  zeigeErgebnisseDirekt142(daten);

  const treffer = document.getElementById("suchTrefferAnzeige");
  if (treffer) treffer.textContent = `${daten.length} Treffer`;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function rezeptHinzufuegenToggle() {
  const formular = document.getElementById("formularBereich");
  if (!formular) {
    alert("Formularbereich wurde nicht gefunden.");
    return;
  }

  const warOffen = !formular.classList.contains("versteckt");

  bereicheVerstecken142();
  ergebnisseLeeren142();

  if (warOffen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Vorsichtig leeren, aber nie verhindern, dass das Formular angezeigt wird.
  try {
    if (typeof formularLeeren === "function") formularLeeren();
  } catch (e) {
    console.warn("Formular leeren übersprungen:", e);
  }

  formular.classList.remove("versteckt");

  const status = document.getElementById("ausprobiertInput");
  if (status) status.value = "false";

  window.scrollTo({ top: Math.max(0, formular.offsetTop - 20), behavior: "smooth" });
}

// Suche ebenfalls über die direkte Anzeige ausgeben
function rezeptSucheAusfuehren() {
  let daten = (Array.isArray(rezepte) ? rezepte : []).map((rezept, index) => ({ ...rezept, index }));

  const name = (document.getElementById("suchNameInput")?.value || "").trim().toLowerCase();
  const zutaten = (document.getElementById("suchZutatenInput")?.value || "").trim().toLowerCase();
  const quelle = (document.getElementById("suchQuelleInput")?.value || "").trim();
  const tagSelect = document.getElementById("suchTagInput");
  const tags = tagSelect ? Array.from(tagSelect.selectedOptions || []).map(o => o.value).filter(Boolean) : [];

  daten = daten.filter(rezept => {
    if (typeof rezept.ausprobiert === "undefined") rezept.ausprobiert = false;

    if (!statusPasst142(rezept)) return false;
    if (name && !String(rezept.name || "").toLowerCase().includes(name)) return false;
    if (quelle && String(rezept.quelle || "Nicht zugeordnet") !== quelle) return false;

    if (zutaten) {
      const zutatenText = [
        ...(rezept.zutaten || []).map(z => z.name || ""),
        ...((rezept.zutatenGruppen || []).flatMap(g => (g.zutaten || []).map(z => z.name || "")))
      ].join(" ").toLowerCase();

      const teile = zutaten.split(",").map(x => x.trim()).filter(Boolean);
      if (!teile.every(t => zutatenText.includes(t))) return false;
    }

    if (tags.length) {
      const rezeptTags = (rezept.tags || []).map(t => String(t).toLowerCase());
      if (!tags.every(t => rezeptTags.includes(String(t).toLowerCase()))) return false;
    }

    return true;
  });

  daten.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

  letzteSuchErgebnisse = daten;
  zeigeErgebnisseDirekt142(daten);

  const treffer = document.getElementById("suchTrefferAnzeige");
  if (treffer) treffer.textContent = `${daten.length} Treffer`;
}

function filterAnwenden() {
  alleRezepteToggle();
}



// =====================================================
// VERSION 1.43: Assistent Zutaten/Zubereitung + Rezeptprüfung Bearbeiten Fix
// =====================================================

// Robuster Parser: akzeptiert sowohl "Name:" Format als auch klassische Rezepttexte.
function rf143TextImport() {
  const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && String(el.value || "").trim()) return String(el.value || "");
  }
  const textarea = document.querySelector("textarea");
  return textarea ? String(textarea.value || "") : "";
}

function rf143Esc(value) {
  if (typeof esc === "function") return esc(value);
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rf143Set(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (value === undefined || value === null || value === "") return;
  el.value = value;
}

function rf143Zahl(value) {
  const m = String(value ?? "").replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!m) return "";
  const n = Number(m[0]);
  return isFinite(n) ? String(n).replace(".", ",") : "";
}

function rf143Zeilen(text) {
  return String(text || "").split(/\r?\n/);
}

function rf143Label(text, labels) {
  const lines = rf143Zeilen(text).map(z => z.trim());
  const labelListe = labels.map(l => l.toLowerCase());

  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const label of labelListe) {
      if (lower.startsWith(label + ":")) {
        return line.split(":").slice(1).join(":").trim();
      }
    }
  }
  return "";
}

function rf143Abschnitt(text, startLabels, stopLabels) {
  const lines = rf143Zeilen(text);
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].trim().toLowerCase();
    if (startLabels.some(s => lower.startsWith(s.toLowerCase()))) {
      start = i;
      break;
    }
  }

  if (start < 0) return "";

  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    const raw = lines[i];
    const lower = raw.trim().toLowerCase();

    if (stopLabels.some(s => lower.startsWith(s.toLowerCase()))) break;
    out.push(raw);
  }

  return out.join("\n").trim();
}

function rf143Tags(text) {
  const raw = rf143Label(text, ["tags", "tag", "schlagworte"]);
  const tags = [];

  if (raw) {
    raw.split(/[,;#]/).map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => tags.push(t));
  }

  String(text || "").split(/\s+/).forEach(part => {
    if (part.startsWith("#")) {
      const tag = part.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
      if (tag) tags.push(tag);
    }
  });

  return [...new Set(tags)].join(", ");
}

function rf143Naehrwerte(text) {
  function v(labels) {
    for (const label of labels) {
      const wert = rf143Label(text, [label]);
      if (wert) return rf143Zahl(wert);
    }
    return "";
  }

  return {
    kalorien: v(["kalorien", "kcal", "energie"]),
    eiweiss: v(["eiweiß", "eiweiss", "protein"]),
    kohlenhydrate: v(["kohlenhydrate", "kh"]),
    fett: v(["fett"]),
    zucker: v(["zucker"]),
    ballaststoffe: v(["ballaststoffe"]),
    salz: v(["salz"])
  };
}

function rf143Zutaten(text) {
  const block = rf143Abschnitt(text, ["zutaten:"], [
    "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
  ]);

  if (!block) return [];

  const zutaten = [];
  let aktuelleGruppe = "Zutaten";

  block.split(/\r?\n/).forEach(line => {
    let z = line.replace(/^[-*•]\s*/, "").trim();
    if (!z) return;

    // Gruppentitel wie "Teig:" behalten wir als Gruppe, nicht als Zutat.
    if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(z)) {
      aktuelleGruppe = z.replace(":", "").trim() || "Zutaten";
      return;
    }

    const m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
    if (m) {
      zutaten.push({
        gruppe: aktuelleGruppe,
        menge: m[1] || "",
        einheit: m[2] || "",
        name: m[3] || z
      });
    } else {
      zutaten.push({ gruppe: aktuelleGruppe, menge: "", einheit: "", name: z });
    }
  });

  return zutaten;
}

function rf143Zubereitung(text) {
  const block = rf143Abschnitt(text, ["zubereitung:", "anleitung:", "schritte:"], [
    "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
  ]);

  return block
    .split(/\r?\n/)
    .map(z => z.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function rf143Utensilien(text) {
  const direkt = rf143Label(text, ["utensilien", "besondere utensilien"]);
  if (direkt) return direkt;

  return rf143Abschnitt(text, ["utensilien:"], [
    "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:", "quelle:"
  ])
    .split(/\r?\n|,/)
    .map(x => x.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function rf143ZutatenInsFormular(zutaten) {
  if (!Array.isArray(zutaten) || !zutaten.length) return;

  const container = document.getElementById("zutatenGruppen");
  if (!container) return;

  container.innerHTML = "";

  const gruppen = {};
  zutaten.forEach(z => {
    const gruppe = z.gruppe || "Zutaten";
    if (!gruppen[gruppe]) gruppen[gruppe] = [];
    gruppen[gruppe].push({ menge: z.menge || "", einheit: z.einheit || "", name: z.name || "" });
  });

  Object.entries(gruppen).forEach(([gruppenName, zutatenListe]) => {
    if (typeof zutatenGruppeHinzufuegen === "function") {
      try {
        zutatenGruppeHinzufuegen(gruppenName, zutatenListe);
        return;
      } catch (e) {
        console.warn("zutatenGruppeHinzufuegen fehlgeschlagen, Fallback:", e);
      }
    }

    const gruppe = document.createElement("div");
    gruppe.className = "zutatengruppe";
    gruppe.innerHTML = `
      <div class="zutatengruppe-kopf">
        <input class="zutaten-gruppenname" value="${rf143Esc(gruppenName)}">
      </div>
      <div class="zutaten-zeilen"></div>
    `;

    const rows = gruppe.querySelector(".zutaten-zeilen");
    zutatenListe.forEach(z => {
      const row = document.createElement("div");
      row.className = "zutaten-zeile";
      row.innerHTML = `
        <input class="zutat-menge" value="${rf143Esc(z.menge)}">
        <input class="zutat-einheit" value="${rf143Esc(z.einheit)}">
        <input class="zutat-name" value="${rf143Esc(z.name)}">
      `;
      rows.appendChild(row);
    });

    container.appendChild(gruppe);
  });
}

function rf143Vorschau(daten) {
  const preview = document.getElementById("assistentVorschau");
  if (!preview) return;

  preview.innerHTML = `
    <h3>Vorschau der übernommenen Daten</h3>
    <p><strong>Name:</strong> ${rf143Esc(daten.name || "nicht erkannt")}</p>
    <p><strong>Kategorie:</strong> ${rf143Esc(daten.kategorie || "nicht erkannt")}</p>
    <p><strong>Portionen:</strong> ${rf143Esc(daten.portionen || "nicht erkannt")}</p>
    <p><strong>Quelle:</strong> ${rf143Esc(daten.quelle || "Nicht zugeordnet")}</p>
    <p><strong>Tags:</strong> ${rf143Esc(daten.tags || "keine Tags erkannt")}</p>
    <p><strong>Zutaten erkannt:</strong> ${daten.zutaten.length}</p>
    <p><strong>Zubereitung:</strong> ${daten.zubereitung ? "erkannt" : "nicht erkannt"}</p>
  `;
}

function rezeptAnalysierenDirektFinal() {
  try {
    const text = rf143TextImport();

    if (!text.trim()) {
      alert("Bitte zuerst einen Rezepttext einfügen.");
      return false;
    }

    const ersteZeile = rf143Zeilen(text).map(z => z.trim()).filter(Boolean)[0] || "";
    const n = rf143Naehrwerte(text);
    const zutaten = rf143Zutaten(text);
    const zubereitung = rf143Zubereitung(text);

    const daten = {
      name: rf143Label(text, ["name"]) || ersteZeile,
      kategorie: rf143Label(text, ["kategorie"]),
      portionen: rf143Zahl(rf143Label(text, ["portionen"])),
      schwierigkeit: rf143Label(text, ["schwierigkeit"]),
      zeit: rf143Label(text, ["zubereitungszeit", "zeit"]),
      quelle: rf143Label(text, ["quelle"]) || "Nicht zugeordnet",
      tags: rf143Tags(text),
      naehrwerte: n,
      zutaten,
      zubereitung,
      utensilien: rf143Utensilien(text)
    };

    rf143Set("nameInput", daten.name);
    rf143Set("kategorieInput", daten.kategorie);
    rf143Set("portionenInput", daten.portionen);
    rf143Set("schwierigkeitInput", daten.schwierigkeit);
    rf143Set("zubereitungszeitInput", daten.zeit);
    rf143Set("quelleInput", daten.quelle);
    rf143Set("tagsInput", daten.tags);
    rf143Set("zubereitungInput", daten.zubereitung);
    rf143Set("utensilienInput", daten.utensilien);

    rf143Set("kalorienInput", n.kalorien);
    rf143Set("eiweissInput", n.eiweiss);
    rf143Set("kohlenhydrateInput", n.kohlenhydrate);
    rf143Set("fettInput", n.fett);
    rf143Set("zuckerInput", n.zucker);
    rf143Set("ballaststoffeInput", n.ballaststoffe);
    rf143Set("salzInput", n.salz);

    rf143ZutatenInsFormular(zutaten);
    rf143Vorschau(daten);

    const formular = document.getElementById("formularBereich");
    if (formular) formular.classList.remove("versteckt");

    if (typeof meldungAnzeigen === "function") {
      meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");
    }

    return true;
  } catch (e) {
    console.error("Assistent 1.43 Fehler:", e);
    alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
    return false;
  }
}

window.rezeptAnalysierenDirektFinal = rezeptAnalysierenDirektFinal;
window.rezeptAnalysierenDirekt = rezeptAnalysierenDirektFinal;
function rezeptAnalysierenDirekt() {
  return rezeptAnalysierenDirektFinal();
}

window.addEventListener("load", function () {
  const button = document.getElementById("rezeptAnalysierenButton");
  if (button) button.onclick = rezeptAnalysierenDirektFinal;
});

// Rezeptprüfung: Bearbeiten-Button zuverlässig machen
function rezeptPruefungBearbeiten143(index) {
  try {
    const i = Number(index);
    if (!Array.isArray(rezepte) || !rezepte[i]) {
      alert("Rezept konnte nicht gefunden werden.");
      return;
    }

    if (typeof rezeptBearbeiten === "function") {
      rezeptBearbeiten(i);
    } else {
      alert("Bearbeiten-Funktion wurde nicht gefunden.");
      return;
    }

    const formular = document.getElementById("formularBereich");
    if (formular) formular.classList.remove("versteckt");

    const pruefung = document.getElementById("datenpruefungBereich");
    if (pruefung) pruefung.classList.add("versteckt");

    const ergebnisse = document.getElementById("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";

    if (formular && formular.scrollIntoView) {
      formular.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (e) {
    console.error("Rezeptprüfung bearbeiten Fehler:", e);
    alert("Rezept konnte nicht zum Bearbeiten geöffnet werden.");
  }
}

window.rezeptPruefungBearbeiten143 = rezeptPruefungBearbeiten143;

// Nachträglich vorhandene Rezeptprüfungs-Buttons reparieren
function rezeptPruefungsButtonsReparieren143() {
  try {
    const bereich = document.getElementById("datenpruefungBereich");
    if (!bereich) return;

    const buttons = Array.from(bereich.querySelectorAll("button"));
    buttons.forEach(button => {
      const text = (button.textContent || "").trim().toLowerCase();
      if (!text.includes("bearbeiten")) return;

      const onclick = button.getAttribute("onclick") || "";
      const match = onclick.match(/\((\d+)\)/);
      if (!match) return;

      const index = Number(match[1]);
      button.onclick = function () {
        rezeptPruefungBearbeiten143(index);
      };
    });
  } catch (e) {
    console.warn("Prüfungsbuttons konnten nicht repariert werden:", e);
  }
}

const datenqualitaetPruefenVor143 = typeof datenqualitaetPruefen === "function" ? datenqualitaetPruefen : null;
if (datenqualitaetPruefenVor143) {
  datenqualitaetPruefen = function () {
    const result = datenqualitaetPruefenVor143();
    setTimeout(rezeptPruefungsButtonsReparieren143, 50);
    return result;
  };
}

window.addEventListener("load", function () {
  setTimeout(rezeptPruefungsButtonsReparieren143, 500);
});



// =====================================================
// VERSION 1.44: FINAL getesteter Fix
// - Rezept-Assistent schreibt Zutaten und Zubereitung sicher ins Formular
// - Rezeptprüfung/Bearbeiten öffnet und befüllt das Formular sicher
// =====================================================

(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function esc144(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setValue(id, value) {
    var el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function numberText(value) {
    var m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    var n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function lines(text) {
    return String(text || "").split(/\r?\n/);
  }

  function cleanLines(text) {
    return lines(text).map(function (x) { return x.trim(); });
  }

  function firstLine(text) {
    var l = cleanLines(text).filter(Boolean);
    return l.length ? l[0] : "";
  }

  function labelValue(text, labels) {
    var l = cleanLines(text);
    var wanted = labels.map(function (x) { return x.toLowerCase(); });

    for (var i = 0; i < l.length; i++) {
      var lower = l[i].toLowerCase();
      for (var j = 0; j < wanted.length; j++) {
        if (lower.indexOf(wanted[j] + ":") === 0) {
          return l[i].split(":").slice(1).join(":").trim();
        }
      }
    }
    return "";
  }

  function section(text, starts, stops) {
    var l = lines(text);
    var start = -1;

    for (var i = 0; i < l.length; i++) {
      var low = l[i].trim().toLowerCase();
      if (starts.some(function (s) { return low.indexOf(s.toLowerCase()) === 0; })) {
        start = i;
        break;
      }
    }

    if (start < 0) return "";

    var out = [];
    for (var j = start + 1; j < l.length; j++) {
      var low2 = l[j].trim().toLowerCase();
      if (stops.some(function (s) { return low2.indexOf(s.toLowerCase()) === 0; })) break;
      out.push(l[j]);
    }
    return out.join("\n").trim();
  }

  function parseTags(text) {
    var raw = labelValue(text, ["tags", "tag", "schlagworte"]);
    var tags = [];

    if (raw) {
      raw.split(/[,;#]/).forEach(function (t) {
        t = t.trim().toLowerCase();
        if (t) tags.push(t);
      });
    }

    String(text || "").split(/\s+/).forEach(function (part) {
      if (part.charAt(0) === "#") {
        var t = part.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (t) tags.push(t);
      }
    });

    var unique = [];
    tags.forEach(function (t) {
      if (unique.indexOf(t) === -1) unique.push(t);
    });
    return unique.join(", ");
  }

  function parseNutrition(text) {
    function v(labels) {
      for (var i = 0; i < labels.length; i++) {
        var value = labelValue(text, [labels[i]]);
        if (value) return numberText(value);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function parseIngredientsGrouped(text) {
    var block = section(text, ["zutaten:"], [
      "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    if (!block) return [{ name: "Zutaten", zutaten: [] }];

    var groups = [];
    var current = { name: "Zutaten", zutaten: [] };

    function pushCurrent() {
      if (current.zutaten.length) groups.push(current);
    }

    block.split(/\r?\n/).forEach(function (line) {
      var z = line.replace(/^[-*•]\s*/, "").trim();
      if (!z) return;

      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(z)) {
        pushCurrent();
        current = { name: z.replace(":", "").trim() || "Zutaten", zutaten: [] };
        return;
      }

      var m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (m) {
        current.zutaten.push({
          menge: m[1] || "",
          einheit: m[2] || "",
          name: m[3] || z
        });
      } else {
        current.zutaten.push({ menge: "", einheit: "", name: z });
      }
    });

    pushCurrent();

    if (!groups.length) groups.push({ name: "Zutaten", zutaten: [] });
    return groups;
  }

  function parsePreparation(text) {
    return section(text, ["zubereitung:", "anleitung:", "schritte:"], [
      "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ])
      .split(/\r?\n/)
      .map(function (x) { return x.replace(/^\d+\.\s*/, "").trim(); })
      .filter(Boolean)
      .join("\n");
  }

  function parseUtensils(text) {
    var direct = labelValue(text, ["utensilien", "besondere utensilien"]);
    if (direct) return direct;
    return section(text, ["utensilien:"], [
      "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:", "quelle:"
    ])
      .split(/\r?\n|,/)
      .map(function (x) { return x.replace(/^[-*•]\s*/, "").trim(); })
      .filter(Boolean)
      .join(", ");
  }

  function fillIngredientGroups(groups) {
    var container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    groups.forEach(function (group) {
      if (typeof zutatenGruppeHinzufuegen === "function") {
        try {
          zutatenGruppeHinzufuegen(group.name || "Zutaten", group.zutaten || []);
          return;
        } catch (e) {
          console.warn("zutatenGruppeHinzufuegen fehlgeschlagen, nutze Fallback", e);
        }
      }

      var box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML =
        '<div class="zutatengruppe-kopf">' +
        '<input class="zutaten-gruppenname" value="' + esc144(group.name || "Zutaten") + '">' +
        '</div><div class="zutaten-zeilen"></div>';
      var rows = box.querySelector(".zutaten-zeilen");

      (group.zutaten || []).forEach(function (z) {
        var row = document.createElement("div");
        row.className = "zutaten-zeile";
        row.innerHTML =
          '<input class="zutat-menge" value="' + esc144(z.menge || "") + '">' +
          '<input class="zutat-einheit" value="' + esc144(z.einheit || "") + '">' +
          '<input class="zutat-name" value="' + esc144(z.name || "") + '">';
        rows.appendChild(row);
      });

      container.appendChild(box);
    });

    return true;
  }

  function getAssistantText() {
    var ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    var textarea = document.querySelector("textarea");
    return textarea ? String(textarea.value || "") : "";
  }

  function previewAssistant(data) {
    var preview = $("assistentVorschau");
    if (!preview) return;

    var anzahlZutaten = data.zutatenGruppen.reduce(function (sum, g) {
      return sum + (g.zutaten || []).length;
    }, 0);

    preview.innerHTML =
      '<h3>Vorschau der übernommenen Daten</h3>' +
      '<p><strong>Name:</strong> ' + esc144(data.name || "nicht erkannt") + '</p>' +
      '<p><strong>Kategorie:</strong> ' + esc144(data.kategorie || "nicht erkannt") + '</p>' +
      '<p><strong>Portionen:</strong> ' + esc144(data.portionen || "nicht erkannt") + '</p>' +
      '<p><strong>Quelle:</strong> ' + esc144(data.quelle || "Nicht zugeordnet") + '</p>' +
      '<p><strong>Tags:</strong> ' + esc144(data.tags || "keine Tags erkannt") + '</p>' +
      '<p><strong>Zutaten erkannt:</strong> ' + anzahlZutaten + '</p>' +
      '<p><strong>Zubereitung:</strong> ' + (data.zubereitung ? "erkannt" : "nicht erkannt") + '</p>';
  }

  function showForm() {
    var f = $("formularBereich");
    if (f && f.classList) f.classList.remove("versteckt");
    if (f && f.scrollIntoView) {
      try { f.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { f.scrollIntoView(); }
    }
  }

  window.rf144AssistentAnalysieren = function () {
    try {
      var text = getAssistantText();
      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      var n = parseNutrition(text);
      var data = {
        name: labelValue(text, ["name"]) || firstLine(text),
        kategorie: labelValue(text, ["kategorie"]),
        portionen: numberText(labelValue(text, ["portionen"])),
        schwierigkeit: labelValue(text, ["schwierigkeit"]),
        zeit: labelValue(text, ["zubereitungszeit", "zeit"]),
        quelle: labelValue(text, ["quelle"]) || "Nicht zugeordnet",
        tags: parseTags(text),
        naehrwerte: n,
        zutatenGruppen: parseIngredientsGrouped(text),
        zubereitung: parsePreparation(text),
        utensilien: parseUtensils(text)
      };

      setValue("nameInput", data.name);
      setValue("kategorieInput", data.kategorie);
      setValue("portionenInput", data.portionen);
      setValue("schwierigkeitInput", data.schwierigkeit);
      setValue("zubereitungszeitInput", data.zeit);
      setValue("quelleInput", data.quelle);
      setValue("tagsInput", data.tags);
      setValue("zubereitungInput", data.zubereitung);
      setValue("utensilienInput", data.utensilien);

      setValue("kalorienInput", n.kalorien);
      setValue("eiweissInput", n.eiweiss);
      setValue("kohlenhydrateInput", n.kohlenhydrate);
      setValue("fettInput", n.fett);
      setValue("zuckerInput", n.zucker);
      setValue("ballaststoffeInput", n.ballaststoffe);
      setValue("salzInput", n.salz);

      fillIngredientGroups(data.zutatenGruppen);
      previewAssistant(data);
      showForm();

      if (typeof meldungAnzeigen === "function") meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");
      return true;
    } catch (e) {
      console.error("rf144AssistentAnalysieren Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rezeptAnalysierenDirektFinal = window.rf144AssistentAnalysieren;
  window.rezeptAnalysierenDirekt = window.rf144AssistentAnalysieren;
  window.rezeptAssistentAnalysieren = window.rf144AssistentAnalysieren;

  function bindAssistantButton() {
    var b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf144AssistentAnalysieren;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindAssistantButton);
  else bindAssistantButton();
  window.addEventListener("load", bindAssistantButton);

  function putRecipeInForm(index) {
    var r = Array.isArray(rezepte) ? rezepte[index] : null;
    if (!r) return false;

    bearbeitungsIndex = index;

    setValue("nameInput", r.name || "");
    setValue("kategorieInput", r.kategorie || "Nicht zugeordnet");
    setValue("portionenInput", r.portionen || "");
    setValue("schwierigkeitInput", r.schwierigkeit || "");
    setValue("zubereitungszeitInput", r.zubereitungszeit || "");
    setValue("quelleInput", r.quelle || "Nicht zugeordnet");
    setValue("zubereitungInput", r.zubereitung || "");
    setValue("utensilienInput", (r.utensilien || []).join(", "));
    setValue("notizenInput", r.notizen || "");
    setValue("tagsInput", (r.tags || []).join(", "));

    var status = $("ausprobiertInput");
    if (status) status.value = r.ausprobiert ? "true" : "false";

    var n = r.naehrwerte || {};
    setValue("kalorienInput", n.kalorien || "");
    setValue("eiweissInput", n.eiweiss || "");
    setValue("kohlenhydrateInput", n.kohlenhydrate || "");
    setValue("fettInput", n.fett || "");
    setValue("zuckerInput", n.zucker || "");
    setValue("ballaststoffeInput", n.ballaststoffe || "");
    setValue("salzInput", n.salz || "");

    fillIngredientGroups(r.zutatenGruppen || [{ name: "Zutaten", zutaten: r.zutaten || [] }]);
    showForm();

    var pruefung = $("datenpruefungBereich");
    if (pruefung && pruefung.classList) pruefung.classList.add("versteckt");

    var ergebnisse = $("ergebnisse");
    if (ergebnisse) ergebnisse.innerHTML = "";

    return true;
  }

  window.rf144RezeptBearbeiten = function (index) {
    var ok = putRecipeInForm(Number(index));
    if (!ok) alert("Rezept konnte nicht zum Bearbeiten geöffnet werden.");
    return ok;
  };

  window.rezeptBearbeiten = window.rf144RezeptBearbeiten;

  function repairCheckButtons() {
    var area = $("datenpruefungBereich");
    if (!area) return;

    Array.from(area.querySelectorAll("button")).forEach(function (button) {
      var txt = (button.textContent || "").toLowerCase();
      if (!txt.includes("bearbeiten")) return;

      var attr = button.getAttribute("onclick") || "";
      var match = attr.match(/\((\d+)\)/);
      if (!match) return;
      var index = Number(match[1]);

      button.onclick = function () {
        return window.rf144RezeptBearbeiten(index);
      };
    });
  }

  var oldDQ = typeof datenqualitaetPruefen === "function" ? datenqualitaetPruefen : null;
  if (oldDQ) {
    window.datenqualitaetPruefen = function () {
      var result = oldDQ();
      setTimeout(repairCheckButtons, 50);
      setTimeout(repairCheckButtons, 300);
      return result;
    };
    datenqualitaetPruefen = window.datenqualitaetPruefen;
  }

  window.addEventListener("load", function () {
    setTimeout(repairCheckButtons, 500);
  });
})();



// =====================================================
// VERSION 1.45: Rezeptprüfung Bearbeiten endgültig repariert
// =====================================================

(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function esc145(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function set145(id, value) {
    const element = $(id);
    if (!element) return;
    element.value = value == null ? "" : String(value);
  }

  function fillZutaten145(rezept) {
    const container = $("zutatenGruppen");
    if (!container) return;

    container.innerHTML = "";

    const gruppen = rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }];

    gruppen.forEach(gruppe => {
      if (typeof zutatenGruppeHinzufuegen === "function") {
        try {
          zutatenGruppeHinzufuegen(gruppe.name || "Zutaten", gruppe.zutaten || []);
          return;
        } catch (e) {
          console.warn("zutatenGruppeHinzufuegen in Prüfung fehlgeschlagen, Fallback:", e);
        }
      }

      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" value="${esc145(gruppe.name || "Zutaten")}">
        </div>
        <div class="zutaten-zeilen"></div>
      `;
      const rows = box.querySelector(".zutaten-zeilen");

      (gruppe.zutaten || []).forEach(z => {
        const row = document.createElement("div");
        row.className = "zutaten-zeile";
        row.innerHTML = `
          <input class="zutat-menge" value="${esc145(z.menge || "")}">
          <input class="zutat-einheit" value="${esc145(z.einheit || "")}">
          <input class="zutat-name" value="${esc145(z.name || "")}">
        `;
        rows.appendChild(row);
      });

      container.appendChild(box);
    });
  }

  window.rf145RezeptBearbeitenAusPruefung = function (index) {
    try {
      const i = Number(index);
      const rezept = Array.isArray(rezepte) ? rezepte[i] : null;

      if (!rezept) {
        alert("Rezept konnte nicht gefunden werden.");
        return false;
      }

      bearbeitungsIndex = i;

      set145("nameInput", rezept.name || "");
      set145("kategorieInput", rezept.kategorie || "Nicht zugeordnet");
      set145("portionenInput", rezept.portionen || "");
      set145("schwierigkeitInput", rezept.schwierigkeit || "");
      set145("zubereitungszeitInput", rezept.zubereitungszeit || "");
      set145("quelleInput", rezept.quelle || "Nicht zugeordnet");
      set145("zubereitungInput", rezept.zubereitung || "");
      set145("utensilienInput", (rezept.utensilien || []).join(", "));
      set145("notizenInput", rezept.notizen || "");
      set145("tagsInput", (rezept.tags || []).join(", "));

      const status = $("ausprobiertInput");
      if (status) status.value = rezept.ausprobiert ? "true" : "false";

      const n = rezept.naehrwerte || {};
      set145("kalorienInput", n.kalorien || "");
      set145("eiweissInput", n.eiweiss || "");
      set145("kohlenhydrateInput", n.kohlenhydrate || "");
      set145("fettInput", n.fett || "");
      set145("zuckerInput", n.zucker || "");
      set145("ballaststoffeInput", n.ballaststoffe || "");
      set145("salzInput", n.salz || "");

      fillZutaten145(rezept);

      ["sucheBereich", "rezeptSucheBereich", "einkaufBereich", "textImportBereich", "datenpruefungBereich"].forEach(id => {
        const el = $(id);
        if (el && el.classList) el.classList.add("versteckt");
      });

      const formular = $("formularBereich");
      if (formular && formular.classList) formular.classList.remove("versteckt");

      const ergebnisse = $("ergebnisse");
      if (ergebnisse) ergebnisse.innerHTML = "";

      if (formular && formular.scrollIntoView) {
        try {
          formular.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e) {
          formular.scrollIntoView();
        }
      }

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen("Rezept wurde zum Bearbeiten geöffnet.");
      }

      return true;
    } catch (e) {
      console.error("rf145RezeptBearbeitenAusPruefung Fehler:", e);
      alert("Rezept konnte nicht zum Bearbeiten geöffnet werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  // Normale Bearbeiten-Funktion ebenfalls ersetzen.
  window.rezeptBearbeiten = window.rf145RezeptBearbeitenAusPruefung;
  rezeptBearbeiten = window.rf145RezeptBearbeitenAusPruefung;

  window.zeigeDatenqualitaet = function (probleme) {
    const b = $("datenpruefungInhalt");
    if (!b) return;

    if (!probleme || !probleme.length) {
      b.innerHTML = "<p>Alles sieht gut aus.</p>";
      return;
    }

    b.innerHTML = `<p>${probleme.length} Rezept(e) mit möglichen Problemen gefunden.</p>`;

    probleme.forEach(e => {
      const div = document.createElement("div");
      div.className = "rezept";
      div.innerHTML = `
        <div class="rezept-kopf"><h3>${esc145(e.name || "Unbenanntes Rezept")}</h3></div>
        <div class="rezept-details" style="display:block">
          <ul>
            ${(e.probleme || []).map(p => `
              <li>
                ${esc145(p)}
                <button type="button" onclick='problemIgnorieren(${JSON.stringify(e.id)}, ${JSON.stringify(p)})'>ignorieren</button>
              </li>
            `).join("")}
          </ul>
          <button type="button" onclick="alleProblemeIgnorieren('${esc145(e.id)}', ${e.index})">Alle Punkte ignorieren</button>
          <button type="button" onclick="window.rf145RezeptBearbeitenAusPruefung(${e.index})">Rezept bearbeiten</button>
          ${e.hatDoppelteZutaten ? `<button type="button" onclick="doppelteZutatenZusammenfuehren(${e.index})">Doppelte Zutaten zusammenführen</button>` : ""}
        </div>
      `;
      b.appendChild(div);
    });
  };

  window.datenqualitaetPruefen = function () {
    if (typeof alleHauptbereicheVerstecken === "function") alleHauptbereicheVerstecken();

    const bereich = $("datenpruefungBereich");
    if (bereich && bereich.classList) bereich.classList.remove("versteckt");

    const ignorierte = typeof datenLaden === "function" ? datenLaden("ignorierteProbleme", {}) : {};
    const probleme = [];

    (Array.isArray(rezepte) ? rezepte : []).forEach((r, i) => {
      let p = [];
      let doppelte = [];

      if (!r.name) p.push("Name fehlt");
      if (!r.kategorie || r.kategorie === "Nicht zugeordnet") p.push("Kategorie nicht zugeordnet");
      if (!r.portionen) p.push("Grundportionen fehlen");
      if (!r.zubereitung) p.push("Zubereitung fehlt");
      if (!r.schwierigkeit) p.push("Schwierigkeit fehlt");
      if (!(r.tags || []).length) p.push("Tags fehlen");
      if (!r.bewertung) p.push("Bewertung fehlt");

      try {
        const zutaten = typeof zutatenAusRezept === "function"
          ? zutatenAusRezept(r)
          : ((r.zutatenGruppen || []).flatMap(g => g.zutaten || []) || r.zutaten || []);

        zutaten.forEach(z => {
          const d = typeof zutatAnalysieren === "function" ? zutatAnalysieren(z) : z;
          if (!d.menge && !z.menge) p.push(`Menge fehlt bei ${d.name || z.name || "Zutat"}`);
          if (!d.einheit && !z.einheit) p.push(`Einheit fehlt bei ${d.name || z.name || "Zutat"}`);
        });

        doppelte = typeof doppelteZutatenFinden === "function" ? doppelteZutatenFinden(zutaten) : [];
        if (doppelte.length) p.push(`Doppelte Zutaten: ${doppelte.join(", ")}`);
      } catch (err) {
        p.push("Rezept konnte nicht vollständig geprüft werden");
      }

      p = p.filter(x => !((ignorierte[r.id] || []).includes(x)));

      if (p.length) {
        probleme.push({
          index: i,
          id: r.id || String(i),
          name: r.name || "Unbenanntes Rezept",
          probleme: p,
          hatDoppelteZutaten: doppelte.length > 0
        });
      }
    });

    window.zeigeDatenqualitaet(probleme);
  };

  datenqualitaetPruefen = window.datenqualitaetPruefen;
})();



// =====================================================
// VERSION 1.46: Detailansicht + Suche Tags + Einkaufsliste finaler Komfortblock
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function e(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function saveAll146() {
    try {
      localStorage.setItem("rezepte", JSON.stringify(rezepte));
      if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle();
    } catch (err) {
      console.warn("Speichern 1.46 fehlgeschlagen:", err);
    }
  }

  function numberValue(v) {
    const n = Number(String(v == null ? "" : v).replace(",", "."));
    return isFinite(n) ? n : 0;
  }

  function formatNumber(v, unit) {
    const n = Number(v);
    if (!isFinite(n)) return "";
    const u = String(unit || "").toLowerCase();
    if (u === "mg" || u === "ml") return Number(n.toFixed(1)).toString().replace(".", ",");
    if (Math.abs(n) < 1) return Number(n.toFixed(2)).toString().replace(".", ",");
    if (Math.abs(n) < 10) return Number(n.toFixed(1)).toString().replace(".", ",");
    return Number(n.toFixed(0)).toString().replace(".", ",");
  }

  function zutatText146(z, faktor) {
    faktor = faktor == null ? 1 : faktor;
    const menge = numberValue(z.menge);
    const mengeText = menge ? formatNumber(menge * faktor, z.einheit) : "";
    return [mengeText, z.einheit || "", z.name || ""].filter(Boolean).join(" ");
  }

  function gruppen146(rezept) {
    return rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }];
  }

  function zubereitungsSchritte146(text) {
    const raw = String(text || "").trim();
    if (!raw) return [];

    const lines = raw.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (lines.length > 1) return lines.map(x => x.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);

    return raw
      .split(/(?<=[.!?])\s+/)
      .map(x => x.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  function sterneHtml146(index, rating) {
    rating = Number(rating || 0);
    let html = `<div class="bewertung"><strong>Bewertung:</strong> `;
    for (let i = 1; i <= 5; i++) {
      html += `<button type="button" class="stern-button ${i <= rating ? "aktiv" : ""}" onclick="bewertungSetzen(${index}, ${i})">${i <= rating ? "★" : "☆"}</button>`;
    }
    html += `</div>`;
    return html;
  }

  window.bewertungSetzen = function (index, sterne) {
    if (!Array.isArray(rezepte) || !rezepte[index]) return;
    rezepte[index].bewertung = Number(sterne || 0);
    saveAll146();
    rezeptAnzeigenDirekt146(index);
  };

  window.favoritUmschalten = function (index) {
    if (!Array.isArray(rezepte) || !rezepte[index]) return;
    rezepte[index].favorit = !rezepte[index].favorit;
    saveAll146();
    rezeptAnzeigenDirekt146(index);
  };

  function detailHtml146(rezept, index) {
    const status = rezept.ausprobiert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
    const statusClass = rezept.ausprobiert ? "status-ja" : "status-nein";
    const steps = zubereitungsSchritte146(rezept.zubereitung);
    const tags = (rezept.tags || []).map(t => `<span class="tag-chip">${e(t)}</span>`).join(" ");

    return `
      <article class="rezept-detail box rezept-detail-modern">
        <div class="detail-topbar">
          <button type="button" onclick="alleRezepteToggle()">← Zurück</button>
          <button type="button" onclick="rezeptBearbeiten(${index})">Bearbeiten</button>
          <button type="button" onclick="rezeptLoeschen(${index})">Löschen</button>
        </div>

        <h2>${e(rezept.name || "Unbenanntes Rezept")}</h2>

        <div class="detail-meta-grid">
          <div><strong>Kategorie</strong><span>${e(rezept.kategorie || "Nicht zugeordnet")}</span></div>
          <div><strong>Portionen</strong><span>${e(rezept.portionen || "")}</span></div>
          <div><strong>Zeit</strong><span>${e(rezept.zubereitungszeit || "")}</span></div>
          <div><strong>Quelle</strong><span>${e(rezept.quelle || "Nicht zugeordnet")}</span></div>
          <div><strong>Status</strong><span class="rezept-ausprobiert ${statusClass}">${status}</span></div>
          <div><strong>Favorit</strong><span>${rezept.favorit ? "Ja" : "Nein"}</span></div>
        </div>

        <div class="detail-actions">
          <button type="button" onclick="favoritUmschalten(${index})">${rezept.favorit ? "Favorit entfernen" : "Als Favorit speichern"}</button>
          ${sterneHtml146(index, rezept.bewertung || 0)}
        </div>

        <div class="tags">${tags}</div>

        <h3>Zutaten</h3>
        ${gruppen146(rezept).map(gruppe => `
          <div class="zutaten-gruppe-anzeige">
            <h4>${e(gruppe.name || "Zutaten")}</h4>
            <ul>${(gruppe.zutaten || []).map(z => `<li>${e(zutatText146(z))}</li>`).join("")}</ul>
          </div>
        `).join("")}

        <section class="rechner-box">
          <h3>Portionenrechner</h3>
          <div class="inline-form">
            <input type="number" min="1" id="zielPortionen-${index}" placeholder="Gewünschte Portionen">
            <button type="button" onclick="portionenBerechnen146(${index})">Portionen berechnen</button>
          </div>
          <div id="portionenErgebnis-${index}" class="rechner-ergebnis"></div>
        </section>

        <section class="rechner-box">
          <h3>Nährwertrechner</h3>
          <p>Berechnung anhand der eingetragenen Nährwerte pro 100 g.</p>
          <div class="inline-form">
            <input type="number" min="1" id="naehrwertGramm-${index}" placeholder="gegessene Gramm">
            <button type="button" onclick="naehrwerteBerechnen146(${index})">Nährwerte berechnen</button>
          </div>
          <div id="naehrwertErgebnis-${index}" class="rechner-ergebnis"></div>
        </section>

        ${typeof naehrwerteKurzHtml === "function" ? naehrwerteKurzHtml(rezept) : ""}

        <h3>Zubereitung</h3>
        <ol class="zubereitung-nummeriert">
          ${steps.map(s => `<li>${e(s)}</li>`).join("")}
        </ol>

        <section class="kochmodus-box">
          <h3>Kochmodus</h3>
          <button type="button" onclick="kochmodusStarten146(${index})">Kochmodus starten</button>
          <div id="kochmodus-${index}" class="kochmodus"></div>
        </section>

        <section class="einkauf-detail-box">
          <h3>Zur Einkaufsliste</h3>
          <button type="button" onclick="rezeptZurEinkaufsliste(${index}, 'alle')">Alle Zutaten hinzufügen</button>
        </section>
      </article>
    `;
  }

  window.rezeptAnzeigenDirekt146 = function (index) {
    const rezept = Array.isArray(rezepte) ? rezepte[index] : null;
    const ergebnisse = $("ergebnisse");
    if (!rezept || !ergebnisse) return false;

    ergebnisse.innerHTML = detailHtml146(rezept, index);

    if (typeof entferneAlleDoppeltenNaehrwertEinteilungen === "function") {
      setTimeout(entferneAlleDoppeltenNaehrwertEinteilungen, 50);
    }

    return true;
  };

  window.rezeptAnzeigenDirekt142 = window.rezeptAnzeigenDirekt146;

  function rezeptKarteHtml146(rezept, index) {
    const status = rezept.ausprobiert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
    const statusClass = rezept.ausprobiert ? "status-ja" : "status-nein";
    const tags = (rezept.tags || []).map(tag => `<span class="tag-chip">${e(tag)}</span>`).join(" ");

    return `
      <article class="rezept-karte">
        <h3>${e(rezept.name || "Unbenanntes Rezept")}</h3>
        <p><strong>Kategorie:</strong> ${e(rezept.kategorie || "Nicht zugeordnet")}</p>
        <p><strong>Quelle:</strong> ${e(rezept.quelle || "Nicht zugeordnet")}</p>
        <div class="rezept-ausprobiert ${statusClass}">${status}</div>
        <div class="tags">${tags}</div>
        <div class="button-gruppe">
          <button type="button" onclick="rezeptAnzeigenDirekt146(${index})">Rezept anzeigen</button>
          <button type="button" onclick="rezeptBearbeiten(${index})">Bearbeiten</button>
          <button type="button" onclick="rezeptLoeschen(${index})">Löschen</button>
        </div>
      </article>
    `;
  }

  window.zeigeErgebnisseDirekt142 = function (liste) {
    const ergebnisse = $("ergebnisse");
    if (!ergebnisse) return;
    const daten = Array.isArray(liste) ? liste : [];
    if (!daten.length) {
      ergebnisse.innerHTML = `<div class="box"><p>Keine Rezepte gefunden.</p></div>`;
      return;
    }
    ergebnisse.innerHTML = daten.map((rezept, pos) => {
      const index = typeof rezept.index === "number" ? rezept.index : rezepte.indexOf(rezept);
      return rezeptKarteHtml146(rezept, index >= 0 ? index : pos);
    }).join("");
  };

  window.portionenBerechnen146 = function (index) {
    const rezept = rezepte[index];
    const ziel = numberValue($(`zielPortionen-${index}`)?.value);
    const out = $(`portionenErgebnis-${index}`);
    if (!rezept || !out) return;
    if (!ziel || !rezept.portionen) {
      out.innerHTML = `<p>Bitte gültige Portionen eingeben.</p>`;
      return;
    }

    const faktor = ziel / Number(rezept.portionen);
    out.innerHTML = `
      <h4>Zutaten für ${e(ziel)} Portion(en)</h4>
      ${gruppen146(rezept).map(gruppe => `
        <strong>${e(gruppe.name || "Zutaten")}</strong>
        <ul>${(gruppe.zutaten || []).map(z => `<li>${e(zutatText146(z, faktor))}</li>`).join("")}</ul>
      `).join("")}
    `;
  };

  window.naehrwerteBerechnen146 = function (index) {
    const rezept = rezepte[index];
    const gramm = numberValue($(`naehrwertGramm-${index}`)?.value);
    const out = $(`naehrwertErgebnis-${index}`);
    if (!rezept || !out) return;

    const n = rezept.naehrwerte || {};
    if (!gramm) {
      out.innerHTML = `<p>Bitte Gramm eingeben.</p>`;
      return;
    }

    const faktor = gramm / 100;
    const rows = [
      ["Kalorien", n.kalorien, "kcal"],
      ["Eiweiß", n.eiweiss, "g"],
      ["Kohlenhydrate", n.kohlenhydrate, "g"],
      ["Fett", n.fett, "g"],
      ["Zucker", n.zucker, "g"],
      ["Ballaststoffe", n.ballaststoffe, "g"],
      ["Salz", n.salz, "g"]
    ].filter(r => Number(r[1]) > 0);

    if (!rows.length) {
      out.innerHTML = `<p>Für dieses Rezept sind keine Nährwerte eingetragen.</p>`;
      return;
    }

    out.innerHTML = `
      <h4>Nährwerte für ${e(gramm)} g</h4>
      <ul>
        ${rows.map(r => `<li><strong>${e(r[0])}:</strong> ${formatNumber(Number(r[1]) * faktor, r[2])} ${r[2]}</li>`).join("")}
      </ul>
    `;
  };

  const kochmodusState146 = {};

  window.kochmodusStarten146 = function (index) {
    const rezept = rezepte[index];
    const box = $(`kochmodus-${index}`);
    if (!rezept || !box) return;

    const steps = zubereitungsSchritte146(rezept.zubereitung);
    if (!steps.length) {
      box.innerHTML = `<p>Keine Zubereitungsschritte vorhanden.</p>`;
      return;
    }

    kochmodusState146[index] = 0;
    renderKochmodus146(index, steps);
  };

  window.kochmodusWeiter146 = function (index) {
    const rezept = rezepte[index];
    const steps = zubereitungsSchritte146(rezept.zubereitung);
    kochmodusState146[index] = Math.min((kochmodusState146[index] || 0) + 1, steps.length - 1);
    renderKochmodus146(index, steps);
  };

  window.kochmodusZurueck146 = function (index) {
    const rezept = rezepte[index];
    const steps = zubereitungsSchritte146(rezept.zubereitung);
    kochmodusState146[index] = Math.max((kochmodusState146[index] || 0) - 1, 0);
    renderKochmodus146(index, steps);
  };

  function renderKochmodus146(index, steps) {
    const box = $(`kochmodus-${index}`);
    const current = kochmodusState146[index] || 0;
    box.innerHTML = `
      <div class="kochkarte">
        <p><strong>Schritt ${current + 1} von ${steps.length}</strong></p>
        <p>${e(steps[current])}</p>
        <div class="button-gruppe">
          <button type="button" onclick="kochmodusZurueck146(${index})" ${current === 0 ? "disabled" : ""}>Zurück</button>
          <button type="button" onclick="kochmodusWeiter146(${index})" ${current === steps.length - 1 ? "disabled" : ""}>Weiter</button>
        </div>
      </div>
    `;
  }

  window.formularLeeren = function () {
    try {
      bearbeitungsIndex = null;
      [
        "nameInput", "portionenInput", "zubereitungszeitInput", "quelleInput",
        "zubereitungInput", "utensilienInput", "notizenInput", "tagsInput",
        "kalorienInput", "eiweissInput", "kohlenhydrateInput", "fettInput",
        "zuckerInput", "ballaststoffeInput", "salzInput"
      ].forEach(id => {
        const el = $(id);
        if (el) el.value = "";
      });

      const kat = $("kategorieInput"); if (kat) kat.value = "Nicht zugeordnet";
      const schw = $("schwierigkeitInput"); if (schw) schw.value = "";
      const status = $("ausprobiertInput"); if (status) status.value = "false";

      const zg = $("zutatenGruppen");
      if (zg) {
        zg.innerHTML = "";
        if (typeof zutatenGruppeHinzufuegen === "function") {
          const leere = Array.from({ length: 10 }, () => ({ menge: "", einheit: "", name: "" }));
          zutatenGruppeHinzufuegen("Zutaten", leere);
        }
      }

      if (typeof meldungAnzeigen === "function") meldungAnzeigen("Formular geleert.");
    } catch (err) {
      console.error("Formular leeren Fehler:", err);
      alert("Formular konnte nicht geleert werden.");
    }
  };

  function buildTagChips146() {
    const select = $("suchTagInput");
    if (!select) return;

    let holder = $("suchTagChips146");
    if (!holder) {
      holder = document.createElement("div");
      holder.id = "suchTagChips146";
      holder.className = "tag-suche-chips";
      select.insertAdjacentElement("afterend", holder);
      select.classList.add("tag-select-hidden-modern");
    }

    const options = Array.from(select.options || []).filter(o => o.value);
    holder.innerHTML = options.map(o => {
      const active = o.selected ? "aktiv" : "";
      return `<button type="button" class="tag-filter-chip ${active}" data-tag="${e(o.value)}">${e(o.value)}</button>`;
    }).join("");

    holder.querySelectorAll("button").forEach(btn => {
      btn.onclick = function () {
        const tag = btn.dataset.tag;
        Array.from(select.options || []).forEach(o => {
          if (o.value === tag) o.selected = !o.selected;
        });
        buildTagChips146();
      };
    });
  }

  const tagsDropdownAlt146 = typeof suchTagsDropdownAktualisieren === "function" ? suchTagsDropdownAktualisieren : null;
  window.suchTagsDropdownAktualisieren = function () {
    if (tagsDropdownAlt146) tagsDropdownAlt146();
    setTimeout(buildTagChips146, 0);
  };

  window.addEventListener("load", function () {
    setTimeout(buildTagChips146, 500);
  });

  window.einkaufslisteErstellen = function () {
    const ul = $("einkaufsliste");
    if (!ul) return;

    const daten = typeof datenLaden === "function" ? datenLaden("einkaufsliste", []) : [];
    const ab = typeof datenLaden === "function" ? datenLaden("abgehakteEinkaufsliste", []) : [];
    const list = typeof einkaufZusammenfassen === "function" ? einkaufZusammenfassen(daten) : [];

    if (!list.length) {
      ul.innerHTML = `<li class="einkauf-leer">Die Einkaufsliste ist leer.</li>`;
      return;
    }

    ul.innerHTML = list.map(it => {
      const text = it.menge && typeof mengeMitSchoenerEinheit === "function"
        ? `${mengeMitSchoenerEinheit(it.menge, it.basisEinheit)} ${it.name}`
        : (it.original || []).join(", ");

      const checked = ab.includes(text);
      return `
        <li class="einkauf-item ${checked ? "abgehakt-item" : ""}">
          <label>
            <input type="checkbox" onchange="einkaufsItemAbhaken(this)" ${checked ? "checked" : ""}>
            <span class="${checked ? "abgehakt" : ""}">${e(text)}</span>
          </label>
        </li>
      `;
    }).join("");
  };
})();



// =====================================================
// VERSION 1.47: Rezept-Assistent final getestet
// Zutaten und Zubereitung werden zuverlässig übernommen.
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function escape147(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setValue147(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function number147(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function lines147(text) {
    return String(text || "").split(/\r?\n/);
  }

  function cleanLines147(text) {
    return lines147(text).map(x => x.trim());
  }

  function firstLine147(text) {
    const l = cleanLines147(text).filter(Boolean);
    return l.length ? l[0] : "";
  }

  function label147(text, labels) {
    const l = cleanLines147(text);
    const wanted = labels.map(x => x.toLowerCase());

    for (const line of l) {
      const lower = line.toLowerCase();
      for (const w of wanted) {
        if (lower.startsWith(w + ":")) {
          return line.split(":").slice(1).join(":").trim();
        }
      }
    }
    return "";
  }

  function section147(text, starts, stops) {
    const l = lines147(text);
    let startIndex = -1;

    for (let i = 0; i < l.length; i++) {
      const lower = l[i].trim().toLowerCase();
      if (starts.some(s => lower.startsWith(s.toLowerCase()))) {
        startIndex = i;
        break;
      }
    }

    if (startIndex < 0) return "";

    const out = [];
    for (let i = startIndex + 1; i < l.length; i++) {
      const lower = l[i].trim().toLowerCase();
      if (stops.some(s => lower.startsWith(s.toLowerCase()))) break;
      out.push(l[i]);
    }

    return out.join("\n").trim();
  }

  function tags147(text) {
    const raw = label147(text, ["tags", "tag", "schlagworte"]);
    const out = [];

    if (raw) {
      raw.split(/[,;#]/)
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .forEach(t => out.push(t));
    }

    String(text || "").split(/\s+/).forEach(part => {
      if (part.startsWith("#")) {
        const tag = part.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (tag) out.push(tag);
      }
    });

    return [...new Set(out)].join(", ");
  }

  function nutrition147(text) {
    function v(labels) {
      for (const l of labels) {
        const raw = label147(text, [l]);
        if (raw) return number147(raw);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function ingredients147(text) {
    const block = section147(text, ["zutaten:"], [
      "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    const groups = [];
    let current = { name: "Zutaten", zutaten: [] };

    function pushCurrent() {
      if (current.zutaten.length) groups.push(current);
    }

    if (!block) return [];

    block.split(/\r?\n/).forEach(line => {
      let z = line.replace(/^[-*•]\s*/, "").trim();
      if (!z) return;

      // Gruppentitel wie "Teig:" oder "Fülle:"
      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(z)) {
        pushCurrent();
        current = { name: z.replace(":", "").trim() || "Zutaten", zutaten: [] };
        return;
      }

      const m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (m) {
        current.zutaten.push({
          menge: m[1] || "",
          einheit: m[2] || "",
          name: m[3] || z
        });
      } else {
        current.zutaten.push({ menge: "", einheit: "", name: z });
      }
    });

    pushCurrent();

    return groups;
  }

  function preparation147(text) {
    const block = section147(text, ["zubereitung:", "anleitung:", "schritte:"], [
      "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    return block
      .split(/\r?\n/)
      .map(x => x.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensils147(text) {
    const direkt = label147(text, ["utensilien", "besondere utensilien"]);
    if (direkt) return direkt;

    return section147(text, ["utensilien:"], [
      "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ])
      .split(/\r?\n|,/)
      .map(x => x.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .join(", ");
  }

  function fillIngredients147(groups) {
    const container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    if (!groups || !groups.length) return false;

    groups.forEach(group => {
      if (typeof zutatenGruppeHinzufuegen === "function") {
        try {
          zutatenGruppeHinzufuegen(group.name || "Zutaten", group.zutaten || []);
          return;
        } catch (e) {
          console.warn("zutatenGruppeHinzufuegen fehlgeschlagen, nutze Fallback", e);
        }
      }

      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" value="${escape147(group.name || "Zutaten")}">
        </div>
        <div class="zutaten-zeilen"></div>
      `;

      const rows = box.querySelector(".zutaten-zeilen");

      (group.zutaten || []).forEach(z => {
        const row = document.createElement("div");
        row.className = "zutaten-zeile";
        row.innerHTML = `
          <input class="zutat-menge" value="${escape147(z.menge || "")}">
          <input class="zutat-einheit" value="${escape147(z.einheit || "")}">
          <input class="zutat-name" value="${escape147(z.name || "")}">
        `;
        rows.appendChild(row);
      });

      container.appendChild(box);
    });

    return true;
  }

  function text147() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function preview147(data) {
    const v = $("assistentVorschau");
    if (!v) return;

    const count = (data.zutatenGruppen || []).reduce((sum, g) => sum + (g.zutaten || []).length, 0);

    v.innerHTML = `
      <h3>Vorschau der übernommenen Daten</h3>
      <p><strong>Name:</strong> ${escape147(data.name || "nicht erkannt")}</p>
      <p><strong>Kategorie:</strong> ${escape147(data.kategorie || "nicht erkannt")}</p>
      <p><strong>Portionen:</strong> ${escape147(data.portionen || "nicht erkannt")}</p>
      <p><strong>Tags:</strong> ${escape147(data.tags || "keine Tags erkannt")}</p>
      <p><strong>Zutaten erkannt:</strong> ${count}</p>
      <p><strong>Zubereitung:</strong> ${data.zubereitung ? "erkannt" : "nicht erkannt"}</p>
    `;
  }

  function showForm147() {
    const form = $("formularBereich");
    if (form && form.classList) form.classList.remove("versteckt");
  }

  window.rf147AssistentAnalysieren = function () {
    try {
      const text = text147();

      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      const n = nutrition147(text);
      const groups = ingredients147(text);
      const prep = preparation147(text);

      const data = {
        name: label147(text, ["name"]) || firstLine147(text),
        kategorie: label147(text, ["kategorie"]),
        portionen: number147(label147(text, ["portionen"])),
        schwierigkeit: label147(text, ["schwierigkeit"]),
        zeit: label147(text, ["zubereitungszeit", "zeit"]),
        quelle: label147(text, ["quelle"]) || "Nicht zugeordnet",
        tags: tags147(text),
        naehrwerte: n,
        zutatenGruppen: groups,
        zubereitung: prep,
        utensilien: utensils147(text)
      };

      setValue147("nameInput", data.name);
      setValue147("kategorieInput", data.kategorie);
      setValue147("portionenInput", data.portionen);
      setValue147("schwierigkeitInput", data.schwierigkeit);
      setValue147("zubereitungszeitInput", data.zeit);
      setValue147("quelleInput", data.quelle);
      setValue147("tagsInput", data.tags);
      setValue147("zubereitungInput", data.zubereitung);
      setValue147("utensilienInput", data.utensilien);

      setValue147("kalorienInput", n.kalorien);
      setValue147("eiweissInput", n.eiweiss);
      setValue147("kohlenhydrateInput", n.kohlenhydrate);
      setValue147("fettInput", n.fett);
      setValue147("zuckerInput", n.zucker);
      setValue147("ballaststoffeInput", n.ballaststoffe);
      setValue147("salzInput", n.salz);

      const ingredientsOk = fillIngredients147(groups);

      preview147(data);
      showForm147();

      if (!ingredientsOk || !data.zubereitung) {
        const msg = `Analyse teilweise erfolgreich: Zutaten ${ingredientsOk ? "OK" : "nicht erkannt"}, Zubereitung ${data.zubereitung ? "OK" : "nicht erkannt"}.`;
        if (typeof meldungAnzeigen === "function") meldungAnzeigen(msg, true);
      } else if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen("Rezept wurde analysiert und ins Formular übernommen.");
      }

      return ingredientsOk && !!data.zubereitung;
    } catch (e) {
      console.error("rf147AssistentAnalysieren Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rezeptAnalysierenDirektFinal = window.rf147AssistentAnalysieren;
  window.rezeptAnalysierenDirekt = window.rf147AssistentAnalysieren;
  window.rezeptAssistentAnalysieren = window.rf147AssistentAnalysieren;
  window.rf144AssistentAnalysieren = window.rf147AssistentAnalysieren;

  function bind147() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf147AssistentAnalysieren;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind147);
  else bind147();

  window.addEventListener("load", bind147);
})();



// =====================================================
// VERSION 1.48: Assistent final + Kochmodus Zutaten/Utensilien + einzelne Einkaufsliste
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function esc148(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function set148(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function nummer148(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function zeilen148(text) {
    return String(text || "").split(/\r?\n/);
  }

  function trimZeilen148(text) {
    return zeilen148(text).map(x => x.trim());
  }

  function ersteZeile148(text) {
    const l = trimZeilen148(text).filter(Boolean);
    return l.length ? l[0] : "";
  }

  function label148(text, labels) {
    const l = trimZeilen148(text);
    const wanted = labels.map(x => x.toLowerCase());

    for (const line of l) {
      const lower = line.toLowerCase();
      for (const w of wanted) {
        if (lower.startsWith(w + ":")) {
          return line.split(":").slice(1).join(":").trim();
        }
      }
    }

    return "";
  }

  function abschnitt148(text, starts, stops) {
    const l = zeilen148(text);
    let start = -1;

    for (let i = 0; i < l.length; i++) {
      const lower = l[i].trim().toLowerCase();
      if (starts.some(s => lower.startsWith(s.toLowerCase()))) {
        start = i;
        break;
      }
    }

    if (start < 0) return "";

    const out = [];
    for (let i = start + 1; i < l.length; i++) {
      const lower = l[i].trim().toLowerCase();
      if (stops.some(s => lower.startsWith(s.toLowerCase()))) break;
      out.push(l[i]);
    }

    return out.join("\n").trim();
  }

  function tags148(text) {
    const raw = label148(text, ["tags", "tag", "schlagworte"]);
    const result = [];
    if (raw) {
      raw.split(/[,;#]/).map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => result.push(t));
    }
    String(text || "").split(/\s+/).forEach(p => {
      if (p.startsWith("#")) {
        const t = p.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (t) result.push(t);
      }
    });
    return [...new Set(result)].join(", ");
  }

  function naehrwerte148(text) {
    function v(labels) {
      for (const l of labels) {
        const raw = label148(text, [l]);
        if (raw) return nummer148(raw);
      }
      return "";
    }
    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function zutaten148(text) {
    const block = abschnitt148(text, ["zutaten:"], [
      "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    if (!block) return [];

    const gruppen = [];
    let current = { name: "Zutaten", zutaten: [] };

    function push() {
      if (current.zutaten.length) gruppen.push(current);
    }

    block.split(/\r?\n/).forEach(line => {
      let z = line.replace(/^[-*•]\s*/, "").trim();
      if (!z) return;

      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(z)) {
        push();
        current = { name: z.replace(":", "").trim() || "Zutaten", zutaten: [] };
        return;
      }

      const m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (m) {
        current.zutaten.push({ menge: m[1] || "", einheit: m[2] || "", name: m[3] || z });
      } else {
        current.zutaten.push({ menge: "", einheit: "", name: z });
      }
    });

    push();
    return gruppen;
  }

  function zubereitung148(text) {
    const block = abschnitt148(text, ["zubereitung:", "anleitung:", "schritte:"], [
      "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    return block
      .split(/\r?\n/)
      .map(x => x.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensilien148(text) {
    const direkt = label148(text, ["utensilien", "besondere utensilien"]);
    if (direkt) return direkt;

    const block = abschnitt148(text, ["utensilien:"], [
      "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    return block
      .split(/\r?\n|,/)
      .map(x => x.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .join(", ");
  }

  function sicherZutatenZeile148(rows, z) {
    const row = document.createElement("div");
    row.className = "zutaten-zeile";
    row.innerHTML = `
      <input class="zutat-menge" placeholder="Menge" value="${esc148(z.menge || "")}">
      <select class="zutat-einheit">
        ${["", "mg", "g", "dag", "kg", "ml", "l", "TL", "EL", "Stk.", "Prise", "Dose", "Bund"].map(einheit =>
          `<option value="${esc148(einheit)}" ${String(einheit).toLowerCase() === String(z.einheit || "").toLowerCase() ? "selected" : ""}>${einheit || "Einheit"}</option>`
        ).join("")}
      </select>
      <input class="zutat-name" placeholder="Zutat" value="${esc148(z.name || "")}">
      <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    rows.appendChild(row);
  }

  function zutatenInsFormular148(gruppen) {
    const container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    if (!gruppen || !gruppen.length) return false;

    gruppen.forEach(gruppe => {
      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" placeholder="Gruppe, z. B. Teig, Fülle, Glasur" value="${esc148(gruppe.name || "Zutaten")}">
          <button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button>
        </div>
        <div class="zutaten-zeilen"></div>
        <button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>
      `;
      const rows = box.querySelector(".zutaten-zeilen");
      (gruppe.zutaten || []).forEach(z => sicherZutatenZeile148(rows, z));
      container.appendChild(box);
    });

    return true;
  }

  function text148() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function vorschau148(data) {
    const v = $("assistentVorschau");
    if (!v) return;
    const count = (data.zutatenGruppen || []).reduce((sum, g) => sum + (g.zutaten || []).length, 0);
    v.innerHTML = `
      <h3>Vorschau der übernommenen Daten</h3>
      <p><strong>Name:</strong> ${esc148(data.name || "nicht erkannt")}</p>
      <p><strong>Kategorie:</strong> ${esc148(data.kategorie || "nicht erkannt")}</p>
      <p><strong>Portionen:</strong> ${esc148(data.portionen || "nicht erkannt")}</p>
      <p><strong>Tags:</strong> ${esc148(data.tags || "keine Tags erkannt")}</p>
      <p><strong>Zutaten erkannt:</strong> ${count}</p>
      <p><strong>Zubereitung:</strong> ${data.zubereitung ? "erkannt" : "nicht erkannt"}</p>
      <p><strong>Utensilien:</strong> ${esc148(data.utensilien || "nicht erkannt")}</p>
    `;
  }

  window.rf148AssistentAnalysieren = function () {
    try {
      const text = text148();

      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      const n = naehrwerte148(text);
      const gruppen = zutaten148(text);
      const prep = zubereitung148(text);
      const utensilien = utensilien148(text);

      const data = {
        name: label148(text, ["name"]) || ersteZeile148(text),
        kategorie: label148(text, ["kategorie"]),
        portionen: nummer148(label148(text, ["portionen"])),
        schwierigkeit: label148(text, ["schwierigkeit"]),
        zeit: label148(text, ["zubereitungszeit", "zeit"]),
        quelle: label148(text, ["quelle"]) || "Nicht zugeordnet",
        tags: tags148(text),
        naehrwerte: n,
        zutatenGruppen: gruppen,
        zubereitung: prep,
        utensilien
      };

      set148("nameInput", data.name);
      set148("kategorieInput", data.kategorie);
      set148("portionenInput", data.portionen);
      set148("schwierigkeitInput", data.schwierigkeit);
      set148("zubereitungszeitInput", data.zeit);
      set148("quelleInput", data.quelle);
      set148("tagsInput", data.tags);
      set148("zubereitungInput", data.zubereitung);
      set148("utensilienInput", data.utensilien);

      set148("kalorienInput", n.kalorien);
      set148("eiweissInput", n.eiweiss);
      set148("kohlenhydrateInput", n.kohlenhydrate);
      set148("fettInput", n.fett);
      set148("zuckerInput", n.zucker);
      set148("ballaststoffeInput", n.ballaststoffe);
      set148("salzInput", n.salz);

      const okZutaten = zutatenInsFormular148(gruppen);
      vorschau148(data);

      const form = $("formularBereich");
      if (form && form.classList) form.classList.remove("versteckt");

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(okZutaten && prep && utensilien ? "Rezept wurde vollständig analysiert." : "Rezept teilweise analysiert. Bitte prüfen.", !(okZutaten && prep));
      }

      return !!(okZutaten && prep);
    } catch (e) {
      console.error("rf148AssistentAnalysieren Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rf147AssistentAnalysieren = window.rf148AssistentAnalysieren;
  window.rf144AssistentAnalysieren = window.rf148AssistentAnalysieren;
  window.rezeptAnalysierenDirektFinal = window.rf148AssistentAnalysieren;
  window.rezeptAnalysierenDirekt = window.rf148AssistentAnalysieren;
  window.rezeptAssistentAnalysieren = window.rf148AssistentAnalysieren;

  function bind148() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf148AssistentAnalysieren;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind148);
  else bind148();
  window.addEventListener("load", bind148);

  function alleZutaten148(rezept) {
    return (rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }])
      .flatMap(g => (g.zutaten || []).map(z => ({ ...z, gruppe: g.name || "Zutaten" })));
  }

  function zutatText148(z) {
    return [z.menge || "", z.einheit || "", z.name || ""].filter(Boolean).join(" ");
  }

  function utensilienListe148(rezept) {
    return Array.isArray(rezept.utensilien)
      ? rezept.utensilien
      : String(rezept.utensilien || "").split(",").map(x => x.trim()).filter(Boolean);
  }

  function schritte148(text) {
    const raw = String(text || "").trim();
    if (!raw) return [];
    const lines = raw.split(/\r?\n/).map(x => x.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
    return lines.length ? lines : raw.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  }

  function stepMatches148(step, itemName) {
    const s = step.toLowerCase();
    const name = String(itemName || "").toLowerCase();
    if (!name) return false;
    if (s.includes(name)) return true;
    const parts = name.split(/\s+/).filter(x => x.length > 3);
    return parts.some(p => s.includes(p));
  }

  const kochState148 = {};

  window.kochmodusStarten146 = function (index) {
    const rezept = rezepte[index];
    const box = $(`kochmodus-${index}`);
    if (!rezept || !box) return;

    const steps = schritte148(rezept.zubereitung);
    if (!steps.length) {
      box.innerHTML = "<p>Keine Zubereitungsschritte vorhanden.</p>";
      return;
    }

    kochState148[index] = 0;
    renderKoch148(index);
  };

  window.kochmodusWeiter146 = function (index) {
    const rezept = rezepte[index];
    const steps = schritte148(rezept.zubereitung);
    kochState148[index] = Math.min((kochState148[index] || 0) + 1, steps.length - 1);
    renderKoch148(index);
  };

  window.kochmodusZurueck146 = function (index) {
    kochState148[index] = Math.max((kochState148[index] || 0) - 1, 0);
    renderKoch148(index);
  };

  function renderKoch148(index) {
    const rezept = rezepte[index];
    const box = $(`kochmodus-${index}`);
    if (!rezept || !box) return;

    const steps = schritte148(rezept.zubereitung);
    const current = kochState148[index] || 0;
    const step = steps[current] || "";

    const zutaten = alleZutaten148(rezept);
    const passendeZutaten = zutaten.filter(z => stepMatches148(step, z.name));
    const anzeigenZutaten = passendeZutaten.length ? passendeZutaten : zutaten;

    const utensilien = utensilienListe148(rezept);
    const passendeUtensilien = utensilien.filter(u => stepMatches148(step, u));
    const anzeigenUtensilien = passendeUtensilien.length ? passendeUtensilien : utensilien;

    box.innerHTML = `
      <div class="kochkarte">
        <p><strong>Schritt ${current + 1} von ${steps.length}</strong></p>
        <p>${esc148(step)}</p>

        <h4>Benötigte Zutaten</h4>
        <ul>${anzeigenZutaten.map(z => `<li>${esc148(zutatText148(z))}</li>`).join("") || "<li>Keine Zutaten erkannt</li>"}</ul>

        <h4>Benötigte Utensilien</h4>
        <ul>${anzeigenUtensilien.map(u => `<li>${esc148(u)}</li>`).join("") || "<li>Keine Utensilien eingetragen</li>"}</ul>

        <div class="button-gruppe">
          <button type="button" onclick="kochmodusZurueck146(${index})" ${current === 0 ? "disabled" : ""}>Zurück</button>
          <button type="button" onclick="kochmodusWeiter146(${index})" ${current === steps.length - 1 ? "disabled" : ""}>Weiter</button>
        </div>
      </div>
    `;
  }

  window.einkaufsAuswahlHtml148 = function (rezept, index) {
    return (rezept.zutatenGruppen || [{ name: "Zutaten", zutaten: rezept.zutaten || [] }]).map((gruppe, gi) => `
      <div class="einkauf-auswahl-gruppe">
        <strong>${esc148(gruppe.name || "Zutaten")}</strong>
        ${(gruppe.zutaten || []).map((z, zi) => `
          <label class="einkauf-auswahl-item">
            <input type="checkbox" class="einkauf-zutat-${index}" data-gruppe="${gi}" data-zutat="${zi}">
            ${esc148(zutatText148(z))}
          </label>
        `).join("")}
      </div>
    `).join("");
  };

  const alteDetail146 = window.rezeptAnzeigenDirekt146;
  window.rezeptAnzeigenDirekt146 = function (index) {
    if (typeof alteDetail146 === "function") alteDetail146(index);

    const rezept = rezepte[index];
    const detail = document.querySelector(".rezept-detail-modern, .rezept-detail");
    if (!rezept || !detail) return;

    let box = detail.querySelector(".einkauf-detail-box");
    if (box) {
      box.innerHTML = `
        <h3>Zur Einkaufsliste</h3>
        <button type="button" onclick="rezeptZurEinkaufsliste(${index}, 'alle')">Alle Zutaten hinzufügen</button>
        <details>
          <summary>Einzelne Zutaten auswählen</summary>
          ${window.einkaufsAuswahlHtml148(rezept, index)}
          <button type="button" onclick="rezeptZurEinkaufsliste(${index}, 'auswahl')">Ausgewählte Zutaten hinzufügen</button>
        </details>
      `;
    }
  };
  window.rezeptAnzeigenDirekt142 = window.rezeptAnzeigenDirekt146;
})();



// =====================================================
// VERSION 1.49: ECHTE verwendete Funktionen überschrieben
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function h(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function save149() {
    try {
      if (typeof speichern === "function") speichern();
      else localStorage.setItem("rezepte", JSON.stringify(rezepte));
      if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle();
      if (typeof dashboardAktualisieren === "function") dashboardAktualisieren();
    } catch (e) {
      console.warn("Speichern 1.49 fehlgeschlagen:", e);
    }
  }

  function setVal(id, value) {
    const el = $(id);
    if (el) el.value = value == null ? "" : String(value);
  }

  function num(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function fmt(value) {
    const n = Number(value);
    if (!isFinite(n)) return "";
    if (Math.abs(n) < 1) return Number(n.toFixed(2)).toString().replace(".", ",");
    if (Math.abs(n) < 10) return Number(n.toFixed(1)).toString().replace(".", ",");
    return Number(n.toFixed(0)).toString().replace(".", ",");
  }

  function lines(text) {
    return String(text || "").split(/\r?\n/);
  }

  function cleanLines(text) {
    return lines(text).map(x => x.trim());
  }

  function label(text, labels) {
    const wanted = labels.map(x => x.toLowerCase());
    for (const line of cleanLines(text)) {
      const lower = line.toLowerCase();
      for (const w of wanted) {
        if (lower.startsWith(w + ":")) return line.split(":").slice(1).join(":").trim();
      }
    }
    return "";
  }

  function section(text, starts, stops) {
    const l = lines(text);
    let start = -1;
    for (let i = 0; i < l.length; i++) {
      const low = l[i].trim().toLowerCase();
      if (starts.some(s => low.startsWith(s.toLowerCase()))) {
        start = i;
        break;
      }
    }
    if (start < 0) return "";

    const out = [];
    for (let i = start + 1; i < l.length; i++) {
      const low = l[i].trim().toLowerCase();
      if (stops.some(s => low.startsWith(s.toLowerCase()))) break;
      out.push(l[i]);
    }
    return out.join("\n").trim();
  }

  function tagsFromText(text) {
    const out = [];
    const raw = label(text, ["tags", "tag", "schlagworte"]);
    if (raw) raw.split(/[,;#]/).map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => out.push(t));
    String(text || "").split(/\s+/).forEach(p => {
      if (p.startsWith("#")) {
        const t = p.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (t) out.push(t);
      }
    });
    return [...new Set(out)];
  }

  function nutritionFromText(text) {
    function v(labels) {
      for (const l of labels) {
        const raw = label(text, [l]);
        if (raw) return num(raw);
      }
      return "";
    }
    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function ingredientGroupsFromText(text) {
    const block = section(text, ["zutaten:"], [
      "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);
    if (!block) return [];

    const groups = [];
    let group = { name: "Zutaten", zutaten: [] };

    function push() {
      if (group.zutaten.length) groups.push(group);
    }

    block.split(/\r?\n/).forEach(line => {
      let z = line.replace(/^[-*•]\s*/, "").trim();
      if (!z) return;

      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(z)) {
        push();
        group = { name: z.replace(":", "").trim() || "Zutaten", zutaten: [] };
        return;
      }

      const m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      group.zutaten.push(m
        ? { menge: m[1] || "", einheit: m[2] || "", name: m[3] || z }
        : { menge: "", einheit: "", name: z }
      );
    });

    push();
    return groups;
  }

  function preparationFromText(text) {
    return section(text, ["zubereitung:", "anleitung:", "schritte:"], [
      "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ])
      .split(/\r?\n/)
      .map(x => x.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensilsFromText(text) {
    const direct = label(text, ["utensilien", "besondere utensilien"]);
    if (direct) return direct;
    return section(text, ["utensilien:"], [
      "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ])
      .split(/\r?\n|,/)
      .map(x => x.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .join(", ");
  }

  function textImport() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function addIngredientRow(rows, z) {
    const row = document.createElement("div");
    row.className = "zutaten-zeile";
    row.innerHTML = `
      <input class="zutat-menge" placeholder="Menge" value="${h(z.menge || "")}">
      <select class="zutat-einheit">
        ${["", "mg", "g", "dag", "kg", "ml", "l", "TL", "EL", "Stk.", "Prise", "Dose", "Bund", "Becher", "Tasse"].map(e =>
          `<option value="${h(e)}" ${String(e).toLowerCase() === String(z.einheit || "").toLowerCase() ? "selected" : ""}>${e || "Einheit"}</option>`
        ).join("")}
      </select>
      <input class="zutat-name" placeholder="Zutat" value="${h(z.name || "")}">
      <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    rows.appendChild(row);
  }

  function fillIngredients(groups) {
    const container = $("zutatenGruppen");
    if (!container) return false;
    container.innerHTML = "";
    if (!groups || !groups.length) return false;

    groups.forEach(g => {
      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" placeholder="Gruppe, z. B. Teig, Fülle, Glasur" value="${h(g.name || "Zutaten")}">
          <button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button>
        </div>
        <div class="zutaten-zeilen"></div>
        <button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>
      `;
      const rows = box.querySelector(".zutaten-zeilen");
      (g.zutaten || []).forEach(z => addIngredientRow(rows, z));
      container.appendChild(box);
    });
    return true;
  }

  window.rf149AssistentAnalysieren = function () {
    try {
      const text = textImport();
      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      const groups = ingredientGroupsFromText(text);
      const prep = preparationFromText(text);
      const utensils = utensilsFromText(text);
      const n = nutritionFromText(text);
      const tagList = tagsFromText(text);

      const first = cleanLines(text).filter(Boolean)[0] || "";

      setVal("nameInput", label(text, ["name"]) || first);
      setVal("kategorieInput", label(text, ["kategorie"]));
      setVal("portionenInput", num(label(text, ["portionen"])));
      setVal("schwierigkeitInput", label(text, ["schwierigkeit"]));
      setVal("zubereitungszeitInput", label(text, ["zubereitungszeit", "zeit"]));
      setVal("quelleInput", label(text, ["quelle"]) || "Nicht zugeordnet");
      setVal("tagsInput", tagList.join(", "));
      setVal("zubereitungInput", prep);
      setVal("utensilienInput", utensils);

      setVal("kalorienInput", n.kalorien);
      setVal("eiweissInput", n.eiweiss);
      setVal("kohlenhydrateInput", n.kohlenhydrate);
      setVal("fettInput", n.fett);
      setVal("zuckerInput", n.zucker);
      setVal("ballaststoffeInput", n.ballaststoffe);
      setVal("salzInput", n.salz);

      const okIngredients = fillIngredients(groups);

      const form = $("formularBereich");
      if (form) form.classList.remove("versteckt");

      const preview = $("assistentVorschau");
      if (preview) {
        const count = groups.reduce((sum, g) => sum + (g.zutaten || []).length, 0);
        preview.innerHTML = `
          <h3>Vorschau der übernommenen Daten</h3>
          <p><strong>Zutaten erkannt:</strong> ${count}</p>
          <p><strong>Zubereitung:</strong> ${prep ? "erkannt" : "nicht erkannt"}</p>
          <p><strong>Utensilien:</strong> ${h(utensils || "nicht erkannt")}</p>
        `;
      }

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(okIngredients && prep && utensils ? "Rezept vollständig analysiert." : "Rezept teilweise analysiert. Bitte prüfen.", !(okIngredients && prep));
      }

      return !!(okIngredients && prep);
    } catch (e) {
      console.error("rf149AssistentAnalysieren Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rf148AssistentAnalysieren = window.rf149AssistentAnalysieren;
  window.rf147AssistentAnalysieren = window.rf149AssistentAnalysieren;
  window.rf144AssistentAnalysieren = window.rf149AssistentAnalysieren;
  window.rezeptAnalysierenDirektFinal = window.rf149AssistentAnalysieren;
  window.rezeptAnalysierenDirekt = window.rf149AssistentAnalysieren;
  window.rezeptAssistentAnalysieren = window.rf149AssistentAnalysieren;

  function bindAssistant() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf149AssistentAnalysieren;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindAssistant);
  else bindAssistant();
  window.addEventListener("load", bindAssistant);

  function groupsOf(recipe) {
    return recipe.zutatenGruppen || [{ name: "Zutaten", zutaten: recipe.zutaten || [] }];
  }

  function allIngredients(recipe) {
    return groupsOf(recipe).flatMap(g => (g.zutaten || []).map(z => ({ ...z, gruppe: g.name || "Zutaten" })));
  }

  function ingredientText(z) {
    return [z.menge || "", z.einheit || "", z.name || ""].filter(Boolean).join(" ");
  }

  function utensilsList(recipe) {
    return Array.isArray(recipe.utensilien)
      ? recipe.utensilien
      : String(recipe.utensilien || "").split(",").map(x => x.trim()).filter(Boolean);
  }

  function stepsOf(recipe) {
    const raw = String(recipe.zubereitung || "").trim();
    if (!raw) return [];
    const lineSteps = raw.split(/\r?\n/).map(x => x.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
    if (lineSteps.length > 1) return lineSteps;
    return raw.split(/(?<=[.!?])\s+/).map(x => x.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
  }

  function stepMatches(step, name) {
    const s = String(step || "").toLowerCase();
    const n = String(name || "").toLowerCase();
    if (!n) return false;
    if (s.includes(n)) return true;
    return n.split(/\s+/).filter(p => p.length > 3).some(p => s.includes(p));
  }

  const cookState = {};

  function renderCook(index) {
    const recipe = rezepte[index];
    const box = $(`kochmodus-${index}`);
    if (!recipe || !box) return;

    const steps = stepsOf(recipe);
    const current = cookState[index] || 0;
    const step = steps[current] || "";

    const allZ = allIngredients(recipe);
    const z = allZ.filter(item => stepMatches(step, item.name));
    const showZ = z.length ? z : allZ;

    const allU = utensilsList(recipe);
    const u = allU.filter(item => stepMatches(step, item));
    const showU = u.length ? u : allU;

    box.innerHTML = `
      <div class="kochkarte">
        <p><strong>Schritt ${current + 1} von ${steps.length}</strong></p>
        <p>${h(step)}</p>
        <h4>Benötigte Zutaten</h4>
        <ul>${showZ.map(item => `<li>${h(ingredientText(item))}</li>`).join("") || "<li>Keine Zutaten erkannt</li>"}</ul>
        <h4>Benötigte Utensilien</h4>
        <ul>${showU.map(item => `<li>${h(item)}</li>`).join("") || "<li>Keine Utensilien eingetragen</li>"}</ul>
        <div class="button-gruppe">
          <button type="button" onclick="kochmodusZurueck(${index})" ${current === 0 ? "disabled" : ""}>Zurück</button>
          <button type="button" onclick="kochmodusWeiter(${index})" ${current === steps.length - 1 ? "disabled" : ""}>Weiter</button>
        </div>
      </div>
    `;
  }

  window.kochmodusStarten = function (index) {
    const recipe = rezepte[index];
    const box = $(`kochmodus-${index}`);
    if (!recipe || !box) return;
    const steps = stepsOf(recipe);
    if (!steps.length) {
      box.innerHTML = "<p>Keine Zubereitungsschritte vorhanden.</p>";
      return;
    }
    cookState[index] = 0;
    renderCook(index);
  };

  window.kochmodusStarten146 = window.kochmodusStarten;

  window.kochmodusWeiter = function (index) {
    const steps = stepsOf(rezepte[index] || {});
    cookState[index] = Math.min((cookState[index] || 0) + 1, Math.max(steps.length - 1, 0));
    renderCook(index);
  };
  window.kochmodusWeiter146 = window.kochmodusWeiter;

  window.kochmodusZurueck = function (index) {
    cookState[index] = Math.max((cookState[index] || 0) - 1, 0);
    renderCook(index);
  };
  window.kochmodusZurueck146 = window.kochmodusZurueck;

  function shoppingSelectionHtml(recipe, index) {
    return groupsOf(recipe).map((g, gi) => `
      <div class="einkauf-auswahl-gruppe">
        <strong>${h(g.name || "Zutaten")}</strong>
        ${(g.zutaten || []).map((z, zi) => `
          <label class="einkauf-auswahl-item">
            <input type="checkbox" class="einkauf-zutat-${index}" data-gruppe="${gi}" data-zutat="${zi}">
            ${h(ingredientText(z))}
          </label>
        `).join("")}
      </div>
    `).join("");
  }

  window.einkaufsAuswahlHtml = function (recipe) {
    const index = typeof recipe.index === "number" ? recipe.index : rezepte.indexOf(recipe);
    return shoppingSelectionHtml(recipe, index >= 0 ? index : 0);
  };
  window.einkaufsAuswahlHtml148 = shoppingSelectionHtml;

  window.rezeptZurEinkaufsliste = function (index, modus) {
    const recipe = rezepte[index];
    if (!recipe) return;

    let add = [];

    if (modus === "auswahl") {
      const selected = Array.from(document.querySelectorAll(`.einkauf-zutat-${index}:checked`));
      selected.forEach(cb => {
        const gi = Number(cb.dataset.gruppe);
        const zi = Number(cb.dataset.zutat);
        const z = groupsOf(recipe)[gi]?.zutaten?.[zi];
        if (z) add.push(z);
      });

      if (!add.length) {
        alert("Bitte mindestens eine Zutat auswählen.");
        return;
      }
    } else {
      add = allIngredients(recipe);
    }

    const current = typeof datenLaden === "function" ? datenLaden("einkaufsliste", []) : JSON.parse(localStorage.getItem("einkaufsliste") || "[]");
    const neu = current.concat(add);
    if (typeof datenSpeichern === "function") datenSpeichern("einkaufsliste", neu);
    else localStorage.setItem("einkaufsliste", JSON.stringify(neu));

    if (typeof meldungAnzeigen === "function") meldungAnzeigen(`${add.length} Zutat(en) zur Einkaufsliste hinzugefügt.`);
  };

  function stars(index, rating) {
    let html = `<div class="bewertung"><strong>Bewertung:</strong> `;
    for (let i = 1; i <= 5; i++) {
      html += `<button type="button" class="stern-button ${i <= Number(rating || 0) ? "aktiv" : ""}" onclick="bewertungSetzen(${index}, ${i})">${i <= Number(rating || 0) ? "★" : "☆"}</button>`;
    }
    return html + `</div>`;
  }

  window.bewertungSetzen = function (index, rating) {
    if (!rezepte[index]) return;
    rezepte[index].bewertung = Number(rating || 0);
    save149();
    window.rezeptAnzeigenDirekt149(index);
  };

  window.favoritUmschalten = function (index) {
    if (!rezepte[index]) return;
    rezepte[index].favorit = !rezepte[index].favorit;
    save149();
    window.rezeptAnzeigenDirekt149(index);
  };

  function nutritionCalculatorHtml(recipe, index) {
    return `
      <section class="rechner-box">
        <h3>Nährwertrechner</h3>
        <input type="number" min="1" id="naehrwertGramm-${index}" placeholder="gegessene Gramm">
        <button type="button" onclick="naehrwerteBerechnen149(${index})">Nährwerte berechnen</button>
        <div id="naehrwertErgebnis-${index}" class="rechner-ergebnis"></div>
      </section>
    `;
  }

  window.naehrwerteBerechnen149 = function (index) {
    const recipe = rezepte[index];
    const out = $(`naehrwertErgebnis-${index}`);
    const grams = Number(String($(`naehrwertGramm-${index}`)?.value || "").replace(",", "."));
    if (!recipe || !out) return;
    if (!grams) {
      out.innerHTML = "<p>Bitte Gramm eingeben.</p>";
      return;
    }
    const n = recipe.naehrwerte || {};
    const factor = grams / 100;
    const rows = [
      ["Kalorien", n.kalorien, "kcal"],
      ["Eiweiß", n.eiweiss, "g"],
      ["Kohlenhydrate", n.kohlenhydrate, "g"],
      ["Fett", n.fett, "g"],
      ["Zucker", n.zucker, "g"],
      ["Ballaststoffe", n.ballaststoffe, "g"],
      ["Salz", n.salz, "g"]
    ].filter(r => Number(r[1]) > 0);
    out.innerHTML = rows.length
      ? `<ul>${rows.map(r => `<li><strong>${h(r[0])}:</strong> ${fmt(Number(r[1]) * factor)} ${r[2]}</li>`).join("")}</ul>`
      : "<p>Keine Nährwerte eingetragen.</p>";
  };

  window.portionenBerechnen149 = function (index) {
    const recipe = rezepte[index];
    const out = $(`portionenErgebnis-${index}`);
    const target = Number(String($(`zielPortionen-${index}`)?.value || "").replace(",", "."));
    if (!recipe || !out) return;
    if (!target || !recipe.portionen) {
      out.innerHTML = "<p>Bitte gültige Portionen eingeben.</p>";
      return;
    }
    const factor = target / Number(recipe.portionen);
    out.innerHTML = groupsOf(recipe).map(g => `
      <h4>${h(g.name || "Zutaten")}</h4>
      <ul>${(g.zutaten || []).map(z => {
        const m = Number(String(z.menge || "").replace(",", "."));
        const menge = m ? fmt(m * factor) : "";
        return `<li>${h([menge, z.einheit || "", z.name || ""].filter(Boolean).join(" "))}</li>`;
      }).join("")}</ul>
    `).join("");
  };

  function detailHtml(recipe, index) {
    const steps = stepsOf(recipe);
    const status = recipe.ausprobiert ? "Schon ausprobiert" : "Noch nicht ausprobiert";
    const statusClass = recipe.ausprobiert ? "status-ja" : "status-nein";
    return `
      <article class="rezept-detail box rezept-detail-modern">
        <button type="button" onclick="alleRezepteToggle()">← Zurück</button>
        <h2>${h(recipe.name || "Unbenanntes Rezept")}</h2>

        <div class="detail-meta-grid">
          <div><strong>Kategorie</strong><span>${h(recipe.kategorie || "Nicht zugeordnet")}</span></div>
          <div><strong>Portionen</strong><span>${h(recipe.portionen || "")}</span></div>
          <div><strong>Zeit</strong><span>${h(recipe.zubereitungszeit || "")}</span></div>
          <div><strong>Status</strong><span class="rezept-ausprobiert ${statusClass}">${status}</span></div>
        </div>

        <button type="button" onclick="favoritUmschalten(${index})">${recipe.favorit ? "Favorit entfernen" : "Als Favorit speichern"}</button>
        ${stars(index, recipe.bewertung || 0)}

        <h3>Zutaten</h3>
        ${groupsOf(recipe).map(g => `
          <h4>${h(g.name || "Zutaten")}</h4>
          <ul>${(g.zutaten || []).map(z => `<li>${h(ingredientText(z))}</li>`).join("")}</ul>
        `).join("")}

        <section class="rechner-box">
          <h3>Portionenrechner</h3>
          <input type="number" min="1" id="zielPortionen-${index}" placeholder="Gewünschte Portionen">
          <button type="button" onclick="portionenBerechnen149(${index})">Portionen berechnen</button>
          <div id="portionenErgebnis-${index}" class="rechner-ergebnis"></div>
        </section>

        ${nutritionCalculatorHtml(recipe, index)}

        <h3>Zubereitung</h3>
        <ol class="zubereitung-nummeriert">${steps.map(s => `<li>${h(s)}</li>`).join("")}</ol>

        <section class="kochmodus-box">
          <h3>Kochmodus</h3>
          <button type="button" onclick="kochmodusStarten(${index})">Kochmodus starten</button>
          <div id="kochmodus-${index}" class="kochmodus"></div>
        </section>

        <section class="einkauf-detail-box">
          <h3>Zur Einkaufsliste</h3>
          <button type="button" onclick="rezeptZurEinkaufsliste(${index}, 'alle')">Alle Zutaten hinzufügen</button>
          <details>
            <summary>Einzelne Zutaten auswählen</summary>
            ${shoppingSelectionHtml(recipe, index)}
            <button type="button" onclick="rezeptZurEinkaufsliste(${index}, 'auswahl')">Ausgewählte Zutaten hinzufügen</button>
          </details>
        </section>
      </article>
    `;
  }

  window.rezeptAnzeigenDirekt149 = function (index) {
    const out = $("ergebnisse");
    const recipe = rezepte[index];
    if (!out || !recipe) return;
    out.innerHTML = detailHtml(recipe, index);
  };
  window.rezeptAnzeigenDirekt146 = window.rezeptAnzeigenDirekt149;
  window.rezeptAnzeigenDirekt142 = window.rezeptAnzeigenDirekt149;

  // Wichtiger Punkt: alte Originalkarten nutzen rezeptAufklappen + bereits vorhandenes HTML.
  // Deshalb ersetzen wir auch zeigeErgebnisse komplett.
  window.zeigeErgebnisse = function (liste) {
    const out = $("ergebnisse");
    if (!out) return;
    const data = Array.isArray(liste) ? liste : [];
    if (!data.length) {
      out.innerHTML = `<div class="box"><p>Keine Rezepte gefunden.</p></div>`;
      return;
    }
    out.innerHTML = data.map((r, pos) => {
      const index = typeof r.index === "number" ? r.index : rezepte.indexOf(r);
      const i = index >= 0 ? index : pos;
      return `
        <article class="rezept-karte">
          <h3>${h(r.name || "Unbenanntes Rezept")}</h3>
          <p><strong>Kategorie:</strong> ${h(r.kategorie || "Nicht zugeordnet")}</p>
          <p><strong>Quelle:</strong> ${h(r.quelle || "Nicht zugeordnet")}</p>
          <div class="button-gruppe">
            <button type="button" onclick="rezeptAnzeigenDirekt149(${i})">Rezept anzeigen</button>
            <button type="button" onclick="rezeptBearbeiten(${i})">Bearbeiten</button>
            <button type="button" onclick="rezeptLoeschen(${i})">Löschen</button>
          </div>
        </article>
      `;
    }).join("");
  };
  zeigeErgebnisse = window.zeigeErgebnisse;

})();



// =====================================================
// VERSION 1.50: Rezept-Assistent mit Vorschau + Übernehmen-Button
// Ablauf: Analysieren -> Vorschau -> Ins Formular übernehmen
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function esc150(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function set150(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function number150(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function lines150(text) {
    return String(text || "").split(/\r?\n/);
  }

  function cleanLines150(text) {
    return lines150(text).map(x => x.trim());
  }

  function label150(text, labels) {
    const wanted = labels.map(x => x.toLowerCase());
    for (const line of cleanLines150(text)) {
      const lower = line.toLowerCase();
      for (const label of wanted) {
        if (lower.startsWith(label + ":")) {
          return line.split(":").slice(1).join(":").trim();
        }
      }
    }
    return "";
  }

  function section150(text, starts, stops) {
    const l = lines150(text);
    let start = -1;

    for (let i = 0; i < l.length; i++) {
      const lower = l[i].trim().toLowerCase();
      if (starts.some(s => lower.startsWith(s.toLowerCase()))) {
        start = i;
        break;
      }
    }

    if (start < 0) return "";

    const out = [];
    for (let i = start + 1; i < l.length; i++) {
      const lower = l[i].trim().toLowerCase();
      if (stops.some(s => lower.startsWith(s.toLowerCase()))) break;
      out.push(l[i]);
    }

    return out.join("\n").trim();
  }

  function firstLine150(text) {
    return cleanLines150(text).filter(Boolean)[0] || "";
  }

  function tags150(text) {
    const out = [];
    const raw = label150(text, ["tags", "tag", "schlagworte"]);
    if (raw) {
      raw.split(/[,;#]/)
        .map(x => x.trim().toLowerCase())
        .filter(Boolean)
        .forEach(x => out.push(x));
    }

    String(text || "").split(/\s+/).forEach(part => {
      if (part.startsWith("#")) {
        const tag = part.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (tag) out.push(tag);
      }
    });

    return [...new Set(out)];
  }

  function nutrition150(text) {
    function v(labels) {
      for (const l of labels) {
        const raw = label150(text, [l]);
        if (raw) return number150(raw);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function ingredients150(text) {
    const block = section150(text, ["zutaten:"], [
      "zubereitung:", "anleitung:", "schritte:", "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ]);

    if (!block) return [];

    const groups = [];
    let group = { name: "Zutaten", zutaten: [] };

    function push() {
      if (group.zutaten.length) groups.push(group);
    }

    block.split(/\r?\n/).forEach(line => {
      let z = line.replace(/^[-*•]\s*/, "").trim();
      if (!z) return;

      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(z)) {
        push();
        group = { name: z.replace(":", "").trim() || "Zutaten", zutaten: [] };
        return;
      }

      const m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l)?\s+(.+)$/);
      if (m) {
        group.zutaten.push({
          menge: m[1] || "",
          einheit: m[2] || "",
          name: m[3] || z
        });
      } else {
        group.zutaten.push({ menge: "", einheit: "", name: z });
      }
    });

    push();
    return groups;
  }

  function preparation150(text) {
    return section150(text, ["zubereitung:", "anleitung:", "schritte:"], [
      "utensilien:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ])
      .split(/\r?\n/)
      .map(x => x.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensils150(text) {
    const direct = label150(text, ["utensilien", "besondere utensilien"]);
    if (direct) return direct;

    return section150(text, ["utensilien:"], [
      "zubereitung:", "zutaten:", "nährwerte", "naehrwerte", "tags:", "quelle:", "notizen:"
    ])
      .split(/\r?\n|,/)
      .map(x => x.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .join(", ");
  }

  function importText150() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function row150(rows, z) {
    const row = document.createElement("div");
    row.className = "zutaten-zeile";
    row.innerHTML = `
      <input class="zutat-menge" placeholder="Menge" value="${esc150(z.menge || "")}">
      <select class="zutat-einheit">
        ${["", "mg", "g", "dag", "kg", "ml", "l", "TL", "EL", "Stk.", "Prise", "Dose", "Bund", "Becher", "Tasse"].map(e =>
          `<option value="${esc150(e)}" ${String(e).toLowerCase() === String(z.einheit || "").toLowerCase() ? "selected" : ""}>${e || "Einheit"}</option>`
        ).join("")}
      </select>
      <input class="zutat-name" placeholder="Zutat" value="${esc150(z.name || "")}">
      <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    rows.appendChild(row);
  }

  function fillIngredients150(groups) {
    const container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    if (!groups || !groups.length) return false;

    groups.forEach(group => {
      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" placeholder="Gruppe, z. B. Teig, Fülle, Glasur" value="${esc150(group.name || "Zutaten")}">
          <button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button>
        </div>
        <div class="zutaten-zeilen"></div>
        <button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>
      `;
      const rows = box.querySelector(".zutaten-zeilen");
      (group.zutaten || []).forEach(z => row150(rows, z));
      container.appendChild(box);
    });

    return true;
  }

  function parse150(text) {
    const n = nutrition150(text);
    const groups = ingredients150(text);
    const prep = preparation150(text);
    const utensils = utensils150(text);
    const tagList = tags150(text);
    const first = firstLine150(text);

    return {
      name: label150(text, ["name"]) || first,
      kategorie: label150(text, ["kategorie"]),
      portionen: number150(label150(text, ["portionen"])),
      schwierigkeit: label150(text, ["schwierigkeit"]),
      zeit: label150(text, ["zubereitungszeit", "zeit"]),
      quelle: label150(text, ["quelle"]) || "Nicht zugeordnet",
      tags: tagList,
      naehrwerte: n,
      zutatenGruppen: groups,
      zubereitung: prep,
      utensilien: utensils
    };
  }

  function countIngredients150(groups) {
    return (groups || []).reduce((sum, g) => sum + (g.zutaten || []).length, 0);
  }

  function preview150(data) {
    const box = $("assistentVorschau");
    if (!box) return;

    box.innerHTML = `
      <h3>Vorschau</h3>
      <div class="assistent-preview-grid">
        <p><strong>Name:</strong> ${esc150(data.name || "nicht erkannt")}</p>
        <p><strong>Kategorie:</strong> ${esc150(data.kategorie || "nicht erkannt")}</p>
        <p><strong>Portionen:</strong> ${esc150(data.portionen || "nicht erkannt")}</p>
        <p><strong>Schwierigkeit:</strong> ${esc150(data.schwierigkeit || "nicht erkannt")}</p>
        <p><strong>Zeit:</strong> ${esc150(data.zeit || "nicht erkannt")}</p>
        <p><strong>Quelle:</strong> ${esc150(data.quelle || "Nicht zugeordnet")}</p>
        <p><strong>Tags:</strong> ${esc150((data.tags || []).join(", ") || "keine Tags erkannt")}</p>
        <p><strong>Zutaten erkannt:</strong> ${countIngredients150(data.zutatenGruppen)}</p>
        <p><strong>Zubereitung:</strong> ${data.zubereitung ? "erkannt" : "nicht erkannt"}</p>
        <p><strong>Utensilien:</strong> ${esc150(data.utensilien || "nicht erkannt")}</p>
      </div>

      <h4>Zutaten-Vorschau</h4>
      ${(data.zutatenGruppen || []).map(g => `
        <div class="assistent-preview-group">
          <strong>${esc150(g.name || "Zutaten")}</strong>
          <ul>${(g.zutaten || []).map(z => `<li>${esc150([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>
        </div>
      `).join("") || "<p>Keine Zutaten erkannt.</p>"}

      <h4>Zubereitung-Vorschau</h4>
      <ol>
        ${(data.zubereitung || "").split(/\n/).filter(Boolean).map(s => `<li>${esc150(s)}</li>`).join("") || "<li>Keine Zubereitung erkannt.</li>"}
      </ol>

      <button type="button" class="primary-button" onclick="window.rf150AssistentInsFormular()">Ins Formular übernehmen</button>
    `;
  }

  window.rf150AssistentDaten = null;

  window.rf150AssistentVorschau = function () {
    try {
      const text = importText150();

      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      const data = parse150(text);
      window.rf150AssistentDaten = data;
      preview150(data);

      const ok = !!(countIngredients150(data.zutatenGruppen) && data.zubereitung);

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(ok ? "Vorschau erstellt. Bitte prüfen und dann ins Formular übernehmen." : "Vorschau erstellt, aber Zutaten oder Zubereitung wurden nicht vollständig erkannt.", !ok);
      }

      return ok;
    } catch (e) {
      console.error("rf150AssistentVorschau Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rf150AssistentInsFormular = function () {
    try {
      const data = window.rf150AssistentDaten;

      if (!data) {
        alert("Bitte zuerst Rezept analysieren.");
        return false;
      }

      set150("nameInput", data.name);
      set150("kategorieInput", data.kategorie);
      set150("portionenInput", data.portionen);
      set150("schwierigkeitInput", data.schwierigkeit);
      set150("zubereitungszeitInput", data.zeit);
      set150("quelleInput", data.quelle);
      set150("tagsInput", (data.tags || []).join(", "));
      set150("zubereitungInput", data.zubereitung);
      set150("utensilienInput", data.utensilien);

      const n = data.naehrwerte || {};
      set150("kalorienInput", n.kalorien);
      set150("eiweissInput", n.eiweiss);
      set150("kohlenhydrateInput", n.kohlenhydrate);
      set150("fettInput", n.fett);
      set150("zuckerInput", n.zucker);
      set150("ballaststoffeInput", n.ballaststoffe);
      set150("salzInput", n.salz);

      const okIngredients = fillIngredients150(data.zutatenGruppen);

      const form = $("formularBereich");
      if (form && form.classList) form.classList.remove("versteckt");

      if (form && form.scrollIntoView) {
        try { form.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { form.scrollIntoView(); }
      }

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(okIngredients && data.zubereitung ? "Rezept wurde ins Formular übernommen." : "Rezept wurde teilweise übernommen. Bitte prüfen.", !(okIngredients && data.zubereitung));
      }

      return !!(okIngredients && data.zubereitung);
    } catch (e) {
      console.error("rf150AssistentInsFormular Fehler:", e);
      alert("Rezept konnte nicht ins Formular übernommen werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  // Alte Namen auf neuen Ablauf legen: Button zeigt Vorschau, nicht direkt übernehmen.
  window.rf149AssistentAnalysieren = window.rf150AssistentVorschau;
  window.rf148AssistentAnalysieren = window.rf150AssistentVorschau;
  window.rf147AssistentAnalysieren = window.rf150AssistentVorschau;
  window.rf144AssistentAnalysieren = window.rf150AssistentVorschau;
  window.rezeptAnalysierenDirektFinal = window.rf150AssistentVorschau;
  window.rezeptAnalysierenDirekt = window.rf150AssistentVorschau;
  window.rezeptAssistentAnalysieren = window.rf150AssistentVorschau;

  function bind150() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf150AssistentVorschau;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind150);
  else bind150();

  window.addEventListener("load", bind150);
})();



// =====================================================
// VERSION 1.51: Rezept-Assistent robuster Parser
// Erkennt Überschriften mit UND ohne Doppelpunkt.
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function esc151(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function set151(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function number151(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function rawLines151(text) {
    return String(text || "").split(/\r?\n/);
  }

  function cleanLine151(line) {
    return String(line || "")
      .replace(/^\s*[-*•]\s*/, "")
      .trim();
  }

  function normalizeHeading151(line) {
    return cleanLine151(line)
      .replace(/:$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isHeading151(line, names) {
    const h = normalizeHeading151(line);
    return names.some(name => h === name.toLowerCase());
  }

  function label151(text, labels) {
    const wanted = labels.map(x => x.toLowerCase());
    for (const raw of rawLines151(text)) {
      const line = cleanLine151(raw);
      const lower = line.toLowerCase();
      for (const w of wanted) {
        if (lower.startsWith(w + ":")) {
          return line.split(":").slice(1).join(":").trim();
        }
      }
    }
    return "";
  }

  function firstNonEmpty151(text) {
    return rawLines151(text).map(cleanLine151).filter(Boolean)[0] || "";
  }

  function section151(text, startNames, stopNames) {
    const lines = rawLines151(text);
    let start = -1;

    for (let i = 0; i < lines.length; i++) {
      if (isHeading151(lines[i], startNames)) {
        start = i;
        break;
      }
    }

    if (start < 0) return "";

    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (isHeading151(lines[i], stopNames)) break;
      out.push(lines[i]);
    }

    return out.join("\n").trim();
  }

  function tags151(text) {
    const raw = label151(text, ["tags", "tag", "schlagworte"]);
    const out = [];

    if (raw) {
      raw.split(/[,;#]/).map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => out.push(t));
    }

    String(text || "").split(/\s+/).forEach(part => {
      if (part.startsWith("#")) {
        const tag = part.replace(/^#/, "").replace(/[^\wäöüÄÖÜß-]/g, "").toLowerCase();
        if (tag) out.push(tag);
      }
    });

    return [...new Set(out)];
  }

  function nutrition151(text) {
    function v(labels) {
      for (const l of labels) {
        const raw = label151(text, [l]);
        if (raw) return number151(raw);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function parseIngredient151(line) {
    const z = cleanLine151(line);
    if (!z) return null;

    const m = z.match(/^([\d,.\/]+)?\s*([A-Za-zÄÖÜäöüß.]+|Stk\.?|Stück|Prise|EL|TL|g|kg|mg|ml|l|Dose|Bund|Becher|Tasse)?\s+(.+)$/);

    if (m) {
      return {
        menge: m[1] || "",
        einheit: m[2] || "",
        name: m[3] || z
      };
    }

    return { menge: "", einheit: "", name: z };
  }

  function ingredients151(text) {
    const block = section151(text, ["zutaten", "zutatenliste", "ingredients"], [
      "zubereitung", "anleitung", "schritte", "zubereitungsschritte", "utensilien", "nährwerte", "naehrwerte", "tags", "quelle", "notizen"
    ]);

    if (!block) return [];

    const groups = [];
    let group = { name: "Zutaten", zutaten: [] };

    function push() {
      if (group.zutaten.length) groups.push(group);
    }

    rawLines151(block).forEach(raw => {
      const line = cleanLine151(raw);
      if (!line) return;

      // Gruppentitel wie "Teig:", "Fülle:", "Sauce:"; aber keine Mengenzeilen mit "g:"
      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(line) && !/^\d/.test(line)) {
        push();
        group = { name: line.replace(/:$/, "").trim() || "Zutaten", zutaten: [] };
        return;
      }

      const item = parseIngredient151(line);
      if (item) group.zutaten.push(item);
    });

    push();
    return groups;
  }

  function preparation151(text) {
    const block = section151(text, ["zubereitung", "anleitung", "schritte", "zubereitungsschritte"], [
      "utensilien", "nährwerte", "naehrwerte", "tags", "quelle", "notizen", "zutaten"
    ]);

    return rawLines151(block)
      .map(x => cleanLine151(x).replace(/^\d+[\.)]\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensils151(text) {
    const direct = label151(text, ["utensilien", "besondere utensilien"]);
    if (direct) return direct;

    const block = section151(text, ["utensilien", "equipment", "küchenutensilien"], [
      "zubereitung", "zutaten", "nährwerte", "naehrwerte", "tags", "quelle", "notizen"
    ]);

    return rawLines151(block)
      .flatMap(x => x.split(","))
      .map(cleanLine151)
      .filter(Boolean)
      .join(", ");
  }

  function importText151() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function addRow151(rows, z) {
    const row = document.createElement("div");
    row.className = "zutaten-zeile";
    row.innerHTML = `
      <input class="zutat-menge" placeholder="Menge" value="${esc151(z.menge || "")}">
      <select class="zutat-einheit">
        ${["", "mg", "g", "dag", "kg", "ml", "l", "TL", "EL", "Stk.", "Prise", "Dose", "Bund", "Becher", "Tasse"].map(e =>
          `<option value="${esc151(e)}" ${String(e).toLowerCase() === String(z.einheit || "").toLowerCase() ? "selected" : ""}>${e || "Einheit"}</option>`
        ).join("")}
      </select>
      <input class="zutat-name" placeholder="Zutat" value="${esc151(z.name || "")}">
      <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    rows.appendChild(row);
  }

  function fillIngredients151(groups) {
    const container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    if (!groups || !groups.length) return false;

    groups.forEach(group => {
      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" placeholder="Gruppe, z. B. Teig, Fülle, Glasur" value="${esc151(group.name || "Zutaten")}">
          <button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button>
        </div>
        <div class="zutaten-zeilen"></div>
        <button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>
      `;

      const rows = box.querySelector(".zutaten-zeilen");
      (group.zutaten || []).forEach(z => addRow151(rows, z));
      container.appendChild(box);
    });

    return true;
  }

  function parse151(text) {
    const n = nutrition151(text);
    const groups = ingredients151(text);
    const prep = preparation151(text);
    const utensils = utensils151(text);
    const tagList = tags151(text);

    return {
      name: label151(text, ["name"]) || firstNonEmpty151(text),
      kategorie: label151(text, ["kategorie"]),
      portionen: number151(label151(text, ["portionen"])),
      schwierigkeit: label151(text, ["schwierigkeit"]),
      zeit: label151(text, ["zubereitungszeit", "zeit"]),
      quelle: label151(text, ["quelle"]) || "Nicht zugeordnet",
      tags: tagList,
      naehrwerte: n,
      zutatenGruppen: groups,
      zubereitung: prep,
      utensilien: utensils
    };
  }

  function countIngredients151(groups) {
    return (groups || []).reduce((sum, g) => sum + (g.zutaten || []).length, 0);
  }

  function preview151(data) {
    const box = $("assistentVorschau");
    if (!box) return;

    box.innerHTML = `
      <h3>Vorschau</h3>
      <div class="assistent-preview-grid">
        <p><strong>Name:</strong> ${esc151(data.name || "nicht erkannt")}</p>
        <p><strong>Kategorie:</strong> ${esc151(data.kategorie || "nicht erkannt")}</p>
        <p><strong>Portionen:</strong> ${esc151(data.portionen || "nicht erkannt")}</p>
        <p><strong>Tags:</strong> ${esc151((data.tags || []).join(", ") || "keine Tags erkannt")}</p>
        <p><strong>Zutaten erkannt:</strong> ${countIngredients151(data.zutatenGruppen)}</p>
        <p><strong>Zubereitung:</strong> ${data.zubereitung ? "erkannt" : "nicht erkannt"}</p>
        <p><strong>Utensilien:</strong> ${esc151(data.utensilien || "nicht erkannt")}</p>
      </div>

      <h4>Zutaten-Vorschau</h4>
      ${(data.zutatenGruppen || []).map(g => `
        <div class="assistent-preview-group">
          <strong>${esc151(g.name || "Zutaten")}</strong>
          <ul>${(g.zutaten || []).map(z => `<li>${esc151([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>
        </div>
      `).join("") || "<p>Keine Zutaten erkannt.</p>"}

      <h4>Zubereitung-Vorschau</h4>
      <ol>
        ${(data.zubereitung || "").split(/\n/).filter(Boolean).map(s => `<li>${esc151(s)}</li>`).join("") || "<li>Keine Zubereitung erkannt.</li>"}
      </ol>

      <button type="button" class="primary-button" onclick="window.rf151AssistentInsFormular()">Ins Formular übernehmen</button>
    `;
  }

  window.rf151AssistentDaten = null;

  window.rf151AssistentVorschau = function () {
    try {
      const text = importText151();

      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      const data = parse151(text);
      window.rf151AssistentDaten = data;
      preview151(data);

      const ok = !!(countIngredients151(data.zutatenGruppen) && data.zubereitung);

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(ok ? "Vorschau erstellt. Bitte prüfen und dann ins Formular übernehmen." : "Vorschau erstellt, aber Zutaten oder Zubereitung wurden nicht vollständig erkannt.", !ok);
      }

      return ok;
    } catch (e) {
      console.error("rf151AssistentVorschau Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rf151AssistentInsFormular = function () {
    try {
      const data = window.rf151AssistentDaten;

      if (!data) {
        alert("Bitte zuerst Rezept analysieren.");
        return false;
      }

      set151("nameInput", data.name);
      set151("kategorieInput", data.kategorie);
      set151("portionenInput", data.portionen);
      set151("schwierigkeitInput", data.schwierigkeit);
      set151("zubereitungszeitInput", data.zeit);
      set151("quelleInput", data.quelle);
      set151("tagsInput", (data.tags || []).join(", "));
      set151("zubereitungInput", data.zubereitung);
      set151("utensilienInput", data.utensilien);

      const n = data.naehrwerte || {};
      set151("kalorienInput", n.kalorien);
      set151("eiweissInput", n.eiweiss);
      set151("kohlenhydrateInput", n.kohlenhydrate);
      set151("fettInput", n.fett);
      set151("zuckerInput", n.zucker);
      set151("ballaststoffeInput", n.ballaststoffe);
      set151("salzInput", n.salz);

      const okIngredients = fillIngredients151(data.zutatenGruppen);

      const form = $("formularBereich");
      if (form && form.classList) form.classList.remove("versteckt");

      if (form && form.scrollIntoView) {
        try { form.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { form.scrollIntoView(); }
      }

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(okIngredients && data.zubereitung ? "Rezept wurde ins Formular übernommen." : "Rezept wurde teilweise übernommen. Bitte prüfen.", !(okIngredients && data.zubereitung));
      }

      return !!(okIngredients && data.zubereitung);
    } catch (e) {
      console.error("rf151AssistentInsFormular Fehler:", e);
      alert("Rezept konnte nicht ins Formular übernommen werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  // alle alten Namen auf den neuen Vorschau-Ablauf legen
  window.rf150AssistentVorschau = window.rf151AssistentVorschau;
  window.rf150AssistentInsFormular = window.rf151AssistentInsFormular;
  window.rf149AssistentAnalysieren = window.rf151AssistentVorschau;
  window.rf148AssistentAnalysieren = window.rf151AssistentVorschau;
  window.rf147AssistentAnalysieren = window.rf151AssistentVorschau;
  window.rf144AssistentAnalysieren = window.rf151AssistentVorschau;
  window.rezeptAnalysierenDirektFinal = window.rf151AssistentVorschau;
  window.rezeptAnalysierenDirekt = window.rf151AssistentVorschau;
  window.rezeptAssistentAnalysieren = window.rf151AssistentVorschau;

  function bind151() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf151AssistentVorschau;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind151);
  else bind151();
  window.addEventListener("load", bind151);
})();



// =====================================================
// VERSION 1.52: Rezept-Assistent exakt für kopierte Texte aus Notizen/GoodNotes
// Erkennt Abschnitte mit Bulletpoints, Tabs und Überschriften ohne Doppelpunkt.
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function esc152(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function set152(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function normalizeText152(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/\t/g, "    ");
  }

  function stripBullet152(line) {
    return String(line || "")
      .replace(/^\s*[•●▪▫◦‣⁃*-]\s*/u, "")
      .replace(/^\s*\d+[\.)]\s*/, "")
      .trim();
  }

  function cleanLine152(line) {
    return stripBullet152(line).trim();
  }

  function lines152(text) {
    return normalizeText152(text).split("\n");
  }

  function headingKey152(line) {
    return cleanLine152(line)
      .replace(/:$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isHeading152(line, headings) {
    const key = headingKey152(line);
    return headings.some(h => key === h.toLowerCase());
  }

  function label152(text, labels) {
    for (const raw of lines152(text)) {
      const line = cleanLine152(raw);
      const lower = line.toLowerCase();
      for (const label of labels) {
        const l = label.toLowerCase();
        if (lower.startsWith(l + ":")) {
          return line.split(":").slice(1).join(":").trim();
        }
      }
    }
    return "";
  }

  function firstTitle152(text) {
    const blocked = new Set(["zutaten", "utensilien", "zubereitung", "quelle", "tags", "nährwerte", "naehrwerte"]);
    for (const raw of lines152(text)) {
      const line = cleanLine152(raw);
      if (!line) continue;
      const key = headingKey152(line);
      if (blocked.has(key)) continue;
      if (line.includes(":")) continue;
      return line;
    }
    return "";
  }

  function section152(text, startHeadings, stopHeadings) {
    const lines = lines152(text);
    let start = -1;

    for (let i = 0; i < lines.length; i++) {
      if (isHeading152(lines[i], startHeadings)) {
        start = i;
        break;
      }
    }

    if (start < 0) return "";

    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (isHeading152(lines[i], stopHeadings)) break;
      out.push(lines[i]);
    }

    return out.join("\n").trim();
  }

  function number152(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function parseIngredientLine152(line) {
    const cleaned = cleanLine152(line);
    if (!cleaned) return null;

    // Beispiele:
    // 400 g Hüftsteak oder Filet vom Rind
    // 2 Rosmarinzweige
    // Salz und Pfeffer
    // Olivenöl
    // 1 Handvoll Salatblätter
    // 3 EL Dijonsenf
    const m = cleaned.match(/^([\d]+(?:[,.]\d+)?|[\d]+\/[\d]+)?\s*(mg|g|dag|kg|ml|l|TL|EL|Stk\.?|Stück|Prise|Dose|Bund|Becher|Tasse|Handvoll|Zweig|Zweige|Blatt|Scheibe|Packung|Pck\.?)?\s*(.+)$/i);

    if (!m) return { menge: "", einheit: "", name: cleaned };

    const menge = m[1] || "";
    const einheit = m[2] || "";
    const name = (m[3] || "").trim();

    if (!name && !menge && !einheit) return null;

    return { menge, einheit, name: name || cleaned };
  }

  function ingredients152(text) {
    const block = section152(text, ["zutaten", "zutatenliste", "ingredients"], [
      "utensilien", "küchenutensilien", "equipment", "zubereitung", "anleitung", "schritte", "zubereitungsschritte", "nährwerte", "naehrwerte", "tags", "quelle", "notizen"
    ]);

    if (!block) return [];

    const group = { name: "Zutaten", zutaten: [] };
    const groups = [group];

    for (const raw of lines152(block)) {
      const line = cleanLine152(raw);
      if (!line) continue;

      // Untergruppe wie "Marinade:" nur dann als Gruppe, wenn nicht wie eine Zutat aussieht.
      if (/^[A-Za-zÄÖÜäöüß ]+:$/.test(line) && !/^\d/.test(line)) {
        const newGroup = { name: line.replace(/:$/, "").trim(), zutaten: [] };
        groups.push(newGroup);
        continue;
      }

      const item = parseIngredientLine152(line);
      if (item) groups[groups.length - 1].zutaten.push(item);
    }

    return groups.filter(g => g.zutaten.length);
  }

  function preparation152(text) {
    const block = section152(text, ["zubereitung", "anleitung", "schritte", "zubereitungsschritte"], [
      "utensilien", "zutaten", "nährwerte", "naehrwerte", "tags", "quelle", "notizen"
    ]);

    return lines152(block)
      .map(line => stripBullet152(line).replace(/^\d+[\.)]\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensils152(text) {
    const direct = label152(text, ["utensilien", "küchenutensilien", "equipment"]);
    if (direct) return direct;

    const block = section152(text, ["utensilien", "küchenutensilien", "equipment"], [
      "zubereitung", "anleitung", "schritte", "zutaten", "nährwerte", "naehrwerte", "tags", "quelle", "notizen"
    ]);

    return lines152(block)
      .flatMap(line => cleanLine152(line).split(","))
      .map(x => x.trim())
      .filter(Boolean)
      .join(", ");
  }

  function tags152(text) {
    const raw = label152(text, ["tags", "tag", "schlagworte"]);
    const out = [];
    if (raw) {
      raw.split(/[,;#]/).map(x => x.trim().toLowerCase()).filter(Boolean).forEach(x => out.push(x));
    }
    return [...new Set(out)];
  }

  function nutrition152(text) {
    function v(labels) {
      for (const label of labels) {
        const raw = label152(text, [label]);
        if (raw) return number152(raw);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function importText152() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function row152(rows, z) {
    const row = document.createElement("div");
    row.className = "zutaten-zeile";
    row.innerHTML = `
      <input class="zutat-menge" placeholder="Menge" value="${esc152(z.menge || "")}">
      <select class="zutat-einheit">
        ${["", "mg", "g", "dag", "kg", "ml", "l", "TL", "EL", "Stk.", "Stück", "Prise", "Dose", "Bund", "Becher", "Tasse", "Handvoll", "Zweig", "Zweige"].map(e =>
          `<option value="${esc152(e)}" ${String(e).toLowerCase() === String(z.einheit || "").toLowerCase() ? "selected" : ""}>${e || "Einheit"}</option>`
        ).join("")}
      </select>
      <input class="zutat-name" placeholder="Zutat" value="${esc152(z.name || "")}">
      <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    rows.appendChild(row);
  }

  function fillIngredients152(groups) {
    const container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    if (!groups || !groups.length) return false;

    groups.forEach(group => {
      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" placeholder="Gruppe, z. B. Teig, Fülle, Glasur" value="${esc152(group.name || "Zutaten")}">
          <button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button>
        </div>
        <div class="zutaten-zeilen"></div>
        <button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>
      `;

      const rows = box.querySelector(".zutaten-zeilen");
      (group.zutaten || []).forEach(z => row152(rows, z));
      container.appendChild(box);
    });

    return true;
  }

  function parse152(text) {
    return {
      name: label152(text, ["name"]) || firstTitle152(text),
      kategorie: label152(text, ["kategorie"]),
      portionen: number152(label152(text, ["portionen"])),
      schwierigkeit: label152(text, ["schwierigkeit"]),
      zeit: label152(text, ["zubereitungszeit", "zeit"]),
      quelle: label152(text, ["quelle"]) || "Nicht zugeordnet",
      tags: tags152(text),
      naehrwerte: nutrition152(text),
      zutatenGruppen: ingredients152(text),
      zubereitung: preparation152(text),
      utensilien: utensils152(text)
    };
  }

  function countIngredients152(groups) {
    return (groups || []).reduce((sum, g) => sum + (g.zutaten || []).length, 0);
  }

  function preview152(data) {
    const box = $("assistentVorschau");
    if (!box) return;

    box.innerHTML = `
      <h3>Vorschau</h3>
      <div class="assistent-preview-grid">
        <p><strong>Name:</strong> ${esc152(data.name || "nicht erkannt")}</p>
        <p><strong>Kategorie:</strong> ${esc152(data.kategorie || "nicht erkannt")}</p>
        <p><strong>Portionen:</strong> ${esc152(data.portionen || "nicht erkannt")}</p>
        <p><strong>Quelle:</strong> ${esc152(data.quelle || "Nicht zugeordnet")}</p>
        <p><strong>Zutaten erkannt:</strong> ${countIngredients152(data.zutatenGruppen)}</p>
        <p><strong>Zubereitung:</strong> ${data.zubereitung ? "erkannt" : "nicht erkannt"}</p>
        <p><strong>Utensilien:</strong> ${esc152(data.utensilien || "nicht erkannt")}</p>
      </div>

      <h4>Zutaten-Vorschau</h4>
      ${(data.zutatenGruppen || []).map(g => `
        <div class="assistent-preview-group">
          <strong>${esc152(g.name || "Zutaten")}</strong>
          <ul>${(g.zutaten || []).map(z => `<li>${esc152([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>
        </div>
      `).join("") || "<p>Keine Zutaten erkannt.</p>"}

      <h4>Zubereitung-Vorschau</h4>
      <ol>${(data.zubereitung || "").split(/\n/).filter(Boolean).map(s => `<li>${esc152(s)}</li>`).join("") || "<li>Keine Zubereitung erkannt.</li>"}</ol>

      <button type="button" class="primary-button" onclick="window.rf152AssistentInsFormular()">Ins Formular übernehmen</button>
    `;
  }

  window.rf152AssistentDaten = null;

  window.rf152AssistentVorschau = function () {
    try {
      const text = importText152();
      if (!text.trim()) {
        alert("Bitte zuerst einen Rezepttext einfügen.");
        return false;
      }

      const data = parse152(text);
      window.rf152AssistentDaten = data;
      preview152(data);

      const ok = !!(countIngredients152(data.zutatenGruppen) && data.zubereitung && data.utensilien);
      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(ok ? "Vorschau erstellt. Bitte prüfen und dann ins Formular übernehmen." : "Vorschau erstellt, aber es wurde nicht alles erkannt.", !ok);
      }
      return ok;
    } catch (e) {
      console.error("rf152AssistentVorschau Fehler:", e);
      alert("Rezept konnte nicht analysiert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rf152AssistentInsFormular = function () {
    try {
      const data = window.rf152AssistentDaten;
      if (!data) {
        alert("Bitte zuerst Rezept analysieren.");
        return false;
      }

      set152("nameInput", data.name);
      set152("kategorieInput", data.kategorie);
      set152("portionenInput", data.portionen);
      set152("schwierigkeitInput", data.schwierigkeit);
      set152("zubereitungszeitInput", data.zeit);
      set152("quelleInput", data.quelle);
      set152("tagsInput", (data.tags || []).join(", "));
      set152("zubereitungInput", data.zubereitung);
      set152("utensilienInput", data.utensilien);

      const n = data.naehrwerte || {};
      set152("kalorienInput", n.kalorien);
      set152("eiweissInput", n.eiweiss);
      set152("kohlenhydrateInput", n.kohlenhydrate);
      set152("fettInput", n.fett);
      set152("zuckerInput", n.zucker);
      set152("ballaststoffeInput", n.ballaststoffe);
      set152("salzInput", n.salz);

      const okIngredients = fillIngredients152(data.zutatenGruppen);

      const form = $("formularBereich");
      if (form && form.classList) form.classList.remove("versteckt");

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen(okIngredients && data.zubereitung && data.utensilien ? "Rezept wurde ins Formular übernommen." : "Rezept wurde teilweise übernommen. Bitte prüfen.", !(okIngredients && data.zubereitung));
      }

      return !!(okIngredients && data.zubereitung);
    } catch (e) {
      console.error("rf152AssistentInsFormular Fehler:", e);
      alert("Rezept konnte nicht ins Formular übernommen werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  // alle alten Assistenten-Funktionen sicher auf v1.52 umbiegen
  window.rf151AssistentVorschau = window.rf152AssistentVorschau;
  window.rf151AssistentInsFormular = window.rf152AssistentInsFormular;
  window.rf150AssistentVorschau = window.rf152AssistentVorschau;
  window.rf150AssistentInsFormular = window.rf152AssistentInsFormular;
  window.rf149AssistentAnalysieren = window.rf152AssistentVorschau;
  window.rf148AssistentAnalysieren = window.rf152AssistentVorschau;
  window.rf147AssistentAnalysieren = window.rf152AssistentVorschau;
  window.rf144AssistentAnalysieren = window.rf152AssistentVorschau;
  window.rezeptAnalysierenDirektFinal = window.rf152AssistentVorschau;
  window.rezeptAnalysierenDirekt = window.rf152AssistentVorschau;
  window.rezeptAssistentAnalysieren = window.rf152AssistentVorschau;

  function bind152() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf152AssistentVorschau;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind152);
  else bind152();
  window.addEventListener("load", bind152);
})();



// =====================================================
// VERSION 1.53: Rezept-Assistent HARD-ROBUST
// Erkennt Abschnitte auch bei Tabs, Bulletpoints, Sonderzeichen,
// Überschriften mit/ohne Doppelpunkt und kopierten PDF/Notizen-Texten.
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function esc153(value) {
    if (typeof esc === "function") return esc(value);
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function set153(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value == null ? "" : String(value);
  }

  function normalizeText153(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\t/g, "    ");
  }

  function rawLines153(text) {
    return normalizeText153(text).split("\n");
  }

  function stripBullet153(line) {
    return String(line || "")
      .replace(/^[\s\u00a0]*[•●▪▫◦‣⁃∙·*-][\s\u00a0]*/u, "")
      .replace(/^[\s\u00a0]*\d+[\.)][\s\u00a0]*/, "")
      .trim();
  }

  function clean153(line) {
    return stripBullet153(line).trim();
  }

  function compact153(line) {
    return clean153(line)
      .replace(/[:：]+$/g, "")
      .replace(/[^\p{L}]/gu, "")
      .toLowerCase();
  }

  function isHeading153(line, kind) {
    const key = compact153(line);
    if (!key) return false;

    const map = {
      zutaten: ["zutaten", "zutatenliste", "ingredients", "ingredienten"],
      utensilien: ["utensilien", "küchenutensilien", "kuechenutensilien", "equipment", "werkzeug"],
      zubereitung: ["zubereitung", "anleitung", "schritte", "zubereitungsschritte", "zubereiten"],
      naehrwerte: ["nährwerte", "naehrwerte", "nährwert", "naehrwert", "nutrition"],
      tags: ["tags", "tag", "schlagworte"],
      quelle: ["quelle", "source"],
      notizen: ["notizen", "notiz", "notes"]
    };

    return (map[kind] || []).includes(key);
  }

  function sectionByScan153(text, startKind, stopKinds) {
    const lines = rawLines153(text);
    let start = -1;

    for (let i = 0; i < lines.length; i++) {
      if (isHeading153(lines[i], startKind)) {
        start = i;
        break;
      }
    }

    if (start < 0) return "";

    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (stopKinds.some(kind => isHeading153(lines[i], kind))) break;
      out.push(lines[i]);
    }

    return out.join("\n").trim();
  }

  function label153(text, labels) {
    const wanted = labels.map(x => x.toLowerCase());
    for (const raw of rawLines153(text)) {
      const line = clean153(raw);
      const lower = line.toLowerCase();
      for (const label of wanted) {
        if (lower.startsWith(label + ":") || lower.startsWith(label + "：")) {
          return line.split(/[:：]/).slice(1).join(":").trim();
        }
      }
    }
    return "";
  }

  function firstTitle153(text) {
    const blocked = ["zutaten", "utensilien", "zubereitung", "quelle", "tags", "nährwerte", "naehrwerte"];
    for (const raw of rawLines153(text)) {
      const line = clean153(raw);
      if (!line) continue;
      const key = compact153(line);
      if (blocked.some(b => key === compact153(b))) continue;
      if (line.includes(":") || line.includes("：")) continue;
      return line;
    }
    return "";
  }

  function number153(value) {
    const m = String(value == null ? "" : value).replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!m) return "";
    const n = Number(m[0]);
    return isFinite(n) ? String(n).replace(".", ",") : "";
  }

  function parseIngredient153(line) {
    const x = clean153(line);
    if (!x) return null;

    const m = x.match(/^(\d+(?:[,.]\d+)?|\d+\/\d+)?\s*(mg|g|dag|kg|ml|l|TL|EL|Stk\.?|Stück|Prise|Dose|Bund|Becher|Tasse|Handvoll|Zweig|Zweige|Blatt|Scheibe|Packung|Pck\.?)?\s*(.+)$/i);

    if (!m) return { menge: "", einheit: "", name: x };

    return {
      menge: m[1] || "",
      einheit: m[2] || "",
      name: (m[3] || x).trim()
    };
  }

  function ingredients153(text) {
    let block = sectionByScan153(text, "zutaten", ["utensilien", "zubereitung", "naehrwerte", "tags", "quelle", "notizen"]);

    if (!block) return [];

    const groups = [{ name: "Zutaten", zutaten: [] }];

    for (const raw of rawLines153(block)) {
      const line = clean153(raw);
      if (!line) continue;

      if (/^[A-Za-zÄÖÜäöüß ]+[:：]$/.test(line) && !/^\d/.test(line)) {
        groups.push({ name: line.replace(/[:：]$/, "").trim(), zutaten: [] });
        continue;
      }

      const item = parseIngredient153(line);
      if (item) groups[groups.length - 1].zutaten.push(item);
    }

    return groups.filter(g => g.zutaten.length);
  }

  function preparation153(text) {
    const block = sectionByScan153(text, "zubereitung", ["utensilien", "zutaten", "naehrwerte", "tags", "quelle", "notizen"]);

    return rawLines153(block)
      .map(line => stripBullet153(line).replace(/^\d+[\.)]\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function utensils153(text) {
    const direct = label153(text, ["utensilien", "küchenutensilien", "kuechenutensilien", "equipment"]);
    if (direct) return direct;

    const block = sectionByScan153(text, "utensilien", ["zubereitung", "zutaten", "naehrwerte", "tags", "quelle", "notizen"]);

    return rawLines153(block)
      .flatMap(line => clean153(line).split(","))
      .map(x => x.trim())
      .filter(Boolean)
      .join(", ");
  }

  function tags153(text) {
    const raw = label153(text, ["tags", "tag", "schlagworte"]);
    if (!raw) return [];
    return [...new Set(raw.split(/[,;#]/).map(x => x.trim().toLowerCase()).filter(Boolean))];
  }

  function nutrition153(text) {
    function v(labels) {
      for (const label of labels) {
        const raw = label153(text, [label]);
        if (raw) return number153(raw);
      }
      return "";
    }

    return {
      kalorien: v(["kalorien", "kcal", "energie"]),
      eiweiss: v(["eiweiß", "eiweiss", "protein"]),
      kohlenhydrate: v(["kohlenhydrate", "kh"]),
      fett: v(["fett"]),
      zucker: v(["zucker"]),
      ballaststoffe: v(["ballaststoffe"]),
      salz: v(["salz"])
    };
  }

  function importText153() {
    const ids = ["textImportInput", "rezeptAssistentText", "rezeptAssistentInput", "assistentText", "importText", "rezeptImportText"];
    for (const id of ids) {
      const el = $(id);
      if (el && String(el.value || "").trim()) return String(el.value || "");
    }
    const area = document.querySelector("textarea");
    return area ? String(area.value || "") : "";
  }

  function row153(rows, z) {
    const row = document.createElement("div");
    row.className = "zutaten-zeile";
    row.innerHTML = `
      <input class="zutat-menge" placeholder="Menge" value="${esc153(z.menge || "")}">
      <select class="zutat-einheit">
        ${["", "mg", "g", "dag", "kg", "ml", "l", "TL", "EL", "Stk.", "Stück", "Prise", "Dose", "Bund", "Becher", "Tasse", "Handvoll", "Zweig", "Zweige"].map(e =>
          `<option value="${esc153(e)}" ${String(e).toLowerCase() === String(z.einheit || "").toLowerCase() ? "selected" : ""}>${e || "Einheit"}</option>`
        ).join("")}
      </select>
      <input class="zutat-name" placeholder="Zutat" value="${esc153(z.name || "")}">
      <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    rows.appendChild(row);
  }

  function fillIngredients153(groups) {
    const container = $("zutatenGruppen");
    if (!container) return false;

    container.innerHTML = "";

    if (!groups || !groups.length) return false;

    groups.forEach(group => {
      const box = document.createElement("div");
      box.className = "zutatengruppe";
      box.innerHTML = `
        <div class="zutatengruppe-kopf">
          <input class="zutaten-gruppenname" value="${esc153(group.name || "Zutaten")}">
          <button type="button" onclick="this.closest('.zutatengruppe').remove()">Gruppe löschen</button>
        </div>
        <div class="zutaten-zeilen"></div>
        <button type="button" onclick="zutatenZeileHinzufuegen(this.closest('.zutatengruppe').querySelector('.zutaten-zeilen'))">Zutat hinzufügen</button>
      `;

      const rows = box.querySelector(".zutaten-zeilen");
      (group.zutaten || []).forEach(z => row153(rows, z));
      container.appendChild(box);
    });

    return true;
  }

  function parse153(text) {
    return {
      name: label153(text, ["name"]) || firstTitle153(text),
      kategorie: label153(text, ["kategorie"]),
      portionen: number153(label153(text, ["portionen"])),
      schwierigkeit: label153(text, ["schwierigkeit"]),
      zeit: label153(text, ["zubereitungszeit", "zeit"]),
      quelle: label153(text, ["quelle"]) || "Nicht zugeordnet",
      tags: tags153(text),
      naehrwerte: nutrition153(text),
      zutatenGruppen: ingredients153(text),
      zubereitung: preparation153(text),
      utensilien: utensils153(text)
    };
  }

  function countIngredients153(groups) {
    return (groups || []).reduce((sum, g) => sum + (g.zutaten || []).length, 0);
  }

  function preview153(data) {
    const box = $("assistentVorschau");
    if (!box) return;

    box.innerHTML = `
      <h3>Vorschau</h3>
      <div class="assistent-preview-grid">
        <p><strong>Name:</strong> ${esc153(data.name || "nicht erkannt")}</p>
        <p><strong>Quelle:</strong> ${esc153(data.quelle || "Nicht zugeordnet")}</p>
        <p><strong>Zutaten erkannt:</strong> ${countIngredients153(data.zutatenGruppen)}</p>
        <p><strong>Zubereitung:</strong> ${data.zubereitung ? "erkannt" : "nicht erkannt"}</p>
        <p><strong>Utensilien:</strong> ${esc153(data.utensilien || "nicht erkannt")}</p>
      </div>

      <h4>Zutaten-Vorschau</h4>
      ${(data.zutatenGruppen || []).map(g => `
        <div class="assistent-preview-group">
          <strong>${esc153(g.name || "Zutaten")}</strong>
          <ul>${(g.zutaten || []).map(z => `<li>${esc153([z.menge, z.einheit, z.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>
        </div>
      `).join("") || "<p>Keine Zutaten erkannt.</p>"}

      <h4>Zubereitung-Vorschau</h4>
      <ol>${(data.zubereitung || "").split(/\n/).filter(Boolean).map(s => `<li>${esc153(s)}</li>`).join("") || "<li>Keine Zubereitung erkannt.</li>"}</ol>

      <button type="button" class="primary-button" onclick="window.rf153AssistentInsFormular()">Ins Formular übernehmen</button>
    `;
  }

  window.rf153AssistentDaten = null;

  window.rf153AssistentVorschau = function () {
    const text = importText153();

    if (!text.trim()) {
      alert("Bitte zuerst einen Rezepttext einfügen.");
      return false;
    }

    const data = parse153(text);
    window.rf153AssistentDaten = data;
    preview153(data);

    const ok = !!(countIngredients153(data.zutatenGruppen) && data.zubereitung && data.utensilien);
    if (typeof meldungAnzeigen === "function") {
      meldungAnzeigen(ok ? "Vorschau erstellt. Bitte prüfen und dann ins Formular übernehmen." : "Vorschau erstellt, aber es wurde nicht alles erkannt.", !ok);
    }
    return ok;
  };

  window.rf153AssistentInsFormular = function () {
    const data = window.rf153AssistentDaten;

    if (!data) {
      alert("Bitte zuerst Rezept analysieren.");
      return false;
    }

    set153("nameInput", data.name);
    set153("kategorieInput", data.kategorie);
    set153("portionenInput", data.portionen);
    set153("schwierigkeitInput", data.schwierigkeit);
    set153("zubereitungszeitInput", data.zeit);
    set153("quelleInput", data.quelle);
    set153("tagsInput", (data.tags || []).join(", "));
    set153("zubereitungInput", data.zubereitung);
    set153("utensilienInput", data.utensilien);

    const n = data.naehrwerte || {};
    set153("kalorienInput", n.kalorien);
    set153("eiweissInput", n.eiweiss);
    set153("kohlenhydrateInput", n.kohlenhydrate);
    set153("fettInput", n.fett);
    set153("zuckerInput", n.zucker);
    set153("ballaststoffeInput", n.ballaststoffe);
    set153("salzInput", n.salz);

    const okIngredients = fillIngredients153(data.zutatenGruppen);

    const form = $("formularBereich");
    if (form && form.classList) form.classList.remove("versteckt");

    if (typeof meldungAnzeigen === "function") {
      meldungAnzeigen(okIngredients && data.zubereitung && data.utensilien ? "Rezept wurde ins Formular übernommen." : "Rezept wurde teilweise übernommen. Bitte prüfen.", !(okIngredients && data.zubereitung));
    }

    return !!(okIngredients && data.zubereitung);
  };

  // Alle alten Assistent-Funktionen auf v1.53 legen.
  window.rf152AssistentVorschau = window.rf153AssistentVorschau;
  window.rf152AssistentInsFormular = window.rf153AssistentInsFormular;
  window.rf151AssistentVorschau = window.rf153AssistentVorschau;
  window.rf151AssistentInsFormular = window.rf153AssistentInsFormular;
  window.rf150AssistentVorschau = window.rf153AssistentVorschau;
  window.rf150AssistentInsFormular = window.rf153AssistentInsFormular;
  window.rf149AssistentAnalysieren = window.rf153AssistentVorschau;
  window.rf148AssistentAnalysieren = window.rf153AssistentVorschau;
  window.rf147AssistentAnalysieren = window.rf153AssistentVorschau;
  window.rf144AssistentAnalysieren = window.rf153AssistentVorschau;
  window.rezeptAnalysierenDirektFinal = window.rf153AssistentVorschau;
  window.rezeptAnalysierenDirekt = window.rf153AssistentVorschau;
  window.rezeptAssistentAnalysieren = window.rf153AssistentVorschau;

  function bind153() {
    const b = $("rezeptAnalysierenButton");
    if (b) b.onclick = window.rf153AssistentVorschau;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind153);
  else bind153();
  window.addEventListener("load", bind153);
})();



// =====================================================
// VERSION 1.54: Rezept speichern FINAL FIX
// Speichert zuverlässig, Nebenfunktionen dürfen den Speichervorgang nicht abbrechen.
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function val(id) {
    const el = $(id);
    return el ? String(el.value || "").trim() : "";
  }

  function numOrText(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const n = Number(raw.replace(",", "."));
    return Number.isFinite(n) ? n : raw;
  }

  function parseTags154(raw) {
    return String(raw || "")
      .split(/[,;#]/)
      .map(x => x.trim().toLowerCase())
      .filter(Boolean)
      .filter((x, i, arr) => arr.indexOf(x) === i);
  }

  function parseUtensilien154(raw) {
    return String(raw || "")
      .split(/[,;\n]/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function readZutaten154() {
    const container = $("zutatenGruppen");
    if (!container) return [];

    const gruppen = [];
    const gruppenNodes = Array.from(container.querySelectorAll(".zutatengruppe"));

    gruppenNodes.forEach((gruppeNode, gi) => {
      const nameInput = gruppeNode.querySelector(".zutaten-gruppenname");
      const gruppenName = nameInput && nameInput.value.trim()
        ? nameInput.value.trim()
        : (gi === 0 ? "Zutaten" : "Gruppe " + (gi + 1));

      const zutaten = [];
      Array.from(gruppeNode.querySelectorAll(".zutaten-zeile")).forEach(row => {
        const mengeEl = row.querySelector(".zutat-menge");
        const einheitEl = row.querySelector(".zutat-einheit");
        const nameEl = row.querySelector(".zutat-name");

        const menge = mengeEl ? String(mengeEl.value || "").trim() : "";
        const einheit = einheitEl ? String(einheitEl.value || "").trim() : "";
        const name = nameEl ? String(nameEl.value || "").trim() : "";

        if (menge || einheit || name) {
          zutaten.push({ menge, einheit, name });
        }
      });

      if (zutaten.length) {
        gruppen.push({ name: gruppenName, zutaten });
      }
    });

    return gruppen;
  }

  function flatZutaten154(gruppen) {
    return (gruppen || []).flatMap(g => (g.zutaten || []));
  }

  function readNaehrwerte154() {
    return {
      kalorien: numOrText(val("kalorienInput")),
      eiweiss: numOrText(val("eiweissInput")),
      kohlenhydrate: numOrText(val("kohlenhydrateInput")),
      fett: numOrText(val("fettInput")),
      zucker: numOrText(val("zuckerInput")),
      ballaststoffe: numOrText(val("ballaststoffeInput")),
      salz: numOrText(val("salzInput"))
    };
  }

  function makeId154() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return "rezept_" + Date.now() + "_" + Math.random().toString(16).slice(2);
  }

  window.rf154RezeptAusFormular = function () {
    const zutatenGruppen = readZutaten154();

    const alt = bearbeitungsIndex !== null && Array.isArray(rezepte) && rezepte[bearbeitungsIndex]
      ? rezepte[bearbeitungsIndex]
      : null;

    return {
      id: alt && alt.id ? alt.id : makeId154(),
      name: val("nameInput"),
      kategorie: val("kategorieInput") || "Nicht zugeordnet",
      portionen: numOrText(val("portionenInput")),
      schwierigkeit: val("schwierigkeitInput"),
      zubereitungszeit: val("zubereitungszeitInput"),
      quelle: val("quelleInput") || "Nicht zugeordnet",
      tags: parseTags154(val("tagsInput")),
      zubereitung: val("zubereitungInput"),
      utensilien: parseUtensilien154(val("utensilienInput")),
      notizen: val("notizenInput"),
      naehrwerte: readNaehrwerte154(),
      zutatenGruppen,
      zutaten: flatZutaten154(zutatenGruppen),
      ausprobiert: $("ausprobiertInput") ? $("ausprobiertInput").value === "true" : false,
      favorit: alt ? !!alt.favorit : false,
      bewertung: alt ? Number(alt.bewertung || 0) : 0,
      erstelltAm: alt && alt.erstelltAm ? alt.erstelltAm : new Date().toISOString(),
      aktualisiertAm: new Date().toISOString()
    };
  };

  function validate154(rezept) {
    if (!rezept.name) return "Bitte einen Rezeptnamen eingeben.";
    if (!rezept.zubereitung) return "Bitte eine Zubereitung eingeben.";
    if (!rezept.zutatenGruppen || !rezept.zutatenGruppen.length || !rezept.zutaten.length) {
      return "Bitte mindestens eine Zutat eingeben.";
    }
    return "";
  }

  function safeCall154(fnName) {
    try {
      if (typeof window[fnName] === "function") window[fnName]();
    } catch (e) {
      console.warn(fnName + " fehlgeschlagen, Speichern bleibt trotzdem gültig:", e);
    }
  }

  function persist154() {
    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    // Cloud-Sync darf nicht den lokalen Speichervorgang kaputt machen.
    try {
      if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle();
      else if (typeof syncInCloudSpeichern === "function") syncInCloudSpeichern();
    } catch (e) {
      console.warn("Cloud-Speichern fehlgeschlagen, Rezept bleibt lokal gespeichert:", e);
    }

    safeCall154("suchTagsDropdownAktualisieren");
    safeCall154("quellenDropdownAktualisieren");
    safeCall154("dashboardAktualisieren");

    return true;
  }

  window.rf154RezeptSpeichern = function () {
    try {
      if (!Array.isArray(rezepte)) rezepte = [];

      const rezept = window.rf154RezeptAusFormular();
      const error = validate154(rezept);

      if (error) {
        alert(error);
        return false;
      }

      if (bearbeitungsIndex !== null && rezepte[bearbeitungsIndex]) {
        rezepte[bearbeitungsIndex] = rezept;
      } else {
        rezepte.push(rezept);
        bearbeitungsIndex = rezepte.length - 1;
      }

      persist154();

      if (typeof meldungAnzeigen === "function") {
        meldungAnzeigen("Rezept gespeichert.");
      }

      return true;
    } catch (e) {
      console.error("rf154RezeptSpeichern Fehler:", e);
      alert("Rezept konnte nicht gespeichert werden: " + (e.message || "unbekannter Fehler"));
      return false;
    }
  };

  window.rezeptSpeichern = window.rf154RezeptSpeichern;
  window.rezeptSpeichernDirektCloud = window.rf154RezeptSpeichern;
  window.rezeptAusFormularLesen = window.rf154RezeptAusFormular;

  rezeptSpeichern = window.rf154RezeptSpeichern;
  rezeptSpeichernDirektCloud = window.rf154RezeptSpeichern;
  rezeptAusFormularLesen = window.rf154RezeptAusFormular;

  function bindSave154() {
    Array.from(document.querySelectorAll("button")).forEach(button => {
      const text = (button.textContent || "").trim().toLowerCase();
      if (text === "rezept speichern" || text === "speichern") {
        button.onclick = window.rf154RezeptSpeichern;
        button.type = "button";
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindSave154);
  else bindSave154();
  window.addEventListener("load", bindSave154);
})();



// =====================================================
// VERSION 1.55: Speicherbutton endgültig auf neuen Speicherweg umgestellt
// =====================================================

function rf155Text(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function rf155ZahlOderText(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : raw;
}

function rf155Tags(raw) {
  return String(raw || "")
    .split(/[,;#]/)
    .map(x => x.trim().toLowerCase())
    .filter(Boolean)
    .filter((x, i, arr) => arr.indexOf(x) === i);
}

function rf155Utensilien(raw) {
  return String(raw || "")
    .split(/[,;\n]/)
    .map(x => x.trim())
    .filter(Boolean);
}

function rf155AlleZutatenGruppenLesen() {
  const container = document.getElementById("zutatenGruppen");
  if (!container) return [];

  const gruppen = [];
  const gruppenNodes = Array.from(container.querySelectorAll(".zutatengruppe"));

  gruppenNodes.forEach((gruppeNode, gi) => {
    const gruppenNameEl = gruppeNode.querySelector(".zutaten-gruppenname");
    const gruppenName = gruppenNameEl && gruppenNameEl.value.trim()
      ? gruppenNameEl.value.trim()
      : (gi === 0 ? "Zutaten" : "Gruppe " + (gi + 1));

    const zutaten = [];

    Array.from(gruppeNode.querySelectorAll(".zutaten-zeile")).forEach(row => {
      const mengeEl = row.querySelector(".zutat-menge");
      const einheitEl = row.querySelector(".zutat-einheit");
      const nameEl = row.querySelector(".zutat-name");

      const menge = mengeEl ? String(mengeEl.value || "").trim() : "";
      const einheit = einheitEl ? String(einheitEl.value || "").trim() : "";
      const name = nameEl ? String(nameEl.value || "").trim() : "";

      if (menge || einheit || name) {
        zutaten.push({ menge, einheit, name });
      }
    });

    if (zutaten.length) {
      gruppen.push({ name: gruppenName, zutaten });
    }
  });

  return gruppen;
}

function rf155Id() {
  try {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return "rezept_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function rf155RezeptAusFormular() {
  const zutatenGruppen = rf155AlleZutatenGruppenLesen();
  const alteVersion = bearbeitungsIndex !== null && Array.isArray(rezepte) && rezepte[bearbeitungsIndex]
    ? rezepte[bearbeitungsIndex]
    : null;

  const alleZutaten = zutatenGruppen.flatMap(g => g.zutaten || []);

  return {
    id: alteVersion && alteVersion.id ? alteVersion.id : rf155Id(),
    name: rf155Text("nameInput"),
    kategorie: rf155Text("kategorieInput") || "Nicht zugeordnet",
    portionen: rf155ZahlOderText(rf155Text("portionenInput")),
    schwierigkeit: rf155Text("schwierigkeitInput"),
    zubereitungszeit: rf155Text("zubereitungszeitInput"),
    quelle: rf155Text("quelleInput") || "Nicht zugeordnet",
    tags: rf155Tags(rf155Text("tagsInput")),
    zubereitung: rf155Text("zubereitungInput"),
    utensilien: rf155Utensilien(rf155Text("utensilienInput")),
    notizen: rf155Text("notizenInput"),
    naehrwerte: {
      kalorien: rf155ZahlOderText(rf155Text("kalorienInput")),
      eiweiss: rf155ZahlOderText(rf155Text("eiweissInput")),
      kohlenhydrate: rf155ZahlOderText(rf155Text("kohlenhydrateInput")),
      fett: rf155ZahlOderText(rf155Text("fettInput")),
      zucker: rf155ZahlOderText(rf155Text("zuckerInput")),
      ballaststoffe: rf155ZahlOderText(rf155Text("ballaststoffeInput")),
      salz: rf155ZahlOderText(rf155Text("salzInput"))
    },
    zutatenGruppen,
    zutaten: alleZutaten,
    ausprobiert: document.getElementById("ausprobiertInput")
      ? document.getElementById("ausprobiertInput").value === "true"
      : false,
    favorit: alteVersion ? !!alteVersion.favorit : false,
    bewertung: alteVersion ? Number(alteVersion.bewertung || 0) : 0,
    erstelltAm: alteVersion && alteVersion.erstelltAm ? alteVersion.erstelltAm : new Date().toISOString(),
    aktualisiertAm: new Date().toISOString()
  };
}

function rf155RezeptSpeichern() {
  try {
    if (!Array.isArray(rezepte)) rezepte = [];

    const rezept = rf155RezeptAusFormular();

    if (!rezept.name) {
      alert("Bitte einen Rezeptnamen eingeben.");
      return false;
    }

    if (!rezept.zutaten || rezept.zutaten.length === 0) {
      alert("Bitte mindestens eine Zutat eingeben.");
      return false;
    }

    if (!rezept.zubereitung) {
      alert("Bitte eine Zubereitung eingeben.");
      return false;
    }

    if (bearbeitungsIndex !== null && rezepte[bearbeitungsIndex]) {
      rezepte[bearbeitungsIndex] = rezept;
    } else {
      rezepte.push(rezept);
      bearbeitungsIndex = rezepte.length - 1;
    }

    localStorage.setItem("rezepte", JSON.stringify(rezepte));

    // Cloud/Nebenfunktionen dürfen Speichern nicht blockieren.
    try {
      if (typeof cloudSpeichernAlle === "function") cloudSpeichernAlle();
    } catch (e) {
      console.warn("Cloud-Speichern fehlgeschlagen, lokal ist gespeichert:", e);
    }

    try { if (typeof dashboardAktualisieren === "function") dashboardAktualisieren(); } catch (e) {}
    try { if (typeof quellenDropdownAktualisieren === "function") quellenDropdownAktualisieren(); } catch (e) {}
    try { if (typeof suchTagsDropdownAktualisieren === "function") suchTagsDropdownAktualisieren(); } catch (e) {}

    if (typeof meldungAnzeigen === "function") {
      meldungAnzeigen("Rezept gespeichert.");
    } else {
      alert("Rezept gespeichert.");
    }

    // Nach dem Speichern automatisch zurück zur Übersicht
    try {
      if (typeof alleRezepteAnzeigen === "function") {
        alleRezepteAnzeigen();
      }

      const formularBereich = document.getElementById("formularBereich");
      if (formularBereich && formularBereich.classList) {
        formularBereich.classList.add("versteckt");
      }

      const alleRezepteBereich = document.getElementById("alleRezepteBereich");
      if (alleRezepteBereich && alleRezepteBereich.classList) {
        alleRezepteBereich.classList.remove("versteckt");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.warn("Zur Übersicht wechseln fehlgeschlagen:", e);
    }

    return true;
  } catch (e) {
    console.error("rf155RezeptSpeichern Fehler:", e);
    alert("Rezept konnte nicht gespeichert werden: " + (e.message || "unbekannter Fehler"));
    return false;
  }
}

// Wichtig: echte Funktionsdeklarationen für alte onclick-Aufrufe.
function rezeptSpeichernDirektCloud() {
  return rf155RezeptSpeichern();
}

function rezeptSpeichern() {
  return rf155RezeptSpeichern();
}

function rezeptAusFormularLesen() {
  return rf155RezeptAusFormular();
}

window.rf155RezeptSpeichern = rf155RezeptSpeichern;
window.rezeptSpeichernDirektCloud = rf155RezeptSpeichern;
window.rezeptSpeichern = rf155RezeptSpeichern;
window.rezeptAusFormularLesen = rf155RezeptAusFormular;

window.addEventListener("load", function () {
  const buttons = Array.from(document.querySelectorAll("button"));
  buttons.forEach(button => {
    const text = (button.textContent || "").trim().toLowerCase();
    if (text === "rezept speichern") {
      button.onclick = rf155RezeptSpeichern;
      button.type = "button";
    }
  });
});



// =====================================================
// VERSION 1.57: Suche repariert - Tags lesbar + Kategorie exakt
// =====================================================

(function () {
  function $(id) { return document.getElementById(id); }

  function norm157(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function aktiveKategorien157() {
    const aktive = [];

    // Kachel-Variante
    document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel.aktiv, .such-kategorie-kachel.aktiv, .kategorie-kachel.aktiv")
      .forEach(el => {
        const wert =
          (el.dataset && (el.dataset.kategorie || el.dataset.value)) ||
          el.getAttribute("data-kategorie") ||
          el.getAttribute("data-value") ||
          el.textContent;
        if (wert) aktive.push(String(wert).trim());
      });

    // Select-Variante, falls vorhanden
    ["suchKategorieInput", "kategorieSucheInput", "filterKategorieInput"].forEach(id => {
      const el = $(id);
      if (!el) return;
      if (el.multiple) {
        Array.from(el.selectedOptions || []).forEach(o => {
          if (o.value) aktive.push(o.value);
        });
      } else if (el.value) {
        aktive.push(el.value);
      }
    });

    return [...new Set(aktive.filter(Boolean))];
  }

  function statusPasst157(rezept) {
    const el = $("suchAusprobiertInput");
    if (!el || el.value === "") return true;
    return el.value === "true" ? !!rezept.ausprobiert : !rezept.ausprobiert;
  }

  function namePasst157(rezept) {
    const el = $("suchNameInput");
    const q = el ? norm157(el.value) : "";
    if (!q) return true;
    return norm157(rezept.name).includes(q);
  }

  function quellePasst157(rezept) {
    const el = $("suchQuelleInput");
    const q = el ? String(el.value || "").trim() : "";
    if (!q) return true;
    return String(rezept.quelle || "Nicht zugeordnet").trim() === q;
  }

  function tagsPassen157(rezept) {
    const select = $("suchTagInput");
    if (!select) return true;

    const ausgewaehlt = Array.from(select.selectedOptions || [])
      .map(o => norm157(o.value))
      .filter(Boolean);

    if (!ausgewaehlt.length) return true;

    const rezeptTags = (rezept.tags || []).map(norm157);
    return ausgewaehlt.every(tag => rezeptTags.includes(tag));
  }

  function zutatenPassen157(rezept) {
    const el = $("suchZutatenInput");
    const q = el ? norm157(el.value) : "";
    if (!q) return true;

    const teile = q.split(",").map(x => x.trim()).filter(Boolean);
    const zutatenText = [
      ...(rezept.zutaten || []).map(z => z.name || ""),
      ...((rezept.zutatenGruppen || []).flatMap(g => (g.zutaten || []).map(z => z.name || "")))
    ].join(" ").toLowerCase();

    return teile.every(t => zutatenText.includes(t));
  }

  function kategoriePasst157(rezept) {
    const aktive = aktiveKategorien157();
    if (!aktive.length) return true;

    const rezeptKategorie = norm157(rezept.kategorie || "Nicht zugeordnet");
    return aktive.map(norm157).includes(rezeptKategorie);
  }

  function sortiere157(liste) {
    const sort = $("suchSortierungInput") ? $("suchSortierungInput").value : "name";
    const out = [...liste];

    if (sort === "bewertung") {
      out.sort((a, b) => Number(b.bewertung || 0) - Number(a.bewertung || 0));
    } else if (sort === "kategorie") {
      out.sort((a, b) => String(a.kategorie || "").localeCompare(String(b.kategorie || "")));
    } else {
      out.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    }

    return out;
  }

  function sucheBerechnen157() {
    const basis = (Array.isArray(rezepte) ? rezepte : []).map((r, index) => {
      if (typeof r.ausprobiert === "undefined") r.ausprobiert = false;
      return { ...r, index };
    });

    return sortiere157(basis.filter(r =>
      namePasst157(r) &&
      quellePasst157(r) &&
      tagsPassen157(r) &&
      zutatenPassen157(r) &&
      statusPasst157(r) &&
      kategoriePasst157(r)
    ));
  }

  function sucheAnzeigen157() {
    const ergebnisse = sucheBerechnen157();
    letzteSuchErgebnisse = ergebnisse;

    if (typeof zeigeErgebnisse === "function") {
      zeigeErgebnisse(ergebnisse);
    }

    const treffer = $("suchTrefferAnzeige");
    if (treffer) treffer.textContent = `${ergebnisse.length} Treffer`;

    return ergebnisse;
  }

  window.rezeptSucheAusfuehren = function () {
    return sucheAnzeigen157();
  };
  rezeptSucheAusfuehren = window.rezeptSucheAusfuehren;

  window.filterAnwenden = function () {
    return sucheAnzeigen157();
  };
  filterAnwenden = window.filterAnwenden;

  // Kategorie-Klicks neu binden: genau eine aktive Kategorie pro Klick,
  // nochmaliger Klick hebt Auswahl auf.
  function bindKategorie157() {
    const kacheln = Array.from(document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel, .such-kategorie-kachel, .kategorie-kachel"));
    kacheln.forEach(kachel => {
      if (kachel.dataset.rf157Bound === "1") return;
      kachel.dataset.rf157Bound = "1";

      kachel.addEventListener("click", function () {
        const warAktiv = kachel.classList.contains("aktiv");
        kacheln.forEach(k => k.classList.remove("aktiv"));

        if (!warAktiv) {
          kachel.classList.add("aktiv");
        }

        sucheAnzeigen157();
      });
    });
  }

  // Tag-Chips nachfärben und klickbar halten
  function tagChipsStylen157() {
    document.querySelectorAll(".tag-filter-chip, .tag-chip, .tags span").forEach(chip => {
      chip.style.background = chip.classList.contains("aktiv") ? "#dbeafe" : "#ffffff";
      chip.style.color = "#1e293b";
      chip.style.border = chip.classList.contains("aktiv") ? "1px solid #2563eb" : "1px solid #cbd5e1";
    });
  }

  const alteTagAktualisierung157 = typeof suchTagsDropdownAktualisieren === "function" ? suchTagsDropdownAktualisieren : null;
  window.suchTagsDropdownAktualisieren = function () {
    if (alteTagAktualisierung157) {
      try { alteTagAktualisierung157(); } catch (e) { console.warn("Tag Dropdown alt fehlgeschlagen:", e); }
    }
    setTimeout(tagChipsStylen157, 0);
  };
  suchTagsDropdownAktualisieren = window.suchTagsDropdownAktualisieren;

  window.addEventListener("load", function () {
    bindKategorie157();
    tagChipsStylen157();
    setTimeout(bindKategorie157, 500);
    setTimeout(tagChipsStylen157, 500);
  });
})();



// =====================================================
// VERSION 1.58: Kategorien in Suche wieder klickbar
// =====================================================

(function () {

  function rf158SucheNeuLaden() {
    try {
      if (typeof rezeptSucheAusfuehren === "function") {
        rezeptSucheAusfuehren();
      } else if (typeof filterAnwenden === "function") {
        filterAnwenden();
      }
    } catch (e) {
      console.warn("Suche konnte nicht aktualisiert werden:", e);
    }
  }

  function rf158KategorieKlickFix() {
    const kacheln = Array.from(document.querySelectorAll(
      ".kategorie-kachel, .such-kategorie-kachel, #suchKategorieKacheln button"
    ));

    kacheln.forEach(kachel => {

      // Alte Events neutralisieren
      const neueKachel = kachel.cloneNode(true);
      if (kachel.parentNode) {
        kachel.parentNode.replaceChild(neueKachel, kachel);
      }

      neueKachel.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const warAktiv = neueKachel.classList.contains("aktiv");

        // Nur eine Kategorie gleichzeitig
        document.querySelectorAll(".kategorie-kachel, .such-kategorie-kachel, #suchKategorieKacheln button")
          .forEach(k => k.classList.remove("aktiv"));

        if (!warAktiv) {
          neueKachel.classList.add("aktiv");
        }

        rf158SucheNeuLaden();
      });
    });
  }

  window.addEventListener("load", function () {
    rf158KategorieKlickFix();
    setTimeout(rf158KategorieKlickFix, 300);
    setTimeout(rf158KategorieKlickFix, 1000);
  });

})();



// =====================================================
// VERSION 1.59: Kategorie-Auswahl FINAL FIX
// =====================================================

(function () {

  function rf159SucheAktualisieren() {
    try {
      if (typeof rezeptSucheAusfuehren === "function") {
        rezeptSucheAusfuehren();
      }
    } catch (e) {
      console.warn(e);
    }
  }

  window.rf159KategorieWaehlen = function (element) {

    const warAktiv = element.classList.contains("aktiv");

    document.querySelectorAll(".kategorie-kachel, .such-kategorie-kachel")
      .forEach(k => k.classList.remove("aktiv"));

    if (!warAktiv) {
      element.classList.add("aktiv");
    }

    rf159SucheAktualisieren();
  };

  function rf159ButtonsFixen() {

    const kacheln = Array.from(document.querySelectorAll(
      ".kategorie-kachel, .such-kategorie-kachel"
    ));

    kacheln.forEach(kachel => {

      // echte Klickbarkeit sicherstellen
      kachel.style.pointerEvents = "auto";
      kachel.style.cursor = "pointer";

      // onclick DIREKT setzen
      kachel.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        rf159KategorieWaehlen(kachel);
        return false;
      };
    });
  }

  window.addEventListener("load", function () {
    rf159ButtonsFixen();
    setTimeout(rf159ButtonsFixen, 300);
    setTimeout(rf159ButtonsFixen, 1000);
    setTimeout(rf159ButtonsFixen, 2000);
  });

})();



// =====================================================
// VERSION 1.60: Kategorie-Auswahl in "Rezepte suchen" FINAL
// Ersetzt die echte onclick-Funktion: kategorieKachelUmschalten(this)
// =====================================================

function rf160Norm(value) {
  return String(value == null ? "" : value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function rf160AktiveSuchKategorie() {
  const aktiv = document.querySelector("#suchKategorieKacheln .kategorie-kachel.aktiv");
  if (!aktiv) return "";
  return aktiv.dataset.kategorie || aktiv.getAttribute("data-kategorie") || "";
}

function rf160KategoriePasst(rezept) {
  const kat = rf160AktiveSuchKategorie();
  if (!kat) return true;
  return rf160Norm(rezept.kategorie || "Nicht zugeordnet") === rf160Norm(kat);
}

function rf160StatusPasst(rezept) {
  const feld = document.getElementById("suchAusprobiertInput");
  if (!feld || feld.value === "") return true;
  return feld.value === "true" ? !!rezept.ausprobiert : !rezept.ausprobiert;
}

function rf160NamePasst(rezept) {
  const feld = document.getElementById("suchNameInput");
  const q = feld ? rf160Norm(feld.value) : "";
  if (!q) return true;
  return rf160Norm(rezept.name).includes(q);
}

function rf160QuellePasst(rezept) {
  const feld = document.getElementById("suchQuelleInput");
  const q = feld ? String(feld.value || "").trim() : "";
  if (!q) return true;
  return String(rezept.quelle || "Nicht zugeordnet").trim() === q;
}

function rf160TagsPassen(rezept) {
  const feld = document.getElementById("suchTagInput");
  if (!feld) return true;

  const ausgewaehlt = Array.from(feld.selectedOptions || [])
    .map(o => rf160Norm(o.value))
    .filter(Boolean);

  if (!ausgewaehlt.length) return true;

  const rezeptTags = (rezept.tags || []).map(rf160Norm);
  return ausgewaehlt.every(tag => rezeptTags.includes(tag));
}

function rf160ZutatenPassen(rezept) {
  const feld = document.getElementById("suchZutatenInput");
  const q = feld ? rf160Norm(feld.value) : "";
  if (!q) return true;

  const teile = q.split(",").map(x => x.trim()).filter(Boolean);
  const zutatenText = [
    ...(rezept.zutaten || []).map(z => z.name || ""),
    ...((rezept.zutatenGruppen || []).flatMap(g => (g.zutaten || []).map(z => z.name || "")))
  ].join(" ").toLowerCase();

  return teile.every(t => zutatenText.includes(t));
}

function rf160Sortieren(liste) {
  const feld = document.getElementById("suchSortierungInput");
  const sort = feld ? feld.value : "name";
  const out = [...liste];

  if (sort === "bewertung") {
    out.sort((a, b) => Number(b.bewertung || 0) - Number(a.bewertung || 0));
  } else if (sort === "kategorie") {
    out.sort((a, b) => String(a.kategorie || "").localeCompare(String(b.kategorie || "")));
  } else {
    out.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }

  return out;
}

function rf160SuchErgebnisseBerechnen() {
  const basis = (Array.isArray(rezepte) ? rezepte : []).map((r, index) => ({
    ...r,
    index
  }));

  return rf160Sortieren(basis.filter(r =>
    rf160KategoriePasst(r) &&
    rf160StatusPasst(r) &&
    rf160NamePasst(r) &&
    rf160QuellePasst(r) &&
    rf160TagsPassen(r) &&
    rf160ZutatenPassen(r)
  ));
}

function rf160SucheAnzeigen() {
  const ergebnisse = rf160SuchErgebnisseBerechnen();
  letzteSuchErgebnisse = ergebnisse;

  if (typeof zeigeErgebnisse === "function") {
    zeigeErgebnisse(ergebnisse);
  }

  const treffer = document.getElementById("suchTrefferAnzeige");
  if (treffer) {
    treffer.textContent = ergebnisse.length + " Treffer";
  }

  return ergebnisse;
}

function kategorieKachelUmschalten(button) {
  const container = button && button.closest
    ? button.closest("#suchKategorieKacheln, #kategorienFilter")
    : document.getElementById("suchKategorieKacheln");

  if (!container) return false;

  const warAktiv = button.classList.contains("aktiv");

  container.querySelectorAll(".kategorie-kachel").forEach(k => {
    k.classList.remove("aktiv");
    k.setAttribute("aria-pressed", "false");
  });

  if (warAktiv || !button.dataset.kategorie) {
    const alle = container.querySelector('.kategorie-kachel[data-kategorie=""]');
    if (alle) {
      alle.classList.add("aktiv");
      alle.setAttribute("aria-pressed", "true");
    }
  } else {
    button.classList.add("aktiv");
    button.setAttribute("aria-pressed", "true");
  }

  if (container.id === "suchKategorieKacheln") {
    rf160SucheAnzeigen();
  } else if (typeof filterAnwenden === "function") {
    try { filterAnwenden(); } catch (e) {}
  }

  return false;
}

function rezeptSucheAusfuehren() {
  return rf160SucheAnzeigen();
}

function filterAnwenden() {
  return rf160SucheAnzeigen();
}

window.kategorieKachelUmschalten = kategorieKachelUmschalten;
window.rezeptSucheAusfuehren = rezeptSucheAusfuehren;
window.filterAnwenden = filterAnwenden;

function rf160KategorieButtonsNachbessern() {
  document.querySelectorAll("#suchKategorieKacheln .kategorie-kachel, #kategorienFilter .kategorie-kachel").forEach(btn => {
    btn.type = "button";
    btn.style.pointerEvents = "auto";
    btn.style.cursor = "pointer";
    btn.onclick = function (event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return kategorieKachelUmschalten(btn);
    };
  });
}

window.addEventListener("load", function () {
  rf160KategorieButtonsNachbessern();
  setTimeout(rf160KategorieButtonsNachbessern, 300);
  setTimeout(rf160KategorieButtonsNachbessern, 1000);
});
