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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.text({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false })); // ¿?
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

app.set('env', 'development')
// app.locals.pretty = true;

var auth = require('./app/auth');
var site = require('./app/site');
var coordinator = require('./app/coordinator');


// Routes
app.get('/', auth.isLoggedIn, site.index);
app.post('/update-extranet', site.update_extranet);

app.route('/login').get(auth.login).post(passport.authenticate('local', auth.redirection_options));
//app.post('/recover-password', auth.recover_password);
app.get('/logout', auth.isLoggedIn, auth.logout);

app.get('/users', auth.isLoggedInAndCoordinator, coordinator.users);
app.post('/users', auth.isLoggedInAndCoordinator, auth.register_user);
app.post('/register-user', auth.isLoggedInAndCoordinator, auth.register_user);
app.route('/change-password').get(auth.isLoggedIn, site.change_password).post(auth.isLoggedIn, auth.change_password);

require('./config/passport')(passport);
require('./app/routes')(app,passport);


if (app.get('env') === 'development') {
    app.get('/generate-admin', auth.generate_admin);
    app.use(site.error_development);
}
else{
    app.use(site.error_production); // 500 Page
}

app.use(site.not_found); // 404 Page

// Initialize server
if (!module.parent) {
    app.listen(port);
    console.log('\tListening on port ' + port);
}

