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
            Users.find({'role': 'monitor'}, null, {sort: {'_id': 1}}, function(err,all_users){
                var list = [];
                all_users.forEach(function(user){
                    list.push({
                        '_id': user._id,
                        'username': user.username,
                        'name': user.name,
                        'surname': user.surname,
                        'email': user.email
                    });
                });
                //console.log(list);
                res.render('c_monitors', { 'list_of_monitors': list });
            });
        }
      
    });

    app.get('/classrooms', isLoggedIn, function(req, res, next) {

        if(req.user.role == 'coordinator'){

            Schools.find({}, function(err,all_schools){
                var list = [];
                all_schools.forEach(function(school){
                    list.push({
                        'school_name': school['school_name'],
                        'target': school['school_name'].replace(/\s+/g,""),
                        'school_classrooms': school['school_classrooms']
                    });
                })

                res.render('c_classrooms', { 'list_of_schools': list});
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
        spreadsheet_of_monitors = new Parser('./uploads/' + req.file['filename']);

        spreadsheet_of_monitors['data']['Sheet1'].filter(function(monitor){ // Clases del colegio
            //if(monitor['MoniEstado'] == 'A'){
                console.log(monitor['IdMonitor']);
                var new_monitor = new Users({
                    _id : monitor['IdMonitor'],
                    username: monitor['Email_Monitor'],
                    password: 123456, // TODO: Hashear contrasenia
                    name : monitor['MoniNomb'],
                    surname : monitor['MoniApe'],
                    email : monitor['Email_Monitor'],
                    role : 'monitor'
                });

                new_monitor.save(function(err, saved){
                    if(err){
                        throw err;
                        console.log(err);
                    }
                }); 
            //} 
        });                         

        res.redirect('/monitors');        
    });
    
    app.post('/import-classrooms', upload.single('file'), function(req,res){
        var Parser = require('parse-xl');
        spreadsheet_of_school = new Parser('./uploads/' + req.file['filename']);

        var d = new Date();
        var n = d.getFullYear();

        all_schools = [];
        for (var i = 0; i < spreadsheet_of_school['data']['Sheet1'].length; i++) {
            var row = spreadsheet_of_school['data']['Sheet1'][i];
            if(all_schools.indexOf(row['Colegio']) == -1){
                all_schools.push(row['Colegio']);
            }  
        }

        all_schools.filter(function(name){
            var new_school = new Schools({
                school_name: name,
                school_classrooms : []
            });
            new_school.save(function(err, saved){
                if(err){
                    throw err;
                    console.log(err);
                }
            });
        });

        all_schools.filter(function(name){
            Schools.findOne({'school_name': name}, function(err,school){
                all_groups = []
                for (var i = 0; i < spreadsheet_of_school['data']['Sheet1'].length; i++) {
                    var row = spreadsheet_of_school['data']['Sheet1'][i];
                    if(row['Colegio'] == name){
                        var new_group = {
                            code_name: row['Codigo'],
                            day : row['Dia'],
                            hour : row['Hora'],
                            monitors : row['Monitores'],
                            students : [], // Student_list TODO
                            //technology_id : 0
                        }
                        all_groups.push(new_group);  
                    }
                    
                }
                
                /*if(row['Monitores'] != undefined){
                    new_group['monitors'] = row['Monitores'];
                }*/
                
                Schools.update({'school_name': name}, { $set: {'school_classrooms' : all_groups }}, function(err, doc){
                    //console.log("Añadido grupo" + err + doc);
                });
            });
        });    

        // spreadsheet_of_school['data']['ListaClases'].filter(function(group){ // Clases del colegio
        //     var student_list = [];

        //     spreadsheet_of_school['data']['Hoja1'].filter(function(student){ // Estudiantes de esa clase
        //         if (student['Grupo'] == group['Codigo']){
        //             student_list.push({
        //                 'nombre': student['Nombre'],
        //                 'apellido1': student['Apellido 1'],
        //                 'apellido2': student['Apellido 2'],                        
        //                 'edad': n-parseInt(student['Año de Nacimiento'])
        //             });
        //         }
        //     });

        //     var new_group = {
        //         code_name: group['Codigo'],
        //         schedule : group['Horario'],
        //         monitors : [],
        //         students : student_list,
        //         technology_id : 0
        //     }

        //     GROUPS_LIST.push(new_group);
        // });

        // var new_school = new Schools({
        //     school_name: SCHOOL_NAME,
        //     school_classrooms : GROUPS_LIST
        // });


        // new_school.save(function(err, saved){
        //     if(err){
        //         throw err;
        //         console.log(err);
        //     }
        // });                          

        res.redirect('/classrooms');
    });
    /*
    app.post('/import-classrooms', upload.single('file'), function(req,res){
        var Parser = require('parse-xl');
        spreadsheet_of_school = new Parser('./uploads/' + req.file['filename']);

        var d = new Date();
        var n = d.getFullYear();

        var SCHOOL_NAME = req.file['filename'].split(".")[0]; // Nombre colegio
        var GROUPS_LIST = [];

        spreadsheet_of_school['data']['ListaClases'].filter(function(group){ // Clases del colegio
            var student_list = [];

            spreadsheet_of_school['data']['Hoja1'].filter(function(student){ // Estudiantes de esa clase
                if (student['Grupo'] == group['Codigo']){
                    student_list.push({
                        'nombre': student['Nombre'],
                        'apellido1': student['Apellido 1'],
                        'apellido2': student['Apellido 2'],                        
                        'edad': n-parseInt(student['Año de Nacimiento'])
                    });
                }
            });

            var new_group = {
                code_name: group['Codigo'],
                schedule : group['Horario'],
                monitors : [],
                students : student_list,
                technology_id : 0
            }

            GROUPS_LIST.push(new_group);
        });

        var new_school = new Schools({
            school_name: SCHOOL_NAME,
            school_classrooms : GROUPS_LIST
        });


        new_school.save(function(err, saved){
            if(err){
                throw err;
                console.log(err);
            }
        });                          

        res.redirect('/classrooms');
    });*/
    /*
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
    */
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