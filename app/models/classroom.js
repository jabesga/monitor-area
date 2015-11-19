var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    code_name : String,
    school_name: String,
    schedule: String,
    monitors : [Number],
    students : [],
    technology_id : Number
    }, {
        collection: 'classrooms'
    });

var Classrooms = mongoose.model('classrooms', schema);

module.exports = Classrooms;