pipeline {
    agent {
        docker { 
            image 'node:20'  // Imagen con Node.js y npm
            args '-u root:root' // Evita problemas de permisos
        }
    }

    environment {
        // Token de SonarQube (tipo Secret Text en Jenkins)
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
                echo "Desplegando a producción en Vercel..."
                withCredentials([
                    string(credentialsId: 'srKpP8x1wWqeLoi28fg6Llti', variable: 'VERCEL_TOKEN'),
                    string(credentialsId: '54Icv9M35OGQDrKZK2lwmxoI', variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'prj_lfpjctIZg2JeBRJdbPTbUngfppKZ', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    sh """
                    # Instala Vercel CLI si no está
                    npm install -g vercel
                    # Ejecuta deploy
                    vercel deploy --prod --token=$VERCEL_TOKEN --yes \
                    --org=$VERCEL_ORG_ID --project=$VERCEL_PROJECT_ID
                    """
                }
            }
        }
    }
}
