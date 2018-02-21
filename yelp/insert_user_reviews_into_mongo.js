const mongodb = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');

const log = require('single-line-log').stdout;
const colors = require('colors');
const prettyMs = require('pretty-ms');

const MongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';

const DATABASE_NAME = "yelp";
const COLLECTION_NAME = "users";
const BULK_SIZE = 1000;

const insertUsers = (db, callback) => {
    const collection = db.collection(COLLECTION_NAME);

    let updates = [];
    let totalNumberOfUpdates = 0
    log(`${totalNumberOfUpdates} reviews added!`);
    fs.createReadStream('./data/yelp_review.csv')
        .pipe(csv())
        .on('data', data => {
          const updateQueryForBulk = {
            updateOne: {
              filter: { _id : data.user_id},
              update: {
                $push: {
                  reviews: {
                    id: data.review_id,
                    businessId: data.business_id,
                    date: data.date,
                    stars: parseInt(data.stars, 10),
                    useful: parseInt(data.useful, 10),
                    funny: parseInt(data.funny, 10),
                    cool: parseInt(data.cool, 10)
                  }
                }
              }
            }
          }
          updates.push(updateQueryForBulk);
          if (updates.length >= BULK_SIZE) {
            collection.bulkWrite(updates, (err, result) => {
              totalNumberOfUpdates += result.modifiedCount;
              log(`${totalNumberOfUpdates} reviews added!`);
            })
            updates = []
          }
        })
        .on('end', () => {
          collection.bulkWrite(updates, (err, result) => {
            totalNumberOfUpdates += result.modifiedCount;
            log(`${totalNumberOfUpdates} reviews added!`);
            callback()
          })
        });

}

MongoClient.connect(mongoUrl, (err, client) => {
  const start = new Date()
  console.log(`Starting script execution at: ${start}`.cyan)

  if (err) {
    console.error(err);
    throw err;
  }

  const db = client.db(DATABASE_NAME);
  insertUsers(db, result => {
      setTimeout(() => {
        console.log(); // new line
        console.log('All user reviews inserted successfully!'.green);

        client.close();

        const executionTime = new Date().getTime() - start.getTime();
        const readableExecutionTime = prettyMs(executionTime);
        console.log(`Script execution time is: ${readableExecutionTime}`.cyan);
      }, 5000)
  });
});
