/* Lecture 2 video, scene 05: Prim's algorithm on the five towns (an EASY problem).
   The graph builds, then four steps: candidate cables turn orange, the cheapest pulses and becomes a thick green cable,
   its weight flies to the cost card. Every cable, weight and total comes from L2.prim(0). */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { h, place, ramp, ease: E, flash, clamp } = V;
  const prim = L2.prim(0);
  if (prim.tree.join() !== "AC,CD,CE,BE" || prim.cost !== 18) throw new Error("scene 05: Prim changed");
  const STEPS = prim.steps;
  const T0 = 2.2; // first step starts here
  const DUR = 1.7;
  const END = T0 + DUR * STEPS.length; // 9.0
  const pop = (t, a, d = 0.45) => E.pop(ramp(t, a, a + d, E.lin));

  V.scene({
    kicker: "AN EASY PROBLEM",
    title: ["Prim: always take the", "cheapest new cable"],
    dur: 12,
    caps: [
      [0.3, 2.0, "Connect all 5 towns as cheaply as possible."],
      [2.2, 5.2, "Prim: take the cheapest cable to a new town."],
      [5.4, 9.0, "Keep adding the cheapest cable. No loops."],
      [9.2, 11.6, "Fast and always optimal: an easy problem."],
    ],
    build(stage) {
      const g = L2.graph(stage, { x: 0, y: 24 });
      const card = L2.costCard(stage, { x: 700, y: 40, w: 224, h: 170, label: "cost" });
      const flyer = h("div", {
        class: "v-tag c-orange",
        style: {
          left: "-34px",
          top: "-21px",
          width: "68px",
          height: "42px",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });
      stage.append(flyer);
      const tag = h(
        "div",
        { style: { position: "absolute", left: "0", top: "570px", width: "936px", height: "56px" } },
        h("div", {
          class: "v-tag solid c-green",
          text: "easy: fast and optimal",
          style: { position: "relative", fontSize: "34px", margin: "0 auto", width: "fit-content" },
        }),
      );
      stage.append(tag);

      return (t) => {
        const k = ramp(t, 0.2, 1.8, E.lin);
        const final = ramp(t, END, END + 0.6, E.lin);
        const nodes = {};
        const edges = {};
        let value = 0;
        let bump = 0;
        let fly = null;
        const inTree = new Set(["A"]);
        const treeEdges = new Set();
        let ringNew = null;

        STEPS.forEach((st, i) => {
          const ts = t - (T0 + DUR * i);
          if (ts >= 0.9) {
            treeEdges.add(st.pick);
            inTree.add(st.to);
          }
          if (ts >= 0 && ts < DUR) {
            const cands = new Set(st.candKeys);
            const chosen = ts >= 0.9;
            // candidates: orange dashed until the pick, then back to grey
            if (!chosen)
              st.candKeys.forEach((key) => {
                edges[key] = {
                  tone: "orange",
                  w: 8,
                  dash: true,
                  o: ramp(ts, 0, 0.3, E.lin),
                  pill: "orange",
                  pulse: key === st.pick ? flash(ts, 0.5, 0.9) : 0,
                };
              });
            if (ts >= 0.9 && ts < 1.5) {
              fly = { ts, from: g.pill(st.pick), w: st.w };
            }
            void cands;
          }
          if (ts >= 0.9) ringNew = ringNew || {};
          if (ts >= 0.9 && ts < DUR) ringNew = { town: st.to, k: ramp(ts, 0.9, 1.3, E.out) };
          const prev = i ? STEPS[i - 1].total : 0;
          const c = ramp(ts, 0.9, 1.5, E.out);
          if (ts >= 0.9) value = Math.round(prev + (st.total - prev) * c);
          else if (ts >= 0) value = Math.max(value, prev);
          if (ts >= 1.3 && ts < 1.9) bump = flash(ts, 1.3, 1.9);
        });
        // finished tree cables (and the one being drawn)
        STEPS.forEach((st, i) => {
          const ts = t - (T0 + DUR * i);
          if (ts < 0.9) return;
          const flying = ts < 1.5;
          edges[st.pick] = {
            tone: "green",
            k: ramp(ts, 0.9, 1.4, E.out),
            from: st.from,
            pill: "green",
            pillO: flying ? 0 : 1,
          };
        });
        // towns
        const lastDone = t >= END;
        "ABCDE".split("").forEach((x) => {
          const n = {};
          if (x === "A") {
            n.ring = ramp(t, 2.0, 2.4, E.out);
            n.ringTone = "blue";
          }
          if (x !== "A" && inTree.has(x)) {
            n.ring = ringNew && ringNew.town === x ? ringNew.k : 1;
            n.ringTone = "green";
          }
          if (lastDone) {
            n.tone = "green";
            n.pulse = flash(t, END, END + 0.5);
          }
          nodes[x] = n;
        });
        if (lastDone) nodes.A.ringTone = "blue";
        g.update({ k, nodes, edges });
        card.update({
          value: t >= END ? 18 : value,
          tone: final > 0 ? "green" : "grey",
          bump,
          s: 0.6 + 0.4 * pop(t, 1.4),
          o: clamp((t - 1.4) * 6),
        });
        if (fly) {
          const to = card.numberPt();
          const p = ramp(fly.ts, 0.9, 1.5, E.inOut);
          if (flyer.textContent !== String(fly.w)) flyer.textContent = String(fly.w);
          flyer.className = "v-tag c-green";
          place(flyer, {
            x: fly.from.x + (to.x - fly.from.x) * p,
            y: fly.from.y + (to.y - fly.from.y) * p,
            s: 1 - 0.3 * p,
            o: 1 - ramp(fly.ts, 1.35, 1.5, E.lin),
          });
        } else place(flyer, { o: 0 });
        place(tag, { s: 0.85 + 0.15 * pop(t, 9.8), o: ramp(t, 9.8, 10.1, E.lin) });
      };
    },
  });
})();
