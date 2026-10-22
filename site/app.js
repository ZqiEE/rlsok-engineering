'use strict';
(() => {
  const I = window.RLSOK_I18N;
  const $ = (s, el = document) => el.querySelector(s);
  let lang = 'en';
  try {
    const q = new URLSearchParams(location.search).get('lang');
    lang = q || localStorage.getItem('rlsok.lang') || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
  } catch (e) { /* storage blocked */ }
  if (!I[lang]) lang = 'en';
  const T = (k, vars) => {
    let s = (I[lang][k] ?? I.en[k] ?? k);
    if (vars) Object.entries(vars).forEach(([a, b]) => { s = s.replace(`{${a}}`, b); });
    return s;
  };
  let cases = null, stage = 'design', render = () => {};

  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-t]').forEach((e) => { e.textContent = T(e.dataset.t); });
    document.querySelectorAll('[data-th]').forEach((e) => { e.innerHTML = T(e.dataset.th); }); // trusted dictionary only
    document.querySelectorAll('[data-lang]').forEach((b) => { b.textContent = T('lang'); b.setAttribute('aria-label', T('langLabel')); });
    setStage(stage, true);
    render();
  }
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('rlsok.lang', lang); } catch (e) { /* ignore */ }
    apply();
  }));

  // ------------------------------------------------------------------ hero loop
  const STEP = { design: 'design', simulate: 'simulate', fail: 'fail', revise: 'revise', simulate2: 'simulate', pass: 'pass' };
  function setStage(k, force) {
    if (k === stage && !force) return;
    stage = k;
    const el = $('#stage');
    if (el) { el.textContent = T('st_' + k); el.dataset.stage = k; }
    document.querySelectorAll('.steps li').forEach((li) => li.classList.toggle('on', li.dataset.s === STEP[k]));
  }
  async function hero() {
    const cv = $('#scope');
    if (!cv || !window.RLSOKScope) return;
    try {
      const data = await RLSOKScope.load('data/r7_wave.json');
      RLSOKScope.mount(cv, data, { get limit() { return T('limit'); } }, setStage);
    } catch (e) { $('#stage') && ($('#stage').textContent = 'data/r7_wave.json'); }
  }

  // ------------------------------------------------------------------ numbers from data
  let dl = null, g1b = null;
  const getJSON = async (u) => { try { return await (await fetch(u)).json(); } catch (e) { return null; } };
  const fmt = (n) => Number(n).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
  const short = (n) => (lang === 'zh' ? `${+(n / 1e8).toFixed(1)} 亿` : `${Math.round(n / 1e6)}M`);
  function os() {
    const ua = navigator.userAgent || '', p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
    if (/Win/i.test(p) || /Windows/i.test(ua)) return 'win';
    if (/Mac/i.test(p) || /Mac OS X/i.test(ua)) return 'mac';
    if (/Linux|X11/i.test(p + ua)) return 'linux';
    return 'win';
  }
  function fillSite() {
    const o = os();
    if ($('#dl-os')) $('#dl-os').textContent = T({ win: 'osWin', mac: 'osMac', linux: 'osLinux', mobile: 'osMobile' }[o]);
    if (dl && $('#dl-btn')) {
      const w = dl.windows;
      $('#dl-btn').href = w.url;
      $('#dl-meta').textContent = `v${dl.version} · ${T('mb', { n: Math.round(w.bytes / 1048576) })}`;
      $('#dl-btn').classList.toggle('alt', o !== 'win');
      const t = dl.install_test;
      if ($('#q1m')) $('#q1m').textContent = T('q1m', { s: t.install_s, d1: (t.download_s_range[0] / 60).toFixed(1), d2: (t.download_s_range[1] / 60).toFixed(1), x: Math.round(t.extract_s / 60) });
      if ($('#q3m')) $('#q3m').textContent = T('q3m', { g: Math.round(t.g1_example_s), c: Math.round(t.circuit_round_s / 60) });
      const mob = $('#mob');
      if (mob) {
        mob.hidden = o !== 'mobile';
        const url = new URL(w.url, location.href).href;
        $('#mail-link').href = `mailto:?subject=${encodeURIComponent('RLSOK ' + dl.version)}&body=${encodeURIComponent(url)}`;
        $('#copy-link').onclick = async () => { try { await navigator.clipboard.writeText(url); $('#copy-link').textContent = T('copied'); } catch (e) { prompt('', url); } };
      }
      document.querySelectorAll('[data-sha]').forEach((e) => { e.textContent = w.sha256; });
      document.querySelectorAll('[data-file]').forEach((e) => { e.textContent = w.file; });
      if (w.release_page && $('#rel-page')) $('#rel-page').href = w.release_page;
      if (dl.bird_r1) {
        document.querySelectorAll('[data-sha-bird]').forEach((e) => { e.textContent = dl.bird_r1.sha256; });
        if ($('#bird-dl')) $('#bird-dl').href = dl.bird_r1.url;
      }
      document.querySelectorAll('[data-gs1p]').forEach((e) => { e.textContent = T('gs1p', { os: w.os, mb: T('mb', { n: Math.round(w.bytes / 1048576) }) }); });
    }
    const d = cases && cases.duck_level2;
    if (d && d.attempts && $('#v-duck-d')) {
      $('#v-duck').textContent = d.attempts[1].seeds;
      $('#v-duck-d').textContent = T('cdd', { a: short(d.attempts[0].steps), b: short(d.attempts[1].steps) });
      spark($('#duck-spark'), d.attempts);
    }
    const ti = $('#ti tbody');
    if (ti && dl && g1b && d) {
      const t = dl.install_test, up = g1b.rows.find((r) => r.num_envs === g1b.upstream_num_envs);
      const hx = (up.full_run_hours_estimate * 30000 / 10001).toFixed(0);
      const a2 = d.attempts[1], h2 = a2.reward_curve[a2.reward_curve.length - 1].wall_h.toFixed(1);
      const rows = [[T('ti_circuit'), T('sec', { s: Math.round(t.buck_example_s) }), '', T('MEASURED')],
        [T('ti_bench'), T('sec', { s: Math.round(t.g1_example_s) }), '', T('MEASURED')],
        [T('ti_duck'), T('ti_duckv', { h: h2 }), 'ok', T('VERIFIED')],
        [T('ti_g1'), T('ti_g1v', { v: (up.peak_vram_mib / 1024).toFixed(1), s: fmt(Math.round(up.steps_per_s_median)), h: up.full_run_hours_estimate.toFixed(0) }), '', T('EST')],
        [T('ti_g1x'), T('ti_g1xv', { h: hx }), '', T('EST')]];
      ti.replaceChildren(...rows.map(([a, b, ok, s]) => {
        const tr = el('tr'); tr.append(el('td', null, a), el('td', null, b)); const td = el('td'); td.appendChild(el('span', 'tag' + (ok ? ' ok' : ''), s)); tr.appendChild(td); return tr;
      }));
    }
  }
  // reward curve of both attempts (real progress.jsonl points); the second one in the signal colour
  function spark(cv, attempts) {
    if (!cv) return;
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!r.width) return;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const all = attempts.flatMap((a) => a.reward_curve), maxS = Math.max(...all.map((p) => p.steps));
    const lo = Math.min(...all.map((p) => p.reward)), hi = Math.max(...all.map((p) => p.reward));
    const css = getComputedStyle(document.documentElement);
    attempts.forEach((a, i) => {
      g.beginPath(); g.lineWidth = 1.5; g.strokeStyle = i ? css.getPropertyValue('--signal') : css.getPropertyValue('--muted');
      a.reward_curve.forEach((p, k) => { const x = 2 + (p.steps / maxS) * (r.width - 4), y = r.height - 3 - ((p.reward - lo) / (hi - lo || 1)) * (r.height - 6); k ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.stroke();
    });
  }
  async function loadCases() {
    [cases, dl, g1b] = await Promise.all([getJSON('data/cases.json'), getJSON('data/download.json'), getJSON('data/g1_bench.json')]);
    if (cases) {
      const v7 = $('#v-r7'); if (v7) v7.textContent = cases.r7.final_tolerance;
      const vg = $('#v-g1'); if (vg) vg.textContent = cases.g1_level1.seeds;
    }
    render();
  }

  // ------------------------------------------------------------------ case page
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const kv = (pairs) => { const d = el('div', 'kv'); pairs.forEach(([k, v, ok]) => { const c = el('div', null, k); const b = el('b', ok ? 'ok' : null, v); c.appendChild(b); d.appendChild(c); }); return d; };
  const table = (head, rows) => {
    const w = el('div', 'tblwrap'), t = el('table', 'tbl'), tr = el('tr');
    head.forEach((h) => tr.appendChild(el('th', null, h))); const th = el('thead'); th.appendChild(tr); t.appendChild(th);
    const tb = el('tbody'); rows.forEach((r) => { const x = el('tr'); r.forEach((c) => { const td = el('td'); if (c instanceof Node) td.appendChild(c); else td.textContent = c; x.appendChild(td); }); tb.appendChild(x); });
    t.appendChild(tb); w.appendChild(t); return w;
  };
  const tag = (status, txt) => el('span', 'tag' + (status === 'ok' ? ' ok' : ''), txt);
  const srcLine = (c) => el('p', 'srcline', `${T('source')}: ${c.source} · ${T('sha')} ${c.sha256}`);

  function caseRoot() { return $('#case'); }
  render = function renderCase() {
    fillSite();
    const root = caseRoot();
    if (!root || !cases) return;
    const id = new URLSearchParams(location.search).get('id') || 'r7';
    root.replaceChildren();
    const c = cases[id];
    if (!c) { root.appendChild(el('p', null, 'Unknown case')); return; }
    const h = el('h1');
    if (id === 'duck_level2') {
      h.textContent = T('cdk'); root.appendChild(h);
      root.appendChild(el('p', 'lead', T('duckWhy')));
      root.appendChild(el('h2', null, T('attempts')));
      root.appendChild(table(['', T('steps'), T('seeds'), T('dr'), T('verdict')], c.attempts.map((a) => [T('attempt', { n: a.attempt }), fmt(a.steps), a.seeds, a.dr,
        tag(a.label === 'VERIFIED' ? 'ok' : '', a.label === 'VERIFIED' ? T('VERIFIED') : T('FAILED'))])));
      root.appendChild(el('h2', null, T('reward')));
      const cv = el('canvas', 'spark big'); root.appendChild(cv);
      requestAnimationFrame(() => spark(cv, c.attempts));
      c.attempts.forEach((a) => {
        root.appendChild(el('h2', null, `${T('attempt', { n: a.attempt })} · ${T('segments')}`));
        root.appendChild(table(['', T('official'), T('trained'), T('lim'), T('verdict')],
          a.segments.map((s) => [`${s.segment} (${s.axis})`, s.official.toFixed(3), s.trained == null ? '—' : s.trained.toFixed(3), s.limit.toFixed(3),
            tag(s.pass ? 'ok' : '', s.pass ? T('PASS') : T('FAILED'))])));
        root.appendChild(srcLine(a));
      });
      root.appendChild(el('p', 'lead', T('duckNote')));
      return;
    } else if (id === 'g1_level1') {
      h.textContent = T('g1k'); root.appendChild(h);
      root.appendChild(kv([[T('verdict'), T('VERIFIED'), true], [T('seeds'), c.seeds, true], ['max |Δobs|', c.max_obs_diff.toExponential(1)]]));
      root.appendChild(el('h2', null, T('g1track')));
      root.appendChild(table(['cmd', 'measured'], Object.entries(c.tracking).map(([k, v]) => [k, v.toFixed(3)])));
    } else {
      h.textContent = id === 'r4' ? T('c4k') : T('c7k'); root.appendChild(h);
      root.appendChild(el('p', 'lead', `${T('req')}: ${c.requirement}`));
      if (id === 'r4') {
        root.appendChild(kv([[T('verdict'), T('INFEASIBLE')], [T('measured'), `${c.round1.input_current_A.toFixed(2)} A > ${c.round1.limit_A} A`],
          [T('energy'), `${c.energy.p_in_max_W} W < ${c.energy.p_load_min_W} W`]]));
        [[1, c.round1.status, c.round1.reason, null], [2, c.round2.status, c.round2.reason, c.round2.diagnosis]].forEach(([n, st, reason, diag]) => {
          const r = el('div', 'round'), h3 = el('h3', null, T('round', { n })); h3.appendChild(tag('', st)); r.appendChild(h3);
          if (reason) { r.appendChild(el('p', 'lbl', T('reason'))); r.appendChild(el('p', 'quote', reason)); }
          if (diag) { r.appendChild(el('p', 'lbl', T('diagnosis'))); r.appendChild(el('p', 'quote', diag)); }
          root.appendChild(r);
        });
      } else {
        root.appendChild(el('p', 'lead', T('idealWhy')));
        root.appendChild(kv([[T('verdict'), c.buildability && c.buildability.grade === 'IDEAL_ONLY' ? T('IDEAL') : T('PASS'), !(c.buildability && c.buildability.grade === 'IDEAL_ONLY')], ['tolerance', c.final_tolerance, true], ['fail case', `${c.fail_case.case}: ${c.fail_case.vout_min.toFixed(3)} V < ${c.fail_case.limit} V`]]));
        c.rounds.forEach((rd) => {
          const r = el('div', 'round'), h3 = el('h3', null, T('round', { n: rd.round })); h3.appendChild(tag(rd.status === 'PASS' ? 'ok' : '', rd.status)); r.appendChild(h3);
          if (rd.reason) { r.appendChild(el('p', 'lbl', T('reason'))); r.appendChild(el('p', 'quote', rd.reason)); }
          if (rd.diagnosis) { r.appendChild(el('p', 'lbl', T('diagnosis'))); r.appendChild(el('p', 'quote', rd.diagnosis)); }
          if (rd.changes) { r.appendChild(el('p', 'lbl', T('changes'))); r.appendChild(el('p', 'quote', rd.changes)); }
          root.appendChild(r);
        });
      }
      const a = el('a', 'btn', T('report')); a.href = c.report; root.appendChild(a);
    }
    root.appendChild(srcLine(c));
  };

  apply();
  hero();
  loadCases();
})();
