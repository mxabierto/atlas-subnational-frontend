FROM node:6.14-slim

# Instalacion paqutes de sistema
RUN apt-get update && apt-get install -y nginx curl git-core

# Directorio de proyecto
ENV PROJECT_SOURCE=/project/
ENV NGINX_STATICS=/var/www/html/
RUN mkdir $PROJECT_SOURCE

WORKDIR $PROJECT_SOURCE

# Instalacion paquetes node
ADD package.json $PROJECT_SOURCE
RUN npm install

# Instalacion paqutes bower
ADD bower.json $PROJECT_SOURCE
RUN npm install -g bower
RUN bower install --allow-root

ADD . $PROJECT_SOURCE

# Genera proyecto
RUN npm install -g ember-cli
RUN rm -rf /usr/share/nginx/html/
RUN ember build --output-path=$NGINX_STATICS

WORKDIR $NGINX_STATICS
RUN rm -rf $PROJECT_SOURCE

EXPOSE 80

# Run
CMD ["nginx", "-g", "daemon off;"]