

## Setting up the environment

`sudo apt-get install python-setuptools`

`sudo easy_install pip`

`sudo pip install virtualenv`

`env/bin/pip install -r requirements.txt`


## Running the app

`env/bin/waitress-serve --port 8080  maxhurl:app`


## Anisble deployment scripts

`ansible-playbook etc/ansible/webserver.yaml -i etc/ansible/hosts.ini`

`ansible-playbook etc/ansible/app.yaml --inventory-file=etc/ansible/hosts.ini`

Currently there is an issue with these anisble scripts and not correctly starting supervisord.

You need to run `supervisord -c /opt/maxhurl-site/etc/supervisord/supervisord.conf` after the second script fails to ensure supervisord is started.