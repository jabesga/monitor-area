
var LocalStrategy = require('passport-local').Strategy;

var Users = require('../app/models/user');

var passwordHash = require('password-hash');

module.exports = function(passport){
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    passport.use(new LocalStrategy(function(username, password, done) {
      process.nextTick(function() {
        Users.findOne({
          'email': username.toLowerCase().trim(), 
        }, function(err, user) {
          if (err) {

            return done(err);
          }

          if (!user) {
            return done(null, false, {message: "Credenciales incorrectas"});
          }

          if (passwordHash.verify(password, user.password) === false) {
            return done(null, false, {message: "Credenciales incorrectas"});
          }

          return done(null, user);
        });
      });
    }));
}
    