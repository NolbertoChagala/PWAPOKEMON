const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://sonarqube:9000',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': 'pokedex-pwa',       // igual al Project Key de SonarQube
      'sonar.projectName': 'Pokedex PWA',      // Nombre del proyecto
      'sonar.sources': 'src',                   // Carpeta con tu código React
      'sonar.language': 'js',
      'sonar.sourceEncoding': 'UTF-8'
    }
  },
  () => {}
);
