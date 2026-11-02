/* Data Science Lecture 8, part 3: ds8-consumers (8.3, several consumers on one topic: load balancing, fan-out,
   acknowledgements, redelivery and reordering). The demo's broker panel lives in ds-l8-workshop.js (looked up at render time). */
(function () {
  const S = NIC.shared.ds8;
  const { reg, mc, pr, st, P, maths, seg, chip, tape, laneRun } = S;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS;

  /* ---------- 8.3 figures ---------- */
  const SEND = [
    [1, "P1"],
    [2, "P2"],
    [3, "P1"],
    [4, "P2"],
    [5, "P1"],
  ];
  const patternsRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["P1", "Producer 1"],
        ["P2", "Producer 2"],
        ["K", "Broker"],
        ["C1", "Consumer 1"],
        ["C2", "Consumer 2"],
      ],
      () => {
        const t = tape(["P1", "P2", "K", "C1", "C2"]);
        ["lb", "fan"].forEach((mode) => {
          Object.keys(t.L).forEach((k) => (t.L[k] = []));
          t.snap(
            mode === "lb"
              ? "<b>(a) Load balancing</b>: two producers, one topic, two consumers."
              : "<b>(b) Fan-out</b>: same messages, same consumers.",
          );
          SEND.forEach(([i, p]) => {
            t.L[p] = [...t.L[p], `m${i}`];
            t.L.K = [...t.L.K, `m${i}:violet`];
            if (i < 5) {
              if (mode === "lb") {
                const c = i % 2 ? "C2" : "C1";
                t.L[c] = [...t.L[c], `m${i}:teal`];
              } else ["C1", "C2"].forEach((c) => (t.L[c] = [...t.L[c], `m${i}:teal`]));
            }
            t.snap(
              i === 5
                ? "m5 has only just reached the broker."
                : mode === "lb"
                  ? `m${i} goes to <b>one</b> consumer, ${i % 2 ? "Consumer 2" : "Consumer 1"}: they share the work.`
                  : `m${i} goes to <b>both</b> consumers.`,
            );
          });
        });
        return t.out;
      },
    );

  function lbFig(box) {
    const sl = N.slider("Consumers", 1, 6, 1, 3);
    box.innerHTML = `<div class="controls"></div><div class="ds8-lanes" data-r></div><div class="ds8-note" data-c></div>`;
    box.firstChild.append(sl);
    const draw = (k) => {
      const rows = Array.from({ length: k }, (_, i) =>
        Array.from({ length: 12 }, (_, j) => j + 1).filter((j) => (j - 1) % k === i),
      );
      qs("[data-r]", box).innerHTML = rows
        .map(
          (r, i) =>
            `<div class="ds8-lane"><b>C${i + 1} · ${r.length * 3} s</b><div class="ds8-track">${r.map((j) => chip(`order ${j}:teal`)).join("")}</div></div>`,
        )
        .join("");
      qs("[data-c]", box).innerHTML =
        `12 orders of 3 s each, shared between ${k} consumer${k > 1 ? "s" : ""}: done in <b>${Math.ceil(12 / k) * 3} s</b> instead of 36 s.`;
    };
    sl.onInput(draw);
    draw(3);
  }

  const SUBS = ["Billing", "Email", "Analytics", "Search", "Audit"];
  function fanFig(box) {
    const sl = N.slider("Subscribers", 1, 5, 1, 3);
    box.innerHTML = `<div class="controls"></div><div class="ds8-mx" data-m></div><div class="ds8-note" data-c></div>`;
    box.firstChild.append(sl);
    const draw = (k) => {
      const m = qs("[data-m]", box);
      m.style.gridTemplateColumns = `90px repeat(6, minmax(0, 1fr))`;
      m.innerHTML =
        `<span class="h"></span>${[1, 2, 3, 4, 5, 6].map((i) => `<span class="h">m${i}</span>`).join("")}` +
        SUBS.slice(0, k)
          .map((n) => `<span class="h">${n}</span>${"<span class='y'>✓</span>".repeat(6)}`)
          .join("");
      qs("[data-c]", box).innerHTML =
        `6 messages, ${k} subscriber${k > 1 ? "s" : ""}: <b>${6 * k} deliveries</b>. Each subscriber sees all 6 and does its own job with them.`;
    };
    sl.onInput(draw);
    draw(3);
  }

  /** The slide's acknowledgement story: Consumer 2 crashes on m3, which is redelivered to Consumer 1 after m4. */
  const ackRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["K", "Broker"],
        ["C1", "Consumer 1"],
        ["C2", "Consumer 2"],
      ],
      () => {
        const t = tape(["K", "C1", "C2"]);
        const step = (k, c1, c2, cap) => {
          t.L.K = k;
          if (c1) t.L.C1 = c1;
          if (c2) t.L.C2 = c2;
          t.snap(cap);
        };
        step(
          ["m1:blue", "m2:blue"],
          ["m2:blue"],
          ["m1:blue"],
          "m1 goes to Consumer 2, m2 to Consumer 1. Blue: delivered, no ack yet.",
        );
        step(
          [],
          ["m2:teal"],
          ["m1:teal"],
          "Both finish and send an <b>ack</b>. Only now does the broker delete m1 and m2.",
        );
        step(
          ["m3:blue", "m4:blue"],
          ["m2:teal", "m4:blue"],
          ["m1:teal", "m3:blue"],
          "m3 goes to Consumer 2, m4 to Consumer 1.",
        );
        t.off(["C2"]);
        step(
          ["m3:rose", "m4:blue"],
          null,
          ["m1:teal", "m3:rose:gone"],
          "Consumer 2 <b>crashes</b> while processing m3. No ack for m3 will ever come.",
        );
        step(["m3:rose"], ["m2:teal", "m4:teal"], null, "Consumer 1 acks m4.");
        step(
          ["m3:amber"],
          ["m2:teal", "m4:teal", "m3:amber"],
          null,
          "No ack for m3, so the broker <b>redelivers</b> it to another client: Consumer 1.",
        );
        step(
          ["m5:blue"],
          ["m2:teal", "m4:teal", "m3:teal", "m5:blue"],
          null,
          "Consumer 1 acks m3. m5 arrives and goes to Consumer 1.",
        );
        step(
          [],
          ["m2:teal", "m4:teal", "m3:teal", "m5:teal"],
          null,
          "Consumer 1 processed <b>m2, m4, m3, m5</b>: m3 came after m4.",
        );
        return t.out;
      },
    );

  function orderFig(box) {
    box.innerHTML = `<div class="controls" data-s></div><div class="ds8-lanes" data-r></div><div class="ds8-note" data-c></div>`;
    const draw = (crash) => {
      const rows = crash
        ? [
            ["Consumer 1", ["m2", "m4", "m3", "m5"]],
            ["Consumer 2", ["m1", "m3 (crashed)"]],
          ]
        : [
            ["Consumer 1", ["m2", "m4"]],
            ["Consumer 2", ["m1", "m3", "m5"]],
          ];
      qs("[data-r]", box).innerHTML = rows
        .map(
          ([n, l]) =>
            `<div class="ds8-lane"><b>${n}</b><div class="ds8-track">${l.map((x, i) => chip(`${x}:${x.includes("crashed") ? "rose:gone" : crash && n === "Consumer 1" && i === 2 ? "amber" : "teal"}`)).join("")}</div></div>`,
        )
        .join("");
      const c = qs("[data-c]", box);
      c.className = `ds8-note ${crash ? "bad" : "ok"}`;
      c.innerHTML = crash
        ? "Consumer 1 handles m3 <b>after</b> m4: redelivery broke the original order."
        : "Every message is handled once, each consumer in increasing order.";
    };
    seg(qs("[data-s]", box), "0:No crash|1:Consumer 2 crashes on m3", "1", (v) => draw(v === "1"));
    draw(true);
  }

  /** Beyond the slides: a crash after the work but before the ack means the work is done twice. */
  const dupRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["K", "Broker"],
        ["C1", "Consumer 1"],
        ["C2", "Consumer 2"],
        ["X", "Customer's card"],
      ],
      () => {
        const t = tape(["K", "C1", "C2", "X"]);
        t.L.K = ["m7 charge £12:blue"];
        t.L.C1 = ["m7:blue"];
        t.snap("m7 says <b>charge £12</b>. It goes to Consumer 1.");
        t.L.X = ["£12 charged:teal"];
        t.snap("Consumer 1 charges the card…");
        t.off(["C1"]);
        t.L.C1 = ["m7:rose:gone"];
        t.snap("…and crashes <b>before</b> sending its ack.");
        t.L.K = ["m7 charge £12:amber"];
        t.L.C2 = ["m7:amber"];
        t.snap("The broker saw no ack, so it redelivers m7 to Consumer 2.");
        t.L.X = ["£12 charged:teal", "£12 charged:rose"];
        t.L.C2 = ["m7:teal"];
        t.L.K = [];
        t.snap("Consumer 2 charges the card again and acks: the customer paid <b>twice</b>.");
        return t.out;
      },
    );

  /* ============ 8.3 Many consumers ============ */
  reg({
    id: "ds8-consumers",
    order: 3,
    num: "8.3",
    title: "Many consumers: sharing, fan-out and acks",
    blurb: "Load balancing against fan-out, acknowledgements, redelivery after a crash, and what it does to the order.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>A broker with three consumers</h2><span class="tag">publish, ack, crash</span></div><div></div></div>`,
      );
      root.appendChild(card);
      S.brokerPanel(card.lastElementChild);
      root.appendChild(
        pr(
          "ds8-consumers-1",
          "In <b>Load balancing</b>, with all three consumers up, press <b>Publish</b> three times. How many consumers receive m1?",
          ["Exactly one", "All three of them", "None until every consumer is idle"],
          "Load balancing hands each message to one consumer: m1, m2 and m3 go to C1, C2 and C3, one each.",
        ),
      );
      root.appendChild(
        pr(
          "ds8-consumers-2",
          "In <b>Load balancing</b>, publish four messages so that m4 is waiting, then press <b>Crash</b> on a consumer that is processing a message. What happens to that message?",
          [
            "Another consumer gets it as soon as one is free",
            "It is lost, since it was already delivered",
            "It is deleted, because the consumer had received it",
          ],
          "The broker never got an ack for it, so it is still in the queue and goes to the next consumer that frees up by acknowledging its own message.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "When several consumers read the same topic, <b>load balancing</b> delivers each message to <b>one</b> consumer, so they share the work.",
            "<b>Fan-out</b> delivers each message to <b>all</b> consumers, so several independent consumers can subscribe to the same broadcast.",
            "A client must <b>acknowledge</b> a message when it has finished processing it. Without the ack, the broker <b>redelivers</b> the message to another client.",
            "With load balancing, redelivery can change the <b>order</b> in which messages are processed.",
            "Beyond the slides: a crash after the work but before the ack means the message is processed <b>twice</b>.",
          ],
          "One consumer each or every consumer; and nothing counts as done until it is acknowledged.",
        ),
      );
    },
  });

  L["ds8-consumers"] = {
    sum: "With several consumers on one topic, <b>load balancing</b> gives each message to one consumer and <b>fan-out</b> gives it to all. Consumers <b>acknowledge</b> finished messages; a missing ack makes the broker <b>redeliver</b>, which can reorder messages.",
    steps: [
      st(
        "Two ways to share a topic",
        P(
          "When several consumers read messages in the <b>same topic</b>, the broker can do one of two things.",
          "<b>Load balancing</b>: each message goes to <b>one</b> of the consumers. <b>Fan-out</b>: each message goes to <b>all</b> of them. Step through both with the same five messages.",
        ),
        (box, life) => patternsRun(box, life),
        mc(
          "Five messages, two consumers. Under fan-out, how many deliveries does the broker make?",
          ["10", "5", "2"],
          "Fan-out sends every message to every consumer: 5 × 2 = 10. Load balancing would make 5, one per message.",
        ),
      ),
      st(
        "Load balancing shares the work",
        P(
          "Load balancing lets consumers <b>share the work</b> of processing the messages. Useful when each message is expensive.",
          "12 orders that take 3 s each keep one consumer busy for 36 s. Three consumers take 4 orders each and finish in 12 s. Drag the slider.",
        ) +
          maths(
            "<p>With $n$ messages of $t$ seconds each, shared round robin between $k$ consumers, the busiest consumer gets $\\lceil n/k\\rceil$ of them:</p>$$\\text{time} = \\left\\lceil \\frac{n}{k}\\right\\rceil t$$<p>For $n=12$, $t=3$: $k=1$ gives 36 s, $k=3$ gives 12 s, $k=5$ gives $\\lceil 2.4\\rceil\\cdot 3 = 9$ s.</p>",
          ),
        (box) => lbFig(box),
        mc(
          "20 messages of 2 s each are load balanced over 4 consumers. About how long until all are done?",
          ["10 s", "40 s", "5 s"],
          "Each consumer gets 20 / 4 = 5 messages, and 5 × 2 s = 10 s.",
          "Messages per consumer first, then times 2 s.",
        ),
      ),
      st(
        "Fan-out broadcasts",
        P(
          "Fan-out lets <b>several independent consumers</b> subscribe to the <b>same broadcast</b> of messages. Each one does its own job with every message.",
          "An online shop publishes 6 order events. Billing charges each one, Email sends each receipt, Analytics counts each sale. With 3 subscribers that is 6 × 3 = 18 deliveries. Drag the slider.",
        ),
        (box) => fanFig(box),
        mc(
          "Billing and Email both need every order event. Which delivery pattern fits?",
          ["Fan-out", "Load balancing", "Neither: they must poll"],
          "Each service must see every message, so the broker must copy each one to both. Load balancing would give each order to only one of them.",
        ),
      ),
      st(
        "Acknowledgements and redelivery",
        P(
          "Consumers can crash. So a client must <b>explicitly tell the broker</b> when it has finished processing a message: an <b>acknowledgement</b> (ack).",
          "If the broker does not receive the ack, it assumes the message was not processed and <b>delivers it to another client</b>. In the picture Consumer 2 crashes on m3, and m3 ends up with Consumer 1.",
        ),
        (box, life) => ackRun(box, life),
        mc(
          "Why does a consumer send its ack after processing a message, not as soon as it arrives?",
          [
            "So a crash mid-processing leads to a redelivery",
            "So the broker can delete each message from its queue sooner",
            "So the producer knows the consumer's name",
          ],
          "An ack means 'done'. If the consumer acked on arrival and then crashed, the broker would delete a message that nobody finished.",
        ),
      ),
      st(
        "Redelivery changes the order",
        P(
          "Combine redelivery with load balancing and the <b>order of messages can change</b>. In the slide's example Consumer 1 processed m2, m4, m3, m5: m3 was redelivered after m4.",
          "If the order matters (a deposit before a withdrawal, say), that can cause trouble. Switch between the two cases.",
        ),
        (box) => orderFig(box),
        {
          type: "order",
          q: "Consumer 2 crashes while processing m3, so m3 is redelivered to Consumer 1. Put Consumer 1's work in the order it happens.",
          items: ["Processes m2", "Processes m4", "Processes the redelivered m3", "Processes m5"],
          why: "Consumer 1 was already handling m2 and m4 when m3 came back to the broker, so m3 comes after m4: the order has changed.",
        },
      ),
      st(
        "Beyond the slides: processed twice",
        P(
          "<b>Not on the slides</b>, but it follows from the ack rule. If a consumer finishes the work and crashes <b>before</b> its ack arrives, the broker redelivers a message that was in fact processed.",
          "So a message can be processed <b>more than once</b>. If m7 means 'charge £12', the card is charged twice. Systems guard against this by making the work safe to repeat, for example by remembering which message ids they have already handled.",
        ),
        (box, life) => dupRun(box, life),
        mc(
          "A consumer sends an email for m9, then crashes before acknowledging m9. What happens next?",
          [
            "m9 is redelivered, so the email may go twice",
            "m9 is deleted, since its email has already gone out",
            "m9 is lost, because its consumer crashed",
          ],
          "The broker only knows that no ack arrived, so it redelivers m9. The next consumer sends the email again.",
        ),
      ),
    ],
    guide: [
      "In <b>Load balancing</b>, press <b>Publish</b> four times: three consumers get one message each and m4 waits.",
      "Press <b>Crash</b> on a busy consumer, then <b>Ack</b> on another and watch the message move.",
      "Switch to <b>Fan-out</b>, publish, and ack a message on every consumer. Then answer the questions after the demo.",
    ],
  };
})();
