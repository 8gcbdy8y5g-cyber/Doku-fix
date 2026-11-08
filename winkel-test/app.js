/* Winkelmessung: Ablaufsteuerung für Kamera, Sensor und Foto. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const { J, SRC } = window.KAT;
const W = window.WK;

/* ---------------- Speicher (nur Messliste und Einstellungen) ---------------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem("winkel2-" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("winkel2-" + k, JSON.stringify(v)); } catch (e) {} }
};
const cfg = Object.assign({ model: "full", reps: 3, ton: "sprache" }, store.get("cfg", {}));
const EXAMPLES = [
  { ex: 1, j: "knie", mv: "k-flex", side: "r", m: "cam", v: 118, n: 3, range: 4, g: 120, q: "gut" },
  { ex: 1, j: "knie", mv: "k-ext", side: "r", m: "sen", v: -3, n: 1, range: 0, g: -5, q: "gut" },
  { ex: 1, j: "knie", mv: "k-flex", side: "l", m: "cam", v: 141, n: 3, range: 3, g: 138, q: "gut" },
  { ex: 1, j: "schulter", mv: "s-abd", side: "r", m: "cam", v: 152, n: 3, range: 6, g: 160, q: "mittel" }
];
let list = store.get("liste", null);
if (!Array.isArray(list)) list = EXAMPLES.slice();

/* ---------------- Auswahlzustand ---------------- */
let joint = J.find(j => j.k === "knie"), mv = joint.mv[0], side = "r", method = mv.rec;
const findMv = k => { for (const j of J) for (const m of j.mv) if (m.k === k) return { j, m }; return null; };
const sideTxt = s => s === "r" ? "re." : "li.";
const methTxt = m => ({ cam: "Kamera", sen: "Sensor", foto: "Foto" })[m];

function toast(t) { const e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove("on"), 2200); }

