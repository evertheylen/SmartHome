var app = angular.module("overwatch", ['ngRoute', 'ngMessages'])
    .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

var database = [];
var ws = connect_to_websocket();	// Websocket // TODO

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

app.controller("mainCtrl", function($scope, $rootScope, $location) {
  $scope.language = 0;
  
  $scope.i18n = function(input) {
    return html_strings[input][$scope.language];
  };
  $rootScope.auth_user = null;
  $rootScope.logged_in = false;
  
  $scope.logout = function() {
    $rootScope.auth_user = null;
    $rootScope.logged_in = false;
    $location.path("/");
  }
  
  //TODO DEVELOPMENT CODE DELETE THIS!!!!!!
  //$location.path("/home");
  //$rootScope.logged_in = true;
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

app.controller("sensorView", function($scope, $rootScope) {
    //TODO Get these variables from the database.
    $scope.locations = [{"desc": "Campus Middelheim", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Middelheimlaan", "number": 1}, {"desc": "Campus Groenenborger", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Groenenborgerlaan", "number": 171}, {"desc": "Campus Drie Eiken", "country": "Belgium", "city": "Antwerp", "postalcode": 2610, "street": "Universiteitsplein", "number": 1}];
    var edit_loc_id = null;
    var edit = false;
    $scope.reset_loc = function reset_loc() {
        edit = false;
        edit_loc_id = null;
        $scope.loc_country = null;
        $scope.loc_city = null;
        $scope.loc_postalcode = null;
        $scope.loc_street = null;
        $scope.loc_number = null;
        $scope.loc_desc = null;
        $scope.edit_loc = $scope.i18n("add_location");    
        if (hasClass(document.getElementById("txtfield_LocationCountry"), "is-dirty")) {
            removeClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
        }
        if (hasClass(document.getElementById("txtfield_LocationCity"), "is-dirty")) {
            removeClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
        }
        if (hasClass(document.getElementById("txtfield_LocationZip"), "is-dirty")) {
            removeClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
        }
        if (hasClass(document.getElementById("txtfield_LocationStreet"), "is-dirty")) {
            removeClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
        }
        if (hasClass(document.getElementById("txtfield_LocationNr"), "is-dirty")) {
            removeClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
        }
        if (hasClass(document.getElementById("txtfield_LocationDesc"), "is-dirty")) {
            removeClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
        }
    }
    $scope.save_loc = function save_loc() {
        if ($scope.location_form.$valid) {
            if (edit) {
                $scope.locations[edit_loc_id].country = $scope.loc_country;
                $scope.locations[edit_loc_id].city = $scope.loc_city;
                $scope.locations[edit_loc_id].postalcode = $scope.loc_postalcode;
                $scope.locations[edit_loc_id].street = $scope.loc_street;
                $scope.locations[edit_loc_id].number = $scope.loc_number;
                $scope.locations[edit_loc_id].desc = $scope.loc_desc;
            } else {
                var new_location = {};
                new_location.country = $scope.loc_country;
                new_location.city = $scope.loc_city;
                new_location.postalcode = $scope.loc_postalcode;
                new_location.street = $scope.loc_street;
                new_location.number = $scope.loc_number;
                new_location.desc = $scope.loc_desc;
                $scope.locations.push(new_location);
            }
            $scope.dialog.close();
        }
    }   
    function set_loc(id) {
        edit = true;
        $scope.loc_country = $scope.locations[id].country;
        $scope.loc_city = $scope.locations[id].city;
        $scope.loc_postalcode = $scope.locations[id].postalcode;
        $scope.loc_street = $scope.locations[id].street;
        $scope.loc_number = $scope.locations[id].number;
        $scope.loc_desc = $scope.locations[id].desc;
        addClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
        addClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
        addClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
        addClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
        addClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
        addClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
        $scope.edit_loc = $scope.i18n("edit_location");
        edit_loc_id = id;
        componentHandler.upgradeDom();    
    }
    
    $scope.reset_loc();
    $scope.$on("ngRepeatFinished", function(ngRepeatFinishedEvent) {
        componentHandler.upgradeDom();
    });
    
	$scope.dialog = document.getElementById('dlgLocation');
	var showDialogButton = document.getElementById('btnAddLoc');
	showDialogButton.addEventListener('click', function(){
		$scope.dialog.showModal();
	});
	
	document.getElementById('btnLocationBack').addEventListener('click', function(){
		$scope.dialog.close();
	});
	var dialog2 = document.getElementById('dlgSensor');
	var showDialogButton2 = document.getElementById('btnAddSensor');
	showDialogButton2.addEventListener('click', function(){
		dialog2.showModal();
	});
	document.getElementById('btnSensorBack').addEventListener('click', function(){
		dialog2.close();
	});
	
	$scope.delete = function (id) {
	    for (var i = 0; i < $scope.locations.length; i++) {
	        console.log($scope.locations[i]);
	    }
	    console.log($scope.locations);
	    if (confirm('Are you sure you want to delete this item?')) {
	        if ($scope.locations.length === 1) {
	            $scope.locations = [];
	            return;
	        }
	        $scope.locations.splice(id, 1);    // TODO Do this shit in database
	    };
	};
	
    $scope.open_dialog = function(element_id, location_id) {
        var element = document.getElementById(element_id);
        element.showModal();
        set_loc(location_id);
        componentHandler.upgradeDom();
    }
	
    componentHandler.upgradeDom();
});

app.controller("loginCtrl", function($scope, $rootScope, $location) {
  $scope.wrong_login = false;
  $scope.login = function() {
    if ($scope.login_form.$valid) {
	
	// COMMUNICATION WITH JEROEN :D
	// PSEUDO : send("login", { ... data ... }, function(){ ... funtion stuff with switch for success, fail, ... });
	ws.request("login", {user_name: $scope.username, email: $scope.email, password: $scope.password}, function(successful_login) {
		if (successful_login) {	
			//$rootScope.auth_user = // TODO response(user);
			console.log("Executing successful login");
			$rootScope.auth_user = $scope.username;	 // The authenticated user is only the username
			$rootScope.logged_in = true;
			document.getElementById("dlgLogin").close();
			$scope.wrong_login = false;
			$location.path("/home");
			$scope.$apply();
			console.log($location.path);
		} else {
		    console.log("wrong login!");
			$scope.wrong_login = true;
		}
	}); // TODO
	/*
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
	*/
    }
  };
});

app.controller("signupCtrl", function($scope) {
  $scope.auth_user = null;
  $scope.wrong_signup = false;
  $scope.signup = function() {
    if($scope.signup_form.$valid) {
	    ws.request("signup", {user_name: $scope.username, email: $scope.email, password: $scope.password}, function(successful_signup){
		    if (successful_signup) {
			    document.getElementById("dlgSignup").close();	
		    } else {
			    $scope.wrong_signup = true;
		    }
	    });
	}; // TODO
	/*
      database.push({
				  user_name: $scope.username,
				  email: $scope.email,
				  password: $scope.password
				});
      document.getElementById('dlgSignup').close();
    }*/
  };
});

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
