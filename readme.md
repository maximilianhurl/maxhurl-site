

## Requirements

    nvm
    pyenv
    postgreSQL


## Building the project

    ./build


## Running the app

`env/bin/waitress-serve --port 8080  maxhurl:app`


## Building & running the docker image

`docker build -t max-hurl-site .`
`docker run -i -t --init --rm -p 8001:8080 -e MAILGUN_KEY=test -e APP_MESSAGE_KEY=test -e MARK_MESSAGE_KEY=test a408cbd02ac1`

