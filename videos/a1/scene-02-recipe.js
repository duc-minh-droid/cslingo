/* Algorithms Phase 1 (algo-1), scene 02-recipe: "Find the biggest" is only a wish. Six questions are asked by six orange
   pills (each with a question mark) hanging over the parts of a tiny pipeline: INPUT, STEPS, COMPARE, TERMINATE, OUTPUT and
   EDGE CASES. Drawing a part answers its question: the pill turns green with a tick and the counter at the top counts
   "n of 6 answered". The finished machine RUNS on A1.LIST (copies of the tiles hop into it, the output shows the running best
   3, 8, 9) and finally meets an empty list, which answers "none". Numbers come from A1.maxRun.
   Local seconds: 0.2-1.9 Byte, the wish, the empty slots and the six questions; 2.5-3.3 INPUT; 3.4-4.4 STEPS; 4.3-4.9
   COMPARE; 5.0-5.5 TERMINATE; 5.6-6.4 OUTPUT; 6.0-7.6 the run; 8.0-9.5 the empty list; 9.5-10.5 still. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- data: everything printed comes from the real loop ----------
  const RUN = A1.maxRun();
  const EMPTY = A1.maxRun([]);
  A1.must(RUN.answer === 9 && EMPTY.answer === null, "scene 2: the run must end in 9 and an empty list in none");
  const BEST = RUN.steps.map((s) => String(s.best)); // 3 8 8 9 9 9 9
  const FIRST9 = RUN.steps.findIndex((s) => s.best === RUN.answer); // 3: from here the output slot is solid orange
  const NONE = "none";

  // ---------- layout (stage px) ----------
  const DY = 24; // the whole pipeline sits a little low, so the figure is centred in the stage
  const YC = 286 + DY; // centre line of the list, the first machine slot and the output
  const TAG_Y = 176 + DY; // the row of question pills
  const LIST = { x: 0, y: YC - 25, size: 50, gap: 6, w: 386 };
  const FIN_X = 394; // the finish line (a pole) just after the last tile
  const ARROW_X = [412, 722];
  const SLOT_A = { x: 468, y: YC - 50, w: 240, h: 100 }; // STEPS
  const SLOT_B = { x: 468, y: 410 + DY, w: 240, h: 100 }; // COMPARE
  const MACH_CX = SLOT_A.x + SLOT_A.w / 2;
  const OUT = { x: 780, y: YC - 44, size: 88 };
  const OUT_CX = OUT.x + OUT.size / 2;
  const EDGE_Y = 372 + DY;

  // ---------- timeline (local seconds) ----------
  const PARTS = [
    { text: "INPUT", at: 0.9, ans: 3.0 },
    { text: "STEPS", at: 1.05, ans: 4.1 },
    { text: "COMPARE", at: 1.2, ans: 4.9 },
    { text: "TERMINATE", at: 1.35, ans: 5.5 },
    { text: "OUTPUT", at: 1.5, ans: 6.45 },
    { text: "EDGE CASES", at: 1.65, ans: 9.5 },
  ];
  const DEPART = (i) => 6.0 + 0.2 * i; // copy of tile i leaves for the machine
  const FLIGHT = 0.35;
  const ARRIVE = RUN.steps.map((_, i) => DEPART(i) + FLIGHT);
  const SLIDE = 8.0; // the list tiles slide out
  const SHAKE = 8.7; // the machine meets an empty list
  const FLIP = [9.0, 9.4]; // the output slot turns into "none"
  const HAPPY = PARTS[5].ans; // Byte is satisfied

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  });
  const dashed = (extra) => ({ background: "transparent", borderStyle: "dashed", boxShadow: "none", ...extra });
  const pop = (k) => ({ s: 0.7 + 0.3 * E.pop(k), o: clamp(k * 4) });

  V.scene({
    kicker: "WHAT IS AN ALGORITHM?",
    title: ["A wish is not", "an algorithm"],
    dur: 10.5,
    caps: [
      [0.4, 2.2, "“Find the biggest” is only a wish."],
      [2.5, 7.8, "An algorithm answers every question in advance."],
      [8.0, 10.2, "Even: what if the list is empty?"],
    ],
    build(stage) {
      // ----- the wish skeleton: dashed empty slots -----
      const gList = V.h("div", {
        class: "v-card c-grey",
        style: { ...box(LIST.x, LIST.y, LIST.w, LIST.size), ...dashed({ borderRadius: "18px" }) },
      });
      const gA = V.h("div", { class: "v-card c-grey", style: { ...box(SLOT_A.x, SLOT_A.y, SLOT_A.w, SLOT_A.h), ...dashed({}) } }); // prettier-ignore
      const gB = V.h("div", { class: "v-card c-grey", style: { ...box(SLOT_B.x, SLOT_B.y, SLOT_B.w, SLOT_B.h), ...dashed({}) } }); // prettier-ignore
      stage.append(gList, gA, gB);

      // ----- INPUT: the list, with a finish line at its end -----
      const list = A1.row(stage, {
        x: LIST.x,
        y: LIST.y,
        values: A1.LIST,
        size: LIST.size,
        gap: LIST.gap,
        tone: "blue",
      });
      list.tiles.forEach((tile) => (tile.style.fontSize = "29px"));
      const pole = V.h("div", {
        style: {
          ...box(FIN_X, TAG_Y + 52, 6, LIST.y + LIST.size + 4 - (TAG_Y + 52)),
          background: "var(--amber)",
          borderRadius: "3px",
          transformOrigin: "50% 0%",
        },
      });
      stage.append(pole);
      const empty = V.h("div", {
        class: "v-card c-grey",
        text: "empty list",
        style: {
          ...box(LIST.x, LIST.y, LIST.w, LIST.size),
          ...dashed({
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            color: "var(--text-dim)",
          }),
        },
      });
      stage.append(empty);

      // ----- STEPS and COMPARE: the machine, two slots -----
      const slotStyle = (top) => ({
        left: "0px",
        top: `${top}px`,
        width: `${SLOT_A.w - 6}px`,
        textAlign: "center",
        fontSize: "28px",
        color: "var(--c-ink)",
      });
      const slotA = V.h("div", { class: "v-card c-purple", style: box(SLOT_A.x, SLOT_A.y, SLOT_A.w, SLOT_A.h) });
      const spinner = A1.icon("loop", 52, "purple");
      const line1 = V.h("div", { class: "v-text", style: slotStyle(60) });
      slotA.append(spinner, line1);
      const slotB = V.h("div", { class: "v-card c-purple", style: box(SLOT_B.x, SLOT_B.y, SLOT_B.w, SLOT_B.h) });
      const line2 = V.h("div", { class: "v-text", style: slotStyle(30) });
      slotB.append(line2);
      stage.append(slotA, slotB);

      // ----- the two arrows and the OUTPUT slot -----
      const arrows = ARROW_X.map((x) => {
        const a = A1.icon("arrow", 44, "grey");
        a.querySelectorAll("path").forEach((p) => (p.style.stroke = "var(--text-dim)")); // darker than the pale grey token, so the flow reads
        stage.append(a);
        return { a, x };
      });
      const out = A1.row(stage, { x: OUT.x, y: OUT.y, values: [""], size: OUT.size, gap: 0, tone: "grey" });
      const outFs = out.tiles[0].style.fontSize;

      // ----- the six questions: an orange pill with a question mark turns into a green pill with a tick -----
      const askPill = (text) => ({
        ask: A1.tag(stage, { text, tone: "orange", ghost: true, icon: A1.icon("qmark", 30, "orange", { flow: true }) }),
        got: A1.tag(stage, { text, tone: "green", solid: true, icon: A1.icon("tick", 30, "green", { flow: true, on: true }) }),
      }); // prettier-ignore
      const pills = PARTS.map((p) => askPill(p.text));
      const pillAt = [
        { x: 0, y: TAG_Y },
        { x: MACH_CX, y: TAG_Y + 26, center: true },
        { x: MACH_CX, y: SLOT_B.y - 32, center: true },
        { x: 345, y: TAG_Y + 26, center: true },
        { x: OUT_CX, y: TAG_Y + 26, center: true },
        { x: 0, y: EDGE_Y },
      ];

      // ----- copies of the list tiles that hop into the machine -----
      const copies = A1.LIST.map((x) =>
        V.h("div", {
          class: "v-gene c-blue solid",
          text: String(x),
          style: { ...box(0, 0, LIST.size, LIST.size), fontSize: "29px" },
        }),
      );
      stage.append(...copies);

      // ----- top strip: Byte, the wish, the counter -----
      const bytes = ["think", "happy"].map((mood) => stage.appendChild(V.mascot("byte", { size: 118, mood })));
      const wish = A1.tag(stage, { text: "“Find the biggest!”", tone: "grey", ghost: true, fs: 34, w: 400, h: 72 });
      const count = A1.tag(stage, { text: "0 of 6 answered", tone: "orange", w: 272 });

      return (t) => {
        // ---- top strip
        const bk = ramp(t, 0.2, 0.8, E.lin);
        const happy = ramp(t, HAPPY, HAPPY + 0.25, E.lin);
        V.place(bytes[0], { ...pop(bk), y: -6 * flash(t, HAPPY, HAPPY + 0.3), o: clamp(bk * 4) * (1 - happy) });
        V.place(bytes[1], { s: 0.9 + 0.1 * E.pop(happy), y: -8 * flash(t, HAPPY, HAPPY + 0.35), o: happy });
        const wk = ramp(t, 0.3, 0.9, E.lin);
        wish.set({ x: 140, y: 22, dx: -30 * (1 - E.out(wk)), o: clamp(wk * 4) });
        const answered = PARTS.filter((p) => t >= p.ans).length;
        const ck = ramp(t, 0.9, 1.3, E.lin);
        const all = answered === PARTS.length;
        const lastAns = Math.max(0, ...PARTS.map((p) => flash(t, p.ans, p.ans + 0.35)));
        count.set({
          x: 652,
          y: 30,
          text: `${answered} of 6 answered`,
          tone: all ? "green" : "orange",
          solid: all,
          s: (0.8 + 0.2 * E.pop(ck)) * (1 + 0.08 * lastAns),
          o: clamp(ck * 4),
        });

        // ---- the six questions
        PARTS.forEach((p, i) => {
          const ak = ramp(t, p.at, p.at + 0.4, E.lin);
          const gk = ramp(t, p.ans, p.ans + 0.35, E.lin);
          const bob = 1 + 0.06 * flash(t, p.at, p.at + 0.4);
          pills[i].ask.set({ ...pillAt[i], ...pop(ak), s: pop(ak).s * bob, dy: (1 - E.out(ak)) * 10, o: clamp(ak * 4) * (1 - clamp(gk * 4)) }); // prettier-ignore
          pills[i].got.set({ ...pillAt[i], ...pop(gk), dy: (1 - E.out(gk)) * 8 });
          A1.drawOn(pills[i].got.el.firstElementChild, ramp(t, p.ans + 0.1, p.ans + 0.4, E.inOut));
          A1.drawOn(pills[i].ask.el.firstElementChild, ak);
        });

        // ---- the wish skeleton
        const gk = (j) => ramp(t, 1.0 + 0.15 * j, 1.4 + 0.15 * j, E.lin);
        const listGone = ramp(t, PARTS[0].ans - 0.5, PARTS[0].ans - 0.2, E.lin);
        const aGone = ramp(t, PARTS[1].ans - 0.7, PARTS[1].ans - 0.4, E.lin);
        const bGone = ramp(t, PARTS[2].ans - 0.6, PARTS[2].ans - 0.3, E.lin);
        V.place(gList, { ...pop(gk(0)), o: clamp(gk(0) * 4) * (1 - listGone) });
        V.place(gA, { ...pop(gk(1)), o: clamp(gk(1) * 4) * (1 - aGone) });
        V.place(gB, { ...pop(gk(2)), o: clamp(gk(2) * 4) * (1 - bGone) });

        // ---- INPUT: the tiles pop in one by one
        const slideK = (i) => ramp(t, SLIDE + 0.03 * i, SLIDE + 0.03 * i + 0.35, E.inOut);
        list.all((i) => {
          const born = ramp(t, PARTS[0].ans - 0.5 + 0.1 * i, PARTS[0].ans - 0.2 + 0.1 * i, E.lin);
          const sk = slideK(i);
          const taken = flash(t, DEPART(i), DEPART(i) + 0.3);
          return {
            s: E.pop(born) * (1 + 0.06 * taken),
            x: -50 * sk,
            y: -6 * taken,
            o: clamp(born * 4) * (1 - sk),
            solid: taken > 0.5,
          };
        });

        // ---- TERMINATE: a finish line
        const stK = ramp(t, PARTS[3].ans - 0.5, PARTS[3].ans - 0.05, E.lin);
        pole.style.transform = `scaleY(${E.out(stK).toFixed(3)})`;
        V.show(pole, stK > 0 ? 1 : 0);

        // ---- STEPS and COMPARE: the two slots of the machine
        const red = ramp(t, SHAKE, SHAKE + 0.15, E.lin) * (1 - ramp(t, SHAKE + 0.45, SHAKE + 0.6, E.lin));
        const tone = red > 0.5 ? "red" : "purple";
        const shakeT = clamp((t - SHAKE) / 0.3);
        const shake = shakeT > 0 && shakeT < 1 ? 6 * Math.sin(2 * Math.PI * 3 * shakeT) * (1 - shakeT) : 0;
        const bump = Math.max(...ARRIVE.map((a) => flash(t, a, a + 0.2)));
        const aK = ramp(t, PARTS[1].ans - 0.7, PARTS[1].ans - 0.2, E.lin);
        const bK = ramp(t, PARTS[2].ans - 0.6, PARTS[2].ans - 0.1, E.lin);
        slotA.className = slotB.className = `v-card c-${tone}`;
        spinner.setAttribute("class", `c-${tone}`);
        V.place(slotA, { x: shake, s: (0.6 + 0.4 * E.back(aK)) * (1 + 0.03 * bump), o: clamp(aK * 4) });
        V.place(slotB, { x: shake, s: 0.6 + 0.4 * E.back(bK), o: clamp(bK * 4) });
        const spin = ramp(t, PARTS[1].ans - 0.6, PARTS[1].ans + 0.3, E.inOut) + ramp(t, DEPART(0), DEPART(6) + FLIGHT, E.inOut); // prettier-ignore
        V.place(spinner, { x: (SLOT_A.w - 6 - 52) / 2, y: 8, r: 360 * spin });
        line1.textContent = V.type("scan once", ramp(t, PARTS[1].ans - 0.6, PARTS[1].ans - 0.1, E.lin));
        line2.textContent = V.type("x > best?", ramp(t, PARTS[2].ans - 0.5, PARTS[2].ans - 0.1, E.lin));

        // ---- OUTPUT: arrows, the slot and the run
        arrows.forEach(({ a, x }, j) => {
          V.place(a, { x, y: YC - 22 });
          A1.drawOn(a, ramp(t, 5.6 + 0.2 * j, 6.0 + 0.2 * j, E.lin));
        });
        const seen = ARRIVE.reduce((n, a, i) => (t >= a ? i : n), -1);
        const outBorn = gk(2);
        const flipK = ramp(t, FLIP[0], FLIP[1], E.lin);
        const second = flipK >= 0.5;
        const nowBest = seen >= 0 ? BEST[seen] : "";
        const solid = seen >= FIRST9 && !second;
        const newBest = Math.max(0, ...RUN.steps.map((s, i) => (s.beat ? flash(t, ARRIVE[i], ARRIVE[i] + 0.28) : 0)));
        const outText = second ? NONE : flipK > 0 ? BEST[BEST.length - 1] : nowBest;
        out.set(0, {
          text: outText,
          tone: second ? "grey" : seen >= 0 ? "orange" : "grey",
          solid,
          ghost: seen < 0,
          sx: flipK > 0 && flipK < 1 ? Math.abs(Math.cos(Math.PI * flipK)) : 1,
          s: E.pop(outBorn) * (1 + 0.12 * newBest),
          o: clamp(outBorn * 4),
        });
        out.tiles[0].style.fontSize = outText === NONE ? "28px" : outFs;

        // ---- the run: copies of the tiles hop over the list into the machine
        copies.forEach((c, i) => {
          const k = ramp(t, DEPART(i), DEPART(i) + FLIGHT, E.inOut);
          const p0 = list.mid(i);
          const p2 = { x: SLOT_A.x + 60, y: YC + 8 };
          const ctl = { x: (p0.x + p2.x) / 2, y: YC - 100 };
          const u = 1 - k;
          const x = u * u * p0.x + 2 * u * k * ctl.x + k * k * p2.x;
          const y = u * u * p0.y + 2 * u * k * ctl.y + k * k * p2.y;
          const live = k > 0 && k < 1;
          V.place(c, {
            x: x - LIST.size / 2,
            y: y - LIST.size / 2,
            s: 1 - 0.65 * E.in(k),
            o: live ? 1 - ramp(k, 0.7, 1, E.lin) : 0,
          });
        });

        // ---- EDGE CASES: the list is empty
        V.place(empty, { ...pop(ramp(t, SLIDE + 0.35, SLIDE + 0.75, E.lin)) });
      };
    },
  });
})();
