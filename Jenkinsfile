
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        PROJECT_NAME = 'safedeploy'
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


        stage('Repository Validation') {
            steps {
                sh '''
                    echo "Validating project structure..."

                    test -d backend
                    test -d frontend
                    test -d docker
                    test -d kubernetes
                    test -d terraform
                    test -d sample-app

                    echo "Project structure verified."
                '''
            }
        }

        stage('Backend Validation') {
            steps {
                sh '''
                    echo "Backend files:"
                    ls -la backend
                '''
            }
        }

        stage('Frontend Validation') {
            steps {
                sh '''
                    echo "Frontend files:"
                    ls -la frontend
                '''
            }
        }

        stage('Docker Environment Check') {
            steps {
                sh '''
                    docker --version
                    docker info
                '''
            }
        }

        stage('Pipeline Summary') {
            steps {
                echo 'SafeDeploy CI stages completed successfully.'
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
