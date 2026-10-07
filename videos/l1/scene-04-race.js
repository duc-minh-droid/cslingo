/* Lecture 1 · What is NIC?, scene 04-race: a typing monkey and keep-if-better get the same number of tries on the same
   28-letter target. All numbers come from L1.weasel (seeds 17 and 117), nothing is typed in. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const W = L1.weasel;
  const TARGET = W.TARGET;
  const keeper = W.keeper(17);
  const monkey = W.monkey(117, keeper.tries);
  const TRIES = keeper.tries;
  const [RACE0, RACE1, HZ] = [1.4, 9.4, 12];
  const px = (n) => `${n}px`;

  // ---------- numbers, checked at build time ----------
  const need = (c, m) => {
    if (!c) throw new Error(`scene-04-race: ${m}`);
  };
  need(TARGET.length === 28 && W.ALPHA.length === 27, "target is 28 letters over 27 symbols");
  need(TRIES === 3037 && L1.fmt(TRIES) === "3,037", "keeper needs 3,037 tries");
  need(keeper.matchesAt(TRIES) === 28 && keeper.stateAt(TRIES) === TARGET, "keeper reaches the target");
  need(monkey.bestAt(TRIES) === 6, "monkey best is 6 of 28");
  need(W.SPACE === "11972515182562019788602740026717047105681" && W.SPACE_DIGITS === 41, "27^28 has 41 digits");
  need(String(TRIES).length === 4, "3,037 has 4 digits");
  // the try at which each position first became (and stays) correct: drives the pop of a newly green tile
  const firstOk = Array(28).fill(Infinity);
  keeper.changes.forEach((c) => {
    if (c.c === TARGET[c.i] && firstOk[c.i] === Infinity) firstOk[c.i] = c.try;
  });
  need(
    firstOk.every((n) => n <= TRIES),
    "every position becomes correct",
  );

  // ---------- timing ----------
  const triesAt = (t) => Math.max(1, Math.round(TRIES * ramp(t, RACE0, RACE1, E.lin)));
  const timeOf = (n) => RACE0 + ((RACE1 - RACE0) * n) / TRIES;
  // time sampled at 12 Hz so letters hold between samples (no strobing); the last sample is the finish
  const sampleT = (t) => (t >= RACE1 ? RACE1 : Math.max(RACE0, Math.floor(t * HZ) / HZ));
  const inkOf = (ok) => (ok ? "green" : "grey");

  function panel(stage, y, tone, label, labelClass) {
    const box = V.h("div", { style: { position: "absolute", left: "0", top: px(y), width: "936px", height: "198px" } });
    box.append(
      V.h("div", { class: "v-card plain c-grey", style: { left: "0", top: "0", width: "936px", height: "198px" } }),
    );
    const tag = L1.chip(box, label, tone, { x: 20, y: 12, solid: true });
    tag.classList.add(labelClass);
    const stat1 = L1.chip(box, "", "grey", { x: 280, y: 12, width: 260 });
    const stat2 = L1.chip(box, "", "grey", { x: 580, y: 12, width: 260 });
    const grid = L1.letterGrid(box, { text: TARGET, cols: 14, size: 52, gap: 8, x: 52, y: 70, rowGap: 10 });
    stage.append(box);
    return { box, tag, stat1, stat2, grid };
  }

  V.scene({
    kicker: "THE RACE",
    title: ["Random guessing", "vs keep-if-better"],
    dur: 15,
    caps: [
      [0.4, 2.6, "Same target. Same number of tries."],
      [2.8, 6, "The monkey starts from scratch every time."],
      [6.2, 9.3, "Keep-if-better locks in each correct letter."],
      [9.5, 10.6, "The monkey is still on 6 of 28."],
      [10.8, 14.4, "Monkey: a 41-digit number of tries. Keeper: 3,037."],
    ],
    build(stage) {
      // target chip
      const tChip = V.h("div", {
        style: { position: "absolute", left: "0", top: "0", width: "936px", height: "56px" },
      });
      tChip.append(
        V.h("div", { class: "v-card plain c-green", style: { left: "0", top: "0", width: "936px", height: "56px" } }),
        V.h("div", { class: "v-text dim", text: "target", style: { left: "20px", top: "9px", fontSize: "28px" } }),
        V.h("div", {
          class: "v-text v-mono",
          text: TARGET,
          style: { left: "140px", top: "8px", fontSize: "30px", letterSpacing: "2px" },
        }),
      );
      stage.append(tChip);

      const A = panel(stage, 72, "red", "monkey", "l1-a");
      const B = panel(stage, 290, "green", "keep if better", "l1-b");
      // tick disc at the keeper's header
      const disc = V.h("div", {
        style: {
          position: "absolute",
          left: "866px",
          top: "10px",
          width: "52px",
          height: "52px",
          boxSizing: "border-box",
          borderRadius: "50%",
          background: "var(--teal)",
          border: "3px solid var(--teal-lip)",
          boxShadow: "0 4px 0 var(--teal-lip)",
        },
      });
      const tickG = L5.tick(26, 26, 28, "green", { on: true, w: 6 });
      disc.append(
        V.s(
          "svg",
          { width: 46, height: 46, viewBox: "0 0 52 52", style: { position: "absolute", left: "-1px", top: "-1px" } },
          tickG,
        ),
      );
      B.box.append(disc);

      // bottom strip
      const strip = V.h("div", {
        style: { position: "absolute", left: "0", top: "514px", width: "936px", height: "122px" },
      });
      stage.append(strip);
      const mTag = L1.chip(strip, "monkey", "red", { x: 0, y: 0, solid: true });
      const mDig = L1.digits(strip, { n: W.SPACE_DIGITS, tone: "red", x: 180, y: 15, w: 10, h: 22, pitch: 13 });
      const mNum = L1.chip(strip, "", "red", { x: 730, y: 0, html: "1.2 × 10<sup>40</sup>" });
      const kTag = L1.chip(strip, "keeper", "green", { x: 0, y: 64, solid: true });
      const kDig = L1.digits(strip, { n: String(TRIES).length, tone: "green", x: 180, y: 79, w: 10, h: 22, pitch: 13 });
      const kNum = L1.chip(strip, L1.fmt(TRIES), "green", { x: 250, y: 64 });

      return (t) => {
        // pop-ins
        const pop = (a) => V.ramp(t, a, a + 0.45, E.pop);
        V.place(tChip, { s: 0.85 + 0.15 * pop(0.3), o: clamp(pop(0.3) * 4) });
        [A, B].forEach((p, i) =>
          V.place(p.box, { y: 0, s: 0.9 + 0.1 * pop(0.6 + 0.15 * i), o: clamp(pop(0.6 + 0.15 * i) * 4) }),
        );

        const n = triesAt(t);
        const ts = sampleT(t);
        const ns = triesAt(ts);
        const done = t >= RACE1;

        // monkey: a fresh random string every sample; counters are true
        const ms = monkey.string(ns);
        A.grid.all((i) => {
          const ok = ms[i] === TARGET[i];
          return { tone: inkOf(ok), solid: ok, text: ms[i] };
        });
        A.stat1.textContent = `tries ${L1.fmt(n)}`;
        A.stat2.textContent = `best ${monkey.bestAt(n)} / 28`;

        // keeper: letters sampled at 12 Hz; a newly correct tile pops
        const ks = keeper.stateAt(ns);
        B.grid.all((i) => {
          const ok = ks[i] === TARGET[i];
          const age = ok && firstOk[i] <= ns ? ts - timeOf(firstOk[i]) : 9;
          let s = age < 0.3 && firstOk[i] > 1 ? 1 + 0.15 * Math.sin((Math.PI * age) / 0.3) : 1;
          if (done) s *= 1 + 0.14 * flash(t, RACE1 + i * 0.015, RACE1 + i * 0.015 + 0.45);
          return { tone: inkOf(ok), solid: ok, text: ks[i], s };
        });
        B.stat1.textContent = `tries ${L1.fmt(n)}`;
        B.stat2.textContent = `match ${keeper.matchesAt(ns)} / 28`;
        const tk = V.ramp(t, RACE1, RACE1 + 0.4, E.pop);
        V.place(disc, { s: Math.max(0, tk), o: clamp(tk * 5) });

        // digit rows
        const sk = V.ramp(t, 10.6, 10.65, (x) => x);
        V.show(strip, sk);
        const mk = V.ramp(t, 10.6, 12.2, E.lin);
        V.place(mTag, { s: 0.85 + 0.15 * E.pop(V.ramp(t, 10.6, 11.0)), o: 1 });
        mDig(mk);
        const mn = V.ramp(t, 12.2, 12.7, E.pop);
        V.place(mNum, { s: Math.max(0, mn), o: clamp(mn * 5) });
        V.place(kTag, { s: 0.85 + 0.15 * E.pop(V.ramp(t, 10.6, 11.0)), o: 1 });
        const kk = V.ramp(t, 12.9, 13.2, E.lin);
        kDig(kk);
        const kn = V.ramp(t, 13.2, 13.6, E.pop);
        V.place(kNum, { s: Math.max(0, kn), o: clamp(kn * 5) });
      };
    },
  });
})();
