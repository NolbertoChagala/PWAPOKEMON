const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://host.docker.internal:9000', 
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': 'pokedex-pwa',
      'sonar.projectName': 'Pokedex PWA',
      'sonar.sources': 'src',
      'sonar.language': 'js',
      'sonar.sourceEncoding': 'UTF-8'
    }
  },
  () => {
    console.log('✅ Análisis de SonarQube completado');
  }
);
