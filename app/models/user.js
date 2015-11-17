var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserDetail = new Schema({
      username: String,
      password: String
    }, {
      collection: 'userInfo'
    });

var UserDetails = mongoose.model('userInfo', UserDetail);

module.exports = UserDetails;