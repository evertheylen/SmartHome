angular.module("overwatch").controller("indexController", function($scope, $rootScope, $location, Auth, $state) {
	$scope.$on("$destroy", function() {
			cache.removeScope($scope);
	});
	$rootScope.$state = $state;
	$rootScope.simple_css = false;
	$rootScope.auth_user = Auth.getUser();
	$rootScope.tab = "";
    $rootScope.page_title = "OverWatch";
	if (Auth.isLoggedIn()) {
	    $location.path("/home");  
	}
	
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
	$scope.$on("$destroy", function() {
			cache.removeScope($scope);
	});
	$scope.wrong_login = false;
	$scope.login = function() {
		if ($scope.login_form.$valid) {
			ws.request({type: "login", data: {email: $scope.email, password: $scope.password}}, function(response) {
				if (response.success) {	
                    console.log("REACHED LOGIN SUCCES");
					$rootScope.logged_in = true;
					document.getElementById("dlgLogin").close();
					$rootScope.auth_user = response.user;
					Auth.setUser(response.user);
					console.log(response.UID);
					$scope.wrong_login = false;
					$location.path("/home");
				} else {
					$scope.wrong_login = true;
				}
                console.log("REACHED LOGIN");
				$scope.$apply();
			}, $scope);
		}
	};
	componentHandler.upgradeDom();
});

angular.module("overwatch").controller("signupController", function($scope, $rootScope, $location, Auth) {
	$scope.$on("$destroy", function() {
			cache.removeScope($scope);
	});
	$scope.auth_user = null;
	$scope.wrong_signup = false;
	$scope.signup = function() {
		if($scope.signup_form.$valid) {
	    		ws.request({type: "signup", data: {first_name: $scope.first_name, last_name: $scope.last_name, email: $scope.email, password: $scope.password}}, function(response){
				if (response.success) {
				    document.getElementById("dlgSignup").close();
	    			ws.request({type: "login", data: {email: $scope.email, password: $scope.password}}, function(response) {
				        if (response.success) {	
					        $rootScope.logged_in = true;
					        $rootScope.auth_user = response.user;
					        Auth.setUser(response.user);
					        console.log(response.UID);
					        $scope.wrong_login = false;
					        $location.path("/home");
				        } else {
					        $scope.wrong_login = true;
				        }
				        $scope.$apply();
			        }, $scope);
				} else {
					$scope.wrong_signup = true; 
			    	}
			    $scope.$apply();
		    }, $scope);
		}
	};
	componentHandler.upgradeDom();
});

