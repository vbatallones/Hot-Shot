const express = require('express');
const router = express.Router();
const db = require('../models')
const passport = require('../config/ppConfig')

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

//get back some data 
router.post('/signup', (req, res) => {
  db.user.findOrCreate({
    where: { email: req.body.email},
    defaults: {
      name: req.body.name,
      password: req.body.password
    }
  })
  .then(([user, created]) => {
    if (created) {
      //if created, success and redirect to home
      console.log(`${user.name} was created`)
      passport.authenticate('local', {
        successRedirect: '/auth/login',
        // flash message for account
        successFlash: 'Account created and logging in'
      })(req, res);
      
      //res.redirect('/')
    } else {
      // email already exist
      console.log('Email already exist');
      // flash for email
      req.flash('error', 'Email already exist. Please try again.')
      res.redirect('/auth/signup')
    }
  })
  .catch(error => {
    console.log('Error', error);
    // flash for error
    req.flash('error', `ERROR, unfortunately... ${error}`);
    res.redirect('/auth/signup');
  })
});

// POST route for login with passort aunthenticate
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  // Success flash message to welcome back
  successFlash: 'Welcome back.',
  // failure flash for wrong email or password
  failureFlash: 'Either email or password is incorrect. Please try again.'
}))

// POST route for log out and will will redirect to the home page.
router.get('/logout', (req, res) => {
  req.logOut();
  //flash for logging out
  req.flash('success', 'See you soon. Logging out.')
  res.redirect('/');
});


module.exports = router;
