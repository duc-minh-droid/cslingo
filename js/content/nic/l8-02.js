/* l8-02: Lecture 8: 8.2 the transition rule (alpha, beta, tabu), 8.3 the update rule (rho, Q, L). */
(function () {
  const N = NIC;
  const { el, qs, qsa, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL8;
  const { C, pr, mulberry, table, colonyDemo, runColony, OPT } = sh;
  const fm = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 1 ? +v.toFixed(2) : +v.toPrecision(2));
  const pct = (p) => `${Math.round(p * 100)}%`;

  // ---------- the transition-rule explorer: a courier at Hob chooses among five villages ----------
  const CAND = [
    ["Kell", 2, 1],
    ["Marl", 4, 2],
    ["Pell", 5, 3],
    ["Rudd", 8, 6],
    ["Sowe", 10, 9],
  ];
  function explorer(root) {
    const st = { alpha: 1, beta: 1, tabu: new Set(), counts: null };
    const r = mulberry(5);
    const card = el(
      `<div class="card nw8-demo"><div class="card-head"><h2>A courier at Hob chooses the next village</h2></div>
      <div class="controls" data-ctl></div>
      <div class="nw8-tbl" data-tb></div>
      <div class="controls"><button class="btn primary" data-send>Send 100 ants</button><button class="btn ghost" data-clear>Clear tabu list</button></div>
      <p class="nw8-note" data-note aria-live="polite"></p></div>`,
    );
    root.appendChild(card);
    const sA = N.slider("α", 0, 4, 0.5, st.alpha),
      sB = N.slider("β", 0, 5, 0.5, st.beta);
    sA.onInput((v) => ((st.alpha = v), (st.counts = null), draw()));
    sB.onInput((v) => ((st.beta = v), (st.counts = null), draw()));
    qs("[data-ctl]", card).append(sA, sB);
    const calc = () => {
      const w = CAND.map(([nm, d, tau]) => (st.tabu.has(nm) ? 0 : Math.pow(tau, st.alpha) * Math.pow(1 / d, st.beta)));
      const s = w.reduce((a, b) => a + b, 0);
      return { w, p: w.map((x) => (s ? x / s : 0)) };
    };
    function draw() {
      const { w, p } = calc();
      qs("[data-tb]", card).innerHTML =
        `<table class="t"><tr><th>Village</th><th>d (km)</th><th>η = 1/d</th><th>τ</th><th>τ<sup>α</sup> · η<sup>β</sup></th><th>p</th><th>Count</th></tr>${CAND.map(
          ([nm, d, tau], i) =>
            `<tr class="${st.tabu.has(nm) ? "nw8-off" : ""}"><td><button class="btn small ${st.tabu.has(nm) ? "ghost" : ""}" data-t="${nm}" aria-pressed="${st.tabu.has(nm)}">${nm}${st.tabu.has(nm) ? " (tabu)" : ""}</button></td><td>${d}</td><td>${fm(1 / d)}</td><td>${tau}</td><td>${st.tabu.has(nm) ? "0" : fm(w[i])}</td><td><span class="nw8-pbar"><i style="width:${(p[i] * 100).toFixed(1)}%"></i></span> ${pct(p[i])}</td><td>${st.counts ? st.counts[i] : "·"}</td></tr>`,
        ).join("")}</table>`;
      qsa("[data-t]", card).forEach(
        (b) =>
          (b.onclick = () => {
            const k = b.dataset.t;
            if (st.tabu.has(k)) st.tabu.delete(k);
            else if (st.tabu.size < CAND.length - 1) st.tabu.add(k);
            st.counts = null;
            draw();
          }),
      );
      qs("[data-note]", card).textContent =
        `${CAND.length - st.tabu.size} village${CAND.length - st.tabu.size === 1 ? "" : "s"} allowed (J). Tap a village name to put it on the tabu list.`;
    }
    qs("[data-send]", card).onclick = () => {
      const { p } = calc();
      const c = CAND.map(() => 0);
      for (let k = 0; k < 100; k++) {
        let u = r(),
          i = 0;
        for (; i < CAND.length - 1; i++) {
          u -= p[i];
          if (u < 0) break;
        }
        c[i]++;
      }
      st.counts = c;
      draw();
    };
    qs("[data-clear]", card).onclick = () => {
      st.tabu.clear();
      st.counts = null;
      draw();
    };
    draw();
  }

  // ---------- the two ingredients on three roads: thickness = pheromone, length = distance ----------
  const TOWNS = [
    ["Kell", 2, 1, [117, 55], "teal"],
    ["Marl", 4, 6, [230, 105], "blue"],
    ["Pell", 5, 3, [257, 211], "violet"],
  ];
  const CAPS = {
    both: "Both ingredients: Marl is farther than Kell, but its thick trail makes it the favourite.",
    tau: "Pheromone only: the busiest road wins, however far away it is.",
    eta: "Distance only: the nearest village wins, whatever the colony has learned.",
  };
  function ingredients(box) {
    const out = el(`<div class="fig-wrap" aria-live="polite"></div>`);
    const draw = (mode) => {
      const w = TOWNS.map(([, d, tau]) => (mode === "tau" ? tau : mode === "eta" ? 1 / d : tau / d)),
        s = w.reduce((a, b) => a + b, 0);
      out.innerHTML = `<svg class="fig" viewBox="0 0 400 235" style="max-height:235px" role="img" aria-label="The courier at Hob has three roads: Kell 2 km with a faint trail, Marl 4 km with a thick trail and Pell 5 km with a medium trail.">${TOWNS.map(([, , tau, [x, y], c]) => `<line x1="30" y1="105" x2="${x}" y2="${y}" stroke="var(--${c})" stroke-width="${2 + tau * 1.6}" stroke-linecap="round" opacity=".65"/>`).join("")}${TOWNS.map(([nm, d, tau, [x, y]]) => `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5"/><text x="${x + 16}" y="${y + 4}" class="fig-sub" style="text-anchor:start">${nm} · ${d} km · τ ${tau}</text>`).join("")}<circle cx="30" cy="105" r="19" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="30" y="110" class="fig-n">Hob</text></svg><div class="nw8-strip">${TOWNS.map(([nm, , , , c], i) => `<div class="nw8-seg ${c}" style="flex:${Math.max(w[i] / s, 0.0001)}"><b>${nm}</b><small>${pct(w[i] / s)}</small></div>`).join("")}</div><p class="dim" style="text-align:center">${CAPS[mode]}</p>`;
    };
    box.append(
      N.seg(
        [
          ["both", "Both ingredients"],
          ["tau", "Pheromone only"],
          ["eta", "Distance only"],
        ],
        "both",
        draw,
      ),
      out,
    );
    draw("both");
  }

  N.register({
    id: "l8-transition",
    lecture: 8,
    order: 2,
    num: "8.2",
    title: "The transition rule",
    blurb: "How an ant picks its next town: pheromone, distance, the tabu list and the dials alpha and beta.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Each step, an ant at town $i$ chooses town $j$ with probability $p_{ij}^k$. The rule mixes <b>pheromone</b> $\\tau_{ij}$ (learned) with a <b>heuristic</b> $\\eta_{ij}$ (fixed). The exponents <b>α</b> and <b>β</b> set how much each counts.",
        ),
      );
      explorer(root);
      root.appendChild(
        pr(
          "l8-trans-1",
          "Set <b>α</b> to 0 and <b>β</b> to 3. Which village do the ants favour? | Kell, the nearest village, despite its small pheromone | Sowe, the village with the most pheromone on it | None in particular: all five are equally likely | With α = 0 the pheromone term is 1 for every village, so only η counts, and the nearest village has the biggest η. Pheromone is ignored.",
        ),
      );
      root.appendChild(
        pr(
          "l8-trans-2",
          "Now set <b>β</b> to 0 and <b>α</b> to 3. What happens? | Sowe, the farthest village, takes about three in four ants | Kell, the nearest village, takes most of the ants | The probabilities stay equal, since β = 0 switches off all dials | With β = 0 the heuristic is ignored and only τ³ counts. Sowe's pheromone is 9 against 1 for Kell, so its score is 729 against 1, about 74% of the total. Positive feedback alone can drag ants along a poor road.",
        ),
      );
      root.appendChild(
        pr(
          "l8-trans-3",
          "Put <b>Kell</b> on the tabu list. What happens to the other four villages' probabilities? | They all rise, because the shares must still add to 100% | They stay exactly the same, as only Kell's share changes | They all fall, because one village is now missing | A tabu village gets p = 0 and the rest are divided by a smaller total, so each remaining village's share goes up while they still add to 1.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "$p_{ij}^k$ is proportional to $\\tau_{ij}^{\\alpha}\\,\\eta_{ij}^{\\beta}$, divided by the same sum over the towns in $J_i^k$.",
            "$\\eta_{ij} = 1/d_{ij}$ is fixed; $\\tau_{ij}$ is learned and shared by the whole colony.",
            "<b>Small α</b>: nearby towns win (greedy). <b>Small β</b>: only positive feedback, so the colony may lock onto a poor path too quickly.",
            "The tabu list sets $p = 0$ for visited towns; the others are renormalised and one is drawn at random.",
          ],
          "Mix what the colony has learned with what is obviously close, then roll the dice.",
        ),
      );
    },
  });

  L["l8-transition"] = {
    sum: "The transition rule picks the next town with probability proportional to pheromone to the power α times heuristic to the power β, restricted to towns not yet visited.",
    steps: [
      {
        t: "One rule, two ingredients",
        b: `<p>An ant standing at a town has to pick where to go next, much as you would pick a route: it likes roads that <b>other ants have used a lot</b> (plenty of pheromone) and roads that are <b>short</b>. Every town it may still visit gets a score from those two things, and the chance of picking a town is its share of the total score.</p><p>Example: the courier at Hob can go to Kell (2 km, a faint trail), Marl (4 km, a thick trail) or Pell (5 km, a medium trail). With both ingredients the thick trail to Marl wins about 58% of the time, even though Kell is closer. Switch the ingredients below to see what each one does on its own.</p><details class="math-more"><summary>Show the maths</summary><p>$$p_{ij}^k=\\frac{[\\tau_{ij}]^{\\alpha}\\,[\\eta_{ij}]^{\\beta}}{\\sum_{h\\in J_i^k}[\\tau_{ih}]^{\\alpha}\\,[\\eta_{ih}]^{\\beta}}$$</p><p>The top is a <b>score</b> for town $j$: pheromone $\\tau$ (learned, global) times heuristic $\\eta$ (fixed, local). The bottom adds the scores of every town ant $k$ may still visit, so the probabilities sum to 1.</p></details>`,
        v: (box) => ingredients(box),
        c: C(
          "Which ingredient does the colony update while it runs? | τ, the pheromone on each edge | η, the heuristic for each edge | Both of them, after every iteration | η is worked out once from the problem (distance). Only τ is rewritten by the update rule.",
        ),
      },
      {
        t: "The heuristic: η = 1/d",
        b: `<p>For a travelling salesperson there is a hint that needs no learning: <b>shorter roads are better</b>. So the pull of a road is one divided by its length, and halving the distance doubles the pull.</p><p>For example, a 2 km road pulls twice as hard as a 4 km road and four times as hard as an 8 km road. A second dial can stretch the gap: if distance counts "twice over", halving the distance makes a road 4 times as attractive. Drag the slider below and watch how the shares of the five roads shift (the pheromone is the same on all of them).</p><details class="math-more"><summary>Show the maths</summary><p>The heuristic for the road from $i$ to $j$ is</p><p>$$\\eta_{ij}=\\frac{1}{d_{ij}}$$</p><p>and the exponent $\\beta$ (the slider) stretches the gap: with $\\beta=2$, a road half as long is $2^2=4$ times as attractive. The values of $\\eta$:</p>${F.bars(
          [
            ["d = 2 km", 0.5, "teal"],
            ["d = 4 km", 0.25, "blue"],
            ["d = 5 km", 0.2, "blue"],
            ["d = 8 km", 0.125, "violet"],
            ["d = 10 km", 0.1, "violet"],
          ],
          {
            max: 0.5,
            fmt: (v) => v.toFixed(3),
            label:
              "Heuristic eta equals 1 over d: 0.5 for 2 km, 0.25 for 4 km, 0.2 for 5 km, 0.125 for 8 km, 0.1 for 10 km",
          },
        )}</details>`,
        v: (box) => NIC.shared.nicFig.pull(box),
        c: C(
          "Two villages have the same pheromone, one 2 km away and one 4 km away. With β = 2, how much likelier is the nearer one? | 4 times | 2 times | 8 times | Its η is double, and squaring doubles to four. Equal pheromone cancels out.",
        ),
      },
      {
        t: "Tabu towns score zero",
        b: `<p>Towns the ant has already visited are on the <b>tabu list</b> and score zero, so they can never be picked. The towns left share the whole probability between them, so take one town away and every other town gets a <b>bigger slice</b>.</p><p>For example, four towns score 6, 3, 4 and 1. With the third one tabu, the scores left add up to 6 + 3 + 1 = 10, so the first town has 6 out of 10: 60%. Tap a town below to put it on the tabu list, or take it off, and watch the slices change.</p><details class="math-more"><summary>Show the maths</summary><p>Only the towns in $J_i^k$ (not yet visited) share the probability, and tabu towns have $p=0$. Dividing by the sum over allowed towns makes the probabilities add to 1 again:</p><p>$$p_j=\\frac{\\text{score}_j}{\\sum_{h\\in J_i^k}\\text{score}_h}$$</p></details>`,
        v: (box) => NIC.shared.nicFig.tabuScores(box),
        c: C(
          "Three towns are allowed, with scores 6, 3 and 1. A fourth town is tabu. What is the probability of the town scoring 6? | 0.6 | 0.3 | 0.9 | The tabu town adds nothing. The total is 6 + 3 + 1 = 10, and 6/10 = 0.6.",
        ),
      },
      {
        t: "The dials α and β",
        b: `<p><b>α</b> weights the pheromone, <b>β</b> the heuristic. They trade <b>global</b> learning against <b>local</b> knowledge.</p><p>A <b>small α</b> favours the nearest towns, like a greedy search. A <b>small β</b> leaves only positive feedback, and the colony may lock onto paths that are not optimal, too quickly.</p>`,
        v: F.compare(
          { title: "Small α", c: "violet", body: "pheromone ignored<br>nearest towns win: greedy" },
          { title: "Small β", c: "amber", body: "only positive feedback<br>risk of locking onto a poor path" },
        ),
        c: C(
          "A run uses α = 0. What do the ants do? | Ignore the pheromone and follow the heuristic | Follow the pheromone and ignore the distances | Choose every allowed town with equal probability | τ⁰ = 1 for every edge, so the pheromone cancels out. Only η is left. (Equal chances would need β = 0 as well.)",
        ),
      },
      {
        t: "Rolling the dice",
        b: `<p>The rule gives every town a chance, but the ant still has to pick one. It spins a <b>roulette wheel</b>, the same trick as fitness-proportional selection: lay the towns end to end on a strip from 0 to 1, each as wide as its chance, throw a marker at a random spot and take the slice it lands in. Likely towns win often, but unlikely ones still get a turn.</p><p>For example, Kell 0.5, Marl 0.3 and Pell 0.2 cut the strip at 0.5 and 0.8, so a throw at 0.83 lands in Pell's slice. Press Draw below to throw the marker yourself.</p><details class="math-more"><summary>Show the maths</summary><p>Draw a random number $u$ between 0 and 1 and pick the first town whose running total of probabilities passes $u$:</p><p>$$j=\\min\\Big\\{m:\\ \\sum_{h\\le m}p_h>u\\Big\\}$$</p></details>`,
        v: (box) =>
          NIC.shared.nicFig.spin(
            box,
            [
              { n: "Kell", w: 0.5, c: "teal" },
              { n: "Marl", w: 0.3, c: "blue" },
              { n: "Pell", w: 0.2, c: "violet" },
            ],
            { ends: true },
          ),
        c: C(
          "The probabilities are 0.5, 0.3 and 0.2 for Kell, Marl and Pell, in that order. The draw is u = 0.83. Which town is chosen? | Pell | Marl | Kell | Kell covers 0 to 0.5, Marl covers 0.5 to 0.8 and Pell covers 0.8 to 1. 0.83 is past 0.8.",
        ),
      },
      {
        t: "A worked example",
        b: `<p>With α = 1 and β = 1 the score is τ/d. At a town, three villages remain, and the table holds their distances and pheromone. Work out each score, then divide by the total.</p>`,
        v: table(
          ["Village", "d (km)", "τ", "score τ/d"],
          [
            ["Ash", 2, 1, "0.5"],
            ["Birch", 4, 4, "1"],
            ["Cedar", 5, 5, "1"],
          ],
        ),
        c: C(
          "Using that table (α = 1, β = 1), what is the probability of Birch? | 0.4 | 0.2 | 0.8 | Scores are 0.5, 1 and 1, which add up to 2.5. Birch gets 1/2.5 = 0.4.",
          "Add the three scores first. Then 1 out of that total.",
        ),
      },
    ],
    guide: [
      "Drag <b>α</b> to 0 and watch the bars follow distance alone.",
      "Drag <b>β</b> to 0 and <b>α</b> up: the bars follow pheromone alone.",
      "Tap village names to add them to the tabu list and see the others renormalise.",
      "Press <b>Send 100 ants</b> to see real draws against the probabilities.",
      "Answer the questions after the demo.",
    ],
  };

  // ---------- 8.3 the update rule: a ledger for one road ----------
  const ANTS = [20, 25, 50, 100];
  function ledger(box) {
    const st = { tau: 4, rho: 0.5, Q: 100, used: new Set([1, 2, 3]) };
    box.innerHTML = `<div class="nw8-ledger"><div class="controls" data-c></div><div class="nw8-tbl" data-t></div><div class="nw8-eq" data-e aria-live="polite"></div></div>`;
    const c = qs("[data-c]", box);
    const mk = (lab, lo, hi, step, key) => {
      const s = N.slider(lab, lo, hi, step, st[key], (v) => +v.toFixed(2));
      s.onInput((v) => ((st[key] = v), draw()));
      c.append(s);
    };
    mk("Pheromone now", 0, 10, 1, "tau");
    mk("Evaporation ρ", 0.1, 0.9, 0.1, "rho");
    mk("Q", 50, 200, 50, "Q");
    function draw() {
      const rows = ANTS.map((len, k) => {
        const on = st.used.has(k);
        return [
          `Ant ${k + 1}`,
          `${len} km`,
          fm(st.Q / len),
          `<button class="btn small ${on ? "primary" : "ghost"}" data-k="${k}" aria-pressed="${on}">${on ? "uses the road" : "not on it"}</button>`,
        ];
      });
      qs("[data-t]", box).innerHTML = table(["Ant", "tour L<sub>k</sub>", "Quality Q/L<sub>k</sub>", ""], rows);
      qsa("[data-k]", box).forEach(
        (b) =>
          (b.onclick = () => {
            const k = +b.dataset.k;
            if (st.used.has(k)) st.used.delete(k);
            else st.used.add(k);
            draw();
          }),
      );
      const dl = [...st.used].reduce((s, k) => s + st.Q / ANTS[k], 0);
      qs("[data-e]", box).innerHTML =
        `<p>Evaporation: (1 − ρ)τ = ${fm(1 - st.rho)} × ${st.tau} = <b>${fm((1 - st.rho) * st.tau)}</b></p><p>Deposit: Δτ = ${[...st.used].length ? [...st.used].map((k) => fm(st.Q / ANTS[k])).join(" + ") : "0"} = <b>${fm(dl)}</b></p><p class="nw8-big">τ(t+1) = <b>${fm((1 - st.rho) * st.tau + dl)}</b></p>`;
    }
    draw();
  }
  /** Mean best-so-far over 20 seeds, in the lock-in-prone setting, for a slow and a fast rho. */
  const rhoCurves = () => {
    const mean = (rho) => {
      const P = { ants: 10, alpha: 2, beta: 1, rho, Q: 100, mode: "best" };
      const runs = Array.from({ length: 20 }, (_, s) => runColony(s + 1, P, 20));
      return Array.from({ length: 20 }, (_, i) => [i + 1, runs.reduce((a, S) => a + S.hist[i].best, 0) / runs.length]);
    };
    return F.plot(
      [
        { pts: mean(0.05), c: "teal", label: "ρ = 0.05" },
        { pts: mean(0.9), c: "rose", label: "ρ = 0.9" },
      ],
      {
        x: [1, 20],
        y: [Math.floor(OPT / 10) * 10, 150],
        xl: "iteration",
        yl: "best so far (km), average of 20 runs",
        h: 190,
      },
    );
  };

  N.register({
    id: "l8-update",
    lecture: 8,
    order: 3,
    num: "8.3",
    title: "The update rule",
    blurb: "Evaporate with rho, deposit Q/L from every ant, and watch trails strengthen or fade.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "After every ant has finished, each edge is updated: $\\tau_{ij}(t+1)=(1-\\rho)\\,\\tau_{ij}(t)+\\Delta\\tau_{ij}(t)$. The first term is <b>evaporation</b>, the second is the pheromone the ants <b>deposit</b>, which is bigger for shorter tours.",
        ),
      );
      colonyDemo(root, life, { controls: ["rho", "Q"], title: "Tune evaporation and Q" });
      root.appendChild(
        pr(
          "l8-upd-1",
          "With ρ = 0.95 the old pheromone on an edge is multiplied by (1 − ρ) before the ants deposit. How much of it is left? | 5% | 50% | 95% | 1 − 0.95 = 0.05, so only 5% survives. With ρ this high the trails mostly reflect the last iteration.",
        ),
      );
      root.appendChild(
        pr(
          "l8-upd-2",
          "Every ant deposits Q/L. You double Q and run again. What is the main effect? | Every deposit doubles; the ratio between ants stays the same | The shortest tours stop being favoured over longer ones | Old pheromone evaporates twice as fast as before | Q multiplies every ant's deposit equally, so shorter tours still lay proportionally more. What changes is how loud the new deposits are next to what is left of the old trail.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "$\\tau_{ij}(t+1)=(1-\\rho)\\tau_{ij}(t)+\\Delta\\tau_{ij}(t)$: evaporate, then add what the ants deposited.",
            "$\\Delta\\tau_{ij}$ is the sum of every ant's quality on that edge. For the TSP, $Quality^k = Q/L_k$: <b>shorter tour, more pheromone</b>.",
            "An ant lays pheromone on <b>every edge it used</b>, so popular edges collect from many ants.",
            "<b>High ρ</b> forgets fast (the latest tours dominate); <b>low ρ</b> remembers longer and learns more slowly.",
          ],
          "Good tours leave bigger marks; evaporation clears old ones.",
        ),
      );
    },
  });

  // ---------- 8.3 pictures: a road's pheromone as blocks, and the dab an ant lays ----------
  const pile = (...n) =>
    F.cells(
      n.flatMap((k, i) => Array(k).fill({ v: "", c: ["blue", "rose", "teal", "amber"][i] })),
      { size: 24 },
    );
  function dab(box) {
    const sl = N.slider("Tour length", 20, 100, 5, 25, (v) => `${v} km`),
      out = el(`<div class="fig-wrap" aria-live="polite"></div>`);
    const blob = (x, q, c, lab) =>
      `<circle cx="${x}" cy="62" r="${(10 * Math.sqrt(q)).toFixed(1)}" fill="color-mix(in srgb, var(--${c}) 28%, var(--panel-2))" stroke="var(--${c})" stroke-width="3"/><text x="${x}" y="62" dy="5" class="fig-n">${fm(q)}</text><text x="${x}" y="130" class="fig-sub" style="text-anchor:middle">${lab}</text>`;
    const draw = (len) => {
      const q = 100 / len;
      out.innerHTML = `<svg class="fig" viewBox="0 0 400 145" style="max-height:150px" role="img" aria-label="A ${len} km tour lays ${fm(q)} on each road it used. A 50 km tour lays 2.">${blob(110, q, "teal", `${len} km tour: ${fm(q)} per road`)}${blob(300, 2, "blue", "50 km tour: 2 per road")}</svg><p class="dim" style="text-align:center">${len === 50 ? "Same length, same dab." : len < 50 ? "Shorter than 50 km, so a bigger dab." : "Longer than 50 km, so a smaller dab."}</p>`;
    };
    sl.onInput(draw);
    box.append(sl, out);
    draw(25);
  }

  L["l8-update"] = {
    sum: "Pheromone evaporates by a factor (1 − ρ) and then every ant adds Q/L on each edge of its tour, so shorter tours leave stronger trails.",
    steps: [
      {
        t: "Evaporate, then deposit",
        b: `<p>Each time the ants have finished their tours, every road is updated in two moves. First some of its pheromone <b>evaporates</b>, on every road, used or not. Then each ant adds a fresh dab to every road <b>it used</b>, bigger for a shorter tour.</p><p>Example: a road holds 8 units and half evaporates, leaving 4. Two ants used it: one with a 25 km tour adds 4 and one with a 50 km tour adds 2 (the next step shows why a short tour adds more). The road ends the round with 4 + 4 + 2 = <b>10</b>. A road nobody used stays at 4 and keeps fading.</p><details class="math-more"><summary>Show the maths</summary><p>$$\\tau_{ij}(t+1)=(1-\\rho)\\,\\tau_{ij}(t)+\\Delta\\tau_{ij}(t),\\qquad \\Delta\\tau_{ij}=\\sum_k Quality^k$$</p><p>Here $\\rho$ (between 0 and 1) is the <b>evaporation rate</b>. An ant adds $Quality^k$ to every edge of its tour; an edge it did not use gets nothing from it.</p></details>`,
        v: F.frames([
          { t: "A road holds <b>8</b> units of pheromone.", v: pile(8) },
          { t: "<b>Evaporate:</b> half fades (red). <b>4</b> are kept.", v: pile(4, 4) },
          {
            t: "<b>Deposit:</b> the 25 km ant adds 4 (green) and the 50 km ant adds 2 (orange). The road now holds <b>10</b>.",
            v: pile(4, 0, 4, 2),
          },
        ]),
        c: C(
          "An ant finishes its tour. Which roads lose some pheromone to evaporation? | Every road, whether used or not | Only the roads the ant did not use | Only the roads on the ant's tour | Only the road with the most pheromone | Evaporation fades every road each round. Only the roads that were used then get a deposit on top.",
        ),
      },
      {
        t: "Evaporation with ρ",
        b: `<p>Pheromone does not last. If nobody lays more on a road, it loses the <b>same share</b> of what it holds every round, so it fades quickly at first and then ever more slowly. That is how the colony <b>forgets</b> roads that stopped being useful.</p><p>For example, if half evaporates each round, a road holding 8 goes 8, 4, 2, 1. Drag the slider below to change the share that is lost and watch the road fade.</p><details class="math-more"><summary>Show the maths</summary><p>With evaporation rate $\\rho$ (the share lost, between 0 and 1) and nothing deposited:</p><p>$$\\tau_{ij}(t+1)=(1-\\rho)\\,\\tau_{ij}(t)$$</p><p>With $\\rho=0.5$ a trail of 8 goes 8, 4, 2, 1. After $n$ rounds it holds $(1-\\rho)^n$ of what it started with.</p></details>`,
        v: (box) => NIC.shared.nicFig.fade(box),
        c: C(
          "An edge has τ = 8 and nobody uses it. With ρ = 0.25, what is τ after one iteration? | 6 | 2 | 7.75 | (1 − 0.25) × 8 = 0.75 × 8 = 6.",
        ),
      },
      {
        t: "Quality: Q divided by tour length",
        b: `<p>An ant that found a short tour deserves to be heard. So each ant takes a fixed number, <b>Q</b>, and divides it by the length of the tour it just drove. Short tour, big result; long tour, small result. The ant then lays that amount on <b>every road it used</b>. Halve the tour and the dab doubles.</p><p>With Q = 100 a 20 km tour lays 5 on each road, a 25 km tour lays 4, a 50 km tour lays 2 and a 100 km tour lays just 1. Slide the tour length and compare it with a 50 km tour.</p><details class="math-more"><summary>Show the maths</summary><p>For the TSP an ant with tour length $L_k$ has $Quality^k = Q/L_k$: the <b>inverse of the tour length</b> scaled by a constant $Q$. With $Q = 100$: $L=20$ gives 5, $L=25$ gives 4, $L=50$ gives 2 and $L=100$ gives 1.</p></details>`,
        v: (box) => dab(box),
        c: C(
          "Ant A's tour is half as long as ant B's. Compared with B, how much does A lay on each road it used? | Twice as much | Half as much | The same amount | Four times as much | Quality is Q divided by the tour length, so halving the length doubles the result.",
        ),
      },
      {
        t: "Try the ledger for one road",
        b: `<p>Tick which ants used the road, then set how much pheromone it holds now, how much of it evaporates and how loud each ant's dab is. The new value is <b>what survives evaporation, plus one dab from every ant that used the road</b>. Try a road nobody used, then one that every ant used.</p><details class="math-more"><summary>Show the maths</summary><p>With $\\rho$ the evaporation rate and $Q$ the scale of a dab, the ledger computes</p><p>$$\\tau(t+1)=(1-\\rho)\\,\\tau(t)+\\sum_{k\\text{ used it}}\\frac{Q}{L_k}$$</p></details>`,
        v: (box) => ledger(box),
        c: C(
          "Two ants use a road: one with a 25 km tour and one with a 50 km tour. Q = 100. What is Δτ for that road? | 6 | 3 | 75 | Qualities are 100/25 = 4 and 100/50 = 2. Δτ is their sum, 4 + 2 = 6.",
        ),
      },
      {
        t: "Positive feedback, and how ρ shapes it",
        b: `<p>Roads on good tours collect more pheromone, so more ants use them, so they collect even more: <b>positive feedback</b>. Evaporation is the brake, and how hard it brakes matters. The chart is the <b>average of 20 runs</b> of our ten-village colony in a deliberately greedy set-up where only the best ant lays pheromone. A colony that forgets almost everything each round commits to its first lucky tour and settles for a worse result than one that forgets slowly.</p><details class="math-more"><summary>Show the maths</summary><p>The two curves compare $\\rho=0.9$ (fast forgetting) with $\\rho=0.05$ (slow forgetting), with $\\alpha=2$, $\\beta=1$ and only the best ant depositing. With $\\rho=0.9$ only 10% of the old trail survives each round, so the newest deposit dominates at once.</p></details>`,
        v: rhoCurves(),
        c: C(
          "In that chart, which colony settles for the longer best round? | The one with ρ = 0.9, which committed to early tours | The one with ρ = 0.05, which waited too long | Both end the same; the lines only differ at the start | When ρ is high the newest tour dominates the trails at once, so an early lucky tour can capture the colony before better ones are found.",
        ),
      },
      {
        t: "What Q does and doesn't do",
        b: `<p>Q is only a <b>volume knob</b>. If every ant uses the same Q, doubling it doubles every dab, so a short tour still lays the same multiple of what a long tour lays. It changes how loud the new dabs are next to the old pheromone, not which tour wins.</p><p>For example, with Q = 100 a 20 km tour lays 5 and a 100 km tour lays 1: five to one. With Q = 200 they lay 10 and 2: still five to one. Flip between the two below.</p><details class="math-more"><summary>Show the maths</summary><p>Two ants with tours $L_1$ and $L_2$ lay $Q/L_1$ and $Q/L_2$. Their ratio does not contain $Q$:</p><p>$$\\frac{Q/L_1}{Q/L_2}=\\frac{L_2}{L_1}$$</p></details>`,
        v: (box) => NIC.shared.nicFig.qScale(box),
        c: C(
          "All ants share the same Q, and you double it. What stays the same? | Each ant's deposit relative to the others' | The total pheromone sitting on each edge | The speed at which old pheromone evaporates | Each deposit doubles, so ratios between ants are unchanged. Edge totals change, and evaporation depends on ρ alone.",
        ),
      },
    ],
    guide: [
      "Drag <b>ρ</b> to 0.95, press <b>Run 10</b> and see how little of the old trail survives.",
      "<b>Reset</b>, set <b>ρ</b> low (0.1) and <b>Run 10</b> again. Compare the thickness of the lines.",
      "Change <b>Q</b> and run again. Compare the best round, not the exact numbers.",
      "Answer the questions after the demo.",
    ],
  };
})();
