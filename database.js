class SmallURL {
  constructor(longURL, userID) {
    this.longURL = longURL;
    this.userID = userID;
    this.visits = [];
  }

  newVisit(visitorID, time) {
    this.visits.push(new Visitor(visitorID, time));
  }
}

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

class Visitor {
  constructor(visitorId, time) {
    this.visitorId = visitorId;
    this.time = time;
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

module.exports = { SmallURL, User, userDatabase, urlDatabase };