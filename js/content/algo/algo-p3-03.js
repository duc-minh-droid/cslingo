(function () {
  const partScope = (NIC.shared.algoP3 = NIC.shared.algoP3 || {});
  const { BF, PHI } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  N.register({
    id: "a3-bracket",
    subject: "algo",
    lecture: 3,
    order: 3,
    num: "3.3",
    title: "Shrinking the bracket",
    blurb: "Golden-section search squeezes a guaranteed bracket around the minimum, with no derivatives needed.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let a = 0,
        b = 1,
        iter = 0,
        cut = null;
      const probes = () => ({ c: b - PHI * (b - a), d: a + PHI * (b - a) });
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="it">Iterate ▸</button><button class="btn" id="auto">Run to width &lt; 0.01</button><button class="btn ghost" id="rs">Reset</button></div>
        <div class="fig-wrap" id="plot"></div>
        <div class="stat-row"><div class="stat violet"><small>Bracket</small><b id="br"></b></div><div class="stat amber"><small>Width</small><b id="wd"></b></div><div class="stat"><small>Iterations</small><b id="n">0</b></div><div class="stat teal"><small>Evaluations</small><b id="ev">2</b></div></div>
        <div class="mono dim" id="log"></div></div>`);
      root.appendChild(card);
      function draw() {
        const { c, d } = probes(),
          W = 620,
          H = 220,
          pad = 20;
        const X = (x) => pad + x * (W - 2 * pad);
        let lo = Infinity,
          hi = -Infinity;
        for (let i = 0; i <= 200; i++) {
          const v = BF(i / 200);
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
        const Y = (v) => H - 34 - ((v - lo) / (hi - lo)) * (H - 70);
        const curve = Array.from(
          { length: 201 },
          (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(BF(i / 200)).toFixed(1)}`,
        ).join(" ");
        const probe = (x, lbl, better) =>
          `<line x1="${X(x)}" y1="${Y(BF(x))}" x2="${X(x)}" y2="${H - 30}" stroke="var(--violet)" stroke-dasharray="3 3"/><circle cx="${X(x)}" cy="${Y(BF(x))}" r="6" fill="${better ? "var(--teal)" : "var(--violet)"}"/><text x="${X(x)}" y="${Y(BF(x)) - 12}" class="fig-sub" style="fill:${better ? "var(--teal)" : "var(--violet)"}">${lbl}</text>`;
        const cutRect = cut
          ? `<rect x="${X(cut[0])}" y="14" width="${X(cut[1]) - X(cut[0])}" height="${H - 44}" fill="var(--rose-dim)" class="fi"/><text x="${(X(cut[0]) + X(cut[1])) / 2}" y="28" class="fig-sub" style="fill:var(--rose)">discarded</text>`
          : "";
        qs("#plot", card).innerHTML =
          `<svg class="fig" viewBox="0 0 ${W} ${H}">${cutRect}<rect x="${X(a)}" y="${H - 22}" width="${Math.max(2, X(b) - X(a))}" height="10" rx="5" fill="var(--violet)" opacity=".55"/><text x="${X(a)}" y="${H - 2}" class="fig-sub">a</text><text x="${X(b)}" y="${H - 2}" class="fig-sub">b</text><path d="${curve}" fill="none" stroke="var(--teal)" stroke-width="2.5"/>${probe(c, "f(c)", BF(c) < BF(d))}${probe(d, "f(d)", BF(d) <= BF(c))}<text x="${X(0.62)}" y="${Y(BF(0.62)) + 20}" class="fig-sub" style="fill:var(--amber)">★</text></svg>`;
        N.fx.play(qs("#plot", card));
        qs("#br", card).textContent = `[${a.toFixed(3)}, ${b.toFixed(3)}]`;
        qs("#wd", card).textContent = (b - a).toFixed(3);
        qs("#n", card).textContent = iter;
        qs("#ev", card).textContent = iter + 2;
        qs("#log", card).textContent =
          `f(c) = ${BF(c).toFixed(4)}   f(d) = ${BF(d).toFixed(4)}   → ${BF(c) < BF(d) ? "f(c) smaller: next cut is [d, b]" : "f(d) smaller: next cut is [a, c]"}`;
      }
      const step = () => {
        const { c, d } = probes();
        if (BF(c) < BF(d)) {
          cut = [d, b];
          b = d;
        } else {
          cut = [a, c];
          a = c;
        }
        iter++;
      };
      qs("#it", card).onclick = () => {
        step();
        draw();
      };
      qs("#auto", card).onclick = () => {
        let k = 0;
        const t = life.interval(() => {
          if (b - a < 0.01 || k++ > 30) return t();
          step();
          draw();
        }, 280);
      };
      qs("#rs", card).onclick = () => {
        a = 0;
        b = 1;
        iter = 0;
        cut = null;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a3-br-1",
          q: "f(c) < f(d) at interior points c < d of a unimodal function. What is the new bracket?",
          opts: ["[a, d]", "[c, b]", "[a, c]"],
          a: 0,
          why: "f(c) < f(d) means the minimum is at or left of d, so keep [a, d] and discard [d, b]. c survives and becomes one of the next pair of probes.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A bracket guarantees the minimum is inside, so every cut is safe.",
            "Golden-section places probes so one is <b>reused</b>: one new evaluation per step, 0.618× shrink.",
            "Works without derivatives, even at a kink, but only in 1-D and only on a unimodal bracket.",
          ],
          "Two probes decide which end of the bracket goes. Repeat until it's small enough.",
        ),
      );
    },
  });

  /* ============ 3.4 Nelder–Mead ============ */
  // Softened Rosenbrock "banana" valley mapped onto [0,1]²: minimum at (0.8333, 0.6), value 0.
  const ROS = (x, y) => {
    const u = -1.5 + 3 * x,
      v = -0.5 + 2.5 * y;
    return (1 - u) ** 2 + 5 * (v - u * u) ** 2;
  };
  const MIN = [0.8333, 0.6];
  L["a3-nm"] = {
    sum: "Nelder–Mead finds a minimum using only comparisons. A triangle crawls downhill: it keeps flipping its <b>worst</b> corner to the other side, stretching when that works and shrinking when it doesn't.",
    steps: [
      {
        t: "A triangle, not a point",
        b: `<p>In 2-D, Nelder–Mead keeps 3 points: a triangle, called a <b>simplex</b>. Each corner has a function value. Sort them: <b style="color:var(--teal)">best</b>, <b style="color:var(--amber)">middle</b>, <b style="color:var(--rose)">worst</b>.</p><p>Every move is about getting rid of the worst corner.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 180" style="max-height:180px"><polygon points="90,140 250,150 150,40" fill="rgba(206,130,255,.14)" stroke="var(--violet)" stroke-width="2" class="fi"/><circle cx="90" cy="140" r="8" fill="var(--teal)" class="fi"/><text x="90" y="166" class="fig-sub" style="fill:var(--teal)">best</text><circle cx="250" cy="150" r="8" fill="var(--amber)" class="fi"/><text x="250" y="174" class="fig-sub" style="fill:var(--amber)">middle</text><circle cx="150" cy="40" r="8" fill="var(--rose)" class="fi"/><text x="150" y="24" class="fig-sub" style="fill:var(--rose)">worst</text><text x="340" y="96" class="fig-sub">downhill →</text></svg>`,
      },
      {
        t: "Reflect the worst corner",
        b: `<p>Flip the worst corner through the midpoint of the other two, like folding the triangle over. Then compare the new point:</p>`,
        v: F.frames([
          {
            t: "<b>Reflect</b>: new point is decent, so keep it",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,70 110,75 60,15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3"/><polygon points="20,70 110,75 70,130" fill="rgba(88,204,2,.15)" stroke="var(--teal)" transform="translate(0,-40)"/></svg>`,
          },
          {
            t: "<b>Expand</b>: it's the best yet, so go even further",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,40 110,45 60,-15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3" transform="translate(0,30)"/><line x1="60" y1="15" x2="80" y2="88" stroke="var(--teal)" stroke-width="2" class="draw"/><circle cx="80" cy="85" r="5" fill="var(--teal)"/></svg>`,
          },
          {
            t: "<b>Contract</b>: it's still bad, so pull back halfway",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,70 110,75 60,15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3"/><circle cx="62" cy="45" r="5" fill="var(--amber)"/><line x1="60" y1="15" x2="62" y2="45" stroke="var(--amber)" stroke-width="2" class="draw"/></svg>`,
          },
          {
            t: "<b>Shrink</b>: nothing works, so squash toward the best",
            v: `<svg class="fig" viewBox="0 0 160 90"><polygon points="20,70 110,75 60,15" fill="none" stroke="var(--line-2)" stroke-dasharray="4 3"/><polygon points="20,70 65,72 40,42" fill="rgba(255,75,75,.15)" stroke="var(--rose)"/></svg>`,
          },
        ]),
        c: {
          q: "The reflected point is worse than all three corners. What does Nelder–Mead try next?",
          o: ["Expand further", "Contract", "Restart randomly"],
          a: 1,
          why: "An overshoot calls for a contraction. Only if that also fails does the whole triangle shrink.",
        },
      },
      {
        t: "The landscape in 3-D",
        b: `<p>This is the valley the triangle crawls through below: a curved "banana" (a softened <b>Rosenbrock</b> function). The floor bends, so steps of a fixed size would keep bumping into the walls. Nelder–Mead's triangle stretches along the valley instead.</p><p>Drag to rotate it.</p>`,
        v: (box, life) => {
          F.surface3d(box, life, {
            f: (x, y) => Math.log(1 + ROS(x, y)),
            height: 260,
            points: [{ x: MIN[0], y: MIN[1], c: "#ff9600", label: "minimum" }],
          });
        },
      },
      {
        t: "Why it needs no gradient",
        b: `<p>Every decision is a comparison: <i>is this point better than that one?</i> There are no derivatives anywhere. So it works on noisy or non-smooth functions where gradient methods can't even start.</p><span class="key">The trade-off is weak theory: it can stall, and it slows down in high dimensions.</span>`,
      },
    ],
    guide: [
      "Press <b>Step</b> and read the move name each time. The faint outline is the previous triangle.",
      "Press <b>Run</b>. The triangle stretches along the curved valley, then collapses onto the ★.",
      "Switch to the <b>3-D</b> view to see the path on the surface.",
    ],
  };
  Object.assign(partScope, { MIN, ROS });
})();
