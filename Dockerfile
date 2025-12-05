FROM jenkins/jenkins:lts

# Cambiar a root para instalar dependencias
USER root

# Instalar Node.js 20, unzip, wget, Java (requerido por SonarScanner)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs unzip wget openjdk-17-jre-headless \
    && npm -v && node -v

# Instalar SonarScanner CLI
RUN wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-5.0.1.3006-linux.zip -O /tmp/sonar.zip \
    && unzip /tmp/sonar.zip -d /opt \
    && mv /opt/sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner \
    && rm /tmp/sonar.zip

# Exportar SonarScanner al PATH
ENV PATH="/opt/sonar-scanner/bin:${PATH}"

# Verificación (opcional pero útil)
RUN sonar-scanner --version || echo "SonarScanner instalado"

# Volver al usuario jenkins
USER jenkins
