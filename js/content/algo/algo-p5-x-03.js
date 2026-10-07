/* algo-p5-x-03: Phase 5: 5.7 onion peeling, and the gift-wrapping runner used by 5.3. */
(function () {
  const x = (NIC.shared.algoP5x = NIC.shared.algoP5x || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const { hullOf, area, board, reg } = x;
  const { PTS } = NIC.shared.algoP5;

  /* ============ 5.7 Onion peeling ============ */
  const ON_RAW = [
    [0, 3],
    [4, 0],
    [10, 1],
    [12, 5],
    [9, 9],
    [3, 8],
    [3, 4],
    [6, 2],
    [9, 3],
    [10, 6],
    [7, 7],
    [4, 6],
    [5, 4],
    [7, 4],
    [7, 5],
    [5, 5],
    [6, 4.5],
  ];
  const ON = ON_RAW.map((p, i) => [p[0] * 2, p[1] * 2, String.fromCharCode(65 + i)]);
  /** Repeatedly take the hull of what is left. Returns [{pts (in hull order), area}] */
  function peel(pts) {
    let rem = pts.slice();
    const out = [];
    while (rem.length) {
      const h = hullOf(rem);
      out.push({ pts: h, area: h.length >= 3 ? area(h) : 0 });
      rem = rem.filter((p) => !h.includes(p));
    }
    return out;
  }
  const ONL = peel(ON),
    ON_A0 = ONL[0].area;
  const nested = (layers) =>
    `<svg class="fig" viewBox="0 0 470 280" style="max-height:270px">${layers
      .map((l, i) => {
        const P = l.pts.map((p) => `${24 + p[0] * 18},${262 - p[1] * 13}`);
        return l.pts.length >= 3
          ? `<polygon points="${P.join(" ")}" fill="${["rgba(255,75,75,.07)", "rgba(255,150,0,.09)", "rgba(88,204,2,.12)", "rgba(28,176,246,.14)"][i % 4]}" stroke="${["var(--rose)", "var(--amber)", "var(--teal)", "var(--blue)"][i % 4]}" stroke-width="3" stroke-linejoin="round" class="draw"/>`
          : "";
      })
      .join(
        "",
      )}${layers.map((l, i) => l.pts.map((p) => `<circle cx="${24 + p[0] * 18}" cy="${262 - p[1] * 13}" r="6" fill="${["var(--rose)", "var(--amber)", "var(--teal)", "var(--blue)"][i % 4]}" class="fi"/>`).join("")).join("")}</svg>`;

  function onionRun(box, life) {
    const P = Object.fromEntries(ON.map((p) => [p[2], [Math.round(24 + p[0] * 18), Math.round(262 - p[1] * 13)]]));
    const names = Object.keys(P);
    function* frames() {
      let rem = names.slice(),
        layer = 0,
        asks = 0;
      const gone = {};
      const snap = (x) => ({ gone: { ...gone }, rem: rem.slice(), layer, ...x });
      yield snap({
        cap: `${names.length} points. Onion peeling: take the hull of what is left, <b>peel</b> its corners off, and repeat until nothing remains.`,
      });
      while (rem.length) {
        layer++;
        const hl = hullOf(rem.map((n) => [P[n][0], P[n][1], n])).map((p) => p[2]);
        const ask =
          layer >= 2 && asks < 2
            ? {
                q: `Layer ${layer} is the hull of the points that are left. <b>Tap a point that will be on it.</b>`,
                pick: ".rn-hull-pt",
                a: hl,
                why: `The outermost points that remain: <b>${hl.join(" ")}</b>. Every point already peeled is gone, so the hull moves inwards.`,
              }
            : null;
        if (ask) asks++;
        yield snap({
          hull: hl,
          ask,
          cap: `Layer ${layer}: the hull of the ${rem.length} points left has <b>${hl.length}</b> corner${hl.length === 1 ? "" : "s"}: ${hl.join(" ")}.`,
        });
        hl.forEach((n) => (gone[n] = layer));
        rem = rem.filter((n) => !hl.includes(n));
        yield snap({
          cap: rem.length
            ? `Peel them off. <b>${rem.length}</b> point${rem.length === 1 ? "" : "s"} left.`
            : "Peel them off. Nothing is left.",
          mood: rem.length ? "idle" : "love",
        });
      }
      yield snap({
        mood: "love",
        cap: `Done: <b>${layer} layers</b>. A point's number is its depth: how many layers of hull lie outside it.`,
      });
    }
    F.run(box, life, {
      code: [
        "rest = all points; layer = 0",
        "while rest is not empty:",
        "  layer = layer + 1",
        "  H = convex hull of rest",
        "  give every point of H the number layer",
        "  rest = rest minus H",
      ],
      build(stage, api) {
        const NS = "http://www.w3.org/2000/svg";
        const svgEl = document.createElementNS(NS, "svg");
        svgEl.setAttribute("viewBox", "0 0 470 290");
        svgEl.setAttribute("class", "fig rn-svg rn-hull rn-wrap-svg");
        svgEl.style.maxHeight = "290px";
        svgEl.innerHTML = `<style>.rn-wrap-svg .rn-hull-pt.rn-pickable .rn-hull-c{stroke:var(--violet);stroke-width:4;cursor:pointer}</style><polyline class="rn-hull-chain" points=""/>
          <g class="rn-hull-pts">${names.map((n) => `<g class="rn-hull-pt" data-k="${n}"><g class="rn-hull-body"><circle class="rn-halo" r="20"/><circle class="rn-hull-c" r="13"/><text class="rn-hull-l" y="5" style="font-size:11px">${n}</text></g><g class="rn-hull-ord" transform="translate(13 -13)"><circle r="9"/><text y="4"></text></g></g>`).join("")}</g>`;
        stage.appendChild(svgEl);
        const stk = document.createElement("div");
        stk.className = "rn-hull-stack";
        stage.appendChild(stk);
        const q = (s) => svgEl.querySelector(s);
        const scene = { svgEl, stk, q, last: null, pt: (n) => q(`.rn-hull-pt[data-k="${n}"]`) };
        names.forEach((n) =>
          api.drag(scene.pt(n), {
            move(x, y) {
              P[n] = [Math.round(x), Math.round(y)];
              if (scene.last) draw(scene, scene.last, { instant: true, prev: null, i: 0 });
            },
            end() {
              api.recompute("Points moved. Peeling again from the start.");
            },
          }),
        );
        return scene;
      },
      draw,
      frames,
    });
    function draw(s, f, c) {
      s.last = f;
      names.forEach((n) => {
        const g = s.pt(n),
          [x, y] = P[n],
          inHull = !!f.hull && f.hull.includes(n);
        g.setAttribute("transform", `translate(${x} ${y})`);
        g.classList.toggle("rn-hull-out", f.gone[n] !== undefined);
        g.classList.toggle("rn-hull-on", inHull);
        const ord = g.querySelector(".rn-hull-ord");
        ord.querySelector("text").textContent = f.gone[n] !== undefined ? f.gone[n] : "";
        F.rn.to(c, ord, { opacity: f.gone[n] !== undefined ? 1 : 0 }, 0, 0.3);
      });
      const ch = s.q(".rn-hull-chain");
      ch.setAttribute(
        "points",
        f.hull
          ? f.hull
              .concat(f.hull.length > 2 ? [f.hull[0]] : [])
              .map((n) => P[n].join(","))
              .join(" ")
          : "",
      );
      ch.classList.toggle("rn-hull-closed", !!f.hull && f.hull.length > 2);
      F.rn.to(c, ch, { opacity: f.hull ? 1 : 0 }, 0, 0.25);
      s.stk.innerHTML = `<small>${f.hull ? "layer " + f.layer : "left"}</small>${(f.hull || f.rem).map((n) => `<span class="rn-hull-cell">${n}</span>`).join("")}`;
    }
  }

  L["a5-onion"] = {
    sum: "<b>Onion peeling</b> takes the hull, removes its corners, and repeats. The layers show how deep each point sits, and the inner layers give a steadier picture of where the points really are.",
    steps: [
      {
        t: "Peel the outer layer",
        b: `<p>Take the convex hull of all the points and <b>remove those corner points</b>. What is left has a new, smaller hull. Remove that too, and carry on until no points remain.</p><p>The result is a set of <b>nested hulls</b>, like the layers of an onion. For the 17 points below, there are four.</p>`,
        v: nested(ONL),
        c: {
          q: "In onion peeling, what happens to the points on the first hull?",
          o: [
            "They are removed, then a hull of the rest is found",
            "They are kept, and the hull is then made a little bigger",
            "They are sorted by angle and then the scan is restarted",
          ],
          a: 0,
          why: "Peeling means deleting the hull's corner points. The next layer is the hull of whatever is left.",
        },
      },
      {
        t: "Watch it peel",
        b: `<p>Press <b>play</b> or step through. Each layer is found with a fresh hull computation, then its corners are numbered and removed.</p><p>It will ask you to tap a point on an upcoming layer. Drag any point and the peel reruns.</p>`,
        v: (box, life) => onionRun(box, life),
      },
      {
        t: "Why peel at all?",
        b: `<p>Say you want to estimate where an animal <b>really lives</b> from its sightings. The outer hull is stretched by a few <b>rare, far-off sightings</b>. Peel those away and the inner layers describe the core of its range.</p><p>Notice how fast the area shrinks here (in square units):</p>`,
        v: F.bars(
          ONL.slice(0, 3).map((l, i) => [`Layer ${i + 1} hull`, l.area, ["rose", "amber", "teal"][i]]),
          { max: ON_A0, fmt: (v) => v.toFixed(1) },
        ),
        c: {
          q: "One stray sighting is added far from the rest of the herd. Which hull changes most?",
          o: [
            "The outer hull, because the stray point is a corner of it",
            "The innermost hull, because the stray point sits there",
            "None of them: peeling hides every outlier",
          ],
          a: 0,
          why: "A far-off point is an extreme, so it lands on the outer layer and stretches it. Peel that layer and the outlier is gone, while the inner layers barely move.",
        },
      },
      {
        t: "Depth",
        b: `<p>The number a point gets is its <b>depth</b>: how many hulls enclose it. Depth 1 is the boundary, and the biggest number is the centre of the cloud.</p><p>This is a two-dimensional cousin of the median: the deepest points are the most central.</p>`,
        v: F.cells(
          ON.filter((p) => [0, 6, 12, 16].includes(ON.indexOf(p))).map((p, i) => ({
            v: p[2],
            sub: "depth " + (i + 1),
            c: ["rose", "amber", "teal", "blue"][i],
          })),
          { label: "one point per layer" },
        ),
        c: {
          q: "A point has depth 3. What does that tell you?",
          o: [
            "It sits inside two complete outer layers",
            "It is the third point that was added to the data set",
            "It is the third farthest of all the points from the centre",
          ],
          a: 0,
          why: "Depth counts the layers peeled off before the point itself was reached. Depth 3 means two full hulls enclose it.",
        },
      },
      {
        t: "What it costs",
        b: `<p>Each layer needs <b>one hull computation</b> on the points that remain, for example a Graham scan at O(n log n). So peeling to the bottom costs one hull per layer.</p><p>A cloud can have many layers: each needs at least 3 points, so up to about n/3. Peeling <i>everything</i> is therefore expensive for large clouds. If you only want the core, stop after a few layers.</p>`,
        v: F.cells([
          { v: "layer 1", sub: "1 hull", c: "rose" },
          "→",
          { v: "layer 2", sub: "1 hull", c: "amber" },
          "→",
          { v: "layer 3", sub: "1 hull", c: "teal" },
          "→",
          { v: "…", sub: "k hulls in all" },
        ]),
        c: {
          q: "A cloud peels into 40 layers. How many hull computations does the full peel run?",
          o: ["40, one per layer", "1, since the hull is found once", "40 × 40, since each layer re-sorts everything"],
          a: 0,
          why: "Each layer is one hull of the points still left. The later hulls are smaller, but there is still one per layer.",
        },
      },
    ],
    guide: [
      "Drag the slider to peel layers off the cloud and watch the green hull shrink.",
      "Read the numbers: points left, hull area and what share of the original area remains.",
      "Answer the questions after the demo.",
    ],
  };

  reg({
    id: "a5-onion",
    order: 7,
    num: "5.7",
    title: "Onion peeling",
    blurb: "Peel the hull off again and again. The inner layers are a cleaner estimate of where the points really are.",
    render(root) {
      root.appendChild(header(this, ""));
      const K = ONL.length;
      let k = 0;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Peel the cloud</h2><span class="faint">number on a dot = the layer it was peeled in</span></div><div class="controls" id="sl"></div><div id="bd"></div>
        <div class="stat-row"><div class="stat"><small>Points left</small><b id="pl"></b></div><div class="stat teal"><small>Hull of what is left</small><b id="ha"></b></div><div class="stat amber"><small>Share of full-cloud area</small><b id="sh"></b></div></div></div>`);
      root.appendChild(card);
      const sl = N.slider("Layers peeled", 0, K, 1, 0);
      qs("#sl", card).appendChild(sl);
      function draw() {
        const peeledPts = new Map();
        ONL.slice(0, k).forEach((l, i) => l.pts.forEach((p) => peeledPts.set(p, i + 1)));
        const left = ON.filter((p) => !peeledPts.has(p)),
          hl = hullOf(left);
        qs("#bd", card).innerHTML = board({
          w: 24,
          h: 18,
          S: 18,
          grid: false,
          poly: hl,
          dots: ON.map((p) =>
            peeledPts.has(p)
              ? { p, r: 8, o: 0.45, t: peeledPts.get(p), c: "rose" }
              : { p, r: 7, c: hl.includes(p) ? "teal" : null },
          ),
        });
        const a = hl.length >= 3 ? area(hl) : 0;
        qs("#pl", card).textContent = left.length;
        qs("#ha", card).textContent = a.toFixed(1) + " sq";
        qs("#sh", card).textContent = Math.round((100 * a) / ON_A0) + "%";
      }
      sl.onInput((v) => {
        k = v;
        draw();
      });
      draw();
      root.appendChild(
        predict({
          id: "a5-on-1",
          q: "As you drag the slider up and peel more layers, what happens to the area of the hull of the points that are left?",
          opts: [
            "It never grows: each new hull sits inside the one before",
            "It grows, because fewer points means a looser fit",
            "It stays the same until the last layer",
          ],
          a: 0,
          why: "The remaining points are a subset of the earlier ones, and every earlier hull encloses them all, so each new hull fits inside the previous one. The area can only shrink or stay equal.",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-on-2",
          q: "The cloud has 17 points. The first two layers have 6 corners each. How many points are left after peeling two layers?",
          opts: ["5", "11", "12"],
          a: 0,
          why: "17 − 6 − 6 = 5. Set the slider to 2 and check: the points left are the inner square and the one in its middle.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Onion peeling: take the hull, remove its corners, repeat. Each layer costs one hull computation.",
            "A point's layer number is its depth: higher means more central.",
            "Peeling a few layers removes outliers and leaves a steadier estimate of an animal's range.",
          ],
          "Peel off the extremes to find the core.",
        ),
      );
    },
  });

  function wrapRun(box, life) {
    const P = Object.fromEntries(Object.entries(PTS).map(([k, v]) => [k, v.slice()]));
    const names = Object.keys(P),
      TAU = Math.PI * 2;
    const deg = (a) => Math.round((a * 180) / Math.PI);
    function* frames() {
      const start = names.reduce((m, n) => (P[n][0] < P[m][0] || (P[n][0] === P[m][0] && P[n][1] < P[m][1]) ? n : m));
      const ang = (h, ref, n) => {
        const a =
          (((Math.atan2(P[n][1] - P[h][1], P[n][0] - P[h][0]) - Math.atan2(ref[1] - P[h][1], ref[0] - P[h][0])) % TAU) +
            TAU) %
          TAU;
        return a < 1e-9 ? TAU : a;
      };
      const d2 = (a, b) => (P[a][0] - P[b][0]) ** 2 + (P[a][1] - P[b][1]) ** 2;
      const H = [];
      let h = start,
        r = [P[h][0], P[h][1] - 110],
        asks = 0;
      const snap = (x) => ({ H: H.slice(), h, r: r.slice(), start, ...x });
      yield snap({
        cap: `Start at the <b>leftmost</b> point, <b>${start}</b>: nothing lies further left, so it is on the hull. The dashed line is the reference <b>r</b>, a made-up point straight above it.`,
        line: 0,
      });
      for (let guard = 0; guard < names.length + 2; guard++) {
        H.push(h);
        const cands = names.filter((n) => n !== h && (!H.includes(n) || n === H[0]));
        const A = {};
        cands.forEach((n) => (A[n] = ang(h, r, n)));
        const deg0 = {};
        cands.forEach((n) => (deg0[n] = deg(A[n])));
        yield snap({
          cands,
          angles: deg0,
          cap: `Standing at <b>${h}</b>. Measure the <b>clockwise angle</b> from the reference line to every candidate (the purple badges, in degrees).`,
          line: 1,
        });
        const best = cands.reduce((m, n) =>
          A[n] < A[m] - 1e-9 || (Math.abs(A[n] - A[m]) <= 1e-9 && d2(h, n) > d2(h, m)) ? n : m,
        );
        const ask =
          asks < 2 && guard >= 1 && best !== start
            ? {
                q: "Which candidate has the <b>smallest</b> clockwise angle? Tap it.",
                pick: ".rn-hull-pt",
                a: [best],
                why: `<b>${best}</b>, at ${deg0[best]}°. Every other point is swung further round, so they all lie on the inner side of the edge ${h}${best}.`,
              }
            : null;
        if (ask) asks++;
        const closes = best === start;
        yield snap({
          cands,
          angles: deg0,
          best,
          ask,
          mood: closes ? "love" : "happy",
          cap: closes
            ? `The smallest angle (${deg0[best]}°) points at <b>${best}</b>, where we began: the loop is closed.`
            : `Smallest angle: <b>${best}</b> at ${deg0[best]}°. The edge <b>${h} → ${best}</b> joins the hull.`,
          line: 2,
        });
        if (closes) break;
        r = P[h].slice();
        h = best;
        yield snap({
          cap: `Move on: <b>h ← ${best}</b>, and the reference <b>r</b> becomes the point we just left. Round again.`,
          line: 3,
        });
      }
      yield snap({
        closed: true,
        mood: "love",
        cap: `Back at ${start}. The hull, clockwise from the left: <b>${H.join(" → ")}</b>. That is ${H.length} sweeps of the ${names.length - 1} other points.`,
        line: 4,
      });
    }
    F.run(box, life, {
      code: [
        "h = leftmost point; r = a point straight above h",
        "measure the clockwise angle r-h-p for each candidate p",
        "pick the p with the smallest angle",
        "add h to the hull; r = h; h = p",
        "stop when h is back at the start",
      ],
      build(stage, api) {
        const NS = "http://www.w3.org/2000/svg";
        const svgEl = document.createElementNS(NS, "svg");
        svgEl.setAttribute("viewBox", "0 0 470 290");
        svgEl.setAttribute("class", "fig rn-svg rn-hull rn-wrap-svg");
        svgEl.style.maxHeight = "290px";
        svgEl.innerHTML = `<style>.rn-wrap-svg .rn-hull-pt.rn-pickable .rn-hull-c{stroke:var(--violet);stroke-width:4;cursor:pointer}</style><g class="rn-hull-rays">${names.map((n) => `<line data-r="${n}"/>`).join("")}</g>
          <polyline class="rn-hull-chain" points=""/><line class="rn-hull-try" style="opacity:0"/><text class="rn-hull-l" data-rl y="0">r</text>
          <g class="rn-hull-pts">${names.map((n) => `<g class="rn-hull-pt" data-k="${n}"><g class="rn-hull-body"><circle class="rn-halo" r="22"/><circle class="rn-hull-c" r="16"/><text class="rn-hull-l" y="5">${n}</text></g><g class="rn-hull-ord" transform="translate(17 -18)"><circle r="13"/><text y="4"></text></g></g>`).join("")}</g>`;
        stage.appendChild(svgEl);
        const stk = document.createElement("div");
        stk.className = "rn-hull-stack";
        stage.appendChild(stk);
        const q = (s) => svgEl.querySelector(s);
        const scene = { svgEl, stk, q, last: null, pt: (n) => q(`.rn-hull-pt[data-k="${n}"]`) };
        names.forEach((n) =>
          api.drag(scene.pt(n), {
            move(x, y) {
              P[n] = [Math.round(x), Math.round(y)];
              if (scene.last) draw(scene, scene.last, { instant: true, prev: null, i: 0 });
            },
            end() {
              api.recompute("Points moved. Wrapping again from the start.");
            },
          }),
        );
        return scene;
      },
      draw,
      frames,
    });
    function draw(s, f, c) {
      s.last = f;
      const at = (n) => P[n];
      const [hx, hy] = at(f.h);
      names.forEach((n) => {
        const g = s.pt(n),
          [x, y] = at(n);
        g.setAttribute("transform", `translate(${x} ${y})`);
        g.classList.toggle("rn-hull-pivot", n === f.start);
        g.classList.toggle("rn-hull-on", f.H.includes(n) && n !== f.start);
        g.classList.toggle("rn-hull-cand", n === f.best);
        g.classList.toggle("rn-hull-top", n === f.h && !f.closed);
        const has = !!(f.angles && f.angles[n] !== undefined);
        const ord = g.querySelector(".rn-hull-ord");
        ord.querySelector("text").textContent = has ? f.angles[n] : "";
        F.rn.to(c, ord, { opacity: has ? 1 : 0 }, 0, 0.3);
        const ray = s.q(`[data-r="${n}"]`);
        ["x1", "y1", "x2", "y2"].forEach((a, j) => ray.setAttribute(a, [hx, hy, x, y][j]));
        F.rn.to(c, ray, { opacity: has ? 1 : 0 }, 0, 0.3);
        if (n === f.best && c.prev && c.prev.best !== n) F.rn.pulse(c, g.querySelector(".rn-hull-body"));
      });
      const chain = f.H.concat(f.best && !f.H.includes(f.best) ? [f.best] : []).concat(f.closed ? [f.start] : []);
      s.q(".rn-hull-chain").setAttribute("points", chain.map((n) => at(n).join(",")).join(" "));
      s.q(".rn-hull-chain").classList.toggle("rn-hull-closed", !!f.closed);
      const tr = s.q(".rn-hull-try"),
        rl = s.q("[data-rl]");
      tr.setAttribute("x1", hx);
      tr.setAttribute("y1", hy);
      tr.setAttribute("x2", f.r[0]);
      tr.setAttribute("y2", f.r[1]);
      rl.setAttribute("x", f.r[0] + 10);
      rl.setAttribute("y", f.r[1] + 4);
      F.rn.to(c, tr, { opacity: f.closed ? 0 : 1 }, 0, 0.25);
      F.rn.to(c, rl, { opacity: f.closed ? 0 : 1 }, 0, 0.25);
      s.stk.innerHTML = `<small>hull</small>${f.H.map((n, j) => `<span class="rn-hull-cell ${j === f.H.length - 1 && !f.closed ? "top" : ""}">${n}</span>`).join("")}`;
    }
  }
  x.wrapRun = wrapRun;
})();
