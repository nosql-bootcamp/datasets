const csv = require("csv-parser");
const fs = require("fs");
const elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({
  host: "localhost:9200",
  log: "error",
  requestTimeout: Infinity
});

client.indices.create(
  {
    index: "yelp",
    body: {
      settings: {
        analysis: {
          analyzer: {
            name_analyzer: {
              type: "standard",
              stopwords: "_english_"
            }
          }
        }
      },
      mappings: {
        business: {
          properties: {
            location: {
              type: "geo_point"
            },
            stars: {
              type: "float"
            },
            name: {
              type: "text",
              analyzer: "name_analyzer"
            }
          }
        }
      }
    }
  },
  (err, resp) => {
    if (err) console.trace(err.message);
  }
);

let businessCount = 0;
const docs = [];

fs
  .createReadStream("./yelp_business.csv")
  .pipe(csv())
  .on("data", data => {
    businessCount++;
    let {
      business_id,
      is_open,
      latitude,
      longitude,
      name,
      address,
      neighborhood,
      stars,
      review_count,
      categories,
      ...rest
    } = data;

    business_id = `b_${business_id}`; // Prefix ID to avoid collision with users
    name = name.substring(1, name.length - 1);
    categories = categories.split(";");

    const document = {
      ...rest,
      name,
      location: {
        lat: Number(latitude),
        lon: Number(longitude)
      },
      stars: Number(stars),
      review_count: Number(review_count),
      categories,
      _id: business_id
    };

    docs.push(document);
  })
  .on("end", () => {
    console.log("done");
    client.bulk(createBulkInsertQuery(docs), (err, resp) => {
      if (err) console.trace(err.message);
      else {
        console.log(`Inserted ${resp.items.length} calls`);
        client.close();
      }
    });
  });

// Fonction utilitaire permettant de formatter les données pour l'insertion "bulk" dans elastic
function createBulkInsertQuery(businessArray) {
  const body = businessArray.reduce((acc, business) => {
    const { _id, ...rest } = business;
    acc.push({
      index: { _index: "yelp", _type: "business", _id }
    });
    acc.push(rest);
    return acc;
  }, []);
  return { body };
}
