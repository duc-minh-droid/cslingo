/* algo-p5-x-02: Phase 5: 5.6 wrap or scan. */
(function () {
  const x = (NIC.shared.algoP5x = NIC.shared.algoP5x || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const { cr, d2, tbl, board, mulberry, reg } = x;

  /* ============ 5.6 Wrap or scan? ============ */
  const SHAPES = [
    ["blob", "Blob"],
    ["square", "Square"],
    ["tri", "Triangle"],
    ["ring", "Ring"],
  ];
  function genPts(shape, n, seed) {
    const rnd = mulberry(seed * 7919 + n),
      out = [];
    if (shape === "ring") {
      const used = new Set();
      while (out.length < n) {
        const a = rnd() * Math.PI * 2,
          k = Math.round(a * 1e5);
        if (used.has(k)) continue;
        used.add(k);
        out.push([50 + 45 * Math.cos(a), 50 + 45 * Math.sin(a)]);
      }
    } else if (shape === "tri") {
      const A = [8, 8],
        B = [92, 8],
        C = [50, 92];
      out.push(A, B, C);
      while (out.length < n) {
        let u = rnd(),
          v = rnd();
        if (u + v > 1) {
          u = 1 - u;
          v = 1 - v;
        }
        out.push([A[0] + u * (B[0] - A[0]) + v * (C[0] - A[0]), A[1] + u * (B[1] - A[1]) + v * (C[1] - A[1])]);
      }
    } else if (shape === "square") {
      while (out.length < n) out.push([5 + 90 * rnd(), 5 + 90 * rnd()]);
    } else {
      while (out.length < n) {
        const r = 45 * Math.sqrt(rnd()),
          a = rnd() * Math.PI * 2;
        out.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
      }
    }
    return out;
  }
  /** Gift wrapping with an operation counter: every candidate check is one turn test. */
  function wrapCount(P) {
    let tests = 0;
    const start = P.reduce((m, p) => (p[0] < m[0] || (p[0] === m[0] && p[1] < m[1]) ? p : m));
    const H = [];
    let cur = start;
    do {
      H.push(cur);
      let nxt = P[0] === cur ? P[1] : P[0];
      for (const c of P) {
        if (c === cur || c === nxt) continue;
        tests++;
        const t = cr(cur, nxt, c);
        if (t < 0 || (t === 0 && d2(cur, c) > d2(cur, nxt))) nxt = c;
      }
      cur = nxt;
    } while (cur !== start && H.length <= P.length);
    return { hull: H, tests };
  }
  /** Graham scan with counters: comparisons made by the sort plus turn tests made by the scan. */
  function grahamCount(P) {
    let cmp = 0,
      scan = 0;
    const piv = P.reduce((m, p) => (p[1] < m[1] || (p[1] === m[1] && p[0] < m[0]) ? p : m));
    const rest = P.filter((p) => p !== piv).sort((a, b) => {
      cmp++;
      const t = cr(piv, a, b);
      return t > 0 ? -1 : t < 0 ? 1 : d2(piv, a) - d2(piv, b);
    });
    const seq = [];
    for (const p of rest) {
      const last = seq[seq.length - 1];
      if (last && cr(piv, last, p) === 0) seq[seq.length - 1] = p;
      else seq.push(p);
    }
    const st = [piv, seq[0]];
    for (let i = 1; i < seq.length; i++) {
      const p = seq[i];
      while (st.length >= 2) {
        scan++;
        if (cr(st[st.length - 2], st[st.length - 1], p) <= 0) st.pop();
        else break;
      }
      st.push(p);
    }
    return { hull: st, tests: cmp + scan, cmp, scan };
  }
  /** Interior elimination: the four extremes (SW, SE, NE, NW) form a quadrilateral; anything strictly inside it cannot be a corner. */
  function elim(P) {
    let cost = 0;
    const best = (g, sign) =>
      P.reduce((m, p) => {
        cost++;
        return sign * g(p) > sign * g(m) ? p : m;
      });
    const SW = best((p) => p[0] + p[1], -1),
      NE = best((p) => p[0] + p[1], 1),
      SE = best((p) => p[0] - p[1], 1),
      NW = best((p) => p[0] - p[1], -1);
    const quad = [SW, SE, NE, NW],
      keep = [],
      killed = [];
    for (const p of P) {
      let inside = true;
      for (let i = 0; i < 4 && inside; i++) {
        cost++;
        if (!(cr(quad[i], quad[(i + 1) % 4], p) > 0)) inside = false;
      }
      (inside ? killed : keep).push(p);
    }
    return { keep, killed, quad, cost };
  }

  const ELIM_PTS = (() => {
    const rnd = mulberry(11),
      o = [];
    while (o.length < 26) {
      const x = rnd() * 10,
        y = rnd() * 6;
      if (((x - 5) / 5) ** 2 + ((y - 3) / 3) ** 2 <= 1) o.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    }
    return o;
  })();

  L["a5-race"] = {
    sum: "Gift wrapping costs <b>n·h</b>, Graham scan costs <b>n log n</b>. Which is cheaper depends on how many points end up on the hull. You can also shrink the problem first by throwing away points that are obviously inside.",
    steps: [
      {
        t: "Two different bills",
        b: `<p><b>Gift wrapping:</b> one sweep of all n points for each of the h hull corners, so about <b>n·h</b>.</p><p><b>Graham scan:</b> one sort plus one linear scan, so about <b>n log n</b>, whatever the hull looks like.</p><p>The first depends on the <i>answer</i>, the second only on the <i>input size</i>.</p>`,
        v: F.compare(
          { title: "Gift wrapping", c: "violet", body: `O(n·h)<br>cost grows with the hull` },
          { title: "Graham scan", c: "teal", body: `O(n log n)<br>cost ignores the hull` },
        ),
        c: {
          q: "Which cost depends on how many points end up on the hull?",
          o: ["Gift wrapping, O(n·h)", "Graham scan, O(n log n)", "Both of them equally"],
          a: 0,
          why: "Graham's cost is set by sorting n points. Gift wrapping makes one sweep per hull corner, so a bigger hull means more sweeps.",
        },
      },
      {
        t: "The tipping point",
        b: `<p>Set n·h equal to n log n and you get <b>h ≈ log₂ n</b>. Below that, wrapping is cheaper. Above it, Graham wins.</p><p>Here is n = 1,024, where log₂ n = 10:</p>`,
        v: tbl(
          ["Hull size h", "Wrapping n·h", "Graham n log₂ n", "Cheaper"],
          [
            { c: ["4", "4,096", "10,240", "Gift wrapping"], hl: true },
            { c: ["10", "10,240", "10,240", "A tie"] },
            { c: ["64", "65,536", "10,240", "Graham scan"], bad: true },
            { c: ["1,024", "1,048,576", "10,240", "Graham scan"], bad: true },
          ],
        ),
        c: {
          q: "1,024 points with a hull of 8. Using n·h against n log₂ n (log₂ 1024 = 10), which is cheaper?",
          o: ["Gift wrapping: 8 sweeps is under 10", "Graham scan: it is always cheaper", "They cost exactly the same"],
          a: 0,
          why: "n·8 is less than n·10, so wrapping wins. It would lose as soon as h passed log₂ n = 10.",
        },
      },
      {
        t: "Worst-case inputs",
        b: `<p>The worst input for gift wrapping is one where <b>every point is a hull corner</b>, such as points on a circle: h = n, so the cost is n·n = <b>O(n²)</b>. This was the Bell Labs problem.</p><p>Graham scan has no bad day: its worst case is still O(n log n). Wrapping's best case is a big cloud with a tiny hull.</p>`,
        v: F.bars(
          [
            ["Wrapping, ring of 1000", 1000000, "rose", "n²"],
            ["Wrapping, hull of 5", 5000, "teal", "n·h"],
            ["Graham, any 1000 points", 10000, "violet", "n log n"],
          ],
          { max: 1000000, fmt: (v) => v.toLocaleString() },
        ),
        c: {
          q: "1,000 points all lie on a circle. What does gift wrapping cost, roughly?",
          o: [
            "About 1,000,000 checks, since every point is a corner",
            "About 10,000 checks, like a sort",
            "About 1,000 checks, one pass",
          ],
          a: 0,
          why: "h = n = 1000 sweeps of 1000 points each is n² = 1,000,000. Graham scan would need only about 10,000.",
        },
      },
      {
        t: "Throw away the inside first",
        b: `<p>Graham's slide suggests a speed-up: <b>interior elimination</b>. Find the four extreme points (south-west, south-east, north-east, north-west) and join them into a quadrilateral. Any point <b>strictly inside</b> it is certainly inside the hull, so drop it.</p><p>It costs a couple of linear passes, and on a blob it can discard most of the points before the real algorithm even starts.</p>`,
        v: (() => {
          const r = elim(ELIM_PTS);
          return (
            board({
              w: 10,
              h: 6,
              S: 40,
              grid: false,
              poly: r.quad,
              polyCol: "amber",
              dots: ELIM_PTS.map((p) => ({
                p,
                r: 6,
                o: r.killed.includes(p) ? 0.35 : 1,
                c: r.quad.includes(p) ? "amber" : r.killed.includes(p) ? null : "teal",
              })),
            }) +
            `<p class="faint" style="text-align:center">${r.killed.length} of ${ELIM_PTS.length} points are strictly inside the quadrilateral (faded) and can be dropped.</p>`
          );
        })(),
        c: {
          q: "Why is it safe to discard a point strictly inside the quadrilateral of the four extremes?",
          o: [
            "Its corners are real input points, so anything inside it is inside the hull",
            "Points near the middle of the set are never close to the hull itself",
            "The quadrilateral is always the exact hull of the whole set of points",
          ],
          a: 0,
          why: "The four extremes are themselves input points, so their quadrilateral lies within the hull. A point strictly inside it is strictly inside the hull and cannot be a corner.",
        },
      },
    ],
    guide: [
      "Pick a shape and a size, then read the two bars: <i>gift wrapping</i> against <i>Graham scan</i>.",
      "Try <b>Ring</b>, then <b>Triangle</b>, at the same size. Which algorithm wins each time?",
      "Switch <b>Drop interior first</b> on for the Blob and watch the point count fall.",
    ],
  };

  reg({
    id: "a5-race",
    order: 6,
    num: "5.6",
    title: "Wrap or scan?",
    blurb: "Both algorithms count their own turn tests on the same points. Change the shape and see who wins.",
    render(root) {
      root.appendChild(header(this, ""));
      let shape = "blob",
        n = 120,
        elimOn = false,
        seed = 3;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Race</h2><span class="faint">turn tests counted while the algorithms really run</span></div>
        <div class="controls" id="sg"></div><div class="controls" id="sl"></div><div class="controls" id="sg2"></div><div id="bd"></div>
        <div class="stat-row"><div class="stat"><small>Points used</small><b id="nn"></b></div><div class="stat teal"><small>Hull size h</small><b id="hh"></b></div><div class="stat violet"><small>Filter cost</small><b id="fc"></b></div></div>
        <div id="bars" style="min-height:120px"></div><div class="stat-row"><div class="stat amber"><small>Cheaper here</small><b id="wn"></b></div></div>
        <div class="controls"><button class="btn ghost" id="again">New random points</button></div></div>`);
      root.appendChild(card);
      qs("#sg", card).appendChild(
        N.seg(SHAPES, shape, (v) => {
          shape = v;
          draw();
        }),
      );
      const sl = N.slider("Number of points n", 10, 300, 10, n);
      qs("#sl", card).appendChild(sl);
      sl.onInput((v) => {
        n = v;
        draw();
      });
      qs("#sg2", card).appendChild(
        N.seg(
          [
            ["off", "Use all points"],
            ["on", "Drop interior first"],
          ],
          "off",
          (v) => {
            elimOn = v === "on";
            draw();
          },
        ),
      );
      qs("#again", card).onclick = () => {
        seed++;
        draw();
      };
      function draw() {
        const P = genPts(shape, n, seed);
        let work = P,
          killed = [],
          quad = null,
          fcost = 0;
        if (elimOn) {
          const r = elim(P);
          work = r.keep;
          killed = r.killed;
          quad = r.quad;
          fcost = r.cost;
        }
        const w = wrapCount(work),
          g = grahamCount(work);
        const wt = w.tests + fcost,
          gt = g.tests + fcost,
          hl = w.hull;
        qs("#bd", card).innerHTML = board({
          w: 100,
          h: 100,
          S: 3,
          pad: 14,
          grid: false,
          r: 3,
          poly: hl,
          dots: P.map((p) => ({
            p,
            r: killed.includes(p) ? 2.5 : hl.includes(p) ? 4 : 3,
            o: killed.includes(p) ? 0.3 : 1,
            c: hl.includes(p) ? "teal" : null,
          })),
          segs: quad ? quad.map((p, i) => [p, quad[(i + 1) % 4], "amber", true]) : [],
        });
        qs("#nn", card).textContent = work.length + (elimOn ? " of " + P.length : "");
        qs("#hh", card).textContent = hl.length;
        qs("#fc", card).textContent = elimOn ? fcost.toLocaleString() : "none";
        qs("#bars", card).innerHTML = F.bars(
          [
            ["Gift wrapping", wt, "violet", elimOn ? w.tests.toLocaleString() + " wrap + filter" : "sweeps"],
            ["Graham scan", gt, "teal", g.cmp.toLocaleString() + " sort + " + g.scan.toLocaleString() + " scan"],
          ],
          { max: Math.max(wt, gt, 1), fmt: (v) => v.toLocaleString() },
        );
        qs("#wn", card).textContent = wt === gt ? "A tie" : wt < gt ? "Gift wrapping" : "Graham scan";
      }
      draw();
      root.appendChild(
        predict({
          id: "a5-rc-1",
          q: "Pick <b>Ring</b> with 200 points (every point on the hull). Which algorithm makes far fewer turn tests?",
          opts: [
            "Gift wrapping, because it never has to sort the points first",
            "Graham scan: wrapping needs about n² tests",
            "They are about equal, since both look at every point",
          ],
          a: 1,
          why: "With h = n, wrapping makes n sweeps of n points: about 40,000 tests. Graham sorts and scans in under 2,000.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-rc-2",
          q: "Pick <b>Triangle</b> with 200 points (only 3 corners). Which algorithm now makes fewer turn tests?",
          opts: [
            "Gift wrapping: three sweeps of about 200 points",
            "Graham scan: sorting is always cheaper",
            "They are about equal",
          ],
          a: 0,
          why: "Three sweeps cost about 3 × 200 = 600 tests. Sorting 200 points alone takes well over a thousand comparisons, so the small hull makes wrapping the winner.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Gift wrapping is O(n·h); Graham scan is O(n log n). Wrapping wins when h is below about log₂ n.",
            "All points on the hull is wrapping's worst case (O(n²)); Graham's cost does not change.",
            "Interior elimination drops points strictly inside the quadrilateral of the four extremes before running either algorithm.",
          ],
          "Small hull: wrap it. Big hull: sort and scan.",
        ),
      );
    },
  });
})();
