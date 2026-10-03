(function () {
  const partScope = (NIC.shared.algoWorkshops6 = NIC.shared.algoWorkshops6 || {});
  const { channel } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a6-wire",
    subject: "algo",
    lecture: 6,
    order: 90,
    num: "6.W",
    workshop: true,
    title: "Workshop: noisy wire",
    blurb:
      "No code. Flip bits in transit and watch parity, CRC and Hamming react: what they catch, what slips past and how Hamming fixes one.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "A wire carries bits from a sender to a receiver, but noise flips them. <b>You are the noise.</b> Tap a <b>received</b> bit to flip it and see how each scheme reacts.",
        missions: [
          {
            id: "detect",
            t: "Get caught by parity",
            d: "On the <b>Parity</b> tab, flip <b>one</b> received bit.",
            hint: "Tap any bit in the Receiver row. The count of 1s becomes odd.",
          },
          {
            id: "fool",
            t: "Fool parity",
            d: "Flip a <b>second</b> bit so the receiver says all clear, even though data is damaged.",
            hint: "Two flips change the count of 1s by an even amount, so it stays even.",
          },
          {
            id: "burst",
            t: "Let CRC catch a burst",
            d: "On the <b>CRC</b> tab, flip <b>three bits in a row</b> and read the remainder.",
            hint: "Tap three neighbouring bits, for example bits 3, 4 and 5. Press Clean the wire first if you have flipped others.",
          },
          {
            id: "locate",
            t: "Locate and repair",
            d: "On the <b>Hamming</b> tab, flip one bit, read the syndrome, then tap the <b>Repair</b> button and fix it yourself.",
            hint: "Add noise to any bit. Read the failed circles as p4 p2 p1 in binary. Switch to Repair and tap that position.",
          },
          {
            id: "two",
            t: "Break Hamming",
            d: "Flip <b>two</b> bits, then press <b>Auto-correct</b> and see where it goes wrong.",
            hint: "Hamming assumes one error. With two, the syndrome names a bit that was fine.",
          },
        ],
        build: (stage, api) => channel(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "a6-wire-1",
          q: "A frame with even parity arrives with exactly four bits flipped. What does the receiver conclude?",
          opts: [
            "It accepts the frame: the count is still even",
            "Something broke: four flips is too many to miss",
            "It finds the four bad bits and repairs each one",
          ],
          a: 0,
          why: "Each flip changes the count of 1s by one, so four flips change it by an even number. Parity sees 'even' and accepts the damaged frame. It only ever catches odd numbers of flips.",
        }),
      );
      root.appendChild(
        predict({
          id: "a6-wire-2",
          q: "In a Hamming(7,4) codeword, the checks that fail are p4 and p1 while p2 passes. Which position flipped?",
          opts: [
            "Position 5, because p4 p2 p1 reads 101",
            "Position 6, because p4 p2 p1 reads 110",
            "Position 3, because p4 p2 p1 reads 011",
          ],
          a: 0,
          why: "Read the failed checks as binary with p4 first: p4 = 1, p2 = 0, p1 = 1 gives 101, which is 5. Position 5 is the only one inside both p4's and p1's groups but outside p2's.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Parity</b> catches any odd number of flips, but two flips cancel out and slip through. It can't say where.",
            "<b>CRC</b> divides by a generator and sends the remainder. With a degree-3 generator, every burst up to 3 bits wide changes the remainder, but a few heavier patterns can still collide.",
            "<b>Hamming(7,4)</b> overlaps three parity checks. The failed ones, read as binary, give the <b>position</b> of a single flipped bit.",
            "With two errors Hamming confidently fixes the wrong bit. More redundancy buys more power, never certainty.",
          ],
          "Parity detects, CRC detects better, Hamming can locate and fix one.",
        ),
      );
    },
  });

  L["a6-wire"] = {
    sum: "Play the noise yourself: see parity fooled, a CRC catch a burst, and Hamming locate and repair a flipped bit.",
    steps: [
      {
        t: "You are the noise",
        b: `<p>The sender adds a little redundancy to each message. On the wire, <b>you</b> flip bits. The receiver runs a check and gives a verdict. Sometimes the verdict is right and sometimes it is fooled.</p><p><span class="key">Detection says "something broke". Correction says "this bit broke, here is the fix".</span></p>`,
        v: F.flow([
          { t: "Sender adds check bits", c: "blue" },
          { t: "Noise flips bits", c: "rose" },
          { t: "Receiver checks", c: "teal" },
        ]),
        c: {
          q: "Parity arrives with one flipped bit. What can the receiver do?",
          o: [
            "Detect the error but not locate it",
            "Locate the bit and correct it",
            "Nothing, since the count still matches",
          ],
          a: 0,
          why: "One flip makes the count of 1s odd, so the receiver knows something is wrong. But odd or even carries no position, so it can't correct.",
        },
      },
      {
        t: "Reading a syndrome",
        b: `<p>In Hamming(7,4) each parity bit guards a group of positions. Flip one bit and exactly the checks that include it fail. Read them as binary, <b>p4 p2 p1</b>, and you get the position.</p><p>Flip bit 3 (binary 011): p2 and p1 fail, p4 passes, so the syndrome is 011 = 3.</p>`,
        v: F.cells([
          { v: "p4 ✓", c: "teal", sub: "0" },
          { v: "p2 ✗", c: "rose", sub: "1" },
          { v: "p1 ✗", c: "rose", sub: "1" },
          "=",
          { v: "3", c: "amber", sub: "position" },
        ]),
        c: {
          q: "Only p4 fails. Which position flipped?",
          o: ["Position 1", "Position 2", "Position 4"],
          a: 2,
          why: "Position 4 is binary 100: it is in p4's group and in no other. Only p4 fails, so the syndrome reads 100 = 4.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
