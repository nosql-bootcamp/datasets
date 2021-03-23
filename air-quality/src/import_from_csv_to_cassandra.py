#!/usr/bin/python

import sys
import csv
import os
import dateparser
from datetime import datetime
from cassandra.cluster import Cluster


stations = [{'stationName' : 'auber', 'filePath' : 'data/qualite-de-lair-mesuree-dans-la-station-auber.csv'},
         {'stationName' : 'chatelet', 'filePath' : 'data/qualite-de-lair-mesuree-dans-la-station-chatelet.csv'},
         {'stationName' : 'franklin-d-roosevelt', 'filePath' : 'data/qualite-de-lair-mesuree-dans-la-station-franklin-d-roosevelt.csv'}]

def importStationData(station): #read data from a csv station file and export to a cassandra cluster.
    with open(os.path.join(os.path.dirname(__file__), station['filePath']), 'rb') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')

        for row in reader:
            try:
                datetime = dateparser.parse(row['DATE'] + ' ' + row['HEURE'])
                session.execute("""
                INSERT INTO measures (time, station, no, no2, pm10, co2, temperature, humidity)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (datetime.isoformat(), station['stationName'], convertToInt(row['NO']), convertToInt(row['NO2']), convertToInt(row['PM10']), convertToInt(row['CO2']), convertToFloat(row['TEMP']), convertToFloat(row['HUMI'])))
            except:
                print("Impossible to import : ", row)

def convertToInt(value):
    try:
        return int(value)
    except ValueError:
        return None

def convertToFloat(value):
    try:
        return float(value)
    except ValueError:
        return None

if(len(sys.argv) < 3):
	print('Cassandra\'s hosts and Cassandra\'s port need to be provided as launch parameters : python your_path/import_from_csv_to_cassandra.py hosts port')
else:
    hosts = sys.argv[1].split(',')
    port=sys.argv[2]
    cluster = Cluster(hosts, port=port)
	#Connect to the cluster and use the keyspace air_data
    session = cluster.connect('air_data')

	# Import station data to Cassandra
    for station in stations:
        importStationData(station)
