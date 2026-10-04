/* Lecture 3 — basic principles, hillclimbing, local search, landscapes, population-based search */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd } = N;

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
                  `<div class="genome-row"><span class="lbl">Tournament ${k + 1}</span><span class="mono dim">#${t.a + 1} (f=${f(st.pop[t.a])}) vs #${t.b + 1} (f=${f(st.pop[t.b])}) → <b style="color:var(--amber-ink)">#${t.w + 1}</b></span></div>`,
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
          q: "In this demo the mutant replaces the weakest member only if it is at least as fit. Over many loops, what can happen to <b>best f</b>?",
          opts: [
            "It can only stay the same or rise",
            "It drops whenever the mutant is poor",
            "It rises on every single loop",
          ],
          a: 0,
          why: "Only the weakest member is ever overwritten, and only by something at least as good, so the best member always survives: best f never falls. It does not rise every loop, because most mutants are no better than the best (they just replace a weaker member).",
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
})();
