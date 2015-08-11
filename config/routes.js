var uploads = require('./../server/controllers/uploads');
var users = require('./../server/controllers/users');

module.exports = function(app){
	// users
	app.get('/users', function (req, res){
		users.show(req, res);
	});

	app.post('/add_user', function (req, res){
		console.log(req.body);
		users.add(req, res);
	});

	app.post('/login_user', function (req, res){
		console.log("IN ROUTE");
		users.login(req, res);
	});

	// uploads
	app.get('/uploads', function (req, res){
		uploads.show(req, res);
	});

	app.post('/add_upload', function (req, res){
		console.log(req.body);
		uploads.add(req, res);
	});

	app.post('/destroy_upload', function(req, res){
		console.log(req.body);
		uploads.destroy(req, res);
	});

};