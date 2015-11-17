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

    app.get('/dashboard', isLoggedIn, function(req, res, next) {
        if(req.user.role == 'coordinator'){
            res.render('dashboard', { title: 'Coordinator Area'  });
        }
        else{ // monitor
            res.render('dashboard', { title: 'Monitor Area'  });
        }
      
    });

    app.get('/loginFailure', function(req, res, next) {
      res.send('Failed to authenticate');
    });

    app.get('/loginSuccess', function(req, res, next) {
      res.send('Successfully authenticated');
    });

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