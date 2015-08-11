var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = (function(){
	return{
		show: function(req, res){
			User.find({}, function(err, results){
				if(err){
					console.log(err);
				}
				else{
					res.json(results);
				}
			})
		},
		add: function(req, res){
			var add_user = new User({email : req.body.email, username : req.body.username, password : req.body.password});
			add_user.save(function(err, response){
				if(err){
					console.log(err);
				}
				else{
					res.json(response);
				}
			})
		},
		login: function(req, res){
			User.find({email : req.body.email}, function (err, response){
				if(err){
					console.log(err);
				}
				else{
					if(response.length > 0){
						if(req.body.password == response[0].password && req.body.email == response[0].email){
							console.log(response);
							res.json(response);
						}
						else{
							res.json({message : "wrong"});
						}
					}
					else{
						res.json({message : "wrong"});

					}
				}
			})
		}
		
	}
})();//immediate invoke