/* ---------------- Rückmeldung: Ton und Ansage ---------------- */
let actx = null;
function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {} }
function beep(f = 880, d = 0.12, v = 0.18) {
  if (cfg.ton === "aus" || !actx) return;
  try { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.type = "sine"; g.gain.setValueAtTime(v, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d); o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d + 0.02); } catch (e) {}
}
function speak(t) {
  if (cfg.ton !== "sprache" || !("speechSynthesis" in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "de-DE"; u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {}
}
let wake = null;
async function keepAwake(on) { try { if (on && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request("screen"); } if (!on && wake) { wake.release(); wake = null; } } catch (e) {} }

/* ---------------- Auswahl rendern ---------------- */
function renderPick() {
  const G = $("gelenke"); G.innerHTML = "";
  J.forEach(j => { const b = document.createElement("button"); b.className = "chip"; b.textContent = j.n; b.setAttribute("aria-pressed", j === joint);
    b.onclick = () => { joint = j; selectMv(j.mv[0]); }; G.appendChild(b); });
  const B = $("bewegungen"); B.innerHTML = "";
  joint.mv.forEach(m => { const b = document.createElement("button"); b.className = "chip"; b.setAttribute("aria-pressed", m === mv);
    b.innerHTML = ""; b.append(m.n); const s = document.createElement("small"); s.textContent = (m.rec === "cam" ? "Kamera" : "Sensor") + " empfohlen"; b.appendChild(s);
    b.onclick = () => selectMv(m); B.appendChild(b); });
  const ok = { cam: !mv.camOff, sen: !mv.senOff, foto: !mv.camOff };
  document.querySelectorAll("#methode button").forEach(b => { const m = b.dataset.m; b.hidden = !ok[m]; b.setAttribute("aria-pressed", m === method);
    b.innerHTML = ""; b.append(methTxt(m)); if (m === mv.rec || (m === "foto" && mv.rec === "cam" && false)) { const r = document.createElement("span"); r.className = "rec"; r.title = "empfohlen"; r.setAttribute("aria-label", "empfohlen"); b.appendChild(r); } });
  $("seite").hidden = !joint.side;
  document.querySelectorAll("#seite button").forEach(b => b.setAttribute("aria-pressed", b.dataset.s === side));
  $("evidenz").innerHTML = "";
  const e = document.createElement("span"); e.innerHTML = "<b>Studienlage:</b> "; e.append(mv.ev); $("evidenz").appendChild(e);
  $("v-cam").hidden = method === "sen"; $("v-sen").hidden = method !== "sen";
  $("c-start").textContent = method === "foto" ? "Foto wählen" : (camOn ? "Kamera stoppen" : "Kamera starten");
  $("c-demo").hidden = method !== "cam";
  const isFoto = method === "foto"; $("spark").hidden = isFoto; $("reps").hidden = isFoto; $("level").hidden = isFoto;
  $("ctip").textContent = mv.cam ? mv.cam.tip : "";
  showAufbau();
  sensorPrepare();
  resetResult();
}
function selectMv(m) {
  mv = m; method = mv.rec; if (method === "cam" && !mv.cam) method = "sen";
  stopAll(); renderPick(); resetCam();
}
document.querySelectorAll("#methode button").forEach(b => b.onclick = () => { if (b.dataset.m === method) return; stopAll(); method = b.dataset.m; renderPick(); resetCam(); if (method === "foto") $("file").click(); });
document.querySelectorAll("#seite button").forEach(b => b.onclick = () => { side = b.dataset.s; renderPick(); resetCam(); });

/* ---------------- Aufbau für Kamera und Foto ---------------- */
function showAufbau() {
  const box = $("aufbau"); if (!box) return;
  const a = window.ANL3 && ANL3.aufbau && (method === "cam" || method === "foto") && !camOn && !demoOn ? ANL3.aufbau(mv.k, side) : null;
  box.hidden = !a; if (!a) return;
  $("aufsvg").innerHTML = a.svg; $("auftxt").textContent = a.text; $("aufalt").textContent = a.alt || "";
}

/* ---------------- Ergebnis ---------------- */
let result = null;
function resetResult() { result = null; showResult(); }
function setResult(r) { result = r; showResult(); }
function showResult() {
  const r = result;
  $("deg").innerHTML = ""; $("deg").append(r ? String(Math.round(r.v)) : "–"); const s = document.createElement("small"); s.textContent = "°"; $("deg").appendChild(s);
  $("what").textContent = joint.n + (joint.side ? " " + (side === "r" ? "rechts" : "links") : "") + " · " + mv.n;
  $("how").textContent = r ? howTxt(r) : "Noch keine Messung";
  const max = Math.max(mv.norm[1] * 1.15, 30);
  const pct = x => Math.max(0, Math.min(100, x / max * 100));
  $("band").style.left = pct(mv.norm[0]) + "%"; $("band").style.width = (pct(mv.norm[1]) - pct(mv.norm[0])) + "%";
  $("fill").style.width = (r ? pct(Math.max(0, r.v)) : 0) + "%";
  let t = "Richtwert " + mv.norm[0] + "–" + mv.norm[1] + "°";
  if (r && r.v > 0) t += " · " + Math.round(r.v / mv.norm[0] * 100) + " % vom unteren Richtwert";
  if (r && r.v < 0) t += " · Neutralstellung nicht erreicht";
  $("normtxt").textContent = t;
  const T = $("qtags"); T.innerHTML = "";
  if (r) (r.tags || []).forEach(([cls, txt]) => { const e = document.createElement("span"); e.className = "tag " + cls; e.textContent = txt; T.appendChild(e); });
  $("take").disabled = !r; showDiff();
}
function howTxt(r) {
  let h = methTxt(r.m);
  if (r.n > 1) h += " · Median aus " + r.n + " Wdh., Spannweite " + Math.round(r.range) + "°"; else if (r.n === 1) h += " · 1 Messung";
  if (r.manual) h += " · Punkte korrigiert";
  return h;
}
const dcls = d => { d = Math.abs(d); return d <= 5 ? "d-ok" : d <= 10 ? "d-mid" : "d-bad"; };
function showDiff() {
  const g = parseFloat($("gv").value), el = $("diff");
  if (!result || isNaN(g)) { el.textContent = "optional, zum Vergleich"; el.className = "small"; return; }
  const d = Math.round(result.v - g); el.className = "small " + dcls(d); el.textContent = "Abweichung " + (d > 0 ? "+" : "") + d + "°";
}
$("gv").addEventListener("input", showDiff);
$("take").onclick = () => {
  if (!result) return;
  if (list.length && list.every(e => e.ex)) list = [];
  const g = parseFloat($("gv").value);
  list.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), j: joint.k, mv: mv.k, side: joint.side ? side : "", m: result.m, v: Math.round(result.v), n: result.n, range: Math.round(result.range || 0), g: isNaN(g) ? null : Math.round(g), q: result.q || "", manual: !!result.manual });
  store.set("liste", list); $("gv").value = ""; renderList(); toast("Übernommen"); beep(1046, .1);
};
$("next").onclick = () => { const i = joint.mv.indexOf(mv); const n = joint.mv[(i + 1) % joint.mv.length]; selectMv(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

/* ---------------- Messliste und Dokutext ---------------- */
const POS = { ext: 0, flex: 1, abd: 0, ar: 0, ir: 1, pro: 0, sup: 1, de: 0, pf: 1, lunge: 0, lat: 0, rot: 0, mcp: 1, pip: 1, dip: 1 };
function posOf(k) { return POS[k.split("-")[1]] ?? 1; }
function dokuText() {
  const real = list.filter(e => !e.ex), src = real.length ? real : list;
  const groups = {};
  src.forEach(e => { const f = findMv(e.mv); if (!f) return; const key = e.j + "|" + e.side + "|" + f.m.pair + "|" + (f.m.cam && f.m.cam.hand ? e.mv : "");
    (groups[key] = groups[key] || { j: f.j, side: e.side, pair: f.m.pair, items: [] }).items.push({ e, m: f.m }); });
  const lines = [];
  Object.values(groups).forEach(g => {
    const last = {}; g.items.forEach(x => last[x.m.k] = x);
    const its = Object.values(last);
    const name = g.j.n + (g.side ? " " + sideTxt(g.side) : "");
    const meth = [...new Set(its.map(x => methTxt(x.e.m)))].join("/");
    if (its.length >= 2 && g.pair.includes("/")) {
      const a = its.find(x => posOf(x.m.k) === 0), b = its.find(x => posOf(x.m.k) === 1);
      if (a && b) {
        const av = a.e.v, bv = b.e.v;
        const nn = av >= 0 && bv >= 0 ? av + "-0-" + bv : av < 0 ? "0-" + (-av) + "-" + bv : av + "-" + (-bv) + "-0";
        lines.push(name + " " + g.pair + " " + nn + "° (aktiv, " + meth + ")"); return;
      }
    }
    its.forEach(x => {
      const v = x.e.v;
      const t = v < 0 ? x.m.n + ": Neutralstellung nicht erreicht, Defizit " + (-v) + "°" : x.m.n + " " + v + "°";
      lines.push(name + " " + t + " (aktiv, " + methTxt(x.e.m) + ")");
    });
  });
  /* Seitenvergleich */
  const byMv = {}; src.forEach(e => { if (e.side) (byMv[e.mv] = byMv[e.mv] || {})[e.side] = e; });
  Object.entries(byMv).forEach(([k, s]) => { if (s.r && s.l && s.r.v > 0 && s.l.v > 0) { const f = findMv(k); const d = s.r.v - s.l.v; if (Math.abs(d) >= 5) lines.push("Seitenvergleich " + f.j.n + " " + f.m.n + ": re. " + s.r.v + "°, li. " + s.l.v + "° (Differenz " + Math.abs(d) + "°)"); } });
  return lines.join("\n");
}
function renderList() {
  const L = $("list"); L.innerHTML = "";
  if (!list.length) { const p = document.createElement("p"); p.className = "small"; p.textContent = "Noch keine Messung. Messen und auf „Übernehmen“ tippen."; L.appendChild(p); }
  list.slice().reverse().forEach(e => {
    const f = findMv(e.mv); if (!f) return;
    const el = document.createElement("div"); el.className = "item";
    const t = document.createElement("div"); t.className = "t"; t.textContent = f.j.n + (e.side ? " " + sideTxt(e.side) : "") + " · " + f.m.n;
    const v = document.createElement("div"); v.className = "v"; v.textContent = e.v + "°";
    if (e.g != null) { const d = e.v - e.g, s = document.createElement("span"); s.className = dcls(d); s.textContent = " " + (d > 0 ? "+" : "") + d; v.appendChild(s); }
    const m = document.createElement("div"); m.className = "m";
    if (e.ex) { const x = document.createElement("span"); x.className = "ex"; x.textContent = "Beispiel"; m.append(x, " · "); }
    m.append(methTxt(e.m) + (e.n > 1 ? " · " + e.n + " Wdh., Spannweite " + e.range + "°" : "") + (e.manual ? " · korrigiert" : "") + (e.g != null ? " · Goniometer " + e.g + "°" : ""));
    el.append(t, v, m); L.appendChild(el);
  });
  $("cnt").textContent = list.filter(e => !e.ex).length ? list.filter(e => !e.ex).length + " gespeichert" : "Beispiele";
  $("doku").textContent = dokuText() || "Hier entsteht der Text für die Dokumentation.";
  renderVgl();
}
function renderVgl() {
  const V = $("vgl"); V.innerHTML = "";
  const p = document.createElement("p"); p.textContent = "Trag beim Messen den Goniometerwert ein. Hier siehst du dann, wie gut jede Messart zu deinem Goniometer passt: mittlere Abweichung und der Bereich, in dem 95 % der Abweichungen liegen (Bland-Altman)."; V.appendChild(p);
  const real = list.filter(e => e.g != null);
  ["cam", "sen", "foto"].forEach(m => {
    const ba = W.blandAltman(real.filter(e => e.m === m).map(e => [e.v, e.g])); if (!ba) return;
    const d = document.createElement("div"); d.className = "item";
    const t = document.createElement("div"); t.className = "t"; t.textContent = methTxt(m) + " (" + ba.n + " Messungen)";
    const v = document.createElement("div"); v.className = "v " + dcls(ba.mae); v.textContent = "Ø " + ba.mae.toFixed(1) + "°";
    const s = document.createElement("div"); s.className = "m"; s.textContent = "Systematisch " + (ba.bias > 0 ? "+" : "") + ba.bias.toFixed(1) + "° · 95 % zwischen " + ba.lo.toFixed(0) + "° und +" + ba.hi.toFixed(0) + "°" + (ba.n < 10 ? " · ab etwa 10 Messungen aussagekräftig" : "");
    d.append(t, v, s); V.appendChild(d);
  });
}
$("copy").onclick = async () => { const t = dokuText(); try { await navigator.clipboard.writeText(t); toast("Kopiert"); } catch (e) { const r = document.createRange(); r.selectNodeContents($("doku")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Text markiert, jetzt kopieren"); } };
/* Übertragung zwischen eigenen Geräten über die gemeinsame Zwischenablage */
const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(s)));
$("send").onclick = async () => {
  const real = list.filter(e => !e.ex);
  if (!real.length) { toast("Noch keine eigenen Messungen"); return; }
  real.forEach(e => { if (!e.id) e.id = (e.ts || Date.now()).toString(36) + Math.random().toString(36).slice(2, 6); }); store.set("liste", list);
  const code = "WINKEL1:" + b64e(JSON.stringify(real));
  try { await navigator.clipboard.writeText(code); toast(real.length + " Messungen kopiert. Am anderen Gerät „Vom anderen Gerät einfügen“ tippen."); }
  catch (e) { $("pastebox").hidden = false; $("pastetxt").value = code; $("pastetxt").select(); toast("Code markiert, jetzt kopieren"); }
};
function importCode(txt) {
  const m = /WINKEL1:([A-Za-z0-9+/=]+)/.exec(txt || "");
  if (!m) { toast("Kein Messungs-Code gefunden"); return false; }
  let arr; try { arr = JSON.parse(b64d(m[1])); } catch (e) { toast("Code ist beschädigt"); return false; }
  if (!Array.isArray(arr)) return false;
  if (list.length && list.every(e => e.ex)) list = [];
  const have = new Set(list.map(e => e.id)); let n = 0;
  arr.forEach(e => { if (e && e.mv && !have.has(e.id) && findMv(e.mv)) { list.push(e); n++; } });
  list.sort((a, b) => (a.ts || 0) - (b.ts || 0)); store.set("liste", list); renderList();
  toast(n ? n + " Messungen übernommen" : "Alles schon vorhanden"); beep(1046, .1);
  return true;
}
$("recv").onclick = async () => {
  try { const t = await navigator.clipboard.readText(); if (importCode(t)) { $("pastebox").hidden = true; return; } } catch (e) {}
  $("pastebox").hidden = false; $("pastetxt").value = ""; $("pastetxt").focus();
};
$("pasteok").onclick = () => { if (importCode($("pastetxt").value)) $("pastebox").hidden = true; };
$("pastetxt").addEventListener("paste", e => { const t = (e.clipboardData || window.clipboardData).getData("text"); if (t && /WINKEL1:/.test(t)) { e.preventDefault(); if (importCode(t)) $("pastebox").hidden = true; } });

$("clear").onclick = () => { const b = $("clear"); if (b.dataset.arm) { list = []; store.set("liste", list); renderList(); delete b.dataset.arm; b.textContent = "Liste leeren"; toast("Liste geleert"); return; } b.dataset.arm = 1; b.textContent = "Wirklich leeren?"; setTimeout(() => { delete b.dataset.arm; b.textContent = "Liste leeren"; }, 3000); };

/* ---------------- Einstellungen ---------------- */
let heavyOk = false;
function renderCfg() {
  document.querySelectorAll("#modell button").forEach(b => { b.setAttribute("aria-pressed", b.dataset.v === cfg.model); b.disabled = b.dataset.v === "heavy" && !heavyOk; });
  document.querySelectorAll("#wdh button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === cfg.reps));
  document.querySelectorAll("#ton button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === cfg.ton));
  $("modelltxt").textContent = { lite: "Schnellstes Modell, für ältere Geräte.", full: "Standard: guter Mittelweg aus Tempo und Genauigkeit.", heavy: "Genauestes Modell, braucht ein aktuelles iPhone oder iPad." }[cfg.model] + (heavyOk ? "" : " „Genau“ gibt es nur auf der Testseite.");
}
document.querySelectorAll("#modell button").forEach(b => b.onclick = () => { cfg.model = b.dataset.v; store.set("cfg", cfg); renderCfg(); pose = null; poseP = null; ERK.key = ""; ERK.ready = null; });
document.querySelectorAll("#wdh button").forEach(b => b.onclick = () => { cfg.reps = +b.dataset.v; store.set("cfg", cfg); renderCfg(); renderReps(); });
document.querySelectorAll("#ton button").forEach(b => b.onclick = () => { cfg.ton = b.dataset.v; store.set("cfg", cfg); renderCfg(); unlockAudio(); beep(); });
fetch("mp/pose_landmarker_heavy.task.wasm", { method: "HEAD" }).then(r => { heavyOk = r.ok; if (!heavyOk && cfg.model === "heavy") cfg.model = "full"; renderCfg(); }).catch(() => { heavyOk = false; renderCfg(); });

/* =================================================================
   Lagesensor (für Libelle bei Kamera und für die Sensormessung)
   ================================================================= */
let gNow = null, gWin = [], motionOn = false, motionAsked = false;
function onMotion(e) {
  const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
  const g = [a.x, a.y, a.z]; gNow = g; const t = performance.now();
  gWin.push([t, g]); while (gWin.length && t - gWin[0][0] > 500) gWin.shift();
  if (method === "sen") sensorTick(t);
}
async function ensureMotion() {
  if (motionOn) return true;
  if (typeof DeviceMotionEvent === "undefined") return false;
  try {
    if (typeof DeviceMotionEvent.requestPermission === "function") { motionAsked = true; const st = await DeviceMotionEvent.requestPermission(); if (st !== "granted") return false; }
    window.addEventListener("devicemotion", onMotion); motionOn = true; return true;
  } catch (e) { return false; }
}
/* Neigung des aufrecht stehenden Handys nach vorn/hinten (Kamera): Anteil der Schwerkraft auf der Bildschirmnormalen */
function camTilt() { if (!gNow) return null; return W.offAxis(gNow, 2); }
function drawLevel() {
  const t = camTilt(), S = $("levelsvg");
  if (t == null) { S.innerHTML = '<circle cx="28" cy="28" r="22" fill="none" stroke="#5d6b78" stroke-width="2"/><line x1="16" y1="28" x2="40" y2="28" stroke="#5d6b78" stroke-width="2"/>'; $("leveltxt").textContent = motionOn ? "–" : "Libelle aus"; return; }
  const a = Math.abs(t), col = a <= 5 ? "#3cc47b" : a <= 10 ? "#f0ad3e" : "#f0675b";
  const y = 28 + Math.max(-18, Math.min(18, t * 1.2));
  /* Rollwinkel nur zur Anzeige (die Winkel selbst hängen nicht davon ab) */
  const roll = Math.atan2(gNow[0], -gNow[1]) * W.D;
  S.innerHTML = `<circle cx="28" cy="28" r="22" fill="none" stroke="${col}" stroke-width="2.5"/><line x1="10" y1="28" x2="46" y2="28" stroke="rgba(255,255,255,.35)" stroke-width="1.5" transform="rotate(${roll.toFixed(1)} 28 28)"/><circle cx="28" cy="${y.toFixed(1)}" r="6" fill="${col}"/>`;
  $("leveltxt").textContent = (a <= 5 ? "gerade " : "Neigung ") + a.toFixed(0) + "°";
}

/* =================================================================
   Kamera
   ================================================================= */
const cv = $("cv"), ctx = cv.getContext("2d"), vid = $("vid"), spark = $("spark"), sctx = spark.getContext("2d");
let camOn = false, stream = null, facing = "environment", demoOn = false, review = null, photo = null;
let pose = null, poseP = null, hand = null, handP = null, vision = null;
let lastTs = -1, frameN = 0, dropped = 0, accepted = 0, lastRaw = null, filt = new W.OneEuro(1.2, 0.03), tracker = null, sSign = 0;
let hist = [], holds = [], segMax = {}, quality = { level: "–", vis: 0, plane: 0, view: "", warn: "" }, lightLow = false;
let curPts = null, curRaw = null;

function tracked() { return mv.cam && mv.cam.hand; }
/* Erkennung läuft bevorzugt in einem Hintergrund-Strang (erkennung.js), damit die Oberfläche nie einfriert.
   Klappt das nicht, Rückfall auf den Hauptstrang. Bilder werden vorher auf 640 px verkleinert. */
const ERK = { w: undefined, mode: "", key: "", ready: null, pend: new Map(), id: 0, how: "" };
const small = document.createElement("canvas"), sctx2 = small.getContext("2d");
function modelPath() { return tracked() ? "mp/hand_landmarker.task.wasm" : "mp/pose_landmarker_" + cfg.model + ".task.wasm"; }
function abs(p) { return new URL(p, location.href).href; }
function call(msg, transfer, ms) {
  return new Promise((res, rej) => {
    const id = ++ERK.id; msg.id = id; ERK.pend.set(id, { res, rej });
    if (ms) setTimeout(() => { if (ERK.pend.has(id)) { ERK.pend.delete(id); rej(new Error("Zeitüberschreitung")); } }, ms);
    ERK.w.postMessage(msg, transfer || []);
  });
}
function startWorker() {
  if (ERK.w !== undefined) return ERK.w;
  try {
    const w = new Worker("erkennung.js", { type: "module" });
    ERK.loaded = new Promise((res, rej) => { ERK.onLoaded = res; setTimeout(() => rej(new Error("Hintergrund-Strang startet nicht")), 20000); });
    w.onmessage = e => { const m = e.data; if (m.type === "loaded") { ERK.onLoaded(); return; } const p = ERK.pend.get(m.id); if (!p) return; ERK.pend.delete(m.id);
      if (m.type === "error") p.rej(new Error(m.msg)); else p.res(m.type === "ready" ? m : m.r); };
    w.onerror = e => { console.error("Erkennung", e.message); ERK.pend.forEach(p => p.rej(new Error("Hintergrund-Strang fehlgeschlagen"))); ERK.pend.clear(); };
    ERK.w = w;
  } catch (e) { ERK.w = null; }
  return ERK.w;
}
function ensureDetector() {
  const key = (tracked() ? "hand" : "pose") + "|" + modelPath();
  if (ERK.key === key && ERK.ready) return ERK.ready;
  ERK.key = key;
  ERK.ready = (async () => {
    /* erst Grafikchip, dann Prozessor – jeweils in einem frischen Hintergrund-Strang */
    for (const del of ["GPU"]) {
      if (ERK.mode === "main") break;
      if (!startWorker()) break;
      try { await ERK.loaded; const r = await call({ type: "init", del, kind: tracked() ? "hand" : "pose", model: abs(modelPath()), wasm: abs("mp/wasm") }, null, 30000); ERK.mode = "worker"; ERK.how = r.how; ERK.del = del; return true; }
      catch (e) { console.warn("Erkennung im Hintergrund nicht möglich:", e.message); try { ERK.w.terminate(); } catch (x) {} ERK.w = null; }
    }
    ERK.mode = "main"; await getDetector("VIDEO"); ERK.how = "Hauptstrang"; return true;
  })();
  ERK.ready.catch(() => { ERK.key = ""; ERK.ready = null; });
  return ERK.ready;
}
/* Ein Bild auswerten. source: Video, Canvas oder Bild; mode: VIDEO oder IMAGE */
async function detectFrame(source, mode, ts) {
  const sw = source.videoWidth || source.width, sh = source.videoHeight || source.height;
  const k = Math.min(1, 640 / Math.max(sw, sh)); const w = Math.round(sw * k), h = Math.round(sh * k);
  if (small.width !== w || small.height !== h) { small.width = w; small.height = h; }
  sctx2.drawImage(source, 0, 0, w, h);
  if (ERK.mode === "worker") {
    const bm = await createImageBitmap(small); return call({ type: "frame", bitmap: bm, mode, ts }, [bm], 15000);
  }
  const d = await getDetector(mode); await new Promise(r => setTimeout(r, 30));
  return mode === "VIDEO" ? d.detectForVideo(small, ts) : d.detect(small);
}
async function loadVision() {
  if (vision) return vision;
  const mod = await import("./mp/vision_bundle.mjs");
  const fs = await mod.FilesetResolver.forVisionTasks(new URL("mp/wasm", location.href).href.replace(/\/$/, ""));
  vision = { mod, fs }; return vision;
}
async function getDetector(runMode) {
  const v = await loadVision();
  const isHand = tracked();
  const mk = async del => isHand
    ? v.mod.HandLandmarker.createFromOptions(v.fs, { baseOptions: { modelAssetPath: "mp/hand_landmarker.task.wasm", delegate: del }, runningMode: runMode, numHands: 1, minHandDetectionConfidence: .5, minTrackingConfidence: .5 })
    : v.mod.PoseLandmarker.createFromOptions(v.fs, { baseOptions: { modelAssetPath: "mp/pose_landmarker_" + cfg.model + ".task.wasm", delegate: del }, runningMode: runMode, numPoses: 1, minPoseDetectionConfidence: .5, minPosePresenceConfidence: .5, minTrackingConfidence: .5 });
  const use = async (d, m0) => { if (d._mode === undefined) d._mode = m0; if (d._mode !== runMode) { await d.setOptions({ runningMode: runMode }); d._mode = runMode; } return d; };
  if (isHand) { if (!handP) handP = mk("GPU").catch(() => mk("CPU")).then(d => (d._mode = runMode, d)); hand = await use(await handP, runMode); return hand; }
  if (!poseP) poseP = mk("GPU").catch(() => mk("CPU")).then(d => (d._mode = runMode, d)); pose = await use(await poseP, runMode); return pose;
}

function resetCam() {
  tracker = new W.RepTracker({ reps: cfg.reps }); filt.reset(); sSign = 0; hist = []; holds = []; segMax = {}; lastRaw = null; dropped = 0; accepted = 0; review = null; curPts = null; curRaw = null; lastDraw = null;
  $("rnote").hidden = true; $("c-done").hidden = !(camOn || demoOn);
  renderReps(); setLive(null); drawSpark();
  if (!camOn && !demoOn && !photo) drawIdle();
  if (photo && method === "foto") runPhoto();
}
function renderReps() {
  const R = $("reps"); R.innerHTML = "";
  const n = tracker ? tracker.reps.length : 0;
  for (let i = 0; i < cfg.reps; i++) { const e = document.createElement("i"); if (i < n) e.className = "on"; R.appendChild(e); }
  const s = document.createElement("span"); s.textContent = n + "/" + cfg.reps; R.appendChild(s);
}
function setLive(v) { const L = $("live"); L.innerHTML = ""; L.append(v == null ? "–" : String(Math.round(v))); const s = document.createElement("small"); s.textContent = "°"; L.appendChild(s); }
function setQ(level, txt) { $("qdot").className = "dot " + level; $("qtxt").textContent = txt; }
let sayT = 0;
function sayBig(t, ms = 1400) { const s = $("say"); s.textContent = t; s.hidden = false; clearTimeout(sayT); sayT = setTimeout(() => s.hidden = true, ms); }

function drawIdle() {
  if (cv.width !== 720) { cv.width = 720; cv.height = 960; }
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim() || "#0c141d"; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
  for (let x = 0; x < cv.width; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
  for (let y = 0; y < cv.height; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke(); }
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = "600 26px -apple-system,Helvetica,sans-serif"; ctx.textAlign = "center";
  const t = method === "foto" ? "Foto wählen, die Punkte setzt die Erkennung" : "Kamera starten oder Vorführung ansehen";
  ctx.fillText(t, cv.width / 2, cv.height / 2); ctx.textAlign = "start";
  setQ("", method === "foto" ? "Foto" : "Bereit"); drawLevel();
}

/* --- Kamera starten/stoppen --- */
$("c-start").onclick = async () => {
  unlockAudio();
  if (method === "foto") { $("file").click(); return; }
  if (camOn) { stopAll(); renderPick(); resetCam(); return; }
  stopDemo();
  ensureMotion();
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false }); }
  catch (e) { toast("Kein Kamerazugriff. Auf dem iPhone über die Testseite öffnen und die Kamera erlauben."); setQ("bad", "Kamera nicht erlaubt"); return; }
  vid.srcObject = stream; await vid.play().catch(() => {});
  await new Promise(r => { if (vid.videoWidth) r(); else vid.onloadedmetadata = r; });
  cv.width = vid.videoWidth; cv.height = vid.videoHeight; camOn = true; keepAwake(true); showAufbau();
  $("c-start").textContent = "Kamera stoppen"; $("c-flip").hidden = false; $("c-done").hidden = false;
  resetCam(); detOk = false; if (!loopOn) loop();
  const t0 = Date.now(), tick = setInterval(() => { if (!detOk && camOn) setQ("warn", "Erkennung lädt … " + Math.round((Date.now() - t0) / 1000) + " s (beim ersten Mal bis 30 s)"); else clearInterval(tick); }, 1000);
  setQ("warn", "Erkennung lädt …");
  try { await ensureDetector(); detOk = true; setQ("warn", "Suche " + (tracked() ? "Hand" : "Person") + " …"); }
  catch (e) { console.error(e); clearInterval(tick); setQ("bad", "Erkennung nicht verfügbar"); toast("Die Erkennung lädt hier nicht. Foto nehmen und Punkte von Hand setzen."); }
};
$("c-flip").onclick = async () => { facing = facing === "environment" ? "user" : "environment"; stopCam(); $("c-start").click(); };
$("c-done").onclick = () => finishCam(true);
function stopCam() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; camOn = false; keepAwake(false); $("c-flip").hidden = true; showAufbau(); }
function stopAll() { stopCam(); stopDemo(); stopSensor(); }

let detOk = false, busy = false, lastDraw = null, loopOn = false;
function loop() {
  if (!camOn) { loopOn = false; return; }
  loopOn = true;
  if (vid.readyState >= 2 && !review) {
    ctx.drawImage(vid, 0, 0, cv.width, cv.height);
    if (lastDraw) drawPose(lastDraw.L, lastDraw.F, lastDraw.bad);
    if (detOk && !busy) {
      let ts = performance.now(); if (ts <= lastTs) ts = lastTs + 1; lastTs = ts; busy = true;
      detectFrame(vid, "VIDEO", ts).then(r => { if (camOn && !review && r) handleResult(r, ts / 1000); })
        .catch(e => console.error(e)).finally(() => { busy = false; });
    }
    if (++frameN % 20 === 0) checkLight();
    drawLevel();
  }
  requestAnimationFrame(loop);
}
function checkLight() {
  try { const c = checkLight.c || (checkLight.c = document.createElement("canvas")); c.width = 24; c.height = 32; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(vid, 0, 0, 24, 32);
    const d = x.getImageData(0, 0, 24, 32).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; lightLow = s / (d.length / 4) < 45; } catch (e) {}
}

/* --- Ein Bild auswerten: Punkte holen, prüfen, Winkel berechnen --- */
function landmarksOf(r) {
  if (tracked()) { if (!r.landmarks || !r.landmarks.length) return null; return { lm: r.landmarks[0], wl: r.worldLandmarks && r.worldLandmarks[0], vis: (r.handedness && r.handedness[0] && r.handedness[0][0] ? r.handedness[0][0].score : 1) }; }
  if (!r.landmarks || !r.landmarks.length) return null; return { lm: r.landmarks[0], wl: r.worldLandmarks && r.worldLandmarks[0] };
}
function defIdx(def, s) { const k = W.LM[s]; return def.hand ? [...def.ref, ...def.mov] : [...def.ref, ...def.mov].map(n => k[n]); }
/* Rohwinkel aus Pixelpunkten [r0,r1,m0,m1] */
function rawFrom(def, p) {
  let a = W.signed2D(W.sub(p[1], p[0]), W.sub(p[3], p[2]));
  if (def.unsigned) a = Math.abs(a);
  return a - def.zero;
}
function computeFrame(L) {
  const def = mv.cam, idx = defIdx(def, side), w = cv.width, h = cv.height;
  const px = i => [L.lm[i].x * w, L.lm[i].y * h];
  const pts = idx.map(px);
  const vis = tracked() ? L.vis : Math.min(...idx.map(i => L.lm[i].visibility ?? 1));
  const raw = rawFrom(def, pts);
  let a3 = null;
  if (L.wl) { const P = i => [L.wl[i].x, L.wl[i].y, L.wl[i].z]; a3 = W.vecAngle(W.sub(P(idx[1]), P(idx[0])), W.sub(P(idx[3]), P(idx[2]))); }
  const a2 = def.unsigned ? Math.abs(raw + def.zero) : Math.abs(raw);
  const planeDiff = a3 == null ? 0 : Math.abs(a3 - a2);
  return { pts, idx, vis, raw, planeDiff };
}
function qualityChecks(L, F) {
  const issues = []; const w = cv.width, h = cv.height;
  if (lightLow) issues.push(["warn", "Zu dunkel, mehr Licht"]);
  if (F.vis < 0.7) issues.push(["bad", "Gelenk nicht sicher erkannt"]);
  const t = camTilt(); if (t != null && Math.abs(t) > 5) issues.push([Math.abs(t) > 10 ? "bad" : "warn", "Handy senkrecht stellen"]);
  if (F.planeDiff > 12) issues.push(["warn", "Bewegung läuft aus der Bildebene"]);
  /* Verkürzung: ein Segment ist deutlich kürzer als sein Höchstwert → Drehung aus der Ebene */
  const seg = [W.len(W.sub(F.pts[1], F.pts[0])), W.len(W.sub(F.pts[3], F.pts[2]))];
  seg.forEach((s, i) => { segMax[i] = Math.max(segMax[i] || 0, s); if (s < segMax[i] * 0.82) issues.push(["warn", "Abschnitt verkürzt, Patient dreht sich"]); });
  /* Abstand: Segmente zu klein oder Punkte am Rand */
  const diag = Math.hypot(w, h);
  if (seg[0] + seg[1] < diag * (tracked() ? 0.12 : 0.18)) issues.push(["warn", "Näher heran"]);
  if (F.pts.some(p => p[0] < w * .02 || p[0] > w * .98 || p[1] < h * .02 || p[1] > h * .98)) issues.push(["warn", "Weiter weg, Gelenk am Bildrand"]);
  if (!tracked()) {
    const lm = L.lm, sw = Math.abs(lm[11].x - lm[12].x) * w, tl = Math.hypot((lm[11].x + lm[12].x - lm[23].x - lm[24].x) * w / 2, (lm[11].y + lm[12].y - lm[23].y - lm[24].y) * h / 2) || 1;
    const ratio = sw / tl;
    if (mv.cam.view === "seitlich" && ratio > 0.5 && tl > 20) issues.push(["warn", "Patient seitlicher zur Kamera drehen"]);
    if (mv.cam.view === "frontal" && ratio < 0.45 && tl > 20) issues.push(["warn", "Patient frontal zur Kamera stellen"]);
    if (mv.cam.view === "seitlich" && L.wl) { const o = side === "r" ? "l" : "r", a = W.LM[side][mv.cam.mov[0]], b = W.LM[o][mv.cam.mov[0]];
      if (L.wl[a].z - L.wl[b].z > 0.08) issues.push(["warn", "Gemessene Seite zur Kamera drehen"]); }
  }
  return issues;
}
function handleResult(r, t) {
  const L = landmarksOf(r);
  if (!L) { setQ("bad", tracked() ? "Keine Hand im Bild" : "Keine Person im Bild"); curPts = null; lastDraw = null; return; }
  const F = computeFrame(L);
  const issues = qualityChecks(L, F);
  const hard = issues.find(i => i[0] === "bad");
  curPts = F.pts; curRaw = F.raw;
  lastDraw = { L, F, bad: hard };
  if (hard) { dropped++; setQ("bad", hard[1]); return; }
  /* Ausreißer: Sprung über 35° von einem Bild zum nächsten */
  if (lastRaw != null && Math.abs(F.raw - lastRaw) > 35) { dropped++; lastRaw = F.raw; return; }
  lastRaw = F.raw; accepted++;
  const v = filt.filter(F.raw, t);
  hist.push([t, v]); while (hist.length && t - hist[0][0] > 12) hist.shift();
  const w = issues[0];
  setQ(w ? "warn" : "ok", w ? w[1] : "Messbereit");
  quality.last = issues;
  const show = sSign ? sSign * v : Math.abs(v);
  setLive(show);
  const ev = tracker.push(v, t);
  onTrackerEvent(ev, F, issues);
  drawSpark();
}
function onTrackerEvent(ev, F, issues) {
  if (!ev) return;
  if (ev.type === "base") { beep(660, .08, .12); sayBig("Ausgangsstellung erkannt"); }
  if (ev.type === "hold") { holds.push({ value: ev.value, snap: snapFrame(), pts: F.pts.map(p => p.slice()), issues: issues.map(i => i[1]) }); beep(990, .05, .08); }
  if (ev.type === "rep") {
    if (!sSign) sSign = Math.sign(ev.rep.value) || 1;
    const best = holds.length ? holds[holds.length - 1] : null;
    ev.rep.snap = best; ev.rep.clin = sSign * ev.rep.abs;
    beep(1175, .15); const v = Math.round(ev.rep.clin); speak(v + " Grad"); sayBig(v + "°  ·  Wdh. " + ev.n);
    renderReps(); holds = [];
    if (ev.done) finishCam(false);
  }
}
function snapFrame() {
  try { const c = document.createElement("canvas"); const s = Math.min(1, 900 / Math.max(cv.width, cv.height)); c.width = Math.round(cv.width * s); c.height = Math.round(cv.height * s);
    c.getContext("2d").drawImage(demoOn ? cv : vid, 0, 0, c.width, c.height); return { c, s }; } catch (e) { return null; }
}
function finishCam(manualStop) {
  const reps = tracker ? tracker.reps.slice() : [];
  if (!reps.length && tracker && tracker.best) { /* noch nicht zurück, aber Endstellung gehalten */
    const b = tracker.best, ex = b.value - tracker.base; if (!sSign) sSign = Math.sign(ex) || 1;
    reps.push({ value: ex, abs: b.value, clin: sSign * b.value, snap: holds[holds.length - 1] });
  }
  if (!reps.length) { if (manualStop) toast("Noch keine gehaltene Endstellung erkannt"); return; }
  const vals = reps.map(r => r.clin), med = W.median(vals);
  const pick = reps.reduce((a, r) => Math.abs(r.clin - med) < Math.abs(a.clin - med) ? r : a, reps[0]);
  const range = Math.max(...vals) - Math.min(...vals);
  const tags = qualityTags(range, reps.length, pick.snap ? pick.snap.issues : []);
  setResult({ v: med, n: reps.length, range, m: "cam", tags, q: tags.q });
  if (demoOn) stopDemo(); else stopCam();
  $("c-start").textContent = "Kamera starten"; $("c-done").hidden = true;
  if (pick.snap && pick.snap.snap) openReview(pick.snap, pick, reps, vals);
  setQ("ok", "Fertig · Standbild prüfen"); keepAwake(false);
}
function qualityTags(range, n, issues) {
  const tags = []; let q = "gut";
  if (n >= 2) tags.push([range <= 5 ? "ok" : range <= 8 ? "warn" : "bad", "Spannweite " + Math.round(range) + "°"]);
  if (range > 8) q = "unsicher";
  const share = accepted + dropped ? dropped / (accepted + dropped) : 0;
  if (share > .3) { tags.push(["warn", Math.round(share * 100) + " % Bilder verworfen"]); q = q === "gut" ? "mittel" : q; }
  (issues || []).slice(0, 2).forEach(i => { tags.push(["warn", i]); if (q === "gut") q = "mittel"; });
  if (!issues || !issues.length) tags.push(["ok", "Ausrichtung in Ordnung"]);
  tags.unshift([q === "gut" ? "ok" : q === "mittel" ? "warn" : "bad", "Messgüte " + q]);
  tags.q = q; return tags;
}

/* --- Zeichnen --- */
function tapeColor() { return getComputedStyle(document.documentElement).getPropertyValue("--tape").trim() || "#1d74d8"; }
const BONES = [[11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32]];
const HBONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
function drawPose(L, F, bad) {
  const w = cv.width, h = cv.height, B = tracked() ? HBONES : BONES;
  ctx.lineWidth = Math.max(2, w / 360); ctx.strokeStyle = "rgba(255,255,255,.38)"; ctx.lineCap = "round";
  B.forEach(([a, b]) => { const A = L.lm[a], C = L.lm[b]; if ((A.visibility ?? 1) < .5 || (C.visibility ?? 1) < .5) return; ctx.beginPath(); ctx.moveTo(A.x * w, A.y * h); ctx.lineTo(C.x * w, C.y * h); ctx.stroke(); });
  drawMeasure(F.pts, bad ? .4 : 1, null);
}
function uniquePts(p) { const u = []; p.forEach(q => { if (!u.some(x => Math.hypot(x[0] - q[0], x[1] - q[1]) < 1)) u.push(q); }); return u; }
function drawMeasure(p, alpha, label, c = ctx, scale = 1) {
  const tape = tapeColor(), r = Math.max(c.canvas.width, c.canvas.height) / 90;
  c.globalAlpha = alpha; c.lineCap = "round";
  [[p[0], p[1]], [p[2], p[3]]].forEach(([a, b]) => { c.strokeStyle = "#fff"; c.lineWidth = r * .8; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.strokeStyle = tape; c.lineWidth = r * .4; c.stroke(); });
  /* Winkelbogen am gemeinsamen Punkt bzw. am Ursprung des bewegten Segments */
  const o = p[2], a1 = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]), a2 = Math.atan2(p[3][1] - p[2][1], p[3][0] - p[2][0]);
  let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  c.fillStyle = tape + "55"; c.beginPath(); c.moveTo(o[0], o[1]); c.arc(o[0], o[1], r * 5, a1, a1 + d, d < 0); c.closePath(); c.fill();
  uniquePts(p).forEach(q => { c.beginPath(); c.arc(q[0], q[1], r * 1.25, 0, 7); c.fillStyle = "#fff"; c.fill(); c.lineWidth = r * .45; c.strokeStyle = tape; c.stroke(); });
  if (label != null) { c.font = "700 " + (r * 3.6) + "px -apple-system,Helvetica,sans-serif"; const t = label + "°", tx = o[0] + r * 3, ty = o[1] - r * 3, tw = c.measureText(t).width; c.fillStyle = "rgba(0,0,0,.65)"; c.fillRect(tx - r * .8, ty - r * 3.3, tw + r * 1.6, r * 4.3); c.fillStyle = "#fff"; c.fillText(t, tx, ty); }
  c.globalAlpha = 1;
}
function drawSpark() {
  const w = spark.width, h = spark.height; sctx.clearRect(0, 0, w, h);
  const css = getComputedStyle(document.documentElement), line = css.getPropertyValue("--line").trim(), tape = tapeColor(), muted = css.getPropertyValue("--muted").trim();
  sctx.strokeStyle = line; sctx.lineWidth = 1; for (let i = 0; i <= 4; i++) { const y = 8 + (h - 16) * i / 4; sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(w, y); sctx.stroke(); }
  if (hist.length < 2) { sctx.fillStyle = muted; sctx.font = "600 22px -apple-system,Helvetica,sans-serif"; sctx.fillText("Winkelverlauf", 10, h / 2 + 8); return; }
  const t1 = hist[hist.length - 1][0], t0 = t1 - 12;
  const vs = hist.map(x => sSign ? sSign * x[1] : Math.abs(x[1])); const hi = Math.max(mv.norm[1], ...vs, 10), lo = Math.min(0, ...vs);
  const X = t => (t - t0) / 12 * w, Y = v => 8 + (h - 16) * (1 - (v - lo) / (hi - lo || 1));
  sctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ok-soft").trim(); sctx.fillRect(0, Y(mv.norm[1]), w, Y(mv.norm[0]) - Y(mv.norm[1]));
  sctx.beginPath(); hist.forEach((x, i) => { const px = X(x[0]), py = Y(vs[i]); i ? sctx.lineTo(px, py) : sctx.moveTo(px, py); });
  sctx.strokeStyle = tape; sctx.lineWidth = 3; sctx.stroke();
  sctx.lineTo(X(t1), h); sctx.lineTo(X(hist[0][0]), h); sctx.closePath(); sctx.fillStyle = tape + "22"; sctx.fill();
  if (tracker) tracker.reps.forEach(r => { const y = Y(sSign * r.abs); sctx.setLineDash([6, 6]); sctx.strokeStyle = muted; sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(w, y); sctx.stroke(); sctx.setLineDash([]); });
  const ex = X(t1), ey = Y(vs[vs.length - 1]); sctx.beginPath(); sctx.arc(ex - 4, ey, 6, 0, 7); sctx.fillStyle = tape; sctx.fill();
}

