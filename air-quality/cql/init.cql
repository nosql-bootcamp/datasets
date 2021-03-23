CREATE KEYSPACE IF NOT EXISTS air_data WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE air_data;

DROP TABLE IF EXISTS measures;

CREATE TABLE IF NOT EXISTS measures (
  time timestamp,
  station text,
  no int,
  no2 int,
  pm10 int,
  pm25 int,
  co2 int,
  temperature decimal,
  humidity decimal,
  PRIMARY KEY (station, time)
);
