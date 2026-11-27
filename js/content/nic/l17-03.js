/* l17-03: Lecture 17 lessons 17.4 to 17.6: learning from spike timing (STDP), why backpropagation gets stuck (the Dirac delta and surrogate functions), and evolving SNNs with evolutionary algorithms. Figures and demos come from l17-01.js (NIC.shared.nicL17). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL17;
  const { C, pr, raster, diracFig, surrFig, stdpDemo } = sh;
  const b12 = (on) => Array.from({ length: 8 }, (_, t) => on.includes(t + 1));

  // ---------- 17.4 STDP (demo) ----------
  N.register({
    id: "l17-stdp",
    lecture: 17,
    order: 4,
    num: "17.4",
    title: "Fire first, get closer",
    blurb: "Connections that predict each other get stronger, all by themselves: spike-timing-dependent plasticity.",
    render(root) {
      root.appendChild(
        header(
          this,
          "One connection from a <b>pre</b> neuron to a <b>post</b> neuron over 12 steps. Tap spikes on and off and watch the <b>weight</b>.",
        ),
      );
      stdpDemo(root);
      root.appendChild(
        pr(
          "l17-stdp-1",
          "Press <b>Clear</b>, then give <b>post</b> a spike one step <b>before</b> each <b>pre</b> spike, several times. What happens to the weight? | It goes negative: the link weakens | It climbs: the link strengthens | It stays at 0: the order doesn't matter | Post firing before pre is depression, so each such pair takes 1 off. The link is weakened because pre clearly didn't cause post.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>STDP</b>: a synapse changes strength based on the <b>timing</b> of pre- and post-synaptic spikes.",
            "<b>Potentiation</b>: pre fires before post, the connection is <b>strengthened</b>. <b>Depression</b>: post fires before pre, it is <b>weakened</b>.",
            "No teacher or labels are needed, so STDP supports <b>unsupervised learning</b>.",
          ],
          "Pre then post: stronger. Post then pre: weaker.",
        ),
      );
    },
  });

  L["l17-stdp"] = {
    sum: "In spike-timing-dependent plasticity, a synapse adapts its strength based on activity: if the pre-synaptic neuron fires before the post-synaptic neuron the connection is strengthened (potentiation); if the post-synaptic neuron fires first it is weakened (depression). It supports unsupervised learning.",
    steps: [
      {
        t: "Sender and receiver",
        b: `<p>Think of a doorbell and a dog. The bell rings, then the dog barks.</p><p>A connection between two neurons is a <b>synapse</b>. The neuron that sends is the <b>pre-synaptic</b> neuron and the one that receives is the <b>post-synaptic</b> neuron. Synapses aren't fixed: they <b>adapt their strength</b> based on activity patterns. In Pip, one synapse runs from a "whisker touched" neuron to a "stop!" neuron.</p>`,
        v: F.flow([
          { t: "Pre-synaptic (whisker)", c: "blue" },
          "synapse (weight)",
          { t: "Post-synaptic (stop!)", c: "amber" },
        ]),
      },
      {
        t: "Bell, then bark: stronger",
        b: `<p>If the bell keeps ringing just before the dog barks, the dog learns that the bell matters.</p><p>Same here: if the <b>pre</b>-synaptic neuron fires <b>before</b> the <b>post</b>-synaptic one, the pre spike probably helped cause it, so the connection is <b>strengthened</b>. This is <b>potentiation</b>. In this train, pre fires at steps 2 and 5, and post follows one step later each time.</p>`,
        v: raster([
          { lab: "pre", s: b12([2, 5]), c: "blue" },
          { lab: "post", s: b12([3, 6]), c: "amber" },
        ]),
        c: C(
          "Pip's whisker neuron (pre) fires, and a moment later the stop neuron (post) fires. What does STDP do to their link? | Strengthens it: potentiation | Weakens it: depression | Nothing: both fired, so it evens out | Pre before post means the sender may have caused the receiver to fire, so the connection is strengthened.",
        ),
      },
      {
        t: "Bark, then bell: weaker",
        b: `<p>If the dog barks first and the bell rings afterwards, the bell clearly didn't cause the bark.</p><p>When the <b>post</b>-synaptic neuron fires <b>before</b> the <b>pre</b>-synaptic one, the connection is <b>weakened</b>. This is <b>depression</b>. Over many spikes, links that predict each other grow and the rest fade.</p><details class="math-more"><summary>Show the maths</summary><p>The demo's simple rule (the lecture's activity uses +1 and −1): for each step $t$,</p>$$\\text{pre}_{t-1}\\wedge\\text{post}_t \\Rightarrow w \\leftarrow w+1,\\qquad \\text{post}_{t-1}\\wedge\\text{pre}_t \\Rightarrow w \\leftarrow w-1$$<p>Real STDP weights the change by how close the two spikes are, usually with an exponential decay in the time gap.</p></details>`,
        v: raster([
          { lab: "pre", s: b12([3, 6]), c: "blue" },
          { lab: "post", s: b12([2, 5]), c: "amber" },
        ]),
      },
      {
        t: "Learning with no teacher",
        b: `<p>Nobody tells the dog the right answer; it picks up the pattern from experience.</p><p>STDP needs no labels or target outputs, only the spikes themselves. That is why it supports <b>unsupervised learning</b>: Pip can tune its own links while it drives around the garden.</p>`,
        v: F.compare(
          {
            title: "Backprop (Lecture 16)",
            c: "blue",
            body: "Needs a target output<br>Error flows backwards<br>Supervised",
          },
          { title: "STDP", c: "teal", body: "Needs only spike timing<br>Each synapse updates locally<br>Unsupervised" },
        ),
        c: C(
          "Why does STDP count as unsupervised learning? | It changes weights from spike timing alone, with no target answers | It only works once a teacher has labelled every spike as right or wrong | It removes neurons that never fire | The rule uses only when pre and post fire. No labelled examples are needed.",
        ),
      },
    ],
    guide: [
      "Tap boxes in the pre and post rows to add or remove spikes.",
      "Make post fire one step after pre and watch the strengthened count go up.",
      "Press <b>Clear</b> and try the opposite order.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 17.5 why backprop gets stuck (no demo) ----------
  N.register({
    id: "l17-surrogate",
    lecture: 17,
    order: 5,
    num: "17.5",
    title: "Where backprop gets stuck",
    blurb:
      "A spike is all or nothing, so it has no useful slope. Smooth it over with a surrogate and training works again.",
    render(root) {
      root.appendChild(header(this, "Backpropagation, the Dirac delta and surrogate spiking functions."));
      root.appendChild(
        takeaways(
          [
            "<b>Backpropagation</b> needs the slope (derivative) of each neuron's function.",
            "A spike's derivative is the <b>Dirac delta</b>: zero everywhere except at the threshold, so <b>no gradient information</b>.",
            "A <b>surrogate</b> such as a sigmoid gives a bell-shaped slope; a larger <b>k</b> makes it sharper and closer to the delta.",
          ],
          "No slope, no backprop: borrow a smooth stand-in.",
        ),
      );
    },
  });

  L["l17-surrogate"] = {
    sum: "Backpropagation adapts weights using each neuron's derivative. A spiking function's derivative is the Dirac delta (zero except at one point), so there is no gradient information. A surrogate spiking function, such as a sigmoid with a sharpness factor k, gives a usable bell-shaped slope that approaches the delta as k grows.",
    steps: [
      {
        t: "Backprop needs a slope",
        b: `<p>Lecture 16 trained networks with <b>backpropagation</b>: start at the output layer, measure the error, and work <b>backwards</b> nudging each weight.</p><p>Picture walking downhill in fog: you feel the <b>slope</b> under your feet to know which way to step. Backprop feels the slope of each neuron's function (its <b>derivative</b>; for the sigmoid it's f(a)(1 − f(a))). No slope, no direction.</p><details class="math-more"><summary>Show the maths</summary>$$w_{ij}^{(t+1)} = w_{ij}^{(t)} + \\eta\\,\\delta_{pj}\\,o_{pj}$$<p>Output units: $\\delta_{pj} = z\\,o_{pj}(1-o_{pj})(t_{pj}-o_{pj})$. Hidden units: $\\delta_{pj} = z\\,o_{pj}(1-o_{pj})\\sum_k \\delta_{pk} w_{pk}$, where $o(1-o)$ is the sigmoid derivative $f'(a)=f(a)(1-f(a))$, $\\eta$ the learning rate and $t_{pj}$ the target.</p></details>`,
        v: F.flow(["Output error", "Hidden layer", { t: "Input weights", c: "teal" }]),
      },
      {
        t: "A cliff, not a slope",
        b: `<p>Now picture standing on a perfectly flat plateau with one sheer cliff. Everywhere you stand, the ground is level: no hint which way to go.</p><p>A spiking neuron is like that: below the threshold it outputs 0, at the threshold it jumps to a spike. Its derivative is the <b>Dirac delta</b>: <b>zero everywhere</b> except one infinitely thin spike at the threshold. So there is <b>no gradient information</b>, and plain backpropagation <b>can't be used</b>.</p><details class="math-more"><summary>Show the maths</summary>$$\\delta(x)=0\\ \\text{for all}\\ x\\neq 0,\\qquad \\int_{-\\infty}^{\\infty}\\delta(x)\\,dx = 1$$</details>`,
        v: diracFig(),
        c: C(
          "Why can't plain backpropagation train a spiking network? | The spike's derivative is zero almost everywhere, so there's no gradient | Spiking networks have no output layer for the error to start from | The spikes are too large for the weight update | Backprop follows the slope, and the derivative of the spike function is the Dirac delta: zero except at a single point. It gives no direction to move.",
        ),
      },
      {
        t: "Borrow a smooth stand-in",
        b: `<p>Engineers sometimes swap a cliff for a ramp so a robot can drive up it. The trick here is the same.</p><p>Keep the real spikes going forward, but when working out slopes, pretend the neuron used a smooth <b>surrogate spiking function</b>, such as the <b>sigmoid</b>. Its slope is a <b>bell-shaped curve</b> centred on the threshold (a bit like a Gaussian), so backprop gets a direction again.</p>`,
        v: (b) => surrFig(b, { k: 1 }),
      },
      {
        t: "How sharp should it be?",
        b: `<p>A scaling factor <b>k</b> sets how steep the sigmoid is. A small k gives a <b>low, wide</b> bell: a gentle slope everywhere. A large k gives a <b>tall, thin</b> bell, and as k grows without limit the slope becomes the <b>Dirac delta</b> itself. Switch between the three curves from the lecture.</p><details class="math-more"><summary>Show the maths</summary>$$f_k(a)=\\frac{1}{1+e^{-ka}},\\qquad f_k'(a)=k\\,f_k(a)\\,(1-f_k(a)),\\qquad \\lim_{k\\to\\infty} f_k'(a)=\\delta(a)$$<p>The peak of $f_k'$ is $k/4$ at $a=0$: 0.25 for $k=1$, 1.25 for $k=5$ and 5 for $k=20$.</p></details>`,
        v: (b) => surrFig(b, { k: 20 }),
        c: C(
          "As the sharpness factor k gets very large, what does the surrogate's slope look like? | A tall, thin spike close to the Dirac delta | A flat line at zero everywhere | A wide gentle hill spread over every input | Larger k squeezes the bell: taller and thinner. In the limit it becomes the Dirac delta, the true spike's derivative.",
        ),
      },
    ],
  };

  // ---------- 17.6 evolving SNNs (no demo) ----------
  N.register({
    id: "l17-evolve",
    lecture: 17,
    order: 6,
    num: "17.6",
    title: "Let evolution design the brain",
    blurb: "Evolutionary algorithms can tune an SNN's weights, delays and thresholds, and even its shape. At a price.",
    render(root) {
      root.appendChild(header(this, "Optimising spiking networks with evolutionary algorithms."));
      root.appendChild(
        takeaways(
          [
            "EAs can optimise an SNN's <b>structure</b> and <b>parameters</b> (weights, delays, thresholds): <b>neural architecture search</b>.",
            "Often a <b>bi-level</b> problem: the structure is the upper problem, the weights the lower one, and the search switches between them.",
            "Challenges: the <b>cost</b> (SNNs are pricier to optimise than ANNs, inside an iterative EA) and wider <b>co-evolution</b>.",
          ],
          "Evolve the shape, then the weights, and switch back and forth.",
        ),
      );
    },
  });

  L["l17-evolve"] = {
    sum: "Evolutionary algorithms can optimise an SNN's structure and parameters such as weights, delays and thresholds (neural architecture search), often as a bi-level problem that switches between the structure (upper) and the weights (lower). It is expensive, and co-evolving several aspects together is an open challenge.",
    steps: [
      {
        t: "Breed better brains",
        b: `<p>Gradients are awkward for spikes, but evolution never needed them. Earlier lectures bred solutions by selection, crossover and mutation.</p><p>An EA can tune an SNN's <b>parameters</b>, such as <b>weights</b>, <b>delays</b> and <b>thresholds</b>, and even its <b>structure</b>: how many neurons and how they connect. Searching for a network's shape is called <b>neural architecture search</b>. For Pip, each candidate brain is scored by how well it drives.</p>`,
        v: F.cycle(["Population of SNNs", "Test on Pip", "Select the best", "Mutate and cross"]),
        c: C(
          "Which of these can an EA tune in a spiking network? | Weights, delays, thresholds and the structure itself | Only the weights, like backpropagation does | Only the input data the network receives | The lecture lists structure and parameters such as weights, delays and thresholds. Searching over the structure is neural architecture search.",
        ),
      },
      {
        t: "Two problems, one inside the other",
        b: `<p>Think of designing a kitchen: first choose the layout, then arrange the cupboards within it. You can't judge a layout until its cupboards are sorted.</p><p>Evolving an SNN is often a <b>bi-level optimisation problem</b>: the <b>structure</b> is the <b>upper</b> problem and the <b>weights</b> are the <b>lower</b> one. The search <b>periodically switches</b> between optimising the structure and optimising the weights.</p>`,
        v: F.cycle(
          [
            { t: "Upper: structure", c: "violet" },
            { t: "Lower: weights", c: "blue" },
          ],
          { center: "switch" },
        ),
        c: C(
          "In the bi-level view of evolving an SNN, which part is the upper problem? | The network's structure | The network's weights | The training data | The structure is the upper problem and the weights the lower one; the search switches between them.",
        ),
      },
      {
        t: "The price tag",
        b: `<p>Breeding racehorses takes generations, and every foal needs a trial run.</p><p>Two challenges. <b>Cost</b>: SNNs are already <b>more expensive to optimise than ANNs</b>, and an EA is highly iterative, testing many networks over many generations. And <b>wider co-evolution</b>: optimising several aspects of the SNN together (structure, weights, delays, thresholds) rather than one at a time.</p>`,
        v: F.bars(
          [
            ["One SNN test", 1, "teal"],
            ["One generation (30 SNNs)", 30, "amber"],
            ["100 generations", 3000, "rose"],
          ],
          {
            unit: " tests",
            label: "Illustration: one test, 30 tests per generation of 30 networks, 3000 tests over 100 generations.",
          },
        ),
      },
    ],
  };
})();
