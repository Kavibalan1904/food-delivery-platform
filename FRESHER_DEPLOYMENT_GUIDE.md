# SwiftBite: Containerized Microservices Deployment (Fresher Guide)

This guide is designed specifically for your college / capstone / fresher interview presentation. Every file is kept clean, minimal, and 100% functional without unnecessary enterprise bloat.

---

## 🗺️ The Big Picture: How All the Tools Connect

Here is the exact story of your project from code to cloud:

```
[ Developer ]
      │ (git push)
      ▼
[ GitHub Repository ]
      │ (webhook / trigger)
      ▼
[ Jenkins CI Server ]
      ├─ Stage 1: Checkout Code
      ├─ Stage 2: Run Pytest Tests (Backend validation)
      ├─ Stage 3: Build Docker Images (Backend & Frontend)
      ├─ Stage 4: Push Images to DockerHub
      ▼
[ DockerHub Registry ] (kavibalan1904/swiftbite-backend & frontend)
      │
      ▼
[ Ansible Automation ]
      │ (runs kubectl apply -f k8s/)
      ▼
[ Kubernetes Cluster on AWS ]
      ├─ MongoDB Pod + Service (Database)
      ├─ Backend Pods (x2) + ClusterIP Service (FastAPI)
      └─ Frontend Pods (x2) + LoadBalancer Service (React + Nginx)
      │
      ▼
[ Prometheus & Grafana ]
      ├─ Prometheus scrapes /metrics on Backend
      └─ Grafana shows live graphs of requests & uptime
```

---

## 1. Docker Files Explained Line-by-Line

### A. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# 1. Base image: We use official lightweight Python 3.11 slim
FROM python:3.11-slim

# 2. Set the working folder inside the container to /app
WORKDIR /app

# 3. Environment variables: Prevents Python writing .pyc files & flushes output immediately
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 4. Copy requirements.txt first and install libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the backend application code
COPY . .

# 6. Inform Docker that the app listens on port 8000
EXPOSE 8000

# 7. Start the FastAPI server when the container starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> **Why copy `requirements.txt` first before `COPY . .`?**  
> *Docker Layer Caching!* If you change only 1 line of Python code, Docker doesn't re-download all pip libraries. It re-uses the cached layer and builds in 2 seconds.

---

### B. Frontend Dockerfile (`frontend/Dockerfile`)
This uses a **2-Stage Multi-Stage Build**:
- **Stage 1 (Node.js)**: Compiles React code into static HTML/JS/CSS files (`/app/dist`).
- **Stage 2 (Nginx)**: Throws away the heavy Node.js engine and serves just the static files using lightweight Nginx (~25MB).

```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the build files using Nginx
FROM nginx:alpine
# Copy compiled files from Stage 1 into Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html
# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### C. Frontend Nginx Config (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    server_name localhost;

    # Where the React build files live
    root /usr/share/nginx/html;
    index index.html;

    # Proxy: Forward any /api requests to the backend server
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA Fallback: If user refreshes on /order/123, send index.html so React Router handles it
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### D. Docker Compose (`docker-compose.yml`)
Runs all 3 microservices on your laptop with a single command: `docker-compose up --build`.

```yaml
version: '3.8'

services:
  # Database Service
  mongodb:
    image: mongo:latest
    container_name: swiftbite-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  # Backend Microservice (FastAPI)
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

  # Frontend Microservice (React + Nginx)
  frontend:
    build: ./frontend
    container_name: swiftbite-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

---

## 2. Jenkins CI/CD Pipeline Explained (`Jenkinsfile`)

A simple, 5-stage declarative Jenkins pipeline:

```groovy
pipeline {
    agent any

    environment {
        // Change to your DockerHub username
        DOCKER_HUB_USER = 'kavibalan1904'
        BACKEND_IMAGE   = "${DOCKER_HUB_USER}/swiftbite-backend:latest"
        FRONTEND_IMAGE  = "${DOCKER_HUB_USER}/swiftbite-frontend:latest"
    }

    stages {
        // Stage 1: Pull the latest code from GitHub
        stage('1. Checkout Code') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        // Stage 2: Run automated Pytest unit tests before building
        stage('2. Run Tests') {
            steps {
                echo 'Running Backend Tests...'
                sh 'cd backend && pip install -r requirements.txt && pytest'
            }
        }

        // Stage 3: Build the container images
        stage('3. Build Docker Images') {
            steps {
                echo 'Building Docker images for Backend and Frontend...'
                sh "docker build -t ${BACKEND_IMAGE} ./backend"
                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

        // Stage 4: Log into DockerHub securely and push the images
        stage('4. Push to DockerHub') {
            steps {
                echo 'Pushing Docker images to DockerHub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        // Stage 5: Trigger Ansible to deploy onto Kubernetes
        stage('5. Deploy via Ansible') {
            steps {
                echo 'Deploying to Kubernetes using Ansible...'
                sh 'ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy_k8s.yml'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! Application is running.'
        }
        failure {
            echo 'Deployment failed! Check the console logs.'
        }
    }
}
```