/* --- Standbild prüfen und Punkte korrigieren --- */
function openReview(hold, pick, reps, vals) {
  review = { img: hold.snap.c, s: hold.snap.s, pts: hold.pts.map(p => [p[0] * hold.snap.s, p[1] * hold.snap.s]), sign: sSign, base: pick.clin, reps, vals, idxPick: reps.indexOf(pick), manual: false };
  cv.width = review.img.width; cv.height = review.img.height; drawReview(); $("rnote").hidden = false;
}
function reviewValue() { const raw = rawFrom(mv.cam, review.pts); return review.sign ? review.sign * raw : Math.abs(raw); }
function drawReview() {
  ctx.drawImage(review.img, 0, 0); const v = reviewValue(); drawMeasure(review.pts, 1, Math.round(v));
  setLive(v); drawLevel();
}
/* Ziehen: gemeinsame Punkte (z. B. Kniemitte) bewegen sich zusammen */
let drag = null;
function evPt(e) { const r = cv.getBoundingClientRect(); const s = Math.min(r.width / cv.width, r.height / cv.height); const ox = (r.width - cv.width * s) / 2, oy = (r.height - cv.height * s) / 2; return [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s]; }
cv.addEventListener("pointerdown", e => {
  const P = review ? review.pts : (photo && method === "foto" ? photo.pts : null); if (!P) return;
  const p = evPt(e), tol = Math.max(cv.width, cv.height) / 12; let best = -1, bd = 1e9;
  P.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = i; } });
  if (bd > tol) return;
  const q = P[best]; drag = { P, ids: P.map((x, i) => Math.hypot(x[0] - q[0], x[1] - q[1]) < 1 ? i : -1).filter(i => i >= 0) };
  cv.setPointerCapture(e.pointerId); e.preventDefault();
});
cv.addEventListener("pointermove", e => {
  if (!drag) return; const p = evPt(e); drag.ids.forEach(i => drag.P[i] = p.slice());
  if (review) { review.manual = true; drawReview(); const vals = review.vals.slice(); vals[review.idxPick] = reviewValue();
    const med = W.median(vals); setResult(Object.assign({}, result, { v: med, manual: true, range: Math.max(...vals) - Math.min(...vals) })); }
  else if (photo) { photo.manual = true; drawPhoto(); }
});
["pointerup", "pointercancel"].forEach(t => cv.addEventListener(t, () => drag = null));

