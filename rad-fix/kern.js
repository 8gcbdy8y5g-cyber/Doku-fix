/* Winkel-Kern: Rechenwege, Filter, Plateau-Erkennung, Sensor-Mathematik.
   Reine Funktionen ohne DOM, damit sie sich in Node testen lassen. */
(function (root) {
"use strict";
const D = 180 / Math.PI;

/* ---------- Vektoren ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + (a[2] || 0) * (b[2] || 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2] || 0);
/* Winkel zwischen zwei Vektoren, 0..180°, numerisch stabil über atan2 */
function vecAngle(a, b) {
  const A = [a[0], a[1], a[2] || 0], B = [b[0], b[1], b[2] || 0];
  const c = len(cross(A, B)), d = dot(A, B);
  if (!c && !d) return null;
  return Math.atan2(c, d) * D;
}
/* Vorzeichenbehafteter 2D-Winkel von a nach b (−180..180), Bildkoordinaten (y nach unten) */
function signed2D(a, b) {
  return Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]) * D;
}
function wrap180(x) { while (x > 180) x -= 360; while (x < -180) x += 360; return x; }

/* ---------- One Euro Filter (Casiez 2012) ---------- */
class OneEuro {
  constructor(minCutoff = 1.0, beta = 0.02, dCutoff = 1.0) { Object.assign(this, { minCutoff, beta, dCutoff }); this.x = null; this.dx = 0; this.t = null; }
  static alpha(cut, dt) { const tau = 1 / (2 * Math.PI * cut); return 1 / (1 + tau / dt); }
  reset() { this.x = null; this.dx = 0; this.t = null; }
  filter(v, tSec) {
    if (this.x == null) { this.x = v; this.t = tSec; return v; }
    const dt = Math.max(1e-3, tSec - this.t); this.t = tSec;
    const dv = (v - this.x) / dt;
    this.dx += OneEuro.alpha(this.dCutoff, dt) * (dv - this.dx);
    const cut = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += OneEuro.alpha(cut, dt) * (v - this.x);
    return this.x;
  }
}

/* ---------- Statistik ---------- */
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const median = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
/* Bland-Altman: Bias und 95-%-Übereinstimmungsgrenzen */
function blandAltman(pairs) {
  const d = pairs.map(([m, g]) => m - g);
  if (!d.length) return null;
  const b = mean(d), s = sd(d);
  return { n: d.length, bias: b, lo: b - 1.96 * s, hi: b + 1.96 * s, mae: mean(d.map(Math.abs)) };
}

/* ---------- Plateau- und Wiederholungserkennung ----------
   Ein Messwert zählt nur, wenn die Endstellung gehalten wird:
   mindestens holdSec lang, Streuung < maxSd, Geschwindigkeit < maxVel.
   Eine Wiederholung endet, wenn der Winkel wieder Richtung Ausgang zurückgeht. */
class RepTracker {
  constructor(o = {}) {
    this.o = Object.assign({ holdSec: 0.6, maxSd: 2.0, maxVel: 6, minExcursion: 12, returnFrac: 0.5, reps: 3 }, o);
    this.reset();
  }
  reset() { this.buf = []; this.base = null; this.best = null; this.reps = []; this.state = "start"; this.peakAbs = 0; }
  /* v: geglätteter Winkel (vorzeichenbehaftet), t: Sekunden. Gibt Ereignis zurück oder null. */
  push(v, t) {
    const o = this.o; this.buf.push([t, v]);
    while (this.buf.length && t - this.buf[0][0] > o.holdSec) this.buf.shift();
    const span = this.buf.length ? t - this.buf[0][0] : 0;
    let stable = false, med = null;
    if (span >= o.holdSec * 0.9 && this.buf.length >= 5) {
      const vals = this.buf.map(x => x[1]);
      const vel = Math.abs(vals[vals.length - 1] - vals[0]) / span;
      stable = sd(vals) < o.maxSd && vel < o.maxVel; med = median(vals);
    }
    if (this.base == null) { if (stable) { this.base = med; return { type: "base", value: med }; } return null; }
    const exc = v - this.base;
    if (this.state === "start" || this.state === "back") {
      if (Math.abs(exc) >= o.minExcursion) { this.state = "moving"; this.best = null; }
    }
    if (this.state === "moving") {
      if (stable && Math.abs(med - this.base) >= o.minExcursion) {
        if (!this.best || Math.abs(med - this.base) > Math.abs(this.best.value - this.base) + 0.5) {
          this.best = { value: med, t, sd: sd(this.buf.map(x => x[1])) };
          return { type: "hold", value: med };
        }
      }
      if (this.best && Math.abs(exc) < Math.abs(this.best.value - this.base) * o.returnFrac) {
        const r = { value: this.best.value - this.base, abs: this.best.value, sd: this.best.sd };
        this.reps.push(r); this.state = "back"; this.best = null;
        return { type: "rep", rep: r, n: this.reps.length, done: this.reps.length >= o.reps };
      }
    }
    if (this.state === "back" && stable && Math.abs(med - this.base) < o.minExcursion * 0.5) {
      /* Ausgangsstellung leicht nachführen, falls der Patient minimal anders zurückkommt */
      this.base = this.base * 0.5 + med * 0.5;
    }
    return null;
  }
  summary() {
    if (!this.reps.length) return null;
    const v = this.reps.map(r => r.value);
    return { value: median(v), n: v.length, range: Math.max(...v) - Math.min(...v), all: v };
  }
}

