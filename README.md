# Cloud, Choreographed

**Week 12 seminar website** by **Naman, Aejaz, Moin, Kiran, and Bishal**.

An interactive field guide to the life of a cloud application. Scroll through orchestration, Kubernetes, traffic, releases, disaster recovery, and observability. Diagrams move with the page. Nothing here is a slide deck pasted into a browser.

| | |
| --- | --- |
| Course | Cloud Computing · Week 12 |
| Format | Single-page field guide · about 8 minutes |
| Stack | HTML, CSS, GSAP, ScrollTrigger |

---

## Start it after you clone

You need Git and Python 3. No install step, no build step.

```bash
git clone https://github.com/destroyer00712/week-12-seminar.git
cd week-12-seminar
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

Leave that terminal running while you present. Stop the server with `Ctrl + C`.

Use a local server instead of double-clicking `index.html`. Fonts, diagrams, and scroll motion are written to load as a site, and a server is the reliable way to show them.

On a Mac you can open the page from a second terminal:

```bash
open http://127.0.0.1:8080
```

The header has **Motion on**. Turn it off if you want a still page, or if the room prefers reduced motion. The choice is remembered for that browser session.

---

## What is on the website

The page is one continuous story. A fixed header jumps between the big chapters. A thin bar on the right edge shows how far you have scrolled.

### Opening

**Behind every request.** The title screen introduces the system behind an ordinary app: a thousand moving parts, held together on purpose. The orbit diagram is the map for the rest of the talk.

| Mark | Idea |
| --- | --- |
| 01 | Orchestrate |
| 02 | Deploy |
| 03 | Route |
| 04 | Recover |
| 05 | Observe |
| · | Reconcile |

Packets sit on the lines between the app and those jobs. Scroll and the diagram drifts, so the room sees that the picture is alive before the first chapter starts.

### 01 · Orchestration

**The cloud doesn't run on chance.**

A server, a network, and storage are separate actions until something coordinates them. This chapter shows that workflow in three beats:

1. **Declare** the desired state, the outcome you want.
2. **Coordinate** compute, network, and storage, dependencies in the right order.
3. **Reconcile** the running system: observe, compare, adjust.

Under that, three tools sit on different layers and work together:

- **Kubernetes** orchestrates container workloads.
- **Terraform** provisions infrastructure from configuration.
- **Ansible** automates configuration and operational tasks.

### 02 · Kubernetes

**Containers, in concert.**

This is the longest chapter, and the cluster diagram stays on screen while the text changes. The caption on the diagram moves with you: desired state, control plane, worker nodes, reconciliation.

- **The idea.** Kubernetes runs containerized applications across a cluster. You describe the desired state. It keeps working until reality matches. Callouts: self-healing, scaling, controlled updates.
- **The control plane.** API server (the front door), etcd (configuration and state), scheduler (a node for each new Pod), controllers (actual state versus desired state).
- **The worker nodes.** Each worker runs a kubelet and a container runtime. A Pod is the smallest deployable unit: closely related containers that share networking and storage. A note points out that service networking commonly uses kube-proxy or an alternative.
- **Deployments.** Declare the image, the Pod template, and the replica count. Deployments manage ReplicaSets. Change the template to roll out. Change the count to scale. A failed Pod is replaced. The diagram shows that replacement. A note stays honest: recovery still needs capacity, and autoscaling needs metrics.

### 03 · Services and Ingress

**A clear path through the cloud.**

Follow one request, `campus.example/api`, across four stops:

1. **Browser**, the request.
2. **Ingress**, host and path rules.
3. **Service**, a stable DNS name and IP.
4. **Pods**, the ready backends.

Two short essays sit under the path. Pods can be replaced while the address stays. A Service selects backends with labels. Common types named on the page: ClusterIP, NodePort, and LoadBalancer. Ingress is the single entrance that sends HTTP(S) to different destinations, and it needs a controller. The page also notes the Gateway API, and that the Ingress API is frozen. Service and Ingress solve different layers.

### 04 · From theory to terminal

**Make it real.**

A local first deployment, written as a lab rather than a lecture. The checklist is:

1. Start your cluster.
2. Create the workload.
3. Expose and inspect it.
4. Open the application.

The terminal on the right holds the commands: `minikube start`, a nginx Deployment, a NodePort Service, `kubectl get pods,svc`, and `minikube service web`. **Copy commands** puts that block on the clipboard. A note above the lab says to install minikube, kubectl, and a supported driver first. This page explains the commands. It does not run a cluster for you.

### 05 · Deployment strategies

**Every release is a decision.**

Four strategies. Pick one and the panel on the right plays it. **Replay** runs it again.

| Strategy | What the page shows |
| --- | --- |
| Rolling update | Old Pods become v2 one at a time, after readiness. |
| Recreate | The old version stops before the new one starts. There is a gap with no running Pods. |
| Blue / green | Green is prepared beside blue, then traffic switches. Blue stays available for rollback. |
| Canary | A small share, shown as 10%, goes to the new version first. |

A traffic bar shows stable versus new. The closing note draws the line between built-in Deployment strategies (RollingUpdate and Recreate) and the extra coordination blue/green and weighted canary need. The diagrams are illustrative.

### 06 · Disaster recovery

**Things will break.**

The chapter opens on that sentence, then asks the two questions that shape the architecture: how long can the application be down, and how much recent data can you lose?

A timeline marks the last recovery point, the disruption, and the moment service returns.

- **RPO**, recovery point objective: acceptable data loss, measured in time.
- **RTO**, recovery time objective: the target time to restore service.

Then a ladder of postures, from least ready to already serving:

1. **Backup and restore.** Protected copies. Rebuild when needed.
2. **Pilot light.** Core services stay ready. Scale up to recover.
3. **Warm standby.** A smaller working stack waits to take over.
4. **Active / active.** More than one site already serves traffic.

Each rung has a readiness bar. More readiness usually means faster recovery and a higher running cost.

### 07 · Recovery in practice

**A plan you can execute.**

Four moves, in order:

1. **Prepare.** Map critical services and dependencies. Set RTO and RPO. Name owners, contacts, and priorities.
2. **Protect.** Keep backups, replicated data, infrastructure definitions, and runbooks you can actually use.
3. **Respond.** Detect the disruption, activate the plan, restore dependencies, and validate the application and its data.
4. **Rehearse.** Drill, measure, improve, and fail back when the primary is ready.

Beside that, a failover figure. Health-aware routing sends traffic from a primary site to a recovery site. Scroll and the primary is marked unavailable, the recovery path thickens, and the packet moves to the site that is serving. The copy is careful: a load balancer does not restore lost data. Cross-region recovery may also use DNS or global traffic management. The recovery environment already needs the capacity and the data.

### 08 · Application monitoring

**Listen to the signals.**

Running is not the same as healthy. Two illustrative traces draw themselves across the section. They are not live data.

- **Metrics.** What changed? Latency, traffic, errors, saturation.
- **Logs.** What happened? Events around a failure, a request, or a system action.
- **Traces.** Where did it slow? One request, followed across services.

The last block is how to choose an application performance tool: stack support, useful signals, alerts you can act on, data handling, and total cost. Tools named on the page: Prometheus and Grafana, Jaeger, Datadog, and New Relic. OpenTelemetry collects and exports telemetry. The monitoring backend stores, queries, and visualizes it.

### Close

**Orchestrate. Recover. Observe.**

Every signal informs the next decision. The loop keeps going. A link returns to the title.

The footer carries the credit line, Cloud Computing · Week 12, and a sources list: Kubernetes components, Deployments, Services, Ingress, Hello Minikube, AWS disaster recovery patterns, and OpenTelemetry signals.

---

## How the page behaves

- **Chapter nav** in the header: Orchestrate, Deploy, Recover, Observe.
- **Scroll progress** on the right edge.
- **Motion** tied to scroll: the opening orbits, the cluster diagram, the request rail, the release animation, the outage title, the failover packet, and the signal lines.
- **Motion off** keeps the same content and drops the animation, including on the cluster chapter, where the diagram stops being sticky and the full explanation stays in reading order.
- **Release panel** is the only click-to-play diagram. The rest of the story is driven by scrolling.
- **Copy commands** in the lab terminal.

The layout tightens on smaller screens: the chapter nav hides, the cluster diagram moves above the text, and the request path becomes a two-by-two grid.

---

## Project files

```text
index.html          page structure and every diagram
style.css           layout, type, and color
app.js              scroll motion, releases, copy, motion toggle
fonts/              DM Sans and Space Grotesk
vendor/             GSAP and ScrollTrigger
```

Open the site from the project folder so those relative paths resolve.
