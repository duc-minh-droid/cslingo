/* Lecture 1 (ds-1), scene 05: faults are normal, failures are not (lesson 1.3).
   10,000 disks as a square of dots; a week of the seeded simulation kills 7 of them (orange markers, the "disk faults" counter
   follows, a "fault" tag names the first one). Row 1 "one copy": a request hits the dead disk, no answer, the 7 markers turn
   red one after another and "failures" counts to 7. Row 2 "two copies": the request hops to the copy, which answers, the
   markers go back to orange and "failures: 0". Every number comes from D1.DISKS (asserted when the page loads); nothing is typed in. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- data (asserted) ----------
  const DK = D1.DISKS;
  const DEAD = DK.days.flatMap((d) => d.dead.map((i) => ({ i, day: d.day })));
  D1.same(
    "scene 5: dead disks, faults, failures (one copy, two copies)",
    [DEAD.length, DK.faults, DK.failures1, DK.failures2],
    [7, 7, 7, 0],
  );
  D1.same("scene 5: faults per day", DK.perDay, [1, 1, 0, 2, 1, 1, 1]);

  // ---------- timeline (local seconds) ----------
  const DAY0 = 1.2; // day d starts at DAY0 + DAY_STEP * (d - 1)
  const DAY_STEP = 0.4;
  const dayAt = (d) => DAY0 + DAY_STEP * (d - 1);
  const FAULT_TAG = [2.9, 4.7]; // the "fault" tag next to the first dead disk (fades over its last 0.2 s)
  const ROW1 = 4.6;
  const REQ1 = [5.1, 5.45]; // the request walks to the dead disk
  const HIT1 = REQ1[1]; // ... and finds it dead: cross, "no answer"
  const RED0 = 5.6; // the markers turn red one after another
  const RED_STEP = 0.1;
  const ROW2 = 7.0;
  const REQ2 = [7.4, 7.7]; // the request reaches the dead disk
  const HOP = [7.85, 8.2]; // and hops to the copy
  const BACK = [8.3, 8.75]; // the copy answers
  const BACK0 = BACK[0]; // markers go back to orange while the answer travels
  const BACK_STEP = 0.06;
  const FINAL = [9.4, 9.9]; // a last pulse on the two numbers
  const PULSE = 0.5; // a marker that changes colour pings again for this long
  const redAt = (j) => RED0 + RED_STEP * j;
  const orangeAt = (j) => BACK0 + BACK_STEP * j;

  // ---------- layout (stage px) ----------
  const FIELD = { x: 20, y: 76, size: 400 };
  const CARD = { x: 452, w: 464, h: 200, y1: 150, y2: 390 };
  const UX = 538; // the user
  const DISK_X = 700; // the (dead) disk
  const COPY_X = 816; // its copy
  const Y1 = CARD.y1 + 115; // the body line of row 1
  const Y2 = CARD.y2 + 115;
  // measured widths of the tags (D1.tagW is only an estimate and runs a few px off for digits)
  const W = { fail: 176, day: 113, fault: 105 };
  const FAIL_X = CARD.x + CARD.w - 24 - W.fail;
  const pop = (t, a, d = 0.4) => E.pop(ramp(t, a, a + d, E.lin));
  const fade = (t, a, d = 0.25) => ramp(t, a, a + d, E.lin);
  const on = (g, k, o = {}) =>
    V.place(g, {
      s: (0.8 + 0.2 * E.pop(clamp(k))) * (o.s ?? 1),
      o: Math.min(1, k * 4) * (o.o ?? 1),
      x: o.x || 0,
      y: o.y || 0,
    });
  const quad = (p0, p2, bow) => {
    // the curve L5.arrow draws: quadratic with the control point 2 * bow to the side of the chord
    const len = Math.hypot(p2[0] - p0[0], p2[1] - p0[1]);
    const u = [(p2[0] - p0[0]) / len, (p2[1] - p0[1]) / len];
    const c = [(p0[0] + p2[0]) / 2 + u[1] * bow * 2, (p0[1] + p2[1]) / 2 - u[0] * bow * 2];
    return (f) => [
      (1 - f) * (1 - f) * p0[0] + 2 * (1 - f) * f * c[0] + f * f * p2[0],
      (1 - f) * (1 - f) * p0[1] + 2 * (1 - f) * f * c[1] + f * f * p2[1],
    ];
  };

  V.scene({
    kicker: "RELIABILITY",
    title: ["Faults are normal,", "failures are not"],
    dur: 11.5,
    caps: [
      [0.5, 2.9, "10,000 disks: about one dies every day."],
      [3.0, 4.6, "A dead disk is a fault."],
      [4.8, 7.05, "One copy: a dead disk means a failure."],
      [7.25, 9.2, "Two copies: users notice nothing."],
      [9.4, 11.3, "Faults must not become failures."],
    ],
    build(stage) {
      // left: the field of disks
      const field = D1.diskField(stage, FIELD);
      const tDisks = D1.tag(stage, { x: FIELD.x, y: 0, text: "10,000 disks" });
      const tRate = D1.tag(stage, { x: FIELD.x, y: FIELD.y + FIELD.size + 20, text: "1 in 10,000 dies each day" });
      const tDay = D1.tag(stage, { x: FIELD.x + FIELD.size - W.day, y: 0, text: "day 1" });
      const fp = field.at(DEAD[0].i);
      const tFault = D1.tag(stage, {
        x: fp.x - 30 - W.fault,
        y: fp.y - 29,
        text: "fault",
        tone: "orange",
        solid: true,
      });
      const stat = D1.stat(stage, { x: CARD.x, y: 20, w: CARD.w, h: 80, label: "disk faults", tone: "orange" });

      // right: two rows
      const mkRow = (y, head, headTone, failTone, yBody) => ({
        card: D1.card(stage, { x: CARD.x, y, w: CARD.w, h: CARD.h, plain: true }),
        head: D1.tag(stage, { x: CARD.x + 16, y: y - 29, text: head, tone: headTone }),
        fail: D1.tag(stage, { x: FAIL_X, y: y - 29, text: "failures: 0", tone: failTone, solid: true }),
        user: D1.user(stage, { x: UX, y: yBody, size: 64 }),
        uLab: D1.label(stage, { x: UX - 90, y: yBody + 36, w: 180, text: "user" }),
        dLab: D1.label(stage, { x: DISK_X - 60, y: yBody + 40, w: 120, text: "dead", tone: "orange" }),
      });
      const r1 = mkRow(CARD.y1, "one copy", "grey", "red", Y1);
      const r2 = mkRow(CARD.y2, "two copies", "purple", "green", Y2);
      r2.cLab = D1.label(stage, { x: COPY_X - 60, y: Y2 + 40, w: 120, text: "copy", tone: "purple" });

      const svg = L5.svg(stage);
      const arr1 = svg.appendChild(L5.arrow(UX + 40, Y1, DISK_X - 72, Y1, "grey"));
      const arr2 = svg.appendChild(L5.arrow(UX + 40, Y2, DISK_X - 72, Y2, "grey"));
      const backFrom = [COPY_X, Y2 - 33];
      const backTo = [UX + 28, Y2 - 33];
      const BOW = -22;
      const arrBack = svg.appendChild(
        L5.arrow(backFrom[0], backFrom[1], backTo[0], backTo[1], "green", 1, { bow: BOW }),
      );
      const along = quad(backFrom, backTo, BOW);
      const disk1 = svg.appendChild(D1.icon.disk(DISK_X, Y1, 60, "orange"));
      const disk2 = svg.appendChild(D1.icon.disk(DISK_X, Y2, 60, "orange"));
      const copy = svg.appendChild(D1.icon.disk(COPY_X, Y2, 60, "purple"));
      const cross = svg.appendChild(L5.cross(DISK_X - 52, Y1, 36, "red", { ink: true, w: 7 }));
      const cross2 = svg.appendChild(L5.cross(DISK_X - 52, Y2, 36, "red", { ink: true, w: 7 }));
      const tick = svg.appendChild(L5.tick(COPY_X + 58, Y2, 36, "green", { ink: true, w: 8 }));
      const tok1 = D1.token(stage, { tone: "blue", size: 30, square: true });
      const tok2 = D1.token(stage, { tone: "blue", size: 30, square: true });
      const tok3 = D1.token(stage, { tone: "green", size: 30, square: true });

      return (t) => {
        // ----- the field, its tags and the fault counter -----
        const dayNow = DK.days.filter((d) => t >= dayAt(d.day)).length;
        // a marker pings again when it turns red (one copy) and when it goes back to orange (two copies)
        const again = (a) => (t >= a && t < a + PULSE ? 0.04 + 0.96 * ((t - a) / PULSE) : 1);
        const dead = DEAD.map(({ i, day }, j) => {
          const born = ramp(t, dayAt(day) + 0.05, dayAt(day) + 0.55, E.lin);
          const red = t >= redAt(j) && t < orangeAt(j);
          return {
            i,
            k: t >= orangeAt(j) ? again(orangeAt(j)) : t >= redAt(j) ? again(redAt(j)) : born,
            tone: red ? "red" : "orange",
          };
        });
        field.update({ o: ramp(t, 0.1, 0.6, E.lin), dead });
        tDisks.set({ k: pop(t, 0.2) });
        tRate.set({ k: pop(t, 0.45) });
        tDay.set({ k: pop(t, DAY0 - 0.15), text: `day ${Math.max(1, dayNow)}` });
        tFault.set({ k: Math.min(pop(t, FAULT_TAG[0]), 1 - fade(t, FAULT_TAG[1] - 0.2, 0.2)) });
        const counted = DK.days.filter((d) => t >= dayAt(d.day) + 0.15).map((d) => d.total);
        const bump = Math.max(
          0,
          ...DK.days.filter((d) => d.dead.length).map((d) => flash(t, dayAt(d.day) + 0.15, dayAt(d.day) + 0.5)),
        );
        stat.set({
          k: pop(t, 0.7),
          text: String(counted.length ? counted[counted.length - 1] : 0),
          bump: 0.3 * Math.max(bump, flash(t, FINAL[0], FINAL[1])),
        });
        const pulseNow = flash(t, FINAL[0], FINAL[1]);

        // ----- row 1: one copy -----
        r1.card.set({ k: pop(t, ROW1) });
        r1.head.set({ k: pop(t, ROW1 + 0.1) });
        const failed1 = t >= HIT1 + 0.05;
        r1.user.set({ k: pop(t, ROW1 + 0.1), tone: failed1 ? "red" : "grey" });
        r1.uLab.set({ k: fade(t, ROW1 + 0.2), text: failed1 ? "no answer" : "user", tone: failed1 ? "red" : "grey" });
        r1.dLab.set({ k: fade(t, ROW1 + 0.4) });
        L5.drawOn(arr1, ramp(t, ROW1 + 0.3, ROW1 + 0.55, E.lin));
        on(disk1, pop(t, ROW1 + 0.2));
        const reds = dead.filter((_, j) => t >= redAt(j)).length;
        r1.fail.set({ k: pop(t, RED0), text: `failures: ${reds}`, s: 1 + 0.08 * pulseNow });
        const q1 = ramp(t, REQ1[0], REQ1[1], E.lin);
        const hit1 = ramp(t, HIT1, HIT1 + 0.3, E.lin);
        tok1.set({
          x: lerp(UX + 40, DISK_X - 76, q1),
          y: Y1 + 34 * E.out(hit1),
          s: 1 - 0.4 * hit1,
          o: t < REQ1[0] ? 0 : 1 - hit1,
          tone: hit1 > 0 ? "red" : "blue",
        });
        on(cross, pop(t, HIT1, 0.35), { o: 1 });
        L5.drawOn(cross, ramp(t, HIT1, HIT1 + 0.25, E.lin));

        // ----- row 2: two copies -----
        r2.card.set({ k: pop(t, ROW2) });
        r2.head.set({ k: pop(t, ROW2 + 0.1) });
        const answered = t >= BACK[1];
        r2.user.set({ k: pop(t, ROW2 + 0.1), tone: answered ? "green" : "grey" });
        r2.uLab.set({
          k: fade(t, ROW2 + 0.2),
          text: answered ? "answered" : "user",
          tone: answered ? "green" : "grey",
        });
        r2.dLab.set({ k: fade(t, ROW2 + 0.4) });
        r2.cLab.set({ k: fade(t, ROW2 + 0.5) });
        L5.drawOn(arr2, ramp(t, ROW2 + 0.3, ROW2 + 0.55, E.lin));
        on(disk2, pop(t, ROW2 + 0.2), { x: 5 * Math.sin(t * 70) * flash(t, REQ2[1], REQ2[1] + 0.22) });
        on(copy, pop(t, ROW2 + 0.3), { s: 1 + 0.16 * flash(t, HOP[1], HOP[1] + 0.4) });
        r2.fail.set({ k: pop(t, BACK[1] - 0.1), text: `failures: ${DK.failures2}`, s: 1 + 0.08 * pulseNow });
        // the dead disk cannot answer: a cross for a moment, then the request hops over it
        on(cross2, pop(t, REQ2[1], 0.3), { o: 1 - fade(t, HOP[0] + 0.15, 0.2) });
        L5.drawOn(cross2, ramp(t, REQ2[1], REQ2[1] + 0.2, E.lin));
        on(tick, pop(t, BACK[1] + 0.05));
        L5.drawOn(tick, ramp(t, BACK[1] + 0.05, BACK[1] + 0.35, E.lin));
        const q2 = ramp(t, REQ2[0], REQ2[1], E.lin);
        const hop = ramp(t, HOP[0], HOP[1], E.inOut);
        const arrive = ramp(t, HOP[1], HOP[1] + 0.15, E.lin);
        tok2.set({
          x: hop > 0 ? lerp(DISK_X - 76, COPY_X - 40, hop) : lerp(UX + 40, DISK_X - 76, q2),
          y: Y2 - 60 * Math.sin(Math.PI * hop),
          s: 1 - 0.5 * arrive,
          o: t < REQ2[0] ? 0 : 1 - arrive,
        });
        L5.drawOn(arrBack, ramp(t, BACK[0], BACK[1], E.lin));
        const qb = ramp(t, BACK[0], BACK[1], E.lin);
        const [bx, by] = along(qb);
        tok3.set({
          x: bx,
          y: by,
          s: 1 - 0.5 * ramp(qb, 0.9, 1, E.lin),
          o: t < BACK[0] ? 0 : 1 - ramp(qb, 0.9, 1, E.lin),
        });
      };
    },
  });
})();
