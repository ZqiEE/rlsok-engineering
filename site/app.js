'use strict';
/* RLSOK site (release/UX_SPEC.md). One script for every page (body[data-page]); all text from i18n.js, all numbers
   from data/*.json (real run records). CSP: no inline script or style anywhere. */
(() => {
  const I = window.RLSOK_I18N;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const page = document.body.dataset.page;
  const q = new URLSearchParams(location.search);

  // ------------------------------------------------------------------ language: browser zh -> zh, else en; remembered
  let lang = 'en';
  try { lang = q.get('lang') || localStorage.getItem('rlsok.lang') || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch (e) { /* storage blocked */ }
  if (!I[lang]) lang = 'en';
  const T = (k, vars) => {
    let s = I[lang][k] ?? I.en[k] ?? k;
    if (vars) Object.entries(vars).forEach(([a, b]) => { s = s.split(`{${a}}`).join(b); });
    return s;
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const fmt = (n) => Number(n).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
  const STATUS = { hw: 'st_hw', sim: 'st_sim', prog: 'st_prog', fail: 'st_fail' };
  const pill = (s) => el('span', 'st ' + s, T(STATUS[s]));

  // ------------------------------------------------------------------ device
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  const windows = /Windows/i.test(ua);

  // ------------------------------------------------------------------ data
  const getJSON = async (u) => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  let dl = null, cases = null, log = null, fails = null, g1b = null;
  const mb = () => (dl ? Math.round(dl.windows.bytes / 1048576) : 123);

  // ------------------------------------------------------------------ apply language to static markup
  let render = () => {};
  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-t]').forEach((e) => { e.textContent = T(e.dataset.t); });
    $$('[data-lang]').forEach((b) => { b.textContent = T('lang'); b.setAttribute('aria-label', T('langLabel')); });
    $$('img[data-i]').forEach((im) => { im.src = `/media/${im.dataset.i}.${lang}.webp`; im.alt = im.dataset.alt ? T(im.dataset.alt) : ''; });
    $$('canvas[data-alt]').forEach((c) => c.setAttribute('aria-label', T(c.dataset.alt)));
    $$('[data-close]').forEach((b) => b.setAttribute('aria-label', T('close')));
    $$('#rss-link').forEach((a) => { a.href = `/log/feed.${lang}.xml`; });
    const h = $('#h1');
    if (h) { const v = ['a', 'b', 'c'].includes(q.get('h')) ? q.get('h') : 'a'; h.textContent = T('h1_' + v); }
    if (page === 'home') document.title = T('title');
    else {
      const t = $('main h1');
      if (t && t.textContent) document.title = `${t.textContent} — RLSOK`;
    }
    render();
  }
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('rlsok.lang', lang); } catch (e) { /* ignore */ }
    apply();
  }));

  // ------------------------------------------------------------------ download buttons, phone sharing, follow dialog
  function dlUrl() { return dl ? dl.windows.url : 'https://github.com/ZqiEE/rlsok-engineering/releases'; }
  function fillDownload() {
    $$('[data-dl]').forEach((a) => {
      a.hidden = mobile;
      if (a.hasAttribute('data-direct') || page !== 'home') a.href = dlUrl();
    });
    $$('[data-share],[data-mobile]').forEach((b) => { b.hidden = !mobile; });
    $$('[data-desktop]').forEach((b) => { b.hidden = mobile; });
    const line = $('#dlline');
    if (line) line.textContent = mobile ? T('dlLinePhone') : windows ? T('dlLine', { mb: mb() }) : T('dlOther');
    const ver = $('#dlver');
    if (ver && dl) ver.textContent = T('dlVer', { v: dl.version, mb: mb() });
    const other = $('#dl-other');
    if (other) other.hidden = windows || mobile;
    const in1 = $('#in1');
    if (in1) in1.textContent = T('in1', { mb: mb() });
    if (dl) {
      $$('[data-sha]').forEach((e) => { e.textContent = dl.windows.sha256; });
      $$('[data-file]').forEach((e) => { e.textContent = dl.windows.file; });
    }
    const su = $('#share-url');
    if (su) su.textContent = dlUrl();
    const mail = $('#mail-self');
    if (mail) mail.href = `mailto:?subject=${encodeURIComponent('RLSOK')}&body=${encodeURIComponent(location.origin + '/download/  ' + dlUrl())}`;
  }
  function openDialog(id) { const d = document.getElementById(id); if (d && d.showModal) d.showModal(); }
  $$('[data-follow]').forEach((b) => b.addEventListener('click', () => openDialog('dlg-follow')));
  $$('[data-share]').forEach((b) => b.addEventListener('click', () => openDialog('dlg-share')));
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const text = b.dataset.copy === 'dl' ? `${location.origin}/download/` : location.href;
    try { await navigator.clipboard.writeText(text); b.querySelector('span').textContent = T('copied'); } catch (e) { window.prompt('', text); }
  }));
  $$('[data-sys-share]').forEach((b) => {
    if (!navigator.share) { b.hidden = true; return; }
    b.addEventListener('click', () => navigator.share({ title: 'RLSOK', url: `${location.origin}/download/` }).catch(() => {}));
  });

  // ------------------------------------------------------------------ progress steps (from the dev log)
  function progress() {
    const ol = $('#psteps');
    if (!ol || !log) return;
    ol.replaceChildren(...log.progress.map((s) => {
      const li = el('li', s.state, s[lang]);
      li.appendChild(el('em', null, T({ done: 'stepDone', next: 'stepNext', later: 'stepLater' }[s.state])));
      return li;
    }));
  }

  // ------------------------------------------------------------------ hero video: lazy, starts when visible
  function heroVideo() {
    const v = $('#hero-video');
    if (!v) return;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { v.removeAttribute('autoplay'); v.controls = true; return; }
    const go = () => { v.preload = 'auto'; v.play().catch(() => { v.controls = true; }); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { go(); o.disconnect(); } }).observe(v);
    } else go();
  }

  // ------------------------------------------------------------------ download page: measured table
  function tiTable() {
    const tb = $('#ti tbody');
    if (!tb || !dl || !g1b || !cases) return;
    const t = dl.install_test, up = g1b.rows.find((r) => r.num_envs === g1b.upstream_num_envs);
    const hx = (up.full_run_hours_estimate * 30000 / 10001).toFixed(0);
    const a2 = cases.duck_level2.attempts[1], h2 = a2.reward_curve[a2.reward_curve.length - 1].wall_h.toFixed(1);
    const rows = [[T('ti_circuit'), T('sec', { s: Math.round(t.buck_example_s) }), T('MEASURED')],
      [T('ti_bench'), T('sec', { s: Math.round(t.g1_example_s) }), T('MEASURED')],
      [T('ti_duck'), T('ti_duckv', { h: h2 }), T('MEASURED')],
      [T('ti_g1'), T('ti_g1v', { v: (up.peak_vram_mib / 1024).toFixed(1), s: fmt(Math.round(up.steps_per_s_median)), h: up.full_run_hours_estimate.toFixed(0) }), T('EST')],
      [T('ti_g1x'), T('ti_g1xv', { h: hx }), T('EST')]];
    tb.replaceChildren(...rows.map(([a, b, c]) => { const tr = el('tr'); tr.append(el('td', null, a), el('td', null, b), el('td', 'r', c)); return tr; }));
  }

  // ------------------------------------------------------------------ evidence page: failures + scope
  function failList() {
    const ul = $('#fails');
    if (!ul || !fails) return;
    ul.replaceChildren(...fails.items.map((f) => {
      const li = el('li');
      const d = el('div'); d.append(el('b', null, f[lang].t), el('p', null, f[lang].d));
      li.append(el('span', 'date', f.date), d);
      if (f.case) { const a = el('a', 'linkmore', T('open')); a.href = `/case.html?id=${f.case}`; li.appendChild(a); } else li.appendChild(el('span'));
      return li;
    }));
  }
  let scopeMounted = false;
  const STEP = { design: 'design', simulate: 'simulate', fail: 'fail', revise: 'revise', simulate2: 'simulate', pass: 'pass' };
  let stage = 'design';
  function setStage(k) {
    stage = k;
    const e = $('#stage');
    if (e) { e.textContent = T({ design: 'st_design', simulate: 'st_simulate', fail: 'st_fail2', revise: 'st_revise', simulate2: 'st_simulate', pass: 'st_pass' }[k]); e.dataset.stage = k; }
    $$('.steps li').forEach((li) => li.classList.toggle('on', li.dataset.s === STEP[k]));
  }
  async function scope() {
    const cv = $('#scope');
    if (!cv || !window.RLSOKScope || scopeMounted) return;
    scopeMounted = true;
    try { RLSOKScope.mount(cv, await RLSOKScope.load('/data/r7_wave.json'), { get limit() { return T('limit'); } }, setStage); } catch (e) { /* data missing */ }
  }

  // ------------------------------------------------------------------ dev log page
  function posts() {
    const box = $('#posts');
    if (!box || !log) return;
    box.replaceChildren(...log.entries.map((p) => {
      const a = el('article', 'post'); const x = p[lang];
      a.append(el('div', 'date', p.date), el('h2', null, x.title));
      if (p.media.img) { const im = el('img'); im.src = `/media/${p.media.img}.${lang}.webp`; im.alt = ''; im.loading = 'lazy'; a.appendChild(im); }
      if (p.media.video) { const v = el('video'); v.src = `/media/${p.media.video}.mp4#t=0.5`; v.muted = true; v.controls = true; v.preload = 'metadata'; v.playsInline = true; a.appendChild(v); }
      const three = el('div', 'three');
      [['logDid', x.did], ['logProblem', x.problem], ['logNext', x.next]].forEach(([k, t]) => { const d = el('div'); d.append(el('b', null, T(k)), el('p', null, t)); three.appendChild(d); });
      a.appendChild(three);
      return a;
    }));
  }

  // ------------------------------------------------------------------ case page
  const table = (head, rows, stack = true) => {
    const w = el('div', 'tblwrap'), t = el('table', 'tbl' + (stack ? ' stack' : '')), tr = el('tr');
    head.forEach((h) => tr.appendChild(el('th', null, h))); const th = el('thead'); th.appendChild(tr); t.appendChild(th);
    const tb = el('tbody'); rows.forEach((r) => { const x = el('tr'); r.forEach((c) => { const td = el('td'); if (c instanceof Node) td.appendChild(c); else td.textContent = c; x.appendChild(td); }); tb.appendChild(x); });
    t.appendChild(tb); w.appendChild(t); return w;
  };
  const kv = (items) => { const d = el('div', 'kv'); items.forEach(([b, p]) => { const c = el('div'); c.append(el('b', null, b), el('p', null, p)); d.appendChild(c); }); return d; };
  const figure = (name, alt) => { const f = el('figure', 'fig'); const im = el('img', 'shot'); im.src = `/media/${name}.${lang}.webp`; im.alt = T(alt); im.loading = 'lazy'; f.appendChild(im); return f; };
  const tech = (fill) => { const d = el('details', 'tech'); d.appendChild(el('summary', null, T('techT'))); fill(d); return d; };
  const srcLine = (c) => el('p', 'srcline', `${T('src')}: ${c.source} · ${T('sha')} ${c.sha256}`);
  const head = (root, titleKey, st, lead) => {
    const h = el('h1', null, T(titleKey)); root.appendChild(h);
    const p = el('p'); p.appendChild(pill(st)); root.appendChild(p);
    if (lead) root.appendChild(el('p', 'lead', lead));
    document.title = `${h.textContent} — RLSOK`;
  };
  function renderCase() {
    const root = $('#case');
    if (!root || !cases) return;
    const id = q.get('id') || 'r7';
    root.replaceChildren();
    const c = cases[id];
    if (id === 'bird_r2') {
      head(root, 'birdH', 'sim', T('birdLead'));
      root.appendChild(figure('bird_flight', 'alt_bird'));
      root.appendChild(el('h2', null, T('birdNums')));
      root.appendChild(kv([[T('bn1'), T('bn1d')], [T('bn2'), T('bn2d')], [T('bn3'), T('bn3d')], [T('bn4'), T('bn4d')]]));
      root.appendChild(el('p', 'note', T('eng_twowing_d')));
      root.appendChild(el('p', 'note', T('eng_att_d')));
      const a = el('a', 'btn', T('birdPkg')); a.href = dl && dl.bird_r1 ? dl.bird_r1.url : 'https://github.com/ZqiEE/rlsok-engineering/releases'; root.appendChild(a);
      const fl = (fails ? fails.items.filter((f) => f.case === 'bird_r2') : []);
      if (fl.length) {
        root.appendChild(el('h2', null, T('failT')));
        const ul = el('ul', 'plain fails');
        fl.forEach((f) => { const li = el('li'); const d = el('div'); d.append(el('b', null, f[lang].t), el('p', null, f[lang].d)); li.append(el('span', 'date', f.date), d, el('span')); ul.appendChild(li); });
        root.appendChild(ul);
      }
      return;
    }
    if (!c) { root.appendChild(el('p', null, '?')); return; }
    if (id === 'duck_level2') {
      head(root, 'c_duck', 'sim', T('duckWhy'));
      root.appendChild(figure('story_duck', 'alt_duck'));
      root.appendChild(el('h2', null, T('attempts')));
      root.appendChild(table(['', T('steps'), T('seedsH'), T('verdictH')], c.attempts.map((a) => [T('attempt', { n: a.attempt }), fmt(a.steps), a.seeds,
        pill(a.label === 'VERIFIED' ? 'sim' : 'fail')])));
      root.appendChild(el('p', 'note', T('duckNote')));
      root.appendChild(tech((d) => {
        c.attempts.forEach((a) => {
          d.appendChild(el('h3', null, `${T('attempt', { n: a.attempt })} · ${T('segH')}`));
          d.appendChild(table(['', T('official'), T('trained'), T('lim'), T('verdictH')], a.segments.map((s) => [s.segment, s.official.toFixed(3),
            s.trained == null ? '—' : s.trained.toFixed(3), s.limit.toFixed(3), pill(s.pass ? 'sim' : 'fail')])));
          d.appendChild(el('p', 'srcline', `DR ${a.dr} · ${T('src')}: ${a.source} · ${T('sha')} ${a.sha256}`));
        });
      }));
      return;
    }
    if (id === 'g1_level1') {
      head(root, 'c_g1', 'sim', T('c_g1_d'));
      root.appendChild(el('h2', null, T('g1H')));
      root.appendChild(figure('g1_tracking', 'alt_g1'));
      const v = el('video'); v.src = '/media/g1_nominal.mp4#t=0.5'; v.muted = true; v.controls = true; v.preload = 'metadata'; v.playsInline = true;
      const f = el('figure', 'fig'); f.append(v, el('figcaption', null, T('g1Note'))); root.appendChild(f);
      root.appendChild(tech((d) => {
        d.appendChild(table(['', ''], [['max |Δobs|', c.max_obs_diff.toExponential(1)], ['seeds', c.seeds], ...Object.entries(c.dr).map(([k, x]) => [`DR ${k}`, x])], false));
        d.appendChild(srcLine(c));
      }));
      return;
    }
    const report = `/reports/${id}${lang === 'en' ? '.en' : ''}.html`;
    if (id === 'r4') {
      head(root, 'c_r4', 'fail', T('c_r4_d'));
      root.appendChild(figure('story_r4', 'alt_r4'));
      root.appendChild(kv([[T('energy'), `${c.energy.p_in_max_W} W < ${c.energy.p_load_min_W} W`], [T('measured'), `${c.round1.input_current_A.toFixed(2)} A > ${c.round1.limit_A} A`]]));
    } else {
      head(root, 'c_r7', 'sim', T('c_r7_d'));
      root.appendChild(figure('story_r7', 'alt_r7'));
      root.appendChild(kv([[T('tolerance'), c.final_tolerance], [T('failCase'), `${c.fail_case.vout_min.toFixed(3)} V < ${c.fail_case.limit} V`]]));
      root.appendChild(el('p', 'note', T('idealWhy')));
    }
    const rq = el('div'); rq.append(el('p', 'lbl', T('req')), el('p', 'quote allow-mixed', c.requirement)); root.appendChild(rq);
    const rounds = id === 'r4' ? [{ round: 1, status: c.round1.status, reason: c.round1.reason }, { round: 2, status: c.round2.status, reason: c.round2.reason, diagnosis: c.round2.diagnosis }] : c.rounds;
    rounds.forEach((rd) => {
      const r = el('div', 'round'); const h3 = el('h3', null, T('round', { n: rd.round })); h3.appendChild(pill(rd.status === 'PASS' ? 'sim' : 'fail')); r.appendChild(h3);
      [['reason', rd.reason], ['diagnosis', rd.diagnosis], ['changes', rd.changes]].forEach(([k, v]) => { if (v) r.append(el('p', 'lbl', T(k)), el('p', 'quote allow-mixed', v)); });
      root.appendChild(r);
    });
    const a = el('a', 'btn', T('report')); a.href = report; root.appendChild(a);
    root.appendChild(tech((d) => d.appendChild(srcLine(c))));
  }

  render = function () {
    fillDownload(); progress(); tiTable(); failList(); posts(); renderCase();
    if (page === 'evidence') { scope(); setStage(stage); }
  };

  apply();
  heroVideo();
  (async () => {
    [dl, cases, log, fails, g1b] = await Promise.all([getJSON('/data/download.json'), getJSON('/data/cases.json'), getJSON('/data/log.json'),
      getJSON('/data/failures.json'), getJSON('/data/g1_bench.json')]);
    render();
  })();
})();
