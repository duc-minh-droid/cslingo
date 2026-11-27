/* js/bank/ds-51.js: Data Science lecture 12 revision questions, part 1: ds12-works, ds12-vm and ds12-light. */
(function () {
  const B = NIC.bank;
  const { mc, svg, tx, box } = NIC.shared.ds12;

  /** A VM stack to tap: hardware, host OS, hypervisor, guest OS, app. */
  const vmPick = svg(
    520,
    210,
    [
      ["app", "Apps", "rose"],
      ["guest", "Guest operating systems", "amber"],
      ["hyp", "Virtualisation layer", "violet"],
      ["host", "Host operating system", "blue"],
      ["hw", "Physical hardware", "line-2"],
    ]
      .map(
        ([k, t, c], i) =>
          `<g data-pick="${k}" style="cursor:pointer">${box(60, 6 + i * 40, 400, 34, "", c)}${tx(260, 28 + i * 40, t, { s: 12.5 })}</g>`,
      )
      .join(""),
    "A stack of five layers from physical hardware up to apps",
  );

  B.add("ds12-works", [
    {
      type: "multi",
      q: "Which differences between two machines can cause a “works on my machine” failure? Select every one.",
      o: [
        "The operating system",
        "The Python version",
        "Library versions",
        "System configuration",
        "The colour of the desktop wallpaper",
        "The screen size",
      ],
      a: [0, 1, 2, 3],
      why: "The slides list OS, libraries, Python versions, dependencies and system configuration. Cosmetic settings do not change how code runs.",
    },
    {
      type: "order",
      q: "Put the usual journey of code to its users in order.",
      items: ["Development", "Test", "Production"],
      why: "Code moves dev → test → production. Each machine on the way can drift, which makes deployment fragile.",
    },
    mc(
      "Why does deploying across dev, test and production get more fragile over time?",
      ["Their environments drift apart", "The code gets longer every day", "Production machines get slower"],
      "Each machine collects its own updates and tweaks, so the environments drift and the same code may behave differently.",
    ),
    mc(
      "What do virtualisation and containerisation have in common?",
      ["Both abstract resources", "Both need a guest OS per app", "Both are emulators"],
      "Both abstract resources, at different levels: a whole virtual computer, or the operating system level. Only VMs need a guest OS each; neither is emulation.",
    ),
    {
      type: "cat",
      q: "Is each one part of the environment, or the code itself?",
      buckets: ["Environment", "The code"],
      items: [
        ["pandas version 1.3", 0],
        ["Ubuntu Linux", 0],
        ["An environment variable pointing at the database", 0],
        ["The forecasting function Mo wrote", 1],
        ["The line that reads the sales file", 1],
      ],
      why: "The OS, library versions and configuration are the environment around the code; they are what drifts between machines.",
    },
    mc(
      "In distributed systems, why are virtualisation and containerisation useful according to the lecture?",
      ["Updates are easier to deploy", "They remove the network", "They make data smaller"],
      "They make it easier for managers to deploy updates, and improve the efficiency and availability of resources.",
    ),
  ]);

  B.add("ds12-vm", [
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Host", "The physical computer"],
        ["Guest", "A virtual machine on it"],
        ["Hypervisor", "Software that runs the VMs"],
        ["Snapshot", "A VM's saved state"],
      ],
      why: "The host is the physical computer, guests are VMs, the hypervisor (virtual machine monitor, virtualiser) runs them, and a snapshot records a VM's state at one moment.",
    },
    {
      type: "pick",
      q: "Tap the layer that is the hypervisor.",
      fig: vmPick,
      a: "hyp",
      hint: "It sits between the host and the guests.",
      why: "The hypervisor (the virtualisation layer) runs on the host and creates the guest virtual machines above it.",
    },
    {
      type: "cat",
      q: "Hypervisor or not?",
      buckets: ["Hypervisor", "Not a hypervisor"],
      items: [
        ["VirtualBox", 0],
        ["Hyper-V", 0],
        ["VMware Workstation", 0],
        ["pandas", 1],
        ["A web browser", 1],
      ],
      why: "VMware Workstation, VirtualBox (open-source, maintained by Oracle) and Hyper-V (Microsoft) are the hypervisors named in the slides.",
    },
    mc(
      "What is the key difference between emulation and virtualisation?",
      [
        "Whether the guest uses the host hardware",
        "Whether the guest has a screen attached",
        "Whether the guest software is open-source",
      ],
      "In an emulator the guest software does not interact directly with the host hardware; in a virtualised environment it does.",
    ),
    mc(
      "A VM is restored from a snapshot taken last week. What happens to changes made since?",
      ["They are undone", "They are kept", "They move to a new VM"],
      "Restoring a snapshot returns the VM to its state at that time, effectively undoing later changes.",
    ),
    {
      type: "multi",
      q: "Select every true statement about virtual machines.",
      o: [
        "A VM acts like a real computer",
        "Guests run independently of one another",
        "Snapshots can be migrated to another host",
        "A VM never touches the host hardware",
        "Only one VM can run per host",
      ],
      a: [0, 1, 2],
      why: "A VM is a software computer; several guests run independently on one host; snapshots can be copied and migrated. VMs do use the host hardware (that is the difference from emulation).",
    },
  ]);

  B.add("ds12-light", [
    {
      type: "cat",
      q: "Drawback of VMs, or strength of containers?",
      buckets: ["VM drawback", "Container strength"],
      items: [
        ["Significant overhead", 0],
        ["Each guest repeats its own OS and config files", 0],
        ["Shares the host kernel", 1],
        ["Starts in milliseconds", 1],
        ["Scales horizontally very efficiently", 1],
      ],
      why: "VMs repeat a whole OS each (overhead and redundancy). Containers share the host kernel, so they are light, start in milliseconds and scale out easily.",
    },
    mc(
      "What is another name for containerisation?",
      ["OS-level virtualisation", "Hardware emulation", "Hypervisor clustering"],
      "Containerisation abstracts at the operating system level, so it is also called OS-level virtualisation.",
    ),
    {
      type: "multi",
      q: "According to the lecture, containers are meant to be… (select every one)",
      o: ["Portable", "Scalable", "Isolated", "Easier to manage", "Bigger than VMs", "Tied to one machine"],
      a: [0, 1, 2, 3],
      why: "Containers are portable, scalable, easier to build and deploy, easier to manage, and isolated. They are lighter than VMs, not bigger.",
    },
    mc(
      "A container wants more memory than it was given. What does it get?",
      ["Only what was allocated", "All the host's memory", "A new guest OS"],
      "Containers can only use the resources that have been allocated to them.",
    ),
    {
      type: "pick",
      q: "Containers on one host share one of these layers. Tap it.",
      fig: vmPick,
      a: "host",
      hint: "Containers do not bring their own operating system.",
      why: "Containers share the host operating system's kernel. That is why they need no guest OS and are so light.",
    },
    mc(
      "Why are containers far lighter than virtual machines?",
      ["They share the host kernel", "They have no isolation", "They run on emulators"],
      "Containers share the host OS kernel instead of each booting a guest OS, while namespaces still keep them isolated.",
    ),
  ]);
})();
