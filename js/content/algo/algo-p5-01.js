/* Phase 5 — Convex Hulls: orientation tests, gift wrapping, Graham scan */
(function () {
  const partScope = (NIC.shared.algoP5 = NIC.shared.algoP5 || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  // Point set: hull = A,C,E,G,D (screen coords, y down) with B,F interior
  const PTS = { A: [60, 230], B: [160, 170], C: [190, 245], D: [330, 210], E: [410, 120], F: [250, 140], G: [230, 45] };
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  // screen y down → positive cross = clockwise turn visually; we report "left/right" in math convention by negating
  const turn = (o, a, b) => -cross(PTS[o], PTS[a], PTS[b]);

  function hullOf(names) {
    // Andrew monotone chain on (x, -y) for math orientation
    const pts = names.map((n) => ({ n, x: PTS[n][0], y: -PTS[n][1] })).sort((p, q) => p.x - q.x || p.y - q.y);
    const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower = [],
      upper = [];
    for (const p of pts) {
      while (lower.length >= 2 && cr(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    for (const p of pts.slice().reverse()) {
      while (upper.length >= 2 && cr(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    return lower
      .slice(0, -1)
      .concat(upper.slice(0, -1))
      .map((p) => p.n);
  }

  function svg(hlPts, edges, extras = "") {
    const hull = hullOf(Object.keys(PTS));
    const s = [`<svg class="viz" viewBox="0 0 470 290" style="max-height:290px">`];
    s.push(
      `<polygon points="${hull.map((n) => PTS[n].join(",")).join(" ")}" fill="rgba(88,204,2,0.07)" stroke="var(--line-2)" stroke-dasharray="4 4"/>`,
    );
    (edges || []).forEach(([a, b, c]) =>
      s.push(
        `<line x1="${PTS[a][0]}" y1="${PTS[a][1]}" x2="${PTS[b][0]}" y2="${PTS[b][1]}" stroke="${c || "var(--teal)"}" stroke-width="3"/>`,
      ),
    );
    Object.entries(PTS).forEach(([n, [x, y]]) => {
      const on = (hlPts || []).includes(n);
      s.push(
        `<circle cx="${x}" cy="${y}" r="17" fill="var(--panel-2)" stroke="${on ? "var(--amber)" : "var(--teal)"}" stroke-width="${on ? 3.5 : 2}" data-p="${n}" class="pt" style="cursor:pointer"/><text x="${x}" y="${y + 5}" fill="var(--text)" font-size="13" font-weight="700" text-anchor="middle" style="pointer-events:none">${n}</text>`,
      );
    });
    return s.join("") + extras + "</svg>";
  }

  const pseudo = (lines, on = []) =>
    `<div class="pseudo">${lines.map((t, k) => `<div class="${on.includes(k) ? "on" : ""}">${t}</div>`).join("")}</div>`;
  const tbl = (head, rows) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;

  /* ============ 5.1 Orientation ============ */
  L["a5-orient"] = {
    sum: "The <b>convex hull</b> is the rubber band you'd get by stretching it around a set of pins. Every hull algorithm is built on one tiny test: walking from p to a to b, do you turn <b>left</b> or <b>right</b>?",
    steps: [
      {
        t: "The rubber-band picture",
        b: `<p>Hammer pins into a board and stretch a rubber band around them all. When you let go, it snaps onto the outermost pins. Those pins form the <b>convex hull</b>. Pins inside the band don't touch it.</p>`,
        v: `<svg class="fig" viewBox="0 0 460 250" role="img" aria-label="Pins on a board with a rubber band stretched round the outermost pins. The pins inside the band don't touch it." style="max-height:230px"><polygon points="60,200 190,215 330,180 410,90 230,25" fill="rgba(88,204,2,.1)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/>${[
          [60, 200, 1],
          [190, 215, 1],
          [330, 180, 1],
          [410, 90, 1],
          [230, 25, 1],
          [160, 140, 0],
          [250, 110, 0],
          [300, 130, 0],
        ]
          .map(
            ([x, y, h]) =>
              `<circle cx="${x}" cy="${y}" r="7" fill="${h ? "var(--teal)" : "var(--text-faint)"}" class="fi"/>`,
          )
          .join("")}<text x="250" y="150" class="fig-sub">inside pins don't touch the band</text></svg>`,
      },
      {
        t: "The turn test",
        b: `<p>Walk from <b>p</b> to <b>a</b>, then look towards <b>b</b>. Which way do you turn?</p><p>One formula answers it, the <b>cross product</b>: <code>(a − p) × (b − p) = (aₓ−pₓ)(b_y−p_y) − (a_y−p_y)(bₓ−pₓ)</code>.</p>`,
        v: F.frames([
          {
            t: "<b>positive</b> → left turn (counter-clockwise)",
            v: `<svg class="fig" viewBox="0 0 150 90"><path d="M20 75 L75 55 L95 12" fill="none" stroke="var(--teal)" stroke-width="3" class="draw"/><circle cx="20" cy="75" r="4" fill="var(--text)"/><circle cx="75" cy="55" r="4" fill="var(--text)"/><circle cx="95" cy="12" r="5" fill="var(--teal)"/></svg>`,
          },
          {
            t: "<b>negative</b> → right turn (clockwise)",
            v: `<svg class="fig" viewBox="0 0 150 90"><path d="M20 75 L75 55 L130 78" fill="none" stroke="var(--rose)" stroke-width="3" class="draw"/><circle cx="20" cy="75" r="4" fill="var(--text)"/><circle cx="75" cy="55" r="4" fill="var(--text)"/><circle cx="130" cy="78" r="5" fill="var(--rose)"/></svg>`,
          },
          {
            t: "<b>zero</b> → collinear (straight on)",
            v: `<svg class="fig" viewBox="0 0 150 90"><path d="M20 75 L75 50 L130 25" fill="none" stroke="var(--amber)" stroke-width="3" class="draw"/><circle cx="20" cy="75" r="4" fill="var(--text)"/><circle cx="75" cy="50" r="4" fill="var(--text)"/><circle cx="130" cy="25" r="5" fill="var(--amber)"/></svg>`,
          },
        ]),
        c: {
          type: "match",
          q: "For a walk p → a → b, match the sign of the cross product to what the walk does.",
          pairs: [
            ["Positive", "A left turn (counter-clockwise)"],
            ["Negative", "A right turn (clockwise)"],
            ["Zero", "The three points are in a straight line"],
          ],
          hint: "Positive is left and negative is right. What is neither?",
          why: "Zero means the two direction vectors are parallel, so the three points are collinear. That is the classic hull edge case.",
        },
      },
      {
        t: "Why hulls care about turns",
        b: `<p>Walk around a convex shape counter-clockwise and <b>every</b> turn is a left turn. If some point makes you turn right, it's denting the shape inward, so it can't be a hull corner.</p><span class="key">No angles, no trig: one multiply-and-subtract per triple.</span>`,
        v: `<svg class="fig" viewBox="0 0 460 210" style="max-height:200px"><polygon points="40,170 150,185 250,150 235,50 90,60" fill="rgba(88,204,2,.08)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/><polygon points="290,170 400,185 440,100 380,40 330,75 340,130" fill="rgba(255,75,75,.07)" stroke="var(--rose)" stroke-width="3" stroke-linejoin="round" class="draw"/><circle cx="340" cy="130" r="8" fill="var(--rose)" class="fi"/><text x="145" y="115" class="fig-sub" style="fill:var(--teal)">every turn is a left turn</text><text x="372" y="205" class="fig-sub" style="fill:var(--rose)">one right turn = a dent</text></svg>`,
      },
      {
        t: "Do one by hand",
        b: `<p>Take <b>p, a, b</b>. Subtract p from both others to get two direction vectors, then multiply across and subtract.</p><p>Three triples, worked out. Read the sign, then the turn.</p>`,
        v: tbl(
          ["p → a → b", "a − p", "b − p", "cross", "turn"],
          [
            { c: ["(2,0) → (5,1) → (3,4)", "(3, 1)", "(1, 4)", "3·4 − 1·1 = <b>11</b>", "left"], hl: true },
            { c: ["(1,3) → (4,4) → (6,1)", "(3, 1)", "(5, −2)", "3·(−2) − 1·5 = <b>−11</b>", "right"], bad: true },
            { c: ["(0,2) → (2,3) → (6,5)", "(2, 1)", "(6, 3)", "2·3 − 1·6 = <b>0</b>", "straight"] },
          ],
        ),
        c: {
          q: "p = (0,0), a = (3,2), b = (6,4). What does the cross product say?",
          o: ["Left turn: it is positive", "Right turn: it is negative", "Collinear: it is zero"],
          a: 2,
          why: "3·4 − 2·6 = 12 − 12 = 0. b is just a stretched along the same line (b = 2a), so the three points are collinear.",
        },
      },
      {
        t: "Screen coordinates flip it",
        b: `<p>The sign rule assumes <b>y points up</b>, as on a maths graph. Screens and images put y <b>downwards</b>, which mirrors the picture.</p><p>With y down, the same formula gives a <b>positive</b> number for a turn that <i>looks</i> clockwise. Either flip y (use −y) or flip your reading of the sign. Pick one and stick to it.</p>`,
        v: F.compare(
          { title: "y up (maths)", c: "teal", body: `positive = left turn<br>(counter-clockwise)` },
          { title: "y down (screen)", c: "rose", body: `positive = right turn<br>(clockwise on screen)` },
        ),
        c: {
          q: "A drawing library has y pointing down. You use the maths formula unchanged and get a positive value. How does the turn look on screen?",
          o: [
            "Counter-clockwise, exactly as in maths",
            "Clockwise, because the picture is mirrored",
            "It is impossible to tell without more information",
          ],
          a: 1,
          why: "Mirroring y reverses orientation, so the sign means the opposite of what it does on a maths graph.",
        },
      },
      {
        t: "Area, and inside or outside",
        b: `<p>The cross product is also <b>twice the signed area</b> of the triangle p, a, b. Halve it to get the area. Its sign is the turn.</p><p>And it answers <b>is q inside?</b> For a convex polygon walked counter-clockwise, q is inside only if it turns <b>left</b> of every edge.</p>`,
        v: `<svg class="fig" viewBox="0 0 460 190" style="max-height:180px"><polygon points="30,160 130,160 90,40" fill="rgba(28,176,246,.14)" stroke="var(--blue)" stroke-width="3" class="draw"/><text x="80" y="118" class="fig-sub" style="fill:var(--blue)">area = |cross| ÷ 2</text><polygon points="250,160 430,150 440,60 330,25 260,70" fill="rgba(88,204,2,.08)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/><circle cx="350" cy="105" r="7" fill="var(--amber)" class="fi"/><text x="350" y="130" class="fig-sub">left of every edge: inside</text></svg>`,
        c: {
          q: "For p → a → b the cross product is −14. What is the triangle's area, and which way does the walk turn?",
          o: ["Area 7, a right turn", "Area 14, a left turn", "Area −14, a right turn"],
          a: 0,
          why: "Area is |−14| ÷ 2 = 7 (never negative). The negative sign means a right (clockwise) turn.",
        },
      },
    ],
    guide: [
      "Click any three points in order. A path appears and the turn is reported.",
      "Find one left turn and one right turn.",
      "Predict the sign <i>before</i> clicking the third point.",
    ],
  };

  N.register({
    id: "a5-orient",
    subject: "algo",
    lecture: 5,
    order: 2,
    num: "5.2",
    title: "Left turn or right?",
    blurb:
      "Click three points. The cross product tells you which way the path turns — the single test every hull algorithm is built on.",
    render(root) {
      root.appendChild(header(this, ""));
      let picks = [];
      const card =
        el(`<div class="card"><div id="svg"></div><div class="stat-row"><div class="stat"><small>Pick order</small><b id="pk">—</b></div><div class="stat violet"><small>cross product</small><b id="cp">—</b></div><div class="stat teal"><small>Turn</small><b id="tn">—</b></div></div>
        <div class="controls"><button class="btn ghost" id="rs">Clear picks</button></div></div>`);
      root.appendChild(card);
      function draw() {
        const edges =
          picks.length === 3
            ? [
                [picks[0], picks[1]],
                [picks[1], picks[2]],
              ]
            : picks.length === 2
              ? [[picks[0], picks[1]]]
              : [];
        qs("#svg", card).innerHTML = svg(
          picks,
          edges.map((e) => [e[0], e[1], "var(--violet)"]),
        );
        qsa(".pt", card).forEach((c) =>
          c.addEventListener("click", () => {
            if (picks.length < 3) {
              picks.push(c.dataset.p);
              draw();
            }
          }),
        );
        qs("#pk", card).textContent = picks.join(" → ") || "—";
        if (picks.length === 3) {
          const t = turn(picks[0], picks[1], picks[2]);
          qs("#cp", card).textContent = t.toFixed(0);
          qs("#tn", card).textContent = Math.abs(t) < 1 ? "collinear" : t > 0 ? "LEFT" : "RIGHT";
          qs("#tn", card).style.color = Math.abs(t) < 1 ? "var(--amber)" : "var(--teal)";
        } else {
          qs("#cp", card).textContent = "—";
          qs("#tn", card).textContent = "—";
        }
      }
      qs("#rs", card).onclick = () => {
        picks = [];
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a5-or-1",
          q: "Walking A → C → D (bottom edge toward the right). Is the turn left or right?",
          opts: ["Left", "Right", "Collinear"],
          a: 0,
          why: "A(60,230)→C(190,245)→D(330,210) is a left turn (cross product positive in math coords). Convexity = consistent turn direction.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-or-2",
          q: "Now walk G → E → D (from the top, out to the right, then down towards the bottom). Which way does it turn?",
          opts: ["Right: a clockwise turn", "Left: a counter-clockwise turn", "Collinear"],
          a: 0,
          why: "Going round the outside of the set in the order G, E, D is a clockwise lap, so each turn is a right turn. That is why gift wrapping, which the lecture runs clockwise, keeps turning right.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "One cross product per triple: sign = turn direction, 0 = collinear.",
            "Hull vertices make consistent turns; interior points don't.",
            "This O(1) test is the engine inside gift wrapping AND Graham scan.",
            "Half the cross product is the triangle's area. With y pointing down (screens) the sign reads the other way.",
          ],
          "Hull building = a sequence of turn tests.",
        ),
      );
    },
  });

  /* ============ 5.2 Gift wrapping ============ */
  L["a5-wrap"] = {
    sum: "Gift wrapping (Jarvis march) walks around the outside like wrapping a present: from each hull point, it swings a line around until it hits the point that keeps <b>every other point on one side</b>. The cost depends on the <b>size of the answer</b>, O(n·h).",
    steps: [
      {
        t: "Start somewhere guaranteed",
        b: `<p>The leftmost point must be on the hull, because nothing is further out in that direction. Start there. If two points tie for leftmost, take the one with the greatest y.</p><p>The lecture also invents a <b>reference point r</b> straight above it, which is not in the data. It only gives the first angle something to be measured from.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 200" style="max-height:190px"><line x1="60" y1="10" x2="60" y2="190" stroke="var(--line-2)" stroke-dasharray="4 4"/><circle cx="60" cy="110" r="9" fill="var(--amber)" class="fi"/><circle cx="60" cy="40" r="6" fill="none" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="3 3" class="fi"/><text x="78" y="44" class="fig-sub" style="fill:var(--violet);text-anchor:start">r (made up)</text><text x="78" y="114" class="fig-sub" style="text-anchor:start">h = leftmost</text>${[
          [170, 60],
          [200, 150],
          [300, 90],
          [260, 175],
          [350, 140],
          [140, 120],
        ]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="var(--text-faint)" class="fi"/>`)
          .join("")}</svg>`,
        c: {
          q: "Why does the lecture invent a reference point r straight above the start?",
          o: [
            "No previous hull edge exists yet, so it gives a baseline direction",
            "It is the second hull vertex, which is found by sorting the points first",
            "It stops the algorithm from ever visiting the leftmost point again later",
          ],
          a: 0,
          why: "After the first step, r is simply the previous hull vertex. At the very start there is none, so a made-up point above h gives the angle a baseline.",
        },
      },
      {
        t: "Swing the line",
        b: `<p>From the current point, try every other point as the "next" one. Keep the candidate that makes <b>all</b> the others lie to one side of it. That edge touches nothing inside, so it's a hull edge.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 200" role="img" aria-label="From the current point on the left, a line swings to the next hull point, with every other point on its left" style="max-height:190px"><circle cx="50" cy="160" r="7" fill="var(--amber)"/><text x="50" y="186" class="fig-sub">current</text>${[
          [180, 175, "var(--teal)"],
          [150, 110, "var(--text-faint)"],
          [300, 150, "var(--text-faint)"],
          [250, 60, "var(--text-faint)"],
        ]
          .map(
            ([x, y, c]) =>
              `<line x1="50" y1="160" x2="${x}" y2="${y}" stroke="${c}" stroke-width="${c.includes("teal") ? 3 : 1.2}" stroke-dasharray="${c.includes("teal") ? "" : "4 4"}" class="${c.includes("teal") ? "draw" : "fi"}"/><circle cx="${x}" cy="${y}" r="6" fill="${c}" class="fi"/>`,
          )
          .join(
            "",
          )}<text x="210" y="195" class="fig-sub" style="fill:var(--teal)">every other point is on the left of this edge → hull edge</text></svg>`,
        c: {
          type: "cat",
          q: "Gift wrapping costs O(n·h), where h is the number of hull points. For each set of points, which method is cheaper: gift wrapping, or a method costing O(n log n)?",
          buckets: ["Gift wrapping wins", "O(n log n) wins"],
          items: [
            ["10,000 points, but only 6 of them form the hull", 0],
            ["500 points all sitting on a circle", 1],
            ["2,000 points scattered inside a small triangle", 0],
            ["300 points in a ring, with only a few inside", 1],
          ],
          hint: "Compare n·h with n log n. Is h small or close to n?",
          why: "It's output-sensitive: a tiny hull means n·h is much less than n log n (6 or 3 hull points). When most points are on the hull, h is close to n and n·h approaches n², so n log n wins.",
        },
      },
      {
        t: "The lecture's pseudocode",
        b: `<p>The lecture sweeps <b>clockwise</b>. Each round it measures the angle <b>r–h–p</b> for every candidate p, keeps the smallest, then moves on: <b>r ← h</b>, <b>h ← p<sub>min</sub></b>.</p><p>The candidates are <b>(S minus H) plus H[0]</b>: everything not yet on the hull, plus the start, so the loop can close. It stops when h gets back to H[0].</p>`,
        v: pseudo(
          [
            "h ← leftmost point of S (tie: greatest y)",
            "r ← a point straight above h",
            "H ← empty list",
            "while h ≠ H[0]:",
            "    append h to H",
            "    minangle ← 2π",
            "    for p in (S minus H) plus H[0]:",
            "        if angle(r, h, p) < minangle:",
            "            minangle ← angle;  pmin ← p",
            "    r ← h;  h ← pmin",
            "return H",
          ],
          [7, 8],
        ),
        c: {
          q: "In the pseudocode, which lines pick the next hull vertex?",
          o: [
            "The if inside the for loop",
            "The line that sets r ← h after every round of the loop",
            "The line that appends h to the list H at the top of each round",
          ],
          a: 0,
          why: "The for loop plus its if is the tournament: every candidate's angle is compared with the best so far. The other lines just record the result and move on.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Press <b>play</b> or step with the arrows. At each vertex you will see the clockwise angle to every candidate. The smallest wins.</p><p>It will pause and ask you to tap the winner. Drag any point and the wrap restarts.</p>`,
        v: (box, life) => NIC.shared.algoP5x.wrapRun(box, life),
      },
      {
        t: "Adding up the cost",
        b: `<p>One round per hull point, and round <i>i</i> checks about |S| − i + 1 candidates (the hull so far drops out). Adding them up:</p><p>$$\\sum_{i=1}^{|H|}(|S|-i+1)=|S||H|-\\tfrac12|H|^2+\\tfrac12|H| = O(|S|\\,|H|)$$</p><p>For 7 points and a hull of 5 that is 7+6+5+4+3 = 25 checks. Great when most points are inside; slow when they're all on the edge.</p>`,
        v: F.bars(
          [
            ["h = 5 of 1000", 5000, "teal", "n·h"],
            ["n log n", 10000, "violet"],
            ["h = 1000 of 1000", 1000000, "rose", "n·h"],
          ],
          { max: 1000000, fmt: (v) => v.toLocaleString() },
        ),
        c: {
          q: "A hull of 5 points among 1000. Which is the better estimate of gift wrapping's work?",
          o: ["About 5,000 checks", "About 1,000,000 checks", "About 10 checks"],
          a: 0,
          why: "n·h = 1000 × 5 = 5,000. The cost follows the size of the output, h, which is what output-sensitive means.",
        },
      },
      {
        t: "Output-sensitive",
        b: `<p>Most algorithms are timed against the <b>input size</b> n. Gift wrapping is timed against the input <b>and the answer</b>: O(n·h). A thousand points that all sit in a blob with a 4-point hull are cheap. The same thousand on a circle are expensive.</p><span class="key">Same n, different h, very different time.</span>`,
        v: F.compare(
          { title: "n = 1000, h = 4", c: "teal", body: `about 4,000 checks<br>wrapping is quick` },
          { title: "n = 1000, h = 1000", c: "rose", body: `about 1,000,000 checks<br>wrapping is slow` },
        ),
        c: {
          q: 'What does "output-sensitive" mean for gift wrapping?',
          o: [
            "Its running time depends on how many points end up on the hull",
            "It prints each hull vertex as soon as it has been found",
            "It only works correctly when the final output is already sorted",
          ],
          a: 0,
          why: "The h in O(n·h) is the size of the output. Smaller answer, less work.",
        },
      },
    ],
    guide: [
      "Press <b>Wrap</b> and step through the hull; before each press, guess the next hull point.",
      "Watch the hull close: 5 of the 7 points are on it, and B and F are inside.",
      "Notice there's no sorting at all, unlike Graham scan.",
    ],
  };

  N.register({
    id: "a5-wrap",
    subject: "algo",
    lecture: 5,
    order: 3,
    num: "5.3",
    title: "Gift wrapping (Jarvis march)",
    blurb: "Wrap a rubber band around the point set — each step takes the most extreme turn.",
    render(root) {
      root.appendChild(header(this, ""));
      // Jarvis march trace (math coords: use -y)
      const names = Object.keys(PTS);
      const start = names.reduce((m, n) => (PTS[n][0] < PTS[m][0] ? n : m));
      const march = [start];
      let cur = start;
      for (let guard = 0; guard < 20; guard++) {
        let nxt = names.find((n) => n !== cur);
        for (const cand of names) {
          if (cand === cur || cand === nxt) continue;
          const t = turn(cur, nxt, cand);
          if (t < 0 || (t === 0 && dist(cur, cand) > dist(cur, nxt))) nxt = cand;
        }
        if (nxt === start) break;
        march.push(nxt);
        cur = nxt;
      }
      function dist(a, b) {
        const dx = PTS[a][0] - PTS[b][0],
          dy = PTS[a][1] - PTS[b][1];
        return dx * dx + dy * dy;
      }
      let i = 0;
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="st">Wrap ▸ next vertex</button><button class="btn ghost" id="rs">Reset</button><span class="faint">this demo wraps anticlockwise; the lecture goes clockwise</span></div>
        <div id="svg"></div><div class="stat-row"><div class="stat"><small>Hull so far</small><b id="hl"></b></div><div class="stat amber"><small>Steps</small><b id="n"></b></div></div></div>`);
      root.appendChild(card);
      function draw() {
        const edges = [];
        for (let k = 0; k < i; k++) edges.push([march[k], march[k + 1]]);
        qs("#svg", card).innerHTML = svg(march.slice(0, i + 1), edges);
        qs("#hl", card).textContent = march.slice(0, i + 1).join(" → ");
        qs("#n", card).textContent = i;
      }
      qs("#st", card).onclick = () => {
        if (i < march.length - 1) {
          i++;
          draw();
        }
      };
      qs("#rs", card).onclick = () => {
        i = 0;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a5-wr-1",
          q: "Wrapping from A, the next hull vertex is…",
          opts: [
            "B, because it's the nearest point to A on the plane",
            "C: every other point stays on one side",
            "G, because it's the topmost point in the whole set",
          ],
          a: 1,
          why: "Nearest ≠ hull. The next vertex is the point where every candidate lies on the same side of the edge — that's C.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-wr-2",
          q: "A thousand points, but the hull has just 4 corners. Roughly how many checks does gift wrapping make?",
          opts: ["About 4,000", "About 10,000", "About 1,000,000"],
          a: 0,
          why: "Four sweeps of about a thousand points each: n·h ≈ 4,000. Sorting would cost roughly n log n ≈ 10,000, so here wrapping wins.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Each wrap step scans all n points → O(n·h) total, output-sensitive.",
            "Great when few points are on the hull; degrades to O(n²) when all are.",
            "No sorting needed — just turn tests.",
          ],
          "Stand on the hull, swing the band, take the extreme.",
        ),
      );
    },
  });
  Object.assign(partScope, { PTS, cross, svg, turn, pseudo, tbl });
})();
