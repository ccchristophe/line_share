//angular code
var share_line = angular.module('myApp', ['ngRoute','ngAnimate', 'ngCookies', 'ngFileUpload']);

//route config
share_line.config(function ($routeProvider){
	$routeProvider
	.when('/login',{
		templateUrl: 'partials/login.html'
	})
	.when('/register',{
		templateUrl: 'partials/register.html'
	})
	.when('/main',{
		templateUrl: 'partials/main.html'
	})
	.when('/account',{
		templateUrl: 'partials/account.html'
	})
	.when('/upload',{
		templateUrl: 'partials/upload.html'
	})
	.otherwise({
		redirectTo: '/login'
	});
});

share_line.config(function ($animateProvider){
	$animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
});


	// var currentUser;
	// var currentUserName;

//------------------user factory
share_line.factory("UserFactory", function($http){
	var factory = {};
	var users = [];
	var loggedIn;
	// view

	factory.getUsers = function (callback){
		$http.get('/users').success(function(output){
			callback(output);
		});
	}
	// add
	factory.addUser = function (info, callback){
		console.log(info);
		$http.post('/add_user', info).success(function(output){
			callback(output);
		});
	}
	// login
	factory.loginUser = function (info, callback){
		console.log(info);
		$http.post('/login_user', info).success(function (output){
			if(output.message){
				callback("losing")
			}
			else{
				currentUser = output;
				callback(output);
			}
		});
	}
	return factory
})

//------------------user controller
// share_line.controller("UsersController", function ($scope, UserFactory, $location){
// 	// add
// 	$scope.addUser = function(){
// 		UserFactory.addUser($scope.add_user, function(param1){
// 		});
// 		$location.path('/main');
// 	}
// })

//------------------auth controller
share_line.controller("authController", function ($scope, UserFactory, $location, $cookieStore){

	console.log("This is my current user");
	console.log(UserFactory.currentUser);
	console.log("cookie store");
	console.log($cookieStore.get('loggedIn'))
	if($cookieStore.get('loggedIn')){
			$scope.loggedIn = $cookieStore.get('loggedIn');
			UserFactory.currentUser = $cookieStore.get('currentUser');
			console.log("insdie if");
			console.log($scope.loggedIn);
			console.log(UserFactory.currentUser);
			$location.path("/main");
	}

	//add
	$scope.addUser = function(user){
		var self = this;
		UserFactory.addUser(user, function(param1){
			self.loginUser(user);
		});
		
		// console.log(user);
		// $location.path('/main');
		// $scope.loggedIn = true;
	}
	
	//login
	$scope.loginUser = function(user){
		console.log(user);
		UserFactory.loginUser(user, function(param1){
			console.log(param1);
			if(param1 == "losing"){
				$scope.wrong = {error : 'Invalid Email or Password'}
			}
			else{
				//$scope.currentUser = currentUser[0];
				console.log("this is my user");
				console.log(param1);
				$scope.loggedIn = true;
				$cookieStore.put('loggedIn', 'true');
				$cookieStore.put('currentUser', param1[0]);
				//console.log(param1);
				UserFactory.currentUser = param1[0];
				$location.path('/main');
			}


		});

		// $location.path('/main');
	}
	// logoff
	$scope.logOff = function(){
		
			$scope.loggedIn = '';
			$scope.currentUser = '' ;
			$cookieStore.put('loggedIn', '');
			$cookieStore.put('currentUser', '');
			$location.path('/');
	}
})


//------------------upload factory
share_line.factory("UploadFactory", function($http){
	var factory = {};
	var uploads = [];
	// view
	factory.getUploads = function (callback){
		$http.get('/uploads').success(function(output){
			callback(output);
		});
	}
	// add
	factory.addUpload = function (info, callback){
		info.username = currentUser[0].username;
		$http.post('/add_upload', info).success(function(output){
			callback(output);
		});
	}
	// delete
	factory.deleteUpload = function (info, callback){
		console.log(info);
		$http.post('/destroy_upload', info).success(function(output){
			callback(output);
		});
	}
	return factory
})
//------------------upload controller
share_line.controller("UploadsController", function ($scope, UploadFactory, UserFactory, $location){
	
	$scope.currentUser = UserFactory.currentUser;
	console.log("this is the current user in your uploads controller");
	console.log(UserFactory.currentUser);

	// view
	UploadFactory.getUploads(function (data){
		$scope.uploads = data;
		console.log("here are my uploads");
		console.log(data);
	});
	// add
	$scope.addUpload = function(){
		UploadFactory.addUpload($scope.add_upload, function(param1){
		});
		$location.path('/main');
	}
	// delete
	$scope.deleteUpload = function(data){
		console.log(data);
		UploadFactory.deleteUpload(data, function (data){
			UploadFactory.getUploads(function (data){
				$scope.uploads = data;
			})
		});
	}
	
})

share_line.controller('MyCtrl', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                    fields: {
                        'username': $scope.username
                    },
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
                    $timeout(function () {
                        $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    });
                });
            }
        }
    };
}]);
