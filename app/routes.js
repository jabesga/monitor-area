var Activities = require('../app/models/activity');
var Students = require('../app/models/student')
var Users = require('../app/models/user');

// Password hashing
var passwordHash = require('password-hash');

// Mail settings
var nodemailer = require('nodemailer');
var settings = require('../temp/settings.js');
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: settings.gmail.user,
        pass: settings.gmail.password
    }
};
var transporter = nodemailer.createTransport(smtpConfig);


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

    var PAGE_TITLE = "Intranet | CampTecnologico";
    var TEACHER_TITLE = "Profesor";
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
    
    // TEMP: Generate admin
    /*
    app.get('/generate-admin', function(req, res, next) { // check if it is logged
    
        var hashedPassword = passwordHash.generate('admin');

        var teacher = new Users({ // create new teacher with data from the form
            name: 'admin',
            password: hashedPassword,
            email : 'admin@admin.com',
            role : coordinator_name
        });

        teacher.save(function(err, saved){
            if(err){
                throw err;
                console.log(err);
                res.redirect("/"); // 0 = Error adding
            }
            else{
                res.redirect("/"); // 1 = Added successfully
            }
        });
    });
    */

    // Home page
    app.get('/', isLoggedIn, function(req, res, next) { // check if it is logged
        //@TODO Dont pass unneed information
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
                res.render('index', user_data);
            });
        });
    });

    // Users
    app.get('/users', isLoggedIn, function(req, res, next) { // check if it is logged
        if(req.user.role == coordinator_name){ // check if it is a coordinator
            Users.find({}, null, {sort: {'_id': 1}}, function(err, all_teachers){ // find all 'Profesores' sorted by id
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
            var randomstring = Math.random().toString(36).slice(-8);
            console.log("\t\tLA PASSWORD ES: " + randomstring)
            var hashedPassword = passwordHash.generate(randomstring);
            var userMail = req.body['email'];
            //var hashedPassword = passwordHash.generate(req.body['password']);
            var userRole = req.body['role'];

            var teacher = new Users({ // create new teacher with data from the form
                name: req.body['fullname'],
                password: hashedPassword,
                email : userMail,
                role : userRole
            });

            teacher.save(function(err, saved){
                if(err){
                    throw err;
                    console.log(err);
                    res.redirect("/users?added=0"); // 0 = Error adding
                }
                else{
                    if(req.body['notify']){
                        var bodyMessage = '<div dir=\"ltr\">\r\n    <table width=\"600\" align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:12.8px\">\r\n        <tbody>\r\n            <tr>\r\n                <td align=\"right\">\r\n                    <table border=\"0\" cellspacing=\"10\" cellpadding=\"2\">\r\n                        <tbody>\r\n                            <tr>\r\n                                <td><a href=\"https:\/\/mailtrack.io\/trace\/link\/736262d206e04a5cd19e2e51052f697f56dff50a?url=https%3A%2F%2Fwww.facebook.com%2Fcamptecnologico%2F&amp;signature=3793935989ea3b38\" style=\"color:rgb(72,84,86)\" target=\"_blank\"><img width=\"24\" height=\"23\" alt=\"                                                                 \" src=\"https:\/\/ci6.googleusercontent.com\/proxy\/rE-gkyDoyvso5_EKX0qtcy5yfTgEE__HKVLaRlckfnFKSqwyxkycOWwof3BA3njNSospM-oPWlaVKQk0Rf2pXOUpzLaEp38YrsbS1elSDvCaUbHWcWw9SfEY5tKiZcASLnaPrbe3jct4mxdRMbllPJKo=s0-d-e1-ft#http:\/\/piktochart.com\/wp-content\/themes\/piktowebv4\/images\/email\/emailtemplatev4\/facebook.png\" style=\"display:inline\" class=\"CToWUd\"><\/a><\/td>\r\n                                <td><a href=\"https:\/\/mailtrack.io\/trace\/link\/be9d71ac6a0e7518989fc794759ce47232e79ae8?url=https%3A%2F%2Ftwitter.com%2FCampTecnologico&amp;signature=bdb1b2da6c0dbf76\" style=\"color:rgb(72,84,86)\" target=\"_blank\"><img width=\"24\" height=\"23\" alt=\"                                                                 \" src=\"https:\/\/ci5.googleusercontent.com\/proxy\/9VDTBloHokh3OUmaR3zUKMPXCcV8grcow9ASx-9wvL4DFeNHPKEhQRxawV6tFMo0K_qA2WGXN6n8sybwunvSOZZflMJT9DlesTKuwez4SCpezNp24o28PNRTNM_BeV5k0iSl92IUow2dC2kTJoU9Ya0=s0-d-e1-ft#http:\/\/piktochart.com\/wp-content\/themes\/piktowebv4\/images\/email\/emailtemplatev4\/twitter.png\" style=\"display:inline\" class=\"CToWUd\"><\/a><\/td>\r\n                                <td><a href=\"https:\/\/mailtrack.io\/trace\/link\/25d2b2b1beee94f3bfde04b4d2ccf90a52ed05a6?url=https%3A%2F%2Fwww.youtube.com%2Fuser%2FCampTecologico&amp;signature=53724b04220a0442\" style=\"color:rgb(72,84,86)\" target=\"_blank\"><img width=\"24\" height=\"23\" alt=\"                                                                 \" src=\"https:\/\/ci6.googleusercontent.com\/proxy\/0B0898yGscSBFW1tcLyMtBHR9hXGzahVwuE9v7wDOVVwK5uRdlYnTMMN3SPcNG6dsPuVm--_HWQ9KFvUB5SZVsyjBTXEcztQoanw8CgD_B0eH3tWaIt4J2v6dyRrMEYRXCF6ZKRZOzssrkM5wOaYn8c=s0-d-e1-ft#http:\/\/piktochart.com\/wp-content\/themes\/piktowebv4\/images\/email\/emailtemplatev4\/youtube.png\" style=\"display:inline\" class=\"CToWUd\"><\/a><\/td>\r\n                                <td><br><\/td>\r\n                                <td><br><\/td>\r\n                            <\/tr>\r\n                        <\/tbody>\r\n                    <\/table>\r\n                <\/td>\r\n            <\/tr>\r\n        <\/tbody>\r\n    <\/table>\r\n    <br style=\"font-size:12.8px\">\r\n    <table width=\"100%\" height=\"100%\" bgcolor=\"#f1f4f5\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:12.8px;background-color:rgb(241,244,245)\">\r\n        <tbody>\r\n            <tr>\r\n                <td align=\"center\" valign=\"top\" bgcolor=\"#f1f4f5\" style=\"background-image:initial;background-repeat:initial\">\r\n                    <table width=\"600\" bgcolor=\"#ffffff\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"border-bottom-color:rgb(224,224,224);border-bottom-style:solid;border-bottom-width:0px;color:rgb(67,67,67);font-family:Helvetica,Verdana,sans-serif\">\r\n                        <tbody>\r\n                            <tr>\r\n                                <td style=\"border-left-color:rgb(224,224,224);border-left-style:solid;border-left-width:0px\">\r\n                                    <img src=\"https:\/\/ci3.googleusercontent.com\/proxy\/W8dNy1Et2s6piGTt2avwlO_mzy4CJ5ZviqesXd-yoUCOg26uF5XKmausrNnO2HZlcE-bCE89rR5BMhXi99AsH6plCJ_2vV-Svg0TUY7woKKWjCEQPNAOjw=s0-d-e1-ft#http:\/\/camptecnologico.com\/wp-content\/uploads\/2015\/12\/cabecera.jpg\" class=\"CToWUd a6T\" tabindex=\"0\">\r\n                                    <div class=\"a6S\" dir=\"ltr\" style=\"opacity: 1; left: 562.5px; top: 253px;\">\r\n                                        <div id=\":10g\" class=\"T-I J-J5-Ji aQv T-I-ax7 L3 a5q\" role=\"button\" tabindex=\"0\" aria-label=\"Descargar el archivo adjunto \" data-tooltip-class=\"a1V\" data-tooltip=\"Descargar\">\r\n                                            <div class=\"aSK J-J5-Ji aYr\"><\/div>\r\n                                        <\/div>\r\n                                    <\/div>\r\n                                <\/td>\r\n                            <\/tr>\r\n                            <tr>\r\n                                <td bgcolor=\"#ffffff\" style=\"border-left-color:rgb(224,224,224);border-left-style:solid;border-left-width:0px;padding-left:50px;padding-right:50px;background-image:initial;background-repeat:initial\">\r\n                                    <br>\r\n                                    <h1 align=\"center\" style=\"color:rgb(72,84,86);font-size:28px;line-height:1.5;margin:0px 0px 15px;text-align:center!important\">Area de monitores Camptecnologico<\/h1>\r\n                                    <p align=\"left\" style=\"font-size:14px;line-height:1.5;margin:0px 0px 25px\"><span style=\"color:rgb(34,34,34);font-size:12.8px;line-height:normal\">\r\n                                    Buenos dias,<br><br>\r\n\r\n                                    Te hemos creado una cuenta en nuestra nueva area para monitores. Esta \u00E1rea te permite acceder a <b>documentaci\u00F3n \u00FAtil<\/b> en tu trabajo como profesor como: <b>listados de asistencia<\/b>, <b>documentaci\u00F3n sobre la tecnolog\u00EDa que est\u00E1s ense\u00F1ando<\/b>, <b>grupos que se te han asignado<\/b>, etc.<\/p>\r\n                                    <div style=\"font-size:12.8px\"><p>Tus datos de acceso son:<\/p>\r\n\r\n                                    <p align=\"center\"><b>Nombre de usuario: <\/b>' + userMail + '<\/p>\r\n                                    <p align=\"center\"><b>Contrase\u00F1a: <\/b>' + randomstring + '<\/p>\r\n\r\n                                    <p align=\"left\" style=\"font-size:14px;line-height:1.5;margin:0px 0px 25px\"><span style=\"color:rgb(34,34,34);font-size:12.8px;line-height:normal\">Actualmente esta nueva area se encuentra en constante desarrollo. Ten paciencia si algunas cosas no est\u00E1n a\u00FAn no funcionan correctamente. A\u00FAn as\u00ED no dudes en contactar si tienes alg\u00FAn problema o se te ocurre alguna forma de que mejoraremos (m\u00E1s documentaci\u00F3n, sistemas para pasar lista, etc).<br><\/p><\/div>\r\n                                    <div style=\"color:rgb(34,34,34);font-size:12.8px\"><br><\/div>\r\n\r\n                                    <br>\r\n                                    <div align=\"center\" style=\"text-align:center!important\"><a href=\"http:\/\/intranet.camptecnologico.com\" style=\"color:rgb(255,255,255);border-radius:4px;font-family:Helvetica,Arial;font-size:14px;padding:15px 25px;text-decoration:none;text-transform:uppercase;vertical-align:middle;background:rgb(100,100,255)\" target=\"_blank\">ACCEDER A LA INTRANET<\/a><\/div>\r\n\r\n                                    <p align=\"left\" style=\"font-size:14px;line-height:1.5;margin:0px 0px 25px\"><br><p>Un saludo ,<br><i>Camp Tecnol\u00F3gico<\/i><\/p>\r\n                                <\/td>\r\n                            <\/tr>\r\n                        <\/tbody>\r\n                    <\/table>\r\n                    <br>\r\n\r\n                    <table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n                        <tbody>\r\n                            <tr align=\"center\" valign=\"top\" style=\"font-size:12.8px\">\r\n                                <td bgcolor=\"#485456\" style=\"border-radius:3px;color:rgb(225,235,237);font-size:12px;padding:8px 0px;background:rgb(72,84,86)\">Si necesitas ayuda, envia un email a&nbsp;<a href=\"mailto:info@camptecnologico.com\" style=\"color:rgb(128,154,159);text-decoration:none\" target=\"_blank\">info@camptecnologico.<wbr>com<\/a> con el asunto [Soporte Intranet]<\/td>\r\n                            <\/tr>\r\n                            <tr style=\"font-size:12.8px\">\r\n                                <td>&nbsp;<\/td>\r\n                            <\/tr>\r\n                        <\/tbody>\r\n                    <\/table>\r\n                <\/td>\r\n            <\/tr>\r\n        <\/tbody>\r\n    <\/table>\r\n    <div class=\"yj6qo\"><\/div>\r\n    <div class=\"adL\"><br><br><br><\/div>\r\n<\/div>'

                        console.log("\tSending notification mail...");
                        var mailOptions = {
                            from: 'Info Camptecnologico <info@camptecnologico.com>',
                            to: userMail,
                            subject: 'Bienvenido a la Intranet de Camptecnologico',
                            text: 'Si estas viendo este mensaje. Utiliza un visualizar de correo electrónico que permita HTML',
                            html: bodyMessage
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                return console.log(error);
                            }
                            console.log('\tMessage sent: ' + info.response);
                        });
                    }
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
            spreadsheet['data']['MONITORES'].filter(function(row){ // Clases del colegio
                if (Object.keys(row).length >= 7){
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
        console.log(err.message, err);
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

