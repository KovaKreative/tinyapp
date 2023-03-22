const express = require('express');
const cookieParser = require('cookie-parser');

const { SmallURL, User, userDatabase, urlDatabase, getUser, getUserByEmail, fetchUserURLs } = require('./database');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function(digits) {
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

//POST

// CREATE NEW small URL
app.post('/urls', (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);
  if(!user){
    res.status(403).render('urls_error', { email: undefined, message: "You cannot generate a new tiny URL without an account. Please Log in or Register." });
    return;
  }
  const urlID = generateRandomString(6);
  console.log(urlID);
  while (Object.prototype.hasOwnProperty(urlID)) {
    urlID = generateRandomString(6);
  }
  urlDatabase[urlID] = new SmallURL(req.body.longURL, user.id);
  res.redirect(`/urls/${urlID}`);
});



// DELETE small URL
app.post('/urls/delete/:id', (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
  }
  res.redirect(`/urls`);
});

// EDIT long URL on an existing entry
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

//CREATE a new user in the registry
app.post('/register', (req, res) => {
  id = generateRandomString(4);
  const { email, password } = req.body;
  if(!email || !password) {
    res.status(400).render('urls_error', { email: undefined, message: "The email and password fields cannot be blank." });
    return;
  }
  existingUser = getUserByEmail(userDatabase, email);
  if(existingUser) {
    res.status(400).render('urls_error', { email: undefined, message: "An account with that email address already exists." });
    return;
  }
  userDatabase[id] = new User(id, email, password);
  res.cookie(`id`, id).redirect(`/urls`);
});

// EDIT login in formation with an existing used in the registry
app.post('/login', (req, res) => {
  console.log(req.body);
  const user = getUserByEmail(userDatabase, req.body.email);
  if(user && user.password === req.body.password){
    res.cookie(`id`, user.id).redirect(`/urls`);
    return;
  }
  res.status(403).render('urls_error', { email: undefined, message: "Your email and/or password does not match our records." });
});

// DELETE cookie information from client's computer
app.post('/logout', (req, res) => {
  res.clearCookie(`id`).redirect(`/login`);
});


//GET

// READ long URL information and go to that site
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).render('urls_error', { email: undefined, message: "Short URL not recognized." });
    return;
  }
  res.redirect(longURL);
});

// READ tinyApp and go to the main page
app.get('/', (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);
  if(user){
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

// READ registration form
app.get('/register', (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);
  if(user){
    res.redirect('/urls');
    return;
  }
  res.render("urls_register", { email: undefined });
});

// READ login form
app.get('/login', (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);

  if(user){
    res.redirect('/urls');
    return;
  }
  res.render("urls_login", { email: undefined });
});

// BROWSE**
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// BROWSE the list of URLs
app.get('/urls', (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);
  if(!user) {
    res.clearCookie(`id`).redirect("/login");
  }
  const userURLs = fetchUserURLs(user.id, urlDatabase);
  console.log(userURLs);
  const templateVars = {
    email: user ? user.email : undefined,
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

// READ new URL form
app.get("/urls/new", (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);
  if(!user){
    res.redirect('/login');
    return;
  }
  const templateVars = {
    email: user ? user.email : undefined,
  };
  res.render("urls_new", templateVars);
});

// READ individual entry for a tinyApp URL
app.get('/urls/:id', (req, res) => {
  const user = getUser(userDatabase, req.cookies['id']);
  const templateVars = {
    email: user ? user.email : undefined,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
