/* Shared helpers: DOM, randomness, charts, predict widgets, landscapes, TSP data. */
window.NIC = window.NIC || { shared: {} };
(function () {
  const core = (NIC.shared.engineCore = NIC.shared.engineCore || {});

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
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

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
    let u = 0,
      v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = (x, d = 2) => (Number.isInteger(x) ? String(x) : x.toFixed(d));

  // ---------- Canvas ----------
  function setupCanvas(canvas, height) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth : 0); // detached (screen already left): 0, callers skip drawing
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
    if (COLORS._t !== document.documentElement.dataset.themeNow) {
      Object.keys(COLORS).forEach((k) => delete COLORS[k]);
      COLORS._t = document.documentElement.dataset.themeNow;
    }
    if (!COLORS.teal)
      [
        "teal",
        "rose",
        "violet",
        "amber",
        "blue",
        "text",
        "text-dim",
        "text-faint",
        "line",
        "line-2",
        "bg-2",
        "panel",
        "panel-2",
      ].forEach((k) => (COLORS[k.replace("-", "_")] = css("--" + k)));
    return COLORS;
  }

  function lineChart(canvas, opts) {
    const C = colors();
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 220);
    const pad = { l: 44, r: 14, t: 14, b: 28 };
    const series = opts.series.filter((s) => s.data.length);
    let n = Math.max(2, ...series.map((s) => s.data.length));
    if (opts.xMax) n = Math.max(n, opts.xMax);
    let lo = opts.yMin,
      hi = opts.yMax;
    const all = series.flatMap((s) => s.data).filter((v) => Number.isFinite(v));
    if (lo === undefined) lo = all.length ? Math.min(...all) : 0;
    if (hi === undefined) hi = all.length ? Math.max(...all) : 1;
    if (hi - lo < 1e-9) {
      hi += 1;
      lo -= 1;
    }
    const X = (i) => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b);
    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px " + css("--mono");
    ctx.strokeStyle = C.line;
    ctx.fillStyle = C.text_faint;
    ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const v = lo + ((hi - lo) * k) / 4,
        y = Y(v);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(fmt(+v.toFixed(2)), pad.l - 6, y + 4);
    }
    ctx.textAlign = "left";
    if (opts.xLabel) ctx.fillText(opts.xLabel, pad.l, h - 8);
    ctx.textAlign = "right";
    ctx.fillText(String(n - 1), w - pad.r, h - 8);
    series.forEach((s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width || 2;
      ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      s.data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.stroke();
      ctx.setLineDash([]);
      if (s.dots)
        s.data.forEach((v, i) => {
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(X(i), Y(v), 3, 0, 7);
          ctx.fill();
        });
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
    ctx.strokeStyle = C.line;
    ctx.fillStyle = C.text_faint;
    for (let k = 0; k <= 4; k++) {
      const y = pad.t + (1 - k / 4) * (h - pad.t - pad.b);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(((hi * k) / 4).toFixed(opts.decimals ?? 2), pad.l - 5, y + 4);
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
      ctx.fillStyle = C.text_faint;
      ctx.textAlign = "center";
      const every = Math.ceil(n / 24);
      opts.labels.forEach((lb, i) => {
        if (i % every === 0) ctx.fillText(lb, pad.l + i * bw + bw / 2, h - 8);
      });
    }
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, h / 2, w / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  Object.assign(core, {
    barChart,
    choice,
    clamp,
    colors,
    css,
    el,
    esc,
    fmt,
    gauss,
    lineChart,
    modules,
    qs,
    qsa,
    randint,
    register,
    roundRect,
    setupCanvas,
    shuffle,
  });
})();
