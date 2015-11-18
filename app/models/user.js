var mongoose = require('mongoose');


var schema = new mongoose.Schema({
    _id : Number,
    username: String,
    password: String,
    name : String,
    surname : String,
    email : String,
    role : String
    }, {
        collection: 'users'
    });

var Users = mongoose.model('users', schema);

module.exports = Users;