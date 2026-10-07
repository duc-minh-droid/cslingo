/* algo-p5-x-04: Phase 5: 5.5 ties and rounding, 5.8 more uses. */
(function () {
  const x = (NIC.shared.algoP5x = NIC.shared.algoP5x || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const { cr, hullOf, tbl, board, sci, grahamPts, mulberry, reg, separated, farthest, DSET, AB, BB } = x;

  /* ============ 5.5 Ties, collinear points and rounding ============ */
  const PE = [
    [1, 1, "A"],
    [5, 1, "B"],
    [9, 1, "C"],
    [9, 3, "D"],
    [9, 5, "E"],
    [5, 5, "F"],
    [1, 5, "G"],
    [4, 3, "H"],
    [6, 2, "I"],
  ];
  const FLT = [
    [
      [0.1, 0.1],
      [0.2, 0.3],
      [0.3, 0.5],
    ],
    [
      [0.1, 0.1],
      [0.3, 0.2],
      [0.5, 0.3],
    ],
    [
      [0.1, 0.2],
      [0.2, 0.4],
      [0.3, 0.6],
    ],
  ];

  L["a5-edge"] = {
    sum: "Real data is awkward: points on an edge, points at the same angle, duplicates, and decimals that are almost but not quite collinear. Each needs a <b>rule</b>, and the rule has to be applied consistently.",
    steps: [
      {
        t: "A point on a hull edge",
        b: `<p>Three points are <b>collinear</b> when their cross product is 0. If the middle one sits exactly on a hull edge, is it a hull vertex?</p><p>Both answers are defensible. Pick one and be consistent:</p><p><b>Corners only:</b> pop on a straight line as well as a right turn. <b>Keep edge points:</b> pop only on a strict right turn. The lecture's pseudocode pops only on a clockwise turn, so straight-on points stay.</p>`,
        v: F.frames([
          {
            t: "<b>Corners only</b>: 4 vertices",
            v: `<svg class="fig" viewBox="0 0 300 150" style="max-height:140px"><polygon points="40,120 260,120 260,30 40,30" fill="rgba(88,204,2,.08)" stroke="var(--teal)" stroke-width="3"/>${[
              [40, 120, 1],
              [260, 120, 1],
              [260, 30, 1],
              [40, 30, 1],
              [150, 120, 0],
            ]
              .map(
                ([x, y, h]) => `<circle cx="${x}" cy="${y}" r="7" fill="${h ? "var(--teal)" : "var(--text-faint)"}"/>`,
              )
              .join("")}<text x="150" y="142" class="fig-sub">on the edge: not a vertex</text></svg>`,
          },
          {
            t: "<b>Keep edge points</b>: 5 vertices",
            v: `<svg class="fig" viewBox="0 0 300 150" style="max-height:140px"><polygon points="40,120 260,120 260,30 40,30" fill="rgba(88,204,2,.08)" stroke="var(--teal)" stroke-width="3"/>${[
              [40, 120],
              [260, 120],
              [260, 30],
              [40, 30],
              [150, 120],
            ]
              .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="var(--teal)"/>`)
              .join("")}<text x="150" y="142" class="fig-sub">on the edge: kept</text></svg>`,
          },
        ]),
        c: {
          q: 'A square\'s four corners plus one point exactly midway along an edge. How many hull vertices under the "corners only" rule?',
          o: ["4", "5", "It depends on the sort order"],
          a: 0,
          why: "The midpoint is collinear with its edge's endpoints, so a straight-on test pops it. The hull is just the four corners.",
        },
      },
      {
        t: "Same angle from the anchor",
        b: `<p>Graham scan sorts by angle. Two points can have <b>exactly the same angle</b> from the anchor: one is simply farther along the same ray.</p><p>Line 2 of the lecture's pseudocode handles it: <b>keep only the farthest</b>. The nearer one lies on the segment from the anchor to the farther one, so it cannot be a corner.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 190" style="max-height:180px"><circle cx="60" cy="150" r="8" fill="var(--amber)"/><text x="60" y="176" class="fig-sub">anchor</text><line x1="60" y1="150" x2="350" y2="60" stroke="var(--line-2)" stroke-dasharray="4 4"/><circle cx="170" cy="116" r="7" fill="var(--text-faint)" class="fi"/><text x="170" y="104" class="fig-sub">nearer: dropped</text><circle cx="320" cy="69" r="8" fill="var(--teal)" class="fi"/><text x="338" y="58" class="fig-sub" style="text-anchor:start;fill:var(--teal)">farthest: kept</text><circle cx="260" cy="150" r="7" fill="var(--violet)" class="fi"/><circle cx="130" cy="40" r="7" fill="var(--violet)" class="fi"/></svg>`,
        c: {
          q: "Two points have the same angle from the anchor. Why does Graham scan keep only the farther one?",
          o: [
            "The nearer one lies on the segment to the farther one",
            "The farther one is always closer to the centre of the whole hull",
            "The nearer point would break the sort order of the other points",
          ],
          a: 0,
          why: "Nothing along the segment from the anchor to the farther point can be a strict corner. It sits on the boundary or inside.",
        },
      },
      {
        t: "Ties when wrapping",
        b: `<p>Gift wrapping has the same issue. If two candidates give <b>the same smallest angle</b>, they lie on one line from the current point.</p><p>Take the <b>farther</b> one and the wrap skips the middle point: you get <b>corners only</b>. Take the <b>nearer</b> one and the next round steps straight on to the farther one: you get <b>edge points kept</b>.</p>`,
        v: F.compare(
          { title: "Tie: take the farther", c: "teal", body: `skips the point in the middle<br>corners only` },
          { title: "Tie: take the nearer", c: "violet", body: `visits every point on the edge<br>edge points kept` },
        ),
        c: {
          q: "In gift wrapping, two candidates tie for the smallest angle. To output only strict corners, which do you take?",
          o: [
            "The one farther from the current point",
            "The one nearer to the current point",
            "Either: it never changes the result",
          ],
          a: 0,
          why: "The farther point makes the longer edge and steps over the point in the middle. Taking the nearer one would add that middle point to the hull.",
        },
      },
      {
        t: "Tiny and degenerate inputs",
        b: `<p>Check the small cases first. <b>One point:</b> the hull is that point. <b>Two points:</b> a segment. <b>Several points on one line:</b> the hull is a segment too, with just the two ends as strict vertices. <b>Duplicates</b> should be merged first.</p><p>The workshop stub guards for this: it only runs the scan if there are <b>more than two</b> distinct points, otherwise it returns them as they are.</p>`,
        v: F.frames([
          { t: "1 point: the hull is the point", v: F.cells([{ v: "A", c: "teal" }]) },
          { t: "2 points: a segment", v: F.cells([{ v: "A", c: "teal" }, "—", { v: "B", c: "teal" }]) },
          {
            t: "5 points on a line: a segment, two ends",
            v: F.cells([{ v: "A", c: "teal" }, { v: "B" }, { v: "C" }, { v: "D" }, { v: "E", c: "teal" }]),
          },
        ]),
        c: {
          q: "Five points all lie on one straight line. How many corners does the strict hull have?",
          o: ["2: just the two ends", "5: every point", "0: there is no hull"],
          a: 0,
          why: "The hull is a line segment. Only its two end points are corners. The three in between are on the edge.",
        },
      },
      {
        t: "Decimals are almost-zero",
        b: `<p>With decimals, three points that are <b>exactly collinear on paper</b> can give a cross product that is not quite 0, like 1.4 × 10⁻¹⁷ or −1.4 × 10⁻¹⁷, because 0.1, 0.2, 0.3 cannot be stored exactly.</p><p>Test the raw sign and the same straight line can look like a left turn one time and a right turn the next. The stub's fix: <b>round the cross product</b> (to 4 decimal places) before looking at its sign, or compare against a small tolerance.</p>`,
        v: tbl(
          ["p → a → b", "raw cross", "rounded to 4 d.p."],
          FLT.map(([p, a, b]) => {
            const c = cr(p, a, b);
            return {
              c: [`(${p}) → (${a}) → (${b})`, c === 0 ? "0" : sci(c), String(Math.round(c * 1e4) / 1e4 || 0)],
              bad: c !== 0,
            };
          }),
        ),
        c: {
          q: "Why does the stub round the cross product to 4 decimal places before testing its sign?",
          o: [
            "Rounding errors could turn an exact zero into a tiny nonzero value",
            "Rounding makes the cross product much cheaper to compute on a computer",
            "Cross products of decimals are always wrong by a large amount",
          ],
          a: 0,
          why: 'Floating-point noise around 10⁻¹⁷ would otherwise decide left or right for what is really a straight line. Rounding (or a tolerance) restores a consistent "zero". Integers avoid the problem entirely.',
        },
      },
    ],
    guide: [
      "Flip between <b>Corners only</b> and <b>Keep edge points</b> and watch the hull list change.",
      "Count the hull vertices before you press: how many points sit on the edges?",
      "Read the rounding table at the bottom: the same straight line gives raw values of both signs.",
    ],
  };

  reg({
    id: "a5-edge",
    order: 5,
    num: "5.5",
    title: "Ties, edges and rounding",
    blurb: "Points on an edge, equal angles, tiny inputs and decimal noise: the rules that make a hull routine robust.",
    render(root) {
      root.appendChild(header(this, ""));
      let keep = false;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Which points count?</h2></div><div class="controls" id="sg"></div><div id="bd"></div>
        <div class="stat-row"><div class="stat teal"><small>Hull vertices</small><b id="h"></b></div><div class="stat"><small>Hull, in order</small><b id="ls" style="font-size:15px"></b></div></div></div>`);
      root.appendChild(card);
      qs("#sg", card).appendChild(
        N.seg(
          [
            ["strict", "Corners only"],
            ["keep", "Keep edge points"],
          ],
          "strict",
          (v) => {
            keep = v === "keep";
            draw();
          },
        ),
      );
      function draw() {
        const hl = grahamPts(PE, keep);
        qs("#bd", card).innerHTML = board({
          w: 10,
          h: 6,
          S: 40,
          poly: hl,
          dots: PE.map((p) => ({ p, t: p[2], r: 12, c: hl.includes(p) ? "teal" : null })),
        });
        qs("#h", card).textContent = hl.length;
        qs("#ls", card).textContent = hl.map((p) => p[2]).join(" ");
      }
      draw();
      const fl = el(
        `<div class="card"><div class="card-head"><h3>The same straight line, decimal coordinates</h3></div><p class="faint" style="margin-top:0">Each row is three points that lie exactly on one line. The raw cross product is computed live by your browser.</p>${tbl(
          ["p → a → b", "raw cross", "sign if tested raw", "rounded to 4 d.p."],
          FLT.map(([p, a, b]) => {
            const c = cr(p, a, b);
            return {
              c: [
                `(${p}) → (${a}) → (${b})`,
                c === 0 ? "0" : sci(c),
                c > 0 ? "left turn" : c < 0 ? "right turn" : "straight",
                String(Math.round(c * 1e4) / 1e4 || 0),
              ],
              bad: c !== 0,
            };
          }),
        )}</div>`,
      );
      root.appendChild(fl);
      root.appendChild(
        predict({
          id: "a5-ed-1",
          q: "Nine points: a rectangle's four corners, three points exactly on its edges, and two inside. How many hull vertices with <b>Keep edge points</b>?",
          opts: ["4", "7", "9"],
          a: 1,
          why: "Keeping boundary points returns the four corners plus the three edge points: 7. The two interior points are never on the boundary. With <b>Corners only</b> it would be 4.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-ed-2",
          q: "Two exactly collinear triples have raw cross products of +1.4e-17 and −1.4e-17. Tested on the raw sign, with no rounding, what can go wrong?",
          opts: [
            "One line may read as a left turn and another as a right turn",
            "Both are treated as collinear, so nothing at all goes wrong in the code",
            "The program crashes at once with a division by zero error message",
          ],
          a: 0,
          why: 'Floating-point noise gives a tiny sign that is effectively random. One middle point may be kept and another popped for no geometric reason. Rounding or a tolerance restores a consistent "zero".',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Pick a rule for points on an edge (corners only, or keep them) and apply it everywhere.",
            "Equal angles: Graham keeps the farthest; in gift wrapping, take the farther to skip the middle point.",
            "Guard tiny inputs: with 1, 2 or all-collinear points the hull is a point or a segment.",
            "Decimals: round the cross product (or use a tolerance) before testing its sign.",
          ],
          "Decide the tie rule once, then test the awkward cases.",
        ),
      );
    },
  });

  L["a5-uses"] = {
    sum: "Once you have a hull, other questions get cheap. The farthest pair of points must be two hull corners, two classes are separable by a line exactly when their hulls do not overlap, and convex pieces make graphics and path planning simple.",
    steps: [
      {
        t: "The farthest pair",
        b: `<p>Question: <b>which two points in the set are farthest apart?</b> That distance is the set's <b>diameter</b>.</p><p>The answer is always a pair of <b>hull corners</b>: slide any other point outwards and it only gets farther. So build the hull first, then look at pairs of corners only.</p><p>With 1,000 points and a 10-corner hull: 499,500 pairs against just 45.</p>`,
        v: (() => {
          const hl = hullOf(DSET),
            f = farthest(hl);
          return board({
            w: 12,
            h: 8,
            S: 30,
            poly: hl,
            segs: [[f.a, f.b, "violet"]],
            dots: DSET.map((p) => ({ p, r: 7, c: p === f.a || p === f.b ? "violet" : hl.includes(p) ? "teal" : null })),
          });
        })(),
        c: {
          q: "To find the farthest pair among 1,000 points whose hull has 10 corners, you only need to compare…",
          o: [
            "Pairs of hull corners: 45 pairs",
            "Every pair of the 1,000 points",
            "The hull corner farthest from the centre only",
          ],
          a: 0,
          why: "The two ends of the longest distance are always corners. 10 corners give 10 × 9 ÷ 2 = 45 pairs, instead of almost half a million.",
        },
      },
      {
        t: "Clustering by diameter",
        b: `<p>In <b>minimum-diameter k-clustering</b> you split the points into <b>k clusters</b> so that the <b>largest cluster diameter</b> is as small as possible. Think of putting k delivery depots so that no group of customers is spread too wide.</p><p>Every candidate cluster needs its diameter measured, and that is the farthest-pair question again, answered fast through the cluster's hull.</p>`,
        v: `<svg class="fig" viewBox="0 0 460 200" style="max-height:190px"><polygon points="40,150 90,170 140,130 120,80 60,90" fill="rgba(88,204,2,.1)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/><line x1="90" y1="170" x2="120" y2="80" stroke="var(--violet)" stroke-width="3"/><polygon points="250,60 330,40 400,80 380,140 290,150" fill="rgba(28,176,246,.1)" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round" class="draw"/><line x1="250" y1="60" x2="380" y2="140" stroke="var(--violet)" stroke-width="3"/><text x="90" y="30" class="fig-sub">cluster 1: small diameter</text><text x="330" y="190" class="fig-sub">cluster 2: the largest diameter is what we minimise</text></svg>`,
        c: {
          q: "In minimum-diameter k-clustering, which quantity are you trying to make as small as possible?",
          o: [
            "The largest diameter among the k clusters",
            "The number of points in the biggest cluster",
            "The total distance between all cluster centres",
          ],
          a: 0,
          why: "A good clustering has no cluster stretched out too far, so you minimise the widest cluster's diameter.",
        },
      },
      {
        t: "Can a line separate them?",
        b: `<p>Two classes of points, say red and blue. Is there a <b>straight line</b> with all the red on one side and all the blue on the other?</p><p>Draw the hull of each class. A line can separate the classes <b>only if the two hulls do not overlap</b>. If they overlap, no line can do it.</p>`,
        v: F.frames([
          {
            t: "<b>Hulls apart</b>: a separating line exists",
            v: `<svg class="fig" viewBox="0 0 400 170" style="max-height:160px"><polygon points="30,120 80,150 150,110 120,40 50,50" fill="rgba(255,75,75,.1)" stroke="var(--rose)" stroke-width="3" stroke-linejoin="round"/><polygon points="250,50 320,30 370,90 330,140 260,120" fill="rgba(28,176,246,.1)" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/><line x1="205" y1="10" x2="195" y2="160" stroke="var(--teal)" stroke-width="3" stroke-dasharray="7 5" class="draw"/></svg>`,
          },
          {
            t: "<b>Hulls overlap</b>: no line can separate them",
            v: `<svg class="fig" viewBox="0 0 400 170" style="max-height:160px"><polygon points="40,120 90,150 190,110 160,40 60,50" fill="rgba(255,75,75,.1)" stroke="var(--rose)" stroke-width="3" stroke-linejoin="round"/><polygon points="140,50 230,30 300,90 260,140 150,120" fill="rgba(28,176,246,.1)" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/><text x="170" y="95" class="fig-sub" style="fill:var(--ink)">overlap</text></svg>`,
          },
        ]),
        c: {
          q: "The convex hulls of class A and class B overlap. What does that tell you?",
          o: [
            "No straight line can split A from B",
            "A line can separate them, but only a very steep one will work",
            "Class A must contain more points than class B does",
          ],
          a: 0,
          why: "A separating line would also separate the hulls, which is impossible when they share any area. Overlapping hulls rule out any straight-line classifier.",
        },
      },
      {
        t: "Graphics and paths",
        b: `<p><b>Computer graphics:</b> convex shapes are easy to work with, since a point is inside only if it is on the same side of every edge. A complicated shape is cut into convex pieces (a <b>convex decomposition</b>), and each piece is the hull of its corners.</p><p><b>Path planning:</b> a robot that must get round an obstacle can follow the obstacle's hull; the shortest path wraps round its corners like a stretched string.</p>`,
        v: `<svg class="fig" viewBox="0 0 460 190" style="max-height:180px"><polygon points="30,30 100,30 100,90 190,90 190,160 30,160" fill="rgba(255,150,0,.08)" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round"/><line x1="30" y1="90" x2="100" y2="90" stroke="var(--violet)" stroke-width="3" stroke-dasharray="6 5"/><line x1="100" y1="90" x2="100" y2="160" stroke="var(--violet)" stroke-width="3" stroke-dasharray="6 5"/><text x="110" y="182" class="fig-sub">split into convex pieces</text><rect x="290" y="60" width="100" height="70" rx="10" fill="rgba(255,75,75,.08)" stroke="var(--rose)" stroke-width="3"/><path d="M250 150 L290 130 L390 60 L430 40" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linejoin="round" class="draw"/><circle cx="250" cy="150" r="7" fill="var(--ink)"/><circle cx="430" cy="40" r="7" fill="var(--teal)"/><text x="340" y="170" class="fig-sub">the path hugs the corners</text></svg>`,
        c: {
          q: "Why do graphics programs cut a complicated shape into convex pieces?",
          o: [
            "Inside-tests become simple same-side checks per piece",
            "Convex pieces take up less memory than a single outline would",
            "Only convex shapes can be drawn on a computer screen",
          ],
          a: 0,
          why: "Inside a convex polygon means being on the same side of every edge. That is a quick test, so pieces are easier to work with than one tangled outline.",
        },
      },
    ],
    guide: [
      "In <b>Diameter</b>, press <b>New points</b> and compare the two pair counts.",
      "In <b>Separable?</b>, slide class B across until the hulls stop overlapping.",
      "Answer the questions after the demo.",
    ],
  };

  reg({
    id: "a5-uses",
    order: 8,
    num: "5.8",
    title: "What hulls are good for",
    blurb: "Farthest pairs, clustering, line-separable classes and convex pieces: why hulls turn up everywhere.",
    render(root) {
      root.appendChild(header(this, ""));
      let tab = "diam",
        seed = 0,
        shift = 2;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Two things you can ask a hull</h2></div><div class="controls" id="sg"></div>
        <div id="bd" style="min-height:300px"></div>
        <div class="stat-row"><div class="stat"><small id="l1"></small><b id="v1"></b></div><div class="stat teal"><small id="l2"></small><b id="v2"></b></div><div class="stat violet"><small id="l3"></small><b id="v3"></b></div></div>
        <div class="controls" id="ct" style="min-height:52px"></div></div>`);
      root.appendChild(card);
      qs("#sg", card).appendChild(
        N.seg(
          [
            ["diam", "Diameter"],
            ["sep", "Separable?"],
          ],
          tab,
          (v) => {
            tab = v;
            ctl();
            draw();
          },
        ),
      );
      const sl = N.slider("Move class B to the right", 0, 9, 1, shift);
      sl.onInput((v) => {
        shift = v;
        draw();
      });
      const again = el(`<button class="btn ghost">New points</button>`);
      again.onclick = () => {
        seed++;
        draw();
      };
      function ctl() {
        const c = qs("#ct", card);
        c.innerHTML = "";
        c.appendChild(tab === "diam" ? again : sl);
      }
      function setStat(i, l, v) {
        qs("#l" + i, card).textContent = l;
        qs("#v" + i, card).textContent = v;
      }
      function draw() {
        if (tab === "diam") {
          const rnd = mulberry(seed * 31 + 5),
            pts = [];
          while (pts.length < 14)
            pts.push([Math.round((1 + 10 * rnd()) * 10) / 10, Math.round((1 + 6 * rnd()) * 10) / 10]);
          const hl = hullOf(pts),
            all = farthest(pts),
            onHull = farthest(hl),
            n = pts.length,
            h = hl.length;
          qs("#bd", card).innerHTML = board({
            w: 12,
            h: 8,
            S: 28,
            poly: hl,
            segs: [[onHull.a, onHull.b, "violet"]],
            dots: pts.map((p) => ({
              p,
              r: 7,
              c: p === onHull.a || p === onHull.b ? "violet" : hl.includes(p) ? "teal" : null,
            })),
          });
          setStat(1, "Pairs of all points", (n * (n - 1)) / 2 + " pairs");
          setStat(2, "Pairs of hull corners", (h * (h - 1)) / 2 + " pairs");
          setStat(
            3,
            "Longest distance",
            all.d.toFixed(2) + (Math.abs(all.d - onHull.d) < 1e-9 ? " (same both ways)" : " (MISMATCH)"),
          );
        } else {
          const A = hullOf(AB),
            Bp = BB.map((p) => [p[0] + shift, p[1]]),
            B = hullOf(Bp),
            apart = separated(A, B);
          qs("#bd", card).innerHTML =
            board({
              w: 14,
              h: 8,
              S: 26,
              grid: false,
              poly: A,
              polyCol: "rose",
              dots: AB.map((p) => ({ p, r: 6, c: "rose" })),
            }).replace("</svg>", "") +
            `<polygon points="${B.map((p) => 18 + p[0] * 26 + "," + (18 + (8 - p[1]) * 26)).join(" ")}" fill="color-mix(in srgb, var(--blue) 12%, transparent)" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>${Bp.map((p) => `<circle cx="${18 + p[0] * 26}" cy="${18 + (8 - p[1]) * 26}" r="6" fill="color-mix(in srgb, var(--blue) 30%, var(--panel))" stroke="var(--blue)" stroke-width="2.5"/>`).join("")}</svg>`;
          setStat(1, "Class A hull corners", A.length + "");
          setStat(2, "Class B hull corners", B.length + "");
          setStat(3, "Hulls", apart ? "apart: a line can split them" : "overlap: no line can");
        }
      }
      ctl();
      draw();
      root.appendChild(
        predict({
          id: "a5-us-1",
          q: "Among 1,000 points the hull has 10 corners. How many pairs must you compare to find the farthest pair, by checking only hull corners?",
          opts: ["45", "about 500,000", "1,000"],
          a: 0,
          why: "10 corners give 10 × 9 ÷ 2 = 45 pairs. All 1,000 points would give 499,500 pairs, but the farthest pair is always two corners.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-us-2",
          q: "In <b>Separable?</b>, class B's hull still overlaps class A's. Could a straight line have all of A on one side and all of B on the other?",
          opts: ["No: overlapping hulls rule it out", "Yes, if you tilt the line", "Only if class A has more points"],
          a: 0,
          why: "Any line that splits the points also splits their hulls. Hulls that share area cannot be split by a line. Slide B until a gap opens and a line exists.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "The farthest pair of a point set is a pair of hull corners: check h(h−1)/2 pairs, not n(n−1)/2.",
            "Classes are separable by a line exactly when their hulls do not overlap.",
            "Convex pieces make graphics and path planning simple: a point is inside if it is on the same side of every edge.",
          ],
          "Build the hull once, then ask cheap questions about its corners.",
        ),
      );
    },
  });
})();
