(function () {
  const B = NIC.bank;

  const idxFig = () => {
    const rows = [
      ["a", "S1"],
      ["b", "S2"],
      ["c", "S3"],
      ["d", "S1"],
      ["e", "S3"],
    ];
    const cells = rows
      .map(
        ([k, s], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="${10 + i * 66}" y="34" width="60" height="40" rx="8" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><text x="${40 + i * 66}" y="59" text-anchor="middle" font-size="14" font-weight="800" fill="var(--text)">${k} → ${s}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 345 130" style="width:100%;max-width:420px"><text x="10" y="22" font-size="12" font-weight="800" fill="var(--text)">In-memory hash map (key → segment)</text>${cells}<text x="10" y="102" font-size="12" fill="var(--text)">S1 and S2 are closed. S3 is the active segment.</text><text x="10" y="120" font-size="12" fill="var(--text)">Compaction merges S1 and S2 into a new file S4.</text></svg>`;
  };

  B.add("ds-log", [
    {
      type: "bug",
      q: "A plain log store appends <code>key,value</code> lines. This <code>get()</code> should return the newest value for a key, but after a key is overwritten it returns a stale one. Click the faulty line.",
      code: [
        "def get(key):",
        "    found = None",
        "    for line in read_all_lines():",
        "        k, v = line.split(',')",
        "        if k == key and found is None:",
        "            found = v",
        "    return found",
      ],
      a: 4,
      hint: "Later lines are newer. What does the extra condition stop?",
      why: "The condition found is None keeps only the first match, which is the oldest value. The scan must let every later match replace the earlier one, so the last line for the key wins. Old lines are never edited, so the newest value is always the last one.",
    },
    {
      type: "order",
      q: "Put the steps of one <code>get(bike)</code> on a plain log in order.",
      items: [
        "Open the file and start at the first line",
        "Read each line in turn and note every one for bike",
        "Reach the end of the file",
        "Return the value from the last note",
      ],
      hint: "You cannot know which line is the newest until you have seen them all.",
      why: "Without an index the store cannot jump to the key. It reads every line, remembers each match, and only at the end of the file knows which match is the latest. That full pass is why a read is O(n).",
    },
    {
      type: "slider",
      q: "A script loads a plain log with 1,000 lines, then looks up 1,000 different keys. Each lookup scans all 1,000 lines. About how many line reads is that in total, in thousands?",
      min: 0,
      max: 2000,
      step: 100,
      start: 200,
      ans: 1000,
      tol: 200,
      unit: " thousand",
      hint: "1,000 lookups × 1,000 lines each. 1,000 × 1,000 is a million.",
      why: "1,000 × 1,000 = 1,000,000 line reads, which is 1,000 thousand. The cost of each read grows with the file, so many reads on a large log add up fast. That is the pressure that leads to an index.",
    },
    {
      type: "multi",
      q: "A weather station records 10,000 readings a second and is only searched a few times a week. Which are good reasons a plain append-only log suits it? Select all that apply.",
      o: [
        "Each write is a quick append to the end of the file",
        "Old readings are never edited, so nothing is overwritten by accident",
        "Searches are rare, so a full scan costs little overall",
        "Every lookup jumps straight to the right byte",
        "The file never needs any care if power fails mid-write",
      ],
      a: [0, 1, 2],
      why: "Appends are cheap and old lines stay untouched, and with few reads the O(n) scan hardly matters. A plain log has no index, so lookups do not jump anywhere. A half-written record after a power cut still has to be handled, so it is not care-free.",
    },
    {
      type: "cat",
      q: "For a plain log with no index, sort each request by what the store has to do.",
      buckets: ["Appends one line", "Reads the whole file"],
      items: [
        ["set a brand-new key", 0],
        ["set an existing key to a new value", 0],
        ["delete a key (tombstone)", 0],
        ["get a key that exists", 1],
        ["get a key that was never written", 1],
      ],
      hint: "Writes and deletes only ever add to the end. Reads must search.",
      why: "Setting, overwriting and deleting all just append a record. A get has no index, so it scans every line. A missing key is the worst case, because the store only knows it is absent after the last line.",
    },
    {
      type: "mcq",
      q: "A log holds three lines for the key <code>bal</code>: 50, then 70, then 20. Why does a get return 20?",
      o: [
        "Lines are only appended, so the last one is newest",
        "The store always keeps the smallest value it has seen",
        "The store averages the lines for a key before replying",
        "Earlier lines are erased as soon as a new one arrives",
      ],
      a: 0,
      why: "A log is only ever appended to, so position in the file is a clock: later means newer. Nothing is erased or averaged. The old lines simply stay in the file, which is also why compaction is needed later.",
    },
  ]);

  B.add("ds-hashidx", [
    {
      type: "pick",
      q: "Compaction is about to merge S1 and S2 into a new file S4. After it finishes, tap every key whose entry in the in-memory map must be changed to point at S4.",
      fig: idxFig(),
      a: ["a", "b", "d"],
      hint: "An entry must change if its record lived in a file that is being merged away.",
      why: "Keys a, b and d have their records in S1 or S2, and those files are replaced by S4, so their entries must be repointed. Keys c and e live in S3, which is untouched. The map has to follow the files, or a read would jump into a deleted segment.",
    },
    {
      type: "order",
      q: "Put the life of a log segment in order.",
      items: [
        "It is the active segment and takes every new write",
        "It reaches the size limit and is closed",
        "A new active segment opens for further writes",
        "Compaction merges it with other closed segments",
        "The old closed file is deleted",
      ],
      hint: "Only closed files are merged, so closing comes before compaction.",
      why: "Writes go to one active segment until it is full. Then it is closed and a new one starts, so writing never stops. Compaction works on closed files in the background, and the old files are removed once the merged one replaces them.",
    },
    {
      type: "match",
      q: "Match each design choice in a hash-indexed log to the benefit it brings.",
      pairs: [
        ["Keep every key in a hash map in memory", "A read needs one jump to a known offset"],
        ["Close a segment at a size limit", "Files stay small enough to compact one by one"],
        ["Only append, never overwrite in place", "A crash cannot damage old records"],
        ["Merge closed segments only", "Writes carry on into the active file meanwhile"],
      ],
      why: "The in-memory map gives the single jump. Size-limited segments keep compaction manageable. Appending leaves earlier content alone, so recovery is easy. Leaving the active segment out of a merge means writers and the merger never fight over one file.",
    },
    {
      type: "bug",
      q: "A hash-indexed store should answer <code>get()</code> with one jump. This version still reads far too much. Click the line that throws away the benefit of the index.",
      code: [
        "def get(key):",
        "    if key not in index:",
        "        return None",
        "    offset = index[key]",
        "    for line in file.read_from(0):",
        "        if line.key == key:",
        "            result = line.value",
        "    return result",
      ],
      a: 4,
      hint: "The index already holds the offset. What should the read start from?",
      why: "The map gives the byte offset of the newest record, so the read should seek to it and read one line. Starting from byte 0 scans the whole file again, which is the plain log's O(n) cost. The index is built only to avoid this.",
    },
    {
      type: "multi",
      q: "Which of these would stress a hash-indexed log, rather than just run it normally? Select all that apply.",
      o: [
        "The number of distinct keys grows beyond what memory can hold",
        "Clients keep asking for every key between two values, in order",
        "The same 500 keys are overwritten millions of times",
        "A restart forces the map to be rebuilt from large segments",
        "Appends arrive one after another at high speed",
      ],
      a: [0, 1, 3],
      why: "The map must fit in memory, a hash has no key order for ranges, and rebuilding it means rereading every segment. Many overwrites of few keys is the case compaction handles well, and fast sequential appends are exactly what the design is good at.",
    },
    {
      type: "mcq",
      q: "Compaction writes its merged result to a new file and deletes the old segments only afterwards. What is the reason?",
      o: [
        "Reads can keep using old files until it is ready",
        "Disk space is cheaper when files are deleted late on",
        "Deleting a file is slower than leaving it there forever",
        "The hash map cannot hold more than one file at a time",
      ],
      a: 0,
      why: "The store keeps serving requests during a merge, so the old segments must stay valid until the replacement is ready and the map points to it. If the old files went first, a read could land on missing data.",
    },
  ]);

  B.add("ds-sstable", [
    {
      type: "order",
      q: "A store receives <code>get(plum)</code>. The key is in an older SSTable on disk, which has a sparse index. Put the steps in order.",
      items: [
        "Look in the memtable and find nothing",
        "Check newer segments, which do not hold the key",
        "In the older segment, find the nearest indexed key before plum",
        "Jump to that offset and scan the short block for plum",
      ],
      hint: "Newest places are searched first. The sparse index only narrows the scan.",
      why: "Reads go from the newest data to the oldest, so a newer value always wins. Inside a sorted segment the sparse index points to a nearby key, and a short block scan finds the exact record.",
    },
    {
      type: "cat",
      q: "Segments in an SSTable store are sorted by key. Sort each feature by whether sorting is what makes it possible.",
      buckets: ["Made possible by sorting", "Not helped by sorting"],
      items: [
        ["Merging segments by reading them side by side", 0],
        ["A sparse index that holds only some keys", 0],
        ["Returning every key from d to h in one scan", 0],
        ["Appending a tombstone to record a delete", 1],
        ["Keeping the newest copy of a key on top of older ones", 1],
      ],
      hint: "Ask: would this still work on an unsorted log?",
      why: "Sorted order lets two files be merged in one pass, lets a nearby indexed key bound the search, and puts a key range in one run. A tombstone and newest-wins are just rules about records and age, and they work on any log.",
    },
    {
      type: "slider",
      q: "A sorted segment holds 1 million keys. Its sparse index keeps one key in every 1,000. After the jump, the store scans the block from the indexed key. On average, about how many keys does it read?",
      min: 0,
      max: 1000,
      step: 50,
      start: 100,
      ans: 500,
      tol: 100,
      unit: " keys",
      hint: "A block holds 1,000 keys, and the target is somewhere inside it. Half is a fair average.",
      why: "Each block spans 1,000 keys, and on average the target is halfway in, so about 500 keys are read. That is a tiny scan beside 1 million, and the index itself needs only 1,000 entries instead of 1 million.",
    },
    {
      type: "bug",
      q: "This flush should write the memtable to disk as a sorted segment. The file comes out unsorted. Click the faulty line.",
      code: [
        "def flush(memtable):",
        "    seg = open_new_segment()",
        "    for key, value in memtable.in_arrival_order():",
        "        seg.write(key, value)",
        "    seg.close()",
        "    return seg",
      ],
      a: 2,
      hint: "The balanced tree can be walked in key order.",
      why: "The tree in memory keeps keys sorted, so the flush should walk it in key order, left to right. Reading in arrival order writes keys as they were received, which is random, and breaks the sorted-segment promise the sparse index and merges depend on.",
    },
    {
      type: "multi",
      q: "A background merge combines several SSTables into one. Select all that are true of the merged file.",
      o: [
        "It is still sorted by key",
        "A key that appears in more than one input keeps only its newest value",
        "Values that were later deleted are no longer kept",
        "It needs a hash entry for every key to be readable",
        "The memtable must stop accepting writes until it finishes",
      ],
      a: [0, 1, 2],
      why: "A side-by-side merge of sorted files stays sorted, and it drops overwritten and deleted values. The sparse index is enough, with no per-key hash. Writes keep going into the memtable and flushes while the merge runs in the background.",
    },
    {
      type: "mcq",
      q: "Why can two sorted segments be merged in one pass without loading either into memory in full?",
      o: [
        "Only the front key of each file needs comparing",
        "Both files are first copied into a hash table",
        "The newest file is always shorter than the older one",
        "Duplicates are impossible because keys are unique across files",
      ],
      a: 0,
      why: "Because each file is sorted, the smallest remaining key overall is always at the front of one of them. The merge compares only those fronts, writes the smaller, and moves on, like the merge step of merge sort. Duplicate keys across files do occur, and the newer wins.",
    },
  ]);
})();
