var csv = require('csv-parser');
var fs = require('fs');

const writeStream = fs.createWriteStream('./out/business.csv')
writeStream.write('business_id:ID,state,city,stars,name,categories\n')
fs.createReadStream('./yelp_business.csv')
  .pipe(csv())
  .on('data', data => {
    let {city, state, stars, business_id, name,categories} = data
    if(city.includes(',')) {
      city = city.replace(/,/g, '')
    }
    if(name.includes('"')) {
      name = name.replace(/\"/g, '')
    }

      writeStream.write(`b_${business_id},${state},${city},${stars},"${name}",${categories}\n`) // Prefix ID to avoid collision with users
  })
  .on('end', () => {
    writeStream.close()
});
