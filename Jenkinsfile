
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        PROJECT_NAME = 'safedeploy'
        BACKEND_IMAGE = 'safedeploy-backend'
        FRONTEND_IMAGE = 'safedeploy-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Semgrep SAST Scan') {
            steps {
                sh '''
                    docker run --rm \
                    -v "$WORKSPACE:/src" \
                    -w /src \
                    semgrep/semgrep \
                    semgrep scan --config auto --error .
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh '''
                        docker run --rm \
                        -v "$WORKSPACE/backend:/app" \
                        -w /app \
                        python:3.12-slim \
                        sh -c "pip install --no-cache-dir -r requirements.txt && pytest -q"
                    '''
                }
            }
        }

        
        stage('Frontend Lint') {
            steps {
                dir('frontend') {
                    sh '''
                        docker run --rm \
                        -v "$WORKSPACE/frontend:/app" \
                        -w /app \
                        node:20-alpine \
                        sh -c "npm ci && npm run lint"
                    '''
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh '''
                        docker run --rm \
                        -v "$WORKSPACE/frontend:/app" \
                        -w /app \
                        node:20-alpine \
                        sh -c "npm run build"
                    '''
                }
            }
        }


        stage('Backend Docker Build') {
            steps {
                sh '''
                    docker build \
                    -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                    -t ${BACKEND_IMAGE}:latest \
                    ./backend
                '''
            }
        }

        stage('Frontend Docker Build') {
            steps {
                sh '''
                    docker build \
                    --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 \
                    -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                    -t ${FRONTEND_IMAGE}:latest \
                    ./frontend
                '''
            }
        }

        stage('Pipeline Summary') {
            steps {
                echo 'Backend tests, frontend lint/build and Docker image builds completed.'
            }
        }
    }

    post {
        success {
            echo 'SafeDeploy CI pipeline completed successfully.'
        }

        failure {
            echo 'SafeDeploy CI pipeline failed. Check the failed stage.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
