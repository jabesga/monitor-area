
var LocalStrategy = require('passport-local').Strategy;

var UserDetails = require('../app/models/user');


module.exports = function(passport){
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    passport.use(new LocalStrategy(function(username, password, done) {
      process.nextTick(function() {
        UserDetails.findOne({
          'username': username.toLowerCase(), 
        }, function(err, user) {
          if (err) {
            return done(err);
          }

          if (!user) {
            return done(null, false, {message: "El usuario no existe"});
          }

          if (user.password != password) {
            return done(null, false, {message: "Contraseña incorrecta"});
          }

          return done(null, user);
        });
      });
    }));
}
    