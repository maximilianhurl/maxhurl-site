FROM ubuntu:18.04

RUN apt-get update && apt-get install -y git nginx libreadline-dev python3-pip python3-venv build-essential python-setuptools nodejs npm curl

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION v5.6.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# Set the working directory to /app
RUN mkdir /opt/app
WORKDIR /opt/app

# install node and npm
RUN . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Copy the current directory contents into the container at /app
ADD . /opt/app

# install and build
RUN python3 -m venv env && env/bin/pip install -U setuptools && env/bin/pip install -r requirements.txt
RUN /bin/bash -c ". $NVM_DIR/nvm.sh && nvm use && npm install && npm run build-prod"

# Make port 80 available to the world outside this container
EXPOSE 8080

CMD ["env/bin/waitress-serve", "--port", "8080", "maxhurl:app"]