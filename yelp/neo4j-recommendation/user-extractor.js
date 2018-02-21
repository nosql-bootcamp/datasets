var csv = require('csv-parser');
var fs = require('fs');

const writeStream = fs.createWriteStream('./out/users.csv')
writeStream.write('user_id:ID\n')

fs.createReadStream('./yelp_user.csv')
  .pipe(csv())
  .on('data', data => {
      writeStream.write(`u_${data.user_id}\n`) // Prefix ID to avoid collision with business
  })
  .on('end', () => {
    writeStream.close()
});
