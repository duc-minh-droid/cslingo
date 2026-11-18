/* Data Science Lecture 8, part 4: ds8-events (8.2, events, producers and consumers, polling against notification).
   Its figures live in ds-l8-01.js. */
(function () {
  const S = NIC.shared.ds8;
  const { reg, mc, st, P, maths, eventFig, pcFig, pollFig } = S;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;

  /* ============ 8.2 Little notes about what happened ============ */
  reg({
    id: "ds8-events",
    order: 2,
    num: "8.2",
    title: "Little notes about what happened",
    blurb: "Events, the producers that write them, the consumers that read them, and why nobody should keep asking.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "An <b>event</b> is a small, self-contained, <b>immutable</b> record of something that happened, usually with a <b>timestamp</b>.",
            "A <b>producer</b> (publisher, sender) creates each event once; many <b>consumers</b> (subscribers, recipients) can process it.",
            "Polling a file or database wastes work: consumers should be <b>notified</b> of new events.",
          ],
          "Write it down once, never edit it, and tell everyone who cares.",
        ),
      );
    },
  });

  L["ds8-events"] = {
    sum: "An <b>event</b> is an immutable, timestamped record of something that happened. Producers create events and consumers process them, ideally by being notified rather than by polling.",
    steps: [
      st(
        "A note about something that happened",
        P(
          "Picture a till receipt: it says what was bought and when, and nobody rewrites it later. In stream processing a record like that is an <b>event</b>: a small, self-contained, <b>immutable</b> note of something that happened, usually with a <b>timestamp</b>. For example: mo_17 liked post 4821 at 09:15:02. It can be stored as text, JSON or compact binary. Switch encodings, then try to change it.",
        ),
        (box) => eventFig(box),
        mc(
          "A user unlikes a post they liked an hour ago. How does an event stream record that?",
          [
            "A new unlike event is added; the like stays",
            "The like event is edited so it now says unlike",
            "The like event is deleted from the stream",
          ],
          "Events are immutable records of what happened. A change of mind is a new event with its own timestamp.",
        ),
      ),
      st(
        "One writer, many readers",
        P(
          "Think of a radio presenter reading the news once while thousands of people listen and each does something different with it. An event is created once by a <b>producer</b> (also called a publisher or sender) and processed by possibly <b>many consumers</b> (subscribers or recipients). One like event: one consumer notifies the author, another counts likes, a third reranks the feed.",
        ),
        pcFig,
        {
          type: "match",
          q: "Match each stream term to its other name or meaning.",
          pairs: [
            ["Producer", "Publisher or sender"],
            ["Consumer", "Subscriber or recipient"],
            ["Event", "Immutable record of something that happened"],
          ],
          why: "Producers generate events and consumers process them. The lecture gives publisher and sender, subscriber and recipient as other names.",
        },
      ),
      st(
        "“Are we there yet?”",
        P(
          "Picture a child in the back seat asking “are we there yet?” every few seconds. Tiring, and mostly the answer is no. A consumer that checks a file or database for new events is doing the same: <b>polling</b>. Each check costs work even when nothing is new. Better to be <b>notified</b> when an event appears, and relational databases aren't built for that. Drag the slider.",
        ) +
          maths(
            "<p>Polling every $x$ seconds costs $\\dfrac{3600}{x}$ checks an hour, whatever the traffic. An event arrives at a random moment between checks, so it waits about $x/2$ on average. Halving $x$ halves the wait and doubles the checks.</p>",
          ),
        (box) => pollFig(box),
      ),
    ],
  };
})();
