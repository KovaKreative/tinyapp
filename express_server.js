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

const generateRandomString = function() {
  let output = '';

  const numbers = [48, 57];
  const letters = [65, 90];

  while (output.length < 6) {
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


// CREATE
app.post('/urls', (req, res) => {
  const key = generateRandomString();
  while (Object.prototype.hasOwnProperty(key)) {
    key = generateRandomString();
  }
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

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

// EDIT
app.post('/login', (req, res) => {
  const userName = req.body.userName;
  res.cookie(`username`, userName).redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  res.clearCookie(`username`).redirect(`/urls`);
});

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

// BROWSE
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// BROWSE
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// READ
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  };
  res.render("urls_new", templateVars);
});

// READ
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
