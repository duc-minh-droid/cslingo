/* Lecture 15 video, scene 04-archive: lesson 15.1's archive update (L15.ARCH a1..a5, L15.NEWS: three newcomers in turn).
   Each newcomer y gets two boxes: blue (up and right of y: the members y dominates, they leave) and red (down and left of
   y: a member there dominates y, so y is turned away). (2, 4) removes a2 and a3 and joins; (5, 4.5) is dominated by (2, 4)
   and is turned away; (7, 2) is a new trade-off and joins. Final archive a1 (2,4) a4 a5 (7,2): five members.
   Layout (stage px): L15.plot x 12, y 12, 600 x 616; right panel x 636..924: blue legend card (y 12, h 150), red legend card
   (y 176, h 150), stat 'archive' (y 360) with the member count.
   Story (local seconds): 0.3 plot, 0.6 five green members, 1.6 legend cards and stat; newcomers at 3.2 / 6.8 / 10.2:
   +0 y pops in blue, +0.5 both boxes grow, +1.4 crosses on removed members (or on y), +2.0 they fade, +2.2 a joining y turns
   green, +2.6 boxes fade; 13.4 the green front line draws through the final five; hold to 16. */
VID.scene({
  kicker: "THE ARCHIVE",
  title: ["Keep every route", "nobody beats"],
  dur: 16,
  caps: [
    [0.5, 3.0, "The archive keeps every non-dominated route found so far."],
    [3.2, 6.6, "Newcomer (2, 4) dominates two members: they leave and it joins."],
    [6.8, 10.0, "(5, 4.5) is dominated by (2, 4), so it is turned away."],
    [10.2, 13.2, "(7, 2) is a new trade-off: nobody dominates it, so it joins."],
    [13.4, 15.7, "No member dominates another: the archive is the front so far."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp } = V;
    const A0 = L15.ARCH;
    const NEWS = L15.NEWS;
    const T = [3.2, 6.8, 10.2];
    L15.same(
      NEWS.map((n) => L15.fmt(n.y)),
      ["(2, 4)", "(5, 4.5)", "(7, 2)"],
      "scene 4: newcomers",
    );
    const sizes = NEWS.map((n) => n.A.length);
    L15.same(sizes, [4, 4, 5], "scene 4: archive sizes");
    const pl = L15.plot(stage, { dots: 8, lines: 1, boxes: 2 });
    const legB = L15.card(stage, {
      x: 636,
      y: 12,
      w: 288,
      h: 150,
      text: "blue box:\nmembers it\ndominates leave",
      tone: "blue",
    });
    const legR = L15.card(stage, {
      x: 636,
      y: 176,
      w: 288,
      h: 150,
      text: "red box:\na member here\nturns it away",
      tone: "red",
    });
    const size = L13.stat(stage, { x: 636, y: 360, w: 288, h: 80, label: "archive", tone: "green" });
    // every point that ever shows: the five members, then the three newcomers
    const ALL = A0.ids.map((id, i) => ({ id, p: A0.P[i] })).concat(NEWS.map((n, k) => ({ id: `y${k + 1}`, p: n.y })));
    const born = (id) => (id[0] === "y" ? T[+id[1] - 1] : 0.6 + 0.1 * A0.ids.indexOf(id));
    const fate = {}; // id -> [time it is crossed, joined?]
    NEWS.forEach((n, k) => {
      n.before.forEach((a, i) => n.R.log[i] === "rm" && (fate[a.id] = [T[k] + 1.4, false]));
      fate[`y${k + 1}`] = n.R.added ? [T[k] + 2.2, true] : [T[k] + 1.4, false];
    });
    const finalPts = NEWS[2].A.map((a) => a.p).sort((a, b) => a[0] - b[0]);

    return (t) => {
      const k = T.filter((x) => t >= x).length - 1;
      const dots = ALL.map(({ id, p }) => {
        const f = fate[id];
        const isNew = id[0] === "y";
        const joined = f && f[1] && t >= f[0];
        const out = f && !f[1];
        return {
          at: p,
          tone: out && t >= f[0] ? "red" : isNew && !joined ? "blue" : "green",
          k: ramp(t, born(id), born(id) + 0.4),
          o: out ? 1 - ramp(t, f[0] + 0.6, f[0] + 1.0) : 1,
          cross: out ? ramp(t, f[0], f[0] + 0.4) : 0,
          ring: isNew && k >= 0 && id === `y${k + 1}` && t < T[k] + 2.6,
          lab: isNew ? L15.fmt(p) : id,
          ldx: -20,
          ldy: isNew && p[1] < 3 ? 44 : -18,
        };
      });
      const boxes = [];
      if (k >= 0) {
        const y = NEWS[k].y;
        const g = ramp(t, T[k] + 0.5, T[k] + 1.2);
        const o = 1 - ramp(t, T[k] + 2.6, T[k] + 3.0);
        boxes.push({ a: y, b: [10, 10], tone: "blue", k: g, o }, { a: y, b: [0, 0], tone: "red", k: g, o });
      }
      pl.update({
        k: ramp(t, 0.1, 0.4),
        dots,
        boxes,
        lines: [{ pts: finalPts, tone: "green", k: ramp(t, 13.4, 14.4), w: 5 }],
      });
      legB.set({ k: ramp(t, 1.6, 2.0) });
      legR.set({ k: ramp(t, 1.8, 2.2) });
      let n = A0.ids.length;
      NEWS.forEach((q, j) => {
        if (t >= T[j] + 2.0) n = q.A.length;
      });
      size.set({
        k: ramp(t, 2.0, 2.4),
        text: String(n),
        bump: T.reduce((s, x) => s + V.flash(t, x + 2.0, x + 2.5), 0),
      });
    };
  },
});
