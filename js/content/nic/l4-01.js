/* Lecture 4 — algorithm types, replacement, selection, representations, mutation, crossover */
(function () {
  const partScope = (NIC.shared.l4 = NIC.shared.l4 || {});

  const N = NIC;
  const { randint, rnd } = N;

  // ---------- Selection helpers (shared with lab + quiz) ----------
  const SEL = {
    rouletteProbs(f) {
      if (f.some((x) => x < 0)) return null;
      const s = f.reduce((a, b) => a + b, 0);
      return s > 0 ? f.map((x) => x / s) : null;
    },
    ranks(f, minimise) {
      const idx = f.map((_, i) => i).sort((a, b) => (minimise ? f[b] - f[a] : f[a] - f[b]));
      const r = new Array(f.length);
      idx.forEach((i, k) => (r[i] = k + 1));
      return r;
    },
    rankProbs(f, b = 1, minimise = false) {
      const r = SEL.ranks(f, minimise).map((x) => x ** b);
      const s = r.reduce((a, c) => a + c, 0);
      return r.map((x) => x / s);
    },
    tournProbByRank(Npop, t) {
      return Array.from({ length: Npop }, (_, k) => ((k + 1) / Npop) ** t - (k / Npop) ** t);
    },
    sample(probs) {
      let u = rnd(),
        acc = 0;
      for (let i = 0; i < probs.length; i++) {
        acc += probs[i];
        if (u < acc) return i;
      }
      return probs.length - 1;
    },
    tournament(f, t) {
      let b = randint(0, f.length - 1);
      for (let k = 1; k < t; k++) {
        const c = randint(0, f.length - 1);
        if (f[c] > f[b]) b = c;
      }
      return b;
    },
  };
  N.SEL = SEL;

  // ---------- Step-through runners used by lesson steps in lessons.js (NIC.runners, seeded RNG from l12.js) ----------
  N.runners = N.runners || {};
  const SVGNS = "http://www.w3.org/2000/svg";
  const seeded = (s) => (N.runners.mulberry32 ? N.runners.mulberry32(s) : Math.random);
  const setX = (node, x) => {
    if (window.gsap) window.gsap.set(node, { x });
    else node.setAttribute("transform", `translate(${x} 0)`);
  };

  /** Roulette-wheel selection: slices ∝ fitness, seeded spins, a tally. Fitness values are editable. */
  N.runners.roulette = function rouletteRun(box, life) {
    const F = N.fig,
      names = ["A", "B", "C", "D", "E"],
      f = [3, 1, 5, 2, 4],
      SPINS = 5,
      SEED = 7;
    const CX = 125,
      CY = 128,
      R = 108,
      COLS = ["blue", "amber", "teal", "violet", "rose"];
    const pt = (a, rr) => [CX + rr * Math.sin(a), CY - rr * Math.cos(a)];
    function* frames() {
      const r = seeded(SEED),
        tot = f.reduce((a, b) => a + b, 0),
        fs = f.slice();
      const pct = (i) => Math.round((100 * fs[i]) / tot);
      const tally = fs.map(() => 0);
      const snap = (x) => ({ f: fs, tot, tally: tally.slice(), rot: 0, hit: -1, big: [], ...x });
      yield snap({ cap: `Each slice is sized by fitness. Total = ${fs.join(" + ")} = <b>${tot}</b>.`, line: 0 });
      const top = Math.max(...fs),
        big = fs.map((v, i) => (v === top ? i : -1)).filter((i) => i >= 0),
        b = big[0];
      yield snap({
        big,
        cap: `<b>${names[b]}</b> has the biggest slice: p = ${fs[b]}/${tot} = <b>${pct(b)}%</b>. Now spin.`,
        line: 1,
        ask: {
          q: "Which individual is most likely to be picked? Tap it.",
          pick: ".rn-wheel-pk",
          a: big.map(String),
          why: `p = fitness ÷ total, so the fittest (${big.map((i) => names[i]).join(", ")}, f = ${top}) has the biggest slice.`,
        },
      });
      let rot = 0;
      for (let s = 1; s <= SPINS; s++) {
        const u = r() * tot;
        let acc = 0,
          hit = fs.length - 1;
        for (let i = 0; i < fs.length; i++) {
          acc += fs[i];
          if (u < acc) {
            hit = i;
            break;
          }
        }
        tally[hit]++;
        rot = 720 * s + (u / tot) * 360;
        yield snap({
          rot,
          hit,
          cap: `Spin ${s}: r = <b>${u.toFixed(1)}</b> of ${tot}. The running total passes it in <b>${names[hit]}</b>'s slice.`,
          line: 3,
        });
      }
      const most = tally.indexOf(Math.max(...tally));
      yield snap({
        rot,
        hit: -1,
        cap: `After ${SPINS} spins <b>${names[most]}</b> was picked most (${tally[most]}×). Over many spins each share tends to its p. Tap a fitness to change it.`,
        line: 4,
        mood: "love",
      });
    }
    F.run(box, life, {
      code: [
        "total = f₁ + f₂ + … + f_P",
        "slice i has p_i = f_i / total",
        "r = random number in [0, total)",
        "add up f_i until the sum passes r",
        "return that individual (repeat per parent)",
      ],
      build(stage, api) {
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("viewBox", "0 0 470 256");
        svg.setAttribute("class", "fig rn-svg rn-wheel");
        svg.innerHTML = `<g class="rn-wheel-sls">${names.map((n, i) => `<path class="rn-wheel-sl rn-wheel-pk" data-k="${i}" style="fill:var(--${COLS[i]})"/>`).join("")}</g>
          <g class="rn-wheel-lbls">${names.map((n, i) => `<text class="rn-wheel-sn" style="fill:var(--${COLS[i]}-on)">${n}</text>`).join("")}</g>
          <circle class="rn-wheel-rim" cx="${CX}" cy="${CY}" r="${R}"/>
          <g class="rn-wheel-ptr"><line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - R + 16}"/><path d="M${CX - 9} ${CY - R + 20}L${CX} ${CY - R + 2}L${CX + 9} ${CY - R + 20}z"/><circle cx="${CX}" cy="${CY}" r="10"/></g>
          <text class="rn-wheel-h" x="262" y="22">who</text><text class="rn-wheel-h" x="318" y="22">f</text><text class="rn-wheel-h" x="372" y="22">p</text><text class="rn-wheel-h" x="430" y="22">picked</text>
          ${names
            .map(
              (
                n,
                i,
              ) => `<g transform="translate(248 ${34 + i * 42})"><g class="rn-wheel-row rn-wheel-pk" data-k="${i}"><rect class="rn-wheel-bg" width="216" height="34" rx="10"/>
            <rect x="8" y="9" width="16" height="16" rx="5" style="fill:var(--${COLS[i]})"/><text class="rn-wheel-nm" x="38" y="23">${n}</text>
            <g class="rn-wheel-f" transform="translate(70 17)"><rect x="-15" y="-12" width="30" height="24" rx="7"/><text y="5" data-v="${f[i]}">${f[i]}</text></g>
            <text class="rn-wheel-p" x="124" y="23" data-v="">·</text><text class="rn-wheel-t" x="182" y="23" data-v="0">0</text></g></g>`,
            )
            .join("")}`;
        stage.appendChild(svg);
        const rows = [...svg.querySelectorAll(".rn-wheel-row")];
        rows.forEach((row, i) => {
          const chip = row.querySelector(".rn-wheel-f"),
            t = chip.querySelector("text");
          api.edit(chip, {
            get: () => f[i],
            set: (v) => {
              f[i] = v;
              t.textContent = v;
              t.dataset.v = v;
            },
            min: 1,
            max: 9,
          });
        });
        return {
          svg,
          sl: [...svg.querySelectorAll(".rn-wheel-sl")],
          sn: [...svg.querySelectorAll(".rn-wheel-sn")],
          ptr: svg.querySelector(".rn-wheel-ptr"),
          rows,
          p: rows.map((r) => r.querySelector(".rn-wheel-p")),
          t: rows.map((r) => r.querySelector(".rn-wheel-t")),
        };
      },
      draw(s, fr, c) {
        let acc = 0;
        fr.f.forEach((v, i) => {
          const a0 = (acc / fr.tot) * 2 * Math.PI,
            a1 = ((acc + v) / fr.tot) * 2 * Math.PI,
            [x0, y0] = pt(a0, R),
            [x1, y1] = pt(a1, R),
            [lx, ly] = pt((a0 + a1) / 2, R * 0.66);
          acc += v;
          s.sl[i].setAttribute(
            "d",
            `M${CX} ${CY}L${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}z`,
          );
          s.sn[i].setAttribute("x", lx.toFixed(1));
          s.sn[i].setAttribute("y", (ly + 5).toFixed(1));
          F.rn.text(c, s.p[i], Math.round((100 * v) / fr.tot) + "%");
          s.sl[i].classList.toggle("rn-wheel-big", fr.big.includes(i));
          s.rows[i].classList.toggle("rn-wheel-big", fr.big.includes(i));
        });
        const spin = !c.instant && window.gsap && fr.hit >= 0,
          land = spin ? 1.35 : 0;
        if (window.gsap) F.rn.to(c, s.ptr, { rotation: fr.rot, svgOrigin: `${CX} ${CY}`, ease: "power3.out" }, 0, 1.4);
        else s.ptr.setAttribute("transform", `rotate(${fr.rot} ${CX} ${CY})`);
        const mark = () =>
          fr.f.forEach((_, i) => {
            s.sl[i].classList.toggle("rn-wheel-hit", fr.hit === i);
            s.rows[i].classList.toggle("rn-wheel-hit", fr.hit === i);
          });
        if (spin) {
          fr.f.forEach((_, i) => {
            s.sl[i].classList.toggle("rn-wheel-hit", false);
            s.rows[i].classList.toggle("rn-wheel-hit", false);
          });
          c.tl.call(mark, null, land);
        } else mark();
        fr.tally.forEach((v, i) => F.rn.num(c, s.t[i], v, land));
        if (fr.hit >= 0) F.rn.pulse(c, s.rows[fr.hit], land);
      },
      frames,
    });
  };

  /** One-point then two-point crossover on bit strings. Drag the cut marker; the run recomputes. */
  N.runners.crossover = function crossoverRun(box, life) {
    const F = N.fig,
      LEN = 8,
      P1 = [1, 0, 1, 1, 0, 1, 1, 0],
      P2 = P1.map((b) => 1 - b),
      TWO = [2, 6];
    const X0 = 96,
      CW = 38,
      Y = { p1: 34, p2: 80, c1: 150, c2: 196 };
    let cut = 5;
    const str = (a) => a.join("");
    const cross = (cuts) => {
      const m = [];
      let side = 0;
      for (let i = 0; i < LEN; i++) {
        if (cuts.includes(i)) side = 1 - side;
        m.push(side);
      }
      return m;
    };
    const kid = (m, first) =>
      m.map((s, i) => {
        const src = first ? s : 1 - s;
        return { v: src ? P2[i] : P1[i], src };
      });
    function* frames() {
      const m1 = cross([cut]),
        c1 = kid(m1, true),
        c2 = kid(m1, false);
      const near = cut < LEN - 1 ? cut + 1 : cut - 1,
        alt = kid(cross([near]), true);
      const opts = [str(c1.map((g) => g.v)), str(c2.map((g) => g.v)), str(alt.map((g) => g.v))];
      const order = [
          [0, 1, 2],
          [1, 0, 2],
          [2, 1, 0],
          [1, 2, 0],
          [2, 0, 1],
        ][cut % 5].map((k) => opts[k]),
        ok = order.indexOf(opts[0]);
      const snap = (x) => ({ cuts: [cut], k1: null, k2: null, opts: null, ok: -1, ...x });
      yield snap({ cap: "Two parents with 8 genes each. Drag the red <b>cut</b> marker to move it.", line: 0 });
      yield snap({
        opts: order,
        cap: `One-point crossover: cut after gene <b>${cut}</b>. Which option is child 1?`,
        line: 0,
      });
      yield snap({
        opts: order,
        ok,
        k1: c1,
        cap: `Child 1 = parent 1 before the cut + parent 2 after it: <b>${opts[0]}</b>.`,
        line: 1,
        mood: "happy",
        ask: {
          q: "What is child 1? Tap an option.",
          pick: ".rn-x-opt",
          a: String(ok),
          why: `Child 1 keeps parent 1's first ${cut} genes and takes parent 2's last ${LEN - cut}: <b>${opts[0]}</b>.`,
        },
      });
      yield snap({
        k1: c1,
        k2: c2,
        cap: `Child 2 is the opposite: parent 2 before the cut + parent 1 after it: <b>${opts[1]}</b>.`,
        line: 2,
      });
      const m2 = cross(TWO),
        t1 = kid(m2, true),
        t2 = kid(m2, false);
      yield snap({
        cuts: TWO,
        cap: `Two-point crossover: cuts after genes <b>${TWO[0]}</b> and <b>${TWO[1]}</b>.`,
        line: 3,
      });
      yield snap({
        cuts: TWO,
        k1: t1,
        k2: t2,
        cap: `The outsides stay and the middle ${TWO[1] - TWO[0]} genes swap: child 1 = <b>${str(t1.map((g) => g.v))}</b>, child 2 = <b>${str(t2.map((g) => g.v))}</b>.`,
        line: 4,
      });
      yield snap({
        cuts: TWO,
        k1: t1,
        k2: t2,
        cap: "Crossover only <b>mixes</b> genes the parents already have. New values come from mutation.",
        mood: "love",
      });
    }
    F.run(box, life, {
      code: [
        "pick a cut c between two genes",
        "child 1 = parent 1[before c] + parent 2[after c]",
        "child 2 = parent 2[before c] + parent 1[after c]",
        "two-point: pick two cuts a < b",
        "swap the middle segment between a and b",
      ],
      build(stage, api) {
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("viewBox", "0 0 420 290");
        svg.setAttribute("class", "fig rn-svg rn-x");
        const genes = (key, arr) =>
          arr
            .map(
              (v, i) =>
                `<g transform="translate(${X0 + i * CW + 3} ${Y[key]})"><g class="rn-x-g ${key}" data-i="${i}"><rect width="${CW - 6}" height="32" rx="8"/><text x="${(CW - 6) / 2}" y="22">${v}</text></g></g>`,
            )
            .join("");
        const marker = (k) =>
          `<g class="rn-x-mk" data-m="${k}"><g class="rn-x-mv"><rect class="rn-x-hit" x="-14" y="2" width="28" height="238"/><line x1="0" x2="0" y1="22" y2="238"/><circle cx="0" cy="12" r="10"/><text y="16">↔</text></g></g>`;
        svg.innerHTML = `${[
          ["p1", "Parent 1"],
          ["p2", "Parent 2"],
          ["c1", "Child 1"],
          ["c2", "Child 2"],
        ]
          .map(([k, t]) => `<text class="rn-x-lbl" x="6" y="${Y[k] + 21}">${t}</text>`)
          .join("")}
          ${genes("p1", P1)}${genes("p2", P2)}${genes("c1", P1)}${genes("c2", P1)}
          ${marker(1)}${marker(0)}
          <g class="rn-x-opts">${[0, 1, 2].map((j) => `<g transform="translate(${34 + j * 128} 250)"><g class="rn-x-opt" data-k="${j}"><rect width="118" height="32" rx="10"/><text x="59" y="21"></text></g></g>`).join("")}</g>`;
        stage.appendChild(svg);
        const q = (s) => [...svg.querySelectorAll(s)];
        const sc = {
          svg,
          c1: q(".rn-x-g.c1"),
          c2: q(".rn-x-g.c2"),
          mk: q(".rn-x-mk").sort((a, b) => a.dataset.m - b.dataset.m),
          opts: q(".rn-x-opt"),
          optBox: svg.querySelector(".rn-x-opts"),
        };
        const m0 = sc.mk[0],
          mv0 = m0.querySelector(".rn-x-mv");
        api.drag(m0, {
          move(x) {
            const k = Math.max(1, Math.min(LEN - 1, Math.round((x - X0) / CW)));
            if (k !== cut) {
              cut = k;
              setX(mv0, X0 + k * CW);
              N.sfx && N.sfx.play("tick");
            }
          },
          end() {
            api.recompute(`Cut after gene ${cut}. Replaying from the start.`);
          },
        });
        return sc;
      },
      draw(s, f, c) {
        const g = window.gsap;
        s.mk.forEach((m, k) => {
          const on = k < f.cuts.length;
          m.style.visibility = on ? "visible" : "hidden";
          if (on) {
            const x = X0 + f.cuts[k] * CW,
              mv = m.querySelector(".rn-x-mv");
            if (g) F.rn.to(c, mv, { x }, 0, 0.35);
            else setX(mv, x);
          }
        });
        [
          ["c1", "k1"],
          ["c2", "k2"],
        ].forEach(([row, key]) => {
          const arr = f[key],
            was = c.prev && c.prev[key];
          s[row].forEach((el, i) => {
            const gn = arr && arr[i];
            el.style.visibility = gn ? "visible" : "hidden";
            if (!gn) return;
            el.classList.toggle("rn-x-a", gn.src === 0);
            el.classList.toggle("rn-x-b", gn.src === 1);
            el.querySelector("text").textContent = gn.v;
            const same = was && was[i] && was[i].src === gn.src && was[i].v === gn.v;
            if (!same && !c.instant && g) {
              // each gene drops down from the parent it came from
              g.set(el, { y: Y[gn.src ? "p2" : "p1"] - Y[row], opacity: 0.35 });
              F.rn.to(c, el, { y: 0, opacity: 1 }, 0.05 + i * 0.05, 0.5);
            } else F.rn.to(c, el, { y: 0, opacity: 1 }, 0, 0.01);
          });
        });
        s.optBox.style.visibility = f.opts ? "visible" : "hidden";
        s.opts.forEach((o, j) => {
          if (f.opts) o.querySelector("text").textContent = f.opts[j];
          o.classList.toggle("rn-x-ok", f.ok === j);
          o.classList.toggle("rn-x-off", f.ok >= 0 && f.ok !== j);
        });
        if (f.ok >= 0 && !(c.prev && c.prev.ok === f.ok)) F.rn.pulse(c, s.opts[f.ok], 0.5);
      },
      frames,
    });
  };
  Object.assign(partScope, { SEL });
})();
