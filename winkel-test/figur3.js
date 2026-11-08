/* Übungsfigur Fassung 3 (aus dem Projekt uebungsfigur/figur3.js) */
const Figur = (() => {
  const RAD = Math.PI / 180;

  const FARBEN = {
    haut: '#e3a97b',
    hautFern: '#c88f65',
    shirt: '#e28a2e',
    shirtFern: '#c9771f',
    hose: '#2b2b2b',
    schuh: '#242424',
    haar: '#2b2320',
    akzent: '#e0794a',
  };

  /* ---------- Vektoren ---------- */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  /** Drehmatrix als drei Spaltenvektoren [X, Y, Z]. */
  const Rx = (g) => { const c = Math.cos(g * RAD), s = Math.sin(g * RAD); return [[1, 0, 0], [0, c, s], [0, -s, c]]; };
  const Ry = (g) => { const c = Math.cos(g * RAD), s = Math.sin(g * RAD); return [[c, 0, -s], [0, 1, 0], [s, 0, c]]; };
  const Rz = (g) => { const c = Math.cos(g * RAD), s = Math.sin(g * RAD); return [[c, s, 0], [-s, c, 0], [0, 0, 1]]; };
  const mv = (M, v) => add(add(mul(M[0], v[0]), mul(M[1], v[1])), mul(M[2], v[2]));
  const mm = (A, B) => [mv(A, B[0]), mv(A, B[1]), mv(A, B[2])];
  const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const kette = (...M) => M.reduce(mm, I3);

  /* ---------- Körpermaße ---------- */
  // Profil: [entlang, +u1, -u1, +u2, -u2]. Bei Rumpf/Gliedmaßen: u1 = seitlich (außen), u2 = vorn.
  const MASS = {
    becken: { len: 16, prof: [[2, 12, 12, 8.4, 11], [8, 12.8, 12.8, 9, 11.8], [16, 12.4, 12.4, 8.6, 10.6]] },
    bauch: { len: 15, prof: [[0, 12.8, 12.8, 7.2, 11.2], [8, 12.6, 12.6, 6.9, 10.4], [15, 13.8, 13.8, 7.6, 11.0]] },
    brust: { len: 26.5, prof: [[0, 14.2, 14.2, 8.0, 11.3], [6, 15.4, 15.4, 9.2, 12.0], [14, 17.0, 17.0, 10.4, 13.2], [19, 19.2, 19.2, 10, 13.6], [21.6, 21.2, 21.2, 8.4, 13.2], [23.4, 20.4, 20.4, 7.2, 12.2], [24.8, 15.6, 15.6, 5.8, 9.8], [26.4, 10, 10, 4.8, 6.8], [27.9, 6, 6, 3.2, 4.8]] },
    hals: { len: 9, prof: [[-2, 5.6, 5.6, 5.2, 4.4], [4, 4.9, 4.9, 4.6, 4.1], [9, 5.3, 5.3, 4.8, 4.4], [11, 5.5, 5.5, 5, 4.4]] },
    oberarm: { len: 30, prof: [[-1, 5.6, 4.2, 5.4, 5.4], [1, 6.0, 4.4, 5.9, 5.6], [6, 5.8, 4.4, 5.7, 5.1], [13, 4.5, 4.2, 4.6, 4.9], [22, 3.9, 3.8, 4.0, 4.1], [28, 3.6, 3.5, 3.6, 3.7], [31, 3.3, 3.3, 3.3, 3.3]] },
    unterarm: { len: 26, prof: [[-1.5, 3.4, 3.4, 3.6, 3.6], [5, 4.0, 3.8, 4.3, 4.1], [13, 3.2, 3.0, 3.5, 3.3], [22, 2.5, 2.3, 2.5, 2.4], [26.5, 2.3, 2.2, 2.3, 2.2]] },
    hand: { len: 17.5, prof: [[-1, 2.2, 2.2, 2.2, 1.8], [2, 2.8, 2.6, 2.4, 2.0], [6, 3.6, 3.2, 2.6, 2.1], [10, 3.7, 3.3, 2.4, 2.0], [14, 3.2, 2.9, 2.0, 1.7], [17, 1.9, 1.8, 1.4, 1.2]] },
    oberschenkel: { len: 42, prof: [[-3, 8.4, 6.8, 8.6, 8.6], [3, 8.8, 7.6, 9.2, 9.8], [12, 8.4, 6.8, 8.8, 8.6], [24, 7.2, 5.8, 7.8, 7.2], [34, 6.0, 5.2, 6.3, 5.6], [40, 5.5, 5.0, 5.6, 5.0], [43, 5.2, 5.0, 5.2, 4.8]] },
    unterschenkel: { len: 40, prof: [[-2, 5.0, 5.0, 5.2, 5.0], [3, 5.0, 5.4, 4.7, 5.8], [10, 5.2, 5.6, 4.0, 6.9], [17, 4.6, 4.8, 3.6, 6.2], [27, 3.6, 3.6, 3.0, 4.2], [35, 3.2, 3.2, 2.8, 3.0], [40, 3.3, 3.3, 3.0, 3.2], [42, 3.3, 3.3, 3.0, 3.0]] },
    // Fuß: Achse zeigt nach vorn, u1 = seitlich, u2 = oben; unten ist die Sohle (8 cm unter dem Sprunggelenk)
    fuss: { prof: [[-6, 3.0, 3.0, 1.6, 6.6], [-3, 4.2, 4.2, 3.8, 8], [2, 4.6, 4.4, 4.4, 8], [8, 4.9, 4.6, 3.6, 8], [14, 5.0, 4.7, 2.8, 8], [19, 4.2, 3.9, 1.6, 8], [21.5, 3.2, 3.0, 0.8, 7.6]] },
    // Kleidung
    shorts: { prof: [[1, 13.2, 13.2, 9.4, 12.2], [7, 14.2, 14.2, 10, 12.8], [17, 13.2, 13.2, 9.4, 11.4]] },
    shortsBein: { prof: [[-5, 9.0, 7.6, 9.2, 9.4], [3, 9.6, 8.2, 9.8, 10.4], [12, 9.2, 7.4, 9.4, 9.2], [21, 8.4, 6.6, 8.6, 8.2]] },
    top: { prof: [[-1, 13.4, 13.4, 7.8, 11.8], [8, 13.2, 13.2, 7.5, 11.0], [15, 14.6, 14.6, 8.6, 11.9], [21, 15.8, 15.8, 9.6, 12.6], [28, 16.8, 16.8, 10.8, 14.0], [32, 15.2, 15.2, 10.4, 13.8], [35.5, 11.6, 11.6, 8.6, 12.8]] },
    kopf: { mitte: [0, 6.3, 1.0], radien: [8.6, 10.4, 9.6] },
    kiefer: { mitte: [0, 1.4, 2.6], radien: [6.8, 5.8, 7.0] },
  };

  const STANDARD = {
    x: 0, y: 0, z: 0,
    becken: 0, beckenSeit: 0, beckenRot: 0, lws: 0, lwsSeit: 0, lwsRot: 0, bws: 0, bwsSeit: 0, bwsRot: 0, hws: 0, hwsSeit: 0, hwsRot: 0, kopf: 0,
    schulterFlexL: 0, schulterAbdL: 6, schulterHorizL: 0, schulterRotL: 0, ellbogenL: 8, unterarmRotL: 0, handFlexL: 0, handAbdL: 0,
    schulterFlexR: 0, schulterAbdR: 6, schulterHorizR: 0, schulterRotR: 0, ellbogenR: 8, unterarmRotR: 0, handFlexR: 0, handAbdR: 0,
    hueftFlexL: 0, hueftAbdL: 2, hueftRotL: 0, knieL: 0, osgL: 0,
    hueftFlexR: 0, hueftAbdR: 2, hueftRotR: 0, knieR: 0, osgR: 0,
  };

  /* ---------- Skelett ---------- */
  /** Ein Körperteil: Ursprung o, Achse a, Seitachse u1, zweite Achse u2 (alles Einheitsvektoren im Körperraum). */
  const teil = (o, a, u1, u2) => ({ o, a, u1, u2 });

  function skelett(poseIn) {
    const p = { ...STANDARD, ...poseIn };
    const T = {}, P = {};
    const H0 = [p.x, p.y, p.z];
    const Rb = kette(Rx(p.becken), Rz(-p.beckenSeit), Ry(p.beckenRot));
    const Ra = kette(Rb, Rx(p.lws), Rz(-p.lwsSeit), Ry(p.lwsRot));
    const Rt = kette(Ra, Rx(p.bws), Rz(-p.bwsSeit), Ry(p.bwsRot));
    const Rn = kette(Rt, Rx(p.hws), Rz(-p.hwsSeit), Ry(p.hwsRot));
    const Rk = kette(Rn, Rx(p.kopf));
    const ax = (R) => ({ a: R[1], l: R[0], f: R[2] });

    const beckenTop = add(H0, mv(Rb, [0, MASS.becken.len, 0]));
    const bauchTop = add(beckenTop, mv(Ra, [0, MASS.bauch.len, 0]));
    const halsO = add(bauchTop, mv(Rt, [0, 26, 1]));
    const halsTop = add(halsO, mv(Rn, [0, MASS.hals.len, 0]));
    T.becken = teil(H0, ax(Rb).a, ax(Rb).l, ax(Rb).f);
    T.bauch = teil(beckenTop, ax(Ra).a, ax(Ra).l, ax(Ra).f);
    T.brust = teil(bauchTop, ax(Rt).a, ax(Rt).l, ax(Rt).f);
    T.hals = teil(halsO, ax(Rn).a, ax(Rn).l, ax(Rn).f);
    T.kopf = { o: halsTop, R: Rk };
    P.becken = H0; P.brustTop = add(bauchTop, mv(Rt, [0, 26.5, 0])); P.halsTop = halsTop;
    P.kopfTop = add(halsTop, mv(Rk, [0, MASS.kopf.mitte[1] + MASS.kopf.radien[1], MASS.kopf.mitte[2]]));
    P.kinn = add(halsTop, mv(Rk, [0, MASS.kiefer.mitte[1] - MASS.kiefer.radien[1], MASS.kiefer.mitte[2]]));

    /** Scharnier: Achse a um die Querachse l in Richtung f kippen. */
    const kipp = (a, f, g) => { const c = Math.cos(g * RAD), s = Math.sin(g * RAD); return { a: norm(add(mul(a, c), mul(f, s))), f: norm(sub(mul(f, c), mul(a, s))) }; };
    /** Drehung von u um die Achse a (Rodrigues). */
    const drehUm = (u, a, g) => { const c = Math.cos(g * RAD), s = Math.sin(g * RAD); return norm(add(add(mul(u, c), mul(cross(a, u), s)), mul(a, dot(a, u) * (1 - c)))); };

    for (const [k, s] of [['L', 1], ['R', -1]]) {
      // Arm
      const schulter = add(bauchTop, mv(Rt, [s * 15.8, 20.4, 0]));
      const Rarm = kette(Rt, Ry(-s * p['schulterHoriz' + k]), Rz(s * p['schulterAbd' + k]), Rx(-p['schulterFlex' + k]), Ry(s * p['schulterRot' + k]));
      let a = mul(Rarm[1], -1), l = mul(Rarm[0], s), f = Rarm[2];
      T['oberarm' + k] = teil(schulter, a, l, f);
      const ellbogen = add(schulter, mul(a, MASS.oberarm.len));
      let k1 = kipp(a, f, p['ellbogen' + k]);
      let a2 = k1.a, f2 = k1.f, l2 = l;
      f2 = drehUm(f2, a2, s * p['unterarmRot' + k]); l2 = drehUm(l2, a2, s * p['unterarmRot' + k]);
      T['unterarm' + k] = teil(ellbogen, a2, l2, f2);
      const handgelenk = add(ellbogen, mul(a2, MASS.unterarm.len));
      let k2 = kipp(a2, f2, p['handFlex' + k]);
      let a3 = k2.a, f3 = k2.f, l3 = l2;
      const k3 = kipp(a3, l3, p['handAbd' + k]); a3 = k3.a; l3 = k3.f;
      T['hand' + k] = teil(handgelenk, a3, l3, f3);
      P['schulter' + k] = schulter; P['ellbogen' + k] = ellbogen; P['handgelenk' + k] = handgelenk; P['hand' + k] = add(handgelenk, mul(a3, MASS.hand.len));

      // Bein
      const huefte = add(H0, mv(Rb, [s * 9, -2, 0]));
      const Rbein = kette(Rb, Rz(s * p['hueftAbd' + k]), Rx(-p['hueftFlex' + k]), Ry(s * p['hueftRot' + k]));
      let ab = mul(Rbein[1], -1), lb = mul(Rbein[0], s), fb = Rbein[2];
      T['oberschenkel' + k] = teil(huefte, ab, lb, fb);
      const knie = add(huefte, mul(ab, MASS.oberschenkel.len));
      const kk = kipp(ab, fb, -p['knie' + k]);
      const au = kk.a, fu = kk.f, lu = lb;
      T['unterschenkel' + k] = teil(knie, au, lu, fu);
      const sprung = add(knie, mul(au, MASS.unterschenkel.len));
      // Fuß: Achse = vorn, u2 = oben; Dorsalextension hebt die Zehen
      const kf = kipp(fu, mul(au, -1), p['osg' + k]);
      T['fuss' + k] = teil(sprung, kf.a, lu, kf.f);
      P['huefte' + k] = huefte; P['knie' + k] = knie; P['sprunggelenk' + k] = sprung;
      P['ferse' + k] = add(add(sprung, mul(kf.a, -6)), mul(kf.f, -8)); P['ballen' + k] = add(add(sprung, mul(kf.a, 15)), mul(kf.f, -8)); P['zehen' + k] = add(add(sprung, mul(kf.a, 21.5)), mul(kf.f, -7.6));
      P['sohle' + k] = add(add(sprung, mul(kf.a, 6)), mul(kf.f, -8));
    }
    return { T, P, p };
  }

  /* ---------- Projektion ---------- */
  function kamera(yaw, pitch = 0) {
    const c = Math.cos(yaw * RAD), s = Math.sin(yaw * RAD);
    const cp = Math.cos(pitch * RAD), sp = Math.sin(pitch * RAD);
    // zuerst um Y (Blickwinkel), dann leichte Neigung um X (Blick von leicht oben: pitch > 0)
    return (v) => {
      const x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c, y = v[1];
      return [x, y * cp - z * sp, y * sp + z * cp];
    };
  }
  const screen = (q) => [q[0], -q[1]];

  function hull(pts) {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (P.length < 3) return P;
    const kreuz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const unten = [], oben = [];
    for (const q of P) { while (unten.length >= 2 && kreuz(unten[unten.length - 2], unten[unten.length - 1], q) <= 0) unten.pop(); unten.push(q); }
    for (let i = P.length - 1; i >= 0; i--) { const q = P[i]; while (oben.length >= 2 && kreuz(oben[oben.length - 2], oben[oben.length - 1], q) <= 0) oben.pop(); oben.push(q); }
    unten.pop(); oben.pop();
    return unten.concat(oben);
  }

  const r2 = (n) => Math.round(n * 100) / 100;
  const pfad = (P) => P.length ? 'M' + P.map((q) => `${r2(q[0])} ${r2(q[1])}`).join('L') + 'Z' : '';
  /** Leicht gerundeter Pfad durch dichte Punkte (quadratische Mittelpunkte). */
  function rund(P) {
    const n = P.length;
    if (n < 3) return pfad(P);
    const m = (i) => [(P[i][0] + P[(i + 1) % n][0]) / 2, (P[i][1] + P[(i + 1) % n][1]) / 2];
    let d = `M${r2(m(n - 1)[0])} ${r2(m(n - 1)[1])}`;
    for (let i = 0; i < n; i++) { const q = P[i], mm2 = m(i); d += `Q${r2(q[0])} ${r2(q[1])} ${r2(mm2[0])} ${r2(mm2[1])}`; }
    return d + 'Z';
  }

  /** Alle Oberflächenpunkte einer Kapsel (Raum), inklusive runder Enden. */
  function kapselPunkte(t, prof, n = 14, flach = false) {
    const st = prof.slice();
    const f0 = prof[0], fl = prof[prof.length - 1];
    const r0 = Math.min(f0[1], f0[2], f0[3], f0[4]), rl = Math.min(fl[1], fl[2], fl[3], fl[4]);
    for (const tt of [0.5, 0.85, 1]) {
      const k = Math.sqrt(Math.max(0, 1 - tt * tt));
      st.unshift([f0[0] - r0 * tt, f0[1] * k, f0[2] * k, f0[3] * k, f0[4] * k]);
      st.push([fl[0] + rl * tt, fl[1] * k, fl[2] * k, fl[3] * k, fl[4] * k]);
    }
    const out = [];
    for (const [e, w1p, w1m, w2p, w2m] of st) {
      const c = add(t.o, mul(t.a, e));
      for (let i = 0; i < n; i++) {
        const w = (i / n) * Math.PI * 2, cw = Math.cos(w), sw = Math.sin(w);
        const r1 = cw >= 0 ? w1p : w1m, r2_ = sw >= 0 ? w2p : w2m;
        if (flach && sw < 0) {
          const k = Math.min(1, Math.abs(cw) * 1.7) * Math.sign(cw);
          out.push(add(add(c, mul(t.u1, r1 * k)), mul(t.u2, -r2_)));
        } else out.push(add(add(c, mul(t.u1, r1 * cw)), mul(t.u2, r2_ * sw)));
      }
    }
    return out;
  }

  /** Punkte eines Ellipsoids im Kopfraum. */
  function ellipsoidPunkte(kopf, mitte, rad, skal = 1, filter = null) {
    const out = [];
    for (let i = 1; i < 12; i++) {
      const th = (i / 12) * Math.PI, y = Math.cos(th), s = Math.sin(th);
      for (let j = 0; j < 24; j++) {
        const ph = (j / 24) * Math.PI * 2;
        const lok = [rad[0] * skal * s * Math.sin(ph), rad[1] * skal * y, rad[2] * skal * s * Math.cos(ph)];
        if (filter && !filter(lok, ph)) continue;
        out.push(add(kopf.o, mv(kopf.R, add(mitte, lok))));
      }
    }
    for (const y of [1, -1]) if (!filter || filter([0, rad[1] * skal * y, 0], 0)) out.push(add(kopf.o, mv(kopf.R, add(mitte, [0, rad[1] * skal * y, 0]))));
    return out;
  }

  const haarlinie = (ph) => 1.2 + 2.6 * Math.cos(ph) + 0.4 * Math.cos(2 * ph);

  /* ---------- Zeichnen ---------- */
  const ANSICHTEN = { vorn: 0, dreiviertel: 40, seite: 90, dreiviertelHinten: 140, hinten: 180, seiteLinks: -90, dreiviertelLinks: -40 };

  function zeichne(pose, opt = {}) {
    const yaw = typeof opt.ansicht === 'number' ? opt.ansicht : (ANSICHTEN[opt.ansicht ?? 'seite'] ?? 90);
    const cam = kamera(yaw, opt.neigung ?? 0);
    const { T, P } = skelett(pose);
    const C = { ...FARBEN, ...(opt.farben ?? {}) };
    const proj = (pts3) => pts3.map((v) => screen(cam(v)));
    const tiefe = (pts3) => pts3.reduce((s, v) => s + cam(v)[2], 0) / pts3.length;
    const rumpfZ = cam(P.brustTop)[2];
    const formen = [];
    const dazu = (pts3, farbe, prio = 0, name = '', bezug = null) => {
      const pts = proj(pts3);
      formen.push({ d: rund(hull(pts)), z: (bezug ? cam(bezug)[2] : tiefe(pts3)) + prio, farbe, name, pts });
    };
    const mitte = (t, len) => add(t.o, mul(t.a, len / 2));
    const fern = (gelenk) => cam(gelenk)[2] < rumpfZ - 4;

    // Rumpf
    dazu(kapselPunkte(T.becken, MASS.becken.prof), C.haut, 0, 'becken', mitte(T.becken, 16));
    dazu(kapselPunkte(T.bauch, MASS.bauch.prof), C.haut, 0, 'bauch', mitte(T.bauch, 15));
    dazu(kapselPunkte(T.brust, MASS.brust.prof), C.haut, 0, 'brust', mitte(T.brust, 26));
    dazu(kapselPunkte(T.hals, MASS.hals.prof), C.haut, 0.5, 'hals', mitte(T.hals, 9));
    // Kopf: Schädel + Kiefer als eine Form
    const kopfPts = ellipsoidPunkte(T.kopf, MASS.kopf.mitte, MASS.kopf.radien).concat(ellipsoidPunkte(T.kopf, MASS.kiefer.mitte, MASS.kiefer.radien));
    const kopfMitte = add(T.kopf.o, mv(T.kopf.R, MASS.kopf.mitte));
    dazu(kopfPts, C.haut, 1, 'kopf', kopfMitte);
    // Haare: Punkte oberhalb der Haarlinie, plus sichtbare Haarlinie als Kante
    const haarAlle = ellipsoidPunkte(T.kopf, add(MASS.kopf.mitte, [0, 0.5, -0.3]), MASS.kopf.radien, 1.06, (lok, ph) => lok[1] >= haarlinie(ph) * 1.06);
    const linie = [];
    for (let j = 0; j <= 48; j++) {
      const ph = (j / 48) * Math.PI * 2;
      const y = haarlinie(ph) * 1.06, B = MASS.kopf.radien[1] * 1.06;
      const s = Math.sqrt(Math.max(0, 1 - (y / B) ** 2));
      const lok = [MASS.kopf.radien[0] * 1.06 * s * Math.sin(ph), y, MASS.kopf.radien[2] * 1.06 * s * Math.cos(ph)];
      const nrm = mv(T.kopf.R, norm([lok[0] / MASS.kopf.radien[0] ** 2, lok[1] / MASS.kopf.radien[1] ** 2, lok[2] / MASS.kopf.radien[2] ** 2]));
      const w = add(T.kopf.o, mv(T.kopf.R, add(add(MASS.kopf.mitte, [0, 0.5, -0.3]), lok)));
      if (cam(nrm)[2] > 0.02) linie.push(screen(cam(w)));
    }
    {
      const hp = proj(haarAlle);
      const h = hull(hp);
      let d;
      if (linie.length >= 2 && h.length >= 3) {
        linie.sort((a, b) => a[0] - b[0]);
        const L = linie[0], Rr = linie[linie.length - 1];
        const naechst = (q) => { let bi = 0, bd = Infinity; h.forEach((v, i) => { const dd = (v[0] - q[0]) ** 2 + (v[1] - q[1]) ** 2; if (dd < bd) { bd = dd; bi = i; } }); return bi; };
        const iL = naechst(L), iR = naechst(Rr);
        const top = h.reduce((bi, v, i) => (v[1] < h[bi][1] ? i : bi), 0);
        const bogen = (von, bis) => { const out = []; let i = von; for (let k = 0; k <= h.length; k++) { out.push(h[i]); if (i === bis) break; i = (i + 1) % h.length; } return out; };
        let arc = bogen(iR, iL);
        if (!arc.includes(h[top])) arc = bogen(iL, iR).reverse();
        d = pfad([...linie, ...arc.slice(1, -1)].length ? [...linie, ...arc] : h);
      } else d = rund(h);
      formen.push({ d, z: cam(kopfMitte)[2] + 3, farbe: C.haar, name: 'haar' });
    }
    // Kleidung Rumpf
    dazu(kapselPunkte(T.becken, MASS.shorts.prof), C.hose, 0.3, 'shorts', mitte(T.becken, 16));
    {
      // Tanktop: ein Profil über Bauch + Brust (Achse des Bauchs, Brust leicht geknickt → zwei Kapseln)
      const topU = MASS.top.prof.filter((p) => p[0] <= 15).map((p) => [p[0], p[1], p[2], p[3], p[4]]);
      const topO = MASS.top.prof.filter((p) => p[0] >= 15).map((p) => [p[0] - 15, p[1], p[2], p[3], p[4]]);
      dazu(kapselPunkte(T.bauch, topU), C.shirt, 0.3, 'top', mitte(T.bauch, 15));
      dazu(kapselPunkte(T.brust, topO), C.shirt, 0.3, 'top', mitte(T.brust, 26));
      for (const s of [1, -1]) {
        const vorn = add(T.brust.o, add(add(mul(T.brust.a, 20.6), mul(T.brust.u1, s * 7.0)), mul(T.brust.u2, 8.0)));
        const oben = add(T.brust.o, add(add(mul(T.brust.a, 28.4), mul(T.brust.u1, s * 7.6)), mul(T.brust.u2, 0.4)));
        const hinten = add(T.brust.o, add(add(mul(T.brust.a, 21.2), mul(T.brust.u1, s * 7.0)), mul(T.brust.u2, -11.4)));
        for (const [A, B] of [[vorn, oben], [oben, hinten]]) {
          const a = norm(sub(B, A)), u2 = norm(cross(a, T.brust.u1));
          const tr = teil(A, a, T.brust.u1, u2);
          const L = Math.hypot(...sub(B, A));
          dazu(kapselPunkte(tr, [[0, 1.9, 1.9, 0.9, 0.9], [L, 1.9, 1.9, 0.9, 0.9]], 8), C.shirt, 0.6, 'traeger');
        }
      }
    }
    // Gliedmaßen
    for (const k of ['L', 'R']) {
      const armFern = fern(P['schulter' + k]), beinFern = fern(P['huefte' + k]);
      const hautA = armFern ? C.hautFern : C.haut, hautB = beinFern ? C.hautFern : C.haut;
      dazu(kapselPunkte(T['oberarm' + k], MASS.oberarm.prof), hautA, 0, 'oberarm' + k, mitte(T['oberarm' + k], 30));
      dazu(kapselPunkte(T['unterarm' + k], MASS.unterarm.prof), hautA, 0, 'unterarm' + k, mitte(T['unterarm' + k], 26));
      dazu(kapselPunkte(T['hand' + k], MASS.hand.prof), hautA, 0, 'hand' + k, mitte(T['hand' + k], 17));
      dazu(kapselPunkte(T['oberschenkel' + k], MASS.oberschenkel.prof), hautB, 0, 'oberschenkel' + k, mitte(T['oberschenkel' + k], 42));
      dazu(kapselPunkte(T['oberschenkel' + k], MASS.shortsBein.prof), C.hose, 0.3, 'shortsBein' + k, mitte(T['oberschenkel' + k], 42));
      dazu(kapselPunkte(T['unterschenkel' + k], MASS.unterschenkel.prof), hautB, 0, 'unterschenkel' + k, mitte(T['unterschenkel' + k], 40));
      dazu(kapselPunkte(T['fuss' + k], MASS.fuss.prof, 14, true), C.schuh, 0.4, 'fuss' + k, add(T['fuss' + k].o, mul(T['fuss' + k].a, 8)));
    }
    formen.sort((a, b) => a.z - b.z);
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const f of formen) for (const q of f.pts ?? []) { box[0] = Math.min(box[0], q[0]); box[1] = Math.min(box[1], q[1]); box[2] = Math.max(box[2], q[0]); box[3] = Math.max(box[3], q[1]); }
    const kante = opt.kante ?? 0;
    let svg = '';
    for (const f of formen) svg += `<path d="${f.d}" fill="${f.farbe}"${kante ? ` stroke="${f.farbe}" stroke-width="${kante}" stroke-linejoin="round"` : ''}/>`;
    const punkte = {};
    for (const k in P) punkte[k] = screen(cam(P[k]));
    return { svg, box, punkte, yaw };
  }

  function svg(pose, opt = {}) {
    const z = zeichne(pose, opt);
    const r = opt.rand ?? 10, b = z.box;
    let boden = '';
    if (opt.boden) boden = `<path d="M${r2(b[0] - 8)} ${r2(b[3])}L${r2(b[2] + 8)} ${r2(b[3])}" stroke="#b5b5ae" stroke-width="0.9" stroke-linecap="round"/>`;
    const vb = opt.ausschnitt ?? [b[0] - r, b[1] - r, b[2] - b[0] + 2 * r, b[3] - b[1] + 2 * r];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r2).join(' ')}">${boden}${z.svg}</svg>`;
  }

  /* ---------- Übungen ---------- */
  const glatter = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);
  function mische(a, b, u) {
    const o = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[k] ?? STANDARD[k] ?? 0, y = b[k] ?? STANDARD[k] ?? 0;
      o[k] = x + (y - x) * u;
    }
    return o;
  }
  const gesamtDauer = (u) => u.folge.reduce((s, f) => s + (f.halten ?? 0.5) + (f.dauer ?? u.dauer ?? 1.6), 0);

  /** Stellt die Sprunggelenke so, dass die Füße waagerecht auf dem Boden stehen. */
  function fuesseFlach(pose) {
    const { T } = skelett(pose);
    const o = { ...pose };
    for (const k of ['L', 'R']) {
      const au = T['unterschenkel' + k].a, fu = T['unterschenkel' + k].u2;
      if (Math.abs(au[1]) > 0.05) o['osg' + k] = Math.atan(fu[1] / au[1]) / RAD;
    }
    return o;
  }

  /** Haltung zum Zeitpunkt t (Sekunden). */
  function haltung(u, t) {
    const ges = gesamtDauer(u);
    let r = ((t % ges) + ges) % ges;
    const F = u.folge.map((f) => ({ ...u.basis, ...f.pose }));
    let p = F[0];
    for (let i = 0; i < F.length; i++) {
      const h = u.folge[i].halten ?? 0.5, tw = u.folge[i].dauer ?? u.dauer ?? 1.6;
      if (r < h) { p = F[i]; break; }
      r -= h;
      if (r < tw) { p = mische(F[i], F[(i + 1) % F.length], glatter(r / tw)); break; }
      r -= tw;
    }
    return u.fuesseFlach ? fuesseFlach(p) : p;
  }
  /** Zeitpunkt, an dem Stellung i (Index in folge) erreicht ist. */
  function zeitVon(u, i) {
    let t = 0;
    for (let j = 0; j < i; j++) t += (u.folge[j].halten ?? 0.5) + (u.folge[j].dauer ?? u.dauer ?? 1.6);
    return t + 0.001;
  }

  /** Zeichnet eine Haltung und verschiebt sie: Ankerpunkt waagerecht fest, tiefster Punkt auf dem Boden (y = 0). */
  function verankert(u, pose, opt) {
    const z = zeichne(pose, opt);
    const a = z.punkte[u.anker ?? 'ferseR'];
    const dx = -a[0], dy = -z.box[3];
    const P = {};
    for (const k in z.punkte) P[k] = [z.punkte[k][0] + dx, z.punkte[k][1] + dy];
    return { ...z, dx, dy, P, box: [z.box[0] + dx, z.box[1] + dy, z.box[2] + dx, z.box[3] + dy] };
  }

  const kamOpt = (u, opt) => ({ ansicht: opt.ansicht ?? u.ansicht ?? 90, neigung: opt.neigung ?? u.neigung ?? 0 });

  /** Rahmen über alle Zeitpunkte, damit das Bild nicht springt. */
  const rahmenCache = new Map();
  function rahmen(u, opt = {}) {
    const k = kamOpt(u, opt);
    const key = `${u.id}|${k.ansicht}|${k.neigung}`;
    if (rahmenCache.has(key)) return rahmenCache.get(key);
    const ges = gesamtDauer(u);
    const b = [Infinity, Infinity, -Infinity, -Infinity];
    for (let i = 0; i < 28; i++) {
      const v = verankert(u, haltung(u, (ges * i) / 28), k);
      b[0] = Math.min(b[0], v.box[0]); b[1] = Math.min(b[1], v.box[1]); b[2] = Math.max(b[2], v.box[2]); b[3] = Math.max(b[3], v.box[3]);
    }
    const breite = b[2] - b[0], hoehe = b[3] - b[1];
    // Seitenverhältnis 4:3 mit Rand, Boden etwas über dem unteren Rand
    let w = breite + 28, h = hoehe + 26;
    if (w / h < 4 / 3) w = (h * 4) / 3; else h = (w * 3) / 4;
    const cx = (b[0] + b[2]) / 2;
    const vb = [cx - w / 2, b[3] + 10 - h, w, h];
    rahmenCache.set(key, vb);
    return vb;
  }

  function pfeilSpitze(B, winkel, farbe, gr = 3.4) {
    const q = winkel + Math.PI / 2;
    const P = [[B[0] + Math.cos(winkel) * gr, B[1] + Math.sin(winkel) * gr], [B[0] + Math.cos(q) * gr * 0.62 - Math.cos(winkel) * 0.6, B[1] + Math.sin(q) * gr * 0.62 - Math.sin(winkel) * 0.6], [B[0] - Math.cos(q) * gr * 0.62 - Math.cos(winkel) * 0.6, B[1] - Math.sin(q) * gr * 0.62 - Math.sin(winkel) * 0.6]];
    return `<path d="M${P.map((v) => `${r2(v[0])} ${r2(v[1])}`).join('L')}Z" fill="${farbe}"/>`;
  }

  const zielCache = new Map();
  /** Bewegungshinweis: Bogen um ein Gelenk oder Weg eines Punktes. */
  function ziel(u, k, jetzt) {
    const z = u.ziel;
    if (!z) return '';
    const fa = z.farbe ?? '#1d6f86';
    const key = `${u.id}|${k.ansicht}|${k.neigung}`;
    if (!zielCache.has(key)) zielCache.set(key, [verankert(u, haltung(u, zeitVon(u, 0)), k).P, verankert(u, haltung(u, zeitVon(u, z.bis ?? 1)), k).P]);
    const [A, B] = zielCache.get(key);
    if (z.typ === 'weg') {
      const off = z.versatz ?? [0, 0];
      const p0 = [A[z.punkt][0] + off[0], A[z.punkt][1] + off[1]], p1 = [B[z.punkt][0] + off[0], B[z.punkt][1] + off[1]];
      const w = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      const p1k = [p1[0] - Math.cos(w) * 2, p1[1] - Math.sin(w) * 2];
      return `<g opacity="0.9"><path d="M${r2(p0[0])} ${r2(p0[1])}L${r2(p1k[0])} ${r2(p1k[1])}" stroke="${fa}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="0.1 3.2" fill="none"/>${pfeilSpitze(p1k, w, fa)}</g>`;
    }
    const J = jetzt[z.gelenk], r = z.radius ?? 14;
    const a0 = Math.atan2(A[z.distal][1] - A[z.gelenk][1], A[z.distal][0] - A[z.gelenk][0]);
    const a1 = Math.atan2(B[z.distal][1] - B[z.gelenk][1], B[z.distal][0] - B[z.gelenk][0]);
    let d = a1 - a0;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    if (Math.abs(d) < 0.08) return '';
    const P0 = [J[0] + Math.cos(a0) * r, J[1] + Math.sin(a0) * r], P1 = [J[0] + Math.cos(a0 + d) * r, J[1] + Math.sin(a0 + d) * r];
    const tang = a0 + d + (d > 0 ? Math.PI / 2 : -Math.PI / 2);
    return `<g opacity="0.92"><path d="M${r2(P0[0])} ${r2(P0[1])}A${r} ${r} 0 ${Math.abs(d) > Math.PI ? 1 : 0} ${d > 0 ? 1 : 0} ${r2(P1[0])} ${r2(P1[1])}" fill="none" stroke="${fa}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="0.1 3.2"/>${pfeilSpitze(P1, tang, fa)}<circle cx="${r2(J[0])}" cy="${r2(J[1])}" r="2.4" fill="${fa}" stroke="#fff" stroke-width="0.8"/></g>`;
  }

  function hilfsmittel(u, vb, P) {
    let hinten = '', vorn = '';
    for (const h of u.hilfsmittel ?? []) {
      if (h.typ === 'boden') hinten += `<path d="M${r2(vb[0] + 6)} 0L${r2(vb[0] + vb[2] - 6)} 0" stroke="#b9b6ad" stroke-width="0.9" stroke-linecap="round"/>`;
      if (h.typ === 'matte') {
        const x0 = vb[0] + 10, x1 = vb[0] + vb[2] - 10;
        hinten += `<rect x="${r2(x0)}" y="0" width="${r2(x1 - x0)}" height="2.2" rx="1.1" fill="#8aa6a0"/><path d="M${r2(vb[0] + 4)} 2.2L${r2(vb[0] + vb[2] - 4)} 2.2" stroke="#b9b6ad" stroke-width="0.9" stroke-linecap="round"/>`;
      }
      if (h.typ === 'band') {
        const A = P[h.von], B = P[h.bis];
        vorn += `<path d="M${r2(A[0])} ${r2(A[1])}L${r2(B[0])} ${r2(B[1])}" stroke="${h.farbe ?? '#3f9a5b'}" stroke-width="1.8" stroke-linecap="round"/>`;
      }
    }
    return { hinten, vorn };
  }

  /** Ein Bild einer Übung zum Zeitpunkt t. opt: ansicht, neigung, ziel (false = ohne Pfeil) */
  function uebungSvg(u, t, opt = {}) {
    const k = kamOpt(u, opt);
    const vb = rahmen(u, k);
    const v = verankert(u, haltung(u, t), k);
    const h = hilfsmittel(u, vb, v.P);
    const zi = opt.ziel === false ? '' : ziel(u, k, v.P);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(r2).join(' ')}" role="img" aria-label="${u.name}">${h.hinten}<g transform="translate(${r2(v.dx)} ${r2(v.dy)})">${v.svg}</g>${h.vorn}${zi}</svg>`;
  }

  const UEBUNGEN = [
    {
      id: 'kniebeuge', name: 'Kniebeuge', gruppe: 'Knie', seite: 'beidseits',
      dosierung: ['3 × 10', '2 s runter, 2 s hoch'],
      hinweise: ['Gewicht auf dem ganzen Fuß', 'Knie zeigen in Richtung der Zehen', 'Po nach hinten, wie beim Hinsetzen'],
      fehler: 'Fersen heben ab oder die Knie fallen nach innen.',
      ansicht: 55, anker: 'ferseR', fuesseFlach: true, dauer: 1.8,
      basis: { ellbogenL: 4, ellbogenR: 4 },
      folge: [
        { pose: {}, halten: 0.5 },
        { pose: { becken: 38, lws: -6, hws: -24, hueftFlexL: 100, hueftFlexR: 100, knieL: 92, knieR: 92, schulterFlexL: 122, schulterFlexR: 122 }, halten: 0.6 },
      ],
      hilfsmittel: [{ typ: 'boden' }],
      ziel: { typ: 'weg', punkt: 'becken', versatz: [-16, 0] },
    },
    {
      id: 'aro', name: 'Außenrotation mit Band', gruppe: 'Schulter', seite: 'beidseits',
      dosierung: ['3 × 15', 'Band leicht'],
      hinweise: ['Ellbogen bleiben am Körper, rechter Winkel', 'Schulterblätter leicht nach hinten unten', 'Langsam zurück, Band bleibt gespannt'],
      fehler: 'Die Ellbogen lösen sich vom Körper.',
      ansicht: 20, neigung: 22, anker: 'ferseR', dauer: 1.4,
      basis: { schulterAbdL: 2, schulterAbdR: 2, ellbogenL: 90, ellbogenR: 90 },
      folge: [
        { pose: { schulterRotL: -18, schulterRotR: -18 }, halten: 0.5 },
        { pose: { schulterRotL: 48, schulterRotR: 48 }, halten: 0.7 },
      ],
      hilfsmittel: [{ typ: 'boden' }, { typ: 'band', von: 'handL', bis: 'handR' }],
      ziel: { typ: 'bogen', gelenk: 'ellbogenL', distal: 'handL', radius: 12 },
    },
    {
      id: 'bruecke', name: 'Brücke', gruppe: 'Becken und LWS', seite: 'beidseits',
      dosierung: ['3 × 10', 'oben 3 s halten'],
      hinweise: ['Erst den Po anspannen, dann das Becken heben', 'Schultern bleiben auf der Matte', 'Oben bilden Knie, Hüfte und Schultern eine Linie'],
      fehler: 'Ins Hohlkreuz drücken statt mit dem Po zu heben.',
      ansicht: 90, anker: 'ferseR', fuesseFlach: true, dauer: 1.6,
      basis: { ellbogenL: 0, ellbogenR: 0, schulterAbdL: 8, schulterAbdR: 8 },
      folge: [
        { pose: { becken: -90, hueftFlexL: 50, hueftFlexR: 50, knieL: 121, knieR: 121 }, halten: 0.6 },
        { pose: { becken: -110, hws: 19, hueftFlexL: 3, hueftFlexR: 3, knieL: 100, knieR: 100, schulterFlexL: -20, schulterFlexR: -20 }, halten: 1.2 },
      ],
      hilfsmittel: [{ typ: 'matte' }],
      ziel: { typ: 'weg', punkt: 'huefteR', versatz: [0, 0] },
    },
  ];

  return { FARBEN, STANDARD, MASS, ANSICHTEN, UEBUNGEN, skelett, zeichne, svg, uebungSvg, haltung, gesamtDauer, rahmen, kamera };
})();
if (typeof window !== "undefined") window.Figur = Figur;
if (typeof module !== "undefined") module.exports = Figur;
