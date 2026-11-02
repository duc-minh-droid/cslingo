/* Lecture 8 · Stream processing (Data Science, COM3021): the data and the message simulation every scene of this video shares
   (VID.d8, short name D8). PURE: no DOM, no Math.random, no Date. The drawing pieces are in common-2.js (the flow rig, the day
   line, the queue column, pictograms); the small stickers (tags, packets, chips, wires, node cards, bolt, person, phone) come
   from the lecture 4 kit VID.d4, so the page loads videos/l5/common.js and videos/d4/common*.js first.
   Every number below is computed when the page loads and asserted against the storyboard (videos/_plan/ds-8.json): a wrong
   number throws an Error. Build captions from these values (`${D8.FLOOD.end.buffer.q}`), never type a result by hand.

   COLOUR ROLES OF THIS VIDEO (the same in every scene):
     "blue"    an EVENT / MESSAGE and the producer that makes it (the thing we follow); a message delivered but not yet acked
     "purple"  the BROKER / messaging system (and the batch runs on the day line): the middleman
     "green"   processed, delivered, acknowledged, safe (an ack, a consumer that has done its work, a message kept on disk)
     "orange"  waiting: queued at the broker, a post not yet processed, a held-back producer, a REDELIVERED message
     "red"     lost, dropped, crashed (a crossed-out message, an offline consumer, a crashed broker)
     "grey"    neutral: idle consumers, files, wires, plain labels

   1. BATCH (scene 2, lesson 8.1).  D8.BATCH = {files: [4000, 2500, 3500], cum: [4000, 6500, 10000], total: 10000,
        output: "views per page"};  D8.fmtN(10000) -> "10,000".
      D8.FEED(n) -> the n-th post of the never-ending feed (n = 1, 2 ...): {n, time: "09:07", who: "ana", what: "likes",
        text: "09:07 ana likes"}: 7 minutes apart from 09:00 with the lesson's words (mo_17 posts, ana likes, raj shares, li posts,
        sam likes, eve replies, by n mod 6).
   2. DAY (scene 3, lesson 8.1 demo).  Twelve posts over one day (hours): D8.DAY.posts = [0.4, 1.7, ... 22.3].
        D8.DAY.windows = [{W: 24, name: "Daily", runs: [24], worst: 23.6, worstText: "23 h 36 min"},
                          {W: 6, name: "Every 6 hours", runs: [6, 12, 18, 24], worst: 5.7, worstText: "5 h 42 min"},
                          {W: 1, name: "Hourly", runs: [1 .. 24], worst: 0.9, worstText: "54 min"},
                          {W: 0, name: "Stream", runs: [], worst: 0, worstText: "0 min"}]   (worst = hours, rounded to 0.1)
        D8.doneAt(t, W) -> when a post at hour t is processed (the next run; W 0 = at once);  D8.fmtH(h) -> "3 h 16 min" / "54 min"
        D8.postState(t, W, now) -> "none" (not yet posted) | "waiting" | "done";  D8.processed(W, now) -> how many are done
   3. EVENT (scene 4, lesson 8.1).  D8.EVENT = {user: "mo_17", action: "like", post: 4821, time: "09:15:02",
        undo: {user: "mo_17", action: "unlike", post: 4821, time: "09:20:41"}, bytes: {json: 74, text: 36, binary: 13}}
   4. POLL (scene 5, lesson 8.1).  D8.POLL = {every: 5, perHour: 12, checks: 720, empty: 708, wait: 2.5, events: [12 seconds
        in the hour, seeded], consumers: ["Notify the author", "Count likes", "Rank the feed"]}
        D8.pollAt(f) -> {checks, found, empty} after the fraction f (0..1) of the hour (checks = floor(720 f), found = events
        that arrived before the last check).
   5. FLOOD (scene 6, lesson 8.2).  A producer at 6/s, a consumer at 4/s, 10 s, queue limit 10 (drop and backpressure only).
        D8.flood(p, c, pol, secs, cap) -> per-second history [{s, q, sent, done, drop, held, acc}] (the app's rule: arrivals
        first, then the consumer takes up to c).   D8.FLOOD = {p: 6, c: 4, secs: 10, cap: 10, hist: {buffer, drop, back},
        end: {buffer: {q: 20, sent: 60, done: 40}, drop: {q: 6, drop: 14, done: 40}, back: {q: 6, sent: 46, held: 14}},
        steps: {buffer | drop | back: [{s, before, arrive, refused, peak, out, after}]}   (refused = dropped or held back
        that second; peak = queue after the arrivals, before the consumer)
   6. CRASH (scene 7, lesson 8.2).  D8.CRASH = {delivered: ["m1","m2"], waiting: ["m3","m4"],
        memory: {afterRestart: [], consumer: ["m1","m2"], lost: ["m3","m4"]},
        disk: {afterRestart: ["m3","m4"], consumer: ["m1","m2","m3","m4"], lost: []}}
   7. THE BROKER SIMULATION (scenes 8, 9 and 10).  D8.sim(o) runs a scripted story once, at load, into an EVENT LOG; a scene draws
      frame t with D8.at(log, t). Never step it inside update(t).
        o = {mode: "lb" (load balancing) | "fan" (fan-out) | "direct" (no broker), producers: ["Producer"], consumers: ["A","B"],
             hold: 1 (a consumer works on one message at a time and must ack) | Infinity (it takes everything, no acks),
             autoAck: false (true = a delivered message counts as done on arrival), rr0: 0 (first consumer for round robin),
             travel: 0.6 (s per hop), detect: 0.8 (s until the broker notices a crash), gap: 0.3 (min s between two packets on one
             wire), script: [[t, "pub", producerIndex] | [t, "ack", consumerIndex] | [t, "crash", c] | [t, "up", c]]}
        The rules: a published message flies to the broker (or, direct, to every consumer); at the broker it waits in the queue and
        is handed out: lb = to ONE free consumer, round robin; fan = to EVERY consumer that has not had it. A consumer acks; the ack
        flies back and the broker deletes the message once lb: one consumer / fan: every consumer acked it. A crash is noticed after
        `detect` s: whatever the crashed consumer held goes back to the queue marked redo and is REDELIVERED to the next free one.
        A message that reaches a consumer that is down is lost to it.
        log = {o, names, hops, marks, snaps, end}
          hops: [{kind: "pub" | "deliver" | "ack" | "direct", id, text: "m3" | "ack m3", from: "P0" | "K" | "C1", to, t0, t1,
                  redo (a redelivery), lost (arrived at a consumer that was down)}]
          marks: [{t, kind: "queued" | "deleted" | "crash" | "noack" | "up" | "lost" | "got" | "acked", id, c}]
          snaps: [{t, queue: [{id, text, status: "wait" | "out" | "redo", holds: [c...], by: [c...], redo (was redelivered)}],
                   cons: [{name, up, cur: [ids sent to it, not acked], work: [ids that have ARRIVED and are being processed],
                           got: [ids arrived, in order], done: [ids processed, in order], lost: [ids lost]}]}]
        D8.at(log, t) -> {s: the snapshot in force at t, fly: [{...hop, f: 0..1}] the packets in the air}
        D8.firstMark(log, kind, id?, c?) -> the time of the first such mark (asserts and scene timing)
      THE STORIES (local scene seconds; they are scripted, simulated and asserted at the top of common-3.js):
        D8.OFFLINE = {direct, broker}: producer -> consumers A and B; B is offline from 2.4 to 6.4; m1 at 0.8, m2 at 3.2, m3 at 3.8,
            m4 at 8.2.  direct: B got [m1, m4], lost [m2, m3];  broker (fan-out, no acks): B got [m1, m2, m3, m4], queue empty at end
        D8.SHARE = {lb, fan}: Producer 1 sends m1 and m3, Producer 2 sends m2 and m4 (0.8, 1.4, 2.0, 2.6 for lb; the same + 5.6 for
            fan); consumers "Consumer 1", "Consumer 2", round robin starts at Consumer 2.  lb: C1 got [m2, m4], C2 [m1, m3],
            4 deliveries;  fan: both got [m1..m4], 8 deliveries.  D8.SHARE.offset = 5.6
        D8.ACKS: one producer, "Consumer 1", "Consumer 2", one message at a time, round robin from Consumer 2 (the lesson's story):
            m1 -> C2, m2 -> C1, both ack, m3 -> C2, m4 -> C1, C2 crashes on m3 (at 5.6, noticed 6.4), C1 acks m4, m3 is redelivered
            to C1, C1 acks it, m5 -> C1.  C1 done [m2, m4, m3, m5] (m3 after m4: the order changed), C2 done [m1].
            D8.ACKS.times = {crash, noticed, redeliver (m3 leaves the broker again), m3done, end}
   SMALL TOOLS.  D8.same / D8.close (from D4: throw when a value differs), D8.rng (mulberry32 from D4), D8.range(a, b). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  if (!D4 || !D4.same) throw new Error("videos/d8/common.js needs videos/d4/common.js loaded first");
  const D8 = (V.d8 = V.d8 || {});
  const same = (D8.same = D4.same);
  D8.close = D4.close;
  D8.rng = D4.rng;
  D8.range = D4.range;
  D8.fmtN = (n) => n.toLocaleString("en-GB");

  // ---------- 1. batch ----------
  const files = [4000, 2500, 3500];
  const cum = files.map((_, i) => files.slice(0, i + 1).reduce((a, b) => a + b, 0));
  D8.BATCH = { files, cum, total: cum[cum.length - 1], output: "views per page" };
  same(
    "batch: three files add up to 10,000 lines",
    [D8.BATCH.cum, D8.fmtN(D8.BATCH.total)],
    [[4000, 6500, 10000], "10,000"],
  );

  const WORDS = [
    ["mo_17", "posts"],
    ["ana", "likes"],
    ["raj", "shares"],
    ["li", "posts"],
    ["sam", "likes"],
    ["eve", "replies"],
  ];
  const pad = (x) => String(x).padStart(2, "0");
  D8.FEED = (n) => {
    const m = 9 * 60 + 7 * n;
    const [who, what] = WORDS[n % WORDS.length];
    const time = `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
    return { n, time, who, what, text: `${time} ${who} ${what}` };
  };
  same(
    "feed: the first posts match the lesson's ticker",
    [1, 2, 6, 9].map((n) => D8.FEED(n).text),
    ["09:07 ana likes", "09:14 raj shares", "09:42 mo_17 posts", "10:03 li posts"],
  );

  // ---------- 2. the day of posts ----------
  const POSTS = [0.4, 1.7, 3.2, 4.9, 6.3, 8.8, 11.1, 12.6, 14.2, 17.5, 19.9, 22.3];
  D8.fmtH = (h) => {
    const m = Math.round(h * 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`;
  };
  D8.doneAt = (t, W) => (W ? Math.ceil(t / W - 1e-9) * W : t);
  D8.postState = (t, W, now) => (t > now ? "none" : D8.doneAt(t, W) <= now + 1e-9 ? "done" : "waiting");
  D8.processed = (W, now) => POSTS.filter((t) => D8.postState(t, W, now) === "done").length;
  const win = (W, name) => {
    const waits = POSTS.map((t) => D8.doneAt(t, W) - t);
    const worst = Math.round(Math.max(...waits) * 10) / 10;
    return {
      W,
      name,
      runs: W ? D8.range(1, 24 / W).map((i) => i * W) : [],
      worst,
      worstText: D8.fmtH(Math.max(...waits)),
    };
  };
  D8.DAY = {
    posts: POSTS,
    windows: [win(24, "Daily"), win(6, "Every 6 hours"), win(1, "Hourly"), win(0, "Stream")],
  };
  same(
    "day: worst waits for daily, 6-hourly, hourly and streaming",
    D8.DAY.windows.map((w) => [w.worstText, w.runs.length]),
    [
      ["23 h 36 min", 1],
      ["5 h 42 min", 4],
      ["54 min", 24],
      ["0 min", 0],
    ],
  );
  same(
    "day: at 13:00 the 6-hourly runs have processed 7 of 12, the stream 8",
    [D8.processed(6, 13), D8.processed(0, 13), D8.processed(24, 23.9)],
    [7, 8, 0],
  );

  // ---------- 3. the event ----------
  const ENC = {
    json: '{"user":"mo_17","action":"like","post":4821,"time":"2026-03-04T09:15:02Z"}',
    text: "2026-03-04T09:15:02Z mo_17 like 4821",
  };
  D8.EVENT = {
    user: "mo_17",
    action: "like",
    post: 4821,
    time: "09:15:02",
    undo: { user: "mo_17", action: "unlike", post: 4821, time: "09:20:41" },
    bytes: { json: ENC.json.length, text: ENC.text.length, binary: 13 },
  };
  same("event: encodings of the like", D8.EVENT.bytes, { json: 74, text: 36, binary: 13 });

  // ---------- 4. polling ----------
  D8.POLL = (() => {
    const every = 5;
    const r = D8.rng(8);
    const events = D8.range(1, 12)
      .map(() => Math.floor(r() * 3600))
      .sort((a, b) => a - b);
    const checks = 3600 / every;
    return {
      every,
      perHour: events.length,
      checks,
      empty: checks - events.length,
      wait: every / 2,
      events,
      consumers: ["Notify the author", "Count likes", "Rank the feed"],
    };
  })();
  D8.pollAt = (f) => {
    const checks = Math.floor(D8.POLL.checks * Math.min(1, Math.max(0, f)));
    const last = checks * D8.POLL.every;
    const found = D8.POLL.events.filter((s) => s < last).length;
    return { checks, found, empty: checks - found };
  };
  same(
    "poll: every 5 s is 720 checks an hour, 12 events, 708 empty, 2.5 s average wait",
    [D8.POLL.checks, D8.POLL.perHour, D8.POLL.empty, D8.POLL.wait, D8.pollAt(1)],
    [720, 12, 708, 2.5, { checks: 720, found: 12, empty: 708 }],
  );

  // ---------- 5. a producer that is too fast ----------
  D8.flood = (p, c, pol, secs, cap = 10) => {
    let q = 0;
    let sent = 0;
    let done = 0;
    let drop = 0;
    let held = 0;
    const hist = [];
    for (let s = 1; s <= secs; s++) {
      let acc = p;
      if (pol === "drop") {
        acc = Math.min(p, cap - q);
        drop += p - acc;
        sent += p;
      } else if (pol === "back") {
        acc = Math.min(p, cap - q);
        held += p - acc;
        sent += acc;
      } else sent += p;
      q += acc;
      const k = Math.min(c, q);
      done += k;
      q -= k;
      hist.push({ s, q, sent, done, drop, held, acc });
    }
    return hist;
  };
  D8.FLOOD = (() => {
    const p = 6;
    const c = 4;
    const secs = 10;
    const cap = 10;
    const hist = {};
    const steps = {};
    ["buffer", "drop", "back"].forEach((pol) => {
      hist[pol] = D8.flood(p, c, pol, secs, cap);
      steps[pol] = hist[pol].map((h, i) => {
        const before = i ? hist[pol][i - 1].q : 0;
        return {
          s: h.s,
          before,
          arrive: h.acc,
          refused: p - h.acc,
          peak: before + h.acc,
          out: before + h.acc - h.q,
          after: h.q,
        };
      });
    });
    const last = (pol) => hist[pol][secs - 1];
    return {
      p,
      c,
      secs,
      cap,
      hist,
      steps,
      end: {
        buffer: { q: last("buffer").q, sent: last("buffer").sent, done: last("buffer").done },
        drop: { q: last("drop").q, drop: last("drop").drop, done: last("drop").done },
        back: { q: last("back").q, sent: last("back").sent, held: last("back").held },
      },
    };
  })();
  same(
    "flood: 6/s against 4/s for 10 s: buffer 20 waiting, drop 14 thrown away, backpressure sends 46 of 60",
    D8.FLOOD.end,
    {
      buffer: { q: 20, sent: 60, done: 40 },
      drop: { q: 6, drop: 14, done: 40 },
      back: { q: 6, sent: 46, held: 14 },
    },
  );
  same("flood: the drop queue first overflows in second 4", D8.FLOOD.steps.drop.findIndex((x) => x.refused > 0) + 1, 4);

  // ---------- 6. a broker crash: memory against disk ----------
  D8.CRASH = (() => {
    const run = (disk) => {
      const consumer = ["m1", "m2"];
      const memory = ["m3", "m4"];
      const onDisk = disk ? [...memory] : [];
      const afterRestart = [...onDisk]; // memory is wiped by the crash; the restart reloads the disk
      return {
        afterRestart,
        consumer: [...consumer, ...afterRestart],
        lost: memory.filter((m) => !afterRestart.includes(m)),
      };
    };
    return { delivered: ["m1", "m2"], waiting: ["m3", "m4"], memory: run(false), disk: run(true) };
  })();
  same(
    "crash: memory only loses m3 and m4, disk keeps them",
    [D8.CRASH.memory.lost, D8.CRASH.disk.consumer],
    [
      ["m3", "m4"],
      ["m1", "m2", "m3", "m4"],
    ],
  );

  // ---------- 7. the broker simulation ----------
  const clone = (x) => JSON.parse(JSON.stringify(x));
  D8.sim = (o) => {
    const mode = o.mode || "lb";
    if (!["lb", "fan", "direct"].includes(mode)) throw new Error(`VID.d8.sim: unknown mode "${mode}"`);
    const TR = o.travel ?? 0.6;
    const DET = o.detect ?? 0.8;
    const GAP = o.gap ?? 0.3;
    const hold = o.hold ?? 1;
    const autoAck = !!o.autoAck;
    const producers = o.producers || ["Producer"];
    const cons = o.consumers.map((name, i) => ({ name, i, up: true, cur: [], got: [], done: [], lost: [] }));
    const N = cons.length;
    let rr = o.rr0 || 0;
    let next = 1;
    let seq = 0;
    const queue = [];
    const hops = [];
    const marks = [];
    const snaps = [];
    const evq = [];
    const wireFree = {};
    const r6 = (x) => Math.round(x * 1e6) / 1e6;
    const push = (t, type, data) => evq.push({ t: r6(t), type, data, seq: seq++ });
    (o.script || []).forEach(([t, op, who]) => push(t, op, who));
    const hop = (t, kind, id, from, to, extra = {}) => {
      const key = `${from}>${to}`;
      const t0 = r6(Math.max(t, wireFree[key] ?? -1));
      wireFree[key] = t0 + GAP;
      const h = { kind, id, text: kind === "ack" ? `ack m${id}` : `m${id}`, from, to, t0, t1: r6(t0 + TR), ...extra };
      hops.push(h);
      return h;
    };
    const free = (c) => c.up && c.cur.length < hold;
    const complete = (m) => (mode === "lb" ? m.by.length >= 1 : m.by.length === N);
    const send = (t, m, c) => {
      m.holds.push(c.i);
      c.cur.push(m.id);
      const h = hop(t, "deliver", m.id, "K", `C${c.i}`, { redo: m.redo });
      push(h.t1, "atC", { id: m.id, c: c.i, h });
    };
    const finish = (t, m, c) => {
      m.holds = m.holds.filter((x) => x !== c);
      m.by.push(c);
      if (complete(m)) {
        queue.splice(queue.indexOf(m), 1);
        marks.push({ t, kind: "deleted", id: m.id });
      }
    };
    const deliver = (t) => {
      if (mode === "lb")
        for (;;) {
          const m = queue.find((x) => !x.holds.length && !x.by.length);
          const c = D8.range(0, N - 1)
            .map((k) => cons[(rr + k) % N])
            .find(free);
          if (!m || !c) break;
          rr = (c.i + 1) % N;
          send(t, m, c);
        }
      else
        cons.forEach((c) => {
          while (free(c)) {
            const m = queue.find((x) => !x.by.includes(c.i) && !x.holds.includes(c.i));
            if (!m) break;
            send(t, m, c);
          }
        });
    };
    const on = {
      pub(t, p = 0) {
        const id = next++;
        if (mode === "direct")
          cons.forEach((c) => {
            const h = hop(t + 0.2 * c.i, "direct", id, `P${p}`, `C${c.i}`);
            push(h.t1, "atC", { id, c: c.i, h, direct: true });
          });
        else {
          const h = hop(t, "pub", id, `P${p}`, "K");
          push(h.t1, "atK", { id });
        }
      },
      atK(t, { id }) {
        queue.push({ id, text: `m${id}`, by: [], holds: [], redo: false });
        marks.push({ t, kind: "queued", id });
        deliver(t);
      },
      atC(t, { id, c, h, direct }) {
        const C = cons[c];
        if (!C.up) {
          h.lost = true;
          C.lost.push(id);
          marks.push({ t, kind: "lost", id, c });
          return;
        }
        C.got.push(id);
        marks.push({ t, kind: "got", id, c });
        if (direct) C.done.push(id);
        else if (autoAck) {
          C.cur = C.cur.filter((x) => x !== id);
          C.done.push(id);
          finish(
            t,
            queue.find((m) => m.id === id),
            c,
          );
          deliver(t);
        }
      },
      ack(t, c) {
        const C = cons[c];
        const id = C.cur.find((x) => C.got.includes(x));
        if (id == null) throw new Error(`VID.d8.sim: ${C.name} has nothing to ack at ${t}`);
        C.cur = C.cur.filter((x) => x !== id);
        C.done.push(id);
        const h = hop(t, "ack", id, `C${c}`, "K");
        push(h.t1, "ackK", { id, c });
      },
      ackK(t, { id, c }) {
        const m = queue.find((x) => x.id === id);
        if (m) finish(t, m, c);
        marks.push({ t, kind: "acked", id, c });
        deliver(t);
      },
      crash(t, c) {
        cons[c].up = false;
        marks.push({ t, kind: "crash", c });
        push(t + DET, "detect", c);
      },
      detect(t, c) {
        queue
          .filter((m) => m.holds.includes(c))
          .forEach((m) => {
            m.holds = m.holds.filter((x) => x !== c);
            m.redo = true;
            marks.push({ t, kind: "noack", id: m.id, c });
          });
        cons[c].cur = [];
        deliver(t);
      },
      up(t, c) {
        cons[c].up = true;
        marks.push({ t, kind: "up", c });
        deliver(t);
      },
    };
    const snap = (t) =>
      snaps.push({
        t,
        queue: queue.map((m) => ({
          id: m.id,
          text: m.text,
          status: m.holds.length ? "out" : m.redo ? "redo" : "wait",
          holds: [...m.holds],
          by: [...m.by],
          redo: m.redo,
        })),
        cons: cons.map((c) => ({ ...clone(c), work: c.cur.filter((x) => c.got.includes(x)) })),
      });
    snap(0);
    while (evq.length) {
      evq.sort((a, b) => a.t - b.t || a.seq - b.seq);
      const e = evq.shift();
      if (!on[e.type]) throw new Error(`VID.d8.sim: unknown step "${e.type}"`);
      on[e.type](e.t, e.data);
      snap(e.t);
    }
    return {
      o,
      names: { producers, consumers: o.consumers },
      hops,
      marks,
      snaps,
      end: snaps[snaps.length - 1],
    };
  };
  D8.at = (log, t) => {
    let s = log.snaps[0];
    for (const x of log.snaps) {
      if (x.t <= t) s = x;
      else break;
    }
    const fly = log.hops.filter((h) => h.t0 <= t && t < h.t1).map((h) => ({ ...h, f: (t - h.t0) / (h.t1 - h.t0) }));
    return { s, fly };
  };
  D8.firstMark = (log, kind, id, c) => {
    const m = log.marks.find((x) => x.kind === kind && (id == null || x.id === id) && (c == null || x.c === c));
    if (!m) throw new Error(`VID.d8.firstMark: no "${kind}" mark for ${id} ${c}`);
    return m.t;
  };
})();
