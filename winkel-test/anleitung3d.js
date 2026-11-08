/* Sensor-Anleitung mit der Doku-Fix-Figur (figur3.js) und einem 3D-Handy.
   Das Handy hängt an der Skelettachse des Körperteils: Rückseite auf der Haut, Bildschirm zeigt nach außen,
   Oberkante zeigt in die angegebene Richtung. So stimmt die Lage aus jeder Blickrichtung. */
(function (root) {
"use strict";
const F = root.Figur;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, u) => add(a, mul(sub(b, a), u));
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * u);
const mixPose = (a, b, u) => { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[k] ?? F.STANDARD[k] ?? 0, y = b[k] ?? F.STANDARD[k] ?? 0; o[k] = x + (y - x) * u; } return o; };

/* Handy: Mitte c, Oberkante zeigt nach t, Bildschirm zeigt nach n. Maße in cm. */
const HANDY = { h: 14.7, b: 7.1, d: 0.85 };
/* Handy an einem Körperteil: teil (Name im Skelett), f = Anteil entlang der Achse, r = Abstand Achse–Haut,
   seite: "aussen" (u1 der rechten Seite), "vorn" (u2), oben: "proximal" | "distal" */
function amTeil(T, teil, f, len, r, seite, oben) {
  const t = T[teil];
  const n = seite === "vorn" ? t.u2 : seite === "hinten" ? mul(t.u2, -1) : t.u1;
  const c = add(add(t.o, mul(t.a, f * len)), mul(n, r + HANDY.d / 2 + 0.2));
  return { c, t: oben === "proximal" ? mul(t.a, -1) : t.a, n };
}
function amKopf(T, wo) {
  const K = T.kopf, R = K.R, M = v => add(K.o, add(add(mul(R[0], v[0]), mul(R[1], v[1])), mul(R[2], v[2])));
  if (wo === "stirn") return { c: M([0, 9.6, 10.9]), t: R[1], n: R[2] };
  /* seitlich über dem rechten Ohr */
  return { c: M([-9.4, 7.4, 0.6]), t: R[1], n: mul(R[0], -1) };
}

function handySvg(cam, H, dx, dy, alpha, dims) {
  const t = norm(H.t), n = norm(H.n), b = norm(cross(n, t));
  const { h, b: w, d } = dims || HANDY;
  const P = (x, y, z) => { const v = add(H.c, add(add(mul(b, x), mul(t, y)), mul(n, z))); const q = cam(v); return [q[0] + dx, -q[1] + dy, q[2]]; };
  /* Körper mit abgerundeten Ecken als Achteck je Fläche */
  const k = 1.1, rim = (z) => [[-w / 2 + k, -h / 2], [w / 2 - k, -h / 2], [w / 2, -h / 2 + k], [w / 2, h / 2 - k], [w / 2 - k, h / 2], [-w / 2 + k, h / 2], [-w / 2, h / 2 - k], [-w / 2, -h / 2 + k]].map(([x, y]) => P(x, y, z));
  const front = rim(d / 2), back = rim(-d / 2);
  const faces = [];
  const camN = v => { const o = cam([0, 0, 0]), q = cam(v); return q[2] - o[2]; };
  const vis = camN(n);
  for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; faces.push({ pts: [front[i], front[j], back[j], back[i]], fill: "#3b434d" }); }
  const poly = (pts, fill, extra = "") => `<path d="M${pts.map(p => p[0].toFixed(2) + " " + p[1].toFixed(2)).join("L")}Z" fill="${fill}"${extra}/>`;
  let s = "";
  faces.sort((A, B) => A.pts.reduce((x, p) => x + p[2], 0) - B.pts.reduce((x, p) => x + p[2], 0)).forEach(f => s += poly(f.pts, f.fill));
  if (vis > 0) {
    s += poly(front, "#20262e");
    const scr = [[-w / 2 + .45, -h / 2 + .45], [w / 2 - .45, -h / 2 + .45], [w / 2 - .45, h / 2 - .45], [-w / 2 + .45, h / 2 - .45]].map(([x, y]) => P(x, y, d / 2 + .01));
    s += poly(scr, "var(--tape,#1d74d8)");
    const isl = [[-1.5, -h / 2 + 1.0], [1.5, -h / 2 + 1.0], [1.5, -h / 2 + 1.75], [-1.5, -h / 2 + 1.75]].map(([x, y]) => P(x, -y, d / 2 + .02));
    s += poly(isl, "#11161c");
  } else {
    s += poly(back, "#2c333c");
    const cam2 = [[-w / 2 + 1, h / 2 - 1], [-w / 2 + 3.6, h / 2 - 1], [-w / 2 + 3.6, h / 2 - 3.6], [-w / 2 + 1, h / 2 - 3.6]].map(([x, y]) => P(x, y, -d / 2 - .02));
    s += poly(cam2, "#4a535e");
  }
  /* Oberkante zusätzlich mit kleinem Pfeil markieren */
  const top = P(0, h / 2 + 1.0, 0), tip = P(0, h / 2 + 3.2, 0), l = P(-1.3, h / 2 + 1.0, 0), r = P(1.3, h / 2 + 1.0, 0);
  s += `<path d="M${tip[0].toFixed(2)} ${tip[1].toFixed(2)}L${l[0].toFixed(2)} ${l[1].toFixed(2)}L${r[0].toFixed(2)} ${r[1].toFixed(2)}Z" fill="var(--tape,#1d74d8)"/>`;
  return `<g opacity="${alpha}">${s}</g>`;
}