---

## 3. Ansible Automation Explained

### A. Inventory (`ansible/inventory/hosts.ini`)
```ini
[all]
localhost ansible_connection=local
```
Tells Ansible: "Run the commands directly on the local machine where `kubectl` is installed."

### B. Deployment Playbook (`ansible/playbooks/deploy_k8s.yml`)
```yaml
---
- name: Deploy SwiftBite Application to Kubernetes
  hosts: all
  tasks:
    # 1. Apply all Kubernetes manifests in the k8s folder
    - name: Apply all Kubernetes manifests
      command: kubectl apply -f k8s/

    # 2. Wait until the backend pod is completely running
    - name: Wait for backend to be ready
      command: kubectl rollout status deployment/swiftbite-backend --timeout=60s

    # 3. Wait until the frontend pod is completely running
    - name: Wait for frontend to be ready
      command: kubectl rollout status deployment/swiftbite-frontend --timeout=60s

    # 4. Get the list of all running pods
    - name: Show running pods
      command: kubectl get pods
      register: pods_output

    # 5. Print the pod status in the console log
    - name: Print pod status
      debug:
        var: pods_output.stdout_lines
```

---

## 4. Kubernetes Explained (`k8s/`)

You have exactly 3 clean YAML files in `k8s/`:

### A. Database: `k8s/mongodb.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swiftbite-mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:latest
          ports:
            - containerPort: 27017
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
spec:
  ports:
    - port: 27017
      targetPort: 27017
  selector:
    app: mongodb
```

### B. Backend: `k8s/backend.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swiftbite-backend
spec:
  replicas: 2 # Runs 2 instances for High Availability
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
          image: kavibalan1904/swiftbite-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: MONGODB_URL
              value: "mongodb://mongodb:27017" # Connects to mongodb service!
            - name: DATABASE_NAME
              value: "swiftbite"
            - name: JWT_SECRET
              value: "swiftbite-secret-key-12345"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  ports:
    - port: 8000
      targetPort: 8000
  selector:
    app: backend
```

### C. Frontend: `k8s/frontend.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swiftbite-frontend
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
          image: kavibalan1904/swiftbite-frontend:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer # On AWS, this automatically gives you a public URL!
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080  # Accessible on port 30080 if using NodePort
  selector:
    app: frontend
```

---

## 5. Prometheus & Grafana Monitoring

### A. How Backend Exposes Metrics (`backend/main.py`)
In `backend/main.py`, we added this simple endpoint:
```python
@app.get("/metrics", response_class=PlainTextResponse)
async def get_metrics():
    uptime = int(time.time() - START_TIME)
    return (
        f"app_uptime_seconds {uptime}\n"
        f"http_requests_total {REQUEST_COUNT}\n"
        f"app_status 1\n"
    )
```
When you open `http://localhost:8000/metrics`, it returns:
```
app_uptime_seconds 360
http_requests_total 42
app_status 1
```

### B. Prometheus Scrape Config (`monitoring/prometheus.yml`)
```yaml
global:
  scrape_interval: 15s # Every 15 seconds, ask backend for metrics

scrape_configs:
  - job_name: 'swiftbite-backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:8000']
```
Prometheus pulls this data every 15 seconds. In Grafana, you add Prometheus as a Data Source and create graphs showing total requests and uptime!

---

## 6. Top 5 Viva / Interview Questions & Easy Answers

1. **Q: What is a Docker multi-stage build and why did you use it in the frontend?**
   - **Answer**: "In the frontend, we use Node.js to compile our React code into HTML and JS files. But in production, we don't need Node.js runtime. Multi-stage build allows us to build with Node in stage 1, and copy only the compiled static files into a lightweight Nginx container in stage 2. This reduces the image size from ~800MB to just ~25MB."

2. **Q: What is the difference between a Kubernetes Deployment and a Service?**
   - **Answer**: "A **Deployment** manages the Pods, handles self-healing, and runs the desired number of replicas. A **Service** provides a stable IP and DNS name with a built-in load balancer so other pods or external users can access those pods even if individual pods restart or get new IPs."

3. **Q: How does the Frontend communicate with the Backend in Kubernetes?**
   - **Answer**: "In Kubernetes, we created a Service named `backend` on port 8000. Kubernetes DNS automatically resolves `http://backend:8000`. Our Nginx frontend proxy forwards `/api/` calls directly to `http://backend:8000`."

4. **Q: Why use Ansible when you already have Jenkins and Kubernetes?**
   - **Answer**: "Jenkins is responsible for **Continuous Integration** (building images and running tests), while Ansible is used for **Configuration Management & Deployment Orchestration**. Ansible runs the deployment steps cleanly, verifies pod health, and can be reused to deploy to different environments (Dev, Staging, Prod)."

5. **Q: How does your monitoring work?**
   - **Answer**: "Our FastAPI backend exposes an internal `/metrics` endpoint. Prometheus scrapes this endpoint every 15 seconds using pull mechanism, and Grafana visualizes the traffic, request counts, and uptime."
