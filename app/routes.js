var Users = require('../app/models/user');
var Schools = require('../app/models/school');

var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage });

module.exports = function(app, passport){

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()){
            return next();
        }
        else{
            req.session.returnTo = req.path; 
            res.redirect('/login');
        }
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

            Schools.find({}, function(err,school){
                var school_list = [];
                school.forEach(function(element){
                    school_list.push({'school_name': element['school_name'], 'school_classrooms': element['school_classrooms']});
                })

                res.render('c_classrooms', { 'school_list': school_list});
            });
        }
    });

    app.get('/import-classrooms', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores

        if(req.user.role == 'coordinator'){   
            res.render('c_import_classrooms');  
        }
        else{
            res.redirect('/');
        }
    });

    app.get('/import-monitors', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores

        if(req.user.role == 'coordinator'){   
            res.render('c_import_monitors');  
        }
        else{
            res.redirect('/');
        }
    });

    app.post('/import-monitors', upload.single('file'), function(req, res){
        var Parser = require('parse-xl');
        monitors = new Parser('./uploads/' + req.file['filename']);

        monitors['data']['Sheet1'].filter(function(monitor){ // Clases del colegio
            if(monitor['MoniEstado'] == 'A'){
                var monitor = new Users({
                    _id : monitor['IdMonitor'],
                    username: monitor['Email_Monitor'],
                    password: 123456, // TODO: Hashear contrasenia
                    name : monitor['MoniNomb'],
                    surname : monitor['MoniApe'],
                    email : monitor['Email_Monitor'],
                    role : 'monitor'
                });

                monitor.save(function(err, saved){
                    if(err){
                        throw err;
                        console.log(err);
                    }else{
                    }
                }); 
            } 
        });                         

        res.redirect('/monitors');        
    });

    app.post('/import-classrooms', upload.single('file'), function(req,res){
        var Parser = require('parse-xl');
        school = new Parser('./uploads/' + req.file['filename']);

        var d = new Date();
        var n = d.getFullYear();

        var SCHOOL_NAME = req.file['filename'].split(".")[0]; // Nombre colegio
        var CLASSROOM_LIST = [];
        school['data']['ListaClases'].filter(function(classroom){ // Clases del colegio
            var student_list = [];
            school['data']['Hoja1'].filter(function(student){ // Estudiantes de esa clase
                if (student['Grupo'] == classroom['Codigo']){
                    student_list.push({
                        'nombre': student['Nombre'],
                        'apellido1': student['Apellido 1'],
                        'apellido2': student['Apellido 2'],                        
                        'edad': n-parseInt(student['Año de Nacimiento'])
                    });
                }
            });

            classrooms = { // Crear la clase
                code_name: classroom['Codigo'],
                schedule : classroom['Horario'],
                monitors : [],
                students : student_list,
                technology_id : 0
            }
            CLASSROOM_LIST.push(classrooms);
        });

        var new_school = new Schools({
            school_name: SCHOOL_NAME,
            school_classrooms : CLASSROOM_LIST
        });

        //console.log(classroom);

        new_school.save(function(err, saved){
            if(err){
                throw err;
                console.log(err);
            }else{
                //console.log("Clase guardada con codigo: " + classroom['Codigo']);
            }
        });                          

        res.redirect('/classrooms');
    });

    app.get('/asignar', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        var code_name = 'esc1';
        var username = 'AlbertoX';
        if(req.user.role == 'coordinator'){
            Classrooms.findOne({'code_name': code_name}, function(err,classroom){ // {role:'monitor'}
                var monitor_list = classroom['monitors'];
                Users.findOne({'username': username}, function(err,user){
                    monitor_list.push(user._id);
                    Classrooms.update({'code_name': code_name}, { $set: {'monitors' : monitor_list }}, function(err, doc){
                        //console.log("Actualizado" + err + doc);
                    });
                });
            });
            res.redirect('/');
        }
        else{ // monitor
            res.redirect('/');
        }
    });

    var mail = require('../app/mailer');

    app.post('/add-monitor', isLoggedIn, function(req, res, next) { // TODO: restringir solo a coordinador
        if(req.user.role == 'coordinator'){
            Users.findOne({}, {}, { sort: { '_id' : -1 } }, function(err,user){
                var monitor = new Users({
                    _id : user._id+1,
                    username: (req.body['name'] + req.body['surname']).toLowerCase(),
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
                    /*
                    mail.sendMail(options, function(response){
                        if(response == 'sent'){
                            console.log("Mail sent: " + response)
                        }
                        else{
                            console.log("Error: " +response)
                        }
                        
                    })   */                 
                }
                monitor.save(function(err, saved){
                    if(err){
                        throw err;
                        console.log(err);
                    }else{
                        res.send({redirect: '/monitors'});
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