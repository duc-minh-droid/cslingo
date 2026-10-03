(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, shuffle } = N;

  /* ============ 1.2 Monkey vs cumulative selection ============ */
  N.register({
    id: "l1-monkey",
    lecture: 1,
    order: 2,
    num: "1.2",
    title: "Random guessing vs keeping improvements",
    blurb:
      "The infinite-monkey problem: why pure randomness fails, and why keeping small improvements changes everything.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const T = "METHINKS IT IS LIKE A WEASEL",
        A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
      const rc = () => A[randint(0, A.length - 1)];
      const score = (s) => [...s].filter((c, i) => c === T[i]).length;
      let monkey,
        mBest,
        mTries,
        keep,
        kTries,
        running = null;
      const reset = () => {
        monkey = Array.from(T, rc).join("");
        mBest = monkey;
        mTries = 1;
        keep = monkey;
        kTries = 1;
        draw();
      };
      const row = (s) =>
        `<span class="genome">${[...s].map((c, i) => `<span class="gene ${c === T[i] ? "good" : ""}" style="min-width:20px;height:26px;padding:0 3px;font-size:13px">${c === " " ? "·" : c}</span>`).join("")}</span>`;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Target: "${T}"</h2><span class="faint">27 possible characters × 28 positions</span></div>
        <div class="grid two">
          <div><div class="card-head"><span class="tag rose">🐒 Monkey</span><span class="faint">type 28 random characters every try</span></div><div id="m"></div><div class="stat-row"><div class="stat"><small>Tries</small><b id="mt"></b></div><div class="stat rose"><small>Best match ever</small><b id="mb"></b></div></div></div>
          <div><div class="card-head"><span class="tag teal">🔁 Keep if better</span><span class="faint">change 1 character, keep it if no worse</span></div><div id="k"></div><div class="stat-row"><div class="stat"><small>Tries</small><b id="kt"></b></div><div class="stat teal"><small>Current match</small><b id="kb"></b></div></div></div>
        </div>
        <div class="controls"><button class="btn primary" id="go">Run both</button><button class="btn" id="st">1 try each</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(card);
      function step() {
        monkey = Array.from(T, rc).join("");
        mTries++;
        if (score(monkey) > score(mBest)) mBest = monkey;
        if (score(keep) < T.length) {
          const i = randint(0, T.length - 1);
          const cand = keep.slice(0, i) + rc() + keep.slice(i + 1);
          kTries++;
          if (score(cand) >= score(keep)) keep = cand;
        }
      }
      function draw() {
        qs("#m", card).innerHTML = row(monkey);
        qs("#k", card).innerHTML = row(keep);
        qs("#mt", card).textContent = mTries.toLocaleString();
        qs("#mb", card).textContent = `${score(mBest)}/28`;
        qs("#kt", card).textContent = kTries.toLocaleString();
        qs("#kb", card).textContent = `${score(keep)}/28`;
        if (score(keep) === 28) {
          const m = qs("#msg", card);
          m.style.display = "block";
          m.className = "callout teal";
          m.innerHTML = `"Keep if better" hit the target in <b>${kTries.toLocaleString()}</b> tries. The monkey's best is still ${score(mBest)}/28. On average the monkey needs 27<sup>28</sup> ≈ <b>1.2 × 10<sup>40</sup></b> tries: at a billion tries a second, that's about 4 × 10<sup>23</sup> years.`;
        }
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run both";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          for (let k = 0; k < 4; k++) step();
          draw();
          if (score(keep) === 28) stop();
        }, 40);
      };
      qs("#st", card).onclick = () => {
        step();
        draw();
      };
      qs("#rs", card).onclick = () => {
        stop();
        qs("#msg", card).style.display = "none";
        reset();
      };
      reset();
      root.appendChild(
        el(
          `<div class="callout"><b>Honest caveat:</b> "keep if better" is exactly the lecture's trial-and-error flowchart, and it wins easily <i>here</i> because every correct letter can be improved on its own. On genuinely hard problems a single keep-if-better solution gets <b>stuck</b>. That's why real evolution adds more ingredients (next module).</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "l1-monkey-1",
          q: 'What is the single key difference between the monkey and "keep if better"?',
          opts: [
            "Keep-if-better tries far more strings per second",
            "Keep-if-better keeps its progress and builds on it",
            "The monkey is allowed a much bigger alphabet",
          ],
          a: 1,
          why: "This is <b>cumulative selection</b>: small improvements are kept and built on. Randomness proposes changes, and selection decides what's kept. Randomness alone (the monkey) is hopeless.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Evolution uses <b>trial and error</b>: randomly change, and keep the change if it's better.",
            "Pure randomness (the infinite monkey) is hopeless: 27<sup>28</sup> possibilities.",
            "Keeping improvements (<b>cumulative selection</b>) turns an impossible search into a fast one.",
          ],
          "Random changes only work when you keep the good ones and build on them.",
        ),
      );
    },
  });

  /* ============ 1.3 Magic ingredients ============ */
  N.register({
    id: "l1-ingredients",
    lecture: 1,
    order: 3,
    num: "1.3",
    title: "The magic ingredients",
    blurb:
      "Population, weakly-biased selection, mutation, optional recombination. Switch each ingredient on and off and see what breaks.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const L = N.makeLandscape("multimodal");
      const cfg = { P: 20, bias: "weak", rec: false };
      let pop,
        gen,
        running = null;
      const card = el(`<div class="card"><div class="controls" id="b1"></div><div class="controls" id="b2"></div>
        <canvas class="viz" id="cv"></canvas><div class="legend"><span style="--c:var(--violet)">organisms (candidate solutions)</span><span style="--c:var(--amber)">★ best possible</span></div>
        <div class="controls"><button class="btn primary" id="go">Evolve</button><button class="btn" id="st">1 generation</button><button class="btn ghost" id="rs">New population</button><span class="mono dim" id="gt"></span></div>
        <div class="card" style="background:var(--bg-2);margin:12px 0 0"><div class="card-head"><h3>Test this recipe 200 times</h3><span class="faint">60 generations each</span></div><div class="controls"><button class="btn" id="test">Run test</button><span id="tt" class="dim"></span></div></div></div>`);
      root.appendChild(card);
      const sP = N.slider("Population size", 1, 40, 1, cfg.P);
      sP.onInput((v) => {
        cfg.P = v;
        init();
      });
      const rec = el(`<label class="field"><input type="checkbox"> Recombination (optional ingredient 3)</label>`);
      qs("input", rec).onchange = (e) => (cfg.rec = e.target.checked);
      qs("#b1", card).append(sP, rec);
      qs("#b2", card).append(
        el(`<span class="faint" style="font-size:13px">Selection bias:</span>`),
        N.seg(
          [
            ["none", "None (random)"],
            ["weak", "Weak (fitter = more likely)"],
            ["strong", "Strong (only the best breeds)"],
          ],
          cfg.bias,
          (v) => (cfg.bias = v),
        ),
      );
      const pick = (p) => {
        if (cfg.bias === "none") return p[randint(0, p.length - 1)];
        if (cfg.bias === "strong") return p.reduce((b, x) => (L.f(x) > L.f(b) ? x : b), p[0]);
        const a = p[randint(0, p.length - 1)],
          b = p[randint(0, p.length - 1)];
        return L.f(a) >= L.f(b) ? a : b;
      };
      function nextGen(p) {
        if (p.length === 1) {
          const m = N.clamp(p[0] + randint(-4, 4), 0, L.N - 1);
          return [L.f(m) >= L.f(p[0]) ? m : p[0]];
        }
        return p.map(() => {
          let c = pick(p);
          if (cfg.rec) c = Math.round((c + pick(p)) / 2);
          return N.clamp(c + randint(-4, 4), 0, L.N - 1);
        });
      }
      function init() {
        pop = Array.from({ length: cfg.P }, () => randint(0, L.N - 1));
        gen = 0;
        draw();
      }
      function draw() {
        const { ctx, w, h } = N.setupCanvas(qs("#cv", card), 280);
        const { X, Y } = N.drawLandscape(ctx, w, h, L);
        pop.forEach((x) => {
          ctx.fillStyle = "rgba(206,130,255,0.85)";
          ctx.beginPath();
          ctx.arc(X(x), Y(L.f(x)) - 3, 6, 0, 7);
          ctx.fill();
        });
        qs("#gt", card).textContent =
          `generation ${gen} · best ${((Math.max(...pop.map(L.f)) / L.max) * 100).toFixed(0)}% of max`;
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
          pop = nextGen(pop);
          gen++;
          draw();
          if (gen >= 80) stop();
        }, 90);
      };
      qs("#st", card).onclick = () => {
        pop = nextGen(pop);
        gen++;
        draw();
      };
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      qs("#test", card).onclick = () => {
        let hit = 0,
          q = 0;
        for (let r = 0; r < 200; r++) {
          let p = Array.from({ length: cfg.P }, () => randint(0, L.N - 1));
          for (let g = 0; g < 60; g++) p = nextGen(p);
          const b = Math.max(...p.map(L.f));
          if (b >= L.max * 0.98) hit++;
          q += p.reduce((a, x) => a + L.f(x), 0) / p.length / L.max;
        }
        qs("#tt", card).innerHTML =
          `Reached the top peak (≥98%) in <b style="color:var(--teal-ink)">${Math.round(hit / 2)}%</b> of runs · average organism ends at <b>${Math.round(q / 2)}%</b> of max <span class="faint">(pop ${cfg.P}, ${cfg.bias} bias${cfg.rec ? ", recombination" : ""})</span>`;
      };
      life.onResize(draw);
      init();
      root.appendChild(
        predict({
          id: "l1-ing-1",
          q: "The lecture says selection should have a <b>relatively weak</b> bias towards the fittest, and that even the least fit should still have some chance. Why not just always breed the best?",
          opts: [
            "Breeding only the best is slower to compute",
            "Everyone quickly becomes a copy of the current best",
            "The best might have a bug",
          ],
          a: 1,
          why: 'Strong bias means fast but premature convergence. Weak bias keeps diversity, so other hills stay explored. Try it: Strong bias + Test, then Weak bias + Test. (Lecture 2: "always select the best? Bad results, quickly.")',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Ingredient 1 (<b>required</b>): a <b>population</b> competing for resources.",
            "Ingredient 2 (<b>required</b>): select parents with a <b>weak</b> bias towards the fittest, then <b>mutate</b> them (small change).",
            "Ingredient 3 (<b>optional, often helpful</b>): <b>recombination</b>, combining pieces of two or more parents.",
          ],
          "An EA needs a population and weakly fitness-biased selection with mutation; recombination is optional but often helps.",
        ),
      );
    },
  });

  /* ============ 1.4 Applications ============ */
  N.register({
    id: "l1-apps",
    lecture: 1,
    order: 4,
    num: "1.4",
    title: "Where EAs are used",
    blurb:
      "Sort real applications into the lecture's six categories: planning, design, simulation, identification, control, classification.",
    render(root) {
      root.appendChild(header(this, ""));
      const CATS = {
        Planning: "Routing, scheduling, packing",
        Design: "Circuits, networks, structures",
        Simulation: "Model interacting agents/firms",
        Identification: "Fit a function to data",
        Control: "Design a controller",
        Classification: "Assign a label",
      };
      const ITEMS = [
        ["Timetable university lectures", "Planning"],
        ["Delivery van routes", "Planning"],
        ["Pack boxes into a lorry", "Planning"],
        ["NASA ST5 spacecraft antenna", "Design"],
        ["Electronic circuit layout", "Design"],
        ["Car body shape (Bentley's thesis)", "Design"],
        ["Economic model of competing firms", "Simulation"],
        ["Fit a curve to medical data to predict future values", "Identification"],
        ["Controller for a gas turbine engine", "Control"],
        ["Control system for a mobile robot", "Control"],
        ["Detecting spam email", "Classification"],
        ["Diagnosing heart disease", "Classification"],
      ];
      let order = shuffle(ITEMS.map((_, i) => i)),
        idx = 0,
        right = 0,
        done = [];
      const card =
        el(`<div class="card"><div class="card-head"><h2>Which category?</h2><span class="mono dim" id="sc"></span></div>
        <div id="item" style="font-size:20px;font-weight:600;margin:6px 0 16px"></div>
        <div class="grid three" id="cats">${Object.entries(CATS)
          .map(
            ([c, d]) =>
              `<button class="btn" data-c="${c}" style="text-align:left;padding:12px 14px"><b>${c}</b><br><span class="faint" style="font-size:12.5px">${d}</span></button>`,
          )
          .join("")}</div>
        <div id="fb" style="margin-top:12px;min-height:26px"></div><table class="t" id="log" style="margin-top:10px"></table></div>`);
      root.appendChild(card);
      const draw = () => {
        qs("#sc", card).textContent = `${right} / ${done.length}`;
        qs("#item", card).textContent =
          idx < order.length ? `“${ITEMS[order[idx]][0]}”` : `Done: ${right}/${ITEMS.length}`;
        qs("#log", card).innerHTML = done
          .map(
            ([i, pick]) =>
              `<tr><td>${ITEMS[i][0]}</td><td style="color:${pick === ITEMS[i][1] ? "var(--teal)" : "var(--rose)"}">${pick}</td><td class="faint">${pick === ITEMS[i][1] ? "" : "→ " + ITEMS[i][1]}</td></tr>`,
          )
          .join("");
      };
      qsa("#cats button", card).forEach(
        (b) =>
          (b.onclick = () => {
            if (idx >= order.length) return;
            const i = order[idx],
              ok = b.dataset.c === ITEMS[i][1];
            if (ok) right++;
            done.unshift([i, b.dataset.c]);
            idx++;
            qs("#fb", card).innerHTML = ok
              ? `<span style="color:var(--teal-ink)">✓ ${ITEMS[i][1]}</span>`
              : `<span style="color:var(--rose-ink)">✗ It's <b>${ITEMS[i][1]}</b></span>`;
            draw();
          }),
      );
      draw();
      root.appendChild(
        el(
          `<div class="callout violet"><b>Famous examples from the slides.</b> <b>Bentley's thesis</b>: evolving car shapes where the chromosome is a series of slices and fitness comes from an airflow simulation ("more like selective breeding than natural evolution"). <b>NASA ST5</b>: evolved antennas beat the human expert designs. <b>Top Gun</b>: evolved fighter-pilot strategies.</div>`,
        ),
      );
      root.appendChild(
        takeaways([
          "Six application areas: <b>planning, design, simulation, identification, control, classification</b>.",
          "Anything where you can <b>score</b> a candidate solution can be attacked with an EA.",
        ]),
      );
    },
  });
})();
