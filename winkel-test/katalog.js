/* Bewegungskatalog: was gemessen wird, wie (Kamera/Sensor), Richtwerte nach Neutral-Null-Methode.
   Kamera-Definition: ref = Referenzsegment [von, nach], mov = bewegtes Segment [von, nach] (Namen aus WK.LM),
   zero = Rohwinkel in Neutral-Null-Stellung, unsigned = Betrag statt Vorzeichen (Sprunggelenk).
   Sensor: mode "single" = Nullpunkt in Ausgangsstellung, dann Drehung messen;
           "two" = erst proximales, dann distales Segment (Differenz der Neigungen);
           "abs" = Neigung gegen das Lot (Nullpunkt = senkrecht).
   rec = empfohlene Methode laut Studienlage, ev = kurze Evidenzangabe. Richtwerte: Entwurf, fachlich prüfen. */
(function (root) {
"use strict";
const SRC = {
  nnm: "Neutral-Null-Methode, Richtwerte nach Debrunner (Orthopädisches Diagnostikum) und AAOS (Greene & Heckman 1994)",
  soucie: "Soucie et al. 2011, Normalwerte gesunder Erwachsener (Haemophilia 17:500)",
  lunge: "Bennell et al. 1998; Hoch & McKeon 2011 (Weight-Bearing-Lunge, Tibianeigung)",
  hand: "Hume et al. 1990; AAOS",
  hws: "Youdas et al. 1992; Tousignant-Laflamme 2013 (Smartphone-HWS)"
};
const J = [
 { k: "schulter", n: "Schulter", side: true, mv: [
  { k: "s-flex", n: "Flexion", pair: "Ext/Flex", dir: "+", norm: [150, 170], src: "nnm", rec: "cam",
    ev: "Kamera seitlich: Abweichung etwa ±7° zum Goniometer; endgradig eher zu niedrig.",
    cam: { view: "seitlich", ref: ["sh", "hip"], mov: ["sh", "el"], zero: 0, tip: "Patient seitlich zur Kamera, zu messender Arm vorne. Ellenbogen gestreckt, Daumen nach oben, Arm nach vorne oben bis zum Ende und dort kurz halten." },
    sen: { mode: "single", tip: "Handy längs außen am Oberarm, Oberkante Richtung Schulter. Arm hängt locker. Still halten, bis der Ton kommt, dann Arm nach vorne oben bis zum Ende und halten." } },
  { k: "s-ext", n: "Extension", pair: "Ext/Flex", dir: "-", norm: [40, 50], src: "nnm", rec: "sen",
    ev: "Sensor am Oberarm, Schwerkraft als Bezug.",
    cam: { view: "seitlich", ref: ["sh", "hip"], mov: ["sh", "el"], zero: 0, tip: "Patient seitlich zur Kamera. Arm gestreckt nach hinten bis zum Ende, Rumpf bleibt aufrecht." },
    sen: { mode: "single", tip: "Handy längs außen am Oberarm. Arm hängt, still halten bis zum Ton, dann gestreckt nach hinten und halten." } },
  { k: "s-abd", n: "Abduktion", pair: "Abd/Add", dir: "+", norm: [160, 180], src: "nnm", rec: "cam",
    ev: "Kamera frontal: Bias etwa 0°, Grenzen etwa ±7° (Iturrieta 2026).",
    cam: { view: "frontal", ref: ["sh", "hip"], mov: ["sh", "el"], zero: 0, tip: "Patient frontal oder mit dem Rücken zur Kamera, Kamera auf Brusthöhe. Arm seitlich gestreckt nach oben, Handfläche nach vorn, oben halten." },
    sen: { mode: "single", tip: "Handy längs außen am Oberarm, Bildschirm zeigt nach außen. Arm hängt, still bis zum Ton, dann seitlich nach oben und halten." } },
  { k: "s-ar", n: "Außenrotation (90° Abd.)", pair: "AR/IR", dir: "+", norm: [70, 90], src: "nnm", rec: "sen", camOff: true,
    ev: "Rotation ist per Kamera nicht verlässlich; in Rückenlage misst der Sensor über die Schwerkraft.",
    sen: { mode: "single", tip: "Rückenlage, Schulter 90° abduziert, Ellenbogen 90° gebeugt, Unterarm zeigt nach oben. Handy längs auf den Unterarm. Still bis zum Ton, dann Unterarm nach hinten Richtung Kopf drehen und halten." } },
  { k: "s-ir", n: "Innenrotation (90° Abd.)", pair: "AR/IR", dir: "-", norm: [60, 70], src: "nnm", rec: "sen", camOff: true,
    ev: "Wie Außenrotation, Schulterblatt fixieren.",
    sen: { mode: "single", tip: "Rückenlage, Schulter 90° abduziert, Ellenbogen 90°, Unterarm senkrecht. Handy längs auf den Unterarm. Still bis zum Ton, dann Unterarm Richtung Füße drehen, Schulter vorne fixieren." } }
 ]},
 { k: "ellenbogen", n: "Ellenbogen", side: true, mv: [
  { k: "e-flex", n: "Flexion", pair: "Ext/Flex", dir: "+", norm: [140, 150], src: "nnm", rec: "cam",
    ev: "Kamera mit Punktkontrolle am Standbild; Foto-Goniometrie am Ellenbogen sehr reproduzierbar (ICC 0,87–0,99).",
    cam: { view: "seitlich", ref: ["sh", "el"], mov: ["el", "wr"], zero: 0, tip: "Arm seitlich zur Kamera, Unterarm in Supination. Kamera auf Ellenbogenhöhe. Maximal beugen und halten." },
    sen: { mode: "two", tip1: "Handy längs außen auf den Oberarm, Oberkante Richtung Schulter, still halten.", tip2: "Jetzt Handy genauso auf den Unterarm legen, Oberkante Richtung Ellenbogen, still halten." } },
  { k: "e-ext", n: "Extension", pair: "Ext/Flex", dir: "-", norm: [0, 10], src: "nnm", rec: "cam",
    ev: "Kleine Winkel: Standbild prüfen, Gelenkmitte am Epicondylus.",
    cam: { view: "seitlich", ref: ["sh", "el"], mov: ["el", "wr"], zero: 0, tip: "Arm seitlich zur Kamera, maximal strecken und halten." },
    sen: { mode: "two", tip1: "Handy längs außen auf den Oberarm, still halten.", tip2: "Handy genauso auf den Unterarm, still halten." } }
 ]},
 { k: "unterarm", n: "Unterarm", side: true, mv: [
  { k: "u-pro", n: "Pronation", pair: "Pro/Sup", dir: "+", norm: [80, 90], src: "nnm", rec: "sen", camOff: true,
    ev: "Per Foto/Kamera unzuverlässig (ICC bis 0,28); Sensor in der Faust gegen das Lot.",
    sen: { mode: "single", tip: "Ellenbogen 90° am Rumpf. Handy hochkant in die Faust, Daumen oben. Still bis zum Ton, dann Handfläche nach unten drehen und halten." } },
  { k: "u-sup", n: "Supination", pair: "Pro/Sup", dir: "-", norm: [80, 90], src: "nnm", rec: "sen", camOff: true,
    ev: "Wie Pronation.",
    sen: { mode: "single", tip: "Ellenbogen 90° am Rumpf, Handy hochkant in der Faust, Daumen oben. Still bis zum Ton, dann Handfläche nach oben drehen und halten." } }
 ]},
 { k: "hand", n: "Handgelenk", side: true, mv: [
  { k: "h-ext", n: "Extension", pair: "Ext/Flex", dir: "-", norm: [50, 60], src: "nnm", rec: "sen", camOff: true,
    ev: "Sensor auf dem Handrücken, Unterarm aufgelegt.",
    sen: { mode: "single", tip: "Unterarm auf dem Tisch, Hand über der Kante. Handy flach auf den Handrücken. Still bis zum Ton, dann Hand nach oben strecken und halten." } },
  { k: "h-flex", n: "Flexion", pair: "Ext/Flex", dir: "+", norm: [50, 60], src: "nnm", rec: "sen", camOff: true,
    ev: "Wie Extension.",
    sen: { mode: "single", tip: "Unterarm auf dem Tisch, Hand über der Kante, Handy flach auf dem Handrücken. Still bis zum Ton, dann Hand nach unten beugen und halten." } }
 ]},
 { k: "finger", n: "Finger", side: true, hand: true, mv: [
  { k: "f-mcp", n: "Grundgelenk (MCP) Flexion", pair: "Ext/Flex", dir: "+", norm: [80, 90], src: "hand", rec: "cam", senOff: true,
    ev: "Handerkennung seitlich: etwa 4° Abweichung am PIP; Standbild prüfen.",
    cam: { view: "seitlich", hand: true, ref: [0, 5], mov: [5, 6], zero: 0, tip: "Hand seitlich zur Kamera, nah heran (Hand füllt das halbe Bild). Finger beugen und halten." } },
  { k: "f-pip", n: "Mittelgelenk (PIP) Flexion", pair: "Ext/Flex", dir: "+", norm: [100, 110], src: "hand", rec: "cam", senOff: true,
    ev: "RMSE 4,2° gegen Elektrogoniometer (Zeigefinger, seitlich).",
    cam: { view: "seitlich", hand: true, ref: [5, 6], mov: [6, 7], zero: 0, tip: "Hand seitlich zur Kamera, nah heran. Mittelgelenk beugen und halten." } },
  { k: "f-dip", n: "Endgelenk (DIP) Flexion", pair: "Ext/Flex", dir: "+", norm: [70, 90], src: "hand", rec: "cam", senOff: true,
    ev: "Kleine Segmente: Standbild immer prüfen.",
    cam: { view: "seitlich", hand: true, ref: [6, 7], mov: [7, 8], zero: 0, tip: "Hand seitlich zur Kamera, nah heran. Endgelenk beugen und halten." } }
 ]},
 { k: "hws", n: "HWS", side: false, mv: [
  { k: "c-flex", n: "Flexion", pair: "Ext/Flex", dir: "+", norm: [35, 45], src: "hws", rec: "sen", camOff: true,
    ev: "Smartphone-Inklinometer: ICC 0,70–0,85 gegen CROM. Kamera nicht validiert.",
    sen: { mode: "single", tip: "Sitz aufrecht. Handy hochkant seitlich an den Kopf über dem Ohr halten. Still bis zum Ton, dann Kinn zur Brust und halten." } },
  { k: "c-ext", n: "Extension", pair: "Ext/Flex", dir: "-", norm: [35, 45], src: "hws", rec: "sen", camOff: true,
    ev: "Wie Flexion.",
    sen: { mode: "single", tip: "Sitz aufrecht, Handy hochkant seitlich am Kopf. Still bis zum Ton, dann Kopf in den Nacken und halten." } },
  { k: "c-lat", n: "Lateralflexion", pair: "Lat. re/li", dir: "+", norm: [40, 45], src: "hws", rec: "sen", camOff: true,
    ev: "Sensor an der Stirn, Schwerkraft als Bezug.",
    sen: { mode: "single", tip: "Sitz aufrecht, Handy hochkant flach an die Stirn. Still bis zum Ton, dann Ohr zur Schulter neigen und halten." } },
  { k: "c-rot", n: "Rotation (Rückenlage)", pair: "Rot. re/li", dir: "+", norm: [60, 80], src: "hws", rec: "sen", camOff: true,
    ev: "Im Sitzen per Kompass unzuverlässig (ICC 0,07); in Rückenlage über die Schwerkraft messbar.",
    sen: { mode: "single", tip: "Rückenlage, Kopf neutral. Handy hochkant flach auf die Stirn. Still bis zum Ton, dann Kopf zur Seite drehen und halten." } }
 ]},
 { k: "huefte", n: "Hüfte", side: true, mv: [
  { k: "hu-flex", n: "Flexion", pair: "Ext/Flex", dir: "+", norm: [120, 140], src: "nnm", rec: "sen",
    ev: "Sensor am Oberschenkel in Rückenlage: ICC > 0,90. Kamera: Hüftmitte schwer zu treffen.",
    cam: { view: "seitlich", ref: ["sh", "hip"], mov: ["hip", "kn"], zero: 0, tip: "Rückenlage, Seite zur Kamera, Becken und Schulter im Bild. Knie gebeugt, Hüfte maximal beugen und halten. Becken darf nicht abheben." },
    sen: { mode: "single", tip: "Rückenlage, Bein gestreckt. Handy längs vorne auf den Oberschenkel, Oberkante Richtung Hüfte. Still bis zum Ton, dann Hüfte (Knie gebeugt) maximal beugen und halten." } },
  { k: "hu-ext", n: "Extension", pair: "Ext/Flex", dir: "-", norm: [10, 20], src: "nnm", rec: "sen",
    ev: "Bauch- oder Seitlage, Becken fixieren.",
    cam: { view: "seitlich", ref: ["sh", "hip"], mov: ["hip", "kn"], zero: 0, tip: "Bauchlage oder Stand, Seite zur Kamera. Bein gestreckt nach hinten, Becken fixiert, halten." },
    sen: { mode: "single", tip: "Bauchlage, Handy längs auf die Oberschenkelrückseite. Still bis zum Ton, dann Bein gestreckt anheben und halten." } },
  { k: "hu-abd", n: "Abduktion", pair: "Abd/Add", dir: "+", norm: [30, 45], src: "nnm", rec: "cam", senOff: true,
    ev: "Bewegung in der Horizontalen (Rückenlage) ist für den Schwerkraftsensor unsichtbar; Kamera von oben/frontal.",
    cam: { view: "frontal", ref: ["sh", "hip"], mov: ["hip", "kn"], zero: 0, tip: "Stand oder Rückenlage, Kamera frontal (in Rückenlage von oben). Bein gestreckt seitlich abspreizen, Becken bleibt gerade." } },
  { k: "hu-ar", n: "Außenrotation (Sitz)", pair: "AR/IR", dir: "+", norm: [40, 50], src: "nnm", rec: "sen", camOff: true,
    ev: "Sitz, Hüfte und Knie 90°: Unterschenkel als Zeiger gegen das Lot.",
    sen: { mode: "single", tip: "Sitz an der Bankkante, Hüfte und Knie 90°. Handy längs vorne auf das Schienbein. Still bis zum Ton, dann Unterschenkel nach innen schwenken (= Außenrotation) und halten." } },
  { k: "hu-ir", n: "Innenrotation (Sitz)", pair: "AR/IR", dir: "-", norm: [30, 40], src: "nnm", rec: "sen", camOff: true,
    ev: "Wie Außenrotation.",
    sen: { mode: "single", tip: "Sitz an der Bankkante, Handy längs vorne auf dem Schienbein. Still bis zum Ton, dann Unterschenkel nach außen schwenken (= Innenrotation) und halten." } }
 ]},
 { k: "knie", n: "Knie", side: true, mv: [
  { k: "k-flex", n: "Flexion", pair: "Ext/Flex", dir: "+", norm: [120, 150], src: "nnm", rec: "cam",
    ev: "Kamera seitlich, kameranahe Seite: Grenzen etwa ±9°. Sensor zweistufig ebenfalls gut (ICC > 0,90).",
    cam: { view: "seitlich", ref: ["hip", "kn"], mov: ["kn", "an"], zero: 0, tip: "Seite zur Kamera, Kamera auf Kniehöhe, Hüfte bis Fuß im Bild. Kurze Hose oder eng anliegend. Maximal beugen und halten." },
    sen: { mode: "two", tip1: "Handy längs außen auf den Oberschenkel, Oberkante Richtung Hüfte, still halten.", tip2: "Jetzt Handy genauso außen auf den Unterschenkel, Oberkante Richtung Knie, still halten." } },
  { k: "k-ext", n: "Extension", pair: "Ext/Flex", dir: "-", norm: [0, 10], src: "nnm", rec: "sen",
    ev: "Kleine Winkel: Sensor zweistufig oder Standbild prüfen.",
    cam: { view: "seitlich", ref: ["hip", "kn"], mov: ["kn", "an"], zero: 0, tip: "Rückenlage oder Langsitz, Seite zur Kamera. Knie maximal strecken und halten." },
    sen: { mode: "two", tip1: "Handy längs außen auf den Oberschenkel, still halten.", tip2: "Handy genauso außen auf den Unterschenkel, still halten." } }
 ]},
 { k: "osg", n: "Sprunggelenk", side: true, mv: [
  { k: "o-lunge", n: "Dorsalext. (Lunge-Test)", pair: "Lunge", dir: "+", norm: [35, 45], src: "lunge", rec: "sen", camOff: true, abs: true,
    ev: "Neigung der Tibia im Ausfallschritt: ICC 0,85–0,90 mit der Wasserwaage des iPhones.",
    sen: { mode: "abs", tip: "Ausfallschritt zur Wand, Ferse bleibt am Boden. Handy längs vorne aufs Schienbein unterhalb der Tuberositas, Oberkante Richtung Knie. Knie maximal zur Wand und halten." } },
  { k: "o-de", n: "Dorsalextension", pair: "DE/PF", dir: "+", norm: [20, 30], src: "nnm", rec: "sen",
    ev: "Kamera am Sprunggelenk schwach (Steigung 0,36 bei ViFive); nur mit Standbildprüfung.",
    cam: { view: "seitlich", ref: ["kn", "an"], mov: ["heel", "toe"], zero: 90, unsigned: true, tip: "Sitz oder Rückenlage, Fuß seitlich zur Kamera, nah heran. Fuß maximal hochziehen und halten." },
    sen: { mode: "two", tip1: "Handy längs außen auf den Unterschenkel, still halten.", tip2: "Handy jetzt längs an die Fußaußenkante, still halten." } },
  { k: "o-pf", n: "Plantarflexion", pair: "DE/PF", dir: "-", norm: [40, 50], src: "nnm", rec: "sen",
    ev: "Wie Dorsalextension.",
    cam: { view: "seitlich", ref: ["kn", "an"], mov: ["heel", "toe"], zero: 90, unsigned: true, tip: "Fuß seitlich zur Kamera, nah heran. Fuß maximal nach unten strecken und halten." },
    sen: { mode: "two", tip1: "Handy längs außen auf den Unterschenkel, still halten.", tip2: "Handy längs an die Fußaußenkante, still halten." } }
 ]}
];
root.KAT = { J, SRC };
if (typeof module !== "undefined" && module.exports) module.exports = root.KAT;
})(typeof window !== "undefined" ? window : globalThis);
