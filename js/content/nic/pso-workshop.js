/* pso-workshop: Lecture 12: 12.5 binary PSO and the summary (two bit-string approaches), then the 12.W workshop (PSO lab, no code). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL12;
  const { C, pr, mulberry } = sh;

  // ---------- 12.5 binary PSO ----------
  const GAIN = [5, -2, 4, -3, 6, 1, -4, 3];
  const BEST = GAIN.filter((g) => g > 0).reduce((a, b) => a + b, 0);
  const bitFit = (b) => b.reduce((a, x, j) => a + x * GAIN[j], 0);
  function newBits(seed, n) {
    const r = mulberry(seed);
    const P = Array.from({ length: n }, () => {
      const x = GAIN.map(() => (r() < 0.5 ? 1 : 0));
      return { x, v: GAIN.map(() => r()), p: x.slice(), pf: bitFit(x) };
    });
    const b = P.reduce((a, q) => (q.pf > a.pf ? q : a));
    return { r, P, g: { x: b.p.slice(), f: b.pf }, it: 0 };
  }
  /** Approach 1: the continuous update rule, then x = 1 when rand() < v. v is held inside 0..1 so it can be read as a probability. */
  function bitStep(S, c1, c2) {
    S.P.forEach((q) =>
      GAIN.forEach((_, j) => {
        q.v[j] = sh.clamp(q.v[j] + c1 * S.r() * (q.p[j] - q.x[j]) + c2 * S.r() * (S.g.x[j] - q.x[j]), 0, 1);
        q.x[j] = S.r() < q.v[j] ? 1 : 0;
      }),
    );
    S.P.forEach((q) => {
      const f = bitFit(q.x);
      if (f > q.pf) ((q.pf = f), (q.p = q.x.slice()));
      if (q.pf > S.g.f) S.g = { x: q.p.slice(), f: q.pf };
    });
    S.it++;
  }
  const bit = (b, o = {}) =>
    `<span class="nw12-bit${b ? " on" : ""}${o.diff ? " diff" : ""}${o.src ? " s" + o.src : ""}">${o.txt ?? b}${o.sub !== undefined ? `<small>${o.sub}</small>` : ""}</span>`;
  const bitsRow = (name, bits, diff = []) =>
    `<div class="nw12-brow"><b>${name}</b>${bits.map((b, j) => bit(b, { diff: diff[j] })).join("")}</div>`;
  function bitDemo(root, life) {
    let seed = 3,
      S = newBits(seed, 8),
      running = false;
    const P = { c1: 1, c2: 1 };
    const card =
      el(`<div class="card nw12-demo"><div class="card-head"><h2>Binary swarm: which sensors to switch on?</h2></div><div class="controls" data-ctl></div>
      <div class="controls"><button class="btn primary" data-a="step">Step</button><button class="btn" data-a="run">Run</button><button class="btn ghost" data-a="reset">Reset</button></div>
      <div data-tb class="nw12-bits"></div><p class="nw12-legend">Each cell shows the bit, with its <b>velocity</b> (the chance of a 1 next step) underneath.</p><div class="nw12-stats" data-st></div></div>`);
    root.appendChild(card);
    ["c1", "c2"].forEach((k) => {
      const s = N.slider(k === "c1" ? "c₁" : "c₂", 0, 3, 0.5, P[k]);
      s.onInput((v) => (P[k] = v));
      qs("[data-ctl]", card).append(s);
    });
    const draw = () => {
      const cnt = S.P.filter((q) => q.pf === BEST).length;
      qs("[data-tb]", card).innerHTML =
        `<div class="nw12-brow"><b>Gain of each sensor</b>${GAIN.map((g) => bit(g > 0 ? 1 : 0, { txt: g > 0 ? "+" + g : g, src: g > 0 ? 2 : 0 })).join("")}</div>` +
        `<div class="nw12-brow g"><b>Best (g) = ${S.g.f}</b>${S.g.x.map((b) => bit(b)).join("")}</div>` +
        S.P.map(
          (q, i) =>
            `<div class="nw12-brow"><b>Particle ${i + 1}: ${bitFit(q.x)}</b>${q.x.map((b, j) => bit(b, { sub: q.v[j].toFixed(2).slice(1) })).join("")}</div>`,
        ).join("");
      qs("[data-st]", card).innerHTML =
        `<div class="wk-stat"><small>Iteration</small><b>${S.it}</b></div><div class="wk-stat teal"><small>Best fitness</small><b>${S.g.f} of ${BEST}</b></div><div class="wk-stat blue"><small>Particles on the best</small><b>${cnt} of ${S.P.length}</b></div>`;
    };
    const bt = (a) => qs(`[data-a="${a}"]`, card);
    bt("step").onclick = () => (bitStep(S, P.c1, P.c2), draw());
    bt("reset").onclick = () => ((S = newBits(++seed, 8)), draw());
    bt("run").onclick = () => {
      running = !running;
      bt("run").textContent = running ? "Pause" : "Run";
    };
    life.interval(() => running && (bitStep(S, P.c1, P.c2), draw()), 450);
    draw();
  }
  /** Approach 1, one bit: a live sampler. A slider sets v, "Draw 20 bits" applies x = 1 if rand() < v. */
  function sampler(box, life) {
    const r = mulberry(21);
    let v = 0.7;
    box.innerHTML = `<div class="controls" data-c></div><div class="nw12-prob"><i style="width:70%"></i><b style="left:70%">v</b></div><div class="nw12-brow" data-o></div><p class="nw12-note" data-n aria-live="polite">Press Draw 20 bits.</p>`;
    const s = N.slider("Velocity v", 0, 1, 0.05, v, (x) => x.toFixed(2));
    s.onInput((x) => {
      v = x;
      qs(".nw12-prob i", box).style.width = x * 100 + "%";
      qs(".nw12-prob b", box).style.left = x * 100 + "%";
    });
    const b = el(`<button class="btn primary">Draw 20 bits</button>`);
    b.onclick = () => {
      const d = Array.from({ length: 20 }, () => (r() < v ? 1 : 0));
      qs("[data-o]", box).innerHTML = d.map((x) => bit(x)).join("");
      qs("[data-n]", box).textContent =
        `${d.filter(Boolean).length} of 20 bits came out as 1, with v = ${v.toFixed(2)}.`;
    };
    qs("[data-c]", box).append(s, b);
  }
  const probFig = () => {
    const bar = (v, y, t, drawn) =>
      `<text x="8" y="${y + 15}" class="nw12-lab2" style="fill:var(--text)">${t}</text><rect x="120" y="${y}" width="260" height="22" rx="6" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="2"/><rect x="120" y="${y}" width="${260 * v}" height="22" rx="6" fill="var(--teal)" fill-opacity=".55"/><text x="${124 + 260 * v}" y="${y + 38}" class="nw12-lab2" style="fill:var(--text)">v = ${v}</text>${drawn ? `<line x1="${120 + 260 * drawn}" y1="${y - 6}" x2="${120 + 260 * drawn}" y2="${y + 28}" stroke="var(--rose)" stroke-width="4"/><text x="${120 + 260 * drawn}" y="${y - 10}" text-anchor="middle" class="nw12-lab2" style="fill:var(--rose-ink)">rand() = ${drawn}</text>` : ""}`;
    return `<svg class="fig" viewBox="0 0 400 170" style="max-height:190px" role="img" aria-label="Two probability bars from 0 to 1. Before the update v is 0.5. After the update v is 0.8, and a random draw of 0.55 falls inside the bar, so the bit becomes 1.">${bar(0.5, 22, "before", 0)}${bar(0.8, 108, "after", 0.55)}</svg>`;
  };
  const CPOS = [0, 1, 0, 1, 1, 0, 1, 0],
    GBEST = [1, 1, 0, 0, 1, 1, 0, 1],
    PBEST = [0, 1, 1, 1, 1, 1, 0, 0];
  const ham = (a, b) => a.reduce((s, x, j) => s + (x !== b[j] ? 1 : 0), 0);
  const SRC = [CPOS, GBEST, PBEST];
  /** Approach 2: no velocity. A mask picks, for each position, which of the three strings to copy (1 current, 2 gbest, 3 pbest). */
  function recombFig(box, life, o = {}) {
    const r = mulberry(33),
      W = { cur: o.cur ?? 2, c1: o.c1 ?? 1, c2: o.c2 ?? 2 };
    let mask = o.mask || null;
    box.innerHTML = `<div class="controls" data-c></div><div data-t></div>`;
    const draw = () => {
      const nw = mask ? mask.map((m, j) => SRC[m - 1][j]) : null;
      qs("[data-t]", box).innerHTML =
        bitsRow("Current position", CPOS) +
        bitsRow("Global best", GBEST) +
        bitsRow("Personal best", PBEST) +
        `<div class="nw12-brow"><b>Mask</b>${mask ? mask.map((m) => bit(1, { txt: m, src: m })).join("") : '<span class="dim">draw a mask</span>'}</div>` +
        `<div class="nw12-brow g"><b>New position</b>${nw ? nw.map((b) => bit(b)).join("") : ""}</div>` +
        `<p class="nw12-note">${nw ? `The new position differs from the global best in <b>${ham(nw, GBEST)}</b> bits (the current one differs in ${ham(CPOS, GBEST)}) and from the personal best in <b>${ham(nw, PBEST)}</b> (was ${ham(CPOS, PBEST)}).` : "Mask 1 copies the current bit, 2 the global best, 3 the personal best."}</p>`;
    };
    const draws = () => {
      const t = W.cur + W.c1 + W.c2 || 1;
      mask = CPOS.map(() => {
        const u = r() * t;
        return u < W.cur ? 1 : u < W.cur + W.c2 ? 2 : 3;
      });
      draw();
      const nw = mask.map((m, j) => SRC[m - 1][j]);
      if (o.onDraw) o.onDraw({ mask, nw, dG: ham(nw, GBEST), dG0: ham(CPOS, GBEST) });
    };
    if (o.live) {
      [
        ["cur", "Keep current"],
        ["c1", "c₁: personal best"],
        ["c2", "c₂: global best"],
      ].forEach(([k, t]) => {
        const s = N.slider(t, 0, 5, 1, W[k]);
        s.onInput((v) => (W[k] = v));
        qs("[data-c]", box).append(s);
      });
      const b = el(`<button class="btn primary">Draw a mask</button>`);
      b.onclick = draws;
      qs("[data-c]", box).append(b);
    }
    draw();
  }
  Object.assign(sh, { recombFig, ham });
  const hammingFig = () =>
    `<div>${bitsRow(
      "Current",
      CPOS,
      CPOS.map((b, j) => b !== GBEST[j]),
    )}${bitsRow("Global best", GBEST)}<p class="nw12-note">Marked positions: <b>${ham(CPOS, GBEST)}</b> differ.</p></div>`;

  N.register({
    id: "l12-binary",
    lecture: 12,
    order: 5,
    num: "12.5",
    title: "Binary PSO and the summary",
    blurb:
      "Bits cannot take a real velocity. Two ways round it: velocity as a probability, or recombining three strings.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A bit is 0 or 1, so adding a real velocity to it makes no sense. In <b>binary PSO</b> the velocity becomes the <b>chance of a 1</b>. Eight particles choose which of eight sensors to switch on: the gains are in the top row and the best string so far is just below.",
        ),
      );
      bitDemo(root, life);
      root.appendChild(
        pr(
          "l12-binary-1",
          "Press <b>Run</b> until the best fitness stops changing. Which sensors are on in the best string? | Exactly the ones with a positive gain | Exactly the ones with a negative gain | A random set that changes every step | The fitness adds up the gains of the sensors that are on, so the best string switches on every positive-gain sensor and none of the others.",
        ),
      );
      root.appendChild(
        pr(
          "l12-binary-2",
          "A cell shows a bit with velocity .90 under it. What does .90 mean? | At the next step the bit becomes 1 with probability 0.9 | The bit is 90% likely to stay exactly as it was before | The particle has reached 90% of the best possible fitness | In basic binary PSO the next bit is 1 if a random number is below v. So v = 0.9 is a 90% chance of a 1.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "PSO needs a real vector, but can be modified for <b>discrete</b> spaces such as binary strings.",
            "<b>Approach 1</b> (traditional BPSO): keep the continuous velocity rule, then set a bit to 1 if $\\text{rand()} < v$.",
            "<b>Approach 2</b> (geometric BPSO): no velocity. Move towards pbest and gbest by recombining strings in Hamming space.",
            "Stigmergy drives ACO; <b>gbest and pbest</b> drive PSO. Both are swarm algorithms built from simple individuals.",
          ],
          "Make a bit follow the swarm by probability or by copying.",
        ),
      );
    },
  });

  L["l12-binary"] = {
    sum: "Binary PSO: interpret the velocity as the probability of a 1, or move in Hamming space by recombining current, personal-best and global-best strings. Summary of the swarm lectures.",
    steps: [
      {
        t: "Bits need a trick",
        b: `<p>PSO is generally a real-vector method, but it can be modified for discrete spaces such as <b>binary strings</b>. Here is a typical binary problem: eight sensors, each switched on (1) or off (0). Every sensor has a <b>gain</b> (benefit minus cost). The fitness of a string is the sum of the gains of the sensors that are on.</p><p>For example, the string $(1,0,1,0,0,0,0,0)$ switches on the first and third sensors, so its fitness is $5 + 4 = 9$.</p>`,
        v: F.cells(
          GAIN.map((g, j) => ({ v: g > 0 ? `+${g}` : g, c: g > 0 ? "teal" : "rose", sub: `s${j + 1}` })),
          { label: "Gain of each sensor", size: 40 },
        ),
        c: C(
          "Sensors have gains +5, −2, +4 and −3. The string (1, 1, 0, 0) switches on the first two. What is its fitness? | 3 | 7 | 9 | The sum of the gains of the sensors that are on: 5 + (−2) = 3.",
        ),
      },
      {
        t: "Approach 1: velocity as a probability",
        b: `<p>In <b>traditional BPSO</b> the velocity stays continuous and uses the <b>original update rule</b>. Only the position changes: bit $j$ of particle $i$ becomes 1 if a random number is below $v$, and 0 otherwise. A velocity of $0.7$ means a 70% chance of a 1.</p><p>Slide the velocity, then draw 20 bits and see how many come out as 1.</p><details class="math-more"><summary>Show the maths</summary>$$x_{ij}^{t+1}=\\begin{cases}1 & \\text{if } \\text{rand()}<v_{ij}^{t}\\\\ 0 & \\text{otherwise}\\end{cases}$$<p>For $v$ to be read as a probability it must lie between 0 and 1. The demo keeps it in that range; a common alternative squashes it with the logistic function $1/(1+e^{-v})$.</p></details>`,
        v: (box, life) => sampler(box, life),
        c: C(
          "A bit has velocity 0.2. About how often will it be 1 over many steps? | 20% of the time | 80% of the time | Never | The velocity is the probability of a 1, so v = 0.2 gives about 1 bit in 5.",
        ),
      },
      {
        t: "One bit, one update",
        b: `<p>Take one bit that is 0 now, with velocity $0.5$. Its personal best bit and the swarm's best bit are both 1. With $c_1 = c_2 = 1$ and $z_1 = 0.2$, $z_2 = 0.1$: the pulls add $0.2$ and $0.1$, so the new velocity is $0.8$.</p><p>Then draw a random number. If it is $0.55$, that is below $0.8$, so the bit becomes <b>1</b>.</p><details class="math-more"><summary>Show the maths</summary>$$v^{t+1}=0.5+(1)(0.2)(1-0)+(1)(0.1)(1-0)=0.8$$<p>The gaps $p-x$ and $g-x$ are 1 here because the best bits are 1 and the current bit is 0.</p></details>`,
        v: probFig(),
        c: C(
          "A bit has velocity 0.8 and the random draw is 0.9. What is the new bit? | 0, because 0.9 is not below 0.8 | 1, because a velocity of 0.8 is a large number | 1, because the random draw of 0.9 is a large number | The rule is: 1 only if rand() < v. 0.9 is not below 0.8, so the bit becomes 0.",
        ),
      },
      {
        t: "Approach 2: move in Hamming space",
        b: `<p><b>Geometric BPSO</b> drops the velocity. Positions move towards the personal best and the global best, in proportion to $c_1$ and $c_2$. For bit strings, 'closer' means a smaller <b>Hamming distance</b>: the number of positions where two strings differ.</p><p>Below, the current string differs from the global best in 5 positions (marked), so it is 5 steps away.</p>`,
        v: hammingFig(),
        c: C(
          "Two bit strings are 01101 and 00111. What is their Hamming distance? | 2 | 1 | 3 | They differ in the second and fourth positions: 1 versus 0 and 0 versus 1, so 2.",
          "Compare position by position: 0 and 0, 1 and 0, 1 and 1, 0 and 1, 1 and 1.",
        ),
      },
      {
        t: "Recombine three strings",
        b: `<p>In Hamming space, moving towards the bests is a <b>multi-string recombination</b>. A random <b>mask</b> says where each new bit is copied from: mask 1 is the <b>current</b> string, 2 is the <b>global best</b>, 3 is the <b>personal best</b>. The more weight on $c_2$, the more 2s in the mask.</p><p>Set the weights and draw a mask. The new string ends up closer to the bests than the current one.</p>`,
        v: (box, life) => recombFig(box, life, { live: true }),
        c: C(
          "A mask reads 1 2 3 2. Which bit of the new string comes from the personal best? | The third | The first | The second and fourth | Mask value 3 means copy from the personal best, and that is in the third position.",
        ),
      },
      {
        t: "Which approach?",
        b: `<p>Both give particles that drift towards good strings. <b>Approach 1</b> keeps the continuous update and reads the velocity as a chance. <b>Approach 2</b> never builds a velocity at all, and works directly on the strings.</p>`,
        v: F.compare(
          {
            title: "Approach 1: velocity as probability",
            c: "blue",
            body: "velocity stays real<br>the original update rule<br>bit = 1 if rand() &lt; v",
          },
          {
            title: "Approach 2: geometric",
            c: "violet",
            body: "no explicit velocity<br>move towards pbest and gbest<br>multi-string recombination",
          },
        ),
        c: C(
          "Which approach has no explicit velocity? | Geometric BPSO, which recombines strings | Traditional BPSO, which uses velocity as a probability | Both of them | Geometric BPSO moves particles directly towards the personal and global best, in proportion to c₁ and c₂.",
        ),
      },
      {
        t: "Summary: how swarms talk",
        b: `<p>PSO is loosely based on swarming. It has a simple formula for the velocities, an intuitive set of parameters, and can be modified for discrete spaces and <b>dynamic optimisation problems</b>. More widely: collectives of simple individuals can create intelligent search behaviour, and the way they communicate varies.</p>`,
        v: F.compare(
          {
            title: "Ant colony optimisation",
            c: "amber",
            body: "communicate by stigmergy:<br>pheromone left on the trail",
          },
          {
            title: "Particle swarm optimisation",
            c: "teal",
            body: "communicate by remembered positions:<br>pbest and gbest/lbest",
          },
        ),
        c: C(
          "How do the particles of PSO share what they know? | Through the best positions found: pbest and gbest/lbest | By leaving a pheromone trail on the ground that evaporates over time | By each particle matching the velocity of its nearest neighbour | In ACO the medium is pheromone (stigmergy). In PSO it is the stored best positions.",
        ),
      },
    ],
    guide: [
      "Press <b>Step</b> and watch the bits change, with each cell's velocity underneath.",
      "Press <b>Run</b> until the best fitness stops changing, then press <b>Reset</b> to try a new swarm.",
      "Slide <b>c₁</b> and <b>c₂</b> and compare how quickly the best fitness is reached.",
      "Answer the questions after the demo.",
    ],
  };

  // ---------- 12.W workshop: the PSO lab ----------
  const { swarmDemo, odour } = sh;
  const DECOY = [2.4, 2.8];
  /** Mission checks, run after every Step, Run tick and Reset. */
  function checkSwarm(api, S) {
    const t = S.hist[S.hist.length - 1];
    if (!t) return;
    if (odour(S.g.f) >= 97) api.done("food");
    const d = Math.hypot(S.g.x[0] - DECOY[0], S.g.x[1] - DECOY[1]);
    if (S.it >= 10 && d < 1.5 && odour(S.g.f) < 85 && t.rad < 0.3) {
      api.done("decoy");
      api.say(
        "The whole swarm has gathered on the broad, dim hill. Everyone trusts the swarm's best, and it is not the best place.",
        "surprised",
      );
    }
    if (S.stale >= 8 && odour(S.g.f) < 90) {
      api.done("stall");
      api.say(
        "Eight iterations without a new best, yet the odour is poor. A stopping rule only sees the numbers, not the food.",
      );
    }
    if (S.it >= 5 && t.rad < 0.05) api.done("settle");
  }
  function build(stage, api, life) {
    swarmDemo(stage, life, {
      title: "Swarm lab",
      controls: ["n", "c1", "c2", "w"],
      rules: true,
      seed: 14,
      params: { n: 14, c1: 2, c2: 2, w: 1 },
      onStep: (S) => checkSwarm(api, S),
    });
    const card = el(
      `<div class="card nw12-demo"><div class="card-head"><h2>Bit strings: copy from the bests</h2></div><div data-box></div></div>`,
    );
    stage.appendChild(card);
    recombFig(qs("[data-box]", card), life, {
      live: true,
      onDraw: (r) => {
        if (r.dG <= 1) {
          api.done("mask");
          api.say(
            `The new string is only ${r.dG} bit${r.dG === 1 ? "" : "s"} from the global best. The weights act like probabilities of copying.`,
          );
        }
      },
    });
  }

  N.register({
    id: "l12-wlab",
    lecture: 12,
    order: 90,
    num: "12.W",
    workshop: true,
    title: "Workshop: PSO lab",
    blurb: "No code. Find the food, fall for the decoy, stall the swarm, settle it, then recombine bit strings.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "A swarm on a scent map with <b>one narrow food peak</b> and a <b>broad dim decoy</b> hill. Press <b>Run</b> and read the stats and the stopping-rule board.",
        missions: [
          {
            id: "food",
            t: "Find the food",
            d: "Get <b>Best odour</b> to 97 or more.",
            hint: "Press <b>Run</b>. If the swarm settles on a dimmer patch, press <b>Reset</b> and go again, or raise <b>Swarm size</b>.",
          },
          {
            id: "decoy",
            t: "Fall for the decoy",
            d: "Make the swarm settle on the broad dim hill instead: after 10 or more iterations, <b>Best odour</b> below 85 with <b>Swarm spread</b> under 30%.",
            hint: "Set <b>c₁</b> to 0, make <b>c₂</b> large, use a small <b>Swarm size</b> and set <b>Momentum kept</b> to about 0.7. <b>Run</b>, and <b>Reset</b> if you miss.",
          },
          {
            id: "stall",
            t: "Stopped too soon",
            d: "Reach a moment when <b>No new best for</b> shows 8 or more while <b>Best odour</b> is still below 90.",
            hint: "Run until the best stops moving. If it reached 90 or more, <b>Reset</b>: a swarm often stalls on the dimmer hill.",
          },
          {
            id: "settle",
            t: "Settle the swarm",
            d: "Get <b>Swarm spread</b> under 5%, after at least 5 iterations.",
            hint: "The plain formula never slows the particles. Set <b>Momentum kept</b> to about 0.6, then <b>Run</b> for 30 or so iterations.",
          },
          {
            id: "mask",
            t: "Copy from the global best",
            d: "In the bit-string card, draw a mask that gives a new string within 1 bit of the global best.",
            hint: "Set <b>Keep current</b> to 0, <b>c₁</b> to 0 and <b>c₂</b> to 5, then press <b>Draw a mask</b>.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l12-wlab-1",
          "In the lab you set c₁ = 0 and c₂ large. What drives each particle? | Only the pull to the swarm's best position | Only the pull to its own best position | Only the velocity it was given when the run began | With c₁ = 0 the personal term vanishes. Every particle is pulled towards the one shared best, so the swarm can pile onto a poor hill.",
        ),
      );
      root.appendChild(
        pr(
          "l12-wlab-2",
          "The 'no improvement' rule fires while the best odour is poor. What does this show? | A stopping rule only sees the numbers, so it can end a run too early | The swarm has found the true optimum of the whole map | The fitness function must be broken or giving wrong scores | A flat best curve only means no new best was found for a while, which can happen on a decoy as well as at the peak.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>large c₂</b> relative to c₁ pulls everyone to the swarm's best: fast, but it can lock onto a <b>decoy</b>.",
            "A stopping rule only sees the numbers: <b>no improvement</b> can fire on a poor solution.",
            "A converged swarm has a <b>swarm radius</b> near zero, and that does not prove the answer is the best.",
            "For bit strings, mask weights act as <b>probabilities of copying</b> from each source string.",
          ],
          "Change one dial at a time and read what the stats say.",
        ),
      );
    },
  });

  L["l12-wlab"] = {
    sum: "Tune a 2-D particle swarm on a map with a food peak and a decoy, watch the stopping rules, and recombine bit strings.",
    steps: [
      {
        t: "The lab",
        b: `<p>The first card is a swarm on a scent map. Set <b>Swarm size</b>, <b>c₁</b>, <b>c₂</b> and <b>Momentum kept</b>, then press <b>Step</b> or <b>Run</b>. The stat boxes give the best odour, the swarm spread and how long it has been since a new best. Under them the board shows which stopping rules would fire.</p><p>The second card works on bit strings: a mask copies each bit from the current, global-best or personal-best string.</p>`,
        v: F.flow(
          ["Set the dials", "Run the swarm", "Read best odour and swarm spread", { t: "Adjust one dial", c: "violet" }],
          { loop: true },
        ),
        c: C(
          "Which stat tells you how bunched up the particles are? | Swarm spread | Iteration | Best odour | The swarm spread is the normalised radius of the particles. The best odour is the fitness of the best position found.",
        ),
      },
      {
        t: "Decoys and stopping",
        b: `<p>The map has a narrow high peak and a broad low hill. A swarm that trusts the global best too much can settle on the broad hill and stay there. A rule such as <b>no improvement</b> would then stop the run on a poor answer.</p>`,
        v: F.compare(
          { title: "Pull to own best (c₁)", c: "violet", body: "keeps exploring<br>slower to agree" },
          { title: "Pull to swarm best (c₂)", c: "amber", body: "gathers fast<br>can lock onto a decoy" },
        ),
        c: C(
          "A swarm gathers fast on a poor hill. Which setting made it most likely? | A large c₂ with c₁ near 0 | A large c₁ with c₂ near 0 | Both pulls set to 0 | The global pull draws everyone to the best position found so far. If that early best is on a decoy, the swarm follows it.",
        ),
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
