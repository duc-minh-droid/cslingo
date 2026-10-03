(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, TSP, matrixHTML, randint, rnd } = N;

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
