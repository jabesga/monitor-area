var Users = require('./models/user');

module.exports = {
    index : function(req, res, next){
        Users.findOne({'name': req.user.name}, function(err, user){
            index_data = {
                'user_name': user.name,
                'user_role': user.role,
                'user_messages': 0,
                'user_notifications': 0,
                'using_gen_password' : user.using_gen_password
            }
            res.render('index', index_data);        
        });

    },
    change_password : function(req, res, next){
        index_data = {
            'user_name': req.user.name,
            'user_role': req.user.role,
            'user_messages': 0,
            'user_notifications': 0,
        }

        res.render('change_password', index_data);
    },

    update_extranet : function(req, res, next){
	var data = req.body;
	if(data['secret_key'] == 'albertosurfea'){
		var list = JSON.parse(data['data']);
		var fs = require('fs');
		var stream = fs.createWriteStream("./my_file.txt");
		stream.once('open', function(fd) {
			stream.write(list[0]);
		});
	}
        res.send('Data received');
    },

    error_development : function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send(err.stack);
    },

    error_production : function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    },

    not_found : function(req, res, next) {
        res.status(404).render('error');
        res.status(404).send('Sorry cant find that!');
    }
}
