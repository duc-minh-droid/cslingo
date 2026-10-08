/* Algorithms Phase 1 (algo-1), scene 02-recipe: "Find the biggest" is only a wish. Six open questions (a strip of orange
   question marks) are answered by drawing a tiny pipeline part by part: INPUT, STEPS, COMPARE, STOP, OUTPUT, then the EDGE
   CASE of an empty list. The finished machine RUNS on A1.LIST (copies of the tiles hop into it, the output shows the running
   best 3, 8, 9) and finally meets an empty list, which answers "none". Numbers come from A1.maxRun. */
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
  const YC = 350; // centre line of the pipeline
  const TAG_Y = 196; // the row of part labels
  const LIST = { x: 0, y: YC - 26, size: 52, gap: 6, w: 400 };
  const FIN_X = 410; // the finish line (a pole) just after the last tile
  const ARROW1_X = 430;
  const ARROW2_X = 752;
  const MACH = { x: 500, y: YC - 78, w: 240, h: 156 };
  const OUT = { x: 800, y: YC - 44, size: 88 };
  const MACH_CX = MACH.x + MACH.w / 2;
  const OUT_CX = OUT.x + OUT.size / 2;
  const EDGE_Y = YC + 92;
  const QY = 38; // question icons (top strip)
  const qx = (i) => 612 + 52 * i;

  // ---------- timeline (local seconds) ----------
  const PARTS = [
    { text: "INPUT", at: 2.0, ans: 2.9 },
    { text: "STEPS", at: 3.2, ans: 3.9 },
    { text: "COMPARE", at: 3.9, ans: 4.5 },
    { text: "STOP", at: 4.7, ans: 5.3 },
    { text: "OUTPUT", at: 5.5, ans: 6.9 },
    { text: "EDGE CASES", at: 7.4, ans: 8.6 },
  ];
  const DEPART = (i) => 5.9 + 0.15 * i; // copy of tile i leaves for the machine
  const FLIGHT = 0.35;
  const ARRIVE = RUN.steps.map((_, i) => DEPART(i) + FLIGHT);
  const SLIDE = 7.2; // the list tiles slide out
  const SHAKE = 7.7; // the machine meets an empty list
  const FLIP = [8.0, 8.4]; // the output slot turns into "none"
  const HAPPY = 8.6; // Byte is satisfied

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
    dur: 10,
    caps: [
      [0.4, 2.2, "“Find the biggest” is only a wish."],
      [2.5, 6.4, "An algorithm answers every question in advance."],
      [7.1, 9.5, "Even: what if the list is empty?"],
    ],
    build(stage) {
      // ----- the wish skeleton: dashed empty slots with orange question marks -----
      const gList = V.h("div", { class: "v-card c-grey", style: { ...box(LIST.x, LIST.y, LIST.w, 52), ...dashed({ borderRadius: "18px" }) } });
      const gMach = V.h("div", { class: "v-card c-grey", style: { ...box(MACH.x, MACH.y, MACH.w, MACH.h), ...dashed({}) } });
      stage.append(gList, gMach);
      const ghostQ = (cx, cy, size) => {
        const ic = A1.icon("qmark", size, "orange");
        stage.append(ic);
        return (k, o = 1) => V.place(ic, { x: cx - size / 2, y: cy - size / 2, s: 0.6 + 0.4 * E.pop(k), o: clamp(k * 4) * o });
      };
      const qList = ghostQ(LIST.w / 2, YC, 40);
      const qMach = ghostQ(MACH_CX, YC, 64);
      const qOut = ghostQ(OUT_CX, YC, 44);

      // ----- INPUT: the list, with a finish line at its end -----
      const list = A1.row(stage, { x: LIST.x, y: LIST.y, values: A1.LIST, size: LIST.size, gap: LIST.gap, tone: "blue" });
      const pole = V.h("div", {
        style: { ...box(FIN_X, TAG_Y + 52, 6, LIST.y + 52 + 4 - (TAG_Y + 52)), background: "var(--amber)", borderRadius: "3px", transformOrigin: "50% 0%" },
      });
      stage.append(pole);
      const empty = V.h("div", {
        class: "v-card c-grey",
        text: "empty list",
        style: {
          ...box(LIST.x, LIST.y, LIST.w, 52),
          ...dashed({ borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "var(--text-dim)" }),
        },
      });
      stage.append(empty);

      // ----- STEPS and COMPARE: the machine -----
      const machine = V.h("div", { class: "v-card c-purple", style: box(MACH.x, MACH.y, MACH.w, MACH.h) });
      const spinner = A1.icon("loop", 56, "purple");
      const lineStyle = (top) => ({ left: "0px", top: `${top}px`, width: `${MACH.w - 6}px`, textAlign: "center", fontSize: "28px", color: "var(--c-ink)" });
      const line1 = V.h("div", { class: "v-text", style: lineStyle(70) });
      const line2 = V.h("div", { class: "v-text", style: lineStyle(106) });
      machine.append(spinner, line1, line2);
      stage.append(machine);

      // ----- the two arrows and the OUTPUT slot -----
      const arrows = [ARROW1_X, ARROW2_X].map((x) => {
        const a = A1.icon("arrow", 52, "grey");
        stage.append(a);
        return { a, x };
      });
      const out = A1.row(stage, { x: OUT.x, y: OUT.y, values: [""], size: OUT.size, gap: 0, tone: "grey" });
      const outFs = out.tiles[0].style.fontSize;

      // ----- the six part labels -----
      const tags = {
        input: A1.tag(stage, { text: "INPUT", tone: "blue", solid: true }),
        steps: A1.tag(stage, { text: "STEPS", tone: "purple", solid: true }),
        compare: A1.tag(stage, { text: "COMPARE", tone: "purple", solid: true }),
        stop: A1.tag(stage, { text: "STOP", tone: "grey", icon: A1.icon("flag", 30, "orange", { flow: true }) }),
        output: A1.tag(stage, { text: "OUTPUT", tone: "orange", solid: true }),
      };
      const edgeQ = A1.icon("qmark", 30, "red", { flow: true, on: true });
      const edgeTick = A1.icon("tick", 30, "green", { flow: true, on: true });
      const edgeRed = A1.tag(stage, { text: "EDGE CASES", tone: "red", solid: true, icon: edgeQ });
      const edgeGreen = A1.tag(stage, { text: "EDGE CASES", tone: "green", solid: true, icon: edgeTick });

      // ----- copies of the list tiles that hop into the machine -----
      const copies = A1.LIST.map((x) =>
        V.h("div", { class: "v-gene c-blue solid", text: String(x), style: { ...box(0, 0, LIST.size, LIST.size), fontSize: "29px" } }),
      );
      stage.append(...copies);

      // ----- top strip: Byte, the wish, six open questions -----
      const bytes = ["think", "happy"].map((mood) => stage.appendChild(V.mascot("byte", { size: 118, mood })));
      const wish = A1.tag(stage, { text: "“Find the biggest!”", tone: "grey", ghost: true, fs: 34, w: 400, h: 72 });
      const strip = V.h("div", { class: "v-card plain c-grey", style: box(596, 22, 328, 72) });
      stage.append(strip);
      const qs = PARTS.map(() => {
        const q = A1.icon("qmark", 40, "orange");
        const k = A1.icon("tick", 40, "green");
        stage.append(q, k);
        return { q, k };
      });

      return (t) => {
        // ---- top strip
        const bk = ramp(t, 0.2, 0.8, E.lin);
        const happy = ramp(t, HAPPY, HAPPY + 0.25, E.lin);
        V.place(bytes[0], { ...pop(bk), y: -6 * flash(t, HAPPY, HAPPY + 0.3), o: clamp(bk * 4) * (1 - happy) });
        V.place(bytes[1], { s: 0.9 + 0.1 * E.pop(happy), y: -8 * flash(t, HAPPY, HAPPY + 0.35), o: happy });
        const wk = ramp(t, 0.3, 0.9, E.lin);
        wish.set({ x: 140, y: 22, dx: -30 * (1 - E.out(wk)), o: clamp(wk * 4) * (1 - 0.45 * ramp(t, 2.2, 2.6, E.lin)) });
        V.place(strip, { ...pop(ramp(t, 0.7, 1.1, E.lin)) });
        qs.forEach((q, i) => {
          const born = ramp(t, 0.8 + 0.1 * i, 1.15 + 0.1 * i, E.lin);
          const a = PARTS[i].ans;
          const gone = ramp(t, a - 0.2, a, E.lin);
          const bob = 3 * Math.sin((2 * Math.PI * t) / 1.7 + i * 0.9);
          const ping = 1 + 0.25 * flash(t, PARTS[i].at, PARTS[i].at + 0.4);
          V.place(q.q, { x: qx(i), y: QY + bob, s: (0.6 + 0.4 * E.pop(born)) * ping * (1 - 0.6 * gone), o: clamp(born * 4) * (1 - gone) });
          const grow = ramp(t, a, a + 0.35, E.lin);
          V.place(q.k, { x: qx(i), y: QY, s: 1 + 0.25 * flash(t, a, a + 0.35) });
          A1.drawOn(q.k, grow);
        });

        // ---- the wish skeleton
        const gk = (j) => ramp(t, 1.0 + 0.15 * j, 1.4 + 0.15 * j, E.lin);
        const listGone = ramp(t, PARTS[0].at, PARTS[0].at + 0.3, E.lin);
        const machGone = ramp(t, PARTS[1].at, PARTS[1].at + 0.3, E.lin);
        V.place(gList, { ...pop(gk(0)), o: clamp(gk(0) * 4) * (1 - listGone) });
        V.place(gMach, { ...pop(gk(1)), o: clamp(gk(1) * 4) * (1 - machGone) });
        qList(gk(0), 1 - listGone);
        qMach(gk(1), 1 - machGone);
        const firstIn = ramp(t, ARRIVE[0], ARRIVE[0] + 0.2, E.lin);
        qOut(gk(2), 1 - firstIn);

        // ---- INPUT: label, then the tiles pop in one by one
        const inK = ramp(t, PARTS[0].at, PARTS[0].at + 0.4, E.lin);
        tags.input.set({ x: 0, y: TAG_Y, ...pop(inK), dy: (1 - E.out(inK)) * 10 });
        const slideK = (i) => ramp(t, SLIDE + 0.05 * i, SLIDE + 0.05 * i + 0.4, E.inOut);
        list.all((i) => {
          const born = ramp(t, 2.1 + 0.1 * i, 2.4 + 0.1 * i, E.lin);
          const sk = slideK(i);
          const taken = flash(t, DEPART(i), DEPART(i) + 0.3);
          return { s: E.pop(born) * (1 + 0.1 * taken), x: -70 * sk, y: -8 * taken, o: clamp(born * 4) * (1 - sk), solid: taken > 0.2 };
        });

        // ---- STOP: a finish line and a flag
        const stK = ramp(t, PARTS[3].at, PARTS[3].at + 0.45, E.lin);
        pole.style.transform = `scaleY(${E.out(stK).toFixed(3)})`;
        V.show(pole, stK > 0 ? 1 : 0);
        tags.stop.set({ x: FIN_X + 3, y: TAG_Y + 26, center: true, ...pop(stK), dy: (1 - E.out(stK)) * 10 });

        // ---- STEPS and COMPARE: the machine
        const mK = ramp(t, PARTS[1].at, PARTS[1].at + 0.5, E.lin);
        const red = ramp(t, SHAKE, SHAKE + 0.15, E.lin) * (1 - ramp(t, SHAKE + 0.45, SHAKE + 0.6, E.lin));
        const tone = red > 0.5 ? "red" : "purple";
        machine.className = `v-card c-${tone}`;
        spinner.setAttribute("class", `c-${tone}`);
        const shakeT = clamp((t - SHAKE) / 0.3);
        const shake = shakeT > 0 && shakeT < 1 ? 6 * Math.sin(2 * Math.PI * 3 * shakeT) * (1 - shakeT) : 0;
        const bump = Math.max(...ARRIVE.map((a) => flash(t, a, a + 0.2)));
        V.place(machine, { x: shake, s: (0.6 + 0.4 * E.back(mK)) * (1 + 0.03 * bump), o: clamp(mK * 4) });
        const spin = ramp(t, 3.3, 4.2, E.inOut) + ramp(t, DEPART(0), DEPART(6) + FLIGHT, E.inOut);
        V.place(spinner, { x: (MACH.w - 6 - 56) / 2, y: 8, r: 360 * spin });
        line1.textContent = V.type("scan once", ramp(t, 3.4, 3.9, E.lin));
        line2.textContent = V.type("x > best?", ramp(t, 3.95, 4.4, E.lin));
        const stepsK = ramp(t, PARTS[1].at, PARTS[1].at + 0.4, E.lin);
        tags.steps.set({ x: MACH_CX, y: TAG_Y + 26, center: true, ...pop(stepsK), dy: (1 - E.out(stepsK)) * 10 });
        const cmpK = ramp(t, PARTS[2].at, PARTS[2].at + 0.4, E.lin);
        tags.compare.set({ x: MACH_CX, y: MACH.y + MACH.h + 40, center: true, ...pop(cmpK), dy: (1 - E.out(cmpK)) * 10 });

        // ---- OUTPUT: arrows, label, the slot and the run
        const outK = ramp(t, PARTS[4].at, PARTS[4].at + 0.4, E.lin);
        tags.output.set({ x: OUT_CX, y: TAG_Y + 26, center: true, ...pop(outK), dy: (1 - E.out(outK)) * 10 });
        arrows.forEach(({ a, x }, j) => {
          V.place(a, { x, y: YC - 26 });
          A1.drawOn(a, ramp(t, 5.45 + 0.2 * j, 5.85 + 0.2 * j, E.lin));
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
          const p2 = { x: MACH.x + 70, y: YC + 6 };
          const ctl = { x: (p0.x + p2.x) / 2, y: YC - 110 };
          const u = 1 - k;
          const x = u * u * p0.x + 2 * u * k * ctl.x + k * k * p2.x;
          const y = u * u * p0.y + 2 * u * k * ctl.y + k * k * p2.y;
          const live = k > 0 && k < 1;
          V.place(c, { x: x - LIST.size / 2, y: y - LIST.size / 2, s: 1 - 0.65 * E.in(k), o: live ? 1 - ramp(k, 0.7, 1, E.lin) : 0 });
        });

        // ---- EDGE CASES: the list is empty
        V.place(empty, { ...pop(ramp(t, SLIDE + 0.3, SLIDE + 0.7, E.lin)) });
        const edK = ramp(t, PARTS[5].at, PARTS[5].at + 0.4, E.lin);
        const okK = ramp(t, PARTS[5].ans - 0.2, PARTS[5].ans + 0.2, E.lin);
        edgeRed.set({ x: 0, y: EDGE_Y, ...pop(edK), dy: (1 - E.out(edK)) * 10, o: clamp(edK * 4) * (1 - clamp(okK * 4)) });
        edgeGreen.set({ x: 0, y: EDGE_Y, ...pop(okK), dy: (1 - E.out(okK)) * 10 });
        A1.drawOn(edgeQ, edK);
        A1.drawOn(edgeTick, ramp(t, PARTS[5].ans, PARTS[5].ans + 0.3, E.lin));
      };
    },
  });
})();
