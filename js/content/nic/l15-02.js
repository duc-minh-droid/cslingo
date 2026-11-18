/* l15-02: Lecture 15: the MOPSO engine (15.1 figures and the sandbox in l15-workshop.js use it) and 15.2 limiting the archive: why cap it, pruning by clustering and by crowding distance. */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS;
  const sh = NIC.shared.nicL15;
  const { C, pr, mulberry, frame, dot, joinLine, crowd, fmtD, dom, contrib, pruneCrowd, cluster, cen, dist, AX, pts } =
    sh;

  // ---------- a small MOPSO on a two-objective drone problem: time f1 and energy f2, both minimised ----------
  const evalX = (x) => {
    const g = 1 + x[1] + x[2];
    return [10 * x[0], 5 * g * (1 - Math.sqrt(x[0] / g))];
  };
  const TRUE = Array.from({ length: 41 }, (_, i) => [i / 4, 5 * (1 - Math.sqrt(i / 40))]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  /** Archive update (the lecture's rule), then prune back to the cap. */
  function archive(S, x, f) {
    if (S.A.some((a) => dom(a.f, f) || same(a.f, f))) return;
    S.A = S.A.filter((a) => !dom(f, a.f));
    S.A.push({ x: x.slice(), f: f.slice() });
    pruneArch(S);
  }
  function pruneArch(S) {
    if (!S.cap || S.A.length <= S.cap) return;
    const V = S.A.map((a) => a.f);
    S.A = (S.prune === "clu" ? cluster(V, S.cap).keep : pruneCrowd(V, S.cap).keep).map((i) => S.A[i]);
  }
  /** Leader for particle q. rand: uniform. sparse: binary tournament on crowding distance. count: roulette on 1 / (1 + swarm members dominated). hv: largest hypervolume contribution with q as the reference point, random if none. */
  function leader(S, q) {
    const A = S.A,
      n = A.length,
      r = S.r;
    if (n > 1 && S.lead === "sparse") {
      const d = crowd(
        A.map((a) => a.f),
        A.map((_, i) => i),
      );
      const i = Math.floor(r() * n),
        j = Math.floor(r() * n);
      return A[d[i] >= d[j] ? i : j];
    }
    if (n > 1 && S.lead === "count") {
      const w = A.map((a) => 1 / (1 + S.P.filter((p) => dom(a.f, p.f)).length));
      let t = r() * w.reduce((s, x) => s + x, 0);
      for (let i = 0; i < n; i++) if ((t -= w[i]) <= 0) return A[i];
    }
    if (n > 1 && S.lead === "hv") {
      const c = contrib(
          A.map((a) => a.f),
          q.f,
        ),
        m = Math.max(...c);
      if (m > 0) return A[c.indexOf(m)];
    }
    return A[Math.floor(r() * n)];
  }
  /** o: {cap (0 = no cap), prune: crowd | clu, lead: rand | sparse | count | hv, rule: new | old} */
  function mopsoInit(seed, o = {}) {
    const r = mulberry(seed);
    const S = { r, it: 0, A: [], cap: 10, prune: "crowd", lead: "rand", rule: "new", n: 10, ...o };
    S.P = Array.from({ length: S.n }, () => {
      const x = [r(), r(), r()],
        f = evalX(x);
      return { x, v: x.map(() => (r() - 0.5) * 0.2), p: x.slice(), pf: f, f };
    });
    S.P.forEach((q) => archive(S, q.x, q.f));
    return S;
  }
  function mopsoStep(S) {
    const r = S.r;
    S.P.forEach((q) => {
      const ld = leader(S, q);
      q.L = ld.f;
      q.v = q.v.map((v, j) =>
        clamp(0.5 * v + 1.5 * r() * (q.p[j] - q.x[j]) + 1.5 * r() * (ld.x[j] - q.x[j]), -0.25, 0.25),
      );
      q.x = q.x.map((x, j) => clamp(x + q.v[j], 0, 1));
      q.f = evalX(q.x);
      if (S.rule === "old" ? dom(q.f, q.pf) : !dom(q.pf, q.f)) ((q.p = q.x.slice()), (q.pf = q.f));
    });
    S.P.forEach((q) => archive(S, q.x, q.f));
    S.it++;
    return S;
  }
  const mopsoStats = (S) => {
    const c = S.A.map((a) => a.f[0]);
    return {
      size: S.A.length,
      near: S.A.filter((a) => a.x[1] + a.x[2] < 0.05).length,
      lo: Math.min(...c),
      hi: Math.max(...c),
    };
  };
  Object.assign(sh, { TRUE, evalX, mopsoInit, mopsoStep, mopsoStats, pruneArch });

  /** Twelve archive members on one front, in three clumps plus three loners. */
  const P12 = pts(
    "a 0.5 9.5, b 1.4 7.6, c 1.7 7, d 2 6.5, e 3.6 4.3, f 4 3.9, g 4.4 3.6, h 6 2.6, i 7.6 1.7, j 8 1.5, k 8.4 1.3, l 9.5 0.5",
  );
  const IDS = Object.keys(P12),
    V12 = IDS.map((k) => P12[k]);
  const gap = (keep) => {
    const s = keep.map((i) => V12[i]).sort((a, b) => a[0] - b[0]);
    return Math.max(0, ...s.slice(1).map((p, i) => dist(p, s[i])));
  };
  const span = (keep) => {
    const t = keep.map((i) => V12[i][0]);
    return `${Math.min(...t).toFixed(1)} to ${Math.max(...t).toFixed(1)}`;
  };
  const ends = (keep) => [0, 11].filter((i) => keep.includes(i)).length;
  /** Which members a method keeps at a given cap. */
  const KEEP = {
    first: (cap) => V12.map((_, i) => i).slice(0, cap),
    rand: (cap) => {
      const r = mulberry(11),
        o = V12.map((_, i) => [r(), i]).sort((a, b) => a[0] - b[0]);
      return o.slice(0, cap).map((x) => x[1]);
    },
    crowd: (cap) => pruneCrowd(V12, cap).keep,
    clu: (cap) => cluster(V12, cap).keep,
  };
  const NAMES = { first: "Keep the oldest", rand: "Keep at random", crowd: "Crowding distance", clu: "Clustering" };
  /** Kept members in green, pruned ones grey; stats for spread. o: {methods, cap, slider} */
  function pruneView(b, o) {
    let m = o.methods[0],
      cap = o.cap;
    const fr = frame({ ...AX, h: 290 });
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><div class="nw13-stats" data-t></div>`;
    const draw = () => {
      const keep = KEEP[m](cap);
      const kv = keep.map((i) => V12[i]);
      let under = joinLine(fr, kv, "teal");
      if (m === "clu")
        under += cluster(V12, cap)
          .C.map((c) => {
            const z = cen(V12, c);
            return `<circle cx="${fr.X(z[0])}" cy="${fr.Y(z[1])}" r="${Math.max(14, 6 + Math.max(...c.map((i) => dist(V12[i], z))) * 26)}" fill="var(--violet)" fill-opacity=".08" stroke="var(--violet)" stroke-dasharray="4 4"/>`;
          })
          .join("");
      const d = m === "crowd" ? crowd(V12, keep) : {};
      qs("[data-p]", b).innerHTML = fr.wrap(
        under +
          IDS.map((k, i) =>
            dot(fr, k, V12[i], {
              c: keep.includes(i) ? "teal" : "dim",
              lab: m === "crowd" && keep.includes(i) ? `${k} ${fmtD(d[i])}` : k,
            }),
          ).join(""),
        `${NAMES[m]} keeps ${keep.length} of 12: ${keep.map((i) => IDS[i]).join(", ")}.`,
      );
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat teal"><small>Kept</small><b>${keep.length} of 12</b></div><div class="wk-stat blue"><small>Time range covered</small><b>${span(keep)}</b></div><div class="wk-stat amber"><small>Largest gap</small><b>${gap(keep).toFixed(1)}</b></div><div class="wk-stat blue"><small>Ends kept</small><b>${ends(keep)} of 2</b></div>`;
    };
    if (o.methods.length > 1)
      qs("[data-c]", b).append(
        N.seg(
          o.methods.map((k) => [k, NAMES[k]]),
          m,
          (v) => ((m = v), draw(), o.onChange && o.onChange(m, cap)),
        ),
      );
    if (o.slider) {
      const s = N.slider("Archive cap", 2, 11, 1, cap);
      s.onInput((v) => ((cap = v), draw(), o.onChange && o.onChange(m, cap)));
      qs("[data-c]", b).append(s);
    }
    draw();
  }

  /** Why cap: a bigger archive means more comparisons and more options to read. */
  function capFig(b) {
    const fr = frame({ ...AX, h: 250 });
    b.innerHTML = `<div class="controls" data-c></div><div data-p></div><div class="nw13-stats" data-t></div>`;
    const sl = N.slider("Archive size", 5, 200, 5, 10);
    qs("[data-c]", b).append(sl);
    const draw = (n) => {
      const P = Array.from({ length: n }, (_, i) => {
        const x = 0.3 + (9.4 * i) / Math.max(1, n - 1);
        return [x, 5 * (1 - Math.sqrt(x / 10)) * 1.8];
      });
      qs("[data-p]", b).innerHTML = fr.wrap(
        P.map((p, i) => dot(fr, i, p, { c: "teal", lab: false, r: n > 60 ? 3 : 5 })).join(""),
        `An archive of ${n} solutions along one front.`,
      );
      qs("[data-t]", b).innerHTML =
        `<div class="wk-stat amber"><small>Checks per iteration (10 particles)</small><b>${10 * n}</b></div><div class="wk-stat blue"><small>Options for the decision maker</small><b>${n}</b></div>`;
    };
    sl.onInput(draw);
    draw(10);
  }

  /** Hierarchical clustering, one join at a time, then one representative per cluster. */
  function clusterFig(b) {
    const R = cluster(V12, 6);
    let k = 0;
    const fr = frame({ ...AX, h: 290 });
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Join the closest pair</button><button class="btn ghost" data-a="rs">Start again</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const groups = (n) => {
      let G = V12.map((_, i) => [i]);
      R.joins.slice(0, n).forEach((j) => (G = G.filter((g) => !g.every((i) => j.includes(i))).concat([j])));
      return G;
    };
    const draw = () => {
      const n = Math.min(k, R.joins.length),
        G = groups(n),
        rep = k > R.joins.length;
      const RC = ["teal", "blue", "violet", "amber", "rose"];
      let s = "";
      G.filter((g) => g.length > 1).forEach((g, gi) => {
        const z = cen(V12, g);
        s += g
          .map(
            (i) =>
              `<line x1="${fr.X(z[0])}" y1="${fr.Y(z[1])}" x2="${fr.X(V12[i][0])}" y2="${fr.Y(V12[i][1])}" stroke="var(--${RC[gi % 5]})" stroke-width="2"/>`,
          )
          .join("");
        s += `<text x="${fr.X(z[0])}" y="${fr.Y(z[1]) + 4}" class="nw13-tk" style="fill:var(--${RC[gi % 5]}-ink)">✕</text>`;
      });
      s += IDS.map((id, i) =>
        dot(fr, id, V12[i], {
          c: rep ? (R.keep.includes(i) ? "teal" : "dim") : "blue",
          ring: rep && R.keep.includes(i),
        }),
      ).join("");
      qs("[data-p]", b).innerHTML = fr.wrap(s, `${G.length} clusters of the 12 archive members.`);
      const last = R.joins[n - 1];
      qs("[data-n]", b).innerHTML = rep
        ? `Six clusters reached. Keep the member nearest each centre (✕): <b>${R.keep
            .map((i) => IDS[i])
            .sort()
            .join(", ")}</b>.`
        : n
          ? `Joined <b>${last.map((i) => IDS[i]).join(", ")}</b>. ${G.length} clusters${G.length === 6 ? ": the cap. Press again to pick representatives." : ", cap 6."}`
          : "Every member starts as its own cluster: 12 clusters, cap 6.";
    };
    qs("[data-a=nx]", b).onclick = () => ((k = Math.min(R.joins.length + 1, k + 1)), draw());
    qs("[data-a=rs]", b).onclick = () => ((k = 0), draw());
    draw();
  }

  /** Tap a member to see its crowding cuboid. */
  function cuboidFig(b) {
    const fr = frame({ ...AX, h: 290 });
    const all = V12.map((_, i) => i),
      d = crowd(V12, all);
    let sel = 5;
    b.innerHTML = `<div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const o = [...all].sort((x, y) => V12[x][0] - V12[y][0]),
        r = o.indexOf(sel);
      let s = "";
      if (r > 0 && r < 11) {
        const A = V12[o[r - 1]],
          B = V12[o[r + 1]];
        s = `<rect x="${fr.X(A[0])}" y="${fr.Y(A[1])}" width="${fr.X(B[0]) - fr.X(A[0])}" height="${fr.Y(B[1]) - fr.Y(A[1])}" fill="var(--amber)" fill-opacity=".15" stroke="var(--amber)" stroke-dasharray="5 4"/>`;
      }
      qs("[data-p]", b).innerHTML = fr.wrap(
        s +
          IDS.map((id, i) => dot(fr, id, V12[i], { c: "teal", ring: i === sel, lab: `${id} ${fmtD(d[i])}` })).join(""),
        `Twelve archive members with their crowding distances. Selected: ${IDS[sel]}.`,
      );
      const A = V12[o[r - 1]],
        B = V12[o[r + 1]];
      qs("[data-n]", b).innerHTML =
        r === 0 || r === 11
          ? `<b>${IDS[sel]}</b> is an end of the front: crowding distance ∞, so it is never pruned.`
          : `<b>${IDS[sel]}</b>: neighbours ${IDS[o[r - 1]]} and ${IDS[o[r + 1]]}. Time gap ${(B[0] - A[0]).toFixed(1)} ÷ 9, energy gap ${(A[1] - B[1]).toFixed(1)} ÷ 9, total <b>${fmtD(d[sel])}</b>.`;
    };
    qs("[data-p]", b).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (t) ((sel = IDS.indexOf(t.dataset.id)), draw());
    });
    draw();
  }

  /** Remove the most crowded member, recompute, repeat. */
  function crowdPruneFig(b) {
    const R = pruneCrowd(V12, 6);
    let k = 0;
    const fr = frame({ ...AX, h: 290 });
    b.innerHTML = `<div class="controls"><button class="btn primary" data-a="nx">Remove the most crowded</button><button class="btn ghost" data-a="rs">Start again</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`;
    const draw = () => {
      const gone = R.out.slice(0, k).map((x) => x[0]),
        live = V12.map((_, i) => i).filter((i) => !gone.includes(i)),
        d = crowd(V12, live);
      const low = live.reduce((x, y) => (d[y] < d[x] ? y : x));
      qs("[data-p]", b).innerHTML = fr.wrap(
        live
          .map((i) =>
            dot(fr, IDS[i], V12[i], {
              c: live.length > 6 && i === low ? "rose" : "teal",
              lab: `${IDS[i]} ${fmtD(d[i])}`,
            }),
          )
          .join(""),
        `${live.length} archive members left, cap 6.`,
      );
      const last = R.out[k - 1];
      qs("[data-n]", b).innerHTML =
        (last ? `Removed <b>${IDS[last[0]]}</b> (${fmtD(last[1])}). ` : "") +
        (live.length > 6
          ? `${live.length} left, cap 6. Most crowded now: <b>${IDS[low]}</b> (red).`
          : `At the cap: kept <b>${live.map((i) => IDS[i]).join(", ")}</b>.`);
    };
    qs("[data-a=nx]", b).onclick = () => ((k = Math.min(R.out.length, k + 1)), draw());
    qs("[data-a=rs]", b).onclick = () => ((k = 0), draw());
    draw();
  }

  Object.assign(sh, { pruneView, capFig, clusterFig, cuboidFig, crowdPruneFig });
})();
