var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    student: String,
    group: String,
    timestamp: String
    }, {
        collection: 'logs'
    });

var Logs = mongoose.model('logs', schema);

module.exports = Logs;