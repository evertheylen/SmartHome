# main_function,
# Does:
# Parse command line arguments + basic validation
# Generate config file OR Calls generate_date.generate_date_range
# Author: Len Feremans 8-Feb-2016
# Disclaimer: code was based on excel VBA script, so no judgement! ;-)

import sys
import getopt
import time
import json
from datetime import datetime
import re
from os.path import dirname
import random
import sys
import csv
sys.path.append(dirname(__file__))
sys.path.append('src')

import generate_data
import occsimread
import appliance
import activitydat
import appsimfun
import bulbdat

__author__ = 'lfereman'


def main(argv):
    usage = """
main --mode=configure --no_house_holds=10 --output=MY_CONFIGURE.json
    -> Generates 10 households configure in output file
       For each house we 'randomly' assign a number of residents (between 1-5)
       For each of possible 32 aplliances we globally enable/disable them
main --mode=generate --config_file=MY_CONFIGURE.json --from=yyyy-MM-ddTHH:mm --to=yyyy-MM-ddTHH:mm
    -> Generates data, e.g. for each device, every 5 minute the power usage, for every timestamp within from/to range 
    -> If from/to is empty, assuming today, e.g. -from 2016-02-04T00:00 -to 2016-02-04T23:59
    -> Input can be generated using mode=configure
"""
    dateformat = '%Y-%m-%dT%H:%M'
    mode = ''
    outputfile = ''
    no_house_holds = ''
    config_file = ''
    from_date = datetime.strptime(time.strftime(
        "%Y-%m-%d") + 'T00:00', dateformat)  # default today
    to_date = datetime.strptime(time.strftime(
        "%Y-%m-%d") + 'T23:59', dateformat)
    household_no = ''
    try:
        opts, args = getopt.getopt(argv, "m:o:n:c:f:t:h", ["mode=", "output=",  # for both modes
                                                           "no_house_holds=",  # for mode=configure
                                                           "config_file=", "from=", "to="])  # for mode=generate
    except getopt.GetoptError as e:
        print(e)
        print(usage)
        sys.exit(2)

    # Parse command-line arguments
    for opt, arg in opts:
        if opt == '-h':
            print(usage)
            sys.exit(-1)
        elif opt in ("-m", "--mode"):
            mode = arg
            if not(mode == "configure" or mode == "generate"):
                raise ValueError("mode must be configure or generate")
        elif opt in ("-o", "--output"):
            outputfile = arg
        elif opt in ("-c", "--config_file"):
            config_file = arg
        elif opt in ("-n", "--no_house_holds"):
            if not re.match("\d+", arg):
                raise ValueError("invalid no_house_hold, must be number")
            if int(arg) < 0 or int(arg) > 100:
                raise ValueError("no_house_hold, must be between 1 and 100")
            no_house_holds = int(arg)
        elif opt in ("-f", "--from"):
            if not re.match("\d{4}-\d{2}-\d{2}T\d{2}:\d{2}", arg):
                raise ValueError(
                    "from date must be of format yyyy-MM-ddTHH:mm")
            from_date = datetime.strptime(arg, dateformat)
        elif opt in ("-t", "--to"):
            if not re.match("\d{4}-\d{2}-\d{2}T\d{2}:\d{2}", arg):
                raise ValueError("to date must be of format yyyy-MM-ddTHH:mm")
            to_date = datetime.strptime(arg, dateformat)
        elif opt in ("-h", "--household"):
            if not re.match("\d+", arg):
                raise ValueError("household must be number")
            household_no = int(arg)

    # run
    if mode == "configure":
        if no_house_holds == '':
            raise ValueError("no_house_holds is empty")
        if outputfile == '':
            raise ValueError("outputfile is empty")
    if mode == "generate":
        if config_file == '':
            raise ValueError(
                "configfile is empty, try --mode=configure to generate")
    if mode == "configure":
        make_config_file(no_house_holds, outputfile)
    elif mode == "generate":
        generate_sensor_data(config_file, from_date, to_date)
    else:
        raise ValueError("mode neither configure nor generate")


def make_config_file(no_house_holds, outputfile):
    print("Please don't use this")
    print("make_config_file(no_house_holds=%d, config_file_output=%s" %
          (no_house_holds, outputfile))
    random.seed(datetime.now())  # different result each time
    json_file = open(outputfile, "w")
    config_data = list()
    for household_no in range(no_house_holds):
        dict = {}
        dict["id_household"] = household_no + 1
        # random number of residents, between 1 and 5
        iResidents = random.randint(1, 5)
        dict["no_residents"] = iResidents
        # simulate which appliances are present
        Dwell = appliance.ConfigureAppliancesInDwelling(appliance.appliances)
        appliance_names = list()
        for i in range(len(appliance.appliances)):
            name = appliance.appliances[i][0]
            if Dwell[i] == "YES":
                appliance_names.append(name)
        dict["appliances"] = appliance_names
        # simulate light usage
        #' Determine the irradiance threshold of this house
        iIrradianceThreshold = appsimfun.GetMonteCarloNormalDistGuess(
            dMeanl=60, dSDl=10)
        dict["lights_irradiance"] = iIrradianceThreshold
        #' Choose a random house from the list of 100 provided in the bulbs sheet
        iRandomHouse = int((100 * random.random()) + 1)
        dict["lights_house"] = iRandomHouse
        config_data.append(dict)
    json.dump(config_data, json_file, sort_keys=True, indent=4)
    json_file.close()
    print("saved config file: " + outputfile)

# Edits by Evert
class Sensor:
    def __init__(self, name):
        self.ID = int(name[name.find("[")+1:name.find("]")])
        name = name[:name.find("[")] + name[name.find("]")+1:]
        self.appname = name.strip()
    
    @property
    def full_name(self):
        return "{s.appname} [{s.ID}]".format(s=self)

class LightSensor(Sensor):
    def __init__(self, ID):
        self.ID = ID
        self.appname = "Lights"

def generate_sensor_data(config_file: str, from_date: datetime, to_date: datetime):
    print("generate_sensor_date(config_file=%s, from=%s, to=%s" % (
        config_file, from_date, to_date))
    random.seed(datetime.now())  # different result each time
    json_file = open(config_file, "r")
    config_data = json.load(json_file)
    json_file.close()
    config = None
    for config in config_data:
        appliance_status = []
        
        # Edits by Evert
        print("Loading household {}".format(config["id_household"]))
        sensors = []
        for name in config["appliances"]:
            sensor = Sensor(name)
            sensors.append(sensor)
            print("  - loaded sensor with ID {s.ID} with appliance name `{s.appname}`".format(s=sensor))
        
        lightSensor = LightSensor(config["lights_id"])
        
        #for row in appliance.appliances:
            #status = "NO"
            #name = row[0]
            #if name in sensors:
                #status = "YES"
            #appliance_status.append(status)
        
        data = generate_data.generate_data_range(
            iResidents=config["no_residents"],
            Sensors=sensors,
            lightSensor=lightSensor,
            iIrradianceThreshold=config["lights_irradiance"],
            iRandomHouse=config["lights_house"],
            from_date=from_date,
            to_date=to_date)
        outputfile = "data_house_{}.csv".format(config["id_household"])
        save_file = open(outputfile, 'w')
        for row in data:
            for col in row:
                save_file.write(str(col))
                save_file.write(";")
            save_file.write("\n")
        save_file.close()
        print("saved %s" % outputfile)

if __name__ == "__main__":
    main(sys.argv[1:])
