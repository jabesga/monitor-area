var Activities = require('../app/models/activity');
var Students = require('../app/models/student')
var Users = require('../app/models/user');
var Attendance = require('../app/models/activity');
var Logs = require('../app/models/log');

var moment = require('moment');
var auth = require('./auth');

// File upload system
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

    var coordinator_name = "Coordinador";

    /*
        app.get('/previouspage', function(req, res, next){
            if(req.session.returnTo){
                res.redirec(treq.session.returnTo);
                delete req.session.returnTo;
            }
            else{
                res.redirect('/')
            }
        });
    */
    app.get('/import-activities', auth.isLoggedInAndCoordinator, function(req, res, next) { // TODO: Cambiar a /monitores
            Activities.find({}, null, {sort: {'day': 1, 'schedule': 1}}, function(err, all_activities){
                //@TODO
                user_data = {
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'user_added' : req.query.added,
                    'activities_list': all_activities
                }

                res.render('import-activities', user_data);  
            });
    });

    app.post('/import-activities', upload.single('file'), function(req, res){
        var Parser = require('parse-xl');
        spreadsheet = new Parser('./uploads/' + req.file['filename']);

        Activities.remove({}, function(err) {
            console.log('Activities collection removed');
            //@TODO

            activities_list = [];
            spreadsheet['data']['MONITORES'].filter(function(row){ // Clases del colegio
                if (Object.keys(row).length >= 7){
                    var activity = new Activities({
                        type: row['Tipo'],
                        school: row['Colegio'],
                        code: row['Codigo'],
                        courses: row['Cursos'],
                        day: row['Dia'].replace('L',1).replace('M',2).replace('X',3).replace('J',4).replace('V',5).replace('S',6),
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

    app.get('/import-students', auth.isLoggedInAndCoordinator, function(req, res, next) { // TODO: Cambiar a /monitores
        Students.find({}, null, {sort: {'_id': 1}}, function(err, all_students){
            //@TODO
            user_data = {
                'user_name': req.user.name,
                'user_image': '/images/logo.png',
                'user_role': req.user.role,
                'user_added' : req.query.added,
                'students_list': all_students
            }

            res.render('import-students', user_data);  
        });
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

    app.post('/attendance', auth.isLoggedIn, function(req, res, next){
        console.log("\tMISSING: " + request.body.students_missing);
    });

    //@TODO: Teachers field must be an array
    app.get('/my-schools', auth.isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role != coordinator_name){
            Activities.find({'teachers': req.user.name}, null, {sort: {'day': 1, 'schedule': 1}}, function(err, all_my_activities){
                console.log(all_my_activities);
                user_data = {
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'my_activities': all_my_activities
                }
                res.render('my_schools', user_data);
            });
        }
      
    });

    app.get('/my-clubs', auth.isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role != coordinator_name){
            Activities.find({'teachers': req.user.name}, null, {sort: {'day': 1, 'schedule': 1}}, function(err, all_my_activities){
                console.log(all_my_activities);
                user_data = {
                    'user_name': req.user.name,
                    'user_image': '/images/logo.png',
                    'user_role': req.user.role,
                    'my_activities': all_my_activities
                }
                res.render('my_clubs', user_data);
            });
        }
      
    });

    app.get('/classroom', auth.isLoggedIn, function(req, res, next) { // TODO: Cambiar a /monitores
        if(req.user.role != coordinator_name){
            Students.find({'group': req.query.code}, null, {sort: {'_id': 1}}, function(err, students_list){
                console.log(students_list);
                //@TODO
                user_data = {
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

    app.post('/register-attendance', auth.isLoggedIn, function(req, res, next) {
        var list = [];
        list = list.concat(req.body['list[]']); // if only one element is an string

        var group = req.body['group'];
        var date = moment().format('MMMM Do YYYY, h:mm:ss a');

        logs_list = [];
        list.forEach(function(element, index, array){
            var log = new Logs({
                'student': element,
                'group': group,
                'timestamp': date
            })
            logs_list.push(log);
        });        

        Logs.create(logs_list, function(err, inserted){
            if(err){
                throw err;
                console.log(err);
            }
            else{
                console.log('\tLogs registrados');
            }
        });
        res.send({'success': true});       
    });

}

