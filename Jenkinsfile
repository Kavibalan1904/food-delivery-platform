pipeline {
    agent any

    environment {
        // Change this to your DockerHub username
        DOCKER_HUB_USER = 'kavibalan1904'
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

        // Stage 2: Build Docker container images (validates frontend build automatically)
        stage('2. Build Docker Images') {
            steps {
                echo 'Building Docker container images...'
                sh "docker build -t ${BACKEND_IMAGE} ./backend"
                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

        // Stage 3: Automated testing inside clean container
        stage('3. Run Tests') {
            steps {
                echo 'Running Backend Integration Tests inside Docker container...'
                sh "docker run --rm ${BACKEND_IMAGE} pytest"
            }
        }

        // Stage 4: Authenticate and push images to DockerHub
        stage('4. Push to DockerHub') {
            steps {
                echo 'Pushing container images to DockerHub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        // Stage 5: Deploy to Kubernetes cluster using Ansible
        stage('5. Deploy via Ansible') {
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
}
