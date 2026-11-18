/* Data Science Lecture 8, part 2: ds8-brokers (8.3, messaging systems: push to consumers, fast producers (drop, buffer,
   backpressure), crashes) and the figures for ds8-middle (8.4, in ds-l8-05.js: direct messaging, brokers, topics). */
(function () {
  const S = NIC.shared.ds8;
  const { reg, mc, pr, st, P, maths, seg, log, svg, tx, box2, dot, chip, tape, laneRun } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS;

  /** Producer p/s, consumer c/s, for secs seconds. Policies: buffer (unbounded queue), drop (queue of cap, extra is
   *  thrown away), back (backpressure: the producer may only send what fits). Arrivals first, then the consumer. */
  function flood(p, c, pol, secs, cap = 10) {
    let q = 0,
      sent = 0,
      done = 0,
      drop = 0,
      held = 0;
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
  }
  S.flood = flood;

  /* ---------- figures ---------- */
  const pubsubFig = (() => {
    const pin = [50, 130],
      cy = [20, 80, 140];
    const inP = pin.map((y) => `M140 ${y + 20}C180 ${y + 20} 190 90 230 90`);
    const out = cy.map((y) => `M350 90C390 90 400 ${y + 20} 430 ${y + 20}`);
    return svg(
      560,
      190,
      `${pin.map((y, i) => box2(10, y, 130, 40, "blue", `Producer ${i + 1}`)).join("")}${box2(230, 60, 120, 60, "violet", "Messaging", "system")}
      ${cy.map((y, i) => box2(430, y, 120, 40, "teal", `Consumer ${i + 1}`)).join("")}
      ${[...inP, ...out].map((d) => `<path d="${d}" fill="none" stroke="var(--line-2)" stroke-width="2"/>`).join("")}
      ${inP.map((d, i) => dot(d, "blue", i * 0.9, 1.6)).join("")}${out.map((d, i) => dot(d, "teal", 0.8 + i * 0.2, 1.6)).join("")}
      ${tx(290, 184, "the system pushes each message out: nobody has to ask", { s: 11, c: "var(--text-dim)" })}`,
      "Two producers send messages to a messaging system, which pushes them to three consumers",
    );
  })();

  /** Step 2: three answers to a fast producer, after 10 seconds. */
  function choicesFig(box) {
    let p = 6,
      c = 4;
    const sp = N.slider("Producer", 1, 9, 1, p, (v) => `${v}/s`),
      sc = N.slider("Consumer", 1, 9, 1, c, (v) => `${v}/s`);
    box.innerHTML = `<div class="controls"></div><div class="ds8-grid" data-g></div><div class="ds8-note" data-c></div>`;
    box.firstChild.append(sp, sc);
    const draw = () => {
      const [b, d, k] = ["buffer", "drop", "back"].map((x) => flood(p, c, x, 10).pop());
      qs("[data-g]", box).innerHTML = [
        ["Buffer", "blue", `<b>${b.q}</b> waiting in the queue`, `memory keeps growing`],
        ["Drop", "rose", `<b>${d.drop}</b> messages thrown away`, `queue capped at 10`],
        ["Backpressure", "amber", `producer sent <b>${k.sent}</b> of ${p * 10}`, `it was told to wait`],
      ]
        .map(
          ([t, col, a, s]) =>
            `<div class="ds8-card" style="border-color:var(--${col})"><h4>${t}</h4><div class="ds8-ln">${a}</div><div class="ds8-ln faint">${s}</div></div>`,
        )
        .join("");
      qs("[data-c]", box).innerHTML =
        p > c
          ? `${p * 10} messages in 10 s, but the consumer handles only ${c * 10}. The extra ${(p - c) * 10} must go somewhere.`
          : "The consumer keeps up: nothing waits, nothing is dropped, nobody is held back.";
    };
    sp.onInput((v) => ((p = v), draw()));
    sc.onInput((v) => ((c = v), draw()));
    draw();
  }

  /** Step 3: the broker crashes with messages in memory, then with messages on disk. */
  const crashRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["P", "Producer"],
        ["M", "Broker memory"],
        ["D", "Broker disk"],
        ["C", "Consumer"],
      ],
      () => {
        const t = tape(["P", "M", "D", "C"]);
        [false, true].forEach((disk) => {
          Object.keys(t.L).forEach((k) => (t.L[k] = []));
          t.off([]);
          t.L.C = ["m1:teal", "m2:teal"];
          t.snap(`<b>${disk ? "Written to disk" : "Memory only"}</b>: m1 and m2 are delivered.`);
          t.L.P = ["m3", "m4"];
          t.L.M = ["m3:blue", "m4:blue"];
          if (disk) t.L.D = ["m3:violet", "m4:violet"];
          t.snap(
            disk
              ? "m3 and m4 arrive. The broker keeps them in memory <b>and writes them to disk</b>."
              : "m3 and m4 arrive while the consumer is busy. The broker keeps them <b>in memory</b>.",
          );
          t.L.M = [];
          t.off(["M"]);
          t.snap("The broker crashes. Everything in memory is gone.");
          t.off([]);
          if (disk) {
            t.L.M = ["m3:blue", "m4:blue"];
            t.snap("It restarts and reloads m3 and m4 from disk.");
            t.L.M = [];
            t.L.D = [];
            t.L.C = ["m1:teal", "m2:teal", "m3:teal", "m4:teal"];
            t.snap("Both are delivered: <b>nothing was lost</b>. The price: a disk write for every message.");
          } else {
            t.L.C = ["m1:teal", "m2:teal", "m3:rose:gone", "m4:rose:gone"];
            t.snap("It restarts with an empty queue: <b>m3 and m4 are lost</b>.");
          }
        });
        return t.out;
      },
    );

  /** Steps 4 and 5: consumer B goes offline while m2 and m3 are sent, directly or through a broker. */
  const offlineRun = (viaBroker) => (box, life) =>
    laneRun(
      box,
      life,
      [["P", "Producer"], ...(viaBroker ? [["K", "Broker"]] : []), ["A", "Consumer A"], ["B", "Consumer B"]],
      () => {
        const t = tape(["P", "K", "A", "B"]);
        t.L.P = ["m1"];
        t.L.A = ["m1:teal"];
        t.L.B = ["m1:teal"];
        t.snap(viaBroker ? "m1 goes to the broker, which passes it to A and B." : "m1 is sent straight to A and B.");
        t.off(["B"]);
        t.snap("Consumer B goes offline (a restart, a crash, a lost network link).");
        t.L.P = ["m1", "m2", "m3"];
        t.L.A = ["m1:teal", "m2:teal", "m3:teal"];
        if (viaBroker) {
          t.L.K = ["m2 for B:amber", "m3 for B:amber"];
          t.snap("m2 and m3 are sent. A gets them; the <b>broker keeps a copy for B</b>.");
        } else {
          t.L.B = ["m1:teal", "m2:rose:gone", "m3:rose:gone"];
          t.snap("m2 and m3 are sent. A gets them; <b>nobody is listening at B</b>, so B's copies vanish.");
        }
        t.off([]);
        if (viaBroker) {
          t.L.K = [];
          t.L.B = ["m1:teal", "m2:teal", "m3:teal"];
          t.snap("B reconnects and the broker hands over <b>m2 and m3</b>.");
        } else t.snap("B comes back. Nothing is waiting for it: the producer has moved on.");
        t.L.P = ["m1", "m2", "m3", "m4"];
        t.L.A = [...t.L.A, "m4:teal"];
        t.L.B = [...t.L.B, "m4:teal"];
        t.snap(
          viaBroker
            ? "m4 arrives for both. B has everything: the broker <b>tolerates clients that come and go</b>."
            : "m4 reaches both. B ends with m1 and m4 only: <b>m2 and m3 are lost</b> for B.",
        );
        return t.out;
      },
    );

  /** Step 6: a database keeps rows after they are read; a broker deletes messages once delivered. */
  const dbRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["DB", "Database"],
        ["R", "Reader"],
        ["Q", "Broker queue"],
        ["C", "Consumer"],
      ],
      () => {
        const t = tape(["DB", "R", "Q", "C"]);
        t.L.DB = ["row 1", "row 2", "row 3"];
        t.L.Q = ["m1:blue", "m2:blue", "m3:blue"];
        t.snap("Three rows in a database, three messages in a broker.");
        [1, 2, 3].forEach((i) => {
          t.L.DB[i - 1] = `row ${i}:teal`;
          t.L.R = [...t.L.R, `row ${i}`];
          t.L.Q = t.L.Q.slice(1);
          t.L.C = [...t.L.C, `m${i}:teal`];
          t.snap(`Item ${i} is read and delivered.`);
        });
        t.snap(
          "The rows are still there until someone deletes them, and can be searched later. The queue is empty: the broker <b>deleted each message once it was delivered</b>.",
        );
        return t.out;
      },
    );

  /** Step 7: subscribe to a subset of topics. */
  const MSGS = [
    ["weather", "rain from 4 pm"],
    ["football", "goal, 1-0"],
    ["traffic", "A30 closed"],
    ["football", "red card"],
    ["weather", "storm warning"],
    ["football", "full time 2-1"],
    ["traffic", "delays cleared"],
    ["weather", "sunny tomorrow"],
  ];
  function topicFig(box) {
    const on = new Set(["weather", "traffic"]);
    box.innerHTML = `<div class="ds8-tags" data-t></div><div class="ds8-track" data-m></div><div class="ds8-note" data-c></div>`;
    const draw = () => {
      qs("[data-t]", box).innerHTML = ["football", "weather", "traffic"]
        .map(
          (k) =>
            `<button class="ds8-tag ${on.has(k) ? "on" : ""}" data-k="${k}" aria-pressed="${on.has(k)}">#${k}</button>`,
        )
        .join("");
      qs("[data-m]", box).innerHTML = MSGS.map(([k, m]) =>
        chip(`#${k} ${m}:${on.has(k) ? "teal" : ""}:${on.has(k) ? "" : "gone"}`),
      ).join("");
      const got = MSGS.filter(([k]) => on.has(k)).length;
      qs("[data-c]", box).innerHTML =
        `Subscribed to ${on.size} topic${on.size === 1 ? "" : "s"}: you receive <b>${got} of ${MSGS.length}</b> messages.`;
      box.querySelectorAll("[data-k]").forEach(
        (b) =>
          (b.onclick = () => {
            on.has(b.dataset.k) ? on.delete(b.dataset.k) : on.add(b.dataset.k);
            draw();
          }),
      );
    };
    draw();
  }

  S.choicesFig = choicesFig;

  /* ---------- 8.2 demo: a fast producer, second by second ---------- */
  function floodPanel(box, life) {
    let p = 6,
      c = 4,
      pol = "buffer",
      s = 0,
      stop = null;
    const sp = N.slider("Producer", 1, 9, 1, p, (v) => `${v}/s`),
      sc = N.slider("Consumer", 1, 9, 1, c, (v) => `${v}/s`);
    box.innerHTML = `<div class="controls" data-s></div><div class="controls" data-r></div>
      <div class="ds8-card"><h4>Queue at the broker <small data-q></small></h4><div class="ds8-slots" data-l></div></div>
      <div class="controls"><button class="btn primary" data-p>Play 10 seconds</button><button class="btn" data-n>+1 second</button><button class="btn ghost" data-z>Reset</button></div>
      <div class="stat-row"><div class="stat blue"><small>Sent</small><b data-a></b></div><div class="stat teal"><small>Processed</small><b data-b></b></div><div class="stat amber"><small>Waiting</small><b data-w></b></div><div class="stat rose"><small>Dropped</small><b data-d></b></div></div><div data-g></div>`;
    qs("[data-r]", box).append(sp, sc);
    const halt = () => {
      if (stop) stop();
      stop = null;
    };
    const draw = () => {
      const h = s ? flood(p, c, pol, s)[s - 1] : { q: 0, sent: 0, done: 0, drop: 0, held: 0, acc: 0 };
      const slots = Math.max(10, h.q);
      qs("[data-l]", box).innerHTML = Array.from(
        { length: Math.min(slots, 40) },
        (_, i) => `<span class="ds8-slot ${i < h.q ? (i >= 10 ? "over" : "on") : ""}"></span>`,
      ).join("");
      qs("[data-q]", box).textContent = pol === "buffer" ? `${h.q} waiting, no limit` : `${h.q} of 10`;
      [
        ["a", h.sent],
        ["b", h.done],
        ["w", h.q],
        ["d", h.drop],
      ].forEach(([k, v]) => (qs(`[data-${k}]`, box).textContent = v));
      const say = !s
        ? [["", `Second 0. The producer wants to send ${p} a second; the consumer handles ${c} a second.`]]
        : [
            [
              h.drop ? "no" : h.held ? "warn" : "ok",
              `After ${s} s: ${h.sent} sent, ${h.done} processed, ${h.q} waiting${pol === "drop" ? `, ${h.drop} dropped` : ""}${pol === "back" ? `. Backpressure made the producer hold back ${h.held} messages` : ""}.`,
            ],
          ];
      log(qs("[data-g]", box), say);
    };
    const reset = () => (halt(), (s = 0), draw());
    seg(qs("[data-s]", box), "buffer:Buffer|drop:Drop|back:Backpressure", "buffer", (v) => ((pol = v), reset()));
    sp.onInput((v) => ((p = v), reset()));
    sc.onInput((v) => ((c = v), reset()));
    qs("[data-n]", box).onclick = () => (halt(), (s = Math.min(s + 1, 30)), draw());
    qs("[data-z]", box).onclick = reset;
    qs("[data-p]", box).onclick = () => {
      halt();
      s = 0;
      draw();
      stop = life.interval(() => {
        s++;
        draw();
        if (s >= 10) halt();
      }, 450);
    };
    draw();
  }

  Object.assign(S, { offlineRun, dbRun, topicFig });

  /* ============ 8.3 Push, don't poll ============ */
  reg({
    id: "ds8-brokers",
    order: 3,
    num: "8.3",
    title: "Push, don't poll",
    blurb: "A messaging system delivers events for you. But what if producers are too fast, or something crashes?",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>A producer that is too fast</h2><span class="tag">drop, buffer or push back</span></div><div></div></div>`,
      );
      root.appendChild(card);
      floodPanel(card.lastElementChild, life);
      root.appendChild(
        pr(
          "ds8-brokers-2",
          "You kept the producer faster than the consumer and chose <b>Backpressure</b>. What happened over the 10 seconds?",
          [
            "The producer was held back, and nothing was dropped",
            "Messages that did not fit in the queue were thrown away",
            "The queue grew past its limit of 10 messages",
          ],
          "Backpressure is flow control: when the queue is full the producer is told to wait, so it sends fewer messages and none are lost. Dropping is a different policy.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>messaging system</b> pushes events from producers to consumers: the <b>publish/subscribe</b> model.",
            "If producers are too fast, the system can <b>drop</b> messages, <b>buffer</b> them in a queue, or apply <b>backpressure</b> (flow control).",
            "If a node crashes, messages kept only in memory are lost; <b>writing them to disk</b> keeps them, at a cost.",
          ],
          "Push, don't poll, and decide what happens when things go too fast or fall over.",
        ),
      );
    },
  });

  L["ds8-brokers"] = {
    sum: "A <b>messaging system</b> pushes events from producers to consumers. It must handle fast producers (drop, buffer or backpressure) and crashes (memory against disk).",
    steps: [
      st(
        "A postie for events",
        P(
          "Instead of checking the doormat every few minutes, you let the postie push letters through the slot. A <b>messaging system</b> does that for events: a producer sends a message, and the system <b>pushes</b> it to the consumers. Several producers can send and several consumers can receive. This is the <b>publish/subscribe</b> model, and there are many ways to build it.",
        ),
        pubsubFig,
        mc(
          "In a publish/subscribe messaging system, how does a consumer find out about a new event?",
          [
            "The system pushes the message to it",
            "It reads a shared file every few seconds",
            "It asks the producer directly for news",
          ],
          "Publish/subscribe is push-based: the producer publishes and the system delivers to every subscriber, so there is no polling.",
        ),
      ),
      st(
        "When producers are too fast",
        P(
          "Picture a conveyor belt bringing cakes faster than you can box them. You can let some <b>drop</b> on the floor, <b>buffer</b> them on a growing pile, or shout “slow down!” to the baker: <b>backpressure</b>, also called flow control. A messaging system has the same three options when producers send faster than consumers can process. Move the sliders to compare them.",
        ) +
          maths(
            "<p>With a producer at $p$ messages a second and a consumer at $c$, an unbounded buffer grows by $p-c$ each second:</p>$$\\text{queue after } t \\text{ s} = (p-c)\\,t$$<p>For $p=6$, $c=4$, $t=10$: $2\\times 10=20$. Dropping caps the queue and throws away about $p-c$ a second once it is full; backpressure caps it by slowing the producer to about $c$.</p>",
          ),
        (box) => choicesFig(box),
        {
          type: "cat",
          q: "Which approach to a fast producer is each system using?",
          buckets: ["Drop", "Buffer", "Backpressure"],
          items: [
            ["A live video feed skips frames it cannot show in time", 0],
            ["Orders pile up in a queue and wait their turn", 1],
            ["The sender is blocked until the receiver has room", 2],
            ["Old sensor readings are discarded when the queue is full", 0],
            ["A print queue grows while the printer works through it", 1],
          ],
          why: "Dropping throws messages away, buffering stores them in a queue that grows, and backpressure slows the producer down.",
        },
      ),
      st(
        "When something crashes",
        P(
          "A note in your head is gone if you faint; a note on paper survives. Same for a messaging node that <b>crashes</b>. Messages held only <b>in memory</b> are wiped. Messages also <b>written to disk</b> can be reloaded after a restart. Disk is slower, so it's a trade-off between speed and safety. Step through both cases.",
        ),
        (box, life) => crashRun(box, life),
      ),
    ],
    guide: [
      "Leave the <b>Producer</b> faster than the <b>Consumer</b>, choose <b>Buffer</b> and press <b>Play 10 seconds</b>.",
      "Choose <b>Drop</b>, then <b>Backpressure</b>, and press <b>Play 10 seconds</b> again. Compare <b>Waiting</b> and <b>Dropped</b>.",
      "Press <b>+1 second</b> a few times to watch the queue fill, then answer the question after the demo.",
    ],
  };
})();
