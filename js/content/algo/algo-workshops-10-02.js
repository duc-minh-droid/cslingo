(function () {
  const N = NIC;
  const F = N.fig,
    L = N.LESSONS;
  L["a10-code"] = {
    sum: "Write the two steps at the heart of attention, softmax and the weighted blend, and watch the attention lines thicken as your code runs.",
    steps: [
      {
        t: "What you will write",
        b: `<p>Attention for one token is three moves: <b>score</b> every key with <span class="key">q · k ÷ √d_k</span>, turn the scores into weights with <b>softmax</b>, then <b>blend</b> the value vectors by those weights.</p><p>The scoring is written for you. You fill in <b>two blanks</b>: softmax and the blend.</p>`,
        v: F.flow([
          { t: "Scores", s: "q · k ÷ √d_k", c: "blue" },
          { t: "Blank 1: softmax", s: "scores → weights", c: "amber" },
          { t: "Blank 2: blend", s: "Σ weight × value", c: "amber" },
        ]),
        c: {
          q: "After softmax, what do one token's weights add up to?",
          o: ["Exactly 1", "The number of tokens", "The biggest raw score"],
          a: 0,
          why: "Softmax divides each e^score by the total of all of them, so the shares always sum to 1.",
        },
      },
      {
        t: "Reading the picture",
        b: `<p>Under your code, the sentence is drawn twice. The top row <b>asks</b>; the bottom row <b>answers</b>. A line from the chosen token to each key gets <b>thicker</b> the more weight that key receives.</p><p>Two bar charts show the scores before softmax and the weights after. If a test fails, step through its replay and find the first wrong number.</p>`,
        v: F.compare(
          { title: "Thick line", c: "blue", body: "that key's value counts for a lot in the blend" },
          { title: "Thin line", c: "dim", body: "that key is nearly ignored" },
        ),
        c: {
          q: 'In the picture, a thicker line from "cat" to a key means…',
          o: [
            "Its value counts for more in the blend",
            "That word is nearer in the sentence",
            "Its raw score was the lowest of all",
          ],
          a: 0,
          why: "Line thickness is the softmax weight. A bigger weight means that key's value is mixed in more strongly.",
        },
      },
    ],
    guide: ["Fill the two blanks and pass the tests in the code lab."],
  };
})();
