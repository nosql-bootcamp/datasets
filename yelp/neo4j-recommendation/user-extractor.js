var csv = require('csv-parser');
var fs = require('fs');

const userWriteStream = fs.createWriteStream('./out/users.csv')
const friendshipWriteStream = fs.createWriteStream('./out/friendships.csv') 

userWriteStream.write('user_id:ID,name,review_count,average_stars\n')
friendshipWriteStream.write(':START_ID,:END_ID\n')

let friendhipCount = 0
let userCount = 0
fs.createReadStream('./yelp_user.csv')
  .pipe(csv())
  .on('data', data => {
      userCount ++
      let {user_id, name, review_count, friends, average_stars} = data
      user_id = `u_${user_id}` // Prefix ID to avoid collision with business

      if(friends === 'None') {
          friends = []
      } else {
          friends = friends.split(', ')
      }

      friends
        .map(friendId => `u_${friendId}`)
        .forEach(friendId => {
            friendhipCount ++
            friendshipWriteStream.write(`${user_id},${friendId}\n`)
        })
      
      userWriteStream.write(`${user_id},"${name}",${review_count},${average_stars}\n`) 
  })
  .on('end', () => {
    userWriteStream.close()
    friendshipWriteStream.close()
    console.log(`${userCount} users extracted`)
    console.log(`${friendhipCount} friendship extracted`)
});
