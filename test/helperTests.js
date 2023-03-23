const { assert } = require('chai');

const { getUser, getUserByEmail, fetchUserURLs, checkIfHasProtocol } = require('../helperFunctions.js');
const { SmallURL } = require('../classes');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": new SmallURL("http://www.lighthouselabs.ca", "userRandomID"),
  "9sm5xK": new SmallURL("http://www.google.com", "user2RandomID")
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return null if a user with this email address isn\'t found', function() {
    const user = getUserByEmail(testUsers, "noSuchUser@noSuchDomain.nil");
    assert.isNull(user);
  });

});

describe('getUser', function() {

  it('should return a user object with matching ID', function() {
    const user = getUser(testUsers, "userRandomID");
    const expectedUserID = { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" };
    assert.deepEqual(user, expectedUserID);
  });

  it('should return undefined if a user with matching ID isn\'t found', function() {
    const user = getUser(testUsers, "myIDnum");
    assert.isUndefined(user);
  });

});

describe('fetchUserURLs', function() {

  it('should return a url object with matching ID', function() {
    const URLs = fetchUserURLs(urlDatabase, "userRandomID");
    const expectedURL = { "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID", numOfVisits: [] } };
    assert.deepEqual(URLs, expectedURL);
  });

  it('should return empty object if no URL with matching userID found', function() {
    const user = fetchUserURLs(urlDatabase, "user3RandomID");
    assert.deepEqual(user, {});
  });

});