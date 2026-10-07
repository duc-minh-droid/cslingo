/* Recap videos for Nature-Inspired lectures 1 to 6: one node after each lecture's boss quiz.
   Each is a one-step lesson that plays videos/out/lecture-N.mp4 (made from videos/lecture-N.html, see videos/README.md).
   A video is a bonus (m.video): it never counts towards finishing a lecture or a course, and watching it keeps the
   streak alive and pays the review amount (5 XP) without adding to lesson counts. */
(function () {
  const N = NIC,
    { el } = N;
  const L = N.LESSONS;

  const VIDEOS = [
    {
      n: 1,
      blurb: "Lecture 1 in pictures: why copying nature works, and the ingredients every EA needs.",
      chapters: [
        "Copy nature's problem solvers",
        "Trial and error, keep what works",
        "Random guessing vs keep-if-better",
        "One climber gets stuck. Many climbers don't.",
        "Fitter parents are likelier, not certain",
        "Mutate, and mix two parents",
        "One generation: score, select, vary, replace",
        "If you can score it, you can evolve it",
      ],
    },
    {
      n: 2,
      blurb: "Lecture 2 in pictures: fitness, easy against hard problems, and the loop an EA repeats.",
      chapters: [
        "Every solution gets a fitness score",
        "Every extra item doubles the work",
        "An exponential always wins in the end",
        "Prim: always take the cheapest new cable",
        "Add one rule and greedy gets stuck",
        "A quick method, or a slow better one",
        "Select parents, then vary them",
        "Update: who stays in the population?",
      ],
    },
    {
      n: 3,
      blurb: "Lecture 3 in pictures: tours, landscapes, hillclimbing and why a whole team of searchers helps.",
      chapters: [
        "Every EA runs the same loop",
        "A tour is a string, its length is the score",
        "Too many tours to check them all",
        "Keep a small change if it is no worse",
        "Draw every solution as a landscape",
        "Four shapes of landscape, only one is easy",
        "Neighbours are one move away",
        "Escape by sometimes stepping downhill",
        "Send a whole team up the hills",
      ],
    },
    {
      n: 4,
      blurb: "Lecture 4 in pictures: replacement, selection pressure, the three selection methods and the operators.",
      chapters: [
        "Replace everyone, or just a few",
        "A child needs a slot: who gets replaced?",
        "Selection pressure: too weak or too strong",
        "Roulette: slices sized by fitness",
        "Rank selection ignores the raw numbers",
        "Tournament: draw t, the best wins",
        "Mutation must fit the encoding",
        "Crossover mixes two parents' genes",
        "Put it together: evolve a picture",
      ],
    },
    {
      n: 5,
      blurb: "Lecture 5 in pictures: write solutions so mutation and crossover keep them valid.",
      chapters: [
        "A solution is written as a string of genes",
        "Random mutation can break a tour",
        "Swap mutation keeps it valid",
        "Crossover can break a tour too",
        "Repair: swap the repeat for the missing city",
        "Direct: the genes are the answer",
        "Indirect: the genes are instructions",
        "Not every bit is equal",
      ],
    },
    {
      n: 6,
      blurb: "Lecture 6 in pictures: programs as trees, evolved by cutting and pasting subtrees.",
      chapters: [
        "Tell it what to do, not how",
        "A program is a tree",
        "Random programs from two sets of parts",
        "Fitness: run the program and measure its error",
        "Mutation: swap in a new subtree",
        "Crossover: swap subtrees between two parents",
        "Evolve a formula: find x² + x + 1",
        "Five choices before you run",
      ],
    },
  ];

  VIDEOS.forEach(({ n, blurb, chapters }) => {
    const id = `l${n}-video`,
      src = `videos/out/lecture-${n}.mp4`,
      poster = `videos/out/lecture-${n}-poster.png`;
    N.register({
      id,
      subject: "nic",
      lecture: n,
      order: 100, // after the boss quiz (99)
      num: `${n}.V`,
      title: `Lecture ${n} recap video`,
      blurb,
      video: { src, poster, mins: 2, chapters },
      render() {}, // nothing to try: the video is the lesson's one step
    });
    L[id] = {
      sum: blurb,
      steps: [
        {
          t: `Lecture ${n} in two minutes`,
          b: `<p>No sound: the pictures and captions tell it. Pause or scrub any time.</p>
            <details class="pl-chapters"><summary>Chapters</summary><ol>${chapters.map((c) => `<li>${c}</li>`).join("")}</ol></details>`,
          v(box, life) {
            const fig = el(`<figure class="pl-video">
              <video controls playsinline preload="metadata" poster="${N.asset(poster)}" aria-label="Lecture ${n} recap video, about two minutes, no sound">
                <source src="${N.asset(src)}" type="video/mp4" />
              </video>
              <figcaption>Silent explainer for lecture ${n}. <a href="${N.asset(src)}" target="_blank" rel="noopener">Open the file</a></figcaption>
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
