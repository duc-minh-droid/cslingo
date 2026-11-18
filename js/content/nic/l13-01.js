/* l13-01: Lectures 13-14 (multi-objective evolutionary algorithms): shared kernel (dominance, sorting, crowding, plots) and the figures of 13.1 and 13.2 (trade-offs, dominance, the Pareto front). The lessons are in l13-04.js. */
(function () {
  const N = NIC;
  const { el, qs } = N;
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

  Object.assign(sh, { wakeFig, vectorFig, MIN_O, frontFig, spreadFig });
})();
