/* js/bank/ds-49.js: Data Science lecture 11 revision questions, part 1: ds11-patterns and ds11-sgd. */
(function () {
  const B = NIC.bank;
  const { mc, svg, tx, line } = NIC.shared.ds11;

  /** Four small pattern diagrams to pick from: push, broadcast, reduce, all-reduce. */
  const sq = (x, y, c) =>
    `<rect x="${x}" y="${y}" width="22" height="16" rx="4" fill="color-mix(in srgb,var(--${c}) 25%,var(--panel))" stroke="var(--${c})" stroke-width="2"/>`;
  const panel = (k, x0, kind) => {
    const ys = [12, 34, 56, 78];
    let inner = "";
    if (kind === "push")
      inner = sq(x0 + 10, 44, "blue") + line(`M${x0 + 32} 52H${x0 + 88}`, "blue") + sq(x0 + 88, 44, "violet");
    if (kind === "bcast")
      inner =
        sq(x0 + 10, 44, "blue") +
        ys.map((y) => line(`M${x0 + 32} 52L${x0 + 88} ${y + 8}`, "blue") + sq(x0 + 88, y, "amber")).join("");
    if (kind === "red")
      inner =
        ys.map((y) => sq(x0 + 10, y, "amber") + line(`M${x0 + 32} ${y + 8}L${x0 + 88} 52`, "blue")).join("") +
        sq(x0 + 88, 44, "violet");
    if (kind === "all")
      inner =
        ys.map((y) => sq(x0 + 4, y, "amber") + line(`M${x0 + 26} ${y + 8}L${x0 + 60} 52`, "blue")).join("") +
        ys.map((y) => line(`M${x0 + 60} 52L${x0 + 94} ${y + 8}`, "rose") + sq(x0 + 94, y, "amber")).join("");
    return `<g data-pick="${k}" style="cursor:pointer"><rect x="${x0}" y="4" width="122" height="118" rx="10" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/>${inner}${tx(x0 + 61, 114, `Diagram ${k}`, { s: 11 })}</g>`;
  };
  const diagrams = svg(
    520,
    126,
    panel("A", 2, "bcast") + panel("B", 132, "all") + panel("C", 262, "push") + panel("D", 392, "red"),
    "Four communication diagrams A to D",
  );

  B.add("ds11-patterns", [
    {
      type: "cat",
      q: "Push or pull? Sort each message.",
      buckets: ["Push", "Pull"],
      items: [
        ["A weather sensor sends its reading to the server every minute", 0],
        ["A phone asks a server for new messages when the app opens", 1],
        ["A browser requests a page from a web server", 1],
        ["A build machine sends finished files to storage as soon as they exist", 0],
        ["An idle worker asks the scheduler for its next task", 1],
        ["A leader sends each new log entry to its followers", 0],
      ],
      why: "In a push the sender starts the exchange (A sends to B). In a pull the receiver starts it by requesting the data (B requests from A).",
    },
    mc(
      "What is the difference between a reduce and an all-reduce?",
      [
        "Where the result ends up: one machine or all of them",
        "Which operation they apply: a sum or a maximum",
        "How many machines send data: one or many",
      ],
      "Both combine values from many machines (usually by summing). A reduce materialises the result on one machine; an all-reduce materialises it on every machine that took part.",
    ),
    {
      type: "slider",
      q: "A coordinator broadcasts a 25 MB model to 8 workers, sending every copy itself. How much data leaves the coordinator?",
      min: 0,
      max: 400,
      step: 25,
      start: 0,
      ans: 200,
      tol: 0,
      unit: " MB",
      hint: "One copy per worker: 8 × 25.",
      why: "Each of the 8 workers needs its own copy of the same 25 MB: 8 × 25 = 200 MB.",
    },
    {
      type: "order",
      q: "Put the stages of an all-reduce (done as a reduce, then a broadcast) in order.",
      items: [
        "Every machine sends its value to the summing point",
        "The values are added together",
        "The total is sent back to every machine",
        "Every machine carries on with the same total",
      ],
      why: "An all-reduce first reduces the values to one result, then delivers that result to all the participating machines.",
    },
    {
      type: "pick",
      q: "Tap the diagram that shows a <b>reduce</b>.",
      fig: diagrams,
      a: "D",
      hint: "Many machines feed into one, and nothing goes back.",
      why: "Diagram D has four machines sending into a single machine. A is a broadcast (one to many), B is an all-reduce (many in, all out), C is a push between two machines.",
    },
    mc(
      "Machine B stops computing until machine A signals that its data is ready. Which pattern is that?",
      ["Wait", "Barrier", "Pull"],
      "One machine pausing for a signal from one other machine is a wait. A barrier holds many machines until all of them arrive; a pull is a request for data.",
    ),
    {
      type: "slider",
      q: "Six machines reach a barrier after 3, 3, 4, 5, 5 and 7 s. How much idle time does it cause in total?",
      min: 0,
      max: 30,
      step: 1,
      start: 0,
      ans: 15,
      tol: 0,
      unit: " s",
      hint: "Everyone waits until 7 s: 4 + 4 + 3 + 2 + 2 + 0.",
      why: "The barrier opens at 7 s, the slowest arrival: 4 + 4 + 3 + 2 + 2 + 0 = 15 s of waiting.",
    },
    mc(
      "Why do distributed systems overlap computation with communication?",
      [
        "To keep workers busy while data is in transit",
        "To reduce how much data has to be sent",
        "To make every result more accurate",
      ],
      "Network communication can be slow. Overlapping hides that latency: workers keep doing useful work instead of stopping until the communication finishes.",
    ),
    {
      type: "slider",
      q: "A job runs 5 rounds of 2 s computing, each followed by a 1 s send. With computation and communication overlapped, how long does it take?",
      min: 0,
      max: 20,
      step: 1,
      start: 0,
      ans: 11,
      tol: 0,
      unit: " s",
      hint: "Computing runs back to back (5 × 2); only the last send is left over.",
      why: "5 × 2 = 10 s of computing with each send hidden behind the next round, plus the final 1 s send: 11 s. Stop and wait would take 5 × 3 = 15 s.",
    },
    {
      type: "multi",
      q: "Select every pattern that combines values from many machines into one result.",
      o: ["Reduce", "All-reduce", "Broadcast", "Push", "Barrier"],
      a: [0, 1],
      why: "Reduce and all-reduce both compute a reduction (usually a sum) over data on many machines. Broadcast and push send data out; a barrier only synchronises time.",
    },
    mc(
      "Each round computes for 2 s but takes 5 s to send its result. Computation and communication are overlapped. What sets the pace?",
      [
        "The network: sends queue up back to back",
        "The computation: it never has to wait",
        "Nothing: overlap removes the send time",
      ],
      "Overlap hides the shorter of the two. Here sending is slower, so the sends run back to back and the network decides how long the job takes.",
    ),
    {
      type: "bug",
      q: "Every worker needs its share of the total word count. Tap the line that stops that from working.",
      code: [
        "partial = count_words(my_share)",
        "total = reduce_sum(partial, onto=worker_0)",
        "fraction = partial / total",
      ],
      a: 1,
      hint: "Which workers know the total after line 2?",
      why: "A reduce puts the total on worker 0 only, so every other worker has no total to divide by. It needs an all-reduce.",
    },
  ]);

  B.add("ds11-sgd", [
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Epoch", "One pass over the full training set"],
        ["Batch", "All the data is used to compute each gradient"],
        ["Minibatch", "A subset of the data is used in each iteration"],
      ],
      why: "These are the slides' definitions: an epoch is a full pass, batch uses all the data per gradient, minibatch uses only a subset per iteration.",
    },
    {
      type: "slider",
      q: "A training set of 6,000 examples is used in minibatches of 200. How many iterations make one epoch?",
      min: 0,
      max: 60,
      step: 1,
      start: 0,
      ans: 30,
      tol: 0,
      hint: "6,000 ÷ 200 is the same as 60 ÷ 2.",
      why: "An epoch passes over all 6,000 examples, 200 per iteration: 6,000 ÷ 200 = 30.",
    },
    mc(
      "Six machines share a minibatch of B = 120. How many examples does each machine use per iteration?",
      ["20", "720", "6"],
      "B = M · B′, so B′ = 120 ÷ 6 = 20.",
    ),
    {
      type: "slider",
      q: "w = 8 and α = 0.25. A minibatch's four example gradients are 2, 4, 6 and 8. Where is w after the update?",
      min: 5,
      max: 9,
      step: 0.25,
      start: 8,
      ans: 6.75,
      tol: 0,
      hint: "Average gradient (2 + 4 + 6 + 8) ÷ 4 = 5, then a quarter of 5.",
      why: "The average gradient is 20 ÷ 4 = 5. The step is 0.25 × 5 = 1.25, so w goes from 8 to 6.75.",
    },
    {
      type: "order",
      q: "Put distributed SGD with all-reduce in order, from the start to the result.",
      items: [
        "Load the same starting weights on every machine",
        "Each machine selects a minibatch of its own B′ examples",
        "Each machine computes its average gradient",
        "All-reduce the gradients so every machine holds the sum",
        "Every machine updates its copy in the same way",
        "After T iterations, return the weights from any machine",
      ],
      why: "This is Algorithm 1: load w₀, then per iteration select, compute, all-reduce and update; at the end every machine holds the same w_T.",
    },
    {
      type: "multi",
      q: "Select every advantage of SGD with all-reduce named in the lecture.",
      o: [
        "Statistically equivalent to minibatch SGD",
        "The same hyperparameters can be used",
        "Every worker machine has the same role",
        "Workers are never idle",
        "Workers never need to communicate",
      ],
      a: [0, 1, 2],
      why: "It is easy to reason about (equivalent to minibatch SGD), keeps the hyperparameters, and is easy to implement since all workers have the same role on standard primitives. Its drawback is idle workers during the all-reduce.",
    },
    mc(
      "Algorithm 1 ends by returning w_T “from any machine”. Why is any machine fine?",
      [
        "Every machine holds identical parameters",
        "Each machine stores a different part of the model",
        "The machines vote on the best parameters",
      ],
      "The all-reduce gives every machine the same sum, and every machine applies the same update, so all copies stay identical throughout.",
    ),
    {
      type: "cat",
      q: "Beyond the slides: data parallelism or model parallelism?",
      buckets: ["Data parallelism", "Model parallelism"],
      items: [
        ["Every machine holds a full copy of the model", 0],
        ["Each machine processes a different part of each minibatch", 0],
        ["Gradients are combined with an all-reduce", 0],
        ["Each machine holds only some of the model's layers", 1],
        ["A minibatch passes from machine to machine", 1],
        ["Used when the model is too big for one machine", 1],
      ],
      why: "Data parallelism copies the model and splits the data (all-reduce SGD is an example). Model parallelism splits the model itself, so data flows between machines.",
    },
    mc(
      "8 workers each compute for 2 s per iteration, but one needs 5 s. The all-reduce takes 1 s. How long is each synchronous iteration?",
      ["6 s", "3 s", "17 s"],
      "The all-reduce needs every gradient, so it starts when the slowest worker finishes at 5 s and ends at 6 s. That slow worker is a straggler.",
    ),
    mc(
      "Beyond the slides: in asynchronous training, a slow worker's gradient was computed from parameters that have since been updated 4 times. What is this gradient called?",
      ["Stale", "Reduced", "Broadcast"],
      "A gradient computed from out-of-date parameters is stale. That is the price asynchronous training pays for never making workers wait.",
    ),
    {
      type: "bug",
      q: "Each worker runs this, with M workers. Tap the line that makes every step M times too big.",
      code: ["g = average_gradient(w, my_minibatch)", "G = all_reduce_sum(g)", "w = w - alpha * G"],
      a: 2,
      hint: "G is a sum of M averages.",
      why: "G adds up M average gradients, so the update must divide by M: w = w − (alpha / M) × G. Otherwise it is M times the minibatch step.",
    },
    {
      type: "slider",
      q: "Each iteration is 3 s of computing followed by a 2 s all-reduce, with no overlap. What percentage of the time are the workers computing?",
      min: 0,
      max: 100,
      step: 5,
      start: 0,
      ans: 60,
      tol: 0,
      unit: "%",
      hint: "3 seconds out of every 3 + 2.",
      why: "3 of every 5 seconds: 60%. The other 40% is spent idle while the all-reduce runs.",
    },
  ]);
})();
