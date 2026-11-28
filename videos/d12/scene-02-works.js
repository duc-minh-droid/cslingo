/* Lecture 12 (ds-12) · scene 2 (IT WORKS ON MY MACHINE): the same forecast.py on two machines whose environments differ
   (lesson 12.1, D12.ENV). Two grey machine cards, "Mo's laptop" and "Loafly's server"; four rows build in pairs (0.6, 1.1,
   1.6, 2.1); between each pair a sign pops 0.3 s later: a red not-equal for the three environment rows (laptop cell orange,
   server cell red), a grey equals for forecast.py (both cells grey). 5.0 a green tick and "runs" under the laptop; 6.0 a red
   cross, a red bolt and "crashes" under the server. 8.0 the five words of the lesson's list fly in as orange chips. */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const ENV = D12.ENV;

  const ROW0 = 0.6;
  const RUNS = 5.0;
  const CRASH = 6.0;
  const WORDS = 8.0;
  const rowAt = (i) => ROW0 + 0.5 * i;

  V.scene({
    kicker: "IT WORKS ON MY MACHINE",
    title: ["Same code,", "different environment"],
    dur: 12,
    caps: [
      [0.4, 3.0, "Mo's forecaster: forecast.py, the same file on both machines."],
      [3.2, 5.0, "But Windows 11 against Ubuntu, Python 3.12 against 3.8."],
      [5.2, 7.6, "It runs on the laptop and crashes on the server."],
      [7.8, 11.7, "The environment differs: OS, libraries, dependencies, settings."],
    ],
    build(stage) {
      const CARD = [
        { x: 12, name: "Mo's laptop" },
        { x: 524, name: "Loafly's server" },
      ];
      const cards = CARD.map((c) => D12.box(stage, { x: c.x, y: 12, w: 400, h: 404, text: "", tone: "grey" }));
      const names = CARD.map((c) => D4.label(stage, { x: c.x + 200, y: 52, text: c.name, fs: 32, tone: "grey" }));
      const cells = ENV.rows.map((r, i) =>
        [0, 1].map((side) =>
          D12.box(stage, { x: CARD[side].x + 24, y: 92 + i * 78, w: 352, h: 62, text: r[side], fs: 30 }),
        ),
      );
      const svg = D4.svg(stage);
      const signs = ENV.rows.map((r, i) =>
        svg.appendChild(r[2] ? D4.neq(468, 123 + i * 78, 64, "red") : D12.eq(468, 123 + i * 78, 64, "grey")),
      );
      const tick = svg.appendChild(L5.tick(150, 458, 56, "green"));
      const cross = svg.appendChild(L5.cross(660, 458, 50, "red"));
      const bolt = svg.appendChild(D4.bolt(612, 448, 56, "red"));
      const runs = D4.tag(stage, { x: 250, y: 458, text: "runs", tone: "green", solid: true, fs: 30 });
      const crashes = D4.tag(stage, { x: 780, y: 458, text: "crashes", tone: "red", solid: true, fs: 30 });

      // the five words in two centred rows (3 + 2), with generous gaps
      const gap = 28;
      const rowsOf = [ENV.words.slice(0, 3), ENV.words.slice(3)];
      const words = rowsOf.flatMap((list, r) => {
        const ws = list.map((w) => D4.tagW(w, 28) + 14);
        let x = (936 - (ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1))) / 2;
        return list.map((w, i) => {
          const tag = D4.tag(stage, { x: x + ws[i] / 2, y: 532 + r * 62, text: w, tone: "orange" });
          x += ws[i] + gap;
          return tag;
        });
      });

      return (t) => {
        cards.forEach((c, side) => {
          const at = side ? CRASH : RUNS;
          c.set({
            k: ramp(t, 0.1 + 0.1 * side, 0.5 + 0.1 * side, E.lin),
            ring: side ? "red" : "green",
            ringK: ramp(t, at, at + 0.4),
          });
          names[side].set({ k: ramp(t, 0.2 + 0.1 * side, 0.6 + 0.1 * side) });
        });
        ENV.rows.forEach((r, i) => {
          const k = ramp(t, rowAt(i), rowAt(i) + 0.4, E.lin);
          const judged = t >= rowAt(i) + 0.3;
          cells[i][0].set({ k, tone: judged && r[2] ? "orange" : "grey" });
          cells[i][1].set({ k, tone: judged && r[2] ? "red" : "grey" });
          V.place(signs[i], {
            s: E.pop(ramp(t, rowAt(i) + 0.3, rowAt(i) + 0.7, E.lin)),
            o: t >= rowAt(i) + 0.3 ? 1 : 0,
          });
        });
        L5.drawOn(tick, ramp(t, RUNS, RUNS + 0.4));
        runs.set({ k: ramp(t, RUNS + 0.2, RUNS + 0.6, E.lin) });
        L5.drawOn(cross, ramp(t, CRASH, CRASH + 0.4));
        V.place(bolt, {
          s: E.pop(ramp(t, CRASH + 0.1, CRASH + 0.5, E.lin)) * (1 + 0.15 * flash(t, CRASH + 0.5, CRASH + 0.9)),
          o: t >= CRASH + 0.1 ? 1 : 0,
        });
        crashes.set({ k: ramp(t, CRASH + 0.2, CRASH + 0.6, E.lin) });
        words.forEach((w, i) => {
          const k = D12.seq(t, WORDS, 0.25, 0.45, i);
          w.set({ k, y: (1 - E.out(k)) * 40 });
        });
      };
    },
  });
})();
