# ds-12 recap video script: Virtualisation and containers

**Purpose:** show, with one bakery app, why code breaks when it moves between machines, and how virtual machines, containers, Docker images and Kubernetes carry the whole environment along with the code.

**Target length:** about 2 minutes silent (title 4 s + nine scenes, 108 s + recap 9 s = 121 s), about 4 minutes narrated.

**Running example (from the lessons):** Loafly, a neighbourhood bakery app. Mo, its data scientist, wrote `forecast.py`, a model that predicts how many sourdough loaves to bake tomorrow. It works on Mo's laptop (Windows 11, Python 3.12, pandas 2.2) and crashes on Loafly's server (Ubuntu Linux, Python 3.8, pandas 1.3). Later Loafly runs six small services (the forecaster, the shop, the delivery planner and more) and a three-node Kubernetes cluster for the shop.

**Source lessons:** 12.1 ds12-works and 12.2 ds12-vm (`js/content/ds/ds-l12-01.js`), 12.3 ds12-light and 12.4 ds12-docker (`ds-l12-02.js`), 12.5 ds12-images and 12.6 ds12-k8s (`ds-l12-03.js`). Workshop 12.W "Workshop: ship Loafly" (`ds-l12-workshop.js`).

**Colour roles (whole video):**
- **grey**: hardware (the physical machine boxes, "Hardware", "Host hardware"), wires, arrows, plain labels.
- **blue**: operating systems (host OS, guest OS, the one shared kernel, "Small Linux VM").
- **purple**: the layer that manages others (hypervisor, container engine / Docker, Docker Desktop's WSL2 or Hyper-V, the Kubernetes control plane, the Service).
- **orange**: the environment around the code (Python version, libraries, settings, the Dockerfile lines, namespaces and cgroups).
- **green**: the app running fine and good outcomes (matching rows, "works", a restored snapshot, layers from cache, healthy pods, a ready container).
- **red**: what breaks or is wasted (mismatches, crashes, repeated guest operating systems, rebuilt layers, a node that is down).

---

## Title card (4 s)
- Kicker: `DATA SCIENCE · LECTURE 12`
- Title: `Virtualisation and containers`
- Sub-line: `Ship the whole kitchen, not just the recipe`
- SPOKEN (at 0.9 s): "Lecture twelve. Virtualisation and containers. How to ship the whole kitchen along with the recipe."

---

## Scene 2 · `scene-02-works.js` · 12 s
- Kicker: `IT WORKS ON MY MACHINE`
- Headline: `Same code,` / `different environment`
- VISUAL: Two grey machine cards side by side: left "Mo's laptop", right "Loafly's server". Under each, four rows build one by one (0.5 s apart from 0.6 s): "Windows 11" / "Ubuntu Linux", "Python 3.12" / "Python 3.8", "pandas 2.2" / "pandas 1.3", "forecast.py" / "forecast.py". Between each pair a sign appears: for the first three rows a red "not equal" mark (SVG, not a glyph) and both cells turn orange-left / red-right; for the last row a grey "equals" mark and both cells grey. At 5.0 a green tick pops on the laptop card ("runs") and at 6.0 a red cross with a small crash spark on the server card ("crashes"). At 8.0 the five words of the lesson's list fly in as small orange chips under the cards: "OS", "Python version", "libraries", "dependencies", "configuration".
- CAPTIONS:
  - [0.4, 3.0] "Mo's forecaster: forecast.py, the same file on both machines."
  - [3.2, 5.0] "But Windows 11 against Ubuntu, Python 3.12 against 3.8."
  - [5.2, 7.6] "It runs on the laptop and crashes on the server."
  - [7.8, 11.7] "The environment differs: OS, libraries, dependencies, settings."
- SPOKEN:
  1. "Meet Loafly, a little bakery app. Mo's forecaster, forecast dot py, is the same file on both machines."
  2. "But the laptop runs Windows eleven and Python three point twelve. The server runs Ubuntu Linux and Python three point eight."
  3. "So it works on Mo's laptop and crashes on the server."
  4. "The code is not the problem. The environment is: the operating system, the libraries and their versions, the dependencies and the settings."

## Scene 3 · `scene-03-drift.js` · 12 s
- Kicker: `DRIFT`
- Headline: `Environments drift apart` / `on the road to production`
- VISUAL: Three grey kitchen-shaped boxes in a row joined by grey arrows: "Development" (sub "Mo's laptop"), "Test" (sub "a shared test box"), "Production" (sub "the live server"). At 0.6 they all look identical (same three small orange chips inside: "OS", "Python", "libraries"). From 3.0 a clock icon ticks and the chips change one by one, differently in each box (Test gets a new "Python", Production a new "libraries" chip in red), so the three no longer match; a red wavy line labelled "drift" runs under them at 5.4. At 7.8 the three boxes slide left and shrink; a stack builds bottom-up on the right: grey "Hardware", blue "Operating system", orange "Libraries and settings", green "Mo's forecaster". At 9.6 a purple dashed outline closes round the whole stack, labelled "pack it all: virtualisation or containers".
- CAPTIONS:
  - [0.4, 2.8] "Development, test, production: three machines that start out alike."
  - [3.0, 5.2] "Each gets its own updates and tweaks."
  - [5.4, 7.6] "They drift apart, so deploying across them is fragile."
  - [7.8, 11.7] "The big idea: pack the environment along with the code."
- SPOKEN:
  1. "Code travels from development, on Mo's laptop, to a test box, and then to production, the live server."
  2. "Over the months, each machine gets its own updates and tweaks."
  3. "Slowly the environments drift apart, and moving code between them becomes fragile."
  4. "So here is the big idea of this lecture. Pack the whole environment, the operating system, the libraries and the settings, along with the code. Virtualisation and containers both do that, at different levels."

## Scene 4 · `scene-04-vm.js` · 13 s
- Kicker: `VIRTUAL MACHINES`
- Headline: `A computer inside a computer,` / `run by a hypervisor`
- VISUAL: A layered stack builds bottom-up, centred: grey "Hardware (CPU, memory, disk)" at 0.5, blue "Host operating system" at 1.1. At 2.4 two columns rise on top, each a full guest: blue "Guest OS", orange "Libraries", green "App 1" / "App 2"; a dashed outline round each column is labelled "VM 1 (guest)" and "VM 2 (guest)", and the bottom two layers get the label "host". At 5.6 a purple "Hypervisor" layer slides in between the host OS and the guests, pushing the guests up; small purple arrows from it hand out three chips to each guest: "CPU", "memory", "disk". At 9.2 three small purple name tags appear beside the hypervisor: "VMware Workstation", "VirtualBox", "Hyper-V".
- CAPTIONS:
  - [0.4, 2.2] "The real computer is the host."
  - [2.4, 5.4] "Each virtual machine is a guest with its own OS."
  - [5.6, 9.0] "The hypervisor shares the host's CPU, memory and disk between them."
  - [9.2, 12.7] "For example VMware Workstation, VirtualBox and Hyper-V."
- SPOKEN:
  1. "The real, physical computer is called the host."
  2. "On it run virtual machines, called guests. Each one is a software computer, with its own operating system and its own apps."
  3. "Underneath sits the hypervisor, also called the virtual machine monitor. It creates the guests and shares out the host's processor, memory and disk."
  4. "Popular hypervisors are VMware Workstation, VirtualBox and Hyper-V."

## Scene 5 · `scene-05-emulator.js` · 11 s
- Kicker: `EMULATION OR VIRTUALISATION`
- Headline: `Pretend to be other hardware,` / `or share the real one`
- VISUAL: Two columns. Left title "Emulation": a stack of three boxes: top "Guest software" (sub "e.g. a retro game"), middle orange "Emulator" (sub "pretends to be the old console"), bottom grey "Host hardware". Right title "Virtualisation": top "Guest software" (sub "a full OS + apps"), middle purple "Hypervisor" (sub "shares out the real hardware"), bottom grey "Host hardware". At 0.6 the left column builds; from 2.4 small instruction dots fall from the guest, stop in the emulator, change shape (translated) and only then go down: label "every instruction is translated". At 5.4 the right column builds; at 6.6 the dots go straight down a green curved bypass to the host hardware: label "guest instructions run on the real CPU". At 9.0 a green tick beside the right column.
- CAPTIONS:
  - [0.4, 2.2] "An emulator mimics other hardware, like an old console."
  - [2.4, 5.2] "Every instruction is translated; the game never touches the real hardware."
  - [5.4, 8.8] "A virtual machine does use the host hardware."
  - [9.0, 10.7] "The hypervisor keeps the guests apart."
- SPOKEN:
  1. "Playing an old console game on a laptop uses an emulator. It pretends to be the old console's hardware."
  2. "Every instruction is translated, so the game never touches the real hardware."
  3. "A virtual machine is different. Its guest runs on the host's real hardware."
  4. "The hypervisor only keeps the guests apart. Emulation pretends to be other hardware. Virtualisation shares out the real one."

## Scene 6 · `scene-06-snapshot.js` · 11 s
- Kicker: `SNAPSHOTS`
- Headline: `An undo button` / `for a whole machine`
- VISUAL: A grey horizontal timeline with five dots appearing left to right: blue "VM running" (0.5), purple "Snapshot taken" (1.6, a small camera-frame flash around the VM icon), orange "Update installed" (3.4), red "Forecaster breaks" (5.0, a red cross on a small forecaster card). At 6.8 a green dashed arc sweeps back from the end of the line to the snapshot dot, labelled "roll back: later changes are undone"; the update and the break dots fade to grey; a fifth green dot "Restored" appears at 8.2 with a green tick. At 9.0 a small copy of the snapshot slides off to a second grey host box labelled "copy or migrate".
- CAPTIONS:
  - [0.4, 3.2] "A snapshot saves the VM's state at one exact moment."
  - [3.4, 6.6] "Then an update is installed, and the forecaster breaks."
  - [6.8, 8.8] "Restore the snapshot: every later change is undone."
  - [9.0, 10.7] "Snapshots can also be copied to another host."
- SPOKEN:
  1. "Before a risky update, Loafly takes a snapshot. It saves the virtual machine's state at that exact moment."
  2. "Then the update is installed, and the forecaster breaks."
  3. "Restoring the snapshot puts the machine back to that moment, and every change made afterwards is undone."
  4. "A snapshot can also be copied and moved to another host machine."

## Scene 7 · `scene-07-containers.js` · 14 s
- Kicker: `CONTAINERS`
- Headline: `One shared kernel,` / `many sealed boxes`
- VISUAL: Left half, title "3 virtual machines": grey "Hardware", blue "Host OS", purple "Hypervisor", then three columns each with a red-outlined blue "Guest OS" (red pulses at 2.4 to mark the repeats), orange "Libraries", green "App". Right half, title "3 containers", builds at 5.2: grey "Hardware", blue "Host OS (one shared kernel)", purple "Container engine (e.g. Docker)", then three dashed boxes each holding only orange "Libraries" and green "App". Under each side a stat card counts up at 7.4: left "Operating systems running: 4", "Memory used: 9.5 GB", "Start-up: about a minute"; right "Operating systems running: 1", "Memory used: 3.5 GB", "Start-up: milliseconds"; a small grey note under both "rough numbers, for illustration". At 10.6 a start-up race: a long orange bar "boot a whole guest OS, then the app" under the VM side, a tiny green bar "start the app" under the container side that finishes at once.
- CAPTIONS:
  - [0.4, 2.2] "Three services, three virtual machines."
  - [2.4, 5.0] "Every VM repeats a whole OS: lots of overhead."
  - [5.2, 7.2] "Containers share the host's OS kernel instead."
  - [7.4, 10.4] "Rough numbers: 4 operating systems against 1."
  - [10.6, 13.7] "A container starts in milliseconds, a VM in about a minute."
- SPOKEN:
  1. "Loafly now runs several small services. Here are three of them, each in its own virtual machine."
  2. "Every virtual machine repeats a whole operating system, with its own configuration files. That is a lot of overhead and redundancy."
  3. "Containers work at the operating system level instead. All three share the host's kernel, and each brings only its libraries and its app."
  4. "In the lesson's rough numbers, the virtual machines run four operating systems, the containers just one."
  5. "So a container starts in milliseconds, while a virtual machine must first boot a whole operating system, which takes about a minute."

## Scene 8 · `scene-08-docker.js` · 14 s
- Kicker: `DOCKER`
- Headline: `A packaged app,` / `running in isolation`
- VISUAL: At 0.5 a dashed green box "One container" opens and fills top to bottom: green "forecast.py (the app)", orange "Python 3.12 + pandas 2.2", orange "settings and config". At 3.2 it shrinks to the left and a second box "Shop" appears beside it; around each, three blue chips "Own files", "Own network", "Own process list" pop in with the label "namespaces" (3.4). At 6.4 three orange bars per box fill to different levels, "CPU", "Memory", "IO", with a red cap line at each bar's limit, labelled "cgroups (limits)". At 9.6 the pair drops onto a stack that builds below: grey "Laptop hardware", blue "Windows", purple "WSL2 (modern) or Hyper-V (older)", blue "Small Linux VM", with the two containers on top.
- CAPTIONS:
  - [0.4, 3.0] "Docker packs the app with all its dependencies."
  - [3.2, 6.2] "Namespaces: each container sees its own files, network and processes."
  - [6.4, 9.4] "Cgroups: limits on CPU, memory and IO."
  - [9.6, 13.7] "On Windows, Docker Desktop runs a small Linux VM via WSL2 or Hyper-V."
- SPOKEN:
  1. "Docker is the lunchbox maker. A container holds the app plus everything it needs: its Python, its libraries and its settings."
  2. "Under the hood, a container is just an isolated process. Namespaces give it its own view of the files, the network and the process list."
  3. "Cgroups set its budget. They limit how much processor time, memory and input and output it may use."
  4. "Containers share a Linux kernel, so on a Windows laptop, Docker Desktop runs a small Linux virtual machine, through WSL two or the older Hyper-V."

## Scene 9 · `scene-09-images.js` · 14 s
- Kicker: `IMAGES AND THE DOCKERFILE`
- Headline: `The image is the recipe,` / `the container is the dish`
- VISUAL: At 0.5 a purple card "Forecaster image" (sub "read-only template") on the left; three grey lines fan out to three green cards "Container 1", "Container 2", "Container 3" (sub "running") at 1.2 / 1.5 / 1.8. At 3.0 everything slides away and Mo's Dockerfile appears as four orange code rows, top to bottom: `FROM python:3.12-slim` (base OS + Python), `COPY requirements.txt .` (the library list), `RUN pip install -r requirements.txt` (install the libraries), `COPY . .` (your code). Header "docker build". At 5.6 a "first build" pass: each row gets a red "rebuilt" chip in turn (0.3 s apart). At 7.8 a small tag "changed: your code" appears; second pass: the first three rows get green "from cache" chips, the last row a red "rebuilt" chip; counter "1 rebuilt, 3 from cache". At 10.8 the tag becomes "changed: the library list"; third pass: row 1 green, rows 2 to 4 red; counter "3 rebuilt, 1 from cache".
- CAPTIONS:
  - [0.4, 2.8] "One image, three running containers."
  - [3.0, 5.4] "A Dockerfile builds the image line by line, one layer each."
  - [5.6, 7.6] "First build: every layer is made and cached."
  - [7.8, 10.6] "Change only your code: 1 layer rebuilt, 3 from cache."
  - [10.8, 13.7] "Change the library list: rebuilt from that line down."
- SPOKEN:
  1. "An image is a read-only template, like a recipe card. A container is a running instance of it, so one image can start three identical forecasters."
  2. "A Dockerfile is the written recipe. The docker build command runs it line by line, and each line makes one layer."
  3. "On the first build, every layer is made from scratch and stored in the cache."
  4. "Change only your code, and just the last layer is rebuilt. The other three come straight from the cache."
  5. "Change the library list, and Docker rebuilds from that line down. Written steps mean reproducible builds: infrastructure as code."

## Scene 10 · `scene-10-kubernetes.js` · 15 s
- Kicker: `KUBERNETES`
- Headline: `Say what you want,` / `the cluster keeps it that way`
- VISUAL: At 0.5 a purple box at the top "Control plane" (sub "the brain: schedules, heals, scales"); at 1.0 three grey boxes below it "Worker node 1", "Worker node 2", "Worker node 3". At 2.6 a purple tag "Deployment: replicas 3" and three green pods P1, P2, P3 pop, one per node; at 3.6 a blue-purple bar across the top of the nodes "Service: one stable address" with little grey request dots flowing through it to the pods. At 6.0 pod P2 flashes red and vanishes; at 6.8 a new P2 pops back on node 2 with a purple ring ("restarted"). At 8.8 node 2 turns red and dashed, label "Worker node 2 (down)"; at 9.6 its pod slides along a purple arrow to node 3 and lands green ("rescheduled"); counter "Desired 3 · Running 3". At 12.0 four small purple chips appear at the bottom: "Horizontal scaling", "Self-healing", "Declarative (YAML)", "Cloud-native".
- CAPTIONS:
  - [0.4, 2.4] "A cluster: a control plane and worker nodes."
  - [2.6, 5.8] "A Deployment wants 3 pods; a Service gives them one address."
  - [6.0, 8.6] "A pod crashes: it is restarted."
  - [8.8, 11.8] "Node 2 goes down: its pod is rescheduled. Still 3 running."
  - [12.0, 14.7] "Scaling, self-healing, declarative, cloud-native."
- SPOKEN:
  1. "With dozens of containers, Loafly needs orchestration. Kubernetes runs a cluster: a control plane, the brain, above the worker nodes."
  2. "A Deployment says Loafly wants three pods of the shop. A Service gives customers one stable address, and shares the traffic between the pods."
  3. "When a pod crashes, the control plane notices and restarts it."
  4. "When worker node two goes down, its pod is rescheduled onto a healthy node. Three pods are running again, just as desired."
  5. "That is why everyone uses it: horizontal scaling, self-healing, declarative set-up in YAML, and support on every big cloud."

---

## Recap card (9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; tag "Next: Workshop 12.W" at about 4.2 s.
1. **Virtual machine: a whole computer in software** · blue · pictogram: a small stack with two guest-OS columns on a purple hypervisor bar.
2. **Container: a sealed box on one shared kernel** · green · pictogram: three dashed lunchboxes on one blue bar.
3. **Image builds the box, Kubernetes keeps it running** · purple · pictogram: a recipe card with an arrow to three green pod dots.
- SPOKEN ("at" 0.9 / 2.0 / 3.1):
  1. "A virtual machine is a whole computer in software, run by a hypervisor."
  2. "A container shares the host's kernel, so it is light and starts in milliseconds."
  3. "A Dockerfile builds the image, and Kubernetes keeps the containers in the state you asked for. Next: Workshop twelve W."

## Chapters
1. It works on my machine
2. Drift on the road to production
3. Virtual machines and the hypervisor
4. Emulation or virtualisation
5. Snapshots
6. Containers share one kernel
7. Docker: namespaces and cgroups
8. Images, layers and the Dockerfile
9. Kubernetes keeps the desired state
