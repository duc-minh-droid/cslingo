/* l16-01: Lecture 16 (neural networks): shared kernel (threshold neuron, logic gates, the Mossbrook runoff curve, a bump network, MAE and Nash-Sutcliffe, a small weight-evolving GA), the static figures and the three demos. Lessons are in l16-02.js and l16-03.js; the workshop in l16-workshop.js. C, pr and mulberry come from Lecture 13 (NIC.shared.nicL13). */
(function () {
  const N = NIC;
  const { qs, qsa, el } = N;
  const sh = (NIC.shared.nicL16 = NIC.shared.nicL16 || {});
  const { C, pr, mulberry } = NIC.shared.nicL13;

  // ---------- kernel ----------
  /** A McCulloch-Pitts style threshold neuron: fires (1) when the weighted sum reaches the threshold. */
  const fire = (x, w, th) => (x.reduce((s, xi, i) => s + xi * w[i], 0) >= th - 1e-9 ? 1 : 0);
  const GATES = { AND: [[1, 1], 1.5], OR: [[1, 1], 0.5], NAND: [[-1, -1], -1.5], NOR: [[-1, -1], -0.5] };
  const IN4 = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  const TRUTH = {
    AND: [0, 0, 0, 1],
    OR: [0, 1, 1, 1],
    NAND: [1, 1, 1, 0],
    NOR: [1, 0, 0, 0],
    XOR: [0, 1, 1, 0],
  };
  /** Which named gate (if any) a truth-table column matches. */
  const gateOf = (col) => Object.keys(TRUTH).find((g) => TRUTH[g].every((v, i) => v === col[i])) || "";
  /** Two hidden gates feed an AND output: XOR = AND(OR, NAND). */
  const xorNet = (x, h1 = "OR", h2 = "NAND", o = "AND") => {
    const h = [fire(x, ...GATES[h1]), fire(x, ...GATES[h2])];
    return { h, y: fire(h, ...GATES[o]) };
  };

  // Mossbrook's storm: drain flow over time (0 to 1), peaking at 0.3.
  const XS = Array.from({ length: 41 }, (_, i) => i / 40);
  const flow = (x) => {
    const u = x / 0.3;
    return u * u * Math.exp(2 * (1 - u));
  };
  const T = XS.map(flow);
  const TMEAN = T.reduce((a, b) => a + b) / T.length;
  /** A one-input network whose H hidden neurons each respond to one stretch of the storm (Gaussian bumps). */
  const net = (H, sw) => {
    const cen = Array.from({ length: H }, (_, k) => k / (H - 1));
    const bump = (k, x) => Math.exp(-((x - cen[k]) ** 2) / (2 * sw * sw));
    const k0 = 1 / (H - 1) / (sw * Math.sqrt(2 * Math.PI));
    const pred = (w, alive) => XS.map((x) => w.reduce((s, wk, k) => s + (alive && !alive[k] ? 0 : wk * bump(k, x)), 0));
    return { H, cen, pred, w0: cen.map((c) => flow(c) * k0) };
  };
  const BIG = net(20, 0.06),
    SMALL = net(10, 0.09);
  const mae = (P) => P.reduce((s, p, i) => s + Math.abs(p - T[i]), 0) / P.length;
  const nse = (P) => 1 - P.reduce((s, p, i) => s + (p - T[i]) ** 2, 0) / T.reduce((s, t) => s + (t - TMEAN) ** 2, 0);

  /** Evolve SMALL's 10 weights: population 12, tournament of two, uniform crossover, additive Gaussian mutation of one weight, best kept. */
  function gaInit(seed) {
    const r = mulberry(seed);
    const P = Array.from({ length: 12 }, () => SMALL.cen.map(() => (r() - 0.5) * 0.4));
    const S = { r, P, gen: 0, hist: [] };
    gaSort(S);
    return S;
  }
  const fitOf = (w) => mae(SMALL.pred(w));
  function gaSort(S) {
    S.P.sort((a, b) => fitOf(a) - fitOf(b));
    S.best = S.P[0];
    S.mae = fitOf(S.best);
    S.nse = nse(SMALL.pred(S.best));
    S.hist.push(S.mae);
  }
  function gaStep(S) {
    const r = S.r,
      P = S.P;
    const gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
    const tour = () => {
      const a = P[(r() * P.length) | 0],
        b = P[(r() * P.length) | 0];
      return fitOf(a) < fitOf(b) ? a : b;
    };
    const nx = [P[0]];
    while (nx.length < P.length) {
      const p1 = tour(),
        p2 = tour();
      const c = p1.map((v, i) => (r() < 0.5 ? v : p2[i]));
      c[(r() * c.length) | 0] += gauss() * 0.15;
      nx.push(c);
    }
    S.P = nx;
    S.gen++;
    gaSort(S);
  }

  // ---------- drawing helpers ----------
  const svg = (w, h, inner, label) =>
    `<svg class="nw16-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${inner}</svg>`;
  const txt = (x, y, t, cls = "nw16-lab", anchor = "middle") =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const circ = (x, y, r, fill, stroke = "var(--line)") =>
    `<circle class="fi" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const wire = (x1, y1, x2, y2, w = 1, c = "line") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--${c})" stroke-width="${1.5 + Math.abs(w) * 1.5}"/>`;

  /** One artificial neuron: two inputs, two weights, a threshold, one output. */
  function neuronSvg(x, w, th) {
    const y = fire(x, w, th),
      sum = x[0] * w[0] + x[1] * w[1];
    const wc = (v) => (v > 0 ? "teal" : v < 0 ? "rose" : "line");
    return svg(
      360,
      180,
      wire(50, 50, 190, 90, w[0], wc(w[0])) +
        wire(50, 130, 190, 90, w[1], wc(w[1])) +
        wire(230, 90, 300, 90, 1, y ? "teal" : "line") +
        [0, 1]
          .map(
            (i) =>
              circ(40, 50 + i * 80, 18, x[i] ? "var(--blue)" : "var(--panel)") +
              txt(40, 55 + i * 80, x[i], "nw16-lab b") +
              txt(120, (i ? 128 : 56) + 0, `w = ${w[i]}`, "nw16-lab s"),
          )
          .join("") +
        circ(210, 90, 26, "var(--panel-2)", "var(--violet)") +
        txt(210, 87, `Σ ${sum}`, "nw16-lab s") +
        txt(210, 102, `≥ ${th}?`, "nw16-lab s") +
        circ(316, 90, 18, y ? "var(--teal)" : "var(--panel)") +
        txt(316, 95, y, "nw16-lab b"),
      `Inputs ${x.join(" and ")}, weights ${w.join(" and ")}, threshold ${th}: weighted sum ${sum}, output ${y}.`,
    );
  }

  /** A biological neuron with its three parts labelled. */
  const bioNeuron = () =>
    svg(
      380,
      150,
      [20, 45, 70, 95, 120]
        .map(
          (y) => `<path class="draw" d="M20 ${y} Q60 ${y} 92 75" fill="none" stroke="var(--blue)" stroke-width="3"/>`,
        )
        .join("") +
        circ(110, 75, 26, "var(--violet)", "var(--violet-lip)") +
        `<path class="draw" d="M136 75 L300 75" stroke="var(--amber)" stroke-width="6"/>` +
        [310, 330, 350].map((x, i) => wire(300, 75, x, 45 + i * 30, 0.6, "amber")).join("") +
        txt(40, 142, "dendrites: receive") +
        txt(112, 30, "cell body: process") +
        txt(240, 105, "axon: transmit"),
      "A neuron: dendrites receive signals, the cell body processes them, the axon transmits the result.",
    );

  /** Input, hidden and output layers with every connection drawn. */
  function layersSvg(nIn = 2, nH = 3, nOut = 1, names = ["inputs", "hidden", "output"]) {
    const col = [60, 180, 300],
      ys = (n) => Array.from({ length: n }, (_, i) => 90 + (i - (n - 1) / 2) * 44);
    const L = [ys(nIn), ys(nH), ys(nOut)];
    let s = "";
    for (let l = 0; l < 2; l++)
      L[l].forEach((a) => L[l + 1].forEach((b) => (s += wire(col[l], a, col[l + 1], b, 0.2))));
    const fills = ["var(--blue)", "var(--violet)", "var(--teal)"];
    L.forEach((ysL, l) => ysL.forEach((y) => (s += circ(col[l], y, 14, fills[l]))));
    names.forEach((t, l) => (s += txt(col[l], 176, t)));
    return svg(360, 186, s, `A network with ${nIn} inputs, ${nH} hidden neurons and ${nOut} output.`);
  }

  /** Line chart of the true storm flow (dashed) against a prediction. */
  function curveSvg(P, label, extra = "") {
    const X = (x) => 30 + x * 310,
      Y = (v) => 150 - v * 120;
    const line = (V, c, dash = "") =>
      `<polyline class="draw" fill="none" stroke="var(--${c})" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""} points="${V.map((v, i) => `${X(XS[i]).toFixed(1)},${Y(Math.max(-0.1, Math.min(1.15, v))).toFixed(1)}`).join(" ")}"/>`;
    return svg(
      350,
      175,
      `<line x1="30" y1="150" x2="340" y2="150" stroke="var(--line)" stroke-width="2"/><line x1="30" y1="20" x2="30" y2="150" stroke="var(--line)" stroke-width="2"/>` +
        txt(185, 170, "time through the storm →", "nw16-lab s") +
        txt(34, 16, "drain flow", "nw16-lab s", "start") +
        line(T, "line-2", "6 4") +
        (P ? line(P, "blue") : "") +
        extra,
      label,
    );
  }
  const legend = `<p class="nw16-legend"><span class="nw16-k dash"></span>real flow <span class="nw16-k blue"></span>network's guess</p>`;

  // ---------- demo 16.2: one neuron ----------
  function neuronDemo(root, life, o = {}) {
    let w = [1, 1],
      th = 1.5,
      x = [1, 1];
    const c = el(
      `<div class="card nw16-demo"><div class="card-head"><h2>${o.title || "Build a neuron"}</h2></div><div class="nw16-ctls" data-c></div><div data-p></div><table class="t nw16-tbl" data-t></table><p class="nw16-note" data-n aria-live="polite"></p></div>`,
    );
    root.appendChild(c);
    const sl = [
      N.slider("Weight w₁", -2, 2, 0.5, w[0]),
      N.slider("Weight w₂", -2, 2, 0.5, w[1]),
      N.slider("Threshold θ", -2, 2.5, 0.5, th),
    ];
    sl[0].onInput((v) => ((w[0] = v), draw()));
    sl[1].onInput((v) => ((w[1] = v), draw()));
    sl[2].onInput((v) => ((th = v), draw()));
    qs("[data-c]", c).append(...sl);
    const draw = () => {
      qs("[data-p]", c).innerHTML = neuronSvg(x, w, th);
      const col = IN4.map((p) => fire(p, w, th)),
        g = gateOf(col);
      qs("[data-t]", c).innerHTML =
        `<tr><th>x₁</th><th>x₂</th><th>output</th></tr>` +
        IN4.map(
          (p, i) =>
            `<tr data-r="${i}" class="${p[0] === x[0] && p[1] === x[1] ? "on" : ""}"><td>${p[0]}</td><td>${p[1]}</td><td><b>${col[i]}</b></td></tr>`,
        ).join("");
      qsa("[data-r]", c).forEach((r) => (r.onclick = () => ((x = IN4[+r.dataset.r]), draw())));
      qs("[data-n]", c).innerHTML = g
        ? `This neuron computes <b>${g}</b>. Tap a row to feed it those inputs.`
        : "No standard gate yet. Tap a row to feed it those inputs.";
      if (o.onChange) o.onChange(g, { w, th });
    };
    draw();
    return { gate: () => gateOf(IN4.map((p) => fire(p, w, th))) };
  }

  /** XOR with a hidden layer: tap an input pair; optionally pick the hidden gates. */
  function xorFig(b, o = {}) {
    let x = [0, 1],
      h1 = o.h1 || "OR",
      h2 = o.h2 || "NAND";
    b.innerHTML = `<div class="nw16-ctls" data-c></div><div data-p></div><table class="t nw16-tbl" data-t></table>`;
    if (o.pick)
      qs("[data-c]", b).append(
        N.seg(
          [
            ["OR", "Top: OR"],
            ["AND", "Top: AND"],
            ["NOR", "Top: NOR"],
          ],
          h1,
          (v) => ((h1 = v), draw()),
        ),
        N.seg(
          [
            ["NAND", "Bottom: NAND"],
            ["OR", "Bottom: OR"],
            ["AND", "Bottom: AND"],
          ],
          h2,
          (v) => ((h2 = v), draw()),
        ),
      );
    const draw = () => {
      const R = xorNet(x, h1, h2);
      const col = [60, 180, 300],
        hy = [55, 125];
      let s = "";
      [55, 125].forEach((a) => hy.forEach((h) => (s += wire(col[0], a, col[1], h, 0.2))));
      hy.forEach((h) => (s += wire(col[1], h, col[2], 90, 0.2)));
      [0, 1].forEach(
        (i) =>
          (s +=
            circ(col[0], [55, 125][i], 16, x[i] ? "var(--blue)" : "var(--panel)") +
            txt(col[0], [60, 130][i], x[i], "nw16-lab b")),
      );
      [h1, h2].forEach(
        (g, i) =>
          (s +=
            circ(col[1], hy[i], 22, R.h[i] ? "var(--violet)" : "var(--panel)") +
            txt(col[1], hy[i] + 5, R.h[i], "nw16-lab b") +
            txt(col[1], hy[i] - 28, g, "nw16-lab s")),
      );
      s +=
        circ(col[2], 90, 18, R.y ? "var(--teal)" : "var(--panel)") +
        txt(col[2], 95, R.y, "nw16-lab b") +
        txt(col[2], 62, "AND", "nw16-lab s");
      qs("[data-p]", b).innerHTML = svg(
        360,
        170,
        s,
        `Inputs ${x.join(", ")}; hidden ${R.h.join(", ")}; output ${R.y}.`,
      );
      const outs = IN4.map((p) => xorNet(p, h1, h2).y);
      qs("[data-t]", b).innerHTML =
        `<tr><th>x₁</th><th>x₂</th><th>network</th><th>XOR</th></tr>` +
        IN4.map(
          (p, i) =>
            `<tr data-r="${i}" class="${p[0] === x[0] && p[1] === x[1] ? "on" : ""}"><td>${p[0]}</td><td>${p[1]}</td><td><b>${outs[i]}</b></td><td>${TRUTH.XOR[i]}</td></tr>`,
        ).join("");
      qsa("[data-r]", b).forEach((r) => (r.onclick = () => ((x = IN4[+r.dataset.r]), draw())));
      if (o.onChange) o.onChange(gateOf(outs) === "XOR");
    };
    draw();
  }

  // ---------- demo 16.4: graceful degradation ----------
  function degradeDemo(root, life, o = {}) {
    const alive = BIG.cen.map(() => true);
    const c = el(
      `<div class="card nw16-demo"><div class="card-head"><h2>${o.title || "Knock out neurons"}</h2></div><p class="nw16-note">Tap hidden neurons to switch them off (tap again to bring one back).</p><div class="nw16-row" data-h></div><div data-p></div>${legend}<div class="nw16-stats" data-s></div><div class="controls"><button class="btn ghost" data-a="rs">Restore all</button></div></div>`,
    );
    root.appendChild(c);
    qs("[data-h]", c).innerHTML = BIG.cen
      .map((_, k) => `<button class="nw16-cell on" data-k="${k}" aria-label="Hidden neuron ${k + 1}">${k + 1}</button>`)
      .join("");
    const draw = () => {
      const P = BIG.pred(BIG.w0, alive),
        off = alive.filter((a) => !a).length,
        s = nse(P);
      qs("[data-p]", c).innerHTML = curveSvg(P, `Prediction with ${20 - off} of 20 hidden neurons working.`);
      qsa("[data-k]", c).forEach((b) => b.classList.toggle("on", alive[+b.dataset.k]));
      qs("[data-s]", c).innerHTML =
        `<div class="wk-stat"><small>Neurons working</small><b>${20 - off} of 20</b></div><div class="wk-stat teal"><small>Fit score (best 1)</small><b>${s.toFixed(2)}</b></div>`;
      if (o.onChange) o.onChange(off, s);
    };
    qsa("[data-k]", c).forEach((b) => (b.onclick = () => ((alive[+b.dataset.k] = !alive[+b.dataset.k]), draw())));
    qs("[data-a=rs]", c).onclick = () => (alive.fill(true), draw());
    draw();
  }

  // ---------- demo 16.5: evolve the weights ----------
  function evolveDemo(root, life, o = {}) {
    let seed = 1,
      S = gaInit(seed),
      running = false;
    const c = el(
      `<div class="card nw16-demo"><div class="card-head"><h2>${o.title || "Evolve the weights"}</h2></div><div class="controls"><button class="btn primary" data-a="st">Next generation</button><button class="btn" data-a="run">Run</button><button class="btn ghost" data-a="rs">Reset</button></div><div data-p></div>${legend}<div class="nw16-stats" data-s></div><div class="nw16-wts" data-w></div></div>`,
    );
    root.appendChild(c);
    const draw = () => {
      qs("[data-p]", c).innerHTML = curveSvg(SMALL.pred(S.best), `Best network after ${S.gen} generations.`);
      qs("[data-s]", c).innerHTML =
        `<div class="wk-stat"><small>Generation</small><b>${S.gen}</b></div><div class="wk-stat amber"><small>Error (MAE)</small><b>${S.mae.toFixed(3)}</b></div><div class="wk-stat teal"><small>Fit score (NSE)</small><b>${S.nse.toFixed(2)}</b></div>`;
      qs("[data-w]", c).innerHTML =
        `<small>Best genome: its 10 weights</small><div>` +
        S.best
          .map(
            (v) =>
              `<span class="nw16-w ${v < 0 ? "neg" : ""}" style="--h:${Math.min(100, Math.abs(v) * 160)}%"></span>`,
          )
          .join("") +
        `</div>`;
      if (o.onChange) o.onChange(S);
    };
    const bt = (a) => qs(`[data-a=${a}]`, c);
    bt("st").onclick = () => (gaStep(S), draw());
    bt("run").onclick = () => {
      running = !running;
      bt("run").textContent = running ? "Pause" : "Run";
    };
    bt("rs").onclick = () => ((S = gaInit(++seed)), draw());
    life.interval(() => running && S.gen < 300 && (gaStep(S), draw()), 160);
    draw();
  }

  /** 15 storms; each split holds one out for testing. */
  function cvFig(b) {
    let k = 0;
    const H = [5, 8, 3, 9, 6, 4, 7, 10, 5, 3, 8, 6, 9, 4, 7];
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Next split</button></div><div data-p></div><p class="nw16-note" data-n></p>`;
    const draw = () => {
      qs("[data-p]", b).innerHTML = svg(
        360,
        130,
        H.map(
          (h, i) =>
            `<rect class="fi" x="${12 + i * 23}" y="${100 - h * 8}" width="17" height="${h * 8}" rx="3" fill="var(--${i === k ? "amber" : "blue"})"/>`,
        ).join("") + txt(180, 122, "15 storms, January 2010 to October 2012", "nw16-lab s"),
        `Split ${k + 1}: storm ${k + 1} is held out for testing, the other 14 train the network.`,
      );
      qs("[data-n]", b).innerHTML =
        `Split <b>${k + 1}</b> of 15: train on 14 storms (blue), test on storm ${k + 1} (orange).`;
    };
    qs("[data-a=nx]", b).onclick = () => ((k = (k + 1) % 15), draw());
    draw();
  }

  Object.assign(sh, {
    C,
    pr,
    fire,
    GATES,
    IN4,
    TRUTH,
    gateOf,
    xorNet,
    XS,
    T,
    BIG,
    SMALL,
    mae,
    nse,
    gaInit,
    gaStep,
    svg,
    txt,
    circ,
    wire,
    neuronSvg,
    bioNeuron,
    layersSvg,
    curveSvg,
    legend,
    neuronDemo,
    xorFig,
    degradeDemo,
    evolveDemo,
    cvFig,
  });
})();
