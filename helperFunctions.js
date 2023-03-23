/**
 * Returns a randomized string
 * consisting of the number of digits specified
 * in the argument (default: 1)
 * @param {Number} digits 
 * @returns {String}
 */
const generateRandomString = function(digits = 1) {
  let output = '';

  const numbers = [48, 57];
  const letters = [65, 90];

  while (output.length < digits) {
    const number = Math.random() < 0.3;
    let range = number ? numbers : letters;
    let code = Math.round(Math.random() * (range[1] - range[0]) + range[0]);
    let temp = String.fromCharCode(code);
    const capital = number ? false : Math.random() > 0.5;
    temp = capital ? temp.toUpperCase() : temp.toLowerCase();
    output += temp;
  }
  return output;
};

/**
 * Takes in an object or array of objects and casts each object in the list as an instance
 * of the class passed in as the second parameter.
 * The class passed in as the second parameter must be passed in as ClassName.prototype.
 * (e.g. const fishList = castObjects(listOfObjects, Fish.prototype) );
 * @param {Object} objectList
 * @param {class} castPrototype
 * @returns {Object}
 * Purpose: JSON stores classes as regular objects and can't acommodate methods
 * so once we parse our data from the file, we need to then filter it through this function
 * to ensure that our users and URLs belong to their respective classes.
 */
const castObjects = function(objectList, castPrototype) {
  let buffer = {};
  for (const key in objectList) {
    buffer[key] = Object.setPrototypeOf(objectList[key], castPrototype);
  }
  return buffer;
};

/**
 * A simple function that takes in a list of objects and
 * returns the one that matches the key passed in as id
 * @param {Object} list 
 * @param {String} id 
 * @returns {Object}
 */
const getUser = function(list, id) {
  return list[id];
};

/**
 * Takes in a list of objects and searches them for the
 * key of 'email' whose value matches that of the string
 * passed in as the second parameter. Returns the object
 * if there is a match, or null.
 * @param {Object} list 
 * @param {String} email 
 * @returns {Object}
 */
const getUserByEmail = function(list, email) {
  for (const id in list) {
    if (list[id]['email'] === email) {
      return list[id];
    }
  }
  return null;
};

/**
 * Takes in a list of SmallURL objects and a user ID string.
 * Combs through the list of SmallURL objects and returns a new
 * list with only the SmallURL objects whose userID value matches
 * that of the string passed in as the second parameter.
 * @param {Object} urlList 
 * @param {String} userID 
 */
const fetchUserURLs = function(urlList, userID) {
  const output = {};
  for (const id in urlList) {
    if (userID === urlList[id].userID) {
      output[id] = urlList[id];
    }
  }
  return output;
};

/**
 * Checks a User object and a SmallURL object passed in as parameters.
 * Checks that they're valid, and compares the user.id to the userID stored
 * in the SmallURL object. If any of the above are falsy, it returns an
 * object with the approrpriate response code and message. Otherwise, returns
 * null, which means everything is okay. 
 * @param {Object} user 
 * @param {Object} shortLink 
 */
const invalidatePost = function(user, shortLink) {
  let code = 200;
  let message = "";

  let actionDenied = false;

  if (!user) {
    code = 400;
    message = "You are not signed in.";
  }

  if (!shortLink) {
    code = 404;
    message = "Short link not found.";
  }

  if (shortLink.userID !== user.id) {
    code = 403;
    message = "Permission denied.";
  }

  if (code !== 200) {
    actionDenied = { code, message };
  }

  return actionDenied;
};

module.exports = { getUser, getUserByEmail, fetchUserURLs, generateRandomString, castObjects, invalidatePost };