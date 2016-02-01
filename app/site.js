module.exports = {
    index : function(req, res){
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
    }
}

