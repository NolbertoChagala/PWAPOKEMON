FROM jenkins/jenkins:lts

# Cambiar a root para instalar Node.js
USER root

# Instalar Node.js 20 y npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm -v

# Volver al usuario Jenkins
USER jenkins
