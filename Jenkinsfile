
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'SafeDeploy source code checked out.'
            }
        }

        stage('Verify Repository') {
            steps {
                sh '''
                    echo "Checking SafeDeploy structure..."
                    test -d backend
                    test -d frontend
                    test -d docker
                    test -d kubernetes
                    test -d terraform
                    test -d sample-app
                    echo "Repository structure verified."
                '''
            }
        }
    }

    post {
        success {
            echo 'SafeDeploy pipeline completed successfully.'
        }
        failure {
            echo 'SafeDeploy pipeline failed.'
        }
    }
}
