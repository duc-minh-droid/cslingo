/* ===== bank-ds-4.js ===== */
/* Data Science revision bank, part 4 (revision mode only). Lecture 3: logs, hash indexes, SSTables. Concepts only, no calculator. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("ds-log", [
    M(
      "What are the two fundamental jobs of a database?",
      [
        "Keep data when it is given, and return it when it is asked for",
        "Sort data into tables, and then delete the oldest tables",
        "Copy data to a backup, and then check the backup daily",
        "Compress data on entry, and unpack it on every read",
      ],
      0,
      "Store what you give it, give back what you ask for. Everything else serves those two jobs.",
    ),
    M(
      'In this lecture, a database "log" is…',
      [
        "a file of records where new ones are only added at the end",
        "a diary of every error message the server printed",
        "a list of which users signed in and when",
        "a table that is rebuilt from scratch every hour",
      ],
      0,
      "It is not a log in the traditional sense: old lines are never modified, only appended to.",
    ),
    {
      type: "slider",
      q: "Scanning a sensor log of 4 million readings takes about 8 ms. About how long does a scan of 40 million readings take?",
      min: 0,
      max: 200,
      step: 10,
      ans: 80,
      tol: 15,
      unit: " ms",
      hint: "40 million is 10 times 4 million.",
      why: "A scan is O(n): ten times the data takes ten times as long, so 8 × 10 = 80 ms.",
    },
    {
      type: "cat",
      q: "For a plain append-only log with no index, is each operation fast or slow?",
      buckets: ["Fast", "Slow (scan)"],
      items: [
        ["Append a new reading at the end of the file", 0],
        ["Find the latest reading for sensor 7", 1],
        ["Record a deletion by appending a tombstone", 0],
        ["Confirm a key is not in the file at all", 1],
      ],
      why: "Appending never searches. Any lookup, even for a missing key, has to read the whole file.",
    },
    TF(
      "A tombstone record immediately erases the old data from the file.",
      false,
      "It is a marker appended to say the key is deleted; the old lines are only dropped later.",
    ),
    {
      type: "order",
      q: "Put the life of a deletion in order.",
      items: [
        "The client asks to delete a key",
        "The database appends a tombstone for that key",
        "Later reads of the key meet the tombstone and report it missing",
        "A background merge discards the key's older records",
      ],
      why: "Deletion is a new append first; the space is only reclaimed by a later compaction.",
    },
    {
      type: "multi",
      q: "Which of these are write-heavy (transactional) workloads? Select all that apply.",
      o: [
        "Recording each card payment as it happens",
        "Storing sensor readings that arrive every second",
        "Building a quarterly trend report over all readings",
        "Scanning a year of data to work out averages",
      ],
      a: [0, 1],
      why: "Transactional workloads are write-intensive. Reports and big scans are analytics: read-intensive.",
    },
    M(
      "Why are binary files normally preferred to plain text for a log?",
      [
        "They are more compact and quicker to parse",
        "They can be read by any text editor",
        "They stop keys from ever repeating inside one file",
        "They let the file be edited in the middle",
      ],
      0,
      "Binary formats avoid conversion and waste, so they are usually more efficient.",
    ),
    {
      type: "bug",
      q: "This set() should add a record to the log without losing earlier ones. Click the faulty line.",
      code: [
        "def set(key, value):",
        '    f = open("db.log", "w")',
        '    f.write(key + "," + value + "\\n")',
        "    f.close()",
      ],
      a: 1,
      why: 'Opening in "w" mode wipes the file. It needs append mode ("a") so old records survive.',
    },
    M(
      "A database keeps its hash map in memory only. After a crash and restart, what must it do?",
      [
        "Rebuild the map, for example by re-reading the log",
        "Ask every user to send all of their data again",
        "Delete the log and start with an empty one",
        "Copy the log into a second log before anything else",
      ],
      0,
      "The log on disk survives; the in-memory map is lost and has to be rebuilt from it.",
    ),
    TF(
      "Reading a value from a plain append-only log gets slower as the file grows.",
      true,
      "A lookup scans the file, so the time grows in proportion to its size.",
    ),
  ]);

  B.add("ds-log", [
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Log", "A file of records added in sequence"],
        ["Tombstone", "A special record marking a key as deleted"],
        ["Transactional workload", "Write-intensive, many small updates"],
        ["Analytics workload", "Read-intensive, scans a lot of data"],
      ],
      why: "Two storage terms and the two workload types that drive engine choices.",
    },
    M(
      "Why is a partially written record a risk?",
      [
        "After a crash, half a record could be read as if it were whole",
        "It makes the log file grow twice as fast as normal",
        "It forces every other record to be rewritten",
        "It changes the key of the record before it",
      ],
      0,
      "A crash mid-write can leave a broken record, so the engine must detect and ignore it.",
    ),
    M(
      "Why is appending to a log so quick?",
      [
        "The write always goes to the end, with no searching or rewriting",
        "The write is copied to several disks before it finishes",
        "The write is sorted into place among older records",
        "The write is held back until the file is compressed",
      ],
      0,
      "There is no lookup and no rewriting, just one sequential write at the end.",
    ),
  ]);

  B.add("ds-hashidx", [
    M(
      "For each key, what does the hash index hold?",
      [
        "The byte position of that key's latest record in the log",
        "A copy of every earlier value that the key ever had, oldest first",
        "The name of the file that holds the oldest record",
        "A count of how often the key has been read",
      ],
      0,
      "The map points to where the newest record starts, so a read can jump straight there.",
    ),
    {
      type: "slider",
      q: "Four log segments each hold updates to the same 250 keys. After compaction merges them into one segment, about how many records remain?",
      min: 0,
      max: 1000,
      step: 50,
      ans: 250,
      tol: 50,
      unit: " records",
      hint: "Compaction keeps one record per key, however many segments there are.",
      why: "One latest record per key: 250 keys means about 250 records, not 4 × 250 = 1,000.",
    },
    {
      type: "order",
      q: "Put a write and a later read in order for a hash-indexed log.",
      items: [
        "Append the key and value to the end of the log",
        "Note the byte offset where that record starts",
        "Store the offset for the key in the hash map",
        "Read the key by looking up its offset and jumping there",
      ],
      why: "The map is updated after every append, and reads use it to skip the scan.",
    },
    {
      type: "cat",
      q: "Is each statement an advantage or a limitation of a hash-indexed log?",
      buckets: ["Advantage", "Limitation"],
      items: [
        ["Writes are sequential, so they are quick", 0],
        ["Updates never overwrite old bytes, which eases crash recovery", 0],
        ["Every key needs an entry held in memory", 1],
        ['"All keys from c to f" turns into many separate lookups', 1],
      ],
      why: "Sequential writes and easy recovery are the strengths. The in-memory map and the lack of ordering are the limits.",
    },
    M(
      "Why are sequential writes faster than random access to a disk?",
      [
        "The disk writes in one continuous place instead of jumping around",
        "The disk skips checking that the data was really saved, so nothing is delayed",
        "The disk keeps every write in memory and never flushes",
        "The disk compresses data as it lands on the platter",
      ],
      0,
      "Random access pays a positioning cost each time; sequential writes avoid it.",
    ),
    TF(
      "A hash index can efficiently return all keys between two given values, in order.",
      false,
      "A hash map has no order, so each key in the range would need its own lookup.",
    ),
    M(
      "Why is the log broken into segments?",
      [
        "Closed segments can be compacted to free disk space",
        "Segments let random writes replace all the appending",
        "Segments make the hash map bigger than the memory",
        "Segments remove the need for any index at all",
      ],
      0,
      "A file is closed at a size limit and writes go to a new one, so older files can be cleaned up.",
    ),
    {
      type: "multi",
      q: "Which requests suit a hash-indexed log? Select all that apply.",
      o: [
        "Fetch the latest value for one exact key",
        "Update one counter again and again",
        "Delete one key by appending a tombstone",
        "List every key between m100 and m900 in order",
      ],
      a: [0, 1, 2],
      why: "Exact-key reads, repeated updates and tombstone deletes are all appends and single lookups. An ordered range is the weakness.",
    },
    {
      type: "bug",
      q: "compact() should keep the newest value for each key. Records arrive oldest first. Click the faulty line.",
      code: [
        "def compact(records):",
        "    latest = {}",
        "    for key, value in reversed(records):",
        "        latest[key] = value",
        "    return latest",
      ],
      a: 2,
      why: "Reversing means the oldest record is written last, so it wins. It should loop over records in their normal order.",
    },
    M(
      "A log holds only distinct keys, each written once. How much does compaction shrink it?",
      [
        "Barely at all, because there are no duplicates to drop",
        "To one record, because compaction keeps a single line",
        "By half, because old segments are always merged in pairs",
        "To nothing, because every record counts as stale",
      ],
      0,
      "Compaction only removes overwritten or deleted values; unique keys all stay.",
    ),
    TF(
      "After compaction, the latest value for each key is still kept.",
      true,
      "Throwing away older duplicates is the whole point; the newest record survives.",
    ),
  ]);

  B.add("ds-hashidx", [
    M(
      "Why is crash recovery easier with this design?",
      [
        "An update appends a new record instead of overwriting old bytes",
        "An update is copied to a second disk before it finishes",
        "An update rebuilds the whole file from scratch each time",
        "An update skips writing anything until the next restart",
      ],
      0,
      "Old content is never modified, so a crash cannot corrupt earlier data.",
    ),
    M(
      "After a restart, which part of a hash-indexed store has to be rebuilt?",
      [
        "The in-memory hash map",
        "The oldest segment on disk",
        "The tombstones in the log",
        "The keys' original values",
      ],
      0,
      "The log files persist; only the in-memory map is lost and re-read from them.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Segment", "A closed log file of limited size"],
        ["Compaction", "Dropping older values of repeated keys"],
        ["Byte offset", "Where a record starts in the file"],
        ["Hash map", "An in-memory lookup from key to offset"],
      ],
      why: "The four pieces of the hash-indexed log design.",
    },
  ]);
  Object.assign(partScope, { M, TF });
})();
