/* l18-01: Lecture 18 (neuromorphic computing): shared helpers (quick checks, predicts), static figures and the three demos (event-driven chip, event camera, spiking heuristic units). Lessons are in l18-02.js and l18-03.js, the workshop in l18-workshop.js. Running example: Hoglet, a battery-powered hedgehog camera. */
(function () {
  const N = NIC;
  const { el, qs } = N;
  const sh = (NIC.shared.nicL18 = NIC.shared.nicL18 || {});

  /** Spec: "question | right answer | wrong | wrong | why" (the engine shuffles the order). */
  const parts = (spec) => {
    const x = spec.split(" | ");
    return { q: x[0], opts: x.slice(1, -1), why: x[x.length - 1] };
  };
  const C = (spec) => {
    const { q, opts, why } = parts(spec);
    return { q, o: opts, a: 0, why };
  };
  const pr = (id, spec) => N.predict((({ q, opts, why }) => ({ id, q, opts, a: 0, why }))(parts(spec)));
  const rng = (a) => () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  const card = (root, title, inner) => {
    const c = el(`<div class="card nw18-demo"><div class="card-head"><h2>${title}</h2></div>${inner}</div>`);
    root.appendChild(c);
    return c;
  };
  const stat = (lab, v, c = "") => `<div class="nw18-stat ${c}"><small>${lab}</small><b>${v}</b></div>`;

  // ---------- static figures ----------
  /** von Neumann: processor and memory with the data shuttling between them. */
  const shuttleFig = () =>
    `<svg class="nw18-svg" viewBox="0 0 420 150" role="img" aria-label="A processor and a separate memory, with data travelling back and forth along a bus between them."><rect x="20" y="35" width="120" height="80" rx="14" fill="var(--blue)" fill-opacity=".16" stroke="var(--blue)" stroke-width="2"/><text x="80" y="80" text-anchor="middle" class="nw18-t">Processor</text><rect x="280" y="35" width="120" height="80" rx="14" fill="var(--amber)" fill-opacity=".16" stroke="var(--amber)" stroke-width="2"/><text x="340" y="80" text-anchor="middle" class="nw18-t">Memory</text><path class="draw" d="M150 62 H270" stroke="var(--text-dim)" stroke-width="3" marker-end="url(#nw18a)"/><path class="draw" d="M270 92 H150" stroke="var(--text-dim)" stroke-width="3" marker-end="url(#nw18a)"/><text x="210" y="52" text-anchor="middle" class="nw18-s">fetch data</text><text x="210" y="112" text-anchor="middle" class="nw18-s">store result</text><defs><marker id="nw18a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--text-dim)"/></marker></defs></svg>`;

  /** Spike trains: when and how strongly each input fires. */
  const spikeFig = (
    rows = [
      ["neuron A", [2, 5, 6, 11]],
      ["neuron B", [4, 9]],
      ["neuron C", [1, 3, 8, 10, 12]],
    ],
  ) =>
    `<svg class="nw18-svg" viewBox="0 0 420 ${30 + rows.length * 40}" role="img" aria-label="Spike trains for ${rows.length} neurons: short spikes at different moments in time.">${rows
      .map(
        ([n, ts], i) =>
          `<text x="10" y="${42 + i * 40}" class="nw18-s">${n}</text><line x1="90" y1="${45 + i * 40}" x2="410" y2="${45 + i * 40}" stroke="var(--line-2)" stroke-width="2"/>${ts
            .map(
              (t, k) =>
                `<line class="draw" x1="${90 + t * 24}" y1="${45 + i * 40}" x2="${90 + t * 24}" y2="${45 + i * 40 - (k % 2 ? 18 : 26)}" stroke="var(--violet)" stroke-width="4" stroke-linecap="round"/>`,
            )
            .join("")}`,
      )
      .join("")}<text x="410" y="${24 + rows.length * 40}" text-anchor="end" class="nw18-s">time →</text></svg>`;

  /** A small network graph for routing and graph jobs. */
  const netFig = () =>
    N.fig.graph({
      nodes: { A: [50, 60], B: [160, 30], C: [160, 140], D: [280, 80], E: [390, 40], F: [390, 150] },
      edges: [
        ["A", "B"],
        ["A", "C"],
        ["B", "D"],
        ["C", "D"],
        ["D", "E"],
        ["D", "F"],
        ["C", "F"],
      ],
      w: 440,
      h: 190,
      hl: { A: "teal", "A-B": "teal", "B-D": "teal", "D-E": "teal", E: "teal" },
      label: "A small network with six nodes. One route from A to E is highlighted: A, B, D, E.",
    });

  // ---------- demo 1: clocked chip against event-driven chip ----------
  const TICKS = 24;
  /** o: {onStat({act, clock, ev})} */
  function eventDemo(root, life, o = {}) {
    let seed = 7,
      act = 50;
    const c = card(
      root,
      o.title || "A night in the garden",
      `<div class="controls" data-c></div><div class="controls"><button class="btn" data-a="new">New night</button></div><div data-p></div><p class="nw18-legend"><span class="nw18-k amber"></span>work done by a clocked chip <span class="nw18-k teal"></span>work done by an event-driven chip <span class="nw18-k violet"></span>spike (something moved)</p><div class="nw18-stats" data-t></div>`,
    );
    const sl = N.slider("Garden activity", 0, 100, 10, act, (v) => `${v}%`);
    qs("[data-c]", c).append(sl);
    const draw = () => {
      const r = rng(seed),
        sp = Array.from({ length: TICKS }, () => r() * 100 < act);
      const ev = sp.filter(Boolean).length;
      const W = 16;
      const cell = (i, y, on, col) =>
        `<rect x="${70 + i * W}" y="${y}" width="${W - 3}" height="22" rx="4" fill="var(--${on ? col : "line"})" fill-opacity="${on ? 0.8 : 0.5}"/>`;
      qs("[data-p]", c).innerHTML =
        `<svg class="nw18-svg" viewBox="0 0 460 140" role="img" aria-label="${TICKS} moments of the night. ${ev} have a spike. The clocked chip works at all ${TICKS}; the event-driven chip works at ${ev}."><text x="0" y="30" class="nw18-s">spikes</text><text x="0" y="74" class="nw18-s">clocked</text><text x="0" y="118" class="nw18-s">event</text>${sp
          .map(
            (s, i) =>
              (s
                ? `<line x1="${76 + i * W}" y1="36" x2="${76 + i * W}" y2="14" stroke="var(--violet)" stroke-width="4" stroke-linecap="round"/>`
                : "") +
              cell(i, 58, true, "amber") +
              cell(i, 102, s, "teal"),
          )
          .join("")}</svg>`;
      qs("[data-t]", c).innerHTML =
        stat("Moments with a spike", `${ev} of ${TICKS}`) +
        stat("Clocked chip works", `${TICKS} times`, "amber") +
        stat("Event-driven chip works", `${ev} times`, "teal");
      if (o.onStat) o.onStat({ act, clock: TICKS, ev });
    };
    sl.onInput((v) => ((act = v), draw()));
    qs("[data-a=new]", c).onclick = () => ((seed += 13), draw());
    draw();
    return c;
  }

  // ---------- demo 2: frame camera against event camera ----------
  const GW = 12,
    GH = 6;
  /** o: {onStat({mode, sent, moments, changed})} */
  function cameraDemo(root, life, o = {}) {
    let mode = "event",
      move = "move",
      pos = 1,
      sent = { frame: 0, event: 0 },
      moments = 0,
      changed = [];
    const c = card(
      root,
      o.title || "Hoglet's two cameras",
      `<div class="controls" data-c></div><div class="controls"><button class="btn primary" data-a="nx">Next moment</button><button class="btn ghost" data-a="rs">Start again</button></div><div class="nw18-grid" data-p></div><p class="nw18-legend"><span class="nw18-k amber"></span>hedgehog <span class="nw18-k blue"></span>pixel sent this moment</p><p class="nw18-note" data-n aria-live="polite"></p><div class="nw18-stats" data-t></div>`,
    );
    const row = 3;
    const hog = (p) => [p, p + 1];
    const draw = () => {
      const on = hog(pos);
      let h = "";
      for (let y = 0; y < GH; y++)
        for (let x = 0; x < GW; x++) {
          const isHog = y === row && on.includes(x);
          const send = moments > 0 && (mode === "frame" || (y === row && changed.includes(x)));
          h += `<span class="nw18-px${isHog ? " hog" : ""}${send ? " sent" : ""}"></span>`;
        }
      qs("[data-p]", c).innerHTML = h;
      qs("[data-p]", c).setAttribute(
        "aria-label",
        `A ${GW} by ${GH} pixel picture with the hedgehog at column ${pos + 1}. ${mode === "frame" ? "The frame camera sends every pixel." : `The event camera sends ${changed.length} changed pixels.`}`,
      );
      qs("[data-n]", c).innerHTML = !moments
        ? "Press <b>Next moment</b>. Switch cameras to compare what each one sends."
        : mode === "frame"
          ? `The frame camera sent all <b>${GW * GH}</b> pixels, moving or not.`
          : changed.length
            ? `Only the <b>${changed.length}</b> pixels whose brightness changed fired a spike.`
            : "Nothing changed, so the event camera sent <b>nothing</b>.";
      qs("[data-t]", c).innerHTML =
        stat("Moments", moments) +
        stat("Frame camera, pixels sent", sent.frame, "amber") +
        stat("Event camera, pixels sent", sent.event, "teal");
    };
    const step = () => {
      const before = hog(pos);
      if (move === "move") pos = pos >= GW - 2 ? 0 : pos + 1;
      const after = hog(pos);
      changed = before.filter((x) => !after.includes(x)).concat(after.filter((x) => !before.includes(x)));
      moments++;
      sent.frame += GW * GH;
      sent.event += changed.length;
      draw();
      if (o.onStat) o.onStat({ mode, sent: { ...sent }, moments, changed: changed.length, move });
    };
    qs("[data-c]", c).append(
      N.seg(
        [
          ["event", "Event camera"],
          ["frame", "Frame camera"],
        ],
        mode,
        (v) => ((mode = v), draw()),
      ),
      N.seg(
        [
          ["move", "Hedgehog walks"],
          ["still", "Hedgehog sits still"],
        ],
        move,
        (v) => (move = v),
      ),
    );
    qs("[data-a=nx]", c).onclick = step;
    qs("[data-a=rs]", c).onclick = () => {
      pos = 1;
      sent = { frame: 0, event: 0 };
      moments = 0;
      changed = [];
      draw();
    };
    draw();
    return c;
  }

  // ---------- demo 3: spiking heuristic units (a toy, not the paper's exact rules) ----------
  const TARGET = 7.2;
  const score = (x) => Math.abs(x - TARGET);
  const RATES = [0.3, 0.45, 0.25, 0.6, 0.35];
  /** o: {onStat({ticks, spikes, best})} */
  function unitsDemo(root, life, o = {}) {
    let S;
    const reset = () => {
      const r = rng(11);
      S = {
        r,
        ticks: 0,
        spikes: 0,
        U: RATES.map((rate, i) => ({ id: `U${i + 1}`, rate, v: r() * 0.5, x: +(r() * 10).toFixed(1), last: "start" })),
      };
      S.best = S.U.reduce((a, u) => (score(u.x) < score(a) ? u.x : a), S.U[0].x);
    };
    reset();
    const c = card(
      root,
      o.title || "Five spiking units tune Hoglet",
      `<div class="controls"><button class="btn primary" data-a="t">Tick</button><button class="btn" data-a="t5">5 ticks</button><button class="btn ghost" data-a="rs">Reset</button></div><table class="t nw18-tbl" data-p></table><p class="nw18-legend"><span class="nw18-k violet"></span>spiked: own dynamics (big jump) <span class="nw18-k blue"></span>no spike: heuristic step towards the best</p><div class="nw18-stats" data-t></div>`,
    );
    const tick = () => {
      S.ticks++;
      S.U.forEach((u) => {
        u.v += u.rate;
        if (u.v >= 1) {
          u.v = 0;
          S.spikes++;
          u.x = +(S.r() * 10).toFixed(1);
          u.last = "spike";
        } else {
          u.x = +(u.x + 0.5 * (S.best - u.x) + (S.r() - 0.5) * 0.6).toFixed(1);
          u.x = Math.min(10, Math.max(0, u.x));
          u.last = "step";
        }
        if (score(u.x) < score(S.best)) S.best = u.x;
      });
    };
    const draw = () => {
      qs("[data-p]", c).innerHTML =
        `<tr><th>unit</th><th>charge</th><th>setting</th><th>last move</th></tr>` +
        S.U.map(
          (u) =>
            `<tr><td><b>${u.id}</b></td><td><span class="nw18-bar"><i style="width:${Math.round(u.v * 100)}%"></i></span></td><td>${u.x.toFixed(1)}</td><td>${u.last === "spike" ? '<span class="nw18-tag violet">spike: jump</span>' : u.last === "step" ? '<span class="nw18-tag blue">heuristic step</span>' : "start"}</td></tr>`,
        ).join("");
      qs("[data-t]", c).innerHTML =
        stat("Ticks", S.ticks) +
        stat("Spikes so far", S.spikes, "violet") +
        stat("Best setting", S.best.toFixed(1), "teal") +
        stat("Miss (lower is better)", score(S.best).toFixed(1), "amber");
      if (o.onStat) o.onStat({ ticks: S.ticks, spikes: S.spikes, best: S.best, miss: score(S.best) });
    };
    qs("[data-a=t]", c).onclick = () => (tick(), draw());
    qs("[data-a=t5]", c).onclick = () => {
      for (let i = 0; i < 5; i++) tick();
      draw();
    };
    qs("[data-a=rs]", c).onclick = () => (reset(), draw());
    draw();
    return c;
  }

  Object.assign(sh, { C, pr, rng, card, stat, shuttleFig, spikeFig, netFig, eventDemo, cameraDemo, unitsDemo });
})();
