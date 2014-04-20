

## Setting up the environment

`sudo apt-get install python-setuptools`

`sudo easy_install pip`

`sudo pip install virtualenv`

`env/bin/pip install -r requirements.txt`

[https://www.digitalocean.com/community/articles/how-to-install-and-configure-ansible-on-an-ubuntu-12-04-vps](https://www.digitalocean.com/community/articles/how-to-install-and-configure-ansible-on-an-ubuntu-12-04-vps)



## Running the app

`env/bin/waitress-serve --port 8080  maxhurl:app`



## Supervisord testing command

`supervisord -c supervisord.conf`



## Anisble deployment scripts

`ansible-playbook etc/ansible/webserver.yaml -i etc/ansible/hosts.ini`

`ansible-playbook etc/ansible/app.yaml --inventory-file=etc/ansible/hosts.ini`