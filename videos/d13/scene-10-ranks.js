/* Lecture 13 (ds-13) · scene 10 (COMMUNICATORS AND RANKS): MPI_COMM_WORLD holds every process of the session, here twelve,
   ranked 0 to 11. Split into groups of three (A to D), each group numbers its own members 0, 1, 2 again, so process 7 is
   rank 7 in the world and rank 1 in group C (lesson 13.6 and workshop card 4; D13.RANKS). A communicator has a context, a
   group, a size and the ranks of its processes, counted from 0.
   Colours: purple the communicators (world frame, dashed group frames, group-rank discs, the four property chips), blue the
   process cards, green the two name tags of process 7, grey the size counter and pointer lines.
   Story (local seconds): 0.4 the world frame; 0.5-2.7 the twelve cards pop left to right while "size" counts up;
   3.4 the group frames (0.2 apart), 3.8 the group ranks 0, 1, 2 in every group; 6.4 card 7 gets a thick green ring and the
   tags "world rank 7" and "group C, rank 1"; 8.8 the chips context, group, size, rank (from 0). Hold to 11. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, ease: E } = V;
  const R = D13.RANKS;
  const F = R.of(R.focus);
  D13.same("ranks scene: process 7", [R.focus, F.group, F.rank], [7, "C", 1]);

  const CARD = { w: 58, h: 110, gap: 8, y: 140 };
  const GW = 3 * CARD.w + 2 * CARD.gap;
  const GGAP = 36;
  const X0 = 12 + (912 - (4 * GW + 3 * GGAP)) / 2;
  const cardX = (r) => X0 + R.of(r).g * (GW + GGAP) + R.of(r).rank * (CARD.w + CARD.gap);
  const DISC_Y = 296;
  const POP = (r) => 0.5 + 0.18 * r;
  const CHIPS = ["context", "group", "size", "rank (from 0)"];

  V.scene({
    kicker: "COMMUNICATORS AND RANKS",
    title: ["One process,", "a different number in each club"],
    dur: 11,
    caps: [
      [0.4, 3.2, `MPI_COMM_WORLD holds every process: ranks 0 to ${R.size - 1}.`],
      [3.4, 6.2, `Split into groups of ${R.per}: each numbers its members 0, 1, 2.`],
      [6.4, 8.6, `Process ${R.focus}: rank ${R.focus} in the world, rank ${F.rank} in group ${F.group}.`],
      [8.8, 10.7, "A communicator has a context, a group, a size and ranks."],
    ],
    build(stage) {
      const world = D13.outline(stage, {
        x: 12,
        y: 12,
        w: 912,
        h: 352,
        tone: "purple",
        label: "MPI_COMM_WORLD",
        bw: 5,
      });
      const size = D4.tag(stage, { x: 910, y: 40, text: "", tone: "grey", solid: true, anchor: "r" });
      const groups = R.names.map((name, g) =>
        D13.outline(stage, {
          x: X0 + g * (GW + GGAP) - 12,
          y: 80,
          w: GW + 24,
          h: 270,
          tone: "purple",
          label: `Group ${name}`,
          dash: true,
          fs: 28,
          r: 20,
        }),
      );
      groups.forEach((o) => Object.assign(o.lab.style, { left: "0px", width: "100%", textAlign: "center" }));
      const cards = Array.from({ length: R.size }, (_, r) =>
        D13.box(stage, { x: cardX(r), y: CARD.y, w: CARD.w, h: CARD.h, tone: "blue", title: String(r), fs: 40, r: 16 }),
      );
      const discs = Array.from({ length: R.size }, (_, r) =>
        D4.disc(stage, {
          x: cardX(r) + CARD.w / 2,
          y: DISC_Y,
          size: 46,
          tone: "purple",
          text: String(R.of(r).rank),
          fs: 28,
        }),
      );
      const svg = V.l5.svg(stage);
      const fx = cardX(R.focus) + CARD.w / 2;
      const tagW = { x: 360, y: 430 };
      const tagG = { x: 760, y: 430 };
      const lines = [tagW, tagG].map((p) =>
        D13.seg(svg, { a: { x: fx, y: DISC_Y + 26 }, b: { x: p.x, y: p.y - 22 }, w: 5 }),
      );
      const tW = D4.tag(stage, { ...tagW, text: `world rank ${R.focus}`, tone: "green", solid: true });
      const tG = D4.tag(stage, { ...tagG, text: `group ${F.group}, rank ${F.rank}`, tone: "green", solid: true });
      let cx = 148;
      const chips = CHIPS.map((text) => {
        const w = D4.tagW(text);
        const tag = D4.tag(stage, { x: cx + w / 2, y: 548, text, tone: "purple" });
        cx += w + 30;
        return tag;
      });
      D13.same("ranks scene: the chips fit", cx - 30 <= 924, true);

      return (t) => {
        world.set({ k: ramp(t, 0.3, 0.6, E.lin) });
        const shown = Array.from({ length: R.size }, (_, r) => r).filter((r) => t >= POP(r)).length;
        size.set({ k: ramp(t, 0.5, 0.8, E.lin), text: `size ${shown}` });
        groups.forEach((g, i) => g.set({ k: ramp(t, 3.4 + 0.2 * i, 3.7 + 0.2 * i, E.lin) }));
        const hit = ramp(t, 6.4, 6.8, E.lin);
        cards.forEach((c, r) => {
          const focus = r === R.focus;
          c.set({
            k: ramp(t, POP(r), POP(r) + 0.3, E.lin),
            ring: focus && hit > 0 ? "green" : "",
            ringK: hit,
            solid: focus && hit > 0,
            s: focus ? 1 + 0.1 * flash(t, 6.4, 6.8) : 1,
          });
        });
        discs.forEach((d, r) => {
          const g = R.of(r).g;
          const k = ramp(t, 3.8 + 0.2 * g + 0.08 * R.of(r).rank, 4.1 + 0.2 * g + 0.08 * R.of(r).rank, E.lin);
          d.set({ k, s: r === R.focus ? 1 + 0.15 * flash(t, 6.4, 6.8) : 1 });
        });
        lines.forEach((l, i) => l.set({ k: ramp(t, 6.5 + 0.2 * i, 6.8 + 0.2 * i, E.out) }));
        tW.set({ k: ramp(t, 6.7, 7.0, E.lin) });
        tG.set({ k: ramp(t, 6.9, 7.2, E.lin) });
        chips.forEach((c, i) => c.set({ k: ramp(t, 8.8 + 0.15 * i, 9.1 + 0.15 * i, E.lin) }));
      };
    },
  });
})();
