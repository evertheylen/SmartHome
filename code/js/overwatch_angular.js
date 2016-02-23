var app = angular.module("overwatch", ['ngRoute', 'ngMessages']);
var database = [];
//var ws = connect_to_websocket();	// Websocket // TODO

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

app.controller("mainCtrl", function($scope, $rootScope) {
  $scope.language = 0;
  
  $scope.i18n = function(input) {
    return html_strings[input][$scope.language];
  };
  $rootScope.auth_user = null;
  $rootScope.logged_in = false;
});

app.controller("indexView", function($scope, $rootScope) {
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

app.controller("homeView", function($scope, $rootScope) {
    var layout = document.getElementById("mainLayout");
    if (hasClass(layout, "mdl-layout--no-drawer-button")) {
        removeClass(layout, "mdl-layout--no-drawer-button");
    }
	componentHandler.upgradeDom();
});

app.controller("loginCtrl", function($scope, $rootScope, $location) {
  $scope.wrong_login = false;
  $scope.login = function() {
    if ($scope.login_form.$valid) {
	
	// COMMUNICATION WITH JEROEN :D
	// PSEUDO : send("login", { ... data ... }, function(){ ... funtion stuff with switch for success, fail, ... });
	/*ws.request("login", {user_name: $scope.username, email: $scope.email, password: $scope.password}, function(successful_login) {
		if (successful_login) {	
			//$rootScope.auth_user = // TODO response(user);
			$rootScope.auth_user = $scope.username;	 // The authenticated user is only the username
			$rootScope.logged_in = true;
			document.getElementById("dlgLogin").close();
			$scope.wrong_login = false;
			$location.path("/home");
		} else {
			$scope.wrong_login = true;
		}
	});*/ // TODO
	
      for (var i = 0; i < database.length; i++) {
        console.log(database[i]);
        if ($scope.username === database[i].user_name && $scope.password === database[i].password) {
          $rootScope.auth_user = database[i];
          $rootScope.logged_in = true;
          document.getElementById('dlgLogin').close();
          $scope.wrong_login = false;    
          // This will change the URL fragment. The change is reflected
        // on your browser's address bar as well
          $location.path("/home");
          return;
        }
      }
      $scope.wrong_login = true;
	
    }
  };
});

app.controller("signupCtrl", function($scope) {
  $scope.auth_user = null;
  $scope.wrong_signup = false;
  $scope.signup = function() {
    /*if($scope.signup_form.$valid) {
	ws.request("signup", {user_name: $scope.username, email: $scope.email, password: $scope.password}, function(successful_signup){
		if (successful_signup) {
			document.getElementById("dlgSignup").close();	
		} else {
			$scope.wrong_signup = true;
		}
	});*/ // TODO
	
      database.push({
				  user_name: $scope.username,
				  email: $scope.email,
				  password: $scope.password
				});
      document.getElementById('dlgSignup').close();
    }
  });
//});

app.config(["$routeProvider", "$locationProvider",
  function($routeProvider, $locationProvider){
    $routeProvider.when("/", {
        templateUrl: "/html/partials/index_tmp.html"

    }).when("/home", {
      templateUrl: "partials/home_tmp.html"
    }).when("/statistics", {
      templateUrl: "partials/statistics_tmp.html"
    }).when("/sensors", {
      templateUrl: "partials/sensors_tmp.html"
    }).when("/social", {
      templateUrl: "partials/social_tmp.html"
    }).otherwise({
        redirectTo: "/"
    });
    $locationProvider.html5Mode(true);
}]);
