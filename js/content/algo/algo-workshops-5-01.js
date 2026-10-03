/* Algorithms, Phase 5 workshop: code the convex hull (Graham scan built on the turn test).
   5.C "Code the hull" (code lab). Three small blanks: the turn test, the pivot, and the pop rule.
   The scene replays the learner's own trace: a rubber band that grows one point at a time. */
(function () {
  const partScope = (NIC.shared.algoWorkshops5 = NIC.shared.algoWorkshops5 || {});

  const N = NIC,
    { qs } = N;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();

  /* ---------- the reference algorithm (only used to work out the expected answers) ---------- */
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  function refHull(points) {
    let pivot = points[0];
    for (const q of points) if (q[1] < pivot[1] || (q[1] === pivot[1] && q[0] < pivot[0])) pivot = q;
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    const order = points
      .filter((q) => q !== pivot)
      .sort((a, b) => {
        const t = cross(pivot, a, b);
        return t > 0 ? -1 : t < 0 ? 1 : d2(pivot, a) - d2(pivot, b);
      });
    const stack = [pivot];
    for (const p of order) {
      while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) stack.pop();
      stack.push(p);
    }
    return stack;
  }

  // Test inputs. y points UP, like a graph. Points are listed in a shuffled order on purpose.
  const T_TRI = [
    [4, 3],
    [0, 0],
    [4, 0],
  ];
  const T_SQ = [
    [3, 3],
    [6, 6],
    [0, 0],
    [0, 6],
    [6, 0],
  ];
  const T_COL = [
    [6, 3],
    [0, 0],
    [3, 0],
    [6, 6],
    [0, 3],
    [6, 0],
    [0, 6],
  ];
  const T_NINE = [
    [5, 3],
    [9, 5],
    [1, 2],
    [6, 6],
    [3, 5],
    [7, 9],
    [4, 1],
    [2, 8],
    [7, 2],
  ];

  const STARTER = `from functools import cmp_to_key


def convex_hull(points):
    # The turn test: which way does the path o -> a -> b bend?
    # positive = left turn, negative = right turn, 0 = straight line.
    def orient(o, a, b):
        # YOUR CODE: return the cross product (a - o) x (b - o)
        return 0

    def dist2(a, b):
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

    # 1. The pivot: the lowest point (the leftmost one if two are equally low).
    pivot = points[0]
    for q in points:
        # YOUR CODE: if q is lower than pivot (smaller y), or level with it but further left, pivot = q
        pass
    trace({"type": "pivot", "pivot": list(pivot)})

    # 2. Sort the rest anticlockwise around the pivot, using your turn test.
    def compare(a, b):
        t = orient(pivot, a, b)
        if t > 0:
            return -1
        if t < 0:
            return 1
        return dist2(pivot, a) - dist2(pivot, b)

    rest = [q for q in points if q != pivot]
    order = sorted(rest, key=cmp_to_key(compare))
    trace({"type": "order", "pivot": list(pivot), "order": [list(q) for q in order]})

    # 3. Scan with a stack. The stack is the rubber band so far.
    stack = [pivot]
    for p in order:
        while len(stack) >= 2:
            a = stack[-2]
            b = stack[-1]
            t = orient(a, b, p)
            pop = False
            # YOUR CODE: set pop = True when a -> b -> p is not a left turn (a right turn or straight on)
            pass
            trace({"type": "test", "a": list(a), "b": list(b), "p": list(p), "t": t, "pop": pop, "stack": [list(s) for s in stack]})
            if not pop:
                break
            gone = stack.pop()
            trace({"type": "pop", "gone": list(gone), "stack": [list(s) for s in stack]})
        stack.append(p)
        trace({"type": "push", "p": list(p), "stack": [list(s) for s in stack]})
    trace({"type": "done", "stack": [list(s) for s in stack]})
    return stack`;
  const SOLUTION = STARTER.replace(
    "        # YOUR CODE: return the cross product (a - o) x (b - o)\n        return 0",
    "        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])",
  )
    .replace(
      "        # YOUR CODE: if q is lower than pivot (smaller y), or level with it but further left, pivot = q\n        pass",
      "        if q[1] < pivot[1] or (q[1] == pivot[1] and q[0] < pivot[0]):\n            pivot = q",
    )
    .replace(
      "            # YOUR CODE: set pop = True when a -> b -> p is not a left turn (a right turn or straight on)\n            pass",
      "            if t <= 0:\n                pop = True",
    );

  /* ---------- the scene ---------- */
  const SW = 520,
    SH = 300,
    PAD = 36;
  const letter = (i) => String.fromCharCode(65 + i);
  const sgn = (v) => (v > 0 ? "+" + v : v < 0 ? "−" + -v : "0");

  function scene() {
    return {
      build(stage, test) {
        const pts = test.args[0];
        const xs = pts.map((p) => p[0]),
          ys = pts.map((p) => p[1]);
        const minx = Math.min(...xs),
          maxx = Math.max(...xs),
          miny = Math.min(...ys),
          maxy = Math.max(...ys);
        const k = Math.min((SW - 2 * PAD) / (maxx - minx || 1), (SH - 2 * PAD) / (maxy - miny || 1));
        const ox = (SW - (maxx - minx) * k) / 2,
          oy = (SH - (maxy - miny) * k) / 2;
        const xy = pts.map((p) => [ox + (p[0] - minx) * k, SH - oy - (p[1] - miny) * k]);
        stage.innerHTML = `<svg class="aw5-svg" viewBox="0 0 ${SW} ${SH}" role="img" aria-label="Points on a grid with a rubber band being built around them">
          <polygon class="aw5-hullfill" points=""/>
          <g>${pts.map((_, i) => `<line class="aw5-ray" data-r="${i}"/>`).join("")}</g>
          <polyline class="aw5-chain" points=""/><line class="aw5-chain aw5-grow" style="opacity:0"/>
          <line class="aw5-try"/>
          <g>${pts.map((_, i) => `<g class="aw5-pt" data-k="${i}" transform="translate(${xy[i][0]} ${xy[i][1]})"><circle class="c" r="20"/><text class="l">${letter(i)}</text><g class="aw5-num" transform="translate(15 -15)"><circle r="9"/><text></text></g></g>`).join("")}</g>
          <g class="aw5-badge" style="opacity:0"><rect x="-46" y="-12" width="92" height="24" rx="12"/><text></text></g></svg>
          <div class="aw5-stack"></div>
          <div class="aw5-coords">${pts.map((p, i) => `<b>${letter(i)}</b> (${p[0]}, ${p[1]})`).join(" · ")}</div>`;
        const svg = qs("svg", stage);
        const h = {
          pts,
          xy,
          svg,
          stack: qs(".aw5-stack", stage),
          q: (s) => qs(s, svg),
          pt: (i) => qs(`.aw5-pt[data-k="${i}"]`, svg),
          idx: (p) => pts.findIndex((q) => p && q[0] === p[0] && q[1] === p[1]),
          last: null,
        };
        this.reset(h);
        return h;
      },
      reset(h) {
        draw(h, { pivot: -1, order: null, stack: [], out: new Set(), cur: -1, test: null, closed: false }, null, false);
      },
      frame(h, f, { i, frames, animate }) {
        if (!f) return this.reset(h);
        // Rebuild the picture from the start of the trace, so stepping back and scrubbing are exact.
        const st = { pivot: -1, order: null, stack: [], out: new Set(), cur: -1, test: null, closed: false };
        for (let n = 0; n <= i; n++) {
          const x = frames[n];
          if (!x || typeof x !== "object") continue;
          if (x.type === "pivot") {
            st.pivot = h.idx(x.pivot);
            st.stack = st.pivot >= 0 ? [st.pivot] : [];
            st.cur = -1;
            st.test = null;
          } else if (x.type === "order") {
            st.order = (x.order || []).map(h.idx);
            if (st.pivot < 0) st.pivot = h.idx(x.pivot);
          } else if (x.type === "test") {
            st.stack = (x.stack || []).map(h.idx);
            st.cur = h.idx(x.p);
            st.test = x;
          } else if (x.type === "pop") {
            st.stack = (x.stack || []).map(h.idx);
            st.out.add(h.idx(x.gone));
            st.test = null;
          } else if (x.type === "push") {
            st.stack = (x.stack || []).map(h.idx);
            st.cur = h.idx(x.p);
            st.test = null;
          } else if (x.type === "done") {
            st.stack = (x.stack || []).map(h.idx);
            st.closed = true;
            st.cur = -1;
            st.test = null;
          }
        }
        draw(h, st, f, animate);
      },
      caption(f, { i, frames, test }) {
        if (!f || typeof f !== "object") return "";
        const pts = test.args[0],
          idx = (p) => pts.findIndex((q) => p && q[0] === p[0] && q[1] === p[1]),
          nm = (p) => {
            const k = idx(p);
            return k < 0 ? "?" : `<b>${letter(k)}</b>`;
          };
        if (f.type === "pivot") return `Pivot: ${nm(f.pivot)}. Nothing is lower, so the rubber band must touch it.`;
        if (f.type === "order")
          return `Sorted anticlockwise around the pivot (the purple numbers): ${(f.order || []).map(nm).join(" → ")}.`;
        if (f.type === "test") {
          const tc = cross(f.a, f.b, f.p),
            lab = (v) => (v > 0 ? "left turn" : v < 0 ? "right turn" : "straight on");
          const head = `Turn ${nm(f.a)} → ${nm(f.b)} → ${nm(f.p)}: your <code>orient</code> gave <b>${typeof f.t === "number" ? sgn(f.t) : "nothing useful"}</b>, and your code ${f.pop ? "<b>pops</b>" : "<b>keeps</b>"} ${nm(f.b)}.`;
          if (typeof f.t !== "number" || Math.sign(f.t) !== Math.sign(tc))
            return `${head} <b>But the true cross product is ${sgn(tc)} (${lab(tc)}).</b> Check <code>orient</code>.`;
          if (!!f.pop !== tc <= 0)
            return `${head} ${tc > 0 ? "A left turn" : tc < 0 ? "A right turn" : "Straight on"} should <b>${tc <= 0 ? "pop" : "keep"}</b> ${nm(f.b)}. Check the pop rule.`;
          return `${head} ${tc > 0 ? `A left turn: ${nm(f.b)} is a corner so far.` : tc < 0 ? `A right turn: ${nm(f.b)} dents the band, so it goes.` : `Straight on: ${nm(f.b)} sits on an edge, not a corner, so it goes.`}`;
        }
        if (f.type === "pop") return `Pop ${nm(f.gone)}. The band pulls tight again.`;
        if (f.type === "push") return `Push ${nm(f.p)}. The band grows.`;
        if (f.type === "done")
          return `Done: the hull is ${(f.stack || []).map(nm).join(" → ")}, then back to the start.`;
        return "";
      },
    };
    function draw(h, st, f, animate) {
      const { xy, pts } = h,
        P = (k) => xy[k];
      pts.forEach((_, k) => {
        const g = h.pt(k);
        g.classList.toggle("piv", k === st.pivot);
        g.classList.toggle("on", st.stack.includes(k) && k !== st.pivot);
        g.classList.toggle("cand", k === st.cur && !!st.test);
        g.classList.toggle("top", !!st.test && k === h.idx(st.test.b));
        g.classList.toggle("out", st.out.has(k));
        const rk = st.order ? st.order.indexOf(k) : -1,
          num = qs(".aw5-num", g);
        num.classList.toggle("on", rk >= 0);
        qs("text", num).textContent = rk >= 0 ? rk + 1 : "";
        const ray = h.q(`[data-r="${k}"]`);
        if (st.pivot >= 0) {
          ["x1", "y1", "x2", "y2"].forEach((a, j) =>
            ray.setAttribute(a, [P(st.pivot)[0], P(st.pivot)[1], P(k)[0], P(k)[1]][j]),
          );
        }
        ray.classList.toggle("on", !!st.order && k !== st.pivot);
      });
      const pts2 = (list) =>
        list
          .filter((k) => k >= 0)
          .map((k) => P(k).join(","))
          .join(" ");
      h.q(".aw5-chain:not(.aw5-grow)").setAttribute(
        "points",
        pts2(st.closed ? st.stack.concat(st.stack.slice(0, 1)) : st.stack),
      );
      h.q(".aw5-hullfill").setAttribute("points", pts2(st.stack));
      h.q(".aw5-hullfill").classList.toggle("on", st.closed);
      // the candidate segment and its turn badge
      const tr = h.q(".aw5-try"),
        bd = h.q(".aw5-badge");
      if (st.test && h.idx(st.test.b) >= 0 && h.idx(st.test.p) >= 0) {
        const b = P(h.idx(st.test.b)),
          p = P(h.idx(st.test.p)),
          tc = cross(st.test.a, st.test.b, st.test.p),
          kind = tc > 0 ? "left" : tc < 0 ? "right" : "flat";
        [
          ["x1", b[0]],
          ["y1", b[1]],
          ["x2", p[0]],
          ["y2", p[1]],
        ].forEach(([a, v]) => tr.setAttribute(a, v));
        tr.setAttribute("class", `aw5-try on ${kind}`);
        const mx = Math.max(54, Math.min(SW - 54, (b[0] + p[0]) / 2)),
          my = Math.max(16, Math.min(SH - 16, (b[1] + p[1]) / 2 - 22));
        bd.setAttribute("transform", `translate(${mx} ${my})`);
        bd.setAttribute("class", `aw5-badge ${kind}`);
        bd.style.opacity = 1;
        qs("text", bd).textContent = (tc > 0 ? "LEFT " : tc < 0 ? "RIGHT " : "STRAIGHT ") + (tc === 0 ? "" : sgn(tc));
      } else {
        tr.setAttribute("class", "aw5-try");
        bd.style.opacity = 0;
      }
      h.stack.innerHTML = `<small>stack</small>${st.stack.map((k, j) => `<span class="aw5-cell ${j === st.stack.length - 1 ? "top" : ""}">${letter(k)}</span>`).join("")}${f && f.type === "pop" && h.idx(f.gone) >= 0 ? `<span class="aw5-cell gone">${letter(h.idx(f.gone))}</span>` : ""}`;
      if (!animate || !fxOn() || !f) return;
      if (f.type === "push" && st.stack.length >= 2) {
        const a = P(st.stack[st.stack.length - 2]),
          b = P(st.stack[st.stack.length - 1]),
          g = h.q(".aw5-grow");
        [
          ["x1", a[0]],
          ["y1", a[1]],
          ["x2", b[0]],
          ["y2", b[1]],
        ].forEach(([n, v]) => g.setAttribute(n, v));
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        g.style.opacity = 1;
        g.animate(
          [
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDasharray: len, strokeDashoffset: 0 },
          ],
          { duration: 300, easing: "ease-out" },
        ).finished.then(
          () => (g.style.opacity = 0),
          () => (g.style.opacity = 0),
        );
      } else if (f.type === "pop" && h.idx(f.gone) >= 0) {
        const c = qs("circle.c", h.pt(h.idx(f.gone)));
        c.animate([{ transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
      } else if (f.type === "test" && st.cur >= 0) {
        qs("circle.c", h.pt(st.cur)).animate([{ transform: "scale(1.3)" }, { transform: "scale(1)" }], {
          duration: 240,
          easing: "ease-out",
        });
      }
    }
  }
  Object.assign(partScope, { SOLUTION, STARTER, T_COL, T_NINE, T_SQ, T_TRI, refHull, scene });
})();
