var mongoose = require('mongoose');

var UploadSchema = new mongoose.Schema({
	school : String,
	course : String,
	professor : String,
	textbook : String,
	term : String,
	year : Number,
	username: String,
	file: {type : String, default: "abc"}
});

mongoose.model('Upload', UploadSchema);

