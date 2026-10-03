/* Lecture 1 — What is NIC, evolution as problem solving. Lecture 2 — generic EA, optimisation, complexity, MST, approximate algorithms */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;

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
          c: "var(--teal-ink)",
        },
        brain: {
          n: "Brains",
          icon: "🧠",
          why: "We solve many problems that seem very hard for computers, like recognising a face instantly, from a network of simple neurons.",
          solves: "Pattern recognition and learning from data: classification, prediction.",
          mod: "Weeks 10–11: neural networks, neuromorphic computing, self-organising maps.",
          c: "var(--violet-ink)",
        },
        swarm: {
          n: "Collective behaviour",
          icon: "🐜",
          why: "Individually simple agents (one ant, one bird) with no leader can show intelligent behaviour as a group, like ants finding the shortest path to food.",
          solves: "Shortest paths, scheduling, and modelling complex systems that emerge from simple agents.",
          mod: "Weeks 7–9: flocking, multi-agent systems, particle swarm optimisation, multi-objective methods.",
          c: "var(--amber-ink)",
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
})();
