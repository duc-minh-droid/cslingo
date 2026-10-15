(function () {
  const B = NIC.bank;
  const Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l7-swarm", [
    M(
      "Which of these does a swarm of ants <b>not</b> have?",
      [
        "A central controller giving orders",
        "Simple behaviour in each member",
        "Local interactions between members",
        "Rules for dealing with the environment",
      ],
      0,
      "In a swarm every element is alike and there is no central controller. The group behaviour emerges from local interactions.",
    ),
    TF(
      "In a swarm, the members are normally different specialists with their own jobs.",
      false,
      "Every element of a swarm is the same. Specialised roles are not needed for the group behaviour to emerge.",
    ),
    {
      type: "cat",
      q: "Is each of these something an individual does, or an emergent behaviour of the whole group?",
      buckets: ["Individual", "Emergent"],
      items: [
        ["One ant lays a mark of pheromone", 0],
        ["A colony keeps its nest at a steady temperature", 1],
        ["Termites build a mound", 1],
        ["One fish senses its neighbour's movement", 0],
        ["A shoal twists away from a predator as one", 1],
        ["A worker picks up a crumb", 0],
      ],
      why: "Individuals sense, move and mark. Temperature control, mounds and the twist of a shoal need many members interacting, so they are emergent.",
    },
    M(
      "Every scout in a colony is right with probability 50%, which is a coin flip. The colony follows the majority. How reliable is the colony?",
      [
        "No better than a single scout",
        "Far better as the colony grows",
        "Worse as the colony grows",
        "Always right once there are three scouts",
      ],
      0,
      "A vote only helps when each voter is better than chance. A crowd of coin-flippers is still a coin flip.",
    ),
    {
      type: "slider",
      q: "Each scout picks the better of two routes 60% of the time and the colony goes with the majority. About how often is a colony of 11 scouts right?",
      min: 0,
      max: 100,
      step: 5,
      ans: 75,
      tol: 8,
      unit: "%",
      hint: "One scout alone is 60%, and a colony of 31 is about 87%. Eleven sits between them.",
      why: "A colony of 11 is right about 75% of the time. It is better than one scout, but not yet reliable.",
    },
    {
      type: "order",
      q: "Order how a swarm behaviour becomes an optimisation algorithm.",
      items: [
        "Watch a natural swarm solve a problem",
        "Work out the simple rules each member follows",
        "Copy those rules into software agents",
        "Run many agents on an optimisation problem",
        "Read the answer from what the group settles on",
      ],
      why: "Swarm algorithms come from observation: find the local rules, simulate them, and let the group result be the answer.",
    },
    {
      type: "multi",
      q: "Which of these did Franks (1989) report for Lasius niger colonies?",
      o: [
        "Regulating nest temperature within 1 degree",
        "Forming bridges",
        "Sorting brood and food items",
        "Finding the shortest route from nest to food",
        "Voting for a new queen each season",
      ],
      a: [0, 1, 2, 3],
      why: "These are all swarm behaviours from the lecture's list. Nothing in it describes a vote for a queen.",
    },
    M(
      "Ant colony optimisation and particle swarm optimisation are both…",
      [
        "Optimisation methods inspired by swarms",
        "Kinds of genetic algorithm using crossover",
        "Ways of storing pheromone on a graph",
        "Selection schemes for genetic programming",
      ],
      0,
      "Both borrow from swarm behaviour. ACO copies ants, PSO copies flocks and similar swarms.",
    ),
    M(
      "A colony has no leader, yet its members can share information. Which feature makes this possible?",
      [
        "Marks left in the environment",
        "A central memory every ant can read",
        "Direct orders from the queen",
        "A fixed list of good routes",
      ],
      0,
      "Pheromone is written into the environment by one ant and read by another. That is stigmergy.",
    ),
    {
      type: "match",
      q: "Match each word to its meaning for a swarm.",
      pairs: [
        ["Emergent", "A group ability that no single member has"],
        ["Local rule", "How a member reacts to its neighbours or surroundings"],
        ["Central controller", "Something a swarm does not have"],
        ["Swarm algorithm", "An optimiser that copies simple group behaviour"],
      ],
      why: "A swarm's power comes from many simple members, each following local rules, producing an emergent result.",
    },
    TF(
      "Adding more members always makes a swarm's decisions better, whatever skill each member has.",
      false,
      "The extra members must each be better than chance. With 50% scouts the colony stays at 50%.",
    ),
    M(
      "The bars show how often a colony of each size picks the better route when every scout is right 55% of the time. What does the pattern show?",
      [
        "Larger colonies are more reliable, but slowly",
        "Larger colonies are exactly as reliable as one scout",
        "Colonies become perfect once they pass 21 scouts",
        "Larger colonies are less reliable than small ones",
      ],
      0,
      "The bars rise from 55% to about 68% and then 78%, so bigger is better, with growth that is slow rather than perfect.",
      {
        fig: NIC.fig.bars(
          [
            ["1 scout", 55, "amber"],
            ["21 scouts", 68, "blue"],
            ["61 scouts", 78, "teal"],
          ],
          { max: 100, unit: "%" },
        ),
      },
    ),
  ]);

  const bridgeNodes = { N: [50, 100], U: [230, 40], V: [230, 160], F: [410, 100] };
  B.add("l7-bridge", [
    M(
      "In the double-bridge experiment both branches are the same length. What do the ants do over time?",
      [
        "Most end up on one branch, chosen by chance",
        "They share the branches evenly for ever",
        "They always choose the branch nearest the nest",
        "They avoid both branches and look for a third",
      ],
      0,
      "Early random differences are amplified by pheromone, so the colony commits to one branch. Which one is a matter of chance.",
    ),
    M(
      "One branch of the bridge is longer than the other. After a while most ants use…",
      [
        "The shorter branch",
        "The longer branch, since it has more room",
        "Both branches in equal numbers",
        "Whichever branch was built first",
      ],
      0,
      "The shorter branch is reinforced first, so most ants end up on it.",
    ),
    M(
      "Why does the short branch gain pheromone before the long one?",
      [
        "Ants finish their trips on it sooner",
        "Ants lay more pheromone per step on short paths",
        "Ants can see the food from the short branch",
        "Pheromone evaporates faster on long branches",
      ],
      0,
      "Each ant lays the same amount, but the short trip completes first, so the deposit arrives earlier.",
    ),
    TF(
      "Each ant measures both branches and chooses the shorter one on purpose.",
      false,
      "The ants only sense pheromone. The short branch is found through timing and feedback.",
    ),
    M(
      "A short branch takes 4 time units to cross and a long branch takes 8. An ant leaves the nest every time unit, and each lays pheromone when it reaches the food. At time 6, which branches have received any pheromone?",
      ["Only the short branch", "Only the long branch", "Both branches", "Neither branch yet"],
      0,
      "An ant on the short branch that left at time 0 arrives at time 4. The earliest long-branch ant arrives at time 8, so at time 6 only the short branch has a trail.",
      { hint: "The earliest ant on each branch arrives after 4 and after 8 units respectively." },
    ),
    {
      type: "order",
      q: "Order the loop that locks a colony onto one branch.",
      items: [
        "A few more ants happen to choose one branch",
        "That branch gains a little more pheromone",
        "The next ants find it slightly stronger",
        "More of them choose it",
        "It gains still more pheromone",
      ],
      why: "A small lead becomes a big one: this is positive feedback.",
    },
    {
      type: "cat",
      q: "Does each description fit the equal-branches experiment or the unequal-branches one?",
      buckets: ["Equal branches", "One branch shorter"],
      items: [
        ["Either branch is equally likely to win", 0],
        ["The short branch is reinforced first", 1],
        ["Early random choices decide the outcome", 0],
        ["Round trips on one branch finish earlier", 1],
      ],
      why: "With equal branches only luck and feedback matter. With a shorter branch, timing gives it a head start.",
    },
    {
      type: "multi",
      q: "Which statements about positive feedback in the bridge are true?",
      o: [
        "More pheromone attracts more ants",
        "More ants lay more pheromone",
        "It can commit the colony to a branch",
        "It always picks the best branch",
        "It needs a leader to start it",
      ],
      a: [0, 1, 2],
      why: "Feedback amplifies whichever branch is ahead. It need not be the best branch, and nothing outside the ants is needed to start it.",
    },
    M(
      "In a bridge with branches 5 and 10, one colony still ends up on the longer branch. What is the best explanation?",
      [
        "Early random choices built a trail there first",
        "The long branch was secretly shorter",
        "Ants prefer longer routes when there are many ants",
        "Pheromone only sticks to long branches",
      ],
      0,
      "A few early ants on the long branch can start the snowball before the short branch's timing advantage appears.",
    ),
    {
      type: "pick",
      q: "Two branches join the nest N to the food F. The numbers are lengths. <b>Click every road of the branch that earns pheromone first.</b>",
      fig: Qf.graph(
        bridgeNodes,
        [
          ["N", "U", 2],
          ["U", "F", 2],
          ["N", "V", 5],
          ["V", "F", 4],
        ],
        { pick: "edges", w: 460, h: 200 },
      ),
      a: ["N-U", "U-F"],
      why: "The upper branch is 2 + 2 = 4 long and the lower is 5 + 4 = 9. The shorter branch's ants arrive sooner, so it is reinforced first.",
    },
    M(
      "The long branch is made even longer: the lengths go from 5 and 10 to 5 and 15. Why would the short branch now win more often?",
      [
        "Its head start in pheromone is bigger",
        "The ants see the long branch is too long",
        "Pheromone no longer evaporates on it",
        "More ants arrive at the nest",
      ],
      0,
      "The longer the other branch, the longer the short branch has the trail to itself, so feedback locks it in more reliably.",
    ),
  ]);
})();
