# 🚀 Complete Fresher Deployment Guide on AWS EC2
## Swiggy-Style Food Delivery Platform – Containerized Microservices Deployment

This guide gives you the exact step-by-step instructions to install and run **Docker, Jenkins, Kubernetes (Minikube), and Ansible all together on the SAME AWS EC2 server** (`c7i-flex.large`).

---

## 📋 The Tools on This Single Server
1. **Docker & Docker Compose** – Builds and runs microservice containers
2. **Jenkins** – Runs automated CI/CD pipeline on port 8080
3. **Minikube (Kubernetes)** – Single-node Kubernetes cluster running inside Docker
4. **Kubectl** – CLI tool to manage Kubernetes pods & services
5. **Ansible** – Deployment automation executing Kubernetes rollouts
6. **AWS EC2 (`c7i-flex.large`)** – 2 vCPUs, 4GB RAM Ubuntu host machine

---

## ☁️ Step 1: Launch the AWS EC2 Instance

1. Log into your **AWS Console** and go to **EC2**.
2. Click **Launch Instance**:
   - **Name**: `food-delivery-platform`
   - **OS**: Ubuntu 24.04 LTS (64-bit) (or Ubuntu 22.04 LTS)
   - **Instance Type**: `c7i-flex.large` (2 vCPUs, 8GB RAM)
   - **Key Pair**: Select your `.pem` key pair
   - **Storage**: 40 GB gp3 (required for Docker image layers, Jenkins builds, and Minikube)
3. **Security Group Inbound Rules** (open these ports):
   - `22` (SSH) – Your IP
   - `3000` (Frontend Web App) – Anywhere (`0.0.0.0/0`)
   - `8000` (Backend API & Swagger Docs) – Anywhere
   - `8080` (Jenkins Web Dashboard) – Anywhere

---

## 💻 Step 2: Install Docker, Jenkins & Kubernetes on the Server

Connect to your EC2 instance via SSH:
```bash
ssh -i your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### Option A: One-Command Automated Setup (Recommended)
We created a complete script [`setup_server.sh`](file:///c:/Users/kavi1/OneDrive/Documents/food-delivery-platform/setup_server.sh) that installs everything, configures swap memory, starts Minikube, and sets up Jenkins permissions automatically:

```bash
git clone https://github.com/Kavibalan1904/food-delivery-platform.git
cd food-delivery-platform
chmod +x setup_server.sh
./setup_server.sh
```

---

### Option B: Step-by-Step Manual Setup

If you want to run each command manually:

```bash
# 1. Update packages & setup 2GB swap space (ensures smooth performance on 4GB RAM)
sudo apt update && sudo apt upgrade -y
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu

# 3. Install Java 17 & Jenkins
sudo apt install -y openjdk-17-jre
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins

# CRITICAL: Allow Jenkins user to run Docker commands
sudo usermod -aG docker jenkins
sudo systemctl enable jenkins
sudo systemctl restart jenkins

# 4. Install Ansible & Kubectl
sudo apt install -y ansible
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm -f kubectl

# 5. Install & Start Minikube (Kubernetes on single-node)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm -f minikube-linux-amd64

# Start Minikube with Docker driver (allocated 2GB RAM, 2 CPUs)
minikube start --driver=docker --memory=2048 --cpus=2

# 6. Configure Jenkins Access to Kubernetes
sudo mkdir -p /var/lib/jenkins/.kube /var/lib/jenkins/.minikube
sudo cp -r ~/.kube/config /var/lib/jenkins/.kube/config
sudo cp -r ~/.minikube/client.crt ~/.minikube/client.key ~/.minikube/ca.crt /var/lib/jenkins/.minikube/ 2>/dev/null || true
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube /var/lib/jenkins/.minikube 2>/dev/null || true
sudo chmod -R 755 ~/.minikube 2>/dev/null || true

# 7. Apply docker group to current shell
newgrp docker
```

---

## 🏃 Step 3: Run the Application with Docker Compose

```bash
cd food-delivery-platform

# Start all services (Frontend, Backend, MongoDB)
docker compose up -d --build

# Check running containers
docker compose ps
```

Open your browser and verify:
- **Frontend App**: `http://<YOUR-EC2-IP>:3000`
- **Backend API & Swagger**: `http://<YOUR-EC2-IP>:8000/docs`
- **Health Check**: `http://<YOUR-EC2-IP>:8000/api/health`

---

## ⚙️ Step 4: Configure Jenkins CI/CD Pipeline

