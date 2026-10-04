#!/usr/bin/env bash
# ==============================================================================
# SwiftBite: Complete EC2 Single-Server Setup Script
# Installs: Docker, Docker Compose, Jenkins, Minikube (Kubernetes), Kubectl, Ansible
# Target: Ubuntu 22.04 LTS on AWS EC2 (c7i-flex.large recommended)
# ==============================================================================

set -e

echo "=================================================================="
echo "  Starting All-in-One DevOps Server Setup (Docker, K8s, Jenkins)  "
echo "=================================================================="

# 1. Update Packages & Setup 2GB Swap Memory
echo ">>> [1/6] Setting up Swap Memory (2GB) & updating packages..."
sudo apt update && sudo apt upgrade -y
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap memory created successfully."
fi

# 2. Install Docker & Docker Compose
echo ">>> [2/6] Installing Docker & Docker Compose..."
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER

# 3. Install Java 17 & Jenkins
echo ">>> [3/6] Installing Java 17 & Jenkins..."
sudo apt install -y openjdk-17-jre
if ! command -v jenkins &> /dev/null; then
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
      /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
      https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
      /etc/apt/sources.list.d/jenkins.list > /dev/null
    sudo apt update
    sudo apt install -y jenkins
fi

# Add jenkins user to docker group (crucial so Jenkins can run 'docker build')
sudo usermod -aG docker jenkins
sudo systemctl enable jenkins
sudo systemctl restart jenkins

# 4. Install Kubectl & Ansible
echo ">>> [4/6] Installing Kubectl & Ansible..."
sudo apt install -y ansible
if ! command -v kubectl &> /dev/null; then
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm -f kubectl
fi

# 5. Install Minikube (Single-Node Kubernetes Cluster)
echo ">>> [5/6] Installing Minikube..."
if ! command -v minikube &> /dev/null; then
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
    rm -f minikube-linux-amd64
fi

# Start Minikube with Docker driver
echo ">>> Starting Kubernetes cluster with Minikube (2GB RAM, 2 CPUs)..."
minikube start --driver=docker --memory=2048 --cpus=2

# 6. Configure Permissions for Jenkins to deploy to Kubernetes
echo ">>> [6/6] Configuring Jenkins access to Kubernetes..."
sudo mkdir -p /var/lib/jenkins/.kube /var/lib/jenkins/.minikube
sudo cp -r ~/.kube/config /var/lib/jenkins/.kube/config
sudo cp -r ~/.minikube/client.crt ~/.minikube/client.key ~/.minikube/ca.crt /var/lib/jenkins/.minikube/ 2>/dev/null || true
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube /var/lib/jenkins/.minikube 2>/dev/null || true
sudo chmod -R 755 ~/.minikube 2>/dev/null || true

echo ""
echo "=================================================================="
echo "  SUCCESS! All Tools Installed & Running on This Server!         "
echo "=================================================================="
echo " Docker:     Installed & running"
echo " Kubernetes: Minikube cluster is UP"
echo " Jenkins:    Running on http://<YOUR-EC2-PUBLIC-IP>:8080"
echo " Ansible:    Installed & ready"
echo ""
echo " Initial Jenkins Admin Password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo "NOTE: Run 'newgrp docker' or log out and back in to use docker without sudo."
echo "=================================================================="
