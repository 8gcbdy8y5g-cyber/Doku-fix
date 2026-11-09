/* Rad-Fix · Schritt 3 und 4: Aufbau seitlich prüfen, dann Aufnahme beim Treten.
   Erkennt Kurbelumdrehungen am Kniewinkel (Streckung unten = 6 Uhr) und wertet jede Umdrehung einzeln aus.
   Erkennung und Ton kommen aus messung.js (RFMess). */
(() => {
'use strict';
const W = window.WK;
const $ = (s, r = document) => r.querySelector(s);
const ZIEL_UMDR = 12;
const LMI = { l: { sh: 11, el: 13, wr: 15, hip: 23, kn: 25, an: 27, heel: 29, toe: 31 }, r: { sh: 12, el: 14, wr: 16, hip: 24, kn: 26, an: 28, heel: 30, toe: 32 } };

/* Winkel am Punkt b zwischen a und c (Bildkoordinaten) */
const ang = (a, b, c) => W.vecAngle([a.x - b.x, a.y - b.y], [c.x - b.x, c.y - b.y]);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => a.length < 2 ? 0 : Math.sqrt(a.reduce((s, x) => s + (x - mean(a)) ** 2, 0) / (a.length - 1));

/* Gelenkwerte eines Bildes */
function werte(P) {
  return {
    knie: 180 - ang(P.hip, P.kn, P.an),                 /* Kniebeugung */
    huefte: ang(P.sh, P.hip, P.kn),                      /* Rumpf zu Oberschenkel */
    sprung: ang(P.kn, P.an, P.toe),                      /* Unterschenkel zu Fuß */
    rumpf: Math.abs(Math.atan2(P.hip.y - P.sh.y, Math.abs(P.sh.x - P.hip.x)) * 180 / Math.PI), /* Rücken zur Waagerechten */
    schulter: ang(P.hip, P.sh, P.el),                   /* Rumpf zu Oberarm */
    ellbogen: 180 - ang(P.sh, P.el, P.wr)                /* Beugung */
  };
}

/* Umdrehungen am Knie: Tiefpunkt der Beugung = Pedal unten. Bestätigt, sobald die Beugung wieder deutlich steigt. */
class Kurbel {
  constructor() { this.all = []; this.mode = 'max'; this.maxV = -1e9; this.minV = 1e9; this.minT = 0; this.unten = []; this.umdr = []; this.verworfen = 0; }
  push(t, w) {
    const k = w.knie;
    if (this.mode === 'max') {
      if (k > this.maxV) this.maxV = k;
      if (k < this.maxV - 25) { this.mode = 'min'; this.minV = k; this.minT = t; }
      return null;
    }
    if (k < this.minV) { this.minV = k; this.minT = t; }
    if (k > this.minV + 25) { /* Tiefpunkt bestätigt: Pedal war unten */
      const tu = this.minT, prev = this.unten[this.unten.length - 1];
      this.unten.push(tu); this.mode = 'max'; this.maxV = k;
      if (prev != null) return this.auswerten(prev, tu);
    }
    return null;
  }
  auswerten(t0, t1) {
    const dauer = (t1 - t0) / 1000;
    const seg = [...this.allSamples(t0, t1)];
    if (seg.length < 6) { this.verworfen++; return { ok: false, grund: 'zu wenige Bilder' }; }
    const kn = seg.map(x => x.w.knie), vis = Math.min(...seg.map(x => x.vis));
    const rpm = 60 / dauer;
    const median = this.umdr.length >= 3 ? W.median(this.umdr.slice(-6).map(u => u.dauer)) : null;
    let grund = '';
    if (rpm < 40 || rpm > 140) grund = 'Trittfrequenz unplausibel';
    else if (median && Math.abs(dauer - median) / median > .25) grund = 'ungleichmäßig';
    else if (vis < .45) grund = 'Bein verdeckt';
    else if (Math.max(...kn) - Math.min(...kn) < 40) grund = 'zu wenig Bewegung';
    if (grund) { this.verworfen++; return { ok: false, grund }; }
    const iu = kn.indexOf(Math.min(...kn));
    const u = {
      dauer, rpm,
      knieUnten: kn[iu], knieOben: Math.max(...kn),
      hueftOben: Math.min(...seg.map(x => x.w.huefte)),
      sprungUnten: seg[iu].w.sprung,
      rumpf: mean(seg.map(x => x.w.rumpf)), schulter: mean(seg.map(x => x.w.schulter)), ellbogen: mean(seg.map(x => x.w.ellbogen))
    };
    this.umdr.push(u);
    return { ok: true, u };
  }
  *allSamples(t0, t1) { for (const x of this.all) if (x.t >= t0 && x.t <= t1) yield x; }
}

/* Ergebnis aus den guten Umdrehungen */
function zusammenfassen(umdr) {
  const k = ['knieUnten', 'knieOben', 'hueftOben', 'sprungUnten', 'rumpf', 'schulter', 'ellbogen', 'rpm'];
  const r = {};
  for (const key of k) { const v = umdr.map(u => u[key]); r[key] = { m: Math.round(mean(v) * 10) / 10, sd: Math.round(sd(v) * 10) / 10 }; }
  return r;
}

/* ---------- Oberfläche ---------- */
let A = null;
function close() {
  if (!A) return;
  A.run = false;
  try { A.stream && A.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
  window.removeEventListener('devicemotion', A.onMotion);
  RFMess.keepAwake(false);
  const el = A.el; A = null;
  document.removeEventListener('keydown', escKey);
  el.classList.remove('on'); setTimeout(() => el.remove(), 220);
}
const escKey = e => { if (e.key === 'Escape') close(); };

const CHECKS = [['lage', 'Gerät steht gerade'], ['bild', 'Kopf bis Fuß im Bild'], ['abstand', 'Abstand passt'], ['seite', 'Seite zur Kamera']];

function open(o) {
  close();
  RFMess.unlockAudio();
  const el = document.createElement('div');
  el.className = 'mess auf'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Aufnahme seitlich');
  el.innerHTML = `<div class="mess-in"><div class="flow">
    <div class="left">
      <div class="bar"><button class="back" data-x><svg class="i" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>Abbrechen</button></div>
      <div class="auf-step"></div>
      <h1 class="auf-h"></h1>
      <p class="lead auf-lead"></p>
      <div class="auf-info"></div>
      <div class="actions"><button class="btn" data-go2 hidden></button></div>
    </div>
    <div class="right">
      <div class="mess-stage cam auf-stage"><canvas></canvas><video playsinline muted></video><span class="cam-q"><i></i><em>Kamera startet</em></span>
        <div class="auf-count" hidden><b>0</b><small>/${ZIEL_UMDR}</small></div></div>
      <div class="auf-unter"></div>
    </div></div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  document.addEventListener('keydown', escKey);
  A = { o, el, run: true, phase: 'aufbau', okSeit: 0, seitVotes: [], g: null, kurbel: null, stand: null };
  el.querySelector('[data-x]').onclick = () => close();
  aufbau();
  start();
}

function setStep(n, titel, lead) {
  const look = document.documentElement.dataset.look;
  A.el.querySelector('.auf-step').innerHTML = `<div class="steps"><ol>${Array.from({ length: 8 }, (_, i) => `<li class="${i + 1 < n ? 'done' : i + 1 === n ? 'now' : ''}"></li>`).join('')}</ol><span>Schritt ${n} von 8</span></div>`;
  A.el.querySelector('.auf-h').textContent = titel;
  A.el.querySelector('.auf-lead').textContent = lead;
}

function aufbau() {
  A.phase = 'aufbau';
  setStep(3, 'Aufbau seitlich', 'Gerät seitlich auf Höhe des Tretlagers, etwa 2,5 bis 3 m entfernt. Rad auf der Rolle, Fahrer sitzt mit den Händen an den Bremsgriffen.');
  A.el.querySelector('.auf-info').innerHTML = `<ul class="checks">${CHECKS.map(([k, t]) => `<li data-c="${k}"><i></i><span>${t}</span><em></em></li>`).join('')}</ul>`;
  A.el.querySelector('.auf-unter').innerHTML = '<p class="mess-hint">Sobald alles passt, geht es mit einem Ton von selbst weiter.</p>';
  const b = A.el.querySelector('[data-go2]'); b.hidden = false; b.textContent = 'Trotzdem starten'; b.className = 'btn ghost'; b.onclick = () => aufnahme();
}

function aufnahme() {
  if (!A) return;
  A.phase = 'aufnahme'; A.kurbel = new Kurbel(); A.still = null; A.stillWanted = true;
  const f = A.o.fahrer, lo = f.ftp ? Math.round(f.ftp * .6 / 5) * 5 : null, hi = f.ftp ? Math.round(f.ftp * .7 / 5) * 5 : null;
  setStep(4, 'Aufnahme beim Treten', `Locker eintreten lassen. Rad-Fix zählt ${ZIEL_UMDR} gleichmäßige Umdrehungen und verwirft gestörte von selbst.`);
  A.el.querySelector('.auf-info').innerHTML = `<div class="ziel-last">
      <div><span>Leistung</span><b>${lo ? `${lo}–${hi}` : '–'} <small>W</small></b></div>
      <div><span>Trittfrequenz</span><b>85–90 <small>/min</small></b></div></div>
    <p class="note">60–70 % der FTP. Bei 12 Umdrehungen dauert die Aufnahme etwa 10 Sekunden.</p>`;
  A.el.querySelector('.auf-unter').innerHTML = `<div class="live-werte">
      <div><span>Knie jetzt</span><b data-lv="knie">–</b></div>
      <div><span>Knie unten</span><b data-lv="unten">–</b></div>
      <div><span>Trittfrequenz</span><b data-lv="rpm">–</b></div>
      <div><span>Verworfen</span><b data-lv="verw">0</b></div></div><p class="mess-hint" data-hint>Warte auf gleichmäßiges Treten.</p>`;
  A.el.querySelector('.auf-count').hidden = false;
  const b = A.el.querySelector('[data-go2]'); b.hidden = false; b.className = 'btn ghost'; b.textContent = 'Neu aufbauen'; b.onclick = () => { A.el.querySelector('.auf-count').hidden = true; aufbau(); };
  RFMess.beep(660); RFMess.signal('LOS', 'Treten bei ' + (lo ? `${lo}–${hi} W` : 'lockerer Last'), 'start');
}

function fertig() {
  const umdr = A.kurbel.umdr.slice(-ZIEL_UMDR);
  const res = { art: 'seite', datum: new Date().toISOString(), seite: A.seite || 'r', n: umdr.length, verworfen: A.kurbel.verworfen, werte: zusammenfassen(umdr), bild: A.still };
  RFMess.beep(1175); RFMess.signal(Math.round(res.werte.knieUnten.m) + '°', 'Knie unten · fertig', 'ende');
  const cb = A.o.onDone; A.phase = 'fertig';
  setTimeout(() => { close(); cb(res); }, 900);
}

/* Lage des Geräts aus dem Bewegungssensor */
async function lageStart() {
  let ok = typeof DeviceMotionEvent !== 'undefined';
  const ios = ok && typeof DeviceMotionEvent.requestPermission === 'function' && 'ontouchend' in document;
  if (ios) { try { ok = (await DeviceMotionEvent.requestPermission()) === 'granted'; } catch (e) { ok = false; } }
  if (!ok || !A) return;
  A.onMotion = e => { const a = e.accelerationIncludingGravity; if (a && a.x != null) A.g = [a.x, a.y, a.z]; };
  window.addEventListener('devicemotion', A.onMotion);
}
function lageFehler() {
  if (!A.g) return null;
  const nick = Math.abs(W.offAxis(A.g, 2));
  const roll = Math.atan2(A.g[0], -A.g[1]) * 180 / Math.PI;
  const r90 = Math.abs(((roll % 90) + 135) % 90 - 45);
  return Math.max(nick, r90);
}

async function start() {
  const stage = A.el.querySelector('.auf-stage'), cv = stage.querySelector('canvas'), ctx = cv.getContext('2d'), vid = stage.querySelector('video');
  const qd = stage.querySelector('.cam-q i'), qt = stage.querySelector('.cam-q em');
  RFMess.keepAwake(true);
  lageStart();
  const quelle = A.o.quelle; /* Test: künstliche Punkte statt Kamera */
  if (!quelle) {
    try { A.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
    catch (e) { qt.textContent = 'Kamera nicht erlaubt'; return; }
    if (!A) { return; }
    vid.srcObject = A.stream; await vid.play().catch(() => {});
    qt.textContent = 'Erkennung lädt';
    try { await RFMess.erkennung(); } catch (e) { qt.textContent = 'Erkennung nicht verfügbar'; return; }
  }
  let busy = false, lastTs = -1;
  const loop = async () => {
    if (!A || !A.run) return;
    requestAnimationFrame(loop);
    if (busy) return;
    if (!quelle && vid.readyState < 2) return;
    busy = true;
    try {
      let ts = performance.now(); if (ts <= lastTs) ts = lastTs + 1; lastTs = ts;
      let lm, W2, H2;
      if (quelle) { W2 = 1280; H2 = 720; lm = quelle(ts); }
      else { const r = await RFMess.detect(vid, ts); W2 = vid.videoWidth; H2 = vid.videoHeight; lm = r && r.landmarks && r.landmarks[0]; }
      if (!A || !A.run) return;
      if (cv.width !== W2) { cv.width = W2; cv.height = H2; }
      if (quelle) { ctx.fillStyle = '#26282a'; ctx.fillRect(0, 0, W2, H2); } else ctx.drawImage(vid, 0, 0, W2, H2);
      frame(lm, ts, W2, H2, ctx, qd, qt);
    } catch (e) { qd.className = 'bad'; qt.textContent = 'Erkennung hakt'; }
    busy = false;
  };
  requestAnimationFrame(loop);
}

function frame(lm, ts, W2, H2, ctx, qd, qt) {
  if (!lm) { qd.className = 'bad'; qt.textContent = 'Keine Person erkannt'; if (A.phase === 'aufbau') checks({}); return; }
  /* Seite: das kameranahe Bein hat den kleineren z-Wert */
  if (A.phase === 'aufbau') {
    const zl = lm[23].z + lm[25].z, zr = lm[24].z + lm[26].z;
    A.seitVotes.push(zl < zr ? 'l' : 'r'); if (A.seitVotes.length > 30) A.seitVotes.shift();
    A.seite = A.seitVotes.filter(x => x === 'l').length > A.seitVotes.length / 2 ? 'l' : 'r';
  }
  const I = LMI[A.seite || 'r'];
  const P = {}; for (const k in I) { const p = lm[I[k]]; P[k] = { x: p.x * W2, y: p.y * H2, v: p.visibility ?? 1 }; }
  const vis = Math.min(P.sh.v, P.hip.v, P.kn.v, P.an.v);
  zeichnen(ctx, P, W2);
  const w = werte(P);
  if (A.phase === 'aufbau') {
    const pts = lm.filter((p, i) => [0, I.sh, I.hip, I.kn, I.an, I.toe, I.wr].includes(i));
    const inside = pts.every(p => p.x > .02 && p.x < .98 && p.y > .02 && p.y < .98) && vis > .5;
    const ys = pts.map(p => p.y), hoehe = Math.max(...ys) - Math.min(...ys);
    const lf = lageFehler();
    const st = { lage: lf == null ? 'na' : lf <= 4 ? 'ok' : 'bad', bild: inside ? 'ok' : 'bad', abstand: hoehe < .45 ? 'nah' : hoehe > .92 ? 'fern' : 'ok', seite: vis > .5 ? 'ok' : 'bad' };
    st._lf = lf; st._h = hoehe;
    checks(st);
    const alle = ['bild', 'abstand', 'seite'].every(k => st[k] === 'ok') && st.lage !== 'bad';
    qd.className = alle ? 'ok' : 'warn'; qt.textContent = alle ? 'Passt' : 'Noch nicht passend';
    if (alle) { if (!A.okSeit) A.okSeit = ts; if (ts - A.okSeit > 1500) aufnahme(); } else A.okSeit = 0;
    return;
  }
  if (A.phase !== 'aufnahme') return;
  qd.className = vis > .5 ? 'ok' : 'warn'; qt.textContent = vis > .5 ? 'Aufnahme läuft' : 'Bein schlecht sichtbar';
  A.kurbel.all.push({ t: ts, w, vis }); while (A.kurbel.all.length && ts - A.kurbel.all[0].t > 6000) A.kurbel.all.shift();
  const r = A.kurbel.push(ts, w);
  const lv = k => A.el.querySelector(`[data-lv="${k}"]`);
  lv('knie').textContent = Math.round(w.knie) + '°';
  if (r) {
    const hint = A.el.querySelector('[data-hint]');
    if (r.ok) {
      lv('unten').textContent = Math.round(r.u.knieUnten) + '°'; lv('rpm').textContent = Math.round(r.u.rpm);
      const n = A.kurbel.umdr.length;
      A.el.querySelector('.auf-count b').textContent = Math.min(n, ZIEL_UMDR);
      hint.textContent = n < ZIEL_UMDR ? 'Gleichmäßig weitertreten.' : 'Fertig.';
      if (n === Math.ceil(ZIEL_UMDR / 2)) A.stillWanted = true;
      if (n >= ZIEL_UMDR) fertig();
    } else { lv('verw').textContent = A.kurbel.verworfen; hint.textContent = 'Umdrehung verworfen: ' + r.grund + '.'; }
  }
  /* Standbild bei gestrecktem Knie für Bericht und Ergebnis */
  if (A.stillWanted && w.knie < 50 && vis > .5) { A.stillWanted = false; A.still = schnappschuss(ctx.canvas); }
}

function schnappschuss(cv) {
  const k = Math.min(1, 900 / cv.width), c = document.createElement('canvas');
  c.width = Math.round(cv.width * k); c.height = Math.round(cv.height * k);
  c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height);
  try { return c.toDataURL('image/jpeg', .72); } catch (e) { return null; }
}

function checks(st) {
  const txt = { na: 'nicht prüfbar', ok: '', bad: '', nah: 'weiter weg', fern: 'näher heran' };
  for (const [k] of CHECKS) {
    const li = A.el.querySelector(`[data-c="${k}"]`); if (!li) continue;
    const v = st[k] || 'bad';
    li.className = v === 'ok' ? 'ok' : v === 'na' ? 'na' : 'bad';
    let e = txt[v] || '';
    if (k === 'lage' && st._lf != null && v !== 'ok') e = Math.round(st._lf) + '° schief';
    if (k === 'seite' && v === 'ok') e = A.seite === 'l' ? 'links' : 'rechts';
    if (k === 'bild' && v === 'bad') e = 'Ausschnitt anpassen';
    li.querySelector('em').textContent = e;
  }
}

function zeichnen(ctx, P, W2) {
  const lw = Math.max(4, W2 / 220);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const line = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); };
  line([P.wr, P.el, P.sh, P.hip], 'rgba(243,246,236,.75)', lw * .8);
  line([P.hip, P.kn, P.an, P.toe], '#ddf6a2', lw);
  [P.sh, P.el, P.wr, P.hip, P.kn, P.an, P.toe].forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, lw * 1.4, 0, 7); ctx.fillStyle = '#1a1a1a'; ctx.fill(); ctx.lineWidth = lw * .55; ctx.strokeStyle = '#ddf6a2'; ctx.stroke(); });
}

window.RFAuf = { open, close, _Kurbel: Kurbel, _werte: werte };
})();
