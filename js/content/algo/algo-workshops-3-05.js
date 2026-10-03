(function () {
  const partScope = (NIC.shared.algoWorkshops3 = NIC.shared.algoWorkshops3 || {});
  const { cornerHunt } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a3-lab",
    subject: "algo",
    lecture: 3,
    order: 90,
    num: "3.W",
    workshop: true,
    title: "Workshop: corner hunt",
    blurb:
      "No code. Drag plans, slide the profit line and walk corner to corner to see why the best plan is always a corner.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "A factory makes two products, X and Y, with limited machine hours and raw material. Start with <b>Try plans</b>: drag the dot around the map.",
        missions: [
          {
            id: "plan",
            t: "Make a legal plan, then break a rule",
            d: "In <b>Try plans</b>, drop the dot inside the green area, then outside it, and see which rule breaks.",
            hint: "Drag the dot past the purple or orange line. The line you crossed turns red and the coach names the rule.",
          },
          {
            id: "slide",
            t: "Slide the profit line until it leaves",
            d: "In <b>Slide profit</b>, raise z until the line just touches the green area at a single corner.",
            hint: "Drag the slider up. The thick orange part is the legal plans on the line. When it shrinks to a dot, you are at the best profit.",
          },
          {
            id: "walk",
            t: "Walk to the best corner",
            d: "In <b>Walk corners</b>, step from the origin along edges, only to corners that earn more, until you can't improve.",
            hint: "From the origin, tap a neighbouring corner with a bigger profit. The corner table shows every profit.",
          },
          {
            id: "jump",
            t: "Tilt the profit line: make the optimum jump",
            d: "Change <b>£ per unit of Y</b> until a different corner becomes the best one.",
            hint: "Raise it above £6, or lower it below £1. At exactly those prices there is a tie.",
          },
          {
            id: "cap",
            t: "Squeeze it with a cap",
            d: "Switch on the <b>demand cap</b> and lower it until it stops you and changes the best plan.",
            hint: "Add the cap at y ≤ 4: it does nothing at first (slack). Drag it below 3 and it starts to bind.",
          },
        ],
        build: (stage, api) => cornerHunt(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "a3-lab-1",
          q: "The profit line touches the green area along a whole edge, not just at one corner. What does that tell you?",
          opts: [
            "Every point along that edge is optimal",
            "The problem has no optimum at all",
            "Only the corner nearest the origin is optimal",
          ],
          a: 0,
          why: "If the profit line is parallel to an edge, all points on that edge earn the same profit, and it is the most available. Both end corners are optimal, so checking corners still finds the best value.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-lab-2",
          q: "A new rule is added, but the best corner still satisfies it with room to spare. What happens to the best plan?",
          opts: [
            "It stays exactly where it was",
            "It moves to the nearest corner of the new rule",
            "It drops, because every extra rule costs some profit",
          ],
          a: 0,
          why: "A rule with slack at the optimum isn't holding you back, so removing or adding it changes nothing there. Only a binding rule, one that passes through the optimum, can push the best plan to a new corner.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Legal plans sit inside the <b>feasible region</b>, where every rule holds at once.",
            "Slide the profit line outwards: the last place it touches is a <b>corner</b> (or a whole edge, in a tie).",
            "<b>Simplex</b> walks along edges to a neighbouring corner that earns more, and stops when none does.",
            "A <b>binding</b> rule passes through the optimum and costs profit; a rule with <b>slack</b> changes nothing there.",
          ],
          "Walk from corner to corner, only uphill: when no neighbour earns more, you are at the best plan.",
        ),
      );
    },
  });

  L["a3-lab"] = {
    sum: "Explore a factory LP by hand: legal plans, the sliding profit line, simplex-style corner walks and binding rules.",
    steps: [
      {
        t: "What you will explore",
        b: `<p>A factory makes <b>X</b> (£3 each) and <b>Y</b> (£2 each). Machine hours and raw material are limited, so only some plans are <b>legal</b>: those inside the green polygon.</p><p>In the workshop you'll drag plans around, slide the profit line, and walk the corners the way <b>simplex</b> does.</p>`,
        v: F.flow([
          { t: "Feasible region", c: "teal" },
          { t: "Profit line", c: "amber" },
          { t: "Best corner", c: "blue" },
        ]),
        c: {
          q: "A plan breaks the raw-material rule but respects machine hours. Is it legal?",
          o: [
            "No, every rule must hold at once",
            "Yes, one rule satisfied is enough",
            "Yes, if its profit is high enough",
          ],
          a: 0,
          why: "The feasible region is where all constraints hold together. Breaking even one puts the plan outside it, however profitable.",
        },
      },
      {
        t: "Uphill along edges",
        b: `<p>The profit line gets more profit as it slides outwards. The best plan is the last point it touches, always a <b>corner</b>.</p><p>Simplex starts at one corner and steps to a neighbour that earns <b>more</b>. When every neighbour earns less, it stops.</p>`,
        v: F.compare(
          { title: "Step uphill", c: "teal", body: "move to a neighbouring corner with higher profit" },
          { title: "No uphill step", c: "amber", body: "stop: this corner is optimal" },
        ),
        c: {
          q: "At a corner, both neighbouring corners earn less. What should simplex do?",
          o: [
            "Stop, because this corner is optimal",
            "Step to the lower one to escape",
            "Restart from the centre of the region",
          ],
          a: 0,
          why: "A linear profit has no local traps: if no neighbouring corner is better, none anywhere is, so the walk can stop.",
        },
      },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();