/* =================================================================
   Vorführung: simulierte Bewegung durch dieselbe Rechenkette
   ================================================================= */
let demoT = 0, demoRaf = 0, demoStart = 0;
$("c-demo").onclick = () => { unlockAudio(); if (demoOn) { stopDemo(); resetCam(); drawIdle(); renderPick(); return; } stopCam(); startDemo(); };
function startDemo() {
  if (!mv.cam || mv.cam.hand) { toast("Die Vorführung gibt es für Körpermessungen"); return; }
  demoOn = true; cv.width = 720; cv.height = 960; resetCam(); $("c-demo").textContent = "Vorführung beenden"; $("c-done").hidden = false;
  demoStart = performance.now(); setQ("ok", "Vorführung · simuliert"); showAufbau(); demoFrame();
}
function stopDemo() { demoOn = false; cancelAnimationFrame(demoRaf); $("c-demo").textContent = "Vorführung"; showAufbau(); }
/* Zielwinkel pro Wiederholung, mit Rauschen wie bei echter Erkennung */
function demoAngle(t) {
  const targets = [mv.norm[0] * .82, mv.norm[0] * .86, mv.norm[0] * .8].map(x => Math.round(x));
  const cyc = 5.2, i = Math.floor((t - 1.2) / cyc), ph = (t - 1.2) - i * cyc;
  if (t < 1.2 || i >= 3) return 0;
  const T = targets[i], e = x => x < 0 ? 0 : x > 1 ? 1 : (1 - Math.cos(x * Math.PI)) / 2;
  if (ph < 1.4) return T * e(ph / 1.4); if (ph < 2.6) return T; if (ph < 4) return T * (1 - e((ph - 2.6) / 1.4)); return 0;
}
function demoFrame() {
  if (!demoOn) return;
  const t = (performance.now() - demoStart) / 1000, def = mv.cam, w = cv.width, h = cv.height;
  const ang = demoAngle(t) + (Math.random() - .5) * 3.2;
  /* Referenzsegment senkrecht nach unten bzw. passend, bewegtes Segment dreht um seinen Ursprung */
  const unit = 230, cx = w * .5, cy = h * .32;
  const r0 = [cx, cy - (def.zero ? 0 : 0)], r1 = [cx, cy + unit];
  let p;
  const rad = a => a / W.D;
  if (def.ref[1] === def.mov[0]) { /* Kette: z. B. Hüfte-Knie | Knie-Sprunggelenk */
    const a = rad(ang); p = [[cx, cy - unit * .3], [cx, cy + unit * .7], [cx, cy + unit * .7], [cx - Math.sin(a) * unit, cy + unit * .7 + Math.cos(a) * unit]];
  } else if (def.ref[0] === def.mov[0]) { /* gemeinsamer Ursprung: Schulter (Rumpf und Oberarm) */
    const a = rad(ang); p = [[cx, cy], [cx, cy + unit * 1.3], [cx, cy], [cx + Math.sin(a) * unit, cy + Math.cos(a) * unit]];
  } else { /* Sprunggelenk: Unterschenkel und Fuß */
    const a = rad(90 + ang); p = [[cx, cy], [cx, cy + unit * 1.2], [cx - 30, cy + unit * 1.25], [cx - 30 + Math.sin(a) * unit * .8, cy + unit * 1.25 + Math.cos(a) * unit * .8]];
  }
  p = p.map(q => [q[0] + (Math.random() - .5) * 2.5, q[1] + (Math.random() - .5) * 2.5]);
  /* Hintergrund: schematische Figur */
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim() || "#0c141d"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineCap = "round"; ctx.lineWidth = 44;
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[1][0], p[1][1]); ctx.moveTo(p[2][0], p[2][1]); ctx.lineTo(p[3][0], p[3][1]); ctx.stroke();
  /* Landmarks für die Rechenkette aufbauen */
  const lm = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0, visibility: .99 }));
  const idx = defIdx(def, side);
  idx.forEach((ix, i) => { lm[ix] = { x: p[i][0] / w, y: p[i][1] / h, z: 0, visibility: .97 }; });
  /* Schultern/Hüften für die Ansichtsprüfung plausibel setzen */
  const view = def.view === "frontal";
  [[11, 12, cy], [23, 24, cy + 280]].forEach(([a, b, y]) => { if (!idx.includes(a)) lm[a] = { x: (cx - (view ? 90 : 10)) / w, y: y / h, z: 0, visibility: .95 }; if (!idx.includes(b)) lm[b] = { x: (cx + (view ? 90 : 10)) / w, y: y / h, z: 0, visibility: .95 }; });
  const wl = lm.map(q => ({ x: (q.x - .5) * 2, y: (q.y - .5) * 2.6, z: 0 }));
  idx.forEach((ix, i) => { wl[ix] = { x: p[i][0] / 360, y: p[i][1] / 360, z: 0 }; });
  const L = { lm, wl };
  const F = computeFrame(L); F.pts = p;
  curPts = p; drawMeasure(p, 1, null);
  lastRaw = F.raw; accepted++;
  const v = filt.filter(F.raw, t); hist.push([t, v]); while (hist.length && t - hist[0][0] > 12) hist.shift();
  setLive(sSign ? sSign * v : Math.abs(v));
  const ev = tracker.push(v, t); quality.last = [];
  onTrackerEvent(ev, F, []);
  drawSpark(); drawLevel();
  if (demoOn) demoRaf = requestAnimationFrame(demoFrame);
}

