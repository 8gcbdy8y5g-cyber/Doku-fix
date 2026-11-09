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
    body = p[2] === '2' ? vUnters(f, fit) : p[2] === '3' || p[2] === '4' ? vAufbau(f, fit) : p[2] === '5' ? vErgebnis(f, fit) : p[2] === '7' ? vVorschlag(f, fit) : p[2] === '7e' ? vAendern(f, fit) : p[2] === '8' ? vVergleich(f, fit) : vZiel(f, fit);
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
          const lm = (x.mess || []).slice(-1)[0];
          const st = lm ? `Messung seitlich · Knie unten ${deInt(lm.werte.knieUnten.m)}°` : x.fertig ? `Untersuchung fertig${s.sattel ? ' · Sattel ' + de(s.sattel) + ' cm' : ''}` : (x.schritt === 2 ? (offen ? `Untersuchung, noch ${offen} offen` : 'Untersuchung, noch nicht abgeschlossen') : 'Ziel und Beschwerden offen');
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

const NAMEN = ['Ziel', 'Untersuchung', 'Aufbau', 'Aufnahme', 'Ergebnis', 'Front', 'Vorschlag', 'Abschluss'];
const stepsBar = n => {
  const look = document.documentElement.dataset.look;
  if (look === 'a') {
    const r = 26, c = 2 * Math.PI * r, seg = c / 8;
    const arcs = Array.from({ length: 8 }, (_, i) => `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${i + 1 < n ? 'var(--tape)' : i + 1 === n ? 'var(--hit)' : 'var(--line)'}" stroke-width="5" stroke-dasharray="${(seg - 4).toFixed(1)} ${(c - seg + 4).toFixed(1)}" stroke-dashoffset="${(-i * seg).toFixed(1)}" transform="rotate(-90 32 32)" stroke-linecap="round"/>`).join('');
    return `<div class="ring" aria-label="Schritt ${n} von 8"><svg viewBox="0 0 64 64">${arcs}<text x="32" y="38" text-anchor="middle" font-weight="900" font-size="18" fill="currentColor" font-family="Outfit">${n}</text></svg><div><b>${NAMEN[n - 1]}</b><span>Schritt ${n} von 8 · dann ${NAMEN[n] || 'fertig'}</span></div></div>`;
  }
  if (look === 'c') return `<div class="lap" aria-label="Schritt ${n} von 8"><b>${n}<small>/8</small></b><ol>${Array.from({ length: 8 }, (_, i) => `<li class="${i + 1 < n ? 'done' : i + 1 === n ? 'now' : ''}"></li>`).join('')}</ol></div>`;
  return stepsBarStd(n);
};
const stepsBarStd = n => `<div class="steps" aria-label="Schritt ${n} von 8"><ol>${Array.from({ length: 8 }, (_, i) => `<li class="${i + 1 < n ? 'done' : i + 1 === n ? 'now' : ''}"></li>`).join('')}</ol><span>Schritt ${n} von 8</span></div>`;

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
    ctl = `<div class="sides">${['l', 'r'].map(k => `<button class="lr" aria-pressed="${se === k}" data-akeside="${k}"><span>${k === 'l' ? 'Links' : 'Rechts'}</span><b>${S[k] != null ? deInt(S[k]) + '°' : '–'}</b><small>${S[k] != null ? esc(M[k] || 'eingetragen') : 'offen'}</small></button>`).join('')}</div>
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
      <div class="actions"><button class="btn" id="fertig" ${offen ? 'disabled' : ''}>Weiter zum Aufbau</button></div>
    </div>
    <div class="right">
      <div class="tests">${TESTS.map(t => testRow(t, fit, offenTest === t.k)).join('')}</div>
      ${offen ? '' : `<div class="copy"><div class="head"><h2>Text für die Doku</h2><button id="kopie">Kopieren</button></div><p id="doku">${esc(dokuText(f, fit))}</p></div>
      `}
    </div></div>`;
}

