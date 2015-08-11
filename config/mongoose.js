//this is a config file that connects to MongoDB and loads all of our models for us. We did this here because we don't want to have it connect to the DB every time we require a model.
//require mongoose
var mongoose = require('mongoose');
//require file-system so that we can load, read, require all of the model files
var fs = require('fs');
//connect to the database
mongoose.connect('mongodb://localhost/line_share');
//specify the path to all of the models
var models_path =__dirname + '/../server/models';
//read all of the files in the models_path and for each one check if it is a javascript file before requiring it
fs.readdirSync(models_path).forEach(function(file){
	if( file.indexOf('.js') ){
		require(models_path + '/' + file);
	}
});