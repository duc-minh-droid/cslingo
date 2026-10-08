/* Algorithms Phase 1 video (algo-1), scene 03: the loop invariant.
   "Find the biggest" runs on A1.LIST with two boxes that are always equal: best so far (orange) and the biggest of the first
   k items (blue). Each step: a blue ring slides to the item, a compare tag asks "x > best?", the verdict icon draws on, a
   winning item turns orange and flies its number into the best box, the second box updates and a green tick lands under the
   tile (the promise held after this step). Every number comes from A1.maxRun(). Times are local seconds:
   0.3-1.3 tiles and stats pop in, step s starts at 1.6 + 1.35 s (last step ends 11.05), 11.3-11.9 the answer. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const { steps, answer } = A1.maxRun();
  const N = steps.length;
  A1.must(N === 7 && answer === 9, "scene 3: the list run must give 7 steps and the answer 9");
  A1.must(steps.map((s) => s.best).join() === "3,8,8,9,9,9,9", "scene 3: best so far must be 3 8 8 9 9 9 9");
  A1.must(steps.map((s) => +s.beat).join("") === "1101000", "scene 3: the item beats best at steps 0, 1 and 3 only");
  A1.must(
    steps.every((s) => s.holds && s.maxChecked === s.best),
    "scene 3: the invariant must hold at every step",
  );

  const DY = 22; // the whole figure sits a little lower than the storyboard's y values, to centre it in the stage
  const Y = (y) => y + DY;
  const T0 = 1.6;
  const DT = 1.35;
  const ts = (s) => T0 + DT * s;
  const [FLY, ARRIVE, CHECK, FINAL] = [0.85, 1.2, 1.15, 11.5]; // chip leaves / lands / second box updates / answer, in seconds
  const compareText = (s) => (s === 0 ? "first item" : `${steps[s].x} > ${steps[s - 1].best}?`);
  const tagW = (s) => Math.ceil(A1.textW(compareText(s), 28) + 44);

  VID.scene({
    kicker: "THE LOOP INVARIANT",
    title: ["A promise that", "stays true"],
    dur: 13,
    caps: [
      [0.4, 2.6, "Scan once and keep the biggest so far."],
      [2.8, 6.2, "After k items, best is the biggest of those k."],
      [6.6, 10.6, "It holds after every step. That is the invariant."],
      [10.9, 12.8, "At the end the promise is the answer: 9."],
    ],
    build(stage) {
      const row = A1.row(stage, { x: 62, y: Y(120), values: A1.LIST, size: 104, gap: 14, tone: "grey" });
      const marks = steps.map(() => stage.appendChild(A1.icon("tick", 36, "green", { w: 7 })));
      const bestBox = A1.stat(stage, {
        x: 62,
        y: Y(300),
        w: 240,
        h: 150,
        label: "best so far",
        text: "–",
        tone: "orange",
      });
      const bigBox = A1.stat(stage, {
        x: 392,
        y: Y(300),
        w: 300,
        h: 150,
        label: "biggest of first k",
        text: "–",
        tone: "blue",
      });
      const bars = [Y(363), Y(379)].map((top) =>
        stage.appendChild(
          V.h("div", {
            style: {
              position: "absolute",
              left: "325px",
              top: `${top}px`,
              width: "44px",
              height: "8px",
              borderRadius: "4px",
            },
          }),
        ),
      );
      const holdsIcon = A1.icon("tick", 30, "green", { flow: true, on: true });
      const holds = A1.tag(stage, { text: "holds", tone: "green", solid: true, icon: holdsIcon });
      const cmp = A1.tag(stage, { tone: "blue" });
      const tickV = stage.appendChild(A1.icon("tick", 40, "green", { w: 7 }));
      const crossV = stage.appendChild(A1.icon("cross", 40, "grey", { w: 7 }));
      crossV.querySelectorAll("[data-draw]").forEach((p) => (p.style.stroke = "var(--text-dim)"));
      const chip = stage.appendChild(
        V.h("div", { class: "v-gene c-orange solid", style: { left: "0px", top: "0px" } }),
      );
      const ret = A1.tag(stage, { text: `return ${answer}`, tone: "green", solid: true, fs: 34 });

      const BEST_C = { x: 62 + 120, y: Y(300) + 75 }; // centre of the best-so-far box (where the chip lands)

      return (t) => {
        // which step is running and how far into it
        const s = clamp(Math.floor((t - T0) / DT), 0, N - 1);
        const u = t - ts(s);
        const started = t >= T0;

        // --- the list: pop in grey, then each tile is checked; the winner is orange and solid ---
        const bestIdx = steps.reduce((b, st, i) => (st.beat && t >= ts(i) + FLY ? i : b), -1);
        row.all((i) => {
          const p = ramp(t, 0.3 + 0.08 * i, 0.65 + 0.08 * i, E.lin);
          const isBest = i === bestIdx;
          const bump = isBest ? 0.1 * flash(t, ts(i) + FLY, ts(i) + ARRIVE) : 0;
          return {
            tone: isBest ? "orange" : t >= ts(i) + FLY ? "blue" : "grey",
            solid: isBest,
            s: E.back(p) * (1 + bump),
            o: clamp(p * 4),
          };
        });

        // --- the ring slides from tile to tile, and leaves at the end ---
        const ringI = s === 0 ? 0 : s - 1 + E.inOut(clamp(u / 0.3));
        const ringOut = 1 - ramp(t, 11.3, 11.9, E.lin);
        row.ring({ i: ringI, k: started ? ramp(t, T0, T0 + 0.3, E.lin) : 0, tone: "blue", o: ringOut });

        // --- the compare tag and its verdict icon: the previous one fades while the ring moves ---
        const old = s > 0 && u < 0.3;
        const d = old ? s - 1 : s;
        const pop = old ? 1 : ramp(u, 0.3, 0.7, E.lin);
        const tagO = (old ? 1 - ramp(u, 0, 0.2, E.lin) : clamp(pop * 4)) * ringOut;
        const w = tagW(d);
        const cx = row.mid(d).x;
        const shift = Math.max(0, cx + w / 2 + 8 + 40 - 924); // keep the icon inside the stage on the last tiles
        cmp.set({
          text: compareText(d),
          tone: "blue",
          x: cx - shift,
          y: Y(76),
          center: true,
          w,
          s: 0.8 + 0.2 * E.pop(pop),
          o: tagO,
        });
        const verdict = steps[d].beat ? tickV : crossV;
        const other = steps[d].beat ? crossV : tickV;
        const drawK = old ? 1 : ramp(u, 0.6, 0.85, E.inOut);
        const iconAt = { x: cx - shift + w / 2 + 8, y: Y(76) - 20 };
        V.place(verdict, { ...iconAt, o: tagO });
        A1.drawOn(verdict, drawK);
        V.place(other, { o: 0 });

        // --- the chip carries the winning number into the best-so-far box ---
        const f = clamp((u - FLY) / (ARRIVE - FLY));
        const flying = started && steps[s].beat && f > 0 && f < 1;
        if (chip.textContent !== String(steps[s].x)) chip.textContent = String(steps[s].x);
        chip.style.fontSize = "58px";
        const from = row.mid(s);
        const e = E.inOut(f);
        V.place(chip, {
          x: lerp(from.x, BEST_C.x, e) - 52,
          y: lerp(from.y, BEST_C.y, e) - 46 * Math.sin(Math.PI * f) - 52,
          s: 1 - 0.45 * e,
          o: flying ? 1 - ramp(f, 0.8, 1, E.lin) : 0,
        });

        // --- the two boxes: best so far (orange) and the biggest of the first k (blue) ---
        const landed = steps.reduce((b, st, i) => (st.beat && t >= ts(i) + ARRIVE ? i : b), -1);
        const checked = steps.reduce((b, st, i) => (t >= ts(i) + CHECK ? i : b), -1);
        const bestPulse = steps.reduce(
          (a, st, i) => a + (st.beat ? flash(t, ts(i) + ARRIVE, ts(i) + ARRIVE + 0.25) : 0),
          0,
        );
        const bigPulse = steps.reduce((a, st, i) => a + flash(t, ts(i) + CHECK, ts(i) + CHECK + 0.25), 0);
        const done = t >= FINAL;
        const pin = (a) => E.pop(ramp(t, a, a + 0.4, E.lin));
        const pinO = (a) => clamp(ramp(t, a, a + 0.4, E.lin) * 4);
        bestBox.set({
          text: landed < 0 ? "–" : steps[landed].best,
          label: done ? "answer" : "best so far",
          tone: done ? "green" : "orange",
          s: pin(0.7) * (1 + 0.08 * bestPulse + 0.06 * flash(t, FINAL, FINAL + 0.4)),
          o: pinO(0.7),
        });
        bigBox.set({
          text: checked < 0 ? "–" : steps[checked].maxChecked,
          label: checked < 0 ? "biggest of first k" : `biggest of first ${steps[checked].k}`,
          tone: "blue",
          s: pin(0.9) * (1 + 0.07 * bigPulse),
          o: pinO(0.9),
        });

        // --- equals sign, 'holds' tag and the ticks under the tiles: the promise held after every step ---
        const firstHold = ts(0) + ARRIVE;
        const holdPulse = steps.reduce(
          (a, st, i) => a + (i > 0 ? flash(t, ts(i) + ARRIVE, ts(i) + ARRIVE + 0.25) : 0),
          0,
        );
        const eqIn = ramp(t, 0.9, 1.3, E.lin);
        bars.forEach((b) => {
          b.style.background = t >= firstHold ? "var(--teal)" : "var(--text-dim)";
          V.place(b, { s: (0.7 + 0.3 * E.pop(eqIn)) * (1 + 0.15 * holdPulse), o: clamp(eqIn * 4) });
        });
        const hk = ramp(t, firstHold, firstHold + 0.4, E.lin);
        holds.set({ x: 716, y: Y(350), s: (0.7 + 0.3 * E.pop(hk)) * (1 + 0.08 * holdPulse), o: clamp(hk * 4) });
        A1.drawOn(holdsIcon, ramp(t, firstHold + 0.15, firstHold + 0.45, E.inOut));
        marks.forEach((m, i) => {
          const a = ts(i) + ARRIVE;
          const k = ramp(t, a, a + 0.35, E.lin);
          V.place(m, { x: row.mid(i).x - 18, y: Y(242), s: 0.6 + 0.4 * E.pop(k), o: clamp(k * 4) });
          A1.drawOn(m, ramp(t, a, a + 0.3, E.inOut));
        });

        // --- the end: the promise is the answer ---
        const rk = ramp(t, FINAL, FINAL + 0.4, E.lin);
        ret.set({ x: 62, y: Y(490), s: 0.7 + 0.3 * E.pop(rk), o: clamp(rk * 4) });
      };
    },
  });
})();
