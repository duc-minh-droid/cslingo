/* Lecture 3 — basic principles, hillclimbing, local search, landscapes, population-based search */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, TSP, tspSVG, matrixHTML, randint, rnd, shuffle } = N;

  /* ============ 3.1 The EA recipe ============ */
  N.register({
    id: "l3-recipe",
    lecture: 3,
    order: 1,
    num: "3.1",
    title: "The EA recipe & vocabulary",
    blurb: "The basic loop: fitness → selection → recombination → mutation → replacement, run live on bitstrings.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Every evolutionary algorithm (EA) runs the same basic loop. The lecture draws it as a cycle around a <b>difficult problem</b>: we score candidate solutions with an <b>objective (fitness) function</b>, pick parents, make children, and decide who survives. Step through one loop below, using a toy problem where fitness = number of 1s (<i>OneMax</i>).",
        ),
      );

      const STAGES = [
        {
          k: "pop",
          name: "Population",
          c: "var(--blue)",
          d: "A set of <b>candidate solutions</b> (chromosomes). Here: 6 bitstrings of length 8, generated at random.",
        },
        {
          k: "eval",
          name: "Fitness",
          c: "var(--teal)",
          d: "The <b>objective (fitness) function</b> scores every candidate. OneMax fitness = number of 1s, so the maximum is 8.",
        },
        {
          k: "sel",
          name: "Selection",
          c: "var(--amber)",
          d: "Choose parents, <b>biased towards fitter</b> candidates. Here: tournament of size 2 (pick 2 at random, keep the better) run twice.",
        },
        {
          k: "rec",
          name: "Recombination",
          c: "var(--violet)",
          d: "<b>Crossover</b> combines two parents. Here: 1-point crossover. The child takes genes up to the cut from P1 and the rest from P2.",
        },
        {
          k: "mut",
          name: "Mutation",
          c: "var(--rose)",
          d: "A <b>small random change</b> to the child. Here: flip one random bit. This is how new genetic material appears.",
        },
        {
          k: "rep",
          name: "Replacement",
          c: "var(--teal)",
          d: "Decide who survives. Here: <b>replace the weakest</b> member if the child is at least as fit (a steady-state EA).",
        },
      ];
      const L = 8,
        P = 6;
      const f = (s) => s.split("").filter((b) => b === "1").length;
      let st;
      function reset() {
        st = {
          step: 0,
          gen: 0,
          pop: Array.from({ length: P }, () => Array.from({ length: L }, () => (rnd() < 0.35 ? "1" : "0")).join("")),
          evaluated: false,
          info: {},
        };
      }
      reset();

      const card = el(`<div class="card"><div class="grid side">
        <div><svg class="viz" id="loop" viewBox="0 0 440 380"></svg></div>
        <div><div class="card-head"><span class="tag" id="stageTag">Stage</span><span class="faint mono" id="genTxt"></span></div>
          <p id="stageDesc" class="dim"></p><div id="stageViz"></div></div>
      </div><div class="controls"><button class="btn primary" id="next">Next stage →</button><button class="btn" id="auto">Auto-play</button><button class="btn ghost" id="reset">New population</button></div></div>`);
      root.appendChild(card);

      const cx = 220,
        cy = 190,
        R = 140;
      function drawLoop() {
        const nodes = STAGES.map((s, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / STAGES.length;
          return { ...s, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
        });
        const arrows = nodes
          .map((n, i) => {
            const m = nodes[(i + 1) % nodes.length];
            const dx = m.x - n.x,
              dy = m.y - n.y,
              len = Math.hypot(dx, dy);
            const sx = n.x + (dx / len) * 44,
              sy = n.y + (dy / len) * 26,
              ex = m.x - (dx / len) * 46,
              ey = m.y - (dy / len) * 28;
            return `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${i === st.step ? "var(--text)" : "var(--line-2)"}" stroke-width="2" marker-end="url(#ah)" />`;
          })
          .join("");
        qs("#loop", card).innerHTML =
          `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-dim)"/></marker></defs>
          <text x="${cx}" y="${cy - 6}" fill="var(--text-dim)" font-size="13" text-anchor="middle">Difficult problem</text>
          <text x="${cx}" y="${cy + 14}" fill="var(--text-faint)" font-size="11" text-anchor="middle" font-family="var(--mono)">loop ${st.gen}</text>
          ${arrows}${nodes
            .map(
              (
                n,
                i,
              ) => `<g><rect x="${n.x - 52}" y="${n.y - 20}" width="104" height="40" rx="11" fill="${i === st.step ? "var(--panel-2)" : "var(--bg-2)"}" stroke="${i === st.step ? n.c : "var(--line-2)"}" stroke-width="${i === st.step ? 2.5 : 1.5}" style="transition: stroke 200ms ease"/>
            <text x="${n.x}" y="${n.y + 5}" fill="${i === st.step ? "var(--text)" : "var(--text-dim)"}" font-size="13" font-weight="600" text-anchor="middle">${n.name}</text></g>`,
            )
            .join("")}`;
      }
      const geneRow = (s, cls = () => "") =>
        `<span class="genome">${s
          .split("")
          .map((b, i) => `<span class="gene ${cls(i)}">${b}</span>`)
          .join("")}</span>`;
      const popTable = (mark = {}) =>
        `<table class="t"><tr><th>#</th><th>Chromosome</th><th class="num">Fitness</th></tr>${st.pop.map((s, i) => `<tr class="${mark[i] || ""}"><td class="faint">${i + 1}</td><td>${geneRow(s)}</td><td class="num">${st.evaluated ? f(s) : "?"}</td></tr>`).join("")}</table>`;

      function doStage() {
        const s = STAGES[st.step],
          I = st.info;
        let viz = "";
        if (s.k === "pop") viz = popTable();
        if (s.k === "eval") {
          st.evaluated = true;
          const best = Math.max(...st.pop.map(f));
          viz = popTable(Object.fromEntries(st.pop.map((x, i) => [i, f(x) === best ? "hl" : ""])));
        }
        if (s.k === "sel") {
          const tour = () => {
            const a = randint(0, P - 1),
              b = randint(0, P - 1);
            return { a, b, w: f(st.pop[a]) >= f(st.pop[b]) ? a : b };
          };
          I.t1 = tour();
          I.t2 = tour();
          viz =
            [I.t1, I.t2]
              .map(
                (t, k) =>
                  `<div class="genome-row"><span class="lbl">Tournament ${k + 1}</span><span class="mono dim">#${t.a + 1} (f=${f(st.pop[t.a])}) vs #${t.b + 1} (f=${f(st.pop[t.b])}) → <b style="color:var(--amber)">#${t.w + 1}</b></span></div>`,
              )
              .join("") +
            `<div class="genome-row"><span class="lbl">Parent 1</span>${geneRow(st.pop[I.t1.w], () => "p1")}</div><div class="genome-row"><span class="lbl">Parent 2</span>${geneRow(st.pop[I.t2.w], () => "p2")}</div>`;
        }
        if (s.k === "rec") {
          const p1 = st.pop[I.t1.w],
            p2 = st.pop[I.t2.w];
          I.cut = randint(1, L - 1);
          I.child = p1.slice(0, I.cut) + p2.slice(I.cut);
          viz = `<div class="genome-row"><span class="lbl">Parent 1</span>${geneRow(p1, (i) => (i < I.cut ? "p1" : "") + (i === I.cut - 1 ? " cut" : ""))}</div>
            <div class="genome-row"><span class="lbl">Parent 2</span>${geneRow(p2, (i) => (i >= I.cut ? "p2" : "") + (i === I.cut - 1 ? " cut" : ""))}</div>
            <div class="genome-row"><span class="lbl">Child</span>${geneRow(I.child, (i) => (i < I.cut ? "p1" : "p2") + (i === I.cut - 1 ? " cut" : ""))}<span class="mono dim">f=${f(I.child)}</span></div>`;
        }
        if (s.k === "mut") {
          I.bit = randint(0, L - 1);
          I.mutant = I.child
            .split("")
            .map((b, i) => (i === I.bit ? (b === "1" ? "0" : "1") : b))
            .join("");
          viz = `<div class="genome-row"><span class="lbl">Child</span>${geneRow(I.child)}<span class="mono dim">f=${f(I.child)}</span></div>
            <div class="genome-row"><span class="lbl">Mutant</span>${geneRow(I.mutant, (i) => (i === I.bit ? "changed" : ""))}<span class="mono dim">f=${f(I.mutant)}</span></div>`;
        }
        if (s.k === "rep") {
          const fits = st.pop.map(f),
            worst = fits.indexOf(Math.min(...fits));
          const ok = f(I.mutant) >= fits[worst];
          const before = st.pop[worst];
          if (ok) st.pop[worst] = I.mutant;
          viz =
            `<p>Weakest member: #${worst + 1} <span class="mono">${before}</span> (f=${fits[worst]}). Mutant f=${f(I.mutant)} → <b style="color:${ok ? "var(--teal)" : "var(--rose)"}">${ok ? "replaces it" : "discarded"}</b>.</p>` +
            popTable({ [worst]: ok ? "hl" : "bad" });
          st.gen++;
        }
        qs("#stageTag", card).textContent = s.name;
        qs("#stageTag", card).style.color = s.c;
        qs("#stageDesc", card).innerHTML = s.d;
        qs("#stageViz", card).innerHTML = viz;
        qs("#genTxt", card).textContent =
          `loop ${st.gen} · best f = ${st.evaluated ? Math.max(...st.pop.map(f)) : "?"}`;
        drawLoop();
      }
      const next = () => {
        st.step = st.step === 5 ? 1 : st.step + 1;
        doStage();
      };
      let stop = null;
      qs("#next", card).onclick = next;
      qs("#auto", card).onclick = (e) => {
        if (stop) {
          stop();
          stop = null;
          e.target.textContent = "Auto-play";
          e.target.classList.remove("on");
          return;
        }
        e.target.textContent = "Pause";
        e.target.classList.add("on");
        stop = life.interval(next, 900);
      };
      qs("#reset", card).onclick = () => {
        reset();
        doStage();
      };
      doStage();

      root.appendChild(
        predict({
          id: "l3-recipe-1",
          q: "Which two stages use fitness values to <i>make a decision</i>?",
          opts: [
            "Selection and Replacement",
            "Recombination and Mutation",
            "Mutation and Replacement",
            "Only the Fitness stage",
          ],
          a: 0,
          why: "Selection uses fitness to decide <b>who breeds</b>. Replacement uses it to decide <b>who survives</b>. Recombination and mutation are blind: they don't look at fitness at all. That's why variation operators <i>explore</i> and selection/replacement <i>exploit</i>.",
        }),
      );

      // Glossary from the "Some terms" slide
      const TERMS = {
        "Algorithm type": [
          ["Generational", "Build a whole new population each generation.", "l4-types"],
          ["Steady state", "Make only 1–2 children per iteration and replace weak members.", "l4-types"],
          ["Elitist", "Copy the best n unchanged into the next generation.", "l4-types"],
        ],
        Selection: [
          ["Rank-based", "Probability ∝ rank, not raw fitness.", "l4-rank"],
          ["Roulette wheel", "Probability ∝ fitness (fitness-proportionate).", "l4-roulette"],
          ["Tournament", "Pick t at random and keep the best.", "l4-tournament"],
        ],
        Replacer: [
          ["Weakest", "The new child replaces the worst member.", "l4-replacement"],
          ["First weaker", "Scan the population and replace the first member that is weaker.", "l4-replacement"],
        ],
        Recombination: [
          ["Single-point", "One cut; swap tails.", "l4-crossover"],
          ["Multi-point", "k cuts; alternate segments.", "l4-crossover"],
          ["Uniform", "A random mask picks each gene's parent.", "l4-crossover"],
        ],
        Mutation: [
          ["Single gene", "Change one gene.", "l4-mutation"],
          ["Multiple gene", "Apply single-gene mutation M times.", "l4-mutation"],
        ],
        Parameters: [
          ["Population size", "How many candidates exist at once.", "l4-lab"],
          ["Generations / iterations", "How long we run (termination).", "l4-lab"],
          ["Mutation rate", "Probability of mutating (per child or per gene).", "l4-lab"],
          ["Crossover rate", "Probability that a pair is recombined instead of copied.", "l4-lab"],
          ["Tournament size", "t: higher means stronger selection pressure.", "l4-tournament"],
        ],
      };
      const g =
        el(`<div class="card"><div class="card-head"><h2>Vocabulary map</h2><span class="tag">from the "Some terms" slide</span></div>
        <p class="dim">Click a term. Each links to the module where you can play with it. This list is the lecture's table of contents for L3–L4.</p>
        <div class="grid three">${Object.entries(TERMS)
          .map(
            ([cat, ts]) =>
              `<div><h3 class="dim" style="font-size:13px;text-transform:uppercase;letter-spacing:.06em">${cat}</h3>${ts.map(([t, d, link], i) => `<button class="btn small term" style="margin:0 6px 6px 0" data-cat="${cat}" data-i="${i}">${t}</button>`).join("")}</div>`,
          )
          .join("")}</div>
        <div class="callout teal" id="termOut" style="display:none"></div></div>`);
      root.appendChild(g);
      qsa(".term", g).forEach((b) =>
        b.addEventListener("click", () => {
          const [t, d, link] = TERMS[b.dataset.cat][+b.dataset.i];
          qsa(".term", g).forEach((x) => x.classList.toggle("on", x === b));
          const o = qs("#termOut", g);
          o.style.display = "block";
          o.innerHTML = `<b>${t}</b>: ${d} <a href="#${link}">Open the visualizer →</a>`;
        }),
      );

      root.appendChild(
        takeaways(
          [
            "An EA needs just five things: a <b>population</b>, a <b>fitness function</b>, <b>selection</b> biased towards fitter candidates, <b>variation</b> (mutation, optional crossover), and a <b>replacement</b> rule.",
            "Variation operators are blind to fitness. Selection and replacement are where fitness gets used.",
            "Every EA variant is a different choice for each box: generational vs steady-state, roulette vs tournament, 1-point vs uniform, and so on.",
          ],
          "An EA scores candidates, picks fitter ones to breed, varies their children, and keeps the survivors, then repeats.",
        ),
      );
    },
  });

  /* ============ 3.2 TSP ============ */
  N.register({
    id: "l3-tsp",
    lecture: 3,
    order: 2,
    num: "3.2",
    title: "The TSP example problem",
    blurb:
      "Build tours on the lecture's 5-city map, see why a permutation encoding fits, and watch the search space explode.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "The lecture uses the <b>Travelling Salesperson Problem</b> as its running example: visit every city once and return to the start, making the tour as short as possible. A candidate solution is a <b>permutation</b> of the cities. Its fitness is the tour length, and we want to <b>minimise</b> it.",
        ),
      );
      let tour = "";
      const card =
        el(`<div class="card"><div class="card-head"><h2>Build a tour</h2><span class="tag amber">click cities in order</span></div>
        <div class="grid side"><div id="map"></div><div>
          <div class="stat-row"><div class="stat teal"><small>Tour</small><b id="tt">—</b></div><div class="stat amber"><small>Length</small><b id="tl">—</b></div></div>
          <div id="mx"></div><p class="faint" style="font-size:12.5px;margin-top:8px">Map not to scale: the matrix is the ground truth. Edges used by your tour are highlighted.</p>
        </div></div>
        <div class="controls"><button class="btn" id="undo">Undo</button><button class="btn" id="clear">Clear</button><button class="btn" id="rand">Random tour</button><button class="btn" id="ex">Lecture start: ABDEC</button><button class="btn primary" id="best">Show an optimal tour</button></div>
        <div id="msg" class="dim"></div></div>`);
      root.appendChild(card);
      const perms = (arr) =>
        arr.length <= 1
          ? [arr]
          : arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
      const allTours = perms(["B", "C", "D", "E"]).map((p) => "A" + p.join(""));
      const bestLen = Math.min(...allTours.map((t) => TSP.len(t)));
      function draw() {
        const complete = tour.length === 5;
        qs("#map", card).innerHTML = tspSVG(tour, { allEdges: true, clickable: true, order: true, open: !complete });
        const pairs = [];
        for (let i = 0; i < tour.length - (complete ? 0 : 1); i++) pairs.push([tour[i], tour[(i + 1) % tour.length]]);
        qs("#mx", card).innerHTML = matrixHTML(pairs);
        qs("#tt", card).textContent = tour || "—";
        const partial = pairs.reduce((s, [a, b]) => s + TSP.D[a][b], 0);
        qs("#tl", card).textContent = tour.length ? (complete ? partial : partial + "…") : "—";
        qs("#msg", card).innerHTML = complete
          ? TSP.len(tour) === bestLen
            ? `<span style="color:var(--teal)">Optimal! ${bestLen} is the shortest possible for this map.</span>`
            : `The shortest possible tour is ${bestLen}. You're ${TSP.len(tour) - bestLen} over.`
          : "";
        qsa(".city", card).forEach((g) =>
          g.addEventListener("click", () => {
            if (!tour.includes(g.dataset.c)) {
              tour += g.dataset.c;
              draw();
            }
          }),
        );
      }
      qs("#undo", card).onclick = () => {
        tour = tour.slice(0, -1);
        draw();
      };
      qs("#clear", card).onclick = () => {
        tour = "";
        draw();
      };
      qs("#rand", card).onclick = () => {
        tour = shuffle([...TSP.cities]).join("");
        draw();
      };
      qs("#ex", card).onclick = () => {
        tour = "ABDEC";
        draw();
      };
      qs("#best", card).onclick = () => {
        tour = allTours.find((t) => TSP.len(t) === bestLen);
        draw();
      };
      draw();

      root.appendChild(
        predict({
          id: "l3-tsp-1",
          q: "Are <code>ABDEC</code> and <code>BDECA</code> different solutions?",
          opts: [
            "Yes, they are different permutations, so they are different tours",
            "No, it's the same cycle started at a different city, so it has the same length",
            "Only if the distance matrix is asymmetric",
          ],
          a: 1,
          why: "A rotation gives the same cycle, and so does a reversal (<code>CEDBA</code>) when distances are symmetric. So several genotypes (permutations) map to one phenotype (tour). The encoding is <b>redundant</b>: there are k! permutations but only (k−1)!/2 distinct tours.",
        }),
      );

      const sp =
        el(`<div class="card"><div class="card-head"><h2>Why not just try every tour?</h2><span class="tag rose">search space explosion</span></div>
        <div class="controls" id="spc"></div><div class="stat-row">
        <div class="stat"><small>Permutations k!</small><b id="kf"></b></div><div class="stat amber"><small>Distinct tours (k−1)!/2</small><b id="dt"></b></div><div class="stat rose"><small>Time at 10⁹ tours/sec</small><b id="tm"></b></div></div>
        <p class="dim">Enumeration is the only guaranteed method and it dies around 15–20 cities. That's why the lecture uses <b>heuristic search</b>: hillclimbing, local search, and EAs.</p></div>`);
      root.appendChild(sp);
      const fact = (n) => {
        let r = 1n;
        for (let i = 2n; i <= BigInt(n); i++) r *= i;
        return r;
      };
      const big = (b) => {
        const s = b.toString();
        return s.length > 12 ? `${s[0]}.${s.slice(1, 3)}×10^${s.length - 1}` : Number(b).toLocaleString();
      };
      const human = (sec) => {
        const u = [
          ["years", 31557600],
          ["days", 86400],
          ["hours", 3600],
          ["min", 60],
          ["sec", 1],
        ];
        if (sec < 1) return "< 1 sec";
        for (const [n, v] of u)
          if (sec >= v) {
            const x = sec / v;
            return (x > 1e6 ? x.toExponential(1) : x.toFixed(x < 10 ? 1 : 0)) + " " + n;
          }
      };
      const k = N.slider("Cities k", 4, 30, 1, 5);
      qs("#spc", sp).appendChild(k);
      const upd = () => {
        const n = k.value;
        const t = fact(n - 1) / 2n;
        qs("#kf", sp).textContent = big(fact(n));
        qs("#dt", sp).textContent = big(t);
        qs("#tm", sp).textContent = human(Number(t) / 1e9);
      };
      k.onInput(upd);
      upd();

      root.appendChild(
        predict({
          id: "l3-tsp-2",
          q: "How many <b>distinct</b> tours does the 5-city map have?",
          opts: ["120", "24", "12", "5"],
          a: 2,
          why: "(5−1)!/2 = 24/2 = <b>12</b>. Fix the start city (÷5 rotations) and ignore direction (÷2 reversals). Brute force is trivial here, which makes it a good sandbox for watching hillclimbing.",
        }),
      );

      root.appendChild(
        takeaways([
          "Encoding: a TSP candidate is a <b>permutation</b> of cities. Fitness is the tour length (minimise).",
          "Distinct tours = (k−1)!/2. This grows faster than exponentially, so enumeration is hopeless beyond a small k.",
          "The encoding is redundant (rotations and reversals). That affects the landscape too: many points share a fitness.",
        ]),
      );
    },
  });

  /* ============ 3.3 Hillclimbing ============ */
  N.register({
    id: "l3-hc",
    lecture: 3,
    order: 3,
    num: "3.3",
    title: "Hillclimbing on the TSP",
    blurb: "Replay the lecture's exact hillclimbing trace, then let it run randomly and watch it get stuck.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Hillclimbing (HC) is an EA with a population of one. Mutate a copy of the current solution. Keep the mutant if it is <b>no worse</b>, otherwise throw it away. Mutation here is the lecture's operator: <b>swap two adjacent cities</b>, where the last and first positions count as adjacent.",
        ),
      );
      const PSEUDO = [
        "0. Initialise: random solution c, evaluate f(c)",
        "1. m ← mutate(copy of c); evaluate f(m)",
        "2. if f(m) no worse than f(c): c ← m   else discard m",
        "3. if termination reached: stop   else go to 1",
      ];
      const TRACE = [2, 4, 0, 3]; // swap indices reproducing the slides: ABEDC, CBDEA, BADEC, BADCE
      let mode = "trace",
        cur,
        mut,
        swapI,
        hist,
        log,
        ti,
        line;
      function reset() {
        cur = mode === "trace" ? "ABDEC" : shuffle([...TSP.cities]).join("");
        mut = null;
        swapI = null;
        hist = [TSP.len(cur)];
        log = [];
        ti = 0;
        line = 0;
        draw();
      }
      const card = el(`<div class="card"><div class="controls" id="modeBar"></div>
        <div class="grid two"><div><div class="card-head"><span class="tag teal">Current c</span><b class="mono" id="cT"></b></div><div id="cMap"></div></div>
        <div><div class="card-head"><span class="tag violet">Mutant m</span><b class="mono" id="mT"></b></div><div id="mMap"></div></div></div>
        <div id="verdict" class="callout" style="display:none"></div>
        <div class="controls"><button class="btn primary" id="step">Mutate & decide</button><button class="btn" id="run">Run 30 steps</button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="grid two"><div><div class="pseudo" id="pseudo"></div><h3 style="margin-top:16px">Neighbourhood of c</h3><div id="nb"></div></div>
        <div><h3>Current tour length over time</h3><canvas class="viz" id="ch"></canvas><div class="log" style="margin-top:10px"><table class="t" id="log"></table></div></div></div></div>`);
      root.appendChild(card);
      qs("#modeBar", card).appendChild(
        N.seg(
          [
            ["trace", "Lecture trace (exact slides)"],
            ["random", "Random run"],
          ],
          mode,
          (v) => {
            mode = v;
            reset();
          },
        ),
      );

      function step() {
        if (mode === "trace" && ti >= TRACE.length) {
          qs("#verdict", card).style.display = "block";
          qs("#verdict", card).className = "callout";
          qs("#verdict", card).innerHTML =
            "That's the end of the slides' trace. Switch to <b>Random run</b> to keep exploring.";
          return;
        }
        swapI = mode === "trace" ? TRACE[ti++] : randint(0, 4);
        mut = TSP.swap(cur, swapI);
        const fc = TSP.len(cur),
          fm = TSP.len(mut),
          ok = fm <= fc;
        log.unshift({ n: log.length + 1, m: mut, fm, fc, ok });
        const v = qs("#verdict", card);
        v.style.display = "block";
        v.className = "callout " + (ok ? "teal" : "rose");
        v.innerHTML = `Swapped <b>${cur[swapI]}</b>↔<b>${cur[(swapI + 1) % 5]}</b> → <span class="mono">${mut}</span> has length <b>${fm}</b> vs current <b>${fc}</b>. ${ok ? (fm === fc ? "Equal, and HC accepts moves that are <b>no worse</b>, so it moves sideways." : "Better, so it becomes the new current solution.") : "Worse, so it's discarded and current stays the same."}`;
        drawMaps(true);
        if (ok) cur = mut;
        hist.push(TSP.len(cur));
        line = 2;
        draw(false);
      }
      function drawMaps(showMut) {
        qs("#cMap", card).innerHTML = tspSVG(cur, { maxH: 240 });
        qs("#cT", card).textContent = `${cur} · ${TSP.len(cur)}`;
        const idx = swapI == null ? [] : [(swapI + 4) % 5, (swapI + 1) % 5];
        qs("#mMap", card).innerHTML =
          showMut && mut
            ? tspSVG(mut, { maxH: 240, highlight: idx, color: "var(--text-faint)" })
            : `<div class="viz" style="height:240px;display:grid;place-items:center;border:1px dashed var(--line-2);border-radius:12px;color:var(--text-faint)">press "Mutate & decide"</div>`;
        qs("#mT", card).textContent = mut ? `${mut} · ${TSP.len(mut)}` : "";
      }
      function draw(maps = true) {
        if (maps) drawMaps(false);
        qs("#pseudo", card).innerHTML = PSEUDO.map((p, i) => `<div class="${i === line ? "on" : ""}">${p}</div>`).join(
          "",
        );
        const fc = TSP.len(cur),
          nbs = TSP.neighbours(cur);
        const better = nbs.filter((n) => TSP.len(n) < fc).length;
        qs("#nb", card).innerHTML =
          `<table class="t"><tr><th>Swap</th><th>Neighbour</th><th class="num">Length</th></tr>${nbs.map((n, i) => `<tr class="${TSP.len(n) < fc ? "hl" : TSP.len(n) > fc ? "" : ""}"><td class="mono faint">${cur[i]}↔${cur[(i + 1) % 5]}</td><td class="mono">${n}</td><td class="num" style="color:${TSP.len(n) < fc ? "var(--teal)" : TSP.len(n) === fc ? "var(--amber)" : "var(--text-faint)"}">${TSP.len(n)}</td></tr>`).join("")}</table>
          <p style="margin-top:8px">${better ? `<span style="color:var(--teal)">${better} improving neighbour${better > 1 ? "s" : ""}</span>, so HC can still go downhill in length.` : `<b style="color:var(--amber)">No neighbour is shorter: this is a local optimum</b> for the adjacent-swap operator${fc === 28 ? " (and 28 happens to be the global optimum for this map)" : ". The global optimum is 28, so HC is stuck"}.`}</p>`;
        qs("#log", card).innerHTML =
          `<tr><th>#</th><th>Mutant</th><th class="num">f(m)</th><th class="num">f(c)</th><th>Decision</th></tr>` +
          log
            .map(
              (r) =>
                `<tr><td class="faint">${r.n}</td><td class="mono">${r.m}</td><td class="num">${r.fm}</td><td class="num">${r.fc}</td><td style="color:${r.ok ? "var(--teal)" : "var(--rose)"}">${r.ok ? "accept" : "reject"}</td></tr>`,
            )
            .join("");
        N.lineChart(qs("#ch", card), {
          series: [{ data: hist, color: N.colors().teal, dots: hist.length < 40 }],
          height: 170,
          xLabel: "iteration",
          yMin: 26,
        });
      }
      qs("#step", card).onclick = step;
      qs("#rs", card).onclick = reset;
      qs("#run", card).onclick = () => {
        if (mode === "trace") {
          mode = "random";
          qsa("#modeBar button", card).forEach((b) => b.classList.toggle("on", b.dataset.v === "random"));
        }
        let n = 0;
        const stop = life.interval(() => {
          step();
          if (++n >= 30) stop();
        }, 120);
      };
      life.onResize(() => draw());
      reset();

      root.appendChild(
        predict({
          id: "l3-hc-1",
          q: "In the lecture trace, current = <code>BADEC</code> (28) and the mutant <code>BADCE</code> is also 28. What does hillclimbing do?",
          opts: [
            "Rejects it, because it isn't an improvement",
            "Accepts it: HC keeps mutants that are no worse",
            "Stops, because no progress means it's finished",
          ],
          a: 1,
          why: "Step 2 says <i>if f(m) is <b>no worse</b> than f(c), replace c with m</i>. Accepting equal moves lets HC drift across <b>plateaus</b> instead of freezing, which matters on landscapes with lots of equal-fitness regions.",
        }),
      );
      root.appendChild(
        predict({
          id: "l3-hc-2",
          q: "HC reaches a tour where <b>none</b> of its 5 adjacent-swap neighbours is shorter. Is that tour guaranteed to be optimal?",
          opts: [
            "Yes: if no neighbour is better, nothing is",
            "No: it's only a local optimum for this mutation",
            "Only if HC ran for more than k! steps",
          ],
          a: 1,
          why: '"Nothing better nearby" depends on what <i>nearby</i> means, and the mutation operator defines that. With a different operator (e.g. swap <i>any</i> two cities) the same tour might have better neighbours. Try random runs: some start points get stuck above 28.',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "HC = mutate a copy, keep it if it's <b>no worse</b>, and repeat. A population of one.",
            "It only ever moves to neighbours defined by the mutation operator, so it climbs the nearest hill and stops there.",
            "A <b>local optimum</b> is relative to the neighbourhood. Change the operator and you change which points are local optima.",
          ],
          "Hillclimbing only accepts no-worse neighbours, so it gets stuck at the first local optimum it finds.",
        ),
      );
    },
  });

  /* ============ 3.4 Landscapes ============ */
  N.register({
    id: "l3-landscape",
    lecture: 3,
    order: 4,
    num: "3.4",
    title: "Fitness landscapes",
    blurb:
      "Drop a hillclimber on unimodal, multimodal, plateau, deceptive and random landscapes. Change the mutation step size.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Line the candidate solutions in <i>S</i> up along the x-axis so that <b>neighbours sit next to each other</b>, then plot fitness f(s) on the y-axis. The result is a <b>landscape</b>. The mutation operator decides who counts as a neighbour, so it shapes the landscape your algorithm actually experiences.",
        ),
      );
      const DESC = {
        unimodal: "<b>Unimodal</b>: one peak. Every uphill path leads to the global optimum, so HC always wins.",
        multimodal:
          "<b>Multimodal</b>: many peaks. HC climbs whichever hill it starts on. <i>Most real landscapes look like this: locally smooth, globally rugged.</i>",
        plateau:
          "<b>Plateau</b>: large flat regions give no gradient. HC wanders randomly (accepting equal moves) until it happens to reach a slope.",
        deceptive:
          "<b>Deceptive</b>: the slope points <i>away</i> from the global optimum. Following local improvement actively misleads you.",
        random:
          "<b>Random</b>: f(s) is a random number. Neighbours tell you nothing about each other, so HC is no better than random guessing.",
      };
      let kind = "multimodal",
        L = N.makeLandscape(kind),
        stepMax = 3,
        cur,
        trail,
        lastMut,
        lastOk,
        evals,
        running = null;
      const card =
        el(`<div class="card"><div class="controls" id="bar"></div><canvas class="viz" id="cv" style="cursor:crosshair"></canvas>
        <div class="legend"><span style="--c:var(--teal)">current solution</span><span style="--c:var(--violet)">accepted mutant</span><span style="--c:var(--rose)">rejected mutant</span><span style="--c:var(--amber)">global optimum</span></div>
        <p class="dim" id="desc" style="margin-top:10px"></p>
        <div class="controls" id="bar2"><button class="btn primary" id="climb">Climb</button><button class="btn" id="stepB">One step</button><button class="btn ghost" id="rs">Random start</button><span class="faint">…or click the landscape to place the climber</span></div>
        <div class="stat-row"><div class="stat"><small>Evaluations</small><b id="ev">0</b></div><div class="stat teal"><small>Current f</small><b id="cf">0</b></div><div class="stat amber"><small>Global max</small><b id="gm">0</b></div></div>
        <div class="card" style="background:var(--bg-2);margin:14px 0 0"><div class="card-head"><h3>Run 200 random restarts</h3><span class="faint">400 evaluations each</span></div>
          <div class="controls"><button class="btn" id="stats">Run experiment</button><span id="statOut" class="dim"></span></div></div></div>`);
      root.appendChild(card);
      const cv = qs("#cv", card);
      qs("#bar", card).appendChild(
        N.seg(
          Object.entries(N.LANDSCAPES).map(([k, v]) => [k, v.name]),
          kind,
          (v) => {
            kind = v;
            L = N.makeLandscape(kind);
            reset();
          },
        ),
      );
      const ss = N.slider("Max mutation step", 1, 240, 1, stepMax);
      ss.onInput((v) => (stepMax = v));
      qs("#bar2", card).prepend(ss);

      const mutate = (i) => N.clamp(i + (rnd() < 0.5 ? -1 : 1) * randint(1, stepMax), 0, L.N - 1);
      function reset(at) {
        stopRun();
        cur = at ?? randint(0, L.N - 1);
        trail = [cur];
        lastMut = null;
        evals = 1;
        draw();
      }
      function step() {
        const m = mutate(cur);
        evals++;
        lastMut = m;
        lastOk = L.f(m) >= L.f(cur);
        if (lastOk) {
          cur = m;
          trail.push(cur);
        }
        draw();
      }
      function draw() {
        const { ctx, w, h } = N.setupCanvas(cv, 300);
        const { X, Y } = N.drawLandscape(ctx, w, h, L);
        const C = N.colors();
        ctx.strokeStyle = "rgba(206,130,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        trail.forEach((p, i) => (i ? ctx.lineTo(X(p), Y(L.f(p)) - 2) : ctx.moveTo(X(p), Y(L.f(p)) - 2)));
        ctx.stroke();
        if (lastMut != null) {
          ctx.fillStyle = lastOk ? C.violet : C.rose;
          ctx.beginPath();
          ctx.arc(X(lastMut), Y(L.f(lastMut)), 5, 0, 7);
          ctx.fill();
          ctx.strokeStyle = lastOk ? C.violet : C.rose;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(X(lastMut), Y(L.f(lastMut)));
          ctx.lineTo(X(lastMut), h - 18);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = C.teal;
        ctx.strokeStyle = C.panel;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X(cur), Y(L.f(cur)), 8, 0, 7);
        ctx.fill();
        ctx.stroke();
        qs("#ev", card).textContent = evals;
        qs("#cf", card).textContent = L.f(cur).toFixed(3);
        qs("#gm", card).textContent = L.max.toFixed(3);
        qs("#desc", card).innerHTML = DESC[kind];
      }
      function stopRun() {
        if (running) {
          running();
          running = null;
          qs("#climb", card).textContent = "Climb";
          qs("#climb", card).classList.remove("on");
        }
      }
      qs("#climb", card).onclick = () => {
        if (running) return stopRun();
        qs("#climb", card).textContent = "Pause";
        qs("#climb", card).classList.add("on");
        running = life.interval(() => {
          step();
          if (evals >= 400) stopRun();
        }, 30);
      };
      qs("#stepB", card).onclick = step;
      qs("#rs", card).onclick = () => reset();
      cv.addEventListener("click", (e) => {
        const r = cv.getBoundingClientRect();
        const x = (e.clientX - r.left - 10) / (r.width - 20);
        reset(N.clamp(Math.round(x * (L.N - 1)), 0, L.N - 1));
      });
      qs("#stats", card).onclick = () => {
        let hits = 0,
          sum = 0;
        for (let r = 0; r < 200; r++) {
          let c = randint(0, L.N - 1);
          for (let e = 1; e < 400; e++) {
            const m = mutate(c);
            if (L.f(m) >= L.f(c)) c = m;
          }
          if (L.f(c) >= L.max - 1e-9) hits++;
          sum += L.f(c) / L.max;
        }
        qs("#statOut", card).innerHTML =
          `Found the global optimum in <b style="color:var(--teal)">${Math.round(hits / 2)}%</b> of runs · mean final fitness <b>${Math.round(sum / 2)}%</b> of max <span class="faint">(${N.LANDSCAPES[kind].name}, max step ${stepMax})</span>`;
      };
      life.onResize(draw);
      reset();

      root.appendChild(
        el(
          `<div class="callout"><b>Try this sequence:</b> (1) Multimodal, step 3: run the experiment and note the success rate. (2) Set step to ~40 and rerun. (3) Set step to 240 (anywhere) and switch to Unimodal. What happened to locality?</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "l3-land-1",
          q: "On the <b>Random</b> landscape (f(s) is a random number generator), how does hillclimbing compare with random search?",
          opts: [
            "Much better, because it can still climb",
            "About the same, because neighbours tell you nothing",
            "Much worse, because it gets stuck immediately",
          ],
          a: 1,
          why: "HC works <i>only</i> because neighbours tend to have similar fitness (a locally smooth landscape). With no correlation between neighbours, a mutant is just a random sample, so no search method beats random guessing here.",
        }),
      );
      root.appendChild(
        predict({
          id: "l3-land-2",
          q: "You set the max mutation step to 240 (a mutant can be <i>anywhere</i>). On a realistic landscape, what goes wrong?",
          opts: [
            "Nothing: bigger jumps explore more, so it's strictly better",
            "The search becomes random sampling. Most of the space is poor",
            "HC can no longer accept moves",
          ],
          a: 1,
          why: "Lecture: <i>in large realistic problems the huge majority of the landscape has very poor fitness, and decent solutions concentrate in tiny areas. Big random changes are very likely to take us outside the good areas.</i> Small mutations exploit local smoothness.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Landscape = fitness plotted over the search space, with neighbours (under the mutation operator) placed next to each other.",
            "Small mutations → small fitness changes → the landscape is <b>locally smooth</b>. Real landscapes are locally smooth but <b>globally rugged</b> (multimodal).",
            "Feature types: <b>unimodal, multimodal, plateau, deceptive</b>. HC only reliably solves unimodal ones.",
            "Big mutations destroy locality and turn search into random sampling.",
          ],
          "The mutation operator defines the landscape: small steps make it locally smooth, but real landscapes are globally rugged.",
        ),
      );
    },
  });

  /* ============ 3.5 Neighbourhoods ============ */
  N.register({
    id: "l3-neighbourhood",
    lecture: 3,
    order: 5,
    num: "3.5",
    title: "Neighbourhoods",
    blurb:
      "Generate every mutant of a permutation or bitstring, and see how the operator decides what a local optimum is.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Given a mutation operator M, the <b>neighbourhood</b> of a solution s is the set of <b>all possible mutants</b> of s. It's the formal version of \"nearby\" in the landscape. Type your own strings below and compare with the lecture's two examples.",
        ),
      );
      const card = el(
        `<div class="card"><div class="tabs" id="tabs"><button data-t="perm" class="on">Permutation · adjacent swap</button><button data-t="bin">Binary · bit flip</button></div><div id="tb"></div></div>`,
      );
      root.appendChild(card);
      const gene = (ch, cls) => `<span class="gene ${cls}">${ch}</span>`;
      function renderTab(t) {
        const tb = qs("#tb", card);
        if (t === "perm") {
          tb.innerHTML = `<div class="controls"><label class="field">Permutation <input type="text" id="pi" value="EABDC" maxlength="12" style="width:160px;font-family:var(--mono)"></label><span class="faint">Lecture: neighbours of EABDC are {AEBDC, EBADC, EADBC, EABCD, CABDE}</span></div><div id="po"></div>`;
          const upd = () => {
            const s = qs("#pi", tb)
              .value.toUpperCase()
              .replace(/[^A-Z]/g, "");
            const valid = new Set(s).size === s.length && s.length >= 2;
            const isTsp = s.length === 5 && [...s].every((c) => "ABCDE".includes(c)) && valid;
            if (!valid) {
              qs("#po", tb).innerHTML =
                `<p style="color:var(--rose)">Needs ≥2 distinct letters (a permutation has no repeats).</p>`;
              return;
            }
            const k = s.length;
            qs("#po", tb).innerHTML =
              `<div class="genome-row"><span class="lbl">s</span><span class="genome">${[...s].map((c) => gene(c, "")).join("")}</span>${isTsp ? `<span class="mono dim">length ${TSP.len(s)}</span>` : ""}</div>` +
              Array.from({ length: k }, (_, i) => {
                const j = (i + 1) % k;
                const n = TSP.swap(s, i);
                return `<div class="genome-row"><span class="lbl">swap ${i + 1}↔${j + 1}</span><span class="genome">${[...n].map((c, x) => gene(c, x === i || x === j ? "changed" : "")).join("")}</span>${isTsp ? `<span class="mono" style="color:${TSP.len(n) < TSP.len(s) ? "var(--teal)" : "var(--text-faint)"}">${TSP.len(n)}</span>` : ""}</div>`;
              }).join("") +
              `<p class="dim">Each individual has <b>k = ${k}</b> neighbours: ${k} adjacent pairs around the ring (the last swap wraps: position ${k} ↔ 1).</p>`;
          };
          qs("#pi", tb).addEventListener("input", upd);
          upd();
        } else {
          tb.innerHTML = `<div class="controls"><label class="field">Bitstring <input type="text" id="bi" value="00110" maxlength="16" style="width:160px;font-family:var(--mono)"></label><span class="faint">Lecture: neighbours of 00110 are {10110, 01110, 00010, 00100, 00111}</span></div><div id="bo"></div>`;
          const upd = () => {
            const s = qs("#bi", tb).value.replace(/[^01]/g, "");
            if (!s) {
              qs("#bo", tb).innerHTML = "";
              return;
            }
            qs("#bo", tb).innerHTML =
              `<div class="genome-row"><span class="lbl">s</span><span class="genome">${[...s].map((c) => gene(c, "")).join("")}</span></div>` +
              [...s]
                .map(
                  (_, i) =>
                    `<div class="genome-row"><span class="lbl">flip bit ${i + 1}</span><span class="genome">${[...s].map((c, x) => gene(x === i ? (c === "1" ? "0" : "1") : c, x === i ? "changed" : "")).join("")}</span></div>`,
                )
                .join("") +
              `<p class="dim">Each individual has <b>L = ${s.length}</b> neighbours. For L-item bin packing, "flip bit i" means moving item i to the other bin.</p>`;
          };
          qs("#bi", tb).addEventListener("input", upd);
          upd();
        }
      }
      qsa("#tabs button", card).forEach((b) =>
        b.addEventListener("click", () => {
          qsa("#tabs button", card).forEach((x) => x.classList.toggle("on", x === b));
          renderTab(b.dataset.t);
        }),
      );
      renderTab("perm");

      // 3-bit cube
      const cube =
        el(`<div class="card"><div class="card-head"><h2>The operator decides the local optima</h2><span class="tag amber">3-bit search space</span></div>
        <p class="dim">All 8 solutions of length 3. Lines connect neighbours under the chosen operator. A <b style="color:var(--amber)">gold ring</b> marks a local optimum: no neighbour is strictly fitter.</p>
        <div class="controls" id="cb"></div><div class="grid side"><svg class="viz" id="cube" viewBox="0 0 420 330"></svg><div id="cinfo"></div></div></div>`);
      root.appendChild(cube);
      const FITS = {
        onemax: { n: "OneMax (count 1s)", f: (u) => u },
        trap: { n: "Trap (deceptive)", f: (u) => (u === 3 ? 3 : 2 - u) },
      };
      let fk = "trap",
        op = "1";
      qs("#cb", cube).append(
        N.seg(
          Object.entries(FITS).map(([k, v]) => [k, v.n]),
          fk,
          (v) => {
            fk = v;
            drawCube();
          },
        ),
        N.seg(
          [
            ["1", "flip exactly 1 bit"],
            ["12", "flip 1 or 2 bits"],
            ["any", "flip any bits"],
          ],
          op,
          (v) => {
            op = v;
            drawCube();
          },
        ),
      );
      const POS = {
        "000": [110, 250],
        100: [260, 250],
        "010": [110, 110],
        110: [260, 110],
        "001": [180, 290],
        101: [330, 290],
        "011": [180, 150],
        111: [330, 150],
      };
      function drawCube() {
        const S = Object.keys(POS),
          f = (s) => FITS[fk].f(s.split("").filter((b) => b === "1").length);
        const ham = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
        const isN = (a, b) => {
          const d = ham(a, b);
          return op === "1" ? d === 1 : op === "12" ? d >= 1 && d <= 2 : d >= 1;
        };
        const maxF = Math.max(...S.map(f));
        const lo = S.filter((s) => S.every((t) => !isN(s, t) || f(t) <= f(s)));
        const lines = [];
        S.forEach((a, i) =>
          S.slice(i + 1).forEach((b) => {
            if (isN(a, b))
              lines.push(
                `<line x1="${POS[a][0]}" y1="${POS[a][1]}" x2="${POS[b][0]}" y2="${POS[b][1]}" stroke="${ham(a, b) === 1 ? "var(--line-2)" : "rgba(206,130,255,0.35)"}" stroke-width="${ham(a, b) === 1 ? 2 : 1.2}" ${ham(a, b) > 1 ? 'stroke-dasharray="4 4"' : ""}/>`,
              );
          }),
        );
        qs("#cube", cube).innerHTML =
          lines.join("") +
          S.map((s) => {
            const v = f(s),
              t = v / maxF;
            return `<g>
          ${lo.includes(s) ? `<circle cx="${POS[s][0]}" cy="${POS[s][1]}" r="31" fill="none" stroke="var(--amber)" stroke-width="3"/>` : ""}
          <circle cx="${POS[s][0]}" cy="${POS[s][1]}" r="24" fill="rgba(88,204,2,${0.08 + t * 0.55})" stroke="var(--teal)" stroke-width="1.5"/>
          <text x="${POS[s][0]}" y="${POS[s][1] - 2}" text-anchor="middle" fill="var(--text)" font-size="13" font-family="var(--mono)" font-weight="700">${s}</text>
          <text x="${POS[s][0]}" y="${POS[s][1] + 13}" text-anchor="middle" fill="var(--text-dim)" font-size="11" font-family="var(--mono)">f=${v}</text></g>`;
          }).join("");
        const nCount = S.filter((t) => isN("000", t)).length;
        qs("#cinfo", cube).innerHTML =
          `<div class="stat-row"><div class="stat"><small>Neighbours each</small><b>${nCount}</b></div><div class="stat amber"><small>Local optima</small><b>${lo.length}</b></div></div>
          <p><b>Local optima:</b> <span class="mono">${lo.join(", ")}</span></p>
          <p class="dim">${fk === "trap" ? (op === "any" ? 'With every string as a neighbour, only the global optimum 111 is left. But the "neighbourhood" is now the whole space, so each step is as expensive as enumeration and there\'s no locality to exploit.' : "000 is a <b>trap</b>: every small move from it goes downhill, but the global optimum 111 is as far away as possible. A hillclimber starting near 000 is lured there.") : "OneMax is unimodal under bit-flip: every non-optimal string has a fitter neighbour, so HC always reaches 111."}</p>`;
      }
      drawCube();

      root.appendChild(
        predict({
          id: "l3-nb-1",
          q: "Encoding: permutations of 10 cities. Mutation: swap any adjacent pair (wrapping around). How big is each neighbourhood?",
          opts: ["9", "10", "45", "10! = 3,628,800"],
          a: 1,
          why: "There are k adjacent pairs around a ring of k, so there are <b>10</b> neighbours. (Without wrap-around it would be 9. Swapping <i>any</i> pair gives C(10,2) = 45.) The neighbourhood is tiny compared with the 10! search space: that's the point of local search.",
        }),
      );
      root.appendChild(
        takeaways([
          "Neighbourhood of s = the set of all mutants M(s). Permutation + adjacent swap: <b>k</b> neighbours. Bitstring + bit flip: <b>L</b> neighbours.",
          "Whether a point is a local optimum depends on the neighbourhood, so choosing the operator is a design decision.",
          "Bigger neighbourhoods → fewer local optima but less locality and more cost per step.",
        ]),
      );
    },
  });

  /* ============ 3.6 Local search ============ */
  N.register({
    id: "l3-local",
    lecture: 3,
    order: 6,
    num: "3.6",
    title: "Local search: Monte Carlo & Tabu",
    blurb:
      "Race hillclimbing against Monte Carlo search (accepts worse moves sometimes) and Tabu search (can't go back).",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "The lecture gives two ways to beat hillclimbing: <b>(1) allow downhill moves</b>, which is what the <i>local search</i> family does, or <b>(2) use a population</b>. This module covers (1). Local search keeps a current solution <i>and</i> a best-so-far, because the current solution can now get worse.",
        ),
      );
      root.appendChild(
        el(`<div class="grid two">
        <div class="card"><div class="card-head"><span class="tag amber">Monte Carlo search</span></div><div class="pseudo"><div>1. m ← random neighbour of c</div><div>2. if f(m) better: c ← m</div><div>   else: c ← m with probability p (e.g. 0.1)</div><div>   update best-so-far b</div></div></div>
        <div class="card"><div class="card-head"><span class="tag violet">Tabu search</span></div><div class="pseudo"><div>1. evaluate ALL neighbours of c</div><div>2. c ← best neighbour, even if worse,</div><div>   unless it's tabu (recently visited):</div><div>   then take the next best, etc.</div><div>   update best-so-far b</div></div></div></div>`),
      );
      let kind = "multimodal",
        L = N.makeLandscape(kind),
        r = 3,
        p = 0.1,
        T = 25,
        algs,
        running = null,
        tick = 0;
      const COL = { hc: "var(--teal)", mc: "var(--amber)", tabu: "var(--violet)" };
      function init() {
        const start = randint(0, L.N - 1);
        algs = {
          hc: { c: start, b: start, evals: 1, trail: [start] },
          mc: { c: start, b: start, evals: 1, trail: [start] },
          tabu: { c: start, b: start, evals: 1, trail: [start], list: [start] },
        };
        tick = 0;
        draw();
      }
      const nb = (c) => N.clamp(c + (rnd() < 0.5 ? -1 : 1) * randint(1, r), 0, L.N - 1);
      function stepAlg(k, a) {
        if (k === "hc") {
          const m = nb(a.c);
          a.evals++;
          if (L.f(m) >= L.f(a.c)) a.c = m;
        }
        if (k === "mc") {
          const m = nb(a.c);
          a.evals++;
          if (L.f(m) >= L.f(a.c) || rnd() < p) a.c = m;
        }
        if (k === "tabu") {
          const cands = [];
          for (let d = -r; d <= r; d++) {
            const m = a.c + d;
            if (d && m >= 0 && m < L.N) cands.push(m);
          }
          a.evals += cands.length;
          cands.sort((x, y) => L.f(y) - L.f(x));
          const pick = cands.find((m) => !a.list.includes(m)) ?? cands[0];
          a.c = pick;
          a.list.push(pick);
          if (a.list.length > T) a.list.shift();
        }
        if (L.f(a.c) > L.f(a.b)) a.b = a.c;
        a.trail.push(a.c);
        if (a.trail.length > 60) a.trail.shift();
      }
      const card =
        el(`<div class="card"><div class="controls" id="b1"></div><div class="controls" id="b2"></div><canvas class="viz" id="cv"></canvas>
        <div class="legend"><span style="--c:var(--teal)">Hillclimbing</span><span style="--c:var(--amber)">Monte Carlo</span><span style="--c:var(--violet)">Tabu</span><span style="--c:var(--text)">◆ = best-so-far</span></div>
        <div class="controls"><button class="btn primary" id="go">Run</button><button class="btn" id="st">Step</button><button class="btn ghost" id="rs">New start</button></div>
        <table class="t" id="tbl"></table>
        <div class="card" style="background:var(--bg-2);margin:14px 0 0"><div class="card-head"><h3>Race 300 times</h3><span class="faint">equal budget: 600 fitness evaluations each (Tabu spends 2r per step)</span></div>
        <div class="controls"><button class="btn" id="race">Run race</button></div><canvas class="viz" id="rc"></canvas><p class="dim" id="raceTxt"></p></div></div>`);
      root.appendChild(card);
      qs("#b1", card).appendChild(
        N.seg(
          Object.entries(N.LANDSCAPES)
            .filter(([k]) => k !== "random")
            .map(([k, v]) => [k, v.name]),
          kind,
          (v) => {
            kind = v;
            L = N.makeLandscape(kind);
            init();
          },
        ),
      );
      const sR = N.slider("Neighbourhood radius r", 1, 12, 1, r),
        sP = N.slider("MC accept-worse p", 0, 1, 0.01, p, (v) => v.toFixed(2)),
        sT = N.slider("Tabu tenure", 1, 80, 1, T);
      sR.onInput((v) => (r = v));
      sP.onInput((v) => (p = v));
      sT.onInput((v) => (T = v));
      qs("#b2", card).append(sR, sP, sT);
      function draw() {
        const { ctx, w, h } = N.setupCanvas(qs("#cv", card), 300);
        const { X, Y } = N.drawLandscape(ctx, w, h, L);
        const C = N.colors(),
          cmap = { hc: C.teal, mc: C.amber, tabu: C.violet };
        if (algs.tabu.list) {
          ctx.fillStyle = "rgba(206,130,255,0.18)";
          algs.tabu.list.forEach((m) => ctx.fillRect(X(m) - 1.5, h - 18, 3, 8));
        }
        Object.entries(algs).forEach(([k, a], idx) => {
          const off = (idx - 1) * 4;
          ctx.strokeStyle = cmap[k] + "88";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          a.trail.forEach((q, i) => (i ? ctx.lineTo(X(q), Y(L.f(q)) + off) : ctx.moveTo(X(q), Y(L.f(q)) + off)));
          ctx.stroke();
          ctx.fillStyle = cmap[k];
          ctx.beginPath();
          ctx.arc(X(a.c), Y(L.f(a.c)) + off, 7, 0, 7);
          ctx.fill();
          const bx = X(a.b),
            by = Y(L.f(a.b)) - 12 - idx * 9;
          ctx.beginPath();
          ctx.moveTo(bx, by - 4);
          ctx.lineTo(bx + 4, by);
          ctx.lineTo(bx, by + 4);
          ctx.lineTo(bx - 4, by);
          ctx.closePath();
          ctx.fill();
        });
        qs("#tbl", card).innerHTML =
          `<tr><th>Algorithm</th><th class="num">Evaluations</th><th class="num">Current f</th><th class="num">Best-so-far f</th><th class="num">% of global</th></tr>` +
          [
            ["hc", "Hillclimbing"],
            ["mc", "Monte Carlo"],
            ["tabu", "Tabu"],
          ]
            .map(
              ([k, n]) =>
                `<tr><td><span style="color:${COL[k]}">●</span> ${n}</td><td class="num">${algs[k].evals}</td><td class="num">${L.f(algs[k].c).toFixed(3)}</td><td class="num">${L.f(algs[k].b).toFixed(3)}</td><td class="num">${Math.round((100 * L.f(algs[k].b)) / L.max)}%</td></tr>`,
            )
            .join("");
      }
      const stepAll = () => {
        Object.entries(algs).forEach(([k, a]) => stepAlg(k, a));
        tick++;
        draw();
      };
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          stepAll();
          if (tick > 400) stop();
        }, 40);
      };
      qs("#st", card).onclick = stepAll;
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      qs("#race", card).onclick = () => {
        const res = { hc: 0, mc: 0, tabu: 0 },
          q = { hc: 0, mc: 0, tabu: 0 };
        for (let run = 0; run < 300; run++) {
          const s = randint(0, L.N - 1);
          ["hc", "mc", "tabu"].forEach((k) => {
            const a = { c: s, b: s, evals: 1, trail: [], list: [s] };
            while (a.evals < 600) stepAlg(k, a);
            if (L.f(a.b) >= L.max - 1e-9) res[k]++;
            q[k] += L.f(a.b) / L.max;
          });
        }
        const C = N.colors();
        N.barChart(qs("#rc", card), {
          groups: [
            {
              values: [res.hc, res.mc, res.tabu].map((v) => (100 * v) / 300),
              color: (i) => [C.teal, C.amber, C.violet][i],
            },
          ],
          labels: ["Hillclimbing", "Monte Carlo", "Tabu"],
          yMax: 100,
          height: 170,
          decimals: 0,
        });
        qs("#raceTxt", card).innerHTML =
          `% of runs where best-so-far hit the <b>global</b> optimum. Mean best as % of max: HC ${Math.round(q.hc / 3)}%, MC ${Math.round(q.mc / 3)}%, Tabu ${Math.round(q.tabu / 3)}%. <span class="faint">Change r, p, tenure and rerun.</span>`;
      };
      life.onResize(draw);
      init();

      root.appendChild(
        predict({
          id: "l3-ls-1",
          q: "What do Monte Carlo search with <b>p = 0</b> and with <b>p = 1</b> turn into?",
          opts: [
            "p=0 → random walk, p=1 → hillclimbing",
            "p=0 → hillclimbing, p=1 → random walk",
            "Both become Tabu search",
          ],
          a: 1,
          why: "p = 0 never accepts a worse move, which is exactly <b>hillclimbing</b>. p = 1 accepts everything, which is a <b>random walk</b> that ignores fitness (only the best-so-far record saves it). The useful range is in between: enough downhill moves to escape small hills, not so many that you drift off good ones. Try both extremes with the slider.",
        }),
      );
      root.appendChild(
        predict({
          id: "l3-ls-2",
          q: "Why does Tabu search need the tabu list at all? Without it, what happens at a local optimum?",
          opts: [
            "It stops, just like hillclimbing does",
            "It steps down, then climbs straight back up, forever",
            "It jumps to a random new area of the space",
          ],
          a: 1,
          why: "Tabu always moves to the best neighbour, even a worse one. From a peak the best move is one step down. From there the best move is back to the peak, so it <b>cycles</b>. Forbidding recently visited solutions forces it to keep walking away until it crosses into a new basin. Tenure has to be long enough to cover the width of a hill: try tenure 2 vs 60.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Local search = HC + a policy that sometimes accepts non-improving moves + a <b>best-so-far</b> record.",
            "<b>Monte Carlo</b>: random neighbour; accept worse with probability p.",
            "<b>Tabu</b>: evaluate all neighbours, take the best non-tabu one even if it's worse, and remember recent moves to avoid cycling.",
            "Both get stuck less than HC, but they <i>still</i> get stuck. That motivates populations.",
          ],
          "Local search escapes local optima by allowing downhill moves: Monte Carlo does it randomly, Tabu does it deliberately with memory.",
        ),
      );
    },
  });

  /* ============ 3.7 Population-based search ============ */
  N.register({
    id: "l3-population",
    lecture: 3,
    order: 7,
    num: "3.7",
    title: "Population-based search",
    blurb:
      "Watch a population spread over several hills at once, then replay the lecture's steady-state EA on the TSP.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          'Instead of one current solution, keep a <b>population</b>. That creates two new questions, and they are exactly what separates an EA from local search: <b>which</b> solutions do we mutate (we need <i>selection</i>), and since we have several parents, can we <b>combine</b> them (<i>recombination</i>)? Poor solutions get to stay and "develop", so different regions are explored in parallel.',
        ),
      );
      let kind = "multimodal",
        L = N.makeLandscape(kind),
        P = 12,
        r = 3,
        t = 2,
        pop,
        evals,
        running = null,
        hc;
      function init() {
        pop = Array.from({ length: P }, () => randint(0, L.N - 1));
        hc = pop[0];
        evals = P;
        draw();
      }
      function eaStep(popArr, landscape) {
        const parent = (() => {
          let b = popArr[randint(0, popArr.length - 1)];
          for (let k = 1; k < t; k++) {
            const c = popArr[randint(0, popArr.length - 1)];
            if (landscape.f(c) > landscape.f(b)) b = c;
          }
          return b;
        })();
        const m = N.clamp(parent + (rnd() < 0.5 ? -1 : 1) * randint(1, r), 0, landscape.N - 1);
        let wi = 0;
        popArr.forEach((x, i) => {
          if (landscape.f(x) < landscape.f(popArr[wi])) wi = i;
        });
        if (landscape.f(m) >= landscape.f(popArr[wi])) popArr[wi] = m;
        return m;
      }
      let lastM = null;
      function step() {
        lastM = eaStep(pop, L);
        evals++;
        const m = N.clamp(hc + (rnd() < 0.5 ? -1 : 1) * randint(1, r), 0, L.N - 1);
        if (L.f(m) >= L.f(hc)) hc = m;
        draw();
      }
      const card =
        el(`<div class="card"><div class="card-head"><h2>A population on a multimodal landscape</h2><span class="tag">steady-state · tournament · mutate · replace worst</span></div>
        <div class="controls" id="b1"></div><div class="controls" id="b2"></div><canvas class="viz" id="cv"></canvas>
        <div class="legend"><span style="--c:var(--violet)">population members</span><span style="--c:var(--rose)">latest mutant</span><span style="--c:var(--teal)">a lone hillclimber (same start as member 1)</span></div>
        <div class="controls"><button class="btn primary" id="go">Evolve</button><button class="btn" id="st">Step</button><button class="btn ghost" id="rs">New population</button></div>
        <div class="stat-row"><div class="stat"><small>Evaluations</small><b id="ev"></b></div><div class="stat violet"><small>Pop best f</small><b id="pb"></b></div><div class="stat"><small>Distinct hills occupied</small><b id="dh"></b></div><div class="stat teal"><small>Hillclimber f</small><b id="hf"></b></div></div>
        <div class="card" style="background:var(--bg-2);margin:14px 0 0"><div class="card-head"><h3>HC vs population: 300 runs, 1,000 evaluations each</h3></div><div class="controls"><button class="btn" id="race">Run race</button><span class="dim" id="rt"></span></div></div></div>`);
      root.appendChild(card);
      qs("#b1", card).appendChild(
        N.seg(
          Object.entries(N.LANDSCAPES)
            .filter(([k]) => k !== "random")
            .map(([k, v]) => [k, v.name]),
          kind,
          (v) => {
            kind = v;
            L = N.makeLandscape(kind);
            init();
          },
        ),
      );
      const sP = N.slider("Population", 2, 40, 1, P),
        sR = N.slider("Mutation step", 1, 15, 1, r),
        sT = N.slider("Tournament size", 1, 8, 1, t);
      sP.onInput((v) => {
        P = v;
        init();
      });
      sR.onInput((v) => (r = v));
      sT.onInput((v) => (t = v));
      qs("#b2", card).append(sP, sR, sT);
      function hillOf(i) {
        let c = i;
        for (;;) {
          const l = c > 0 ? L.f(c - 1) : -1,
            rr = c < L.N - 1 ? L.f(c + 1) : -1;
          if (l > L.f(c) && l >= rr) c--;
          else if (rr > L.f(c)) c++;
          else return c;
        }
      }
      function draw() {
        const { ctx, w, h } = N.setupCanvas(qs("#cv", card), 300);
        const { X, Y } = N.drawLandscape(ctx, w, h, L);
        const C = N.colors();
        pop.forEach((x) => {
          ctx.fillStyle = "rgba(206,130,255,0.85)";
          ctx.beginPath();
          ctx.arc(X(x), Y(L.f(x)) - 3, 6, 0, 7);
          ctx.fill();
        });
        if (lastM != null) {
          ctx.strokeStyle = C.rose;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(X(lastM), Y(L.f(lastM)) - 3, 9, 0, 7);
          ctx.stroke();
        }
        ctx.fillStyle = C.teal;
        ctx.beginPath();
        ctx.arc(X(hc), Y(L.f(hc)) + 10, 6, 0, 7);
        ctx.fill();
        qs("#ev", card).textContent = evals;
        qs("#pb", card).textContent = Math.max(...pop.map(L.f)).toFixed(3);
        qs("#dh", card).textContent = new Set(pop.map(hillOf)).size;
        qs("#hf", card).textContent = L.f(hc).toFixed(3);
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Evolve";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          step();
          if (evals > 1200) stop();
        }, 35);
      };
      qs("#st", card).onclick = step;
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      qs("#race", card).onclick = () => {
        let a = 0,
          b = 0;
        for (let run = 0; run < 300; run++) {
          let c = randint(0, L.N - 1);
          for (let e = 1; e < 1000; e++) {
            const m = N.clamp(c + (rnd() < 0.5 ? -1 : 1) * randint(1, r), 0, L.N - 1);
            if (L.f(m) >= L.f(c)) c = m;
          }
          if (L.f(c) >= L.max - 1e-9) a++;
          const pp = Array.from({ length: P }, () => randint(0, L.N - 1));
          for (let e = P; e < 1000; e++) eaStep(pp, L);
          if (Math.max(...pp.map(L.f)) >= L.max - 1e-9) b++;
        }
        qs("#rt", card).innerHTML =
          `Global optimum found: Hillclimbing <b style="color:var(--teal)">${Math.round(a / 3)}%</b> · Population (P=${P}, t=${t}) <b style="color:var(--violet)">${Math.round(b / 3)}%</b>. <span class="faint">Try P=2 vs 30, or t=1 vs 8.</span>`;
      };
      life.onResize(draw);
      init();

      root.appendChild(
        predict({
          id: "l3-pop-1",
          q: "Why is it <i>useful</i> that the population keeps some poor solutions around?",
          opts: [
            "It isn't, since poor solutions just waste evaluations",
            "A poor solution may sit on the slope of a different, higher hill",
            "Poor solutions make selection faster",
          ],
          a: 1,
          why: "Lecture: <i>keep 'poor' solutions in the population and give them a chance to 'develop'</i>. Low fitness now doesn't mean low potential. Watch the \"distinct hills occupied\" counter: it starts high (parallel exploration) and drops as the population converges.",
        }),
      );

      // Lecture TSP steady-state trace with arithmetic check
      const TRACE = [
        {
          pop: ["ACEBD", "DACBE", "BACED", "CDAEB", "ABCED"],
          slide: [32, 33, 32, 31, 28],
          par: "CDAEB",
          mut: "ADCEB",
          mSlide: 26,
          act: "enters, replacing worst",
          rep: 1,
        },
        {
          pop: ["ACEBD", "ADCEB", "BACED", "CDAEB", "ABCED"],
          slide: [32, 26, 32, 31, 28],
          par: "BACED",
          mut: "BDCEA",
          mSlide: 33,
          act: "discarded (worse than current worst)",
          rep: -1,
        },
        {
          pop: ["ACEBD", "ADCEB", "BACED", "CDAEB", "ABCED"],
          slide: [32, 26, 32, 31, 28],
          par: "ABCED",
          mut: "ABECD",
          mSlide: 28,
          act: "enters, replacing worst",
          rep: 0,
        },
        {
          pop: ["ABECD", "ADCEB", "BACED", "CDAEB", "ABCED"],
          slide: [28, 26, 32, 31, 28],
          par: "ADCEB",
          mut: "BDCEA",
          mSlide: 33,
          act: "discarded",
          rep: -1,
        },
        {
          pop: ["ABECD", "ADCEB", "BACED", "CDAEB", "ABCED"],
          slide: [28, 26, 32, 31, 28],
          par: "ABCED",
          mut: "ABECD",
          mSlide: 28,
          act: "enters, replacing worst",
          rep: 2,
        },
        { pop: ["ABECD", "ADCEB", "ABECD", "CDAEB", "ABCED"], slide: [28, 26, 28, 31, 28], par: null },
      ];
      let g = 0;
      const tc =
        el(`<div class="card"><div class="card-head"><h2>Replay: the lecture's steady-state EA on the TSP</h2><span class="tag">mutation only · replace worst · pop 5</span></div>
        <p class="dim">The slides step through six generations. Each shows the population, the parent picked by an unnamed selection method, its mutant, and whether the mutant gets in. The slide value and the recomputed length are shown side by side. <b>Check the arithmetic yourself</b> with the distance matrix.</p>
        <div class="grid side"><div id="tv"></div><div>${matrixHTML()}</div></div>
        <div class="controls"><button class="btn" id="pv">← Prev</button><button class="btn primary" id="nx">Next generation →</button></div></div>`);
      root.appendChild(tc);
      function drawTrace() {
        const G = TRACE[g];
        const worstReal = Math.max(...G.pop.map((s) => TSP.len(s)));
        qs("#tv", tc).innerHTML =
          `<h3>Generation ${g + 1}</h3><table class="t"><tr><th>Member</th><th class="num">Slide says</th><th class="num">Recomputed</th><th></th></tr>${G.pop
            .map((s, i) => {
              const real = TSP.len(s),
                wrong = real !== G.slide[i];
              return `<tr class="${G.par === s && G.pop.indexOf(s) === i ? "hl" : ""} ${G.rep === i ? "bad" : ""}"><td class="mono">${s}</td><td class="num">${G.slide[i]}</td><td class="num" style="color:${wrong ? "var(--rose)" : "inherit"}">${real}${wrong ? " ⚠" : ""}</td><td class="faint" style="font-size:12px">${G.par === s && G.pop.indexOf(s) === i ? "parent" : ""}${G.rep === i ? "replaced" : ""}</td></tr>`;
            })
            .join("")}</table>
        ${
          G.par
            ? `<p style="margin-top:10px">Parent <span class="mono">${G.par}</span> → mutant <span class="mono" style="color:var(--violet)">${G.mut}</span>: slide says <b>${G.mSlide}</b>, recomputed <b style="color:${TSP.len(G.mut) !== G.mSlide ? "var(--rose)" : "inherit"}">${TSP.len(G.mut)}</b>. Slide: <i>${G.act}</i>.</p>
        ${G.rep === -1 && TSP.len(G.mut) < worstReal ? `<div class="callout rose">With correct arithmetic the current worst is ${worstReal} (CDAEB), so a ${TSP.len(G.mut)} mutant <b>should have entered</b>, replacing CDAEB. The slide's decision follows from its wrong value of 31.</div>` : ""}
        ${G.rep >= 0 && TSP.len(G.pop[G.rep]) < worstReal ? `<div class="callout rose">Recomputed, the true worst is CDAEB (${worstReal}), not <span class="mono">${G.pop[G.rep]}</span> (${TSP.len(G.pop[G.rep])}). Replace-worst should have removed CDAEB.</div>` : ""}`
            : `<div class="callout teal">"And so on. Note: the population is starting to <b>converge</b>, genotypically and phenotypically." <span class="mono">ABECD</span> now appears twice. Convergence is the population losing diversity.</div>`
        }
        ${g === 0 ? `<div class="callout">⚠ Two slide values look like arithmetic errors: <span class="mono">CDAEB</span> = C–D 2 + D–A 4 + A–E 15 + E–B 10 + B–C 3 = <b>34</b> (slide: 31), and <span class="mono">ADCEB</span> = 4 + 2 + 7 + 10 + 5 = <b>28</b> (slide: 26). Check them yourself against the matrix. The <i>mechanism</i> the slides teach is still correct.</div>` : ""}`;
        qs("#pv", tc).disabled = g === 0;
        qs("#nx", tc).disabled = g === TRACE.length - 1;
      }
      qs("#pv", tc).onclick = () => {
        g--;
        drawTrace();
      };
      qs("#nx", tc).onclick = () => {
        g++;
        drawTrace();
      };
      drawTrace();

      root.appendChild(
        takeaways(
          [
            "Population-based search keeps many current solutions, which means you need <b>selection</b> (whom to vary) and it lets you use <b>recombination</b>.",
            "Keeping weaker solutions explores several regions in parallel, so the search is less likely to be trapped on one hill.",
            "Over time a population <b>converges</b> (identical genotypes and fitnesses appear). The balance between convergence and exploration is controlled by selection pressure (Lecture 4).",
            "Lecture conclusion: HC and local search work up to a point but get stuck in local optima. Population-based search is better at avoiding this.",
          ],
          "A population explores several hills at once, so selection and recombination become possible, and it's harder to get trapped.",
        ),
      );
    },
  });
})();
