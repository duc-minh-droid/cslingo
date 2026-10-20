/* Lecture 6 · scene 08 (price): seat 14C is sold from London (Mia) and Leeds (Omar). Each site deciding alone sells it twice; asking
   the other site first refuses Omar but costs a round trip, 2 x 30 + 2 = 62 ms instead of 2 ms (lesson 6.4).
   Story (local seconds): 0.3-1.0 persons, sites and link appear (both seats "free"), 1.6-2.4 each customer's "book" slides into its
   own site and both turn green (Mia, Omar), 3.2 tag "same seat", 4.4-5.0 both turn red and "sold twice" pops, 6.0-6.4 rewind: London
   keeps Mia (green), Leeds goes back to "free", 6.5 tag "ask first", 6.8-7.2 Omar's book enters Leeds (orange ?), 7.0-7.7 "taken?"
   crosses to London, 7.7-8.3 "yes" comes back (30 ms under each), Leeds shows Mia, 8.4 "Omar refused", 8.8-10.4 the two meters:
   2 ms from the local copy, 62 ms when asking first. Every number comes from D6.SEAT (asserted in common.js and again here). */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const S = D6.SEAT;
  const EV = S.run("ev");
  const LIN = S.run("lin");
  if (
    !EV.double ||
    LIN.double ||
    LIN.refused !== S.who.Leeds ||
    EV.London !== S.who.London ||
    EV.Leeds !== S.who.Leeds
  ) {
    throw new Error("price scene: SEAT runs changed");
  }
  if (2 * S.oneWay + S.local !== S.lin || LIN.ms !== 62 || EV.ms !== S.local)
    throw new Error("price scene: 2 x 30 + 2 = 62");
  const HOP = `${S.oneWay} ms`;

  // layout (stage px)
  const MID = 105; // the row of persons, sites and the link
  const LINK = { a: { x: 350, y: MID }, b: { x: 586, y: MID } };
  const MIDX = (LINK.a.x + LINK.b.x) / 2;
  const SLIDE = { London: [112, 225], Leeds: [824, 700] }; // a "book" pill: from the person into the site
  const T = {
    show: [0.3, 1.0],
    book1: [1.6, 2.4],
    same: 3.2,
    twice: 4.4,
    rewind: [6.0, 6.4],
    ask: 6.5,
    book2: [6.8, 7.2],
    taken: [7.0, 7.7],
    yes: [7.7, 8.3],
    refused: 8.4,
    meters: [8.8, 9.2],
    local: [9.0, 9.4],
    far: [9.3, 10.4],
  };

  function build(stage) {
    // the link first, then the sites on top of it
    const link = D6.link(stage, { ...LINK, w: 8, gap: 84 });
    const sites = {
      London: D6.box(stage, { x: 140, y: 20, w: 210, h: 170, name: "London", vfs: 48 }),
      Leeds: D6.box(stage, { x: 586, y: 20, w: 210, h: 170, name: "Leeds", vfs: 48 }),
    };
    const svg = L5.svg(stage);
    const mia = D6.person(74, 100, 84, "blue");
    const omar = D6.person(862, 100, 84, "blue");
    const no = L5.cross(896, 64, 40, "red", { ink: true, w: 8 });
    svg.append(mia, omar, no);
    const names = {
      Mia: D6.label(stage, { x: 14, y: 150, w: 120, text: S.who.London, tone: "blue", bold: true }),
      Omar: D6.label(stage, { x: 802, y: 150, w: 120, text: S.who.Leeds, tone: "blue", bold: true }),
    };
    // one tag at a time sits under the link
    const mk = (text, tone, solid) => D6.tag(stage, { x: MIDX - D6.tagW(text) / 2, y: 215, text, tone, solid });
    const tags = {
      same: mk("same seat", "grey", false),
      twice: mk("sold twice", "red", true),
      ask: mk("ask first", "purple", true),
      refused: mk(`${LIN.refused} refused`, "red", true),
    };
    const hops = [
      D6.label(stage, { x: 368, y: 150, w: 80, text: HOP, tone: "orange", bold: true }),
      D6.label(stage, { x: 488, y: 150, w: 80, text: HOP, tone: "orange", bold: true }),
    ];
    const book = {
      London: D6.packet(stage, { tone: "blue", text: "book" }),
      Leeds: D6.packet(stage, { tone: "blue", text: "book" }),
    };
    const taken = D6.packet(stage, { tone: "purple", text: "taken?" });
    const yes = D6.packet(stage, { tone: "purple", text: "yes" });
    const near = D6.meter(stage, {
      x: 12,
      y: 330,
      w: 900,
      label: "answer from the local copy",
      max: S.lin,
      unit: "ms",
      tone: "green",
    });
    const far = D6.meter(stage, {
      x: 12,
      y: 450,
      w: 900,
      label: `ask the other site first (${HOP} each way)`,
      max: S.lin,
      unit: "ms",
      tone: "orange",
    });

    // a "book" pill slides from a person into its site, shrinking as it goes in
    const slide = (pk, who, t, [a, b]) => {
      const p = ramp(t, a, b, E.inOut);
      const [x0, x1] = SLIDE[who];
      const on = t >= a && t < b + 0.001;
      pk.set({
        x: lerp(x0, x1, p),
        y: MID,
        s: lerp(0.7, 1, ramp(t, a, a + 0.25)) * lerp(1, 0.55, ramp(t, b - 0.25, b)),
        o: on ? Math.min(ramp(t, a, a + 0.2, E.lin), ramp(b - t, 0, 0.2, E.lin)) : 0,
      });
    };

    return (t) => {
      const show = ramp(t, T.show[0], T.show[1], E.lin);
      link.update({ k: ramp(t, 0.5, T.show[1]) });
      for (const [g, k] of [
        [mia, ramp(t, 0.3, 0.8, E.lin)],
        [omar, ramp(t, 0.35, 0.85, E.lin)],
      ]) {
        const pp = D6.pop(k);
        V.place(g, { s: pp.s, o: pp.o });
      }
      names.Mia.set({ k: ramp(t, 0.5, 0.9) });
      names.Omar.set({ k: ramp(t, 0.55, 0.95) });

      // the two sites, phase by phase
      const phase = t < T.twice ? (t < T.book1[1] ? 0 : 1) : t < T.rewind[1] - 0.2 ? 2 : t < T.yes[1] ? 3 : 4;
      const bumpAt = [T.twice, T.rewind[0], T.yes[1]];
      const bump = bumpAt.reduce((m, a) => Math.max(m, flash(t, a, a + 0.4)), 0);
      const free = { value: "free", sub: `seat ${S.seat}`, tone: "grey" };
      const sold = (tone, mark, since) => ({ tone, mark, markK: ramp(t, since, since + 0.4) });
      const states = {
        London: [
          free,
          { ...free, value: EV.London, ...sold("green", "tick", T.book1[1] + 0.1) },
          { ...free, value: EV.London, ...sold("red", "cross", T.twice) },
          { ...free, value: LIN.London, ...sold("green", "tick", T.rewind[1] - 0.2) },
          { ...free, value: LIN.London, ...sold("green", "tick", T.rewind[1] - 0.2) },
        ],
        Leeds: [
          free,
          { ...free, value: EV.Leeds, ...sold("green", "tick", T.book1[1] + 0.1) },
          { ...free, value: EV.Leeds, ...sold("red", "cross", T.twice) },
          { ...free, mark: t >= 7.2 ? "qmark" : null, markK: ramp(t, 7.2, 7.5) },
          { ...free, value: LIN.Leeds, ...sold("green", "tick", T.yes[1]) },
        ],
      };
      for (const name of ["London", "Leeds"]) {
        const bumped = phase >= 2 && (phase !== 4 || name === "Leeds" || t < T.yes[1]);
        sites[name].set({ ...states[name][phase], k: show, s: 1 + (bumped ? 0.05 * bump : 0) });
      }

      // book pills, then the question and its answer crossing the link
      slide(book.London, "London", t, T.book1);
      slide(book.Leeds, "Leeds", t, t < 5 ? T.book1 : T.book2);
      const q = clamp((t - T.taken[0]) / (T.taken[1] - T.taken[0]));
      const qp = D6.along(LINK.b, LINK.a, E.inOut(q), 20);
      taken.set({
        x: qp.x,
        y: MID,
        o:
          t >= T.taken[0] && t < T.taken[1] + 0.001
            ? Math.min(ramp(t, T.taken[0], T.taken[0] + 0.15, E.lin), ramp(T.taken[1] - t, 0, 0.15, E.lin))
            : 0,
      });
      const r = clamp((t - T.yes[0]) / (T.yes[1] - T.yes[0]));
      const rp = D6.along(LINK.a, LINK.b, E.inOut(r), 20);
      yes.set({
        x: rp.x,
        y: MID,
        o:
          t >= T.yes[0] && t < T.yes[1] + 0.001
            ? Math.min(ramp(t, T.yes[0], T.yes[0] + 0.15, E.lin), ramp(T.yes[1] - t, 0, 0.15, E.lin))
            : 0,
      });
      hops[0].set({ k: ramp(t, T.taken[1] - 0.3, T.taken[1]) });
      hops[1].set({ k: ramp(t, T.yes[1] - 0.3, T.yes[1]) });

      // tags: same seat -> sold twice -> (rewind) ask first -> refused
      tags.same.set({ k: ramp(t, T.same, T.same + 0.4, E.lin), o: ramp(T.twice - 0.05 - t, 0, 0.15, E.lin) });
      tags.twice.set({
        k: ramp(t, T.twice + 0.2, T.twice + 0.6, E.lin),
        o: ramp(T.rewind[0] + 0.1 - t, 0, 0.3, E.lin),
      });
      tags.ask.set({ k: ramp(t, T.ask, T.ask + 0.4, E.lin), o: ramp(T.refused - 0.05 - t, 0, 0.15, E.lin) });
      tags.refused.set({ k: ramp(t, T.refused, T.refused + 0.4, E.lin) });
      const pn = D6.pop(ramp(t, T.refused, T.refused + 0.4, E.lin));
      V.place(no, { s: pn.s, o: pn.o });

      // the price: two meters
      const mk2 = ramp(t, T.meters[0], T.meters[1], E.lin);
      near.set({ v: D6.lerpN(0, S.local, ramp(t, T.local[0], T.local[1])), k: mk2 });
      far.set({ v: D6.lerpN(0, S.lin, ramp(t, T.far[0], T.far[1], E.inOut)), k: mk2 });
    };
  }

  V.scene({
    kicker: "THE PRICE OF AGREEMENT",
    title: ["One copy of the truth", "costs waiting"],
    dur: 12.5,
    caps: [
      [0.5, 2.2, "Two sites sell seat 14C."],
      [2.6, 4.4, "Each books its own customer."],
      [4.8, 6.4, "Neither knew: sold twice."],
      [6.9, 8.9, "So Leeds must ask London first."],
      [10.0, 11.8, "Asking costs 62 ms, not 2 ms."],
    ],
    build,
  });
})();
