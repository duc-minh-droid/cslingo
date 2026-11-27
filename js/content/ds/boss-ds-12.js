/* Data Science Lecture 12 (virtualisation and containers): the boss quiz. New scenario: Tidepool, an ocean research
   lab that runs its sensor-data pipeline on lab laptops, a test server and a cloud cluster. */
(function () {
  const S = NIC.shared.ds12;
  const { svg, tx, box } = S;

  /** Four Dockerfile layers to tap. */
  const layers = svg(
    520,
    176,
    [
      ["L1", "FROM python:3.12-slim", "blue"],
      ["L2", "COPY requirements.txt .", "teal"],
      ["L3", "RUN pip install -r requirements.txt", "amber"],
      ["L4", "COPY . .", "rose"],
    ]
      .map(
        ([k, t, c], i) =>
          `<g data-pick="${k}" style="cursor:pointer">${box(10, 6 + i * 42, 500, 36, "", c)}${tx(26, 29 + i * 42, `${k}  ·  ${t}`, { a: "start", s: 12.5 })}</g>`,
      )
      .join(""),
    "Four Dockerfile layers, L1 to L4",
  );

  NIC.registerBoss({
    id: "ds12-boss",
    subject: "ds",
    lecture: 12,
    title: "Lecture 12 boss quiz",
    blurb:
      "Ten questions set at an ocean research lab: virtual machines, snapshots, containers, Docker images and Kubernetes.",
    lede: "A new scenario: <b>Tidepool</b> is an ocean research lab. Its pipeline cleans data from hundreds of sea sensors. It runs on lab laptops, a test server and a cloud cluster, and it keeps breaking when it moves. Fix that.",
    qs: [
      {
        type: "match",
        q: "Match each Tidepool term to what it means.",
        pairs: [
          ["Host", "The physical server the virtual machines run on"],
          ["Guest", "A virtual machine running on that server"],
          ["Hypervisor", "The software that creates and runs the virtual machines"],
          ["Snapshot", "A virtual machine's saved state at one moment"],
        ],
        why: "The host is the real computer; guests are the VMs on it; the hypervisor (virtual machine monitor) runs them; a snapshot records a VM's state so it can be restored later.",
      },
      {
        type: "cat",
        q: "Virtual machine or container? Sort each Tidepool observation.",
        buckets: ["Virtual machine", "Container"],
        items: [
          ["Boots its own full guest operating system", 0],
          ["Shares the host's kernel with its neighbours", 1],
          ["Run by a hypervisor such as VirtualBox", 0],
          ["Starts in milliseconds", 1],
          ["Brings its own copy of OS configuration files", 0],
          ["Kept apart by namespaces and limited by cgroups", 1],
        ],
        why: "VMs each run a guest OS on a hypervisor, so they repeat a lot and start slowly. Containers are isolated processes sharing the host kernel, built on namespaces and cgroups, and start in milliseconds.",
      },
      {
        type: "mcq",
        q: "Tidepool's pipeline runs on a researcher's laptop but fails on the test server. The code is identical. What is the most likely cause?",
        o: [
          "Different library versions",
          "The code was copied with errors",
          "The test server is too fast",
          "The sensors sent less data",
        ],
        a: 0,
        why: "This is the “works on my machine” problem: differences in OS, Python version, libraries, dependencies and configuration, which drift apart between dev, test and production.",
      },
      {
        type: "mcq",
        q: "A Tidepool technician plays an old arcade game whose code never runs directly on the PC's hardware. What is running it?",
        o: ["An emulator", "A hypervisor", "A container engine", "Kubernetes"],
        a: 0,
        why: "An emulator mimics specialised hardware, so the guest software does not interact with the host hardware. In a virtualised environment the guest does use the host hardware.",
      },
      {
        type: "order",
        q: "Tidepool ships a new pipeline version. Put the steps in order.",
        items: [
          "Write the Dockerfile",
          "Run docker build to make the image",
          "Start containers from the image",
          "Kubernetes keeps the desired number running",
        ],
        why: "The Dockerfile defines the image; docker build runs it line by line to make a layered image; containers are running instances of it; an orchestrator like Kubernetes keeps them in the desired state.",
      },
      {
        type: "bug",
        q: "Every tiny code edit makes Tidepool's build reinstall all its libraries. Tap the line that causes it.",
        code: [
          "FROM python:3.12-slim",
          "WORKDIR /app",
          "COPY . .",
          "RUN pip install -r requirements.txt",
          'CMD ["python", "clean.py"]',
        ],
        a: 2,
        hint: "Once a layer changes, every layer after it is rebuilt.",
        why: "Copying all the code before installing the libraries means any code edit changes that layer, so the install layer after it is rebuilt too. Copy requirements.txt, install, then copy the code.",
      },
      {
        type: "pick",
        q: "Tidepool edits only its <b>requirements.txt</b> and rebuilds. Tap the <b>first</b> layer that has to be rebuilt.",
        fig: layers,
        a: "L2",
        hint: "Which line reads that file?",
        why: "L1 is unchanged and comes from the cache. L2 copies requirements.txt, so it changes, and L3 and L4 after it are rebuilt too.",
      },
      {
        type: "multi",
        q: "Select every true statement about Docker images and containers.",
        o: [
          "An image is read-only",
          "An image is built in layers",
          "A container is a running instance of an image",
          "Layers are cached, so builds are efficient",
          "A container is the template for an image",
          "Each image includes its own hypervisor",
        ],
        a: [0, 1, 2, 3],
        why: "Images are read-only, layered and versioned templates; containers are their runtime instances (“image is the recipe, container is the cooked dish”). Images need no hypervisor: containers share the host kernel.",
      },
      {
        type: "cat",
        q: "Which Kubernetes object does each Tidepool need?",
        buckets: ["Pod", "Deployment", "Service"],
        items: [
          ["The smallest unit, running one cleaning container", 0],
          ["A wrapper around the one container that parses a sensor feed", 0],
          ["“Always keep 5 replicas of image clean:v3”", 1],
          ["Roll out version v4 with a chosen update strategy", 1],
          ["One stable address the dashboard can always call", 2],
          ["Share incoming requests across all the cleaning pods", 2],
        ],
        why: "Pods are the smallest deployable unit (usually one container). Deployments set the desired state: replicas, image, update strategy. Services give a stable endpoint and load balance across pods.",
      },
      {
        type: "mcq",
        q: "One of the three machines in Tidepool's Kubernetes cluster loses power. What happens to the pods that were on it?",
        o: [
          "They are rescheduled onto healthy nodes",
          "They wait until the machine is repaired",
          "The Deployment lowers its replica count",
          "The whole cluster stops",
        ],
        a: 0,
        why: "Kubernetes is self-healing: the control plane sees fewer pods running than desired and reschedules them onto the remaining worker nodes.",
      },
    ],
  });
})();
