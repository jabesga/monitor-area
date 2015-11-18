var Users = require('../app/models/user');

module.exports = function(app, passport){

    app.get('/', function(req, res, next) {
        res.render('index', { title: 'Monitor Area', message: req.flash('error') });
    });

    app.post('/login', 
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/',
            failureFlash: true
        })
    );

    app.get('/logout', function(req, res, next){
        req.logOut();
        res.redirect('/');
    });

    app.get('/dashboard', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores

        if(req.user.role == 'coordinator'){
            Users.find({}, function(err,users){ // {role:'monitor'}
                var user_list = [];
                users.forEach(function(user){
                    user_list.push([{'_id': user._id, 'username': user.username, 'name': user.name, 'surname': user.surname, 'email': user.email}]);
                });
                
                res.render('coordinator_dashboard', { title: 'Panel de coordinador', 'monitors': user_list });
            });
        }
        else{ // monitor
            res.render('monitor_dashboard', { title: 'Monitor Dashboard'  });
        }
      
    });

    app.post('/add-monitor', isLoggedIn, function(req, res, next) { // TODO: restringir solo a coordinador
        if(req.user.role == 'coordinator'){
            Users.count({}, function(err,count){
                var monitor = new Users({
                    _id : count+1,
                    username: 'test3',
                    password: 'test3',
                    name : 'Sr.Test',
                    surname : 'Walter',
                    email : 'test3@test3.com',
                    role : 'monitor'
                });
                monitor.save(function(err, saved){
                    if(err){
                        throw err;
                        console.log(err);
                    }else{
                        res.send({redirect: '/dashboard'});
                    }
                });
            });
        }
    });
    
    function getAllUsers(err, users){
        console.log(users);
    }


    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    // error handlers
    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });   
    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
}