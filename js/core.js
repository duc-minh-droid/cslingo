/* Shared helpers: DOM, randomness, charts, predict widgets, landscapes, TSP data. */
window.NIC = (function () {
  const modules = [];
  const register = (m) => modules.push(m);

  // ---------- DOM ----------
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Randomness ----------
  const rnd = Math.random;
  const randint = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const choice = (arr) => arr[Math.floor(rnd() * arr.length)];
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = (x, d = 2) => (Number.isInteger(x) ? String(x) : x.toFixed(d));

  // ---------- Canvas ----------
  function setupCanvas(canvas, height) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = height || canvas.clientHeight || 240;
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const COLORS = {};
  function colors() {
    if (!COLORS.teal) ["teal", "rose", "violet", "amber", "blue", "text", "text-dim", "text-faint", "line", "line-2", "bg-2", "panel", "panel-2"].forEach((k) => (COLORS[k.replace("-", "_")] = css("--" + k)));
    return COLORS;
  }

  function lineChart(canvas, opts) {
    const C = colors();
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 220);
    const pad = { l: 44, r: 14, t: 14, b: 28 };
    const series = opts.series.filter((s) => s.data.length);
    let n = Math.max(2, ...series.map((s) => s.data.length));
    if (opts.xMax) n = Math.max(n, opts.xMax);
    let lo = opts.yMin, hi = opts.yMax;
    const all = series.flatMap((s) => s.data).filter((v) => Number.isFinite(v));
    if (lo === undefined) lo = all.length ? Math.min(...all) : 0;
    if (hi === undefined) hi = all.length ? Math.max(...all) : 1;
    if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
    const X = (i) => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b);
    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px " + css("--mono");
    ctx.strokeStyle = C.line; ctx.fillStyle = C.text_faint; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const v = lo + ((hi - lo) * k) / 4, y = Y(v);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(fmt(+v.toFixed(2)), pad.l - 6, y + 4);
    }
    ctx.textAlign = "left";
    if (opts.xLabel) ctx.fillText(opts.xLabel, pad.l, h - 8);
    ctx.textAlign = "right"; ctx.fillText(String(n - 1), w - pad.r, h - 8);
    series.forEach((s) => {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      s.data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.stroke(); ctx.setLineDash([]);
      if (s.dots) s.data.forEach((v, i) => { ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(X(i), Y(v), 3, 0, 7); ctx.fill(); });
    });
  }

  function barChart(canvas, opts) {
    const C = colors();
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 200);
    const pad = { l: 40, r: 10, t: 12, b: opts.labels ? 26 : 12 };
    const groups = opts.groups; // [{values:[...], color}]
    const n = groups[0].values.length;
    const hi = opts.yMax || Math.max(1e-9, ...groups.flatMap((g) => g.values));
    const bw = (w - pad.l - pad.r) / n;
    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px " + css("--mono");
    ctx.strokeStyle = C.line; ctx.fillStyle = C.text_faint;
    for (let k = 0; k <= 4; k++) {
      const y = pad.t + (1 - k / 4) * (h - pad.t - pad.b);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText((hi * k / 4).toFixed(opts.decimals ?? 2), pad.l - 5, y + 4);
    }
    const gw = (bw * 0.78) / groups.length;
    groups.forEach((g, gi) => {
      g.values.forEach((v, i) => {
        const bh = (v / hi) * (h - pad.t - pad.b);
        ctx.fillStyle = typeof g.color === "function" ? g.color(i) : g.color;
        const x = pad.l + i * bw + bw * 0.11 + gi * gw;
        roundRect(ctx, x, h - pad.b - bh, Math.max(1, gw - 1), bh, Math.min(4, gw / 3));
        ctx.fill();
      });
    });
    if (opts.labels) {
      ctx.fillStyle = C.text_faint; ctx.textAlign = "center";
      const every = Math.ceil(n / 24);
      opts.labels.forEach((lb, i) => { if (i % every === 0) ctx.fillText(lb, pad.l + i * bw + bw / 2, h - 8); });
    }
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, h / 2, w / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // ---------- Progress (predictions + visited) ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  };
  function updateScore() {
    const s = store.get("nic.predict", {});
    const vals = Object.values(s);
    const node = qs("#scoreVal");
    if (!node) return;
    const right = vals.filter(Boolean).length;
    node.innerHTML = `<span id="scoreRight">${node.dataset.r ?? right}</span> / ${vals.length}`;
    if (window.NIC && NIC.fx) NIC.fx.count(qs("#scoreRight"), right, { from: +(node.dataset.r ?? right) });
    node.dataset.r = right;
  }

  /** Predict-first widget. opts: {id, q, opts:[...], a: index, why: html} */
  function predict(opts) {
    const node = el(`<div class="card predict">
      <div class="card-head"><span class="tag violet">Predict first</span></div>
      <div class="q">${opts.q}</div>
      <div class="opts">${opts.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="opt-l">${String.fromCharCode(65 + i)}</span><span>${o}</span></button>`).join("")}</div>
      <div class="explain"></div></div>`);
    const saved = store.get("nic.predict", {});
    const reveal = (pick, first) => {
      node.classList.add("answered");
      qsa(".opt", node).forEach((b, i) => {
        b.disabled = true;
        if (i === opts.a) b.classList.add("right");
        else if (i === pick) b.classList.add("wrong");
      });
      const ok = pick === opts.a;
      const ex = qs(".explain", node);
      NIC.feedback(ex, ok ? "ok" : "no", `<span class="verdict ${ok ? "ok" : "no"}">${ok ? "Correct!" : pick === -1 ? "Answer:" : "Not quite."}</span>${opts.why}`, first);
      if (first) {
        const s = store.get("nic.predict", {}); s[opts.id] = ok; store.set("nic.predict", s); updateScore();
        const fx = window.NIC && NIC.fx;
        if (fx) { fx.reveal(ex); ok ? fx.pop(qsa(".opt", node)[opts.a]) : fx.shake(qsa(".opt", node)[pick]); }
      }
    };
    if (opts.id in saved) reveal(saved[opts.id] ? opts.a : -1, false);
    qsa(".opt", node).forEach((b) => b.addEventListener("click", () => reveal(+b.dataset.i, true)));
    node.__opts = opts; // the lesson player lifts predicts out of the page and asks them as questions
    return node;
  }

  /**
   * Step-by-step lesson. def.steps = [{t, b, v?, c?}] where
   *   t = title, b = body html, v = visual (html string or fn(container, life)), c = {q, o:[...], a, why}
   * A step with a check needs an answer before "Next" unlocks.
   */
  function lesson(id, def, life, onFinish) {
    const steps = def.steps, pos = store.get("nic.lessonPos", {});
    const answered = {}, tries = {};
    let i = Math.min(pos[id] || 0, steps.length - 1), seen = Math.max(i, store.get("nic.lessonSeen", {})[id] || 0);
    const node = el(`<div class="card lesson" id="learn"><div class="lesson-top"><span class="tag teal">Learn it step by step</span><button class="lesson-x" data-nav="restart" aria-label="Back to step 1" title="Back to step 1"><svg viewBox="0 0 16 16"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 2.5v2.5h2.5"/></svg></button>
      <div class="lesson-dots">${steps.map((s, k) => `<button aria-label="Step ${k + 1}: ${esc(s.t.replace(/<[^>]+>/g, ""))}" data-k="${k}"><i></i></button>`).join("")}</div><span class="lesson-count"></span></div>
      <div class="lesson-stage" aria-live="polite"></div>
      <div class="lesson-nav"><button class="btn ghost" data-nav="back">Back</button><span class="lesson-kbd faint"><kbd>←</kbd> <kbd>→</kbd> keys work too</span><button class="btn primary" data-nav="next">Continue</button></div></div>`);
    const stage = qs(".lesson-stage", node), next = qs('[data-nav="next"]', node), back = qs('[data-nav="back"]', node);
    const fx = () => window.NIC && NIC.fx;
    function show(dir) {
      const s = steps[i];
      seen = Math.max(seen, i);
      pos[id] = i; store.set("nic.lessonPos", pos);
      const sn = store.get("nic.lessonSeen", {}); sn[id] = Math.max(sn[id] || 0, seen); store.set("nic.lessonSeen", sn);
      if (i === steps.length - 1) { const d = store.get("nic.lessonDone", {}); if (!d[id]) { d[id] = true; store.set("nic.lessonDone", d); window.dispatchEvent(new Event("nic:progress")); } }
      stage.innerHTML = `<div class="lesson-step-n">Step ${i + 1}</div><h2 class="lesson-title">${s.t}</h2><div class="lesson-body">${s.b}</div><div class="lesson-visual"></div>${s.c ? `<div class="lesson-check"><div class="q">${s.c.q}</div><div class="opts">${s.c.o.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join("")}</div><div class="why"></div></div>` : ""}`;
      const vis = qs(".lesson-visual", stage);
      if (typeof s.v === "function") s.v(vis, life); else if (s.v) vis.innerHTML = s.v;
      if (s.c) {
        const why = qs(".lesson-check .why", stage);
        const finish = (pick) => {
          qsa(".lesson-check .opt", stage).forEach((b, k) => { b.disabled = true; if (k === s.c.a) b.classList.add("right"); });
          const ok = pick === s.c.a;
          NIC.feedback(why, ok ? "ok" : "no", `<b class="verdict ${ok ? "ok" : "no"}">${ok ? (tries[i] ? "Got it." : ["Yes!", "Nice!", "Spot on!", "Exactly!"][i % 4]) : "Here's the answer:"}</b> ${s.c.why}`);
          answered[i] = true; updNav();
          if (fx()) { fx().reveal(why); if (pick === s.c.a) fx().pop(qsa(".lesson-check .opt", stage)[s.c.a]); }
        };
        qsa(".lesson-check .opt", stage).forEach((b) => b.addEventListener("click", () => {
          const k = +b.dataset.k;
          if (k === s.c.a) return finish(k);
          // wrong: let them try once more before revealing — retrieval beats being told
          tries[i] = (tries[i] || 0) + 1;
          b.classList.add("wrong"); b.disabled = true;
          if (fx()) fx().shake(b);
          if (tries[i] >= 2 || s.c.o.length <= 2) return finish(k);
          NIC.feedback(why, "retry", `<b class="verdict no">Not quite</b> — have another go.`);
          if (fx()) fx().reveal(why);
        }));
      }
      qsa(".lesson-dots button", node).forEach((d, k) => { d.classList.toggle("cur", k === i); d.classList.toggle("seen", k <= seen && k !== i); d.disabled = k > seen; });
      qs(".lesson-count", node).textContent = `${i + 1} / ${steps.length}`;
      updNav();
      if (dir && fx()) fx().step(stage, dir);
      if (window.NIC && NIC.fx) NIC.fx.play(vis);
    }
    function updNav() {
      const locked = steps[i].c && !answered[i];
      back.disabled = i === 0;
      next.disabled = !!locked;
      next.classList.toggle("finish", !locked && i === steps.length - 1);
      next.textContent = locked ? "Answer to continue" : i === steps.length - 1 ? "Try it yourself" : "Continue";
    }
    const go = (d, animate = true) => {
      if (d > 0) {
        if (steps[i].c && !answered[i]) return;
        if (i < steps.length - 1) { i++; show(animate ? 1 : 0); if (NIC.sfx) NIC.sfx.play("step"); }
        else { if (fx()) fx().celebrate(next, { big: true }); if (onFinish) onFinish(); }
      } else if (i > 0) { i--; show(animate ? -1 : 0); if (NIC.sfx) NIC.sfx.play("back"); }
    };
    next.addEventListener("click", () => go(1));
    qs('[data-nav="restart"]', node).addEventListener("click", () => { if (i) { i = 0; show(-1); } });
    back.addEventListener("click", () => go(-1));
    qsa(".lesson-dots button", node).forEach((d) => d.addEventListener("click", () => { const k = +d.dataset.k; if (k <= seen && k !== i) { const dir = k > i ? 1 : -1; i = k; show(dir); } }));
    // Keyboard: ←/→ step through when the lesson is on screen. Keyboard actions never animate.
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test((e.target.tagName || ""))) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = node.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight - 80) return;
      e.preventDefault();
      if (e.key === "ArrowRight" && i === steps.length - 1) return;
      go(e.key === "ArrowRight" ? 1 : -1, false);
    };
    document.addEventListener("keydown", onKey);
    if (life && life.onCleanup) life.onCleanup(() => document.removeEventListener("keydown", onKey));
    show(0);
    return node;
  }

  /** "What to do" checklist — tick each item off as you do it in the playground. */
  function guide(items) {
    const node = el(`<div class="card guide" id="try"><div class="card-head"><span class="tag amber">What to do below</span><span class="faint guide-count"></span></div>
      <ol class="guide-list">${items.map((t, k) => `<li><button class="guide-item" data-k="${k}" aria-pressed="false"><span class="gi-box" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></span><span class="gi-n">${k + 1}</span><span class="gi-t">${t}</span></button></li>`).join("")}</ol></div>`);
    const upd = () => { const n = qsa(".guide-item.done", node).length; qs(".guide-count", node).textContent = n ? `${n} of ${items.length} done` : "tick them off as you go"; };
    qsa(".guide-item", node).forEach((b) => b.addEventListener("click", (e) => {
      if (e.target.closest("a, code")) return;
      const on = !b.classList.contains("done");
      b.classList.toggle("done", on); b.setAttribute("aria-pressed", on);
      if (on && window.NIC && NIC.fx) NIC.fx.pop(qs(".gi-box", b));
      if (NIC.sfx) NIC.sfx.play(on ? "check" : "uncheck");
      upd();
      if (on && qsa(".guide-item.done", node).length === items.length) { if (NIC.fx) NIC.fx.celebrate(qs(".guide-count", node)); node.dispatchEvent(new CustomEvent("nic:guide-done", { bubbles: true })); }
    }));
    upd();
    return node;
  }

  function takeaways(items, sayIt) {
    return el(`<div class="card takeaways" id="recap"><div class="card-head"><span class="tag teal">Takeaways</span></div>
      <ul class="tk-list">${items.map((t) => `<li>${t}</li>`).join("")}</ul>
      ${sayIt ? `<div class="say-it"><span class="say-lbl">Say it out loud</span><b>${sayIt}</b></div>` : ""}</div>`);
  }

  function header(mod, lede) {
    const unit = (window.NIC && NIC.unitName && NIC.unitName(mod)) || "Lecture";
    return el(`<header class="mod-head"><div class="kicker">${unit} ${mod.lecture} · ${mod.num}</div><h1>${mod.title}</h1><p class="lede">${lede}</p></header>`);
  }

  /** Lifecycle helper: timers and rAF loops cleaned automatically when the route changes. */
  function lifecycle() {
    const timers = new Set(), frames = new Set(), cleanups = [];
    return {
      interval(fn, ms) { const id = setInterval(fn, ms); timers.add(id); return () => { clearInterval(id); timers.delete(id); }; },
      timeout(fn, ms) { const id = setTimeout(fn, ms); timers.add(id); return id; },
      frame(fn) { const id = requestAnimationFrame((t) => { frames.delete(id); fn(t); }); frames.add(id); return id; },
      onCleanup(fn) { cleanups.push(fn); },
      onResize(fn) { window.addEventListener("nic:resize", fn); cleanups.push(() => window.removeEventListener("nic:resize", fn)); },
      dispose() { timers.forEach((id) => { clearInterval(id); clearTimeout(id); }); frames.forEach(cancelAnimationFrame); cleanups.forEach((f) => f()); },
    };
  }

  function slider(label, min, max, step, value, fmtFn = (v) => v) {
    const node = el(`<label class="field">${label}<input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output>${fmtFn(value)}</output></label>`);
    const input = qs("input", node), out = qs("output", node);
    input.addEventListener("input", () => (out.textContent = fmtFn(+input.value)));
    Object.defineProperty(node, "value", { get: () => +input.value, set: (v) => { input.value = v; out.textContent = fmtFn(+v); } });
    node.onInput = (fn) => input.addEventListener("input", () => fn(+input.value));
    return node;
  }

  function seg(options, value, onChange) {
    const node = el(`<div class="seg">${options.map(([v, l]) => `<button data-v="${v}" class="${v === value ? "on" : ""}">${l}</button>`).join("")}</div>`);
    qsa("button", node).forEach((b) => b.addEventListener("click", () => {
      qsa("button", node).forEach((x) => x.classList.toggle("on", x === b));
      onChange(b.dataset.v);
    }));
    return node;
  }

  // ---------- 1-D fitness landscapes (discretised, N points, maximise) ----------
  const LAND_N = 240;
  const bump = (x, c, w, hgt) => hgt * Math.exp(-((x - c) ** 2) / (2 * w * w));
  const LANDSCAPES = {
    unimodal: { name: "Unimodal", f: (x) => bump(x, 0.62, 0.2, 1) },
    multimodal: { name: "Multimodal", f: (x) => 0.1 + bump(x, 0.12, 0.04, 0.45) + bump(x, 0.3, 0.05, 0.62) + bump(x, 0.5, 0.035, 0.5) + bump(x, 0.7, 0.045, 1) + bump(x, 0.88, 0.04, 0.72) + 0.04 * Math.sin(x * 60) },
    plateau: { name: "Plateau", f: (x) => (x < 0.55 ? 0.28 : 0.28 + bump(x, 0.8, 0.07, 0.72) * 1) },
    deceptive: { name: "Deceptive", f: (x) => (x < 0.86 ? 0.8 * (1 - x / 0.86) + 0.05 : 0.05 + ((x - 0.86) / 0.14) * 0.95) },
    random: { name: "Random", f: null },
  };
  function makeLandscape(kind) {
    const vals = new Array(LAND_N);
    for (let i = 0; i < LAND_N; i++) vals[i] = kind === "random" ? rnd() : LANDSCAPES[kind].f(i / (LAND_N - 1));
    const max = Math.max(...vals);
    const best = vals.indexOf(max);
    return { kind, vals, N: LAND_N, max, best, f: (i) => vals[i] };
  }
  function drawLandscape(ctx, w, h, L, opts = {}) {
    const C = colors();
    const pad = { l: 10, r: 10, t: 16, b: 18 };
    const X = (i) => pad.l + (i / (L.N - 1)) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - v / (L.max * 1.08)) * (h - pad.t - pad.b);
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, pad.t, 0, h);
    grad.addColorStop(0, "rgba(88,204,2,0.22)"); grad.addColorStop(1, "rgba(88,204,2,0.01)");
    ctx.beginPath(); ctx.moveTo(X(0), h - pad.b);
    L.vals.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
    ctx.lineTo(X(L.N - 1), h - pad.b); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); L.vals.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.strokeStyle = C.teal; ctx.lineWidth = L.kind === "random" ? 1 : 2; ctx.stroke();
    // global optimum marker
    ctx.fillStyle = C.amber; ctx.font = "11px " + css("--mono"); ctx.textAlign = "center";
    ctx.fillText("★ global", X(L.best), Y(L.max) - 5);
    ctx.fillStyle = C.text_faint; ctx.textAlign = "left";
    ctx.fillText("candidate solutions s ∈ S →", pad.l, h - 4);
    return { X, Y };
  }

  // ---------- TSP from the lecture ----------
  const TSP = {
    cities: ["A", "B", "C", "D", "E"],
    D: {
      A: { B: 5, C: 7, D: 4, E: 15 }, B: { A: 5, C: 3, D: 4, E: 10 }, C: { A: 7, B: 3, D: 2, E: 7 },
      D: { A: 4, B: 4, C: 2, E: 9 }, E: { A: 15, B: 10, C: 7, D: 9 },
    },
    pos: { A: [90, 190], B: [215, 70], C: [345, 150], D: [220, 250], E: [470, 270] },
    len(t) { let s = 0; for (let i = 0; i < t.length; i++) s += this.D[t[i]][t[(i + 1) % t.length]]; return s; },
    /** Adjacent swap, treating the tour as a ring (position k-1 is adjacent to 0), as in the lecture. */
    swap(t, i) { const a = t.split(""); const j = (i + 1) % a.length; [a[i], a[j]] = [a[j], a[i]]; return a.join(""); },
    neighbours(t) { return t.split("").map((_, i) => this.swap(t, i)); },
  };

  function tspSVG(tour, opts = {}) {
    const P = TSP.pos, D = TSP.D;
    const edges = [];
    if (opts.allEdges) TSP.cities.forEach((a, i) => TSP.cities.slice(i + 1).forEach((b) => edges.push(`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--line-2)" stroke-width="1" />
        <text x="${(P[a][0] + P[b][0]) / 2}" y="${(P[a][1] + P[b][1]) / 2 - 4}" fill="var(--text-faint)" font-size="11" text-anchor="middle" font-family="var(--mono)">${D[a][b]}</text>`)));
    const t = tour || "";
    const path = [];
    const closed = opts.open ? t.length - 1 : t.length;
    for (let i = 0; i < closed && t.length > 1; i++) {
      const a = t[i], b = t[(i + 1) % t.length];
      const hl = opts.highlight && opts.highlight.includes(i);
      path.push(`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="${hl ? "var(--violet)" : opts.color || "var(--teal)"}" stroke-width="${hl ? 4 : 3}" stroke-linecap="round" />
        <text x="${(P[a][0] + P[b][0]) / 2 + 6}" y="${(P[a][1] + P[b][1]) / 2 + 14}" fill="var(--text)" font-size="12" font-weight="600" text-anchor="middle" font-family="var(--mono)">${D[a][b]}</text>`);
    }
    const nodes = TSP.cities.map((c) => {
      const idx = t.indexOf(c);
      const on = idx >= 0;
      return `<g class="city" data-c="${c}" style="cursor:${opts.clickable ? "pointer" : "default"}">
        <circle cx="${P[c][0]}" cy="${P[c][1]}" r="19" fill="${on ? "var(--panel-2)" : "var(--bg-2)"}" stroke="${idx === 0 ? "var(--amber)" : on ? "var(--teal)" : "var(--line-2)"}" stroke-width="2.5" />
        <text x="${P[c][0]}" y="${P[c][1] + 5}" fill="var(--text)" font-size="15" font-weight="700" text-anchor="middle">${c}</text>
        ${on && opts.order ? `<text x="${P[c][0] + 18}" y="${P[c][1] - 16}" fill="var(--amber)" font-size="11" font-family="var(--mono)">${idx + 1}</text>` : ""}
      </g>`;
    });
    return `<svg class="viz" viewBox="0 0 560 320" style="max-height:${opts.maxH || 320}px">${edges.join("")}${path.join("")}${nodes.join("")}</svg>`;
  }

  function matrixHTML(hlPairs = []) {
    const c = TSP.cities;
    const isHl = (a, b) => hlPairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    return `<table class="t matrix"><tr><th></th>${c.map((x) => `<th>${x}</th>`).join("")}</tr>${c.map((a) => `<tr><th>${a}</th>${c.map((b) => a === b ? `<td class="faint">–</td>` : `<td class="${isHl(a, b) ? "hl" : ""}">${TSP.D[a][b]}</td>`).join("")}</tr>`).join("")}</table>`;
  }

  // ---------- Lazy vendor loading (plain <script>/<link> tags, so it works over file:// too) ----------
  const base = (document.currentScript && document.currentScript.src.replace(/js\/core\.js.*$/, "")) || "";
  const loading = {};
  /** Load vendor scripts/styles once, in order. lazy("vendor/three.min.js") → Promise. */
  function lazy(...srcs) {
    return srcs.reduce((p, src) => p.then(() => loading[src] || (loading[src] = new Promise((ok, bad) => {
      const css = src.endsWith(".css"), t = document.createElement(css ? "link" : "script");
      if (css) { t.rel = "stylesheet"; t.href = base + src; } else { t.src = base + src; }
      t.onload = () => ok(); t.onerror = () => { delete loading[src]; bad(new Error("failed to load " + src)); };
      document.head.appendChild(t);
    }))), Promise.resolve());
  }

  /** Typeset $…$ (inline) and $$…$$ (display) maths inside root with KaTeX. Loads KaTeX on first use. */
  const HAS_TEX = /\$\$[\s\S]+?\$\$|\$[^$\s][^$]*?\$/;
  function tex(root) {
    if (!root || !HAS_TEX.test(root.textContent)) return Promise.resolve(false);
    return lazy("vendor/katex/katex.min.css", "vendor/katex/katex.min.js", "vendor/katex/auto-render.min.js").then(() => {
      window.renderMathInElement(root, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }], throwOnError: false, ignoredClasses: ["katex"] });
      return true;
    }).catch(() => false);
  }
  // Typeset anything added to the page later (lesson screens, feedback sheets, the guidebook…), like emoji.js does.
  {
    let q = new Set(), pend = false;
    const flush = () => { pend = false; const s = q; q = new Set(); s.forEach((n) => n.isConnected && !n.closest(".katex") && tex(n)); };
    const start = () => new MutationObserver((recs) => {
      recs.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 1 && HAS_TEX.test(n.textContent)) q.add(n); else if (n.nodeType === 3 && n.parentElement && HAS_TEX.test(n.nodeValue)) q.add(n.parentElement); }));
      if (q.size && !pend) { pend = true; setTimeout(flush, 0); }
    }).observe(document.body, { childList: true, subtree: true });
    document.body ? start() : document.addEventListener("DOMContentLoaded", start);
  }
  /** One maths string → HTML (sync once KaTeX is loaded; falls back to the raw text before that). */
  const texStr = (s, display = false) => (window.katex ? window.katex.renderToString(s, { throwOnError: false, displayMode: display }) : esc(s));

  return {
    lazy, tex, texStr,
    modules, register, qs, qsa, el, esc, rnd, randint, choice, shuffle, gauss, clamp, fmt,
    setupCanvas, colors, lineChart, barChart, roundRect, store, updateScore, predict, lesson, guide, takeaways, LESSONS: {}, header, lifecycle,
    slider, seg, LANDSCAPES, makeLandscape, drawLandscape, TSP, tspSVG, matrixHTML,
  };
})();
