const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purplemonkeydinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasherfunk"
  },
}

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

// CREATE
app.post('/urls', (req, res) => {
  const key = generateRandomString();
  while (Object.prototype.hasOwnProperty(key)) {
    key = generateRandomString(6);
  }
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

const getUser = function(id) {
  return users[id];
}

const getUserByEmail = function(email) {
  for(const id in users) {
    if(users[id]['email'] === email) {
      return users[id];
    }
  }
  return undefined;
}

// DELETE
app.post('/urls/delete/:id', (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
  }
  res.redirect(`/urls`);
});

// EDIT
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

//CREATE - REGISTER
app.post('/register', (req, res) => {
  id = generateRandomString(4);
  const { email, password } = req.body;
  users[id] = { id, email, password };
  res.cookie(`id`, id).redirect(`/urls`);
});

// EDIT - LOGIN
app.post('/login', (req, res) => {
  console.log(req.body);
  const user = getUserByEmail(req.body.email);
  if(user && user.password === req.body.password){
    res.cookie(`id`, user.id).redirect(`/urls`);
    res.redirect('/urls'); // TO DO: Change to invalid login
    return;
  }
  res.redirect('/register'); // TO DO: Change to invalid login
});

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie(`id`).redirect(`/urls`);
});


//GET

// REDIRECT - GO TO SITE
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("Tiny URL not found. Sorry, pal.");
    return;
  }
  res.redirect(longURL);
});

// READ
app.get('/', (req, res) => {
  console.log("Cookies: ", req.cookies);
  console.log("Cookies: ", req.signedCookies);
});

app.get('/register', (req, res) => {
  res.render("urls_register", { email: undefined });
});

// BROWSE
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});



// BROWSE
app.get('/urls', (req, res) => {
  const user = getUser(req.cookies['id']);
  console.log(users);
  const templateVars = {
    email: user ? user.email : undefined,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// READ
app.get("/urls/new", (req, res) => {
  const user = getUser(req.cookies['id']);
  const templateVars = {
    email: user ? user.email : undefined,
  };
  res.render("urls_new", templateVars);
});

// READ
app.get('/urls/:id', (req, res) => {
  const user = getUser(req.cookies['id']);
  const templateVars = {
    email: user ? user.email : undefined,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
