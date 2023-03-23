const fs = require('fs');
const { SmallURL, User } = require('./classes');

// const urlDatabase = {
//   "b2xVn2": new SmallURL("http://www.lighthouselabs.ca", "userRandomID"),
//   "9sm5xK": new SmallURL("http://www.google.com", "userRandomID")
// };

// const userDatabase = {
//   userRandomID: new User("userRandomID", "user@example.com", "purplemonkeydinosaur"),
//   user2RandomID: new User("user2RandomID", "user2@example.com", "dishwasherfunk")
// };

// const urls = JSON.stringify(urlDatabase);
// const users = JSON.stringify(userDatabase);

const saveDatabase = function(data, filename) {
  fs.writeFile(`./database/${filename}.db`, data, (error) => {
    if (error) {
      return console.error(error);
    }
    return console.log("Database saved successfully!");
  });
};

/* 
Choosing to use readFileSync because as it is now, I don't want to start my server until I fetch my databases, so doing it async is pointless
In the future, if the number of users increases, it might be worth keeping a separate file for every user and just load them as needed when a given user logs in
*/

const loadDatabase = function(fileName) {
  const database = fs.readFileSync(`./database/${fileName}.db`, 'utf-8', (error, data) => {
    if (error) {
      return console.error(error);
    }
    return data;
  });

  if(!database) {
    return {};
  }
  
  return JSON.parse(database);
};

module.exports = { saveDatabase, loadDatabase };