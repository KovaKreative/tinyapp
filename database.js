class SmallURL {
  constructor(longURL, userID) {
    this.longURL = longURL;
    this.userID = userID;
  }
}

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

const urlDatabase = {
  "b2xVn2": new SmallURL("http://www.lighthouselabs.ca", "userRandomID"),
  "9sm5xK": new SmallURL("http://www.google.com", "userRandomID")
};

const userDatabase = {
  userRandomID: new User("userRandomID", "user@example.com", "purplemonkeydinosaur"),
  user2RandomID: new User("user2RandomID", "user2@example.com", "dishwasherfunk")
};

const getUser = function(object, id) {
  return object[id];
}

const getUserByEmail = function(object, email) {
  for(const id in object) {
    if(object[id]['email'] === email) {
      return object[id];
    }
  }
  return null;
}

const fetchUserURLs = function(userID, urlList) {
  const output = {};
  for(const id in urlList) {
    if(userID === urlList[id].userID) {
      output[id] = urlList[id];
    }
  }
  return output;
}

module.exports = { SmallURL, User, userDatabase, urlDatabase, getUser, getUserByEmail, fetchUserURLs };