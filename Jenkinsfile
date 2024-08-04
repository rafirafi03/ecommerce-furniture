pipeline {
    agent any

    environment {
        REGISTRY = 'hub.docker.com'
        REPO = 'rafi03/molla-ecom'
        IMAGE = 'rafi03/molla-ecom'
        TAG = 'latest'
        KUBECONFIG_CREDENTIALS_ID = 'kube-file'
        KUBECONFIG = credentials('kube-file')
        DOCKER_CREDENTIALS_ID = 'dockerhub_credentials'
        GIT_CREDENTIALS_ID = 'github_credentials'
        GIT_CREDENTIALS = credentials('github_credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/rafirafi03/ecommerce-furniture',
                    credentialsId: env.GIT_CREDENTIALS_ID
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${env.IMAGE}:${env.TAG}")
                }
            }
        }

        stage('Verify Docker Image') {
            steps {
                sh 'docker images'
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh '''
                        echo $DOCKER_PASSWORD | docker login registry.hub.docker.com --username $DOCKER_USERNAME --password-stdin
                        docker tag ${IMAGE}:${TAG} registry.hub.docker.com/${IMAGE}:${TAG}
                        docker push registry.hub.docker.com/${IMAGE}:${TAG}
                        docker logout registry.hub.docker.com
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: env.KUBECONFIG_CREDENTIALS_ID]) {
                    sh 'kubectl apply -f deployment.yaml'
                }
            }
        }

        stage('Apply Kubernetes Service') {
            steps {
                withKubeConfig([credentialsId: env.KUBECONFIG_CREDENTIALS_ID]) {
                    sh 'kubectl apply -f service.yaml'
                }
            }
        }
    }

    post {
        always {
            node {
                cleanWs()
            }
        }
    }
}
