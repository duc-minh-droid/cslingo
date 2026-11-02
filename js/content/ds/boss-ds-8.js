/* Data Science boss quiz for Lecture 8 (stream processing). New scenario: a city bike-share scheme (Pedalpoint). */
(function () {
  const { pk } = NIC.shared.ds8;

  const fig = pk([
    ["m4", "m4 · bike taken", "acked by worker A"],
    ["m5", "m5 · bike returned", "with worker B, which crashed; no ack"],
    ["m6", "m6 · dock full", "acked by worker C"],
    ["m7", "m7 · bike taken", "just delivered to worker A"],
  ]);

  NIC.registerBoss({
    id: "ds8-boss",
    subject: "ds",
    lecture: 8,
    title: "Lecture 8 boss quiz",
    blurb:
      "Ten questions set at a bike-share scheme: batch against stream, events, polling, fast producers, brokers, load balancing, fan-out and acks.",
    lede: "A new scenario: <b>Pedalpoint</b> runs 400 bike docks across a city. Every dock reports when a bike is taken or returned, and a message broker passes those events to the map, billing and reporting services. Keep the bikes, the bills and the map in step.",
    qs: [
      {
        type: "cat",
        q: "Is each Pedalpoint data source bounded or unbounded?",
        buckets: ["Bounded", "Unbounded"],
        items: [
          ["Last year's archive of 3 million finished rides", 0],
          ["Bike taken and returned events from the docks", 1],
          ["The March invoices file, closed on 1 April", 0],
          ["GPS pings from bikes that are out on a ride", 1],
          ["Battery readings that e-bikes send every minute", 1],
        ],
        why: "Archives and closed monthly files have an end, so a batch job can read them to completion. Dock events, GPS pings and battery readings keep arriving with no end.",
      },
      {
        type: "slider",
        q: "Pedalpoint's usage report is a batch job that runs once a day at midnight. A bike is returned at 01:00. About how many hours until that return appears in the report?",
        min: 0,
        max: 24,
        step: 1,
        start: 0,
        ans: 23,
        tol: 1,
        unit: " h",
        hint: "The next run is at the following midnight.",
        why: "The event waits for the next daily run: from 01:00 to 24:00 is 23 hours. Stream processing would handle it as it arrives.",
      },
      {
        type: "mcq",
        q: "The map service polls the rides database every 15 seconds for new events. How many polls does it make in an hour, whether or not anything has changed?",
        o: ["240", "15", "900", "3,600"],
        a: 0,
        hint: "An hour is 3,600 seconds; divide by 15.",
        why: "3,600 / 15 = 240 polls an hour. Most come back empty when docks are quiet, which is why notification beats polling.",
      },
      {
        type: "multi",
        q: "Select every statement that is <b>true</b> about Pedalpoint's dock events.",
        o: [
          "Each event records something that happened at a point in time",
          "An event usually carries a timestamp",
          "The same event could be encoded as JSON or in a binary form",
          "A wrong event is fixed by editing it where it is stored",
          "Only one consumer may ever read a given event",
        ],
        a: [0, 1, 2],
        why: "Events are small, self-contained, immutable records with a timestamp, in any encoding. A correction is a new event, and many consumers can process the same event.",
      },
      {
        type: "slider",
        q: "At rush hour the docks publish 900 events a minute but the reporting consumer handles 700 a minute. The broker buffers the rest. About how many events are waiting after 5 minutes?",
        min: 0,
        max: 2000,
        step: 100,
        start: 0,
        ans: 1000,
        tol: 100,
        hint: "The queue grows by 900 − 700 = 200 a minute.",
        why: "200 more arrive than are handled each minute, so after 5 minutes 200 × 5 = 1,000 are waiting, and the buffer keeps growing until the rush ends.",
      },
      {
        type: "match",
        q: "Match each way of passing dock events on to what happens.",
        pairs: [
          ["Drop", "Events that do not fit are thrown away"],
          ["Buffer", "Events wait in a queue that keeps growing"],
          ["Backpressure", "The docks are made to send more slowly"],
          ["Direct messaging", "A consumer that is offline misses events"],
        ],
        why: "Drop, buffer and backpressure are the three answers to a fast producer. Direct messaging has no broker to hold events for an offline consumer.",
      },
      {
        type: "mcq",
        q: "Pedalpoint runs 4 identical billing workers so that ride-ended messages are processed faster. How should the broker deliver those messages to them?",
        o: [
          "Load balancing: each message to one worker",
          "Fan-out: each message to all four workers",
          "Direct multicast from each dock to all four",
          "A database table that the workers poll",
        ],
        a: 0,
        why: "The workers share one job, so each ride must be billed once: load balancing. Fan-out would bill every ride four times.",
      },
      {
        type: "pick",
        q: "Billing workers use load balancing with acknowledgements. Tap the message the broker must <b>deliver again</b>.",
        fig,
        a: "m5",
        hint: "Which message was delivered but never acknowledged by a working consumer?",
        why: "Worker B crashed holding m5 and never acked it, so the broker redelivers m5 to another worker. m4 and m6 are acked; m7 has only just been delivered.",
      },
      {
        type: "order",
        q: "A ride-ended message m8 goes to billing worker A, which crashes. Put what happens next in order.",
        items: [
          "The broker delivers m8 to worker A",
          "Worker A crashes before it acknowledges m8",
          "With no ack for m8, the broker delivers it to worker B",
          "Worker B bills the ride and sends an ack for m8",
          "The broker deletes m8",
        ],
        hint: "Nothing is deleted until an ack arrives.",
        why: "The broker keeps m8 until it hears an ack. Worker A's crash means none comes, so m8 goes to worker B, whose ack finally lets the broker delete it.",
      },
      {
        type: "bug",
        q: "The map service and the billing service must <b>each</b> receive every dock event (fan-out). Click the faulty line.",
        code: [
          "def deliver(event, subscribers):",
          "    chosen = subscribers[event.id % len(subscribers)]",
          "    chosen.send(event)",
        ],
        a: 1,
        hint: "How many subscribers receive each event with this code?",
        why: "Line 2 picks one subscriber per event, which is load balancing. Fan-out must send the event to every subscriber: for s in subscribers: s.send(event).",
      },
    ],
  });
})();
