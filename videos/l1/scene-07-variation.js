/* Lecture 1 video, scene 07-variation: mutation (copy a parent, change one gene) and recombination (pieces of two parents). */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- data ----------
  const P1 = "AAAAAA";
  const P2 = "BBBBBB";
  const GENE = 3; // gene 4 (index 3) mutates
  const NEW = "K";
  const MUT = P1.slice(0, GENE) + NEW + P1.slice(GENE + 1); // AAAKAA
  const CUT = 3; // cut after gene 3
  const KID = L5.cross1(P1, P2, CUT)[0]; // AAABBB
  if (MUT !== "AAAKAA" || KID !== "AAABBB") throw new Error("scene 7: expected AAAKAA and AAABBB");

  // ---------- layout (stage px) ----------
  const PX = [0, 492]; // panel left edges
  const PW = 444;
  const PY = 40;
  const PH = 480;
  const SZ = 56;
  const GAP = 8;
  const X0 = 34;
  const PITCH = SZ + GAP;
  const ROW = { mp: 110, mc: 300, rp1: 90, rp2: 190, rc: 340 };
  const CUT_X = PX[1] + X0 + CUT * PITCH - 4;
  const centred = { padding: "0", display: "flex", alignItems: "center", justifyContent: "center" };
  const pop = (k, dy = 10) => ({ s: 0.8 + 0.2 * E.pop(k), y: (1 - E.out(k)) * dy, o: clamp(k * 3) });

  V.scene({
    kicker: "VARIATION",
    title: ["Mutate, and", "mix two parents"],
    dur: 12,
    caps: [
      [0.4, 4.9, "Mutation: copy a parent, change one gene."],
      [5.2, 8.6, "Recombination: mix pieces of two parents."],
      [8.9, 11.5, "Mutation is needed. Recombination often helps."],
    ],
    build(root) {
      // two groups pushed down a little; the left (mutate) one starts centred and slides over for recombination
      const mkG = () =>
        root.appendChild(
          V.h("div", { style: { position: "absolute", left: "0", top: "14px", width: "936px", height: "560px" } }),
        );
      const stage = mkG();
      const lg = mkG();
      stage.style.zIndex = "0";
      const panels = PX.map((x, k) =>
        (k === 0 ? lg : stage).appendChild(
          V.h("div", {
            class: "v-card plain c-grey",
            style: { left: `${x}px`, top: `${PY}px`, width: `${PW}px`, height: `${PH}px` },
          }),
        ),
      );
      const row = (p, y, genes, tone) =>
        L5.chromosome(p === 0 ? lg : stage, { x: PX[p] + X0, y, genes, size: SZ, gap: GAP, tone });
      const mP = row(0, ROW.mp, P1, "blue");
      const mC = row(0, ROW.mc, P1, "blue");
      const rP1 = row(1, ROW.rp1, P1, "blue");
      const rP2 = row(1, ROW.rp2, P2, "purple");
      const rC = row(1, ROW.rc, KID, "blue");

      const svg = L5.svg(stage);
      const svgL = L5.svg(lg);
      const cut = V.s("line", {
        x1: CUT_X,
        x2: CUT_X,
        y1: 70,
        y2: 70,
        "stroke-width": 5,
        "stroke-linecap": "round",
        style: { stroke: "var(--amber)", strokeDasharray: "12 10" },
      });
      const arrow = L5.arrow(PX[0] + 62, 190, PX[0] + 62, 270, "purple", 1, { w: 7 });
      svg.append(cut);
      svgL.append(arrow);
      const diceG = V.s("g", {});
      svgL.append(diceG);

      const tag = (text, cls, x, y, w, extra = {}) =>
        (x < PX[1] ? lg : stage).appendChild(
          V.h("div", {
            class: `v-tag ${cls}`,
            text,
            style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: "44px", ...centred, ...extra },
          }),
        );
      const diceIcon = V.s(
        "svg",
        { width: 36, height: 36, viewBox: "0 0 36 36" },
        L5.dice(18, 18, 30, { face: 5, tone: "purple" }),
      );
      diceIcon.style.flex = "none";
      const hMut = tag("", "solid c-purple", PX[0], 0, 190, { height: "52px", gap: "8px" });
      hMut.append(diceIcon, V.h("span", { text: "mutate" }));
      const hRec = tag("recombine", "c-purple", PX[1], 0, 200, { height: "52px" });
      const needed = tag("needed", "c-green", PX[0] + 214, 4, 150, { height: "44px" });
      const optional = tag("optional", "c-grey", PX[1] + 224, 4, 170, { height: "44px" });
      const tParent = tag("parent", "c-grey", PX[0] + 34, 56, 120, { height: "40px" });
      const tChild = tag("child", "c-grey", PX[0] + 34, 372, 110, { height: "40px" });
      const tChild2 = tag("child", "c-grey", PX[1] + 34, 412, 110, { height: "40px" });
      const bar = L1.ingredientBar(root, { y: 588 });

      const arc = (k, a, b, h) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - h * Math.sin(Math.PI * k) });

      return (t) => {
        // panels and headers
        V.place(lg, { x: 246 * (1 - ramp(t, 4.9, 5.6, E.inOut)) });
        const pL = ramp(t, 0.4, 0.9);
        const pR = ramp(t, 5.2, 5.7);
        V.place(panels[0], pop(pL, 0));
        V.place(panels[1], pop(pR, 0));
        V.place(hMut, pop(pL));
        V.place(hRec, pop(pR));
        V.place(tParent, pop(ramp(t, 0.8, 1.2)));
        V.place(needed, pop(ramp(t, 8.9, 9.3)));
        V.place(optional, pop(ramp(t, 9.2, 9.6)));
        V.place(tChild, pop(ramp(t, 1.6, 2.0)));
        V.place(tChild2, pop(ramp(t, 8.3, 8.7)));

        // LEFT: parent row, then a copy slides down into the child row
        mP.all((i) => {
          const k = ramp(t, 0.5 + 0.06 * i, 1.0 + 0.06 * i);
          return pop(k, 8);
        });
        const slide = (i) => ramp(t, 1.4 + 0.05 * i, 2.2 + 0.05 * i, E.inOut);
        const fk = ramp(t, 3.4, 4.0, E.inOut);
        mC.all((i) => {
          const k = slide(i);
          return { y: (1 - k) * (ROW.mp - ROW.mc), o: clamp(k * 4), s: 1 };
        });
        mC.flip(GENE, fk, {
          from: "A",
          to: NEW,
          tone: "blue",
          toTone: "purple",
          solid: fk >= 0.5,
          hop: 14,
          y: (1 - slide(GENE)) * (ROW.mp - ROW.mc),
          o: clamp(slide(GENE) * 4),
          s: 1 + 0.18 * flash(t, 3.4, 4.1),
        });
        V.place(arrow, { o: ramp(t, 1.8, 2.3) * (1 - 0) });

        // dice hop over the child row and land on gene 4
        const dk = ramp(t, 2.6, 3.6, E.lin);
        const land = mC.mid(GENE);
        const from = { x: PX[0] + 405, y: ROW.mc - 62 };
        const to = { x: land.x, y: ROW.mc - 40 };
        const dp = arc(E.inOut(dk), from, to, 46);
        diceG.replaceChildren(L5.dice(0, 0, 52, { face: 5, tone: "purple" }));
        V.place(diceG, {
          x: dp.x,
          y: dp.y,
          r: dk > 0 && dk < 1 ? dk * 360 : 0,
          s: 0.7 + 0.3 * E.pop(ramp(t, 2.5, 2.8)),
          o: ramp(t, 2.5, 2.7) * (1 - ramp(t, 4.0, 4.5)),
        });

        // RIGHT: two parents, cut line, head and tail slide down
        rP1.all((i) => pop(ramp(t, 5.4 + 0.05 * i, 5.9 + 0.05 * i), 8));
        // while the copied head passes over it, the unused head of parent 2 steps back
        const dim = 1 - 0.65 * ramp(t, 6.9, 7.2) * (1 - ramp(t, 8.2, 8.6));
        rP2.all((i) => {
          const st = pop(ramp(t, 5.6 + 0.05 * i, 6.1 + 0.05 * i), 8);
          return i < CUT ? { ...st, o: st.o * dim } : st;
        });
        const cutK = ramp(t, 6.2, 6.9, E.inOut);
        cut.setAttribute("y2", String(lerp(70, 280, cutK)));
        V.show(cut, cutK);
        rC.all((i) => {
          const head = i < CUT;
          const k = ramp(t, 7.0 + 0.03 * (head ? i : i - CUT), 8.2 + 0.03 * (head ? i : i - CUT), E.inOut);
          const src = head ? ROW.rp1 : ROW.rp2;
          const pulse = 1 + 0.12 * flash(t, 8.3, 8.8);
          return { y: (1 - k) * (src - ROW.rc), o: clamp(k * 4), s: pulse, tone: head ? "blue" : "purple" };
        });

        // ingredient bar
        const st = ["done", t < 4.0 ? "active" : "done", t < 5.2 ? "off" : t < 8.7 ? "active" : "done"];
        bar(st, ramp(t, 0.2, 0.9));
      };
    },
  });
})();
