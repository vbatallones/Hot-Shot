require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const SECRET_SESSION = process.env.SECRET_SESSION;
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
//require the authorization middleware at the top of the page
const isLoggedIn = require('./middleware/isLoggedIn');
const { response } = require('express');
const db = require('./models')
// axios
const axios = require('axios')
const API_KEY = process.env.API_KEY
// MIDDLEWARE
app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

// secret: what we actually giving back to the user to use our site. actual user
// resave: save the session even if it's modified, make this false
// saveUninitialized: if a new session and has not been save. we'll save it, therefore setting this to true.
app.use(session({
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}));
// initialize passport and run session as middleware
app.use(passport.initialize());
app.use(passport.session());
//flash for temporary messages to the user. put your flash below your passports
app.use(flash());

// middleware to have our message accesible for every view
app.use((req, res, next ) => {
  // before every route, we will attached our content user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  // method 
  next();
});


app.get('/', (req, res) => {
  res.render('index', { alerts: res.locals.alerts });
});

// app.get('/profile', isLoggedIn, (req, res) => {
//   res.render('profile');
// });
//middleware for my auth
app.use('/auth', require('./routes/auth'));
// middleware for my nba 
app.use('/nba', require('./routes/nba'));
app.use('/profile', require('./routes/profile'));



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});
module.exports = server;
