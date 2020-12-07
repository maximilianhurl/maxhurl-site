FROM python:3.9-slim

RUN apt-get update && apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash && apt-get install -y nodejs npm


# Set the working directory to /app
RUN mkdir /opt/app
WORKDIR /opt/app

# Copy the current directory contents into the container at /app
ADD . /opt/app

# install and build
RUN python -m venv env && env/bin/pip install -r requirements.txt
RUN npm install && npm run build-prod && rm -r node_modules

# Make port 80 available to the world outside this container
EXPOSE 8080

CMD ["env/bin/waitress-serve", "--port", "8080", "maxhurl:app"]