/* Lecture 1 (ds-1), scene 06: one fault can bring everything down (lesson 1.3).
   Six servers share a total load of 420, so each carries 70 (a server can take 100). A hardware fault kills one: its 70 is
   split over the five that are left (+14 each) and they carry 84. A second fault: +21 each, 105, which is over 100. Overloaded
   servers die too, and every death pushes more onto fewer: 140, 210, 420, then nothing (a cascade). Finally a software bug is
   in the code that runs on all six, so all six fail at the same moment, though each was only at 70.
   Colour: a dead server is orange (a FAULT: the service still works) and turns red only when no server is left (a FAILURE:
   users get nothing), as for the disks in scene 5; the capacity tag sits under the row and turns orange when it is exceeded.
   Every number comes from D1.cascade (asserted below); each "+N" is the dead server's load split over the survivors. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the data (asserted against the real rule) ----------
  const C = D1.CASC;
  const N = C.n;
  const CAP = C.cap;
  // load per surviving server after d deaths: 70, 84, 105, 140, 210, 420
  const PER = [C.calm.per, C.one.per, C.two.per, ...C.chain.slice(1, -1).map((r) => r.per)];
  D1.same("cascade scene: per-server load after each death", PER, [70, 84, 105, 140, 210, 420]);
  D1.same(
    "cascade scene: survivors in the chain",
    [C.two.alive, ...C.chain.slice(1).map((r) => r.alive)],
    [4, 3, 2, 1, 0],
  );
  D1.same(
    "cascade scene: totals",
    PER.map((p, d) => p * (N - d)),
    PER.map(() => C.load),
  );
  // what a dying server hands to each survivor: its own load split over the others (this is the "+14" on the chips)
  const SHARE = PER.slice(0, -1).map((p, d) => p / (N - 1 - d));
  D1.same("cascade scene: the share each survivor takes on", SHARE, [14, 21, 35, 70, 210]);
  D1.same(
    "cascade scene: a survivor's old load plus its share is its new load",
    SHARE.map((s, d) => PER[d] + s),
    PER.slice(1),
  );
  D1.same(
    "cascade scene: the load first goes over the limit at the second death",
    PER.map((p) => p > CAP),
    [false, false, true, true, true, true],
  );
  D1.same("cascade scene: six servers, five and four left in the captions", [N, C.one.alive, C.two.alive], [6, 5, 4]);

  // ---------- the timeline (scene-local seconds) ----------
  // server i dies at DIE[i]: the first two are hardware faults (a bolt), the others cannot take the load. Each new per-server
  // number stays on screen for about a second (105 for 1.9 s, then 140, 210 and 420 for 0.8 to 0.85 s each).
  const DIE = [2.3, 4.6, 6.6, 7.8, 8.95, 10.1];
  const FLY = [0.4, 0.45, 0.4, 0.3, 0.3]; // the dead server's load takes this long to reach the others
  const HARDWARE = 2; // the first two deaths are bolts
  const T = {
    pop: 0.1,
    intro: 0.85, // the six 70s bump in turn
    hw: 2.0, // "hardware fault" in, out again at hwOff
    hwOff: 5.0,
    ok: 3.15, // "fault tolerated" in, out again at okOff
    okOff: 4.55,
    over: 5.3, // "overloaded"
    overOff: 6.5,
    cas: 7.05, // "cascade": named as the first overloaded server has gone and the load moves on
    casOff: 10.05,
    all: 10.2, // "total failure": the last server has gone
    allOff: 10.95,
    revive: 11.05, // the six come back at 70 each
    bug: 11.35, // a software bug lands in the code of all six
    wires: 11.5,
    bugDead: 12.0, // ... and they fail together
    bugTag: 12.35,
  };
  const POP = { step: 0.045, dur: 0.28 };
  const REV = { step: 0.035, dur: 0.25 };
  const WORD = ["no", "one", "two", "three", "four", "five", "six"]; // for the captions
  const cap1 = (w) => w[0].toUpperCase() + w.slice(1);
  // the chips from dying server d burst out together and land FLY[d] later (the farther ones a little after the near ones)
  const depart = (d) => DIE[d] + 0.04;
  const land = (d, j) => DIE[d] + FLY[d] + 0.025 * (j - d - 1);
  /** How many dead servers' loads have reached server j by time t (so it shows PER[that many]). */
  const landed = (j, t) => {
    let n = 0;
    for (let d = 0; d < Math.min(j, N - 1); d++) if (t >= land(d, j)) n++;
    return n;
  };

  // ---------- layout ----------
  const ROW = { x: 24, y: 294, w: 138, h: 180, gap: 12 };
  const midX = (i) => ROW.x + i * (ROW.w + ROW.gap) + ROW.w / 2;
  const CX = 468; // the middle of the row
  const BUS_Y = 264;
  const BUG = { x: CX, y: 200, size: 86 };
  const BOLT_Y = ROW.y - 34;
  const TAG_Y = 562;
  const HEAD_Y = 44;
  const CHIP_W = { 2: 80, 3: 88, 4: 108 }; // a "+N" chip, by the number of digits
  const CHIP_H = 48;

  D1.close("cascade scene: the row is centred on the stage", (midX(0) + midX(N - 1)) / 2, CX, 0.01);

  /** A solid verdict tag with a tick or cross inside its left end (one element, so the symbol pops with it). */
  function verdictTag(stage, text, tone, icon, cx) {
    const pad = icon ? 50 : 18;
    const w = D1.tagW(text) + pad - 6;
    const tag = D1.tag(stage, { x: Math.round(cx - w / 2), y: TAG_Y, text, tone, solid: true });
    Object.assign(tag.el.style, { width: `${w}px`, paddingLeft: `${pad}px` });
    let sym = null;
    if (icon) {
      const make = icon === "tick" ? L5.tick : L5.cross;
      sym = make(18, 18, 30, tone, { on: true, w: 6 });
      tag.el.append(
        V.s(
          "svg",
          {
            width: 36,
            height: 36,
            style: { position: "absolute", left: "11px", top: "50%", marginTop: "-18px", overflow: "visible" },
          },
          sym,
        ),
      );
    }
    return {
      set(k) {
        tag.set({ k });
        if (sym) L5.drawOn(sym, ramp(k, 0.35, 1, E.out));
      },
    };
  }

  function build(stage) {
    const low = L5.svg(stage); // the red wires of the bug, behind the servers
    const row = D1.servers(stage, { n: N, ...ROW });

    // the load that moves from a dead server to each survivor
    const hops = [];
    for (let d = 0; d < N - 1; d++)
      for (let j = d + 1; j < N; j++)
        hops.push({
          d,
          j,
          w: CHIP_W[String(SHARE[d]).length],
          chip: D1.chip(stage, {
            x: 0,
            y: 0,
            w: CHIP_W[String(SHARE[d]).length],
            h: CHIP_H,
            fs: 28,
            tone: "blue",
            solid: true,
            text: `+${SHARE[d]}`,
          }),
        });

    const load = D1.stat(stage, { x: 12, y: HEAD_Y, w: 300, h: 80, label: "total load", tone: "blue" });
    const alive = D1.stat(stage, { x: 340, y: HEAD_Y, w: 230, h: 80, label: "alive", tone: "green" });
    const limit = D1.tag(stage, { x: 24, y: ROW.y + ROW.h + 14, text: `each can handle ${CAP}`, tone: "grey" });
    limit.el.style.width = "317px";

    // the two kinds of fault, named where they strike
    const hw = D1.tag(stage, {
      x: 24,
      y: 168,
      text: "hardware fault: others share its load",
      tone: "orange",
      solid: true,
    });
    const sw = D1.tag(stage, {
      x: BUG.x + 64,
      y: BUG.y - 29,
      text: "bug: same code on all six",
      tone: "red",
      solid: true,
    });

    const vOk = verdictTag(stage, "fault tolerated", "green", "tick", 468);
    const vOver = verdictTag(stage, "overloaded", "orange", null, 468);
    const vCas = verdictTag(stage, "cascade: they fall in turn", "orange", null, 468);
    const vAll = verdictTag(stage, "total failure", "red", "cross", 468);
    const vBug = verdictTag(stage, "all fail together", "red", "cross", 468);

    // top layer: the faults (bolts), the bug and its wires
    const red = D1.tone("red");
    const wirePath = (d) =>
      low.appendChild(
        V.s("path", {
          d,
          pathLength: "1",
          fill: "none",
          "stroke-width": "9",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: red.c },
        }),
      );
    const stem = wirePath(`M${BUG.x} ${BUG.y + 40} V${BUS_Y}`);
    const busL = wirePath(`M${CX} ${BUS_Y} H${midX(0)}`);
    const busR = wirePath(`M${CX} ${BUS_Y} H${midX(N - 1)}`);
    const drops = Array.from({ length: N }, (_, i) => wirePath(`M${midX(i)} ${BUS_Y} V${ROW.y - 4}`));
    const drawPath = (p, k) => {
      p.style.strokeDasharray = "1 1";
      p.style.strokeDashoffset = String(1 - clamp(k));
      p.style.visibility = k <= 0.002 ? "hidden" : "";
    };
    const top = L5.svg(stage);
    const bolts = DIE.slice(0, HARDWARE).map((_, i) => top.appendChild(D1.icon.bolt(midX(i), BOLT_Y, 62, "orange")));
    const bug = top.appendChild(D1.icon.bug(BUG.x, BUG.y, BUG.size, "red"));

    // a tag that pops in at `a` and leaves again between `b` and `b + 0.25`
    const life = (t, a, b) => ramp(t, a, a + 0.4, E.out) * (1 - ramp(t, b, b + 0.25, E.lin));

    return (t) => {
      const revived = t >= T.revive;
      const bugDown = t >= T.bugDead;
      const rev = (i) => D1.seq(t, T.revive, REV.step, REV.dur, i);
      // how many servers are alive: a dead one is a fault (orange) while any is left, a failure (red) when none is
      const deaths = DIE.filter((d) => t >= d).length;
      const revivedCount = row.list.filter((_, i) => rev(i) > 0).length;
      const aliveN = revived ? (bugDown ? 0 : revivedCount) : N - deaths;

      // ---- servers ----
      row.list.forEach((s, i) => {
        const k0 = D1.seq(t, T.pop, POP.step, POP.dur, i);
        const r = rev(i);
        const dieAt = revived ? T.bugDead : DIE[i];
        const up = revived ? r > 0 && !bugDown : t < DIE[i];
        const since = t - dieAt;
        let shake = since >= 0 && since < 0.4 ? Math.sin(since * 60) * 8 * (1 - since / 0.4) : 0;
        let st;
        if (!up) st = { state: aliveN === 0 ? "down" : "fault", k: k0 };
        else if (revived) st = { state: "ok", load: PER[0] / CAP, text: String(PER[0]), k: 0.5 + 0.5 * r };
        else {
          const n = landed(i, t);
          const per = PER[n];
          // a number bumps when new load reaches it; at the start the six "70"s bump one after another
          const bump = n
            ? flash(t, land(n - 1, i), land(n - 1, i) + 0.4)
            : flash(t, T.intro + 0.12 * i, T.intro + 0.12 * i + 0.4);
          // an overloaded server that is about to give way trembles
          if (per > CAP) shake = 3.5 * Math.sin(t * 80) * ramp(t, DIE[i] - 0.3, DIE[i], E.lin);
          st = { state: per > CAP ? "over" : "ok", load: per / CAP, text: String(per), k: k0, s: 1 + 0.07 * bump };
        }
        s.set({ label: String(i + 1), ...st, shake });
      });

      // ---- the numbers in the header ----
      const overNow = !revived && aliveN > 0 && PER[landed(N - 1, t)] > CAP;
      const lastDeath = DIE.filter((d) => t >= d).pop();
      const aliveBump = revived
        ? flash(t, T.bugDead, T.bugDead + 0.4)
        : lastDeath === undefined
          ? 0
          : flash(t, lastDeath, lastDeath + 0.4);
      load.set({ text: String(C.load), k: ramp(t, T.pop, T.pop + 0.4, E.lin) });
      alive.set({
        text: String(aliveN),
        tone: aliveN === 0 ? "red" : overNow ? "orange" : "green",
        bump: aliveBump,
        k: ramp(t, T.pop + 0.1, T.pop + 0.5, E.lin),
      });
      const limitOver = !revived && t >= land(1, N - 1);
      limit.set({
        tone: limitOver ? "orange" : "grey",
        solid: limitOver,
        s: 1 + 0.03 * flash(t, land(1, N - 1), land(1, N - 1) + 0.5),
        k: ramp(t, T.pop + 0.2, T.pop + 0.6, E.lin),
      });

      // ---- the load that moves to the survivors ----
      hops.forEach(({ d, j, w, chip }) => {
        const f = ramp(t, depart(d), land(d, j), E.lin);
        if (f <= 0 || f >= 1) return chip.set({ o: 0 });
        const e = E.out(f);
        chip.set({
          x: lerp(midX(d) + 24, midX(j), e) - w / 2,
          y: lerp(ROW.y - 16, ROW.y - 10, e) - 46 * Math.sin(Math.PI * f) - CHIP_H / 2,
          o: ramp(f, 0.1, 0.34, E.lin) * (1 - ramp(f, 0.85, 1, E.lin)), // they show once they have spread out; no shrinking, so the text stays 28 px
        });
      });

      // ---- the two hardware faults ----
      bolts.forEach((b, i) => {
        const a = DIE[i];
        const k = ramp(t, a - 0.25, a - 0.05, E.out) * (1 - ramp(t, a + 0.2, a + 0.55, E.lin));
        V.place(b, { y: (1 - ramp(t, a - 0.25, a - 0.05)) * -24, s: 0.7 + 0.3 * E.pop(clamp(k * 1.5)), o: k });
      });

      // ---- verdicts ----
      vOk.set(life(t, T.ok, T.okOff));
      vOver.set(life(t, T.over, T.overOff));
      vCas.set(life(t, T.cas, T.casOff));
      vAll.set(life(t, T.all, T.allOff));
      vBug.set(ramp(t, T.bugTag, T.bugTag + 0.4, E.out));
      hw.set({ k: life(t, T.hw, T.hwOff) });
      sw.set({ k: ramp(t, T.bug + 0.35, T.bug + 0.75, E.out) });

      // ---- the bug and its wires ----
      const bk = ramp(t, T.bug, T.bug + 0.4, E.out);
      V.place(bug, {
        s: 0.6 + 0.4 * E.pop(bk),
        o: Math.min(1, bk * 4),
        r: bugDown ? 6 * Math.sin((t - T.bugDead) * 40) * (1 - ramp(t, T.bugDead, T.bugDead + 0.4, E.lin)) : 0,
      });
      // the wire runs down from the bug, out along the bus both ways, and drops into each server as the bus reaches it
      const busK = ramp(t, T.wires + 0.1, T.wires + 0.4, E.lin);
      drawPath(stem, ramp(t, T.wires, T.wires + 0.12, E.lin));
      drawPath(busL, busK);
      drawPath(busR, busK);
      drops.forEach((p, i) => {
        const reach = Math.abs(midX(i) - CX) / Math.abs(midX(0) - CX);
        drawPath(p, ramp(t, T.wires + 0.1 + 0.3 * reach, T.wires + 0.22 + 0.3 * reach, E.lin));
      });
    };
  }

  V.scene({
    kicker: "RELIABILITY",
    title: ["One fault can bring", "everything down"],
    dur: 13.7,
    caps: [
      [0.4, 2.6, `${cap1(WORD[N])} servers share the load, ${PER[0]} each.`],
      [2.75, 4.85, `One dies; ${WORD[C.one.alive]} carry on at ${PER[1]} each.`],
      [5.05, 7.04, `One more dies: ${PER[2]} each, over ${CAP}.`],
      [7.05, 9.25, "Overload makes them fall one by one."],
      [9.3, 11.0, `The last one carries all ${C.load}.`],
      [11.8, 13.6, `One bug hits all ${WORD[N]} together.`],
    ],
    build,
  });
})();
