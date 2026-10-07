/* algo-p3-x-07.js: Nelder-Mead engine and scenes (overflow) */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const { NS, P2, nf, vadd, vdist, vmul, vsub } = S;
  const N = NIC;
  const F = N.fig;
  /** One Nelder-Mead iteration, as the lecture states it (both contraction points are computed and compared).
      S = [{p, f}], P = {a: alpha, g: gamma, b: beta, d: delta}. */
  function nmIter(S, f, P = { a: 1, g: 2, b: 0.5, d: 0.5 }) {
    S = S.slice().sort((x, y) => x.f - y.f);
    const D = S.length - 1,
      B = S[0],
      G = S[D - 1],
      W = S[D];
    const C = vmul(
      S.slice(0, D).reduce((s, v) => vadd(s, v.p), Array(D).fill(0)),
      1 / D,
    );
    const dir = vsub(C, W.p),
      R = vadd(C, vmul(dir, P.a)),
      fR = f(R);
    let ev = 1;
    const r = { S, B, G, W, C, R, fR };
    let acc = null;
    if (fR < G.f) {
      if (fR < B.f) {
        const E = vadd(C, vmul(dir, P.g)),
          fE = f(E);
        ev++;
        r.E = E;
        r.fE = fE;
        if (fE < fR) {
          r.op = "expand";
          acc = { p: E, f: fE, key: "E" };
        } else {
          r.op = "reflect";
          r.tried = true;
          acc = { p: R, f: fR, key: "R" };
        }
      } else {
        r.op = "reflect";
        acc = { p: R, f: fR, key: "R" };
      }
    } else {
      const M1 = vsub(C, vmul(dir, P.b)),
        M2 = vadd(C, vmul(dir, P.b)),
        f1 = f(M1),
        f2 = f(M2);
      ev += 2;
      Object.assign(r, { M1, M2, f1, f2 });
      if (f1 < W.f && f1 < f2) {
        r.op = "in";
        acc = { p: M1, f: f1, key: "M1" };
      } else if (f2 < W.f && f2 < f1) {
        r.op = "out";
        acc = { p: M2, f: f2, key: "M2" };
      } else r.op = "shrink";
    }
    let next;
    if (acc) next = S.slice(0, D).concat([{ p: acc.p, f: acc.f }]);
    else
      next = [B].concat(
        S.slice(1).map((v) => {
          const p = vadd(B.p, vmul(vsub(v.p, B.p), P.d));
          ev++;
          return { p, f: f(p) };
        }),
      );
    r.acc = acc;
    r.ev = ev;
    r.next = next.sort((x, y) => x.f - y.f);
    return r;
  }
  /** Whole run with stopping tests. crit = {x: tolx|null, f: tolf|null, sum: tol|null, n: maxIter}. */
  function nmSolve(f, x0, crit, { scale = 1.1 } = {}) {
    const D = x0.length;
    let S = [x0.slice()];
    for (let i = 0; i < D; i++) {
      const x = x0.slice();
      x[i] *= scale;
      S.push(x);
    }
    S = S.map((p) => ({ p, f: f(p) })).sort((a, b) => a.f - b.f);
    let ev = D + 1,
      it = 0;
    const ops = [],
      snaps = [{ it: 0, S: S.map((v) => ({ ...v })) }],
      trail = [S[0].p.slice()];
    const stopWhy = () => {
      const fs = S.map((v) => v.f);
      if (crit.f != null && Math.max(...fs) - Math.min(...fs) < crit.f)
        return "function convergence: the vertex values agree to within the tolerance";
      if (crit.sum != null && fs.reduce((a, b) => a + b, 0) < crit.sum)
        return "the sum of the vertex values dropped below the tolerance";
      if (crit.x != null) {
        let m = 0;
        S.forEach((a) => S.forEach((b) => (m = Math.max(m, vdist(a.p, b.p)))));
        if (m < crit.x) return "domain convergence: all the vertices are close together";
      }
      if (it >= crit.n) return "out of time: the maximum number of iterations was reached";
      return "";
    };
    let why = stopWhy();
    while (!why) {
      const r = nmIter(S, f);
      S = r.next;
      ev += r.ev;
      it++;
      ops.push(r.op);
      trail.push(S[0].p.slice());
      snaps.push({ it, S: S.map((v) => ({ ...v })) });
      why = stopWhy();
    }
    return { S, it, ev, why, ops, trail, snaps };
  }
  const ROSEN = (p) => 100 * (p[1] - p[0] ** 2) ** 2 + (1 - p[0]) ** 2;
  const BOWL = (p) => (p[0] - 3) ** 2 + (p[1] - 2) ** 2; // worked examples (minimum 0 at (3, 2))
  const BOWL2 = (p) => (p[0] - 3.5) ** 2 + (p[1] - 2.2) ** 2; // runner (minimum 0 at (3.5, 2.2), no ties)
  const simplexOf = (f, ...ps) => ps.map((p) => ({ p, f: f(p) }));
  /** Static fitted picture of Nelder-Mead points. pts: {name: {p, c, t, r, dx, dy}}, polys: [{names, c, dash, fill}], lines: [[a, b]] */
  function nmSVG({ pts, polys = [], lines = [], w = 330, h = 230, pad = 36 }) {
    const all = Object.values(pts).map((o) => o.p);
    const xs = all.map((p) => p[0]),
      ys = all.map((p) => p[1]);
    const lo = [Math.min(...xs), Math.min(...ys)],
      hi = [Math.max(...xs), Math.max(...ys)];
    const sc = Math.min((w - 2 * pad) / Math.max(hi[0] - lo[0], 1e-6), (h - 2 * pad) / Math.max(hi[1] - lo[1], 1e-6));
    const ox = (w - sc * (hi[0] - lo[0])) / 2,
      oy = (h - sc * (hi[1] - lo[1])) / 2;
    const X = (x) => ox + sc * (x - lo[0]),
      Y = (y) => h - oy - sc * (y - lo[1]);
    const poly = polys
      .map(
        (o) =>
          `<polygon points="${o.names.map((n) => `${X(pts[n].p[0])},${Y(pts[n].p[1])}`).join(" ")}" fill="${o.fill || "none"}" stroke="${o.c}" stroke-width="2.4" ${o.dash ? 'stroke-dasharray="6 4"' : ""} stroke-linejoin="round"/>`,
      )
      .join("");
    const ln = lines
      .map(
        ([a, b, c2]) =>
          `<line x1="${X(pts[a].p[0])}" y1="${Y(pts[a].p[1])}" x2="${X(pts[b].p[0])}" y2="${Y(pts[b].p[1])}" stroke="${c2 || "var(--line-2)"}" stroke-width="2" stroke-dasharray="3 4"/>`,
      )
      .join("");
    const dots = Object.entries(pts)
      .map(
        ([n, o]) =>
          `<g class="fi"><circle cx="${X(o.p[0])}" cy="${Y(o.p[1])}" r="${o.r || 7}" fill="${o.c}" stroke="var(--bg-2)" stroke-width="2"/><text x="${X(o.p[0]) + (o.dx || 0)}" y="${Y(o.p[1]) + (o.dy === undefined ? -13 : o.dy)}" class="fig-sub" style="fill:var(--text)">${n}${o.t ? ` · ${o.t}` : ""}</text></g>`,
      )
      .join("");
    return `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${ln}${poly}${dots}</svg>`;
  }
  const COLN = {
    B: "var(--teal)",
    G: "var(--amber)",
    W: "var(--rose)",
    C: "var(--text-dim)",
    R: "var(--blue)",
    E: "var(--violet)",
    M1: "var(--amber)",
    M2: "var(--blue)",
  };
  /** Worked-example figure from a real nmIter result. show: which candidates to draw. */
  function moveFig(r, show, { w = 330, h = 230, shrinkTo = false } = {}) {
    const pts = {
      B: { p: r.B.p, c: COLN.B, t: `f=${nf(r.B.f)}`, dy: 24 },
      G: { p: r.G.p, c: COLN.G, t: `f=${nf(r.G.f)}`, dy: 24 },
      W: { p: r.W.p, c: COLN.W, t: `f=${nf(r.W.f)}`, dy: 24 },
      C: { p: r.C, c: COLN.C, r: 5, dy: -11 },
    };
    const lines = [["W", "C"]];
    const candP = { R: [r.R, r.fR], E: [r.E, r.fE], M1: [r.M1, r.f1], M2: [r.M2, r.f2] };
    show.forEach((k) => {
      pts[k] = { p: candP[k][0], c: COLN[k], t: `f=${nf(candP[k][1])}`, r: 6, dy: -12 };
    });
    if (show.includes("R")) lines.push(["C", "R"]);
    const polys = [{ names: ["B", "G", "W"], c: "var(--violet)", fill: "rgba(206,130,255,.14)" }];
    if (r.acc && pts[r.acc.key]) polys.push({ names: ["B", "G", r.acc.key], c: "var(--teal)", dash: true });
    if (shrinkTo) {
      pts.M = { p: vadd(r.W.p, vmul(vsub(r.B.p, r.W.p), 0.5)), c: "var(--teal)", r: 6, dy: -12 };
      pts.N = { p: vadd(r.G.p, vmul(vsub(r.B.p, r.G.p), 0.5)), c: "var(--teal)", r: 6, dy: -12 };
      polys.push({ names: ["B", "M", "N"], c: "var(--teal)", dash: true });
    }
    return nmSVG({ pts, polys, lines, w, h });
  }
  /** Contour picture of f over a view, as a data URL (transparent bands, so dark mode works). */
  function contourCanvas(f, [x0, x1, y0, y1], W = 180, H = 135) {
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d"),
      img = ctx.createImageData(W, H);
    const vals = [];
    let mx = 0;
    for (let j = 0; j < H; j++)
      for (let i = 0; i < W; i++) {
        const v = Math.log(1 + f([x0 + ((x1 - x0) * i) / (W - 1), y1 - ((y1 - y0) * j) / (H - 1)]));
        vals.push(v);
        mx = Math.max(mx, v);
      }
    vals.forEach((v, k) => {
      const t = v / mx,
        band = Math.floor(t * 14) % 2,
        a = 0.1 + 0.5 * (1 - t),
        c = band ? [88, 204, 2] : [28, 176, 246];
      img.data.set([c[0], c[1], c[2], Math.round(a * 255)], k * 4);
    });
    ctx.putImageData(img, 0, 0);
    return cv;
  }
  const contourURL = (f, view, W, H) => contourCanvas(f, view, W, H).toDataURL();
  /** Nelder-Mead scene for runners. bg(X, Y) returns SVG for the background. */
  function nmScene(stage, { view, w = 480, h = 330, bg, star }) {
    const [x0, x1, y0, y1] = view,
      pad = 8;
    const X = (x) => pad + ((x - x0) / (x1 - x0)) * (w - 2 * pad),
      Y = (y) => h - pad - ((y - y0) / (y1 - y0)) * (h - 2 * pad);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("class", "fig rn-svg");
    svg.style.maxHeight = h + "px";
    const cand = (k, colr) =>
      `<g class="ns-cand" data-k="${k}" opacity="0"><circle class="rn-halo" r="14" fill="none" stroke-width="3" opacity="0"/><circle r="7" fill="${colr}" stroke="var(--bg-2)" stroke-width="2"/><text y="-12" class="fig-sub" style="fill:var(--text)">${k.replace("M1", "M₁").replace("M2", "M₂")}</text><text y="22" class="fig-sub ns-fv"></text></g>`;
    svg.innerHTML = `${bg(X, Y)}${star ? `<text x="${X(star[0])}" y="${Y(star[1]) + 6}" class="fig-sub" style="fill:var(--amber);font-size:18px">★</text>` : ""}
      <polyline class="ns-trail" fill="none" stroke="var(--text-faint)" stroke-width="1.6" stroke-dasharray="3 3"/>
      <polygon class="ns-prev" fill="none" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="6 4" opacity="0"/>
      <polygon class="ns-cur" fill="rgba(206,130,255,.2)" stroke="var(--violet)" stroke-width="2.5" stroke-linejoin="round"/>
      <line class="ns-wc" stroke="var(--text-faint)" stroke-dasharray="3 4" stroke-width="1.6" opacity="0"/>
      <g class="ns-cg" opacity="0"><rect x="-5" y="-5" width="10" height="10" fill="var(--text-dim)" transform="rotate(45)"/><text y="-11" class="fig-sub">C</text></g>
      ${cand("R", COLN.R)}${cand("E", COLN.E)}${cand("M1", COLN.M1)}${cand("M2", COLN.M2)}
      ${["B", "G", "W"].map((k, i) => `<g class="ns-v rs-v" data-i="${i}" data-k="${k}"><circle class="rn-halo" r="15" fill="none" stroke-width="3" opacity="0"/><circle class="ns-vc" r="8" stroke="var(--bg-2)" stroke-width="2"/><text class="ns-vl fig-sub" y="-13" style="fill:var(--text)">${k}</text><text class="ns-fv fig-sub" y="24"></text></g>`).join("")}`;
    stage.appendChild(svg);
    const q = (s) => svg.querySelector(s),
      qa = (s) => [...svg.querySelectorAll(s)];
    return {
      svg,
      X,
      Y,
      v: qa(".ns-v"),
      cand: (k) => q(`.ns-cand[data-k="${k}"]`),
      cur: q(".ns-cur"),
      prev: q(".ns-prev"),
      trail: q(".ns-trail"),
      cg: q(".ns-cg"),
      wc: q(".ns-wc"),
    };
  }
  const ROLE_FILL = ["var(--teal)", "var(--amber)", "var(--rose)"];
  /** Draw one runner frame. f = {S (sorted), prev, C, cand: {R: {p, f}}, acc, trail, noRoles} */
  function nmDraw(s, f, c) {
    const pts = (S) => S.map((v) => `${s.X(v.p[0])},${s.Y(v.p[1])}`).join(" ");
    s.cur.setAttribute("points", pts(f.S));
    if (f.prev) {
      s.prev.setAttribute("points", pts(f.prev));
      F.rn.to(c, s.prev, { opacity: 1 }, 0, 0.2);
    } else F.rn.to(c, s.prev, { opacity: 0 }, 0, 0.2);
    s.trail.setAttribute("points", (f.trail || []).map((p) => `${s.X(p[0])},${s.Y(p[1])}`).join(" "));
    f.S.forEach((v, i) => {
      const g = s.v[i];
      g.dataset.k = ["B", "G", "W"][i];
      F.rn.to(c, g, { x: s.X(v.p[0]), y: s.Y(v.p[1]) });
      g.querySelector(".ns-vc").style.fill = ROLE_FILL[i];
      g.querySelector(".ns-vl").textContent = f.noRoles ? "" : g.dataset.k;
      g.querySelector(".ns-fv").textContent = f.noF ? "" : "f=" + nf(v.f);
    });
    if (f.C) {
      F.rn.to(c, s.cg, { x: s.X(f.C[0]), y: s.Y(f.C[1]), opacity: 1 });
      s.wc.setAttribute("x1", s.X(f.S[2].p[0]));
      s.wc.setAttribute("y1", s.Y(f.S[2].p[1]));
      s.wc.setAttribute("x2", s.X(f.C[0]));
      s.wc.setAttribute("y2", s.Y(f.C[1]));
      F.rn.to(c, s.wc, { opacity: 1 }, 0, 0.2);
    } else {
      F.rn.to(c, s.cg, { opacity: 0 }, 0, 0.2);
      F.rn.to(c, s.wc, { opacity: 0 }, 0, 0.2);
    }
    ["R", "E", "M1", "M2"].forEach((k) => {
      const g = s.cand(k),
        cd = f.cand && f.cand[k];
      if (!cd) {
        F.rn.to(c, g, { opacity: 0 }, 0, 0.15);
        return;
      }
      F.rn.to(c, g, { x: s.X(cd.p[0]), y: s.Y(cd.p[1]), opacity: f.acc && f.acc !== k ? 0.35 : 1 });
      g.querySelector(".ns-fv").textContent = "f=" + nf(cd.f);
    });
  }
  const OPNAME = {
    reflect: "reflection",
    expand: "expansion",
    in: "inside contraction",
    out: "outside contraction",
    shrink: "shrink",
  };
  /** Frames for the step-through Nelder-Mead runner. */
  function* nmFrames(f, S0, iters) {
    let S = simplexOf(f, ...S0).sort((a, b) => a.f - b.f),
      trail = [S[0].p],
      ev = 3;
    const seen = new Set();
    yield {
      S,
      trail,
      cap: `<b>Start.</b> Three points make the simplex. Their values are ${S.map((v) => nf(v.f)).join(", ")}. Three evaluations so far.`,
      line: 0,
    };
    for (let it = 1; it <= iters; it++) {
      const r = nmIter(S, f);
      ev += r.ev;
      yield {
        S: r.S,
        trail,
        C: r.C,
        cap: `<b>Round ${it}.</b> Order the points: f(B) = ${nf(r.B.f)}, f(G) = ${nf(r.G.f)}, f(W) = ${nf(r.W.f)}. The centroid C is the midpoint of B and G: ${P2(r.C)}.`,
        line: 1,
      };
      yield {
        S: r.S,
        trail,
        C: r.C,
        cand: { R: { p: r.R, f: r.fR } },
        cap: `<b>Reflect</b> W through C: R = C + (C − W) = ${P2(r.R)}, f(R) = ${nf(r.fR)}. ${r.fR < r.B.f ? "That beats B." : r.fR < r.G.f ? "That beats G but not B." : "That is no better than G."}`,
        line: 2,
        ask:
          it === 1
            ? {
                q: "Which point will the algorithm try to replace? Tap it.",
                pick: ".ns-v",
                a: ["W"],
                why: "Always the worst point, W: it has the highest value.",
              }
            : null,
      };
      const cand = { R: { p: r.R, f: r.fR } };
      if (r.E) {
        cand.E = { p: r.E, f: r.fE };
        yield {
          S: r.S,
          trail,
          C: r.C,
          cand: { ...cand },
          cap: `f(R) < f(B), so the direction pays. <b>Expand</b>: E = C + 2(C − W) = ${P2(r.E)}, f(E) = ${nf(r.fE)}.`,
          line: 3,
        };
      } else if (r.M1) {
        cand.M1 = { p: r.M1, f: r.f1 };
        cand.M2 = { p: r.M2, f: r.f2 };
        yield {
          S: r.S,
          trail,
          C: r.C,
          cand: { ...cand },
          cap: `f(R) ≥ f(G), so <b>contract</b>. M₁ = C − ½(C − W) = ${P2(r.M1)}, f = ${nf(r.f1)} (inside). M₂ = C + ½(C − W) = ${P2(r.M2)}, f = ${nf(r.f2)} (outside).`,
          line: 4,
        };
      }
      trail = trail.concat([r.next[0].p]);
      const key = r.acc ? r.acc.key : null,
        first = !seen.has(r.op);
      seen.add(r.op);
      const why =
        r.op === "reflect"
          ? r.tried
            ? "E was tried, but f(E) is not below f(R), so R stays."
            : "R beats G, so it is accepted with no extra testing."
          : r.op === "expand"
            ? "f(E) < f(R): the longer jump paid off."
            : `${r.op === "in" ? "M₁" : "M₂"} is below f(W) and below the other middle point.`;
      const ask = r.acc
        ? first || it <= 2
          ? { q: "Which candidate does Nelder–Mead keep? Tap it.", pick: ".ns-cand", a: [key], why }
          : null
        : {
            q: "No candidate beat W. Which point stays exactly where it is while the others shrink towards it? Tap it.",
            pick: ".ns-v",
            a: ["B"],
            why: "Everything shrinks towards the best point, B.",
          };
      const capAcc = r.acc
        ? `<b>Keep ${key === "M1" ? "M₁" : key === "M2" ? "M₂" : key}</b> (${OPNAME[r.op]}${r.tried ? ", E failed" : ""}) and drop W. The best value is now ${nf(r.next[0].f)}.`
        : `Neither M₁ nor M₂ beats W (f(W) = ${nf(r.W.f)}). <b>Shrink</b>: pull W and G halfway towards B.`;
      yield {
        S: r.next,
        prev: r.S,
        trail,
        C: null,
        cand: r.acc ? cand : {},
        acc: key,
        cap: `${capAcc} <span class="dim">(${r.ev} evaluations this round, ${ev} in total.)</span>`,
        line: 5,
        ask,
      };
      S = r.next;
    }
  }
  Object.assign(S, {
    BOWL,
    BOWL2,
    COLN,
    OPNAME,
    ROSEN,
    contourCanvas,
    contourURL,
    moveFig,
    nmDraw,
    nmFrames,
    nmIter,
    nmSVG,
    nmScene,
    nmSolve,
    simplexOf,
  });
})();
