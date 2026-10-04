(function () {
  const partScope = (NIC.shared.algoWorkshops11 = NIC.shared.algoWorkshops11 || {});
  const { picker } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a11-picker",
    subject: "algo",
    lecture: 11,
    order: 90,
    num: "11.W",
    workshop: true,
    title: "Workshop: pick the algorithm",
    blurb: "Be the consultant. Match ten client problems to the right tool, and see each tool fit or fail.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "You are the consultant. Each client brings a problem. Drag their card onto the tool that fits, or tap the tool. Name the <b>assumption</b> that decides it.",
        missions: [
          {
            id: "first",
            t: "First match",
            d: "Route a client to the right tool and watch the demo.",
            hint: "Read what the client needs: every junction, one goal, cheapest total, a fence, one flipped bit, edits showing up, frequencies, letters, a mix, link scores.",
          },
          {
            id: "trap",
            t: "Watch a tool fail",
            d: "Pick a tool that does not fit. Some of them play a demo showing why they fail.",
            hint: "Try <b>MST</b> on the ambulance case, or <b>CRC</b> on the probe. A slip resets your combo, so do it on purpose.",
          },
          {
            id: "combo",
            t: "Combo of three",
            d: "Get three right in a row with no slip in between.",
            hint: "If you slip, the combo resets. Restart the deck to try again from the top.",
          },
          {
            id: "clear",
            t: "Clear the desk",
            d: "Match all ten clients.",
            hint: "Some decoys are close cousins: CRC and Hamming, Huffman and LZW, Dijkstra and A*, PageRank and Attention.",
          },
          {
            id: "sharp",
            t: "Sharp consultant",
            d: "Finish all ten with two slips or fewer.",
            hint: "Use <b>Restart deck</b> for a clean run once you know the answers, and explain each one to yourself.",
          },
        ],
        build: (stage, api) => picker(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "a11-picker-1",
          q: "A planner's route tool starts returning wrong answers after refund roads with negative cost are added. What broke?",
          opts: [
            "The settled-means-final rule",
            "The rule that an MST has no loops",
            "The need for parity bits to overlap",
          ],
          a: 0,
          why: "Dijkstra locks in the closest unsettled node because any detour can only add cost. A negative road subtracts cost, so a settled node can later be undercut.",
        }),
      );
      root.appendChild(
        predict({
          id: "a11-picker-2",
          q: "A link flips one bit and the receiver cannot ask for a resend. Which tool repairs it?",
          opts: ["Hamming code", "CRC", "Hash chain"],
          a: 0,
          why: "Hamming's overlapping parity checks spell out the position of a single flipped bit. A CRC only detects the error, and a hash chain guards against edits, not noise.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Pick the algorithm by the <b>assumption</b> it exploits: non-negative costs, a safe cut, skewed symbols, a linear objective, one flipped bit.",
            "Close cousins differ in what they promise: <b>shortest route</b> is not <b>cheapest wiring</b>, and <b>detect</b> is not <b>correct</b>.",
            "When an assumption breaks, find the guarantee that went with it, then choose a tool that survives.",
          ],
          "Name the tool and the assumption that makes it right.",
        ),
      );
    },
  });
  L["a11-picker"] = {
    sum: "Play consultant: match ten client problems to the right algorithm from the whole course, and watch each choice fit or fail.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>Ten phases, ten tools. Each brief hides one <b>decisive assumption</b>: costs that are never negative, a linear objective, a single flipped bit.</p><p><span class="key">Find the assumption first. The algorithm follows.</span></p>`,
        v: F.flow([
          { t: "Read the brief", c: "blue" },
          { t: "Spot the assumption", c: "amber" },
          { t: "Choose the tool", c: "teal" },
        ]),
        c: {
          q: "What should you look for first in a client brief?",
          o: [
            "The assumption behind the right tool",
            "The longest word in the problem",
            "Whichever algorithm you met most recently",
          ],
          a: 0,
          why: "Every algorithm is a bet on its assumptions, so the assumptions in the brief point to the tool.",
        },
      },
      {
        t: "Near neighbours",
        b: `<p>The hard cases are cousins: <b>Dijkstra</b> and the minimum spanning tree (<b>MST</b>) both grow outwards greedily, but one minimises a journey and the other the total wiring. The cyclic redundancy check (<b>CRC</b>) and <b>Hamming</b> codes both add check bits, but only one can repair.</p>`,
        v: F.compare(
          { title: "Shortest path", c: "blue", body: "cheapest journey from one start" },
          { title: "MST", c: "teal", body: "cheapest wiring for everyone" },
        ),
        c: {
          q: "Which goal does an MST serve?",
          o: [
            "Linking every point as cheaply as possible",
            "Finding the quickest journey between two points",
            "Finding the outline around a set of points",
          ],
          a: 0,
          why: "An MST minimises the total cost of a connected network, which is not the same as any single shortest route.",
        },
      },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();
