/* Lecture 15 (ds-15) · scene 6 (AMDAHL'S LAW): the slides' example as two time bars (D15.AM): 10 sums must run in order (red),
   100 can be shared (blue). One processor: 110 sums in a row. Ten processors: the 100 split ten ways (ten thin blue strips,
   one per processor, 10 sums each) but the 10 do not: 20 sums, a speedup of 110 ÷ 20 = 5.5, not 10.
   Story (local seconds): 0.3 the red and blue blocks with their labels; 3.4 they slide together into the top bar '1 processor',
   end tag '110 sums'; 6.0 the second bar: the red block copies down, 6.6-7.8 the blue block splits into ten strips that stack
   into ten lanes 10 sums wide; 9.4 end tag '20 sums', green speedup tag and red 'not 10×'; 11.8 both red blocks pulse.
   Scale: 4.8 px per sum, bars start at x 240. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const { ramp, flash, lerp, ease: E } = V;
  const A = D15.AM;
  const PX = 4.8;
  const X0 = 240;
  const ROW = [170, 330];
  const H = 70;
  const f1 = (n) => n.toFixed(1);

  V.scene({
    kicker: "AMDAHL'S LAW",
    title: ["The part that must run", "in order stays put"],
    dur: 14,
    caps: [
      [0.4, 3.2, `${A.seq} sums must run in order. ${A.par} more can be shared.`],
      [3.4, 5.8, `On 1 processor: ${A.t1} sums in a row.`],
      [6.0, 9.2, `On ${A.procs} processors the ${A.par} split ten ways. The ${A.seq} do not.`],
      [9.4, 11.6, `Time of ${A.tn} sums: a speedup of ${A.speedup}, not ${A.procs}.`],
      [11.8, 13.7, "The sequential part sets the limit."],
    ],
    build(stage) {
      const blk = (tone, w) => {
        const c = D15.tone(tone);
        const el = V.h("div", {
          style: {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: `${f1(w)}px`,
            height: `${H}px`,
            boxSizing: "border-box",
            borderRadius: "12px",
            background: c.c,
            border: `3px solid ${c.lip}`,
            boxShadow: `0 5px 0 ${c.lip}`,
            color: c.on,
            fontSize: "30px",
            fontWeight: "900",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            whiteSpace: "nowrap",
            transformOrigin: "0 0",
          },
        });
        stage.append(el);
        return el;
      };
      const red1 = blk("red", A.seq * PX);
      const blue1 = blk("blue", A.par * PX);
      blue1.textContent = `${A.par} sums, shareable`;
      const red2 = blk("red", A.seq * PX);
      const blue2 = blk("blue", A.par * PX);
      const strips = Array.from({ length: A.procs }, () => blk("blue", (A.par / A.procs) * PX));
      strips.forEach((s) => Object.assign(s.style, { borderWidth: "2px", boxShadow: "none", borderRadius: "3px" }));
      const redTag = D4.tag(stage, { x: 150, y: 60, text: `${A.seq} sums in order`, tone: "red" });
      const names = ["1 processor", `${A.procs} processors`].map((s, i) =>
        D4.label(stage, { x: 226, y: ROW[i] + H / 2, text: s, anchor: "r", fs: 30 }),
      );
      const end1 = D4.tag(stage, {
        x: X0 + A.t1 * PX + 84,
        y: ROW[0] + H / 2,
        text: `${A.t1} sums`,
        tone: "grey",
        solid: true,
      });
      const end2 = D4.tag(stage, {
        x: X0 + A.tn * PX + 84,
        y: ROW[1] + H / 2,
        text: `${A.tn} sums`,
        tone: "grey",
        solid: true,
      });
      const sp = D4.tag(stage, {
        x: 400,
        y: 470,
        text: `speedup ${A.t1} ÷ ${A.tn} = ${A.speedup}×`,
        tone: "green",
        solid: true,
        fs: 34,
      });
      const not = D4.tag(stage, { x: 720, y: 470, text: `not ${A.procs}×`, tone: "red", solid: true, fs: 34 });
      const lgR = D4.tag(stage, { x: 300, y: 590, text: "must run in order", tone: "red" });
      const lgB = D4.tag(stage, { x: 640, y: 590, text: "can be shared out", tone: "blue" });

      return (t) => {
        const k0 = ramp(t, 0.3, 0.7);
        const j = ramp(t, 3.4, 4.2, E.inOut);
        const pulse = flash(t, 11.8, 12.4) + flash(t, 12.5, 13.1);
        // row 1: the blocks start apart on a row of their own, then join into one bar
        V.place(red1, { x: lerp(300, X0, j), y: lerp(25, ROW[0], j), o: k0, s: 1 + 0.06 * pulse });
        V.place(blue1, { x: lerp(388, X0 + A.seq * PX, j), y: lerp(25, ROW[0], j), o: ramp(t, 0.6, 1.0) });
        redTag.set({ k: ramp(t, 0.5, 0.8), o: 1 - ramp(t, 3.4, 3.7, E.lin) });
        names[0].set({ k: ramp(t, 4.0, 4.3) });
        end1.set({ k: ramp(t, 4.4, 4.8) });
        lgR.set({ k: ramp(t, 1.0, 1.3) });
        lgB.set({ k: ramp(t, 1.2, 1.5) });

        // row 2: red copies down; blue splits ten ways
        names[1].set({ k: ramp(t, 6.0, 6.3) });
        const kr = ramp(t, 6.1, 6.7, E.inOut);
        V.place(red2, { x: X0, y: lerp(ROW[0], ROW[1], kr), o: kr > 0 ? 1 : 0, s: 1 + 0.06 * pulse });
        const kb = ramp(t, 6.6, 6.9, E.lin);
        const split = t >= 7.0;
        V.place(blue2, { x: X0 + A.seq * PX, y: ROW[1], o: split ? 0 : kb });
        const ks = ramp(t, 7.0, 8.2, E.inOut);
        const lane = H / A.procs;
        strips.forEach((s, i) => {
          const w = (A.par / A.procs) * PX;
          const x = lerp(X0 + A.seq * PX + i * w, X0 + A.seq * PX, ks);
          const y = lerp(ROW[1], ROW[1] + i * lane, ks);
          s.style.height = `${f1(lerp(H, lane, ks))}px`;
          V.place(s, { x, y, o: split ? 1 : 0 });
        });
        end2.set({ k: ramp(t, 9.4, 9.8) });
        sp.set({ k: ramp(t, 9.8, 10.2) });
        not.set({ k: ramp(t, 10.4, 10.8) });
      };
    },
  });
})();
