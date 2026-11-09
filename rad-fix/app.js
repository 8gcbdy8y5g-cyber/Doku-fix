/* Rad-Fix · Etappe 1: Fahrer, Räder, Ziel und Beschwerden, Eingangsuntersuchung.
   Alles bleibt in localStorage auf diesem Gerät. Keine Verbindung zu Doku-Fix. */
(() => {
'use strict';
const KEY = 'radfix.v1';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const de = (n, d = 1) => n == null || isNaN(n) ? '–' : Number(n).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const deInt = n => n == null || isNaN(n) ? '–' : Math.round(n).toLocaleString('de-DE');
const num = v => { if (v == null) return null; const x = parseFloat(String(v).replace(',', '.')); return isNaN(x) ? null : x; };
const datum = iso => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
const wide = () => matchMedia('(min-width:900px)').matches;

const I = {
  back: '<svg class="i" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  chev: '<svg class="i chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  bike: '<svg class="i" viewBox="0 0 24 24"><circle cx="5.5" cy="16" r="3.5"/><circle cx="18.5" cy="16" r="3.5"/><path d="M5.5 16l4-7h6l3 7M9.5 9L12 16h3.5M8 6.5h3"/></svg>',
  sensor: '<svg class="i" viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M3 9.5a9 9 0 0 0 0 5M21 9.5a9 9 0 0 1 0 5"/></svg>',
  cam: '<svg class="i" viewBox="0 0 24 24"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.5-2.5h7L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  edit: '<svg class="i" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>'
};

/* ---------- Daten ---------- */
let D;
try { D = JSON.parse(localStorage.getItem(KEY)) || { fahrer: [] }; } catch { D = { fahrer: [] }; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch { toast('Speichern nicht möglich'); } };
const fahrer = id => D.fahrer.find(f => f.id === id);
const fitById = id => { for (const f of D.fahrer) { const x = (f.fits || []).find(z => z.id === id); if (x) return [f, x]; } return [null, null]; };
const lastUse = f => Math.max(f.erstellt || 0, ...(f.fits || []).map(x => +new Date(x.datum)));
const sorted = () => [...D.fahrer].sort((a, b) => lastUse(b) - lastUse(a));
const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const rad = (f, id) => (f.raeder || []).find(r => r.id === id) || (f.raeder || [])[0];
const radName = r => r ? (r.name ? r.name : r.typ) : 'Kein Rad';

/* ---------- Fachliches (Entwurf, fachlich prüfen) ---------- */
const ZIELE = ['Komfort', 'Leistung', 'Langstrecke', 'Zeitfahren'];
const BESCHW = ['Knie vorn', 'Knie hinten', 'Knie seitlich', 'LWS', 'Nacken', 'Taube Hände', 'Sitzbereich', 'Füße'];
/* Reihenfolge wie beim Bikefit: Fuß, Sattel, Lenker */
const FOKUS = [
  { k: 'Füße', g: 0, t: 'Cleat längs und Vorfuß', p: 'Druckstellen und Taubheit kommen oft vom Cleat zu weit vorn oder von einem schiefen Vorfuß.' },
  { k: 'Knie seitlich', g: 0, t: 'Kniespur von vorn, Cleat-Drehung', p: 'Wandert das Knie nach innen oder außen, zuerst Drehung und Stand des Cleats ansehen.' },
  { k: 'Knie vorn', g: 1, t: 'Kniewinkel unten, Sattelhöhe', p: 'Ein zu tiefer oder zu weit vorn stehender Sattel erhöht den Druck hinter der Kniescheibe.' },
  { k: 'Knie hinten', g: 1, t: 'Kniewinkel unten, Sattel zu hoch?', p: 'Überstreckung unten zieht an den hinteren Strukturen. Sattelhöhe und Versatz prüfen.' },
  { k: 'Sitzbereich', g: 1, t: 'Beckenbewegung, Sattelneigung', p: 'Schaukelt das Becken, ist der Sattel meist zu hoch. Neigung und Sattelform mit ansehen.' },
  { k: 'LWS', g: 1, t: 'Hüftwinkel oben, Sattelneigung', p: 'Ein enger Hüftwinkel oben zwingt die LWS in die Beugung. 10–15° Sattelneigung nach vorn kann entlasten.' },
  { k: 'Taube Hände', g: 2, t: 'Gewicht auf den Händen', p: 'Sattelversatz, Sattelneigung und Lenkerhöhe bestimmen, wie viel Last auf den Händen liegt.' },
  { k: 'Nacken', g: 2, t: 'Rumpf, Schulter, Ellenbogen, Überhöhung', p: 'Zu viel Sattelüberhöhung oder zu lange Front zwingt den Kopf in die Überstreckung.' }
];
const GRUPPE = ['Fuß', 'Sattel', 'Lenker'];

const TESTS = [
  { k: 'troch', n: 'Trochanterhöhe', sub: 'Maßband · Startwert für die Sattelhöhe', pflicht: true, unit: 'cm', step: .5, min: 60, max: 115, def: 90, d: 1,
    how: 'Stand barfuß, Füße hüftbreit. Vom Boden bis zur Oberkante des Trochanter major messen.' },
  { k: 'ake', n: 'Knie-Extension 90/90', sub: 'Rückenlage · steuert die Lenkerüberhöhung', pflicht: true, unit: '°', step: 1, min: 0, max: 90, def: 20, d: 0,
    how: 'Rückenlage, Hüfte 90° gebeugt und gehalten. Knie aktiv strecken. Gemessen wird das Streckdefizit, also was zur vollen Streckung fehlt. Beide Seiten, je 3 Wiederholungen, der Median zählt.',
    rate: v => v <= 20 ? ['ok', 'unauffällig'] : v <= 30 ? ['warn', 'leicht verkürzt'] : ['bad', 'Defizit'] },
  { k: 'schober', n: 'Modifizierter Schober', sub: 'Maßband · Beweglichkeit der LWS', pflicht: true, unit: 'cm', step: .5, min: 0, max: 12, def: 5, d: 1,
    how: 'Marke am Übergang LWS/Kreuzbein, dazu 10 cm darüber und 5 cm darunter. Eingetragen wird der Zuwachs bei maximaler Vorneigung.',
    rate: v => v >= 5 ? ['ok', 'gut'] : v >= 4 ? ['warn', 'etwas steif'] : ['bad', 'eingeschränkt'] },
  { k: 'bld', n: 'Beinlängendifferenz', sub: 'Maßband oder Brettchen', pflicht: true, unit: 'mm', step: 1, min: 0, max: 30, def: 0, d: 0,
    how: 'Rückenlage, Maßband von der Spina iliaca anterior superior bis zum Innenknöchel, beide Seiten. Oder Brettchen im Stand unter das kürzere Bein.',
    rate: v => v < 5 ? ['ok', 'gering'] : v < 10 ? ['warn', 'beachten'] : ['bad', 'deutlich'] },
  { k: 'vorfuss', n: 'Vorfuß', sub: 'Optional · Varus oder Valgus, für Keile am Cleat', pflicht: false,
    how: 'Bauchlage, Fuß in Neutralstellung halten. Steht der Vorfuß innen höher (Varus) oder außen höher (Valgus)?' }
];
const pflichtOffen = fit => TESTS.filter(t => t.pflicht && fit.t[t.k] == null).length;
const startwerte = (fit, r) => {
  const t = fit.t, kurbel = r?.kurbel || 172.5;
  const sattel = t.troch != null ? Math.round((t.troch * 0.97 - kurbel / 10) * 10) / 10 : null;
  let lenker = null;
  if (t.ake != null && t.schober != null) lenker = (t.ake > 30 || t.schober < 4) ? 'eher gering' : (t.ake > 20 || t.schober < 5) ? 'mittel' : 'sportlich möglich';
  return { sattel, lenker, kurbel };
};
const fmtTest = (tk, fit) => {
  const v = fit.t[tk.k];
  if (tk.k === 'vorfuss') { if (!v) return null; if (v.skip) return 'offen'; return `li. ${v.l || '–'} · re. ${v.r || '–'}`; }
  if (v == null) return null;
  if (tk.k === 'bld') return v === 0 ? '0 mm' : `${deInt(v)} mm`;
  return tk.unit === '°' ? `${deInt(v)}°` : `${de(v, tk.d)} ${tk.unit}`;
};

const dokuText = (f, fit) => {
  const r = rad(f, fit.radId), s = startwerte(fit, r), t = fit.t, a = [];
  a.push(`Bikefit ${r?.typ || 'Rennrad'}, Eingangsuntersuchung.`);
  if (fit.ziele?.length) a.push(`Ziel: ${fit.ziele.join(', ')}.`);
  a.push(fit.beschw?.length ? `Beschwerden beim Fahren: ${fit.beschw.join(', ')}.` : 'Keine Beschwerden beim Fahren.');
  if (t.troch != null) a.push(`Trochanterhöhe ${de(t.troch)} cm, daraus Startwert Sattelhöhe ${de(s.sattel)} cm (Tretlagermitte bis Satteloberkante, Kurbel ${de(s.kurbel, s.kurbel % 1 ? 1 : 0)} mm).`);
  if (t.ake != null) {
    const S = t.akeS || {}, M = t.akeM || {}, sd = ['l', 'r'].filter(k => S[k] != null);
    const wie = [...new Set(sd.map(k => M[k]).filter(Boolean))];
    const mit = wie.length === 1 ? (wie[0] === 'von Hand' ? '' : ` (${wie[0]}, Median aus 3 Wdh.)`) : '';
    a.push(sd.length ? `Knie-Extension 90/90${mit}: Streckdefizit ${sd.map(k => (k === 'l' ? 'links ' : 'rechts ') + deInt(S[k]) + '°').join(', ')}.` : `Knie-Extension 90/90 mit ${deInt(t.ake)}° Streckdefizit.`);
  }
  if (t.schober != null) a.push(`Modifizierter Schober ${de(t.schober)} cm.`);
  if (s.lenker) a.push(`Lenkerüberhöhung ${s.lenker}.`);
  if (t.bld != null) a.push(t.bld === 0 ? 'Keine Beinlängendifferenz.' : `Beinlängendifferenz ${deInt(t.bld)} mm, ${t.bldSeite === 'l' ? 'links' : 'rechts'} kürzer.`);
  const v = t.vorfuss;
  if (v && !v.skip && (v.l || v.r)) a.push(`Vorfuß links ${v.l || 'nicht beurteilt'}, rechts ${v.r || 'nicht beurteilt'}.`);
  else a.push('Vorfuß nicht untersucht.');
  return a.join(' ');
};

/* ---------- Rendering ---------- */
const app = $('#app');
let lastDepth = 0;
const depth = h => h.split('/').filter(Boolean).length;
const go = h => { location.hash = h; };
const sideList = cur => `
  <div class="brand"><img src="icon-192.png" alt="">Rad-Fix</div>
  <nav class="list" aria-label="Fahrer">${sorted().map(f => `
    <a class="row" href="#/f/${f.id}" ${f.id === cur ? 'aria-current="page"' : ''}>
      <span class="ava">${esc(initials(f.name))}</span>
      <span class="t"><b>${esc(f.name)}</b><span>${esc((f.raeder || []).map(radName).join(', ') || 'Kein Rad')}</span></span>
    </a>`).join('')}</nav>
  <button class="btn ghost wide" data-go="#/neu">${I.plus}Neuer Fahrer</button>`;

function render() {
  const h = location.hash.replace(/^#\/?/, '');
  const p = h.split('/').filter(Boolean);
  const d = depth(h), dir = d > lastDepth ? 'push' : d < lastDepth ? 'pop' : '';
  lastDepth = d;
  let side = true, body = '', cur = null;

  if (!p.length) {
    if (!D.fahrer.length) { side = false; body = vEmpty(); }
    else if (wide()) { cur = sorted()[0].id; body = vFahrer(fahrer(cur), true); }
    else body = vListe();
  } else if (p[0] === 'neu') body = vFahrerForm(null);
  else if (p[0] === 'f' && fahrer(p[1])) {
    const f = fahrer(p[1]); cur = f.id;
    if (p[2] === 'bearbeiten') body = vFahrerForm(f);
    else if (p[2] === 'rad') body = vRadForm(f, p[3] === 'neu' ? null : rad(f, p[3]));
    else body = vFahrer(f);
  } else if (p[0] === 'fit') {
    const [f, fit] = fitById(p[1]);
    if (!fit) { go('#/'); return; }
    side = false;
    body = p[2] === '2' ? vUnters(f, fit) : vZiel(f, fit);
  } else { go('#/'); return; }

  const hasSide = side && D.fahrer.length > 0;
  app.className = 'app' + (hasSide ? ' has-side' : '');
  app.innerHTML = `${hasSide ? `<aside class="side">${sideList(cur)}</aside>` : ''}<main class="pane"><div class="view ${dir}">${body}</div></main>`;
  bind();
  scrollTo(0, 0);
}

function vEmpty() {
  return `<div class="empty">
    <img src="icon-192.png" alt="">
    <h1>Rad-Fix</h1>
    <p class="lead">Bikefit fürs Rennrad und Gravelbike. Leg zuerst den Fahrer mit seinem Rad an, dann führt dich die App durch Ziel, Untersuchung und Messung.</p>
    <button class="btn" data-go="#/neu">${I.plus}Ersten Fahrer anlegen</button>
    <p class="note">Alles bleibt auf diesem Gerät. Nichts wird hochgeladen, nichts geht an Doku-Fix.</p>
  </div>`;
}

function vListe() {
  return `<div class="bar"><div class="brand"><img src="icon-192.png" alt="">Rad-Fix</div><span class="grow"></span>
      <button class="icon-btn" data-go="#/neu" aria-label="Neuer Fahrer">${I.plus}</button></div>
    <h1>Fahrer</h1>
    <div class="list">${sorted().map(f => {
      const last = (f.fits || []).slice(-1)[0];
      return `<a class="row" href="#/f/${f.id}">
        <span class="ava">${esc(initials(f.name))}</span>
        <span class="t"><b>${esc(f.name)}</b><span>${esc((f.raeder || []).map(radName).join(', ') || 'Kein Rad')}${last ? ' · ' + datum(last.datum) : ''}</span></span>
        ${I.chev}</a>`; }).join('')}</div>
    <p class="note">Alles bleibt auf diesem Gerät.</p>`;
}

function vFahrer(f, root) {
  const fits = [...(f.fits || [])].reverse();
  const ziel = f.ftp ? `${deInt(Math.round(f.ftp * .6 / 5) * 5)}–${deInt(Math.round(f.ftp * .7 / 5) * 5)}` : null;
  return `<div class="bar">${root || wide() ? '' : `<button class="back" data-go="#/">${I.back}Fahrer</button>`}<span class="grow"></span>
      <button class="link" data-go="#/f/${f.id}/bearbeiten">${I.edit}Bearbeiten</button></div>
    <h1>${esc(f.name)}</h1>
    <div class="facts">
      <div class="fact"><span>Größe</span><b>${f.groesse ? deInt(f.groesse) : '–'} <small>cm</small></b></div>
      <div class="fact"><span>FTP</span><b>${f.ftp ? deInt(f.ftp) : '–'} <small>W</small></b></div>
      <div class="fact"><span>Messung bei</span><b>${ziel || '–'} <small>W</small></b></div>
    </div>
    <button class="btn wide" data-new-fit="${f.id}" ${(f.raeder || []).length ? '' : 'disabled'}>Neuer Bikefit</button>
    <div class="rider-grid">
      <section class="sec">
        <div class="sec-h"><h2>Räder</h2><button class="link" data-go="#/f/${f.id}/rad/neu">${I.plus}Rad</button></div>
        ${(f.raeder || []).length ? `<div class="list">${f.raeder.map(r => `
          <a class="row" href="#/f/${f.id}/rad/${r.id}"><span class="ava">${I.bike}</span>
            <span class="t"><b>${esc(radName(r))}</b><span>${esc(r.typ)} · Kurbel ${de(r.kurbel, r.kurbel % 1 ? 1 : 0)} mm</span></span>
            <span class="v">${r.sattel ? de(r.sattel) + ' cm' : '–'}<small>Sattelhöhe</small></span></a>`).join('')}</div>`
          : `<p class="note">Noch kein Rad. Ohne Rad kein Bikefit.</p>`}
      </section>
      <section class="sec">
        <div class="sec-h"><h2>Verlauf</h2></div>
        ${fits.length ? `<div class="list">${fits.map(x => {
          const r = rad(f, x.radId), s = startwerte(x, r), offen = pflichtOffen(x);
          const st = x.fertig ? `Untersuchung fertig${s.sattel ? ' · Sattel ' + de(s.sattel) + ' cm' : ''}` : (x.schritt === 2 ? (offen ? `Untersuchung, noch ${offen} offen` : 'Untersuchung, noch nicht abgeschlossen') : 'Ziel und Beschwerden offen');
          return `<a class="row" href="#/fit/${x.id}/${x.schritt || 1}">
            <span class="t"><b>${datum(x.datum)}</b><span>${esc(radName(r))} · ${esc(st)}</span></span>
            ${x.fertig ? '<span class="tag ok">fertig</span>' : '<span class="tag warn">offen</span>'}${I.chev}</a>`; }).join('')}</div>`
          : `<p class="note">Noch kein Bikefit. Er startet mit Ziel und Beschwerden, danach folgt die Untersuchung.</p>`}
      </section>
    </div>`;
}

function vFahrerForm(f) {
  const neu = !f;
  return `<div class="bar"><button class="back" data-go="${neu ? '#/' : '#/f/' + f.id}">${I.back}${neu ? 'Abbrechen' : esc(f.name)}</button></div>
    <h1>${neu ? 'Neuer Fahrer' : 'Fahrer bearbeiten'}</h1>
    <form class="sec" id="ff" novalidate>
      <div class="form">
        <div class="field"><label for="fn">Name</label><input type="text" id="fn" value="${esc(f?.name || '')}" placeholder="Vorname N." autocomplete="off" autocapitalize="words" enterkeyhint="next"></div>
        <div class="field"><label for="fg">Körpergröße</label><span class="unit"><input inputmode="numeric" id="fg" value="${f?.groesse ?? ''}" placeholder="180"><span>cm</span></span></div>
        <div class="field"><label for="ft">FTP</label><span class="unit"><input inputmode="numeric" id="ft" value="${f?.ftp ?? ''}" placeholder="250"><span>W</span></span>
          <span class="hint">Daraus rechnet Rad-Fix die Wattzahl für die Messung: 60–70 % der FTP.</span></div>
      </div>
      ${neu ? `<div class="sec-h"><h2>Rad</h2></div>${radFields(null)}` : ''}
      <p class="err" id="ferr" hidden></p>
      <div class="actions">
        ${neu ? '' : `<button type="button" class="btn quiet" id="del">Fahrer löschen</button>`}
        <button class="btn" type="submit">${neu ? 'Anlegen' : 'Sichern'}</button>
      </div>
    </form>`;
}
const KURBEL = [165, 167.5, 170, 172.5, 175];
function radFields(r) {
  const typ = r?.typ || 'Rennrad', k = r?.kurbel || 172.5;
  return `<div class="form">
    <div class="field"><label>Art</label><span class="seg" data-seg="typ">${['Rennrad', 'Gravel'].map(x => `<button type="button" aria-pressed="${x === typ}" data-v="${x}">${x}</button>`).join('')}</span></div>
    <div class="field"><label for="rn">Bezeichnung</label><input type="text" id="rn" value="${esc(r?.name || '')}" placeholder="optional" autocomplete="off"></div>
    <div class="field full"><label>Kurbellänge</label><span class="chips" data-seg="kurbel">${KURBEL.map(x => `<button type="button" class="chip" aria-pressed="${x === k}" data-v="${x}">${de(x, x % 1 ? 1 : 0)} mm</button>`).join('')}</span></div>
    <div class="field"><label for="rs">Sattelhöhe jetzt</label><span class="unit"><input inputmode="decimal" id="rs" value="${r?.sattel != null ? de(r.sattel) : ''}" placeholder="73,5"><span>cm</span></span>
      <span class="hint">Tretlagermitte bis Satteloberkante, entlang des Sattelrohrs. Optional.</span></div>
  </div>`;
}
function vRadForm(f, r) {
  return `<div class="bar"><button class="back" data-go="#/f/${f.id}">${I.back}${esc(f.name)}</button></div>
    <h1>${r ? esc(radName(r)) : 'Neues Rad'}</h1>
    <form class="sec" id="rf" novalidate>${radFields(r)}
      <p class="err" id="ferr" hidden></p>
      <div class="actions">${r ? `<button type="button" class="btn quiet" id="del">Rad löschen</button>` : ''}<button class="btn" type="submit">${r ? 'Sichern' : 'Hinzufügen'}</button></div>
    </form>`;
}

const stepsBar = n => `<div class="steps" aria-label="Schritt ${n} von 8"><ol>${Array.from({ length: 8 }, (_, i) => `<li class="${i + 1 < n ? 'done' : i + 1 === n ? 'now' : ''}"></li>`).join('')}</ol><span>Schritt ${n} von 8</span></div>`;

function fokusListe(fit) {
  const sel = FOKUS.filter(x => fit.beschw.includes(x.k));
  if (!sel.length) return `<div class="focus"><p class="empty-focus">${fit.beschw.length === 0 ? 'Keine Beschwerden gewählt. Rad-Fix prüft dann alle Werte gleich gewichtet und beginnt mit der Sattelhöhe.' : ''}</p></div>`;
  return `<ul class="focus">${sel.map((x, i) => `<li><span class="n">${i + 1}</span><b>${esc(x.t)}</b><p>${esc(GRUPPE[x.g])} · ${esc(x.k)}. ${esc(x.p)}</p></li>`).join('')}</ul>`;
}

function vZiel(f, fit) {
  const raeder = f.raeder || [];
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/f/${f.id}">${I.back}${esc(f.name)}</button></div>
      ${stepsBar(1)}
      <h1>Ziel und Beschwerden</h1>
      <p class="lead">Wofür fährt ${esc(f.name.split(' ')[0])}, und wo tut es weh? Daraus folgt, welche Werte Rad-Fix zuerst prüft.</p>
      <div class="actions"><button class="btn" id="weiter" ${fit.ziele.length ? '' : 'disabled'}>Weiter zur Untersuchung</button></div>
    </div>
    <div class="right">
      ${raeder.length > 1 ? `<section class="sec"><h2>Rad</h2><div class="chips" data-pick="rad">${raeder.map(r => `<button class="chip" aria-pressed="${r.id === fit.radId}" data-v="${r.id}">${I.check}${esc(radName(r))}</button>`).join('')}</div></section>` : ''}
      <section class="sec"><h2>Ziel</h2><div class="chips" data-multi="ziele">${ZIELE.map(z => `<button class="chip" aria-pressed="${fit.ziele.includes(z)}" data-v="${z}">${I.check}${z}</button>`).join('')}</div></section>
      <section class="sec"><h2>Beschwerden beim Fahren</h2><div class="chips" data-multi="beschw">${BESCHW.map(z => `<button class="chip" aria-pressed="${fit.beschw.includes(z)}" data-v="${z}">${I.check}${z}</button>`).join('')}</div></section>
      <section class="sec"><h2>Darauf achtet Rad-Fix</h2><div id="fokus">${fokusListe(fit)}</div></section>
    </div></div>`;
}

function testRow(tk, fit, open) {
  const v = fit.t[tk.k], done = tk.k === 'vorfuss' ? !!v : v != null;
  const shown = fmtTest(tk, fit);
  const rt = tk.rate && v != null ? tk.rate(v) : null;
  let ctl;
  if (tk.k === 'vorfuss') {
    const s = v || {};
    ctl = ['l', 'r'].map(side => `<div class="row-ctl"><label>${side === 'l' ? 'Links' : 'Rechts'}</label><span class="seg" data-vf="${side}">${['Varus', 'neutral', 'Valgus'].map(x => `<button aria-pressed="${s[side] === x}" data-v="${x}">${x}</button>`).join('')}</span></div>`).join('')
      + `<button class="link" data-vf-skip>Überspringen</button>`;
  } else if (tk.k === 'ake') {
    const S = fit.t.akeS || {}, M = fit.t.akeM || {}, se = akeSide(fit), cur = S[se] ?? tk.def;
    ctl = `<div class="sides">${['l', 'r'].map(k => `<button class="side" aria-pressed="${se === k}" data-akeside="${k}"><span>${k === 'l' ? 'Links' : 'Rechts'}</span><b>${S[k] != null ? deInt(S[k]) + '°' : '–'}</b><small>${S[k] != null ? esc(M[k] || 'eingetragen') : 'offen'}</small></button>`).join('')}</div>
      <div class="mess-btns"><button class="btn" data-mess="sensor">${I.sensor}Sensor</button><button class="btn ghost" data-mess="kamera">${I.cam}Kamera</button></div>
      <button class="link" data-hand>${I.edit}Von Hand eintragen</button>
      <div class="hand" data-handbox hidden><div class="stepper"><button data-step="-1" aria-label="weniger">−</button>
        <span class="num"><input inputmode="decimal" data-val value="${cur}" aria-label="Streckdefizit ${se === 'l' ? 'links' : 'rechts'}"><span>Grad Streckdefizit ${se === 'l' ? 'links' : 'rechts'}</span></span>
        <button data-step="1" aria-label="mehr">+</button></div><button class="btn wide" data-take>Wert übernehmen</button></div>`;
  } else {
    const cur = v ?? tk.def;
    ctl = `<div class="stepper"><button data-step="-1" aria-label="weniger">−</button>
        <span class="num"><input inputmode="decimal" data-val value="${tk.d ? de(cur, tk.d) : cur}" aria-label="${esc(tk.n)}"><span>${tk.unit === '°' ? 'Grad Streckdefizit' : tk.unit}</span></span>
        <button data-step="1" aria-label="mehr">+</button></div>`
      + (tk.k === 'bld' ? `<div class="row-ctl" data-bldside ${cur > 0 ? '' : 'hidden'}><label>Kürzer ist</label><span class="seg" data-seg-bld>${[['l', 'links'], ['r', 'rechts']].map(([k, n]) => `<button aria-pressed="${(fit.t.bldSeite || 'r') === k}" data-v="${k}">${n}</button>`).join('')}</span></div>` : '')
      + (v == null ? `<button class="btn wide" data-take>Wert übernehmen</button>` : '');
  }
  return `<div class="test ${done ? 'done' : ''} ${open ? 'open' : ''}" data-test="${tk.k}">
    <button class="test-h" aria-expanded="${!!open}">
      <span class="tick"><span class="dot"></span>${I.check}</span>
      <span class="t"><b>${esc(tk.n)}</b><span>${esc(tk.k === 'ake' && fit.t.akeS ? ['l', 'r'].filter(k => fit.t.akeS[k] != null).map(k => (k === 'l' ? 'links ' : 'rechts ') + deInt(fit.t.akeS[k]) + '°').join(' · ') + ' · der höhere Wert zählt' : tk.sub)}</span></span>
      <span class="val">${shown ? esc(shown) : `<span class="link" style="pointer-events:none">${tk.k === 'vorfuss' ? 'Eintragen' : 'Messen'}</span>`}${rt ? `<small class="c-${rt[0]}">${rt[1]}</small>` : ''}</span>
    </button>
    <div class="test-b"><div><div class="test-in"><p class="how">${esc(tk.how)}</p>${ctl}</div></div></div>
  </div>`;
}

let offenTest = null, akeSel = null;
const akeSide = fit => { const S = fit.t.akeS || {}; if (akeSel) return akeSel; return S.l == null ? 'l' : S.r == null ? 'r' : 'l'; };
function setAke(fit, side, v, wie) {
  const S = fit.t.akeS = fit.t.akeS || {}, M = fit.t.akeM = fit.t.akeM || {};
  S[side] = Math.round(Math.min(90, Math.max(0, v))); M[side] = wie;
  fit.t.ake = Math.max(...['l', 'r'].filter(k => S[k] != null).map(k => S[k]));
  save();
  const other = side === 'l' ? 'r' : 'l';
  if (S[other] == null) { akeSel = other; offenTest = 'ake'; }
  else { akeSel = null; offenTest = (TESTS.find(t => t.pflicht && fit.t[t.k] == null) || TESTS.find(t => t.k === 'vorfuss' && !fit.t.vorfuss) || {}).k || ''; }
}
function vUnters(f, fit) {
  const r = rad(f, fit.radId), offen = pflichtOffen(fit), s = startwerte(fit, r);
  if (offenTest === null) offenTest = (TESTS.find(t => t.pflicht && fit.t[t.k] == null) || {}).k || '';
  const diff = s.sattel != null && r?.sattel ? Math.round((s.sattel - r.sattel) * 10) : null;
  const left = offen ? `<div class="todo"><b>${offen}</b><span>${offen === 1 ? 'Pflichttest fehlt noch' : 'Pflichttests fehlen noch'}. Der Vorfuß darf offen bleiben.</span></div>`
    : `<div class="start" role="status">
        <h2>Startwerte</h2>
        <div class="big"><span>Sattelhöhe</span><b>${de(s.sattel)} cm</b></div>
        ${diff != null ? `<p>Am Rad jetzt ${de(r.sattel)} cm, der Startwert liegt ${diff === 0 ? 'genau dort' : Math.abs(diff) + ' mm ' + (diff < 0 ? 'tiefer' : 'höher')}. Prüfen beim Treten, nicht sofort verstellen.</p>` : ''}
        <div class="split"><span>Lenkerüberhöhung</span><span>${s.lenker}</span></div>
        <span class="src">${de(fit.t.troch)} cm × 97 % − ${de(s.kurbel / 10, 2)} cm Kurbel · Trochanter-Methode. Entwurf, fachlich prüfen.</span>
      </div>`;
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/fit/${fit.id}/1">${I.back}Ziel</button></div>
      ${stepsBar(2)}
      <h1>Eingangs&shy;untersuchung</h1>
      <p class="lead">${offen ? 'Tippe einen Test an, trag den Wert ein, und es geht beim nächsten weiter.' : 'Alle Pflichttests erledigt. Die Startwerte gleicht Rad-Fix später mit der Messung beim Treten ab.'}</p>
      <div id="stand">${left}</div>
      <div class="actions"><button class="btn" id="fertig" ${offen ? 'disabled' : ''}>${fit.fertig ? 'Fertig' : 'Untersuchung abschließen'}</button></div>
    </div>
    <div class="right">
      <div class="tests">${TESTS.map(t => testRow(t, fit, offenTest === t.k)).join('')}</div>
      ${offen ? '' : `<div class="copy"><div class="head"><h2>Text für die Doku</h2><button id="kopie">Kopieren</button></div><p id="doku">${esc(dokuText(f, fit))}</p></div>
      <p class="note">Aufbau seitlich, Aufnahme beim Treten und die Vorschläge kommen mit der nächsten Ausbaustufe.</p>`}
    </div></div>`;
}

/* ---------- Ereignisse ---------- */
function bind() {
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = e => { e.preventDefault(); go(b.dataset.go); });
  app.querySelectorAll('[data-new-fit]').forEach(b => b.onclick = () => {
    const f = fahrer(b.dataset.newFit);
    const fit = { id: uid(), datum: new Date().toISOString(), radId: f.raeder[0]?.id, ziele: [], beschw: [], t: {}, schritt: 1, fertig: false };
    (f.fits = f.fits || []).push(fit); save(); offenTest = null; akeSel = null; go(`#/fit/${fit.id}/1`);
  });
  const segs = root => root.querySelectorAll('[data-seg]').forEach(s => s.querySelectorAll('button').forEach(b => b.onclick = () => {
    s.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  segs(app);
  const segVal = k => app.querySelector(`[data-seg="${k}"] [aria-pressed="true"]`)?.dataset.v;
  const err = m => { const e = $('#ferr'); e.textContent = m; e.hidden = !m; };
  const readRad = r => {
    const s = num($('#rs').value);
    if ($('#rs').value && (s == null || s < 50 || s > 100)) { err('Sattelhöhe bitte in cm, etwa zwischen 60 und 90.'); return null; }
    return Object.assign(r || { id: uid() }, { typ: segVal('typ'), name: $('#rn').value.trim(), kurbel: +segVal('kurbel'), sattel: s });
  };

  const ff = $('#ff');
  if (ff) {
    const id = location.hash.split('/')[2], f = id ? fahrer(id) : null;
    ff.onsubmit = e => {
      e.preventDefault(); err('');
      const name = $('#fn').value.trim(), g = num($('#fg').value), ftp = num($('#ft').value);
      if (!name) { err('Bitte einen Namen eintragen.'); $('#fn').focus(); return; }
      if (g != null && (g < 120 || g > 220)) { err('Körpergröße bitte in cm.'); return; }
      if (ftp != null && (ftp < 60 || ftp > 600)) { err('FTP bitte in Watt, etwa zwischen 100 und 450.'); return; }
      if (f) { Object.assign(f, { name, groesse: g, ftp }); save(); go(`#/f/${f.id}`); toast('Gesichert'); return; }
      const r = readRad(null); if (!r) return;
      const nf = { id: uid(), name, groesse: g, ftp, raeder: [r], fits: [], erstellt: Date.now() };
      D.fahrer.push(nf); save(); go(`#/f/${nf.id}`);
    };
    const del = $('#del');
    if (del) del.onclick = () => {
      if (del.dataset.arm) { D.fahrer = D.fahrer.filter(x => x !== f); save(); go('#/'); toast('Fahrer gelöscht'); return; }
      del.dataset.arm = 1; del.textContent = 'Nochmal tippen zum Löschen';
      setTimeout(() => { if (del.isConnected) { delete del.dataset.arm; del.textContent = 'Fahrer löschen'; } }, 3000);
    };
  }
  const rf = $('#rf');
  if (rf) {
    const p = location.hash.split('/'), f = fahrer(p[2]), r = p[4] === 'neu' ? null : rad(f, p[4]);
    rf.onsubmit = e => { e.preventDefault(); err(''); const nr = readRad(r); if (!nr) return; if (!r) f.raeder.push(nr); save(); go(`#/f/${f.id}`); };
    const del = $('#del');
    if (del) del.onclick = () => {
      if (del.dataset.arm) { f.raeder = f.raeder.filter(x => x !== r); save(); go(`#/f/${f.id}`); return; }
      del.dataset.arm = 1; del.textContent = 'Nochmal tippen zum Löschen';
    };
  }

  const h = location.hash.split('/');
  if (h[1] === 'fit') {
    const [f, fit] = fitById(h[2]);
    if (h[3] === '1') bindZiel(f, fit); else bindUnters(f, fit);
  }
}

function bindZiel(f, fit) {
  fit.schritt = fit.schritt || 1;
  app.querySelectorAll('[data-multi]').forEach(g => g.querySelectorAll('button').forEach(b => b.onclick = () => {
    const arr = fit[g.dataset.multi], v = b.dataset.v, on = !arr.includes(v);
    if (on) arr.push(v); else arr.splice(arr.indexOf(v), 1);
    b.setAttribute('aria-pressed', on); save();
    $('#weiter').disabled = !fit.ziele.length;
    if (g.dataset.multi === 'beschw') $('#fokus').innerHTML = fokusListe(fit);
  }));
  app.querySelectorAll('[data-pick="rad"] button').forEach(b => b.onclick = () => {
    fit.radId = b.dataset.v; save();
    b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  });
  $('#weiter').onclick = () => { if (fit.schritt < 2) fit.schritt = 2; save(); offenTest = null; akeSel = null; go(`#/fit/${fit.id}/2`); };
}

function bindUnters(f, fit) {
  const rerender = () => { const y = scrollY; render(); scrollTo(0, y); };
  app.querySelectorAll('.test').forEach(el => {
    const tk = TESTS.find(t => t.k === el.dataset.test);
    el.querySelector('.test-h').onclick = () => {
      const open = !el.classList.contains('open');
      app.querySelectorAll('.test.open').forEach(x => { x.classList.remove('open'); x.querySelector('.test-h').setAttribute('aria-expanded', false); });
      el.classList.toggle('open', open); el.querySelector('.test-h').setAttribute('aria-expanded', open);
      offenTest = open ? tk.k : '';
    };
    const inp = el.querySelector('[data-val]');
    const commit = (v, weiter) => {
      if (tk.k === 'ake') { if (weiter) { setAke(fit, akeSide(fit), v, 'von Hand'); rerender(); } return; }
      v = Math.min(tk.max, Math.max(tk.min, Math.round(v / tk.step) * tk.step));
      fit.t[tk.k] = +v.toFixed(2);
      if (tk.k === 'bld' && !fit.t.bldSeite) fit.t.bldSeite = 'r';
      save();
      if (weiter) offenTest = (TESTS.find(t => t.pflicht && fit.t[t.k] == null) || TESTS.find(t => t.k === 'vorfuss' && !fit.t.vorfuss) || {}).k || '';
      if (weiter || pflichtOffen(fit) === 0) rerender();
      else { el.querySelector('.val').innerHTML = esc(fmtTest(tk, fit)) + (tk.rate ? `<small class="c-${tk.rate(fit.t[tk.k])[0]}">${tk.rate(fit.t[tk.k])[1]}</small>` : ''); }
    };
    if (inp) {
      const cur = () => num(inp.value) ?? tk.def;
      const show = v => { inp.value = tk.d ? de(v, tk.d) : v; const s = el.querySelector('[data-bldside]'); if (s) s.hidden = !(v > 0); };
      el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
        const v = Math.min(tk.max, Math.max(tk.min, +(cur() + tk.step * +b.dataset.step).toFixed(2)));
        show(v); if (fit.t[tk.k] != null && tk.k !== 'ake') commit(v, false);
      });
      inp.onchange = () => { const v = Math.min(tk.max, Math.max(tk.min, cur())); show(v); if (fit.t[tk.k] != null && tk.k !== 'ake') commit(v, false); };
      inp.onfocus = () => inp.select();
      const take = el.querySelector('[data-take]');
      if (take) take.onclick = () => commit(cur(), true);
    }
    el.querySelectorAll('[data-akeside]').forEach(b => b.onclick = () => { akeSel = b.dataset.akeside; offenTest = 'ake'; rerender(); });
    const hand = el.querySelector('[data-hand]');
    if (hand) hand.onclick = () => { const bx = el.querySelector('[data-handbox]'); bx.hidden = !bx.hidden; hand.setAttribute('aria-expanded', !bx.hidden); };
    el.querySelectorAll('[data-mess]').forEach(b => b.onclick = () => {
      const side = akeSide(fit);
      if (!window.RFMess) { toast('Messung nicht geladen'); return; }
      RFMess.open({ art: b.dataset.mess, seite: side, onDone: v => { setAke(fit, side, v, b.dataset.mess === 'kamera' ? 'Kamera' : 'Sensor'); rerender(); toast(`${side === 'l' ? 'Links' : 'Rechts'} ${v}° eingetragen`); } });
    });
    el.querySelectorAll('[data-seg-bld] button').forEach(b => b.onclick = () => {
      fit.t.bldSeite = b.dataset.v; save(); b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      const d = $('#doku'); if (d) d.textContent = dokuText(f, fit);
    });
    el.querySelectorAll('[data-vf] button').forEach(b => b.onclick = () => {
      const side = b.parentNode.dataset.vf; const v = fit.t.vorfuss && !fit.t.vorfuss.skip ? fit.t.vorfuss : {};
      v[side] = b.dataset.v; fit.t.vorfuss = v; save();
      if (v.l && v.r) { offenTest = ''; rerender(); }
      else b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    });
    const skip = el.querySelector('[data-vf-skip]');
    if (skip) skip.onclick = () => { fit.t.vorfuss = { skip: true }; save(); offenTest = ''; rerender(); };
  });
  const k = $('#kopie');
  if (k) k.onclick = async () => {
    try { await navigator.clipboard.writeText(dokuText(f, fit)); k.textContent = 'Kopiert'; k.classList.add('ok'); setTimeout(() => { k.textContent = 'Kopieren'; k.classList.remove('ok'); }, 1600); }
    catch { toast('Kopieren nicht möglich'); }
  };
  $('#fertig').onclick = () => { fit.fertig = true; save(); go(`#/f/${f.id}`); toast('Untersuchung gesichert'); };
}

let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }

addEventListener('hashchange', render);
matchMedia('(min-width:900px)').addEventListener('change', render);
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
