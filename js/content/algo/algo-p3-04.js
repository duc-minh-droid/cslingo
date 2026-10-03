(function () {
  const partScope = (NIC.shared.algoP3 = NIC.shared.algoP3 || {});
  const { MIN, ROS } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig;

  N.register({
    id: "a3-nm",
    subject: "algo",
    lecture: 3,
    order: 4,
    num: "3.4",
    title: "The wandering triangle",
    blurb: "Nelder–Mead crawls a triangle down a curved valley: reflect, expand, contract, shrink.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let tri,
        prev,
        iter = 0,
        lastOp = "—",
        trail = [],
        view = "2d",
        s3 = null,
        timer = null,
        contour = null;
      const f = (p) => ROS(p[0], p[1]);
      const init = () => {
        tri = [
          [0.12, 0.12],
          [0.3, 0.1],
          [0.16, 0.3],
        ].map((p) => ({ p, f: f(p) }));
        prev = null;
        iter = 0;
        lastOp = "—";
        trail = [tri[0].p.slice()];
      };
      init();
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="it">Step ▸</button><button class="btn" id="run">▶ Run</button><button class="btn ghost" id="rs">Reset</button><span style="flex:1"></span><span id="vw"></span></div>
        <div id="stage"></div><div class="legend"><span style="--c:var(--teal)">best</span><span style="--c:var(--amber)">middle</span><span style="--c:var(--rose)">worst</span><span style="--c:var(--line-2)">previous triangle</span></div>
        <div class="stat-row"><div class="stat teal"><small>Best f</small><b id="bf"></b></div><div class="stat violet"><small>Last move</small><b id="op">—</b></div><div class="stat"><small>Iterations</small><b id="n">0</b></div></div></div>`);
      root.appendChild(card);
      qs("#vw", card).appendChild(
        N.seg(
          [
            ["2d", "Contour"],
            ["3d", "3-D"],
          ],
          "2d",
          (v) => {
            view = v;
            mount();
          },
        ),
      );
      function nmStep() {
        prev = tri.map((v) => v.p.slice());
        tri.sort((a, b) => a.f - b.f);
        const [b0, m0, w0] = tri;
        const mid = [(b0.p[0] + m0.p[0]) / 2, (b0.p[1] + m0.p[1]) / 2];
        const at = (t) => [mid[0] + t * (w0.p[0] - mid[0]), mid[1] + t * (w0.p[1] - mid[1])];
        const r = at(-1),
          fr = f(r);
        if (fr < b0.f) {
          const e = at(-2),
            fe = f(e);
          if (fe < fr) {
            tri[2] = { p: e, f: fe };
            lastOp = "expand";
          } else {
            tri[2] = { p: r, f: fr };
            lastOp = "reflect";
          }
        } else if (fr < m0.f) {
          tri[2] = { p: r, f: fr };
          lastOp = "reflect";
        } else {
          const c = fr < w0.f ? at(-0.5) : at(0.5),
            fc = f(c);
          if (fc < Math.min(fr, w0.f)) {
            tri[2] = { p: c, f: fc };
            lastOp = fr < w0.f ? "contract (outside)" : "contract (inside)";
          } else {
            [1, 2].forEach((k) => {
              tri[k].p = [b0.p[0] + 0.5 * (tri[k].p[0] - b0.p[0]), b0.p[1] + 0.5 * (tri[k].p[1] - b0.p[1])];
              tri[k].f = f(tri[k].p);
            });
            lastOp = "shrink";
          }
        }
        tri.sort((a, b) => a.f - b.f);
        trail.push(tri[0].p.slice());
        iter++;
      }
      function draw2d() {
        const cv = qs("#cv", card);
        if (!cv) return;
        const { ctx, w, h } = N.setupCanvas(cv, 300);
        const C = N.colors();
        const X = (x) => 10 + x * (w - 20),
          Y = (y) => h - 10 - y * (h - 20);
        if (!contour) {
          const G = 120,
            off = document.createElement("canvas");
          off.width = off.height = G;
          const oc = off.getContext("2d"),
            img = oc.createImageData(G, G);
          let mx = 0;
          const vals = [];
          for (let j = 0; j < G; j++)
            for (let i = 0; i < G; i++) {
              const v = Math.log(1 + ROS(i / (G - 1), 1 - j / (G - 1)));
              vals.push(v);
              mx = Math.max(mx, v);
            }
          vals.forEach((v, k) => {
            const t = v / mx,
              band = Math.floor(t * 12) % 2,
              a = 0.08 + 0.55 * (1 - t);
            const c = band ? [88, 204, 2] : [28, 176, 246];
            img.data.set([c[0] * a + 247 * (1 - a), c[1] * a + 247 * (1 - a), c[2] * a + 247 * (1 - a), 255], k * 4);
          });
          oc.putImageData(img, 0, 0);
          contour = off;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(contour, X(0), Y(1), X(1) - X(0), Y(0) - Y(1));
        ctx.fillStyle = C.amber;
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("★", X(MIN[0]), Y(MIN[1]) + 5);
        if (trail.length > 1) {
          ctx.strokeStyle = "rgba(75,75,75,.45)";
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          trail.forEach((p, k) => (k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (prev) {
          ctx.beginPath();
          prev.forEach((p, k) => (k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
          ctx.closePath();
          ctx.strokeStyle = C.line_2;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        tri.forEach((v, k) => (k ? ctx.lineTo(X(v.p[0]), Y(v.p[1])) : ctx.moveTo(X(v.p[0]), Y(v.p[1]))));
        ctx.closePath();
        ctx.fillStyle = "rgba(206,130,255,0.22)";
        ctx.fill();
        ctx.strokeStyle = C.violet;
        ctx.lineWidth = 2;
        ctx.stroke();
        tri.forEach((v, k) => {
          ctx.beginPath();
          ctx.arc(X(v.p[0]), Y(v.p[1]), 6, 0, 7);
          ctx.fillStyle = k === 0 ? C.teal : k === 2 ? C.rose : C.amber;
          ctx.fill();
          ctx.strokeStyle = C.panel;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      function mount() {
        const st = qs("#stage", card);
        st.innerHTML = "";
        s3 = null;
        if (view === "2d") {
          st.innerHTML = `<canvas class="viz" id="cv"></canvas>`;
          draw2d();
        } else {
          s3 = F.surface3d(st, life, { f: (x, y) => Math.log(1 + ROS(x, y)), height: 320 });
          upd3();
        }
      }
      function upd3() {
        if (!s3) return;
        s3.setPoints([
          ...tri.map((v, k) => ({ x: v.p[0], y: v.p[1], c: ["#58cc02", "#ff9600", "#ff4b4b"][k], r: 5 })),
          { x: MIN[0], y: MIN[1], c: NIC.colors().text, r: 3, label: "★" },
        ]);
        s3.setPath(trail);
      }
      function refresh() {
        qs("#bf", card).textContent = tri[0].f.toFixed(4);
        qs("#op", card).textContent = lastOp;
        qs("#n", card).textContent = iter;
        view === "2d" ? draw2d() : upd3();
      }
      const stop = () => {
        if (timer) {
          timer();
          timer = null;
          qs("#run", card).textContent = "▶ Run";
        }
      };
      qs("#it", card).onclick = () => {
        stop();
        nmStep();
        refresh();
      };
      qs("#run", card).onclick = () => {
        if (timer) return stop();
        qs("#run", card).textContent = "⏸ Pause";
        timer = life.interval(() => {
          nmStep();
          refresh();
          if (iter > 80 || tri[0].f < 1e-5) stop();
        }, 170);
      };
      qs("#rs", card).onclick = () => {
        stop();
        init();
        refresh();
      };
      life.onResize(() => view === "2d" && draw2d());
      mount();
      refresh();
      root.appendChild(
        predict({
          id: "a3-nm-1",
          q: "The reflected point beats even the best corner. What should the algorithm do?",
          opts: [
            "Stop, because nothing can beat that point",
            "Try expanding even further in that direction",
            "Shrink the whole triangle towards the best",
          ],
          a: 1,
          why: "A reflection that beats everything suggests you're going downhill, so expansion gambles on a bigger step while it's paying off.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Sort the corners, then fix the <b>worst</b>: reflect → expand → contract → shrink.",
            "No gradients, only comparisons. It works on noisy, non-smooth objectives.",
            "The simplex <i>method</i> (LP) and Nelder–Mead's simplex share only a name: one walks polygon corners, the other moves a triangle.",
          ],
          "Reflect the worst corner. Go further when it works, pull back when it doesn't.",
        ),
      );
    },
  });
})();
