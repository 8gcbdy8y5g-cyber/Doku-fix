/* Rad-Fix · Messung direkt in der App: Knie-Extension 90/90 mit Sensor oder Kamera.
   Rechenkern (kern.js) und Erkennung (erkennung.js, mp/) stammen aus Nullpunkt. */
(() => {
'use strict';
const W = window.WK;
const $ = (s, r = document) => r.querySelector(s);
const REPS = 3;

/* ---------- Ton, Haptik, Signal (wie Nullpunkt) ---------- */
let actx = null, ONE = null, STILL = null; const TONE = {};
const TON_DEF = { 660: [[660, .14]], 1175: [[1175, .12], [0, .05], [1568, .18]] };
function wavUrl(segs, vol = .9) {
  const sr = 22050, n = Math.round(segs.reduce((a, s) => a + s[1], 0) * sr), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
  let i = 0;
  for (const [f, d] of segs) { const m = Math.round(d * sr); for (let k = 0; k < m && i < n; k++, i++) {
    const env = Math.min(1, k / (sr * .006), (m - k) / (sr * .02));
    v.setInt16(44 + i * 2, f ? Math.sin(2 * Math.PI * f * k / sr) * env * vol * 32767 : 0, true); } }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}
function unlockAudio() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state !== 'running') actx.resume(); } catch (e) {}
  if (!STILL) { STILL = wavUrl([[0, .08]]); for (const f in TON_DEF) TONE[f] = wavUrl(TON_DEF[f]); }
  try { if (!ONE) { ONE = new Audio(); ONE.setAttribute('playsinline', ''); } ONE.src = STILL; const p = ONE.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}
function beep(f) {
  try { if (ONE && TONE[f]) { ONE.src = TONE[f]; ONE.currentTime = 0; const p = ONE.play(); if (p && p.catch) p.catch(() => {}); return; } } catch (e) {}
}
let HAP = null;
function haptik(n = 1) {
  try { if (navigator.vibrate) { navigator.vibrate(n > 1 ? [60, 80, 60] : 60); return; } } catch (e) {}
  try { if (!HAP) { HAP = document.createElement('label'); HAP.setAttribute('aria-hidden', 'true'); HAP.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:.01;pointer-events:none;z-index:-1';
      const i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1; HAP.appendChild(i); document.body.appendChild(HAP); }
    HAP.click(); if (n > 1) setTimeout(() => HAP.click(), 140); if (n > 2) setTimeout(() => HAP.click(), 280); } catch (e) {}
}
function signal(gross, klein, art) {
  let e = $('#signal');
  if (!e) { e = document.createElement('div'); e.id = 'signal'; e.setAttribute('role', 'status'); e.innerHTML = '<b></b><span></span>'; document.body.appendChild(e); }
  e.querySelector('b').textContent = gross; e.querySelector('span').textContent = klein || '';
  e.className = 'on ' + art; haptik(art === 'ende' ? 3 : 1); clearTimeout(signal.t); signal.t = setTimeout(() => { e.className = art; }, art === 'ende' ? 1500 : 1000);
}
let wake = null;
async function keepAwake(on) { try { if (on && !wake && navigator.wakeLock) wake = await navigator.wakeLock.request('screen'); if (!on && wake) { wake.release(); wake = null; } } catch (e) {} }

