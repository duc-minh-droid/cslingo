/* Lecture 1 · What is NIC?, scene 02-nature: three natural systems with no boss (evolution, brains, ants), then evolution is
   picked as this lecture's topic. Pictograms come from L1.miniEvo / miniBrain / miniAnts, numbers from L1.evoBars / L1.ANTS. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, ease: E } = V;

  const EVO = L1.evoBars();
  if (EVO.means.join() !== "57.7,74.5,88,96.7") throw new Error("scene 2: evolution means changed");
  if (L1.ANTS[2].sShort !== 19 || L1.ANTS[2].sLong !== 7) throw new Error("scene 2: ant scents changed");

  const ROWS = [
    { name: "Evolution", tag: "improves designs", a: 0.4, done: 3.95, make: L1.miniEvo, t0: 1.0 },
    { name: "Brains", tag: "learns patterns", a: 3.3, done: 6.9, make: L1.miniBrain, t0: 4.0 },
    { name: "Ant colonies", tag: "finds short paths", a: 6.2, done: 9.7, make: L1.miniAnts, t0: 6.8 },
  ];
  const H = 184;
  const GAP = 20;

  V.scene({
    kicker: "WHAT IS NIC?",
    title: ["Copy nature's", "problem solvers"],
    dur: 12,
    caps: [
      [0.5, 3.2, "Evolution: the fitter ones survive and breed."],
      [3.5, 6, "Brains: useful connections get stronger."],
      [6.5, 9.7, "Ants: short trails get more scent."],
      [10, 11.5, "No one is in charge. Today: evolution."],
    ],
    build(stage) {
      const rows = ROWS.map((r, i) => {
        const card = V.h("div", {
          class: "v-card plain c-grey",
          style: { left: "0px", top: `${i * (H + GAP)}px`, width: "936px", height: `${H}px` },
        });
        stage.append(card);
        const wrap = V.h("div", {
          style: {
            position: "absolute",
            left: "16px",
            top: "8px",
            width: "330px",
            height: "150px",
            transformOrigin: "0 0",
            transform: "scale(1.15)",
          },
        });
        card.append(wrap);
        const upd = r.make(wrap, { x: 0, y: 0, t0: r.t0 });
        const name = V.h("div", {
          class: "v-text big",
          text: r.name,
          style: { left: "430px", top: "30px", fontSize: "40px" },
        });
        const tag = V.h("div", {
          class: "v-tag c-blue",
          text: r.tag,
          style: { left: "430px", top: "104px", paddingLeft: "64px", fontSize: "28px" },
        });
        const svg = L5.svg(tag, 60, 40);
        svg.style.left = "0px";
        svg.style.top = "0px";
        svg.style.width = "60px";
        svg.style.height = "40px";
        svg.append(L5.arrow(14, 19, 46, 19, "grey", 1, { w: 6, head: 18 }));
        card.append(name, tag);
        return { r, card, upd, name, tag };
      });
      const lead = V.h("div", {
        class: "v-card c-orange",
        style: {
          left: "0px",
          top: "0px",
          width: "936px",
          height: `${H}px`,
          background: "transparent",
          boxShadow: "none",
          borderWidth: "4px",
          pointerEvents: "none",
        },
      });
      const now = V.h("div", {
        class: "v-tag solid c-orange",
        text: "this lecture",
        style: { left: "700px", top: "18px", height: "52px", fontSize: "28px" },
      });
      stage.append(lead);
      lead.append(now);
      return (t) => {
        const dim = ramp(t, 10.0, 10.6, E.inOut);
        const focus = ramp(t, 10.0, 10.5);
        rows.forEach((w, i) => {
          const k = ramp(t, w.r.a, w.r.a + 0.5);
          const nk = ramp(t, w.r.a + 0.2, w.r.a + 0.7);
          const pop = ramp(t, w.r.done, w.r.done + 0.4, E.pop);
          const o = i === 0 ? 1 : 1 - 0.6 * dim;
          V.place(w.card, { y: (1 - k) * 30, o: k * o });
          w.upd(t);
          V.place(w.name, { o: nk });
          V.place(w.tag, { s: pop, o: Math.min(1, pop * 3) });
        });
        // the orange outline sits on top of row 1 (same slide-in), and the 'this lecture' tag pops at its top right
        V.place(lead, { y: (1 - ramp(t, ROWS[0].a, ROWS[0].a + 0.5)) * 30, o: focus });
        V.place(now, { s: ramp(t, 10.2, 10.6, E.pop), o: Math.min(1, ramp(t, 10.2, 10.6, E.pop) * 3) });
      };
    },
  });
})();
