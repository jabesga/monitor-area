var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    school_name: String,
    school_classrooms : []
    }, {
        collection: 'schools'
    });

var Schools = mongoose.model('schools', schema);

module.exports = Schools;