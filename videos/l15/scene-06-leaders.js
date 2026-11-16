/* Lecture 15 video, scene 06-leaders: lesson 15.3's archive a..e (L15.H, green) and swarm particles P..V (L15.SW, blue).
   Three ways to pick a leader: (1) at random, 1 in 5 each; (2) dominated-solution count: c dominates four particles, e one
   (L15.COUNT), weight 1 / (1 + count): c 1/5, e 1/2, so e is likelier; (3) hypervolume with particle P (7, 7.5) as the
   reference point: b, c and d dominate it, their own boxes are 1.5, 4 and 1.5 (L15.HVP, L15.HVBOX), so c leads.
   Layout (stage px): L15.plot x 12, y 12, 600 x 616; right panel x 636..924: three method cards (y 12 / 172 / 332, h 144),
   grey until their turn, then orange.
   Story (local seconds): 0.3 plot, 0.6 archive a..e, 1.2 particles; 3.2 card 1, an orange ring hops a, b, c, d, e, a, b...
   every 0.2 s and stops on d at 5.0 with a '1 in 5' tag; 6.2 card 2, dashed links from each member to the particles it
   dominates (6.4..7.4), count tags at 7.4; 9.6 c's and e's tags become '1/5' (grey) and '1/2' (orange); 12.2 card 3, links
   and tags fade, P ringed, 12.8..13.8 the three boxes grow (green); 14.6 value tags 1.5 / 4 / 1.5, c's box and ring orange;
   hold to 17. */
VID.scene({
  kicker: "LEADERS",
  title: ["Who should each", "particle follow?"],
  dur: 17,
  caps: [
    [0.5, 3.0, "Each particle (blue) needs a leader from the archive (green)."],
    [3.2, 6.0, "Simplest: pick a member at random, each with a 1 in 5 chance."],
    [6.2, 9.4, "Or count the particles each member dominates: c dominates four, e one."],
    [9.6, 12.0, "Fewer means more likely to lead: e's weight is 1/2, c's only 1/5."],
    [12.2, 14.4, "Or use particle P as the reference point: b, c and d dominate it."],
    [14.6, 16.8, "Their own boxes: b 1.5, c 4, d 1.5. c covers most, so c leads."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp } = V;
    const H = L15.H;
    const SW = L15.SW;
    const CNT = L15.COUNT.map((c) => c.length);
    L15.same(CNT, [1, 1, 4, 2, 1], "scene 6: dominated counts a..e");
    L15.same(L15.HVP, [0, 1.5, 4, 1.5, 0], "scene 6: hypervolume contributions for P");
    const W = CNT.map((c) => `1/${1 + c}`);
    L15.same([W[2], W[4]], ["1/5", "1/2"], "scene 6: weights of c and e");
    const pl = L15.plot(stage, { dots: 12, boxes: 3, links: 9 });
    const cards = [
      ["random:\n1 in 5 each", 12],
      ["dominated count:\nfewer means\nmore likely", 172],
      ["hypervolume:\nbiggest own\nbox leads", 332],
    ].map(([text, y]) => L15.card(stage, { x: 636, y, w: 288, h: 144, text }));
    const CT = [3.2, 6.2, 12.2];
    const counts = H.ids.map(() => L13.tag(stage, { text: "", tone: "grey", solid: false }));
    const one5 = L13.tag(stage, { text: "1 in 5", tone: "orange", solid: true });
    const hvTags = L15.HVBOX.map(() => L13.tag(stage, { text: "", tone: "grey", solid: true }));
    const links = [];
    H.ids.forEach((_, i) => L15.COUNT[i].forEach((s) => links.push([H.P[i], SW.at[s]])));
    L15.same(links.length, 9, "scene 6: nine member-particle links");
    const HOP = 0.2;
    const pick = (t) => (t < 3.4 ? -1 : t >= 5.0 ? 3 : Math.floor((t - 3.4) / HOP) % 5);
    L15.same(Math.floor((5.0 - 3.4) / HOP + 1e-9) % 5, 3, "scene 6: the last hop lands on d");

    return (t) => {
      const p = pick(t);
      const hv = t >= 12.2;
      const lead = t >= 15.2;
      const dots = H.ids.map((id, i) => ({
        at: H.P[i],
        tone: "green",
        k: L13.seq(t, 0.6, 0.08, 0.4, i),
        lab: id,
        ring: (t < 6.2 && p === i) || (lead && id === "c"),
        ldx: -20,
        ldy: -16,
      }));
      SW.ids.forEach((id, j) =>
        dots.push({
          at: SW.P[j],
          tone: "blue",
          r: 10,
          k: L13.seq(t, 1.2, 0.06, 0.4, j),
          lab: id === "P" ? "P" : "",
          ring: id === "P" && hv,
        }),
      );
      const fade = 1 - ramp(t, 12.2, 12.6);
      pl.update({
        k: ramp(t, 0.1, 0.4),
        dots,
        links: links.map(([a, b], i) => ({ a, b, tone: "grey", k: L13.seq(t, 6.4, 0.08, 0.4, i), o: fade })),
        boxes: L15.HVBOX.map((b, i) => ({
          a: b.a,
          b: b.b,
          tone: lead && H.ids[b.i] === "c" ? "orange" : "green",
          k: L13.seq(t, 12.8, 0.3, 0.5, i),
          dash: false,
        })),
      });
      cards.forEach((c, i) => {
        const on = t >= CT[i] && (i === 2 || t < CT[i + 1]);
        c.set({ k: ramp(t, CT[i] - 0.2, CT[i] + 0.2), tone: on ? "orange" : "grey" });
      });
      H.ids.forEach((id, i) => {
        const [x, y] = pl.pt(H.P[i]);
        const w = t >= 9.6 && (id === "c" || id === "e");
        counts[i].set({
          k: ramp(t, 7.4, 7.8) * fade,
          text: w ? W[i] : String(CNT[i]),
          tone: w && id === "e" ? "orange" : "grey",
          solid: w && id === "e",
          x: x + 20,
          y: y - 60,
        });
      });
      const [dx, dy] = pl.pt(H.P[3]);
      one5.set({ k: ramp(t, 5.0, 5.3) * (1 - ramp(t, 6.0, 6.3)), x: dx + 22, y: dy - 62 });
      L15.HVBOX.forEach((b, i) => {
        const [x0, y0] = pl.pt(b.a);
        const [x1, y1] = pl.pt(b.b);
        const v = L15.HVP[b.i];
        hvTags[i].set({
          k: ramp(t, 14.6 + 0.2 * i, 14.9 + 0.2 * i),
          text: String(v),
          tone: lead && H.ids[b.i] === "c" ? "orange" : "grey",
          x: (x0 + x1) / 2 - 26,
          y: (y0 + y1) / 2 - 22,
        });
      });
    };
  },
});
