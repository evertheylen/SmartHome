# How to insert data?

1. Have some locations in your account

2. Each Location should have a Sensor called "Lights" (exactly)

3. In the "Upload data" dialog, download the configuration file for ElecSim, and save it

4. Run ElecSim like this:

	python3 main.py --mode=generate --config_file=config.json --from=2016-01-01T00:00 --to=2016-01-01T23:59

It will files called `data_house_X.csv` where X is the LID of your location.

5. Upload (some of) these files through the 'Upload data' dialog

Note: Currently the "live" option does not do anything.

