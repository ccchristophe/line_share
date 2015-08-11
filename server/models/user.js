var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	email : String,
	username : String,
	password : String
});

mongoose.model('User', UserSchema);