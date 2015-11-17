var mongoose = require('mongoose');


var schema = new mongoose.Schema({
      username: String,
      password: String,
      email : String,
      role : String,
    }, {
      collection: 'users'
    });

var Users = mongoose.model('users', schema);

module.exports = Users;