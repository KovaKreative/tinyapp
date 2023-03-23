const express = require('express');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');

const { SmallURL, User, userDatabase, urlDatabase } = require('./database');
const { getUser, getUserByEmail, fetchUserURLs, generateRandomString, checkIfHasProtocol } = require('./functions');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['lazyEgg'], maxAge: 24 * 60 * 60 * 1000 }));
app.use(methodOverride('_method'));


// READ HOME DIRECTORY - No specific request will default to list of urls if signed in, or login page if not
app.get('/', (req, res) => {
  const user = getUser(userDatabase, req.session.user_id);
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

//URL REQUESTS

// BROWSE the list of URLs
app.get('/urls', (req, res) => {
  const user = getUser(userDatabase, req.session.user_id);
  if (!user) {
    req.session = null;
    return res.redirect("/login");
  }
  const userURLs = fetchUserURLs(urlDatabase, user.id);
  const templateVars = {
    email: user ? user.email : undefined,
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

// READ new URL form
app.get("/urls/new", (req, res) => {
  const user = getUser(userDatabase, req.session.user_id);
  if (!user) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    email: user ? user.email : undefined,
  };
  res.render("urls_new", templateVars);
});

// CREATE NEW small URL
app.post('/urls', (req, res) => {
  const user = getUser(userDatabase, req.session.user_id);
  const longURL = req.body.longURL;
  if (!checkIfHasProtocol(longURL)){
    return res.status(400).render('urls_error', { email: user.email, message: "Please make sure to include the full URL (e.g. http://..., https://..., etc)" });
  }
  if (!user) {
    return res.status(403).render('urls_error', { email: undefined, message: "You cannot generate a new tiny URL without an account. Please Log in or Register." });
  }
  const urlID = generateRandomString(6);
  while (Object.prototype.hasOwnProperty(urlID)) {
    urlID = generateRandomString(6);
  }
  urlDatabase[urlID] = new SmallURL(req.body.longURL, user.id);
  res.redirect(`/urls/${urlID}`);
});

// READ individual entry for a tinyApp URL for Editing
app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const user = getUser(userDatabase, userID);
  if (!user) {
    return res.status(400).render('urls_error', { email: undefined, message: "You are not signed in." });
  }

  const shortLinkItem = urlDatabase[req.params.id];

  if (!shortLinkItem) {
    return res.status(404).render('urls_error', { email: user.email, message: "Short link not found." });
  }

  if (shortLinkItem.userID !== userID) {
    return res.status(403).render('urls_error', { email: user.email, message: "You do not have permission to edit this short link." });
  }

  const templateVars = {
    email: user ? user.email : undefined,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    count: urlDatabase[req.params.id].numOfVisits
  };
  res.render("urls_show", templateVars);
});

// EDIT long URL on an existing entry
app.put('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect(`/urls/${id}`);
});

// DELETE small URL
app.delete('/urls/delete/:id', (req, res) => {
  const userID = req.session.user_id;
  const user = getUser(userDatabase, userID);
  if (!user) {
    return res.status(400).render('urls_error', { email: undefined, message: "You are not signed in." });
  }

  const shortLinkItem = urlDatabase[req.params.id];

  if (!shortLinkItem) {
    return res.status(404).render('urls_error', { email: user.email, message: "Short link not found." });
  }

  if (shortLinkItem.userID !== userID) {
    return res.status(403).render('urls_error', { email: user.email, message: "You do not have permission to delete this short link." });
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
  console.log(longURL);
  urlDatabase[req.params.id].newVisit();
  res.redirect(longURL);
});



//USER REQUESTS
// READ registration form
app.get('/register', (req, res) => {
  const user = getUser(userDatabase, req.session.user_id);
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_register", { email: undefined });
});

//CREATE a new user in the registry
app.post('/register', (req, res) => {
  id = generateRandomString(4);
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).render('urls_error', { email: undefined, message: "The email and password fields cannot be blank." });
    return;
  }
  existingUser = getUserByEmail(userDatabase, email);
  if (existingUser) {
    res.status(400).render('urls_error', { email: undefined, message: "An account with that email address already exists." });
    return;
  }
  const encryptedPassword = bcrypt.hashSync(password);
  userDatabase[id] = new User(id, email, encryptedPassword);
  req.session.user_id = id;
  res.redirect(`/urls`);
});

// READ login form
app.get('/login', (req, res) => {
  const user = getUser(userDatabase, req.session.user_id);

  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_login", { email: undefined });
});

// POST login in formation
app.post('/login', (req, res) => {
  const user = getUserByEmail(userDatabase, req.body.email);
  const pass = req.body.password;

  if (user && bcrypt.compareSync(pass, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
    return;
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
