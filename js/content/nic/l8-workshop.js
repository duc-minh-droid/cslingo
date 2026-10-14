/* l8-workshop: Lecture 8 workshop 8.W, the ant colony lab (no code): alpha, beta, rho, update rules, and lateness. */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const sh = NIC.shared.nicL8;
  const { C, pr, colonyDemo, OPT, share, schedCard } = sh;

  /** Mission checks, run after every colony press (and Reset). */
  function checkColony(api, S, P) {
    const h = S.hist,
      t = h[h.length - 1];
    if (!t) return;
    if (S.best.len <= OPT * 1.03) api.done("near");
    if (P.alpha === 0 && P.beta <= 3 && h.length >= 10 && t.mean >= OPT * 1.15) api.done("blind");
    if (t.spread < 0.01 && S.best.len > OPT + 1) {
      api.done("lock");
      api.say("All ten ants walk the same round, and it is not the best one. The trail has locked in.", "surprised");
    }
    if (h.length >= 5 && share(S) >= 0.9) api.done("focus");
  }
  /** Mission 5: two different orders with the same average lateness but different maximum lateness. */
  function checkSchedule(api, seen, e) {
    const k = String(e.avg),
      set = seen.get(k) || new Set();
    set.add(e.max);
    seen.set(k, set);
    if (set.size > 1) {
      api.done("late");
      api.say(
        `Two orders, both averaging ${e.avg} minutes late, but with different worst cases. The fitness you pick matters.`,
      );
    }
  }
  function build(stage, api, life) {
    colonyDemo(stage, life, {
      controls: ["alpha", "beta", "rho", "mode"],
      title: "Colony lab: ten villages",
      seed: 21,
      onRun: (S, P) => checkColony(api, S, P),
    });
    const card = el(
      `<div class="card nw8-demo"><div class="card-head"><h2>Print shop: reorder the jobs</h2></div><div data-box></div></div>`,
    );
    stage.appendChild(card);
    const seen = new Map();
    schedCard(qs("[data-box]", card), (o, e) => checkSchedule(api, seen, e));
  }

  N.register({
    id: "l8-wlab",
    lecture: 8,
    order: 90,
    num: "8.W",
    workshop: true,
    title: "Workshop: ant colony lab",
    blurb:
      "No code. Tune alpha, beta, rho and the update rule on a ten-village round, then reorder a print shop's jobs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro: `A colony of ten ants, ten villages, and four dials. The shortest possible round is <b>${OPT.toFixed(1)} km</b>. Press <b>Run 10</b> and watch the stats under the map.`,
        missions: [
          {
            id: "near",
            t: "Find a short round",
            d: `Run the colony until the best so far is within 3% of the shortest possible round (under ${(OPT * 1.03).toFixed(1)} km).`,
            hint: "Keep the defaults and press <b>Run 10</b> once or twice. If the seed is unlucky, press <b>Reset</b> and try again.",
          },
          {
            id: "blind",
            t: "Switch the trails off",
            d: "Set <b>α</b> to 0 with <b>β</b> at 3 or lower, and run at least 10 iterations. The ants' average should stay more than 15% above the shortest round.",
            hint: "α = 0 makes every τ term equal to 1, so the pheromone cannot steer. Press <b>Run 10</b> and read <b>Ants' average</b>.",
          },
          {
            id: "lock",
            t: "Lock the colony in",
            d: "Make all ten ants in one iteration follow a round of the same length, when that round is <b>not</b> the best one.",
            hint: "Choose <b>Best ant</b>, set <b>β</b> to 0 and <b>α</b> to 3, then run 10. <b>Reset</b> and repeat if you land on the best round.",
          },
          {
            id: "focus",
            t: "Concentrate the trail",
            d: "Get at least 90% of all pheromone onto the edges of the best round (<b>Trail on best round</b>), after five or more iterations.",
            hint: "Only the best ants' deposits pile up: pick <b>Best ant</b>, put <b>α</b> and <b>β</b> back to 1 and 3, and run 10.",
          },
          {
            id: "late",
            t: "Same average, different worst case",
            d: "In the print shop, find two different orders with the same <b>Average lateness</b> but different <b>Maximum lateness</b>.",
            hint: "Try the orders L P T W B and L T P B W: both average 42 minutes late, but one has a maximum of 110 and the other 140.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l8-wlab-1",
          "In the lab, α = 0 and β = 0. How do the ants choose? | All allowed villages are equally likely | They follow the nearest village every time | They follow the strongest trail every time | With both exponents at 0 every term is 1, so the tabu list is the only thing that matters.",
        ),
      );
      root.appendChild(
        pr(
          "l8-wlab-2",
          "With α = 0 the ants' average stays far above the best round. Why? | Nothing learned steers the next ants' choices | Evaporation removes all the pheromone first | The best round is not allowed to be reused | The pheromone is still updated, but with α = 0 it has no effect on any choice.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>α</b> sets how much the ants trust the pheromone, <b>β</b> how much they trust distance. Both at 0 is a random walk over the unvisited towns.",
            "Letting only the best ant deposit <b>concentrates</b> the trail, and can <b>lock the colony in</b> on a poor round.",
            "<b>Average</b> and <b>maximum</b> lateness can disagree, so the fitness you choose shapes the schedule you get.",
          ],
          "Turn one dial at a time and read what the stats say.",
        ),
      );
    },
  });

  L["l8-wlab"] = {
    sum: "Tune an ant colony on ten villages and compare average and maximum lateness for a print shop schedule.",
    steps: [
      {
        t: "The lab",
        b: `<p>The lab has two cards. In the <b>colony lab</b> you set <b>α</b>, <b>β</b>, <b>ρ</b> and the update rule (which ants deposit), then press <b>Run 1 iteration</b> or <b>Run 10</b>. The map shows pheromone as line thickness; the dotted green line is the best round so far.</p>`,
        v: F.flow(
          [
            "Set α, β, ρ and who deposits",
            "Run iterations",
            "Read best, average, trail share",
            { t: "Adjust one dial", c: "violet" },
          ],
          { loop: true },
        ),
        c: C(
          "Which dial controls how fast old pheromone fades? | ρ | α | β | ρ is the evaporation rate: each iteration τ becomes (1 − ρ)τ.",
        ),
      },
      {
        t: "Two kinds of lateness",
        b: `<p>The second card is a print shop. Each job has a duration and a due time. <b>Lateness</b> is finish minus due, or 0 if early. You can score a schedule by the <b>average</b> or by the <b>maximum</b> lateness, and two schedules can tie on one and differ on the other.</p>`,
        v: F.compare(
          { title: "Average lateness", c: "blue", body: "how late jobs are on the whole" },
          { title: "Maximum lateness", c: "rose", body: "how late the worst job is" },
        ),
        c: C(
          "Two schedules have the same average lateness. Is their maximum lateness certainly the same? | No, one can have a much later worst job | Yes, the average fixes the maximum | Yes, but only if both finish at the same time | An average hides how it is spread: a few very late jobs and many slightly late ones can give the same mean.",
        ),
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
