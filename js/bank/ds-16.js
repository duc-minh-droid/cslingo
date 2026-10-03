(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { costFig, debtBars, errBars } = partScope;
  const B = NIC.bank;

  B.add("ds-maintain", [
    {
      type: "pick",
      q: "Good monitoring should page the on-call engineer. Tap the minute at which the alert rule first fires.",
      fig: errBars,
      a: "m5",
      why: "Minute 4 is above 2% but one minute is not enough. Minute 5 is the second in a row (3.5%), so the rule fires then. Waiting for two minutes avoids false alarms from blips. Minute 7's 9% is far too late, since users have been suffering for several minutes.",
    },
    {
      type: "pick",
      q: "Tap the first month in which team B ships MORE features than team A.",
      fig: debtBars,
      a: "m4",
      why: "In month 3 both ship 8, a tie. In month 4 team A has dropped to 6 while B still ships 8. Skipping tidy-up looks fastest at first, but the mess slows every later change. Simpler code is what keeps a team able to evolve the system.",
    },
    {
      type: "order",
      q: "A company wants to replace its old billing module without a risky big-bang switch. Put the steps in order.",
      items: [
        "Wrap the old billing module behind a small interface",
        "Build the new module behind the same interface",
        "Send 1% of invoices to the new module and compare results",
        "Raise the share step by step while the results stay identical",
        "Retire the old module once it receives no traffic",
      ],
      why: "A clean interface lets old and new swap places. A small share of traffic proves the new module with little risk, and growing it gradually means any problem is found early. This is what evolvability buys you.",
    },
    {
      type: "slider",
      q: "Building a system costs £200 thousand. Maintenance is typically about 90% of its lifetime cost. Roughly what is the lifetime cost, in £ thousand?",
      fig: costFig,
      min: 0,
      max: 3000,
      step: 100,
      ans: 2000,
      tol: 300,
      unit: "k",
      hint: "If the build is 10% of the total, the total is 10 times the build.",
      why: "The build is only 10% of the lifetime cost, so the total is about 10 × £200k = £2 million. Most of the money is spent keeping a system running and changing it, which is why maintainability is worth designing for.",
    },
    {
      type: "match",
      q: "Match each warning sign to the practice that would fix it.",
      pairs: [
        ["A deploy takes 20 manual steps and someone always skips one", "Automate the deploy"],
        ["The same discount rule is pasted into five services", "Define it once and reuse it"],
        ["Nobody notices the queue filling until customers phone", "Add monitoring and alerts"],
        ["Swapping the payment provider means editing every service", "Hide the provider behind one interface"],
      ],
      why: "Manual steps and invisible problems are operability issues, duplication is a simplicity problem, and a change that touches everything is an evolvability problem. Each has a different fix.",
    },
  ]);
})();
