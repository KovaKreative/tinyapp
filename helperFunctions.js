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

// JSON stores classes as regular objects and can't acommodate methods
// so once we parse our data from the file, we need to then filter it through this function
// to ensure that our users and URLs belong to their respective classes
const castObjects = function(objectList, castPrototype) {
  let buffer = {};
  for (const key in objectList) {
    buffer[key] = Object.setPrototypeOf(objectList[key], castPrototype);
  }
  return buffer;
};

const getUser = function(object, id) {
  return object[id];
};

const getUserByEmail = function(object, email) {
  for (const id in object) {
    if (object[id]['email'] === email) {
      return object[id];
    }
  }
  return null;
};

const fetchUserURLs = function(urlList, userID) {
  const output = {};
  for (const id in urlList) {
    if (userID === urlList[id].userID) {
      output[id] = urlList[id];
    }
  }
  return output;
};

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