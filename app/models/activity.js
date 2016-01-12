var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    type: String,
    school: String,
    code: String,
    courses: String,
    day: String,
    schedule: String,
    teachers: [String]
    }, {
        collection: 'activities'
    });

var Activities = mongoose.model('activities', schema);

module.exports = Activities;