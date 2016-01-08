var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    email : String,
    password: String,
    role : String
    }, {
        collection: 'users'
    });

var Users = mongoose.model('users', schema);

module.exports = Users;