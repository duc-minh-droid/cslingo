/* Lecture 3 · scene 08 neighbours: every mutant one move away is a neighbour. A tour (adjacent swap) and a bitstring (bit flip). */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const TOUR = "EABDC";
  const BITS = "00110";
  const SIZE = 64;
  const GAP = 10;
  const PITCH = SIZE + GAP;
  const ROWS = [170, 248, 326, 404, 482];
  const LEFT = { x: 38, mid: 218, bx: 20 };
  const RIGHT = { x: 538, mid: 718, bx: 518 };
  const T0 = 1.4; // one neighbour per second from here
  const NB_TOUR = L3.neighbours(TOUR);
  const NB_BITS = [0, 1, 2, 3, 4].map((i) => L3.flip(BITS, i));
  // the data must match the lecture
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  if (!same(NB_TOUR, ["AEBDC", "EBADC", "EADBC", "EABCD", "CABDE"])) throw new Error("scene 8: tour neighbours differ");
  if (!same(NB_BITS, ["10110", "01110", "00010", "00100", "00111"])) throw new Error("scene 8: bit neighbours differ");

  V.scene({
    kicker: "NEIGHBOURHOODS",
    title: ["Neighbours are", "one move away"],
    dur: 10,
    caps: [
      [0.4, 2, "Start from one solution."],
      [2.2, 6.6, "Every solution one mutation away is a neighbour."],
      [6.8, 9.4, "A different operator gives different neighbours."],
    ],
    build(stage) {
      const svg = L5.svg(stage);
      const tagL = L3.tag(stage, { x: LEFT.mid, y: 0, text: "swap two neighbours", tone: "purple", anchor: "c" });
      const tagR = L3.tag(stage, { x: RIGHT.mid, y: 0, text: "flip one bit", tone: "purple", anchor: "c" });
      const cntL = L3.tag(stage, { x: LEFT.mid, y: 580, text: "0 neighbours", tone: "green", anchor: "c" });
      const cntR = L3.tag(stage, { x: RIGHT.mid, y: 580, text: "0 neighbours", tone: "green", anchor: "c" });
      const startL = L5.chromosome(stage, { x: LEFT.x, y: 70, genes: TOUR, size: SIZE, gap: GAP, tone: "blue" });
      const startR = L5.chromosome(stage, { x: RIGHT.x, y: 70, genes: BITS, size: SIZE, gap: GAP, tone: "blue" });
      const rowsL = ROWS.map((y) =>
        L5.chromosome(stage, { x: LEFT.x, y, genes: TOUR, size: SIZE, gap: GAP, tone: "blue" }),
      );
      const rowsR = ROWS.map((y) =>
        L5.chromosome(stage, { x: RIGHT.x, y, genes: BITS, size: SIZE, gap: GAP, tone: "blue" }),
      );
      // purple frames on the start rows: a pair (swap) and a single tile (flip); two for the wrap-around
      const frameStyle = (w) => ({
        position: "absolute",
        width: `${w}px`,
        height: `${SIZE + 16}px`,
        top: `${70 - 8}px`,
        border: "5px solid var(--violet)",
        borderRadius: "18px",
        boxSizing: "border-box",
        visibility: "hidden",
      });
      const frames = [V.h("div", { style: frameStyle(SIZE + 16) }), V.h("div", { style: frameStyle(SIZE + 16) })];
      const frameR = V.h("div", { style: frameStyle(SIZE + 16) });
      stage.append(...frames, frameR);
      // arc under the start tour: joins the last and the first tile (the tour is a loop)
      const ax0 = LEFT.x + SIZE / 2;
      const ax1 = LEFT.x + 4 * PITCH + SIZE / 2;
      const arc = V.s("path", {
        d: `M ${ax0} ${70 + SIZE + 8} Q ${(ax0 + ax1) / 2} ${70 + SIZE + 8 + 54} ${ax1} ${70 + SIZE + 8}`,
        fill: "none",
        pathLength: "1",
        "stroke-width": "6",
        "stroke-linecap": "round",
        style: { stroke: "var(--violet)" },
      });
      svg.append(arc);
      // green brackets round the five rows of each column
      const bracket = (x, dir) => {
        const y1 = ROWS[0];
        const y2 = ROWS[4] + SIZE;
        return V.s("path", {
          d: `M ${x + dir * 10} ${y1} H ${x} V ${y2} H ${x + dir * 10}`,
          fill: "none",
          pathLength: "1",
          "stroke-width": "5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: "var(--teal)" },
        });
      };
      const brL = bracket(LEFT.bx, 1);
      const brR = bracket(RIGHT.bx, 1);
      svg.append(brL, brR);
      const draw = (p, k) => {
        p.style.strokeDasharray = "1 1";
        p.style.strokeDashoffset = String(1 - k);
        p.style.visibility = k <= 0.002 ? "hidden" : "";
      };

      const frameAt = (j) => {
        // [left, width] of the frames on the start tour for permutation neighbour j
        const a = j;
        if (j < 4) return [{ x: LEFT.x + a * PITCH - 8, w: 2 * SIZE + GAP + 16 }];
        return [
          { x: LEFT.x - 8, w: SIZE + 16 },
          { x: LEFT.x + 4 * PITCH - 8, w: SIZE + 16 },
        ];
      };

      return (t) => {
        // pops of the start rows with their tags
        const pk = (i) => ramp(t, 0.3 + i * 0.1, 0.6 + i * 0.1, E.back);
        // pulses (scene end): left, then right
        const pl = flash(t, 7.4, 8.4);
        const pr = flash(t, 8.4, 9.4);
        tagL.set({
          s: (0.8 + 0.2 * ramp(t, 0.3, 0.7, E.back)) * (1 + 0.14 * pl),
          o: ramp(t, 0.3, 0.55),
          tone: "purple",
          solid: pl > 0.3,
        });
        tagR.set({
          s: (0.8 + 0.2 * ramp(t, 0.3, 0.7, E.back)) * (1 + 0.14 * pr),
          o: ramp(t, 0.3, 0.55),
          tone: "purple",
          solid: pr > 0.3,
        });
        for (let i = 0; i < 5; i++) {
          const k = pk(i);
          startL.set(i, { s: 0.7 + 0.3 * k, o: Math.min(1, k * 3) });
          startR.set(i, { s: 0.7 + 0.3 * k, o: Math.min(1, k * 3) });
        }

        // step progress per neighbour
        let count = 0;
        let fR = 0;
        let arcK = 0;
        let fPair = [];
        for (let j = 0; j < 5; j++) {
          const k = t - (T0 + j);
          const show = ramp(k, 0.3, 0.6); // the copy appears and slides down
          const slide = ramp(k, 0.5, 1.0, E.inOut); // the change happens
          const lift = (1 - ramp(k, 0.3, 0.7, E.out)) * -60;
          const o = Math.min(1, show * 2.5);
          if (k >= 0.95) count++;
          // frame on the start row
          const fo = ramp(k, 0, 0.25) * (1 - ramp(k, 0.8, 1.0));
          if (fo > 0.01) {
            fPair = frameAt(j).map((f) => ({ ...f, o: fo }));
            fR = fo;
            if (j === 4) arcK = ramp(k, 0, 0.5, E.inOut);
          }
          // permutation neighbour: the pair slides past each other
          const a = j;
          const b = (j + 1) % 5;
          const rowL = rowsL[j];
          const sl = ramp(k, 0.5, 1.0, E.inOut);
          const orange = sl > 0.25 ? "orange" : "blue";
          for (let i = 0; i < 5; i++) {
            let st = { y: lift, o };
            if (i === a || i === b) {
              const dir = i === a ? 1 : -1;
              const dist = (b - a) * PITCH;
              st = {
                y: lift + dir * -14 * Math.sin(Math.PI * sl),
                x: (i === a ? dist : -dist) * sl,
                o,
                tone: orange,
              };
            }
            rowL.set(i, st);
          }
          // bit neighbour: the flipped tile turns over and goes orange
          const rowR = rowsR[j];
          for (let i = 0; i < 5; i++) {
            if (i === j)
              rowR.flip(i, slide, {
                from: BITS[i],
                to: NB_BITS[j][i],
                tone: "blue",
                toTone: "orange",
                y: lift,
                o,
                hop: 12,
              });
            else rowR.set(i, { y: lift, o });
          }
        }
        // frames, arc
        frames.forEach((f, i) => {
          const d = fPair[i];
          f.style.visibility = d ? "" : "hidden";
          if (d) {
            f.style.left = `${d.x}px`;
            f.style.width = `${d.w}px`;
            V.place(f, { o: d.o, s: 0.9 + 0.1 * d.o });
          }
        });
        // bit frame: tile index j on the right start row
        let jb = -1;
        for (let j = 0; j < 5; j++) if (t - (T0 + j) >= -0.001 && t - (T0 + j) < 1.0) jb = j;
        frameR.style.visibility = jb >= 0 && fR > 0.01 ? "" : "hidden";
        if (jb >= 0) {
          frameR.style.left = `${RIGHT.x + jb * PITCH - 8}px`;
          V.place(frameR, { o: fR, s: 0.9 + 0.1 * fR });
        }
        draw(arc, arcK);
        arc.style.opacity = String(fR);
        if (arcK === 0) arc.style.visibility = "hidden";

        // counters and brackets
        const ck = ramp(t, 0.9, 1.1);
        const txt = `${count} neighbour${count === 1 ? "" : "s"}`;
        const tail = ramp(t, 6.4, 7.4, E.inOut);
        const cntSt = (pulse) => ({
          text: txt,
          o: ck,
          s: (0.85 + 0.15 * ck) * (1 + 0.08 * pulse),
          solid: tail >= 1,
        });
        cntL.set(cntSt(flash(t, T0 + 0.95 + 4, T0 + 0.95 + 4.4) * 0));
        cntR.set(cntSt(0));
        draw(brL, tail);
        draw(brR, tail);
      };
    },
  });
})();
