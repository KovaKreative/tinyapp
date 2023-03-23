const fs = require('fs');

/**
 * Takes in a list of objects and uses JSON Stringify to turn it into a string
 * before saving it into the filename specified in the second parameter in a folder
 * called 'database'. The folder must already exist for this function to
 * work.
 * @param {Object} data 
 * @param {String} path 
 */
const saveData = function(data, path) {
  const fileData = JSON.stringify(data);
  fs.writeFile(`./database/${path}`, fileData, (error) => {
    if (error) {
      return console.error(error);
    }
    return console.log("Database saved successfully!");
  });
};

/**
 * Loads the specified filename from the database folder, parses its contents and returns
 * it as an object. The database folder and the specified filename must already exist
 * for this function to work. 
 * @param {String} path
 * The file by that name must already exist for the operation to be successful.
 * readFileSync was chosen because the server should not start until the databases are loaded.
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