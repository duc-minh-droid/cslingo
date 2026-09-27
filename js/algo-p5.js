/* Phase 5 — Convex Hulls: orientation tests, gift wrapping, Graham scan */
(function () {
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
    const lower = [], upper = [];
    for (const p of pts) { while (lower.length >= 2 && cr(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
    for (const p of pts.slice().reverse()) { while (upper.length >= 2 && cr(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
    return lower.slice(0, -1).concat(upper.slice(0, -1)).map((p) => p.n);
  }

  function svg(hlPts, edges, extras = "") {
    const hull = hullOf(Object.keys(PTS));
    const s = [`<svg class="viz" viewBox="0 0 470 290" style="max-height:290px">`];
    s.push(`<polygon points="${hull.map((n) => PTS[n].join(",")).join(" ")}" fill="rgba(88,204,2,0.07)" stroke="var(--line-2)" stroke-dasharray="4 4"/>`);
    (edges || []).forEach(([a, b, c]) => s.push(`<line x1="${PTS[a][0]}" y1="${PTS[a][1]}" x2="${PTS[b][0]}" y2="${PTS[b][1]}" stroke="${c || "var(--teal)"}" stroke-width="3"/>`));
    Object.entries(PTS).forEach(([n, [x, y]]) => {
      const on = (hlPts || []).includes(n);
      s.push(`<circle cx="${x}" cy="${y}" r="17" fill="var(--panel-2)" stroke="${on ? "var(--amber)" : "var(--teal)"}" stroke-width="${on ? 3.5 : 2}" data-p="${n}" class="pt" style="cursor:pointer"/><text x="${x}" y="${y + 5}" fill="var(--text)" font-size="13" font-weight="700" text-anchor="middle" style="pointer-events:none">${n}</text>`);
    });
    return s.join("") + extras + "</svg>";
  }

  /* ============ 5.1 Orientation ============ */
  L["a5-orient"] = {
    sum: "The <b>convex hull</b> is the rubber band you'd get by stretching it around a set of pins. Every hull algorithm is built on one tiny test: walking from p to a to b, do you turn <b>left</b> or <b>right</b>?",
    steps: [
      { t: "The rubber-band picture", b: `<p>Hammer pins into a board and stretch a rubber band around them all. When you let go, it snaps onto the outermost pins. Those pins form the <b>convex hull</b>. Pins inside the band don't touch it.</p>`,
        v: `<svg class="fig" viewBox="0 0 460 250" style="max-height:230px"><polygon points="60,200 190,215 330,180 410,90 230,25" fill="rgba(88,204,2,.1)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/>${[[60, 200, 1], [190, 215, 1], [330, 180, 1], [410, 90, 1], [230, 25, 1], [160, 140, 0], [250, 110, 0], [300, 130, 0]].map(([x, y, h]) => `<circle cx="${x}" cy="${y}" r="7" fill="${h ? "var(--teal)" : "var(--text-faint)"}" class="fi"/>`).join("")}<text x="250" y="150" class="fig-sub">inside pins don't touch the band</text></svg>` },
      { t: "The turn test", b: `<p>Walk from <b>p</b> to <b>a</b>, then look towards <b>b</b>. Which way do you turn?</p><p>One formula answers it, the <b>cross product</b>: <code>(a − p) × (b − p) = (aₓ−pₓ)(b_y−p_y) − (a_y−p_y)(bₓ−pₓ)</code>.</p>`,
        v: F.frames([
          { t: "<b>positive</b> → left turn (counter-clockwise)", v: `<svg class="fig" viewBox="0 0 150 90"><path d="M20 75 L75 55 L95 12" fill="none" stroke="var(--teal)" stroke-width="3" class="draw"/><circle cx="20" cy="75" r="4" fill="var(--text)"/><circle cx="75" cy="55" r="4" fill="var(--text)"/><circle cx="95" cy="12" r="5" fill="var(--teal)"/></svg>` },
          { t: "<b>negative</b> → right turn (clockwise)", v: `<svg class="fig" viewBox="0 0 150 90"><path d="M20 75 L75 55 L130 78" fill="none" stroke="var(--rose)" stroke-width="3" class="draw"/><circle cx="20" cy="75" r="4" fill="var(--text)"/><circle cx="75" cy="55" r="4" fill="var(--text)"/><circle cx="130" cy="78" r="5" fill="var(--rose)"/></svg>` },
          { t: "<b>zero</b> → collinear (straight on)", v: `<svg class="fig" viewBox="0 0 150 90"><path d="M20 75 L75 50 L130 25" fill="none" stroke="var(--amber)" stroke-width="3" class="draw"/><circle cx="20" cy="75" r="4" fill="var(--text)"/><circle cx="75" cy="50" r="4" fill="var(--text)"/><circle cx="130" cy="25" r="5" fill="var(--amber)"/></svg>` },
        ]),
        c: { q: "p → a → b gives a cross product of 0. What does that mean?", o: ["A left turn", "A right turn", "The three points are collinear: the path doesn't turn"], a: 2, why: "Zero means the two direction vectors are parallel, so it's a straight line. Collinear points are the classic hull edge case." } },
      { t: "Why hulls care about turns", b: `<p>Walk around a convex shape counter-clockwise and <b>every</b> turn is a left turn. If some point makes you turn right, it's denting the shape inward, so it can't be a hull corner.</p><span class="key">No angles, no trig: one multiply-and-subtract per triple.</span>` },
    ],
    guide: ["Click any three points in order. A path appears and the turn is reported.", "Find one left turn and one right turn.", "Predict the sign <b>before</b> clicking the third point."],
  };

  N.register({
    id: "a5-orient", subject: "algo", lecture: 5, order: 1, num: "5.1",
    title: "Left turn or right?",
    blurb: "Click three points. The cross product tells you which way the path turns — the single test every hull algorithm is built on.",
    render(root) {
      root.appendChild(header(this, ""));
      let picks = [];
      const card = el(`<div class="card"><div id="svg"></div><div class="stat-row"><div class="stat"><small>Pick order</small><b id="pk">—</b></div><div class="stat violet"><small>cross product</small><b id="cp">—</b></div><div class="stat teal"><small>Turn</small><b id="tn">—</b></div></div>
        <div class="controls"><button class="btn ghost" id="rs">Clear picks</button></div></div>`);
      root.appendChild(card);
      function draw() {
        const edges = picks.length === 3 ? [[picks[0], picks[1]], [picks[1], picks[2]]] : picks.length === 2 ? [[picks[0], picks[1]]] : [];
        qs("#svg", card).innerHTML = svg(picks, edges.map((e) => [e[0], e[1], "var(--violet)"]));
        qsa(".pt", card).forEach((c) => c.addEventListener("click", () => { if (picks.length < 3) { picks.push(c.dataset.p); draw(); } }));
        qs("#pk", card).textContent = picks.join(" → ") || "—";
        if (picks.length === 3) {
          const t = turn(picks[0], picks[1], picks[2]);
          qs("#cp", card).textContent = t.toFixed(0);
          qs("#tn", card).textContent = Math.abs(t) < 1 ? "collinear" : t > 0 ? "LEFT" : "RIGHT";
          qs("#tn", card).style.color = Math.abs(t) < 1 ? "var(--amber)" : "var(--teal)";
        } else { qs("#cp", card).textContent = "—"; qs("#tn", card).textContent = "—"; }
      }
      qs("#rs", card).onclick = () => { picks = []; draw(); };
      draw();
      root.appendChild(predict({ id: "a5-or-1", q: "Walking A → C → D (bottom edge toward the right). Is the turn left or right?", opts: ["Left — hull boundary keeps turning one way", "Right", "Collinear"], a: 0,
        why: "A(60,230)→C(190,245)→D(330,210) is a left turn (cross product positive in math coords). Convexity = consistent turn direction." }));
      root.appendChild(takeaways([
        "One cross product per triple: sign = turn direction, 0 = collinear.",
        "Hull vertices make consistent turns; interior points don't.",
        "This O(1) test is the engine inside gift wrapping AND Graham scan.",
      ], "Hull building = a sequence of turn tests."));
    },
  });

  /* ============ 5.2 Gift wrapping ============ */
  L["a5-wrap"] = {
    sum: "Gift wrapping (Jarvis march) walks around the outside like wrapping a present: from each hull point, it swings a line around until it hits the point that keeps <b>every other point on one side</b>.",
    steps: [
      { t: "Start somewhere guaranteed", b: `<p>The leftmost point must be on the hull, because nothing is further out in that direction. Start there.</p>` },
      { t: "Swing the line", b: `<p>From the current point, try every other point as the \"next\" one. Keep the candidate that makes <b>all</b> the others lie to its left. That edge touches nothing inside, so it's a hull edge.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 200" style="max-height:190px"><circle cx="50" cy="160" r="7" fill="var(--amber)"/><text x="50" y="186" class="fig-sub">current</text>${[[180, 175, "var(--teal)"], [150, 110, "var(--text-faint)"], [300, 150, "var(--text-faint)"], [250, 60, "var(--text-faint)"]].map(([x, y, c]) => `<line x1="50" y1="160" x2="${x}" y2="${y}" stroke="${c}" stroke-width="${c.includes("teal") ? 3 : 1.2}" stroke-dasharray="${c.includes("teal") ? "" : "4 4"}" class="${c.includes("teal") ? "draw" : "fi"}"/><circle cx="${x}" cy="${y}" r="6" fill="${c}" class="fi"/>`).join("")}<text x="210" y="195" class="fig-sub" style="fill:var(--teal)">every other point is on the left of this edge → hull edge</text></svg>`,
        c: { q: "Gift wrapping costs O(n·h), where h is the number of hull points. When does it beat O(n log n)?", o: ["Never", "When h is small: few hull points and many inside ones", "When h = n"], a: 1, why: "It's output-sensitive. A tiny hull means n·h ≪ n log n. In the worst case (every point on the hull) it's O(n²)." } },
      { t: "Cost = one sweep per hull point", b: `<p>Each step checks all n points, and there's one step per hull corner, so the total is <b>O(n·h)</b>. Great when most points are inside; slow when they're all on the edge.</p>`,
        v: F.bars([["h = 5 of 1000", 5000, "teal", "n·h"], ["n log n", 10000, "violet"], ["h = 1000 of 1000", 1000000, "rose", "n·h"]], { max: 1000000, fmt: (v) => v.toLocaleString() }) },
    ],
    guide: ["Before each <b>Wrap</b> press, guess the next hull point.", "Watch the hull close: 5 of the 7 points are on it, and B and F are inside.", "Notice there's no sorting at all, unlike Graham scan."],
  };

  N.register({
    id: "a5-wrap", subject: "algo", lecture: 5, order: 2, num: "5.2",
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
        march.push(nxt); cur = nxt;
      }
      function dist(a, b) { const dx = PTS[a][0] - PTS[b][0], dy = PTS[a][1] - PTS[b][1]; return dx * dx + dy * dy; }
      let i = 0;
      const card = el(`<div class="card"><div class="controls"><button class="btn primary" id="st">Wrap ▸ next vertex</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="svg"></div><div class="stat-row"><div class="stat"><small>Hull so far</small><b id="hl"></b></div><div class="stat amber"><small>Steps</small><b id="n"></b></div></div></div>`);
      root.appendChild(card);
      function draw() {
        const edges = [];
        for (let k = 0; k < i; k++) edges.push([march[k], march[k + 1]]);
        qs("#svg", card).innerHTML = svg(march.slice(0, i + 1), edges);
        qs("#hl", card).textContent = march.slice(0, i + 1).join(" → ");
        qs("#n", card).textContent = i;
      }
      qs("#st", card).onclick = () => { if (i < march.length - 1) { i++; draw(); } };
      qs("#rs", card).onclick = () => { i = 0; draw(); };
      draw();
      root.appendChild(predict({ id: "a5-wr-1", q: "Wrapping from A, the next hull vertex is…", opts: ["B — nearest point", "C — the most extreme turn keeps all points on one side", "G — the topmost"], a: 1,
        why: "Nearest ≠ hull. The next vertex is the point where every candidate lies on the same side of the edge — that's C." }));
      root.appendChild(takeaways([
        "Each wrap step scans all n points → O(n·h) total, output-sensitive.",
        "Great when few points are on the hull; degrades to O(n²) when all are.",
        "No sorting needed — just turn tests.",
      ], "Stand on the hull, swing the band, take the extreme."));
    },
  });

  /* ============ 5.3 Graham scan ============ */
  L["a5-graham"] = {
    sum: "Graham scan sorts the points by angle around the lowest point, then walks them in order with a <b>stack</b>. Any point that makes a right turn gets popped. Sort once, scan once: <b>O(n log n)</b>.",
    steps: [
      { t: "Sort by angle", b: `<p>The lowest point is on the hull, so use it as the <b>anchor</b>. Sort the rest by the angle they make with the anchor, sweeping counter-clockwise. Hull corners will now come up in boundary order.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 200" style="max-height:190px"><circle cx="150" cy="180" r="8" fill="var(--amber)"/><text x="150" y="198" class="fig-sub">anchor</text>${[[380, 150, 1], [360, 90, 2], [250, 110, 3], [230, 20, 4], [120, 90, 5], [20, 160, 6]].map(([x, y, k]) => `<line x1="150" y1="180" x2="${x}" y2="${y}" stroke="var(--line-2)" stroke-dasharray="3 4" class="fi"/><circle cx="${x}" cy="${y}" r="6" fill="var(--violet)" class="fi"/><text x="${x + 10}" y="${y - 8}" class="fig-sub" style="fill:var(--violet)">${k}</text>`).join("")}</svg>` },
      { t: "The stack pops dents", b: `<p>Push points one by one. Before each push, look at the top two points plus the new one. If they make a <b>right turn (or go straight)</b>, the middle point is a dent, so pop it and check again.</p>`,
        v: F.frames([
          { t: "Stack C, D, E, then F arrives", v: F.cells([{ v: "C" }, { v: "D" }, { v: "E" }, "←", { v: "F", c: "violet" }]) },
          { t: "E → F → G turns right, so pop F", v: F.cells([{ v: "C" }, { v: "D" }, { v: "E" }, { v: "F", c: "rose", sub: "pop" }]) },
          { t: "E → G is a left turn: push G", v: F.cells([{ v: "C" }, { v: "D" }, { v: "E" }, { v: "G", c: "teal" }]) },
        ]),
        c: { q: "Why does a point get popped?", o: ["It's far away", "It makes a right turn (or straight line), so it's inside the hull", "The sort order was wrong"], a: 1, why: "A wrong-direction turn means the middle point sits inside the edge that skips it." } },
      { t: "Where the time goes", b: `<p>Every point is pushed once and popped at most once, so the scan is O(n). The <b>sort</b> costs O(n log n), and that dominates.</p><p>Compared with gift wrapping at O(n·h): Graham wins when the hull is big, and wrapping wins when it's tiny.</p>` },
    ],
    guide: ["Press <b>Scan ▸</b> and watch the stack on the right.", "Before each step, predict: will the next point push, or pop something first?", "At the end the stack holds exactly the hull: C D E G A."],
  };

  N.register({
    id: "a5-graham", subject: "algo", lecture: 5, order: 3, num: "5.3",
    title: "Graham scan stack",
    blurb: "Sort by angle, then let the stack pop every point that dents the hull inward.",
    render(root) {
      root.appendChild(header(this, ""));
      const names = Object.keys(PTS);
      const anchor = names.reduce((m, n) => (PTS[n][1] > PTS[m][1] || (PTS[n][1] === PTS[m][1] && PTS[n][0] < PTS[m][0]) ? n : m));
      const rest = names.filter((n) => n !== anchor).sort((a, b) => {
        const aa = Math.atan2(-(PTS[a][1] - PTS[anchor][1]), PTS[a][0] - PTS[anchor][0]);
        const bb = Math.atan2(-(PTS[b][1] - PTS[anchor][1]), PTS[b][0] - PTS[anchor][0]);
        return aa - bb; // counter-clockwise sweep from the anchor's right
      });
      // build stack trace
      const stack = [anchor, rest[0]], events = [`push ${rest[0]}`];
      const trace = [[anchor, rest[0]]];
      for (let i = 1; i < rest.length; i++) {
        const p = rest[i];
        while (stack.length >= 2 && turn(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) {
          events.push(`pop ${stack[stack.length - 1]} (right/straight turn)`);
          stack.pop(); trace.push(stack.slice());
        }
        stack.push(p); events.push(`push ${p}`); trace.push(stack.slice());
      }
      let i = 0;
      const card = el(`<div class="card"><div class="controls"><button class="btn primary" id="st">Scan ▸</button><button class="btn ghost" id="rs">Reset</button><span class="faint">anchor: ${anchor} (lowest)</span></div>
        <div class="grid two"><div id="svg"></div><div><h3>Stack</h3><div class="mono" id="stk"></div><div class="faint" id="ev" style="margin-top:10px"></div></div></div></div>`);
      root.appendChild(card);
      function draw() {
        const cur = trace[Math.min(i, trace.length - 1)];
        const edges = [];
        for (let k = 0; k < cur.length - 1; k++) edges.push([cur[k], cur[k + 1]]);
        qs("#svg", card).innerHTML = svg(cur, edges);
        qs("#stk", card).innerHTML = cur.map((n) => `<span class="pill teal">${n}</span>`).join(" ");
        qs("#ev", card).textContent = `event ${i}: ${events[i]}`;
        qs("#st", card).disabled = i >= events.length - 1;
      }
      qs("#st", card).onclick = () => { if (i < events.length - 1) { i++; draw(); } };
      qs("#rs", card).onclick = () => { i = 0; draw(); };
      draw();
      root.appendChild(predict({ id: "a5-gr-1", q: "Interior point B gets pushed, then popped. The pop happens because…", opts: ["B is close to the anchor", "Adding the next point makes B a right turn — interior points always dent inward", "B was mis-sorted"], a: 1,
        why: "Interior points always end up on the wrong side of a hull edge — the stack catches them at the next turn test." }));
      root.appendChild(takeaways([
        "Sort once by polar angle → scan once with a stack → O(n log n).",
        "Pop = reject: a non-left turn means the middle point is interior.",
        "vs gift wrapping O(n·h): Graham wins when the hull is big; wrapping wins when it's tiny.",
      ], "Sorted order + a stack = each point handled twice at most."));
    },
  });

})();
