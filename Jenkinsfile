pipeline {
    agent any

    environment {
        // Change this to your DockerHub username
        DOCKER_HUB_USER = 'kavibalan1904'
        BACKEND_IMAGE   = "${DOCKER_HUB_USER}/swiftbite-backend:latest"
        FRONTEND_IMAGE  = "${DOCKER_HUB_USER}/swiftbite-frontend:latest"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('2. Run Tests') {
            steps {
                echo 'Running Backend Tests...'
                sh 'cd backend && pip install -r requirements.txt && pytest'
            }
        }

        stage('3. Build Docker Images') {
            steps {
                echo 'Building Docker images for Backend and Frontend...'
                sh "docker build -t ${BACKEND_IMAGE} ./backend"
                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

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
