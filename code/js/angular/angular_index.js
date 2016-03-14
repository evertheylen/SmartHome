angular.module("overwatch").controller("indexController", function($scope, $rootScope) {
	$scope.dialog = document.getElementById('dlgLogin');
	var showDialogButton = document.getElementById('btnLogin');
	showDialogButton.addEventListener('click', function(){
		$scope.dialog.showModal();
	});
	document.getElementById('btnDialogBack').addEventListener('click', function(){
		$scope.dialog.close();
	});
	var dialog2 = document.getElementById('dlgSignup');
	var showDialogButton2 = document.getElementById('btnSignup');
	showDialogButton2.addEventListener('click', function(){
		dialog2.showModal();
	});
	document.getElementById('btnSignupBack').addEventListener('click', function(){
		dialog2.close();
	});
	$scope.dialog_login = document.getElementById("dlgLogin");
	$scope.dialog_signup = dialog2;
	var layout = document.getElementById("mainLayout");
	if (!hasClass(layout, "mdl-layout--no-drawer-button")) {
	    addClass(layout, "mdl-layout--no-drawer-button");
	}
	componentHandler.upgradeDom();
});



angular.module("overwatch").controller("loginController", function($scope, $rootScope, $location, Auth) {
	$scope.wrong_login = false;
	$scope.login = function() {
		if ($scope.login_form.$valid) {
			ws.request("login", {email: $scope.email, password: $scope.password}, function(response) {
				if (response.succes) {	
					$rootScope.logged_in = true;
					document.getElementById("dlgLogin").close();
					$rootScope.auth_user = new User(response.UID, response.firstName, response.lastName, $scope.email);
					console.log(response.UID);
					$scope.wrong_login = false;
					$location.path("/home");
				} else {
					$scope.wrong_login = true;
				}
				$scope.$apply();
			});
		}
	};
});

angular.module("overwatch").controller("signupController", function($scope) {
	$scope.auth_user = null;
	$scope.wrong_signup = false;
	$scope.signup = function() {
		if($scope.signup_form.$valid) {
	    		ws.request("signup", {first_name: $scope.first_name, last_name: $scope.last_name, email: $scope.email, password: $scope.password}, function(response){
				if (response.succes) {
				    document.getElementById("dlgSignup").close();
				} else {
					$scope.wrong_signup = true; 
			    	}
			    $scope.$apply();
		    });
		}
	};
});
