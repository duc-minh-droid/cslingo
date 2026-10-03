(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { FIG_RANGE, FIG_SPARSE } = partScope;
  const B = NIC.bank;

  B.add("ds-sstable", [
    {
      type: "pick",
      q: "A read for key n uses the sparse index to decide where to start scanning the sorted segment. Tap the index entry it jumps to.",
      fig: FIG_SPARSE,
      a: "ih",
      why: "Keys are sorted, so n must lie at or after the largest indexed key that is not past it. That is h (position 4), and a short scan h, j, m, n finds it. Entry p is already beyond n, and b would scan further than needed.",
    },
    {
      type: "bug",
      q: "Merging an old and a new sorted segment (the leftover tails are handled after the loop). When the same key is in both, the newer value must win. Click the faulty line.",
      code: [
        "while i < len(old) and j < len(new):",
        "    if old[i][0] < new[j][0]:",
        "        out.append(old[i]); i += 1",
        "    elif old[i][0] > new[j][0]:",
        "        out.append(new[j]); j += 1",
        "    else:",
        "        out.append(old[i]); i += 1; j += 1",
      ],
      a: 6,
      why: "When the keys are equal, this keeps the old record and drops the new one, so stale values survive the merge. It should append new[j]. Both pointers move on either way.",
    },
    {
      type: "pick",
      q: "A range query asks for every key from d to h inclusive. Tap the records it returns.",
      fig: FIG_RANGE,
      a: ["kd", "ke", "kf", "kh"],
      why: "Because the segment is sorted, the answer is one block: find d, then read along until you pass h. A hash index would give no such block, since its keys are scattered.",
    },
    {
      type: "slider",
      q: "A 64 MB segment has a sparse index with one entry for each 4 KB block. About how many index entries are there, in thousands?",
      min: 0,
      max: 100,
      step: 2,
      ans: 16,
      tol: 3,
      unit: " thousand",
      hint: "64 MB is about 64,000 KB. How many 4 KB blocks is that? 64,000 ÷ 4.",
      why: "64,000 KB ÷ 4 KB = 16,000 entries. The index stays small because it covers blocks, not every key; a scan inside one block finds the record.",
    },
    {
      type: "match",
      q: "Match each event to what follows.",
      pairs: [
        ["The memtable fills up", "It is written out as a new sorted SSTable"],
        ["Many small SSTables pile up", "Reads check more files, so they are merged"],
        ["A key is in no segment at all", "The read checks every place before saying not found"],
        ["The newest segment holds a tombstone for the key", "The read stops there and reports not found"],
      ],
      why: "Reads go newest to oldest, so a newer tombstone settles the answer at once. A missing key is the worst case, because every file must be ruled out. Merging keeps that number of files small.",
    },
    {
      type: "mcq",
      q: "Why does the memtable keep its keys in a sorted tree instead of a plain hash map?",
      o: [
        "A flush can then write sorted keys to a new file in one pass",
        "A read can skip the SSTables and answer from memory every time",
        "Deleted keys vanish from memory without needing tombstones",
        "It uses less memory than a hash map could ever manage",
      ],
      a: 0,
      why: "An SSTable must be sorted. If the memtable already holds keys in order, a flush is just a sequential walk of the tree. A hash map would need a full sort first. The tree changes neither read coverage, tombstones nor memory use.",
    },
  ]);
})();
