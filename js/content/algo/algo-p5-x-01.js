/* algo-p5-x-01: Phase 5 shared geometry, 5.1 convex sets and hulls, helpers for 5.8. */
(function () {
  const x = (NIC.shared.algoP5x = NIC.shared.algoP5x || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const reg = (m) => N.register({ subject: "algo", lecture: 5, ...m });

  /* ---------- geometry (maths orientation: y points up) ---------- */
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  /** Strict convex hull (counter-clockwise) by Andrew's monotone chain; returns the same point objects. */
  function hullOf(pts) {
    const P = pts
      .slice()
      .sort((p, q) => p[0] - q[0] || p[1] - q[1])
      .filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
    if (P.length < 3) return P;
    const lo = [],
      up = [];
    for (const p of P) {
      while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (const p of P.slice().reverse()) {
      while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
      up.push(p);
    }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const area = (poly) =>
    Math.abs(
      poly.reduce((s, p, i) => {
        const q = poly[(i + 1) % poly.length];
        return s + (p[0] * q[1] - q[0] * p[1]);
      }, 0),
    ) / 2;
  /** Graham scan; keep = true keeps points that lie on hull edges, false keeps strict corners only. */
  function grahamPts(pts, keep) {
    const piv = pts.reduce((m, p) => (p[1] < m[1] || (p[1] === m[1] && p[0] < m[0]) ? p : m));
    const rest = pts
      .filter((p) => p !== piv)
      .sort((a, b) => {
        const t = cr(piv, a, b);
        return t > 0 ? -1 : t < 0 ? 1 : d2(piv, a) - d2(piv, b);
      });
    let seq = rest;
    if (!keep) {
      seq = [];
      for (const p of rest) {
        const last = seq[seq.length - 1];
        if (last && cr(piv, last, p) === 0) seq[seq.length - 1] = p;
        else seq.push(p);
      }
    }
    const st = [piv, seq[0]];
    for (let i = 1; i < seq.length; i++) {
      const p = seq[i];
      while (
        st.length >= 2 &&
        (keep ? cr(st[st.length - 2], st[st.length - 1], p) < 0 : cr(st[st.length - 2], st[st.length - 1], p) <= 0)
      )
        st.pop();
      st.push(p);
    }
    return st;
  }

  /* ---------- small builders ---------- */
  const pseudo = (lines, on = []) =>
    `<div class="pseudo">${lines.map((t, k) => `<div class="${on.includes(k) ? "on" : ""}">${t}</div>`).join("")}</div>`;
  const tbl = (head, rows) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  /** A board in maths coordinates. dots: [{p, c, t, k, o}]; poly: [[x,y]..]; segs: [[p, q, colour, dash]]. */
  function board({
    w = 12,
    h = 8,
    S = 34,
    pad = 18,
    dots = [],
    poly = null,
    polyCol = "teal",
    segs = [],
    grid = true,
    r = 8,
    id = "",
  } = {}) {
    const W = w * S + pad * 2,
      H = h * S + pad * 2,
      X = (x) => pad + x * S,
      Y = (y) => pad + (h - y) * S;
    const s = [
      `<svg class="viz" ${id ? `id="${id}"` : ""} viewBox="0 0 ${W} ${H}" style="max-height:${H}px;width:100%;touch-action:manipulation" data-w="${w}" data-h="${h}" data-s="${S}" data-pad="${pad}">`,
    ];
    if (grid) {
      for (let i = 0; i <= w; i++)
        s.push(
          `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(h)}" stroke="var(--line-soft)" stroke-width="1"/>`,
        );
      for (let j = 0; j <= h; j++)
        s.push(
          `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(w)}" y2="${Y(j)}" stroke="var(--line-soft)" stroke-width="1"/>`,
        );
    }
    if (poly && poly.length >= 3)
      s.push(
        `<polygon points="${poly.map((p) => X(p[0]) + "," + Y(p[1])).join(" ")}" fill="color-mix(in srgb, var(--${polyCol}) 12%, transparent)" stroke="var(--${polyCol})" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`,
      );
    else if (poly && poly.length === 2)
      s.push(
        `<line x1="${X(poly[0][0])}" y1="${Y(poly[0][1])}" x2="${X(poly[1][0])}" y2="${Y(poly[1][1])}" stroke="var(--${polyCol})" stroke-width="3" stroke-linecap="round"/>`,
      );
    segs.forEach(([p, q, c, dash]) =>
      s.push(
        `<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(q[0])}" y2="${Y(q[1])}" stroke="var(--${c || "violet"})" stroke-width="3" ${dash ? 'stroke-dasharray="6 5"' : ""} stroke-linecap="round"/>`,
      ),
    );
    dots.forEach((d) =>
      s.push(
        `<g ${d.k !== undefined ? `data-k="${d.k}" style="cursor:pointer"` : ""} opacity="${d.o === undefined ? 1 : d.o}"><circle cx="${X(d.p[0])}" cy="${Y(d.p[1])}" r="${d.r || r}" fill="${d.c ? `color-mix(in srgb, var(--${d.c}) 30%, var(--panel))` : "var(--panel-2)"}" stroke="var(--${d.c || "text-faint"})" stroke-width="2.5"/>${d.t ? `<text x="${X(d.p[0])}" y="${Y(d.p[1]) + 4.5}" text-anchor="middle" style="font:900 ${d.r && d.r < 11 ? 10 : 12}px var(--sans);fill:var(--ink);pointer-events:none">${d.t}</text>` : ""}</g>`,
      ),
    );
    return s.join("") + "</svg>";
  }
  const sci = (c) =>
    c
      .toExponential(2)
      .replace(/e([+-])(\d+)/, (m, sg, ex) => " × 10<sup>" + (sg === "-" ? "−" : "") + ex.replace(/^0+/, "") + "</sup>")
      .replace("-", "−");
  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ============ 5.1 Convex sets and hulls ============ */
  const P9 = [
    [2, 1, "A"],
    [6, 0, "B"],
    [9, 2, "C"],
    [8, 6, "D"],
    [4, 7, "E"],
    [1, 4, "F"],
    [5, 3, "G"],
    [6, 5, "H"],
    [3, 3, "I"],
  ];
  const H9 = hullOf(P9);
  const PIN0 = [
    [1, 1],
    [3, 5],
    [6, 6],
    [9, 4],
    [11, 1],
    [5, 2],
    [7, 3],
    [4, 3],
  ];

  L["a5-convex"] = {
    sum: "A set is <b>convex</b> if the straight line between any two of its points stays inside it. The <b>convex hull</b> of some points is the smallest convex set that contains them all: the rubber band round the pins.",
    steps: [
      {
        t: "Why draw a boundary?",
        b: `<p>Rangers log where they spot a wide-roaming animal, and want to estimate its <b>habitat</b>. A robot has to plan a <b>safe, short path</b> past obstacles. Both ask the same thing: what is the outer boundary of a cloud of points?</p><p>The answer is the <b>convex hull</b>.</p>`,
        v: `<svg class="fig" viewBox="0 0 460 230" style="max-height:220px"><polygon points="70,170 150,200 300,190 410,130 380,50 250,25 120,60" fill="rgba(88,204,2,.1)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/>${[
          [70, 170],
          [150, 200],
          [300, 190],
          [410, 130],
          [380, 50],
          [250, 25],
          [120, 60],
          [180, 120],
          [240, 90],
          [300, 130],
          [220, 160],
          [330, 85],
          [150, 100],
          [270, 150],
        ]
          .map(
            ([x, y], i) =>
              `<circle cx="${x}" cy="${y}" r="6" fill="${i < 7 ? "var(--teal)" : "var(--text-faint)"}" class="fi"/>`,
          )
          .join("")}<text x="230" y="125" class="fig-sub" style="fill:var(--teal)">estimated range</text></svg>`,
        c: {
          q: "Rangers log 200 sightings of an animal. What does the convex hull of those sightings give them?",
          o: [
            "The smallest convex area holding every sighting, a first range estimate",
            "The route the animal walked between one sighting and the next one",
            "The average position of all the sightings, found by adding them up",
          ],
          a: 0,
          why: "The hull is the outer boundary, the smallest convex region containing every point. It says nothing about the route or the average.",
        },
      },
      {
        t: "Convex: the segment test",
        b: `<p>A set <b>S</b> is <b>convex</b> if for any two points <b>p, q</b> in S, <b>every point on the straight segment pq</b> is also in S.</p><p>Pick any two points and draw the line. If it ever leaves the shape, the shape is not convex.</p>`,
        v: F.frames([
          {
            t: "<b>Convex</b>: the segment stays inside",
            v: `<svg class="fig" viewBox="0 0 300 180" style="max-height:170px"><ellipse cx="150" cy="90" rx="120" ry="70" fill="rgba(88,204,2,.1)" stroke="var(--teal)" stroke-width="3"/><line x1="70" y1="120" x2="230" y2="55" stroke="var(--teal)" stroke-width="3" class="draw"/><circle cx="70" cy="120" r="6" fill="var(--ink)"/><circle cx="230" cy="55" r="6" fill="var(--ink)"/></svg>`,
          },
          {
            t: "<b>Not convex</b>: the segment leaves the shape",
            v: `<svg class="fig" viewBox="0 0 300 180" style="max-height:170px"><polygon points="40,20 140,20 140,85 260,85 260,160 40,160" fill="rgba(255,75,75,.08)" stroke="var(--rose)" stroke-width="3" stroke-linejoin="round"/><line x1="125" y1="35" x2="245" y2="140" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 5" class="draw"/><circle cx="125" cy="35" r="6" fill="var(--ink)"/><circle cx="245" cy="140" r="6" fill="var(--ink)"/></svg>`,
          },
        ]),
        c: {
          q: "Which shape fails the segment test?",
          o: [
            "A solid circle, because its edge is curved all the way round",
            "A letter L: the segment between its arm tips leaves the shape",
            "A triangle, because it has sharp corners and straight edges",
          ],
          a: 1,
          why: "Between the tips of an L the straight line passes through the empty notch, outside the shape. Circles and triangles keep every such segment inside.",
        },
      },
      {
        t: "The smallest convex set",
        b: `<p>Many convex sets contain a given set of points: a huge box, a big circle. The <b>convex hull</b> is the <b>smallest</b> one. More exactly, it is the <b>intersection of all convex sets</b> that contain the points.</p><p>For a finite set of points in the plane it is a polygon, and its corners are some of the points themselves.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 200" style="max-height:190px"><rect x="60" y="20" width="300" height="160" rx="6" fill="none" stroke="var(--blue)" stroke-width="2" stroke-dasharray="6 5"/><ellipse cx="210" cy="100" rx="150" ry="85" fill="none" stroke="var(--violet)" stroke-width="2" stroke-dasharray="6 5"/><polygon points="150,60 230,50 270,100 210,150 140,120" fill="rgba(88,204,2,.18)" stroke="var(--teal)" stroke-width="3.5" stroke-linejoin="round" class="draw"/>${[
          [150, 60],
          [230, 50],
          [270, 100],
          [210, 150],
          [140, 120],
        ]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="var(--teal)" class="fi"/>`)
          .join(
            "",
          )}<text x="72" y="40" class="fig-sub" style="fill:var(--blue);text-anchor:start">a convex set (box)</text><text x="300" y="172" class="fig-sub" style="fill:var(--violet);text-anchor:start">another (ellipse)</text><text x="210" y="105" class="fig-sub" style="fill:var(--teal)">hull</text></svg>`,
        c: {
          q: "The convex hull of a point set is the ___ of all convex sets that contain the points.",
          o: ["intersection", "union of them", "largest one"],
          a: 0,
          why: "Intersect them all and only what every one of them contains survives, which is the smallest convex set. A union would be bigger, not smaller.",
        },
      },
      {
        t: "What the algorithm must do",
        b: `<p><b>Input:</b> a finite set S of points in the plane.<br><b>Output:</b> a list H of the <b>hull vertices, in order</b> round the boundary. Gift wrapping lists them clockwise, Graham scan counter-clockwise.<br><b>Relation:</b> H describes the smallest convex set containing all of S.</p><span class="key">The output is a subset of the input points: only the corners.</span>`,
        v: F.flow(["Point set S", { t: "Hull algorithm", c: "violet" }, { t: "H: corners in order", c: "teal" }]),
        c: {
          q: "Which could be the output H for an input of 8 points?",
          o: [
            "5 of the input points, in order round the boundary",
            "All 8 input points, sorted by their x-coordinate values",
            "One point placed at the average position of the 8 inputs",
          ],
          a: 0,
          why: "H is the list of corner points in order round the hull. Interior points are left out, and the centre of mass need not even be an input point.",
        },
      },
      {
        t: "Points in, points out",
        b: `<p>The workshop reads a file with one point per line: <code>x, y, label</code>. The output is again a file, and it holds <b>a subset of the input lines</b>: the hull vertices.</p><p>Here nine points. Six lines survive, and G, H and I, which sit inside, are left out.</p>`,
        v: tbl(
          ["x", "y", "label", "in the output?"],
          P9.map((p) => ({
            c: [p[0], p[1], p[2], H9.includes(p) ? "yes: a corner" : "no: inside"],
            hl: H9.includes(p),
          })),
        ),
        c: {
          q: "A file lists 9 points and its hull has 6 corners. How many lines does the output file have?",
          o: ["6", "9", "3"],
          a: 0,
          why: "One line per hull vertex. The 3 interior points are not written out.",
        },
      },
      {
        t: "One-way turns all the way round",
        b: `<p>Here is the property every algorithm leans on. Walk round the hull in order and you only ever turn <b>one way</b>: always left (counter-clockwise) or always right (clockwise).</p><p>If one turn goes the other way, that point dents the shape, so the shape is not convex there and the point is not a corner.</p>`,
        v: `<svg class="fig" viewBox="0 0 400 210" style="max-height:200px"><polygon points="50,170 160,190 280,160 350,90 250,30 100,50" fill="rgba(88,204,2,.08)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round" class="draw"/>${[
          [50, 170, "p0"],
          [160, 190, "p1"],
          [280, 160, "p2"],
          [350, 90, "p3"],
          [250, 30, "p4"],
          [100, 50, "p5"],
        ]
          .map(
            ([x, y, n]) =>
              `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--teal)" stroke-width="2.5" class="fi"/><text x="${x}" y="${y + 4}" class="fig-sub" style="fill:var(--ink)">${n.slice(1)}</text>`,
          )
          .join(
            "",
          )}<text x="200" y="110" class="fig-sub" style="fill:var(--teal)">left, left, left, left, left, left</text></svg>`,
        c: {
          q: "You walk round a polygon making five left turns and one right turn. What can you say?",
          o: [
            "It is not convex: the right turn marks a dent",
            "It is convex, just a slightly unusual one",
            "You must have walked it clockwise",
          ],
          a: 0,
          why: "A convex polygon never changes turn direction. One odd turn out means a dent, which is exactly what hull algorithms look for and reject.",
        },
      },
    ],
    guide: [
      "Tap empty space on the board to add a pin and tap a pin to remove it.",
      "Watch the green band: it always wraps the outermost pins.",
      "Try adding a pin inside the band, then one far outside it. Answer the questions after the demo.",
    ],
  };

  reg({
    id: "a5-convex",
    order: 1,
    num: "5.1",
    title: "Convex sets and hulls",
    blurb: "Pins on a board and a rubber band: what is a convex set, and what is the hull?",
    render(root) {
      root.appendChild(header(this, ""));
      let pins = PIN0.map((p) => p.slice());
      const card =
        el(`<div class="card"><div class="card-head"><h2>Pin board</h2><span class="faint">tap empty space to add a pin, tap a pin to remove it</span></div><div id="bd"></div>
        <div class="stat-row"><div class="stat"><small>Pins</small><b id="n"></b></div><div class="stat teal"><small>Hull corners</small><b id="h"></b></div><div class="stat amber"><small>Inside or on an edge</small><b id="in"></b></div></div>
        <div class="controls"><button class="btn ghost" id="rnd">Add 5 random pins</button><button class="btn ghost" id="rs">Reset</button><button class="btn ghost" id="clr">Clear</button></div></div>`);
      root.appendChild(card);
      function draw() {
        const hl = hullOf(pins);
        qs("#bd", card).innerHTML = board({
          w: 12,
          h: 8,
          poly: hl,
          dots: pins.map((p, k) => ({ p, k, c: hl.includes(p) ? "teal" : null })),
        });
        qs("#n", card).textContent = pins.length;
        qs("#h", card).textContent = hl.length;
        qs("#in", card).textContent = pins.length - hl.length;
      }
      qs("#bd", card).addEventListener("click", (e) => {
        const g = e.target.closest("[data-k]");
        if (g) {
          pins.splice(+g.dataset.k, 1);
          draw();
          return;
        }
        const svg = qs("#bd svg", card),
          rc = svg.getBoundingClientRect(),
          vb = svg.viewBox.baseVal,
          sc = vb.width / rc.width,
          S = +svg.dataset.s,
          pad = +svg.dataset.pad;
        const x = Math.round(((e.clientX - rc.left) * sc - pad) / S),
          y = Math.round(8 - ((e.clientY - rc.top) * sc - pad) / S);
        if (x < 0 || x > 12 || y < 0 || y > 8 || pins.length >= 40 || pins.some((p) => p[0] === x && p[1] === y))
          return;
        pins.push([x, y]);
        draw();
      });
      qs("#rnd", card).onclick = () => {
        for (let i = 0; i < 5 && pins.length < 40; i++) {
          const p = [Math.floor(Math.random() * 13), Math.floor(Math.random() * 9)];
          if (!pins.some((q) => q[0] === p[0] && q[1] === p[1])) pins.push(p);
        }
        draw();
      };
      qs("#rs", card).onclick = () => {
        pins = PIN0.map((p) => p.slice());
        draw();
      };
      qs("#clr", card).onclick = () => {
        pins = [];
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a5-cv-1",
          q: "You press a new pin into the board <b>inside</b> the green band. What happens to the hull?",
          opts: ["It does not change", "It gains a corner", "It loses a corner"],
          a: 0,
          why: "A pin inside the band is already inside the smallest convex set that holds the others, so the band does not move. Only pins outside it can change the hull.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-cv-2",
          q: "The board has the 8 starting pins (5 hull corners, one at (9, 4)). You add a pin far out at (12, 7). How many corners does the hull have now?",
          opts: [
            "6: the new pin simply adds one more corner to the five",
            "5: one corner is gained and an old one falls inside",
            "4: the new pin replaces two of the old corners at once",
          ],
          a: 1,
          why: "(12, 7) is a new corner, and the band stretches to reach it. The old corner at (9, 4) then lies inside the new band, so one corner is gained and one lost: still 5. Try it and see.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Convex: every segment between two members stays inside the set.",
            "The convex hull is the smallest convex set containing all the points (the intersection of all convex supersets).",
            "An algorithm takes points in and returns just the corners, in order. Walking them, you only ever turn one way.",
          ],
          "The hull is the rubber band: only the outermost pins touch it.",
        ),
      );
    },
  });

  const dist = (a, b) => Math.sqrt(d2(a, b));
  /** Two hulls (counter-clockwise, 3+ corners each) are apart if some edge normal separates them with a strict gap. */
  function separated(A, B) {
    for (const poly of [A, B])
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i],
          q = poly[(i + 1) % poly.length],
          nx = q[1] - p[1],
          ny = p[0] - q[0];
        const pa = A.map((v) => v[0] * nx + v[1] * ny),
          pb = B.map((v) => v[0] * nx + v[1] * ny);
        if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return true;
      }
    return false;
  }
  const AB = [
      [0, 1],
      [2, 0],
      [4, 2],
      [3, 5],
      [1, 4],
      [2, 2],
    ],
    BB = [
      [0, 0],
      [2, 1],
      [3, 3],
      [1, 5],
      [0, 3],
      [2, 2],
    ];
  const farthest = (P) => {
    let best = null;
    for (let i = 0; i < P.length; i++)
      for (let j = i + 1; j < P.length; j++) {
        const d = dist(P[i], P[j]);
        if (!best || d > best.d) best = { a: P[i], b: P[j], d };
      }
    return best;
  };
  const DSET = (() => {
    const rnd = mulberry(5),
      o = [];
    while (o.length < 14) o.push([Math.round((1 + 10 * rnd()) * 10) / 10, Math.round((1 + 6 * rnd()) * 10) / 10]);
    return o;
  })();
  Object.assign(x, {
    cr,
    d2,
    hullOf,
    area,
    grahamPts,
    pseudo,
    tbl,
    board,
    sci,
    mulberry,
    reg,
    dist,
    separated,
    farthest,
    DSET,
    AB,
    BB,
  });
})();
