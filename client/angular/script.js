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
	var keys = {};
	var loggedIn;
	// view

	factory.getUsers = function (callback){
		$http.get('/users').success(function(output){
			callback(output);
		});
	}
	// add
	factory.addUser = function (info, callback){
		// console.log(info);
		$http.post('/add_user', info).success(function(output){
			callback(output);
		});
	}
	// login
	factory.loginUser = function (info, callback){
		// console.log(info);
		$http.post('/login_user', info).success(function (output){
			if(output.message){
				callback("losing")
			}
			else{
				console.log("TESTING");
				currentUser = output.response;
				console.log(output);
				keys = {
					's3': output.s3,
					'secret': output.secret
				}
				factory.keys = keys;
				callback(output);
			}
		});
	}
	return factory
})

//------------------auth controller
share_line.controller("authController", function ($scope, UserFactory, $location, $cookieStore){

	if($cookieStore.get('loggedIn')){
			$scope.loggedIn = $cookieStore.get('loggedIn');
			UserFactory.currentUser = $cookieStore.get('currentUser');
			// console.log(UserFactory.currentUser);
			$location.path("/main");
	}

	//add
	$scope.addUser = function(user){
		var self = this;
		UserFactory.addUser(user, function(param1){
			self.loginUser(user);
		});
	}
	
	//login
	$scope.loginUser = function(user){
		UserFactory.loginUser(user, function(param1){
			if(param1 == "losing"){
				$scope.wrong = {error : 'Invalid Email or Password'}
			}
			else{
				$scope.loggedIn = true;
				$cookieStore.put('loggedIn', 'true');
				$cookieStore.put('currentUser', param1[0]);
				UserFactory.currentUser = param1[0];
				$location.path('/main');
			}
		});
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
		// console.log(info);
		$http.post('/destroy_upload', info).success(function(output){
			callback(output);
		});
	}
	return factory
})
//------------------upload controller
share_line.controller("UploadsController", function ($scope, UploadFactory, UserFactory, $location, $http){
	
	$scope.progressBarPercentage = 0;

	$scope.$on('Upload', function (event, data){
		$scope.fileUploaded = data.fileUploaded;
		if (!($scope.add_upload)){
			$scope.add_upload = {};
		}
		$scope.add_upload.file = data.fileName;
		// console.log(data);
	});

	$scope.download = function(upload){
		return "http://shareline.s3-website-us-west-1.amazonaws.com/" + upload.file;
	};

	$scope.currentUser = UserFactory.currentUser;

	// view
	UploadFactory.getUploads(function (data){
		$scope.uploads = data;
		// console.log(data);
	});
	// add
	$scope.addUpload = function(){
		UploadFactory.addUpload($scope.add_upload, function(param1){
		});

		$location.path('/main');
	}
	// delete
	$scope.deleteUpload = function(data){
		UploadFactory.deleteUpload(data, function (data){
			UploadFactory.getUploads(function (data){
				$scope.uploads = data;
			})
		});
	}
	
})

share_line.controller('MyCtrl', ['$scope', 'Upload', '$timeout', 'UserFactory', function ($scope, Upload, $timeout, UserFactory) {
	$scope.fileUploaded = false;
	$scope.progressBarPercentage = { percentage: 0 };


    $scope.$watch('files', function () {
    	if($scope.files){
    		// console.log($scope.files);
			$scope.upload($scope.files);
			$scope.$emit('Upload', {fileUploaded:true, fileName:$scope.files[0].name});
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
	};

	var test = UserFactory;
	console.log(test); 
	$scope.creds = {
	  bucket: 'shareline',
	  access_key: UserFactory.keys.s3,
	  secret_key: UserFactory.keys.secret
	}

	console.log($scope.creds);
	 
	$scope.upload = function(files) {
		'use strict';

		$scope.file = files[0];
		  // Configure The S3 Object 
		  AWS.config.update({ accessKeyId: $scope.creds.access_key, secretAccessKey: $scope.creds.secret_key });
		  // AWS.config.region = 'us-west-1';
		  var bucket = new AWS.S3({ params: { Bucket: $scope.creds.bucket } });
		 
		  if($scope.file) {
		    var params = { Key: $scope.file.name, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };
		 
		    bucket.putObject(params, function(err, data) {
		      if(err) {
		        // There Was An Error With Your S3 Config
		        alert(err);
		        return false;
		      }
		      // else {
		      //   // Success!
		      //   // console.log(data);
		      //   alert('Upload Done');
		      // }
		    })
		    .on('httpUploadProgress', function (progress) {
		          // Log Progress Information
		          var num = Math.round(progress.loaded / progress.total * 100);
		          // console.log( num + '% done');
		          $scope.progressBarPercentage.percentage = num;
		          // console.log($scope.progressBarPercentage.percentage);
		          $scope.$digest();
		        });
		  }
		  else {
		    // No File Selected
		    alert('No File Selected');
		  }
		}
}]);

