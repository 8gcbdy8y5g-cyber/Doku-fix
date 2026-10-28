export const CSS = `
.ana [hidden]{display:none!important}
.ana{position:fixed;z-index:30;display:flex;flex-direction:column;background:var(--grund,#F2F2F7);color:var(--schrift,#000);font:15px -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;overflow:hidden;-webkit-user-select:none;user-select:none}
.ana.voll{inset:0!important;z-index:2000;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
html.ana-voll body{overflow:hidden}
.ana button{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent;cursor:pointer}
.ana svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}
.ana-kopf{flex:none;padding:6px 0;background:var(--flaeche,#fff);border-bottom:1px solid var(--linie,#C6C6C8)}
.ana-regionen{display:flex;gap:6px;overflow-x:auto;padding:2px 12px 6px;scrollbar-width:none;scroll-snap-type:x proximity}
.ana-regionen::-webkit-scrollbar{display:none}
.ana-chip{flex:none;min-height:36px;padding:0 14px;border-radius:18px;border:1px solid var(--rahmen,#D1D1D6);background:var(--flaeche,#fff);font-weight:600;font-size:14px;scroll-snap-align:center;transition:background .2s,color .2s,border-color .2s}
.ana-chip.an{background:var(--tape,#146C99);border-color:var(--tape,#146C99);color:var(--tape-auf,#fff)}
.ana-reihe{display:flex;align-items:center;gap:6px;padding:0 10px}
.ana-reihe .ana-regionen{flex:1;min-width:0;padding:2px 2px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 10px,#000 calc(100% - 14px),transparent);mask-image:linear-gradient(90deg,transparent 0,#000 10px,#000 calc(100% - 14px),transparent)}
.ana-diag{flex:none}
.ana-diag,.ana-pille{display:flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border-radius:10px;border:0;background:color-mix(in srgb,var(--tape,#146C99) 12%,transparent);color:var(--tape,#146C99);font-weight:600;font-size:14px}
.ana-diag svg,.ana-pille svg{width:18px;height:18px}
.ana-pille{position:absolute;right:10px;top:10px;background:rgba(255,255,255,.9);color:#1c1c1e;box-shadow:0 1px 6px rgba(0,0,0,.12)}
.ana.voll .ana-pille{top:58px}
.ana-seg{flex:none;display:flex;margin-left:auto;background:var(--seite,#E5E5EA);border-radius:10px;padding:2px}
.ana-seg[hidden]{display:none}
.ana-seg button{border:0;background:none;min-height:32px;padding:0 14px;border-radius:8px;font-weight:600;font-size:14px;color:var(--schrift2,#6C6C70);transition:background .2s,color .2s}
.ana-seg button.an{background:var(--flaeche,#fff);color:var(--schrift,#000);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.ana-seg.breit{margin:0 0 10px;width:100%}
.ana-seg.breit button{flex:1;min-height:40px;padding:0 6px}
.ana-buehne{position:relative;flex:1;min-height:0;background:radial-gradient(120% 90% at 50% 35%,#FBFCFD 0%,#E6EAF0 100%)}
@media (prefers-color-scheme:dark){.ana-buehne{background:radial-gradient(120% 90% at 50% 35%,#2A2E35 0%,#121417 100%)}}
:root[data-theme="dark"] .ana-buehne{background:radial-gradient(120% 90% at 50% 35%,#2A2E35 0%,#121417 100%)}
.ana-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none}
.ana-canvas.stift,.ana-canvas.punkt{cursor:crosshair}
.ana-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ana-label{position:absolute;left:0;top:0;will-change:transform}
.ana-label i{position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#fff;border:2.5px solid var(--tape,#146C99);box-shadow:0 1px 3px rgba(0,0,0,.3)}
.ana-label span{position:absolute;left:12px;top:-34px;white-space:nowrap;padding:5px 10px;border-radius:9px;background:rgba(255,255,255,.94);color:#000;font-size:13px;font-weight:600;box-shadow:0 2px 10px rgba(0,0,0,.18);border-left:3px solid var(--tape,#146C99)}
.ana-label span::before{content:"";position:absolute;left:-12px;bottom:-14px;width:14px;height:1.5px;background:currentColor;opacity:.45;transform:rotate(-55deg);transform-origin:left}
.ana-label.links span{left:auto;right:12px;border-left:0;border-right:3px solid var(--tape,#146C99)}
.ana-label.problem i,.ana-label.pin i{border-color:#FF3B30}.ana-label.problem span,.ana-label.pin span{border-color:#FF3B30}
.ana-label.nerv i{border-color:#E0A800}.ana-label.nerv span{border-color:#E0A800}
.ana-label.wahl i{border-color:#E8A400}.ana-label.wahl span{border-color:#E8A400}
.ana-legende{position:absolute;left:10px;bottom:10px;display:flex;flex-direction:column;gap:4px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.82);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);font-size:12.5px;font-weight:600;color:#1c1c1e;box-shadow:0 1px 6px rgba(0,0,0,.08);pointer-events:none}
.ana-legende[hidden]{display:none}
.ana-legende span{display:flex;align-items:center;gap:7px}
.ana-legende i{width:11px;height:11px;border-radius:50%}
.ana-hinweis{position:absolute;left:50%;top:12px;transform:translate(-50%,-10px);max-width:min(92%,460px);padding:9px 14px;border-radius:12px;background:rgba(28,28,30,.86);color:#fff;font-size:13.5px;line-height:1.35;text-align:center;opacity:0;transition:opacity .3s,transform .3s;pointer-events:none}
.ana-hinweis.an{opacity:1;transform:translate(-50%,0)}
.ana-vollzu{position:absolute;right:10px;top:10px;display:none;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:20px;border:0;background:rgba(28,28,30,.78);color:#fff;font-weight:600}
.ana.voll .ana-vollzu{display:flex}
.ana-laden{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:opacity .35s}
.ana-laden.weg{opacity:0;pointer-events:none}
.ana-laden-box{display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;padding:20px;max-width:280px}
.ana-laden-box small{color:var(--schrift2,#6C6C70)}
.ana-balken{width:200px;height:6px;border-radius:3px;background:var(--seite,#E5E5EA);overflow:hidden}
.ana-balken i{display:block;height:100%;width:0;background:var(--tape,#146C99);transition:width .2s}
.ana-blatt{flex:none;position:relative;max-height:40%;display:flex;flex-direction:column;background:var(--flaeche,#fff);border-top:1px solid var(--linie,#C6C6C8);box-shadow:0 -6px 20px rgba(0,0,0,.06);animation:ana-auf .28s cubic-bezier(.2,.8,.2,1)}
.ana-blatt[hidden]{display:none}
.ana-blatt.klein .ana-blatt-inhalt{max-height:118px;overflow:hidden;-webkit-mask-image:linear-gradient(#000 70%,transparent);mask-image:linear-gradient(#000 70%,transparent)}
@keyframes ana-auf{from{transform:translateY(30px);opacity:.3}to{transform:none;opacity:1}}
.ana-griff{flex:none;height:22px;border:0;background:none;display:flex;align-items:center;justify-content:center;touch-action:none}
.ana-griff span{display:none}
.ana-griff i{width:38px;height:5px;border-radius:3px;background:var(--rahmen,#D1D1D6)}
.ana-blatt-inhalt{overflow-y:auto;padding:0 16px 14px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.ana-bkopf{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px}
.ana-btitel{flex:1;min-width:0}
.ana-btitel h3{margin:0;font-size:21px;font-weight:700;letter-spacing:-.01em;line-height:1.2}
.ana-btitel small{display:block;margin-top:2px;color:var(--schrift2,#6C6C70);font-size:13px}
.ana-x{flex:none;width:32px;height:32px;border-radius:16px;border:0;background:var(--seite,#E5E5EA);display:flex;align-items:center;justify-content:center;color:var(--schrift2,#6C6C70)}
.ana-x svg{width:16px;height:16px;stroke-width:2.4}
.ana-text{margin:0 0 10px;font-size:15.5px;line-height:1.45}
.ana-fein{margin:6px 0 0;font-size:12.5px;color:var(--schrift2,#6C6C70);line-height:1.35}
.ana-gruppe{margin:12px 0 6px;font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--schrift2,#6C6C70)}
.ana-aktionen{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.ana-akt{min-height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--rahmen,#D1D1D6);background:var(--flaeche,#fff);font-weight:600;font-size:14.5px}
.ana-akt.rot{border-color:#FF3B30;color:#D70015}.ana-akt.rot.an{background:#FF3B30;color:#fff}
.ana-akt.blau{border-color:#2E8FD9;color:#1767A8}.ana-akt.blau.an{background:#2E8FD9;color:#fff}
.ana-akt.an:not(.rot):not(.blau){background:var(--chip,#E3EEF4)}
.ana-chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}
.ana-mchip{min-height:34px;padding:0 12px;border-radius:17px;border:0;font-size:13.5px;font-weight:600}
.ana-mchip.rot{background:rgba(255,59,48,.14);color:#C4001A}.ana-mchip.blau{background:rgba(46,143,217,.15);color:#1767A8}
.ana-suche{width:100%;box-sizing:border-box;min-height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--feld-rand,#C6C6C8);background:var(--feld,#F7F9FA);color:inherit;font:inherit;font-size:16px;margin-bottom:4px;-webkit-user-select:text;user-select:text}
.ana-liste{display:flex;flex-direction:column}
.ana-zeile{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;min-height:50px;padding:6px 4px;border:0;border-bottom:1px solid var(--linie,#C6C6C8);background:none}
.ana-zeile span{display:flex;flex-direction:column;min-width:0}
.ana-zeile b{font-weight:600;font-size:15.5px}
.ana-zeile small{color:var(--schrift2,#6C6C70);font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ana-zeile.an b{color:var(--tape,#146C99)}
.ana-zeile i{flex:none;width:12px;height:12px;border-radius:50%}.ana-zeile i.rot{background:#FF3B30}.ana-zeile i.blau{background:#2E8FD9}
.ana-farben{display:flex;gap:12px;margin:2px 0 8px}
.ana-farbe{width:40px;height:40px;border-radius:20px;border:3px solid var(--flaeche,#fff);background:var(--c);box-shadow:0 0 0 1px var(--rahmen,#D1D1D6)}
.ana-farbe.an{box-shadow:0 0 0 3px var(--c)}
.ana-bew{display:flex;align-items:center;gap:12px;margin:6px 0 8px}
.ana-play{flex:none;width:46px;height:46px;border-radius:23px;border:0;background:var(--tape,#146C99);color:var(--tape-auf,#fff);display:flex;align-items:center;justify-content:center}
.ana-regler{position:relative;flex:1;height:44px;display:flex;align-items:center}
.ana-spur{position:absolute;left:0;right:0;top:50%;height:8px;margin-top:-4px;border-radius:4px;background:var(--seite,#E5E5EA);overflow:hidden}
.ana-spur i{position:absolute;top:0;bottom:0}
.ana-spur i.norm,.ana-bewleg i.norm{background:rgba(48,180,90,.45)}
.ana-spur i.bogen,.ana-bewleg i.bogen{background:rgba(255,59,48,.55)}
.ana-regler input{position:relative;width:100%;margin:0;background:none;-webkit-appearance:none;appearance:none;height:44px}
.ana-regler input::-webkit-slider-runnable-track{height:8px;background:transparent}
.ana-regler input::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;margin-top:-10px;border-radius:50%;background:#fff;box-shadow:0 1px 5px rgba(0,0,0,.35)}
.ana-regler input::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:0;box-shadow:0 1px 5px rgba(0,0,0,.35)}
.ana-grad{flex:none;min-width:74px;text-align:right;font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.ana-bewleg{display:flex;flex-wrap:wrap;gap:12px;font-size:13px;color:var(--schrift2,#6C6C70)}
.ana-bewleg span{display:flex;align-items:center;gap:6px}.ana-bewleg i{width:18px;height:8px;border-radius:4px}
.ana-werkzeug{flex:none;display:grid;grid-template-columns:repeat(6,1fr);background:var(--flaeche,#fff);border-top:1px solid var(--linie,#C6C6C8)}
.ana-wz{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:54px;border:0;background:none;color:var(--schrift2,#55555A);font-size:11px!important;font-weight:600}
.ana-wz.an{color:var(--tape,#146C99);background:color-mix(in srgb,var(--tape,#146C99) 9%,transparent)}
.ana-wz:disabled{opacity:.35}
@media (min-width:700px){
  .ana-blatt{position:absolute;right:12px;bottom:66px;width:380px;max-height:calc(100% - 140px);border:1px solid var(--linie,#C6C6C8);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.16)}
  .ana-werkzeug{grid-template-columns:repeat(6,minmax(0,110px));justify-content:center}
  .ana-legende{font-size:13.5px}
}
`;
