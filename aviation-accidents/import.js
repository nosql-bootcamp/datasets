var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error',
  requestTimeout: Infinity,
  keepAlive: false // For windows users maybe
});

var emptyToNull = function(str) {
  return (str && str.trim() !== "") ? str : null;
}

var buildLocation = function(data) {
  var lon = emptyToNull(data["Longitude"]);
  var lat = emptyToNull(data["Latitude"]);
  return lon && lat ? [ parseFloat(lon), parseFloat(lat) ] : null;
}

var accidents = [];
fs.createReadStream('AviationDataEnd2016UP.csv')
    .pipe(csv())
    .on('data', data => {
      accidents.push({ "index" : { "_index" : "aviation", "_type" : "accident" } });
      var accident = {
          "event_id": data["Event.Id"],
          "@timestamp": new Date(data["Event.Date"]),
          "type": emptyToNull(data["Investigation.Type"]),
          "number": data["Accident.Number"],
          "where": data["Location"],
          "country": data["Country"],
          "location" : buildLocation(data),
          "severity": emptyToNull(data["Injury.Severity"]),
          "damage": emptyToNull(data["Aircraft.Damage"]),
          "category": emptyToNull(data["Aircraft.Category"]),
          "model": emptyToNull(data["Model"]),
          "purpose": emptyToNull(data["Purpose.of.Flight"]),
          "fatal": (data["Total.Fatal.Injuries"] && data["Total.Fatal.Injuries"] !== "") ? parseInt(data["Total.Fatal.Injuries"]) : 0,
          "serious": (data["Total.Serious.Injuries"] && data["Total.Serious.Injuries"] !== "") ? parseInt(data["Total.Serious.Injuries"]) : 0,
          "minor": (data["Total.Minor.Injuries"] && data["Total.Minor.Injuries"] !== "") ? parseInt(data["Total.Minor.Injuries"]) : 0,
          "uninjured": (data["Total.Uninjured"] && data["Total.Uninjured"] !== "") ? parseInt(data["Total.Uninjured"]) : 0,
          "phase": emptyToNull(data["Broad.Phase.of.Flight"]),
          "weather": emptyToNull(data["Weather.Condition"])
      };
      accidents.push(accident);
    })
    .on('end', () => {
      esClient.bulk({
        body: accidents
      }, (err, resp) => {
        if (err) { throw err; }
        console.log(`${resp.items.length} accidents inserted`);
      });
    });
