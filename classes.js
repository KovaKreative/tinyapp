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

module.exports = { SmallURL, User };