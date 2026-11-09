/* Erkennung im Hintergrund-Strang: Körper- bzw. Handpunkte aus einem Bild.
   Läuft getrennt von der Oberfläche, damit nichts einfriert. */
import * as mp from "./mp/vision_bundle.mjs";
let fs = null, cur = null;
const det = {};
async function make(m, del) {
  const base = { modelAssetPath: m.model, delegate: del };
  return m.kind === "hand"
    ? mp.HandLandmarker.createFromOptions(fs, { baseOptions: base, runningMode: "VIDEO", numHands: 1, minHandDetectionConfidence: .5, minTrackingConfidence: .5 })
    : mp.PoseLandmarker.createFromOptions(fs, { baseOptions: base, runningMode: "VIDEO", numPoses: 1, minPoseDetectionConfidence: .5, minPosePresenceConfidence: .5, minTrackingConfidence: .5 });
}
self.onmessage = async e => {
  const m = e.data;
  try {
    if (m.type === "init") {
      if (!fs) fs = await mp.FilesetResolver.forVisionTasks(m.wasm, true);
      const key = m.kind + "|" + m.model;
      if (!det[key]) {
        const d = await make(m, m.del);
        d._mode = "VIDEO"; d._how = m.del; det[key] = d;
      }
      cur = det[key];
      self.postMessage({ type: "ready", id: m.id, how: cur._how });
      return;
    }
    if (m.type === "frame") {
      const img = m.bitmap || m.image;
      if (!cur) { m.bitmap && m.bitmap.close(); self.postMessage({ type: "result", id: m.id, r: null }); return; }
      if (cur._mode !== m.mode) { await cur.setOptions({ runningMode: m.mode }); cur._mode = m.mode; }
      const r = m.mode === "VIDEO" ? cur.detectForVideo(img, m.ts) : cur.detect(img);
      m.bitmap && m.bitmap.close();
      self.postMessage({ type: "result", id: m.id, r: { landmarks: r.landmarks, worldLandmarks: r.worldLandmarks, handedness: r.handedness } });
    }
  } catch (err) {
    try { m.bitmap && m.bitmap.close(); } catch (x) {}
    self.postMessage({ type: "error", id: m.id, msg: String((err && err.message) || err) });
  }
};
self.postMessage({ type: "loaded" });
