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

function handySvg(cam, H, dx, dy, alpha) {
  const t = norm(H.t), n = norm(H.n), b = norm(cross(n, t));
  const { h, b: w, d } = HANDY;
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
root.ANL3 = { S, svg };
})(typeof window !== "undefined" ? window : globalThis);
