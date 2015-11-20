var express = require('express');
var app = express();
var port = process.env.PORT || '3000';
var logger = require('morgan');
var flash = require('connect-flash');
var session   = require('express-session');
var favicon = require('serve-favicon'); // ¿?
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path'); // to make path.join
var mongoose = require('mongoose');
var configDB = require('./config/database.js')
var passport = require('passport');


mongoose.connect(configDB.url);

app.use(logger('dev')); // log every request to the console
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.text())
app.use(bodyParser.urlencoded({ extended: false })); // ¿?
app.use(session({
    secret: 'secret cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // after use session
app.use(flash()); // require session
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'jade'); // set up jade for templating
app.set('views', path.join(__dirname, 'views'));

// app.locals.pretty = true;

require('./config/passport')(passport);
require('./app/routes')(app,passport);

app.listen(port);
console.log('\tListening on port ' + port);