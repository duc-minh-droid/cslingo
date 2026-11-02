/* js/bank/ds-43.js: Data Science lecture 8 revision questions, part 1: ds8-streams and ds8-brokers. */
(function () {
  const B = NIC.bank;
  const { mc, pk } = NIC.shared.ds8;

  B.add("ds8-streams", [
    {
      type: "cat",
      q: "Is each job a natural fit for batch processing or for stream processing?",
      buckets: ["Batch", "Stream"],
      items: [
        ["Recompute last month's invoices from the saved order files", 0],
        ["Flag a card payment as suspicious within a second of it happening", 1],
        ["Rebuild a search index from a full copy of the database", 0],
        ["Update a live score page as soon as each goal is recorded", 1],
        ["Count yesterday's website visits from the server log files", 0],
      ],
      why: "Batch jobs read a bounded set of files and finish. Anything that must react to each new event as it happens needs stream processing.",
    },
    mc(
      "Why is the output of a batch job called derived data?",
      [
        "It can be recreated by rerunning the job on its input",
        "It is copied from another database without any changes at all",
        "It is produced by the users rather than by a program",
      ],
      "A batch job turns input files into new output files without changing the input, so the output can always be derived again.",
    ),
    {
      type: "slider",
      q: "A batch job runs every 4 hours: at 00:00, 04:00, 08:00, 12:00 and so on. An event arrives at 09:30. How many minutes does it wait to be processed?",
      min: 0,
      max: 240,
      step: 10,
      start: 0,
      ans: 150,
      tol: 10,
      unit: " min",
      hint: "The next run after 09:30 is at 12:00.",
      why: "From 09:30 to 12:00 is 2 hours 30 minutes, which is 150 minutes.",
    },
    mc(
      "How does a batch job know that it has finished?",
      [
        "Its input is bounded, so it reaches the end",
        "It stops after a fixed number of minutes",
        "A consumer sends it an acknowledgement",
      ],
      "Batch processing assumes bounded input: once every input file has been read, the job is done.",
    ),
    {
      type: "multi",
      q: "Select every property the lecture gives for an <b>event</b>.",
      o: [
        "Small and self-contained",
        "Immutable once created",
        "Usually carries a timestamp",
        "Updated in place when facts change",
        "Must always be encoded as JSON",
      ],
      a: [0, 1, 2],
      why: "An event is a small, self-contained, immutable record of something that happened, usually with a timestamp. It can be encoded as text, JSON or binary.",
    },
    mc(
      "A consumer polls a file every 30 seconds for new events. How many polls is that per hour?",
      ["120", "30", "1,800"],
      "3,600 seconds in an hour divided by 30 gives 120 polls, whether or not anything new has arrived.",
      "3,600 / 30: think 360 / 3.",
    ),
    {
      type: "order",
      q: "Put these approaches in order from the most out-of-date results to the freshest.",
      items: [
        "A batch run once a day",
        "A batch run every hour",
        "A batch run every minute",
        "Each event processed as it arrives",
      ],
      why: "The longer the window, the longer an event can wait for the next run. Shrinking the window to nothing is stream processing.",
    },
    mc(
      "Events arrive evenly through the day and a batch job runs every 2 hours. About how long does a typical event wait?",
      ["About 1 hour", "About 2 hours", "About 10 minutes"],
      "An event can land anywhere in a 2-hour window, so on average it waits about half the window, 1 hour. The worst case is just under 2 hours.",
    ),
    {
      type: "match",
      q: "A smart electricity meter reports its readings. Match each stream term to the example.",
      pairs: [
        ["Producer", "The meter that sends the readings"],
        ["Consumer", "The billing service that reads them"],
        ["Event", "Meter 52 read 3.1 kWh at 14:00"],
        ["Timestamp", "14:00 on 2 March"],
      ],
      why: "The meter produces events, billing consumes them, each reading is an event, and the time it was taken is its timestamp.",
    },
    mc(
      "Why is a relational database a poor way to tell consumers about new events?",
      [
        "It is not designed to notify clients when rows appear",
        "It cannot store timestamps alongside the event data",
        "It deletes rows as soon as one client has read them",
      ],
      "Consumers would have to keep querying it. A database stores and searches data well but was not built to push notifications.",
    ),
    {
      type: "bug",
      q: "This function should record that a user unliked a post in an event stream. Click the line that breaks the rule that events are immutable.",
      code: [
        "def record_unlike(stream, user, post):",
        "    for e in stream:",
        "        if e.user == user and e.post == post:",
        '            e.action = "unlike"',
      ],
      a: 3,
      hint: "Which line changes an event that already exists?",
      why: 'Line 4 edits a past event. Events record what happened and never change; the code should append a new event instead: stream.append(Event(user, "unlike", post, now)).',
    },
  ]);

  B.add("ds8-brokers", [
    {
      type: "cat",
      q: "Which answer to a fast producer is each system using?",
      buckets: ["Drop", "Buffer", "Backpressure"],
      items: [
        ["A dashboard ignores readings that arrive while it is redrawing", 0],
        ["A web server stops reading from a socket, so the sender slows down", 2],
        ["Photo uploads wait in a disk-backed queue overnight", 1],
        ["An overloaded game server skips some position updates", 0],
        ["Order emails pile up in a queue during a big sale", 1],
      ],
      why: "Skipping messages is dropping, letting them pile up is buffering, and slowing the sender down is backpressure (flow control).",
    },
    {
      type: "slider",
      q: "A producer sends 8 messages a second and the consumer handles 5 a second. The broker buffers the rest. About how many are waiting after 20 seconds?",
      min: 0,
      max: 100,
      step: 5,
      start: 0,
      ans: 60,
      tol: 5,
      hint: "The queue grows by 8 − 5 = 3 every second.",
      why: "3 extra messages a second for 20 seconds is 3 × 20 = 60 waiting.",
    },
    mc(
      "What is the main weakness of sending events directly from producers to consumers, for example by UDP multicast?",
      [
        "A consumer that is offline misses the messages",
        "Messages are always delivered far too slowly",
        "Only one consumer can ever receive each message",
      ],
      "Direct messaging is fast, but with nothing in the middle to hold messages, anything sent while a consumer is away is lost to it.",
    ),
    mc(
      "A broker writes every message to disk as well as keeping it in memory. What does it gain, and at what cost?",
      [
        "Messages survive a crash, but each one needs a disk write",
        "Messages arrive faster, but a single crash loses all of them",
        "Consumers may search old messages, but topics are lost",
      ],
      "Memory is wiped by a crash; disk is not. The price is the slower disk write for each message.",
    ),
    {
      type: "multi",
      q: "Select every statement that is <b>true</b> about message brokers.",
      o: [
        "A broker runs as a server application",
        "Producers and consumers connect to it as clients",
        "It copes with clients that disconnect and reconnect",
        "It keeps every message forever so it can be searched",
        "Consumers must be online when a message is sent",
      ],
      a: [0, 1, 2],
      why: "A broker is a server that producers and consumers use as clients, and it holds messages for clients that come and go. It deletes messages once delivered, so it is not a long-term searchable store.",
    },
    {
      type: "match",
      q: "Match each way of connecting producers and consumers to how it behaves.",
      pairs: [
        ["Direct messaging", "Fast, but an offline consumer misses messages"],
        ["Message broker", "Holds messages for clients that disconnect"],
        ["Database", "Keeps data until it is explicitly deleted"],
        ["Polling", "Checks for news every few seconds"],
      ],
      why: "Direct messaging has no middleman, a broker holds messages for its clients, a database keeps data until deleted, and polling repeatedly asks whether anything is new.",
    },
    {
      type: "pick",
      q: "A consumer subscribes to the <b>#rail</b> topic only. Tap the message it will receive.",
      fig: pk([
        ["bus", "#bus", "Route 9 diverted"],
        ["rail", "#rail", "Platform 3 change"],
        ["tram", "#tram", "Line B delayed"],
        ["ferry", "#ferry", "Last crossing 22:10"],
      ]),
      a: "rail",
      hint: "A subscription to a topic delivers only that topic.",
      why: "Brokers let a consumer subscribe to a subset of topics. Only the #rail message matches.",
    },
    mc(
      "Messages arrive on #rail (4), #bus (5) and #tram (2). A consumer subscribes to #rail and #tram. How many messages does it receive?",
      ["6", "4", "11"],
      "It gets the #rail and #tram messages only: 4 + 2 = 6 of the 11.",
    ),
    {
      type: "order",
      q: "Put the life of one message through a broker in order.",
      items: [
        "The producer connects to the broker as a client",
        "The producer writes the message to the broker",
        "The broker holds the message in a queue",
        "A consumer receives the message from the broker",
        "The broker deletes it after successful delivery",
      ],
      why: "Producers write to the broker, the broker queues the message, consumers read it, and once delivery has succeeded the broker deletes it.",
    },
    mc(
      "What is another name the lecture gives for backpressure?",
      ["Flow control", "Fan-out", "Load balancing", "Multicast"],
      "Backpressure is flow control: the receiver makes the sender slow down instead of dropping or buffering messages.",
    ),
    mc(
      "Why are the queues in a message broker usually short?",
      [
        "Messages are deleted once they have been delivered",
        "Brokers refuse every new message after the tenth one arrives",
        "Producers may send only one message per minute",
      ],
      "A broker removes each message after successful delivery, so it only holds what is still on its way, unlike a database.",
    ),
  ]);
})();
