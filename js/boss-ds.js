/* Data Science boss quiz — a new app (a music-streaming service) instead of the lecture's examples. */
(function () {
  const N = NIC;
  const RT = [80, 95, 100, 110, 120, 130, 150, 200, 450, 1900]; // ms, mean 333.5, median 125
  const rtFig = `<div class="fig-wrap"><svg viewBox="0 0 520 150" style="max-height:150px">${RT.map((v, i) => { const h = Math.min(120, v / 16); return `<rect x="${20 + i * 49}" y="${130 - h}" width="36" height="${h}" rx="6" fill="${v > 400 ? "var(--rose)" : "var(--blue)"}"/><text x="${38 + i * 49}" y="${124 - h}" text-anchor="middle" style="font:800 11px var(--sans);fill:var(--text-dim)">${v}</text>`; }).join("")}<text x="260" y="147" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">10 requests, sorted (ms) · the 1900 bar is clipped</text></svg></div>`;

  N.registerBoss({
    id: "ds1-boss", subject: "ds", lecture: 1, title: "Lecture 1 boss quiz",
    blurb: "Nine questions set in a music-streaming app: faults, load numbers, fan-out, scaling.",
    lede: "A new scenario: <b>Tunely</b>, a music-streaming app. Apply reliability, scalability and maintainability to it.",
    qs: [
      { type: "cat", q: "Tunely's incident log. Was each event a <b>fault</b> (a part misbehaved, users unaffected) or a <b>failure</b> (users lost service)?",
        buckets: ["Fault only", "Failure"],
        items: [["One of three song-streaming servers crashes; the load balancer routes around it", 0], ["A bad config push makes every playlist page return an error", 1], ["A disk in a mirrored pair dies overnight; nobody notices until the swap", 0], ["The whole cloud region goes offline and the app is unreachable", 1]],
        why: "A fault becomes a failure only if it reaches users. Redundancy and routing contained the crash and the dead disk; the config bug and region outage broke the service." },
      { type: "cat", q: "Which building block should back each Tunely feature?",
        buckets: ["Database", "Cache", "Search index", "Batch job"],
        items: [["Remember every user's saved playlists", 0], ["Serve the front-page \"Top 50\" to millions of users without recomputing it per request", 1], ["Find songs by any word in their lyrics", 2], ["Every Sunday, email each user their most-played artists", 3]],
        why: "Durable state lives in a database, hot repeated reads go to a cache, word search needs an index, and periodic big computations are batch jobs." },
      { type: "slider", q: "Tunely logs these 10 response times (see chart). Estimate the <b>mean</b>.", fig: rtFig, min: 0, max: 700, step: 5, start: 150, ans: 333.5, tol: 25, unit: "ms", hint: "Add them in easy chunks: the eight small ones come to about 1,000.",
        why: "Sum = 3335 ms, divided by 10 = <b>333.5 ms</b>. One slow request (1900 ms) drags it far above what most users see." },
      { type: "mcq", q: "Using the latency figure shown: the median is 125 ms. Which single number best describes a <b>typical</b> user's experience, and which one should the on-call engineer watch?",
        fig: rtFig,
        o: ["Typical: the mean (333.5). Watch: the mean", "Typical: the median (125). Watch: p90 or p99", "Typical: the maximum. Watch: the minimum", "Typical: the median. Watch: the median"], a: 1,
        why: "Half of requests beat the median, so it reflects the typical user. The slow tail (the 450 and 1900 ms requests) is what hurts, and only high percentiles show it." },
      { type: "mcq", q: "Tunely adds a social feed using <b>fan-out on write</b>. Users post 2,000 updates per second, and each poster has 200 followers on average. How many feed-cache writes per second is that?", o: ["2,200", "40,000", "400,000", "4,000,000"], a: 2,
        why: "2,000 × 200 = <b>400,000</b> writes per second. The work moves from read time to write time." },
      { type: "mcq", q: "A pop star with <b>50 million</b> followers posts. The feed caches can absorb 500,000 writes per second in total. How long does the fan-out take?", o: ["10 seconds", "100 seconds", "1,000 seconds", "0.1 seconds"], a: 1,
        why: "50,000,000 / 500,000 = <b>100 seconds</b>, far too slow for \"see it within seconds\". That's why huge accounts are merged at read time instead (the hybrid)." },
      { type: "slider", q: "Tunely runs 5,000 disks. Each lasts about 10 years on average. Roughly how many disks die <b>per day</b>?", min: 0, max: 10, step: 0.1, start: 5, ans: 1.4, tol: 0.4, unit: "per day", hint: "10 years is about 3,650 days. So each day, roughly 5,000 / 3,650 disks die: a bit more than 1.",
        why: "10 years ≈ 3,650 days, so 5,000 / 3,650 ≈ <b>1.4 per day</b>. At scale, hardware faults stop being rare events and become routine, so the design must expect them." },
      { type: "multi", q: "Which of these are <b>accidental</b> complexity (caused by how the system was built, not by the problem itself)? Select all that apply.",
        o: ["Three services store timestamps in three different formats", "Songs can have multiple artists and regional release dates", "A critical deploy script only one engineer understands", "Licensing rules differ by country", "A config flag named <code>FLAG_TMP_2</code> that nobody dares remove"], a: [0, 2, 4],
        why: "Multiple artists, release dates and licensing are part of the music business: essential complexity. Inconsistent formats, tribal-knowledge scripts and mystery flags come from the build: accidental, and removable." },
      { type: "mcq", q: "Tunely's single database server is at 90% CPU and user numbers will triple next year. Budget is limited, and an outage of the one box would take the app down. What does the lecture's trade-off suggest?",
        o: ["Scale up: one far bigger server, simplest to run and manage", "Scale out: several cheaper machines, better fault tolerance", "Do nothing: 90% CPU still leaves 10% headroom", "Add a cache in front of writes only"], a: 1,
        why: "Tripling load on one box means a very expensive machine that is still a single point of failure. Scaling out addresses both cost and fault tolerance, but you take on consistency and coordination work." },
    ],
  });
})();
