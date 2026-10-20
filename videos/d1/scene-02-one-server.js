/* Lecture 1 (ds-1), scene 02: one server can't keep up or stay up (lesson 1.1).
   Six users send requests to one big server that can serve 6,000 a second. At 3,000 it is half full; at 9,000 it serves 6,000
   and bounces 3,000 back (scalability); a crash bounces everything (availability: the server turns red, the service is down);
   then it is repaired and works again, and a planned repair takes it offline on purpose (maintenance: grey "offline", the
   requests bounce again). Every number comes from D1.serve (asserted against D1.ONE below). The requests are a local emitter
   instead of D1.stream: each packet leaves at a time worked out from the load, and whether it is served or bounced is decided
   from the server's state when it arrives, so the red packets are visible, evenly spread and consistent with the counters. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (asserted against the real rule) ----------
  const CAP = D1.ONE.cap;
  const [CALM, BUSY] = D1.ONE.loads;
  const RAIL = { x1: 172, x2: 572, y: 190 }; // arrow from the users to the server
  const X0 = 190; // where a request leaves
  const XD = 560; // where it meets the server
  const SPEED = 380; // px per second
  const TRAVEL = (XD - X0) / SPEED; // seconds from the users to the server
  const T = {
    pop: 0.1, // users, server and counters pop in
    stream: 0.5, // the users start to send requests
    up0: 3.2, // load climbs from CALM to BUSY at the server ...
    up1: 4.2, // ... over one second
    tagUp: 4.6, // "scalability" tag
    bolt: 5.4, // the crash strikes
    down: 5.7, // the server is dead
    tagDown: 6.2, // "availability" tag
    stop: 6.4, // the users stop sending (the last requests are still on their way)
    resume: 6.8, // ... and start again at the calm load
    repair: 8.7, // the planned repair: the server goes offline on purpose
    tagFix: 9.0, // "maintenance" tag
  };
  T.revive = T.resume + TRAVEL; // the server is back as the first new request reaches it
  const DIE = 0.7; // the served count falls to 0 over this long
  const UP = 0.5; // ... and climbs back over this long
  const PER = 900; // requests per second that one packet stands for (3,000 a second = one packet every 0.3 s)
  const FALL = 0.7; // a bounced packet is visible this long
  const SRV = { x: 580, y: 40, w: 300, h: 300 };
  const BADGE = { x: 856, y: 76, size: 90 }; // centre of the bolt (crash) and the wrench (repair) on the server's corner

  /** The load at the server's door that the climb makes in the first window (the users send until T.stop). */
  const climb = (t) =>
    CALM * ramp(t, T.stream + TRAVEL, T.stream + TRAVEL + 0.8, E.out) + (BUSY - CALM) * ramp(t, T.up0, T.up1, E.inOut);
  /** The calm load of the second window (the users start again at T.resume). */
  const calm = (t) => CALM * ramp(t, T.resume + TRAVEL, T.resume + TRAVEL + 0.6, E.out);
  /** The load the packets that reach the door at time t make (the packets are made from this). */
  const doorLoad = (t) => (t < T.stop + TRAVEL ? climb(t) : t >= T.resume + TRAVEL ? calm(t) : 0);
  /** Is the server working when a request arrives at time t? */
  const aliveAt = (t) => t < T.down || (t >= T.revive && t < T.repair);
  /** What the server shows at time t: load, served and dropped per second. */
  const world = (t) => {
    const load =
      t >= T.resume + TRAVEL
        ? calm(t)
        : climb(Math.min(t, T.stop + TRAVEL)) * (1 - ramp(t, T.stop + TRAVEL, T.stop + TRAVEL + 0.3));
    const up = D1.serve(load, CAP, true).served;
    const a =
      t < T.revive
        ? 1 - ramp(t, T.down, T.down + DIE, E.lin)
        : t < T.repair
          ? ramp(t, T.revive, T.revive + UP, E.lin)
          : 1 - ramp(t, T.repair, T.repair + UP, E.lin);
    const served = up * a;
    return { load, served, dropped: load - served };
  };
  const seen = (t) => {
    const w = world(t);
    return [Math.round(w.served), Math.round(w.dropped)];
  };
  D1.same("one-server scene: calm", seen(3.0), [D1.ONE.calm.served, D1.ONE.calm.dropped]);
  D1.same("one-server scene: over capacity", seen(5.0), [D1.ONE.over.served, D1.ONE.over.dropped]);
  D1.same("one-server scene: crashed", seen(7.0), [D1.ONE.down.served, D1.ONE.down.dropped]);
  D1.same("one-server scene: repaired and calm again", seen(8.5), [D1.ONE.calm.served, D1.ONE.calm.dropped]);
  D1.same("one-server scene: offline for the repair", seen(10.0), [0, D1.ONE.calm.served]);

  /** The packets: leave time, arrival time, served or bounced (fixed by the server's state on arrival). */
  const packets = (() => {
    const list = [];
    const dt = 1 / 600;
    let acc = 0;
    for (let t = 0; t < 10.4; t += dt) {
      acc += (doorLoad(t + TRAVEL) / PER) * dt; // one packet per PER requests a second
      while (acc >= list.length + 0.5) list.push({ out: t });
    }
    list.forEach((p, m) => {
      p.arrive = p.out + TRAVEL;
      const load = doorLoad(p.arrive);
      const share = D1.serve(load, CAP, aliveAt(p.arrive)).served / load; // the share of packets it can take
      p.bounced = (m * 0.6180339887) % 1 >= share; // an even mix, not a random one
      p.vx = 70 + 70 * ((m * 0.7548776662) % 1); // how fast it drifts left as it falls (away from the counters)
      p.vy = 90 + 60 * ((m * 0.569840291) % 1); // its first downward speed
      p.spin = (m % 2 ? 1 : -1) * (120 + 140 * ((m * 0.3247179572) % 1));
    });
    return list;
  })();
  const share = (list) => list.filter((p) => p.bounced).length / list.length;
  const between = (a, b) => packets.filter((p) => p.arrive >= a && p.arrive < b);
  D1.same(
    "one-server scene: nothing is bounced while the load is calm",
    packets.filter((p) => p.arrive < T.up0 + 0.4).filter((p) => p.bounced).length,
    0,
  );
  D1.close(
    "one-server scene: the share bounced at 9,000 a second",
    share(between(T.up1 + 0.1, T.down)),
    D1.ONE.over.dropped / BUSY,
    0.12,
  );
  D1.same("one-server scene: everything is bounced once the server is down", share(between(T.down, T.revive)), 1);
  D1.same("one-server scene: nothing is bounced once it works again", share(between(T.revive + 0.05, T.repair)), 0);
  D1.same("one-server scene: everything is bounced during the repair", share(between(T.repair, 11)), 1);

  // ---------- layout ----------
  const PEOPLE = [
    [60, 60],
    [130, 60],
    [60, 140],
    [130, 140],
    [60, 220],
    [130, 220],
  ];
  const TAGS = [
    { y: 410, tone: "orange", text: "scalability: only so big", at: T.tagUp },
    { y: 480, tone: "red", text: "availability: a crash stops all", at: T.tagDown },
    { y: 550, tone: "grey", text: "maintenance: repairs need downtime", at: T.tagFix },
  ];

  function build(stage) {
    const low = L5.svg(stage);
    const people = PEOPLE.map(([x, y]) => low.appendChild(D1.icon.person(x, y, 54, "grey")));
    const rail = low.appendChild(L5.arrow(RAIL.x1, RAIL.y, RAIL.x2, RAIL.y, "grey", 1, { w: 8, head: 22 }));
    const usersLab = D1.label(stage, { x: 35, y: 258, w: 120, text: "users" });
    const reqLab = D1.label(stage, { x: RAIL.x1, y: 128, w: RAIL.x2 - RAIL.x1, text: "requests per second" });
    const srv = D1.server(stage, { ...SRV, label: "one server", fs: 28 });
    const limit = D1.label(stage, { x: SRV.x + 10, y: 224, w: SRV.w - 20, text: `limit ${D1.fmt(CAP)}/s` });
    packets.forEach((p) => (p.tok = D1.token(stage, { tone: "blue", size: 26, square: true })));
    const served = D1.stat(stage, { x: 548, y: 370, w: 372, h: 80, label: "served", tone: "green" });
    const dropped = D1.stat(stage, { x: 548, y: 460, w: 372, h: 80, label: "dropped", tone: "red" });
    const tags = TAGS.map((g) => ({
      ...g,
      tag: D1.tag(stage, { x: 12, y: g.y, text: g.text, tone: g.tone, solid: true }),
    }));
    const top = L5.svg(stage);
    const bolt = top.appendChild(D1.icon.bolt(BADGE.x, BADGE.y, BADGE.size, "orange"));
    // the wrench's drawing is not centred on its x (its box runs from -0.30 to +0.60 of the size), so shift it onto the badge centre
    const wrench = top.appendChild(D1.icon.wrench(BADGE.x - 0.15 * BADGE.size, BADGE.y, BADGE.size, "orange"));

    return (t) => {
      const w = world(t);
      const dead = t >= T.down && t < T.revive;
      const offline = t >= T.repair;
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.out);
      const hundred = (n) => D1.fmt(Math.round(n / 100) * 100); // the numbers move in steps of 100
      const perSec = (n) => `${hundred(n)}/s`;

      // ---- users and the rail ----
      people.forEach((g, i) => {
        const p = D1.seq(t, T.pop, 0.05, 0.3, i);
        V.place(g, { s: 0.7 + 0.3 * E.pop(p), o: Math.min(1, p * 4) });
      });
      L5.drawOn(rail, ramp(t, T.pop + 0.2, T.pop + 0.7, E.out));
      usersLab.set({ k: k(T.pop + 0.3) });
      reqLab.set({ k: k(T.stream - 0.1) });

      // ---- the server: working, dead (a failure: red), back, then offline for the repair (grey) ----
      const shake = t >= T.bolt + 0.05 && t < T.down ? Math.sin((t - T.bolt) * 70) * 7 : 0;
      srv.set({
        state: offline ? "idle" : dead ? "down" : w.load > CAP ? "over" : w.load >= 0.75 * CAP ? "hot" : "ok",
        load: offline ? 0 : w.load / CAP,
        text: offline ? "offline" : perSec(w.load),
        label: "one server",
        k: k(T.pop, 0.5),
        s: 1 + 0.05 * flash(t, T.down, T.down + 0.35) + 0.05 * flash(t, T.repair, T.repair + 0.35),
        shake,
      });
      limit.set({ k: k(T.pop + 0.4), tone: w.load > CAP ? "orange" : "grey", o: dead || offline ? 0 : 1 });

      // ---- the requests: served ones go in, bounced ones turn red and fall ----
      packets.forEach((p) => {
        const tau = t - p.out;
        if (tau < 0 || tau > TRAVEL + FALL) return p.tok.set({ o: 0 });
        const born = ramp(tau, 0, 0.08, E.lin);
        if (tau < TRAVEL) return p.tok.set({ x: X0 + SPEED * tau, y: RAIL.y, o: born, tone: "blue" });
        const q = tau - TRAVEL;
        if (!p.bounced) {
          const f = ramp(q, 0, 0.08, E.lin); // into the server
          return p.tok.set({ x: XD + SPEED * q, y: RAIL.y, s: 1 - 0.5 * f, o: 1 - f, tone: "blue" });
        }
        const f = Math.max(0, q - 0.05); // a beat at the door, then it falls off the end of the rail
        p.tok.set({
          x: XD - 6 - p.vx * f,
          y: RAIL.y + p.vy * f + 550 * f * f,
          r: p.spin * f,
          o: 1 - ramp(q, 0.25, FALL, E.lin),
          tone: "red",
        });
      });

      // ---- counters (per second) ----
      served.set({ text: perSec(w.served), k: k(T.pop + 0.2) });
      dropped.set({
        text: perSec(w.dropped),
        k: k(T.pop + 0.3),
        bump: 0.5 * flash(t, T.up0 + 0.5, T.up1 + 0.3) + 0.5 * flash(t, T.repair + 0.2, T.repair + 0.6),
      });

      // ---- the crash, then the repair (the same corner of the server) ----
      const bk = ramp(t, T.bolt, T.bolt + 0.3, E.out);
      const gone = ramp(t, T.revive - 0.1, T.revive + 0.2, E.lin);
      V.place(bolt, {
        y: (1 - bk) * -70,
        s: (0.6 + 0.4 * E.pop(bk)) * (1 - 0.4 * gone),
        o: Math.min(1, bk * 4) * (1 - gone),
      });
      const wk = ramp(t, T.repair, T.repair + 0.4, E.out);
      const rock =
        15 * Math.sin(((t - T.repair) * Math.PI * 2) / 0.9) * (1 - ramp(t, T.repair + 0.9, T.repair + 1.8, E.lin));
      V.place(wrench, { s: 0.6 + 0.4 * E.pop(wk), o: Math.min(1, wk * 4), r: wk > 0 ? rock : 0 });

      // ---- the three limits ----
      tags.forEach((g) => g.tag.set({ k: clamp(ramp(t, g.at, g.at + 0.4, E.out)) }));
    };
  }

  V.scene({
    kicker: "WHY IT'S HARD",
    title: ["One server can't", "keep up or stay up"],
    dur: 10.8,
    caps: [
      [0.5, 3.2, "One big server does all the work."],
      [4.0, 5.8, "Too many requests get dropped."],
      [5.8, 7.8, "One crash, and everything is down."],
      [8.8, 10.6, "Even a repair means downtime."],
    ],
    build,
  });
})();
