var express= require('express');
var app = express();
var port = process.env.PORT || '3000';
var logger = require('morgan');
app.use(logger('dev')); // log every request to the console

var flash = require('connect-flash');
var session   = require('express-session');
app.use(session({
    secret: 'secret cat',
    resave: true,
    saveUninitialized: true
}));
app.use(flash()); // require session

var favicon = require('serve-favicon'); // ¿?
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var path = require('path'); // to make path.join
app.set('view engine', 'jade'); // set up jade for templating
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// app.locals.pretty = true;

var mongoose = require('mongoose');
var configDB = require('./config/database.js')

mongoose.connect(configDB.url);

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // ¿?

require('./config/passport')(passport);
require('./app/routes')(app,passport);

app.listen(port);