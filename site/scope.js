'use strict';
// Real-data loop animation: r7 round 2 (fails tolerance) -> AI reads the numbers -> round 3 (passes).
// Data: data/r7_wave.json (ngspice v(out), min/max-preserving downsample). No invented values.
window.RLSOKScope = (() => {
  const css = (el, v, d) => (getComputedStyle(el).getPropertyValue(v).trim() || d);

  function mount(canvas, data, labels, onStage) {
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [lo, hi] = data.band;
    const Y0 = 4.80, Y1 = 5.00, T0 = 1, T1 = 24;
    let W = 0, H = 0, dpr = 1, t0 = performance.now(), raf = 0, visible = true;
    const STAGES = [ // [start s, end s, key]
      [0.0, 0.8, 'design'], [0.8, 3.8, 'simulate'], [3.8, 6.3, 'fail'],
      [6.3, 8.8, 'revise'], [8.8, 11.8, 'simulate2'], [11.8, 15.5, 'pass']];
    const TOTAL = 15.5;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = Math.max(280, r.width); H = Math.max(180, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const pad = () => ({ l: W < 520 ? 44 : 60, r: 16, t: 18, b: W < 520 ? 30 : 34 });
    const px = (t) => { const p = pad(); return p.l + (t - T0) / (T1 - T0) * (W - p.l - p.r); };
    const py = (v) => { const p = pad(); return p.t + (1 - (v - Y0) / (Y1 - Y0)) * (H - p.t - p.b); };

    function trace(series, frac, color, width, dash) {
      const n = Math.max(2, Math.floor(series.t_ms.length * frac));
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = px(series.t_ms[i]), y = py(Math.max(Y0, Math.min(Y1, series.vout[i])));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke(); ctx.restore();
    }

    function frame(now) {
      const C = {
        bg: css(canvas, '--scope-bg', '#0d0f0e'), grid: css(canvas, '--scope-grid', '#26302b'),
        ink: css(canvas, '--scope-ink', '#e9e6dc'), muted: css(canvas, '--scope-muted', '#8a958f'),
        sig: css(canvas, '--signal', '#2fd27c'), band: css(canvas, '--scope-band', 'rgba(233,230,220,.07)'),
        mono: css(canvas, '--mono', 'ui-monospace, Consolas, monospace'),
      };
      let s = reduce ? TOTAL - 0.01 : ((now - t0) / 1000) % TOTAL;
      const stage = STAGES.find(([a, b]) => s >= a && s < b) || STAGES[STAGES.length - 1];
      onStage && onStage(stage[2]);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const p = pad();
      // band (spec 4.85-5.15 V; only 4.85 visible in this window)
      ctx.fillStyle = C.band; ctx.fillRect(p.l, py(Y1), W - p.l - p.r, py(lo) - py(Y1));
      // grid
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = `11px ${C.mono}`; ctx.fillStyle = C.muted;
      for (let v = 4.80; v <= 5.0001; v += 0.05) {
        ctx.beginPath(); ctx.moveTo(p.l, py(v)); ctx.lineTo(W - p.r, py(v)); ctx.stroke();
        ctx.fillText(v.toFixed(2) + ' V', 4, py(v) + 4);
      }
      for (let t = 4; t <= 24; t += 4) {
        ctx.beginPath(); ctx.moveTo(px(t), p.t); ctx.lineTo(px(t), H - p.b); ctx.stroke();
        ctx.fillText(t + ' ms', px(t) - 14, H - p.b + 16);
      }
      // lower limit
      ctx.save(); ctx.strokeStyle = C.ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(p.l, py(lo)); ctx.lineTo(W - p.r, py(lo)); ctx.stroke(); ctx.restore();
      ctx.fillStyle = C.ink; ctx.fillText(labels.limit, W - p.r - ctx.measureText(labels.limit).width - 4, py(lo) - 6);

      const f = data.fail, g = data.pass;
      const prog = (a, b) => Math.max(0, Math.min(1, (s - a) / (b - a)));
      const failFrac = s < 0.8 ? 0 : prog(0.8, 3.8);
      if (failFrac > 0) trace(f, failFrac, s < 6.3 ? C.ink : C.muted, s < 6.3 ? 1.6 : 1.1, s < 6.3 ? null : [3, 3]);
      if (s >= 3.8) { // breach marker at the true minimum
        let k = 0; f.vout.forEach((v, i) => { if (v < f.vout[k]) k = i; });
        const x = px(f.t_ms[k]), y = py(f.vout[k]);
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); ctx.restore();
        ctx.fillStyle = C.ink; ctx.font = `600 12px ${C.mono}`;
        const txt = `${f.vout_min.toFixed(3)} V < ${lo.toFixed(2)} V`;
        ctx.fillText(txt, Math.min(x + 14, W - p.r - ctx.measureText(txt).width), y + 22);
      }
      if (s >= 8.8) trace(g, prog(8.8, 11.8), C.sig, 2);
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    size();
    new ResizeObserver(size).observe(canvas);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(canvas);
    raf = requestAnimationFrame(frame);
  }

  async function load(url) { const r = await fetch(url); return r.json(); }
  return { mount, load };
})();
