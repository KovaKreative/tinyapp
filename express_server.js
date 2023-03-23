const express = require('express');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['lazyEgg'], maxAge: 365 * 24 * 60 * 60 * 1000 }));
app.use(methodOverride('_method'));

const { SmallURL, User } = require('./classes');
const { saveData, loadData } = require('./databaseFunctions');
const { getUser, getUserByEmail, fetchUserURLs, generateRandomString, checkIfHasProtocol, castObjects, invalidatePost } = require('./helperFunctions');

const urlDatabase = castObjects(loadData('urlDatabase'), SmallURL.prototype);
const userDatabase = castObjects(loadData('userDatabase'), User.prototype);

//URL REQUESTS

// BROWSE the list of URLs
app.get('/urls', (req, res) => {

  const user = getUser(userDatabase, req.session.user_id);

  if (!user) {
    req.session = null;
    return res.redirect("/");
  }

  const userURLs = fetchUserURLs(urlDatabase, user.id);

  const templateVars = {
    email: user.email,
    urls: userURLs
  };

  res.render("urls_index", templateVars);
});

// READ new URL form
app.get("/urls/new", (req, res) => {

  const user = getUser(userDatabase, req.session.user_id);

  if (!user) {
    return res.redirect('/');
  }

  const templateVars = {
    email: user.email
  };

  res.render("urls_new", templateVars);
});

// CREATE NEW small URL
app.post('/urls', (req, res) => {

  const user = getUser(userDatabase, req.session.user_id);
  const longURL = req.body.longURL;

  if (!user) {
    return res.status(403).render('urls_error', { email: undefined, message: "You cannot generate a new tiny URL without an account. Please Log in or Register." });
  }

  /*
  I had to include the following check because without a protocol scheme,
  the redirect function assumes that a given path is a part of the current domain
  */
  if (!checkIfHasProtocol(longURL)) {
    return res.status(400).render('urls_error', { email: user.email, message: "Please make sure to include the full URL (e.g. http://..., https://..., etc)" });
  }

  const idDigits = 6;
  const urlID = generateRandomString(idDigits);

  // The following makes sure that by some freak of a coincidence, the generated ID isn't a match to an already existing one
  while (Object.prototype.hasOwnProperty.call(urlDatabase, urlID)) {
    urlID = generateRandomString(idDigits);
  }

  urlDatabase[urlID] = new SmallURL(longURL, user.id);

  saveData(urlDatabase, "urlDatabase");

  res.redirect(`/urls/${urlID}`);
});

// READ individual page for a tinyApp URL for Editing
app.get('/urls/:id', (req, res) => {

  const userID = req.session.user_id;
  const user = getUser(userDatabase, userID);
  const shortLinkItem = urlDatabase[req.params.id];

  const actionDenied = invalidatePost(user, shortLinkItem);
  if (actionDenied) {
    return res.status(actionDenied.code).render('urls_error', { email: undefined, message: actionDenied.message });
  }

  const templateVars = {
    email: user ? user.email : undefined,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    visits: urlDatabase[req.params.id].visits
  };

  res.render("urls_show", templateVars);

});

// EDIT long URL on an existing entry
app.put('/urls/:id', (req, res) => {

  const id = req.params.id;
  const longURL = req.body.longURL;
  SmallURL.updateLongURL(urlDatabase[id], longURL);

  res.redirect(`/urls/${id}`);

});

// DELETE small URL
app.delete('/urls/delete/:id', (req, res) => {

  const userID = req.session.user_id;
  const user = getUser(userDatabase, userID);
  const shortLinkItem = urlDatabase[req.params.id];

  const actionDenied = invalidatePost(user, shortLinkItem);
  if (actionDenied) {
    return res.status(actionDenied.code).render('urls_error', { email: undefined, message: actionDenied.message });
  }

  const id = req.params.id;

  if (urlDatabase[id]) {
    delete urlDatabase[id];
  }

  res.redirect(`/urls`);
});

// READ long URL information and go to that site
app.get("/u/:id", (req, res) => {

  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return res.status(404).render('urls_error', { email: undefined, message: "Short URL not recognized." });
  }

  let visitorID = generateRandomString(4);

  if (req.session.visitor_id) {
    visitorID = req.session.visitor_id;
  } else {
    req.session.visitor_id = visitorID;
  }

  SmallURL.newVisit(urlDatabase[req.params.id], visitorID, Date.now());
  saveData(urlDatabase, "urlDatabase");

  res.redirect(longURL);
});

//USER REQUESTS
// READ registration form
app.get('/register', (req, res) => {

  const user = getUser(userDatabase, req.session.user_id);

  if (user) {
    return res.redirect('/urls');
  }

  res.render("urls_register", { email: undefined });
});

//CREATE a new user in the registry
app.post('/register', (req, res) => {
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).render('urls_error', { email: undefined, message: "The email and password fields cannot be blank." });
  }
  
  const existingUser = getUserByEmail(userDatabase, email);
  
  if (existingUser) {
    return res.status(400).render('urls_error', { email: undefined, message: "An account with that email address already exists." });
  }
  
  const userDigits = 5;
  const userID = generateRandomString(userDigits);
  while (Object.prototype.hasOwnProperty.call(userDatabase, userID)) {
    userID = generateRandomString(userDigits);
  }

  const encryptedPassword = bcrypt.hashSync(password);
  userDatabase[userID] = new User(userID, email, encryptedPassword);
  saveData(userDatabase, "userDatabase");
  
  req.session.user_id = userID;
  res.redirect(`/urls`);
});

// READ - DEFAULT PATH - If the user is signed in, it'll redirect to their urls, otherwise render the login form
app.get('/', (req, res) => {

  const user = getUser(userDatabase, req.session.user_id);

  if (user) {
    return res.redirect('/urls');
  }

  res.render("urls_login", { email: undefined });
});

// POST login in formation
app.post('/login', (req, res) => {

  const user = getUserByEmail(userDatabase, req.body.email);
  const pass = req.body.password;

  if (user && bcrypt.compareSync(pass, user.password)) {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }

  res.status(403).render('urls_error', { email: undefined, message: "Your email and/or password does not match our records." });
});

// POST Log Out - remove cookie information from client's computer
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// BROWSE **For testing purposes, not for deployment
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});