/* ---------- Schritt 3 bis 5 ---------- */
const zielWatt = f => f.ftp ? `${deInt(Math.round(f.ftp * .6 / 5) * 5)}–${deInt(Math.round(f.ftp * .7 / 5) * 5)} W` : 'lockere Last';
const AUFBAU_SVG = `<svg viewBox="0 0 520 300" aria-hidden="true" class="aufbau-svg">
  <line x1="20" y1="262" x2="500" y2="262" stroke="#d1d1d6" stroke-width="2"/>
  <rect x="150" y="244" width="200" height="18" rx="6" fill="#c9cdbf"/>
  <circle cx="175" cy="210" r="48" fill="none" stroke="#9aa08e" stroke-width="7"/><circle cx="330" cy="210" r="48" fill="none" stroke="#9aa08e" stroke-width="7"/>
  <path d="M175 210 L235 210 L210 120 M235 210 L300 125 L210 120 M300 125 L330 210 M300 125 L305 100" stroke="#9aa08e" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M196 116h30M296 100h22" stroke="#6b705f" stroke-width="7" stroke-linecap="round"/>
  <circle cx="235" cy="210" r="14" fill="none" stroke="#6b705f" stroke-width="5"/>
  <path d="M212 112 L262 52 L300 98" stroke="#4f6d10" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="266" cy="38" r="15" fill="#4f6d10"/>
  <path d="M212 112 L248 160 L238 222" stroke="#4f6d10" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(460 200)"><rect x="-5" y="0" width="10" height="62" fill="#9aa08e"/><rect x="-22" y="-6" width="44" height="8" rx="3" fill="#9aa08e"/><rect x="-11" y="-40" width="22" height="34" rx="5" fill="#1a1a1a"/><circle cx="-6" cy="-23" r="3.5" fill="#ddf6a2"/></g>
  <path d="M440 278 L250 278" stroke="#4f6d10" stroke-width="2" stroke-dasharray="5 5"/><text x="345" y="294" text-anchor="middle" font-size="14" font-weight="700" fill="#4f6d10" font-family="Outfit">2,5–3 m</text>
  <path d="M452 178 L270 205" stroke="#ddf6a2" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
</svg>`;
function vAufbau(f, fit) {
  const alt = (fit.mess || []).length;
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/fit/${fit.id}/2">${I.back}Untersuchung</button></div>
      ${stepsBar(3)}
      <h1>Aufbau seitlich</h1>
      <p class="lead">Rad auf die Rolle, Gerät seitlich daneben. Den Rest prüft Rad-Fix mit der Kamera und startet die Aufnahme von selbst.</p>
      <div class="ziel-last"><div><span>Leistung</span><b>${esc(zielWatt(f).replace(' W', ''))} <small>W</small></b></div><div><span>Trittfrequenz</span><b>85–90 <small>/min</small></b></div></div>
      <div class="actions"><button class="btn" id="kamstart">${I.cam}Kamera starten</button></div>
    </div>
    <div class="right">
      <div class="aufbau-bild">${AUFBAU_SVG}</div>
      <ul class="focus">
        <li><span class="n">1</span><b>Gerät auf Höhe des Tretlagers</b><p>Auf einen Hocker oder ein Stativ, quer, Kamera zeigt genau seitlich aufs Rad. 2,5 bis 3 m Abstand.</p></li>
        <li><span class="n">2</span><b>Kopf bis Fuß und beide Laufräder im Bild</b><p>Helles Licht von vorn, enge Hose, Schuhe wie beim Fahren. Hände an den Bremsgriffen.</p></li>
        <li><span class="n">3</span><b>Erst warm fahren</b><p>2 bis 3 Minuten locker, dann bei der Zielleistung. Ton und Signal zeigen Start und Ende.</p></li>
      </ul>
      ${alt ? `<p class="note">${alt === 1 ? 'Eine Aufnahme' : alt + ' Aufnahmen'} gespeichert. <button class="link" data-go="#/fit/${fit.id}/5">Ergebnis ansehen</button></p>` : ''}
    </div></div>`;
}
function bindAufbau(f, fit) {
  $('#kamstart').onclick = () => {
    if (!window.RFAuf) { toast('Aufnahme nicht geladen'); return; }
    RFAuf.open({ fahrer: f, fit, quelle: window.__rfQuelle, onDone: res => {
      (fit.mess = fit.mess || []).push(res);
      const offen = (fit.aend || []).find(a => a.nachIdx == null);
      if (offen) { offen.nachIdx = fit.mess.length - 1; fit.schritt = 8; save(); go(`#/fit/${fit.id}/8`); return; }
      fit.schritt = 5; save(); go(`#/fit/${fit.id}/5`);
    } });
  };
}