/* ---------- Bilder: Rückenlage 90/90, Lage des Handys ---------- */
function bild(art, phase) {
  /* Seitenansicht, Kopf links. Hüfte bei (150,150), Oberschenkel senkrecht nach oben, Unterschenkel fast gestreckt nach oben */
  const hip = [150, 150], knee = [150, 66], ankle = [176, 6];
  const ph = (a, b, on) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + 90;
    return `<g transform="translate(${mx} ${my}) rotate(${ang})"><rect x="-8" y="-17" width="16" height="34" rx="4" fill="${on ? '#4f6d10' : '#c9cdbf'}"/><rect x="-4" y="-14" width="8" height="2.5" rx="1.2" fill="#fff" opacity=".8"/></g>`; };
  const leg = `<line x1="${hip[0]}" y1="${hip[1]}" x2="${knee[0]}" y2="${knee[1]}" stroke="#9aa08e" stroke-width="16" stroke-linecap="round"/>
    <line x1="${knee[0]}" y1="${knee[1]}" x2="${ankle[0]}" y2="${ankle[1]}" stroke="#9aa08e" stroke-width="13" stroke-linecap="round"/>
    <path d="M${hip[0] - 80} ${hip[1] + 4} h80" stroke="#9aa08e" stroke-width="20" stroke-linecap="round"/><circle cx="${hip[0] - 98}" cy="${hip[1] - 2}" r="13" fill="#9aa08e"/>
    <line x1="${hip[0]}" y1="${hip[1] + 4}" x2="${hip[0] + 60}" y2="${hip[1] + 8}" stroke="#c9cdbf" stroke-width="12" stroke-linecap="round" opacity=".7"/>
    <line x1="20" y1="166" x2="280" y2="166" stroke="#d1d1d6" stroke-width="2"/>
    <path d="M${knee[0]} ${knee[1] - 30} A30 30 0 0 1 ${knee[0] + 13} ${knee[1] - 27}" stroke="#ddf6a2" stroke-width="5" fill="none"/>
    <line x1="${knee[0]}" y1="${knee[1]}" x2="${knee[0]}" y2="${knee[1] - 50}" stroke="#4f6d10" stroke-width="1.5" stroke-dasharray="3 4"/>`;
  if (art === 'kamera') {
    return `<svg viewBox="0 0 300 175" aria-hidden="true">${leg}
      <g transform="translate(250 60)"><rect x="-14" y="-24" width="28" height="48" rx="6" fill="#1a1a1a"/><circle cx="0" cy="-14" r="4" fill="#ddf6a2"/></g>
      <path d="M232 56 L196 56" stroke="#4f6d10" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#pf)"/>
      <defs><marker id="pf" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#4f6d10"/></marker></defs></svg>`;
  }
  return `<svg viewBox="0 0 300 175" aria-hidden="true">${leg}${ph(hip, knee, phase === 1)}${ph(knee, ankle, phase === 2)}</svg>`;
}

