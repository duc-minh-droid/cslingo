/* js/bank/ds-50.js: Data Science lecture 11 revision questions, part 2: ds11-kmeans. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds11;
  const chips = (list) =>
    `<div class="ds11-cents">${list.map(([k, t]) => `<span class="ds11-ex" data-pick="${k}" style="cursor:pointer;padding:6px 12px">${t}</span>`).join("")}</div>`;

  B.add("ds11-kmeans", [
    {
      type: "order",
      q: "Put the k-means algorithm in order.",
      items: [
        "Choose K starting centres",
        "Assign each point to the cluster with the nearest centre",
        "Move each centre to the mean of its cluster's points",
        "Repeat until the partition stops changing or MAX is reached",
      ],
      why: "k-means initialises K centres, then loops: an assignment step, an update step, and a stopping test (unchanged partition or the iteration limit).",
    },
    {
      type: "slider",
      q: "After the assignment step a cluster holds the points 2, 5 and 11. Where does its centre move in the update step?",
      min: 0,
      max: 12,
      step: 1,
      start: 0,
      ans: 6,
      tol: 0,
      hint: "Add them up and divide by 3.",
      why: "The update step moves the centre to the mean of its points: (2 + 5 + 11) ÷ 3 = 18 ÷ 3 = 6.",
    },
    {
      type: "cat",
      q: "Which MapReduce phase of parallel k-means does each job belong to?",
      buckets: ["Map", "Combine", "Reduce"],
      items: [
        ["Compute the distance from each point to every centre", 0],
        ["Assign each point to its closest centre", 0],
        ["Add up one mapper's points per cluster and count them", 1],
        ["Send local sums and sample counts onwards", 1],
        ["Compute each cluster's new centre from all local results", 2],
        ["Test whether the clustering has converged", 2],
      ],
      why: "Map computes distances and assigns points; Combine turns a mapper's output into local sums and counts per cluster; Reduce aggregates them, updates the centres and tests convergence.",
    },
    mc(
      "Why do combiners send a sum and a count rather than the mean of their points?",
      [
        "A mean hides how many points it stands for",
        "Sums are smaller numbers than means",
        "The reducer cannot divide numbers",
      ],
      "To combine results from mappers with different numbers of points, the reducer needs totals: total sum ÷ total count. Averaging means would weigh a mapper with 1 point like one with 1,000.",
    ),
    {
      type: "pick",
      q: "The centres are at 2 and 8. Tap the point that joins the centre at <b>8</b> in the next assignment step.",
      fig: chips([
        ["p3", "3"],
        ["p4", "4"],
        ["p6", "6"],
        ["p1", "1"],
      ]),
      a: "p6",
      hint: "Compare each point's distance to 2 and to 8.",
      why: "6 is 4 away from 2 but only 2 away from 8, so it joins 8. The points 1, 3 and 4 are all nearer to 2.",
    },
    mc(
      "In the map phase of parallel k-means, what is the value of each emitted pair?",
      ["The sample itself", "The distance to every centre", "The new centre of the cluster"],
      "The mapper emits ⟨index of the closest centre, sample⟩. The key groups the samples by cluster; the value carries the sample's values in each dimension.",
    ),
    {
      type: "multi",
      q: "Select every communication pattern that one iteration of parallel k-means uses.",
      o: [
        "Broadcast the current centres to every mapper",
        "Reduce the local sums onto the reducer",
        "Wait for every mapper before computing centres",
        "All-reduce every point to every machine",
        "Push each distance to the user's phone",
      ],
      a: [0, 1, 2],
      why: "Every mapper needs the centres (a broadcast), the sums and counts are combined on the reducer (a reduce), and the new centres cannot be computed until all mappers are done (a barrier-like wait).",
    },
    {
      type: "slider",
      q: "Parallel k-means runs on 10 mappers with k = 6 and a combiner. How many records reach the reducer per iteration?",
      min: 0,
      max: 120,
      step: 5,
      start: 0,
      ans: 60,
      tol: 0,
      hint: "One (sum, count) record per mapper and cluster.",
      why: "Each of the 10 mappers sends one record per cluster: 10 × 6 = 60, however many points they hold.",
    },
    mc(
      "Why can the assignment of points be split across many machines?",
      [
        "Each point needs only itself and the centres",
        "Points are already sorted by cluster on disk",
        "Each machine computes a different centre",
      ],
      "A point's nearest centre depends only on that point and the K centres, never on other points, so the points can be shared out and assigned at the same time.",
    ),
    {
      type: "bug",
      q: "This combiner should prepare correct input for the reducer. Tap the faulty line.",
      code: [
        "for cluster, points in my_groups:",
        "    s = sum(points)",
        "    n = len(points)",
        "    emit(cluster, s / n)",
      ],
      a: 3,
      hint: "What does the reducer need to combine results from mappers of different sizes?",
      why: "Emitting the local mean throws away the count. The combiner must emit (s, n) so the reducer can compute total sum ÷ total count.",
    },
    mc(
      "Between iteration 4 and iteration 5 not a single point changes cluster. MAX is 50. What does k-means do?",
      ["Stop: the partition is unchanged", "Carry on until iteration 50", "Pick new random centres and restart"],
      "The algorithm returns as soon as the partition equals the previous one, or when t reaches MAX, whichever comes first.",
    ),
    {
      type: "slider",
      q: "A reducer receives three (sum, count) records for one cluster: (40, 5), (30, 5) and (10, 10). What is the new centre?",
      min: 0,
      max: 10,
      step: 0.5,
      start: 0,
      ans: 4,
      tol: 0,
      hint: "Total sum 40 + 30 + 10, total count 5 + 5 + 10.",
      why: "(40 + 30 + 10) ÷ (5 + 5 + 10) = 80 ÷ 20 = 4. Averaging the local means 8, 6 and 1 would give 5, which is wrong.",
    },
  ]);
})();
