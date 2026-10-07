/* js/bank/algo-84.js: revision questions for Phase 8 (ported from the vault). */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a8-cipher", [
    M(
      "A shift cipher with key 7 encrypts CAT. What is the ciphertext?",
      ["JHA", "JAH", "VUM"],
      0,
      "C goes to J, A goes to H, and T wraps past Z to A, so JHA.",
      { hint: "Slide each letter 7 along; T wraps round to A." },
    ),
    TF(
      "A cipher is only safe if the attacker does not know the method.",
      false,
      "Good ciphers stay safe when the method is public; only the key is secret.",
    ),
    M(
      "Why does frequency analysis work against a substitution cipher?",
      [
        "Relabelling keeps each letter's count unchanged",
        "The key is always the commonest letter in the text",
        "Substitution ciphers have only 25 possible keys",
      ],
      0,
      "Each plaintext letter always maps to the same cipher letter, so counts survive.",
    ),
    {
      type: "multi",
      q: "Which are weaknesses of a shift cipher? Select all.",
      o: [
        "Only 25 keys to try",
        "Letter frequencies survive encryption",
        "The key is too long to remember",
        "The ciphertext is longer than the plaintext",
      ],
      a: [0, 1],
      why: "A tiny key space and preserved statistics. The key is one number and the length does not change.",
    },
    M(
      "What is 0110 XOR 0101 (1 where the bits differ)?",
      ["0011", "1111", "0100"],
      0,
      "Column by column: 0 vs 0 gives 0, 1 vs 1 gives 0, 1 vs 0 gives 1, 0 vs 1 gives 1, so 0011.",
      { hint: "Compare 0-1-1-0 with 0-1-0-1 column by column." },
    ),
    M(
      "Six colleagues each need a private symmetric key with every other colleague. How many keys?",
      ["12", "15", "30"],
      1,
      "6 × 5 / 2 = 15.",
      { hint: "6 × 5 = 30 ordered pairs; each key serves two people." },
    ),
    {
      type: "cat",
      q: "Sort each item.",
      buckets: ["Symmetric", "Public-key"],
      items: [
        ["DES", 0],
        ["AES", 0],
        ["RSA", 1],
        ["Same key locks and unlocks", 0],
        ["Public half can be published", 1],
      ],
      why: "DES and AES are symmetric block ciphers. RSA has a public and a private half.",
    },
    {
      type: "order",
      q: "Order a hybrid secure connection.",
      items: [
        "Use a public-key step (DH or RSA) to share a secret",
        "Turn the secret into a symmetric key",
        "Encrypt the bulk data with the fast symmetric cipher",
        "The receiver decrypts with the same symmetric key",
      ],
      why: "Public-key maths sets up the key; the symmetric cipher does the heavy lifting.",
    },
    M(
      "A cipher key is 8 bits long. In the worst case how many keys must a brute-force attacker try?",
      ["8", "64", "256"],
      2,
      "Each bit doubles the count: 2⁸ = 256. That is why real keys have 128 bits or more.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Plaintext", "The readable message"],
        ["Ciphertext", "The scrambled message on the wire"],
        ["Key", "The secret that drives encryption"],
        ["Brute force", "Trying every possible key"],
      ],
      why: "The method is public; the key is the secret that matters.",
    },
    TF(
      "The lecture's question is how to share an encryption key safely through an insecure channel.",
      true,
      "Diffie-Hellman and RSA are the answers covered.",
    ),
  ]);

  B.add("a8-owf", [
    M("What is 3⁴ mod 7?", ["4", "5", "6"], 0, "3⁴ = 81 and 81 = 11 × 7 + 4.", { hint: "7 × 11 = 77." }),
    M("What is 2¹⁰ mod 11?", ["1", "5", "10"], 0, "2¹⁰ = 1024 = 93 × 11 + 1, so the remainder is 1.", {
      hint: "11 × 93 = 1023.",
    }),
    TF(
      "Recovering p and q from n = p × q is believed easy when p and q are huge.",
      false,
      "Factoring is the hard direction. That is what RSA depends on.",
    ),
    M(
      "Square-and-multiply raises a number to the power 64. About how many squarings does it need?",
      ["6", "32", "63"],
      0,
      "64 = 2⁶, so six squarings in a row.",
    ),
    TF(
      "It has been mathematically proved that factoring large numbers is hard.",
      false,
      "It is only believed: nobody has found a fast method, and nobody has proved none exists.",
    ),
    M(
      "Why do we reduce mod n after every multiplication in modular exponentiation?",
      [
        "The numbers stay small instead of growing hugely",
        "It makes the final answer more secret from Eve",
        "It makes the exponent itself smaller each step",
      ],
      0,
      "The remainder is all that matters, and intermediate values never exceed n.",
    ),
    {
      type: "multi",
      q: "Which of these are believed to be easy forwards but hard to reverse? Select all.",
      o: [
        "Multiplying two large primes",
        "Raising g to a secret power modulo a prime",
        "Adding two numbers",
        "Copying a file",
      ],
      a: [0, 1],
      why: "Reversing addition or a copy is trivial. Factoring and the discrete log are the two hard reverses.",
    },
    {
      type: "match",
      q: "Match each easy operation to its hard reverse.",
      pairs: [
        ["Multiply two primes", "Factor the product"],
        ["Compute gᵃ mod p", "Find a (discrete logarithm)"],
        ["Hash a message", "Recover it from the digest"],
      ],
      why: "One-way means a big gap in effort between the two directions.",
    },
    M(
      "From the table 5ˣ mod 23 (x = 1, 2, 3, 4, 5 give 5, 2, 10, 4, 20), what is x when 5ˣ mod 23 = 4?",
      ["3", "4", "5"],
      1,
      "The value 4 sits at x = 4.",
    ),
    {
      type: "cat",
      q: "Easy or hard on a normal computer?",
      buckets: ["Easy", "Hard"],
      items: [
        ["Multiply two 300-digit primes", 0],
        ["Compute 7¹⁰⁰ mod 13 with repeated squaring", 0],
        ["Factor a 600-digit product of two primes", 1],
        ["Find x from 5ˣ mod p when p has 2048 bits", 1],
      ],
      why: "Forward operations take a few steps per bit; the reverses have no known shortcut.",
    },
  ]);
})();
