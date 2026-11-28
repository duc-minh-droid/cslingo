/* Lecture 16 (ds-16) · scene 8 (FOLLOW THE TIME): profile one photo, move the network to the GPU, count the copies (lesson
   16.5, the lesson's own plan(): D16.P). Lanes CPU (blue), GPU (purple), Copying (orange), time 0 to 140 ms.
   Story (local seconds): 0.4-2.4 the all-CPU bars grow in turn (Prepare 8, Run network 120, Show 4), 2.4 total '132 ms';
   2.8 the network bar turns red, tag '120 of 132 ms'; 5.0-6.2 the network bar lifts into the GPU lane and shrinks to 15, the
   copy bars grow before (12) and after (1) it, everything re-packs, 6.4 total '40 ms', orange tag '13 ms copying';
   9.0-9.8 the GPU bar halves to 7.5, total '32.5 ms'; 11.4-12.4 the GPU bar is back to 15, tag 'photo 4×', the copies stretch
   to 48 and 4 and turn red, 12.6 total '79 ms', orange tag '52 ms copying'. Bars blend plan to plan (D16.bars). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D11 = V.d11;
  const D16 = V.d16;
  const { ramp, flash, lerp, ease: E } = V;
  const P = D16.P;
  const fm = D16.fm;
  const net = (p) => D16.bars(p).net.b - D16.bars(p).net.a;
  D16.same("profile totals", [P.cpu.total, P.gpu.total, P.fast.total, P.big.total], [132, 40, 32.5, 79]);
  D16.same("profile copies", [P.gpu.copy, P.big.copy], [13, 52]);

  const T = { grow: [0.4, 2.4], hot: 2.8, gpu: [5.0, 6.2], fast: [9.0, 9.8], big: [11.4, 12.4] };
  const KEYS = ["prep", "copy1", "net", "copy2", "show"];
  const NAME = { prep: "Prepare", net: "Run network", show: "Show", copy1: "copy", copy2: "copy" };
  const TONE = { prep: "blue", net: "purple", show: "blue", copy1: "orange", copy2: "orange" };

  V.scene({
    kicker: "FOLLOW THE TIME",
    title: ["Profile first,", "then watch the copies"],
    dur: 15,
    caps: [
      [0.4, 2.6, `One photo on the phone's CPU: ${fm(P.cpu.total)} ms.`],
      [2.8, 4.8, `The network takes ${fm(net(P.cpu))} of them.`],
      [5.0, 8.8, `Network on the GPU: ${fm(P.gpu.total)} ms, but ${fm(P.gpu.copy)} ms of it is copying.`],
      [9.0, 11.2, `A GPU twice as fast: only ${fm(P.fast.total)} ms.`],
      [11.4, 14.6, `A photo 4 times as big: copies take ${fm(P.big.copy)} ms.`],
    ],
    build(stage) {
      const ln = D11.lanes(stage, {
        x: 12,
        y: 40,
        w: 912,
        rows: ["CPU", "GPU", "Copying"],
        T: 140,
        ticks: [0, 20, 40, 60, 80, 100, 120, 140],
        rowH: 72,
        gap: 16,
        nameW: 150,
        max: 8,
      });
      // the lanes kit writes its last tick as "140 s"; this timeline is in ms (the axis title says so)
      const last = [...ln.el.children].find((el) => el.textContent === "140 s");
      if (!last) throw new Error("VID.d16 scene 8: the last tick label of the lanes was not found");
      last.textContent = "140";
      const axis = D4.label(stage, { x: 468, y: ln.axisY + 86, text: "time for one photo (ms)", fs: 28 });
      const total = D4.tag(stage, { x: 190, y: 520, text: "", tone: "grey", solid: true, fs: 34 });
      const note = D4.tag(stage, { x: 520, y: 520, text: "", tone: "red" });
      const big = D4.tag(stage, { x: 190, y: 594, text: "photo 4×", tone: "orange", solid: true });

      const plans = [D16.bars(P.cpu), D16.bars(P.gpu), D16.bars(P.fast), D16.bars(P.gpu), D16.bars(P.big)];
      const stepK = (t) => [
        ramp(t, T.gpu[0], T.gpu[1], E.inOut),
        ramp(t, T.fast[0], T.fast[1], E.inOut),
        ramp(t, T.big[0], T.big[0] + 0.5, E.inOut),
        ramp(t, T.big[0] + 0.4, T.big[1], E.inOut),
      ];
      return (t) => {
        const ks = stepK(t);
        let i = 0;
        while (i < ks.length - 1 && ks[i] >= 1) i++;
        const a = plans[i];
        const b = plans[i + 1];
        const k = ks[i];
        const hot = t >= T.hot && t < T.gpu[0] + 0.6;
        const bigNow = t >= T.big[0] + 0.4;
        const bars = KEYS.map((key) => {
          const A = a[key];
          const B = b[key];
          const tone = key === "net" ? (hot ? "red" : A.row === 1 || k > 0.5 ? "purple" : "blue") : TONE[key];
          return {
            row: lerp(A.row, B.row, key === "net" ? ramp(k, 0, 0.5, E.inOut) : 1),
            a: lerp(A.a, B.a, k),
            b: lerp(A.b, B.b, k),
            kind: "work",
            tone: key.startsWith("copy") && bigNow ? "red" : tone,
            text: NAME[key],
            k: 1,
          };
        }).filter((x) => x.b - x.a > 0.05);
        const now = lerp(0, P.cpu.total, ramp(t, T.grow[0], T.grow[1], E.lin));
        ln.set({ k: ramp(t, 0.1, 0.5, E.lin), now, bars });
        axis.set({ k: ramp(t, 0.1, 0.5, E.lin) });

        let tot = "";
        if (t >= T.big[1] + 0.2) tot = P.big.total;
        else if (t >= T.big[0]) tot = "";
        else if (t >= T.fast[1]) tot = P.fast.total;
        else if (t >= T.fast[0]) tot = "";
        else if (t >= T.gpu[1] + 0.2) tot = P.gpu.total;
        else if (t >= T.gpu[0]) tot = "";
        else if (t >= T.grow[1]) tot = P.cpu.total;
        total.set({
          k: tot === "" ? 0 : 1,
          text: tot === "" ? "" : `${fm(tot)} ms`,
          s: 1 + 0.12 * (flash(t, T.grow[1], T.grow[1] + 0.3) + flash(t, T.fast[1], T.fast[1] + 0.3)),
        });
        let nt = null;
        if (t >= T.big[1] + 0.2) nt = [`${fm(P.big.copy)} ms copying`, "orange"];
        else if (t >= T.gpu[1] + 0.2 && t < T.big[0]) nt = [`${fm(P.gpu.copy)} ms copying`, "orange"];
        else if (t >= T.hot + 0.2 && t < T.gpu[0]) nt = [`${fm(net(P.cpu))} of ${fm(P.cpu.total)} ms`, "red"];
        note.set({ k: nt ? 1 : 0, text: nt ? nt[0] : "", tone: nt ? nt[1] : "red", solid: !!nt && nt[1] === "orange" });
        big.set({ k: ramp(t, T.big[0], T.big[0] + 0.4) });
      };
    },
  });
})();
