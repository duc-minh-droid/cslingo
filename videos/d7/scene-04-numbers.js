/* Lecture 7 (ds-7) · scene 4 (PROPOSAL NUMBERS): every Paxos proposal carries a number that is unique (no two proposers ever use
   the same one) and always bigger than the one before; a bigger number means a newer proposal and wins over an older one
   (lesson 7.1). Two proposers share the numbers 1 to 6: proposer 1 uses the odd ones (1, 3, 5), proposer 2 the even ones (2, 4, 6),
   so no number is used twice; they only ever go up. Every number comes from D7.NUMS (asserted on load). Colours: blue = a
   proposer, purple = the proposal number (the protocol's rule), orange = the older proposal, green = the newer one that wins.
   Story (local seconds): 0.3 proposer 1 pops with its numbers 1, 3, 5; 2.4 proposer 2 pops with 2, 4, 6; 5.0 a purple arrow draws
   under them ("bigger = newer"); 7.6 chip 5 turns orange ("older") and chip 6 green ("newer wins"). Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const NUMS = [1, 2, 3, 4, 5, 6];
  const MINE = NUMS.map((n) => (n % 2 === 1 ? 0 : 1)); // which proposer uses number n: odd -> 0, even -> 1
  D7.same(
    "numbers scene: six numbers, odd ones for proposer 1 and even ones for proposer 2, none shared",
    [
      NUMS.filter((n) => MINE[n - 1] === 0),
      NUMS.filter((n) => MINE[n - 1] === 1),
      NUMS.every((n, i) => i === 0 || n > NUMS[i - 1]),
    ],
    [[1, 3, 5], [2, 4, 6], true],
  );
  const LANES = [
    { name: "Proposer 1", y: 150, head: 100, t0: 0.3 },
    { name: "Proposer 2", y: 345, head: 303, t0: 2.4 },
  ];
  const T = { arrow: 5.0, tag: 5.6, end: 7.6 };
  const X0 = 68;

  V.scene({
    kicker: "PROPOSAL NUMBERS",
    title: ["Every proposal has a", "bigger number"],
    dur: 11,
    caps: [
      [0.5, 2.6, "Each proposal gets a unique number."],
      [2.8, 5.0, "Proposers never share a number."],
      [5.2, 7.4, "A bigger number means newer."],
      [7.7, 10.4, "The newer proposal beats the older."],
    ],
    build(stage) {
      const rows = LANES.map((ln) =>
        D4.chips(stage, {
          x: X0,
          y: ln.y,
          n: 6,
          w: 120,
          h: 80,
          gap: 16,
          texts: NUMS.map(String),
          fs: 40,
          tone: "purple",
        }),
      );
      const heads = LANES.map((ln, li) =>
        D4.tag(stage, {
          x: X0,
          y: ln.head,
          anchor: "l",
          text: `${ln.name}: ${NUMS.filter((n) => MINE[n - 1] === li).join(", ")}`,
          tone: "blue",
        }),
      );
      const svg = D4.svg(stage);
      const arrow = svg.appendChild(L5.arrow(X0, 515, X0 + 800, 515, "purple", 1, { w: 8, head: 22 }));
      const bigger = D4.tag(stage, { x: 468, y: 562, text: "bigger = newer", tone: "purple" });
      const older = D4.tag(stage, { x: rows[0].mid(4).x, y: 268, text: "older", tone: "orange", solid: true });
      const newer = D4.tag(stage, { x: rows[1].mid(5).x, y: 464, text: "newer: wins", tone: "green", solid: true });

      return (t) => {
        LANES.forEach((ln, li) => {
          heads[li].set({ k: ramp(t, ln.t0, ln.t0 + 0.4, E.lin) });
          rows[li].all((i) => {
            if (MINE[i] !== li) return { ghost: true, text: "", o: ramp(t, ln.t0, ln.t0 + 0.4, E.lin) };
            const j = NUMS.filter((n) => MINE[n - 1] === li).indexOf(i + 1);
            const at = ln.t0 + 0.3 + 0.3 * j;
            const k = ramp(t, at, at + 0.4, E.lin);
            const last = i === 4 && t >= T.end ? "orange" : i === 5 && t >= T.end ? "green" : "purple";
            return {
              o: k,
              s: 0.7 + 0.3 * E.pop(k) + 0.12 * (last !== "purple" ? flash(t, T.end, T.end + 0.4) : 0),
              tone: last,
              solid: last !== "purple",
            };
          });
        });
        const ak = ramp(t, T.arrow, T.arrow + 0.7, E.lin);
        L5.drawOn(arrow, ak);
        V.show(arrow, ak > 0 ? 1 : 0);
        bigger.set({ k: ramp(t, T.tag, T.tag + 0.4, E.lin) });
        older.set({ k: ramp(t, T.end + 0.2, T.end + 0.6, E.lin) });
        newer.set({ k: ramp(t, T.end + 0.4, T.end + 0.8, E.lin) });
      };
    },
  });
})();
