(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { M, TF } = partScope;
  const B = NIC.bank;

  B.add("ds-sstable", [
    TF(
      "In an SSTable segment, each key appears many times.",
      false,
      "An SSTable holds each key once per segment, and keeps the segment sorted by key.",
    ),
    M(
      "Old segment: a=1, c=3, e=5. Newer segment: c=9, d=4. After merging, what value does c hold?",
      ["3", "9", "12", "4"],
      1,
      "The newer segment wins for a repeated key, so c keeps 9.",
      { hint: "When two segments hold the same key, keep the value from the newer one." },
    ),
    {
      type: "order",
      q: "After merging the old segment (a=1, c=3, e=5) with the newer one (c=9, d=4), put the merged records in order.",
      items: ["a=1", "c=9", "d=4", "e=5"],
      why: "The merged segment stays sorted by key: a, c, d, e, with the newest value for c.",
    },
    M(
      "A sorted segment's sparse index holds only the keys a, h and p, with their offsets. You want key k. Where do you scan?",
      [
        "From h up to p",
        "The whole file from the start",
        "From p to the end of the file",
        "Just the exact entry for k",
      ],
      0,
      "k lies between h and p. Jump to h, then scan the short block until you pass k.",
    ),
    {
      type: "cat",
      q: "Does each item belong to the memtable or to an SSTable on disk?",
      buckets: ["Memtable (memory)", "SSTable (disk)"],
      items: [
        ["A balanced tree that keeps keys sorted as writes arrive", 0],
        ["An immutable sorted segment file", 1],
        ["The place every new write goes first", 0],
        ["Combined by background merging and compaction", 1],
      ],
      why: "New writes enter the in-memory tree; flushing turns it into a sorted file that later merges combine.",
    },
    TF(
      "Once an SSTable is written, a changed key is edited inside that file.",
      false,
      "SSTables are not edited; a new value goes into a newer memtable and later a newer segment.",
    ),
    M(
      "Why does the memtable use a balanced tree rather than a plain list?",
      [
        "It keeps keys sorted as each out-of-order write arrives",
        "It stores every key on disk as soon as it arrives",
        "It stops old values from being overwritten",
        "It removes the need to ever write an SSTable",
      ],
      0,
      "Writes come in random order, and a tree stays sorted as they are inserted.",
    ),
    {
      type: "slider",
      q: "A segment has 1,200 keys and its sparse index stores every 100th key. About how many index entries are there?",
      min: 0,
      max: 40,
      step: 1,
      ans: 12,
      tol: 2,
      unit: " entries",
      hint: "How many 100s fit into 1,200?",
      why: "1,200 ÷ 100 = 12 entries, a far smaller index than one entry per key.",
    },
    {
      type: "multi",
      q: "Which are true of SSTables compared with a hash-indexed log? Select all that apply.",
      o: [
        "The in-memory index need not hold every key",
        "Merging segments works like the merge step of merge sort",
        "Keys in a range sit next to each other on disk",
        "Every key must still be held in memory",
      ],
      a: [0, 1, 2],
      why: "Sorting brings a sparse index, easy merging and neighbouring keys. The all-keys-in-memory limit belongs to the hash index.",
    },
    M(
      "A key was updated recently, and an older value for it is on disk. Which value does a read return?",
      [
        "The memtable's value, because it is checked first",
        "The disk value, because files are more permanent",
        "Both values together, as a list",
        "Neither, because the two conflict",
      ],
      0,
      "Reads search the memtable, then segments from newest to oldest, and stop at the first hit.",
    ),
    {
      type: "bug",
      q: "read() should return the newest value for a key. Click the faulty line.",
      code: [
        "def read(key):",
        "    if key in memtable:",
        "        return memtable[key]",
        "    for seg in segments_oldest_first:",
        "        if key in seg:",
        "            return seg[key]",
        "    return None",
      ],
      a: 3,
      why: "Searching oldest first returns a stale value. Segments should be searched from newest to oldest.",
    },
    {
      type: "match",
      q: "Match each part to its role.",
      pairs: [
        ["Memtable", "In-memory sorted tree that takes new writes"],
        ["SSTable", "Sorted, unchanging file on disk"],
        ["Sparse index", "Offsets for only some of the keys"],
        ["Background merge", "Combines segments and drops stale values"],
      ],
      why: "The parts of the SSTable design and what each one does.",
    },
  ]);

  B.add("ds-sstable", [
    M(
      "A key is deleted and a tombstone is written. What does a later merge do with it?",
      [
        "Drops the key's older values, since the key is deleted",
        "Copies the tombstone into every older segment and keeps it there",
        "Turns the tombstone into an empty value forever",
        "Keeps every older value so nothing is lost",
      ],
      0,
      "Merging discards overwritten and deleted values, so the deleted key's records disappear.",
    ),
    M(
      "Why can the blocks between index entries be compressed?",
      [
        "Each block is read whole, so it can be unpacked as one unit",
        "Compressed blocks are always faster to write into the memtable",
        "Compression removes the need to sort the keys",
        "Compressed blocks never need to be merged",
      ],
      0,
      "A lookup jumps to one block and scans it, so packing it up costs little.",
    ),
  ]);
})();
