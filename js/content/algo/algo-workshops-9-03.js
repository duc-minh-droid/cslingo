(function () {
  const partScope = (NIC.shared.algoWorkshops9 = NIC.shared.algoWorkshops9 || {});
  const { wavesWorkshop } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a9-mix",
    subject: "algo",
    lecture: 9,
    order: 90,
    num: "9.W",
    workshop: true,
    title: "Workshop: the wave mixer",
    blurb: "Mix waves, read a mystery spectrum, break it by sampling too slowly, then split the DFT in half.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "Waves in, bars out. <b>Mix</b> some sine waves, read the <b>recipe</b> off the spectrum, and then see how the FFT gets it in half the work.",
        missions: [
          {
            id: "mix",
            t: "Mix two waves",
            d: "In <b>Mixer</b>, press <b>+ Add wave</b> and see one bar per wave.",
            hint: "Drag the sliders too: frequency moves a bar sideways, strength changes its height.",
          },
          {
            id: "alias",
            t: "Sample too slowly",
            d: "Slide a wave to <b>20 Hz</b> or more, then drop the samples per second to <b>32</b> or <b>16</b>.",
            hint: "The limit is half the sampling rate. Above it, the bar appears at the wrong frequency.",
          },
          {
            id: "rescue",
            t: "Fix it with more samples",
            d: "Keep the same wave and raise the samples per second until it shows at its true frequency.",
            hint: "You need more than twice the wave's frequency. 64 samples a second is enough for anything up to 31 Hz.",
          },
          {
            id: "mystery",
            t: "Crack the mystery",
            d: "In <b>Mystery</b>, show the spectrum and tap every frequency hiding in the signal.",
            hint: "Short bars count too. Tap each bar that rises above the floor.",
          },
          {
            id: "half",
            t: "Halve the work",
            d: "In <b>Halving</b>, sort the samples into evens and odds, split, run two half DFTs and combine. Inspect two bin pairs.",
            hint: "Indices start at 0: the evens are x0, x2, x4 … x14.",
          },
        ],
        build: wavesWorkshop,
      });
      root.appendChild(
        predict({
          id: "a9-wk-1",
          q: "A 20 Hz tone is sampled 32 times per second. Where does its bar appear in the spectrum?",
          opts: ["At 20 Hz, where it belongs", "At 12 Hz, folded back", "At 52 Hz, off the end"],
          a: 1,
          why: "Half of 32 is 16, and 20 is above that. It folds back to 32 − 20 = 12 Hz, and nothing in the samples can tell it apart from a real 12 Hz wave.",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-wk-2",
          q: "After splitting into even and odd samples, bins 3 and 11 of a 16-point DFT are both built from E[3] and O[3]. How do they differ?",
          opts: [
            "They differ only by a plus or minus on W·O[3]",
            "Bin 11 needs its own full 16-sample DFT",
            "Bin 11 is built from the odd samples only",
          ],
          a: 0,
          why: "X[3] = E[3] + W·O[3] and X[11] = E[3] − W·O[3]. One multiplication feeds both, which is where the savings come from.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A spectrum is a <b>recipe</b>: one bar per wave, with height equal to strength.",
            "Sample at more than <b>twice</b> the highest frequency, or fast waves fold back and pose as slow ones.",
            "Splitting into <b>even and odd</b> samples turns one big DFT into two small ones, and each pair of bins shares a single product.",
          ],
          "Bars show the waves inside, too few samples fake them, and halving the problem is how the FFT saves work.",
        ),
      );
    },
  });

  L["a9-mix"] = {
    sum: "Mix sine waves and read the spectrum, see what sampling too slowly does, then split the DFT into even and odd halves.",
    steps: [
      {
        t: "Waves in, bars out",
        b: `<p>Add sine waves and you get one messy curve. The <b>spectrum</b> undoes the mess: it shows one bar for every wave, at its frequency, as tall as its strength.</p>`,
        v: F.flow([
          { t: "4 Hz wave" },
          { t: "+ 9 Hz wave" },
          { t: "messy curve", c: "amber" },
          { t: "2 bars", c: "teal" },
        ]),
        c: {
          q: "A signal is a 4 Hz wave plus a 9 Hz wave. How many bars does its spectrum have?",
          o: ["Two, at 4 Hz and 9 Hz", "One, at 13 Hz, the total", "Nine, one for each Hz up to 9"],
          a: 0,
          why: "Each wave owns one bar at its own frequency. Frequencies don't add together; the waves do.",
        },
      },
      {
        t: "Halving the work",
        b: `<p>The FFT splits the samples into <b>even-indexed</b> and <b>odd-indexed</b> ones, takes a small DFT of each, then combines. Each pair of output bins shares one product.</p>`,
        v: F.flow([
          { t: "16 samples" },
          { t: "8 even + 8 odd", c: "blue" },
          { t: "two small DFTs", c: "amber" },
          { t: "combine", c: "teal" },
        ]),
        c: {
          q: "Why does splitting into evens and odds save work?",
          o: [
            "Two half-size DFTs cost less than one full",
            "Odd samples can be thrown away entirely",
            "It removes every multiplication from the job",
          ],
          a: 0,
          why: "A DFT of n samples costs about n², so two DFTs of n/2 cost about half as much, and combining them is cheap.",
        },
      },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();
