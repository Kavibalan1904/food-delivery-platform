# 🍔 Swiggy-Style Food Delivery Platform – Containerized Microservices Deployment

> **A Beginner-Friendly Fresher DevOps Project**  
> **Tools Used:** GitHub • Jenkins • Docker • Kubernetes • Ansible • AWS EC2 (c7i-flex.large)  
> **Microservices:** Frontend (React + Nginx) & Backend (FastAPI + Python)

---

## 📌 Project Overview

This project is a **Swiggy-style food delivery platform** built as a clean, practical DevOps showcase. It is specifically designed to be **simple, clear, and easy to explain in college viva or entry-level DevOps interviews**.

### The Flow in 1 Simple Picture:
```
[ Developer ]
      │ (git push)
      ▼
[ GitHub Repository ]
      │ (triggers pipeline)
      ▼
[ Jenkins Pipeline ]
      ├─ 1. Git Checkout
      ├─ 2. Run Tests (Pytest & Frontend Build)
      ├─ 3. Build Docker Images (Frontend & Backend)
      ├─ 4. Push to Docker Hub
      └─ 5. Trigger Ansible Deployment
      ▼
[ Ansible Playbook ]
      │ (runs kubectl apply -f k8s/)
      ▼
[ Kubernetes Cluster on EC2 ]
      ├─ Backend Pods (FastAPI) + Service
      └─ Frontend Pods (React) + LoadBalancer Service
```

---

## 📂 Project Structure (Simple & Clean)

```
food-delivery-platform/
├── backend/
│   ├── app/                    # FastAPI routes, models & database fallback
│   ├── tests/                  # Pytest test cases
│   ├── Dockerfile              # Backend container file (Python 3.11 slim)
│   ├── main.py                 # FastAPI API entrypoint & health check
│   └── requirements.txt        # Python libraries
├── frontend/
│   ├── src/                    # React UI components
│   ├── Dockerfile              # Multi-stage Dockerfile (Node -> Nginx)
│   ├── nginx.conf              # Nginx proxy forwarding /api to backend
│   └── package.json            # React dependencies
├── k8s/
│   ├── backend.yaml            # Kubernetes Deployment & Service for Backend
│   ├── frontend.yaml           # Kubernetes Deployment & Service for Frontend
│   └── mongodb.yaml            # Database Service
├── ansible/
│   ├── inventory/hosts.ini     # Ansible target hosts
│   └── playbooks/deploy_k8s.yml# Playbook to apply k8s manifests
├── docker-compose.yml          # Local runner for Frontend, Backend & MongoDB
├── Jenkinsfile                 # 5-Stage Declarative CI/CD pipeline
├── setup_server.sh             # 1-Click EC2 bootstrap script (Docker, K8s, Jenkins)
└── FRESHER_DEPLOYMENT_GUIDE.md # Step-by-step EC2 setup guide & viva Q&A
```

---

## 🚀 Quick Run on AWS EC2 (or Laptop)

### 1. Run Everything with Docker Compose
```bash
docker compose up -d --build
```

### 2. Access the Application:
| Service | URL | Description |
|---|---|---|
| **Frontend Web App** | `http://<EC2-IP>:3000` | Swiggy-style user interface |
| **Backend REST API** | `http://<EC2-IP>:8000` | FastAPI server |
| **API Docs (Swagger)**| `http://<EC2-IP>:8000/docs` | Interactive API documentation |
| **Health Check** | `http://<EC2-IP>:8000/api/health` | Service health status |

---

## 🛠️ The 5 Core Tools Explained Simply

1. **GitHub**: Stores source code and triggers Jenkins pipelines upon code commits.
2. **Docker**: Packages the Frontend and Backend into lightweight container images.
3. **Jenkins**: Automates the CI/CD pipeline (tests code, builds Docker images, pushes to Docker Hub, and triggers Ansible).
4. **Ansible**: Runs automated playbooks to deploy our application to Kubernetes without manual typing.
5. **Kubernetes**: Runs 2 replicas of each microservice for high availability and automatic self-healing.

---

## 🧪 Testing the Project

```bash
# Run backend pytest tests
cd backend
python -m pytest

# Validate frontend production build
cd ../frontend
npm run build
```

---

## 🎓 2-Minute Interview Pitch
> *"I built and deployed a Swiggy-style food delivery microservices platform on an AWS EC2 instance. The frontend is built with React and served via an Nginx multi-stage Docker container, and the backend is an asynchronous FastAPI service with an automated in-memory database fallback.  
> I set up a complete CI/CD pipeline in Jenkins that runs automated unit tests, builds container images, pushes them to Docker Hub, and uses Ansible to deploy the manifests onto a Kubernetes cluster with automatic rolling updates and self-healing replicas."*
