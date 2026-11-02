/* js/bank/ds-44.js: Data Science lecture 8 revision questions, part 2: ds8-consumers. */
(function () {
  const B = NIC.bank;
  const { mc, pk } = NIC.shared.ds8;

  B.add("ds8-consumers", [
    {
      type: "cat",
      q: "Which delivery pattern does each situation need?",
      buckets: ["Load balancing", "Fan-out"],
      items: [
        ["Four image-resize workers split the uploaded photos between them", 0],
        ["The search index and the welcome email both need every new sign-up", 1],
        ["A pool of ten workers handles payment jobs, each job once", 0],
        ["Every cache server must hear every invalidation message", 1],
        ["Several translators share out a pile of documents", 0],
      ],
      why: "Sharing one job between identical workers is load balancing. Independent services that each need every message use fan-out.",
    },
    {
      type: "slider",
      q: "30 messages take 4 seconds each to process. They are load balanced evenly over 5 consumers. About how many seconds until all are done?",
      min: 0,
      max: 120,
      step: 2,
      start: 0,
      ans: 24,
      tol: 2,
      unit: " s",
      hint: "30 / 5 = 6 messages per consumer.",
      why: "Each consumer handles 6 messages of 4 s, so 6 × 4 = 24 seconds, against 120 s for one consumer alone.",
    },
    mc(
      "7 messages are published to a topic with 4 fan-out subscribers. How many deliveries does the broker make?",
      ["28", "7", "11"],
      "Fan-out gives every subscriber every message: 7 × 4 = 28.",
    ),
    {
      type: "pick",
      q: "Three load-balanced consumers report the order they processed messages in. Tap the one whose order was changed by a redelivery.",
      fig: pk([
        ["c1", "Consumer 1", "m1, m3, m5"],
        ["c2", "Consumer 2", "m2, m6, m4"],
        ["c3", "Consumer 3", "m7, m8"],
      ]),
      a: "c2",
      hint: "Look for a lower message number after a higher one.",
      why: "Consumer 2 processed m4 after m6: m4 must have come back to the broker after a crash and been redelivered late.",
    },
    {
      type: "order",
      q: "Put the normal life of message m2 in order, with no crashes.",
      items: [
        "The broker delivers m2 to a consumer",
        "The consumer processes m2",
        "The consumer sends an ack for m2",
        "The broker deletes m2",
      ],
      why: "The ack comes after processing, and the broker deletes the message only once the ack has arrived.",
    },
    {
      type: "multi",
      q: "Select every statement that is <b>true</b> about acknowledgements.",
      o: [
        "A client must tell the broker explicitly when it has finished",
        "Without an ack the broker delivers the message to another client",
        "With load balancing, redelivery can change the processing order",
        "An ack is sent as soon as the message arrives, before any work",
        "Once delivered, a message is deleted whether or not an ack came",
      ],
      a: [0, 1, 2],
      why: "An ack means the work is finished. If it never comes the broker redelivers, which can reorder messages. Acking on arrival would lose messages when a consumer crashes mid-task.",
    },
    {
      type: "bug",
      q: "This consumer resizes uploaded images. A crash halfway through must not lose an image. Click the faulty line.",
      code: ["def on_message(msg):", "    broker.ack(msg.id)", "    image = resize(msg.image)", "    save(image)"],
      a: 1,
      hint: "What does the broker do once it has the ack, and what if the consumer then crashes?",
      why: "Line 2 acks before the work. If the consumer crashes during resize, the broker has already deleted the message and the image is never processed. The ack belongs after save(image).",
    },
    mc(
      "Beyond the slides: a consumer sends a text message for m9 and crashes before its ack. m9 is redelivered. How can the system avoid texting twice?",
      [
        "Remember handled message ids and skip repeats",
        "Ack every message before doing the work instead",
        "Switch the topic from load balancing to fan-out",
      ],
      "Redelivery means a message can be processed more than once, so the work should be safe to repeat, for example by skipping ids already handled. Acking first would lose messages instead.",
    ),
    mc(
      "Why can load balancing with redelivery change the order of messages?",
      [
        "A redelivered message joins a consumer after later ones",
        "The broker sorts messages in random order on purpose",
        "Fan-out copies arrive at different times at each consumer",
      ],
      "The crashed consumer's message goes back to the broker and is handed out again, by which time other consumers have moved on to later messages.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Acknowledgement", "The consumer tells the broker it has finished"],
        ["Redelivery", "An unacked message is sent to another client"],
        ["Load balancing", "Each message goes to one of the consumers"],
        ["Fan-out", "Each message goes to every consumer"],
      ],
      why: "Load balancing and fan-out are the two patterns for several consumers; acks and redelivery make sure no message is lost when a consumer crashes.",
    },
    mc(
      "Two consumers take turns: C1 gets m1, m3, m5 and C2 gets m2, m4, m6. C2 crashes on m4 without an ack, and m4 is redelivered to C1 after C1 finishes m5. In what order does C1 process its messages?",
      ["m1, m3, m5, m4", "m1, m3, m4, m5", "m4, m1, m3, m5"],
      "C1 is already through m5 when m4 comes back, so m4 is processed last: out of its original order.",
    ),
  ]);
})();
