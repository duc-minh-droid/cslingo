/* Data Science boss quiz for Lecture 5 (partitioning). New scenario: a parcel-tracking service (Parcelo). */
(function () {
  const N = NIC;

  const hotFig = () => {
    const rows = [
      ["n1", "Node A", "1 to 7 Oct"],
      ["n2", "Node B", "8 to 14 Oct"],
      ["n3", "Node C", "15 to 21 Oct"],
      ["n4", "Node D", "22 to 28 Oct"],
    ];
    const cells = rows
      .map(
        ([id, n, r], i) =>
          `<g data-pick="${id}" style="cursor:pointer"><rect x="${10 + i * 108}" y="38" width="100" height="52" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><text x="${60 + i * 108}" y="60" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text)">${n}</text><text x="${60 + i * 108}" y="78" text-anchor="middle" font-size="12" fill="var(--text)">${r}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 440 130" style="width:100%;max-width:460px"><text x="10" y="24" font-size="12" font-weight="800" fill="var(--text)">Scan events, partitioned by key range on the scan date</text>${cells}<text x="10" y="116" font-size="12" fill="var(--text)">Today is 24 Oct. Every new scan is keyed by the date and time it happens.</text></svg>`;
  };

  N.registerBoss({
    id: "ds5-boss",
    subject: "ds",
    lecture: 5,
    title: "Lecture 5 boss quiz",
    blurb: "Ten questions set in a parcel-tracking service: partitions, hot spots, hashing, indexes and rebalancing.",
    lede: "A new scenario: <b>Parcelo</b> tracks millions of parcels, and one machine can no longer hold the data. Decide how to split it across a cluster.",
    qs: [
      {
        type: "cat",
        q: "Parcelo discusses its cluster. Which statements describe <b>replication</b> and which describe <b>partitioning</b>?",
        buckets: ["Replication", "Partitioning"],
        items: [
          ["Every node holds a full copy of the tracking data", 0],
          ["Each node holds a different subset of the parcels", 1],
          ["Needed when the data is too big for any one node's disk", 1],
          ["Each parcel is stored in exactly one partition", 1],
          ["Another node can answer if the first one crashes, with the same data", 0],
        ],
        why: "Replication copies the whole dataset onto several nodes. Partitioning splits it so each item lives in exactly one partition, which is what lets the data outgrow one machine.",
      },
      {
        type: "mcq",
        q: "Parcelo's tracking events total 24 TB, and every node has an 8 TB disk. Which plan can hold the data?",
        o: [
          "Three partitions of 8 TB, one per node",
          "Three nodes, each with a full replica",
          "Two nodes with a full replica each",
          "Any plan works if the nodes are connected",
        ],
        a: 0,
        why: "A full replica needs 24 TB on every node, which does not fit on 8 TB. Splitting the data into partitions of about 8 TB fits.",
      },
      {
        type: "pick",
        q: "The cluster uses key-range partitioning on the scan date. Tap the node that becomes the <b>write hot spot</b> today.",
        fig: hotFig(),
        a: "n4",
        why: "New scans are keyed by today's date, 24 Oct, which lies in Node D's range. Every new write goes there while the other nodes see almost none.",
      },
      {
        type: "multi",
        q: "Parcelo switches from key ranges to hashing the parcel id. Select every statement that is true.",
        o: [
          "Neighbouring ids usually land on different partitions",
          "A range query of ids may have to ask every partition",
          "New parcels with rising ids no longer all hit the newest partition",
          "Neighbouring ids stay adjacent, so scans stay cheap",
          "A single very popular parcel can no longer cause a hot spot",
        ],
        a: [0, 1, 2],
        why: "Hashing spreads keys and destroys key order. That helps writes and hurts range queries. One parcel that everyone requests still lands in a single partition, so hot spots from popular keys can remain.",
      },
      {
        type: "mcq",
        q: 'Parcelo keys its scans with the compound key (depot, time) and hashes only the depot. How is "all scans at depot 7 between 09:00 and 10:00" answered?',
        o: [
          "By one partition, scanning a time range there",
          "By every partition, because time is not hashed",
          "By scanning the whole dataset in time order",
          "It is impossible without a secondary index",
        ],
        a: 0,
        why: "Hashing the depot sends all of depot 7's scans to one partition, where they are sorted by time, so the time range is cheap to read.",
      },
      {
        type: "match",
        q: "Match each design choice to its main cost.",
        pairs: [
          ["Key range on a timestamp", "Write hot spot"],
          ["Hash of the key", "Scattered range queries"],
          ["Secondary index by document", "Scatter-gather reads"],
          ["Secondary index by term", "Writes touch several partitions"],
        ],
        why: "Timestamp keys concentrate writes. Hashing destroys key order. A local index must be searched everywhere, and a term-partitioned index spreads one write across several index partitions.",
      },
      {
        type: "mcq",
        q: 'Parcelo searches parcels by destination city. The data is in 8 document partitions. With <b>local (by document)</b> indexes, how many partitions does a search for "Leeds" ask, compared with a <b>global index split by term</b>?',
        o: [
          "Local: 8. Global: 1 index partition",
          "Local: 1. Global: 8 index partitions",
          "Both ask every one of the 8 partitions",
          "Both ask exactly 1 partition",
        ],
        a: 0,
        why: 'A local index only knows its own documents, so the search is scattered to all 8. A global index is split by term, so one index partition holds every "Leeds" entry.',
      },
      {
        type: "order",
        q: "A new node joins a cluster that uses a fixed number of partitions. Put the steps in order.",
        items: [
          "The new node joins with no partitions",
          "It picks a partition from a node that holds many",
          "That whole partition is copied across while reads and writes continue",
          "The partition now belongs to the new node, and keys still map to the same partition",
        ],
        hint: "The new node starts empty, then takes whole partitions, then the old node lets go.",
        why: "Only entire partitions move. The partition count and the key-to-partition mapping never change, so nothing is re-hashed, and the cluster stays online.",
      },
      {
        type: "slider",
        q: "Parcelo runs 100 fixed partitions on 4 nodes, 25 each. A fifth node joins and takes a fair share. About how many partitions move to it?",
        min: 0,
        max: 100,
        step: 5,
        start: 50,
        ans: 20,
        tol: 5,
        unit: " partitions",
        hint: "A fair share is 100 divided by 5 nodes.",
        why: "100 / 5 = 20 partitions per node. The new node steals 20 whole partitions from the others, instead of reshuffling every key.",
      },
      {
        type: "bug",
        q: "Parcelo's router must keep a key's partition fixed when nodes are added. Click the faulty line.",
        code: [
          "PARTITIONS = 256",
          "def partition_of(key):",
          "    return hash(key) % len(nodes)",
          "def node_of(partition):",
          "    return assignment[partition]",
        ],
        a: 2,
        hint: "What happens to the answer of this line when len(nodes) changes?",
        why: "Using the node count as the modulus makes every key's partition change when a node joins. It should be hash(key) % PARTITIONS, with a separate table mapping partitions to nodes.",
      },
    ],
  });
})();
