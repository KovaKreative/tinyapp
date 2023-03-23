const fs = require('fs');

const saveData = function(data, path) {
  const fileData = JSON.stringify(data);
  fs.writeFile(`./database/${path}`, fileData, (error) => {
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
const loadData = function(path) {
  const database = fs.readFileSync(`./database/${path}`, 'utf-8', (error, data) => {
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

module.exports = { saveData, loadData };