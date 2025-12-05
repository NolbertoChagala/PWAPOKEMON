FROM jenkins/jenkins:lts

# Cambiar a root para instalar dependencias
USER root

# Instalar Node.js 20 y npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs unzip wget \
    && npm -v && node -v

# Instalar SonarScanner CLI
RUN wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-5.0.1.3006-linux.zip \
    && unzip sonar-scanner-5.0.1.3006-linux.zip -d /opt \
    && mv /opt/sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner \
    && rm sonar-scanner-*.zip

# Exportar SonarScanner al PATH
ENV PATH="/opt/sonar-scanner/bin:${PATH}"

# Verificación opcional (puedes quitarla si quieres)
RUN sonar-scanner --version

# Volver al usuario Jenkins
USER jenkins
