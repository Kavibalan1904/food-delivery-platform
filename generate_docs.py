import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "docs_screenshots")

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_callout(doc, text, title="NOTE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=100, bottom=100, left=160, right=160)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="0A2540"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.12
    run_title = p.add_run(f"[{title}]\n")
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(10, 37, 64)
    run_title.font.name = "Segoe UI"
    run_title.font.size = Pt(10)
    
    run_text = p.add_run(text)
    run_text.font.name = "Consolas"
    run_text.font.size = Pt(8.5)
    run_text.font.color.rgb = RGBColor(33, 37, 41)

def add_code_block(doc, code_str, title=None):
    if title:
        tp = doc.add_paragraph()
        tp.paragraph_format.space_before = Pt(8)
        tp.paragraph_format.space_after = Pt(2)
        tr = tp.add_run(f"File / Command: {title}")
        tr.bold = True
        tr.font.name = "Segoe UI Semibold"
        tr.font.size = Pt(9.5)
        tr.font.color.rgb = RGBColor(70, 80, 95)
        
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8F9FA")
    set_cell_margins(cell, top=80, bottom=80, left=140, right=140)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="E1E4E8"/>
            <w:left w:val="single" w:sz="20" w:space="0" w:color="0052CC"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="E1E4E8"/>
            <w:right w:val="single" w:sz="6" w:space="0" w:color="E1E4E8"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.12
    run = p.add_run(code_str)
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(36, 41, 47)

def add_image_with_caption(doc, image_path, caption_title, caption_text, width=Inches(5.0)):
    if not os.path.exists(image_path):
        print(f"Warning: Image {image_path} does not exist!")
        return
        
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(3)
    run_img = p_img.add_run()
    run_img.add_picture(image_path, width=width)
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(0)
    p_cap.paragraph_format.space_after = Pt(10)
    
    r_title = p_cap.add_run(caption_title + " — ")
    r_title.bold = True
    r_title.font.name = "Segoe UI"
    r_title.font.size = Pt(9.0)
    r_title.font.color.rgb = RGBColor(0, 82, 204)
    
    r_text = p_cap.add_run(caption_text)
    r_text.font.name = "Segoe UI"
    r_text.font.size = Pt(8.5)
    r_text.font.italic = True
    r_text.font.color.rgb = RGBColor(100, 105, 115)

def build_complete_documentation():
    doc = Document()
    
    # Configure A4 Cover Section (True full-bleed edge-to-edge)
    cover_sec = doc.sections[0]
    cover_sec.page_width = Inches(8.27)
    cover_sec.page_height = Inches(11.69)
    cover_sec.top_margin = Inches(0)
    cover_sec.bottom_margin = Inches(0)
    cover_sec.left_margin = Inches(0)
    cover_sec.right_margin = Inches(0)
    cover_sec.header_distance = Inches(0)
    cover_sec.footer_distance = Inches(0)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Segoe UI'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(36, 41, 47)
    normal_style.paragraph_format.space_before = Pt(0)
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.line_spacing = 1.15

    h1_style = doc.styles['Heading 1']
    h1_style.font.name = 'Segoe UI Semibold'
    h1_style.font.size = Pt(16)
    h1_style.font.color.rgb = RGBColor(10, 37, 64)
    h1_style.paragraph_format.space_before = Pt(16)
    h1_style.paragraph_format.space_after = Pt(6)
    h1_style.paragraph_format.keep_with_next = True

    h2_style = doc.styles['Heading 2']
    h2_style.font.name = 'Segoe UI Semibold'
    h2_style.font.size = Pt(12.5)
    h2_style.font.color.rgb = RGBColor(0, 82, 204)
    h2_style.paragraph_format.space_before = Pt(12)
    h2_style.paragraph_format.space_after = Pt(4)
    h2_style.paragraph_format.keep_with_next = True

    # ==================== COVER PAGE (A4 FULL-BLEED EXECUTIVE POSTER) ====================
    p_cover = doc.add_paragraph()
    p_cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cover.paragraph_format.space_before = Pt(0)
    p_cover.paragraph_format.space_after = Pt(0)
    p_cover.paragraph_format.line_spacing = Pt(1)
    run_cover = p_cover.add_run()
    run_cover.font.size = Pt(1)
    cover_img_path = os.path.join(SCREENSHOTS_DIR, "bite_navy_cover_a4.jpg")
    if os.path.exists(cover_img_path):
        run_cover.add_picture(cover_img_path, width=Inches(8.27), height=Inches(11.65))

    # ==================== BODY SECTION (STARTS ON PAGE 2) ====================
    body_sec = doc.add_section(WD_SECTION.NEW_PAGE)
    body_sec.page_width = Inches(8.27)
    body_sec.page_height = Inches(11.69)
    body_sec.top_margin = Inches(0.85)
    body_sec.bottom_margin = Inches(0.85)
    body_sec.left_margin = Inches(0.85)
    body_sec.right_margin = Inches(0.85)

    # Attach section break directly to p_cover so there is no extra blank paragraph
    p1 = doc.paragraphs[-1]
    if len(doc.paragraphs) > 1 and len(p1.text.strip()) == 0:
        sectPr = p1._p.pPr.sectPr
        p_cover._p.get_or_add_pPr().append(sectPr)
        p1._element.getparent().remove(p1._element)

    # ==================== SECTION 1 ====================
    h1 = doc.add_heading("1. Executive Summary & Core Objectives", level=1)
    h1.style.font.color.rgb = RGBColor(26, 54, 93)
    
    p = doc.add_paragraph()
    p.add_run(
        "Bite is a cloud-native, microservices-based food delivery platform modeled after modern enterprise consumer "
        "applications like Swiggy and Zomato. Beyond delivering a responsive, multi-page frontend and a high-performance RESTful "
        "API, the platform was specifically architected as a premier DevOps showcase demonstrating end-to-end automation, "
        "containerization, infrastructure-as-code, and resilient Kubernetes orchestration."
    )
    
    bullets = [
        ("Cloud-Native Decoupling: ", "Independent frontend and backend microservices communicating over RESTful contracts with clear separation of concerns."),
        ("Automated CI/CD Delivery: ", "Continuous integration and continuous deployment managed via a streamlined Jenkins declarative pipeline."),
        ("Zero-Configuration Local & Cloud Portability: ", "Runs seamlessly locally via Docker Compose and on AWS EC2 via Minikube and Ansible."),
        ("High Availability & Fault Tolerance: ", "Kubernetes deployments configured with multiple replicas, readiness/liveness health checks, and self-healing pods."),
        ("Production-Grade Web Serving: ", "Multi-stage Docker builds utilizing Nginx Alpine (~25MB) as an SPA static web server and reverse proxy.")
    ]
    for bold_prefix, text in bullets:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(2)
        r_bold = bp.add_run(bold_prefix)
        r_bold.bold = True
        bp.add_run(text)

    # ==================== SECTION 2 ====================
    h1 = doc.add_heading("2. End-to-End System Architecture & Microservices Flow", level=1)
    h1.style.font.color.rgb = RGBColor(26, 54, 93)
    
    add_callout(
        doc,
        "System Lifecycle Workflow:\n"
        "[ Developer: git push ] --> [ GitHub Repository: Webhook Trigger ]\n"
        "      |--> [ Jenkins Pipeline: 1. Checkout -> 2. Build Images -> 3. Push to DockerHub -> 4. Ansible Deploy ]\n"
        "            |--> [ Docker Hub Registry (kavidevops03): Versioned Images ]\n"
        "            |--> [ Ansible Playbook: kubectl apply -f k8s/ ]\n"
        "                  |--> [ Kubernetes Cluster on AWS EC2 (63.178.71.216) ]\n"
        "                        |-- Frontend Pods (React/Nginx) [2 Replicas] via NodePort :30080 / Port-forward :3000\n"
        "                        |-- Backend Pods (FastAPI) [2 Replicas] via ClusterIP :8000\n"
        "                        |-- MongoDB Pod via ClusterIP :27017",
        title="END-TO-END DEVOPS ARCHITECTURE FLOW"
    )

    tbl = doc.add_table(rows=1, cols=3)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = tbl.rows[0].cells
    hdr[0].text = "Tier"
    hdr[1].text = "Technology"
    hdr[2].text = "Key Responsibilities"
    for cell in hdr:
        set_cell_background(cell, "1A365D")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        for r in p.runs:
            r.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    tiers = [
        ("User Interface", "React 18, Vite, React Router 6, Vanilla CSS", "Swiggy-style cuisine carousel, restaurant menus, cart drawer, live order tracking, partner portal"),
        ("Web Server / Proxy", "Nginx Alpine (Multi-stage container)", "Serves static production bundle, handles SPA routing (try_files), reverse proxies /api requests to backend"),
        ("Application Tier", "FastAPI (Python 3.11), Pydantic v2, Motor", "RESTful API endpoints, JWT authentication (bcrypt), order state machine, database connectors"),
        ("Database Tier", "MongoDB 6.0 + In-Memory Fallback", "Document persistence for users, orders, and restaurants; automatic fallback if MongoDB is offline"),
        ("Continuous Delivery", "Jenkins LTS, GitHub, Docker Hub (kavidevops03)", "Automated testing, container image building, image registry distribution, pipeline orchestration"),
        ("Configuration & IaC", "Ansible (playbooks & inventory)", "Automated rollout of Kubernetes manifests without manual kubectl intervention"),
        ("Container Orchestration", "Kubernetes (Minikube), Kubectl", "Self-healing replicas, cluster networking, service discovery, NodePort ingress")
    ]
    for tier, tech, resp in tiers:
        row = tbl.add_row().cells
        row[0].text = tier
        row[1].text = tech
        row[2].text = resp
        for cell in row:
            set_cell_margins(cell, top=70, bottom=70, left=110, right=110)
            cell.paragraphs[0].runs[0].font.size = Pt(9.5)

    doc.add_page_break()

    # ==================== SECTION 3: AWS CONSOLE SCREENSHOTS ====================
    h1 = doc.add_heading("3. Cloud Infrastructure & AWS EC2 Provisioning", level=1)
    h1.style.font.color.rgb = RGBColor(10, 37, 64)
    
    p = doc.add_paragraph()
    p.add_run(
        "The following screenshots from the AWS Management Console illustrate the exact configuration used to launch "
        "the cloud virtual machine hosting our Docker, Jenkins, Minikube, and Ansible services."
    )
    
    # Figure 1
    doc.add_heading("3.1 Figure 1: EC2 Instance Name & Operating System AMI Selection", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "The instance is named food-delivery-platform and runs Canonical Ubuntu Server 24.04 LTS (HVM) on a 64-bit (x86_64) "
        "architecture (AMI ID: ami-042dc8681de073ac4). The virtual server type selected is c7i-flex.large, equipped with "
        "2 vCPUs and 8 GiB of RAM to comfortably support concurrent Jenkins builds and the Minikube Kubernetes cluster."
    )
    add_image_with_caption(
        doc,
        os.path.join(SCREENSHOTS_DIR, "01_ec2_instance_ami_setup.png"),
        "Figure 1",
        "AWS EC2 Launch Wizard — Instance Name (food-delivery-platform), Ubuntu 24.04 LTS AMI, and c7i-flex.large type selection.",
        width=Inches(5.2)
    )
    
    # Figure 2
    doc.add_heading("3.2 Figure 2: Storage Configuration & Instance Launch Summary", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Storage is provisioned with 1x 40 GiB gp3 General Purpose SSD volume operating at baseline 3000 IOPS. "
        "This expanded storage ensures sufficient disk space for container image caching (Node, Nginx, Python, Mongo), "
        "Jenkins workspace artifacts, and the 2GB swap partition created by our bootstrap script."
    )
    add_image_with_caption(
        doc,
        os.path.join(SCREENSHOTS_DIR, "02_ec2_storage_and_summary.png"),
        "Figure 2",
        "AWS EC2 Storage Configuration — 40 GiB gp3 Root Volume and Summary Panel confirming 1 instance on Ubuntu 24.04.",
        width=Inches(5.2)
    )
    
    # Figure 3
    doc.add_heading("3.3 Figure 3: Security Group Firewall Inbound Rules", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "The security group launch-wizard-1 (sg-0ee454504fa4184c2) is configured with 4 critical inbound permission rules:\n"
        "• Port 22 (SSH): Allows secure terminal administration from any workstation.\n"
        "• Port 8000 (Custom TCP): Exposes the FastAPI backend REST API and interactive Swagger docs (/docs).\n"
        "• Port 8080 (Custom TCP): Exposes the Jenkins web dashboard for CI/CD pipeline monitoring.\n"
        "• Port 3000 (Custom TCP): Exposes the React frontend web application."
    )
    add_image_with_caption(
        doc,
        os.path.join(SCREENSHOTS_DIR, "03_ec2_security_group_rules.png"),
        "Figure 3",
        "AWS Security Group (launch-wizard-1) — Inbound firewall rules for Ports 22 (SSH), 8000 (FastAPI), 8080 (Jenkins), and 3000 (Frontend).",
        width=Inches(5.2)
    )

    doc.add_page_break()

    # ==================== SECTION 4: TERMINAL EXECUTION SCREENSHOTS ====================
    h1 = doc.add_heading("4. Server Setup & Live Terminal Execution", level=1)
    h1.style.font.color.rgb = RGBColor(10, 37, 64)
    
    p = doc.add_paragraph()
    p.add_run(
        "The following screenshots from the live Linux terminal capture the exact commands executed on the EC2 server "
        "during initial access, server bootstrapping, and Jenkins authentication setup."
    )
    
    # Figure 4
    doc.add_heading("4.1 Figure 4: SSH Key Permissions & Server Connection", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Before establishing an SSH session to the EC2 public IP (63.178.71.216), strict read-only permissions were applied "
        "to the private key using sudo chmod 400 food.pem to prevent SSH key rejection. The terminal shows the initial connection "
        "banner confirming Ubuntu 24.04.4 LTS (Linux 6.17.0-1017-aws) and 37.70 GB disk utilization."
    )
    add_image_with_caption(
        doc,
        os.path.join(SCREENSHOTS_DIR, "04_ec2_ssh_connection.png"),
        "Figure 4",
        "Live Terminal — SSH Key permission setup (chmod 400), authentication into 63.178.71.216, and system resource banner.",
        width=Inches(3.8)
    )

    # Figure 5
    doc.add_heading("4.2 Figure 5: Cloning Repository & Server Bootstrap Execution", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "The project source code is cloned directly onto the cloud server using git clone. Next, execute permissions are granted "
        "to the automation script using sudo chmod +x setup_server.sh, followed by executing ./setup_server.sh to provision "
        "Docker, Minikube, Jenkins, and Ansible in an unattended manner."
    )
    add_image_with_caption(
        doc,
        os.path.join(SCREENSHOTS_DIR, "05_ec2_git_clone_and_setup.png"),
        "Figure 5",
        "Live Terminal — Git clone from GitHub, granting execution permissions (chmod +x), and running setup_server.sh.",
        width=Inches(5.2)
    )

    # Figure 6
    doc.add_heading("4.3 Figure 6: Jenkins Admin Password & Docker Daemon Socket Access", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Upon initial Jenkins installation, the generated administrator token is retrieved using sudo cat /var/lib/jenkins/secrets/initialAdminPassword. "
        "To allow Jenkins jobs to execute docker build and docker push commands without permission barriers, the jenkins system user "
        "is added to the docker group, read/write permissions are granted to /var/run/docker.sock, and the Jenkins daemon is restarted."
    )
    add_image_with_caption(
        doc,
        os.path.join(SCREENSHOTS_DIR, "06_jenkins_password_and_docker_sock.png"),
        "Figure 6",
        "Live Terminal — Extracting Jenkins initialAdminPassword and granting Jenkins access to the Docker daemon socket.",
        width=Inches(5.2)
    )

    doc.add_page_break()

    # ==================== SECTION 5: DEVOPS SOURCE CODE & CONFIGURATIONS ====================
    h1 = doc.add_heading("5. DevOps Source Code & Deployment Automation", level=1)
    h1.style.font.color.rgb = RGBColor(10, 37, 64)
    
    # 5.1 setup_server.sh
    doc.add_heading("5.1 Server Automation & Bootstrap Script (setup_server.sh)", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "A single-command bash script that transforms a fresh Ubuntu 24.04 EC2 instance into a complete DevOps server. "
        "It configures a 2GB swap file to prevent Out-Of-Memory (OOM) compiler crashes, installs Docker, Docker Compose, "
        "OpenJDK 17, Jenkins LTS, Kubectl, Ansible, initializes Minikube, and grants Jenkins deployment privileges."
    )
    setup_code = """#!/usr/bin/env bash
# ==============================================================================
# Bite: Complete EC2 Single-Server Setup Script
# Installs: Docker, Docker Compose, Jenkins, Minikube (Kubernetes), Kubectl, Ansible
# Target: Ubuntu 22.04 / 24.04 LTS on AWS EC2 (c7i-flex.large recommended)
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
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \\
      /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \\
      https://pkg.jenkins.io/debian-stable binary/ | sudo tee \\
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

echo "=================================================================="
echo "  SUCCESS! All Tools Installed & Running on This Server!         "
echo "=================================================================="
"""
    add_code_block(doc, setup_code, title="setup_server.sh")

    # 5.2 Jenkinsfile
    doc.add_heading("5.2 Streamlined 4-Stage Declarative CI/CD Pipeline (Jenkinsfile)", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "A 4-stage declarative Jenkins pipeline coordinating code checkout, container image compilation, "
        "credential-bound Docker Hub distribution for user kavidevops03, and automated Ansible deployment."
    )
    jenkins_code = """pipeline {
    agent any

    environment {
        // DockerHub username
        DOCKER_HUB_USER = 'kavidevops03'
        BACKEND_IMAGE   = "${DOCKER_HUB_USER}/swiftbite-backend:latest"
        FRONTEND_IMAGE  = "${DOCKER_HUB_USER}/swiftbite-frontend:latest"
    }

    stages {
        // Stage 1: Pull the latest code from GitHub
        stage('1. Checkout Code') {
            steps {
                echo 'Pulling latest code from GitHub repository...'
                checkout scm
            }
        }

        // Stage 2: Build Docker container images (automatically validates builds)
        stage('2. Build Docker Images') {
            steps {
                echo 'Building Docker container images...'
                sh "docker build -t ${BACKEND_IMAGE} ./backend"
                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

        // Stage 3: Authenticate and push images to DockerHub
        stage('3. Push to DockerHub') {
            steps {
                echo 'Pushing container images to DockerHub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', 
                                                  usernameVariable: 'DOCKER_USER', 
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        // Stage 4: Deploy to Kubernetes cluster using Ansible
        stage('4. Deploy via Ansible') {
            steps {
                echo 'Triggering Ansible deployment playbook onto Kubernetes...'
                sh 'ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy_k8s.yml'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Application is live.'
        }
        failure {
            echo 'Pipeline failed! Review the console output for debugging.'
        }
    }
}"""
    add_code_block(doc, jenkins_code, title="Jenkinsfile")

    # 5.3 Ansible
    doc.add_heading("5.3 Infrastructure as Code Deployment Playbook (ansible/playbooks/deploy_k8s.yml)", level=2)
    ansible_code = """---
- name: Deploy Swiggy-Style Application to Kubernetes
  hosts: all
  tasks:
    - name: Apply all Kubernetes manifests
      command: kubectl apply -f "{{ playbook_dir }}/../../k8s/"

    - name: Wait for backend deployment to finish
      command: kubectl rollout status deployment/backend --timeout=60s

    - name: Wait for frontend deployment to finish
      command: kubectl rollout status deployment/frontend --timeout=60s

    - name: Show running pods
      command: kubectl get pods
      register: pods_output

    - name: Print pod status
      debug:
        var: pods_output.stdout_lines"""
    add_code_block(doc, ansible_code, title="ansible/playbooks/deploy_k8s.yml")

    # 5.4 Kubernetes Manifests
    doc.add_heading("5.4 Production Kubernetes Manifests (k8s/)", level=2)
    k8s_be = """# ==========================================
# 1. Backend Deployment (FastAPI Microservice)
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: kavidevops03/swiftbite-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: MONGODB_URL
              value: "mongodb://mongodb:27017"
            - name: DATABASE_NAME
              value: "swiftbite"
            - name: JWT_SECRET
              value: "swiftbite-secret-key-12345"
---
# 2. Backend Service (ClusterIP Internal)
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  ports:
    - port: 8000
      targetPort: 8000
  selector:
    app: backend"""
    add_code_block(doc, k8s_be, title="k8s/backend.yaml")

    k8s_fe = """# ==========================================
# 1. Frontend Deployment (React + Nginx)
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: kavidevops03/swiftbite-frontend:latest
          ports:
            - containerPort: 80
---
# 2. Frontend Service (LoadBalancer / Public Ingress)
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
  selector:
    app: frontend"""
    add_code_block(doc, k8s_fe, title="k8s/frontend.yaml")

    # 5.5 Exposing Kubernetes Frontend to AWS EC2 Public IP
    doc.add_heading("5.5 Exposing Kubernetes Frontend to AWS EC2 Public IP (Port Forwarding)", level=2)
    p_pf = doc.add_paragraph()
    p_pf.add_run(
        "To expose the frontend from Minikube directly on your EC2 public IP:"
    )
    pf_code = "kubectl port-forward --address 0.0.0.0 service/frontend 3000:80 &"
    add_code_block(doc, pf_code, title="kubectl port-forward")
    p_pf2 = doc.add_paragraph()
    p_pf2.add_run(
        "Now opening http://<YOUR-EC2-IP>:3000 loads the application served straight from your Kubernetes pods!"
    )

    # 5.6 Docker Compose
    doc.add_heading("5.6 Local Multi-Container Development (docker-compose.yml)", level=2)
    dc_code = """version: '3.8'

services:
  # 1. Database Service (MongoDB)
  mongodb:
    image: mongo:7.0
    container_name: swiftbite-mongodb
    ports:
      - "27017:27017"
    environment:
      - GLIBC_TUNABLES=glibc.pthread.rseq=1
    volumes:
      - mongo-data:/data/db

  # 2. Backend Microservice (FastAPI + Python)
  backend:
    build: ./backend
    container_name: swiftbite-backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
      - DATABASE_NAME=swiftbite
      - JWT_SECRET=swiftbite-secret-key-12345
    depends_on:
      - mongodb

  # 3. Frontend Microservice (React + Nginx)
  frontend:
    build: ./frontend
    container_name: swiftbite-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo-data:"""
    add_code_block(doc, dc_code, title="docker-compose.yml")

    # 5.7 Frontend Dockerfile & Nginx
    doc.add_heading("5.7 Multi-Stage Frontend Containerization & Nginx Reverse Proxy", level=2)
    fe_dockerfile = """# ===== Stage 1: Build React Production Assets =====
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== Stage 2: Serve with Lightweight Nginx Alpine (~25MB) =====
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]"""
    add_code_block(doc, fe_dockerfile, title="frontend/Dockerfile")

    nginx_conf = """server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Forward any /api requests to the backend server
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # For React Router to work properly without 404 on refresh
    location / {
        try_files $uri $uri/ /index.html;
    }
}"""
    add_code_block(doc, nginx_conf, title="frontend/nginx.conf")

    output_path = os.path.abspath("Bite_Food_Delivery_Platform_Documentation.docx")
    old_output_path = os.path.abspath("SwiftBite_Food_Delivery_Platform_Documentation.docx")
    try:
        doc.save(output_path)
        print(f"Documentation successfully updated at: {output_path}")
        if os.path.exists(old_output_path) and old_output_path != output_path:
            try:
                os.remove(old_output_path)
            except Exception:
                pass
    except PermissionError:
        print(f"Error: '{output_path}' is currently open in Microsoft Word. Please close Word and rerun the script so only this single document is maintained.")

if __name__ == "__main__":
    build_complete_documentation()
