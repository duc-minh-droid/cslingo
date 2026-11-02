/* Lecture 8 (ds-8) · scene 4 (EVENTS): an event is a small, self-contained, immutable record of something that happened, with a
   timestamp; changing your mind appends a NEW event and the old one stays (lesson 8.1, step 'Events'). The event comes from
   D8.EVENT (mo_17 likes post 4821 at 09:15:02, unlikes it at 09:20:41; asserted).
   Colours: blue = the event and its copies on the stream, orange = the attempted edit, red = the cross that refuses it,
   green = both events kept, grey = field names, the lock and the stream track.
   Story (local seconds): 0.3 the event card pops, 0.8 / 1.2 / 1.6 user, action and post rows; 2.2-2.9 a copy flies onto the
   stream; 3.4 the time row and the stream time; 4.6 the lock "immutable"; 5.8-6.4 an orange "unlike" tries to overwrite "like",
   bounces off (red cross, the card shakes), fades at 7.0; 8.3-8.9 a new event "mo_17 unlike 4821" joins the stream; 9.2 ticks on
   both stream events, 9.4 "both stay". Hold. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const EV = D8.EVENT;

  D8.same(
    "event scene: mo_17 likes post 4821 at 09:15:02, unlikes it at 09:20:41",
    [EV.user, EV.action, EV.post, EV.time, EV.undo.action, EV.undo.post, EV.undo.time],
    ["mo_17", "like", 4821, "09:15:02", "unlike", 4821, "09:20:41"],
  );
  const text = (e) => `${e.user} ${e.action} ${e.post}`;
  const T = {
    card: 0.3,
    rows: 0.8,
    fly: 2.2,
    time: 3.4,
    lock: 4.6,
    edit: 5.8,
    hit: 6.4,
    gone: 7.0,
    undo: 8.3,
    ticks: 9.2,
  };
  const ROWS = [
    ["user", EV.user],
    ["action", EV.action],
    ["post", `${EV.post}`],
    ["time", EV.time],
  ];
  const ROW_Y = [100, 160, 220, 280];
  const FX = 380; // field names end here; values start at FX + 20
  const LANE_Y = 470;
  const CHIP1 = { x: 300, y: LANE_Y };
  const CHIP2 = { x: 640, y: LANE_Y };

  V.scene({
    kicker: "EVENTS",
    title: ["An event records", "what happened"],
    dur: 11,
    caps: [
      [0.5, 3.2, `An event: ${EV.user} liked post ${EV.post}.`],
      [3.4, 5.6, "It carries a timestamp: when it happened."],
      [5.8, 8, "It is immutable: it cannot be edited."],
      [8.3, 10.6, "A change of mind is a new event."],
    ],
    build(stage) {
      // ---- the stream lane (under everything) ----
      const laneSvg = D4.svg(stage);
      const track = laneSvg.appendChild(
        V.s("rect", {
          x: 60,
          y: LANE_Y - 8,
          width: 816,
          height: 16,
          rx: 8,
          "stroke-width": 3,
          style: { fill: "var(--panel-2)", stroke: "var(--line-2)" },
        }),
      );
      const laneLabel = D4.label(stage, { x: 60, y: 414, text: "event stream", tone: "grey", fs: 28, anchor: "l" });
      const time1 = D4.label(stage, { x: CHIP1.x, y: 530, text: EV.time, tone: "grey", fs: 28 });
      const time2 = D4.label(stage, { x: CHIP2.x, y: 530, text: EV.undo.time, tone: "grey", fs: 28 });

      // ---- the event card and its rows (one box, so the card shakes as one) ----
      const box = V.h("div", { style: { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px" } });
      stage.append(box);
      const card = D4.card(box, { x: 120, y: 40, w: 600, h: 300, tone: "blue", plain: true });
      const fields = ROWS.map(([f], i) =>
        D4.label(box, { x: FX, y: ROW_Y[i], text: `${f}:`, tone: "grey", fs: 30, anchor: "r" }),
      );
      const values = ROWS.map(([, v], i) =>
        D4.tag(box, { x: FX + 20, y: ROW_Y[i], text: v, tone: "blue", solid: true, fs: 30, anchor: "l" }),
      );
      const boxSvg = D4.svg(box);
      const clockX = FX + 20 + D4.tagW(EV.time, 30) + 40;
      const clock = boxSvg.appendChild(D8.clock(clockX, ROW_Y[3], 48, "blue", 9));

      // ---- the lock, the stream chips, the attempted edit ----
      const lock = laneSvg.appendChild(D8.lock(830, 236, 64, "grey"));
      const immutable = D4.tag(stage, { x: 830, y: 306, text: "immutable", tone: "grey" });
      const chip1 = D4.packet(stage, { text: text(EV), tone: "blue", fs: 28 });
      const chip2 = D4.packet(stage, { text: text(EV.undo), tone: "blue", fs: 28 });
      const likeEnd = FX + 20 + D4.tagW(EV.action, 30);
      const editW = D4.tagW(EV.undo.action, 30);
      const editTo = likeEnd + 6 + editW / 2;
      const edit = D4.tag(stage, { text: EV.undo.action, tone: "orange", solid: true, fs: 30 });
      const top = D4.svg(stage);
      const cross = top.appendChild(L5.cross(editTo, ROW_Y[1] - 50, 40, "red", { w: 9 }));
      const ticks = [CHIP1, CHIP2].map((c, i) =>
        top.appendChild(
          L5.tick(c.x + D4.tagW(text(i ? EV.undo : EV)) / 2 + 58, LANE_Y, 40, "green", { ink: true, w: 9 }),
        ),
      );
      const both = D4.tag(stage, { x: 468, y: 600, text: "both stay", tone: "green", solid: true });

      return (t) => {
        // card and rows
        const ck = ramp(t, T.card, T.card + 0.4, E.lin);
        const shake = 6 * Math.sin((t - T.hit) * 60) * flash(t, T.hit, T.hit + 0.5);
        V.place(box, { x: shake });
        card.set({ k: ck, s: 1 - 0.03 * flash(t, T.fly - 0.2, T.fly + 0.2) });
        ROWS.forEach((_, i) => {
          const rk = i < 3 ? D4.seq(t, T.rows, 0.4, 0.35, i) : ramp(t, T.time, T.time + 0.35, E.lin);
          fields[i].set({ k: rk });
          values[i].set({ k: rk, s: i === 1 ? 1 + 0.1 * flash(t, T.hit, T.hit + 0.3) : 1 });
        });
        const clk = ramp(t, T.time, T.time + 0.5, E.lin);
        V.place(clock, { s: 0.6 + 0.4 * E.pop(clk), r: lerp(-90, 0, E.out(clk)), o: clk });
        // the stream
        const lk = ramp(t, T.card, T.card + 0.5, E.lin);
        V.place(track, { o: lk });
        laneLabel.set({ k: lk });
        const f1 = ramp(t, T.fly, T.fly + 0.7, E.inOut);
        const p1 = D4.at({ x: 420, y: 190 }, CHIP1, f1, -40);
        chip1.set({ x: p1.x, y: p1.y, k: t >= T.fly ? 1 : 0, s: lerp(0.7, 1, f1) });
        time1.set({ k: ramp(t, T.time, T.time + 0.35, E.lin) });
        // the lock
        const lok = ramp(t, T.lock, T.lock + 0.4, E.lin);
        V.place(lock, { s: (0.6 + 0.4 * E.pop(lok)) * (1 + 0.12 * flash(t, T.hit, T.hit + 0.35)), o: lok });
        immutable.set({ k: lok });
        // the attempted edit: slides in, hits "like", bounces back, fades
        const inK = ramp(t, T.edit, T.hit, E.in);
        const backK = ramp(t, T.hit, T.hit + 0.5, E.out);
        const ex = lerp(lerp(860, editTo, inK), editTo + 70, backK);
        const eo = t < T.edit ? 0 : 1 - ramp(t, T.gone, T.gone + 0.3, E.lin);
        edit.set({ x: ex, y: ROW_Y[1], k: ramp(t, T.edit, T.edit + 0.2, E.lin), o: eo });
        const xk = ramp(t, T.hit, T.hit + 0.3, E.lin);
        L5.drawOn(cross, xk);
        V.place(cross, { x: 70 * backK, s: 0.6 + 0.4 * E.pop(xk), o: t < T.hit ? 0 : eo });
        // the change of mind: a new event joins the stream
        const f2 = ramp(t, T.undo, T.undo + 0.6, E.out);
        chip2.set({ x: lerp(760, CHIP2.x, f2), y: CHIP2.y, k: clamp((t - T.undo) / 0.2) });
        time2.set({ k: ramp(t, T.undo + 0.6, T.undo + 0.95, E.lin) });
        ticks.forEach((g, i) => {
          const tk = ramp(t, T.ticks + 0.2 * i, T.ticks + 0.2 * i + 0.4, E.lin);
          L5.drawOn(g, tk);
          V.place(g, { s: 0.6 + 0.4 * E.pop(tk), o: tk });
        });
        both.set({ k: ramp(t, T.ticks + 0.4, T.ticks + 0.8, E.lin) });
      };
    },
  });
})();
