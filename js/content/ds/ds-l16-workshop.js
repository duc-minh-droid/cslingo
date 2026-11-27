/* Data Science Lecture 16 workshop (16.W): plan Leafly's photo pipeline. Profile it, offload the network, watch the
   copies and meet a time and energy budget by choosing a processor for each stage. No code, no typing.
   Uses the pipeline model from ds-l16-01.js (NIC.shared.ds16). */
(function () {
  const S = NIC.shared.ds16;
  const N = NIC;
  const { qs, takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, fm, seg, stats, setStats, plan, timeline } = S;

  function sandbox(stage, api) {
    const locs = ["cpu", "cpu", "cpu"];
    stage.innerHTML = `<div class="card ds16-ws"><div class="card-head"><h2>Leafly's photo pipeline</h2><span class="tag">one photo</span></div>
      <div class="ds16-pick"><div><b>Prepare photo</b><div class="controls" data-s="0"></div></div>
      <div><b>Run network</b><div class="controls" data-s="1"></div></div>
      <div><b>Show result</b><div class="controls" data-s="2"></div></div></div>
      <div data-g></div>${stats([
        ["blue", "Time per photo"],
        ["teal", "Energy per photo"],
        ["amber", "New chip needed"],
      ])}<div class="fig-cap" data-c></div></div>`;
    const $ = (s) => qs(s, stage);
    const draw = () => {
      const p = plan(locs);
      $("[data-g]").innerHTML = timeline(p, { T: 140, pick: true });
      setStats(stage, [`${fm(p.total)} ms`, `${fm(p.energy)} mJ`, locs.includes("npu") ? "yes" : "no"]);
      $("[data-c]").innerHTML =
        `${fm(p.total)} ms per photo, ${fm(p.copy)} ms of it copying. Budget for the offline app: <b>40 ms</b> and <b>30 mJ</b>.`;
      const noChip = !locs.includes("npu");
      if (p.total < 50 && api.done("offload"))
        api.say("Under 50 ms: the heavy, parallel maths went to a processor built for it.", "happy");
      if (noChip && p.total <= 40 && api.done("copies"))
        api.say("40 ms: only the network crosses over, so only two copies. Every extra hop costs time.", "love");
      if (p.total <= 40 && p.energy <= 30 && api.done("budget"))
        api.say(
          `${fm(p.energy)} mJ: the plant chip does the same work on a fraction of the energy. It costs a new chip, which millions of users can justify.`,
          "laugh",
        );
    };
    const opts = ["cpu:CPU|gpu:GPU", "cpu:CPU|gpu:GPU|npu:Plant chip", "cpu:CPU|gpu:GPU"];
    opts.forEach((o, i) => seg($(`[data-s="${i}"]`), o, "cpu", (v) => ((locs[i] = v), draw())));
    $("[data-g]").addEventListener("click", (e) => {
      const bar = e.target.closest(".ds16-bar");
      if (!bar) return;
      if (bar.dataset.k === "net" && locs[1] === "cpu" && api.done("profile"))
        api.say("Found it: the network is 120 of the 132 ms. That is the function worth moving.", "determined");
      else if (bar.dataset.k !== "net")
        api.say("That stage is only a few milliseconds. Look for the longest bar.", "think");
    });
    draw();
  }

  reg({
    id: "ds16-lab",
    order: 90,
    workshop: true,
    num: "16.W",
    title: "Workshop: plan Leafly's chip",
    blurb:
      "No code. Profile a photo app, move work between CPU, GPU and a plant chip, and meet a time and energy budget.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro: "Leafly must name a plant in 40 ms, offline, on 30 mJ per photo. Choose where each stage runs.",
        missions: [
          {
            id: "profile",
            t: "Profile first",
            d: "With everything on the <b>CPU</b>, tap the bar in the timeline that dominates the time.",
            hint: "It is the longest blue bar.",
          },
          {
            id: "offload",
            t: "Move the heavy maths",
            d: "Choose processors so that <b>Time per photo</b> drops below 50 ms.",
            hint: "Under <b>Run network</b>, pick something other than CPU.",
          },
          {
            id: "copies",
            t: "Mind the copies",
            d: "Without the <b>Plant chip</b>, get <b>Time per photo</b> to 40 ms or less.",
            hint: "Every change of processor adds a copy. Keep <b>Prepare photo</b> and <b>Show result</b> on the CPU.",
          },
          {
            id: "budget",
            t: "Meet the budget",
            d: "Get <b>Time per photo</b> to 40 ms or less <b>and</b> <b>Energy per photo</b> to 30 mJ or less.",
            hint: "The GPU is fast but hungry. Try the <b>Plant chip</b> for the network.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds16-lab-1",
          "You put <b>Prepare photo</b> on the GPU as well as the network. Why does the photo take longer?",
          [
            "The raw photo is bigger, so its copy costs more",
            "The GPU cannot prepare photos, so it has to wait",
            "The network now runs on the CPU",
          ],
          "Preparing on the GPU saves 2 ms of work, but the full-size raw photo must be copied over instead of the smaller prepared image: 20 ms of copying instead of 12.",
        ),
      );
      root.appendChild(
        pr(
          "ds16-lab-2",
          "The plant chip meets both budgets. What is its main drawback?",
          [
            "A new chip must be designed and paid for",
            "It uses more energy than the GPU",
            "It is slower than the CPU at the network",
          ],
          "A specialised chip is expensive to design and only pays off with large demand. It is both faster and more frugal at this one job.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Profile</b> before you move anything: one stage usually dominates.",
            "Every change of processor adds a <b>copy</b>; moving data can cost more than the computing it saves.",
            "Check <b>time and energy</b> together: a specialised chip can win both, at the cost of new hardware.",
          ],
          "Measure, move the hot spot, count the copies.",
        ),
      );
    },
  });

  L["ds16-lab"] = {
    sum: "Plan Leafly's photo pipeline: profile it, move the network off the CPU, keep copies few, and meet a 40 ms and 30 mJ budget.",
    steps: [
      st(
        "What you will practise",
        "<p>One photo goes through three stages: prepare, run the network, show the result. For each you pick a processor: CPU, GPU, or for the network a specialised <b>plant chip</b>. Each change of processor adds a copy. The timeline, time and energy update as you choose.</p>",
        N.fig.flow([
          { t: "Profile", s: "find the hot spot", c: "blue" },
          { t: "Offload", s: "move the network", c: "violet" },
          { t: "Copies", s: "fewer hops", c: "amber" },
          { t: "Budget", s: "time and energy", c: "teal" },
        ]),
        mc(
          "Why does every change of processor add time?",
          ["The data must be copied across", "Each processor restarts the app", "The model must be retrained"],
          "Each processor has its own memory, so the photo or the result has to be copied over before the next stage can start.",
        ),
      ),
      st(
        "Two budgets, not one",
        "<p>Fast is not enough for a phone: the battery matters too. Energy per result is one of the things the lecture says to measure. A GPU can be quick but power-hungry; a chip made for one job can be quick <i>and</i> frugal, at the price of designing new hardware.</p>",
        timeline(plan(["cpu", "cpu", "cpu"]), { T: 140 }),
        mc(
          "Which pair of measurements does Leafly's offline budget combine?",
          ["Latency and energy per result", "Throughput and hardware cost", "Batch size and input size"],
          "40 ms is the latency of one answer and 30 mJ the energy per result. Throughput, cost, batch size and input size matter too, but are not this budget.",
        ),
      ),
    ],
  };
})();
