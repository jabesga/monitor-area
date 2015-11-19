var Users = require('../app/models/user');
var Classrooms = require('../app/models/classroom');

module.exports = function(app, passport){

    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()){
            return next();
        }
        else{
            req.session.returnTo = req.path; 
            res.redirect('/login');
        }
        // if they aren't redirect them to the home page
    }

    app.get('/previouspage', function(req, res, next){
        if(req.session.returnTo){
            res.redirect(req.session.returnTo);
            delete req.session.returnTo;
        }
        else{
            res.redirect('/')
        }
    });

    app.get('/login', function(req, res, next){
        res.render('login', { title: 'Monitor Area', message: req.flash('error') });
    });

    app.post('/login', 
        passport.authenticate('local', {
            successRedirect: '/previouspage',
            failureRedirect: '/login',
            failureFlash: true
        })
    );

    app.get('/logout', function(req, res, next){
        req.logOut();
        res.redirect('/');
    });

    app.get('/', isLoggedIn, function(req, res, next) {
        if(req.user.role == 'coordinator'){
            res.render('c_dashboard');
        }
        else{
            res.render('m_dashboard');   
        }
    });

    app.get('/monitors', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role == 'coordinator'){
            Users.find({}, function(err,users){ // {role:'monitor'}
                var user_list = [];
                users.forEach(function(user){
                    user_list.push({'_id': user._id, 'username': user.username, 'name': user.name, 'surname': user.surname, 'email': user.email});
                });
                
                res.render('c_monitors', { title: 'Panel de coordinador', 'monitors': user_list });
            });
        }
      
    });

    app.get('/classrooms', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores

        if(req.user.role == 'coordinator'){
            
            Classrooms.find({}, function(err,classroom){ // {role:'monitor'}
                var classrooms_list = [];
                classroom.forEach(function(element){
                    classrooms_list.push({'code_name': element['code_name'], 'students': element['students']});
                })
                //console.log(classrooms_list)      
                res.render('classrooms', { title: 'Panel de coordinador', 'classrooms_list': classrooms_list});
            });   
            
        }
        else{ // monitor
            res.redirect('/');
        }
    });

    app.get('/excel', function(req, res, next) {
        var Parser = require('parse-xl'),
        school = new Parser('./temp/Escolapios2.xlsx');

        var classrooms_codes = [];
        // TODO: Se simplifica con una hoja para cada clase
        school['data']['ListaClases'].filter(function(element){
            classrooms_codes.push(element['CODIGO']);
        });


        classrooms_codes.forEach(function(code,index){
            classroom_list_by_code = [];
            school['data']['Hoja1'].filter(function(element){
                if (element['Grupo'] == code){
                    classroom_list_by_code.push({
                        'nombre': element['Nombre'],
                        'apellido': element['Apellido 1']
                    });
                }
            });

            //console.log(classroom);
            var classroom = new Classrooms({
                code_name: code,
                school_name: '',
                schedule : '',
                monitors : [],
                students : classroom_list_by_code,
                technology_id : 0
            });

            classroom.save(function(err, saved){
                if(err){
                    throw err;
                    console.log(err);
                }else{
                    console.log("Clase guardada con codigo: " + code);
                }
            });          
        });
        res.redirect('/classrooms');
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
}