/* Lecture 11 · Flocking, scene 11 (multi-agent systems, lesson 11.5): many agents, keep it local. Left: a ring of 10 agents
   (blue discs, agent 0 at the top). Right: a column of stats.
   Story (local seconds): 0.3-1.3 the ten agents pop. 2.9-5.0 every pair link draws in red while 'all talk' counts 0 -> 45.
   5.4-5.8 the red links fade; 5.7-6.7 the green neighbour links draw round the ring while 'neighbours' counts 0 -> 10.
   7.7-8.4 the central monitor pops with dashed blue spokes; 8.6 agent 0 turns red ('faulty') and 'infected 1 of 10' pops.
   9.6-10.0 the monitor breaks (grey, red cross) and 'single point of failure' pops. 10.3-12.8 five fault steps 0.5 s apart
   spread the fault along the neighbour links: 3, 5, 7, 9, 10 infected. Holds all ten red to 14.
   Every number comes from L11.links / L11.LINKS and the lesson's toy fault rule L11.fault (asserted here). */
(function () {
  const V = window.VID;
  const L11 = V.l11;
  const { ramp, flash, ease: E } = V;

  const N = L11.LINKS.n;
  L11.same([N, L11.links(N), L11.LINKS.all, L11.LINKS.ring], [10, 45, 45, 10], "scene 11: the link counts");
  const STEP_T = [8.6, 10.3, 10.8, 11.3, 11.8, 12.3]; // when fault step s shows
  const INF = STEP_T.map((_, s) => L11.fault("hub", true, s).inf);
  L11.same(
    INF.map((a) => a.length),
    L11.FAULT.broken.slice(0, STEP_T.length),
    "scene 11: the fault spread with the monitor down",
  );
  L11.same(
    INF.map((a) => a.length),
    [1, 3, 5, 7, 9, 10],
    "scene 11: infected counts per step",
  );
  L11.same(INF[0], [0], "scene 11: agent 0 is the faulty one");
  // the step at which each agent turns red
  const redAt = Array.from({ length: N }, (_, i) => INF.findIndex((a) => a.includes(i)));
  L11.same(
    redAt.every((s) => s >= 0),
    true,
    "scene 11: every agent is infected by the last step",
  );
  const stepOf = (t) => STEP_T.reduce((s, at, i) => (t >= at ? i : s), -1);

  V.scene({
    kicker: "MULTI-AGENT SYSTEMS",
    title: ["Many agents:", "keep it local"],
    dur: 14,
    caps: [
      [0.5, 2.6, "Many agents can work together."],
      [2.9, 5.4, `If all ${N} talk to each other: ${L11.LINKS.all} links.`],
      [5.7, 7.4, `Talking only to neighbours: ${L11.LINKS.ring} links.`],
      [7.7, 10, "One central monitor watches for faults."],
      [10.3, 13.6, "If it breaks, one bad agent infects them all."],
    ],
    build(stage) {
      const rg = L11.ring(stage, { cx: 290, cy: 345, r: 230, n: N, size: 60 });
      const top = rg.pt(0);
      const faulty = L11.tag(stage, {
        x: top.x - L11.tagW("faulty") / 2,
        y: 14,
        text: "faulty",
        tone: "red",
        solid: true,
      });

      const COL = { x: 600, w: 336, h: 80 };
      const all = L11.stat(stage, { x: COL.x, y: 60, w: COL.w, h: COL.h, label: "all talk", tone: "red" });
      const nb = L11.stat(stage, { x: COL.x, y: 170, w: COL.w, h: COL.h, label: "neighbours", tone: "green" });
      const inf = L11.stat(stage, { x: COL.x, y: 330, w: COL.w, h: COL.h, label: "infected", tone: "red" });
      const spof = L11.tag(stage, { x: COL.x, y: 440, text: "single point of failure", tone: "red", solid: true });

      return (t) => {
        const allK = ramp(t, 2.9, 5.0, E.lin);
        const ringK = ramp(t, 5.7, 6.7, E.lin);
        const s = stepOf(t);
        const red = s >= 0 ? new Set(INF[s]) : new Set();
        rg.update({
          k: ramp(t, 0.3, 1.3, E.lin),
          all: allK * (1 - ramp(t, 5.4, 5.8)),
          ring: ringK,
          tones: (i) => (red.has(i) ? "red" : "blue"),
          bump: (i) => (redAt[i] >= 0 ? flash(t, STEP_T[redAt[i]], STEP_T[redAt[i]] + 0.3) : 0),
          hub: ramp(t, 7.7, 8.2),
          spokes: ramp(t, 7.9, 8.4),
          broken: ramp(t, 9.6, 10.0),
        });
        faulty.set({ k: ramp(t, 8.6, 9.0) });

        all.set({
          text: String(Math.round(L11.LINKS.all * allK)),
          k: ramp(t, 2.7, 3.1),
          bump: flash(t, 5.0, 5.35),
        });
        nb.set({
          text: String(Math.round(L11.LINKS.ring * ringK)),
          k: ramp(t, 5.5, 5.9),
          bump: flash(t, 6.7, 7.05),
        });
        inf.set({
          text: `${s >= 0 ? INF[s].length : 1} of ${N}`,
          k: ramp(t, 8.6, 9.0),
          solid: s === STEP_T.length - 1,
          bump: s >= 1 ? flash(t, STEP_T[s], STEP_T[s] + 0.3) : 0,
        });
        spof.set({ k: ramp(t, 9.8, 10.2) });
      };
    },
  });
})();
