var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    group: String,
    timestamp: String,
    attending_students: [String]
    }, {
        collection: 'logs'
    });

var Logs = mongoose.model('logs', schema);

module.exports = Logs;