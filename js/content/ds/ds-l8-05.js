/* Data Science Lecture 8, part 5: ds8-middle (8.4, direct messaging against a message broker, databases against
   brokers, topics). Its figures live in ds-l8-02.js. */
(function () {
  const S = NIC.shared.ds8;
  const { reg, mc, st, P, offlineRun, dbRun, topicFig } = S;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;

  /* ============ 8.4 A middleman for messages ============ */
  reg({
    id: "ds8-middle",
    order: 4,
    num: "8.4",
    title: "A middleman for messages",
    blurb: "Send straight to consumers, or leave messages with a broker who waits for them? Plus topics.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Direct messaging</b> (UDP multicast, TCP) is fast, but a consumer that is offline misses messages.",
            "A <b>message broker</b> is a server, a kind of database for message streams, that holds messages for clients that come and go.",
            "Unlike a database, a broker <b>deletes messages once delivered</b>, keeps short queues and lets consumers subscribe to <b>topics</b>.",
          ],
          "Put a broker in the middle so nobody has to be online at the same time.",
        ),
      );
    },
  });

  L["ds8-middle"] = {
    sum: "<b>Direct messaging</b> loses messages for offline consumers. A <b>message broker</b> holds them until delivery, then deletes them, and offers subscriptions to topics.",
    steps: [
      st(
        "Straight to the consumer",
        P(
          "Picture shouting news across a room: quick, but anyone who stepped out misses it. <b>Direct messaging</b> is like that. Producers send messages straight to consumers over the network, for example by <b>multicast over UDP</b> or over TCP, with no middleman. It's fast. The catch: if a <b>consumer is offline</b>, whatever is sent while it's away is lost to it. Watch consumer B.",
        ),
        offlineRun(false),
      ),
      st(
        "Leave it with the broker",
        P(
          "Now picture a parcel locker: the courier drops your parcel off and you collect it whenever you're back. A <b>message broker</b> (or message queue) works like that. It runs as a <b>server</b>; producers and consumers connect as <b>clients</b>. Producers write messages to it and consumers read from it, so it copes with <b>clients that come and go</b>. Same story, now with a broker.",
        ),
        offlineRun(true),
        mc(
          "Why does a consumer that disconnects for a minute still get every message when a broker is used?",
          [
            "The broker keeps its messages until it is back",
            "The producer pauses until that consumer returns",
            "Other consumers forward their copies to it later",
          ],
          "Producers write to the broker, not to the consumer. The broker holds the messages and delivers them when the consumer is back.",
        ),
      ),
      st(
        "A database that forgets on purpose",
        P(
          "A broker is a kind of database optimised for message streams, but it behaves differently. A <b>database</b> is a filing cabinet: it keeps data until someone <b>explicitly deletes</b> it, and you can search it. A <b>broker</b> is more like a pass-the-parcel: it <b>deletes a message once it has been delivered</b>, so its queues stay short. Step through three reads from each.",
        ),
        (box, life) => dbRun(box, life),
        {
          type: "cat",
          q: "Does each statement describe a database or a message broker?",
          buckets: ["Database", "Message broker"],
          items: [
            ["Keeps data until someone explicitly deletes it", 0],
            ["Deletes a message once it has been delivered", 1],
            ["Answers rich search queries over everything stored", 0],
            ["Usually holds only short queues", 1],
            ["Lets clients subscribe to a subset of topics", 1],
          ],
          why: "Databases persist data and support searching it. Brokers are built for flow: short queues, delete on delivery and topic subscriptions.",
        },
      ),
      st(
        "Only the news you want",
        P(
          "You follow a few hashtags, not the whole internet. Brokers offer the same: consumers subscribe to a <b>subset of topics</b>, and only receive messages on those topics. Instead of searching like a database, a consumer says what it wants up front. Tap the topics to change the subscription and see which messages get through.",
        ),
        (box) => topicFig(box),
      ),
    ],
  };
})();
