pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                echo 'Instalando dependencias...'
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Ejecutando tests unitarios...'
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Ejecutando análisis de SonarQube...'
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=pokepwa \
                        -Dsonar.projectName="Pokedex PWA" \
                        -Dsonar.sources=src \
                        -Dsonar.language=js \
                        -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Esperando resultado del Quality Gate...'
                waitForQualityGate abortPipeline: true
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                echo 'Desplegando a producción en Vercel...'
                withCredentials([
                    string(credentialsId: 'srKpP8x1wWqeLoi28fg6Llti', variable: 'VERCEL_TOKEN'),
                    string(credentialsId: '54Icv9M35OGQDrKZK2lwmxoI', variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'prj_lfpjctIZg2JeBRJdbPTbUngfppKZ', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    sh '''
                        npm install -g vercel
                        vercel deploy --prod --token=$VERCEL_TOKEN --yes --org=$VERCEL_ORG_ID --project=$VERCEL_PROJECT_ID
                    '''
                }
            }
        }
    }
}
