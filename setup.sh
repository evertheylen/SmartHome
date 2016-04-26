#!/bin/bash

echo ">>> Setting up virtualenv..."
virtualenv --system-site-packages -p python3.5 .
echo ">>> Activating the virtualenv..."
source ./bin/activate

echo "\n>>> Installing dependencies..."
pip install -r requirements.txt

echo "\n>>> Please make sure postgres is running on port 5432."
echo "Username for postgres?"
read username
echo "Password for $username?"
read password

echo "\n>>> Creating two databases: overwatchdb for the project itself, and testdb for running tests."
PGPASSWORD=$password psql -U $username -h localhost -w -c "CREATE DATABASE overwatchdb"
PGPASSWORD=$password psql -U $username -h localhost -w -c "CREATE DATABASE testdb"                                                                                                                                         

echo "\n>>> Entering 'code'"
cd code

echo ">>> Creating 'config.py'"
text="config = {
    'port': 8888,
    'debug': False,
    'database': {
        'dbname': 'overwatchdb',
        'user': '$username',
        'password': '$password',
        'host': 'localhost',
        'port': 5432,
    },
    'tornado_app_settings': {}
}"

echo $text > config.py

echo "\n>>> Installing the project"
python3 ./overwatch.py install

echo ">>> Done!"
