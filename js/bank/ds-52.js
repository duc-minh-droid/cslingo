/* js/bank/ds-52.js: Data Science lecture 12 revision questions, part 2: ds12-docker, ds12-images and ds12-k8s. */
(function () {
  const B = NIC.bank;
  const { mc, clusterSvg } = NIC.shared.ds12;

  B.add("ds12-docker", [
    {
      type: "cat",
      q: "Namespaces or cgroups?",
      buckets: ["Namespaces", "Cgroups"],
      items: [
        ["Each container sees its own filesystem", 0],
        ["Each container has its own network interface", 0],
        ["Each container has its own process table", 0],
        ["Cap a container's CPU", 1],
        ["Limit a container's memory", 1],
        ["Limit a container's IO", 1],
      ],
      why: "Namespacing gives each container its own filesystem, network interface and process table. Cgroups control resources: CPU, memory and IO.",
    },
    mc(
      "What is a container, at heart?",
      ["An isolated process on the host OS", "A full computer with its own OS", "A copy of the host hardware"],
      "A container is a lightweight, isolated process running on the host OS, using kernel features (namespaces and cgroups).",
    ),
    {
      type: "multi",
      q: "Docker is described as ideal for… (select every one)",
      o: [
        "Reproducible data pipelines",
        "Machine learning",
        "Microservices",
        "Replacing the OS kernel",
        "Emulating old consoles",
      ],
      a: [0, 1, 2],
      why: "Docker gives lightweight, reproducible, isolated environments, ideal for reproducible data pipelines, ML and microservices.",
    },
    mc(
      "How does Docker Desktop run Linux containers on Windows today?",
      ["Through a small Linux VM on WSL2", "By emulating every instruction", "It cannot run them"],
      "Docker Desktop runs a minimal Linux VM, using WSL2 (the modern method) or Hyper-V (the older method).",
    ),
    {
      type: "match",
      q: "Match each Docker-on-Windows option to its description.",
      pairs: [
        ["WSL2", "The modern method"],
        ["Hyper-V", "The older method"],
        ["Docker Desktop", "Runs a minimal Linux VM"],
      ],
      why: "Docker Desktop runs a minimal Linux VM using WSL2 (Windows Subsystem for Linux 2, modern) or Hyper-V (older).",
    },
    mc(
      "Which phrase best sums up a container?",
      [
        "An app plus its dependencies, isolated",
        "A hypervisor running several guests",
        "A saved snapshot of a whole disk",
      ],
      "The slides' summary: “A packaged application + all dependencies, running in isolation.”",
    ),
  ]);

  B.add("ds12-images", [
    mc(
      "Which is the recipe and which is the dish?",
      ["Image: recipe; container: dish", "Container: recipe; image: dish", "Both are recipes"],
      "“Image is the recipe; container is the cooked dish.” A container is a runtime instance of an image.",
    ),
    {
      type: "multi",
      q: "Docker images are… (select every one)",
      o: ["Read-only", "Built in layers", "Versioned", "Running processes", "Different on every start"],
      a: [0, 1, 2],
      why: "Images are read-only, built in layers and versioned. The running process is the container.",
    },
    {
      type: "order",
      q: "Put an image's layers in the order they are usually built.",
      items: ["Base OS", "Installed libraries", "Your code"],
      why: "Each layer is one change on top of the last: base OS → installed libraries → your code.",
    },
    mc(
      "Why is building and sharing Docker images efficient?",
      ["Layers are cached and reused", "Images are compressed twice", "Images skip the base OS"],
      "Unchanged layers are cached, so a build or a download only has to deal with the layers that changed.",
    ),
    {
      type: "bug",
      q: "Every code edit triggers a slow library install. Tap the line to move.",
      code: [
        "FROM python:3.12-slim",
        "COPY . .",
        "RUN pip install -r requirements.txt",
        'CMD ["python", "forecast.py"]',
      ],
      a: 1,
      hint: "Layers after a changed layer are rebuilt.",
      why: "Copying all the code before the install means a code edit changes that layer and forces the install after it to rerun. Copy the code after installing the libraries.",
    },
    mc(
      "What does <b>docker build</b> do with a Dockerfile?",
      ["Builds a layered image", "Starts a Kubernetes cluster", "Takes a VM snapshot"],
      "docker build executes the Dockerfile line by line, producing a layered image: reproducible builds and infrastructure as code.",
    ),
  ]);

  B.add("ds12-k8s", [
    {
      type: "match",
      q: "Match each Kubernetes object to its job.",
      pairs: [
        ["Pod", "Smallest deployable unit"],
        ["Deployment", "Desired replicas and image"],
        ["Service", "Stable address, load balancing"],
      ],
      why: "Pods usually hold one container; Deployments define the desired state (replicas, image, update strategy); Services are a stable endpoint that balances traffic across pods.",
    },
    {
      type: "cat",
      q: "Control plane or worker node?",
      buckets: ["Control plane", "Worker node"],
      items: [
        ["Schedules applications", 0],
        ["Rolls out updates", 0],
        ["Scales applications", 0],
        ["Runs your containers", 1],
        ["Hosts the pods", 1],
      ],
      why: "The control plane is the brain: it manages the cluster, schedules, maintains and scales apps and rolls out updates. Worker nodes run the containers.",
    },
    {
      type: "pick",
      q: "In this cluster, tap the part that is the brain.",
      fig: `${clusterSvg({ want: 3, up: [true, true, true], service: false })
        .replace('<rect x="150"', '<g data-pick="cp" style="cursor:pointer"><rect x="150"')
        .replace("the brain: schedules, heals, scales</text>", "schedules, heals, scales</text></g>")}`,
      a: "cp",
      hint: "It sits above the worker nodes.",
      why: "The control plane manages the cluster and nodes: it schedules, maintains and scales apps and rolls out updates.",
    },
    {
      type: "cat",
      q: "What does Kubernetes do in each case?",
      buckets: ["Restarts it", "Reschedules pods", "Scales up"],
      items: [
        ["A pod crashes", 0],
        ["A container in a pod dies", 0],
        ["A worker node goes down", 1],
        ["A machine loses power", 1],
        ["Traffic suddenly rises", 2],
        ["Load keeps increasing", 2],
      ],
      why: "If a pod dies it restarts; if a node goes down its pods are rescheduled; if load increases it scales up.",
    },
    mc(
      "What is Platform as a Service (PaaS)?",
      [
        "A provider runs the platform for your apps",
        "A way to emulate old hardware on new PCs",
        "A kind of layer inside a Docker image",
      ],
      "With PaaS a third-party provider delivers the platform, so you develop, run and manage apps without building and maintaining the infrastructure yourself.",
    ),
    {
      type: "multi",
      q: "Which reasons for using Kubernetes does the lecture give? Select every one.",
      o: [
        "Built-in horizontal scaling",
        "Self-healing",
        "Declarative deployment with YAML",
        "Cloud-native ecosystem",
        "It removes the need for containers",
        "It only runs on one machine",
      ],
      a: [0, 1, 2, 3],
      why: "Horizontal scaling, self-healing, declarative YAML deployment reproducible across clouds, and integration with GCP, AWS and Azure.",
    },
  ]);
})();
