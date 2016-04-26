
if [ ! -f bin/activate.sh ]; then
	echo "Please run 'setup.sh' first."
	exit 1
fi

echo ">>> Entering virtualenv"
source bin/activate

cd code
echo ">>> Starting OverWatch"
python3 ./overwatch.py

echo ">>> Leaving virtualenv"
deactivate