/* ---------- Szenen ---------- */
/* Handy an einem Körperteil. achse: Seite, auf die der Bildschirm zeigt (u1 = außen bzw. Daumenseite, u2 = vorn bzw. Handfläche),
   oben: Oberkante "proximal" oder "distal", tief: Verschiebung entlang u2 (z. B. Fuß). */
function an(teil, f, len, r, achse, oben, tief = 0) {
  return T => { const t = T[teil], sg = achse[0] === "-" ? -1 : 1, ax = achse.replace("-", "");
    const n = mul(t[ax], sg), q = ax === "u1" ? t.u2 : t.u1;
    const c = add(add(add(t.o, mul(t.a, f * len)), mul(n, r + HANDY.d / 2 + 0.2)), mul(t.u2, ax === "u1" ? tief : 0));
    return { c, t: oben === "proximal" ? mul(t.a, -1) : t.a, n }; };
}
/* Handy hochkant in der Faust: Oberkante zur Daumenseite (u1), Bildschirm zur Handfläche (u2) */
const faust = T => { const h = T.handR; return { c: add(add(add(h.o, mul(h.a, 6.5)), mul(h.u1, 3.5)), mul(h.u2, 0.6)), t: h.u1, n: h.u2 }; };
const kopf = wo => T => amKopf(T, wo);
const LIEGEN = { becken: -90, ellbogenL: 4, ellbogenR: 4, schulterAbdL: 10, schulterAbdR: 10, osgL: 20, osgR: 20 };
const BAUCH = { becken: 90, ellbogenL: 4, ellbogenR: 4, schulterAbdL: 10, schulterAbdR: 10, osgL: -25, osgR: -25, hws: -10 };
const SITZ = { hueftFlexL: 90, hueftFlexR: 90, knieL: 90, knieR: 90, ellbogenL: 10, ellbogenR: 10, schulterAbdL: 12, schulterAbdR: 12 };
const ARM = f => ({ fokus: ["schulterR", "ellbogenR", "handR", "huefteR"], rand: 10, format: f || 1 });
const S = {
  "s-flex": { ansicht: 90, neigung: 4, anker: "ferseR", ...ARM(), basis: { ellbogenR: 2, schulterAbdR: 2 }, ende: { schulterFlexR: 160 }, eins: an("oberarmR", .52, 30, 4.4, "u1", "proximal") },
  "s-ext": { ansicht: 90, neigung: 4, anker: "ferseR", ...ARM(), basis: { ellbogenR: 2, schulterAbdR: 2 }, ende: { schulterFlexR: -45 }, eins: an("oberarmR", .52, 30, 4.4, "u1", "proximal") },
  "s-abd": { ansicht: 0, neigung: 4, anker: "ferseR", ...ARM(), basis: { ellbogenR: 2, schulterAbdR: 2, unterarmRotR: 0 }, ende: { schulterAbdR: 165 }, eins: an("oberarmR", .52, 30, 5.2, "u2", "proximal") },
  "s-ar": { ansicht: 90, neigung: 14, liege: true, anker: "schulterR", fokus: ["schulterR", "ellbogenR", "handR", "kopfTop"], rand: 12, basis: { ...LIEGEN, schulterAbdR: 90, ellbogenR: 90 }, ende: { schulterRotR: 80 }, eins: an("unterarmR", .55, 26, 3.6, "-u2", "distal") },
  "s-ir": { ansicht: 90, neigung: 14, liege: true, anker: "schulterR", fokus: ["schulterR", "ellbogenR", "handR", "kopfTop"], rand: 12, basis: { ...LIEGEN, schulterAbdR: 90, ellbogenR: 90 }, ende: { schulterRotR: -65 }, eins: an("unterarmR", .55, 26, 3.6, "-u2", "distal") },
  "e-flex": { ansicht: 90, neigung: 4, anker: "ferseR", ...ARM(), basis: { schulterAbdR: 4 }, start: { ellbogenR: 4 }, ende: { ellbogenR: 125 }, zwei: [an("oberarmR", .45, 30, 4.4, "u1", "proximal"), an("unterarmR", .55, 26, 3.4, "u1", "proximal")] },
  "e-ext": { ansicht: 90, neigung: 4, anker: "ferseR", ...ARM(), basis: { schulterAbdR: 4 }, start: { ellbogenR: 35 }, ende: { ellbogenR: 0 }, zwei: [an("oberarmR", .45, 30, 4.4, "u1", "proximal"), an("unterarmR", .55, 26, 3.4, "u1", "proximal")] },
  "u-pro": { ansicht: 8, neigung: 12, anker: "ferseR", fokus: ["ellbogenR", "handR"], rand: 13, format: 1.2, basis: { ellbogenR: 90, schulterAbdR: 4 }, start: { unterarmRotR: 90 }, ende: { unterarmRotR: 175 }, eins: faust },
  "u-sup": { ansicht: 8, neigung: 12, anker: "ferseR", fokus: ["ellbogenR", "handR"], rand: 13, format: 1.2, basis: { ellbogenR: 90, schulterAbdR: 4 }, start: { unterarmRotR: 90 }, ende: { unterarmRotR: 5 }, eins: faust },
  "h-ext": { ansicht: 90, neigung: 8, anker: "ferseR", fokus: ["ellbogenR", "handgelenkR", "handR"], rand: 14, basis: { ellbogenR: 90, schulterAbdR: 4, unterarmRotR: 180 }, ende: { handFlexR: -55 }, eins: an("handR", .45, 17.5, 2.0, "-u2", "distal"), tisch: true },
  "h-flex": { ansicht: 90, neigung: 8, anker: "ferseR", fokus: ["ellbogenR", "handgelenkR", "handR"], rand: 14, basis: { ellbogenR: 90, schulterAbdR: 4, unterarmRotR: 180 }, ende: { handFlexR: 55 }, eins: an("handR", .45, 17.5, 2.0, "-u2", "distal"), tisch: true },
  "c-flex": { ansicht: 90, neigung: 4, anker: "ferseR", fokus: ["kopfTop", "kinn", "halsTop", "schulterR"], rand: 10, format: 1.2, basis: {}, ende: { hws: 40 }, eins: kopf("seite") },
  "c-ext": { ansicht: 90, neigung: 4, anker: "ferseR", fokus: ["kopfTop", "kinn", "halsTop", "schulterR"], rand: 10, format: 1.2, basis: {}, ende: { hws: -40 }, eins: kopf("seite") },
  "c-lat": { ansicht: 0, neigung: 4, anker: "ferseR", fokus: ["kopfTop", "kinn", "schulterL", "schulterR"], rand: 10, format: 1.2, basis: {}, ende: { hwsSeit: -40 }, eins: kopf("stirn") },
  "c-rot": { ansicht: 0, neigung: 64, liege: true, ohneBoden: true, nase: true, anker: "kopfTop", fokus: ["kopfTop", "kinn", "schulterL", "schulterR"], rand: 9, format: 1.2, basis: LIEGEN, ende: { hwsRot: 70 }, eins: kopf("stirn") },
  "hu-flex": { ansicht: 90, neigung: 10, liege: true, anker: "huefteR", fokus: ["huefteR", "knieR", "sprunggelenkR", "becken"], rand: 14, basis: LIEGEN, ende: { hueftFlexR: 120, knieR: 115, osgR: 0 }, eins: an("oberschenkelR", .55, 42, 7.4, "u1", "proximal") },
  "hu-ext": { ansicht: 90, neigung: 10, liege: true, anker: "huefteR", fokus: ["huefteR", "knieR", "sprunggelenkR", "becken"], rand: 14, basis: BAUCH, ende: { hueftFlexR: -15 }, eins: an("oberschenkelR", .55, 42, 7.4, "u1", "proximal") },
  "hu-ar": { ansicht: 0, neigung: 6, anker: "becken", sitz: true, fokus: ["knieR", "sprunggelenkR", "huefteR", "knieL"], rand: 14, format: 1.2, basis: SITZ, ende: { hueftRotR: 40 }, eins: an("unterschenkelR", .45, 40, 4.4, "u2", "proximal") },
  "hu-ir": { ansicht: 0, neigung: 6, anker: "becken", sitz: true, fokus: ["knieR", "sprunggelenkR", "huefteR", "knieL"], rand: 14, format: 1.2, basis: SITZ, ende: { hueftRotR: -35 }, eins: an("unterschenkelR", .45, 40, 4.4, "u2", "proximal") },
  "k-flex": { ansicht: 90, neigung: 10, liege: true, anker: "huefteR", fokus: ["huefteR", "knieR", "sprunggelenkR", "becken"], rand: 12, basis: LIEGEN, ende: { hueftFlexR: 55, knieR: 115, osgR: 0 }, zwei: [an("oberschenkelR", .55, 42, 7.4, "u1", "proximal"), an("unterschenkelR", .5, 40, 5.0, "u1", "proximal")] },
  "k-ext": { ansicht: 90, neigung: 10, liege: true, anker: "huefteR", fokus: ["huefteR", "knieR", "sprunggelenkR", "becken"], rand: 12, basis: LIEGEN, start: { hueftFlexR: 25, knieR: 40 }, ende: { hueftFlexR: 2, knieR: 2 }, zwei: [an("oberschenkelR", .55, 42, 7.4, "u1", "proximal"), an("unterschenkelR", .5, 40, 5.0, "u1", "proximal")] },
  "o-lunge": { ansicht: 62, neigung: 8, anker: "ferseR", flach: true, wand: true, fokus: ["knieR", "sprunggelenkR", "zehenR", "ferseR"], rand: 10, format: 1.2, basis: { becken: 12, lws: 4, hueftFlexL: -28, knieL: 18, schulterFlexL: 78, schulterFlexR: 78, ellbogenL: 25, ellbogenR: 25 }, start: { hueftFlexR: 25, knieR: 35 }, ende: { hueftFlexR: 40, knieR: 80 }, eins: an("unterschenkelR", .3, 40, 4.6, "u2", "proximal") },
  "o-de": { ansicht: 90, neigung: 6, anker: "becken", sitz: true, fokus: ["knieR", "sprunggelenkR", "zehenR", "fersR"], rand: 12, basis: SITZ, start: { osgR: 0 }, ende: { osgR: 22 }, zwei: [an("unterschenkelR", .55, 40, 5.0, "u1", "proximal"), an("fussR", .38, 21, 4.8, "u1", "distal", -3.5)] },
  "o-pf": { ansicht: 90, neigung: 6, anker: "becken", sitz: true, fokus: ["knieR", "sprunggelenkR", "zehenR", "fersR"], rand: 12, basis: SITZ, start: { osgR: 0 }, ende: { osgR: -40 }, zwei: [an("unterschenkelR", .55, 40, 5.0, "u1", "proximal"), an("fussR", .38, 21, 4.8, "u1", "distal", -3.5)] }
};
for (const k in S) { if (S[k].fokus) S[k].fokus = S[k].fokus.map(x => x === "fersR" ? "ferseR" : x); S[k].start = S[k].start || {}; }

