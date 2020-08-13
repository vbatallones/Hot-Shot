const passport = require('passport')
const localStragegy = require('passport-local').Strategy
const db = require('../models')


// Passport is going to "serialized" your info make it easier to login
// convert the user based on the id
passport.serializeUser((user, cb) => {
    cb(null, user.id)
})
//passport "deserialized" is going to take the id and look that up in the data base
passport.deserializeUser((id, cb) => {
    cb(null, id)
    .catch(cb());
})

passport.use(new localStragegy({
    usernameField: 'email',
    passwordField: 'password'
},(email, password, cb) => {
    db.user.findOne({
        where: {email}
    })
    .then(user => {
        if (!user || user.validPassword(password)) {
            cb(null, false);
        } else {
            cb(null, user);
        }
    })
    .catch(cb());
}));