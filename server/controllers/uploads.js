var mongoose = require('mongoose');
var Upload = mongoose.model('Upload');

module.exports = (function(){
	return{
		show: function(req, res){
			Upload.find({}, function(err, results){
				if(err){
					console.log(err);
				}
				else{
					res.json(results);
				}
			})
		},
		add: function(req, res){
			var add_upload = new Upload({school : req.body.school, course : req.body.course, professor : req.body.professor, textbook : req.body.textbook, term : req.body.term, year : req.body.year, username : req.body.username, file : req.body.file})
			add_upload.save(function(err, response){
				if(err){
					console.log(err);
				}
				else{
					res.end();
				}
			})
		},
		destroy: function(req, res){
			console.log(req.body);
			Upload.remove({_id : req.body._id}, function(err, response){
				if(err){
					console.log(err);
				}
				else{
					res.end();
				}
			})
		}
	}
})();