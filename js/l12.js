/* Lecture 1 — What is NIC, evolution as problem solving. Lecture 2 — generic EA, optimisation, complexity, MST, approximate algorithms */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd, shuffle } = N;

  // ---------- Step-through runners used by lesson steps in lessons.js (NIC.runners) ----------
  N.runners = N.runners || {};
  /** Tiny seeded RNG so a runner's frames are the same every time. */
  const mulberry32 = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  N.runners.mulberry32 = mulberry32;

  /** One generation of a generational EA on OneMax: evaluate, tournament select, 1-point crossover, bit-flip mutation, replace all. */
  N.runners.eaGen = function eaGenRun(box, life) {
    const F = N.fig,
      P = 6,
      LEN = 8,
      T = 3,
      SEED = 28;
    const OX = 282,
      BX = 32,
      CW = 21,
      RY = (k) => 30 + k * 38,
      BW = 26,
      BARX = BX + LEN * CW + 5;
    const ones = (g) => g.reduce((a, b) => a + b, 0);
    const nm = (k) => "S" + (k + 1);
    function* frames() {
      const r = mulberry32(SEED),
        ri = (n) => Math.floor(r() * n);
      let pop = Array.from({ length: P }, () => Array.from({ length: LEN }, () => (r() < 0.45 ? 1 : 0)));
      let fit = pop.map(ones);
      const kids = [];
      const snap = (x) => ({
        pop: pop.map((g) => g.slice()),
        fit: null,
        kids: kids.map((k) => ({ ...k, g: k.g.slice() })),
        cont: [],
        win: [],
        par: null,
        cut: null,
        flash: [],
        ...x,
      });
      const tour = () => {
        const c = Array.from({ length: T }, () => ri(P));
        let w = c[0];
        c.forEach((k) => {
          if (fit[k] > fit[w]) w = k;
        });
        return { c, w };
      };
      const mean = (a) => (a.reduce((s, v) => s + v, 0) / a.length).toFixed(1);
      yield snap({
        cap: `A random population of <b>${P}</b> bit-strings. Fitness is OneMax: the number of 1s.`,
        line: 0,
      });
      const b0 = fit.indexOf(Math.max(...fit));
      yield snap({
        fit: fit.slice(),
        cap: `Evaluate every one. The best is <b>${nm(b0)}</b> with ${fit[b0]} of ${LEN}. Mean = ${mean(fit)}.`,
        line: 1,
      });
      for (let p = 0; p < P / 2; p++) {
        const A = tour(),
          B = tour();
        const list = (t) => t.c.map(nm).join(", ");
        if (p === 0) {
          yield snap({
            fit: fit.slice(),
            cont: A.c,
            cap: `Tournament (t = ${T}): draw ${T} at random: <b>${list(A)}</b>.`,
            line: 3,
          });
          const top = Math.max(...A.c.map((k) => fit[k])),
            right = [...new Set(A.c.filter((k) => fit[k] === top))].map(String);
          yield snap({
            fit: fit.slice(),
            cont: A.c,
            win: [A.w],
            par: { a: A.w },
            cap: `<b>${nm(A.w)}</b> has the most 1s (${fit[A.w]}), so it wins and becomes parent A.`,
            line: 3,
            mood: "happy",
            ask: {
              q: "Which one wins this tournament? Tap it.",
              pick: ".rn-ea-row.rn-ea-cont",
              a: right,
              why: `The fittest contestant wins: <b>${nm(A.w)}</b> with ${fit[A.w]}. It doesn't have to be the best in the whole population.`,
            },
          });
          yield snap({
            fit: fit.slice(),
            cont: B.c,
            win: [B.w],
            par: { a: A.w, b: B.w },
            cap: `Second tournament: ${list(B)}. <b>${nm(B.w)}</b> (${fit[B.w]}) wins and becomes parent B.`,
            line: 3,
          });
        } else {
          yield snap({
            fit: fit.slice(),
            cont: [...A.c, ...B.c],
            win: [A.w, B.w],
            par: { a: A.w, b: B.w },
            cap: `Two more tournaments pick parents <b>${nm(A.w)}</b> (${fit[A.w]}) and <b>${nm(B.w)}</b> (${fit[B.w]}).`,
            line: 3,
          });
        }
        const cut = 1 + ri(LEN - 1),
          a = pop[A.w],
          b = pop[B.w];
        const k1 = {
          g: a.slice(0, cut).concat(b.slice(cut)),
          src: a.map((_, i) => (i < cut ? 0 : 1)),
          pa: A.w,
          pb: B.w,
        };
        const k2 = {
          g: b.slice(0, cut).concat(a.slice(cut)),
          src: a.map((_, i) => (i < cut ? 1 : 0)),
          pa: A.w,
          pb: B.w,
        };
        kids.push(k1, k2);
        yield snap({
          fit: fit.slice(),
          par: { a: A.w, b: B.w },
          cut: { k: kids.length - 2, at: cut },
          cap: `Crossover: cut after gene <b>${cut}</b> and swap the tails. That gives children C${kids.length - 1} and C${kids.length}.`,
          line: 4,
        });
        const flash = [];
        [kids.length - 2, kids.length - 1].forEach((kk) =>
          kids[kk].g.forEach((x, i) => {
            if (r() < 1 / LEN) {
              kids[kk].g[i] = 1 - x;
              flash.push([kk, i]);
            }
          }),
        );
        yield snap({
          fit: fit.slice(),
          par: { a: A.w, b: B.w },
          flash,
          cap: flash.length
            ? `Mutation: each bit flips with p = 1/${LEN}. This time <b>${flash.length}</b> bit${flash.length > 1 ? "s" : ""} flipped (purple).`
            : `Mutation: each bit flips with p = 1/${LEN}. No bit flipped this time.`,
          line: 5,
        });
      }
      const m0 = mean(fit);
      pop = kids.map((k) => k.g.slice());
      fit = pop.map(ones);
      kids.length = 0;
      const b1 = fit.indexOf(Math.max(...fit));
      yield snap({
        fit: fit.slice(),
        replaced: true,
        cap: `Update: the children replace the whole population. Mean fitness ${m0} → <b>${mean(fit)}</b>.`,
        line: 6,
        mood: "happy",
      });
      yield snap({
        fit: fit.slice(),
        replaced: true,
        win: [b1],
        cap: `One generation done. Best is now <b>${fit[b1]}</b> of ${LEN}. Loop back and repeat.`,
        line: 2,
        mood: "love",
      });
    }
    const svgRow = (
      k,
      ox,
      bars,
    ) => `<g transform="translate(${ox} ${RY(k)})"><g class="rn-ea-row ${bars ? "rn-ea-pop" : "rn-ea-kid"}" data-k="${k}"><rect class="rn-ea-bg" width="256" height="32" rx="9"/>
      <text class="rn-ea-lbl" x="6" y="21">${bars ? "S" : "C"}${k + 1}</text>
      ${Array.from({ length: LEN }, (_, i) => `<g transform="translate(${BX + i * CW} 4)"><g class="rn-ea-bit" data-i="${i}"><rect width="${CW - 2}" height="24" rx="5"/><text x="${(CW - 2) / 2}" y="17">0</text></g></g>`).join("")}
      ${bars ? `<rect class="rn-ea-barbg" x="${BARX}" y="12" width="${BW}" height="8" rx="4"/><rect class="rn-ea-bar" x="${BARX}" y="12" width="0" height="8" rx="4"/><text class="rn-ea-fit" x="${BARX + BW + 5}" y="21" data-v="">?</text>` : ""}</g>
      ${bars ? `<text class="rn-ea-tag" x="262" y="22"></text>` : ""}</g>`;
    F.run(box, life, {
      code: [
        "P = random population",
        "evaluate f(s) for every s in P",
        "repeat (one generation):",
        "  select 2 parents: tournament, t = 3",
        "  vary: crossover → 2 children",
        "  vary: flip each bit with p = 1/L",
        "update: children replace P",
      ],
      build(stage) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 540 256");
        svg.setAttribute("class", "fig rn-svg rn-ea");
        svg.innerHTML = `<text class="rn-ea-h" x="4" y="18">Population P</text><text class="rn-ea-h" x="${OX + 4}" y="18">Children</text>
          ${Array.from({ length: P }, (_, k) => svgRow(k, 0, true)).join("")}${Array.from({ length: P }, (_, k) => svgRow(k, OX, false)).join("")}
          <line class="rn-ea-cut" x1="0" x2="0" y1="0" y2="0" style="opacity:0"/>`;
        stage.appendChild(svg);
        const rows = (sel) =>
          [...svg.querySelectorAll(sel)].map((g) => ({
            g,
            bits: [...g.querySelectorAll(".rn-ea-bit")],
            bar: g.querySelector(".rn-ea-bar"),
            fit: g.querySelector(".rn-ea-fit"),
            tag: g.parentNode.querySelector(".rn-ea-tag"),
          }));
        return { svg, pop: rows(".rn-ea-pop"), kid: rows(".rn-ea-kid"), cutLn: svg.querySelector(".rn-ea-cut") };
      },
      draw(s, f, c) {
        const g = window.gsap,
          slide = !c.instant && g && f.replaced && c.prev && !c.prev.replaced;
        s.pop.forEach((h, k) => {
          h.g.classList.toggle("rn-ea-cont", f.cont.includes(k));
          h.g.classList.toggle("rn-ea-win", f.win.includes(k));
          h.bits.forEach((b, i) => {
            const v = f.pop[k][i];
            b.classList.toggle("rn-ea-one", v === 1);
            b.querySelector("text").textContent = v;
          });
          F.rn.to(c, h.bar, { attr: { width: f.fit ? (f.fit[k] / LEN) * BW : 0 } }, slide ? 0.5 : k * 0.06);
          if (f.fit) F.rn.num(c, h.fit, f.fit[k], k * 0.06);
          else {
            h.fit.textContent = "?";
            h.fit.dataset.v = "";
          }
          const t = f.par ? [f.par.a === k ? "A" : "", f.par.b === k ? "B" : ""].filter(Boolean).join("") : "";
          h.tag.textContent = t;
          h.tag.classList.toggle("a", t === "A");
          h.tag.classList.toggle("b", t === "B");
          if (slide) {
            g.set(h.g, { x: OX, opacity: 0 });
            F.rn.to(c, h.g, { x: 0, opacity: 1 }, k * 0.07, 0.6);
          } else F.rn.to(c, h.g, { x: 0, opacity: 1 }, 0, 0.01);
          if (f.win.includes(k) && !(c.prev && c.prev.win.includes(k))) F.rn.pulse(c, h.g, 0.1);
        });
        s.kid.forEach((h, k) => {
          const kd = f.kids[k],
            was = c.prev && c.prev.kids[k];
          h.g.style.visibility = kd ? "visible" : "hidden";
          if (!kd) return;
          h.bits.forEach((b, i) => {
            const v = kd.g[i],
              fl = f.flash.some(([kk, ii]) => kk === k && ii === i);
            b.classList.toggle("rn-ea-one", v === 1);
            b.classList.toggle("rn-ea-a", kd.src[i] === 0);
            b.classList.toggle("rn-ea-b", kd.src[i] === 1);
            b.classList.toggle("rn-ea-flip", fl);
            b.querySelector("text").textContent = v;
            if (fl) F.rn.pulse(c, b, 0.15);
            if (!was && !c.instant && g) {
              // genes fly in from the parent they came from
              const from = kd.src[i] === 0 ? kd.pa : kd.pb;
              g.set(b, { x: -OX, y: RY(from) - RY(k), opacity: 0.4 });
              F.rn.to(c, b, { x: 0, y: 0, opacity: 1 }, 0.05 + i * 0.04 + (k % 2) * 0.2, 0.55);
            } else F.rn.to(c, b, { x: 0, y: 0, opacity: 1 }, 0, 0.01);
          });
        });
        if (f.cut) {
          const x = OX + BX + f.cut.at * CW - 1,
            y1 = RY(f.cut.k) - 3,
            y2 = RY(f.cut.k + 1) + 35;
          ["x1", "x2"].forEach((a) => s.cutLn.setAttribute(a, x));
          s.cutLn.setAttribute("y1", y1);
          s.cutLn.setAttribute("y2", y2);
        }
        F.rn.stroke(c, s.cutLn, !!f.cut, 0.6);
      },
      frames,
    });
  };

  /* ============ 1.1 What is NIC ============ */
  N.register({
    id: "l1-what",
    lecture: 1,
    order: 1,
    num: "1.1",
    title: "What is Nature-Inspired Computation?",
    blurb: "Nature, Inspired, Computation: the three natural systems the module borrows from, and why.",
    render(root) {
      root.appendChild(header(this, ""));
      const SYS = {
        evo: {
          n: "Evolution",
          icon: "🧬",
          why: "Evolution produced some of the most complex things we know of, including us. It does this with no designer, just variation plus selection over many generations.",
          solves: "Optimisation and design: timetables, antenna shapes, pipe networks, car shapes.",
          mod: "Weeks 1–5: evolutionary algorithms, genetic programming. (Also ant colony optimisation, which the syllabus groups here even though it's collective behaviour.)",
          c: "var(--teal)",
        },
        brain: {
          n: "Brains",
          icon: "🧠",
          why: "We solve many problems that seem very hard for computers, like recognising a face instantly, from a network of simple neurons.",
          solves: "Pattern recognition and learning from data: classification, prediction.",
          mod: "Weeks 10–11: neural networks, neuromorphic computing, self-organising maps.",
          c: "var(--violet)",
        },
        swarm: {
          n: "Collective behaviour",
          icon: "🐜",
          why: "Individually simple agents (one ant, one bird) with no leader can show intelligent behaviour as a group, like ants finding the shortest path to food.",
          solves: "Shortest paths, scheduling, and modelling complex systems that emerge from simple agents.",
          mod: "Weeks 7–9: flocking, multi-agent systems, particle swarm optimisation, multi-objective methods.",
          c: "var(--amber)",
        },
      };
      const card = el(`<div class="card"><div class="card-head"><h2>Click a natural system</h2></div>
        <div class="grid three" id="sys">${Object.entries(SYS)
          .map(
            ([k, s]) =>
              `<button class="btn" data-k="${k}" style="padding:18px;font-size:16px;text-align:left"><span style="font-size:26px;display:block">${s.icon}</span>${s.n}</button>`,
          )
          .join("")}</div>
        <div id="out" style="margin-top:16px"></div></div>`);
      root.appendChild(card);
      const show = (k) => {
        const s = SYS[k];
        qsa("#sys button", card).forEach((b) => b.classList.toggle("on", b.dataset.k === k));
        qs("#out", card).innerHTML = `<div class="grid three">
          <div class="card" style="margin:0;background:var(--bg-2)"><span class="tag" style="color:${s.c}">Nature</span><p style="margin-top:10px"><b>${s.n}</b></p></div>
          <div class="card" style="margin:0;background:var(--bg-2)"><span class="tag" style="color:${s.c}">Inspired: why copy it?</span><p style="margin-top:10px">${s.why}</p></div>
          <div class="card" style="margin:0;background:var(--bg-2)"><span class="tag" style="color:${s.c}">Computation: what it solves</span><p style="margin-top:10px">${s.solves}</p></div></div>
          <p class="dim" style="margin-top:12px">In this module: ${s.mod}</p>`;
      };
      qsa("#sys button", card).forEach((b) => (b.onclick = () => show(b.dataset.k)));
      show("evo");
      root.appendChild(
        el(
          `<div class="callout teal"><b>Why bother?</b> Nature-inspired methods tend to give <b>good results in reasonable time</b> on a huge range of real problems. EAs optimise complex systems on modest hardware, neural networks beat classical pattern-recognition methods, and swarm methods model emergent behaviour. The lecture's twist: all three natural systems were themselves produced by <b>evolution</b>.</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "l1-what-1",
          q: "Which natural system inspires algorithms for <b>finding shortest paths</b>, like routing?",
          opts: ["Brains (neural networks)", "Ant colonies (collective behaviour)", "Evolution (genetic algorithms)"],
          a: 1,
          why: "Ants lay pheromone trails, shorter paths get reinforced faster, and the colony converges on a short route. That's <b>Ant Colony Optimisation</b>, the basis of your CA1.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Nature</b>: evolution, brains, collective behaviour.",
            "<b>Inspired</b>: each one solves hard problems without a central designer.",
            "<b>Computation</b>: optimisation, pattern recognition, shortest paths, search.",
          ],
          "NIC borrows problem-solving tricks from evolution, brains and swarms to get good answers to hard problems in reasonable time.",
        ),
      );
    },
  });

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
          `Reached the top peak (≥98%) in <b style="color:var(--teal)">${Math.round(hit / 2)}%</b> of runs · average organism ends at <b>${Math.round(q / 2)}%</b> of max <span class="faint">(pop ${cfg.P}, ${cfg.bias} bias${cfg.rec ? ", recombination" : ""})</span>`;
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
              ? `<span style="color:var(--teal)">✓ ${ITEMS[i][1]}</span>`
              : `<span style="color:var(--rose)">✗ It's <b>${ITEMS[i][1]}</b></span>`;
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

  /* ============ 2.1 Generic EA ============ */
  N.register({
    id: "l2-generic",
    lecture: 2,
    order: 1,
    num: "2.1",
    title: "The generic EA: select, vary, update",
    blurb: "The lecture's population table: pick parents, make children, then choose how the population gets updated.",
    render(root) {
      root.appendChild(header(this, ""));
      const POP = [0.1, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1];
      const KIDS = [
        ["S11", 1.0],
        ["S12", 0.2],
      ];
      let stage = 0,
        upd = "some";
      const card =
        el(`<div class="card"><div class="controls"><button class="btn ghost" id="bk">← Back</button><button class="btn primary" id="nx">Next stage →</button><span class="mono dim" id="stg"></span></div>
        <div class="grid two"><div><h3>Population P</h3><div class="pop" id="pop"></div></div><div id="right"></div></div>
        <div id="updBar" class="controls" style="margin-top:14px"></div><div id="res"></div></div>`);
      root.appendChild(card);
      const STG = [
        "1. Start: 10 random solutions, each with a fitness",
        "2. Selection: pick parents (fitter = more likely)",
        "3. Variation: apply genetic operators to make new solutions",
        "4. Population update: decide who stays",
      ];
      qs("#updBar", card).append(
        el(`<span class="faint" style="font-size:13px">Update rule:</span>`),
        N.seg(
          [
            ["some", "Replace some old with some new"],
            ["all", "Replace the entire population"],
            ["merge", "Merge P + children, keep best |P|"],
          ],
          upd,
          (v) => {
            upd = v;
            draw();
          },
        ),
      );
      function draw() {
        qs("#stg", card).textContent = STG[stage];
        const mark = (i) => (stage >= 1 && (i === 4 || i === 8) ? "picked" : "");
        let pop = POP.map((f, i) => ({ n: "S" + (i + 1), f, cls: mark(i) }));
        qs("#right", card).innerHTML =
          stage === 0
            ? `<p class="dim">Each chip is one candidate solution s with its fitness f(s). Higher is better here.</p>`
            : stage === 1
              ? `<h3>Parents</h3><div class="pop"><div class="chip picked"><small>S5</small><b>0.9</b></div><div class="chip picked"><small>S9</small><b>0.4</b></div></div><p class="dim" style="margin-top:10px">S5 is the fittest, but S9 (0.4) was also picked. Selection is <b>biased</b>, not "only the best".</p>`
              : `<h3>New solutions</h3><div class="pop">${KIDS.map(([n, f]) => `<div class="chip new"><small>${n}</small><b>${f.toFixed(1)}</b></div>`).join("")}</div><p class="dim" style="margin-top:10px">Children can be better (S11 = 1.0) <i>or worse</i> (S12 = 0.2) than their parents. Variation is blind.</p>`;
        qs("#pop", card).innerHTML = pop
          .map((p) => `<div class="chip ${p.cls}"><small>${p.n}</small><b>${p.f.toFixed(1)}</b></div>`)
          .join("");
        qs("#updBar", card).style.display = stage === 3 ? "" : "none";
        if (stage === 3) {
          let out, note;
          if (upd === "some") {
            const o = POP.map((f, i) => ({ n: "S" + (i + 1), f }));
            const worst = o
              .map((x, i) => i)
              .sort((a, b) => o[a].f - o[b].f)
              .slice(0, 2);
            o[worst[0]] = { n: "S11", f: 1.0, nw: 1 };
            o[worst[1]] = { n: "S12", f: 0.2, nw: 1 };
            out = o;
            note = "The two new children replaced the two weakest (S1 and S10). The population size stays 10.";
          } else if (upd === "all") {
            out = KIDS.map(([n, f]) => ({ n, f, nw: 1 }));
            note =
              "The whole old population is thrown away. In a real run you'd make 10 children so the size stays |P|. Here only 2 are shown, so this is what's left: note that S5 (0.9) is <b>lost</b>.";
          } else {
            out = POP.map((f, i) => ({ n: "S" + (i + 1), f }))
              .concat(KIDS.map(([n, f]) => ({ n, f, nw: 1 })))
              .sort((a, b) => b.f - a.f)
              .slice(0, 10);
            note =
              "Old and new are pooled (12 solutions) and the best 10 survive. S11 gets in, S12 (0.2) doesn't, and the worst old ones drop out.";
          }
          qs("#res", card).innerHTML =
            `<h3 style="margin-top:12px">Next population</h3><div class="pop">${out.map((p) => `<div class="chip ${p.nw ? "new" : ""}"><small>${p.n}</small><b>${p.f.toFixed(1)}</b></div>`).join("")}</div><p class="dim" style="margin-top:10px">${note}</p>`;
        } else qs("#res", card).innerHTML = "";
        qs("#bk", card).disabled = stage === 0;
        qs("#nx", card).disabled = stage === 3;
      }
      qs("#nx", card).onclick = () => {
        stage++;
        draw();
      };
      qs("#bk", card).onclick = () => {
        stage--;
        draw();
      };
      draw();
      const tr =
        el(`<div class="card"><div class="card-head"><h2>The big design questions (EA research topics)</h2></div><div class="grid two">
        <div><h3>How greedy should selection be?</h3><div id="gr"></div><div id="grT" class="dim" style="margin-top:8px"></div></div>
        <div><h3>How big should mutation steps be?</h3><ul class="clean"><li><b>Small-step</b> mutation is preferred.</li><li><b>Recombination</b> is a principled way to take large steps.</li><li>But large random steps are usually <b>extremely bad</b>.</li><li>How to <b>encode</b> "can make all the difference" and is tied up with how you vary.</li></ul></div></div></div>`);
      root.appendChild(tr);
      const gs = N.slider("Greediness", 0, 100, 1, 50, (v) => v + "%");
      const gt = (v) =>
        (qs("#grT", tr).innerHTML =
          v < 20
            ? "<b style='color:var(--amber)'>Almost random</b>: great results, but <b>too slowly</b>."
            : v > 80
              ? "<b style='color:var(--rose)'>Always select the best</b>: bad results, <b>quickly</b> (premature convergence)."
              : "<b style='color:var(--teal)'>Moderate bias</b>: the sweet spot. Fitter is more likely, but everyone has a chance.");
      gs.onInput(gt);
      qs("#gr", tr).appendChild(gs);
      gt(50);
      root.appendChild(
        takeaways(
          [
            "Generic EA: <b>initialise</b> a random population (often 100–500), <b>evaluate</b>, then loop: <b>select → vary → update population</b>.",
            "Selection options: top 10%, fitness-proportionate, exponential in rank, …",
            "Update options: replace everyone, merge and keep the best |P|, replace some old with some new.",
          ],
          "An EA repeatedly selects parents, varies them into children, and updates the population.",
        ),
      );
    },
  });

  /* ============ 2.2 Search & optimisation ============ */
  N.register({
    id: "l2-optim",
    lecture: 2,
    order: 2,
    num: "2.2",
    title: "Search, optimisation & fitness functions",
    blurb:
      "The lecture's 3-item problem: search every subset yourself, and see that you just optimised a fitness function.",
    render(root) {
      root.appendChild(header(this, ""));
      const W = [20, 75, 60];
      let bits = [0, 0, 0];
      const card = el(`<div class="card"><div class="card-head"><h2>Get as close to 100 kg as possible</h2></div>
        <div class="grid two"><div><div id="items" style="display:flex;gap:10px;flex-wrap:wrap"></div>
          <div class="stat-row"><div class="stat"><small>Solution s (bits)</small><b id="s"></b></div><div class="stat amber"><small>Total weight</small><b id="w"></b></div><div class="stat teal"><small>f(s) = |weight − 100|</small><b id="f"></b></div></div>
          <p class="dim">Lower f is better, so this is a <b>minimisation</b> problem. Bit i = 1 means item i is in the subset.</p></div>
        <div><h3>The whole search space S (8 solutions)</h3><table class="t" id="tb"></table><div class="controls"><button class="btn" id="rev">Reveal fitness for all</button></div></div></div></div>`);
      root.appendChild(card);
      let revealed = false;
      const f = (b) => Math.abs(b.reduce((a, x, i) => a + x * W[i], 0) - 100);
      const all = Array.from({ length: 8 }, (_, k) => [(k >> 2) & 1, (k >> 1) & 1, k & 1]);
      const tried = new Set(["000"]);
      function draw() {
        const key = bits.join("");
        tried.add(key);
        qs("#items", card).innerHTML = W.map(
          (w, i) =>
            `<button class="btn ${bits[i] ? "on" : ""}" data-i="${i}" style="padding:14px 18px;text-align:left"><b>Item ${i + 1}</b><br><span class="mono">${w} kg</span></button>`,
        ).join("");
        qsa("#items button", card).forEach(
          (b) =>
            (b.onclick = () => {
              bits[+b.dataset.i] ^= 1;
              draw();
            }),
        );
        qs("#s", card).textContent = key;
        qs("#w", card).textContent = bits.reduce((a, x, i) => a + x * W[i], 0) + " kg";
        qs("#f", card).textContent = f(bits);
        const best = Math.min(...all.map(f));
        qs("#tb", card).innerHTML =
          `<tr><th>s</th><th class="num">weight</th><th class="num">f(s)</th></tr>` +
          all
            .map((b) => {
              const k = b.join(""),
                show = revealed || tried.has(k);
              return `<tr class="${k === key ? "hl" : ""}"><td class="mono">${k}</td><td class="num">${show ? b.reduce((a, x, i) => a + x * W[i], 0) : "?"}</td><td class="num" style="color:${show && f(b) === best ? "var(--teal)" : ""}">${show ? f(b) + (f(b) === best ? " ★" : "") : "?"}</td></tr>`;
            })
            .join("") +
          `<tr><td colspan="3" class="faint">You've tried ${tried.size} of 8. ${tried.size === 8 ? "That's <b>exhaustive search</b> (enumeration): you're guaranteed to have found the optimum." : ""}</td></tr>`;
      }
      qs("#rev", card).onclick = () => {
        revealed = true;
        draw();
      };
      draw();
      root.appendChild(
        el(`<div class="card"><div class="card-head"><h2>Fitness functions in the real world</h2></div><table class="t">
        <tr><th>Problem</th><th>Candidate solution s</th><th>Fitness f(s)</th></tr>
        <tr><td>Timetabling</td><td>A full timetable</td><td>Number of clashes (minimise)</td></tr>
        <tr><td>Car design</td><td>A car shape</td><td>Distance covered on terrain (maximise)</td></tr>
        <tr><td>Circuits, water networks, antennas</td><td>A design</td><td>Closeness of fit to the spec</td></tr></table>
        <p class="dim" style="margin-top:10px">Size of S: tiny (8 here), huge (all timetables for 500 exams over 3 weeks, typically ~10<sup>30</sup>), or <b>infinite</b> (all real numbers).</p></div>`),
      );
      root.appendChild(
        predict({
          id: "l2-opt-1",
          q: "Exhaustive search worked for 3 items (2<sup>3</sup> = 8). How many subsets would 60 items have?",
          opts: ["60² = 3,600", "2⁶⁰ ≈ 1.15 × 10¹⁸", "60! ≈ 8.3 × 10⁸¹"],
          a: 1,
          why: "Each item is in or out, so there are 2<sup>60</sup> ≈ 1.15 × 10<sup>18</sup> subsets. At a billion checks a second that's about <b>36 years</b>. Enumeration only works for tiny S.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Optimisation</b> = find the best solution you can (usually quickly) from a set <b>S</b> of candidates.",
            "The <b>fitness function f(s)</b> scores each candidate. We want the s with the best score (max or min).",
            "<b>Exhaustive search / enumeration</b>: try every s. Guaranteed optimal, but only feasible when S is small.",
          ],
          "Optimisation means searching the set S for the s with the best f(s); enumeration only works when S is small.",
        ),
      );
    },
  });

  /* ============ 2.3 Complexity ============ */
  N.register({
    id: "l2-complexity",
    lecture: 2,
    order: 3,
    num: "2.3",
    title: "Easy vs hard: polynomial vs exponential",
    blurb: "Drag n and watch an exponential curve overtake a polynomial one, then see what that means in real seconds.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let n = 20;
      const card = el(`<div class="card"><div class="controls" id="b"></div>
        <div class="grid two"><div><h3>1.1<sup>n</sup> vs n<sup>1.1</sup> (the lecture's table)</h3><canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--rose)">1.1<sup>n</sup> exponential</span><span style="--c:var(--teal)">n<sup>1.1</sup> polynomial</span></div><p class="dim" id="cx"></p></div>
        <div><h3>Time at 10<sup>9</sup> steps per second</h3><table class="t" id="tb"></table></div></div></div>`);
      root.appendChild(card);
      const sN = N.slider("Problem size n", 2, 100, 1, n);
      sN.onInput((v) => {
        n = v;
        draw();
      });
      qs("#b", card).appendChild(sN);
      const human = (s) => {
        if (!Number.isFinite(s) || s > 1e30) return "far longer than the age of the universe";
        const u = [
          ["years", 31557600],
          ["days", 86400],
          ["hours", 3600],
          ["minutes", 60],
          ["seconds", 1],
          ["ms", 1e-3],
          ["µs", 1e-6],
          ["ns", 1e-9],
        ];
        for (const [nm, v] of u)
          if (s >= v) {
            const x = s / v;
            return (x >= 1e6 ? x.toExponential(1) : x.toFixed(x < 10 ? 1 : 0)) + " " + nm;
          }
        return "< 1 ns";
      };
      function draw() {
        const xs = Array.from({ length: n - 1 }, (_, i) => i + 2);
        N.lineChart(qs("#ch", card), {
          series: [
            { data: xs.map((x) => 1.1 ** x), color: N.colors().rose },
            { data: xs.map((x) => x ** 1.1), color: N.colors().teal },
          ],
          yMin: 0,
          height: 220,
          xLabel: "n (from 2)",
        });
        qs("#cx", card).innerHTML =
          n < 44
            ? `At n = ${n}: 1.1<sup>n</sup> = <b>${(1.1 ** n).toFixed(2)}</b>, n<sup>1.1</sup> = <b>${(n ** 1.1).toFixed(2)}</b>. The exponential still looks <i>smaller</i>. Keep dragging…`
            : `At n = ${n}: 1.1<sup>n</sup> = <b>${(1.1 ** n).toFixed(0)}</b> vs n<sup>1.1</sup> = <b>${(n ** 1.1).toFixed(0)}</b>. The curves crossed between n = 43 and 44. <b>An exponential always overtakes a polynomial eventually.</b>`;
        const rows = [
          ["n log n", "Sorting (easy)", n * Math.log2(n)],
          ["n²", "Closest pair of n vectors (easy)", n ** 2],
          ["n³", "Polynomial (easy)", n ** 3],
          ["2ⁿ", "Multiple alignment of n sequences (hard)", 2 ** n],
          [
            "n!",
            "Try every TSP tour (hard)",
            (() => {
              let r = 1;
              for (let i = 2; i <= n; i++) r *= i;
              return r;
            })(),
          ],
        ];
        qs("#tb", card).innerHTML =
          `<tr><th>Steps</th><th>Example</th><th class="num">Time</th></tr>` +
          rows
            .map(
              ([s, ex, v], i) =>
                `<tr class="${i >= 3 ? "bad" : ""}"><td class="mono">${s}</td><td>${ex}</td><td class="num">${human(v / 1e9)}</td></tr>`,
            )
            .join("");
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "l2-cx-1",
          q: "A problem is called <b>hard (intractable)</b> when…",
          opts: [
            "It has a large search space",
            "No polynomial-time exact algorithm is <b>known</b>",
            "Computers can't represent its solutions",
          ],
          a: 1,
          why: 'Sorting has a huge search space (n! orderings) but is <b>easy</b>, because an n log n algorithm exists. "Hard" is about the best <i>known</i> exact algorithm being exponential. The lecture\'s point for you: <b>almost all important real-world problems are technically hard.</b>',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Complexity = how the running time of the <b>fastest known exact algorithm</b> grows with problem size n.",
            "<b>Polynomial</b> (n², n log n, n<sup>34</sup>) = <b>easy / tractable</b>. <b>Exponential</b> (2<sup>n</sup>, 1.1<sup>n</sup>, n<sup>n</sup>) = <b>hard / intractable</b>.",
            "An exponential always overtakes a polynomial as n grows, even 1.1<sup>n</sup> vs n<sup>1.1</sup>.",
          ],
          "Easy problems have polynomial-time exact algorithms; hard ones don't (as far as we know), so exact solving blows up exponentially.",
        ),
      );
    },
  });

  /* ============ 2.4 MST & Prim ============ */
  const G = {
    nodes: { A: [80, 170], B: [260, 55], C: [230, 280], D: [450, 265], E: [460, 85] },
    edges: [
      ["A", "B", 12],
      ["A", "C", 4],
      ["A", "D", 6],
      ["A", "E", 9],
      ["B", "C", 7],
      ["B", "D", 8],
      ["B", "E", 3],
      ["C", "D", 5],
      ["C", "E", 6],
      ["D", "E", 14],
    ],
  };
  N.register({
    id: "l2-mst",
    lecture: 2,
    order: 4,
    num: "2.4",
    title: "An easy problem (MST) and its hard cousin",
    blurb:
      "Build spanning trees by hand, watch Prim's algorithm find the optimum, then add a small constraint and see greedy fail.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let sel = new Set(),
        prim = null,
        maxDeg = 0;
      const card = el(`<div class="card"><div class="controls" id="b1"></div>
        <div class="grid side"><svg class="viz" id="g" viewBox="0 0 540 330"></svg><div>
          <div class="stat-row"><div class="stat amber"><small>Cost</small><b id="c"></b></div><div class="stat"><small>Edges</small><b id="e"></b></div></div>
          <div id="st"></div><div id="primLog" class="dim" style="margin-top:10px"></div></div></div>
        <div class="controls"><button class="btn" id="t36">Slide tree #1</button><button class="btn" id="t20">Slide tree #2</button><button class="btn primary" id="pr">Run Prim step by step</button><button class="btn ghost" id="clr">Clear</button></div>
        <p class="faint" style="font-size:12.5px">Click edges to add or remove them. The edge weights are the slide's. The layout is reconstructed (the PDF text lost it) so that the slide's trees cost 36 and 20 and the MST costs 18, as on the slides.</p></div>`);
      root.appendChild(card);
      const cons = el(
        `<label class="field"><input type="checkbox"> Constraint: no node may have degree above 2</label>`,
      );
      qs("input", cons).onchange = (e) => {
        maxDeg = e.target.checked ? 2 : 0;
        draw();
      };
      qs("#b1", card).appendChild(cons);
      const key = (e) => e[0] + e[1];
      const deg = (set) => {
        const d = {};
        Object.keys(G.nodes).forEach((n) => (d[n] = 0));
        G.edges.forEach((e) => {
          if (set.has(key(e))) {
            d[e[0]]++;
            d[e[1]]++;
          }
        });
        return d;
      };
      const isTree = (set) => {
        if (set.size !== 4) return false;
        const p = {};
        const f = (x) => (p[x] === undefined || p[x] === x ? (p[x] = x) : (p[x] = f(p[x])));
        for (const e of G.edges)
          if (set.has(key(e))) {
            const a = f(e[0]),
              b = f(e[1]);
            if (a === b) return false;
            p[a] = b;
          }
        return true;
      };
      const cost = (set) => G.edges.reduce((a, e) => a + (set.has(key(e)) ? e[2] : 0), 0);
      // brute force optima
      const combos = [];
      const rec = (i, cur) => {
        if (cur.length === 4) {
          combos.push(new Set(cur));
          return;
        }
        for (let k = i; k < 10; k++) rec(k + 1, [...cur, key(G.edges[k])]);
      };
      rec(0, []);
      const trees = combos.filter(isTree);
      const opt = (md) => Math.min(...trees.filter((t) => !md || Math.max(...Object.values(deg(t))) <= md).map(cost));
      function draw(hl = []) {
        const d = deg(sel);
        qs("#g", card).innerHTML =
          G.edges
            .map((e) => {
              const [a, b, w] = e,
                on = sel.has(key(e)),
                h = hl.includes(key(e));
              const [x1, y1] = G.nodes[a],
                [x2, y2] = G.nodes[b];
              return `<g data-e="${key(e)}" style="cursor:pointer"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="16"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? "var(--teal)" : h ? "var(--amber)" : "var(--line-2)"}" stroke-width="${on ? 4 : h ? 3 : 1.5}" ${h && !on ? 'stroke-dasharray="6 4"' : ""}/>
            <text x="${(x1 + x2) / 2 + 7}" y="${(y1 + y2) / 2 - 5}" fill="${on ? "var(--text)" : "var(--text-dim)"}" font-size="13" font-weight="${on ? 700 : 400}" font-family="var(--mono)">${w}</text></g>`;
            })
            .join("") +
          Object.entries(G.nodes)
            .map(
              ([n, [x, y]]) =>
                `<circle cx="${x}" cy="${y}" r="18" fill="var(--panel-2)" stroke="${maxDeg && d[n] > maxDeg ? "var(--rose)" : "var(--teal)"}" stroke-width="2.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="var(--text)" font-weight="700" font-size="15">${n}</text>`,
            )
            .join("");
        qsa("[data-e]", card).forEach(
          (g) =>
            (g.onclick = () => {
              prim = null;
              qs("#primLog", card).innerHTML = "";
              const k = g.dataset.e;
              sel.has(k) ? sel.delete(k) : sel.add(k);
              draw();
            }),
        );
        qs("#c", card).textContent = cost(sel);
        qs("#e", card).textContent = `${sel.size} / 4`;
        const tree = isTree(sel),
          viol = maxDeg && Math.max(...Object.values(d)) > maxDeg,
          best = opt(maxDeg);
        qs("#st", card).innerHTML = tree
          ? viol
            ? `<div class="callout rose">A spanning tree, but it <b>breaks the degree constraint</b> (red node), so it's not a feasible solution.</div>`
            : cost(sel) === best
              ? `<div class="callout teal"><b>Optimal!</b> ${cost(sel)} is the cheapest ${maxDeg ? "tree with max degree 2" : "spanning tree"} for this graph.</div>`
              : `<div class="callout">Valid spanning tree. The cheapest possible is <b>${best}</b>.</div>`
          : `<p class="dim">A <b>spanning tree</b> connects all 5 nodes with no cycles, which always takes exactly <b>n − 1 = 4</b> edges.${sel.size > 0 && !tree && sel.size >= 4 ? ' <span style="color:var(--rose)">Yours has a cycle or leaves a node out.</span>' : ""}</p>`;
      }
      qs("#t36", card).onclick = () => {
        sel = new Set(["AB", "DE", "BC", "BE"]);
        draw();
      };
      qs("#t20", card).onclick = () => {
        sel = new Set(["AC", "AD", "BC", "BE"]);
        draw();
      };
      qs("#clr", card).onclick = () => {
        sel = new Set();
        prim = null;
        qs("#primLog", card).innerHTML = "";
        draw();
      };
      qs("#pr", card).onclick = () => {
        if (!prim || prim.done) {
          prim = { in: new Set(["A"]), log: [], done: false };
          sel = new Set();
        }
        const cands = G.edges.filter(
          (e) =>
            prim.in.has(e[0]) !== prim.in.has(e[1]) &&
            (!maxDeg || (deg(sel)[e[0]] < maxDeg && deg(sel)[e[1]] < maxDeg)),
        );
        if (!cands.length) {
          prim.done = true;
          qs("#primLog", card).innerHTML +=
            `<div style="color:var(--rose)">No feasible edge left: greedy is stuck.</div>`;
          return;
        }
        const pick = cands.reduce((b, e) => (e[2] < b[2] ? e : b));
        sel.add(key(pick));
        prim.in.add(pick[0]);
        prim.in.add(pick[1]);
        prim.log.push(
          `Step ${prim.log.length + 1}: candidates ${cands.map((e) => `${e[0]}${e[1]}(${e[2]})`).join(", ")} → cheapest <b>${pick[0]}${pick[1]} (${pick[2]})</b>`,
        );
        if (sel.size === 4) prim.done = true;
        qs("#primLog", card).innerHTML =
          `<b>Prim${maxDeg ? " (greedy, skipping edges that break the constraint)" : ""}</b>, starting from A:<br>` +
          prim.log.join("<br>") +
          (prim.done && sel.size === 4
            ? `<br><b style="color:${cost(sel) === opt(maxDeg) ? "var(--teal)" : "var(--rose)"}">Total ${cost(sel)}${cost(sel) === opt(maxDeg) ? ": optimal." : `, but the true optimum is ${opt(maxDeg)}. Greedy is no longer guaranteed!`}</b>`
            : "");
        draw(cands.map(key));
      };
      draw();
      root.appendChild(
        predict({
          id: "l2-mst-1",
          q: "Turn on the degree ≤ 2 constraint and run Prim. What happens, and what does it show?",
          opts: [
            "Prim still finds the optimum, because greedy always works on trees",
            "Greedy gets 20 while the best feasible tree costs 19",
            "No tree satisfies the constraint",
          ],
          a: 1,
          why: "Unconstrained, Prim is guaranteed optimal in polynomial time: an <b>easy</b> problem. With the degree constraint, greedy picks A–C, C–D, B–D, B–E = 20, but D–A–C–E–B costs 19. <b>Degree-constrained MST is hard</b>, and real-world MST problems almost always have constraints like this.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>MST</b>: the cheapest tree connecting all nodes (n − 1 edges, no cycles). It's <b>easy</b>: Prim's algorithm is polynomial and guaranteed optimal.",
            "Prim: start with an empty tree and repeatedly add the cheapest edge that feasibly extends it, until n − 1 edges.",
            "Constrained versions (max degree, bandwidth requirements) are almost always <b>hard</b>, and real-world problems are the constrained kind.",
          ],
          "Plain MST is easy thanks to Prim's greedy algorithm, but add a real-world constraint and it becomes hard.",
        ),
      );
    },
  });

  /* ============ 2.5 Exact vs approximate ============ */
  N.register({
    id: "l2-approx",
    lecture: 2,
    order: 5,
    num: "2.5",
    title: "Exact vs approximate algorithms",
    blurb:
      "16²¹ water-network designs, then a live race between a fast simple heuristic and a slower EA that wins in the end.",
    render(root, life) {
      root.appendChild(header(this, ""));
      root.appendChild(
        el(`<div class="card"><div class="card-head"><h2>New York Tunnels (a highly simplified water network)</h2></div>
        <div class="stat-row"><div class="stat"><small>Pipes</small><b>21</b></div><div class="stat"><small>Diameters per pipe</small><b>16</b></div><div class="stat rose"><small>Possible designs = 16²¹</small><b>19,342,813,113,834,066,795,298,816</b></div></div>
        <p class="dim">Checking a billion designs per second would take about <b>6.1 × 10<sup>8</sup> years</b>. No exact method is practical, so we need <b>approximate algorithms</b>: good answers in reasonable time, with <b>no guarantee</b> of optimality.</p></div>`),
      );
      const n = 25;
      let cities,
        nnTour,
        nnLen,
        pop,
        fits,
        evals,
        hist,
        running = null;
      const d = (a, b) => Math.hypot(cities[a][0] - cities[b][0], cities[a][1] - cities[b][1]);
      const len = (t) => t.reduce((s, c, i) => s + d(c, t[(i + 1) % n]), 0);
      function init() {
        cities = Array.from({ length: n }, () => [0.05 + rnd() * 0.9, 0.08 + rnd() * 0.84]);
        const t = [0],
          left = new Set([...Array(n).keys()].slice(1));
        while (left.size) {
          const c = t[t.length - 1];
          let b = null;
          for (const x of left) if (b === null || d(c, x) < d(c, b)) b = x;
          t.push(b);
          left.delete(b);
        }
        nnTour = t;
        nnLen = len(t);
        pop = Array.from({ length: 30 }, () => shuffle([...Array(n).keys()]));
        fits = pop.map(len);
        evals = 30;
        hist = { ea: [Math.min(...fits)], x: [evals] };
        draw();
      }
      function iter() {
        let b = randint(0, 29);
        for (let k = 1; k < 3; k++) {
          const c = randint(0, 29);
          if (fits[c] < fits[b]) b = c;
        }
        const m = pop[b].slice();
        let i = randint(0, n - 1),
          j = randint(0, n - 1);
        if (i > j) [i, j] = [j, i];
        const seg = m.slice(i, j + 1).reverse();
        m.splice(i, seg.length, ...seg);
        const fm = len(m);
        evals++;
        let w = 0;
        for (let k = 1; k < 30; k++) if (fits[k] > fits[w]) w = k;
        if (fm <= fits[w]) {
          pop[w] = m;
          fits[w] = fm;
        }
      }
      const card =
        el(`<div class="card"><div class="card-head"><h2>Race: simple fast method vs sophisticated slow method</h2><span class="faint">25-city TSP</span></div>
        <div class="grid two"><div><div class="card-head"><span class="tag amber">Nearest neighbour</span><span class="faint">greedy, "always go to the closest unvisited city"</span></div><canvas class="viz" id="nn"></canvas></div>
        <div><div class="card-head"><span class="tag teal">Evolutionary algorithm</span><span class="faint">steady-state, tournament, segment-reversal mutation</span></div><canvas class="viz" id="ea"></canvas></div></div>
        <div class="controls"><button class="btn primary" id="go">Run EA</button><button class="btn ghost" id="rs">New cities</button><span class="mono dim" id="info"></span></div>
        <h3>Solution quality over time (shorter tour = better)</h3><canvas class="viz" id="ch"></canvas>
        <div class="legend"><span style="--c:var(--amber)">nearest neighbour (done instantly)</span><span style="--c:var(--teal)">EA best so far</span></div></div>`);
      root.appendChild(card);
      function drawTour(cv, t, color) {
        const { ctx, w, h } = N.setupCanvas(cv, 220);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        t.forEach((c, i) => {
          const [x, y] = cities[c];
          i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = N.colors().text;
        cities.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x * w, y * h, 3.5, 0, 7);
          ctx.fill();
        });
      }
      function draw() {
        const C = N.colors();
        drawTour(qs("#nn", card), nnTour, C.amber);
        const bi = fits.indexOf(Math.min(...fits));
        drawTour(qs("#ea", card), pop[bi], C.teal);
        N.lineChart(qs("#ch", card), {
          series: [
            { data: hist.ea.map(() => nnLen), color: C.amber, dash: [5, 4] },
            { data: hist.ea, color: C.teal },
          ],
          height: 200,
          xLabel: "time (evaluations)",
        });
        const best = fits[bi];
        qs("#info", card).innerHTML =
          `evals ${evals.toLocaleString()} · NN ${nnLen.toFixed(3)} · EA ${best.toFixed(3)} ${best < nnLen ? `<b style="color:var(--teal)">(EA ahead by ${((1 - best / nnLen) * 100).toFixed(1)}%)</b>` : `<span style="color:var(--amber)">(NN ahead)</span>`}`;
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run EA";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          for (let k = 0; k < 60; k++) iter();
          hist.ea.push(Math.min(...fits));
          draw();
          if (evals > 25000) stop();
        }, 30);
      };
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      life.onResize(draw);
      init();
      root.appendChild(
        predict({
          id: "l2-ap-1",
          q: "You have <b>1 second</b> to produce a delivery route. Which method, and why?",
          opts: [
            "The EA, because it finds the better answer eventually",
            "Nearest neighbour: it gets a good route almost instantly",
            "Exhaustive search, because it's guaranteed optimal",
          ],
          a: 1,
          why: "That's the lecture's quality-vs-time curve: a <b>simple method gets good solutions fast</b>, a <b>sophisticated method is slow but better eventually</b>. The right choice depends on your time budget. Exhaustive search: 24!/2 ≈ 3 × 10<sup>23</sup> tours. No.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Exact</b> algorithm: guaranteed to return an optimal solution. Only practical for easy problems or tiny instances.",
            "<b>Approximate</b> algorithms: reasonable time, often near-optimal (sometimes optimal), but <b>no guarantee</b>.",
            "EAs are among the most successful approximate algorithms, but slow: simple heuristics are fast and good, and EAs overtake them given time.",
          ],
          "Hard problems need approximate algorithms: fast, usually good, never guaranteed optimal.",
        ),
      );
    },
  });
})();
