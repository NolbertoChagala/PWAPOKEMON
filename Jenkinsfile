pipeline {
    agent any

    environment {
        // Credenciales de Vercel (para deploy en main)
        VERCEL_TOKEN = credentials('vercel-token')
        VERCEL_ORG_ID = credentials('vercel-org-id')
        VERCEL_PROJECT_ID = credentials('vercel-project-id')
        // Token de SonarQube
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Install Dependencies') {
            steps {
                echo "Instalando dependencias..."
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo "Ejecutando tests unitarios..."
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo "Ejecutando análisis de SonarQube..."
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh 'npm run sonar'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo "Esperando resultado del Quality Gate..."
                waitForQualityGate abortPipeline: true
            }
        }

        stage('Deploy') {
            when { branch 'main' } // Solo se ejecuta en main
            steps {
                echo "Desplegando a producción..."
                sh """
                vercel deploy --prod --token=$VERCEL_TOKEN --yes \
                --org=$VERCEL_ORG_ID --project=$VERCEL_PROJECT_ID
                """
            }
        }
    }
}
