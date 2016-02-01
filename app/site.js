module.exports = {
    index : function(req, res, next){

        index_data = {
            'user_name': req.user.name,
            'user_role': req.user.role,
            'user_messages': 0,
            'user_notifications': 0,
        }

        res.render('index', index_data);
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
        res.status(404).send('Sorry cant find that!');
    }
}
