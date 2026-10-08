/* Algorithms Phase 3 · extra plot handles (window.VID.a3, part 5 of 5; needs common-3.js, VID.l5). Stage px (936 x 640).
   Wraps A3.plot so that every plot also has these handles. Same rules as common-3.js: create once in build(), call .set() every frame, set() is
   PURE (anything you leave out falls back to its default). Tones: "green" "red" "blue" "purple" "orange" "grey". Data coordinates (x, y of the
   maths) unless a name says px.

     P.ring({tone: "orange", r: 24, w: 5, dash}) -> g      g.set({x, y, r, o, tone, dx, dy})     a hollow ring of r PIXELS round data (x, y): makes a tiny triangle or point easy to find
     P.tangent({tone: "purple", w: 6, len: 130}) -> g      g.set({x, y, m, o, k, tone, len})      segment centred on data (x, y) with data slope m (k grows it from the centre)
     P.arrow({tone: "purple", w: 6, head: 20}) -> a      a.set({x1, y1, x2, y2, k, o, tone, bow})      data-coordinate arrow, drawn up to k of its length (bow curves it sideways by that many px)
     P.simplex({tone: "purple"}) -> s      s.set({pts: [[x, y] x3], tones: ["green", "blue", "red"], labels: ["B", "G", "W"], o, fillO, ring, dotO})
         the Nelder-Mead triangle: tinted polygon, three sticker corners (r 11) in their tones, optional 28 px labels beside them (pushed away from the middle);
         ring: tone name of a dotted outline

*/
(function () {
  const V = window.VID;
  const A3 = (V.a3 = V.a3 || {});
  const L5 = V.l5;
  const f1 = (n) => (+n).toFixed(1);
  // ---------- extra plot handles ----------
  const tn = (n) => L5.tone(n);
  const pts2d = (pts) => pts.map(([x, y]) => `${f1(x)} ${f1(y)}`);
  const at = (e, o) => {
    Object.entries(o).forEach(([k, v]) => e.setAttribute(k, typeof v === "number" ? f1(v) : v));
    return e;
  };
  const { clamp } = V;
  function plotExtras(P) {
    const { mk, over, stroked } = P.internals;
    // ---------- ring ----------
    P.ring = ({ tone = "orange", r = 24, w: sw = 5, dash } = {}) => {
      const e = mk("circle", { fill: "none", "stroke-width": f1(sw), "stroke-dasharray": dash || "" }, over);
      return {
        el: e,
        set({ x: vx = 0, y: vy = 0, r: rr = r, o = 1, tone: t = tone, dx = 0, dy = 0 } = {}) {
          const [X, Y] = P.pt(vx, vy);
          at(e, { cx: X + dx, cy: Y + dy, r: rr });
          e.style.stroke = tn(t).c;
          V.show(e, o);
        },
      };
    };

    // ---------- tangent, arrow ----------
    P.tangent = ({ tone = "purple", w: sw = 6, len = 130 } = {}) => {
      const e = mk("line", { "stroke-width": f1(sw), "stroke-linecap": "round" }, over);
      return {
        el: e,
        set({ x: vx = 0, y: vy = 0, m = 0, o = 1, k = 1, tone: t = tone, len: ll = len } = {}) {
          const d = [P.cur.sx, -m * P.cur.sy];
          const n = Math.hypot(d[0], d[1]);
          const half = (ll / 2) * clamp(k);
          const [X, Y] = P.pt(vx, vy);
          at(e, {
            x1: X - (d[0] / n) * half,
            y1: Y - (d[1] / n) * half,
            x2: X + (d[0] / n) * half,
            y2: Y + (d[1] / n) * half,
          });
          e.style.stroke = tn(t).c;
          V.show(e, k > 0.001 ? o : 0);
        },
      };
    };
    P.arrow = ({ tone = "purple", w: sw = 6, head = 20 } = {}) => {
      const g = mk("g", {}, over);
      const line = g.appendChild(V.s("path", stroked({ "stroke-width": f1(sw) })));
      const tip = g.appendChild(V.s("path", { "stroke-width": "3", "stroke-linejoin": "round" }));
      return {
        el: g,
        set({ x1: ax = 0, y1: ay = 0, x2: bx = 1, y2: by = 1, k = 1, o = 1, tone: t = tone, bow = 0 } = {}) {
          const [A, B] = [P.pt(ax, ay), P.pt(bx, by)];
          const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
          const u = [(B[0] - A[0]) / len, (B[1] - A[1]) / len];
          const L = len * clamp(k);
          const ctrl = [A[0] + (u[0] * L) / 2 + u[1] * bow, A[1] + (u[1] * L) / 2 - u[0] * bow];
          const end = [A[0] + u[0] * L, A[1] + u[1] * L];
          const dir = ((d) => [d[0] / (Math.hypot(...d) || 1), d[1] / (Math.hypot(...d) || 1)])([
            end[0] - ctrl[0],
            end[1] - ctrl[1],
          ]);
          const hs = Math.min(1, L / (head * 1.5));
          const base = [end[0] - dir[0] * head * hs, end[1] - dir[1] * head * hs];
          const nrm = [-dir[1] * head * 0.46 * hs, dir[0] * head * 0.46 * hs];
          line.setAttribute(
            "d",
            `M${f1(A[0])} ${f1(A[1])}Q${f1(ctrl[0])} ${f1(ctrl[1])} ${f1(base[0] + dir[0] * 2)} ${f1(base[1] + dir[1] * 2)}`,
          );
          tip.setAttribute(
            "d",
            `M${f1(end[0])} ${f1(end[1])}L${f1(base[0] + nrm[0])} ${f1(base[1] + nrm[1])}L${f1(base[0] - nrm[0])} ${f1(base[1] - nrm[1])}Z`,
          );
          line.style.stroke = tip.style.stroke = tip.style.fill = tn(t).c;
          V.show(g, k > 0.02 ? o : 0);
        },
      };
    };

    // ---------- the Nelder-Mead triangle ----------
    P.simplex = ({ tone = "purple" } = {}) => {
      const g = mk("g", {}, over);
      const ringE = g.appendChild(V.s("polygon", stroked({ "stroke-width": "6", "stroke-dasharray": "2 10" })));
      const poly = g.appendChild(V.s("polygon", stroked({ "stroke-width": "5" })));
      const dots = [0, 1, 2].map(() => {
        const d = g.appendChild(V.s("g"));
        return [
          d.appendChild(V.s("circle", { cy: 3, r: 11 })),
          d.appendChild(V.s("circle", { r: 11, "stroke-width": "3" })),
          d,
        ];
      });
      const txt = [0, 1, 2].map(() =>
        g.appendChild(
          V.s("text", {
            "text-anchor": "middle",
            "stroke-linejoin": "round",
            style: {
              fontFamily: "var(--sans)",
              fontWeight: "900",
              fontSize: "28px",
              stroke: "var(--panel)",
              strokeWidth: "8px",
              paintOrder: "stroke",
            },
          }),
        ),
      );
      return {
        el: g,
        set({
          pts = [
            [0, 0],
            [1, 0],
            [0, 1],
          ],
          tones = ["green", "blue", "red"],
          labels = [],
          o = 1,
          fillO = 1,
          ring = null,
          dotO = 1,
          tone: t = tone,
        } = {}) {
          const px = pts.map(([vx, vy]) => P.pt(vx, vy));
          const str = pts2d(px).join(" ");
          [poly, ringE].forEach((e) => e.setAttribute("points", str));
          poly.style.fill = tn(t).c;
          poly.style.fillOpacity = String(0.2 * fillO);
          poly.style.stroke = tn(t).c;
          ringE.style.stroke = ring ? tn(ring).c : "none";
          V.show(ringE, ring ? 1 : 0);
          dots.forEach(([lip, body, d], i) => {
            const tt = tn(tones[i]);
            lip.style.fill = tt.lip;
            body.style.fill = tt.c;
            body.style.stroke = tt.lip;
            V.place(d, { x: px[i][0], y: px[i][1], o: dotO });
            const tx = txt[i];
            const cx = px.reduce((s, p) => s + p[0], 0) / 3;
            const cy = px.reduce((s, p) => s + p[1], 0) / 3;
            const dir = [px[i][0] - cx, px[i][1] - cy];
            const n = Math.hypot(...dir) || 1;
            tx.textContent = labels[i] || "";
            tx.setAttribute("x", f1(px[i][0] + (dir[0] / n) * 30));
            tx.setAttribute("y", f1(px[i][1] + (dir[1] / n) * 30 + 10));
            tx.style.fill = tn(tones[i]).ink;
            V.show(tx, labels[i] ? dotO : 0);
          });
          V.show(g, o);
        },
      };
    };
  }
  const basePlot = A3.plot;
  A3.plot = (parent, opt) => {
    const P = basePlot(parent, opt);
    plotExtras(P);
    return P;
  };
})();
