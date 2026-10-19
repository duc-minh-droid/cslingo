/* Lecture 4 · Replication: the server NODE and the CLUSTER RIG (VID.d4, short name D4). Needs common.js and common-2.js first.
   Same rules as common-2.js: every call is pure, positions are stage pixels (936 x 640), colours are the video's tone roles.

   1. NODE  (a server / client / page as a sticker card: the video's main actor)
        const n = D4.node(parent, {x, y, w: 300, h: 160, name: "Leader", value: "pic 1", unit: "", tone: "grey",
                                   icon: "server" | "person" | "phone" | "none", layout: "value" | "slots"});
        n.set({name, value, unit, tone, vtone, solid, ghost, down, crown, ring, ringK, bump, k, x, y, s, r, o})
            name   the title (30 px, centred at the top in the "value" layout, left of the icon in "slots")
            value  a big 46 px text beside the icon (the node's data: "pic 2", "4"); unit a 28 px line under it ("comments")
            tone   the card colours: blue = leader, green = up to date, orange = behind, red = crashed, grey = neutral
            vtone  colour of the value text only (for example "orange" for a stale answer); solid fills the card in its tone;
                   ghost = dashed empty slot (a node that does not exist yet)
            down   0..1 crash: the card turns red and a red bolt pops over the icon (half way the tone flips to red)
            crown  0..1 pops a blue crown on the top-right corner (the leader marker)
            ring   a tone name draws a ring around the card (ringK 0..1 pops it in)
            bump   0..1 one small pulse (pass V.flash(t, a, b)); k 0..1 pops the whole card in; x, y = offset; s, r, o as V.place
        layout "value": name on top, the icon at the left, the value (and unit) at the right; free body: none.
        layout "slots": the icon and the name on one top row, an empty BODY under them for chips or your own tags
                        (n.body = {x, y, w, h} in parent coordinates; n.slot({n, w, h, gap, dy}) -> options for D4.chips that
                         centre a row of n chips in the body: D4.chips(stage, {...n.slot({n: 3, w: 66, h: 48, gap: 8}), texts: ...})).
        n.x, n.y, n.w, n.h, n.mid -> {x, y} centre, n.edge("left" | "right" | "top" | "bottom", f = 0.5) -> {x, y} on that edge,
        n.el (the card), n.icon (the icon svg group centre: n.iconAt -> {x, y} in parent coordinates)
        The cards do not move their children: a node that moves with set({x, y}) leaves chips you placed on the stage behind.
   2. CLUSTER RIG  (the layout of scenes 4, 9 and 10: the client on the left, the leader and two followers in a column, a log bus)
        const rig = D4.cluster(stage, {h: 160 | 190, layout: "value" | "slots", clientName: "Client", clientIcon: "person",
                                       clientValue: undefined | "3", clientUnit: undefined | "comments", unit: undefined | "comments",
                                       names: {L: "Leader", A: "Follower A", B: "Follower B"}});
          clientValue / clientUnit make the client a page that shows a value (icon "phone" suits it); unit adds the 28 px unit
          line under the value of the three server nodes (layout "value" only: they then show n.set({value}) beside the icon).
        Everything is drawn once, in this order: wires (under), nodes, then your own packets / tags on top. Geometry (stage px):
          client  x 12..252, y centred on the middle node (h 150);      nodes  x 400..700, w 300, height h;
          rows    h 160: y 12 / 240 / 468;   h 190: y 12 / 225 / 438      (leader, A, B: centres rig.cy.L / .A / .B)
          wires   rig.wires.cl (client -> leader), .ca (-> A), .cb (-> B): straight, from (252, rig.cy.A) to the left edge of a
                  node;  rig.wires.logA / .logB: the replication log bus, a polyline from the leader's right edge (700) to x 790,
                  down, and back into the follower's right edge (700)
        rig.L, rig.A, rig.B, rig.client  the nodes (D4.node objects, so set({...}) works on each);  rig.nodes = {L, A, B}
        rig.wires.*.set({tone, k, o, cut, w}) and .at(f): packets ride them, forwards f 0 -> 1 (client to node, leader to follower);
          for an answer coming back fly the same wire with f 1 -> 0.
        rig.svg  the wire layer (append your own pictograms to a later D4.svg(stage) so they lie above the nodes)
        rig.cy = {client, L, A, B}   rig.busX = 790   rig.edges: client right edge point (252, cy) via rig.client.edge("right") */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const T = D4.tone;
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    ...(w != null ? { width: `${f1(w)}px` } : {}),
    ...(h != null ? { height: `${f1(h)}px` } : {}),
  });
  const setText = (el, text) => {
    if (text != null && el.textContent !== String(text)) el.textContent = String(text);
  };
  const setClass = (el, cls) => {
    if (el.className !== cls) el.className = cls;
  };
  const BORDER = 3; // the card border: children are positioned inside it
  const ICONS = { server: D4.server, person: D4.person, phone: D4.phone };

  function node(parent, o = {}) {
    const { x = 0, y = 0, w = 300, h = 160, layout = "value", icon = "server" } = o;
    const base = { name: o.name || "", value: o.value || "", unit: o.unit || "", tone: o.tone || "grey" };
    const hasValue = o.value !== undefined || o.unit !== undefined; // a value (even "") puts the icon at the left, a unit adds a line
    if (!["value", "slots"].includes(layout)) throw new Error(`VID.d4.node: layout "${layout}" (value or slots)`);
    const iw = w - 2 * BORDER;
    const ih = h - 2 * BORDER;
    const slots = layout === "slots";
    const iconAt = slots ? { x: 38, y: 36 } : hasValue ? { x: 58, y: 98 } : { x: iw / 2, y: 98 };
    const iconSize = slots ? 50 : 66;
    const card = V.h("div", { class: "v-card c-grey", style: { ...abs(x, y, w, h), borderRadius: "26px" } });
    const nameEl = V.h("div", {
      class: "v-text",
      text: base.name,
      style: slots
        ? { ...abs(72, 8, iw - 80, 52), fontSize: "30px", lineHeight: "52px", fontWeight: "900", color: "var(--c-ink)" }
        : {
            ...abs(0, 6, iw, 40),
            fontSize: "30px",
            lineHeight: "40px",
            fontWeight: "900",
            textAlign: "center",
            color: "var(--c-ink)",
          },
    });
    const valueEl = V.h("div", {
      class: "v-text",
      style: {
        ...abs(104, o.unit !== undefined ? 54 : 70, iw - 112, 52),
        fontSize: "46px",
        lineHeight: "52px",
        fontWeight: "900",
        textAlign: "center",
        color: "var(--c-ink)",
      },
    });
    const unitEl = V.h("div", {
      class: "v-text dim",
      style: { ...abs(104, 106, iw - 112, 32), fontSize: "28px", lineHeight: "32px", textAlign: "center" },
    });
    const svg = V.s("svg", {
      width: iw,
      height: ih,
      style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
    });
    const drawIcon = ICONS[icon];
    if (icon !== "none" && !drawIcon) throw new Error(`VID.d4.node: unknown icon "${icon}"`);
    const iconG = drawIcon ? svg.appendChild(drawIcon(iconAt.x, iconAt.y, iconSize, "self")) : null;
    const bolt = svg.appendChild(D4.bolt(iconAt.x + 10, iconAt.y, iconSize * 1.15, "red"));
    const crown = svg.appendChild(D4.crown(iw - 34, -4, 60, "blue"));
    const ring = V.h("div", {
      style: {
        ...abs(-(BORDER + 8), -(BORDER + 8), w + 16, h + 16),
        boxSizing: "border-box",
        border: "5px solid var(--blue)",
        borderRadius: "34px",
        visibility: "hidden",
      },
    });
    card.append(ring, svg, nameEl, ...(slots || !hasValue ? [] : [valueEl, unitEl]));
    parent.append(card);
    const body = { x: x + BORDER, y: y + BORDER + 66, w: iw, h: ih - 66 - 8 };
    return {
      el: card,
      x,
      y,
      w,
      h,
      body,
      iconAt: { x: x + BORDER + iconAt.x, y: y + BORDER + iconAt.y },
      mid: { x: x + w / 2, y: y + h / 2 },
      edge: (side, f = 0.5) =>
        ({
          left: { x, y: y + h * f },
          right: { x: x + w, y: y + h * f },
          top: { x: x + w * f, y },
          bottom: { x: x + w * f, y: y + h },
        })[side],
      slot: ({ n = 3, w: cw = 66, h: ch = 48, gap = 8, dy = 0 } = {}) => {
        const rowW = n * cw + (n - 1) * gap;
        return { x: body.x + (body.w - rowW) / 2, y: body.y + (body.h - ch) / 2 + dy, n, w: cw, h: ch, gap };
      },
      set(st = {}) {
        const down = clamp(st.down || 0);
        const tone = down >= 0.5 ? "red" : st.tone || base.tone;
        setClass(card, `v-card c-${tone}`);
        const solid = !!st.solid;
        Object.assign(card.style, {
          background: st.ghost ? "transparent" : solid ? "var(--c)" : "",
          borderColor: solid ? "var(--c-lip)" : "",
          borderStyle: st.ghost || down >= 0.5 ? "dashed" : "solid",
          boxShadow: st.ghost ? "none" : solid ? "0 6px 0 var(--c-lip)" : "",
          color: solid ? "var(--c-on)" : "",
        });
        [nameEl, valueEl].forEach((e) => (e.style.color = solid ? "var(--c-on)" : ""));
        setText(nameEl, st.name ?? base.name);
        setText(valueEl, st.value ?? base.value);
        setText(unitEl, st.unit ?? base.unit);
        valueEl.style.color = st.vtone ? T(st.vtone).ink : solid ? "var(--c-on)" : "";
        V.place(bolt, { s: 0.7 + 0.3 * E.pop(down), o: Math.min(1, down * 4) });
        if (iconG) iconG.style.opacity = down >= 0.5 ? "0.35" : "";
        const ck = clamp(st.crown || 0);
        V.place(crown, { y: (1 - ck) * -12, s: 0.6 + 0.4 * E.pop(ck), o: Math.min(1, ck * 4) });
        const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
        if (st.ring && rk > 0.002) {
          ring.style.borderColor = T(st.ring).c;
          ring.style.visibility = "";
          ring.style.opacity = String(Math.min(1, rk * 3));
          ring.style.transform = `scale(${(0.92 + 0.08 * E.pop(rk)).toFixed(3)})`;
        } else ring.style.visibility = "hidden";
        const k = clamp(st.k ?? 1);
        V.place(card, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)) * (1 + 0.06 * (st.bump || 0)),
          r: st.r || 0,
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  D4.node = node;

  function cluster(parent, o = {}) {
    const { h = 160, layout = "value", clientName = "Client", clientIcon = "person", unit } = o;
    const names = { L: "Leader", A: "Follower A", B: "Follower B", ...(o.names || {}) };
    const step = (628 - 12 - h) / 2;
    const ys = [12, 12 + step, 12 + 2 * step];
    const cy = { L: ys[0] + h / 2, A: ys[1] + h / 2, B: ys[2] + h / 2 };
    cy.client = cy.A;
    const NX = 400;
    const NW = 300;
    const BUS = 790;
    const svg = D4.svg(parent);
    const client = { x: 12, y: cy.client - 75, w: 240, h: 150 };
    const edge = { x: client.x + client.w, y: cy.client };
    const wires = {
      cl: D4.wire(svg, {
        pts: [
          [edge.x, edge.y],
          [NX, cy.L],
        ],
      }),
      ca: D4.wire(svg, {
        pts: [
          [edge.x, edge.y],
          [NX, cy.A],
        ],
      }),
      cb: D4.wire(svg, {
        pts: [
          [edge.x, edge.y],
          [NX, cy.B],
        ],
      }),
      logA: D4.wire(svg, {
        pts: [
          [NX + NW, cy.L],
          [BUS, cy.L],
          [BUS, cy.A],
          [NX + NW, cy.A],
        ],
      }),
      logB: D4.wire(svg, {
        pts: [
          [NX + NW, cy.L],
          [BUS, cy.L],
          [BUS, cy.B],
          [NX + NW, cy.B],
        ],
      }),
    };
    const mk = (key, i, tone) =>
      node(parent, {
        x: NX,
        y: ys[i],
        w: NW,
        h,
        name: names[key],
        tone,
        layout,
        icon: "server",
        ...(layout === "value" ? { value: "", unit } : {}),
      });
    const nodes = { L: mk("L", 0, "blue"), A: mk("A", 1, "grey"), B: mk("B", 2, "grey") };
    const cv = o.clientValue === undefined ? {} : { value: o.clientValue, unit: o.clientUnit };
    const clientNode = node(parent, { ...client, name: clientName, icon: clientIcon, tone: "grey", ...cv });
    return { svg, wires, L: nodes.L, A: nodes.A, B: nodes.B, nodes, client: clientNode, cy, busX: BUS };
  }
  D4.cluster = cluster;
})();
