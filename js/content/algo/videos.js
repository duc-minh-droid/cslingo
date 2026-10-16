/* Recap videos for Algorithms phases 1 to 6: one node after each phase's boss quiz.
   Each is a one-step lesson that plays videos/out/algo-N.mp4 (made from videos/algo-N.html, see videos/README.md).
   Same rules as the Nature-Inspired recaps (js/content/nic/videos.js): a bonus (m.video) that never counts towards
   finishing a phase or the course, and watching it keeps the streak alive and pays the review amount (5 XP).
   More phases are added to VIDEOS as their videos are recorded. */
(function () {
  const N = NIC,
    { el } = N;
  const L = N.LESSONS;

  const VIDEOS = [
    {
      n: 1,
      blurb: "Phase 1 in pictures: what an algorithm is, how work grows, and how PageRank ranks the web.",
      chapters: [
        "A wish is not an algorithm",
        "A promise that stays true",
        "Count the work, not the seconds",
        "Double the input, watch the work",
        "Rank flows along the links",
        "Closed loops trap the rank",
        "Teleport to escape every trap",
        "Links become a matrix",
        "Repeat until the ranks settle",
      ],
    },
    {
      n: 2,
      blurb: "Phase 2 in pictures: Dijkstra, A* and how routers find the way with no map.",
      chapters: [
        "A map is a graph: every road has a cost",
        "Settle the closest node, then relax its roads",
        "Why settled means final, and when it breaks",
        "A* is Dijkstra plus a compass",
        "Same route, far less work",
        "Routers forward one hop at a time",
        "Routing without a map: ask your neighbours",
        "When a road breaks, the gossip can loop",
      ],
    },
    {
      n: 3,
      blurb: "Phase 3 in pictures: feasible regions, simplex, and searching for a minimum with and without slopes.",
      chapters: [
        "Rules cut the plane, what is left is legal",
        "Slide the profit line until it leaves",
        "Walk corner to corner, never the middle",
        "A slope that flips traps the minimum",
        "No slope needed: one new probe a step",
        "Fit a parabola, jump to its bottom",
        "A triangle flips its worst corner",
        "It crawls down a curved valley",
      ],
    },
    {
      n: 4,
      blurb: "Phase 4 in pictures: spanning trees, Prim, Kruskal and why a cheapest cable across a cut is safe.",
      chapters: [
        "Connect every town with no spare cable",
        "Many spanning trees, one is cheapest",
        "The cheapest cable across a cut is safe",
        "Prim grows one tree, cheapest cable first",
        "Cheapest cable first, never close a loop",
        "Every step is a safe cut",
        "Which is faster? It depends on the network",
        "Walk round the tree, skip the repeats",
        "The tour is never worse than twice the best",
      ],
    },
    {
      n: 5,
      blurb:
        "Phase 5 in pictures: the convex hull, the turn test, gift wrapping, the Graham scan and the farthest pair.",
      chapters: [
        "Stretch a rubber band round the pins",
        "Which way does the path turn?",
        "A convex shape always turns the same way",
        "Wrap the outside, one corner at a time",
        "Sort the points round the lowest one",
        "A stack pops every dent",
        "Which costs less? It depends on the hull",
        "The farthest pair is always on the hull",
      ],
    },
    {
      n: 6,
      blurb:
        "Phase 6 in pictures: how noise flips bits, how parity and CRC catch it, and how Hamming codes fix a single flip.",
      chapters: [
        "Noise flips bits, and nobody tells you",
        "Parity catches an odd number of flips",
        "Check bits come from a long division",
        "The receiver repeats the division",
        "Ask again, or fix it yourself",
        "Valid words must stay far apart",
        "Three checks, each guards a group",
        "The failed checks spell the position",
        "Hamming fixes one error, not two",
      ],
    },
  ];

  VIDEOS.forEach(({ n, blurb, chapters }) => {
    const id = `a${n}-video`,
      src = `videos/out/algo-${n}.mp4`,
      poster = `videos/out/algo-${n}-poster.png`;
    N.register({
      id,
      subject: "algo",
      lecture: n,
      order: 100, // after the boss quiz (99)
      num: `${n}.V`,
      title: `Phase ${n} recap video`,
      blurb,
      video: { src, poster, mins: 2, chapters },
      render() {}, // nothing to try: the video is the lesson's one step
    });
    L[id] = {
      sum: blurb,
      steps: [
        {
          t: `Phase ${n} in two minutes`,
          b: `<p>No sound: the pictures and captions tell it. Pause or scrub any time.</p>
            <details class="pl-chapters"><summary>Chapters</summary><ol>${chapters.map((c) => `<li>${c}</li>`).join("")}</ol></details>`,
          v(box, life) {
            const fig = el(`<figure class="pl-video">
              <video controls playsinline preload="metadata" poster="${N.asset(poster)}" aria-label="Phase ${n} recap video, about two minutes, no sound">
                <source src="${N.asset(src)}" type="video/mp4" />
              </video>
              <figcaption>Silent explainer for phase ${n}. <a href="${N.asset(src)}" target="_blank" rel="noopener">Open the file</a></figcaption>
            </figure>`);
            box.appendChild(fig);
            const v = fig.querySelector("video");
            life.onCleanup(() => {
              try {
                v.pause();
              } catch (e) {
                /* the page is going away */
              }
            });
          },
        },
      ],
    };
  });
})();
