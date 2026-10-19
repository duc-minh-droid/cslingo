/* Recap videos for Data Science lectures: one node after each lecture's boss quiz.
   Each is a one-step lesson that plays videos/out/ds-N.mp4 (made from videos/ds-N.html, see videos/README.md).
   Same rules as the Nature-Inspired and Algorithms recaps (js/content/nic/videos.js): a bonus (m.video) that never counts
   towards finishing a lecture or a course, and watching it keeps the streak alive and pays the review amount (5 XP).
   A lecture is added to VIDEOS once its mp4 and poster exist in videos/out/: {n, blurb, chapters: [scene titles]}.
   Chapters come from the built page: VPREFIX=ds node <scratchpad>/titles.mjs N, or VID.scenes titles of videos/ds-N.html. */
(function () {
  const N = NIC,
    { el } = N;
  const L = N.LESSONS;

  const VIDEOS = [];

  VIDEOS.forEach(({ n, blurb, chapters }) => {
    const id = `ds${n}-video`,
      src = `videos/out/ds-${n}.mp4`,
      poster = `videos/out/ds-${n}-poster.png`;
    N.register({
      id,
      subject: "ds",
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
