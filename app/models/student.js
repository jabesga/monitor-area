var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    surname1: String,
    surname2: String,
    group: String,
    phone: String,
    }, {
        collection: 'students'
    });

var Students = mongoose.model('students', schema);

module.exports = Students;