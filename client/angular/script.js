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
    	if($scope.files){
			$scope.upload($scope.files);
		}
    });
    $scope.log = '';

    $scope.policy = {
	    "Version": "2012-10-17",
	    "Statement": [
	        {
	            "Sid": "Stmt1439503701000",
	            "Effect": "Allow",
	            "Action": [
	                "s3:PutObject"
	            ],
	            "Resource": [
	                "arn:aws:s3:::shareline"
	            ]
	        }
	    ]
	}


	$scope.creds = {
	  bucket: 'shareline',
	  access_key: '',
	  secret_key: ''
	}
	 
	$scope.upload = function(files) {
		'use strict';

		$scope.file = files[0];
		  // Configure The S3 Object 
		  AWS.config.update({ accessKeyId: $scope.creds.access_key, secretAccessKey: $scope.creds.secret_key });
		  // AWS.config.region = 'us-west-1';
		  var bucket = new AWS.S3({ params: { Bucket: $scope.creds.bucket } });
		 
		  if($scope.file) {
		    var params = { Key: $scope.file.name, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };

		    // bucket.getObject({ Key: $scope.file.name, Bucket: $scope.creds.bucket}, function(err, data) {
		    //   if(err) {
		    //     // There Was An Error With Your S3 Config
		    //     alert(err);
		    //     console.log(err);
		    //     return false;
		    //   }
		    //   else {
		    //     // Success!
		    //     console.log(data);
		    //     alert('download Done');
		    //   }
		    // });
		 
		    bucket.putObject(params, function(err, data) {
		      if(err) {
		        // There Was An Error With Your S3 Config
		        alert(err);
		        return false;
		      }
		      else {
		        // Success!
		        console.log(data);
		        alert('Upload Done');
		      }
		    })
		    .on('httpUploadProgress',function(progress) {
		          // Log Progress Information
		          console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
		        });
		  }
		  else {
		    // No File Selected
		    alert('No File Selected');
		  }
		}

    // $scope.upload = function (files) {
    //     if (files && files.length) {
    //         for (var i = 0; i < files.length; i++) {
    //             var file = files[i];



	   //          Upload.upload({
				// 	url: 'https://shareline.s3-website-us-west-1.amazonaws.com', //S3 upload url including bucket name
				// 	method: 'POST',
				// 	fields : {
				// 		key: file.name, // the key to store the file on S3, could be file name or customized
				// 		AWSAccessKeyId: '', 
				// 		acl: 'private', // sets the access to the uploaded file in the bucket: private or public 
				// 		policy: $scope.policy, // base64-encoded json policy (see article below)
				// 		signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
				// 		"Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
				// 		filename: file.name // this is needed for Flash polyfill IE8-9
				// 	},
				// 	file: file,
				// });

                // Upload.upload({
                //     url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                //     fields: {
                //         'username': $scope.username
                //     },
                //     file: file
                // }).progress(function (evt) {
                //     var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //     $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.file.name + '\n' + $scope.log;
                // }).success(function (data, status, headers, config) {
                //     $timeout(function () {
                //         $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                //     });
                // });

// 			console.log(file);
//             }
//         }
//     };
}]);
