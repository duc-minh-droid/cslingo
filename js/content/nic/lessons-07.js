(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { addV, chips, g } = partScope;
  const FG = NIC.fig;

  // ---------- live figures for the steps that used to lean on formulas ----------
  const HR = 31557600;
  /** log10 of a count -> "19,683" or "1.2 × 10<sup>40</sup>" */
  const sci = (l10) =>
    l10 < 6
      ? Math.round(10 ** l10).toLocaleString("en-GB")
      : `${(10 ** (l10 % 1)).toFixed(1)} × 10<sup>${Math.floor(l10)}</sup>`;
  /** how long that many tries take at a billion a second */
  const when = (l10) => {
    const s = 10 ** (l10 - 9),
      y = s / HR,
      r = Math.round;
    if (s < 0.5) return "no time at all";
    if (s < 1.5) return "about a second";
    if (s < 120) return `${r(s)} seconds`;
    if (s < 7200) return `${r(s / 60)} minutes`;
    if (s < 172800) return `${r(s / 3600)} hours`;
    if (y < 1) return `${r(s / 86400)} days`;
    if (y < 1e3) return `${r(y)} years`;
    if (y < 1e6) return `${r(y / 1e3)} thousand years`;
    if (y < 1e9) return `${r(y / 1e6)} million years`;
    if (y < 1.4e10) return `${(y / 1e9).toFixed(1)} billion years`;
    return `${sci(Math.log10(y / 1.38e10))} times the age of the universe`;
  };
  const tile = (t, c = "var(--line-2)") =>
    `<span style="display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 4px;border:2px solid ${c};border-radius:8px;background:var(--panel-2);font:800 13px var(--sans);color:var(--ink)">${t}</span>`;
  const note = (t) => `<p class="dim" style="margin:8px 0 0;font-weight:700">${t}</p>`;
  /** bar rows that keep their DOM, so a slider can slide them. rows: [{l, c}]; returns set([{w 0..1, t}]) */
  const barRows = (host, rows) => {
    host.className = "fig-bars";
    host.innerHTML = rows
      .map(
        (d) =>
          `<div class="fb-row" style="grid-template-columns:minmax(90px,auto) 1fr minmax(84px,auto)"><span class="fb-l">${d.l}</span><span class="fb-track"><span class="fb-fill" style="--w:0.005;background:var(--${d.c});transition:transform .25s"></span></span><span class="fb-v"></span></div>`,
      )
      .join("");
    const r = [...host.children];
    return (vals) =>
      vals.forEach((v, i) => {
        r[i].querySelector(".fb-fill").style.setProperty("--w", Math.max(0.005, v.w));
        r[i].querySelector(".fb-v").innerHTML = v.t;
      });
  };
  /** a slider with a figure underneath that redraws on every move. build(out) returns draw(value) */
  const live = (box, { label, min, max, value, step = 1, fmt, build }) => {
    const s = NIC.slider(label, min, max, step, value, fmt);
    const out = NIC.el('<div style="margin-top:12px"></div>');
    box.append(NIC.el('<div style="margin-bottom:4px"></div>'), out);
    box.firstChild.append(s);
    const draw = build(out);
    s.onInput(draw);
    draw(value);
  };
  /** n choices of k options each: the number of combinations is k^n, and an optional faster method for comparison */
  const choicesFig = (box, o) => {
    const { l10, alt, tiles, say } = o;
    const top = Math.max(l10(o.max), 1) + 1;
    live(box, {
      label: o.label,
      min: o.min,
      max: o.max,
      value: o.value,
      build(out) {
        out.innerHTML =
          '<div class="lf-t" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px"></div><div class="lf-b"></div><div class="lf-s"></div>';
        const set = barRows(
          out.querySelector(".lf-b"),
          [{ l: o.mainLabel, c: "rose" }].concat(alt ? [{ l: alt.label, c: "teal" }] : []),
        );
        return (n) => {
          const a = l10(n),
            b = alt ? alt.l10(n) : 0;
          const ts = tiles(n);
          out.querySelector(".lf-t").innerHTML =
            ts
              .slice(0, 14)
              .map((t) => tile(t))
              .join("") + (ts.length > 14 ? tile("…") : "");
          set([{ w: (a + 1) / top, t: sci(a) }].concat(alt ? [{ w: (b + 1) / top, t: sci(b) }] : []));
          out.querySelector(".lf-s").innerHTML = note(
            say(n, a, b) + ` Trying them all at a billion a second would take <b>${when(a)}</b>. Bars count digits.`,
          );
        };
      },
    });
  };
  const H = (n) => Array.from({ length: n }, (_, i) => 1 / (i + 1)).reduce((s, v) => s + v, 0);
  const WEASEL = [..."METHINKS IT IS LIKE A WEASEL"].map((c) => (c === " " ? "·" : c));
  const monkeyFig = (box) =>
    choicesFig(box, {
      label: "Letters in the target",
      min: 1,
      max: 28,
      value: 3,
      mainLabel: "monkey",
      l10: (n) => n * Math.log10(27),
      alt: { label: "keep-if-better", l10: (n) => Math.log10(27 * n * H(n)) },
      tiles: (n) => WEASEL.slice(0, n),
      say: (n, a, b) =>
        `The monkey must hit all ${n} letters in one go: about <b>${sci(a)}</b> tries. Keep-if-better fixes a letter at a time: about <b>${sci(b)}</b>.`,
    });
  const bitsFig = (box) =>
    live(box, {
      label: "Items",
      min: 1,
      max: 5,
      value: 3,
      build: (out) => (n) => {
        const all = Array.from({ length: 2 ** n }, (_, i) => i.toString(2).padStart(n, "0"));
        out.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px">${all.map((s) => g(s, (i) => (i === n - 1 ? "p2" : ""))).join("")}</div>${note(`${n} item${n > 1 ? "s" : ""} give <b>${2 ** n}</b> subsets. Adding an item copies the whole list, then puts a 0 on one copy and a 1 on the other.`)}`;
      },
    });
  const lg = (x) => Math.log10(x);
  const logFact = (n) => Array.from({ length: n }, (_, i) => lg(i + 1)).reduce((s, v) => s + v, 0);
  const toursFig = (box) =>
    choicesFig(box, {
      label: "Cities",
      min: 3,
      max: 20,
      value: 5,
      mainLabel: "tours",
      l10: (k) => logFact(k - 1) - lg(2),
      tiles: (k) => ["3 cities: 1"].concat(Array.from({ length: k - 3 }, (_, i) => `× ${i + 3}`)),
      say: (k, a) =>
        `A ${k}th city can join the loop in any of ${k - 1} gaps. That makes <b>${sci(a)}</b> different tours in all.`,
    });
  const growthFig = (box, o) =>
    live(box, {
      label: "Problem size n",
      min: o.min,
      max: o.max,
      value: o.value,
      build(out) {
        out.innerHTML = '<div class="lf-b"></div><div class="lf-s"></div>';
        const set = barRows(out.firstChild, [
          { l: o.a.l, c: "teal" },
          { l: o.b.l, c: "rose" },
        ]);
        return (n) => {
          const x = o.a.f(n),
            y = o.b.f(n),
            hi = Math.max(x, y);
          const fm = (v) => (v < 1e6 ? v.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : sci(lg(v)));
          set([
            { w: x / hi, t: fm(x) },
            { w: y / hi, t: fm(y) },
          ]);
          out.lastChild.innerHTML = note(o.say(n, x, y));
        };
      },
    });
  const COLS = ["blue", "violet", "amber", "rose", "teal", "blue", "violet", "amber"];
  const tint = (c) => `color-mix(in srgb, var(--${c}) 38%, var(--panel))`;
  /** a roulette wheel: slice i is vals[i]'s share of the total */
  const wheelSvg = (vals) => {
    const tot = vals.reduce((s, v) => s + v, 0);
    let a0 = -Math.PI / 2;
    const P = (a, r) => [(100 + r * Math.cos(a)).toFixed(1), (100 + r * Math.sin(a)).toFixed(1)];
    const slices = vals
      .map((v, i) => {
        const a1 = a0 + (v / tot) * Math.PI * 2 - 1e-4,
          mid = (a0 + a1) / 2,
          c = COLS[i],
          [x0, y0] = P(a0, 86),
          [x1, y1] = P(a1, 86),
          [tx, ty] = P(mid, 55);
        const d = `M100 100 L${x0} ${y0} A86 86 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
        const lab =
          v / tot > 0.06
            ? `<text x="${tx}" y="${+ty + 5}" text-anchor="middle" style="font:900 14px var(--sans);fill:var(--ink)">${Math.round((v / tot) * 100)}%</text>`
            : "";
        a0 += (v / tot) * Math.PI * 2;
        return `<path d="${d}" fill="${tint(c)}" stroke="var(--${c})" stroke-width="2.5"/>${lab}`;
      })
      .join("");
    return `<svg viewBox="0 -4 200 208" role="img" aria-label="Roulette wheel with slices sized by fitness: ${vals.join(", ")}" style="width:100%;max-width:210px;display:block">${slices}<path d="M92 -4 L108 -4 L100 12 Z" fill="var(--text)"/></svg>`;
  };
  const wheelFig = (vals, labels) => {
    const tot = vals.reduce((s, v) => s + v, 0);
    const key = vals.map(
      (v, i) =>
        `<span style="font-weight:800;color:var(--ink)"><span style="display:inline-block;width:14px;height:14px;border-radius:5px;margin-right:8px;vertical-align:-2px;background:${tint(COLS[i])};border:2px solid var(--${COLS[i]})"></span>${labels ? labels[i] : `fitness ${v}`}: ${v / tot < 0.005 ? "under 1" : Math.round((v / tot) * 100)}%</span>`,
    );
    return `<div style="display:flex;flex-wrap:wrap;gap:14px 22px;align-items:center;justify-content:center">${wheelSvg(vals)}<div style="display:grid;gap:6px">${key.join("")}</div></div>`;
  };
  const shiftWheel = (box) =>
    live(box, {
      label: "Add to every fitness",
      min: 0,
      max: 500,
      step: 10,
      value: 0,
      fmt: (v) => `+${v}`,
      build: (out) => (d) => {
        const f = [100, 0.4, 0.3, 0.2, 0.1].map((v) => v + d);
        const share = Math.round((f[0] / f.reduce((s, v) => s + v, 0)) * 100);
        out.innerHTML =
          wheelFig(
            f,
            f.map((v) => `fitness ${+v.toFixed(1)}`),
          ) + note(`The order never changes, yet the best one's slice is <b>${share}%</b>.`);
      },
    });
  /** rank blocks: the rank-r individual owns r blocks, and all the blocks together make the wheel */
  const rankBlocks = (box) =>
    live(box, {
      label: "Population size",
      min: 3,
      max: 8,
      value: 4,
      build: (out) => (P) => {
        const tot = (P * (P + 1)) / 2;
        const blocks = (r) =>
          Array.from(
            { length: r },
            () =>
              `<i style="width:20px;height:20px;border-radius:5px;background:${tint(COLS[P - r])};border:2px solid var(--${COLS[P - r]})"></i>`,
          ).join("");
        const row = (r) =>
          `<div style="display:flex;align-items:center;gap:10px;margin:4px 0"><span class="dim" style="width:64px;font-weight:700">${r === P ? "best" : r === 1 ? "worst" : `rank ${r}`}</span><span style="display:flex;gap:3px;min-width:${P * 23}px">${blocks(r)}</span><b style="color:var(--ink)">${r} of ${tot} = ${Math.round((r / tot) * 100)}%</b></div>`;
        out.innerHTML =
          Array.from({ length: P }, (_, i) => row(P - i)).join("") +
          note(`Count every block: <b>${tot}</b> in all. The raw fitness values never appear, only the order.`);
      },
    });
  const biasFig = (box) =>
    live(box, {
      label: "Bias b",
      min: 0,
      max: 3,
      step: 0.1,
      value: 1,
      fmt: (v) => v.toFixed(1),
      build(out) {
        const set = barRows(
          out,
          ["rank 4 (best)", "rank 3", "rank 2", "rank 1 (worst)"].map((l) => ({ l, c: "violet" })),
        );
        return (b) => {
          const w = [4, 3, 2, 1].map((r) => r ** b),
            t = w.reduce((s, v) => s + v, 0);
          set(w.map((v) => ({ w: v / t / 0.7, t: `${Math.round((v / t) * 100)}%` })));
        };
      },
    });
  /** tournament of size t among 4 ranked individuals: the exact chances, plus a button that really runs 1,000 */
  const tournFig = (box) => {
    let seen = null;
    live(box, {
      label: "Tournament size t",
      min: 1,
      max: 8,
      value: 2,
      build(out) {
        out.innerHTML = '<div class="lf-b"></div><div class="lf-m"></div><div class="lf-s"></div>';
        const set = barRows(
          out.querySelector(".lf-b"),
          ["best", "2nd", "3rd", "worst"].map((l) => ({ l, c: "teal" })),
        );
        const btn = NIC.el(
          '<button class="btn small" type="button" style="margin-top:10px">Run 1,000 tournaments</button>',
        );
        out.querySelector(".lf-m").append(btn);
        let t = 2;
        const show = () => {
          const ex = [4, 3, 2, 1].map((i) => (i / 4) ** t - ((i - 1) / 4) ** t);
          set(
            ex.map((p, i) => ({
              w: p,
              t: `${Math.round(p * 100)}%${seen ? ` <small>saw ${Math.round(seen[i] * 100)}%</small>` : ""}`,
            })),
          );
          out.querySelector(".lf-s").innerHTML = note(
            `Each draw misses the best 3 times in 4. Missing it ${t} time${t > 1 ? "s" : ""} running happens ${Math.round(0.75 ** t * 100)}% of the time, so the best wins the rest.`,
          );
        };
        btn.onclick = () => {
          const w = [0, 0, 0, 0];
          for (let k = 0; k < 1000; k++)
            w[Math.min(...Array.from({ length: t }, () => Math.floor(Math.random() * 4)))]++;
          seen = w.map((v) => v / 1000);
          show();
        };
        return (v) => {
          t = v;
          seen = null;
          show();
        };
      },
    });
  };
  Object.assign(partScope, {
    monkeyFig,
    bitsFig,
    choicesFig,
    sci,
    toursFig,
    growthFig,
    shiftWheel,
    wheelFig,
    rankBlocks,
    biasFig,
    tournFig,
  });

  addV(
    "l4-replacement",
    3,
    FG.cells([{ v: 0.3 }, { v: 0.5 }, { v: 0.2, c: "amber", sub: "= child?" }, { v: 0.9 }], { label: "child 0.2 →" }) +
      `<div class="fig-cap">The slides only work if a tie counts as weaker.</div>`,
  );
  addV(
    "l4-pressure",
    0,
    FG.plot(
      [
        { f: (g) => 0.3 + 0.15 * g, c: "violet", dash: "5 4", label: "too little" },
        { f: (g) => 0.3 + 0.62 * (1 - Math.exp(-0.6 * g)), c: "teal", label: "just right" },
        { f: (g) => 0.3 + 0.35 * (1 - Math.exp(-2.5 * g)), c: "rose", label: "too much" },
      ],
      { x: [0, 4], y: [0.2, 1], xl: "generations →", yl: "best fitness", h: 190 },
    ),
  );
  addV(
    "l4-pressure",
    1,
    FG.cells([{ v: "5" }, { v: "3" }, { v: "7" }, { v: "4" }, { v: "6" }], { label: "random picks:" }) +
      `<div class="fig-cap">Every individual equally likely: the fit ones get no advantage, so nothing improves.</div>`,
  );
  addV(
    "l4-pressure",
    2,
    FG.frames([
      {
        t: "generation 0: varied",
        v: chips([
          ["", 5],
          ["", 9, "winner"],
          ["", 3],
          ["", 7],
        ]),
      },
      {
        t: "generation 3: all copies of one",
        v: chips([
          ["", 9, "winner"],
          ["", 9, "winner"],
          ["", 9, "winner"],
          ["", 9, "winner"],
        ]),
      },
    ]),
  );
  addV(
    "l4-pressure",
    3,
    FG.cells([{ v: "tournament size t" }, { v: "rank bias" }, { v: "elitism count" }], {
      label: "pressure knobs:",
      size: 120,
    }),
  );
  addV(
    "l4-roulette",
    4,
    FG.compare(
      {
        title: "Minimising (tour length)",
        c: "rose",
        body: "longest tour gets the <b>biggest</b> slice: the worst are favoured",
      },
      { title: "Negative fitness", c: "rose", body: "a slice can't have negative size: roulette breaks" },
    ),
  );
  addV(
    "l4-rank",
    2,
    FG.bars(
      [
        ["rank 4 (best)", 40, "teal", "%"],
        ["rank 3", 30, "teal", "%"],
        ["rank 2", 20, "teal", "%"],
        ["rank 1", 10, "teal", "%"],
      ],
      { max: 40 },
    ) + `<div class="fig-cap">Probability = rank / (1+2+3+4). The actual fitness numbers never appear.</div>`,
  );
  addV(
    "l4-tournament",
    0,
    FG.frames([
      {
        t: "draw t = 2 at random (with replacement)",
        v: chips([
          ["", 5, "picked"],
          ["", 2],
          ["", 8, "picked"],
          ["", 3],
        ]),
      },
      { t: "the fitter of the two wins", v: chips([["winner", 8, "winner"]]) },
    ]),
  );
  addV(
    "l4-tournament",
    2,
    FG.bars(
      [
        ["t = 1", 25, "violet", "%"],
        ["t = 2", 43.75, "teal", "%"],
        ["t = 3", 57.8, "amber", "%"],
        ["t = 5", 76.3, "rose", "%"],
      ],
      { max: 100 },
    ) + `<div class="fig-cap">Chance the best of 4 wins its tournament. Bigger t = more pressure.</div>`,
  );
  addV(
    "l4-tournament",
    4,
    FG.compare(
      { title: "Pros", c: "teal", body: "tunable · only compares (no superfit problems) · no sorting" },
      { title: "Cons", c: "rose", body: "one more parameter, t, to tune" },
    ),
  );
  addV(
    "l4-mutation",
    1,
    FG.compare(
      { title: "Exploitation", c: "teal", body: "small changes: the child is probably still good" },
      { title: "Exploration", c: "violet", body: "able, in principle, to reach <b>anywhere</b> in the space" },
    ),
  );
  addV(
    "l4-lab",
    0,
    `<div class="pixel-grid target" style="grid-template-columns:repeat(12,1fr);max-width:180px">${"000000000000011100011100111110111110111111111111111111111111111111111111011111111110001111111100000111111000000011110000000001100000000000000000"
      .split("")
      .map((b) => `<i class="${b === "1" ? "on" : ""}"></i>`)
      .join(
        "",
      )}</div><div class="fig-cap" style="text-align:left">Target: a 12 × 12 heart = 144 bits. Fitness = fraction of matching pixels.</div>`,
  );
})();
