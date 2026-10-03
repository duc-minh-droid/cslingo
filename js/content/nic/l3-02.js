(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, TSP, tspSVG, matrixHTML, randint, shuffle } = N;

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
})();
