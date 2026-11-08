/* Anleitung für die Sensormessung: wie das Handy aufgelegt wird, plus kleine Animation.
   Winkel in Grad: 0 = Segment zeigt nach unten, positiv = gegen den Uhrzeigersinn (nach rechts/vorne hoch).
   phone: "face" = man sieht auf den Bildschirm, "edge" = man sieht die Seitenkante (Bildschirm zeigt zur Seite der blauen Linie).
   on: an welchem Segment das Handy liegt; two: zweistufige Messung (erst ref, dann mov). */
(function (root) {
"use strict";
const A = {
  "s-flex": { away: 0, lage: "Rückseite außen auf den Oberarm, Bildschirm zeigt nach außen (weg vom Körper), Oberkante Richtung Schulter.",
    view: "Ansicht von der Seite", scene: "rumpf", pivot: [150, 102], ref: 0, refLen: 0, mov: [0, 160], movLen: 92, phone: "face", on: "mov" },
  "s-ext": { away: 0, lage: "Rückseite außen auf den Oberarm, Bildschirm zeigt nach außen, Oberkante Richtung Schulter.",
    view: "Ansicht von der Seite", scene: "rumpf", pivot: [150, 102], ref: 0, refLen: 0, mov: [0, -45], movLen: 92, phone: "face", on: "mov" },
  "s-abd": { away: 0, lage: "Rückseite außen auf den Oberarm, Bildschirm zeigt nach außen (weg vom Körper), Oberkante Richtung Schulter.",
    view: "Ansicht von vorn", scene: "rumpf-vorn", pivot: [182, 104], ref: 0, refLen: 0, mov: [0, 165], movLen: 92, phone: "edge", edgeSide: -1, on: "mov" },
  "s-ar": { away: 1, lage: "Rückseite auf die Unterarm-Rückseite, Bildschirm zeigt Richtung Kopf, Oberkante Richtung Hand.",
    view: "Rückenlage, Blick von der Seite", scene: "liegend-arm", pivot: [190, 166], ref: 90, refLen: 0, mov: [180, 260], movLen: 92, phone: "edge", edgeSide: 1, on: "mov", dirTxt: "Unterarm Richtung Kopf drehen" },
  "s-ir": { away: 1, lage: "Rückseite auf die Unterarm-Rückseite, Bildschirm zeigt Richtung Kopf, Oberkante Richtung Hand.",
    view: "Rückenlage, Blick von der Seite", scene: "liegend-arm", pivot: [190, 166], ref: 90, refLen: 0, mov: [180, 115], movLen: 92, phone: "edge", edgeSide: 1, on: "mov", dirTxt: "Unterarm Richtung Füße drehen" },
  "e-flex": { refAway: 1, movAway: 0, lage: "Hochkant mit der Rückseite außen an den Arm, Bildschirm zeigt nach außen. Oben am Oberarm: Oberkante Richtung Schulter. Danach am Unterarm: Oberkante Richtung Ellenbogen.",
    view: "Ansicht von der Seite", scene: "arm", pivot: [160, 150], ref: 180, refLen: 90, mov: [125, 125], movLen: 85, phone: "face", two: true },
  "e-ext": { refAway: 1, movAway: 0, lage: "Hochkant mit der Rückseite außen an den Arm, Bildschirm zeigt nach außen. Oberarm: Oberkante zur Schulter, Unterarm: Oberkante zum Ellenbogen.",
    view: "Ansicht von der Seite", scene: "arm", pivot: [160, 150], ref: 180, refLen: 90, mov: [5, 5], movLen: 85, phone: "face", two: true },
  "u-pro": { lage: "Handy hochkant in die Faust nehmen wie einen Stab, Oberkante zeigt nach oben, Bildschirm zeigt zum Körper.",
    view: "Blick auf die Faust von vorn", scene: "faust", pivot: [160, 112], mov: [0, -85], movLen: 0, phone: "rod", on: "mov", dirTxt: "Handfläche nach unten drehen" },
  "u-sup": { lage: "Handy hochkant in die Faust nehmen wie einen Stab, Oberkante zeigt nach oben, Bildschirm zeigt zum Körper.",
    view: "Blick auf die Faust von vorn", scene: "faust", pivot: [160, 112], mov: [0, 85], movLen: 0, phone: "rod", on: "mov", dirTxt: "Handfläche nach oben drehen" },
  "h-ext": { away: 1, lage: "Rückseite flach auf den Handrücken, Bildschirm zeigt nach oben, Oberkante Richtung Finger.",
    view: "Ansicht von der Seite", scene: "tisch", pivot: [150, 120], ref: -90, refLen: 120, mov: [90, 150], movLen: 72, phone: "edge", edgeSide: 1, on: "mov" },
  "h-flex": { away: 1, lage: "Rückseite flach auf den Handrücken, Bildschirm zeigt nach oben, Oberkante Richtung Finger.",
    view: "Ansicht von der Seite", scene: "tisch", pivot: [150, 120], ref: -90, refLen: 120, mov: [90, 30], movLen: 72, phone: "edge", edgeSide: 1, on: "mov" },
  "c-flex": { away: 1, lage: "Hochkant mit der Rückseite seitlich an den Kopf über dem Ohr, Bildschirm zeigt nach außen, Oberkante nach oben.",
    view: "Ansicht von der Seite", scene: "kopf", pivot: [155, 150], ref: 0, refLen: 70, mov: [180, 140], movLen: 30, phone: "face", on: "mov" },
  "c-ext": { away: 1, lage: "Hochkant mit der Rückseite seitlich an den Kopf über dem Ohr, Bildschirm zeigt nach außen, Oberkante nach oben.",
    view: "Ansicht von der Seite", scene: "kopf", pivot: [155, 150], ref: 0, refLen: 70, mov: [180, 220], movLen: 30, phone: "face", on: "mov" },
  "c-lat": { away: 1, lage: "Hochkant mit der Rückseite flach an die Stirn, Bildschirm zeigt nach vorn, Oberkante nach oben.",
    view: "Ansicht von vorn", scene: "kopf-vorn", pivot: [160, 150], ref: 0, refLen: 70, mov: [180, 140], movLen: 30, phone: "face", on: "mov" },
  "c-rot": { lage: "Rückenlage. Rückseite flach auf die Stirn, Bildschirm zeigt zur Decke, Oberkante Richtung Scheitel.",
    view: "Rückenlage, Blick vom Kopfende", scene: "kopf-oben", pivot: [160, 130], mov: [180, 110], movLen: 0, phone: "edge-head", on: "mov" },
  "hu-flex": { away: 0, lage: "Rückseite flach vorne auf den Oberschenkel, Bildschirm zeigt nach oben, Oberkante Richtung Hüfte.",
    view: "Rückenlage, Blick von der Seite", scene: "liegend-bein", pivot: [120, 150], ref: -90, refLen: 105, mov: [90, 205], movLen: 90, phone: "edge", edgeSide: 1, on: "mov", shank: true },
  "hu-ext": { away: 0, lage: "Bauchlage. Rückseite flach auf die Oberschenkelrückseite, Bildschirm zeigt nach oben, Oberkante Richtung Gesäß.",
    view: "Bauchlage, Blick von der Seite", scene: "liegend-bein", pivot: [120, 150], ref: -90, refLen: 105, mov: [90, 106], movLen: 105, phone: "edge", edgeSide: 1, on: "mov" },
  "hu-ar": { away: 0, lage: "Rückseite flach vorne auf das Schienbein, Bildschirm zeigt nach vorn, Oberkante Richtung Knie.",
    view: "Sitz, Ansicht von vorn", scene: "sitz-vorn", pivot: [160, 62], ref: 180, refLen: 0, mov: [0, 40], movLen: 105, phone: "face", on: "mov", dirTxt: "Unterschenkel nach innen = Außenrotation" },
  "hu-ir": { away: 0, lage: "Rückseite flach vorne auf das Schienbein, Bildschirm zeigt nach vorn, Oberkante Richtung Knie.",
    view: "Sitz, Ansicht von vorn", scene: "sitz-vorn", pivot: [160, 62], ref: 180, refLen: 0, mov: [0, -35], movLen: 105, phone: "face", on: "mov", dirTxt: "Unterschenkel nach außen = Innenrotation" },
  "k-flex": { refAway: 1, movAway: 0, lage: "Hochkant mit der Rückseite außen ans Bein, Bildschirm zeigt nach außen. Erst Oberschenkel, Oberkante Richtung Hüfte. Dann Unterschenkel, Oberkante Richtung Knie.",
    view: "Ansicht von der Seite", scene: "bein", pivot: [170, 150], ref: 180, refLen: 92, mov: [-110, -110], movLen: 92, phone: "face", two: true },
  "k-ext": { refAway: 1, movAway: 0, lage: "Hochkant mit der Rückseite außen ans Bein, Bildschirm zeigt nach außen. Oberschenkel: Oberkante zur Hüfte, Unterschenkel: Oberkante zum Knie.",
    view: "Ansicht von der Seite", scene: "bein", pivot: [170, 150], ref: 180, refLen: 92, mov: [-4, -4], movLen: 92, phone: "face", two: true },
  "o-lunge": { away: 1, lage: "Rückseite flach vorne auf das Schienbein unterhalb des Knies, Bildschirm zeigt nach vorn, Oberkante Richtung Knie.",
    view: "Ausfallschritt, Ansicht von der Seite", scene: "lunge", pivot: [130, 185], ref: 0, refLen: 0, mov: [180, 140], movLen: 120, phone: "edge", edgeSide: -1, on: "mov" },
  "o-de": { refAway: 1, movAway: 1, lage: "Hochkant mit der Rückseite außen anlegen, Bildschirm zeigt nach außen. Erst Unterschenkel, Oberkante Richtung Knie. Dann längs an die Fußaußenkante, Oberkante Richtung Zehen.",
    view: "Ansicht von der Seite", scene: "fuss", pivot: [140, 150], ref: 180, refLen: 110, mov: [90, 112], movLen: 85, phone: "face", two: true },
  "o-pf": { refAway: 1, movAway: 1, lage: "Hochkant mit der Rückseite außen anlegen, Bildschirm zeigt nach außen. Erst Unterschenkel, Oberkante Richtung Knie. Dann längs an die Fußaußenkante, Oberkante Richtung Zehen.",
    view: "Ansicht von der Seite", scene: "fuss", pivot: [140, 150], ref: 180, refLen: 110, mov: [90, 50], movLen: 85, phone: "face", two: true }
};

/* ---------- Zeichnen ---------- */
const R = Math.PI / 180;
const dirv = a => [Math.sin(a * R), Math.cos(a * R)]; /* 0° = nach unten */
function limb(c, p, a, l, w, col) { const d = dirv(a), q = [p[0] + d[0] * l, p[1] + d[1] * l]; c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); return q; }
function phoneFace(c, p, a, col) {
  /* Handy von vorn: Gehäuse, Bildschirm, Kamerainsel markiert die Oberkante (zeigt zum Gelenk hin, also entgegen der Segmentrichtung) */
  c.save(); c.translate(p[0], p[1]); c.rotate(-a * R);
  const w = 24, h = 46;
  c.fillStyle = "#1c2430"; rr(c, -w / 2, -h / 2, w, h, 5); c.fill();
  c.fillStyle = col.screen; rr(c, -w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 3.5); c.fill();
  c.fillStyle = "#1c2430"; rr(c, -5, -h / 2 + 4, 10, 3.5, 1.75); c.fill(); /* Insel oben */
  c.restore();
}
function phoneEdge(c, p, segA, side, top, col) {
  /* Handy von der Kante, in Weltkoordinaten: dunkler Balken längs zum Segment, Bildschirm als farbige Linie zur Außenseite */
  const d = dirv(segA), n = [d[1], -d[0]], L = 25;
  c.lineCap = "round"; c.strokeStyle = "#1c2430"; c.lineWidth = 7;
  c.beginPath(); c.moveTo(p[0] - d[0] * L, p[1] - d[1] * L); c.lineTo(p[0] + d[0] * L, p[1] + d[1] * L); c.stroke();
  const o = [n[0] * side * 4.5, n[1] * side * 4.5]; c.strokeStyle = col.screen; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(p[0] - d[0] * (L - 3) + o[0], p[1] - d[1] * (L - 3) + o[1]); c.lineTo(p[0] + d[0] * (L - 3) + o[0], p[1] + d[1] * (L - 3) + o[1]); c.stroke();
  const t = top > 0 ? d : [-d[0], -d[1]], tip = [p[0] + t[0] * (L + 11), p[1] + t[1] * (L + 11)], b = [p[0] + t[0] * (L + 4), p[1] + t[1] * (L + 4)];
  c.fillStyle = col.accent; c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(b[0] + n[0] * 5, b[1] + n[1] * 5); c.lineTo(b[0] - n[0] * 5, b[1] - n[1] * 5); c.closePath(); c.fill();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : (1 - Math.cos(x * Math.PI)) / 2;

/* Ablauf: Phase und Text in Abhängigkeit von der Zeit */
function phase(a, t) {
  if (a.two) {
    const T = 6.5, u = t % T;
    if (u < .6) return { k: 0, step: "Bewegung ausführen und halten" , pos: "ref", move: ease(u / .6) };
    if (u < 2.2) return { k: 1, step: "1 · Handy auf den ersten Abschnitt, ruhig halten → Ton", pos: "ref", move: 1, beep: u > 1.7 };
    if (u < 3.2) return { k: 2, step: "2 · Handy umsetzen", pos: "trans", f: ease((u - 2.2) / 1) , move: 1 };
    if (u < 5.2) return { k: 3, step: "3 · Auf dem zweiten Abschnitt ruhig halten → Ton, fertig", pos: "mov", move: 1, beep: u > 4.6 };
    return { k: 4, step: "Wert steht im Ergebnis", pos: "mov", move: 1 - ease((u - 5.2) / 1.3), hide: true };
  }
  const T = 6.6, u = t % T;
  if (u < 1.6) return { k: 1, step: "1 · Anlegen, Ausgangsstellung ruhig halten → Ton (Nullpunkt)", move: 0, beep: u > 1.1 };
  if (u < 3.0) return { k: 2, step: "2 · " + (a.dirTxt || "Bis zur Endstellung bewegen"), move: ease((u - 1.6) / 1.4) };
  if (u < 4.6) return { k: 3, step: "3 · Endstellung ruhig halten → Ton, Wert wird übernommen", move: 1, beep: u > 4.0 };
  if (u < 6.0) return { k: 4, step: "4 · Zurück in die Ausgangsstellung, dann nächste Wiederholung", move: 1 - ease((u - 4.6) / 1.4) };
  return { k: 4, step: "4 · Zurück in die Ausgangsstellung, dann nächste Wiederholung", move: 0 };
}

function draw(c, key, t, col) {
  const a = A[key]; if (!a) return null;
  const W = c.canvas.width, H = c.canvas.height, s = W / 320;
  c.setTransform(s, 0, 0, s, 0, 0); c.clearRect(0, 0, 320, H / s);
  const ph = phase(a, t);
  const body = col.body, joint = col.joint, wl = 22;
  const angNow = a.mov[0] + (a.mov[1] - a.mov[0]) * ph.move;
  let refEnd = a.pivot, movEnd = a.pivot, refA = a.ref, P = a.pivot;
  /* Kontext je Szene */
  c.fillStyle = col.floor;
  switch (a.scene) {
    case "rumpf": c.fillStyle = body; rr(c, P[0] - 20, P[1] - 14, 40, 112, 18); c.fill(); c.beginPath(); c.arc(P[0] + 4, P[1] - 40, 18, 0, 7); c.fill(); c.beginPath(); c.arc(P[0] + 21, P[1] - 42, 3, 0, 7); c.fill(); break;
    case "rumpf-vorn": c.fillStyle = body; rr(c, P[0] - 72, P[1] - 12, 62, 104, 16); c.fill(); c.beginPath(); c.arc(P[0] - 41, P[1] - 38, 18, 0, 7); c.fill(); limb(c, [P[0] - 64, P[1]], 0, 88, 18, body); break;
    case "liegend-arm": c.fillRect(14, P[1] + 14, 292, 5); c.globalAlpha = .55; c.fillStyle = body; rr(c, 52, P[1] - 18, 250, 30, 14); c.fill(); c.beginPath(); c.arc(34, P[1] - 4, 18, 0, 7); c.fill(); c.globalAlpha = 1; c.fillStyle = joint; c.beginPath(); c.arc(P[0], P[1], 13, 0, 7); c.fill(); c.fillStyle = col.muted; c.font = "600 11px -apple-system,Helvetica,sans-serif"; c.fillText("Kopf", 22, P[1] + 34); c.fillText("Füße", 270, P[1] + 34); break;
    case "tisch": c.fillRect(20, P[1] + 12, P[0] - 18, 6); break;
    case "kopf": limb(c, [P[0], P[1] + 6], 0, 60, 60, body); break;
    case "kopf-vorn": limb(c, [P[0], P[1] + 8], 0, 60, 90, body); break;
    case "liegend-bein": c.fillRect(20, P[1] + 16, 280, 6); limb(c, [P[0] - 4, P[1]], 90, 0, 1, body); break;
    case "sitz-vorn": c.fillRect(P[0] - 70, P[1] - 30, 140, 12); break;
    case "lunge": c.fillRect(20, P[1] + 8, 280, 6); c.fillRect(268, 20, 6, P[1] - 12); limb(c, [P[0] - 12, P[1]], 90, 70, 18, body); break;
    case "fuss": c.fillRect(20, P[1] + 22, 280, 5); break;
  }
  /* Segmente */
  if (a.scene === "faust" || a.scene === "kopf-oben") {
    c.fillStyle = body; c.beginPath(); c.arc(P[0], P[1], a.scene === "faust" ? 34 : 44, 0, 7); c.fill();
    if (a.scene === "kopf-oben") { c.save(); c.translate(P[0], P[1]); c.rotate(-(angNow - 180) * R); c.fillStyle = body; c.beginPath(); c.moveTo(-8, -40); c.lineTo(0, -56); c.lineTo(8, -40); c.fill(); c.restore(); c.fillStyle = col.floor; c.fillRect(40, P[1] + 46, 240, 6); }
    c.save(); c.translate(P[0], P[1]); c.rotate(-(a.scene === "kopf-oben" ? angNow - 180 : angNow) * R);
    if (a.scene === "faust") { c.fillStyle = "#1c2430"; rr(c, -4, -62, 8, 124, 3); c.fill(); c.fillStyle = col.screen; c.fillRect(2, -58, 2, 116); c.fillStyle = col.accent; c.beginPath(); c.moveTo(0, -72); c.lineTo(-5, -64); c.lineTo(5, -64); c.fill(); }
    else { c.fillStyle = "#1c2430"; rr(c, -26, -50, 52, 8, 3); c.fill(); c.fillStyle = col.screen; c.fillRect(-23, -52, 46, 2); }
    c.restore();
  } else {
    if (a.refLen) refEnd = limb(c, P, refA, a.refLen, wl, body);
    if (a.scene === "lunge") { movEnd = limb(c, P, angNow, a.movLen, wl, body); }
    else movEnd = limb(c, P, angNow, a.movLen, a.scene.startsWith("kopf") ? 0 : wl, body);
    if (a.scene.startsWith("kopf")) { const d = dirv(angNow); c.fillStyle = body; c.beginPath(); c.arc(P[0] + d[0] * 60, P[1] + d[1] * 60, 34, 0, 7); c.fill();
      if (a.scene === "kopf") { c.beginPath(); c.arc(P[0] + d[0] * 60 + d[1] * 30, P[1] + d[1] * 60 - d[0] * 30, 5, 0, 7); c.fill(); } }
    if (a.shank) { limb(c, movEnd, angNow - 115 * ph.move, 80, wl - 2, body); }
    if (a.scene === "fuss") { /* Fuß als Segment, Ferse hinter dem Knöchel */ }
    c.fillStyle = joint; c.beginPath(); c.arc(P[0], P[1], 9, 0, 7); c.fill();
  }
  /* Handy */
  if (a.phone === "face" || a.phone === "edge") {
    const along = (ang, len, f) => { const d = dirv(ang); return [P[0] + d[0] * len * f, P[1] + d[1] * len * f]; };
    const isHead = a.scene.startsWith("kopf");
    const refPos = a.refLen ? along(refA, a.refLen, .58) : P, movPos = along(angNow, isHead ? 60 : (a.movLen || 60), isHead ? 1 : .55);
    let pos, seg, aw;
    if (a.two) {
      if (ph.pos === "ref") { pos = refPos; seg = refA; aw = a.refAway; }
      else if (ph.pos === "mov") { pos = movPos; seg = angNow; aw = a.movAway; }
      else { const f = ph.f; pos = [refPos[0] + (movPos[0] - refPos[0]) * f, refPos[1] + (movPos[1] - refPos[1]) * f - Math.sin(f * Math.PI) * 30];
        const r0 = refA + (a.refAway ? 180 : 0), r1 = angNow + (a.movAway ? 180 : 0); seg = r0 + (((r1 - r0) % 360 + 540) % 360 - 180) * f; aw = 0; }
    } else { pos = movPos; seg = angNow; aw = a.away; }
    if (a.phone === "face") phoneFace(c, pos, seg + (aw ? 180 : 0), col);
    else { const d = dirv(seg), n = [d[1], -d[0]], sd = a.edgeSide || 1, off = wl / 2 + 5; phoneEdge(c, [pos[0] + n[0] * off * sd, pos[1] + n[1] * off * sd], seg, sd, aw ? 1 : -1, col); }
  }
  /* Ton */
  if (ph.beep) { c.fillStyle = col.accent; c.font = "700 13px -apple-system,Helvetica,sans-serif"; c.fillText("♪ Ton", 250, 30); }
  c.fillStyle = col.muted; c.font = "600 12px -apple-system,Helvetica,sans-serif"; c.fillText(a.view, 12, 22);
  return ph;
}
root.ANL = { A, draw };
})(typeof window !== "undefined" ? window : globalThis);
