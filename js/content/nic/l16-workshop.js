/* l16-workshop: Lecture 16 no-code workshop (16.W): wire a neuron, build XOR, stress-test graceful degradation and evolve the weights of Mossbrook's rain brain. Demos come from l16-01.js (NIC.shared.nicL16). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL16;
  const { C, pr, xorFig, neuronDemo, degradeDemo, evolveDemo } = sh;

  function build(stage, api, life) {
    const said = {};
    const once = (k, html, mood) => {
      if (said[k]) return;
      said[k] = 1;
      api.say(html, mood);
    };
    neuronDemo(stage, life, {
      title: "1 · Wire a neuron",
      onChange: (g) => {
        if (g === "NAND")
          (once("gate", "NAND: it fires unless both inputs are on. Negative weights inhibit.", "happy"),
            api.done("gate"));
      },
    });
    const xc = N.el(
      `<div class="card nw16-demo"><div class="card-head"><h2>2 · Build XOR</h2></div><div data-x></div></div>`,
    );
    stage.appendChild(xc);
    xorFig(N.qs("[data-x]", xc), {
      pick: true,
      h1: "AND",
      h2: "OR",
      onChange: (ok) => {
        if (ok)
          (once("xor", "XOR from three neurons: OR and NAND agree only when exactly one input is on.", "happy"),
            api.done("xor"));
      },
    });
    degradeDemo(stage, life, {
      title: "3 · Lightning test",
      onChange: (off, s) => {
        if (off >= 5 && s >= 0.8)
          (once("deg", `${off} neurons down and the fit score is still ${s.toFixed(2)}. Graceful.`, "happy"),
            api.done("deg"));
      },
    });
    evolveDemo(stage, life, {
      title: "4 · Evolve the rain brain",
      onChange: (S) => {
        if (S.nse >= 0.95)
          (once("evo", `Generation ${S.gen}: fit score ${S.nse.toFixed(2)}. Nell can trust this one.`, "happy"),
            api.done("evo"));
      },
    });
  }

  N.register({
    id: "l16-wlab",
    lecture: 16,
    order: 90,
    num: "16.W",
    workshop: true,
    title: "Workshop: Mossbrook's rain brain lab",
    blurb: "No code. Wire a neuron, build XOR from three, knock out neurons and evolve a network's weights.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Four cards for Nell's flood network: a single <b>neuron</b>, an <b>XOR</b> network, a <b>lightning test</b> and an <b>evolution</b> run.",
        missions: [
          {
            id: "gate",
            t: "Make a NAND neuron",
            d: "On card 1, move the <b>weights</b> and <b>threshold</b> until the table shows <b>NAND</b> (fires unless both inputs are 1).",
            hint: "Make both weights negative (−1 each), then try thresholds between −2 and 0.",
          },
          {
            id: "xor",
            t: "Build XOR",
            d: "On card 2, choose the <b>Top</b> and <b>Bottom</b> hidden gates so the network column matches XOR.",
            hint: "One hidden neuron should say 'at least one is on', the other 'not both are on'.",
          },
          {
            id: "deg",
            t: "Survive the lightning",
            d: "On card 3, switch off at least <b>5</b> hidden neurons while the <b>Fit score</b> stays at <b>0.80</b> or more.",
            hint: "Neurons late in the storm (the high numbers) carry little flow. Avoid the ones under the peak.",
          },
          {
            id: "evo",
            t: "Evolve a good fit",
            d: "On card 4, press <b>Run</b> (or <b>Next generation</b>) until the <b>Fit score (NSE)</b> reaches <b>0.95</b>.",
            hint: "It usually takes 20 to 60 generations. If a run stalls, press <b>Reset</b>.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l16-wlab-1",
          "On card 3, which neurons could you switch off with the least harm? | Those late in the storm, where the flow is small | Those under the peak, where the flow is largest | It made no difference which ones you picked | A neuron's share of the prediction follows the flow it covers. Late neurons cover a trickle, so losing them barely dents the fit.",
        ),
      );
      root.appendChild(
        pr(
          "l16-wlab-2",
          "On card 4, why does the fit score never get worse from one generation to the next? | The best weight set is always copied into the next generation | Mutation only ever moves weights in a helpful direction | Crossover always produces a child better than both parents | Elitism keeps the best individual. Mutation and crossover are random and often make things worse, but those children simply lose.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Weights and a threshold turn one neuron into AND, OR, NAND or NOR.",
            "A <b>hidden layer</b> of two neurons plus an output neuron computes <b>XOR</b>.",
            "Losing neurons costs a little accuracy, not everything: <b>graceful degradation</b>.",
            "An EA can train the weights: weight vectors, <b>MAE</b> fitness, <b>Gaussian mutation</b>, judged by <b>NSE</b>.",
          ],
          "Build it, break it, evolve it.",
        ),
      );
    },
  });

  L["l16-wlab"] = {
    sum: "Wire a NAND neuron, build XOR with a hidden layer, show graceful degradation by switching neurons off, and evolve a network's weights with an EA until its Nash-Sutcliffe score passes 0.95.",
    steps: [
      {
        t: "The lab",
        b: `<p>Four cards, one story: Nell's rain brain for Mossbrook. Start with one neuron, team three up to make XOR, test how the network copes when lightning knocks parts out, then evolve its weights from scratch.</p>`,
        v: F.flow(["Wire a neuron", "Build XOR", "Lightning test", { t: "Evolve the weights", c: "teal" }]),
        c: C(
          "A neuron has weights −1 and −1. Both inputs come on. Compared with only one input on, its weighted sum is | lower | higher | the same | Each active input adds −1, so two active inputs give a lower total. That is why negative weights inhibit.",
        ),
      },
      {
        t: "What 'fit score' means",
        b: `<p>Cards 3 and 4 show a <b>fit score</b>: the <b>Nash-Sutcliffe efficiency</b>. A perfect prediction scores <b>1</b>, and bad ones fall below zero with no lower limit. Card 4's EA minimises the <b>mean absolute error</b>, and the fit score rises as the error falls.</p>`,
        v: F.flow(["Error (MAE) falls", { t: "Fit score (NSE) rises towards 1", c: "teal" }]),
        c: C(
          "Which Nash-Sutcliffe value means a perfect model? | 1 | 0 | minus infinity | The best value is 1. The scale has no lower limit: a terrible model can head towards minus infinity.",
        ),
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
