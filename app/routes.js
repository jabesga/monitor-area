var Users = require('../app/models/user');
var Activities = require('../app/models/activity');
var Students = require('../app/models/student')

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

    var PAGE_TITLE = "Intranet | CampTecnologico";
    var TEACHER_TITLE = "Profesor";
    var coordinator_name = "coordinator";
    /*
        app.get('/previouspage', function(req, res, next){
            if(req.session.returnTo){
                res.redirect(req.session.returnTo);
                delete req.session.returnTo;
            }
            else{
                res.redirect('/')
            }
        });
    */

    // Login middleware
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()){ // if is authenticated
            return next(); // proceed
        }
        else{
            // req.session.returnTo = req.path; // save the last page to go back later
            res.redirect('/login');
        }
    }

    // Login page
    app.get('/login', function(req, res, next){
        res.render('login', {'title_page': PAGE_TITLE, message: req.flash('error') });
    });

    // Validate login
    app.post('/login', 
        passport.authenticate('local', { // passport module
            successRedirect: '/', // /previouspage',
            failureRedirect: '/login',
            failureFlash: true
        })
    );

    // Validate logout
    app.get('/logout', function(req, res, next){
        req.logOut();
        res.redirect('/');
    });
    
    // Home page
    app.get('/', isLoggedIn, function(req, res, next) { // check if it is logged
        Users.count({'role': TEACHER_TITLE}, function(err, teachers_count){
            Activities.count({}, function(err, activities_count){
                user_data = {
                    'title_page': PAGE_TITLE,
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'teachers_count': teachers_count,
                    'activities_count': activities_count
                }
                res.render('index', user_data); // pass the user role to identify if the user is a teacher or not
            });
        });
    });

    // Users
    app.get('/users', isLoggedIn, function(req, res, next) { // check if it is logged
        if(req.user.role == coordinator_name){
            Users.find({'role': 'Profesor'}, null, {sort: {'_id': 1}}, function(err, all_teachers){ // find all 'Profesores' sorted by id
                //@TODO
                user_data = {
                    'title_page': PAGE_TITLE,
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'user_added' : req.query.added,
                    'teachers_list' : all_teachers
                }

                res.render('users', user_data);
            });
        }
        else{
            res.redirect('/');
        }
    });

    // Add teachers
    app.post('/users', isLoggedIn, function(req, res, next) { // check if it is logged
        if(req.user.role == coordinator_name){ // check if has permissions

            var teacher = new Users({ // create new teacher with data from the form
                name: req.body['fullname'],
                password: req.body['password'], // @TODO: Hash password
                email : req.body['email'],
                role : 'Profesor'
            });

            teacher.save(function(err, saved){
                if(err){
                    throw err;
                    console.log(err);
                    res.redirect("/users?added=0"); // 0 = Error adding
                }
                else{
                    res.redirect("/users?added=1"); // 1 = Added successfully
                }
            });
        }
    });

    app.get('/import-activities', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores

        if(req.user.role == coordinator_name){
            Activities.find({}, null, {sort: {'_id': 1}}, function(err, all_activities){
                //@TODO
                user_data = {
                    'title_page': PAGE_TITLE,
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'user_added' : req.query.added,
                    'activities_list': all_activities
                }

                res.render('import-activities', user_data);  
            });
        }
        else{
            res.redirect('/');
        }
    });

    app.post('/import-activities', upload.single('file'), function(req, res){
        var Parser = require('parse-xl');
        spreadsheet = new Parser('./uploads/' + req.file['filename']);

        Activities.remove({}, function(err) {
            console.log('Activities collection removed');
            //@TODO

            activities_list = [];
            spreadsheet['data']['Sheet1'].filter(function(row){ // Clases del colegio
                if (Object.keys(row).length == 7){
                    var activity = new Activities({
                        type: row['Tipo'],
                        school: row['Colegio'],
                        code: row['Codigo'],
                        courses: row['Cursos'],
                        day: row['Dia'],
                        schedule: row['Hora'],
                        teachers: row['Monitores'].split(", ")
                    });

                    activities_list.push(activity);
                }
            });

            Activities.create(activities_list, function(err, inserted){
                if(err){
                    throw err;
                    console.log(err);
                }
                else{
                    res.redirect('/import-activities?added=' + activities_list.length);
                }
            });
        });
    });

    app.get('/import-students', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role == coordinator_name){
            Students.find({}, null, {sort: {'_id': 1}}, function(err, all_students){
                //@TODO
                user_data = {
                    'title_page': PAGE_TITLE,
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'user_added' : req.query.added,
                    'students_list': all_students
                }

                res.render('import-students', user_data);  
            });
        }
        else{
            res.redirect('/');
        }
    });

    app.post('/import-students', upload.single('file'), function(req, res){
        var Parser = require('parse-xl');
        spreadsheet = new Parser('./uploads/' + req.file['filename']);

        Students.remove({}, function(err) {
            console.log('\tStudents collection removed');
            //@TODO

            students_list = [];
            
            for(var j = 2; j < Object.keys(spreadsheet['data']).length; j++){
                for(var i = 0; i < spreadsheet['data'][Object.keys(spreadsheet['data'])[j]].length; i++){
                    var row = spreadsheet['data'][Object.keys(spreadsheet['data'])[j]][i];

                    if(row['Nombre'] == 'X' && row['Apellido1'] == 'X'){
                        break;
                    }
                    var student = new Students({
                        name: row['Nombre'],
                        surname1: row['Apellido1'],
                        surname2: row['Apellido2'],
                        group: row['Grupo'],
                        phone: row['Tfno'],
                    });

                    students_list.push(student); 
                }  
            }
            /*
            spreadsheet['data']['Escolapios'].filter(function(row){ // Clases del colegio
                if(row['Nombre'] == 'X' && row['Apellido1'] == 'X'){
                    break;
                }
                var student = new Students({
                    name: row['Nombre'],
                    surname1: row['Apellido1'],
                    surname2: row['Apellido2'],
                    group: row['Grupo'],
                    phone: row['Tfno'],
                });

                students_list.push(student);  
            });
            */

            Students.create(students_list, function(err, inserted){
                if(err){
                    throw err;
                    console.log(err);
                }
                else{
                    res.redirect('/import-students?added=' + students_list.length);
                }
            });
        });
    });

    //@TODO: Teachers field must be an array
    app.get('/my-schools', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role != coordinator_name){
            Activities.find({'teachers': req.user.name}, null, {sort: {'_id': 1}}, function(err, all_my_activities){
                console.log(all_my_activities);
                /*
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
                */
                user_data = {
                    'title_page': PAGE_TITLE,
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'my_activities': all_my_activities
                }
                res.render('my_schools', user_data);
            });
        }
      
    });

    app.get('/classroom', isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role != coordinator_name){
            Students.find({'group': req.query.code}, null, {sort: {'_id': 1}}, function(err, students_list){
                console.log(students_list);
                //@TODO
                user_data = {
                    'title_page': PAGE_TITLE,
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'group_code': req.query.code,
                    'students_list': students_list
                }

                res.render('classroom', user_data);  
            });
        }
        else{
            res.redirect('/');
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