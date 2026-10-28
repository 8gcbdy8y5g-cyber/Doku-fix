// Doku-Fix · Reiter Anatomie
// 3D-Modell: BodyParts3D, © The Database Center for Life Science, CC BY-SA 2.1 JP (reduziert, umgerechnet).
// Schematische Zusatzstrukturen (Menisken, Kreuzbänder, Außenbänder, Plantarfaszie, Nerven) selbst modelliert.
import * as THREE from './three.module.min.js';
import {CSS} from './ana_css.js';
import {benenne, REGIONEN, SZENEN, BEWEGUNGEN, BEW_JE_REGION, BEH_MAP} from './ana_daten.js';

const V3 = THREE.Vector3;
const FARBE = {zahn:'#F6F3EA', knochen:'#E9E1CF', knorpel:'#CBDCE3', disk:'#A7C6DA', muskel:'#BD5E52', band:'#E6EAEE', menisk:'#D3E5EE'};
const PROBLEM = '#FF3B30', BEH = '#2E8FD9', WAHL = '#FFD23F', NERV = '#F5C431';
const GRAU = new THREE.Color('#B9A9A4');

let A = null; // ein Viewer für die ganze App

// ---------- Hilfen ----------
const CSS_esc = (t) => t.replace(/"/g, '\\"');
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const knopf = (cls, html, titel, klick) => { const b = el('button', cls); b.type = 'button'; b.innerHTML = html; if (titel) b.setAttribute('aria-label', titel); if (klick) b.addEventListener('click', klick); return b; };
const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
const ss = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const ICON = {
  schicht: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  stift: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
  punkt: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/></svg>',
  bewegung: '<svg viewBox="0 0 24 24"><path d="M5 19L12 5"/><path d="M12 5l7 9"/><path d="M14.5 17.5a5 5 0 0 0-4-7.6"/></svg>',
  liste: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  ansicht: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4h4"/></svg>',
  voll: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  klein: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  bild: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>',
  zu: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  diag: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-4.5-8-11a5 5 0 0 1 8-3.9A5 5 0 0 1 20 10c0 6.5-8 11-8 11z"/></svg>',
  rueck: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
};

// ---------- Laden ----------
async function ladeModell(fort) {
  const r = await fetch(new URL('./anatomie-modell.wasm', import.meta.url) /* kein WebAssembly: gzip-Daten, Endung nur wegen Artefakt-Hosting */);
  if (!r.ok) throw new Error('Modell nicht gefunden');
  const ges = +r.headers.get('content-length') || 2400000;
  const leser = r.body.getReader(); const teile = []; let n = 0;
  for (;;) { const {done, value} = await leser.read(); if (done) break; teile.push(value); n += value.length; fort(Math.min(0.95, n / ges)); }
  let buf = await new Blob(teile).arrayBuffer();
  const b0 = new Uint8Array(buf, 0, 2);
  if (b0[0] === 0x1f && b0[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const dv = new DataView(buf); const hl = dv.getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, hl)));
  let nv = 0, nt = 0; for (const p of meta.parts) { p.vs = nv; p.ts = nt; nv += p.v; nt += p.t; }
  const q = new Uint16Array(buf, 4 + hl, nv * 3), ix = new Uint16Array(buf, 4 + hl + nv * 6, nt * 3);
  return {meta, q, ix, nv, nt};
}

