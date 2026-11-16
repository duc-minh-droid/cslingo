/* l13-01: Lectures 13-14 (multi-objective evolutionary algorithms): shared kernel (dominance, sorting, crowding, plots) and 13.1 trade-offs and Pareto dominance. */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = (NIC.shared.nicL13 = NIC.shared.nicL13 || {});

  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /** Quick check and predict builders. Spec: "question | right answer | wrong | wrong | why" (the engine shuffles the order). */
  const parts = (spec) => {
    const x = spec.split(" | ");
    return { q: x[0], opts: x.slice(1, -1), why: x[x.length - 1] };
  };
  const C = (spec, hint) => {
    const { q, opts, why } = parts(spec);
    return { q, o: opts, a: 0, why, ...(hint ? { hint } : {}) };
  };
  const pr = (id, spec) => N.predict((({ q, opts, why }) => ({ id, q, opts, a: 0, why }))(parts(spec)));

  // ---------- dominance, non-dominated sorting, crowding distance ----------
  /** a dominates b: no worse on every objective and better on at least one. s[i] = 1 to minimise objective i, -1 to maximise. */
  function dom(a, b, s) {
    let better = false;
    for (let i = 0; i < a.length; i++) {
      const d = (a[i] - b[i]) * s[i];
      if (d > 0) return false;
      if (d < 0) better = true;
    }
    return better;
  }
  /** Rank of every point: rank 0 is the non-dominated set, rank 1 is non-dominated once rank 0 is removed, and so on. */
  function ranks(P, s) {
    const r = P.map(() => -1);
    let left = P.map((_, i) => i),
      k = 0;
    while (left.length) {
      const f = left.filter((i) => !left.some((j) => j !== i && dom(P[j], P[i], s)));
      f.forEach((i) => (r[i] = k));
      left = left.filter((i) => r[i] < 0);
      k++;
    }
    return r;
  }

  /** "A 20 30, B 25 42" -> {A: [20, 30], B: [25, 42]} */
  const pts = (t) =>
    Object.fromEntries(
      t
        .split(", ")
        .map((r) => r.split(" "))
        .map(([k, x, y]) => [k, [+x, +y]]),
    );

  // ---------- plots ----------
  const RC = ["teal", "blue", "violet", "amber", "rose"];
  /** A 2-D objective-space frame. o: {xr, yr, xl, yl, w, h}. Returns X(), Y() and wrap(inner, label). */
  function frame(o) {
    const w = o.w || 380,
      h = o.h || 300,
      p = { l: 38, r: 14, t: 30, b: 40 };
    const [x0, x1] = o.xr,
      [y0, y1] = o.yr;
    const X = (v) => p.l + ((v - x0) / (x1 - x0)) * (w - p.l - p.r),
      Y = (v) => h - p.b - ((v - y0) / (y1 - y0)) * (h - p.t - p.b);
    const tk = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
    const nx = o.nx || 5,
      ny = o.ny || 5;
    const fm = (v) => (Number.isInteger(v) ? v : v.toFixed(1));
    const axes =
      tk(x0, x1, nx)
        .map(
          (v) =>
            `<line x1="${X(v)}" y1="${p.t}" x2="${X(v)}" y2="${h - p.b}" class="nw13-grid"/><text x="${X(v)}" y="${h - p.b + 14}" class="nw13-tk">${fm(v)}</text>`,
        )
        .join("") +
      tk(y0, y1, ny)
        .map(
          (v) =>
            `<line x1="${p.l}" y1="${Y(v)}" x2="${w - p.r}" y2="${Y(v)}" class="nw13-grid"/><text x="${p.l - 6}" y="${Y(v) + 4}" class="nw13-tk" style="text-anchor:end">${fm(v)}</text>`,
        )
        .join("") +
      `<line x1="${p.l}" y1="${h - p.b}" x2="${w - p.r}" y2="${h - p.b}" class="nw13-ax"/><line x1="${p.l}" y1="${p.t}" x2="${p.l}" y2="${h - p.b}" class="nw13-ax"/>` +
      `<text x="${w - p.r}" y="${h - 6}" class="nw13-axl" style="text-anchor:end">${o.xl || "f₁"}</text><text x="${p.l - 30}" y="14" class="nw13-axl" style="text-anchor:start">${o.yl || "f₂"}</text>`;
    const wrap = (inner, label) =>
      `<svg class="fig nw13-plot" viewBox="0 0 ${w} ${h}" style="max-height:${h}px" role="img" aria-label="${label}">${axes}${inner}</svg>`;
    return { X, Y, w, h, p, wrap, x0, x1, y0, y1 };
  }
  /** One labelled point. c: a colour name, or "dim"; ring: draw a selection ring. */
  const dot = (fr, id, [x, y], o = {}) =>
    `<g class="nw13-pt${o.ring ? " sel" : ""}" data-id="${id}"><circle cx="${fr.X(x).toFixed(1)}" cy="${fr.Y(y).toFixed(1)}" r="${o.r || 9}" fill="${o.c === "dim" ? "var(--line-2)" : `var(--${o.c || "blue"})`}" stroke="${o.ring ? "var(--text)" : "var(--panel)"}" stroke-width="${o.ring ? 3 : 2}"/>${o.lab === false ? "" : `<text x="${(fr.X(x) + 11).toFixed(1)}" y="${(fr.Y(y) - 9).toFixed(1)}" class="nw13-lab">${o.lab || id}</text>`}</g>`;
  /** Line through the points of one front, sorted by the first objective. */
  const joinLine = (fr, pts, c = "teal", dash = "") =>
    pts.length < 2
      ? ""
      : `<polyline class="draw" points="${[...pts]
          .sort((a, b) => a[0] - b[0])
          .map(([x, y]) => `${fr.X(x).toFixed(1)},${fr.Y(y).toFixed(1)}`)
          .join(
            " ",
          )}" fill="none" stroke="var(--${c})" stroke-width="3" stroke-linejoin="round" ${dash ? `stroke-dasharray="${dash}"` : ""} opacity=".7"/>`;
  /** Shaded box between a point and the plot edge it is better or worse than. */
  function box(fr, [x, y], s, worse, c) {
    const ex = s[0] > 0 === worse ? fr.x1 : fr.x0,
      ey = s[1] > 0 === worse ? fr.y1 : fr.y0;
    const xa = Math.min(fr.X(x), fr.X(ex)),
      ya = Math.min(fr.Y(y), fr.Y(ey));
    return `<rect x="${xa}" y="${ya}" width="${Math.abs(fr.X(ex) - fr.X(x))}" height="${Math.abs(fr.Y(ey) - fr.Y(y))}" fill="var(--${c})" fill-opacity=".14" stroke="var(--${c})" stroke-dasharray="5 4"/>`;
  }
  const better = (s, i) => (s[i] > 0 ? "lower" : "higher");

  /**
   * Dominance explorer. o: {pts: {id: [x, y]}, s, xr, yr, xl, yl, pair, front (show the button), names: [f1, f2], onTap(sel, st)}.
   * Tap a point to shade what it dominates (green) and what dominates it (red). In pair mode the last two taps are compared.
   */
  function explorer(box0, life, o) {
    const ids = Object.keys(o.pts),
      P = ids.map((k) => o.pts[k]),
      s = o.s;
    const rk = ranks(P, s),
      fr = frame(o);
    const nm = o.names || ["f₁", "f₂"];
    let sel = [],
      showFront = !!o.showFront;
    box0.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    if (o.front) {
      const b = el(`<button class="btn" data-a="front">Show Pareto front</button>`);
      b.onclick = () => {
        showFront = !showFront;
        b.textContent = showFront ? "Hide Pareto front" : "Show Pareto front";
        draw();
        if (o.onFront) o.onFront(showFront);
      };
      qs("[data-c]", box0).append(b);
    }
    const verdict = (a, b) => {
      const A = o.pts[a],
        B = o.pts[b];
      const per = [0, 1]
        .map((i) => {
          const d = (A[i] - B[i]) * s[i];
          return `${nm[i]}: ${d < 0 ? `<b>${a}</b> better` : d > 0 ? `<b>${b}</b> better` : "a draw"}`;
        })
        .join(", ");
      const v = dom(A, B, s)
        ? `<b>${a} dominates ${b}</b>.`
        : dom(B, A, s)
          ? `<b>${b} dominates ${a}</b>.`
          : `Neither dominates: <b>${a}</b> and <b>${b}</b> are <b>mutually non-dominating</b>.`;
      return `${per}. ${v}`;
    };
    function draw() {
      const last = sel[sel.length - 1];
      let under = "";
      if (last && !o.pair) {
        under = box(fr, o.pts[last], s, true, "teal") + box(fr, o.pts[last], s, false, "rose");
      }
      if (showFront)
        under += joinLine(
          fr,
          ids.filter((_, i) => rk[i] === 0).map((k) => o.pts[k]),
        );
      const dots = ids
        .map((k, i) =>
          dot(fr, k, o.pts[k], {
            ring: sel.includes(k),
            c: showFront ? (rk[i] === 0 ? "teal" : "dim") : "blue",
          }),
        )
        .join("");
      qs("[data-p]", box0).innerHTML = fr.wrap(
        under + dots,
        `Scatter of ${ids.length} solutions: ${ids.map((k) => `${k} (${o.pts[k].join(", ")})`).join("; ")}. Tap a point.`,
      );
      let say = o.pair
        ? "Tap two points to compare them."
        : `Tap a point. Green: what it dominates. Red: what dominates it. (${nm[0]}: ${better(s, 0)} is better, ${nm[1]}: ${better(s, 1)} is better.)`;
      if (o.pair && sel.length === 2) say = verdict(sel[0], sel[1]);
      else if (!o.pair && last) {
        const i = ids.indexOf(last);
        const by = ids.filter((_, j) => dom(P[j], P[i], s)),
          of = ids.filter((_, j) => dom(P[i], P[j], s));
        say = `<b>${last}</b> is dominated by ${by.length ? `<b>${by.join(", ")}</b>` : "nobody"} and dominates ${of.length ? `<b>${of.join(", ")}</b>` : "nothing"}.`;
      }
      if (showFront)
        say += ` Front: <b>${ids.filter((_, i) => rk[i] === 0).join(", ")}</b> (${rk.filter((r) => r === 0).length} of ${ids.length}).`;
      qs("[data-n]", box0).innerHTML = say;
    }
    qs("[data-p]", box0).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (!t) return;
      const k = t.dataset.id;
      sel = o.pair ? [...sel.filter((x) => x !== k), k].slice(-2) : [k];
      draw();
      if (o.onTap) o.onTap(sel, { dom: (a, b) => dom(o.pts[a], o.pts[b], s), rank: (a) => rk[ids.indexOf(a)] });
    });
    draw();
    return {
      redraw: draw,
      tap: (k) => qs(`[data-id="${k}"]`, box0).dispatchEvent(new MouseEvent("click", { bubbles: true })),
    };
  }

  /** The wind farm layouts: cost in £m (minimise) and power in MW (maximise). K is on the front but no weighted sum finds it. */
  const FARM = pts("A 20 30, B 25 42, C 32 55, D 40 62, E 52 70, F 30 38, G 45 58, H 36 48, I 22 26, J 58 69, K 46 64");
  const FARM_O = {
    pts: FARM,
    s: [1, -1],
    xr: [15, 60],
    yr: [20, 75],
    xl: "cost (£m) ←",
    yl: "↑ power (MW)",
    nx: 9,
    ny: 11,
    names: ["cost", "power"],
  };
  Object.assign(sh, {
    C,
    pr,
    mulberry,
    pts,
    dom,
    ranks,
    RC,
    frame,
    dot,
    joinLine,
    box,
    explorer,
    FARM,
    FARM_O,
  });

  // ---------- 13.1 figures ----------
  /** The wake trade-off: a slider moves the back turbine away; it makes more power but the cable costs more. Toy model. */
  function wakeFig(b, life) {
    b.innerHTML = `<div class="controls" data-c></div><div data-s></div><div class="nw13-stats" data-t></div>`;
    const sl = N.slider("Gap between the turbines (rotor widths)", 2, 10, 1, 3);
    qs("[data-c]", b).append(sl);
    const draw = (g) => {
      const frac = 1 - 0.6 / (1 + 0.3 * g) ** 2,
        cable = 1.5 * g;
      const x2 = 70 + g * 34,
        cone = `<polygon points="70,80 ${x2 + 40},${80 - 20 - g * 4} ${x2 + 40},${80 + 20 + g * 4}" fill="var(--rose)" fill-opacity=".14" stroke="var(--rose)" stroke-dasharray="5 4"/>`;
      const tb = (x, f, lab) =>
        `<g class="fi"><line x1="${x}" y1="80" x2="${x}" y2="140" stroke="var(--text-dim)" stroke-width="4"/><circle cx="${x}" cy="80" r="7" fill="var(--text)"/><line x1="${x}" y1="80" x2="${x}" y2="${80 - 34 * f}" stroke="var(--blue)" stroke-width="5" stroke-linecap="round" class="nw13-blade"/><line x1="${x}" y1="80" x2="${x}" y2="${80 + 34 * f}" stroke="var(--blue)" stroke-width="5" stroke-linecap="round"/><text x="${x}" y="160" class="nw13-lab" style="text-anchor:middle">${lab} ${Math.round(f * 100)}%</text></g>`;
      qs("[data-s]", b).innerHTML =
        `<svg class="fig" viewBox="0 0 460 172" style="max-height:200px" role="img" aria-label="Wind blows from the left onto a front turbine. A back turbine stands ${g} rotor widths behind it, inside the wake, and makes ${Math.round(frac * 100)} percent of full power.">${cone}<text x="8" y="58" class="nw13-lab">wind →</text>${tb(70, 1, "front")}${tb(x2, frac, "back")}<text x="${(70 + x2) / 2}" y="${80 - 28 - g * 2}" class="nw13-tk" style="fill:var(--rose-ink)">wake</text></svg>`;
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat teal"><small>Back turbine power</small><b>${Math.round(frac * 100)}%</b></div><div class="wk-stat amber"><small>Cable cost</small><b>£${cable.toFixed(1)}m</b></div>`;
    };
    sl.onInput(draw);
    draw(3);
  }
  /** Three layouts plotted one at a time: each layout becomes a point (cost, power). */
  function vectorFig(b) {
    const show = ["B", "D", "I"];
    let n = 0;
    const fr = frame(FARM_O);
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Plot the next layout</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      qs("[data-p]", b).innerHTML = fr.wrap(
        show
          .slice(0, n)
          .map((k) => dot(fr, k, FARM[k], { ring: k === show[n - 1], lab: `${k} (${FARM[k][0]}, ${FARM[k][1]})` }))
          .join(""),
        `Objective space: cost across, power up. ${n} of 3 layouts plotted.`,
      );
      qs("[data-n]", b).innerHTML = n
        ? `Layout <b>${show[n - 1]}</b> costs £${FARM[show[n - 1]][0]}m and makes ${FARM[show[n - 1]][1]} MW: its objective vector is <b>(${FARM[show[n - 1]].join(", ")})</b>.`
        : "Each layout is a whole design: where every turbine stands. Press the button to score one.";
    };
    qs("[data-a]", b).onclick = () => {
      n = (n % 3) + 1;
      draw();
    };
    draw();
  }
  const MIN = pts("P 1.5 7, Q 3 9, R 3.5 5.5, S 5 8.5, T 6 3.5, U 7.5 6.5, V 8.5 2");
  const MIN_O = {
    pts: MIN,
    s: [1, 1],
    xr: [0, 10],
    yr: [0, 10],
    xl: "f₁ ← minimise",
    yl: "↓ minimise f₂",
    nx: 5,
    ny: 5,
  };
  /** Same ten points, three different goals: the front moves to a different corner. */
  function frontFig(b) {
    const P = pts("a 1 9, b 2 4, c 3 7, d 4 2, e 5 9.5, f 6 5, g 7 8, h 8 1.5, i 9 6, j 9.5 3");
    const ids = Object.keys(P);
    const G = {
      mm: [[1, 1], "Minimise both"],
      xx: [[-1, -1], "Maximise both"],
      mx: [[1, -1], "Minimise f₁, maximise f₂"],
    };
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = (k) => {
      const s = G[k][0],
        r = ranks(
          ids.map((i) => P[i]),
          s,
        ),
        fr = frame({
          xr: [0, 10],
          yr: [0, 10],
          xl: s[0] > 0 ? "f₁ ← better" : "f₁ better →",
          yl: s[1] > 0 ? "↓ better f₂" : "↑ better f₂",
        });
      const fp = ids.filter((_, i) => r[i] === 0);
      qs("[data-p]", b).innerHTML = fr.wrap(
        joinLine(
          fr,
          fp.map((i) => P[i]),
        ) + ids.map((i, n) => dot(fr, i, P[i], { c: r[n] === 0 ? "teal" : "dim" })).join(""),
        `${G[k][1]}: the Pareto front is ${fp.join(", ")}.`,
      );
      qs("[data-n]", b).innerHTML =
        `${G[k][1]}: the front is <b>${fp.join(", ")}</b> (${fp.length} of 10). Nobody beats these on both objectives at once.`;
    };
    qs("[data-c]", b).append(
      N.seg(
        Object.entries(G).map(([k, v]) => [k, v[1]]),
        "mm",
        draw,
      ),
    );
    draw("mm");
  }
  /** Two approximations of the same front: evenly spread and wide, or clumped and narrow. */
  function spreadFig(b) {
    const SETS = {
      good: [
        [1, 8],
        [2.5, 5],
        [4, 3.5],
        [6, 2],
        [8, 1],
      ],
      bad: [
        [2, 7],
        [2.4, 6.3],
        [2.8, 5.8],
        [6, 2.3],
        [6.6, 2],
        [7.2, 1.8],
      ],
    };
    const fr = frame({ xr: [0, 10], yr: [0, 10], xl: "f₁ ← minimise", yl: "↓ minimise f₂" });
    const tf = (x) => 8.4 / (x + 0.05) - 0.05;
    const truth = Array.from({ length: 40 }, (_, i) => 0.95 + (i * 7.3) / 39).map((x) => [x, Math.min(9.8, tf(x))]);
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><div class="nw13-stats" data-t></div>`;
    const draw = (k) => {
      const S = SETS[k];
      const gaps = S.slice(1).map((p, i) => Math.hypot(p[0] - S[i][0], p[1] - S[i][1]));
      qs("[data-p]", b).innerHTML = fr.wrap(
        joinLine(fr, truth, "line-2", "4 4") + S.map((p, i) => dot(fr, i + 1, p, { c: "teal", lab: false })).join(""),
        `${k === "good" ? "Good" : "Not so good"} approximation: ${S.length} points on the dashed true front.`,
      );
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat blue"><small>Width covered (f₁)</small><b>${(S[S.length - 1][0] - S[0][0]).toFixed(1)}</b></div><div class="wk-stat amber"><small>Largest gap</small><b>${Math.max(...gaps).toFixed(1)}</b></div>`;
    };
    qs("[data-c]", b).append(
      N.seg(
        [
          ["good", "Good"],
          ["bad", "Not so good"],
        ],
        "good",
        draw,
      ),
    );
    draw("good");
  }

  N.register({
    id: "l13-pareto",
    lecture: 13,
    order: 1,
    num: "13.1",
    title: "Trade-offs and Pareto dominance",
    blurb: "Cheap or powerful? When two goals fight, compare solutions by dominance and look for the Pareto front.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Eleven wind farm layouts, each scored by <b>cost</b> (lower is better) and <b>power</b> (higher is better). Tap a layout to see what it beats and what beats it, then show the <b>Pareto front</b>.",
        ),
      );
      const card = el(
        `<div class="card nw13-demo"><div class="card-head"><h2>Wind farm layouts</h2></div><div data-box></div></div>`,
      );
      root.appendChild(card);
      explorer(qs("[data-box]", card), life, { ...FARM_O, front: true });
      root.appendChild(
        pr(
          "l13-pareto-1",
          "Tap layout <b>G</b>. Which layouts dominate it? | Only D | D and K | None: G is on the front | D is cheaper (£40m against £45m) and makes more power (62 against 58 MW). K makes more power but costs more, so it does not beat G on both.",
        ),
      );
      root.appendChild(
        pr(
          "l13-pareto-2",
          "Show the front. K costs more than D, yet both are on it. Why? | K makes more power than D, so D does not beat it on both | K is the cheapest of the layouts that make over 60 MW | Every layout that costs over £40m is on the front | D wins on cost and K wins on power, so neither dominates the other. Being on the front needs only that nobody beats you on every objective.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A multi-objective problem scores a solution with an <b>objective vector</b> $(f_1(x), \\dots, f_M(x))$, not one number.",
            "<b>a dominates b</b> if a is at least as good on every objective and strictly better on at least one.",
            "Two solutions where each wins somewhere are <b>mutually non-dominating</b>.",
            "The non-dominated solutions form the <b>Pareto front</b>; a good approximation is <b>evenly spaced</b> and <b>covers</b> the whole front.",
          ],
          "No single best answer: a set of best trade-offs.",
        ),
      );
    },
  });

  L["l13-pareto"] = {
    sum: "Multi-objective problems score each solution with an objective vector. Solutions are compared by Pareto dominance, the non-dominated ones form the Pareto front, and a good approximation is evenly spread and wide.",
    steps: [
      {
        t: "Two goals that pull apart",
        b: `<p>Planning an offshore wind farm, you want the <b>lowest cost</b> and the <b>most power</b> at once. They fight. A turbine standing in the <b>wake</b> of another (its wind shadow) makes less power, so you spread the turbines out, and spreading them out needs more cable and sea area.</p><p>In this toy model, at 3 rotor widths apart the back turbine makes about 83% of full power. At 9 widths it makes about 96%, but the cable costs £9m more. Slide the gap and watch both numbers move together.</p>`,
        v: (b, life) => wakeFig(b, life),
        c: C(
          "In the toy farm you move the back turbine further from the front one. What happens? | Power goes up and cost goes up | Power goes up and cost goes down | Power goes down and cost goes up | Leaving the wake raises power, and the longer cable raises cost. Improving one objective makes the other worse: that is a trade-off.",
        ),
      },
      {
        t: "A score with two numbers",
        b: `<p>In single-objective search a solution $x$ gets one fitness number. Here it gets an <b>objective vector</b>: one number per objective. Layout B costs £25m and makes 42 MW, so its vector is $(25, 42)$, a point in <b>objective space</b>.</p><p>Press the button to plot three layouts. Each whole design, every turbine position, collapses to one point.</p><details class="math-more"><summary>Show the maths</summary><p>For $M$ objectives the quality of $x$ is the vector</p>$$\\mathbf{y}=\\big(f_1(\\mathbf{x}),\\,f_2(\\mathbf{x}),\\,\\dots,\\,f_M(\\mathbf{x})\\big)$$<p>subject to any feasibility constraints. Here $M=2$: $f_1$ is cost and $f_2$ is power.</p></details>`,
        v: (b) => vectorFig(b),
        c: C(
          "A ferry timetable is scored on cost, average wait and fuel used. How many numbers are in each objective vector? | 3 | 1 | 2 | One number per objective, so M = 3. Nothing is added up into a single score.",
        ),
      },
      {
        t: "When one solution dominates another",
        b: `<p>With two numbers each, 'better' needs a rule. Solution <b>a dominates b</b> if a is <b>at least as good on every objective</b> and <b>strictly better on at least one</b>.</p><p>Minimising both: $(2, 3)$ dominates $(4, 5)$, better on both. $(2, 3)$ also dominates $(2, 5)$: a tie on $f_1$, better on $f_2$. Tap a point below: green is what it dominates, red is what dominates it.</p><details class="math-more"><summary>Show the maths</summary><p>For minimisation, $\\mathbf{a}$ dominates $\\mathbf{b}$, written $\\mathbf{a}\\prec\\mathbf{b}$, when</p>$$\\forall i:\\ f_i(\\mathbf{a})\\le f_i(\\mathbf{b})\\quad\\text{and}\\quad\\exists j:\\ f_j(\\mathbf{a})<f_j(\\mathbf{b})$$<p>For an objective you maximise, flip that objective's inequalities.</p></details>`,
        v: (b, life) => explorer(b, life, MIN_O),
        c: C(
          "Minimising both, solution X scores (3, 4) and Y also scores (3, 4). Which dominates? | Neither: no objective is strictly better | X: it was found first in the run | Both: each one dominates the other | Domination needs strictly better on at least one objective. Equal vectors tie everywhere, so neither dominates.",
        ),
      },
      {
        t: "Neither wins",
        b: `<p>Often each solution wins somewhere. Minimising both, $(2, 6)$ is better on $f_1$ but $(5, 3)$ is better on $f_2$. Neither dominates, so they are <b>mutually non-dominating</b>: both are reasonable trade-offs.</p><p>Tap any two points to compare them objective by objective.</p>`,
        v: (b, life) => explorer(b, life, { ...MIN_O, pair: true }),
        c: C(
          "Minimising both: R is (3.5, 5.5) and T is (6, 3.5). What is their relation? | Mutually non-dominating: R wins on f₁ and T wins on f₂ | R dominates T because R has the smaller first objective | T dominates R because T has the smaller sum of objectives | Each one is better on one objective, so neither dominates. Adding the numbers up is not part of dominance.",
        ),
      },
      {
        t: "The Pareto front",
        b: `<p>Keep only the solutions that <b>nobody dominates</b>. They line up along a curve called the <b>Pareto front</b>: the best trade-offs on offer. Moving along it, you can only gain on one objective by losing on another.</p><p>Which corner it hugs depends on the goal. Switch between the three goals: the ten points stay put, the front moves.</p>`,
        v: (b) => frontFig(b),
        c: C(
          "Two objectives are both maximised. Towards which corner of the plot does the Pareto front bulge? | Top right, where both values are large | Bottom left, where both values are small | Top left, where f₁ is small and f₂ large | Maximising both, better means larger, so the non-dominated points sit up and to the right.",
        ),
      },
      {
        t: "A good approximation of the front",
        b: `<p>A search returns a <b>set</b> of non-dominated points: an approximation of the true front (dashed). Two things make it good: the points are <b>evenly spaced</b>, and they <b>cover the largest possible area</b> of the front.</p><p>Compare the two sets. The clumped one leaves a big gap in the middle and misses both ends, so whoever picks a design has fewer real choices.</p>`,
        v: (b) => spreadFig(b),
        c: C(
          "Two runs give five front points each. Run 1 has all five within a small patch of the front. Run 2 spreads them from end to end. Which is better? | Run 2, because it is evenly spread and covers more of the front | Run 1, because points close together are more accurate | They are equally good, since both found five non-dominated points | A good approximation is spread out and wide, so decision makers can see the whole range of trade-offs.",
        ),
      },
      {
        t: "From a GA to a multi-objective GA",
        b: `<p>We keep the <b>generational GA</b> of Lectures 3 and 4 and change three things: the fitness becomes <b>several objectives</b>, selection uses the <b>dominance</b> criterion, and the result is shown as a <b>Pareto front approximation</b> (a curve for two objectives, a surface for three).</p>`,
        v: F.compare(
          {
            title: "Single-objective GA",
            c: "blue",
            body: "one fitness number<br>pick the fitter parent<br>return the best solution",
          },
          {
            title: "Multi-objective GA",
            c: "teal",
            body: "an objective vector<br>select with dominance<br>return a front: a set of solutions",
          },
        ),
        c: C(
          "What does a multi-objective GA hand back at the end of a run? | A set of trade-off solutions approximating the front | The single solution with the best total of all objectives | Only the cheapest solution that it ever found | The goal is the Pareto front, so the output is a set of non-dominated solutions to choose from.",
        ),
      },
    ],
    guide: [
      "Tap a layout and read which layouts it dominates and which dominate it.",
      "Press <b>Show Pareto front</b> and count the green layouts.",
      "Tap <b>K</b> and <b>D</b> in turn and compare their cost and power.",
      "Answer the questions after the demo.",
    ],
  };
})();
