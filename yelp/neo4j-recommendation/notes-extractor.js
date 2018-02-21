var csv = require('csv-parser');
var fs = require('fs');

const writeStream = fs.createWriteStream('./out/notes.csv')
writeStream.write(':START_ID,:END_ID\n')


fs.createReadStream('./yelp_review.csv')
  .pipe(csv())
  .on('data', data => {
    if(data.stars >= 4) {
      writeStream.write(`u_${data.user_id},b_${data.business_id}\n`)
    }
  })
  .on('end', () => {
    writeStream.close()
});