/* ---------- Oberfläche ---------- */
let S = null; /* aktuelle Messung */
function sheet(o) {
  const el = document.createElement('div');
  el.className = 'mess'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Messung');
  el.innerHTML = `<div class="mess-in">
    <div class="mess-bar"><button class="back" data-x><svg class="i" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>Abbrechen</button><span class="grow"></span>
      <span class="seg" data-art>${[['sensor', 'Sensor'], ['kamera', 'Kamera']].map(([k, n]) => `<button aria-pressed="${o.art === k}" data-v="${k}">${n}</button>`).join('')}</span></div>
    <div class="mess-grid">
      <div class="mess-l">
        <h1>Knie-Extension 90/90 ${o.seite === 'l' ? 'links' : 'rechts'}</h1>
        <div class="mess-bild"></div>
        <ol class="mess-steps"></ol>
      </div>
      <div class="mess-r">
        <div class="mess-stage"></div>
        <div class="mess-reps" aria-live="polite"></div>
        <p class="mess-hint"></p>
        <div class="actions mess-act"><button class="btn ghost" data-neu>Neu beginnen</button><button class="btn" data-ok disabled>Übernehmen</button></div>
      </div>
    </div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  return el;
}

function open(o) {
  close(true);
  unlockAudio();
  const el = sheet(o);
  S = { o, el, art: o.art, reps: [], stop: null };
  el.querySelector('[data-x]').onclick = () => close();
  el.querySelectorAll('[data-art] button').forEach(b => b.onclick = () => {
    if (b.dataset.v === S.art) return;
    el.querySelectorAll('[data-art] button').forEach(x => x.setAttribute('aria-pressed', x === b));
    S.art = b.dataset.v; start();
  });
  el.querySelector('[data-neu]').onclick = () => start();
  el.querySelector('[data-ok]').onclick = () => { const v = ergebnis(); if (v == null) return; const cb = S.o.onDone; close(); cb(v); };
  document.addEventListener('keydown', esc);
  start();
}
function esc(e) { if (e.key === 'Escape') close(); }
function close(silent) {
  if (!S) return;
  try { S.stop && S.stop(); } catch (e) {}
  keepAwake(false);
  const el = S.el; S = null;
  document.removeEventListener('keydown', esc);
  el.classList.remove('on'); setTimeout(() => el.remove(), silent ? 0 : 220);
}
function ergebnis() { if (!S || !S.reps.length) return null; return Math.round(W.median(S.reps.map(r => r.v))); }
function zeigeReps() {
  const n = S.reps.length;
  S.el.querySelector('.mess-reps').innerHTML = `<div class="dots">${Array.from({ length: REPS }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
    <span>${n ? S.reps.map(r => Math.round(r.v) + '°').join(' · ') + (n > 1 ? ` · Median ${ergebnis()}°` : '') : `${REPS} Wiederholungen, der Median zählt`}</span>`;
  S.el.querySelector('[data-ok]').disabled = !n;
  if (n) S.el.querySelector('[data-ok]').textContent = `${ergebnis()}° übernehmen`;
}
function schritte(list, at) {
  S.el.querySelector('.mess-steps').innerHTML = list.map((t, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"><span>${i + 1}</span><p>${t}</p></li>`).join('');
}
const hint = t => { if (S) S.el.querySelector('.mess-hint').textContent = t; };

function start() {
  if (S.stop) { try { S.stop(); } catch (e) {} S.stop = null; }
  S.reps = []; zeigeReps();
  S.el.querySelector('[data-ok]').textContent = 'Übernehmen';
  keepAwake(true);
  if (S.art === 'kamera') startKamera(); else startSensor();
}

/* =================== Sensor =================== */
/* Zweistufig wie in Nullpunkt: erst außen auf den Oberschenkel, dann außen auf den Unterschenkel.
   Das Defizit ist der Winkel zwischen beiden Lagen in der Bildschirmebene. */
const SEN_STEPS = ['Handy längs <b>außen auf den Oberschenkel</b>, Oberkante zum Knie. Hüfte 90° gebeugt halten, ruhig halten.',
  'Handy längs <b>außen auf den Unterschenkel</b>, Oberkante zum Fuß. Knie aktiv strecken bis zum Ende und halten.',
  'Unterschenkel locker sinken lassen und erneut strecken. Das Handy bleibt liegen.'];
async function startSensor() {
  const stage = S.el.querySelector('.mess-stage');
  stage.className = 'mess-stage dial';
  stage.innerHTML = `<div class="dial-num" hidden><b></b><small>°</small></div><span class="dial-sub">Erst der Oberschenkel</span><span class="dial-q"></span>`;
  S.el.querySelector('.mess-bild').innerHTML = bild('sensor', 1);
  schritte(SEN_STEPS, 0);
  let ok = typeof DeviceMotionEvent !== 'undefined', ios = ok && typeof DeviceMotionEvent.requestPermission === 'function' && /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
  if (ios) { try { ok = (await DeviceMotionEvent.requestPermission()) === 'granted'; } catch (e) { ok = false; } }
  if (!S || S.art !== 'sensor') return;
  if (!ok) { hint('Kein Zugriff auf den Bewegungssensor. In den Einstellungen für Safari „Bewegung und Ausrichtung“ erlauben oder die Kamera nehmen.'); return; }
  const sen = { state: 'seg1', gA: null, win: [], since: 0, last: 0, moved: false };
  hint('Ruhig halten, der Rest geht von selbst. Tippen auf die Zahl nimmt den Wert sofort.');
  const still = () => { const w = sen.win.map(x => x[1]); return W.isStill(w) ? W.vmean(w) : null; };
  const defizit = g => { let v = Math.abs(W.wrap180(W.planeAngle(g, 2) - W.planeAngle(sen.gA, 2))); if (v > 100) v = 180 - v; return v; };
  const lot = g => { const a = W.planeAngle(g, 2); return Math.min(Math.abs(W.wrap180(a - 180)), Math.abs(W.wrap180(a))); };
  const num = stage.querySelector('.dial-num b'), q = stage.querySelector('.dial-q');
  let gotData = false;
  const take = (g, manual) => {
    const t = performance.now(); sen.last = t;
    if (sen.state === 'seg1') {
      sen.gA = g; sen.state = 'seg2'; sen.moved = false;
      const dev = lot(g);
      beep(660); signal('1 ✓', 'Jetzt auf den Unterschenkel', 'start');
      schritte(SEN_STEPS, 1); S.el.querySelector('.mess-bild').innerHTML = bild('sensor', 2);
      hint(dev > 10 ? `Achtung: Oberschenkel steht ${Math.round(dev)}° schräg. Für 90/90 senkrecht halten, sonst neu beginnen.` : 'Oberschenkel steht senkrecht. Jetzt umsetzen.');
      return;
    }
    const v = defizit(g);
    S.reps.push({ v, manual }); zeigeReps();
    beep(1175); signal(Math.round(v) + '°', `Wiederholung ${S.reps.length} von ${REPS}`, 'ende');
    sen.moved = false;
    if (S.reps.length >= REPS) { sen.state = 'fertig'; schritte(SEN_STEPS, 3); hint('Fertig. Übernehmen oder neu beginnen.'); keepAwake(false); }
    else { schritte(SEN_STEPS, 2); hint(`Wiederholung ${S.reps.length + 1}: Unterschenkel sinken lassen, dann wieder strecken und halten.`); }
  };
  const onMotion = e => {
    const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
    gotData = true;
    const g = [a.x, a.y, a.z], t = performance.now();
    sen.win.push([t, g]); while (sen.win.length && t - sen.win[0][0] > 500) sen.win.shift();
    const s = still();
    if (s) { if (!sen.since) sen.since = t; } else sen.since = 0;
    const stillFor = sen.since ? (t - sen.since) / 1000 : 0;
    if (sen.state === 'seg2' || sen.state === 'fertig') {
      const v = defizit(g); sen.live = v;
      if (!sen.drawT || t - sen.drawT > 60) { sen.drawT = t; num.parentNode.hidden = false; stage.querySelector('.dial-sub').textContent = 'Streckdefizit'; num.textContent = Math.round(v); q.textContent = stillFor > .3 ? 'ruhig' : 'Bewegung'; }
      if (sen.state === 'seg2' && v > 20) sen.moved = true;
    } else if (!sen.drawT || t - sen.drawT > 120) { sen.drawT = t; q.textContent = stillFor > .3 ? 'ruhig, gleich geht es los' : 'ruhig halten'; }
    if (t - sen.last < 900 || sen.state === 'fertig') return;
    if (sen.state === 'seg1' && s && stillFor > .7) take(s);
    /* erste Wiederholung: Umsetzen bewegt das Handy sowieso; danach muss der Unterschenkel zwischendurch sinken */
    else if (sen.state === 'seg2' && s && stillFor > .7 && W.vecAngle(sen.gA, s) > 12 && (S.reps.length === 0 || sen.moved)) take(s);
  };
  window.addEventListener('devicemotion', onMotion);
  stage.onclick = () => { if (sen.state === 'fertig') return; const w = sen.win.slice(-8).map(x => x[1]); if (w.length) take(still() || W.vmean(w), true); };
  setTimeout(() => { if (S && S.art === 'sensor' && !gotData) hint('Keine Sensordaten. Das geht nur auf iPhone oder iPad, nicht am Mac.'); }, 1500);
  S.stop = () => window.removeEventListener('devicemotion', onMotion);
}

/* =================== Kamera =================== */
const ERK = { w: undefined, ready: null, pend: new Map(), id: 0, mode: '' };
const absUrl = p => new URL(p, location.href).href;
function call(msg, transfer, ms) {
  return new Promise((res, rej) => {
    const id = ++ERK.id; msg.id = id; ERK.pend.set(id, { res, rej });
    if (ms) setTimeout(() => { if (ERK.pend.has(id)) { ERK.pend.delete(id); rej(new Error('Zeitüberschreitung')); } }, ms);
    ERK.w.postMessage(msg, transfer || []);
  });
}
let mainDet = null;
function erkennung() {
  if (ERK.ready) return ERK.ready;
  ERK.ready = (async () => {
    try {
      const w = new Worker('erkennung.js', { type: 'module' });
      const loaded = new Promise((res, rej) => { ERK.onLoaded = res; setTimeout(() => rej(new Error('startet nicht')), 20000); });
      w.onmessage = e => { const m = e.data; if (m.type === 'loaded') { ERK.onLoaded(); return; } const p = ERK.pend.get(m.id); if (!p) return; ERK.pend.delete(m.id);
        if (m.type === 'error') p.rej(new Error(m.msg)); else p.res(m.type === 'ready' ? m : m.r); };
      w.onerror = () => { ERK.pend.forEach(p => p.rej(new Error('Hintergrund-Strang fehlgeschlagen'))); ERK.pend.clear(); };
      ERK.w = w; await loaded;
      await call({ type: 'init', del: 'GPU', kind: 'pose', model: absUrl('mp/pose_landmarker_full.task.wasm'), wasm: absUrl('mp/wasm') }, null, 45000);
      ERK.mode = 'worker'; return true;
    } catch (e) {
      try { ERK.w && ERK.w.terminate(); } catch (x) {}
      ERK.w = null;
      const mod = await import('./mp/vision_bundle.mjs');
      const fs = await mod.FilesetResolver.forVisionTasks(absUrl('mp/wasm').replace(/\/$/, ''));
      const mk = del => mod.PoseLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: 'mp/pose_landmarker_full.task.wasm', delegate: del }, runningMode: 'VIDEO', numPoses: 1 });
      mainDet = await mk('GPU').catch(() => mk('CPU'));
      ERK.mode = 'main'; return true;
    }
  })();
  ERK.ready.catch(() => { ERK.ready = null; });
  return ERK.ready;
}
const small = document.createElement('canvas'), sctx = small.getContext('2d');
async function detect(video, ts) {
  const sw = video.videoWidth, sh = video.videoHeight, k = Math.min(1, 640 / Math.max(sw, sh));
  const w = Math.round(sw * k), h = Math.round(sh * k);
  if (small.width !== w || small.height !== h) { small.width = w; small.height = h; }
  sctx.drawImage(video, 0, 0, w, h);
  if (ERK.mode === 'worker') { const bm = await createImageBitmap(small); return call({ type: 'frame', bitmap: bm, mode: 'VIDEO', ts }, [bm], 15000); }
  return mainDet.detectForVideo(small, ts);
}