const ERG = [
  { k: 'knieUnten', n: 'Knie unten', sub: 'Beugung, Pedal auf 6 Uhr', ziel: [30, 40], belegt: true },
  { k: 'knieOben', n: 'Knie oben', sub: 'Beugung, Pedal auf 12 Uhr' },
  { k: 'hueftOben', n: 'Hüfte oben', sub: 'Rumpf zu Oberschenkel' },
  { k: 'sprungUnten', n: 'Sprunggelenk unten', sub: 'Unterschenkel zu Fuß', ziel: [109, 123] },
  { k: 'rumpf', n: 'Rumpf', sub: 'zur Waagerechten', ziel: [30, 60] },
  { k: 'schulter', n: 'Schulter', sub: 'Rumpf zu Oberarm', ziel: [105, 119] },
  { k: 'ellbogen', n: 'Ellenbogen', sub: 'Beugung an den Griffen', ziel: [11, 27] },
  { k: 'rpm', n: 'Trittfrequenz', sub: 'während der Aufnahme', ziel: [85, 90], unit: '/min' }
];
const ampel = (v, z) => !z ? null : v >= z[0] && v <= z[1] ? 'ok' : (v < z[0] ? z[0] - v : v - z[1]) <= 5 ? 'warn' : 'bad';
function knieSatz(v) {
  if (v < 30) return `Knie unten ${deInt(v)}°, gestreckter als 30–40°. Der Sattel steht eher zu hoch.`;
  /* Beugung klein = Bein fast gestreckt = Sattel hoch */
  if (v > 40) return `Knie unten ${deInt(v)}°, stärker gebeugt als 30–40°. Der Sattel steht eher zu tief.`;
  return `Knie unten ${deInt(v)}°, im Zielbereich 30–40°. Die Sattelhöhe passt.`;
}
const messText = m => {
  const w = m.werte, sd = m.seite === 'l' ? 'links' : 'rechts';
  return `Videoanalyse seitlich beim Treten, ${sd} (${m.n} Umdrehungen, ${deInt(w.rpm.m)}/min): Kniebeugung unten ${deInt(w.knieUnten.m)}° (Ziel 30–40°), oben ${deInt(w.knieOben.m)}°. Sprunggelenk unten ${deInt(w.sprungUnten.m)}°, Rumpf ${deInt(w.rumpf.m)}° zur Waagerechten, Schulter ${deInt(w.schulter.m)}°, Ellenbogen ${deInt(w.ellbogen.m)}° gebeugt.`;
};
function vErgebnis(f, fit) {
  const m = (fit.mess || []).slice(-1)[0];
  if (!m) return vAufbau(f, fit);
  const w = m.werte, kn = w.knieUnten.m;
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/fit/${fit.id}/3">${I.back}Aufbau</button></div>
      ${stepsBar(5)}
      <h1>Ergebnis seitlich</h1>
      <p class="lead">${esc(knieSatz(kn))}</p>
      <div class="big-knie ${ampel(kn, [30, 40])}"><span>Knie unten</span><b>${deInt(kn)}°</b><small>± ${de(w.knieUnten.sd)}° über ${m.n} Umdrehungen · Ziel 30–40°</small></div>
      <div class="actions"><button class="btn ghost" id="neu">Neu messen</button><button class="btn" data-go="#/fit/${fit.id}/7">Vorschläge</button></div>
    </div>
    <div class="right">
      ${m.bild ? `<div class="still"><img src="${m.bild}" alt="Standbild mit eingezeichneten Winkeln, Pedal unten"></div>` : ''}
      <div class="erg">${ERG.map(e => { const v = w[e.k]; if (!v) return ''; const a = ampel(v.m, e.ziel);
        return `<div class="erg-row"><div class="t"><b>${e.n}</b><span>${e.sub}</span></div>
          <div class="v ${a ? 'c-' + a : ''}">${deInt(v.m)}${e.unit ? '' : '°'}<small>± ${de(v.sd)}</small></div>
          <div class="z">${e.ziel ? `${e.ziel[0]}–${e.ziel[1]}${e.unit ? '' : '°'}` : '–'}<small>${e.belegt ? 'belegt' : e.ziel ? 'Richtwert' : 'kein Richtwert'}</small></div></div>`; }).join('')}</div>
      <p class="note">Nur das Knie unten ist durch Studien belegt (Bini 2011, Ferrer-Roca 2012). Die übrigen Richtwerte sind Mittelwerte trainierter Fahrer (Holliday &amp; Swart 2021). Entwurf, fachlich prüfen.</p>
      <div class="copy"><div class="head"><h2>Text für die Doku</h2><button id="kopie">Kopieren</button></div><p>${esc(messText(m))}</p></div>
      <p class="note">Frontansicht, Vorschläge in Millimetern und der Vorher-nachher-Vergleich kommen als Nächstes.</p>
    </div></div>`;
}
function bindErgebnis(f, fit) {
  const m = (fit.mess || []).slice(-1)[0];
  const n = $('#neu'); if (n) n.onclick = () => go(`#/fit/${fit.id}/3`);
  const k = $('#kopie');
  if (k && m) k.onclick = async () => { try { await navigator.clipboard.writeText(messText(m)); k.textContent = 'Kopiert'; k.classList.add('ok'); setTimeout(() => { k.textContent = 'Kopieren'; k.classList.remove('ok'); }, 1600); } catch { toast('Kopieren nicht möglich'); } };
  if (!m) bindAufbau(f, fit);
}

