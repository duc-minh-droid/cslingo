(function () {
  const partScope = (NIC.shared.algoWorkshops4 = NIC.shared.algoWorkshops4 || {});
  const { buildIt } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a4-build",
    subject: "algo",
    lecture: 4,
    order: 90,
    num: "4.W",
    workshop: true,
    title: "Workshop: build the cheapest network",
    blurb:
      "No code. Lay cables Kruskal-style, refuse loops, find safe cables with a cut, and see what a greedy slip costs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "Seven towns need connecting with as little cable as possible. The numbers are costs. Start in <b>Kruskal</b> mode: tap the cheapest cable.",
        missions: [
          {
            id: "k3",
            t: "Lay the three cheapest safe cables",
            d: "In <b>Kruskal</b> mode, tap the cheapest cable, then the next cheapest, and so on.",
            hint: "Look at the list on the right: it is sorted cheapest first. Start with D–F (2).",
          },
          {
            id: "loop",
            t: "Catch a loop",
            d: "Tap a cable whose two ends are <b>already joined</b>. Watch the loop light up.",
            hint: "Once D–F and D–E are laid, E and F are connected through D. Tap E–F (11).",
          },
          {
            id: "mst",
            t: "Finish the network",
            d: "Keep taking the cheapest cable that makes no loop until all seven towns are connected.",
            hint: "Seven towns need six cables. Skip any cable that would join two towns that are already connected.",
          },
          {
            id: "cut",
            t: "Find two safe cables with a cut",
            d: "Open <b>Cut finder</b>. Tap towns to make a purple team, then tap the <b>lightest</b> cable crossing to the rest. Do it for two different cuts.",
            hint: "Try purple = just A. Two cables cross it: A–C (4) and A–B (7). The lighter one is safe.",
          },
          {
            id: "costly",
            t: "Overspend on purpose",
            d: "Open <b>Free build</b> and connect all seven towns <b>without</b> going cheapest first, so your total beats the minimum.",
            hint: "Start with dear cables: F–G (12), A–B (7), then fill in the rest without loops.",
          },
        ],
        build: (stage, api) => buildIt(stage, api),
      });
      root.appendChild(
        predict({
          id: "a4-build-1",
          q: "Two halves of a network are separated by a gap. Cables of cost 3, 8 and 12 cross it. Which one can you commit to without seeing anything else?",
          opts: ["The 3 cable", "The 8 cable", "The 12 cable"],
          a: 0,
          why: "The lightest cable across a cut is always safe: any tree that used the 8 or the 12 here could swap in the 3, stay connected and cost less. That is the cut property.",
        }),
      );
      root.appendChild(
        predict({
          id: "a4-build-2",
          q: "Your hand-built network connects every town. You add one more cable and it closes a loop. Which cable on that loop is safe to drop?",
          opts: [
            "The dearest cable on the loop",
            "The cheapest cable on the loop",
            "Any of them: the total stays the same",
          ],
          a: 0,
          why: "The rest of the loop still connects its towns, so any one cable can go. Dropping the dearest saves the most, and the dearest on a loop is never needed in a cheapest network.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A spanning tree over <b>n</b> towns has exactly <b>n − 1</b> cables and no loops.",
            "<b>Kruskal:</b> go through the cables cheapest first and skip any whose ends are already connected.",
            "<b>Cut property:</b> the lightest cable across any split is safe. Prim uses it with the cut <i>tree | everything else</i>.",
            "<b>Loop property:</b> the dearest cable on a loop is never needed, so swapping it out can only save money.",
          ],
          "Cheapest first, never close a loop: the lightest bridge across any gap is always safe.",
        ),
      );
    },
  });

  L["a4-build"] = {
    sum: "Build a minimum spanning tree by hand: Kruskal's list, loops refused, safe cables from cuts, and the cost of a greedy slip.",
    steps: [
      {
        t: "What you will build",
        b: `<p>You'll connect <b>seven towns</b> with cables that each have a cost. Every town must be reachable, and the total cost must be as small as possible.</p><p>The cheapest answer never has a loop, so it always uses <span class="key">one fewer cable than there are towns</span>.</p>`,
        v: F.compare(
          { title: "A spanning tree", c: "teal", body: "all towns connected, <b>no loops</b>, n − 1 cables" },
          { title: "A loop", c: "rose", body: "one cable is spare: drop it and everything stays connected" },
        ),
        c: {
          q: "You must connect seven towns with the cheapest possible network. How many cables does it use?",
          o: ["Six", "Seven", "Eight"],
          a: 0,
          why: "A network with no loops and every town connected has n − 1 cables, which is six for seven towns. A seventh cable would close a loop.",
        },
      },
      {
        t: "Two rules, one idea",
        b: `<p><b>Kruskal:</b> walk the cables cheapest first. Lay a cable unless its two ends are already connected, because that would make a loop.</p><p><b>Cut property:</b> split the towns into two teams. The lightest cable crossing between them is always safe to lay.</p>`,
        v: F.flow([
          { t: "Cheapest left", c: "blue" },
          { t: "Loop?", s: "skip it", c: "rose" },
          { t: "Lay it", c: "teal" },
        ]),
        c: {
          q: "Kruskal reaches a cable whose two ends are already joined by other cables. What does it do?",
          o: [
            "Skips it, as it would only make a loop",
            "Lays it, because it is cheap enough",
            "Lays it and removes the cheapest cable nearby",
          ],
          a: 0,
          why: "Two towns that are already connected do not need another route between them, so the cable would be a wasted loop.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