/* =================================================================
   Foto: Erkennung schlägt Punkte vor, Therapeut korrigiert
   ================================================================= */
$("file").onchange = async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  stopAll(); method = mv.camOff ? method : "foto"; renderPick();
  const im = new Image(); im.onload = () => { const s = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight)); const c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(im.src);
    photo = { c, pts: null, manual: false }; runPhoto(); };
  im.src = URL.createObjectURL(f);
};
async function runPhoto() {
  if (!photo || !mv.cam) return;
  cv.width = photo.c.width; cv.height = photo.c.height; review = null; $("rnote").hidden = false;
  const w = cv.width, h = cv.height;
  photo.pts = [[.45, .2], [.5, .5], [.5, .5], [.42, .8]].map(p => [p[0] * w, p[1] * h]); photo.manual = false; photo.auto = false;
  drawPhoto(); setQ("warn", "Erkennung läuft …");
  try {
    const t0 = Date.now(), tick = setInterval(() => setQ("warn", "Erkennung läuft … " + Math.round((Date.now() - t0) / 1000) + " s"), 1000);
    let r; try { await ensureDetector(); r = await detectFrame(photo.c, "IMAGE"); } finally { clearInterval(tick); }
    const L = landmarksOf(r);
    if (L) { const idx = defIdx(mv.cam, side); photo.pts = idx.map(i => [L.lm[i].x * w, L.lm[i].y * h]); photo.auto = true; setQ("ok", "Punkte erkannt · bei Bedarf ziehen"); }
    else setQ("warn", "Nichts erkannt · Punkte von Hand setzen");
  } catch (err) { console.error(err); setQ("warn", "Erkennung nicht verfügbar · Punkte von Hand"); }
  drawPhoto();
}
function photoValue() {
  const raw = rawFrom(mv.cam, photo.pts);
  if (mv.cam.unsigned) return mv.dir === "-" ? -raw : raw;
  return Math.abs(raw);
}
function drawPhoto() {
  ctx.drawImage(photo.c, 0, 0); const v = photoValue(); drawMeasure(photo.pts, 1, Math.round(v)); setLive(v);
  const tags = [["warn", "Foto: Kamera senkrecht und auf Gelenkhöhe?"]]; if (photo.manual) tags.push(["ok", "Punkte geprüft"]);
  setResult({ v, n: 1, range: 0, m: "foto", manual: photo.manual, tags, q: photo.manual ? "gut" : "mittel" });
}