1. Open Jenkins in your browser: `http://<YOUR-EC2-IP>:8080`.
2. Get the initial admin password from EC2:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install suggested plugins and create your admin account.
4. **Add Docker Hub Credentials**:
   - Go to **Manage Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials** ➔ **Add Credentials**.
   - Kind: `Username with password`
   - Scope: `Global`
   - ID: `dockerhub-credentials` *(Must match the ID in your Jenkinsfile)*
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password or Personal Access Token.
5. **Create the Pipeline**:
   - Click **New Item** ➔ Name: `swiftbite-pipeline` ➔ Select **Pipeline** ➔ Click **OK**.
   - Under **Pipeline**, set Definition to **Pipeline script from SCM**.
   - SCM: **Git**
   - Repository URL: `https://github.com/Kavibalan1904/food-delivery-platform.git`
   - Branch: `*/main` or `*/master`
   - Script Path: `Jenkinsfile`
   - Click **Save**.
6. Click **Build Now** to run the 5-stage pipeline!

---

## ☸️ Step 5: Kubernetes Deployment & Exposure

Our Jenkins pipeline automatically deploys via Ansible:
```bash
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy_k8s.yml
```

Verify the pods on Kubernetes:
```bash
kubectl get pods
kubectl get services
```

To expose the frontend from Minikube directly on your EC2 public IP:
```bash
kubectl port-forward --address 0.0.0.0 service/frontend 3000:80 &
```
Now opening `http://<YOUR-EC2-IP>:3000` loads the application served straight from your Kubernetes pods!

---

## 🎓 Step 6: Top 9 Viva / Interview Questions & Crisp Answers

1. **Q: How can Docker, Jenkins, and Kubernetes all run on the same EC2 instance?**  
   *A:* "We used Docker as the foundational container runtime. Jenkins runs as a native systemd service with access to the Docker daemon. Kubernetes runs via Minikube using the Docker driver (`--driver=docker`), meaning Kubernetes worker nodes run as lightweight containers on top of Docker."

2. **Q: Why was `c7i-flex.large` chosen for this single-server setup?**  
   *A:* "It provides 2 vCPUs and 4GB RAM powered by 4th Gen Intel Xeon Scalable processors. It provides high CPU clock speeds for fast Docker container compilation and npm builds, while offering up to 19% better price-performance than older instance families."

3. **Q: How does Jenkins execute Docker commands without permission errors?**  
   *A:* "By adding the `jenkins` system user to the `docker` group (`sudo usermod -aG docker jenkins`) and restarting the Jenkins service. This gives Jenkins permissions to communicate with `/var/run/docker.sock`."

4. **Q: Why did you use a multi-stage Dockerfile for the frontend?**  
   *A:* "Node.js is only needed to compile the React JSX code into static HTML/JS. In production, we don't need Node.js. Multi-stage building lets us build with Node in Stage 1 and copy only the compiled static files into a lightweight Nginx Alpine container in Stage 2, shrinking image size from ~800MB down to ~25MB."

5. **Q: How does the Frontend talk to the Backend inside Kubernetes?**  
   *A:* "In `frontend/nginx.conf`, we set up a reverse proxy forwarding all `/api/` calls to `http://backend:8000`. Inside Kubernetes, CoreDNS automatically resolves `backend` to the cluster IP of the backend service."

6. **Q: What is the difference between Docker Compose and Kubernetes?**  
   *A:* "Docker Compose is a local tool used to run multi-container applications on a single host. Kubernetes is an enterprise orchestrator designed for production that manages clusters, multi-node scaling, self-healing, rolling updates, and high availability."

7. **Q: Why use Ansible when you already have Kubernetes and Jenkins?**  
   *A:* "Jenkins handles CI (testing and building container images), while Ansible is a configuration management tool that automates the deployment steps. Ansible executes the `kubectl` commands cleanly, verifies pod rollout status, and can easily deploy to multiple environments (Dev, Staging, Prod)."

8. **Q: What is the difference between a Kubernetes Deployment and a Service?**  
   *A:* "A **Deployment** creates and manages pods, ensuring the specified number of replicas are always running. A **Service** provides a stable IP address and DNS name with built-in load balancing so traffic can reach those pods even if pods restart and get new internal IPs."

9. **Q: What happens if MongoDB is down?**  
   *A:* "The FastAPI backend has an automatic in-memory collection fallback in `backend/app/database.py`. If MongoDB is unavailable, it automatically serves the pre-seeded restaurant and menu data in memory so the application never crashes."
