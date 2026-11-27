/* l16-03: Lecture 16 lessons 16.4 and 16.5: generalisation and graceful degradation (demo), and evolving the weights of a rainfall-runoff network (demo). Kernel, figures and demos come from l16-01.js (NIC.shared.nicL16). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL16;
  const { C, pr, svg, txt, circ, curveSvg, legend, BIG, SMALL, nse, cvFig } = sh;

  const letters = () =>
    `<div class="nw16-chips">${["A", "<i>A</i>", "<b>A</b>", "<span style='font-family:serif'>A</span>", "<u>A</u>"]
      .map((t) => `<span class="tag nw16-chip big">${t}</span>`)
      .join("")}</div>`;

  // ---------- 16.4 bend, don't break (demo) ----------
  N.register({
    id: "l16-graceful",
    lecture: 16,
    order: 4,
    num: "16.4",
    title: "Bend, don't break",
    blurb: "Networks spot patterns in things they've never seen, and lose a little, not everything, when parts fail.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Nell's rain brain with 20 hidden neurons. Switch some off, as a lightning strike might, and watch the prediction and its <b>fit score</b>.",
        ),
      );
      sh.degradeDemo(root, life);
      root.appendChild(
        pr(
          "l16-graceful-1",
          "You switched off one hidden neuron near the peak of the storm. What happened to the prediction? | It dipped a little around that time and the rest stayed close | It collapsed to zero everywhere, from start to finish | It stopped giving any answer at all, like a broken rule | Each hidden neuron carries a small share of the job, so losing one dents the curve locally. That is graceful degradation.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Networks learn the <b>common patterns</b> in data, so they <b>generalise</b> to new cases and tolerate <b>noise</b>.",
            "<b>Graceful degradation</b>: remove neurons and performance drops, but the network probably doesn't fail outright.",
            "A symbolic system usually <b>fails</b> when one component is removed; the brain's fault tolerance is what networks copy.",
          ],
          "Learned patterns bend; hard-coded rules break.",
        ),
      );
    },
  });

  L["l16-graceful"] = {
    sum: "Neural networks learn the common patterns in data, so they generalise to new examples and tolerate noise. They also degrade gracefully: removing neurons reduces performance but probably does not cause total failure, unlike a symbolic system, mirroring fault tolerance in the brain.",
    steps: [
      {
        t: "What makes an A an A?",
        b: `<p>Try writing rules for the letter A: two slanted strokes, a bar across... then someone writes it in italics, bold or a wobbly hand, and your rules break.</p><p>A neural network instead <b>learns the common patterns</b> from many examples. It picks up what separates an A from a B, so it copes with versions it has never seen. That is <b>generalisation</b>, and it also makes networks <b>tolerant of noise</b>.</p>`,
        v: letters(),
        c: C(
          "Why does a trained network cope with a messy handwritten A it has never seen? | It learned the patterns that A's have in common | It stored a copy of every A anyone could write | It follows an expert's hand-written rule for A | Networks learn shared patterns, so they generalise to new examples rather than needing each one stored or spelled out.",
        ),
      },
      {
        t: "Which one is the coffee?",
        b: `<p>You recognise a cup of coffee from above, from the side, half hidden behind a laptop. You do this <b>all the time</b>: we infer properties of new objects and events, and recognise most objects <b>whatever their orientation</b>.</p><p>That everyday skill is exactly why generalisation is so useful, and why Nell wants a rain brain that handles a storm <b>unlike any in its records</b>.</p>`,
        v: svg(
          360,
          120,
          circ(60, 60, 32, "var(--amber)") +
            circ(60, 60, 22, "var(--panel)") +
            `<rect class="fi" x="150" y="30" width="50" height="62" rx="8" fill="var(--amber)"/><path class="draw" d="M200 45 Q222 61 200 77" fill="none" stroke="var(--amber)" stroke-width="6"/>` +
            `<rect class="fi" x="262" y="40" width="60" height="44" rx="4" fill="var(--line)"/>` +
            circ(300, 92, 18, "var(--amber)") +
            txt(60, 112, "from above") +
            txt(180, 112, "from the side") +
            txt(300, 26, "half hidden"),
          "One cup of coffee seen from above, from the side and half hidden: you recognise it every time.",
        ),
      },
      {
        t: "Lose a part, keep going",
        b: `<p>Pull one wire out of a calculator and it may stop working entirely. In a <b>symbolic</b> system, removing one component usually means <b>failure</b>.</p><p>Remove neurons from a neural network and its <b>performance drops</b>, but it <b>probably doesn't fail</b> overall. This <b>graceful degradation</b> mirrors how the brain tolerates damage. Below, Nell's network loses neuron 7 and still tracks the storm closely.</p>`,
        v: (() => {
          const alive = BIG.cen.map((_, k) => k !== 6),
            P = BIG.pred(BIG.w0, alive);
          return curveSvg(P, `Prediction with 19 of 20 hidden neurons: fit score ${nse(P).toFixed(2)}.`) + legend;
        })(),
        c: C(
          "A lightning strike knocks out a few of a network's hidden neurons. What does the lecture expect? | Performance drops, but the network probably still works | The network stops working, like a broken rule system | Nothing changes, since spare neurons take over exactly | Graceful degradation: reduced performance, probably not total failure. Some loss does show, so it is not 'nothing changes'.",
        ),
      },
    ],
    guide: [
      "Tap a few hidden neurons near the start of the storm and watch the curve.",
      "Now switch off neurons 6 to 9, where the flow peaks. Watch the fit score.",
      "Press <b>Restore all</b>, then answer the question after the demo.",
    ],
  };

  // ---------- 16.5 evolving Mossbrook's rain brain (demo) ----------
  N.register({
    id: "l16-evolve",
    lecture: 16,
    order: 5,
    num: "16.5",
    title: "Evolving Mossbrook's rain brain",
    blurb: "Predict sewer flow from rain and temperature, and train the network with an evolutionary algorithm.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A small network with <b>10 hidden neurons</b>. A population of 12 weight sets evolves: crossover, Gaussian mutation, fitness = mean absolute error.",
        ),
      );
      sh.evolveDemo(root, life);
      root.appendChild(
        pr(
          "l16-evolve-1",
          "You pressed Run and watched the error over many generations. What did it do? | Fell fast at first, then crept down slowly | Fell at a steady rate all the way to zero | Jumped up and down with no overall trend | Early mutations fix big mistakes quickly; later ones only polish. The best weight set is kept, so the error never goes up.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Case study: an ANN predicts <b>runoff</b> (sewer flow) from <b>rainfall and air temperature</b>; 10 hidden neurons, 1 output.",
            "<b>Cross-validation</b>, one rainfall event per split, checks that the model generalises.",
            "An <b>EA</b> evolves the weights: each solution is a weight vector, fitness is <b>MAE</b>, mutation adds <b>Gaussian noise</b>; accuracy is judged by <b>Nash-Sutcliffe</b> (best 1).",
          ],
          "Weights are just numbers, so evolution can tune them.",
        ),
      );
    },
  });

  L["l16-evolve"] = {
    sum: "In the lecture's case study a neural network predicts urban rainfall runoff from rainfall and temperature. It has one hidden layer of 10 neurons and one output, is checked by cross-validation over 15 rainfall events, and its weights are optimised by an evolutionary algorithm: continuous representation, MAE fitness, additive Gaussian mutation and crossover. Accuracy is scored by the Nash-Sutcliffe efficiency (best 1, worst minus infinity).",
    steps: [
      {
        t: "Where does the rain go?",
        b: `<p>In a town, rain hits roofs and roads that <b>don't soak anything up</b> (the ground is <b>impervious</b>), so it rushes into the drains. Predicting this <b>rainfall runoff</b> lets water engineers plan for, and limit, <b>flood damage</b>.</p><p>Engineers can use physics-based <b>hydraulic models</b>, or a <b>data-driven</b> approach such as a neural network that learns runoff from past weather. The lecture's case study (Walker et al., 2014) does the second.</p>`,
        v: F.flow(["Rainfall", "Air temperature", "Neural network", { t: "Sewer flow", c: "teal" }]),
        c: C(
          "Why is runoff modelling especially important in towns? | Hard surfaces don't soak up rain, so it all heads for the drains | Towns get far more rain than the countryside does | Hydraulic models can't be used on urban drainage at all | Urban ground is impervious, so rain becomes runoff quickly. Hydraulic models can be used; a network is a data-driven alternative.",
        ),
      },
      {
        t: "Data and a fair test",
        b: `<p>The study used <b>rainfall and air temperature</b> to model <b>sewer flow</b> at a site dominated by infiltration, with data from <b>January 2010 to October 2012</b>: 15 rainfall events.</p><p>The network has a <b>single hidden layer of 10 neurons</b> and <b>one output</b> (predicted flow). To check it generalises, it uses <b>cross-validation</b>: like a mock exam on a paper you haven't practised, each split holds back <b>one rainfall event</b> for testing.</p>`,
        v: (b) => cvFig(b),
        c: C(
          "Why hold one storm back in each cross-validation split? | To test the model on a storm it never trained on | To make training faster by using less data | To find the storm with the most rainfall | Testing on unseen events checks generalisation, not just memory of the training storms.",
        ),
      },
      {
        t: "Weights as a genome",
        b: `<p>Instead of the usual <b>backpropagation</b>, the study trains with an <b>evolutionary algorithm</b>. Each solution is one complete <b>set of network weights</b>: a list of D numbers, a <b>continuous representation</b>.</p><p><b>Fitness</b> is the <b>mean absolute error</b> between predicted and real flow. <b>Crossover</b> mixes two parents' weights; <b>additive Gaussian mutation</b> picks one weight at random and nudges it by a small random amount, usually tiny, now and then bigger.</p><details class="math-more"><summary>Show the maths</summary><p>With predictions $y_i$ and targets $t_i$ over $n$ time steps:</p>$$\\text{MAE}=\\frac{1}{n}\\sum_{i=1}^{n}\\lvert y_i-t_i\\rvert$$<p>Mutation: pick $j$ at random and set $w_j \\leftarrow w_j + \\varepsilon$ with $\\varepsilon\\sim\\mathcal{N}(0,\\sigma^2)$, $\\sigma$ small.</p></details>`,
        v: svg(
          360,
          130,
          [0.3, -0.5, 0.8, 0.1, -0.2, 0.6, 0.4, -0.7]
            .map(
              (w, i) =>
                `<rect class="fi" x="${14 + i * 42}" y="20" width="36" height="36" rx="6" fill="var(--${i === 3 ? "amber" : "panel-2"})" stroke="var(--line)" stroke-width="2"/>` +
                txt(32 + i * 42, 43, i === 3 ? "0.1+ε" : w, "nw16-lab s"),
            )
            .join("") +
            `<path class="draw" d="M100 120 Q160 120 180 76 Q200 120 260 120" fill="none" stroke="var(--violet)" stroke-width="3"/>` +
            txt(180, 70, "ε ~ small Gaussian noise", "nw16-lab s"),
          "A genome of eight weights; mutation adds small Gaussian noise ε to one randomly chosen weight.",
        ),
        c: C(
          "In this EA, what is one individual in the population? | A complete set of weights for the network | A single hidden neuron, with its own one weight | One rainfall event taken from the 15 in the data | Each solution is a weight vector with one decision variable per weight; the network's shape stays fixed.",
        ),
      },
      {
        t: "How good is good?",
        b: `<p>To score the final model the study uses the <b>Nash-Sutcliffe efficiency</b> (NSE). Think of a darts score where a perfect throw is <b>1</b>, guessing the average flow every time scores <b>0</b>, and a truly awful model can sink towards <b>minus infinity</b>.</p><p>So: best value 1, no lower limit. In this course's demo the evolved network climbs past 0.9. (Backpropagation remains the other standard way to train.)</p><details class="math-more"><summary>Show the maths</summary><p>The standard definition (the slides give only its range): with observed $t_i$, mean $\\bar t$ and predictions $y_i$,</p>$$\\text{NSE}=1-\\frac{\\sum_i (y_i-t_i)^2}{\\sum_i (t_i-\\bar t)^2}$$</details>`,
        v: (() => {
          const P = SMALL.pred(SMALL.w0);
          return curveSvg(P, `A well-fitted 10-neuron network: NSE ${nse(P).toFixed(2)}.`) + legend;
        })(),
      },
    ],
    guide: [
      "Press <b>Next generation</b> a few times and watch the blue guess and the <b>Error (MAE)</b>.",
      "Press <b>Run</b> and let it evolve until the <b>Fit score (NSE)</b> passes 0.9.",
      "Press <b>Reset</b> for a new random start, then answer the question after the demo.",
    ],
  };
})();
