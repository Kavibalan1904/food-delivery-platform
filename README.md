# 🍔 Bite — Cloud-Native Food Delivery Platform & DevOps Showcase

### 👨‍💻 By **Kavibalan T**
🔗 **GitHub Repository:** [https://github.com/Kavibalan1904/food-delivery-platform](https://github.com/Kavibalan1904/food-delivery-platform)

> A modern, microservices-based food delivery platform (inspired by **Swiggy** & **Zomato**) architected as an end-to-end DevOps showcase featuring **Docker, Jenkins, Kubernetes (Minikube), Ansible, Prometheus, Grafana, and AWS EC2**.

---

## 💡 In Simple Terms: How Does Bite Work?

Think of Bite like a modern digital food court divided into five simple parts:

1. **Storefront (Frontend):** An interactive web menu built with **React** where customers browse dishes, add meals to their cart, and track orders.
2. **Kitchen Manager (Backend):** A high-speed **FastAPI (Python)** server that receives customer orders, verifies user logins, and notifies restaurant kitchens.
3. **Order Register (Database):** A **MongoDB** database that permanently records menus, user accounts, and live order receipts.
4. **Automated Assembly Line (DevOps):** **Docker, Jenkins, Kubernetes, and Ansible** working together so that any code change pushed to GitHub is automatically tested, packaged into containers, and deployed with **zero downtime**!
5. **Vitals & Flight Deck (Observability):** **Prometheus & Grafana** continuously measuring latency, HTTP error rates, order velocity, and server vitals in real time.

---

## 🛠️ The 9 Core Tools & Real-World Analogies

| Tool | Technology | Real-World Analogy | What It Does in Bite |
| :--- | :--- | :--- | :--- |
| **Docker** | Container Engine | *Standard Shipping Container* | Packages our code and all required dependencies into portable containers so it runs identically anywhere. |
| **Docker Compose** | Multi-Container Orchestrator | *Conductor of an Orchestra* | Spins up Frontend, Backend, MongoDB, Prometheus, and Grafana together locally in one command. |
| **Jenkins** | CI/CD Server (Java 17) | *24/7 Factory Robot Worker* | Listens for GitHub commits, automatically builds container images, and executes deployments. |
| **Docker Hub** | Cloud Container Registry | *Public Cloud Warehouse* | Stores versioned, ready-to-run container images (`kavidevops03/swiftbite-*`) accessible to Kubernetes. |
| **Minikube** | Single-Node Kubernetes | *Air Traffic Controller* | Supervises running containers (pods); if one crashes, it instantly spins up a replacement. |
| **Ansible** | Infrastructure as Code (IaC) | *Automated Checklist Operator* | Connects to the server and applies Kubernetes manifests (`kubectl apply`) automatically without human typing. |
| **Nginx** | Alpine Reverse Proxy & Web Server | *Storefront Greeter & Security* | Serves the React web app in a tiny ~25MB memory footprint and transparently routes `/api/` calls to FastAPI. |
| **Prometheus** | Time-Series Metrics Scraper | *Heart Monitor & Sensor Net* | Scrapes HTTP traffic, latencies, error codes, and business metrics (orders, GMV) every 5-10s from `/metrics`. |
| **Grafana** | Observability & Analytics Dashboard | *Airplane Cockpit Flight Display* | Visualizes live system throughput, latency percentiles (p50-p99), order velocity, and server health. |

---

## 🚀 Complete Step-by-Step Fresher Deployment Guide

Follow these 7 simple steps to launch, configure, and run Bite from scratch on an **AWS EC2** instance.

```
  [ Developer: git push ]
           │
           ▼
  [ GitHub Repository ] ── (Webhook) ──► [ Jenkins CI/CD on AWS EC2 (:8080) ]
                                                        │
     ┌──────────────────────────────────────────────────┴──────────────────┐
     │ Stage 1: Checkout Code from GitHub                                  │
     │ Stage 2: Concurrently Build Backend & Frontend Docker Images        │
     │ Stage 3: Authenticate & Push Images to Docker Hub (kavidevops03)    │
     │ Stage 4: Trigger Ansible Playbook (deploy_k8s.yml)                  │
     └──────────────────────────────────────────────────┬──────────────────┘
                                                        │
                                                        ▼
                                      [ Kubernetes Cluster (Minikube on EC2) ]
                                       • 2x Frontend Pods (React/Nginx) [:30080]
                                       • 2x Backend Pods (FastAPI) [:8000]
                                       • 1x MongoDB Pod (Database) [:27017]
                                       • 1x Prometheus Pod (Metrics) [:30090]
                                       • 1x Grafana Pod (Visuals) [:30030]
                                                        │
                     ┌──────────────────────────────────┴──────────────────────────────────┐
                     ▼                                                                     ▼
    [ Live Browser: http://<EC2-IP>:3000 ]                                [ Observability: http://<EC2-IP>:3001 ]
    (Customer App & Partner Kitchen)                                      (Grafana Dashboards & Prometheus :9090)
```

---

### Step 1: Launch the AWS EC2 Cloud Server
1. Log into your **AWS Management Console** and navigate to **EC2** ➔ **Launch Instance**.
2. Fill in the following details:
   - **Name:** `food-delivery-platform`
   - **OS:** `Ubuntu Server 24.04 LTS (64-bit x86_64)`
   - **Instance Type:** `c7i-flex.large` (2 vCPUs, 8 GiB RAM)  
     *(Why? Concurrent Docker builds, Jenkins, Kubernetes, and Observability stack require 4–8 GB of RAM to avoid freezing).*
   - **Key Pair:** Select your `.pem` key pair (e.g. `food.pem`).
   - **Storage:** Expand from 8GB to **40 GiB gp3 SSD** *(provides space for Docker image layers and swap memory)*.
   - **Security Group Inbound Rules:** Add 6 custom rules:
     - `Port 22` (SSH) — Remote terminal administration (`0.0.0.0/0` or your IP).
     - `Port 3000` (Frontend) — React customer web application (`0.0.0.0/0`).
     - `Port 3001` (Grafana) — Live observability & analytics dashboard (`0.0.0.0/0`).
     - `Port 8000` (Backend API & Swagger) — FastAPI endpoints & docs (`0.0.0.0/0`).
     - `Port 8080` (Jenkins) — CI/CD automation dashboard (`0.0.0.0/0`).
     - `Port 9090` (Prometheus) — Metrics scraper & PromQL console (`0.0.0.0/0`).
3. Click **Launch Instance**.custom rules:
     - `Port 22` (SSH) — Remote terminal administration (`0.0.0.0/0` or your IP).
     - `Port 3000` (Frontend) — React customer web application (`0.0.0.0/0`).
     - `Port 8000` (Backend API & Swagger) — FastAPI endpoints & docs (`0.0.0.0/0`).
     - `Port 8080` (Jenkins) — CI/CD automation dashboard (`0.0.0.0/0`).
3. Click **Launch Instance**.

---

### Step 2: Connect to Your Cloud Server via SSH
1. Open your local terminal (PowerShell, Command Prompt, or Terminal).
2. Set read-only permissions on your private key:
   ```bash
   chmod 400 food.pem
   ```
   *(In Simple Terms: SSH requires that only you can read this private key. If permissions are too open, SSH blocks the connection).*
3. Connect using the public IP of your EC2 server:
   ```bash
   ssh -i food.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
   ```
4. Type `yes` when prompted. You will see the Ubuntu welcome banner.

---

### Step 3: Automated Server Setup & Tool Installation
Run our all-in-one bootstrap script (`setup_server.sh`) to configure the entire server in one go:

```bash
# Clone the repository onto your EC2 server
git clone https://github.com/Kavibalan1904/food-delivery-platform.git
cd food-delivery-platform

# Make the setup script executable and run it
chmod +x setup_server.sh
./setup_server.sh
```

**What happens behind the scenes in `setup_server.sh`?**
1. **2GB Swap Memory:** Sets up virtual memory on the SSD so the server never crashes if RAM spikes during builds.
2. **Docker & Docker Compose:** Installs the container runtime and adds the `ubuntu` user to the `docker` group.
3. **Java 17 & Jenkins:** Installs Jenkins and configures it to start automatically on system boot.
4. **Jenkins Docker Permissions:** Runs `sudo usermod -aG docker jenkins` so Jenkins can run `docker build` commands.
5. **Kubectl & Ansible:** Installs the command-line tools to control Kubernetes.
6. **Minikube:** Launches a single-node Kubernetes cluster inside Docker (allocated 2 CPUs and 2GB RAM).
7. **Kubeconfig for Jenkins:** Copies cluster credentials so Jenkins can deploy pods without permission errors.

---

### Step 4: Run the Application Locally with Docker Compose
Test the full microservices & observability stack locally in 30 seconds:

```bash
# Build and run all 5 containers in background (detached mode)
docker compose up -d --build

# Verify running containers
docker compose ps
```

Open your browser and verify:
- **Frontend Web App:** `http://<YOUR-EC2-IP>:3000`
- **Backend API & Swagger Docs:** `http://<YOUR-EC2-IP>:8000/docs`
- **Health Check Endpoint:** `http://<YOUR-EC2-IP>:8000/api/health`
- **Prometheus Scrape Feed:** `http://<YOUR-EC2-IP>:8000/metrics`
- **Prometheus Metrics Explorer:** `http://<YOUR-EC2-IP>:9090` (Check Targets at `/targets`)
- **Grafana Live Observability Dashboard:** `http://<YOUR-EC2-IP>:3001` (Default login: `admin` / `admin`)

---

### Step 5: Configure Jenkins CI/CD Pipeline (Step-by-Step UI Guide)
1. **Unlock Jenkins:**
   - In your browser, open: `http://<YOUR-EC2-IP>:8080`
   - In your EC2 terminal, get the initial admin password:
     ```bash
     sudo cat /var/lib/jenkins/secrets/initialAdminPassword
     ```
   - Paste the password into Jenkins, click **Install suggested plugins**, and create your Admin user profile.
2. **Store Docker Hub Credentials:**
   - Go to: **Manage Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials** ➔ **Add Credentials**.
   - Kind: `Username with password`
   - Scope: `Global`
   - ID: `dockerhub-credentials` *(Must match the ID in the Jenkinsfile!)*
   - Username: Your Docker Hub username (e.g. `kavidevops03`)
   - Password: Your Docker Hub Personal Access Token (or password)
   - Click **Create**.
3. **Create the CI/CD Pipeline:**
   - Click **New Item** ➔ Name: `swiftbite-pipeline` ➔ Select **Pipeline** ➔ Click **OK**.
   - Scroll down to the **Pipeline** section.
   - Set Definition to: **Pipeline script from SCM**.
   - SCM: **Git**
   - Repository URL: `https://github.com/Kavibalan1904/food-delivery-platform.git`
   - Branch Specifier: `*/main` (or `*/master`)
   - Script Path: `Jenkinsfile`
   - Click **Save**.
4. **Configure Automated GitHub Webhook:**
   - On GitHub, go to your repository ➔ **Settings** ➔ **Webhooks** ➔ **Add webhook**.
   - Payload URL: `http://<YOUR-EC2-IP>:8080/github-webhook/`
   - Content type: `application/json`
   - Events: **Just the push event** ➔ Click **Add webhook**.
5. **Run the Build:**
   - Click **Build Now** in Jenkins. All 4 stages (Checkout, Build, Push, Deploy) will complete in ~14 seconds!

---

### Step 6: Deploy to Kubernetes with Ansible & Expose to the Internet
1. The Jenkins pipeline automatically runs our Ansible playbook:
   ```bash
   ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy_k8s.yml
   ```
2. Verify running Kubernetes pods and services:
   ```bash
   kubectl get pods
   kubectl get services
   ```
   *(You will see 2 backend pods, 2 frontend pods, 1 mongodb pod, 1 prometheus pod, and 1 grafana pod all in `Running` status).*
3. **Expose Services to the Public Internet:**
   ```bash
   # Expose Customer Frontend (:3000)
   kubectl port-forward --address 0.0.0.0 service/frontend 3000:80 &

   # Expose Grafana Observability Dashboard (:3001)
   kubectl port-forward --address 0.0.0.0 service/grafana 3001:3000 &

   # Expose Prometheus Metrics Server (:9090)
   kubectl port-forward --address 0.0.0.0 service/prometheus 9090:9090 &
   ```
   *(Or connect directly through Minikube NodePorts: Frontend `30080`, Grafana `30030`, Prometheus `30090`).*
4. Visit `http://<YOUR-EC2-IP>:3000` for the live storefront and `http://<YOUR-EC2-IP>:3001` for real-time Grafana observability!

---

### Step 7: Testing Real-Time Live Order Tracking (Demo)
1. **Window A (Customer View):** Open `http://<EC2-IP>:3000`. Add dishes (e.g. Thalappakatti Mutton Biryani, Chicken 65, and Egg Kothu Parotta) to your cart and click **Place Order**. You will see the live order tracking page with status: `Order Placed`. Do **NOT** refresh this tab!
2. **Window B (Restaurant Partner View):** In another window, open `http://<EC2-IP>:3000/partner`. You will see the incoming order (#1E2C99) appear with assigned driver Murugan Selvam.
3. In Window B, click **ACCEPT & CONFIRM ORDER** (Mark Preparing).
4. Look at Window A: Within **<1 millisecond**, the customer screen updates to **Preparing** with live driver details—**no browser refresh (F5) required!**
5. Click **Out for Delivery** and **Delivered** to watch the status flow update seamlessly.

#### 📸 Live Application UI & Real-Time Sync Walkthrough

| 1. Customer Storefront & Menus | 2. Live Tracking: Order Placed |
| :---: | :---: |
| ![Customer Storefront](docs_screenshots/09_storefront_menu_browsing.png) | ![Order Placed](docs_screenshots/10_customer_order_placed_tracking.png) |
| *Browse cuisine categories & top Chennai restaurants* | *Customer view (#B61E2C99) awaiting kitchen acceptance* |

| 3. Partner Kitchen Portal | 4. Real-Time Sync: Preparing |
| :---: | :---: |
| ![Partner Kitchen Portal](docs_screenshots/11_restaurant_partner_kitchen_portal.png) | ![Real-Time Preparing](docs_screenshots/12_realtime_order_preparing_update.png) |
| *Merchant dashboard receiving live order #1E2C99* | *Zero-latency status update (<1ms) + rider assigned* |

---

## ⚡ How Real-Time Synchronization Works

```
[ Restaurant Partner Clicks "Mark Preparing" ]
                   │
                   ▼
  1. Authenticated PATCH to /api/orders/{id}/status
  2. HTML5 BroadcastChannel('bite_order_updates')   ──► [<1ms instant tab sync]
  3. Window LocalStorage Event ('bite_last_update') ──► [Multi-window sync]
  4. Window Focus Listener                          ──► [Sync on tab re-entry]
  5. Silent Background Delta Polling (every 2s)     ──► [Cross-device sync]
                   │
                   ▼
[ Customer Screen Updates Instantly Without Refreshing! ]
```

---

## 📊 Enterprise Observability: Prometheus & Grafana Monitoring

Bite features a production-grade monitoring and observability stack built with **Prometheus** for metrics collection and **Grafana** for real-time visual analytics.

```
   [ Customer & Partner Traffic ]
                 │
                 ▼
     [ FastAPI Backend (:8000) ] ── (Prometheus Middleware)
                 │
                 ▼  Exposes /metrics
      [ Prometheus Server (:9090) ]
         • Scrapes every 5s
         • Evaluates TSDB rules
         • Ingests HTTP & Business Metrics
                 │
                 ▼  Auto-Provisioned Data Source
      [ Grafana Dashboard (:3001) ]
         • Real-Time KPI Cards (Uptime, Latency, Errors)
         • API Throughput & Latency Percentiles (p50-p99)
         • Order Velocity, Active Orders & Platform Revenue
         • Microservice CPU & Memory Footprint
```

### 📈 Core Metrics & Four Golden Signals

| Metric Name | Type | Labels | What It Measures |
| :--- | :--- | :--- | :--- |
| `http_requests_total` | Counter | `method`, `endpoint`, `status_code` | Total HTTP traffic & HTTP status breakdown |
| `http_request_duration_seconds` | Histogram | `method`, `endpoint` | End-to-end request latency (p50, p90, p95, p99) |
| `http_requests_in_progress` | Gauge | `method`, `endpoint` | Current concurrent requests being processed |
| `bite_orders_total` | Counter | `status` | Order transitions (`placed`, `preparing`, `delivered`) |
| `bite_order_revenue_total` | Counter | — | Gross platform GMV in INR (₹) |
| `bite_active_orders` | Gauge | — | Live count of orders currently in-flight |
| `bite_user_actions_total` | Counter | `action` | User authentication events (`login`, `register`) |
| `process_resident_memory_bytes` | Gauge | `job` | Backend RAM footprint (RSS) |
| `process_cpu_seconds_total` | Counter | `job` | Backend CPU core utilization |

### 🔍 Handy PromQL Queries Cheat Sheet

```promql
# 1. Total API Request Rate (req/sec) across all endpoints:
sum(rate(http_requests_total[1m])) by (endpoint)

# 2. P95 Request Latency (5-minute rolling window):
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# 3. HTTP 5xx Server Error Percentage:
(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / (sum(rate(http_requests_total[5m])) + 0.0001)) * 100

# 4. Live Order Placement Velocity:
sum(rate(bite_orders_total{status="placed"}[1m]))

# 5. Total Platform Gross Revenue (₹):
sum(bite_order_revenue_total)

# 6. Current In-Flight Active Orders:
bite_active_orders
```

### 🎯 Zero-Touch Grafana Provisioning
No manual dashboard creation or datasource clicking required! On container launch:
1. `grafana/provisioning/datasources/datasources.yml` connects Grafana to Prometheus automatically.
2. `grafana/provisioning/dashboards/dashboards.yml` provisions the pre-built `Bite Platform — Full-Stack Observability` dashboard.
3. Access immediately at `http://<EC2-IP>:3001` (Username: `admin`, Password: `admin`).

---

## 🔍 Line-by-Line Code Breakdowns

<details>
<summary><b>1. Server Automation Script (setup_server.sh)</b></summary>

- `set -e`: Halts script execution immediately if any command fails.
- `fallocate -l 2G /swapfile` & `swapon`: Allocates 2GB emergency disk memory so Node.js image builds never crash.
- `usermod -aG docker jenkins`: Grants Jenkins permission to control the Docker daemon without permission barriers.
- `minikube start --driver=docker --memory=2048 --cpus=2`: Initializes Kubernetes control plane inside Docker.
- `chown -R jenkins:jenkins /var/lib/jenkins/.kube`: Copies cluster credentials so Jenkins can deploy pods.

</details>

<details>
<summary><b>2. Jenkins CI/CD Pipeline (Jenkinsfile)</b></summary>

- `agent any`: Runs pipeline on any available executor.
- `stage('1. Checkout Code')`: Clones the commit from GitHub.
- `stage('2. Build Docker Images')`: Concurrently builds Python FastAPI and React Nginx images.
- `stage('3. Push to DockerHub')`: Uses encrypted credentials (`dockerhub-credentials`) to push images to Docker Hub.
- `stage('4. Deploy via Ansible')`: Invokes `deploy_k8s.yml` to issue rolling restarts to Kubernetes pods.

</details>

<details>
<summary><b>3. Kubernetes Manifests (k8s/)</b></summary>

- `replicas: 2`: Runs two identical copies of Frontend and Backend for high availability and zero-downtime rolling updates.
- `ClusterIP`: Protects backend and database inside internal cluster networking.
- `NodePort / LoadBalancer`: Exposes the frontend port 80 on NodePort 30080.
- `image: mongo:7.0`: Resolves kernel 6.8+ incompatibility (SERVER-121912) on Ubuntu 24.04.
- `prometheus.yaml`: Deploys Prometheus with mounted ConfigMap scraping `backend:8000/metrics` on NodePort 30090.
- `grafana.yaml`: Deploys Grafana with mounted datasource provisioning on NodePort 30030.

</details>

<details>
<summary><b>4. Observability Middleware (backend/app/metrics.py)</b></summary>

- `normalize_path()`: Collapses dynamic URL parameters (e.g. `/api/orders/{id}`) into static route patterns to prevent high-cardinality label explosion in Prometheus TSDB.
- `PrometheusMiddleware`: Starlette/FastAPI ASGI middleware timing request execution (`time.perf_counter()`), tracking in-progress requests, and recording status codes.
- `ORDERS_TOTAL` & `ORDER_REVENUE_TOTAL`: Custom Prometheus counters instrumented directly into business route handlers so business events update live on Grafana.

</details>


---

## 📄 Official Documentation

For the comprehensive, executive technical report with architecture diagrams and high-resolution AWS console screenshots, view or generate:
- [`Bite_Food_Delivery_Platform_Documentation.docx`](Bite_Food_Delivery_Platform_Documentation.docx)
- Run `python generate_docs.py` to regenerate the documentation file at any time.

---

## 👨‍💻 Author & Portfolio

**Kavibalan T**  
- **GitHub Repository:** [food-delivery-platform](https://github.com/Kavibalan1904/food-delivery-platform)  
- **GitHub Profile:** [@Kavibalan1904](https://github.com/Kavibalan1904)  
- **Docker Hub:** [kavidevops03](https://hub.docker.com/u/kavidevops03)  
