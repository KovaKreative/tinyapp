class SmallURL {
  static newVisit(object, visitorID, time) {
    object.visits.push(new Visitor(visitorID, time));
  }
  static updateLongURL(object, longURL) {
    object.longURL = longURL;
  }

  constructor(longURL, userID) {
    this.longURL = longURL;
    this.userID = userID;
    this.visits = [];
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