/* Lecture 1 (ds-1), scene 02: one server can't keep up or stay up (lesson 1.1).
   Six users send requests to one big server that can serve 6,000 a second. At 3,000 it is half full; at 9,000 it serves 6,000
   and bounces 3,000 back (scalability); a crash bounces everything (availability); a repair is a planned outage (maintenance).
   Every number comes from D1.serve (asserted against D1.ONE below). The requests are a local emitter instead of D1.stream:
   each packet leaves at a time worked out from the load, and whether it is served or bounced is decided from the server's
   state when it arrives, so the red packets are visible, evenly spread and consistent with the counters. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the data (asserted against the real rule) ----------
  const CAP = D1.ONE.cap;
  const [CALM, BUSY] = D1.ONE.loads;
  const T = {
    pop: 0.1, // users, server and counters pop in
    stream: 0.5, // the users start to send requests
    up0: 3.2, // load climbs from CALM to BUSY at the server ...
    up1: 4.2, // ... over one second
    tagUp: 4.6, // "scalability" tag
    bolt: 5.5, // the crash strikes
    down: 5.8, // the server is dead
    tagDown: 6.4, // "availability" tag
    stop: 7.0, // the users stop sending (the last requests are still on their way)
    wrench: 7.8, // the repair
    tagFix: 8.3, // "maintenance" tag
  };
  const DIE = 0.7; // the served count falls to 0 over this long

  // ---------- the rail, the packets and the server ----------
  const RAIL = { x1: 172, x2: 572, y: 190 }; // arrow from the users to the server
  const X0 = 190; // where a request leaves
  const XD = 560; // where it meets the server
  const SPEED = 380; // px per second
  const TRAVEL = (XD - X0) / SPEED; // seconds from the users to the server
  const PER = 900; // requests per second that one packet stands for (3,000 a second = one packet every 0.3 s)
  const FALL = 0.7; // a bounced packet is visible this long
  const SRV = { x: 580, y: 40, w: 300, h: 300 };
  const BADGE = { x: 872, y: 72, size: 96 }; // centre of the bolt (crash) and the wrench (repair) on the server's corner

  /** Requests arriving at the server's door at time t (what the server sees; the climb is timed here). */
  const loadAt = (t) =>
    CALM * ramp(t, T.stream + TRAVEL, T.stream + TRAVEL + 0.8, E.out) + (BUSY - CALM) * ramp(t, T.up0, T.up1, E.inOut);
  /** What the server shows at time t: load, served and dropped per second. After the users stop it keeps its last reading. */
  const world = (t) => {
    const load = loadAt(Math.min(t, T.stop + TRAVEL));
    const up = D1.serve(load, CAP, true);
    const dn = D1.serve(load, CAP, false);
    const served = lerp(up.served, dn.served, ramp(t, T.down, T.down + DIE, E.lin));
    return { load, served, dropped: load - served };
  };
  const seen = (t) => {
    const w = world(t);
    return [Math.round(w.served), Math.round(w.dropped)];
  };
  D1.same("one-server scene: calm", seen(3.0), [D1.ONE.calm.served, D1.ONE.calm.dropped]);
  D1.same("one-server scene: over capacity", seen(5.0), [D1.ONE.over.served, D1.ONE.over.dropped]);
  D1.same("one-server scene: crashed", seen(9.0), [D1.ONE.down.served, D1.ONE.down.dropped]);

  /** The packets: leave time, arrival time, served or bounced (fixed by the server's state on arrival). */
  const packets = (() => {
    const list = [];
    const dt = 1 / 600;
    let acc = 0;
    for (let t = 0; t < T.stop; t += dt) {
      acc += (loadAt(t + TRAVEL) / PER) * dt; // one packet per PER requests a second
      while (acc >= list.length + 0.5) list.push({ out: t });
    }
    list.forEach((p, m) => {
      p.arrive = p.out + TRAVEL;
      const load = loadAt(p.arrive);
      const share = D1.serve(load, CAP, p.arrive < T.down).served / load; // the share of packets it can take
      p.bounced = (m * 0.6180339887) % 1 >= share; // an even mix, not a random one
      p.vx = 70 + 70 * ((m * 0.7548776662) % 1); // how fast it drifts left as it falls (away from the counters)
      p.vy = 90 + 60 * ((m * 0.569840291) % 1); // its first downward speed
      p.spin = (m % 2 ? 1 : -1) * (120 + 140 * ((m * 0.3247179572) % 1));
    });
    return list;
  })();
  const share = (list) => list.filter((p) => p.bounced).length / list.length;
  D1.same(
    "one-server scene: nothing is bounced while the load is calm",
    packets.filter((p) => p.arrive < T.up0 + 0.4).filter((p) => p.bounced).length,
    0,
  );
  D1.close(
    "one-server scene: the share bounced at 9,000 a second",
    share(packets.filter((p) => p.arrive > T.up1 + 0.1 && p.arrive < T.down)),
    D1.ONE.over.dropped / BUSY,
    0.12,
  );
  D1.same(
    "one-server scene: everything is bounced once the server is down",
    share(packets.filter((p) => p.arrive >= T.down)),
    1,
  );

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
    const served = D1.stat(stage, { x: 560, y: 370, w: 330, h: 80, label: "served", tone: "green" });
    const dropped = D1.stat(stage, { x: 560, y: 460, w: 330, h: 80, label: "dropped", tone: "red" });
    const tags = TAGS.map((g) => ({
      ...g,
      tag: D1.tag(stage, { x: 12, y: g.y, text: g.text, tone: g.tone, solid: true }),
    }));
    const top = L5.svg(stage);
    const bolt = top.appendChild(D1.icon.bolt(BADGE.x, BADGE.y, BADGE.size, "orange"));
    // the wrench's drawing is not centred on its x (its box runs from -0.30 to +0.60 of the size), so shift it onto the badge centre
    const wrench = top.appendChild(D1.icon.wrench(BADGE.x - 0.15 * BADGE.size, BADGE.y, BADGE.size, "grey"));
    wrench.querySelectorAll("path").forEach((p) => {
      p.style.fill = "var(--node-off-ic)"; // a darker grey than the pale default, so the repair tool reads at a glance
      p.style.stroke = "var(--text-dim)";
    });

    return (t) => {
      const w = world(t);
      const dead = t >= T.down;
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.out);
      const hundred = (n) => D1.fmt(Math.round(n / 100) * 100); // the numbers move in steps of 100

      // ---- users and the rail ----
      people.forEach((g, i) => {
        const p = D1.seq(t, T.pop, 0.05, 0.3, i);
        V.place(g, { s: 0.7 + 0.3 * E.pop(p), o: Math.min(1, p * 4) });
      });
      L5.drawOn(rail, ramp(t, T.pop + 0.2, T.pop + 0.7, E.out));
      usersLab.set({ k: k(T.pop + 0.3) });
      reqLab.set({ k: k(T.stream - 0.1) });

      // ---- the server ----
      const shake = t >= T.bolt + 0.05 && t < T.down ? Math.sin((t - T.bolt) * 70) * 7 : 0;
      srv.set({
        state: dead ? "down" : w.load > CAP ? "over" : w.load >= 0.75 * CAP ? "hot" : "ok",
        load: w.load / CAP,
        text: `${hundred(w.load)}/s`,
        label: "one server",
        k: k(T.pop, 0.5),
        s: 1 + 0.05 * flash(t, T.down, T.down + 0.35),
        shake,
      });
      limit.set({ k: k(T.pop + 0.4), tone: w.load > CAP ? "orange" : "grey", o: dead ? 0 : 1 });

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

      // ---- counters ----
      served.set({ text: hundred(w.served), k: k(T.pop + 0.2) });
      dropped.set({ text: hundred(w.dropped), k: k(T.pop + 0.3), bump: 0.5 * flash(t, T.up0 + 0.5, T.up1 + 0.3) });

      // ---- the crash, then the repair (the same corner of the server) ----
      const bk = ramp(t, T.bolt, T.bolt + 0.3, E.out);
      const gone = ramp(t, T.wrench, T.wrench + 0.2, E.lin);
      V.place(bolt, {
        y: (1 - bk) * -70,
        s: (0.6 + 0.4 * E.pop(bk)) * (1 - 0.4 * gone),
        o: Math.min(1, bk * 4) * (1 - gone),
      });
      const wk = ramp(t, T.wrench + 0.1, T.wrench + 0.5, E.out);
      const rock =
        15 * Math.sin(((t - T.wrench) * Math.PI * 2) / 0.9) * (1 - ramp(t, T.wrench + 0.9, T.wrench + 1.8, E.lin));
      V.place(wrench, { s: 0.6 + 0.4 * E.pop(wk), o: Math.min(1, wk * 4), r: wk > 0 ? rock : 0 });

      // ---- the three limits ----
      tags.forEach((g) => g.tag.set({ k: clamp(ramp(t, g.at, g.at + 0.4, E.out)) }));
    };
  }

  V.scene({
    kicker: "WHY IT'S HARD",
    title: ["One server can't", "keep up or stay up"],
    dur: 10,
    caps: [
      [0.5, 3.2, "One big server does all the work."],
      [4.0, 5.8, "Too many requests get dropped."],
      [5.9, 7.9, "One crash, and everything is down."],
      [8.1, 9.9, "Even repairs take it offline."],
    ],
    build,
  });
})();