// ---------- Geometrie ----------
function baue(d) {
  const {meta, q, ix, nv, nt} = d, mn = meta.min, mx = meta.max;
  const pos = new Float32Array(nv * 3), pid = new Float32Array(nv), over = new Float32Array(nv * 4), idx = new Uint32Array(nt * 3);
  const sx = (mx[0] - mn[0]) / 65535, sy = (mx[1] - mn[1]) / 65535, sz = (mx[2] - mn[2]) / 65535;
  for (let i = 0; i < nv; i++) {
    const x = mn[0] + q[i * 3] * sx, y = mn[1] + q[i * 3 + 1] * sy, z = mn[2] + q[i * 3 + 2] * sz;
    pos[i * 3] = x; pos[i * 3 + 1] = z - 820; pos[i * 3 + 2] = -y - 100; // Modell (x,y,z) -> three (x, z, -y)
  }
  const teile = meta.parts.map((p, i) => {
    for (let v = p.vs; v < p.vs + p.v; v++) pid[v] = i;
    for (let t = p.ts * 3; t < (p.ts + p.t) * 3; t++) idx[t] = ix[t] + p.vs;
    let seite = 'm', base = p.n;
    const m = p.n.match(/\b(right|left)\b/);
    if (m) { seite = m[1] === 'right' ? 'r' : 'l'; base = p.n.replace(/ ?\b(right|left)\b ?/, ' ').trim(); }
    const info = benenne(base, seite);
    if (info.key === 'schaedel' || info.key === 'Sternum' || info.cls === 'zahn') seite = 'm';
    return {i, n: p.n, base, seite, vs: p.vs, v: p.v, ts: p.ts, t: p.t, s: !!p.s, info};
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('pid', new THREE.BufferAttribute(pid, 1));
  geo.setAttribute('aOver', new THREE.BufferAttribute(over, 4));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  // Gruppen
  const gruppen = new Map();
  for (const t of teile) {
    const id = t.info.key + '|' + t.seite;
    let g = gruppen.get(id);
    if (!g) { g = {id, key: t.info.key, seite: t.seite, ...t.info, teile: [], s: t.s}; gruppen.set(id, g); }
    g.teile.push(t.i); t.g = g;
  }
  for (const t of teile) kugel(t, pos);
  return {geo, pos, idx, teile, gruppen, nrm: geo.attributes.normal.array, over};
}
function kugel(t, pos) {
  let a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9];
  for (let v = t.vs; v < t.vs + t.v; v++) for (let k = 0; k < 3; k++) { const c = pos[v * 3 + k]; if (c < a[k]) a[k] = c; if (c > b[k]) b[k] = c; }
  t.min = a; t.max = b; t.c = new V3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  t.r = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2;
}

// ---------- Material mit Zustandstextur ----------
function material(statTex, pass) {
  const m = new THREE.MeshStandardMaterial({roughness: 0.62, metalness: 0, transparent: pass === 1, depthWrite: pass === 0, side: THREE.FrontSide});
  m.userData.u = {uState: {value: statTex}, uPass: {value: pass}, uTime: {value: 0}};
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, m.userData.u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float pid; attribute vec4 aOver; varying float vPid; varying vec4 vOver;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPid = pid; vOver = aOver;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uState; uniform float uPass; uniform float uTime; varying float vPid; varying vec4 vOver;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
        int tpx = int(vPid + 0.5);
        vec4 st = texelFetch(uState, ivec2(tpx, 0), 0);
        vec4 fl = texelFetch(uState, ivec2(tpx, 1), 0);
        float al = fl.r;
        if (al < 0.01) discard;
        if (uPass < 0.5) { if (al < 0.99) discard; } else { if (al >= 0.99) discard; }
        vec3 col = mix(st.rgb, vOver.rgb, vOver.a);
        vec4 diffuseColor = vec4(col, al);`)
      .replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive + col * fl.g * (0.22 + 0.22 * sin(uTime * 3.2)) + vec3(1.0, 0.85, 0.3) * fl.b * 0.16 + vOver.rgb * vOver.a * 0.12;');
  };
  m.customProgramCacheKey = () => 'ana' + pass;
  return m;
}

// ---------- Viewer ----------
class Viewer {
  constructor() {
    this.root = el('div', 'ana');
    this.root.innerHTML = '';
    this.zustand = {sprache: 'lat', region: 'koerper', seite: 'r', schicht: 'alle', umgebung: 'blass', modus: 'drehen', farbe: PROBLEM, gesund: false};
    this.marken = new Map(); // gruppen-id -> 'p' | 'b'
    this.aus = new Set();    // ausgeblendete Gruppen
    this.allein = null;      // isolierte Gruppe
    this.wahl = null;        // gewählte Gruppe
    this.szene = null; this.patient = null;
    this.extras = []; this.labels = [];
    this.punkte = []; this.striche = [];
    this.baueDom();
    this.start();
  }

  // ----- DOM -----
  baueDom() {
    const R = this.root;
    const kopf = el('div', 'ana-kopf');
    this.regionLeiste = el('div', 'ana-regionen'); this.regionLeiste.setAttribute('role', 'tablist');
    for (const r of REGIONEN) {
      const b = knopf('ana-chip', r.t, null, () => this.setzeRegion(r.k));
      b.dataset.k = r.k; b.setAttribute('role', 'tab'); this.regionLeiste.append(b);
    }
    this.seiteSeg = el('div', 'ana-seg');
    for (const [k, t] of [['r', 'rechts'], ['l', 'links']]) {
      const b = knopf('', t, `Seite ${t}`, () => this.setzeSeite(k)); b.dataset.k = k; this.seiteSeg.append(b);
    }
    const reihe = el('div', 'ana-reihe');
    this.diagKnopf = knopf('ana-diag', ICON.diag + '<span>Erklären</span>', 'Diagnose erklären', () => this.zeigeSzenen());
    this.alleKnopf = knopf('ana-pille', ICON.rueck + '<span>Alles zeigen</span>', 'Alles wieder einblenden', () => this.allesZeigen());
    this.alleKnopf.hidden = true;
    reihe.append(this.diagKnopf, this.regionLeiste, this.seiteSeg);
    kopf.append(reihe);
    this.buehneAlle = this.alleKnopf;

    this.buehne = el('div', 'ana-buehne');
    this.canvas = el('canvas', 'ana-canvas');
    this.labelEbene = el('div', 'ana-labels');
    this.legende = el('div', 'ana-legende');
    this.hinweis = el('div', 'ana-hinweis');
    this.laden = el('div', 'ana-laden', '');
    this.laden.innerHTML = '<div class="ana-laden-box"><b>Anatomie wird geladen</b><div class="ana-balken"><i></i></div><small>Einmalig etwa 2,5 MB, danach offline.</small></div>';
    this.vollZu = knopf('ana-vollzu', ICON.klein + '<span>Fertig</span>', 'Vollbild beenden', () => this.vollbild(false));
    this.buehne.append(this.canvas, this.labelEbene, this.legende, this.hinweis, this.vollZu, this.alleKnopf, this.laden);

    this.blatt = el('div', 'ana-blatt');
    this.blattGriff = knopf('ana-griff', '<i></i><span>Erklärung</span>', 'Blatt ein- oder ausklappen', () => this.blattKlein(!this.blatt.classList.contains('klein')));
    this.blattInhalt = el('div', 'ana-blatt-inhalt');
    this.blatt.append(this.blattGriff, this.blattInhalt);
    this.blattInhalt.addEventListener('click', (e) => { if (this.blatt.classList.contains('klein') && !e.target.closest('button')) this.blattKlein(false); });
    this.blattWisch();
    this.blatt.hidden = true;

    const wz = el('div', 'ana-werkzeug');
    this.wz = {};
    const W = (k, ic, t, fn) => { const b = knopf('ana-wz', ICON[ic] + `<span>${t}</span>`, t, fn); this.wz[k] = b; wz.append(b); };
    W('schicht', 'schicht', 'Schichten', () => this.panel('schicht'));
    W('liste', 'liste', 'Strukturen', () => this.panel('liste'));
    W('stift', 'stift', 'Zeichnen', () => this.panel('stift'));
    W('bewegung', 'bewegung', 'Bewegung', () => this.panel('bewegung'));
    W('ansicht', 'ansicht', 'Ansicht', () => this.ansichtZurueck());
    W('voll', 'voll', 'Vollbild', () => this.vollbild(!this.root.classList.contains('voll')));
    R.append(kopf, this.buehne, this.blatt, wz);
    this.markiereKopf();
  }

  // ----- Start -----
  async start() {
    const balken = this.laden.querySelector('i');
    try {
      const d = await ladeModell((f) => { balken.style.width = Math.round(f * 100) + '%'; });
      this.m = baue(d);
    } catch (e) {
      this.laden.querySelector('.ana-laden-box').innerHTML = '<b>Anatomie konnte nicht geladen werden</b><small>' + (e?.message || e) + '</small>';
      return;
    }
    balken.style.width = '100%';
    this.init3d();
    this.laden.classList.add('weg'); setTimeout(() => this.laden.remove(), 400);
    this.bereit = true;
    if (this.wartend) { const w = this.wartend; this.wartend = null; w(); }
    else this.setzeRegion('koerper', true);
  }

  init3d() {
    const r = this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: false});
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.szeneObj = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(30, 1, 5, 20000);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x7d8594, 1.15); this.szeneObj.add(hemi);
    this.kopfLicht = new THREE.DirectionalLight(0xffffff, 1.55); this.szeneObj.add(this.kopfLicht); this.szeneObj.add(this.kopfLicht.target);
    const fuell = new THREE.DirectionalLight(0xffffff, 0.45); fuell.position.set(-1, 2, -1.5); this.szeneObj.add(fuell);
    const n = this.m.teile.length;
    this.stat = new Uint8Array(n * 4 * 2);
    this.statTex = new THREE.DataTexture(this.stat, n, 2, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.statTex.magFilter = this.statTex.minFilter = THREE.NearestFilter; this.statTex.needsUpdate = true;
    this.matA = material(this.statTex, 0); this.matB = material(this.statTex, 1);
    this.meshA = new THREE.Mesh(this.m.geo, this.matA); this.meshB = new THREE.Mesh(this.m.geo, this.matB);
    this.meshA.frustumCulled = this.meshB.frustumCulled = false; this.meshB.renderOrder = 2;
    this.szeneObj.add(this.meshA, this.meshB);
    this.zusatz = new THREE.Group(); this.szeneObj.add(this.zusatz);
    // Zeichnung: Instanzen
    this.MAXP = 12000;
    this.punktGeo = new THREE.SphereGeometry(1.7, 8, 6);
    this.punktMesh = new THREE.InstancedMesh(this.punktGeo, new THREE.MeshBasicMaterial({color: 0xffffff}), this.MAXP);
    this.punktMesh.count = 0; this.punktMesh.frustumCulled = false; this.punktMesh.renderOrder = 5;
    this.punktMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.MAXP * 3), 3);
    this.szeneObj.add(this.punktMesh);
    this.pinGruppe = new THREE.Group(); this.szeneObj.add(this.pinGruppe);
    this.kam = {ziel: new V3(0, 0, 0), dist: 2600, az: 0, pol: Math.PI / 2, fl: null, vaz: 0, vpol: 0};
    this.gesten();
    new ResizeObserver(() => this.groesse()).observe(this.buehne);
    window.addEventListener('resize', () => this.lage());
    document.addEventListener('visibilitychange', () => this.anstossen());
    this.groesse();
    this.uhr = new THREE.Clock();
    this.anstossen();
  }

  // ----- Lage im App-Layout -----
  haenge(host) {
    this.host = host;
    if (this.root.parentNode !== host) host.append(this.root);
    this.lage(); this.anstossen();
    requestAnimationFrame(() => this.lage());
  }
  lage() {
    if (!this.host || !this.root.isConnected) return;
    if (this.root.classList.contains('voll')) { this.root.style.cssText = ''; return; }
    const hr = this.host.getBoundingClientRect(), mr = (this.host.closest('main') || this.host).getBoundingClientRect(), r = {top: Math.max(mr.top, hr.top - 8), left: mr.left, width: mr.width}, nav = document.querySelector('.app > nav, nav[aria-label="Bereiche"]');
    const unten = nav ? window.innerHeight - nav.getBoundingClientRect().top : 0;
    Object.assign(this.root.style, {top: Math.max(0, r.top) + 'px', left: r.left + 'px', width: r.width + 'px', bottom: unten + 'px'});
    this.groesse();
  }
  groesse() {
    if (!this.renderer) return;
    const w = this.buehne.clientWidth, h = this.buehne.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.anstossen();
  }

  // ----- Kamera und Gesten -----
  gesten() {
    const c = this.canvas, P = new Map(); let start = null, pinch = null, letzte = 0;
    const stop = (e) => e.stopPropagation();
    for (const t of ['touchstart', 'touchmove', 'touchend']) this.root.addEventListener(t, stop, {passive: true});
    c.addEventListener('pointerdown', (e) => {
      c.setPointerCapture(e.pointerId); P.set(e.pointerId, {x: e.clientX, y: e.clientY});
      this.kam.fl = null; this.kam.vaz = this.kam.vpol = 0;
      if (P.size === 1) {
        start = {x: e.clientX, y: e.clientY, t: performance.now(), zug: false};
        if (this.zustand.modus === 'stift') this.strichStart(e);
      } else if (P.size === 2) {
        if (this.aktStrich) this.strichEnde();
        const [a, b] = [...P.values()]; pinch = {d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, dist: this.kam.dist}; start = null;
      }
    });
    c.addEventListener('pointermove', (e) => {
      const p = P.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (P.size === 1 && start) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) start.zug = true;
        if (this.zustand.modus === 'stift' && this.aktStrich) { this.strichZug(e); return; }
        if (!start.zug) return;
        const k = 0.0062, now = performance.now(), dt = Math.max(8, now - letzte); letzte = now;
        this.kam.az -= dx * k; this.kam.pol = Math.min(Math.PI - 0.05, Math.max(0.05, this.kam.pol - dy * k));
        this.kam.vaz = -dx * k / dt * 16; this.kam.vpol = -dy * k / dt * 16;
        this.anstossen();
      } else if (P.size === 2 && pinch) {
        const [a, b] = [...P.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        this.kam.dist = Math.min(6000, Math.max(120, pinch.dist * pinch.d / Math.max(20, d)));
        this.verschiebe(mx - pinch.mx, my - pinch.my); pinch.mx = mx; pinch.my = my;
        this.anstossen();
      }
    });
    const ende = (e) => {
      if (!P.has(e.pointerId)) return;
      P.delete(e.pointerId);
      if (this.aktStrich && P.size === 0) this.strichEnde();
      if (start && !start.zug && performance.now() - start.t < 450 && P.size === 0) this.tippen(e);
      if (P.size === 0) { start = null; pinch = null; if (performance.now() - letzte > 80) this.kam.vaz = this.kam.vpol = 0; this.anstossen(); }
      if (P.size === 1) { const [p] = P.values(); start = {x: p.x, y: p.y, t: 0, zug: true}; pinch = null; }
    };
    c.addEventListener('pointerup', ende); c.addEventListener('pointercancel', ende);
    c.addEventListener('wheel', (e) => { e.preventDefault(); this.kam.dist = Math.min(6000, Math.max(120, this.kam.dist * Math.exp(e.deltaY * 0.0012))); this.anstossen(); }, {passive: false});
  }
  verschiebe(dx, dy) {
    const h = this.buehne.clientHeight || 1, f = 2 * this.kam.dist * Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2)) / h;
    const re = new V3().setFromMatrixColumn(this.cam.matrixWorld, 0), ob = new V3().setFromMatrixColumn(this.cam.matrixWorld, 1);
    this.kam.ziel.addScaledVector(re, -dx * f).addScaledVector(ob, dy * f);
  }
  kameraSetzen() {
    const k = this.kam, s = Math.sin(k.pol);
    this.cam.position.set(k.ziel.x + k.dist * s * Math.sin(k.az), k.ziel.y + k.dist * Math.cos(k.pol), k.ziel.z + k.dist * s * Math.cos(k.az));
    this.cam.lookAt(k.ziel); this.cam.updateMatrixWorld();
    this.kopfLicht.position.copy(this.cam.position).add(new V3(0, k.dist * 0.4, 0)); this.kopfLicht.target.position.copy(k.ziel);
  }
  fliege(ziel, dist, az, pol, ms = 650) {
    const k = this.kam;
    let daz = az - k.az; daz = ((daz + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    k.fl = {t0: performance.now(), ms, a: {ziel: k.ziel.clone(), dist: k.dist, az: k.az, pol: k.pol}, b: {ziel: ziel.clone(), dist, az: k.az + daz, pol}};
    k.vaz = k.vpol = 0; this.anstossen();
  }

  // ----- Darstellung -----
  anstossen() { if (!this.renderer || this.laeuft) return; this.laeuft = true; requestAnimationFrame((t) => this.bild(t)); }
  bild() {
    this.laeuft = false;
    if (!this.root.isConnected || document.hidden) return;
    const k = this.kam; let weiter = false;
    if (k.fl) {
      const t = Math.min(1, (performance.now() - k.fl.t0) / k.fl.ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, a = k.fl.a, b = k.fl.b;
      k.ziel.lerpVectors(a.ziel, b.ziel, e); k.dist = a.dist + (b.dist - a.dist) * e; k.az = a.az + (b.az - a.az) * e; k.pol = a.pol + (b.pol - a.pol) * e;
      if (t >= 1) k.fl = null; weiter = true;
    } else if (Math.abs(k.vaz) + Math.abs(k.vpol) > 0.0004) {
      k.az += k.vaz; k.pol = Math.min(Math.PI - 0.05, Math.max(0.05, k.pol + k.vpol)); k.vaz *= 0.9; k.vpol *= 0.9; weiter = true;
    }
    if (this.anim) { weiter = this.animSchritt() || weiter; }
    this.kameraSetzen();
    const zeit = this.uhr.getElapsedTime();
    this.matA.userData.u.uTime.value = zeit; this.matB.userData.u.uTime.value = zeit;
    for (const x of this.extras) if (x.userData.puls) { x.material.opacity = 0.65 + 0.3 * Math.sin(zeit * 3.2); }
    for (const p of this.pinGruppe.children) if (p.userData.ring) p.userData.ring.scale.setScalar(1 + 0.35 * (0.5 + 0.5 * Math.sin(zeit * 3.2)));
    this.renderer.render(this.szeneObj, this.cam);
    this.labelsSetzen();
    if (weiter || this.pulsiert) this.anstossen();
  }

  // ----- Zustand je Gruppe -> Textur -----
  aktualisiere() {
    if (!this.m) return;
    const Z = this.zustand, reg = REGIONEN.find((r) => r.k === Z.region), st = this.stat, n = this.m.teile.length;
    const fokus = this.fokusGruppen(reg);
    const szeneAn = this.marken.size > 0;
    this.pulsiert = false;
    const c = new THREE.Color();
    for (const t of this.m.teile) {
      const g = t.g, cls = g.cls, mark = this.marken.get(g.id), imFokus = fokus.has(g.id);
      let al = 1, puls = 0, hell = 0;
      c.set(FARBE[cls] || FARBE.knochen);
      const weich = cls === 'muskel' || cls === 'band' || cls === 'menisk';
      if (szeneAn && cls === 'muskel' && !mark) c.lerp(GRAU, 0.45);
      if (!imFokus) {
        al = Z.umgebung === 'aus' ? 0 : (cls === 'knochen' || cls === 'knorpel' || cls === 'disk' || cls === 'zahn') ? 0.16 : 0;
      } else {
        if (Z.schicht === 'tief' && weich && g.sup && !mark) al = 0.1;
        if (Z.schicht === 'knochen' && cls === 'muskel') al = mark === 'p' ? 0.55 : mark ? 0.22 : 0;
      }
      if (this.allein) {
        if (g.id === this.allein) al = 1;
        else al = (cls === 'knochen' && imFokus) ? 0.18 : 0;
      }
      if (this.aus.has(g.id)) al = 0;
      if (mark && !(Z.gesund && mark === 'p')) {
        c.set(mark === 'p' ? PROBLEM : BEH);
        if (mark === 'p') { puls = 1; this.pulsiert = true; }
      }
      if (this.wahl === g.id) { c.lerp(new THREE.Color(WAHL), 0.35); hell = 1; }
      const i = t.i * 4, j = (n + t.i) * 4;
      st[i] = c.r * 255; st[i + 1] = c.g * 255; st[i + 2] = c.b * 255; st[i + 3] = 255;
      st[j] = Math.round(al * 255); st[j + 1] = puls ? 160 : 0; st[j + 2] = hell * 255; st[j + 3] = 255;
    }
    this.statTex.needsUpdate = true;
    this.legendeSetzen();
    this.anstossen();
  }
  fokusGruppen(reg) {
    const s = new Set(), Z = this.zustand;
    for (const g of this.m.gruppen.values()) {
      if (reg.alles) { s.add(g.id); continue; }
      if (reg.seite && g.seite !== 'm' && g.seite !== Z.seite) continue;
      if (g.cls === 'knochen' || g.cls === 'knorpel' || g.cls === 'disk' || g.cls === 'zahn') {
        if (g.teile.some((i) => reg.b.test(this.m.teile[i].base))) s.add(g.id);
      } else if (reg.m.includes(g.key)) s.add(g.id);
    }
    for (const id of this.marken.keys()) s.add(id);
    return s;
  }
  alpha(t) { return this.stat[(this.m.teile.length + t.i) * 4] / 255; }

  // ----- Region und Seite -----
  setzeRegion(k, sofort) {
    if (!this.bereit) { this.wartend = () => this.setzeRegion(k, sofort); this.zustand.region = k; this.markiereKopf(); return; }
    this.bewegungAus();
    this.zustand.region = k; this.allein = null; this.wahl = null;
    this.markiereKopf(); this.aktualisiere(); this.ansichtZurueck(sofort);
    if (!this.szene) this.blattZu();
    this.hinweisZeigen(k === 'koerper' ? 'Region oben wählen. Ziehen dreht, zwei Finger zoomen und verschieben, Tippen wählt eine Struktur.' : '');
  }
  setzeSeite(s) {
    if (this.zustand.seite === s) return;
    this.bewegungAus();
    const alt = this.zustand.seite; this.zustand.seite = s;
    // Markierungen auf die andere Seite spiegeln
    const neu = new Map();
    for (const [id, v] of this.marken) { const g = this.m?.gruppen.get(id); const ziel = g && g.seite === alt ? g.key + '|' + s : id; if (this.m?.gruppen.has(ziel)) neu.set(ziel, v); }
    this.marken = neu; this.wahl = null; this.allein = null;
    this.markiereKopf(); this.extrasNeu(); this.aktualisiere(); this.ansichtZurueck();
    if (this.blattArt === 'struktur') this.blattZu();
  }
  markiereKopf() {
    const Z = this.zustand, reg = REGIONEN.find((r) => r.k === Z.region);
    for (const b of this.regionLeiste.children) b.classList.toggle('an', b.dataset.k === Z.region);
    const akt = this.regionLeiste.querySelector('.an'); if (akt) akt.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'});
    this.seiteSeg.hidden = !reg?.seite;
    for (const b of this.seiteSeg.children) b.classList.toggle('an', b.dataset.k === Z.seite);
    this.alleKnopf.hidden = !this.allein && this.aus.size === 0;
    if (this.wz?.bewegung) this.wz.bewegung.disabled = !(BEW_JE_REGION[Z.region]);
  }
  ansichtZurueck(sofort) {
    if (!this.m) return;
    const Z = this.zustand, reg = REGIONEN.find((r) => r.k === Z.region);
    let a = new V3(1e9, 1e9, 1e9), b = new V3(-1e9, -1e9, -1e9), c, rad, boxDist = 0;
    const rahmen = this.rahmen(reg);
    if (this.szene?.fokus === 'disk' && this.szene.r === Z.region) {}
    else if (rahmen) { c = rahmen.c; rad = rahmen.r; }
    else {
      const fok = this.fokusGruppen(reg);
      for (const t of this.m.teile) if (fok.has(t.g.id) && (reg.alles || t.g.cls === 'knochen')) { a.min(new V3(...t.min)); b.max(new V3(...t.max)); }
      c = a.clone().add(b).multiplyScalar(0.5); const hx = Math.max(b.x - a.x, b.z - a.z) / 2, hy = (b.y - a.y) / 2, tf = Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2));
      boxDist = Math.max(hy / tf, hx / (tf * (this.cam.aspect || 1))) * 1.06 + hx;
    }
    const sz = this.szene && this.szene.r === Z.region ? this.szene : null;
    const bl = new V3(...(sz?.blick || reg.blick)); if ((reg.seite || sz?.fokus === 'disk') && Z.seite === 'r') bl.x *= -1;
    if (sz?.fokus === 'disk') { const g = [...this.marken.keys()].find((id) => id.startsWith('disk:')); if (g) { c = this.mitte(g); rad = 105; } }
    bl.normalize();
    const az = Math.atan2(bl.x, bl.z), pol = Math.acos(Math.max(-1, Math.min(1, bl.y)));
    const asp = Math.min(1, this.cam.aspect || 1);
    if (!boxDist && this.root.clientWidth >= 700) rad *= 1.3;
    const dist = boxDist || rad / Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2)) / asp * 1.02;
    if (sofort) { Object.assign(this.kam, {ziel: c.clone(), dist, az, pol, fl: null}); this.anstossen(); }
    else this.fliege(c, dist, az, pol);
  }
  rahmen(reg) {
    const s = this.zustand.seite, P = this.pivots(s);
    const um = (pkt, r) => ({c: pkt.clone(), r});
    switch (reg.k) {
      case 'schulter': return um(P.gh.clone().add(new V3(s === 'r' ? 45 : -45, -20, 0)), 170);
      case 'ellenbogen': return um(P.ell, 165);
      case 'hand': return um(this.mitte('Os capitatum|' + s).add(new V3(0, -35, 0)), 115);
      case 'huefte': return um(P.huefte.clone().add(new V3(s === 'r' ? 40 : -40, -40, 0)), 200);
      case 'knie': return um(P.knie, 145);
      case 'fuss': return um(this.mitte('Os naviculare|' + s).add(new V3(0, 15, 0)), 155);
      case 'kiefer': return um(this.mitte('Mandibula|m', 'Mandibula|r', 'Mandibula|l').add(new V3(0, 25, -20)), 130);
      case 'hws': return um(this.mitte('wirbel:C4|m'), 150);
      case 'bws': return um(this.mitte('wirbel:Th7|m'), 260);
      case 'lws': return um(this.mitte('wirbel:L4|m').add(new V3(0, -30, 30)), 230);
    }
    return null;
  }
  mitte(...ids) {
    const v = new V3(); let n = 0, pos = this.m.pos;
    for (const id of ids) { const g = this.m.gruppen.get(id); if (!g) continue; for (const ti of g.teile) { const t = this.m.teile[ti]; for (let i = t.vs; i < t.vs + t.v; i++) { v.x += pos[i * 3]; v.y += pos[i * 3 + 1]; v.z += pos[i * 3 + 2]; n++; } } }
    return n ? v.multiplyScalar(1 / n) : v;
  }
  verts(id) {
    const g = this.m.gruppen.get(id); if (!g) return [];
    const out = [], pos = this.m.pos;
    for (const ti of g.teile) { const t = this.m.teile[ti]; for (let i = t.vs; i < t.vs + t.v; i++) out.push(i); }
    return out;
  }
  // Gelenkzentren aus der Ruhelage
  pivots(s) {
    if (!this._piv) this._piv = {};
    if (this._piv[s]) return this._piv[s];
    const pos = this.m.basis || this.m.pos, P = (i) => new V3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
    const band = (id, f) => this.verts(id).map(P).filter(f);
    const mean = (L) => L.reduce((a, b) => a.add(b), new V3()).multiplyScalar(1 / Math.max(1, L.length));
    const yR = (id) => { const L = this.verts(id).map(P); return [Math.min(...L.map((p) => p.y)), Math.max(...L.map((p) => p.y))]; };
    const [hu0, hu1] = yR('Humerus|' + s);
    const kopf = band('Humerus|' + s, (p) => p.y > hu1 - 34); const mx = kopf.map((p) => Math.abs(p.x)).sort((a, b) => a - b)[Math.floor(kopf.length * 0.5)];
    const gh = mean(kopf.filter((p) => Math.abs(p.x) <= mx)); gh.y = hu1 - 26;
    const ell = mean(band('Humerus|' + s, (p) => p.y < hu0 + 24)); ell.y = hu0 + 13;
    const [fe0, fe1] = yR('Femur|' + s);
    const oben = band('Femur|' + s, (p) => p.y > fe1 - 70); const mf = oben.map((p) => Math.abs(p.x)).sort((a, b) => a - b)[Math.floor(oben.length * 0.3)];
    const hk = oben.filter((p) => Math.abs(p.x) <= mf); const huefte = mean(hk); huefte.y = Math.max(...hk.map((p) => p.y)) - 23;
    const knie = mean(band('Femur|' + s, (p) => p.y < fe0 + 32)); knie.y = fe0 + 21;
    const [ta0, ta1] = yR('Talus|' + s);
    const osg = mean(band('Talus|' + s, (p) => p.y > ta1 - 10)); osg.y = ta1 - 11;
    const scap = this.mitte('Scapula|' + s);
    return (this._piv[s] = {gh, ell, huefte, knie, osg, scap});
  }

  // ----- Antippen und Auswahl -----
  strahl(e) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const rc = new THREE.Raycaster(); rc.setFromCamera(v, this.cam); return rc.ray;
  }
  treffer(ray) {
    const pos = this.m.pos, idx = this.m.idx, o = ray.origin, d = ray.direction;
    let best = null, bt = 1e12;
    const e1 = new V3(), e2 = new V3(), pv = new V3(), tv = new V3(), qv = new V3(), a = new V3(), b = new V3(), c = new V3();
    for (const t of this.m.teile) {
      if (this.alpha(t) < 0.99) continue;
      if (t.dirty) { kugel(t, pos); t.dirty = false; }
      const oc = new V3().subVectors(t.c, o), tc = oc.dot(d), d2 = oc.lengthSq() - tc * tc;
      if (d2 > t.r * t.r || tc + t.r < 0 || tc - t.r > bt) continue;
      for (let f = t.ts; f < t.ts + t.t; f++) {
        const ia = idx[f * 3], ib = idx[f * 3 + 1], ic = idx[f * 3 + 2];
        a.fromArray(pos, ia * 3); b.fromArray(pos, ib * 3); c.fromArray(pos, ic * 3);
        e1.subVectors(b, a); e2.subVectors(c, a); pv.crossVectors(d, e2);
        const det = e1.dot(pv); if (Math.abs(det) < 1e-9) continue;
        const inv = 1 / det; tv.subVectors(o, a); const u = tv.dot(pv) * inv; if (u < 0 || u > 1) continue;
        qv.crossVectors(tv, e1); const w = d.dot(qv) * inv; if (w < 0 || u + w > 1) continue;
        const tt = e2.dot(qv) * inv; if (tt > 0.1 && tt < bt) { bt = tt; best = {teil: t, f: [ia, ib, ic], bary: [1 - u - w, u, w], t: tt}; }
      }
    }
    return best;
  }
  ortVon(h, off = 0) {
    const p = new V3(), n = new V3(), pos = this.m.pos, nr = this.m.nrm;
    h.f.forEach((vi, k) => { p.x += pos[vi * 3] * h.bary[k]; p.y += pos[vi * 3 + 1] * h.bary[k]; p.z += pos[vi * 3 + 2] * h.bary[k]; n.x += nr[vi * 3] * h.bary[k]; n.y += nr[vi * 3 + 1] * h.bary[k]; n.z += nr[vi * 3 + 2] * h.bary[k]; });
    return off ? p.addScaledVector(n.normalize(), off) : p;
  }
  tippen(e) {
    if (!this.m) return;
    const h = this.treffer(this.strahl(e));
    if (this.zustand.modus === 'punkt') { if (h) this.setzePin(h); return; }
    if (this.zustand.modus === 'stift') return;
    if (!h) { if (this.wahl) { this.wahl = null; this.wahlLabel = null; this.aktualisiere(); if (this.blattArt === 'struktur') this.szene ? this.zeigeSzeneBlatt() : this.blattZu(); } return; }
    this.waehle(h.teil.g.id, h);
  }
  waehle(id, h) {
    this.wahl = id; this.wahlLabel = h ? {f: h.f, bary: h.bary} : this.ankerFuer(id);
    this.aktualisiere(); this.zeigeStruktur(id);
  }
  ankerFuer(id) {
    const L = this.verts(id); if (!L.length) return null;
    const pos = this.m.pos, c = this.mitte(id), cp = this.cam.position;
    let best = L[0], bw = -1e9;
    for (const vi of L) { const p = new V3().fromArray(pos, vi * 3); const w = -p.distanceTo(cp) - 0.6 * p.distanceTo(c); if (w > bw) { bw = w; best = vi; } }
    return {f: [best, best, best], bary: [1, 0, 0]};
  }

  // ----- Beschriftungen -----
  labelsSetzen() {
    const E = this.labelEbene, w = this.buehne.clientWidth, h = this.buehne.clientHeight;
    const L = [];
    for (const x of this.labels) L.push(x.id ? {...x, t: this.nm(this.m.gruppen.get(x.id))} : x.lat && this.zustand.sprache === 'lat' ? {...x, t: x.lat} : x);
    while (E.children.length < L.length) { const d = el('div', 'ana-label'); d.innerHTML = '<i></i><span></span>'; E.append(d); }
    while (E.children.length > L.length) E.lastChild.remove();
    L.forEach((x, i) => {
      const d = E.children[i], p = (x.pos ? x.pos() : this.ortVon(x.a, 2)).project(this.cam);
      const sx = (p.x * 0.5 + 0.5) * w, sy = (-p.y * 0.5 + 0.5) * h;
      d.className = 'ana-label ' + (x.art || ''); d.hidden = p.z > 1;
      d.style.transform = `translate(${sx}px, ${sy}px)`;
      const sp = d.lastChild; if (sp.textContent !== x.t) sp.textContent = x.t;
      const bw = d.lastChild.offsetWidth || 120, links = sx + bw + 20 > w && sx - bw - 20 > 0; d.classList.toggle('links', links);
      d.lastChild.style.transform = links ? '' : `translateX(${Math.min(0, w - (sx + 12 + bw) - 6)}px)`;
    });
  }
  legendeSetzen() {
    const hatP = [...this.marken.values()].includes('p'), hatB = [...this.marken.values()].includes('b'), nerv = this.extras.some((x) => x.userData.nerv);
    const arth = !!this.arthroseAn;
    let h = '';
    if (hatP && !this.zustand.gesund) h += '<span><i style="background:' + PROBLEM + '"></i>Beschwerden</span>';
    if (arth && !this.zustand.gesund) h += `<span><i style="background:${this.arthroseFarbe}"></i>${this.szene?.k === 'tep' ? 'Ersetztes Gelenk' : 'Gelenkfläche'}</span>`;
    if (hatB) h += '<span><i style="background:' + BEH + '"></i>Daran arbeiten wir</span>';
    if (nerv) h += '<span><i style="background:' + NERV + '"></i>Nerv (schematisch)</span>';
    this.legende.innerHTML = h; this.legende.hidden = !h;
  }
  hinweisZeigen(t) {
    this.hinweis.textContent = t || ''; this.hinweis.classList.toggle('an', !!t);
    clearTimeout(this._hw); if (t) this._hw = setTimeout(() => this.hinweis.classList.remove('an'), 5200);
  }

  // ----- Blatt (unten) -----
  blattOeffnen(art, aufbau) {
    this.blattArt = art; this.blatt.hidden = false; this.blatt.classList.remove('klein');
    this.blattInhalt.innerHTML = ''; aufbau(this.blattInhalt);
    for (const [k, b] of Object.entries(this.wz)) b.classList.toggle('an', k === art);
    this.blattInhalt.scrollTop = 0;
  }
  blattZu() { this.blatt.hidden = true; this.blattArt = null; for (const b of Object.values(this.wz)) b.classList.remove('an'); if (this.zustand.modus !== 'drehen') this.setzeModus('drehen'); }
  blattKlein(k) { this.blatt.classList.toggle('klein', k); this.blattGriff.setAttribute('aria-expanded', String(!k)); }
  blattWisch() {
    let y0 = null;
    const g = this.blattGriff;
    g.addEventListener('pointerdown', (e) => { y0 = e.clientY; g.setPointerCapture(e.pointerId); });
    g.addEventListener('pointerup', (e) => { if (y0 == null) return; const d = e.clientY - y0; y0 = null; if (d > 25) this.blattKlein(true); else if (d < -25) this.blattKlein(false); });
  }
  kopfzeile(B, titel, unter) {
    const k = el('div', 'ana-bkopf'); const t = el('div', 'ana-btitel'); t.append(el('h3', '', titel)); if (unter) t.append(el('small', '', unter));
    k.append(t, knopf('ana-x', ICON.zu, 'Schließen', () => { if (this.blattArt === 'struktur' && this.szene) { this.wahl = null; this.aktualisiere(); this.zeigeSzeneBlatt(); } else this.blattZu(); }));
    B.append(k); return k;
  }
  panel(k) {
    if (this.blattArt === k) { this.blattZu(); return; }
    if (k === 'schicht') this.zeigeSchichten();
    else if (k === 'liste') this.zeigeListe();
    else if (k === 'stift') this.zeigeStift();
    else if (k === 'bewegung') this.zeigeBewegung();
  }
  zeigeStruktur(id) {
    const g = this.m.gruppen.get(id);
    this.blattOeffnen('struktur', (B) => {
      this.kopfzeile(B, this.nm(g), this.nm2(g) + (g.seite === 'r' ? ' · rechts' : g.seite === 'l' ? ' · links' : ''));
      if (g.fn) B.append(el('p', 'ana-text', g.fn));
      if (g.s) B.append(el('p', 'ana-fein', 'Schematisch dargestellt, Lage und Form vereinfacht.'));
      const r = el('div', 'ana-aktionen'), m = this.marken.get(id);
      const ak = (t, cls, an, fn) => { const b = knopf('ana-akt ' + cls + (an ? ' an' : ''), t, null, fn); r.append(b); };
      ak('Beschwerden', 'rot', m === 'p', () => { this.markiere(id, m === 'p' ? null : 'p'); this.zeigeStruktur(id); });
      ak('Daran arbeiten wir', 'blau', m === 'b', () => { this.markiere(id, m === 'b' ? null : 'b'); this.zeigeStruktur(id); });
      ak(this.allein === id ? 'Wieder alle' : 'Allein zeigen', '', this.allein === id, () => { this.allein = this.allein === id ? null : id; this.markiereKopf(); this.aktualisiere(); this.zeigeStruktur(id); });
      ak('Ausblenden', '', false, () => { this.aus.add(id); this.wahl = null; this.markiereKopf(); this.aktualisiere(); this.szene ? this.zeigeSzeneBlatt() : this.blattZu(); });
      B.append(r);
    });
  }
  nm(g) { return this.zustand.sprache === 'lat' ? g.lat : g.de; }
  nm2(g) { return this.zustand.sprache === 'lat' ? g.de : g.lat; }
  markiere(id, art) { if (art) this.marken.set(id, art); else this.marken.delete(id); this.aktualisiere(); }
  allesZeigen() { this.aus.clear(); this.allein = null; this.markiereKopf(); this.aktualisiere(); }

  zeigeSchichten() {
    this.blattOeffnen('schicht', (B) => {
      this.kopfzeile(B, 'Schichten');
      const Z = this.zustand;
      const seg = (titel, k, opts) => {
        B.append(el('p', 'ana-gruppe', titel));
        const s = el('div', 'ana-seg breit');
        for (const [v, t] of opts) { const b = knopf(Z[k] === v ? 'an' : '', t, null, () => { Z[k] = v; this.aktualisiere(); this.zeigeSchichten(); }); s.append(b); }
        B.append(s);
      };
      seg('Was ist zu sehen', 'schicht', [['alle', 'Alle Muskeln'], ['tief', 'Tiefe Muskeln'], ['knochen', 'Knochen und Bänder']]);
      seg('Rest des Körpers', 'umgebung', [['blass', 'Blass zeigen'], ['aus', 'Ausblenden']]);
      seg('Begriffe', 'sprache', [['lat', 'Latein'], ['de', 'Deutsch']]);
      B.append(el('p', 'ana-fein', '3D-Modell: BodyParts3D, © The Database Center for Life Science, CC BY-SA 2.1 JP, für Doku-Fix verkleinert. Menisken, Kreuz- und Außenbänder, Plantarfaszie und Nerven sind schematisch ergänzt.'));
      if (this.aus.size || this.allein) { const b = knopf('ana-akt', 'Ausgeblendetes wieder zeigen', null, () => { this.allesZeigen(); this.zeigeSchichten(); }); B.append(b); }
    });
  }

  zeigeListe(filter = '') {
    this.blattOeffnen('liste', (B) => {
      this.kopfzeile(B, 'Strukturen', REGIONEN.find((r) => r.k === this.zustand.region).t);
      const such = el('input', 'ana-suche'); such.type = 'search'; such.placeholder = 'Suchen, z. B. Bizeps oder supraspinatus'; such.value = filter;
      const liste = el('div', 'ana-liste');
      const fuell = () => {
        liste.innerHTML = '';
        const q = norm(such.value).trim();
        const reg = REGIONEN.find((r) => r.k === this.zustand.region), fok = this.fokusGruppen(reg);
        const L = [...this.m.gruppen.values()].filter((g) => (q ? true : fok.has(g.id)) && (g.seite === 'm' || g.seite === this.zustand.seite || !reg.seite));
        const treff = L.filter((g) => !q || norm(g.de + ' ' + g.lat + ' ' + g.key).includes(q));
        const seen = new Set(), sort = treff.sort((a, b) => this.nm(a).localeCompare(this.nm(b), 'de')).filter((g) => { const k = g.de + g.seite; if (seen.has(k)) return false; seen.add(k); return true; });
        const gruppenNamen = {muskel: 'Muskeln', band: 'Sehnen und Bänder', menisk: 'Sehnen und Bänder', knochen: 'Knochen', knorpel: 'Knochen', disk: 'Bandscheiben', zahn: 'Zähne'};
        for (const kat of ['Muskeln', 'Sehnen und Bänder', 'Bandscheiben', 'Knochen', 'Zähne']) {
          const T = sort.filter((g) => gruppenNamen[g.cls] === kat).slice(0, q ? 40 : 200); if (!T.length) continue;
          liste.append(el('p', 'ana-gruppe', kat));
          for (const g of T) {
            const m = this.marken.get(g.id);
            const b = knopf('ana-zeile', `<span><b>${this.nm(g)}</b><small>${this.nm2(g)}${g.seite === 'r' ? ' · re.' : g.seite === 'l' ? ' · li.' : ''}</small></span>${m ? `<i class="${m === 'p' ? 'rot' : 'blau'}"></i>` : ''}`, null, () => {
              if (q && !fok.has(g.id)) { this.zustand.umgebung = 'blass'; }
              this.waehle(g.id);
            });
            liste.append(b);
          }
        }
        if (!liste.children.length) liste.append(el('p', 'ana-fein', 'Nichts gefunden.'));
      };
      such.addEventListener('input', fuell);
      B.append(such, liste); fuell();
    });
  }

  // ----- Zeichnen und Punkte -----
  setzeModus(m) {
    this.zustand.modus = m; this.canvas.classList.toggle('stift', m === 'stift'); this.canvas.classList.toggle('punkt', m === 'punkt');
  }
  zeigeStift() {
    if (this.zustand.modus === 'drehen') this.setzeModus('stift');
    this.blattOeffnen('stift', (B) => {
      this.kopfzeile(B, 'Zeichnen und markieren', 'Mit dem Finger direkt aufs Modell. Zwei Finger drehen weiter.');
      const s = el('div', 'ana-seg breit');
      for (const [m, t] of [['stift', 'Stift'], ['punkt', 'Schmerzpunkt'], ['drehen', 'Nur drehen']]) s.append(knopf(this.zustand.modus === m ? 'an' : '', t, null, () => { this.setzeModus(m); this.zeigeStift(); }));
      B.append(s);
      if (this.zustand.modus === 'stift') {
        const f = el('div', 'ana-farben');
        for (const [c, t] of [[PROBLEM, 'Rot'], [BEH, 'Blau'], ['#2BB34A', 'Grün'], ['#FFCC00', 'Gelb']]) {
          const b = knopf('ana-farbe' + (this.zustand.farbe === c ? ' an' : ''), '', t, () => { this.zustand.farbe = c; this.zeigeStift(); }); b.style.setProperty('--c', c); f.append(b);
        }
        B.append(f);
      }
      const r = el('div', 'ana-aktionen');
      r.append(knopf('ana-akt', 'Letzten Strich weg', null, () => this.strichZurueck()));
      r.append(knopf('ana-akt', 'Alles löschen', null, () => this.zeichnungLoeschen()));
      B.append(r, el('p', 'ana-fein', 'Zeichnungen und Punkte bleiben nur, solange die Ansicht offen ist. Es wird nichts gespeichert.'));
    });
  }
  strichStart(e) { this.aktStrich = {start: this.punkte.length}; this.strichZug(e); }
  strichZug(e) {
    const now = performance.now(); if (this._sz && now - this._sz < 14) return; this._sz = now;
    const h = this.treffer(this.strahl(e)); if (!h) { this.letzterP = null; return; }
    const p = this.ortVon(h, 1.4);
    const add = (hh) => { if (this.punkte.length >= this.MAXP) return; this.punkte.push({h: hh, c: new THREE.Color(this.zustand.farbe)}); };
    if (this.letzterP && this.letzterP.p.distanceTo(p) < 40) {
      const n = Math.floor(this.letzterP.p.distanceTo(p) / 1.6);
      for (let i = 1; i < n; i++) { const t = i / n; add({punkt: this.letzterP.p.clone().lerp(p, t)}); }
    }
    add({f: h.f, bary: h.bary}); this.letzterP = {p};
    this.punkteNeu();
  }
  strichEnde() { if (this.aktStrich) this.striche.push(this.aktStrich.start); this.aktStrich = null; this.letzterP = null; }
  strichZurueck() {
    if (this.pinGruppe.children.length && (!this.striche.length || this.pinGruppe.userData.letzt > (this.striche.at(-1) ?? -1))) { this.pinGruppe.remove(this.pinGruppe.children.at(-1)); this.labels = this.labels.filter((x) => x.pin !== true || this.pinGruppe.children.some((p) => p.userData.l === x)); this.anstossen(); return; }
    const s = this.striche.pop(); if (s == null) return; this.punkte.length = s; this.punkteNeu();
  }
  zeichnungLoeschen() { this.punkte = []; this.striche = []; this.pinGruppe.clear(); this.labels = this.labels.filter((x) => !x.pin); this.punkteNeu(); }
  punkteNeu() {
    const M = this.punktMesh, mat = new THREE.Matrix4();
    this.punkte.forEach((pt, i) => {
      const p = pt.h.punkt ? pt.h.punkt : this.ortVon(pt.h, 1.4);
      mat.makeTranslation(p.x, p.y, p.z); M.setMatrixAt(i, mat); M.setColorAt(i, pt.c);
    });
    M.count = this.punkte.length; M.instanceMatrix.needsUpdate = true; if (M.instanceColor) M.instanceColor.needsUpdate = true; this.anstossen();
  }
  setzePin(h) {
    const g = new THREE.Group();
    const kopf = new THREE.Mesh(new THREE.SphereGeometry(5.5, 16, 12), new THREE.MeshStandardMaterial({color: PROBLEM, emissive: PROBLEM, emissiveIntensity: 0.35}));
    const ring = new THREE.Mesh(new THREE.RingGeometry(8, 11, 32), new THREE.MeshBasicMaterial({color: PROBLEM, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false}));
    g.add(kopf, ring); g.userData = {h, ring}; ring.userData.billboard = true;
    this.pinGruppe.add(g); this.pinGruppe.userData.letzt = this.punkte.length;
    const lab = {a: {f: h.f, bary: h.bary}, t: 'Hier tut es weh', art: 'pin', pin: true}; g.userData.l = lab; this.labels.push(lab);
    this.pinsNeu(); this.anstossen();
  }
  pinsNeu() {
    for (const g of this.pinGruppe.children) { g.position.copy(this.ortVon(g.userData.h, 3)); g.userData.ring.lookAt(this.cam.position); }
  }

  // ----- Erklär-Szenen -----
  zeigeSzenen() {
    this.blattOeffnen('szenen', (B) => {
      this.kopfzeile(B, 'Was soll ich erklären?', 'Tippe eine Diagnose an. Region, Seite und Markierungen werden gesetzt.');
      const such = el('input', 'ana-suche'); such.type = 'search'; such.placeholder = 'Diagnose suchen';
      const L = el('div', 'ana-liste');
      const fuell = () => {
        L.innerHTML = ''; const q = norm(such.value);
        for (const r of REGIONEN.slice(1)) {
          const S = SZENEN.filter((s) => s.r === r.k && (!q || norm(s.t + ' ' + s.fach).includes(q))); if (!S.length) continue;
          L.append(el('p', 'ana-gruppe', r.t));
          for (const s of S) L.append(knopf('ana-zeile' + (this.szene?.k === s.k ? ' an' : ''), `<span><b>${s.t}</b><small>${s.fach}</small></span>`, null, () => this.starteSzene(s)));
        }
      };
      such.addEventListener('input', fuell);
      B.append(such, L); fuell();
      if (this.szene || this.marken.size) B.append(knopf('ana-akt', 'Markierungen entfernen', null, () => { this.szeneAus(); this.blattZu(); }));
    });
  }
  szeneAus() { this.szene = null; this.patient = null; this.marken.clear(); this.labels = this.labels.filter((x) => x.pin); this.extrasAus(); this.arthroseAus(); this.zustand.gesund = false; this.aktualisiere(); }
  starteSzene(s, opt = {}) {
    if (!this.bereit) { this.wartend = () => this.starteSzene(s, opt); return; }
    this.szeneAus(); this.bewegungAus();
    this.szene = s; this.patient = opt.patient || null;
    if (opt.seite) this.zustand.seite = opt.seite;
    this.zustand.region = s.r; this.allein = null; this.wahl = null; this.aus.clear(); this.zustand.schicht = s.schicht || 'alle';
    const sd = REGIONEN.find((r) => r.k === s.r).seite ? this.zustand.seite : 'm';
    const ids = (k) => { if (sd !== 'm') { for (const c of [k + '|' + sd, k + '|m']) if (this.m.gruppen.has(c)) return [c]; return []; } return [k + '|m', k + '|r', k + '|l'].filter((c) => this.m.gruppen.has(c)); };
    let disk = s.prolaps;
    if (opt.segment && s.k === 'bandscheibe') disk = opt.segment;
    for (const k of s.aus || []) for (const i of ids(k)) this.aus.add(i);
    for (const k of s.b) for (const i of ids(k)) this.marken.set(i, 'b');
    for (const k of opt.beh || []) for (const i of ids(k)) this.marken.set(i, 'b');
    for (const k0 of s.p) { const k = k0.startsWith('disk:') && disk ? 'disk:' + disk : k0; for (const i of ids(k)) this.marken.set(i, 'p'); }
    this.markiereKopf();
    this.ansichtZurueck();
    setTimeout(() => {
      this.extrasNeu(disk); this.aktualisiere();
      this.labels = this.labels.filter((x) => x.pin);
      const schon = new Set();
      for (const [gid, art] of [...this.marken].sort((x, y) => (y[0].endsWith('|' + this.zustand.seite)) - (x[0].endsWith('|' + this.zustand.seite)))) if (art === 'p') { const t = this.m.gruppen.get(gid).de; if (schon.has(t)) continue; schon.add(t); const a = this.ankerFuer(gid); if (a) this.labels.push({a, t, art: 'problem', id: gid}); }
      this.anstossen();
    }, 700);
    this.aktualisiere();
    this.zeigeSzeneBlatt(true);
  }
  zeigeSzeneBlatt(klein) {
    const s = this.szene; if (!s) return this.blattZu();
    const warKlein = this.blattArt === 'szene' && this.blatt.classList.contains('klein');
    this.blattOeffnen('szene', (B) => {
      this.kopfzeile(B, s.t, s.fach + (this.patient ? ' · aus der Doku übernommen' : ''));
      const seg = el('div', 'ana-seg breit');
      for (const [v, t] of [[false, 'Mit Befund'], [true, 'Gesund']]) seg.append(knopf(this.zustand.gesund === v ? 'an' : '', t, null, () => { this.zustand.gesund = v; this.extrasSichtbar(); this.aktualisiere(); this.zeigeSzeneBlatt(); }));
      B.append(seg);
      B.append(el('p', 'ana-gruppe', 'Was ist los?'), el('p', 'ana-text', s.was), el('p', 'ana-gruppe', 'Woran wir arbeiten'), el('p', 'ana-text', s.wir));
      const chips = el('div', 'ana-chips');
      for (const [gid, art] of this.marken) {
        const g = this.m.gruppen.get(gid); if (!g) continue;
        if (chips.querySelector(`[data-n="${CSS_esc(this.nm(g))}"]`)) continue; const b = knopf('ana-mchip ' + (art === 'p' ? 'rot' : 'blau'), this.nm(g), null, () => this.waehle(gid)); b.dataset.n = this.nm(g); chips.append(b);
      }
      if (chips.children.length) B.append(chips);
      if (this.patient?.beh?.length) B.append(el('p', 'ana-fein', 'Laut Doku behandelt: ' + this.patient.beh.join(', ')));
      const zeile = el('div', 'ana-aktionen');
      if (s.bew) zeile.append(knopf('ana-akt', 'Bewegung zeigen', null, () => this.zeigeBewegung(s.bew)));
      zeile.append(knopf('ana-akt', 'Andere Diagnose', null, () => this.zeigeSzenen()));
      B.append(zeile, el('p', 'ana-fein', 'Erklärtexte: Entwurf, fachlich prüfen.'));
    });
    if ((klein || warKlein) && this.root.clientWidth < 700) this.blattKlein(true);
  }

  // ----- Zusatzdarstellungen: Vorfall, Nerv, Arthrose -----
  extrasAus() { for (const x of this.extras) { this.zusatz.remove(x); x.geometry.dispose(); } this.extras = []; this.labels = this.labels.filter((x) => !x.extra); }
  extrasSichtbar() { for (const x of this.extras) x.visible = !(this.zustand.gesund && x.userData.befund); if (this.arthroseAn) this.arthroseFaerben(); this.legendeSetzen(); }
  extrasNeu(disk) {
    this.extrasAus(); this.arthroseAus();
    const s = this.szene; if (!s || !this.m) return;
    const sd = this.zustand.seite, lat = sd === 'r' ? -1 : 1;
    const rohr = (pkte, r, farbe, opt = {}) => {
      const kurve = new THREE.CatmullRomCurve3(pkte);
      const m = new THREE.Mesh(new THREE.TubeGeometry(kurve, 48, r, 12, false), new THREE.MeshStandardMaterial({color: farbe, roughness: 0.5, emissive: farbe, emissiveIntensity: 0.18, transparent: !!opt.alpha, opacity: opt.alpha || 1, depthWrite: !opt.alpha}));
      m.userData = opt; this.zusatz.add(m); this.extras.push(m); return m;
    };
    if (s.prolaps) {
      const id = 'disk:' + (disk || s.prolaps) + '|m'; const g = this.m.gruppen.get(id); if (!g) return;
      const L = this.verts(id).map((i) => new V3().fromArray(this.m.pos, i * 3));
      const c = L.reduce((a, b) => a.add(b), new V3()).multiplyScalar(1 / L.length);
      const hinten = Math.min(...L.map((p) => p.z)), oben = Math.max(...L.map((p) => p.y));
      const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshStandardMaterial({color: PROBLEM, emissive: PROBLEM, emissiveIntensity: 0.3, roughness: 0.4, transparent: true, opacity: 0.9}));
      blob.scale.set(8, 5.5, 6.5); blob.position.set(c.x + lat * 9, c.y, hinten - 2.5);
      blob.userData = {befund: true, puls: true}; this.zusatz.add(blob); this.extras.push(blob);
      // Duralsack und Nervenwurzel (schematisch)
      rohr([new V3(0, oben + 140, hinten - 12), new V3(0, c.y, hinten - 13), new V3(0, c.y - 60, hinten - 18)], 7, NERV, {alpha: 0.35, nerv: true});
      const w = rohr([new V3(lat * 10, c.y + 6, hinten - 11), new V3(lat * 16, c.y - 12, hinten - 9), new V3(lat * 30, c.y - 40, hinten - 4), new V3(lat * 45, c.y - 75, hinten + 2)], 2.8, NERV, {nerv: true});
      this.labels.push({pos: () => new V3(lat * 30, c.y - 40, hinten - 4), t: 'Nervenwurzel', lat: 'Radix nervi spinalis', art: 'nerv', extra: true});
      this.labels.push({pos: () => blob.position.clone(), t: 'Vorfall', lat: 'Prolaps', art: 'problem', extra: true});
    }
    if (s.nerv === 'medianus') {
      const r = this.mitte('retinac|' + sd), cap = this.mitte('Os capitatum|' + sd);
      const vorn = r.clone().sub(cap).normalize(); // Richtung handflächenseitig
      const tunnel = r.clone().addScaledVector(vorn, -5);
      const unterarm = this.mitte('Radius|' + sd).lerp(this.mitte('Ulna|' + sd), 0.5).addScaledVector(vorn, 18);
      const p1 = tunnel.clone().add(new V3(0, 45, 0)).addScaledVector(vorn, 4);
      rohr([unterarm, p1, tunnel, tunnel.clone().add(new V3(0, -25, 0)).addScaledVector(vorn, 4)], 2.4, NERV, {nerv: true});
      const ziel = [['thumb', 'Daumen'], ['index finger', 'Zeigefinger'], ['middle finger', 'Mittelfinger']];
      const ende = tunnel.clone().add(new V3(0, -25, 0)).addScaledVector(vorn, 4);
      for (const [f] of ziel) { const g = this.mitte('phal:proximal:' + f + '|' + sd); if (g.lengthSq()) rohr([ende, ende.clone().lerp(g, 0.5).addScaledVector(vorn, 6), g.clone().addScaledVector(vorn, 7)], 1.3, NERV, {nerv: true}); }
      this.labels.push({pos: () => tunnel.clone().addScaledVector(vorn, 2), t: 'Mittelnerv', lat: 'N. medianus', art: 'nerv', extra: true});
    }
    if (s.arthrose) this.arthrose(s.arthrose, s.k === 'tep');
    this.extrasSichtbar();
  }
  arthroseAus() { if (this.arthroseAn) { this.m.over.fill(0); this.m.geo.attributes.aOver.needsUpdate = true; } this.arthroseAn = null; }
  arthrose(gelenk, tep) {
    const sd = this.zustand.seite;
    const paare = {knie: [['Femur|' + sd, 'Tibia|' + sd]], huefte: [['Femur|' + sd, 'Os coxae|' + sd]], schulter: [['Humerus|' + sd, 'Scapula|' + sd]], kiefer: [['Mandibula|m', 'Os temporale|r'], ['Mandibula|m', 'Os temporale|l']]}[gelenk] || [];
    const pos = this.m.pos, werte = new Map();
    const raster = (L) => { const H = new Map(); for (const i of L) { const k = Math.floor(pos[i * 3] / 8) + ',' + Math.floor(pos[i * 3 + 1] / 8) + ',' + Math.floor(pos[i * 3 + 2] / 8); (H.get(k) || H.set(k, []).get(k)).push(i); } return H; };
    const abst = (i, H) => {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], cx = Math.floor(x / 8), cy = Math.floor(y / 8), cz = Math.floor(z / 8); let d = 1e9;
      for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (let c = -2; c <= 2; c++) { const L = H.get((cx + a) + ',' + (cy + b) + ',' + (cz + c)); if (L) for (const j of L) { const dd = (pos[j * 3] - x) ** 2 + (pos[j * 3 + 1] - y) ** 2 + (pos[j * 3 + 2] - z) ** 2; if (dd < d) d = dd; } }
      return Math.sqrt(d);
    };
    for (const [ia, ib] of paare) {
      const LA = this.verts(ia).length ? this.verts(ia) : [], LB = this.verts(ib);
      if (!LA.length || !LB.length) continue;
      for (const [P, Q] of [[LA, LB], [LB, LA]]) {
        const H = raster(Q), d = P.map((i) => abst(i, H)); const sortiert = [...d].sort((a, b) => a - b), d0 = sortiert[Math.floor(sortiert.length * 0.004)] || 0;
        P.forEach((i, k) => { let w = 1 - ss(d0 + 1.5, d0 + 9, d[k]); if (gelenk === 'knie' && !tep) { const med = Math.abs(pos[i * 3]) < Math.abs(this.pivots(sd).knie.x); w *= med ? 1 : 0.4; } if (w > 0.02) werte.set(i, Math.max(werte.get(i) || 0, w)); });
      }
    }
    this.arthroseAn = werte; this.arthroseFarbe = tep ? '#7FA9CF' : '#FF6A3D';
    this.arthroseFaerben();
  }
  arthroseFaerben() {
    const o = this.m.over; o.fill(0);
    if (this.arthroseAn && !(this.zustand.gesund && this.szene?.k !== 'tep')) {
      const c = new THREE.Color(this.arthroseFarbe);
      for (const [i, w] of this.arthroseAn) { o[i * 4] = c.r; o[i * 4 + 1] = c.g; o[i * 4 + 2] = c.b; o[i * 4 + 3] = Math.min(0.92, w * 0.95); }
    }
    this.m.geo.attributes.aOver.needsUpdate = true; this.anstossen();
  }

  // ----- Bewegung -----
  zeigeBewegung(k) {
    const Z = this.zustand, liste = BEW_JE_REGION[Z.region] || [];
    if (!k) k = this.bew?.k || liste[0];
    if (!k) { this.hinweisZeigen('Bewegung gibt es für Schulter, Ellenbogen, Hüfte, Knie und Fuß.'); return; }
    const def = BEWEGUNGEN[k];
    if (def.r !== Z.region) { this.setzeRegion(def.r); }
    if (!this.bew || this.bew.k !== k) { this.bewegungAn(k); this.kameraBewegung(k); }
    this.blattOeffnen('bewegung', (B) => {
      this.kopfzeile(B, def.t, def.fach);
      const zeile = el('div', 'ana-bew');
      const play = knopf('ana-play', ICON.play, 'Abspielen', () => { if (this.anim) { this.anim = null; play.innerHTML = ICON.play; } else { this.anim = {t0: performance.now(), von: this.bew.wert}; play.innerHTML = ICON.pause; this.anstossen(); } });
      const wrap = el('div', 'ana-regler');
      const r = el('input'); r.type = 'range'; r.min = def.min; r.max = def.max; r.step = 1; r.value = this.bew.wert;
      const spur = el('div', 'ana-spur');
      const pr = (v) => ((v - def.min) / (def.max - def.min)) * 100;
      const n0 = Math.max(def.min, def.norm[0]), n1 = Math.min(def.max, def.norm[1]);
      const nb = el('i', 'norm'); nb.style.left = pr(n0) + '%'; nb.style.width = (pr(n1) - pr(n0)) + '%'; spur.append(nb);
      if (this.szene?.bogen && this.szene.bew === k) { const b = el('i', 'bogen'); b.style.left = pr(this.szene.bogen[0]) + '%'; b.style.width = (pr(this.szene.bogen[1]) - pr(this.szene.bogen[0])) + '%'; spur.append(b); }
      wrap.append(spur, r);
      const zahl = el('b', 'ana-grad');
      const setze = (v) => { zahl.textContent = (def.neg && v < 0 ? (-v) + '° ' + def.neg.split(' ')[1] : v + '°'); this.bewegungWert(+v); };
      r.addEventListener('input', () => { this.anim = null; play.innerHTML = ICON.play; setze(r.value); });
      this._regler = r; this._reglerSetze = (v) => { r.value = v; zahl.textContent = (def.neg && v < 0 ? Math.round(-v) + '° senken' : Math.round(v) + '°'); };
      zeile.append(play, wrap, zahl); B.append(zeile);
      const leg = el('div', 'ana-bewleg');
      leg.innerHTML = `<span><i class="norm"></i>Normbereich ${def.norm[0] < 0 ? `${-def.norm[0]}° senken bis ${def.norm[1]}° heben` : `${def.norm[0]} bis ${def.norm[1]}°`}</span>` + (this.szene?.bogen && this.szene.bew === k ? '<span><i class="bogen"></i>Typischer Schmerzbereich</span>' : '');
      B.append(leg);
      if (k === 'schulter_abd') B.append(el('p', 'ana-fein', 'Das Schulterblatt dreht mit: etwa 2 Teile Oberarm, 1 Teil Schulterblatt.'));
      B.append(el('p', 'ana-fein', 'Muskeln werden bei der Bewegung vereinfacht mitgebogen. Normwerte nach der Neutral-Null-Methode: Richtwerte, fachlich prüfen.'));
      setze(this.bew.wert);
    });
  }
  kameraBewegung(k) {
    const s = this.zustand.seite, P = this.pivots(s), sx = s === 'r' ? -1 : 1;
    const def = {knie_flex: [P.knie, [0, -120, 20], 300, [1, 0.12, 0.06]], huefte_flex: [P.huefte, [0, -210, 80], 440, [1, 0.12, 0.1]], osg: [P.osg, [0, 10, 40], 180, [1, 0.15, 0.1]],
      ellenbogen_flex: [P.ell, [0, -40, 80], 270, [1, 0.15, 0.1]], schulter_abd: [P.gh, [sx * -120, 60, 0], 440, [-0.25 * sx * sx, 0.12, 1]]}[k];
    if (!def) return;
    const [p, off, r, bl0] = def, c = p.clone().add(new V3(off[0] * (k === 'schulter_abd' ? -1 : 1), off[1], off[2]));
    if (k === 'schulter_abd') c.x = p.x + sx * 130;
    const bl = new V3(...bl0); if (k !== 'schulter_abd' && s === 'r') bl.x *= -1; bl.normalize();
    const dist = r / Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2)) / Math.min(1, this.cam.aspect || 1);
    this.fliege(c, dist, Math.atan2(bl.x, bl.z), Math.acos(bl.y));
  }
  bewegungAn(k) {
    this.bewegungAus();
    const s = this.zustand.seite, P = this.pivots(s), m = this.m, pos = m.pos, nr = m.nrm;
    if (!m.basis) { m.basis = pos.slice(); m.basisN = nr.slice(); }
    const lat = new V3(s === 'r' ? -1 : 1, 0, 0), ab = new V3(0, -1, 0), X = new V3(1, 0, 0), Z3 = new V3(0, 0, 1);
    const gs = (re) => [...m.gruppen.values()].filter((g) => (g.seite === s || g.seite === 'm') && re.test(g.key));
    const gk = (keys) => keys.map((k) => m.gruppen.get(k + '|' + s)).filter(Boolean);
    const BEIN = /^(Tibia|Fibula|Talus|Calcaneus|Os naviculare|Os cuboideum|Os cuneiforme.*|metatarsal\d+|phal:.*(toe)|Os sesamoideum)$/;
    const UNTERSCH = ['soleus','tibant','tibpost','edl','ehl','fiblong','fibbrev','fdl','fhl','fussklein','langplant','membub','atfl','cfl','plantfasz','achilles','innenmen','aussenmen'];
    const FUSS = /^(Calcaneus|Talus|Os naviculare|Os cuboideum|Os cuneiforme.*|metatarsal\d+|phal:.*(toe)|Os sesamoideum)$/;
    const HAND = /^(Radius|Ulna|Os (scaphoideum|lunatum|triquetrum|pisiforme|trapezium|trapezoideum|capitatum|hamatum)|metacarpal\d+|phal:.*(thumb|finger))$/;
    const st = (pivot, achse, faktor, starr, weich) => ({pivot, achse, faktor, starr, weich});
    let stufen = [];
    const W = (gruppen, dir, a, b, piv) => gruppen.map((g) => ({g, dir, a, b, piv}));
    if (k === 'knie_flex') {
      stufen = [st(P.knie, X, 1, [...gs(BEIN).filter((g) => g.key !== 'Femur'), ...gk(UNTERSCH)], [...W(gk(['gastro','plantaris','popliteus','bicfem','semiten','semimem','gracilis','sartorius','rectfem','vastlat','vastmed','vastint','itb','vkb','hkb','innenband','aussenbandk','patsehne']), ab, -38, 28), ...W(gk(['Patella']), ab, -60, 60)])];
      const pat = m.gruppen.get('Patella|' + s); if (pat) { stufen[0].weich = stufen[0].weich.filter((w) => w.g !== pat); stufen[0].teil = [{g: pat, w: 0.55}]; }
    } else if (k === 'ellenbogen_flex') {
      stufen = [st(P.ell, X, -1, [...gs(HAND), ...gk(['pronquad','thenar','hypothenar','handklein','retinac','membua','extpol','extind','apl','fpl','fdp'])], W(gk(['biceps','brachialis','triceps','anconeus','brachiorad','prontere','supinator','ecrl','ecrb','extdig','extdm','ecu','fcr','palmaris','fcu','fds']), ab, -32, 26))];
    } else if (k === 'huefte_flex') {
      stufen = [st(P.huefte, X, -1, [...gs(BEIN), ...gs(/^(Femur|Patella)$/), ...gk(UNTERSCH), ...gk(['gastro','plantaris','popliteus','vastlat','vastmed','vastint','vkb','hkb','innenband','aussenbandk','patsehne'])], W(gk(['glutmax','glutmed','glutmin','piriformis','aussenrot','iliacus','psoas','tfl','sartorius','rectfem','adduktor','gracilis','bicfem','semiten','semimem','itb']), ab, -40, 65))];
    } else if (k === 'osg') {
      stufen = [st(P.osg, X, -1, [...gs(FUSS), ...gk(['fussklein','langplant','plantfasz'])], W(gk(['achilles','soleus','gastro','plantaris','tibant','tibpost','edl','ehl','fiblong','fibbrev','fdl','fhl','atfl','cfl']), ab, -26, 14))];
    } else if (k === 'schulter_abd') {
      const sg = s === 'r' ? -1 : 1;
      const armStarr = [...gs(/^Humerus$/), ...gs(HAND), ...gk(['brachialis','anconeus','brachiorad','prontere','supinator','ecrl','ecrb','extdig','extdm','ecu','fcr','palmaris','fcu','fds','fdp','fpl','apl','extpol','extind','pronquad','thenar','hypothenar','handklein','retinac','membua'])];
      const gh = st(P.gh, Z3, sg * 2 / 3, armStarr, [...W(gk(['biceps','triceps','coracobr']), ab, -22, 34), ...W(gk(['deltoid']), ab, -30, 20).map((w) => ({...w, nah: [70, 140]})), ...W(gk(['supraspinatus','infraspinatus','teresminor','subscapularis']), lat, -46, -4, P.gh), ...W(gk(['teresmajor','pecmaj','latdorsi']), lat, -60, -10, P.gh).map((w) => ({...w, nah: [70, 150]}))]);
      const scStarr = [...armStarr, ...gs(/^Scapula$/), ...gk(['biceps','triceps','coracobr','deltoid','supraspinatus','infraspinatus','teresminor','subscapularis'])];
      const sc = st(P.scap, Z3, sg / 3, scStarr, [...W(gs(/^Clavicula$/), lat, -110, -25, P.scap), ...W(gk(['trapdesc','traptrans','trapasc','levscap','rhomboid','pecmin']), lat, -80, 0, P.scap).map((w) => ({...w, nah: [80, 160]})), ...W(gk(['pecmaj','latdorsi','teresmajor']), lat, -60, 0, P.scap).map((w) => ({...w, nah: [90, 170], um: P.gh}))]);
      stufen = [gh, sc];
    }
    // Gewichte je Vertex berechnen
    const idxSet = new Map(); // vi -> Float32 Gewichte je Stufe
    stufen.forEach((S, si) => {
      const put = (vi, w) => { let a = idxSet.get(vi); if (!a) { a = new Float32Array(stufen.length); idxSet.set(vi, a); } a[si] = Math.max(a[si], w); };
      for (const g of S.starr) for (const vi of this.verts(g.id)) put(vi, 1);
      for (const t of S.teil || []) for (const vi of this.verts(t.g.id)) put(vi, t.w);
      for (const w of S.weich) { const pv = w.piv || S.pivot, um = w.um || pv; for (const vi of this.verts(w.g.id)) { const bx = m.basis[vi * 3], by = m.basis[vi * 3 + 1], bz = m.basis[vi * 3 + 2]; const d = (bx - pv.x) * w.dir.x + (by - pv.y) * w.dir.y + (bz - pv.z) * w.dir.z; let gw = ss(w.a, w.b, d); if (w.nah) gw *= 1 - ss(w.nah[0], w.nah[1], Math.hypot(bx - um.x, by - um.y, bz - um.z)); put(vi, gw); } }
    });
    const vis = Uint32Array.from(idxSet.keys()), gw = new Float32Array(vis.length * stufen.length);
    vis.forEach((vi, j) => gw.set(idxSet.get(vi), j * stufen.length));
    const teile = new Set(); for (const vi of vis) teile.add(m.teile[m.geo.attributes.pid.array[vi]]);
    this.bew = {k, wert: 0, stufen, vis, gw, teile: [...teile]};
    // Für Bewegung: Muskeln hinter der Bewegung nicht ausgegraut lassen
  }
  bewegungWert(v) {
    const B = this.bew; if (!B) return; B.wert = v;
    const m = this.m, pos = m.pos, nr = m.nrm, bs = m.basis, bn = m.basisN, S = B.stufen, ns = S.length;
    const rad = THREE.MathUtils.degToRad(v);
    for (let j = 0; j < B.vis.length; j++) {
      const vi = B.vis[j];
      let x = bs[vi * 3], y = bs[vi * 3 + 1], z = bs[vi * 3 + 2], nx = bn[vi * 3], ny = bn[vi * 3 + 1], nz = bn[vi * 3 + 2];
      for (let s = 0; s < ns; s++) {
        const w = B.gw[j * ns + s]; if (w <= 0) continue;
        const st = S[s], a = rad * st.faktor * w, c = Math.cos(a), sn = Math.sin(a), p = st.pivot;
        if (st.achse.x) { const yy = y - p.y, zz = z - p.z; y = p.y + yy * c - zz * sn; z = p.z + yy * sn + zz * c; const n1 = ny * c - nz * sn, n2 = ny * sn + nz * c; ny = n1; nz = n2; }
        else { const xx = x - p.x, yy = y - p.y; x = p.x + xx * c - yy * sn; y = p.y + xx * sn + yy * c; const n1 = nx * c - ny * sn, n2 = nx * sn + ny * c; nx = n1; ny = n2; }
      }
      pos[vi * 3] = x; pos[vi * 3 + 1] = y; pos[vi * 3 + 2] = z; nr[vi * 3] = nx; nr[vi * 3 + 1] = ny; nr[vi * 3 + 2] = nz;
    }
    m.geo.attributes.position.needsUpdate = true; m.geo.attributes.normal.needsUpdate = true;
    for (const t of B.teile) t.dirty = true;
    if (this.punkte.length) this.punkteNeu(); this.pinsNeu();
    this.anstossen();
  }
  animSchritt() {
    const B = this.bew; if (!B || !this.anim) { this.anim = null; return false; }
    const def = BEWEGUNGEN[B.k], t = (performance.now() - this.anim.t0) / 1000, per = 4.2;
    const lo = Math.max(def.min, def.k === 'osg' ? def.min : 0), hi = def.max;
    const ph = (t % per) / per, e = 0.5 - 0.5 * Math.cos(ph * 2 * Math.PI);
    const v = def.min < 0 ? def.min + (def.max - def.min) * e : lo + (hi - lo) * e;
    this.bewegungWert(v); this._reglerSetze?.(v);
    return true;
  }
  bewegungAus() {
    this.anim = null;
    if (this.bew) { this.bewegungWert(0); this.bew = null; }
  }

  // ----- Vollbild, Bild sichern -----
  vollbild(an) {
    this.root.classList.toggle('voll', an); document.documentElement.classList.toggle('ana-voll', an);
    this.wz.voll.innerHTML = (an ? ICON.klein : ICON.voll) + `<span>${an ? 'Verkleinern' : 'Vollbild'}</span>`;
    this.lage(); setTimeout(() => this.lage(), 50);
  }

  // ----- Patient aus der Doku -----
  zeigePatient(P) {
    if (!P) return;
    const eb = P.erstbefund || {}, ein = (P.verlauf?.einheiten || []).filter((x) => x.stellen?.length).sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
    const stelle = ein[0]?.stellen?.[0] || eb.stellen?.[0] || {};
    const RM = {SCHULTER: 'schulter', HWS: 'hws', BWS: 'bws', LWS: 'lws', ELLENBOGEN: 'ellenbogen', HANDGELENK: 'hand', HAND: 'hand', FINGER: 'hand', HUEFTE: 'huefte', KNIE: 'knie', SPRUNGGELENK: 'fuss', OSG: 'fuss', FUSS: 'fuss', ZEHEN: 'fuss', KIEFER: 'kiefer'};
    const diag = eb.diagnose || '';
    let seite = /\bli(nks|\.)/i.test(stelle.seite || '') ? 'l' : /\bre(chts|\.)/i.test(stelle.seite || '') ? 'r' : /\blinks\b/i.test(diag) ? 'l' : 'r';
    const region = RM[stelle.region] || null;
    let szene = SZENEN.find((s) => s.such.test(norm(diag)) || s.such.test(diag.toLowerCase()));
    if (szene && region && szene.r !== region && !(szene.r === 'hand' && region === 'hand')) { const alt = SZENEN.find((s) => s.r === region && s.such.test(diag.toLowerCase())); if (alt) szene = alt; }
    // Behandlung aus der Doku
    const beh = new Set(), behText = [];
    for (const st of [ein[0]?.stellen?.[0], eb.stellen?.[0]]) for (const mu of st?.deton?.muskeln || []) { behText.push(mu); const n = mu.toLowerCase(); for (const [re, keys] of BEH_MAP) if (re.test(n)) keys.forEach((k) => beh.add(k)); }
    const seg = (diag.match(/\b(L[1-5])\s*\/\s*(L?[1-5]|S1)\b/i) || []);
    const segment = seg[0] ? (seg[1].toUpperCase() + '/' + (/^\d$/.test(seg[2]) ? 'L' + seg[2] : seg[2].toUpperCase())) : null;
    const opt = {seite, patient: {beh: [...new Set(behText)]}, beh: [...beh], segment};
    if (szene) this.starteSzene(szene, opt);
    else {
      const ziel = region || 'koerper';
      const tu = () => {
        this.szeneAus(); this.zustand.seite = seite; this.setzeRegion(ziel);
        for (const k of beh) { const g = this.m.gruppen.get(k + '|' + seite) || this.m.gruppen.get(k + '|m'); if (g) this.marken.set(g.id, 'b'); }
        this.aktualisiere();
        this.hinweisZeigen((diag ? diag + '. ' : '') + 'Keine fertige Erklärung dafür. Strukturen antippen und markieren.');
      };
      if (this.bereit) tu(); else this.wartend = tu;
    }
  }
}

// ---------- Öffentliche Schnittstelle ----------
export function host(elem) {
  if (!document.getElementById('ana-css')) { const st = document.createElement('style'); st.id = 'ana-css'; st.textContent = CSS; document.head.append(st); }
  if (!A) A = new Viewer();
  A.haenge(elem);
  const ziel = window.ANA_ziel; window.ANA_ziel = null;
  if (ziel) {
    let P = null;
    try { const z = JSON.parse(localStorage.getItem('physio-doku-v1') || 'null'); P = z?.patienten?.find((x) => x.id === ziel); } catch {}
    if (P) A.zeigePatient(P);
  }
  return A;
}
export function verlassen() { if (A) { A.vollbild(false); A.bewegungAus(); } }
export {SZENEN, REGIONEN};
