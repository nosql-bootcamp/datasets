var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

var MONTH = {
  "janv" : 0,
  "févr" : 1,
  "mars" : 2,
  "avr" : 3,
  "mai" : 4,
  "juin" : 5,
  "juil" : 6,
  "août" : 7,
  "sept" : 8,
  "oct" : 9,
  "nov" : 10,
  "déc" : 11,
};

var toTimestamp = function(data) {
  var year; var month; var day;
  var date = data["DATE"];
  if (date.indexOf("-") >= 0) {
    dateElements = date.split("-");
    if (dateElements[0].length === 4) {
      year = parseInt(dateElements[0]);
      month = dateElements[1] - 1;
      day = parseInt(dateElements[2]);
    } else {
      year = parseInt("20" + dateElements[2]);
      month = MONTH[dateElements[1]];
      day = parseInt(dateElements[0]);
    }
  } else {
    dateElements = date.split("/");
    year = parseInt(dateElements[2]);
    month = parseInt(dateElements[1]) - 1;
    day = parseInt(dateElements[0]);
  }

  var time = data["HEURE"].split(":");
  var hours = parseInt(time[0]);
  var minutes = parseInt(time[1]);

  return new Date(year, month, day, hours, minutes);
}

var clean = function(val) {
  if (!val) return null;

  var cleaned = val.replace("<", "").replace("ND", "");
  return cleaned === "" ? null : parseInt(cleaned);
}

var insert = function(place, csvFile) {
  var captures = [];
  fs.createReadStream(csvFile)
      .pipe(csv({
        separator: ';'
      }))
      .on('data', data => {
        captures.push({ "index" : { "_index" : "air-quality", "_type" : "capture" } });
        var capture = {
            "place": place,
            "@timestamp": toTimestamp(data),
            "NO": clean(data["NO"]),
            "NO2": clean(data["NO2"]),
            "PM10": clean(data["PM10"]),
            "PM25": clean(data["PM25"]),
            "CO2": clean(data["CO2"]),
            "temperature": clean(data["TEMP"]),
            "humidity": clean(data["HUMI"])
        };
        captures.push(capture);
      })
      .on('end', () => {
        esClient.bulk({
          body: captures
        }, (err, resp) => {
          if (err) { throw err; }
          console.log(`${resp.items.length} data inserted for ${place}`);
        });
      });
}

insert('Auber', './data/qualite-de-lair-mesuree-dans-la-station-auber.csv');
insert('Châtelet', './data/qualite-de-lair-mesuree-dans-la-station-chatelet.csv');
insert('Franklin_Roosevelt', './data/qualite-de-lair-mesuree-dans-la-station-franklin-d-roosevelt.csv');
