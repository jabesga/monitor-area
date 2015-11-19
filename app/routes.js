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

    app.get('/excel', function(req, res, next) {
        var Parser = require('parse-xl'),
        sample = new Parser('./temp/test.xlsx');
 
        var classroom_name = console.log(Object.keys(sample['data']));
        // get values in a column 
        //console.log(sample.values('Hoja1', 'Nombre'));
        /*
          '\nValues in column `XYZ` of `Transcript`:', 
          sample.values('Transcript', 'XYZ'), 
          '\n'
        );*/
 
        // stream parsed records as line-delimited JSON 
        //sample.recordStream('Transcript').pipe(process.stdout);
        res.send(sample['data']);
    });

    var mail = require('../app/mailer');

    app.post('/add-monitor', isLoggedIn, function(req, res, next) { // TODO: restringir solo a coordinador
        if(req.user.role == 'coordinator'){
            Users.findOne({}, {}, { sort: { '_id' : -1 } }, function(err,user){
                var monitor = new Users({
                    _id : user._id+1,
                    username: req.body['name'] + req.body['surname'],
                    password: 123456, // TODO: Hashear contrasenia
                    name : req.body['name'],
                    surname : req.body['surname'],
                    email : req.body['email'],
                    role : 'monitor'
                });
                
                if(req.body['notify'] == 'true'){
                    options = {
                        'to': req.body['email'],
                        'text': 'Su nombre de usuario es ' + req.body['name'] + req.body['surname'] + ' y su contraseña es 123456',
                        'html': 'Su nombre de usuario es ' + req.body['name'] + req.body['surname'] + ' y su contraseña es 123456'
                    }
                    mail.sendMail(options, function(response){
                        if(response == 'sent'){
                            console.log("Mail sent: " + response)
                        }
                        else{
                            console.log("Error: " +response)
                        }
                        
                    })                    
                }
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

    app.post('/remove-monitor', isLoggedIn, function(req, res, next) { // TODO: restringir solo a coordinador
        if(req.user.role == 'coordinator'){
            Users.findOneAndRemove({_id: req.body['data']}, function(err, doc, result){
                if(err){
                    throw err;
                    console.log(err);
                }else{
                    res.send({redirect: '/dashboard'});
                }
            });
        }
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