/* ---------- Schritt 7 und 8: Vorschläge, Änderung, Vergleich (Entwurf, fachlich prüfen) ---------- */
const AEND = {
  sattelhoehe: { n: 'Sattelhöhe', u: 'mm', tx: v => `Sattel ${Math.abs(v)} mm ${v < 0 ? 'tiefer' : 'höher'}`, step: 1 },
  sattelversatz: { n: 'Sattel vor/zurück', u: 'mm', tx: v => `Sattel ${Math.abs(v)} mm ${v < 0 ? 'nach vorn' : 'nach hinten'}`, step: 1 },
  sattelneigung: { n: 'Sattelneigung', u: '°', tx: v => `Sattelspitze ${Math.abs(v)}° ${v < 0 ? 'nach unten' : 'nach oben'}`, step: 1 },
  cleat: { n: 'Cleat längs', u: 'mm', tx: v => `Cleat ${Math.abs(v)} mm ${v < 0 ? 'nach vorn' : 'nach hinten'}`, step: 1 },
  front: { n: 'Front höher/tiefer', u: 'mm', tx: v => `Lenker ${Math.abs(v)} mm ${v < 0 ? 'tiefer' : 'höher'}`, step: 5 },
  vorbau: { n: 'Vorbaulänge', u: 'mm', tx: v => `Vorbau ${Math.abs(v)} mm ${v < 0 ? 'kürzer' : 'länger'}`, step: 10 }
};
/* 1° Kniebeugung entspricht bei normaler Beinlänge etwa 2,5 mm Sattelhöhe (Geometrie Oberschenkel/Unterschenkel je ~45 cm) */
const MM_PRO_GRAD = 2.5;
function vorschlaege(f, fit) {
  const m = (fit.mess || []).slice(-1)[0]; if (!m) return [];
  const w = m.werte, b = fit.beschw || [], t = fit.t || {}, out = [];
  /* Fuß zuerst */
  if (b.includes('Füße')) out.push({ g: 0, typ: 'cleat', wert: 2, titel: 'Cleat 2 mm nach hinten', grund: 'Brennende oder taube Füße kommen oft von einem zu weit vorn sitzenden Cleat. Kleine Schritte, 2 mm reichen für den Anfang.', q: 'Erfahrungswert' });
  const vf = t.vorfuss; if (vf && !vf.skip && (vf.l === 'Varus' || vf.r === 'Varus' || vf.l === 'Valgus' || vf.r === 'Valgus') && b.includes('Knie seitlich'))
    out.push({ g: 0, typ: null, titel: 'Keil am Cleat prüfen', grund: `Vorfuß ${vf.l === vf.r ? vf.l : 'li. ' + (vf.l || '–') + ', re. ' + (vf.r || '–')} und Knie seitlich. Ob ein Keil hilft, zeigt erst die Frontansicht.`, q: 'Hannaford' });
  /* Sattel */
  const K = w.knieUnten.m;
  if (K < 30 || K > 40) {
    let mm = Math.round(Math.min(10, Math.max(3, Math.abs(K - 35) * MM_PRO_GRAD)));
    const v = K < 30 ? -mm : mm;
    let grund = `Knie unten ${deInt(K)}° statt 30–40°${K < 30 ? ', das Bein ist unten fast gestreckt' : ', das Knie bleibt unten zu stark gebeugt'}.`;
    if (K < 30 && w.sprungUnten.m > 123) grund += ` Die Fußspitze zeigt unten stark nach unten (${deInt(w.sprungUnten.m)}°), oft ein Ausgleich für einen zu hohen Sattel.`;
    if (b.includes('Knie vorn') && K > 40) grund += ' Passt zu den Beschwerden vorn am Knie.';
    if (b.includes('Knie hinten') && K < 30) grund += ' Passt zu den Beschwerden hinten am Knie.';
    grund += ' Höchstens 10 mm auf einmal, dann neu messen; lieber etwas zu tief als zu hoch.';
    out.push({ g: 1, typ: 'sattelhoehe', wert: v, titel: AEND.sattelhoehe.tx(v), grund, q: 'Bini 2011 · Ferrer-Roca 2012 · Hogg' });
  }
  if (b.includes('LWS')) out.push({ g: 1, typ: 'sattelneigung', wert: -3, titel: 'Sattelspitze 3° nach unten', grund: 'Bei Rückenschmerzen entlastet eine nach vorn geneigte Sattelfläche, in Studien bis 10–15°. In kleinen Schritten anfangen.', q: 'Barrajón 2026' });
  /* Lenker */
  const nacken = b.includes('Nacken') || b.includes('Taube Hände');
  if (w.rumpf.m < 30 || (nacken && (t.ake > 30 || w.ellbogen.m < 11)))
    out.push({ g: 2, typ: 'front', wert: 10, titel: 'Lenker 10 mm höher', grund: `Rumpf ${deInt(w.rumpf.m)}° zur Waagerechten, Ellenbogen ${deInt(w.ellbogen.m)}°${t.ake != null ? `, Knie-Extension mit ${deInt(t.ake)}° Defizit` : ''}${nacken ? ', dazu Nacken oder taube Hände' : ''}. Spacer unter den Vorbau.`, q: 'Holliday & Swart 2021 · Erfahrungswert' });
  else if (w.schulter.m > 119) out.push({ g: 2, typ: 'vorbau', wert: -10, titel: 'Vorbau 10 mm kürzer', grund: `Schulter ${deInt(w.schulter.m)}° (Richtwert 105–119°), die Arme sind lang gestreckt.`, q: 'Holliday & Swart 2021' });
  out.sort((a, c) => a.g - c.g);
  return out;
}
const GRP = ['Zuerst · Fuß', 'Dann · Sattel', 'Zum Schluss · Lenker'];
function vVorschlag(f, fit) {
  const vs = vorschlaege(f, fit), m = (fit.mess || []).slice(-1)[0];
  if (!m) return vAufbau(f, fit);
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/fit/${fit.id}/5">${I.back}Ergebnis</button></div>
      ${stepsBar(7)}
      <h1>Schritt für Schritt</h1>
      <p class="lead">Die Reihenfolge folgt dem Bikefit: Fuß, Sattel, Lenker. Immer nur eine Änderung, dann neu messen. Du entscheidest.</p>
      <p class="note">Entwurf, fachlich prüfen. Zielbereiche sind Richtwerte, kein Ersatz für den Blick auf den tretenden Fahrer.</p>
      <div class="actions">${vs.length && vs[0].typ ? `<button class="btn" data-go="#/fit/${fit.id}/7e">Vorschlag 1 umsetzen</button>` : `<button class="btn" data-go="#/f/${f.id}">Fertig</button>`}</div>
    </div>
    <div class="right">
      ${vs.length ? vs.map((v, i) => `<div class="vor ${i === 0 ? 'erst' : ''}">
        <div class="vor-h"><span class="n">${i + 1}</span><span>${i === 0 ? 'Zuerst' : 'Danach'} · ${['Fuß', 'Sattel', 'Lenker'][v.g]}</span></div>
        <b>${esc(v.titel)}</b><p>${esc(v.grund)}</p><small>${esc(v.q)}</small>
        ${i > 0 && v.typ ? `<button class="link" data-wahl="${i}">Stattdessen diesen umsetzen</button>` : ''}</div>`).join('')
        : `<div class="vor erst"><b>Nichts ändern</b><p>Knie unten ${deInt(m.werte.knieUnten.m)}° liegt im Zielbereich, und keine Beschwerde spricht für eine Änderung. Nach 6 bis 8 Wochen Fahren noch einmal messen.</p><small>Hogg</small></div>`}
    </div></div>`;
}
let wahl = 0;
function bindVorschlag(f, fit) { wahl = 0; app.querySelectorAll('[data-wahl]').forEach(b => b.onclick = () => { wahl = +b.dataset.wahl; go(`#/fit/${fit.id}/7e`); }); }
function vAendern(f, fit) {
  const vs = vorschlaege(f, fit).filter(v => v.typ), v = vs[Math.min(wahl, vs.length - 1)] || { typ: 'sattelhoehe', wert: 0 };
  const r = rad(f, fit.radId);
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/fit/${fit.id}/7">${I.back}Vorschläge</button></div>
      ${stepsBar(7)}
      <h1>Was hast du geändert?</h1>
      <p class="lead">Trag ein, was du am Rad wirklich verstellt hast. Nur so passt der Vergleich vorher und nachher.</p>
      <div class="tipp"><b>Tipp</b><span>Vorher die Sattelstütze mit Klebeband markieren. Dann ist der Weg zurück jederzeit möglich.</span></div>
      <div class="actions"><button class="btn" id="geaendert">Geändert, neu messen</button></div>
    </div>
    <div class="right">
      <div class="aend" data-typ="${v.typ}">
        <div class="aend-h"><b id="atitel">${esc(AEND[v.typ].n)}</b><span>Vorschlag ${esc(v.titel || '')}</span></div>
        <div class="stepper"><button data-astep="-1" aria-label="weniger">−</button>
          <span class="num"><input inputmode="numeric" id="awert" value="${v.wert}" aria-label="Änderung"><span id="aunit">${AEND[v.typ].u}${v.typ === 'sattelhoehe' && r?.sattel ? ' · jetzt ' + de(r.sattel) + ' cm' : ''}</span></span>
          <button data-astep="1" aria-label="mehr">+</button></div>
        <p class="note" id="arich">${esc(AEND[v.typ].tx(v.wert || 0))}</p>
      </div>
      <h2>Stattdessen etwas anderes verstellt?</h2>
      <div class="chips" id="atypen">${Object.entries(AEND).map(([k, a]) => `<button class="chip" aria-pressed="${k === v.typ}" data-v="${k}">${I.check}${a.n}</button>`).join('')}</div>
      <div class="warn-box">Mehr als eine Änderung auf einmal? Dann lässt sich nicht sagen, welche gewirkt hat.</div>
    </div></div>`;
}
function bindAendern(f, fit) {
  const box = $('.aend'), inp = $('#awert');
  const upd = () => { const t = box.dataset.typ, v = parseInt(inp.value, 10) || 0; $('#arich').textContent = v ? AEND[t].tx(v) : 'Keine Änderung eingetragen'; };
  app.querySelectorAll('[data-astep]').forEach(b => b.onclick = () => { const t = box.dataset.typ; inp.value = (parseInt(inp.value, 10) || 0) + AEND[t].step * +b.dataset.astep; upd(); });
  inp.oninput = upd;
  app.querySelectorAll('#atypen button').forEach(b => b.onclick = () => {
    box.dataset.typ = b.dataset.v; $('#atitel').textContent = AEND[b.dataset.v].n; $('#aunit').textContent = AEND[b.dataset.v].u; inp.value = 0; upd();
    app.querySelectorAll('#atypen button').forEach(x => x.setAttribute('aria-pressed', x === b));
  });
  $('#geaendert').onclick = () => {
    const typ = box.dataset.typ, wert = parseInt(inp.value, 10) || 0;
    if (!wert) { toast('Bitte eintragen, um wie viel du verstellt hast'); return; }
    const r = rad(f, fit.radId);
    if (typ === 'sattelhoehe' && r && r.sattel) r.sattel = Math.round((r.sattel + wert / 10) * 10) / 10;
    (fit.aend = fit.aend || []).push({ typ, wert, datum: new Date().toISOString(), vorIdx: fit.mess.length - 1, nachIdx: null });
    fit.schritt = 3; save(); go(`#/fit/${fit.id}/3`); toast('Gespeichert. Jetzt neu messen.');
  };
}
const VGL = [['knieUnten', 'Knie unten', [30, 40]], ['knieOben', 'Knie oben'], ['sprungUnten', 'Sprunggelenk unten', [109, 123]], ['rumpf', 'Rumpf', [30, 60]], ['schulter', 'Schulter', [105, 119]], ['ellbogen', 'Ellenbogen', [11, 27]]];
function vergleichText(fit, a) {
  const v = fit.mess[a.vorIdx].werte, n = fit.mess[a.nachIdx].werte;
  return `Bikefit, Videoanalyse seitlich beim Treten. Änderung: ${AEND[a.typ].tx(a.wert)}. Kniebeugung unten von ${deInt(v.knieUnten.m)}° auf ${deInt(n.knieUnten.m)}° (Ziel 30–40°), Sprunggelenk unten von ${deInt(v.sprungUnten.m)}° auf ${deInt(n.sprungUnten.m)}°, Rumpf von ${deInt(v.rumpf.m)}° auf ${deInt(n.rumpf.m)}°, Ellenbogen von ${deInt(v.ellbogen.m)}° auf ${deInt(n.ellbogen.m)}°.`;
}
function vVergleich(f, fit) {
  const a = (fit.aend || []).filter(x => x.nachIdx != null).slice(-1)[0];
  if (!a) return vVorschlag(f, fit);
  const v = fit.mess[a.vorIdx].werte, n = fit.mess[a.nachIdx].werte, r = rad(f, fit.radId);
  const kv = v.knieUnten.m, kn = n.knieUnten.m, ok = kn >= 30 && kn <= 40;
  return `<div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-go="#/fit/${fit.id}/7">${I.back}Vorschläge</button></div>
      ${stepsBar(8)}
      <h1>Vorher, nachher</h1>
      <p class="lead">Nach ${esc(AEND[a.typ].tx(a.wert))}: Knie unten von ${deInt(kv)}° auf ${deInt(kn)}°. ${ok ? 'Jetzt im Zielbereich.' : 'Noch nicht im Zielbereich, ein weiterer kleiner Schritt kann helfen.'}</p>
      ${r?.sattel ? `<div class="ziel-last"><div><span>Sattelhöhe jetzt</span><b>${de(r.sattel)} <small>cm</small></b></div><div><span>Änderungen</span><b>${fit.aend.length}</b></div></div>` : ''}
      <div class="actions"><button class="btn ghost" data-go="#/fit/${fit.id}/7">Nächste Änderung</button><button class="btn" data-go="#/f/${f.id}">Fertig</button></div>
    </div>
    <div class="right">
      <div class="erg vgl"><div class="erg-row head"><div>Wert</div><div>Vorher</div><div>Nachher</div><div>Ziel</div></div>
        ${VGL.map(([k, nm, z]) => { const a1 = ampel(v[k].m, z), a2 = ampel(n[k].m, z);
          return `<div class="erg-row"><div class="t"><b>${nm}</b></div><div class="v sm ${a1 ? 'c-' + a1 : ''}">${deInt(v[k].m)}°</div><div class="v ${a2 ? 'c-' + a2 : ''}">${deInt(n[k].m)}°</div><div class="z">${z ? z[0] + '–' + z[1] + '°' : '–'}</div></div>`; }).join('')}</div>
      <div class="copy"><div class="head"><h2>Text für die Doku</h2><button id="kopie">Kopieren</button></div><p>${esc(vergleichText(fit, a))}</p></div>
      <p class="note">PDF-Bericht und Frontansicht kommen als Nächstes.</p>
    </div></div>`;
}
function bindVergleich(f, fit) {
  const a = (fit.aend || []).filter(x => x.nachIdx != null).slice(-1)[0], k = $('#kopie');
  if (k && a) k.onclick = async () => { try { await navigator.clipboard.writeText(vergleichText(fit, a)); k.textContent = 'Kopiert'; k.classList.add('ok'); setTimeout(() => { k.textContent = 'Kopieren'; k.classList.remove('ok'); }, 1600); } catch { toast('Kopieren nicht möglich'); } };
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
    if (h[3] === '1') bindZiel(f, fit); else if (h[3] === '2') bindUnters(f, fit); else if (h[3] === '5') bindErgebnis(f, fit); else if (h[3] === '7') bindVorschlag(f, fit); else if (h[3] === '7e') bindAendern(f, fit); else if (h[3] === '8') bindVergleich(f, fit); else bindAufbau(f, fit);
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
  $('#fertig').onclick = () => { fit.fertig = true; fit.schritt = Math.max(fit.schritt || 1, 3); save(); go(`#/fit/${fit.id}/3`); };
}

let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }

addEventListener('hashchange', render);
matchMedia('(min-width:900px)').addEventListener('change', render);
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
