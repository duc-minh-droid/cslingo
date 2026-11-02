/* Data Science Lecture 8 workshop (8.W), plus the broker simulation and panel that the 8.3 demo also uses: run a message
   broker with three consumers. Publish, acknowledge, crash and
   restart consumers, switch between load balancing and fan-out, and fill the queue under each overflow policy.
   No code, no typing. */
(function () {
  const S = NIC.shared.ds8;
  const { reg, mc, pr, st, P, tape, laneRun, choicesFig, seg, log } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS;

  /* ---------- the broker simulation: one producer, a broker, three consumers that each hold one message at a time ---------- */
  const CN = ["C1", "C2", "C3"];
  function makeBroker(cap = Infinity) {
    const s = { mode: "lb", pol: "buffer", cap };
    s.reset = (mode = s.mode) => {
      Object.assign(s, { mode, next: 1, msgs: [], rr: 0, dropped: 0, blocked: 0, sent: 0, finished: 0 });
      s.cons = CN.map((name, i) => ({ name, i, up: true, cur: null, acked: [] }));
    };
    s.reset();
    const open = (m, i) => !m.by.includes(i) && !m.holds.includes(i);
    const complete = (m) => (s.mode === "lb" ? m.by.length >= 1 : m.by.length === CN.length);
    /** Hand waiting messages to idle consumers: round robin for load balancing, every consumer for fan-out. */
    s.deliver = () => {
      const out = [];
      if (s.mode === "lb") {
        for (;;) {
          const m = s.msgs.find((x) => !x.holds.length && !x.by.length);
          const c = [0, 1, 2].map((k) => s.cons[(s.rr + k) % 3]).find((x) => x.up && !x.cur);
          if (!m || !c) break;
          m.holds.push(c.i);
          c.cur = m.id;
          s.rr = c.i + 1;
          out.push([m, c]);
        }
      } else
        s.cons.forEach((c) => {
          const m = c.up && !c.cur && s.msgs.find((x) => open(x, c.i));
          if (m) {
            m.holds.push(c.i);
            c.cur = m.id;
            out.push([m, c]);
          }
        });
      return out;
    };
    s.publish = () => {
      if (s.msgs.length >= s.cap && s.pol !== "buffer") {
        if (s.pol === "drop") s.dropped++;
        else s.blocked++;
        return { t: s.pol === "drop" ? "drop" : "block", id: s.next };
      }
      const m = { id: s.next++, by: [], holds: [], prev: [], missed: s.cons.filter((c) => !c.up).map((c) => c.i) };
      s.msgs.push(m);
      s.sent++;
      return { t: "pub", m, got: s.deliver(), over: s.msgs.length > s.cap };
    };
    s.ack = (i) => {
      const c = s.cons[i],
        m = s.msgs.find((x) => x.id === c.cur);
      if (!m) return null;
      const late = c.acked.length > 0 && c.acked[c.acked.length - 1] > m.id;
      m.by.push(i);
      m.holds = m.holds.filter((x) => x !== i);
      c.acked.push(m.id);
      c.cur = null;
      const all = complete(m);
      if (all) {
        s.msgs = s.msgs.filter((x) => x !== m);
        s.finished++;
      }
      const redo = m.prev.length > 0 && !m.prev.includes(i);
      return { t: "ack", c: i, m, all, late, redo, missed: m.missed.includes(i), got: s.deliver() };
    };
    s.crash = (i) => {
      const c = s.cons[i],
        m = s.msgs.find((x) => x.id === c.cur);
      c.up = false;
      c.cur = null;
      if (m) {
        m.holds = m.holds.filter((x) => x !== i);
        m.prev.push(i);
      }
      return { t: "crash", c: i, m, got: s.deliver() };
    };
    s.restart = (i) => {
      s.cons[i].up = true;
      return { t: "up", c: i, got: s.deliver() };
    };
    return s;
  }

  /** The broker panel: Publish, a mode switch, an optional overflow policy (queue of 6), consumers with Ack and Crash. */
  function brokerPanel(box, opts = {}) {
    const s = makeBroker(opts.policy ? 6 : Infinity);
    let say = [["", "Press <b>Publish</b> to send a message to the broker."]];
    box.innerHTML = `<div class="controls" data-s></div>${opts.policy ? '<div class="controls" data-o></div>' : ""}
      <div class="ds8-grid"><div class="ds8-card" data-pc><h4>Producer <small data-ps></small></h4><div class="controls"><button class="btn primary" data-pub>Publish</button><button class="btn ghost small" data-z>Reset</button></div></div>
      <div class="ds8-card" data-bc><h4>Broker <small data-bs></small></h4><div class="ds8-track" data-q></div></div></div>
      <div class="ds8-grid" data-c></div><div data-l></div>`;
    const $ = (q) => qs(q, box);
    const name = (i) => CN[i];
    const gotLine = (got) =>
      got
        .map(([m, c]) => `m${m.id} goes to ${c.name}${m.prev.length && s.mode === "lb" ? " (redelivered)" : ""}`)
        .join(", ");
    function draw() {
      $("[data-ps]").textContent =
        `${s.sent} published${opts.policy ? ` · ${s.dropped} dropped · ${s.blocked} refused` : ""}`;
      $("[data-pub]").textContent = `Publish m${s.next}`;
      $("[data-bs]").textContent = opts.policy
        ? `${s.msgs.length} of ${s.cap} in the queue${s.pol === "buffer" && s.msgs.length > s.cap ? ", buffering" : ""}`
        : `${s.msgs.length} not yet finished`;
      $("[data-bc]").classList.toggle("full", s.msgs.length >= s.cap);
      $("[data-q]").innerHTML = s.msgs.length
        ? s.msgs
            .map((m) => {
              const w = m.holds.map(name).join(", ");
              const tag =
                s.mode === "lb"
                  ? w
                    ? `with ${w}, no ack yet`
                    : "waiting"
                  : `acked by ${m.by.length} of 3${w ? `, with ${w}` : ""}`;
              return `<span class="ds8-chip ${m.holds.length ? "blue" : "amber"}">m${m.id} <small>${tag}</small></span>`;
            })
            .join("")
        : '<span class="ds8-empty">empty: every message has been acknowledged</span>';
      $("[data-c]").innerHTML = s.cons
        .map(
          (c) =>
            `<div class="ds8-card ${!c.up ? "down" : c.cur ? "busy" : ""}"><h4>${c.name}<small>${!c.up ? "crashed" : c.cur ? "working" : "idle"}</small></h4>
            <div class="ds8-ln">${c.cur ? `processing m${c.cur}` : !c.up ? "offline" : "waiting for a message"}</div>
            <div class="ds8-ln faint">acked: ${c.acked.length ? c.acked.map((x) => `m${x}`).join(", ") : "none"}</div>
            <div class="controls"><button class="btn small" data-a="${c.i}" ${c.cur ? "" : "disabled"}>Ack${c.cur ? ` m${c.cur}` : ""}</button><button class="btn small ${c.up ? "ghost" : ""}" data-k="${c.i}">${c.up ? "Crash" : "Restart"}</button></div></div>`,
        )
        .join("");
      box.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => act(s.ack(+b.dataset.a))));
      box
        .querySelectorAll("[data-k]")
        .forEach(
          (b) => (b.onclick = () => act(s.cons[+b.dataset.k].up ? s.crash(+b.dataset.k) : s.restart(+b.dataset.k))),
        );
      log($("[data-l]"), say);
    }
    function act(r) {
      if (!r) return;
      const g = r.got && r.got.length ? ` ${gotLine(r.got)}.` : "";
      if (r.t === "pub")
        say = [
          [
            r.over ? "warn" : "",
            `m${r.m.id} published.${g || " No consumer is free, so it waits at the broker."}${r.over ? " The queue is over its limit, so the broker keeps buffering." : ""}`,
          ],
        ];
      else if (r.t === "drop") say = [["no", `The queue is full: m${r.id} is <b>dropped</b>.`]];
      else if (r.t === "block")
        say = [["warn", `The queue is full: <b>backpressure</b>. The producer must wait before sending m${r.id}.`]];
      else if (r.t === "ack")
        say = [
          [
            "ok",
            `${name(r.c)} acknowledges m${r.m.id}${r.all ? ", so the broker deletes it" : ""}.${r.redo ? ` m${r.m.id} was redelivered after a crash.` : ""}${r.late ? ` Out of order: ${name(r.c)} finished a later message first.` : ""}${g}`,
          ],
        ];
      else if (r.t === "crash")
        say = [
          [
            "no",
            `${name(r.c)} crashes.${r.m ? ` It never acknowledged m${r.m.id}, so the broker will ${s.mode === "lb" ? "deliver it to another consumer" : `give it to ${name(r.c)} again later`}.` : ""}${g}`,
          ],
        ];
      else say = [["ok", `${name(r.c)} restarts.${g || " Nothing is waiting for it."}`]];
      draw();
      if (opts.onEvent) opts.onEvent(s, r);
    }
    seg($("[data-s]"), "lb:Load balancing|fan:Fan-out", "lb", (v) => {
      s.reset(v);
      say = [
        [
          "",
          v === "lb"
            ? "Load balancing: each message goes to one consumer."
            : "Fan-out: each message goes to every consumer.",
        ],
      ];
      draw();
    });
    if (opts.policy)
      seg($("[data-o]"), "buffer:Buffer|drop:Drop|back:Backpressure", "buffer", (v) => {
        s.pol = v;
        say = [
          [
            "",
            `When the queue of ${s.cap} is full: ${{ buffer: "keep buffering", drop: "drop new messages", back: "make the producer wait" }[v]}.`,
          ],
        ];
        draw();
      });
    $("[data-pub]").onclick = () => act(s.publish());
    $("[data-z]").onclick = () => {
      s.reset();
      say = [["", "Reset: an empty broker, all consumers up."]];
      draw();
    };
    draw();
    return s;
  }
  Object.assign(S, { makeBroker, brokerPanel });

  /** The broker sandbox. Missions are checked from the simulation state after every action. */
  function sandbox(stage, api) {
    const box = el(`<div class="wk-card"><h3>One producer, one broker, three consumers</h3><div></div></div>`);
    stage.appendChild(box);
    brokerPanel(box.lastElementChild, {
      policy: true,
      onEvent(s, r) {
        if (s.mode === "lb" && s.cons.filter((c) => c.acked.length >= 2).length >= 2 && api.done("share"))
          api.say(
            "Two consumers have each finished two messages. With <b>load balancing</b> every message went to exactly one of them: they shared the work.",
            "happy",
          );
        if (r.t === "ack" && s.mode === "fan" && r.all && api.done("fan"))
          api.say(
            `All three consumers acknowledged m${r.m.id}, and only then did the broker delete it. That is <b>fan-out</b>.`,
            "wink",
          );
        if (r.t === "ack" && s.mode === "fan" && r.missed && api.done("comeback"))
          api.say(
            `${s.cons[r.c].name} was down when m${r.m.id} was published, yet it still got it. The broker kept the message for a client that came back.`,
            "love",
          );
        if (r.t === "ack" && s.mode === "lb" && r.redo && api.done("redeliver"))
          api.say(
            `m${r.m.id} was never acknowledged by the consumer that crashed, so the broker <b>redelivered</b> it to another consumer. With load balancing, redelivery can change the processing order.`,
            "surprised",
          );
        if (r.t === "drop" || r.t === "block") {
          if (s.dropped > 0 && s.blocked > 0 && api.done("overflow"))
            api.say(
              "Same full queue, two answers: <b>Drop</b> lost a message, <b>Backpressure</b> made the producer wait. A buffer would just keep growing.",
              "think",
            );
          else
            api.say(
              r.t === "drop"
                ? "Dropped. Now choose <b>Backpressure</b> and publish again."
                : "Refused. Now choose <b>Drop</b> and publish again.",
              "idle",
            );
        }
      },
    });
  }

  /** Briefing figure: the life of one message, from publish to delete. */
  const lifeRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["P", "Producer"],
        ["K", "Broker"],
        ["C", "Consumer"],
      ],
      () => {
        const t = tape(["P", "K", "C"]);
        t.L.P = ["m1"];
        t.snap("The producer publishes m1.");
        t.L.K = ["m1 waiting:amber"];
        t.snap("The broker queues it.");
        t.L.K = ["m1 with C1, no ack:blue"];
        t.L.C = ["m1:blue"];
        t.snap("It is delivered to a consumer, but the broker keeps it until it hears back.");
        t.L.C = ["m1 ack:teal"];
        t.snap("The consumer finishes and sends an <b>ack</b>.");
        t.L.K = [];
        t.snap("Only now does the broker <b>delete</b> m1.");
        return t.out;
      },
    );

  reg({
    id: "ds8-lab",
    order: 90,
    workshop: true,
    num: "8.W",
    title: "Workshop: run a message broker",
    blurb: "No code. Publish messages, ack them, crash consumers and fill the queue to see what a broker does.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "You run the broker for a little shop: one producer of order messages and three consumers. Publish, acknowledge, crash things and see where every message ends up.",
        missions: [
          {
            id: "share",
            t: "Share the work",
            d: "In <b>Load balancing</b>, press <b>Publish</b> and the <b>Ack</b> buttons until two consumers have each acknowledged two messages.",
            hint: "Each Publish goes to one free consumer. Ack frees it for the next message.",
          },
          {
            id: "fan",
            t: "Broadcast one message",
            d: "Choose <b>Fan-out</b>, press <b>Publish</b>, then press <b>Ack</b> on all three consumers.",
            hint: "In fan-out every consumer gets its own copy, and the broker deletes it after all three acks.",
          },
          {
            id: "comeback",
            t: "Come back to your messages",
            d: "In <b>Fan-out</b>, press <b>Crash</b> on C3, press <b>Publish</b>, then <b>Restart</b> C3 and press its <b>Ack</b>.",
            hint: "The broker keeps the message for C3 while it is down.",
          },
          {
            id: "redeliver",
            t: "Force a redelivery",
            d: "In <b>Load balancing</b>, publish a message, press <b>Crash</b> on the consumer that holds it, then get it acknowledged by another consumer.",
            hint: "If every other consumer is busy, press Ack on one of them to free it.",
          },
          {
            id: "overflow",
            t: "Fill the queue",
            d: "The queue holds 6. Choose <b>Drop</b> and publish until a message is dropped, then choose <b>Backpressure</b> and publish until the producer is refused.",
            hint: "In Load balancing, 3 messages sit with consumers and 3 wait: the 7th finds the queue full.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds8-lab-1",
          "In <b>Fan-out</b>, C3 is crashed. You publish two messages and C1 and C2 acknowledge both. How many messages are still at the broker?",
          ["2", "0", "4"],
          "Fan-out deletes a message only after every subscriber has acknowledged it. C3 has acked neither, so both wait for it.",
        ),
      );
      root.appendChild(
        pr(
          "ds8-lab-2",
          "The queue of 6 is full and the policy is <b>Drop</b>. You press <b>Publish</b>. What happens to the new message?",
          [
            "It is thrown away and never reaches a consumer",
            "It waits at the producer until the queue has room",
            "It pushes the oldest waiting message out of the queue",
          ],
          "Drop discards the new message. Waiting at the producer is what backpressure does instead.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Load balancing</b> gives each message to one free consumer; <b>fan-out</b> gives every consumer its own copy.",
            "The broker deletes a message only after the <b>ack</b>: one ack for load balancing, one from every subscriber for fan-out.",
            "A consumer that crashes without acking causes a <b>redelivery</b>, which can change the processing order.",
            "A broker <b>keeps messages for a client that comes back</b>, unlike direct messaging.",
            "A full queue means a choice: <b>drop</b>, keep <b>buffering</b> or apply <b>backpressure</b>.",
          ],
          "Every message stays at the broker until someone says it is done.",
        ),
      );
    },
  });

  L["ds8-lab"] = {
    sum: "Run a broker with three consumers: load balancing against fan-out, acks and redelivery after a crash, a consumer coming back, and a full queue under drop and backpressure.",
    steps: [
      st(
        "What you will practise",
        P(
          "Every message follows the same path: published, queued at the broker, delivered to a consumer, <b>acknowledged</b>, deleted. Until the ack arrives the broker keeps it, so it can redeliver it if the consumer crashes.",
        ),
        (box, life) => lifeRun(box, life),
        mc(
          "A consumer has received m4 but has not acknowledged it yet. Where is m4?",
          [
            "Still at the broker, marked as delivered",
            "Deleted from the broker for good",
            "Back with the producer, waiting to be resent",
          ],
          "The broker deletes a message only after the ack, so it can redeliver it if the consumer crashes.",
        ),
      ),
      st(
        "When the queue is full",
        P(
          "Your broker's queue holds 6 messages. When it is full you choose what happens next: <b>buffer</b> (keep growing), <b>drop</b> new messages, or <b>backpressure</b> (make the producer wait). Try the three on a fast producer here.",
        ),
        (box) => choicesFig(box),
        mc(
          "Which policy never loses a message and never lets the queue grow past its limit?",
          ["Backpressure", "Drop new messages", "Keep on buffering"],
          "Backpressure slows the producer, so nothing is thrown away and the queue stays within its limit. Drop loses messages; buffering lets the queue grow.",
        ),
      ),
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
