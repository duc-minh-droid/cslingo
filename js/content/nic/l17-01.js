/* l17-01: Lecture 17 (spiking neural networks): shared kernel (spike coding, the leaky neuron, spike propagation, STDP, the surrogate slope), the step figures and the three demos. The lessons are in l17-02.js and l17-03.js; the workshop in l17-workshop.js. Running example: Pip, a palm-sized garden rover on a coin battery. */
(function () {
  const N = NIC;
  const { el, qs } = N;
  const sh = (NIC.shared.nicL17 = NIC.shared.nicL17 || {});

  /** Quick check and predict builders. Spec: "question | right answer | wrong | wrong | why" (the engine shuffles the order). */
  const parts = (spec) => {
    const x = spec.split(" | ");
    return { q: x[0], opts: x.slice(1, -1), why: x[x.length - 1] };
  };
  const C = (spec) => {
    const { q, opts, why } = parts(spec);
    return { q, o: opts, a: 0, why };
  };
  const pr = (id, spec) => N.predict((({ q, opts, why }) => ({ id, q, opts, a: 0, why }))(parts(spec)));

  // ---------- kernel ----------
  const T = 20;
  /** Spike coding of a strength 0..10 over T steps. Rate: n evenly spaced spikes. Temporal: one spike, earlier when stronger. */
  function encode(s, code) {
    if (code === "rate")
      return Array.from({ length: T }, (_, t) => Math.floor(((t + 1) * s) / T) > Math.floor((t * s) / T));
    const first = s > 0 ? T - 1 - Math.round((s / 10) * (T - 2)) : -1;
    return Array.from({ length: T }, (_, t) => t === first);
  }
  /** Population code: five neurons, each tuned to a band of strengths; the ones near s fire (rate falls off with distance). */
  const POP = [0, 2.5, 5, 7.5, 10];
  const popCode = (s) => POP.map((c) => encode(Math.max(0, Math.round(6 - 1.6 * Math.abs(s - c))), "rate"));
  /** Leaky neuron: charge v gains I each step and loses a share `leak`; at v >= th it fires and resets to 0. */
  function lif(I, leak, th = 1, n = T) {
    let v = 0;
    const V = [],
      S = [];
    for (let t = 0; t < n; t++) {
      v = +(v * (1 - leak) + I).toFixed(6);
      const f = v >= th;
      V.push(Math.min(v, th));
      S.push(f);
      if (f) v = 0;
    }
    return { V, S, n: S.filter(Boolean).length };
  }
  /** Spike propagation: inputs A, B; A feeds A1, A2 and B feeds B1, B2 (one step later); all four feed O (threshold 3, one step later). */
  function propagate(A, B, steps = 6) {
    const on = (arr, t) => !!arr[t];
    const out = [];
    for (let t = 0; t < steps; t++) {
      const hA = t > 0 && on(A, t - 1),
        hB = t > 0 && on(B, t - 1);
      const prevA = t > 1 && on(A, t - 2),
        prevB = t > 1 && on(B, t - 2);
      const o = 2 * prevA + 2 * prevB >= 3;
      out.push({ A: on(A, t), B: on(B, t), A1: hA, A2: hA, B1: hB, B2: hB, O: o, got: 2 * prevA + 2 * prevB });
    }
    return out;
  }
  /** STDP over paired trains: post fires one step after pre: +1 (potentiation); pre fires one step after post: -1 (depression). */
  function stdp(pre, post) {
    let w = 0;
    const log = pre.map(() => 0);
    for (let t = 1; t < pre.length; t++) {
      if (post[t] && pre[t - 1]) ((w += 1), (log[t] += 1));
      if (pre[t] && post[t - 1]) ((w -= 1), (log[t] -= 1));
    }
    return { w, log };
  }
  const sig = (a, k) => 1 / (1 + Math.exp(-k * a));
  /** Slope of the surrogate: k * s(1 - s), a bell centred on a = 0 whose peak is k / 4. */
  const slope = (a, k) => k * sig(a, k) * (1 - sig(a, k));

  // ---------- drawing ----------
  /** Spike raster. rows: [{lab, s: [bool], c}] */
  function raster(rows, { lab = "", hi = -1 } = {}) {
    const n = rows[0].s.length,
      L = 92,
      W = 520,
      dx = (W - L - 10) / n,
      rh = 34;
    const H = rows.length * rh + 22;
    const body = rows
      .map((r, i) => {
        const y = i * rh + 8;
        const ticks = r.s
          .map((f, t) =>
            f
              ? `<rect class="fi" x="${(L + t * dx + dx * 0.3).toFixed(1)}" y="${y + 3}" width="${(dx * 0.4).toFixed(1)}" height="${rh - 12}" rx="2" fill="var(--${r.c || "amber"})"/>`
              : "",
          )
          .join("");
        return `<text x="4" y="${y + rh / 2 + 1}" class="nw17-lab">${r.lab}</text><line x1="${L}" y1="${y + rh - 8}" x2="${W - 10}" y2="${y + rh - 8}" stroke="var(--line-2)" stroke-width="1.5"/>${ticks}`;
      })
      .join("");
    const hl =
      hi >= 0
        ? `<rect x="${(L + hi * dx).toFixed(1)}" y="2" width="${dx.toFixed(1)}" height="${H - 22}" fill="var(--blue)" fill-opacity=".14"/>`
        : "";
    const says =
      lab ||
      `Spike trains over ${n} time steps. ${rows.map((r) => `${r.lab}: ${r.s.filter(Boolean).length} spikes`).join("; ")}.`;
    return `<svg class="fig nw17-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${says}">${hl}${body}<text x="${W - 10}" y="${H - 4}" class="nw17-lab" text-anchor="end">time →</text></svg>`;
  }
  /** Charge trace of a leaky neuron with the threshold line and spike marks. */
  function trace(R, th = 1) {
    const W = 520,
      H = 190,
      L = 30,
      n = R.V.length,
      dx = (W - L - 10) / n;
    const Y = (v) => (H - 30 - (v / th) * (H - 60)).toFixed(1);
    const pts = R.V.map((v, t) => `${(L + (t + 1) * dx).toFixed(1)},${Y(v)}`);
    const line = `<polyline class="draw" points="${L},${Y(0)} ${pts.join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    const sp = R.S.map((f, t) =>
      f
        ? `<g class="fi"><line x1="${(L + (t + 1) * dx).toFixed(1)}" y1="${Y(th)}" x2="${(L + (t + 1) * dx).toFixed(1)}" y2="8" stroke="var(--amber)" stroke-width="4"/><circle cx="${(L + (t + 1) * dx).toFixed(1)}" cy="8" r="4" fill="var(--amber)"/></g>`
        : "",
    ).join("");
    return `<svg class="fig nw17-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Charge over ${n} steps with the threshold line: ${R.n} spikes."><line x1="${L}" y1="${Y(th)}" x2="${W - 10}" y2="${Y(th)}" stroke="var(--rose)" stroke-dasharray="6 4" stroke-width="2"/><text x="${L + 4}" y="${+Y(th) - 6}" class="nw17-lab">threshold</text><line x1="${L}" y1="${Y(0)}" x2="${W - 10}" y2="${Y(0)}" stroke="var(--line-2)" stroke-width="1.5"/><text x="${L}" y="${H - 8}" class="nw17-lab">charge, time →</text>${line}${sp}</svg>`;
  }
  /** The small network of the propagation figure, with the firing neurons lit at one step. */
  function netSvg(s, t) {
    const P = {
      A: [40, 70],
      B: [40, 170],
      A1: [170, 40],
      A2: [170, 100],
      B1: [170, 140],
      B2: [170, 200],
      O: [300, 120],
    };
    const E = [
      ["A", "A1"],
      ["A", "A2"],
      ["B", "B1"],
      ["B", "B2"],
      ["A1", "O"],
      ["A2", "O"],
      ["B1", "O"],
      ["B2", "O"],
    ];
    const lines = E.map(
      ([a, b]) =>
        `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="${s[a] ? "var(--amber)" : "var(--line-2)"}" stroke-width="${s[a] ? 3 : 2}"/>`,
    ).join("");
    const nodes = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<g class="fi"><circle cx="${x}" cy="${y}" r="17" fill="${s[k] ? "var(--amber)" : "var(--panel-2)"}" stroke="${s[k] ? "var(--amber-ink)" : "var(--line-2)"}" stroke-width="2"/><text x="${x}" y="${y + 5}" class="nw17-node" fill="${s[k] ? "var(--amber-on)" : "var(--text)"}">${k}</text></g>`,
      )
      .join("");
    const lit = Object.keys(P).filter((k) => s[k]);
    return `<svg class="fig nw17-svg" viewBox="0 0 340 240" style="max-height:240px" role="img" aria-label="Step ${t}: ${lit.length ? `${lit.join(", ")} firing` : "nothing firing"}.">${lines}${nodes}</svg>`;
  }
  const stat = (lab, v, c = "") => `<div class="nw17-stat ${c}"><small>${lab}</small><b>${v}</b></div>`;

  // ---------- static step figures ----------
  /** Pip's three sensors feeding one neuron, which answers with its own train (slide 4's picture). */
  function archFig() {
    const ins = [
      { lab: "whisker", s: encode(3, "rate") },
      { lab: "light", s: encode(5, "rate") },
      { lab: "sound", s: encode(2, "rate") },
    ];
    // the neuron sums the three trains with weight 0.5 and a slow leak
    let v = 0;
    const out = ins[0].s.map((_, t) => {
      v = v * 0.9 + 0.5 * ins.reduce((a, r) => a + r.s[t], 0);
      const f = v >= 1;
      if (f) v = 0;
      return f;
    });
    return raster([...ins, { lab: "neuron", s: out, c: "blue" }]);
  }

  /** Propagation stepper: A fires at steps 1 and 3, B at 2 and 3. */
  function propFig(b) {
    const A = [1, 0, 1, 0, 0, 0],
      B = [0, 1, 1, 0, 0, 0];
    const R = propagate(A, B);
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw17-note" data-n aria-live="polite"></p>`;
    const sl = N.slider("Time step t", 1, 6, 1, 1);
    qs("[data-c]", b).append(sl);
    const draw = (t) => {
      const s = R[t - 1];
      qs("[data-p]", b).innerHTML = netSvg(s, t);
      const lit = ["A", "B", "A1", "A2", "B1", "B2", "O"].filter((k) => s[k]);
      qs("[data-n]", b).innerHTML =
        `t = <b>${t}</b>: ${lit.length ? `<b>${lit.join(", ")}</b> fire.` : "nothing fires."} ${
          s.O
            ? "O gathered spikes from all four middle neurons at once, so it crossed its threshold."
            : s.got
              ? `O got only ${s.got} spikes, short of its threshold of 3.`
              : ""
        }`;
    };
    sl.onInput(draw);
    draw(1);
  }

  /** Step function (the spike) beside its slope: zero everywhere except one infinitely thin spike at the threshold. */
  function diracFig() {
    const W = 250,
      H = 150;
    const ax = (x0, t) =>
      `<line x1="${x0 + 10}" y1="${H - 30}" x2="${x0 + W - 10}" y2="${H - 30}" stroke="var(--line-2)" stroke-width="1.5"/><line x1="${x0 + W / 2}" y1="20" x2="${x0 + W / 2}" y2="${H - 24}" stroke="var(--line-2)" stroke-dasharray="3 3"/><text x="${x0 + W / 2}" y="${H - 8}" class="nw17-lab" text-anchor="middle">${t}</text>`;
    const step = `<polyline class="draw" points="20,${H - 30} ${W / 2},${H - 30} ${W / 2},40 ${W - 20},40" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    const d = W + 20;
    const spike = `<polyline class="draw" points="${d + 10},${H - 30} ${d + W / 2 - 2},${H - 30}" fill="none" stroke="var(--rose)" stroke-width="3"/><polyline class="draw" points="${d + W / 2 + 2},${H - 30} ${d + W - 10},${H - 30}" fill="none" stroke="var(--rose)" stroke-width="3"/><line class="fi" x1="${d + W / 2}" y1="${H - 30}" x2="${d + W / 2}" y2="14" stroke="var(--rose)" stroke-width="3"/>`;
    return `<svg class="fig nw17-svg" viewBox="0 0 ${2 * W + 20} ${H}" role="img" aria-label="Left: the spike function jumps from 0 to 1 at the threshold. Right: its slope is flat zero everywhere except an infinitely thin spike at the threshold.">${ax(0, "fire or not (spike function)")}${step}${ax(d, "its slope")}${spike}</svg>`;
  }

  /** The surrogate's slope for k = 1, 5, 20 (as on the slide), with a seg to highlight one. */
  function surrFig(b, o = {}) {
    let k = o.k || 5;
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw17-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const ser = [1, 5, 20].map((kk) => ({
        f: (a) => slope(a, kk),
        c: kk === k ? "violet" : "dim",
        width: kk === k ? 3.5 : 2,
      }));
      qs("[data-p]", b).innerHTML = N.fig.plot(ser, {
        x: [-10, 10],
        y: [0, 5.2],
        xl: "a (charge minus threshold)",
        yl: "slope",
        h: 200,
      });
      qs("[data-n]", b).innerHTML =
        `Purple curve, k = <b>${k}</b> (the grey ones are the other two): the bell peaks at <b>${k / 4}</b> at a = 0, and by a = 2 the slope is down to <b>${slope(2, k) < 0.01 ? "almost 0" : slope(2, k).toFixed(2)}</b>. ${
          k >= 20
            ? "Tall and thin: close to the true spike."
            : k <= 1
              ? "Low and wide: a gentle slope everywhere."
              : "In between."
        }`;
    };
    qs("[data-c]", b).append(
      N.seg(
        [
          ["1", "k = 1"],
          ["5", "k = 5"],
          ["20", "k = 20"],
        ],
        String(k),
        (v) => ((k = +v), draw()),
      ),
    );
    draw();
  }

  // ---------- demos ----------
  const card = (root, title, inner) => {
    const c = el(`<div class="card nw17-demo"><div class="card-head"><h2>${title}</h2></div>${inner}</div>`);
    root.appendChild(c);
    return c;
  };
  /** Encoder: Pip's light sensor strength becomes spikes under rate, temporal or population coding. */
  function encDemo(root, o = {}) {
    let code = o.code || "rate";
    const c = card(
      root,
      o.title || "Turn light into spikes",
      `<div class="controls" data-c></div><div data-p></div><p class="nw17-note" data-n aria-live="polite"></p>`,
    );
    const sl = N.slider("Light strength", 0, 10, 1, 6);
    qs("[data-c]", c).append(
      N.seg(
        [
          ["rate", "Rate"],
          ["temporal", "Temporal"],
          ["pop", "Population"],
        ],
        code,
        (v) => ((code = v), draw()),
      ),
      sl,
    );
    const draw = () => {
      const s = sl.value;
      if (code === "pop") {
        const P = popCode(s);
        qs("[data-p]", c).innerHTML = raster(P.map((tr, i) => ({ lab: `likes ${POP[i]}`, s: tr })));
        const busy = POP.filter((_, i) => P[i].some(Boolean));
        qs("[data-n]", c).innerHTML =
          `Strength <b>${s}</b>: ${busy.length ? `the neurons tuned near it fire (${busy.join(", ")})` : "no neuron fires"}. <b>Which</b> neurons are busy carries the message.`;
      } else {
        const tr = encode(s, code);
        qs("[data-p]", c).innerHTML = raster([{ lab: "light", s: tr }]);
        const n = tr.filter(Boolean).length,
          first = tr.indexOf(true);
        qs("[data-n]", c).innerHTML =
          code === "rate"
            ? `Strength <b>${s}</b>: <b>${n}</b> spikes in ${T} steps. Brighter light, more spikes.`
            : first < 0
              ? "Strength <b>0</b>: no spike at all."
              : `Strength <b>${s}</b>: one spike at step <b>${first + 1}</b>. Brighter light, earlier spike.`;
      }
      c.dataset.code = code;
      c.dataset.s = s;
    };
    sl.onInput(draw);
    draw();
    return c;
  }
  /** Leaky neuron: a steady drip of input, a leak setting, and the charge trace. */
  function lifDemo(root, o = {}) {
    let leak = o.leak ?? 0.1;
    const c = card(
      root,
      o.title || "Fill the leaky bucket",
      `<div class="controls" data-c></div><div data-p></div><div class="nw17-stats" data-t></div>`,
    );
    const sl = N.slider("Input per step", 0, 0.6, 0.05, o.I ?? 0.25, (v) => v.toFixed(2));
    qs("[data-c]", c).append(
      sl,
      N.seg(
        [
          ["0", "No leak"],
          ["0.1", "Slow leak"],
          ["0.3", "Fast leak"],
        ],
        String(leak),
        (v) => ((leak = +v), draw()),
      ),
    );
    const draw = () => {
      const R = lif(sl.value, leak);
      qs("[data-p]", c).innerHTML = trace(R);
      qs("[data-t]", c).innerHTML =
        stat("Input per step", sl.value.toFixed(2), "blue") +
        stat("Leak", leak ? `${leak * 100}% a step` : "none") +
        stat(`Spikes in ${T} steps`, R.n, "amber");
      if (o.onDraw) o.onDraw(R, sl.value, leak);
    };
    sl.onInput(draw);
    draw();
    return c;
  }
  /** STDP lab: tap time steps to toggle pre and post spikes; the weight follows the rule. */
  const PRE0 = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    POST0 = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0];
  function stdpDemo(root, o = {}) {
    const pre = (o.pre || PRE0).map(Boolean),
      post = (o.post || POST0).map(Boolean);
    const c = card(
      root,
      o.title || "Tune a connection",
      `<p class="nw17-note">Tap a box to switch a spike on or off. <b>Pre</b> sends, <b>post</b> receives.</p><div class="nw17-grid" data-g></div><div class="controls"><button class="btn ghost" data-a="clr">Clear</button></div><div class="nw17-stats" data-s></div>`,
    );
    const draw = () => {
      const R = stdp(pre, post);
      const row = (k, arr) =>
        `<div class="nw17-row"><span class="nw17-rl">${k}</span>${arr
          .map(
            (f, t) =>
              `<button class="nw17-cell${f ? " on" : ""}" data-k="${k}" data-t="${t}" aria-pressed="${f}" aria-label="${k} spike at step ${t + 1}">${t + 1}</button>`,
          )
          .join("")}</div>`;
      const marks = `<div class="nw17-row"><span class="nw17-rl">change</span>${R.log
        .map(
          (d) =>
            `<span class="nw17-d ${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "+1" : d < 0 ? "−1" : ""}</span>`,
        )
        .join("")}</div>`;
      qs("[data-g]", c).innerHTML = row("pre", pre) + row("post", post) + marks;
      qs("[data-s]", c).innerHTML =
        stat("Strengthened", R.log.filter((d) => d > 0).length, "teal") +
        stat("Weakened", R.log.filter((d) => d < 0).length, "rose") +
        stat("Weight (from 0)", R.w > 0 ? `+${R.w}` : R.w, "blue");
      if (o.onDraw) o.onDraw(R);
    };
    qs("[data-g]", c).addEventListener("click", (e) => {
      const b = e.target.closest("[data-t]");
      if (!b) return;
      const arr = b.dataset.k === "pre" ? pre : post;
      arr[+b.dataset.t] = !arr[+b.dataset.t];
      draw();
    });
    qs("[data-a=clr]", c).onclick = () => (pre.fill(false), post.fill(false), draw());
    draw();
    return c;
  }

  Object.assign(sh, {
    C,
    pr,
    T,
    encode,
    popCode,
    POP,
    lif,
    propagate,
    stdp,
    sig,
    slope,
    raster,
    trace,
    netSvg,
    stat,
    card,
    archFig,
    propFig,
    diracFig,
    surrFig,
    encDemo,
    lifDemo,
    stdpDemo,
  });
})();
