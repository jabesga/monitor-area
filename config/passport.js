
var LocalStrategy = require('passport-local').Strategy;

var Users = require('../app/models/user');


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
          'email': username.toLowerCase(), 
        }, function(err, user) {
          if (err) {

            return done(err);
          }

          if (!user) {
            return done(null, false, {message: "Credenciales incorrectas"});
          }

          if (user.password != password) {
            return done(null, false, {message: "Credenciales incorrectas"});
          }

          return done(null, user);
        });
      });
    }));
}
    