/* Füße flach auf den Boden stellen (wie fuesseFlach der Übungskarten) */
function flach(pose) { const { T } = F.skelett(pose), o = { ...pose };
  for (const k of ["L", "R"]) { const au = T["unterschenkel" + k].a, fu = T["unterschenkel" + k].u2; if (Math.abs(au[1]) > 0.05) o["osg" + k] = Math.atan(fu[1] / au[1]) * 180 / Math.PI; }
  return o; }

/* Ablauf wie bei der einfachen Animation */
function phase(sz, t) {
  if (sz.zwei) {
    const T = 7.2, u = t % T;
    if (u < 1.4) return { move: ease(u / 1.4), where: null, step: "Bewegung ausführen und in der Endstellung halten" };
    if (u < 3.0) return { move: 1, where: 0, show: ease((u - 1.4) / .4), beep: u > 2.5, step: "1 · Handy auf den ersten Abschnitt, ruhig halten → Ton" };
    if (u < 4.0) return { move: 1, where: "trans", f: ease(u - 3.0), show: 1, step: "2 · Handy umsetzen" };
    if (u < 5.6) return { move: 1, where: 1, show: 1, beep: u > 5.1, step: "3 · Auf dem zweiten Abschnitt ruhig halten → Ton, fertig" };
    return { move: 1 - ease((u - 5.6) / 1.4), where: 1, show: 1 - ease((u - 5.6) / .4), step: "Wert steht im Ergebnis" };
  }
  const T = 6.6, u = t % T;
  if (u < 1.6) return { move: 0, show: ease(u / .4), beep: u > 1.1, step: "1 · Anlegen, Ausgangsstellung ruhig halten → Ton (Nullpunkt)" };
  if (u < 3.0) return { move: ease((u - 1.6) / 1.4), show: 1, step: "2 · Bis zur Endstellung bewegen" };
  if (u < 4.6) return { move: 1, show: 1, beep: u > 4.0, step: "3 · Endstellung ruhig halten → Ton, Wert wird übernommen" };
  if (u < 6.0) return { move: 1 - ease((u - 4.6) / 1.4), show: 1, step: "4 · Zurück in die Ausgangsstellung, dann nächste Wiederholung" };
  return { move: 0, show: 1 - ease((u - 6.0) / .6), step: "4 · Zurück in die Ausgangsstellung, dann nächste Wiederholung" };
}

