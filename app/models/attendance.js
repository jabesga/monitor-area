var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    student_id: ObjectId,
    date : String
    }, {
        collection: 'attendance'
    });

var Attendance = mongoose.model('attendance', schema);

module.exports = Attendance;