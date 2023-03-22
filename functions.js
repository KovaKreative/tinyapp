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

module.exports = { getUser, getUserByEmail, fetchUserURLs, generateRandomString };