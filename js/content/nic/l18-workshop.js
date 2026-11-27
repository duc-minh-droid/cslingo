/* l18-workshop: Lecture 18 workshop 18.W, Hoglet's neuromorphic lab (no code): sort the architectures, save the battery with an event-driven chip, catch the hedgehog with an event camera, and match facts to machines. Demos come from l18-01.js (NIC.shared.nicL18). */
(function () {
  const N = NIC;
  const { qs, qsa, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL18;
  const { C, pr, card, eventDemo, cameraDemo } = sh;

  /** A tap-to-sort card: tap an item, then tap the bucket it belongs to. */
  function sorter(stage, api, { title, id, buckets, items, done }) {
    let pick = -1;
    const placed = items.map(() => false);
    const c = card(
      stage,
      title,
      `<div class="nw18-chips" data-i></div><div class="controls" data-b></div><p class="nw18-note" data-n aria-live="polite">Tap a card, then tap where it belongs.</p>`,
    );
    const draw = () => {
      qs("[data-i]", c).innerHTML = items
        .map(
          ([t, b], i) =>
            `<button class="btn small nw18-chip${placed[i] ? " ok" : ""}${pick === i ? " primary" : ""}" data-k="${i}" ${placed[i] ? "disabled" : ""}>${t}${placed[i] ? ` <small>→ ${buckets[b]}</small>` : ""}</button>`,
        )
        .join("");
      qsa("[data-k]", c).forEach((b) => (b.onclick = () => ((pick = +b.dataset.k), draw())));
    };
    qs("[data-b]", c).innerHTML = buckets.map((b, i) => `<button class="btn" data-g="${i}">${b}</button>`).join("");
    qsa("[data-g]", c).forEach(
      (g) =>
        (g.onclick = () => {
          if (pick < 0) return api.say("Tap a card first, then the place it belongs.");
          const [t, b] = items[pick];
          if (+g.dataset.g !== b) {
            api.say(`Not quite: think again about "${t}".`);
            return;
          }
          placed[pick] = true;
          pick = -1;
          draw();
          qs("[data-n]", c).innerHTML = `${placed.filter(Boolean).length} of ${items.length} sorted.`;
          if (placed.every(Boolean)) {
            api.say(done, "happy");
            api.done(id);
          }
        }),
    );
    draw();
  }

  function build(stage, api, life) {
    sorter(stage, api, {
      title: "Which kind of computer?",
      id: "sort",
      buckets: ["von Neumann", "Neuromorphic"],
      items: [
        ["Separate processor and memory", 0],
        ["Follows a stored program", 0],
        ["Data encoded in binary", 0],
        ["Synapses store and process", 1],
        ["Behaviour set by synapse structure", 1],
        ["Inputs are timed spikes", 1],
      ],
      done: "All six sorted. Memory and processing apart, or together in the synapses.",
    });
    let won = false;
    eventDemo(stage, life, {
      title: "Save Hoglet's battery",
      onStat: ({ act, clock, ev }) => {
        if (!won && act > 0 && ev > 0 && ev * 4 <= clock) {
          won = true;
          api.say(
            `At ${act}% activity the event-driven chip works ${ev} times against the clocked chip's ${clock}. Quiet nights cost almost nothing.`,
            "happy",
          );
          api.done("battery");
        }
      },
    });
    let camWon = false;
    cameraDemo(stage, life, {
      title: "Catch the hedgehog",
      onStat: ({ sent, moments }) => {
        if (!camWon && moments >= 3 && sent.event > 0 && sent.event * 10 < sent.frame) {
          camWon = true;
          api.say(
            `After ${moments} moments the event camera has sent ${sent.event} pixels, the frame camera ${sent.frame}. Same hedgehog, a fraction of the data.`,
            "happy",
          );
          api.done("camera");
        }
      },
    });
    sorter(stage, api, {
      title: "Match the machine",
      id: "machines",
      buckets: ["SpiNNaker", "TrueNorth", "NorthPole"],
      items: [
        ["18 ARM cores per chip", 0],
        ["Monitor and fascicle processors", 0],
        ["1 million neurons per chip", 1],
        ["Configured in Corelet", 1],
        ["Unveiled in 2023", 2],
        ["Built for low-latency AI pipelines", 2],
      ],
      done: "Every fact matched. SpiNNaker explores, TrueNorth scales, NorthPole aims at usable AI.",
    });
  }

  N.register({
    id: "l18-wlab",
    lecture: 18,
    order: 90,
    num: "18.W",
    workshop: true,
    title: "Workshop: Hoglet's neuromorphic lab",
    blurb:
      "No code. Sort the architectures, save the battery, catch a hedgehog with an event camera and match the machines.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Four cards for Hoglet, Priya's hedgehog camera: a <b>sorting</b> card, an <b>event-driven chip</b>, an <b>event camera</b> and a <b>machine match</b>.",
        missions: [
          {
            id: "sort",
            t: "Sort the computers",
            d: "In <b>Which kind of computer?</b>, tap each card and then <b>von Neumann</b> or <b>Neuromorphic</b>.",
            hint: "Ask: is memory separate from processing, or are both in the synapses?",
          },
          {
            id: "battery",
            t: "Save the battery",
            d: "Slide <b>Garden activity</b> until the event-driven chip works at most a quarter as often as the clocked chip (but not zero).",
            hint: "Try 10% or 20%. Press <b>New night</b> if no spike shows up.",
          },
          {
            id: "camera",
            t: "Catch the hedgehog",
            d: "Press <b>Next moment</b> at least 3 times so the event camera's pixel count stays under a tenth of the frame camera's.",
            hint: "Keep <b>Hedgehog walks</b> on; each step only changes 2 pixels.",
          },
          {
            id: "machines",
            t: "Match the machine",
            d: "In <b>Match the machine</b>, tap each fact and then <b>SpiNNaker</b>, <b>TrueNorth</b> or <b>NorthPole</b>.",
            hint: "ARM cores belong to SpiNNaker; Corelet to TrueNorth; 2023 to NorthPole.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l18-wlab-1",
          "In <b>Save Hoglet's battery</b>, what happens to the clocked chip's work as you change the activity? | It stays the same | It rises and falls with the activity | It drops to zero at 0% | A clocked chip works on every tick whatever happens. Only the event-driven chip follows the spikes.",
        ),
      );
      root.appendChild(
        pr(
          "l18-wlab-2",
          "In <b>Catch the hedgehog</b>, why does each walking step send only 2 pixels from the event camera? | Only the pixel it left and the pixel it entered change | The event camera samples just 2 pixels at random | The hedgehog is only ever 2 pixels from the edge | The rest of the picture keeps its brightness, so only the two changed pixels spike.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "von Neumann separates memory and processing; neuromorphic puts both in the synapses.",
            "<b>Event driven</b> chips and <b>event cameras</b> spend energy only when something changes.",
            "SpiNNaker, TrueNorth and NorthPole are the big neuromorphic machines so far.",
          ],
          "Change costs energy; stillness is free.",
        ),
      );
    },
  });

  L["l18-wlab"] = {
    sum: "Sort features into von Neumann or neuromorphic, compare a clocked and an event-driven chip, compare a frame and an event camera, and match facts to SpiNNaker, TrueNorth and NorthPole.",
    steps: [
      {
        t: "The lab",
        b: `<p>Four cards, one goal: help Priya decide whether Hoglet should go neuromorphic. Sort the two kinds of computer, save the battery, try an event camera and get to know the big machines.</p>`,
        v: F.flow(["Sort", "Save the battery", "Catch the hedgehog", { t: "Match the machine", c: "teal" }]),
        c: C(
          "Which feature belongs to a neuromorphic computer? | Inputs arrive as timed spikes | A separate memory holds the program | All data is coded in binary words | Neuromorphic computers take spikes as inputs, with timing and magnitude carrying the information.",
        ),
      },
      {
        t: "What we are testing",
        b: `<p>Two of the cards are about <b>events</b>: a chip that works only when a spike arrives, and a camera that reports only what changed. Watch how much work each one skips on a quiet night.</p>`,
        v: F.compare(
          { title: "Clock / frames", c: "amber", body: "Work every tick, whatever happens." },
          { title: "Events / spikes", c: "teal", body: "Work only when something changes." },
        ),
        c: C(
          "A frame camera and an event camera watch an empty, still garden. Which sends more data? | The frame camera | The event camera | They send the same amount | The frame camera still sends every pixel of every frame; the event camera sends nothing because nothing changes.",
        ),
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
