const mongodb = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');

const log = require('single-line-log').stdout;
const colors = require('colors');

const MongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb://localhost:27017';

const DATABASE_NAME = "yelp";
const COLLECTION_NAME = "users";
const BULK_SIZE = 1000;

const insertUsers = (db, callback) => {
    const collection = db.collection(COLLECTION_NAME);

    collection.drop({}, () => {
      console.log(`${COLLECTION_NAME} collection droped!`.yellow)
      let users = [];
      let totalNumberOfUsers = 0;
      log(`${totalNumberOfUsers} users inserted`)
      fs.createReadStream('./data/yelp_user.csv')
          .pipe(csv())
          .on('data', data => {
              users.push({
                  "_id": data.user_id,
                  "name": data.name,
                  "since": data.yelping_since,
                  "numberOfReviews": parseInt(data.review_count, 10),
                  "numberOfUsefulReviews": parseInt(data.useful, 10),
                  "numberOfFunnyReviews": parseInt(data.funny, 10),
                  "numberOfCoolReviews": parseInt(data.cool, 10),
                  "numberOfFriends": data.friends.split(", ").length,
                  "numberOfFans": parseInt(data.fans, 10),
                  "averageStars": parseFloat(data.average_stars),
                  "reviews": []
              });
              if (users.length >= BULK_SIZE) {
                collection.insertMany(users, (err, result) => {
                  totalNumberOfUsers += result.insertedCount;
                  log(`${totalNumberOfUsers} users inserted`);
                });
                users = []
              }
          })
          .on('end', () => {
              collection.insertMany(users, (err, result) => {
                totalNumberOfUsers += result.insertedCount;
                log(`${totalNumberOfUsers} users inserted`);
                callback()
              });
          });
    })
}

MongoClient.connect(mongoUrl, (err, client) => {
  if (err) {
    console.error(err);
    throw err;
  }
  const db = client.db(DATABASE_NAME);
  insertUsers(db, result => {
      setTimeout(() => {
        console.log(); // new line
        console.log('All users inserted successfully!'.green);
        client.close();
      }, 5000)
  });
});
