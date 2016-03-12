angular.module("overwatch").controller("indexView", function($scope, $rootScope) {
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



angular.module("overwatch").controller("loginCtrl", function($scope, $rootScope, $location, Auth) {
	$scope.wrong_login = false;
	$scope.login = function() {
		if ($scope.login_form.$valid) {
		    // TODO REMOVE THIS DEV CODE
		    $rootScope.logged_in = true;
			document.getElementById("dlgLogin").close();
			$scope.wrong_login = false;
			$location.path("/home");
			Auth.setUser("Stijn");
			
			
			ws.request("login", {email: $scope.email, password: $scope.password}, function(response) {
				if (response.succes) {	
					$rootScope.auth_user = $scope.email;
					//$rootScope.user_id = response.UID; TODO Save the user ID and greet him by his full name (left of logout)
					$rootScope.logged_in = true;
					document.getElementById("dlgLogin").close();
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

angular.module("overwatch").controller("signupCtrl", function($scope) {
	$scope.auth_user = null;
	$scope.wrong_signup = false;
	$scope.signup = function() {
		if($scope.signup_form.$valid) {
	    		ws.request("signup", {first_name: $scope.firstname, last_name: $scope.last_name, email: $scope.email, password: $scope.password}, function(response){
				if (response.succes) {
				    document.getElementById("dlgSignup").close();
				} else {
					$scope.wrong_signup = true; 
					// TODO Handle the returned error message.
					switch (response.error) {
						case "DupeEmail":
							break;
						case "DupeUsername":
							break;
						default: 
							break;
					}
			    	}
			    $scope.$apply();
		    });
		}
	};
});
