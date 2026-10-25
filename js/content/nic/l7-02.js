/* l7-02: Lecture 7: 7.2 the double bridge experiment (a small colony simulation shared with the workshop). */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.nicL7 = NIC.shared.nicL7 || {});
  const { mulberry } = sh;

  // ---------- the bridge model ----------
  // One ant leaves the nest each tick. It picks a branch with weight (K + trail)^2 and lays one unit of
  // pheromone on that branch when it arrives, so a short branch is paid sooner. Trails lose EVAP per tick.
  const SHORT = 5,
    TICKS = 150,
    K = 2,
    EVAP = 0.01;
  function bridge(seed, longLen, rnd) {
    const r = rnd || mulberry(seed),
      len = [SHORT, longLen],
      tau = [0, 0],
      due = [],
      picks = [],
      tu = [],
      tl = [];
    for (let t = 0; t < TICKS; t++) {
      tau[0] *= 1 - EVAP;
      tau[1] *= 1 - EVAP;
      for (let i = due.length - 1; i >= 0; i--)
        if (due[i][0] <= t) {
          tau[due[i][1]] += 1;
          due.splice(i, 1);
        }
      const w0 = (K + tau[0]) ** 2,
        w1 = (K + tau[1]) ** 2,
        b = r() < w0 / (w0 + w1) ? 0 : 1;
      picks.push(b);
      due.push([t + len[b], b]);
      tu.push(tau[0]);
      tl.push(tau[1]);
    }
    return { picks, tu, tl, len };
  }
  const upShare = (picks) => picks.filter((b) => b === 0).length / picks.length;
  /** "up", "down" or "split" by the last 40 ants */
  const outcome = (b) => {
    const f = upShare(b.picks.slice(-40));
    return f >= 0.8 ? "up" : f <= 0.2 ? "down" : "split";
  };
  const tally = (longLen, n, from = 1) => {
    const t = { up: 0, down: 0, split: 0 };
    for (let s = from; s < from + n; s++) t[outcome(bridge(s, longLen))]++;
    return t;
  };
  const decisive = (longLen, want = "up") => {
    for (let s = 1; s < 400; s++) if (outcome(bridge(s, longLen)) === want) return s;
    return 1;
  };
  Object.assign(sh, { bridge, upShare, outcome, tally, decisive, SHORT, TICKS });

  // ---------- drawing ----------
  const bez = (p0, c, p2, s) => [
    (1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * c[0] + s * s * p2[0],
    (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * c[1] + s * s * p2[1],
  ];
  /** the two-branch bridge. o: {lenL, tU, tL, at, picks} (picks + at draw the ants on the branches at tick `at`) */
  function bridgeSVG(o) {
    const P0 = [50, 110],
      P2 = [410, 110],
      hU = 20 + (SHORT - 5) * 4,
      hL = 20 + ((o.lenL - SHORT) / SHORT) * 20 + (o.lenL > SHORT ? 20 : 0);
    const cU = [230, 110 - hU * 2],
      cL = [230, 110 + hL * 2],
      wd = (v) => (2.5 + Math.min(13, v / 4)).toFixed(1);
    const path = (c, w, col) =>
      `<path d="M${P0[0]} ${P0[1]} Q${c[0]} ${c[1]} ${P2[0]} ${P2[1]}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="0.85"/>`;
    let ants = "";
    if (o.picks && o.at !== undefined) {
      o.picks.slice(0, o.at + 1).forEach((b, i) => {
        const len = b === 0 ? SHORT : o.lenL,
          s = (o.at - i) / len;
        if (s >= 0 && s < 1) {
          const [x, y] = bez(P0, b === 0 ? cU : cL, P2, s);
          ants += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="var(--text)"/>`;
        }
      });
    }
    const label = `Double bridge: upper branch ${SHORT} long, lower branch ${o.lenL} long. Trail strength upper ${o.tU.toFixed(0)}, lower ${o.tL.toFixed(0)}.`;
    return `<svg class="fig" viewBox="0 0 460 ${Math.round(110 + hL + 40)}" style="max-height:260px" role="img" aria-label="${label}">
      ${path(cU, wd(o.tU), "var(--blue)")}${path(cL, wd(o.tL), "var(--amber)")}${ants}
      <circle cx="${P0[0]}" cy="${P0[1]}" r="22" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2.5"/><text x="${P0[0]}" y="${P0[1] + 4}" class="fig-n" style="font-size:12px">Nest</text>
      <circle cx="${P2[0]}" cy="${P2[1]}" r="22" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2.5"/><text x="${P2[0]}" y="${P2[1] + 4}" class="fig-n" style="font-size:12px">Food</text>
      <text x="230" y="${(110 - hU - 8).toFixed(0)}" class="fig-sub" style="fill:var(--blue)">upper: ${SHORT} long, trail ${o.tU.toFixed(0)}</text>
      <text x="230" y="${(110 + hL + 24).toFixed(0)}" class="fig-sub" style="fill:var(--amber)">lower: ${o.lenL} long, trail ${o.tL.toFixed(0)}</text></svg>`;
  }
  const rolling = (picks, w = 10) => picks.map((_, i) => 100 * upShare(picks.slice(Math.max(0, i - w + 1), i + 1)));
  Object.assign(sh, { bridgeSVG, rolling });
  const seed10 = decisive(10),
    seedEq = (() => {
      for (let s = 1; s < 400; s++) {
        const b = bridge(s, SHORT),
          f = upShare(b.picks.slice(0, 20));
        if (outcome(b) === "up" && f >= 0.4 && f <= 0.6) return s;
      }
      return 1;
    })();
  const frozen = (len, seed, at = TICKS - 1) => {
    const b = bridge(seed, len);
    return bridgeSVG({ lenL: len, tU: b.tu[at], tL: b.tl[at], picks: b.picks, at });
  };

  N.register({
    id: "l7-bridge",
    lecture: 7,
    order: 2,
    num: "7.2",
    title: "The double bridge experiment",
    blurb: "Two bridges, one food source. Run simulated colonies and see which branch the ants settle on.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "In the <b>double bridge</b> experiment (Deneubourg et al, 1989) a nest and a food source are joined by two branches. Ants choose a branch, lay pheromone as they go, and prefer the stronger trail. Here one simulated ant leaves the nest per tick, so you can run whole colonies and compare outcomes. The upper branch is always the short one (5 long).",
        ),
      );
      let longLen = 10,
        sim = null,
        t = TICKS - 1;
      const card = el(
        `<div class="card"><div class="card-head"><h2>Double bridge colony</h2></div><div class="controls" id="c"></div><div class="controls"><button class="btn primary" id="run">Run colony</button><button class="btn" id="many">Run 20 colonies</button></div><div id="svg"></div><canvas class="viz" id="cv"></canvas><div class="legend"><span style="--c:var(--blue)">ants on the upper branch, last 10 (%)</span></div><div id="note"></div><div id="tal"></div></div>`,
      );
      root.appendChild(card);
      const sL = N.slider("Lower branch length", 5, 15, 1, longLen),
        sT = N.slider("Time", 1, TICKS, 1, TICKS, (v) => "tick " + v);
      sL.onInput((v) => {
        longLen = v;
        newColony();
      });
      sT.onInput((v) => {
        t = v - 1;
        draw();
      });
      qs("#c", card).append(sL, sT);
      function newColony() {
        sim = bridge(0, longLen, Math.random);
        t = TICKS - 1;
        sT.value = TICKS;
        qs("#tal", card).innerHTML = "";
        draw();
      }
      function draw() {
        qs("#svg", card).innerHTML = bridgeSVG({
          lenL: longLen,
          tU: sim.tu[t],
          tL: sim.tl[t],
          picks: sim.picks,
          at: t,
        });
        N.lineChart(qs("#cv", card), {
          series: [{ data: rolling(sim.picks), color: N.colors().blue }],
          height: 150,
          yMin: 0,
          yMax: 100,
          xLabel: "tick",
          markers: [{ x: t, color: N.colors().violet, label: "now" }],
          names: ["upper share"],
        });
        const so = sim.picks.slice(0, t + 1),
          o = outcome({ picks: sim.picks });
        qs("#note", card).innerHTML =
          `<div class="callout blue">At tick <b>${t + 1}</b>: <b>${so.filter((b) => b === 0).length}</b> of ${so.length} ants so far used the upper branch. ${t === TICKS - 1 ? `This colony ended <b>${o === "up" ? "on the upper branch" : o === "down" ? "on the lower branch" : "split between both"}</b>.` : ""}</div>`;
      }
      qs("#run", card).onclick = newColony;
      qs("#many", card).onclick = () => {
        const c = { up: 0, down: 0, split: 0 };
        for (let k = 0; k < 20; k++) c[outcome(bridge(0, longLen, Math.random))]++;
        qs("#tal", card).innerHTML =
          `<p>20 colonies with a lower branch of ${longLen}: <b>${c.up}</b> settled on the upper branch, <b>${c.down}</b> on the lower, <b>${c.split}</b> stayed split.</p>`;
      };
      newColony();
      root.appendChild(
        predict({
          id: "l7-bridge-1",
          q: "Set <b>Lower branch length</b> to 5, so both branches are equal, and press <b>Run 20 colonies</b>. What tally do you expect?",
          opts: [
            "About half on each branch, plus a few split",
            "Nearly all on the upper branch, a few split",
            "Nearly all on the lower branch, a few split",
          ],
          a: 0,
          why: "Nothing favours either branch, so early luck decides. Over many colonies about as many lock onto the lower branch as the upper one.",
        }),
      );
      root.appendChild(
        predict({
          id: "l7-bridge-2",
          q: "Set <b>Lower branch length</b> to 10 and press <b>Run 20 colonies</b>. Which tally is most likely?",
          opts: [
            "Most settle on the upper branch, a few on the lower",
            "Every single colony settles on the upper branch",
            "The colonies split about evenly between the branches",
          ],
          a: 0,
          why: "The short branch is paid sooner, so it usually wins. A few colonies are unlucky: early choices can build a trail on the long branch before the short branch's lead arrives.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "With <b>equal</b> branches the colony still settles on one, and which one is a matter of chance.",
            "With a <b>shorter</b> branch, most colonies settle on it, because ants return sooner and its pheromone builds sooner.",
            "<b>Positive feedback</b>: more pheromone attracts more ants, which add more pheromone.",
          ],
          "Short paths get reinforced first, so the colony finds them without a map.",
        ),
      );
    },
  });

  const share = (label, v, c) => [label, Math.round(v), c];
  const EQ = (() => {
    const b = bridge(seedEq, SHORT);
    return { first: upShare(b.picks.slice(0, 20)) * 100, last: upShare(b.picks.slice(-20)) * 100 };
  })();
  const T0 = tally(SHORT, 200),
    T1 = tally(10, 200);
  L["l7-bridge"] = {
    sum: "In the <b>double bridge</b> experiment a colony of ants finds the shorter branch, driven only by pheromone and timing.",
    steps: [
      {
        t: "The set-up",
        b: `<p>Deneubourg et al (1989) joined a <b>nest</b> and a <b>food source</b> with a bridge that had <b>two branches</b>. They watched which branch each ant used as time went by.</p>`,
        v: bridgeSVG({ lenL: SHORT, tU: 0, tL: 0 }),
        c: {
          q: "What did the experimenters watch?",
          o: [
            "Which branch the ants chose as time went by",
            "How much food each ant carried back home",
            "How fast one ant ran on a flat surface",
          ],
          a: 0,
          why: "The question was how the ants' choice of branch changed over time.",
        },
      },
      {
        t: "Experiment 1: equal branches",
        b: `<p>Both branches were 15 cm long. To begin with, ants chose <b>at random</b>. Later, <b>one branch was taken by most ants</b>. In this simulated colony ${EQ.first.toFixed(0)}% of the first 20 ants used the upper branch, but ${EQ.last.toFixed(0)}% of the last 20 did.</p>`,
        v: F.bars([share("First 20 ants", EQ.first, "blue"), share("Last 20 ants", EQ.last, "teal")], {
          max: 100,
          unit: "% on upper",
          label: `A simulated colony with equal branches: ${EQ.first.toFixed(0)}% of the first 20 ants and ${EQ.last.toFixed(0)}% of the last 20 used the upper branch.`,
        }),
        c: {
          q: "Both branches are the same length. What does the colony end up doing?",
          o: [
            "Most ants use one branch, picked by chance",
            "The ants share the two branches evenly for ever",
            "Ants always use whichever branch is on the left",
          ],
          a: 0,
          why: "Small early differences get amplified, so the colony settles on one branch. Which one is down to luck.",
        },
      },
      {
        t: "Experiment 2: one branch shorter",
        b: `<p>In the second experiment one branch was <b>longer</b>. Ants again chose at random at first. <b>Soon the shortest path was selected by most ants.</b> The picture shows a simulated colony: the thick blue trail is on the short branch.</p>`,
        v: frozen(10, seed10),
        c: {
          q: "What changed between experiment 1 and experiment 2?",
          o: [
            "One branch was longer, and the colony favoured the shorter",
            "One branch had food, and the colony favoured that one",
            "One branch was removed, so the ants had a single route",
          ],
          a: 0,
          why: "Both branches were still available. The colony itself found the shorter one.",
        },
      },
      {
        t: "How? Timing and pheromone",
        b: `<p>Ants lay pheromone as they go and prefer stronger trails. On the <b>short</b> branch each ant finishes its trip <b>sooner</b>, so its pheromone builds <b>earlier</b>. Later ants then see more pheromone there and choose it more often.</p>`,
        v: (() => {
          const b = bridge(seed10, 10);
          return F.plot(
            [
              { pts: b.tu.map((v, i) => [i, v]), c: "blue", label: "short branch" },
              { pts: b.tl.map((v, i) => [i, v]), c: "amber", label: "long branch" },
            ],
            { x: [0, TICKS - 1], xl: "tick", yl: "pheromone", h: 200 },
          );
        })(),
        c: {
          q: "Why does the shorter branch gain pheromone first?",
          o: [
            "Ants finish trips on it sooner, so deposits arrive earlier",
            "Ants lay more pheromone per centimetre on short paths",
            "Ants can smell the food better along a shorter path",
          ],
          a: 0,
          why: "Each ant lays the same amount. Short trips complete sooner, so the short branch is reinforced first.",
        },
      },
      {
        t: "A snowball effect",
        b: `<p>More pheromone attracts more ants, and more ants lay more pheromone. This is <b>positive feedback</b>, also called an <b>autocatalytic</b> process: the thing that is growing makes itself grow faster.</p>`,
        v: F.cycle(["More pheromone", "More ants choose it", "More pheromone laid"], { center: "snowball" }),
        c: {
          q: "What kind of loop is more pheromone leading to more ants, leading to more pheromone?",
          o: ["Positive feedback", "Negative feedback", "A random walk"],
          a: 0,
          why: "Each round strengthens the leader, which is what makes a colony commit to one branch.",
        },
      },
      {
        t: "Chance still plays a part",
        b: `<p>200 simulated colonies on each bridge (a colony counts as settled when 80% of its last 40 ants use one branch). <b>Equal</b> branches: either side can win. <b>5 against 10</b>: the short branch wins most runs, yet a few colonies lock onto the long one.</p>`,
        v: F.bars(
          [
            share("Equal: upper wins", (T0.up / 200) * 100, "blue"),
            share("Equal: lower wins", (T0.down / 200) * 100, "amber"),
            share("5 vs 10: short wins", (T1.up / 200) * 100, "teal"),
            share("5 vs 10: long wins", (T1.down / 200) * 100, "rose"),
          ],
          { max: 100, unit: "% of colonies" },
        ),
        c: {
          q: "Why can a colony sometimes lock onto the <b>longer</b> branch?",
          o: [
            "Early random choices can build a trail there first",
            "Longer branches carry more pheromone per ant",
            "The ants cannot tell the two branches apart",
          ],
          a: 0,
          why: "If a few early ants happen to choose the long branch, its trail starts ahead and the snowball can carry it.",
        },
      },
      {
        t: "From bridges to algorithms",
        b: `<p>The colony solved a shortest-path problem with <b>no map and no leader</b>. ACO turns this into an algorithm: the bridge becomes a <b>graph</b>, ants become <b>software agents</b> that walk it, and pheromone on the edges guides later ants.</p>`,
        v: F.flow(["Real ants on a bridge", "Software ants on a graph", { t: "Short paths found", c: "teal" }]),
        c: {
          q: "What does ACO borrow from the bridge experiment?",
          o: [
            "Good paths get pheromone sooner and attract more ants",
            "A fixed rule that always picks the shortest edge",
            "A lead ant that measures each path with a ruler",
          ],
          a: 0,
          why: "The reinforcement of good paths by pheromone is the heart of the algorithm.",
        },
      },
    ],
    guide: [
      "Press <b>Run colony</b> a few times and drag <b>Time</b> to replay the ants.",
      "Change <b>Lower branch length</b>, then press <b>Run 20 colonies</b>.",
      "Answer the questions after the demo.",
    ],
  };

  // ---------- 7.3 helper: two trails, the chance of each is its share of the pheromone ----------
  sh.pick = (box) => {
    const nf = NIC.shared.nicFig,
      out = box.appendChild(el(`<div></div>`)),
      ctl = el(`<div class="controls"></div>`);
    let a = 30,
      b = 10;
    const items = () => [
      { n: `Trail A: ${a}`, w: a, c: "blue" },
      { n: `Trail B: ${b}`, w: b, c: "amber" },
    ];
    const sA = N.slider("Pheromone on A", 1, 40, 1, a),
      sB = N.slider("Pheromone on B", 1, 40, 1, b);
    ctl.append(sA, sB);
    out.append(ctl);
    const sp = nf.spin(out, items(), {
      hint: "Each slice is as wide as its trail's pheromone. Press <b>Draw</b> to send ants.",
    });
    sA.onInput((v) => ((a = v), sp.set(items())));
    sB.onInput((v) => ((b = v), sp.set(items())));
  };
})();