/* ---------- Kamera: Messpunkte ----------
   MediaPipe Pose: 7/8 Ohr, 11/12 Schulter, 13/14 Ellenbogen, 15/16 Handgelenk,
   23/24 Hüfte, 25/26 Knie, 27/28 Sprunggelenk, 29/30 Ferse, 31/32 Fußspitze */
const LM = {
  r: { ear: 8, sh: 12, el: 14, wr: 16, hip: 24, kn: 26, an: 28, heel: 30, toe: 32 },
  l: { ear: 7, sh: 11, el: 13, wr: 15, hip: 23, kn: 25, an: 27, heel: 29, toe: 31 }
};
/* Winkel zwischen Segment p1→p2 und Segment q1→q2, vorzeichenbehaftet (2D) oder 0..180 (3D) */
function segAngle2D(p1, p2, q1, q2) { return signed2D(sub(p2, p1), sub(q2, q1)); }
function segAngle3D(p1, p2, q1, q2) { return vecAngle(sub(p2, p1), sub(q2, q1)); }

/* Messdefinition: ref = Referenzsegment, mov = bewegtes Segment, Winkel in der Bildebene.
   zero = Winkel in Neutral-Null-Stellung, dir = Vorzeichen so, dass Flexion/Abduktion positiv ist
   (wird je Seite und Blickrichtung automatisch über die Startstellung festgelegt). */
function cameraAngle(def, P, side, world) {
  const k = LM[side];
  const pick = n => P[k[n]];
  const [r1, r2] = def.ref.map(pick), [m1, m2] = def.mov.map(pick);
  if (!r1 || !r2 || !m1 || !m2) return null;
  const a2 = segAngle2D(r1, r2, m1, m2);
  let a3 = null;
  if (world) { const W = n => world[k[n]]; a3 = segAngle3D(W(def.ref[0]), W(def.ref[1]), W(def.mov[0]), W(def.mov[1])); }
  return { raw2d: a2, raw3d: a3, pts: [r1, r2, m1, m2], idx: [...def.ref, ...def.mov].map(n => k[n]) };
}

/* ---------- Sensor: Schwerkraftvektor ----------
   g: [x,y,z] aus accelerationIncludingGravity (Gerätekoordinaten).
   Neigung in einer Geräteebene: Rotation um die Achse 'axis' (0=x,1=y,2=z). */
const PLANES = [[1, 2], [2, 0], [0, 1]];
function planeAngle(g, axis) { const [i, j] = PLANES[axis]; return Math.atan2(g[i], g[j]) * D; }
/* Anteil der Schwerkraft auf der Drehachse → Verkippung aus der Messebene (Grad) */
function offAxis(g, axis) { return Math.asin(Math.max(-1, Math.min(1, g[axis] / (len(g) || 1)))) * D; }
/* Drehachse aus Start- und Endvektor: die Achse, deren Anteil sich am wenigsten ändert,
   gewichtet mit der tatsächlich überstrichenen Drehung in der zugehörigen Ebene */
function pickAxis(g0, g1) {
  const n0 = g0.map(v => v / (len(g0) || 1)), n1 = g1.map(v => v / (len(g1) || 1));
  let best = 2, score = -1;
  for (let a = 0; a < 3; a++) {
    const rot = Math.abs(wrap180(planeAngle(g1, a) - planeAngle(g0, a)));
    const inPlane = Math.min(Math.hypot(...PLANES[a].map(i => n0[i])), Math.hypot(...PLANES[a].map(i => n1[i])));
    const s = rot * inPlane - 40 * Math.abs(n1[a] - n0[a]);
    if (s > score) { score = s; best = a; }
  }
  return best;
}
/* Ruhe-Check: Betrag nahe 1 g und kaum Schwankung im Fenster */
function isStill(win) {
  if (win.length < 8) return false;
  const mags = win.map(len);
  const m = mean(mags);
  return Math.abs(m - 9.81) < 0.35 && sd(mags) < 0.12 && sd(win.map(g => g[0])) < 0.15 && sd(win.map(g => g[1])) < 0.15 && sd(win.map(g => g[2])) < 0.15;
}
const vmean = win => [0, 1, 2].map(i => mean(win.map(g => g[i])));

/* Perspektivfehler: wie stark ein Winkel θ in einer um φ gedrehten Ebene unterschätzt wird */
function perspectiveError(theta, phi) {
  const t = theta / D, p = phi / D;
  return Math.atan2(Math.sin(t) * Math.cos(p), Math.cos(t)) * D;
}

const api = { D, sub, dot, cross, len, vecAngle, signed2D, wrap180, OneEuro, mean, sd, median, blandAltman, RepTracker, LM, segAngle2D, segAngle3D, cameraAngle, PLANES, planeAngle, offAxis, pickAxis, isStill, vmean, perspectiveError };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.WK = api;
})(typeof window !== "undefined" ? window : globalThis);
