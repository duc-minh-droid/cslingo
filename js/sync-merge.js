/* Account sync, merge half: the merge rules for each progress key (see js/sync.js). Pure functions of two snapshots. */
(function () {
  const parse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  };
  const num = (x) => (typeof x === "number" ? x : 0);

  const U = (x, y, f) => {
    const o = { ...x };
    Object.keys(y).forEach((k) => {
      o[k] = k in o ? f(o[k], y[k]) : y[k];
    });
    return o;
  };
  const stable = (v) =>
    Array.isArray(v)
      ? v.map(stable)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, stable(v[k])]),
          )
        : v;
  const canon = (s) => {
    const p = parse(s);
    return p === undefined ? String(s) : JSON.stringify(stable(p));
  };
  const sameData = (a, b) => {
    const ka = Object.keys(a),
      kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => k in b && canon(a[k]) === canon(b[k]));
  };
  const sumDays = (d) => Object.values(d).reduce((t, n) => t + num(n), 0);
  const RULES = {
    "nic.lessonDone": (x, y) => U(x, y, (p, q) => p || q),
    "nic.visited": (x, y) => U(x, y, (p, q) => p || q),
    "nic.predict": (x, y) => U(x, y, (p, q) => p || q),
    "nic.chests": (x, y) => U(x, y, (p, q) => (p < q ? p : q)),
    "nic.ach": (x, y) => U(x, y, (p, q) => (p < q ? p : q)),
    "nic.lessonPos": (x, y) => U(x, y, (p, q) => Math.max(num(p), num(q))),
    "nic.lessonSeen": (x, y) => U(x, y, (p, q) => Math.max(num(p), num(q))),
    "nic.stats": (x, y) => U(x, y, (p, q) => Math.max(num(p), num(q))),
    "nic.quiz": (x, y) => U(x, y, (p, q) => ((p && p.ok) || !(q && q.ok) ? p : q)), // a right answer is never replaced by a wrong one
    "nic.revRounds": (x, y) => U(x, y, (p, q) => p), // finished revision rounds: every device's rounds are kept
    "nic.rev": (x, y) => U(x, y, (p, q) => (num(q && q.t) > num(p && p.t) ? q : p)), // the most recent review of each question
    "nic.activeDays": (x, y) => [...new Set([...x, ...y])].sort(),
    "nic.freeze": (x, y) => {
      const used = [...new Set([...(x.used || []), ...(y.used || [])])];
      return {
        n: Math.max(
          0,
          Math.max(num(x.n), num(y.n)) - (used.length - Math.max((x.used || []).length, (y.used || []).length)),
        ),
        used,
      };
    },
    "nic.xp": (x, y) => {
      const dx = x.days || {},
        dy = y.days || {},
        days = U(dx, dy, (p, q) => Math.max(num(p), num(q)));
      return {
        ...x,
        days,
        total: Math.max(num(x.total), num(y.total)) + Math.max(0, sumDays(days) - Math.max(sumDays(dx), sumDays(dy))),
      };
    },
    "nic.quests": (x, y) => {
      if (x.date !== y.date) return x.date > y.date ? x : y;
      if (x.list.length !== y.list.length || x.list.some((it) => !y.list.some((z) => z.id === it.id))) {
        // two devices drew different quests (some depend on the course): keep one whole list, the one with more progress
        const sc = (q) => q.list.reduce((a, it) => a + (it.claimed ? 3 : it.done ? 2 : 0) + num(it.prog) / 1000, 0);
        return sc(y) > sc(x) ? y : x;
      }
      const list = x.list.map((it) => {
        const o = y.list.find((z) => z.id === it.id);
        return o
          ? {
              ...it,
              prog: Math.max(num(it.prog), num(o.prog)),
              done: it.done || o.done,
              claimed: it.claimed || o.claimed,
            }
          : it;
      });
      return { ...x, list };
    },
  };
  /** Merge two snapshots {"nic.*": raw string}. preferLocal says which side wins keys that have no rule. */
  function mergeData(local, cloud, preferLocal) {
    const rl = num(parse(local["nic.resetAt"])),
      rc = num(parse(cloud["nic.resetAt"]));
    if (rc > rl) return { ...cloud }; // the account was reset after this device last synced
    if (rl > rc) return { ...local }; // this device reset: the account follows
    const out = {};
    new Set([...Object.keys(local), ...Object.keys(cloud)]).forEach((k) => {
      const a = local[k],
        b = cloud[k];
      if (a === undefined) out[k] = b;
      else if (b === undefined) out[k] = a;
      else if (canon(a) === canon(b)) out[k] = a;
      else {
        const pa = parse(a),
          pb = parse(b),
          r = RULES[k];
        out[k] = r && pa !== undefined && pb !== undefined ? JSON.stringify(r(pa, pb)) : preferLocal ? a : b;
      }
    });
    return out;
  }

  NIC.shared.syncMerge = { U, stable, canon, sameData, sumDays, mergeData };
})();