const KAM_STEPS = ['iPad oder iPhone seitlich auf Höhe des Knies, gemessenes Bein <b>zur Kamera</b>. Schulter bis Fuß im Bild.',
  'Hüfte 90° gebeugt halten. Knie aktiv strecken bis zum Ende und kurz halten.',
  'Unterschenkel sinken lassen und erneut strecken.'];
async function startKamera() {
  const stage = S.el.querySelector('.mess-stage');
  stage.className = 'mess-stage cam';
  stage.innerHTML = `<canvas></canvas><video playsinline muted></video><div class="cam-num" hidden><b></b><small>°</small></div><span class="cam-q"><i></i><em>Kamera startet</em></span>`;
  S.el.querySelector('.mess-bild').innerHTML = bild('kamera');
  schritte(KAM_STEPS, 0);
  hint('Die Erkennung lädt beim ersten Mal etwa 25 MB und läuft danach auch ohne Netz.');
  const cv = stage.querySelector('canvas'), ctx = cv.getContext('2d'), vid = stage.querySelector('video');
  const num = stage.querySelector('.cam-num b'), qd = stage.querySelector('.cam-q i'), qt = stage.querySelector('.cam-q em');
  let stream = null, run = true;
  S.stop = () => { run = false; try { stream && stream.getTracks().forEach(t => t.stop()); } catch (e) {} };
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false }); }
  catch (e) { if (S && S.art === 'kamera') { qt.textContent = 'Kamera nicht erlaubt'; hint('Kein Kamerazugriff. In Safari die Kamera für diese Seite erlauben oder den Sensor nehmen.'); } return; }
  if (!run) { stream.getTracks().forEach(t => t.stop()); return; }
  vid.srcObject = stream; await vid.play().catch(() => {});
  qt.textContent = 'Erkennung lädt';
  try { await erkennung(); } catch (e) { qt.textContent = 'Erkennung nicht verfügbar'; hint('Die Körpererkennung startet auf diesem Gerät nicht. Bitte den Sensor nehmen.'); return; }
  if (!run) return;
  const side = S.o.seite === 'l' ? { sh: 11, hip: 23, kn: 25, an: 27 } : { sh: 12, hip: 24, kn: 26, an: 28 };
  const filt = new W.OneEuro(1.2, .03);
  const k = { hist: [], state: 'warten', last: 0, low: false };
  let lastTs = -1, busy = false;
  const ang = (a, b, c) => { const v1 = [a.x - b.x, a.y - b.y], v2 = [c.x - b.x, c.y - b.y]; return W.vecAngle(v1, v2); };
  const loop = async () => {
    if (!run || !S) return;
    requestAnimationFrame(loop);
    if (busy || vid.readyState < 2) return;
    busy = true;
    try {
      let ts = performance.now(); if (ts <= lastTs) ts = lastTs + 1; lastTs = ts;
      const r = await detect(vid, ts);
      if (!run) return;
      const W2 = vid.videoWidth, H2 = vid.videoHeight;
      if (cv.width !== W2) { cv.width = W2; cv.height = H2; }
      ctx.drawImage(vid, 0, 0, W2, H2);
      const lm = r && r.landmarks && r.landmarks[0];
      if (!lm) { qd.className = 'bad'; qt.textContent = 'Keine Person erkannt'; num.parentNode.hidden = true; busy = false; return; }
      const P = n => ({ x: lm[n].x * W2, y: lm[n].y * H2, v: lm[n].visibility ?? 1 });
      const sh = P(side.sh), hip = P(side.hip), kn = P(side.kn), an = P(side.an);
      const vis = Math.min(hip.v, kn.v, an.v);
      const def = filt.filter(180 - ang(hip, kn, an), ts / 1000), hipW = ang(sh, hip, kn);
      /* Zeichnung */
      const lw = Math.max(4, W2 / 180);
      ctx.lineCap = 'round'; ctx.strokeStyle = '#ddf6a2'; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(kn.x, kn.y); ctx.lineTo(an.x, an.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = lw * .6;
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(hip.x, hip.y); ctx.stroke();
      ctx.setLineDash([lw * 1.5, lw * 1.5]); ctx.strokeStyle = 'rgba(221,246,162,.6)';
      ctx.beginPath(); ctx.moveTo(kn.x, kn.y); ctx.lineTo(kn.x + (kn.x - hip.x), kn.y + (kn.y - hip.y)); ctx.stroke(); ctx.setLineDash([]);
      [hip, kn, an].forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, lw * 1.6, 0, 7); ctx.fillStyle = '#1a1a1a'; ctx.fill(); ctx.lineWidth = lw * .6; ctx.strokeStyle = '#ddf6a2'; ctx.stroke(); });
      num.textContent = Math.round(def); num.parentNode.hidden = false;
      const hipOk = Math.abs(hipW - 90) <= 15;
      if (vis < .5) { qd.className = 'warn'; qt.textContent = 'Bein schlecht sichtbar'; }
      else if (!hipOk) { qd.className = 'warn'; qt.textContent = `Hüfte ${Math.round(hipW)}°, Ziel 90°`; }
      else { qd.className = 'ok'; qt.textContent = `Hüfte ${Math.round(hipW)}° · gut`; }
      /* Wiederholung: Knie gestreckt und ruhig → Wert; danach muss es wieder sinken */
      k.hist.push([ts, def]); while (k.hist.length && ts - k.hist[0][0] > 700) k.hist.shift();
      const vals = k.hist.map(x => x[1]), ruhig = k.hist.length > 6 && ts - k.hist[0][0] > 600 && Math.max(...vals) - Math.min(...vals) < 3;
      if (k.state === 'warten' && def > 45) { k.state = 'bereit'; schritte(KAM_STEPS, 1); }
      if (k.state === 'zurueck' && def > 45) { k.state = 'bereit'; schritte(KAM_STEPS, 1); }
      if (k.state === 'bereit' && ruhig && def < 45 && vis >= .5 && ts - k.last > 900) {
        const v = W.median(vals); k.last = ts;
        S.reps.push({ v, hip: hipW }); zeigeReps();
        beep(1175); signal(Math.round(v) + '°', `Wiederholung ${S.reps.length} von ${REPS}`, 'ende');
        if (S.reps.length >= REPS) { k.state = 'fertig'; schritte(KAM_STEPS, 3); hint('Fertig. Übernehmen oder neu beginnen.'); keepAwake(false); }
        else { k.state = 'zurueck'; schritte(KAM_STEPS, 2); hint(`Wiederholung ${S.reps.length + 1}: Unterschenkel sinken lassen, dann wieder strecken.`); }
      }
      if (k.state === 'warten' && S.reps.length === 0) hint('Startstellung: Hüfte und Knie 90° gebeugt. Die Messung beginnt, sobald das Knie gebeugt erkannt ist.');
    } catch (e) { qd.className = 'bad'; qt.textContent = 'Erkennung hakt'; }
    busy = false;
  };
  requestAnimationFrame(loop);
}

window.RFMess = { open, close };
})();
