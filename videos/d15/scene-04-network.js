/* Lecture 15 (ds-15) · scene 4 (DON'T FORGET THE ROADS): fast nodes are joined by a LAN; every step each node swaps its
   border weather with its neighbours; on a slow network the cores finish and wait (D15.NET).
   Story (local seconds): 0.3 four blue node cards (stagger 0.15) with a blue computing bar that fills in cycles; 0.8 the purple
   LAN draws with a drop line to each node; 3.5-4.6 and 4.9-6.0 purple 'border' packets hop between neighbours both ways;
   6.5 the LAN turns thin and dashed ('slow LAN'), the packets crawl (6.7-9.4), each computing bar stops full and a red dashed
   'waiting' bar grows. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const { ramp, clamp, ease: E } = V;
  const N = D15.NET;
  const f1 = (n) => n.toFixed(1);

  V.scene({
    kicker: "DON'T FORGET THE ROADS",
    title: ["Fast nodes still wait", "for a slow network"],
    dur: 10,
    caps: [
      [0.4, 3.2, "Nodes are joined by a LAN, a local-area network."],
      [3.4, 6.2, "Each step, every node swaps border weather with its neighbours."],
      [6.5, 9.6, "A slow network leaves fast cores waiting for data."],
    ],
    build(stage) {
      const CX = (i) => 12 + i * 234 + 105;
      const LANY = 380;
      const svg = D4.svg(stage);
      const lan = D4.wire(svg, {
        pts: [
          { x: 40, y: LANY },
          { x: 896, y: LANY },
        ],
        tone: "purple",
        w: 18,
      });
      const drops = [0, 1, 2, 3].map((i) =>
        D4.wire(svg, {
          pts: [
            { x: CX(i), y: 276 },
            { x: CX(i), y: LANY },
          ],
          tone: "purple",
          w: 8,
        }),
      );
      const lanS = D4.wire(svg, {
        pts: [
          { x: 40, y: LANY },
          { x: 896, y: LANY },
        ],
        tone: "purple",
        w: 8,
        dash: "18 14",
      });
      const dropsS = [0, 1, 2, 3].map((i) =>
        D4.wire(svg, {
          pts: [
            { x: CX(i), y: 276 },
            { x: CX(i), y: LANY },
          ],
          tone: "purple",
          w: 5,
          dash: "12 10",
        }),
      );
      const cards = [0, 1, 2, 3].map((i) =>
        D15.box(stage, {
          x: 12 + i * 234,
          y: 40,
          w: 210,
          h: 230,
          title: `node ${i + 1}`,
          sub: "fast cores",
          tone: "blue",
        }),
      );
      cards.forEach((c) => Object.assign(c.el.style, { justifyContent: "flex-start", paddingTop: "16px" }));
      const comp = [0, 1, 2, 3].map((i) =>
        D4.bar(stage, { x: 12 + i * 234 + 20, y: 160, w: 170, h: 30, tone: "blue" }),
      );
      const wait = [0, 1, 2, 3].map((i) => {
        const el = V.h("div", {
          style: {
            position: "absolute",
            left: `${12 + i * 234 + 20}px`,
            top: "208px",
            height: "30px",
            boxSizing: "border-box",
            borderRadius: "15px",
            border: `4px dashed ${D15.tone("red").c}`,
          },
        });
        stage.append(el);
        return el;
      });
      const lanTag = D4.tag(stage, { x: 468, y: 486, text: "LAN", tone: "purple", solid: true, fs: 30 });
      const tagC = D4.tag(stage, { x: 330, y: 560, text: "computing", tone: "blue", solid: true });
      const tagW = D4.tag(stage, { x: 610, y: 560, text: "waiting", tone: "red" });
      const pk = N.hops.map(() => D4.packet(stage, { text: "border", tone: "purple" }));

      return (t) => {
        cards.forEach((c, i) => c.set({ k: D15.seq(t, 0.3, 0.15, 0.4, i) }));
        const slow = t >= 6.5;
        const kL = ramp(t, 0.8, 1.6, E.out);
        lan.set({ k: kL, o: slow ? 0 : 1 });
        drops.forEach((d, i) => d.set({ k: D15.seq(t, 1.4, 0.1, 0.4, i), o: slow ? 0 : 1 }));
        lanS.set({ o: slow ? 1 : 0 });
        dropsS.forEach((d) => d.set({ o: slow ? 1 : 0 }));
        lanTag.set({ k: ramp(t, 1.2, 1.5), text: slow ? "slow LAN" : "LAN", s: 1 + 0.1 * V.flash(t, 6.5, 6.9) });
        tagC.set({ k: ramp(t, 1.0, 1.3) });
        tagW.set({ k: ramp(t, 6.8, 7.1) });

        // computing bars fill in cycles of 1.3 s until the slow network makes them stop full at 6.5
        const cyc = (x) => x - Math.floor(x);
        comp.forEach((b, i) => {
          const kc = t < 0.8 ? 0 : slow ? 1 : clamp(cyc((t - 0.8) / 1.3 + 0.07 * i) * 1.15);
          b.set({ k: kc, o: ramp(t, 0.5, 0.8, E.lin) });
        });
        wait.forEach((el, i) => {
          const kw = ramp(t, 6.7 + 0.1 * i, 9.4, E.lin);
          el.style.width = `${f1(170 * kw)}px`;
          el.style.display = kw > 0.02 ? "" : "none";
        });

        // packets: all neighbours swap at once; twice fast, then once slowly
        const at = (a, b, k) => D4.at({ x: CX(a), y: LANY }, { x: CX(b), y: LANY }, k);
        pk.forEach((p, j) => {
          const [a, b] = N.hops[j];
          const dir = b > a ? -1 : 1;
          let k = -1;
          if (t >= 3.5 && t < 4.6) k = (t - 3.5) / 1.1;
          else if (t >= 4.9 && t < 6.0) k = (t - 4.9) / 1.1;
          else if (t >= 6.7 && t < 9.6) k = Math.min(1, (t - 6.7) / 3.6);
          if (k < 0) return p.set({ k: 0 });
          const q = at(a, b, E.inOut(k));
          p.set({
            x: q.x,
            y: q.y + (dir > 0 ? 30 : -30),
            k: 1,
            o: Math.min(1, k * 6, (1 - k) * 6 + (t >= 6.7 ? 1 : 0)),
          });
        });
      };
    },
  });
})();