/* =================================================================
   Sensor: Schwerkraftvektor, automatischer Nullpunkt und Auslösung
   ================================================================= */
let sen = null;
function sensorPrepare() {
  stopSensor();
  const sm = mv.sen; if (!sm) return;
  sen = { mode: sm.mode, state: "aus", g0: null, gA: null, axis: null, locked: false, live: null, prev: null, unwrap: 0, reps: [], stillSince: 0, offW: 0, lastCap: 0 };
  $("s-start").hidden = false; $("s-reset").hidden = true; $("s-start").textContent = "Sensor starten";
  senText(sm.mode === "two" ? sm.tip1 : sm.tip);
  const an = window.ANL && ANL.A[mv.k]; $("lage").textContent = an ? an.lage : ""; $("lagebox").hidden = !an;
  $("s-howto").hidden = !an; if (!an) howto(false);
  drawDial(null, ""); senSteps(0); senStat();
}
function stopSensor() { if (sen) sen.state = "aus"; keepAwake(false); }
function senText(t) { $("steptxt").textContent = t; }
function senSteps(n) { [...$("steps").children].forEach((s, i) => s.classList.toggle("on", i < n)); }
$("s-start").onclick = async () => {
  unlockAudio(); const ok = await ensureMotion();
  if (!ok) { senText("Kein Zugriff auf den Bewegungssensor. Auf dem iPhone über die Testseite öffnen und „Bewegung und Ausrichtung“ erlauben."); return; }
  setTimeout(() => { if (!gNow) senText("Keine Sensordaten. Am Mac gibt es keinen Bewegungssensor; auf iPhone oder iPad öffnen."); }, 1500);
  sen.state = sen.mode === "two" ? "seg1" : sen.mode === "abs" ? "abs" : "null"; sen.reps = [];
  $("s-start").hidden = true; $("s-reset").hidden = false; keepAwake(true);
  senText(sen.mode === "two" ? mv.sen.tip1 : sen.mode === "abs" ? mv.sen.tip : "Handy anlegen und in Ausgangsstellung ruhig halten. Der Nullpunkt setzt sich von selbst.");
  senSteps(1); speak(sen.mode === "two" ? "Handy auf den ersten Abschnitt legen" : "Ruhig halten");
};
$("s-reset").onclick = () => { sensorPrepare(); resetResult(); };
$("dialwrap").onclick = () => manualCapture();
$("dialwrap").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); manualCapture(); } };
function stillMean() { const win = gWin.map(x => x[1]); return W.isStill(win) ? W.vmean(win) : null; }
function manualCapture() {
  if (!sen || sen.state === "aus" || !gNow) return;
  const g = stillMean() || W.vmean(gWin.slice(-8).map(x => x[1]));
  capture(g, true);
}
/* Winkel in der Messebene, über ±180° hinaus fortgeschrieben */
function senAngle(g) {
  if (sen.mode === "abs") return Math.atan2(Math.hypot(g[2], g[0] * 0), Math.abs(g[1])) * W.D; /* Neigung der Längsachse gegen das Lot in der y-z-Ebene */
  if (!sen.g0) return null;
  let ax = sen.axis;
  if (!sen.locked) { const tot = W.vecAngle(sen.g0, g); if (tot > 8) { ax = W.pickAxis(sen.g0, g); sen.axis = ax; if (tot > 15) sen.locked = true; } else ax = sen.axis ?? 2; }
  const a = W.wrap180(W.planeAngle(g, ax) - W.planeAngle(sen.g0, ax));
  if (sen.prev != null) { const d = W.wrap180(a - sen.prev); sen.unwrap += d; } else sen.unwrap = a;
  sen.prev = a; return sen.unwrap;
}
function sensorTick(t) {
  if (!sen || sen.state === "aus") return;
  const g = gWin.length ? gWin[gWin.length - 1][1] : null; if (!g) return;
  const still = stillMean();
  if (still) { if (!sen.stillSince) sen.stillSince = t; } else sen.stillSince = 0;
  const stillFor = sen.stillSince ? (t - sen.stillSince) / 1000 : 0;
  /* Live-Wert */
  let live = null, off = null;
  if (sen.state === "move" || sen.state === "back") { live = senAngle(g); if (sen.axis != null) off = W.offAxis(g, sen.axis) - W.offAxis(sen.g0, sen.axis); }
  if (sen.state === "abs") { live = senAngle(g); off = Math.asin(Math.max(-1, Math.min(1, g[0] / (W.len(g) || 1)))) * W.D; }
  if (sen.state === "seg2" && sen.gA) { live = Math.abs(W.wrap180(W.planeAngle(g, 2) - W.planeAngle(sen.gA, 2))); off = W.offAxis(g, 2); }
  sen.live = live; sen.off = off;
  if (sen.state === "fertig" && result) { if (t - (sensorTick.lastDraw || 0) > 200) { sensorTick.lastDraw = t; drawDial(Math.abs(result.v), "Ergebnis"); senStat(still, null); } return; }
  if (t - (sensorTick.lastDraw || 0) > 40) { sensorTick.lastDraw = t; drawDial(live == null ? null : Math.abs(live), stillFor > .3 ? "ruhig" : "Bewegung"); senStat(still, off); }
  if (t - sen.lastCap < 900) return;
  /* Zustandsautomat */
  if (sen.state === "null" && still && stillFor > .6) { sen.g0 = still; sen.prev = null; sen.unwrap = 0; sen.axis = null; sen.locked = false; sen.state = "move"; sen.lastCap = t; beep(660, .1); speak("Null. Jetzt bewegen."); senText("Nullpunkt gesetzt. Jetzt bis zur Endstellung bewegen und dort ruhig halten."); senSteps(2); }
  else if (sen.state === "move" && still && stillFor > .6 && live != null && Math.abs(live) >= 8) capture(still, false);
  else if (sen.state === "back" && still && stillFor > .5 && live != null && Math.abs(live) < 6) { sen.state = "move"; sen.lastCap = t; beep(660, .06, .1); senText("Nächste Wiederholung: wieder bis zum Ende bewegen und halten."); }
  else if (sen.state === "abs" && still && stillFor > .6 && live != null && live > 5) capture(still, false);
  else if (sen.state === "seg1" && still && stillFor > .6) capture(still, false);
  else if (sen.state === "seg2" && still && stillFor > .6 && sen.gA && W.vecAngle(sen.gA, still) > 12) capture(still, false);
}
function capture(g, manual) {
  const t = performance.now(); sen.lastCap = t;
  if (sen.state === "null") { sen.g0 = g; sen.prev = null; sen.unwrap = 0; sen.state = "move"; beep(660, .1); senText("Nullpunkt gesetzt. Jetzt bewegen und halten."); senSteps(2); return; }
  if (sen.state === "seg1") { sen.gA = g; sen.state = "seg2"; beep(660, .1); speak("Jetzt umsetzen"); senText(mv.sen.tip2 + " Bei sehr kleinen Winkeln einfach auf die Fläche tippen."); senSteps(2); return; }
  let v = null, off = 0;
  if (sen.state === "move" || sen.state === "back") { const a = senAngle(g); v = Math.abs(a); off = sen.axis != null ? Math.abs(W.offAxis(g, sen.axis) - W.offAxis(sen.g0, sen.axis)) : 0; }
  if (sen.state === "abs") { v = senAngle(g); off = Math.abs(Math.asin(Math.max(-1, Math.min(1, g[0] / W.len(g)))) * W.D); }
  if (sen.state === "seg2") { v = Math.abs(W.wrap180(W.planeAngle(g, 2) - W.planeAngle(sen.gA, 2))); off = Math.max(Math.abs(W.offAxis(g, 2)), Math.abs(W.offAxis(sen.gA, 2)));
    /* bei Extensionsmessung: Restbeugung als Defizit (Neutralstellung nicht erreicht) */
    if (mv.k === "o-de" || mv.k === "o-pf") v = mv.dir === "+" ? 90 - v : v - 90;
    else if (mv.dir === "-") v = -v; }
  if (v == null) return;
  sen.reps.push({ v, off, manual });
  beep(1175, .15); speak(Math.round(Math.abs(v)) + " Grad");
  const n = sen.reps.length, need = sen.mode === "two" ? 1 : cfg.reps;
  sensorResult();
  if (n >= need) { sen.state = "fertig"; senSteps(3); senText("Fertig. Mit „Neu beginnen“ wiederholen oder übernehmen."); keepAwake(false); return; }
  if (sen.state === "move") { sen.state = "back"; senText("Wdh. " + n + " von " + need + ": zurück in die Ausgangsstellung und kurz ruhig halten."); }
  else senText("Wdh. " + n + " von " + need + ": wieder in die Endstellung und ruhig halten.");
}
function sensorResult() {
  const vals = sen.reps.map(r => r.v), med = W.median(vals), range = vals.length > 1 ? Math.max(...vals) - Math.min(...vals) : 0;
  const maxOff = Math.max(...sen.reps.map(r => r.off));
  const tags = []; let q = "gut";
  if (vals.length > 1) tags.push([range <= 4 ? "ok" : range <= 8 ? "warn" : "bad", "Spannweite " + Math.round(range) + "°"]);
  if (range > 8) q = "unsicher";
  tags.push([maxOff <= 10 ? "ok" : maxOff <= 20 ? "warn" : "bad", maxOff <= 10 ? "Messebene gehalten" : "Handy " + Math.round(maxOff) + "° aus der Ebene gekippt"]);
  if (maxOff > 10 && q === "gut") q = "mittel"; if (maxOff > 20) q = "unsicher";
  if (sen.reps.some(r => r.manual)) tags.push(["warn", "per Tipp ausgelöst"]);
  tags.unshift([q === "gut" ? "ok" : q === "mittel" ? "warn" : "bad", "Messgüte " + q]);
  setResult({ v: med, n: vals.length, range, m: "sen", tags, q });
}
function senStat(still, off) {
  const S = $("senstat"); S.innerHTML = "";
  const add = (cls, t) => { const e = document.createElement("span"); e.className = "tag " + cls; e.textContent = t; S.appendChild(e); };
  if (!sen || sen.state === "aus") { add("", "Sensor aus"); return; }
  add(still ? "ok" : "warn", still ? "ruhig" : "in Bewegung");
  if (off != null) { const a = Math.abs(off); add(a <= 10 ? "ok" : a <= 20 ? "warn" : "bad", a <= 10 ? "in der Ebene" : "Handy " + a.toFixed(0) + "° verkippt"); }
  if (sen.reps.length) add("", sen.reps.length + " von " + (sen.mode === "two" ? 1 : cfg.reps) + " Wdh.");
}
function drawDial(v, sub) {
  const css = getComputedStyle(document.documentElement), tape = tapeColor(), line = css.getPropertyValue("--line").trim(), fg = css.getPropertyValue("--fg").trim(), muted = css.getPropertyValue("--muted").trim(), ok = css.getPropertyValue("--ok-soft").trim();
  const R = 104, cx = 130, cy = 130, full = 200;
  const pt = a => { const r = (a / full * 360 - 90) / W.D; return [cx + R * Math.cos(r), cy + R * Math.sin(r)]; };
  const arc = (a0, a1) => { const [x0, y0] = pt(a0), [x1, y1] = pt(a1), lg = (a1 - a0) / full * 360 > 180 ? 1 : 0; return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 ${lg} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const val = v == null ? null : Math.min(full - .01, Math.max(0, v));
  let ticks = ""; for (let a = 0; a < full; a += 10) { const r = (a / full * 360 - 90) / W.D, l = a % 30 === 0 ? 12 : 6; ticks += `<line x1="${(cx + (R + 9) * Math.cos(r)).toFixed(1)}" y1="${(cy + (R + 9) * Math.sin(r)).toFixed(1)}" x2="${(cx + (R + 9 + l) * Math.cos(r)).toFixed(1)}" y2="${(cy + (R + 9 + l) * Math.sin(r)).toFixed(1)}" stroke="${muted}" stroke-width="${a % 30 ? 1 : 2}"/>`; }
  $("dial").innerHTML = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${line}" stroke-width="16"/>
   <path d="${arc(mv.norm[0], Math.min(mv.norm[1], full - .5))}" fill="none" stroke="${ok}" stroke-width="16"/>
   ${val != null && val > .5 ? `<path d="${arc(0, val)}" fill="none" stroke="${tape}" stroke-width="16" stroke-linecap="round"/>` : ""}
   ${ticks}
   <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="54" font-weight="700" fill="${fg}" font-family="-apple-system,Helvetica,sans-serif" style="font-variant-numeric:tabular-nums">${v == null ? "–" : Math.round(v) + "°"}</text>
   <text x="${cx}" y="${cy + 42}" text-anchor="middle" font-size="14" fill="${muted}" font-family="-apple-system,Helvetica,sans-serif">${sub || (sen && sen.state !== "aus" ? "" : "Sensor aus")}</text>`;
}

/* ---------------- Animation „So wird gemessen“ ---------------- */
let howOn = false, howRaf = 0, howT0 = 0;
function howto(on) {
  howOn = on; $("howto").hidden = !on; $("s-howto").setAttribute("aria-expanded", on); $("s-howto").textContent = on ? "So wird gemessen ▾" : "So wird gemessen ▸";
  cancelAnimationFrame(howRaf); if (on) { howT0 = performance.now(); howFrame(); }
}
let howLast = 0;
function howFrame() {
  if (!howOn) return;
  const css = getComputedStyle(document.documentElement), tok = n => css.getPropertyValue(n).trim();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const now = performance.now(), t = reduce ? 3.8 : (now - howT0) / 1000;
  const use3d = window.ANL3 && ANL3.S[mv.k];
  $("how3d").hidden = !use3d; $("howcv").hidden = !!use3d;
  if (use3d) {
    if (now - howLast > 40) { howLast = now; try { const r = ANL3.svg(mv.k, t); $("how3d").innerHTML = r.svg; $("howstep").textContent = r.step; } catch (e) { console.error(e); } }
  } else {
    const ph = ANL.draw($("howcv").getContext("2d"), mv.k, t, { body: tok("--figur"), joint: tok("--gelenk"), screen: tok("--tape"), accent: tok("--tape"), floor: tok("--line"), muted: tok("--muted") });
    if (ph) $("howstep").textContent = ph.step;
  }
  if (!reduce) howRaf = requestAnimationFrame(howFrame);
}
$("s-howto").onclick = () => howto(!howOn);

/* ---------------- Start ---------------- */
$("quellen").textContent = "Richtwerte: " + Object.values(SRC).join("; ") + ".";
renderCfg(); renderPick(); resetCam(); renderList(); drawLevel();
const mq = matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener && mq.addEventListener("change", () => { if (!camOn && !demoOn && !photo) drawIdle(); drawSpark(); if (method === "sen") drawDial(null, ""); });
})();
