var Users = require('../app/models/user');

module.exports = {
    users : function(req, res, next) {
        Users.find({}, null, {sort: {'_id': 1}}, function(err, all_users){ // find all 'Profesores' sorted by id
            user_data = {
                'user_name': req.user.name,
                'user_role': req.user.role,
                'all_users' : all_users,
                'user_added' : req.query.added
            }
            
            res.render('users', user_data);
        });
    },
}