function bild(key, t, rahmen) {
  const sz = S[key]; if (!sz) return null;
  const ph = phase(sz, t);
  let pose = mixPose({ ...sz.basis, ...sz.start }, { ...sz.basis, ...sz.ende }, ph.move);
  if (sz.flach) pose = flach(pose);
  const opt = { ansicht: sz.ansicht, neigung: sz.neigung };
  const z = F.zeichne(pose, opt), { T } = F.skelett(pose), cam = F.kamera(sz.ansicht, sz.neigung);
  /* gleiche Verankerung wie die Übungskarten: Anker waagerecht fest, tiefster Punkt auf y = 0 */
  const a = z.punkte[sz.anker]; const dx = -a[0], dy = -(sz.boden ?? z.box[3]);
  let H = null, alpha = ph.show ?? 0;
  if (sz.eins) H = sz.eins(T);
  if (sz.zwei && ph.where != null) {
    const A = sz.zwei[0](T), B = sz.zwei[1](T);
    if (ph.where === 0) H = A; else if (ph.where === 1) H = B;
    else { const f = ph.f, lift = Math.sin(f * Math.PI) * 9; H = { c: add(lerp(A.c, B.c, f), mul(norm(add(A.n, B.n)), lift)), t: norm(lerp(A.t, B.t, f)), n: norm(lerp(A.n, B.n, f)) }; }
  }
  let liege = "";
  if (sz.ohneBoden) liege = "";
  else if (sz.sitz) { const P = z.punkte, xs = ["huefteL", "huefteR", "knieL", "knieR"].map(k => P[k][0] + dx), y = Math.max(P.huefteL[1], P.huefteR[1]) + dy + 8;
    liege = `<rect x="${(Math.min(...xs) - 22).toFixed(1)}" y="${y.toFixed(1)}" width="${(Math.max(...xs) - Math.min(...xs) + 30).toFixed(1)}" height="48" rx="3" fill="var(--line,#dfe4eb)"/>`; }
  else if (sz.liege) { const y = 0.6; liege = `<rect x="-200" y="${y}" width="400" height="5" rx="2" fill="var(--line,#dfe4eb)"/>`; }
  else liege = `<path d="M-200 0.3L200 0.3" stroke="var(--line,#dfe4eb)" stroke-width="1.2"/>`;
  let nase = "";
  if (sz.nase) { const K = T.kopf, R = K.R, M = v => add(K.o, add(add(mul(R[0], v[0]), mul(R[1], v[1])), mul(R[2], v[2])));
    const q = cam(M([0, 3.2, 11.2])), q2 = cam(M([0, 1.2, 12.6])); nase = `<path d="M${(q[0] + dx).toFixed(2)} ${(-q[1] + dy).toFixed(2)}L${(q2[0] + dx).toFixed(2)} ${(-q2[1] + dy).toFixed(2)}" stroke="#c88f65" stroke-width="2.6" stroke-linecap="round"/>`; }
  if (sz.wand) { const zx = z.punkte.zehenR[0] + dx + 9; liege += `<rect x="${zx.toFixed(1)}" y="-140" width="4" height="140" fill="var(--line,#dfe4eb)"/>`; }
  if (sz.tisch) { const e = z.punkte.ellbogenR, h = z.punkte.handgelenkR; const y = Math.max(e[1], h[1]) + dy + 4; liege += `<rect x="${(Math.min(e[0], h[0]) + dx - 14).toFixed(1)}" y="${y.toFixed(1)}" width="${(Math.abs(h[0] - e[0]) + 14).toFixed(1)}" height="4" rx="1.5" fill="var(--line,#dfe4eb)"/>`; }
  const handy = H && alpha > .01 ? handySvg(cam, H, dx, dy, alpha.toFixed(2)) : "";
  const ton = ph.beep && H ? (() => { const q = cam(H.c); return `<text x="${(q[0] + dx + 6).toFixed(1)}" y="${(-q[1] + dy - 10).toFixed(1)}" font-size="7" font-weight="700" fill="var(--tape,#1d74d8)" font-family="-apple-system,Helvetica,sans-serif">♪</text>`; })() : "";
  const vb = rahmen || [z.box[0] + dx - 12, z.box[1] + dy - 12, z.box[2] - z.box[0] + 24, z.box[3] - z.box[1] + 24];
  const fb = sz.fokus ? sz.fokus.map(k => [z.punkte[k][0] + dx, z.punkte[k][1] + dy]) : null;
  return { fb, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v => v.toFixed(1)).join(" ")}">${liege}<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})">${z.svg}</g>${nase}${handy}${ton}</svg>`, step: ph.step, box: [z.box[0] + dx, z.box[1] + dy, z.box[2] + dx, z.box[3] + dy] };
}
/* Fester Bildausschnitt über den ganzen Ablauf, 3:2 */
const cacheR = {};
function rahmen(key) {
  if (cacheR[key]) return cacheR[key];
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  const sz = S[key], m = sz.rand ?? 12;
  for (let i = 0; i < 24; i++) { const r = bild(key, i * 0.3, [0, 0, 1, 1]);
    const pts = r.fb || [[r.box[0], r.box[1]], [r.box[2], r.box[3]]];
    for (const q of pts) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); } }
  let w = b[2] - b[0] + 2 * m, h = b[3] - b[1] + 2 * m;
  const fmt = sz.format ?? 1.5;
  if (w / h < fmt) w = h * fmt; else h = w / fmt;
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  return cacheR[key] = [cx - w / 2, cy - h / 2, w, h];
}
function svg(key, t) { if (!S[key]) return null; return bild(key, t, rahmen(key)); }
/* ---------- Aufbau für Kamera und Foto: wo das Gerät gehalten wird (ohne Stativ) ---------- */
const LIEGE_H = 70;
const AUF = {
  "s-flex": { pose: { ellbogenR: 2, schulterAbdR: 2, ellbogenL: 2, schulterAbdL: 2 }, joint: "schulter", dir: "S", hoehe: "auf Schulterhöhe", wo: "seitlich neben den Patienten, gemessener Arm zur Kamera", dist: "2–3 m" },
  "s-ext": { pose: { ellbogenR: 2, schulterAbdR: 2, ellbogenL: 2, schulterAbdL: 2 }, joint: "schulter", dir: "S", hoehe: "auf Schulterhöhe", wo: "seitlich neben den Patienten, gemessener Arm zur Kamera", dist: "2–3 m" },
  "s-abd": { pose: {}, joint: "schulter", dir: "F", hoehe: "auf Brusthöhe", wo: "frontal vor den Patienten (oder genau hinter ihn)", dist: "2–3 m" },
  "e-flex": { pose: { ellbogenR: 25, ellbogenL: 25 }, joint: "ellbogen", dir: "S", hoehe: "auf Ellenbogenhöhe", wo: "seitlich, gemessener Arm zur Kamera, Unterarm in Supination", dist: "1,5–2 m" },
  "e-ext": { pose: { ellbogenR: 25, ellbogenL: 25 }, joint: "ellbogen", dir: "S", hoehe: "auf Ellenbogenhöhe", wo: "seitlich, gemessener Arm zur Kamera", dist: "1,5–2 m" },
  "f-mcp": { pose: { ellbogenR: 90, ellbogenL: 90, unterarmRotR: 90, unterarmRotL: 90 }, joint: "hand", dir: "S", hoehe: "auf Handhöhe", wo: "seitlich auf die Hand, Daumen zeigt zur Decke", dist: "30–50 cm", nah: true },
  "f-pip": { pose: { ellbogenR: 90, ellbogenL: 90, unterarmRotR: 90, unterarmRotL: 90 }, joint: "hand", dir: "S", hoehe: "auf Handhöhe", wo: "seitlich auf die Hand, Daumen zeigt zur Decke", dist: "30–50 cm", nah: true },
  "f-dip": { pose: { ellbogenR: 90, ellbogenL: 90, unterarmRotR: 90, unterarmRotL: 90 }, joint: "hand", dir: "S", hoehe: "auf Handhöhe", wo: "seitlich auf die Hand, Daumen zeigt zur Decke", dist: "30–50 cm", nah: true },
  "hu-flex": { pose: { ...LIEGEN, hueftFlexR: 70, knieR: 80, osgR: 5 }, liege: true, joint: "huefte", dir: "S", hoehe: "etwas über Liegenhöhe", wo: "seitlich neben die Liege, Becken, Knie und Schulter im Bild", dist: "1,5–2 m" },
  "hu-ext": { pose: BAUCH, liege: true, joint: "huefte", dir: "S", hoehe: "etwas über Liegenhöhe", wo: "seitlich neben die Liege, Becken und Oberschenkel im Bild", dist: "1,5–2 m" },
  "hu-abd": { pose: {}, joint: "huefte", dir: "F", hoehe: "auf Hüfthöhe", wo: "frontal vor den Patienten, Becken gerade", dist: "2–3 m" },
  "k-flex": { pose: { ...LIEGEN, hueftFlexR: 50, knieR: 95, osgR: 5 }, liege: true, joint: "knie", dir: "S", hoehe: "auf Kniehöhe", wo: "seitlich neben die Liege, gemessenes Bein zur Kamera, Hüfte bis Fuß im Bild", dist: "1,5–2 m" },
  "k-ext": { pose: LIEGEN, liege: true, joint: "knie", dir: "S", hoehe: "knapp über Liegenhöhe", wo: "seitlich neben die Liege, gemessenes Bein zur Kamera", dist: "1,5–2 m" },
  "o-de": { pose: SITZ, sitz: true, joint: "sprunggelenk", dir: "S", hoehe: "auf Knöchelhöhe", wo: "seitlich auf den Fuß, Patient sitzt an der Liegenkante", dist: "1 m" },
  "o-pf": { pose: SITZ, sitz: true, joint: "sprunggelenk", dir: "S", hoehe: "auf Knöchelhöhe", wo: "seitlich auf den Fuß, Patient sitzt an der Liegenkante", dist: "1 m" }
};
const TABLET = { h: 24.8, b: 17.9, d: 0.7 };
const minY = P => { let m = Infinity; for (const k in P) m = Math.min(m, P[k][1]); return m; };
/* Haltung des Therapeuten: Körper (stehen, knien, hocken) und Arme so wählen, dass die Hände auf Zielhöhe sind */
const KOERPER = [["stehend", {}], ["kniend", { knieL: 95, knieR: 95 }], ["in der Hocke", { hueftFlexL: 115, hueftFlexR: 115, knieL: 135, knieR: 135, becken: 22 }]];
const haltCache = {};
function therapeut(zielH, nah) {
  const key = Math.round(zielH / 4) + (nah ? "n" : "");
  if (haltCache[key]) return haltCache[key];
  let best = null;
  KOERPER.forEach(([name, kp], ki) => {
    for (let fl = 10; fl <= 95; fl += 7) for (const el of [20, 45, 70, 95]) {
      const pose = { ...kp, schulterFlexL: fl, schulterFlexR: fl, ellbogenL: el, ellbogenR: el, schulterAbdL: 14, schulterAbdR: 14, hws: 8 };
      const { P } = F.skelett(pose), boden = minY(P) - 8;
      const hh = (P.handL[1] + P.handR[1]) / 2 - boden, vor = (P.handL[2] + P.handR[2]) / 2;
      if (vor < 22) continue; /* Gerät muss vor dem Körper sein */
      const score = Math.abs(hh - zielH) + ki * 9 + (el > 80 ? 4 : 0);
      if (!best || score < best.score) best = { score, pose, name, boden, hand: [(P.handL[0] + P.handR[0]) / 2, hh, vor] };
    }
  });
  return haltCache[key] = best;
}
function box3(pr, x0, x1, y0, y1, z0, z1, fill, dunkel) {
  const V = (x, y, z) => pr([x, y, z]);
  const faces = [
    [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
    [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
    [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]],
    [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
    [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]]];
  return faces.map((f, i) => { const q = f.map(v => V(...v)); return { z: q.reduce((s, p) => s + p[2], 0) / 4, d: `<path d="M${q.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L")}Z" fill="${i ? dunkel : fill}"/>` }; })
    .sort((A, B) => A.z - B.z).map(f => f.d).join("");
}
function aufbau(key, side) {
  const a = AUF[key]; if (!a) return null;
  const L = side === "l", sx = L ? 1 : -1;
  /* Patient in Weltkoordinaten (Boden y = 0) */
  const pose0 = { ...a.pose }, P0 = F.skelett(pose0).P;
  let py;
  if (a.liege) py = LIEGE_H - (minY(P0) - 1);
  else if (a.sitz) py = LIEGE_H + 9;
  else py = -(minY(P0) - 8);
  const pose = { ...pose0, y: py };
  const { P } = F.skelett(pose);
  const J = P[a.joint + (L ? "L" : "R")];
  const dir = a.dir === "F" ? [0, 0, 1] : [sx, 0, 0];
  const abstand = a.nah ? 38 : 115;          /* gezeichneter Abstand (verkürzt) */
  /* Therapeut hält das Gerät: Hände auf Gelenkhöhe, steht hinter dem Gerät, schaut zum Patienten */
  const th = therapeut(Math.max(35, J[1]), a.nah);
  const fz = [-dir[0], 0, -dir[2]], rot = Math.atan2(fz[0], fz[2]) * 180 / Math.PI;
  const tp0 = { ...th.pose, beckenRot: rot }, T0 = F.skelett(tp0).P;
  const handMid = [(T0.handL[0] + T0.handR[0]) / 2, (T0.handL[1] + T0.handR[1]) / 2, (T0.handL[2] + T0.handR[2]) / 2];
  const C = [J[0] + dir[0] * abstand, J[1], J[2] + dir[2] * abstand];
  const tpose = { ...tp0, x: C[0] - handMid[0] + dir[0] * 4, y: -(minY(T0) - 8), z: C[2] - handMid[2] + dir[2] * 4 };
  const TP = F.skelett(tpose).P;
  const Cg = [(TP.handL[0] + TP.handR[0]) / 2 - dir[0] * 4, (TP.handL[1] + TP.handR[1]) / 2 + 4, (TP.handL[2] + TP.handR[2]) / 2 - dir[2] * 4];
  const quer = !!a.liege;
  const H = { c: Cg, t: quer ? (a.dir === "F" ? [1, 0, 0] : [0, 0, 1]) : [0, 1, 0], n: dir };
  /* Blick schräg von der Seite, sodass Patient, Gerät und Therapeut zu sehen sind */
  const baseYaw = a.dir === "F" ? 0 : (L ? -90 : 90);
  const yaw = baseYaw + (a.dir === "F" ? 62 : (L ? -62 : 62)), pitch = a.nah ? 16 : 22;
  const cam = F.kamera(yaw, pitch);
  const pr = v => { const q = cam(v); return [q[0], -q[1], q[2]]; };
  const zP = F.zeichne(pose, { ansicht: yaw, neigung: pitch, farben: {} });
  const zT = F.zeichne(tpose, { ansicht: yaw, neigung: pitch, farben: { shirt: "#5f7f99", shirtFern: "#52708a", haut: "#d9a27a", hautFern: "#bf8b66" } });
  const parts = [];
  /* Boden */
  parts.push({ z: -1e9, d: (() => { const q = [[-160, 0, -160], [160, 0, -160], [160, 0, 160], [-160, 0, 160]].map(pr); return `<path d="M${q.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L")}Z" fill="var(--fill,#eef1f5)"/>`; })() });
  if (a.liege || a.sitz) {
    const zz = a.liege ? [-105, 100] : [-62, 36];
    parts.push({ z: -1e8, d: box3(pr, -34, 34, 0, LIEGE_H, zz[0], zz[1], "#cfd8e2", "#b5c1ce") });
  }
  const depth = v => cam(v)[2];
  parts.push({ z: depth(P.becken), d: zP.svg });
  parts.push({ z: depth(TP.becken), d: zT.svg });
  parts.push({ z: depth(Cg) + 0.5, d: handySvg(cam, H, 0, 0, 1, a.nah ? { h: 14.7, b: 7.1, d: 0.85 } : TABLET) });
  parts.sort((A, B) => A.z - B.z);
  /* Sichtlinie und Abstand */
  const pc = pr(Cg), pj = pr(J), mid = [(pc[0] + pj[0]) / 2, (pc[1] + pj[1]) / 2], fs = a.nah ? 6 : 9;
  const linie = `<path d="M${pc[0].toFixed(1)} ${pc[1].toFixed(1)}L${pj[0].toFixed(1)} ${pj[1].toFixed(1)}" stroke="var(--tape,#1d74d8)" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/><circle cx="${pj[0].toFixed(1)}" cy="${pj[1].toFixed(1)}" r="3.2" fill="var(--tape,#1d74d8)" stroke="#fff" stroke-width="1"/>`
    + `<g font-family="-apple-system,Helvetica,sans-serif" font-weight="700" font-size="${fs}"><rect x="${(mid[0] - fs * 2.7).toFixed(1)}" y="${(mid[1] - fs * 1.8).toFixed(1)}" width="${(fs * 5.4).toFixed(1)}" height="${(fs * 1.45).toFixed(1)}" rx="3" fill="var(--tape,#1d74d8)"/><text x="${mid[0].toFixed(1)}" y="${(mid[1] - fs * .72).toFixed(1)}" text-anchor="middle" fill="#fff">${a.dist}</text></g>`;
  /* Rahmen über beide Figuren */
  const bx = [zP.box, zT.box];
  const xs = bx.flatMap(b => [b[0], b[2]]).concat([pc[0]]), ys = bx.flatMap(b => [b[1], b[3]]).concat([pc[1], pr([0, 0, 0])[1]]);
  if (a.liege || a.sitz) [[-34, 0, -105], [34, 0, 100]].forEach(v => { const q = pr(v); xs.push(q[0]); ys.push(q[1]); });
  const m = a.nah ? 8 : 14; let w = Math.max(...xs) - Math.min(...xs) + 2 * m, h = Math.max(...ys) - Math.min(...ys) + 2 * m;
  if (w / h < 1.5) w = h * 1.5; else h = w / 1.5;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const vb = [cx - w / 2, cy - h / 2, w, h];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v => v.toFixed(1)).join(" ")}">${parts.map(p => p.d).join("")}${linie}</svg>`;
  const seite = a.dir === "F" ? "" : (L ? "links " : "rechts ");
  const wer = th.name[0].toUpperCase() + th.name.slice(1);
  const text = `${wer} halten: Gerät ${seite}${a.wo}, ${a.dist} entfernt, ${a.hoehe}, ${quer ? "quer" : "hochkant"}, mit beiden Händen ruhig. Libelle grün.`;
  const alt = "Ohne freie Hände: an eine Stuhllehne oder mit der Hülle auf einem Hocker anlehnen.";
  return { svg, text, alt };
}
root.ANL3 = { S, svg, aufbau, AUF };
})(typeof window !== "undefined" ? window : globalThis);
