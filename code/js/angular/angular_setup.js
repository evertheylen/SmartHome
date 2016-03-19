// TODO
//  Cookie for the internationalization


angular.module("overwatch", ['ui.bootstrap', 'ngRoute', 'ngTagsInput', 'ngMessages', 'ngCookies', 'googlechart'])
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

angular.module('overwatch').filter('startFrom', function() {
    return function(input, start) {
        if(input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});

angular.module("overwatch").run(function($rootScope, $location, Auth) {
    $rootScope.$on('$routeChangeStart', function(event) {
        //console.log(Auth.getUser());
        console.log(Auth.isLoggedIn());
        if (!Auth.isLoggedIn() && $location.path() != '/') {
            event.preventDefault();
            console.log("Gandalf calmly states that you have no rights to access these pages...\n'YOU SHALL NOT PASS - Gandalf'");
            $location.path('/');
        } else if ($location.path() != '/') {
            console.log("Pass :)");
        }  
    });  
});

angular.module("overwatch").factory('Auth', function($rootScope) {
    return {
        setUser : function(user) {
            console.log("USER COOKIE: " + JSON.stringify(user.toJSON()));
            setCookie("user", JSON.stringify(user.toJSON()), 365);
        },
        
        getUser : function() {
            if (getCookie("user") != "") {
                var temp_user = JSON.parse(getCookie("user"));
                console.log(temp_user);
                return new User(temp_user["UID"], temp_user["email"], temp_user["first_name"], temp_user["last_name"]);
            } else {
                return null;            
            }
        },
    
        isLoggedIn : function() {
            return (getCookie("session") != "");
        }
    }
});

angular.module("overwatch").controller("mainController", function($scope, $rootScope, $location, Auth) {
    $scope.language = 0;
    
    $scope.i18n = function(input) {
        return html_strings[input][$scope.language];
    };
    
    $rootScope.logged_in = Auth.isLoggedIn();
    //$rootScope.auth_user = Auth.getUser();
    $scope.logout = function() {
        console.log("logging Out");
        setCookie("session", "", 1);
        $rootScope.logged_in = Auth.isLoggedIn();
        $location.path("/");
        setCookie("user", "", 365);
    }
    
    $scope.$on("ngRepeatFinished", function(ngRepeatFinishedEvent) {
        componentHandler.upgradeDom();
    });
	$rootScope.confirm_dialog = document.getElementById('dlgConfirm');
	$rootScope.confirm = function (value) {  
	    $scope.$broadcast("confirmation", value);
	    $rootScope.confirm_dialog.close();
	}
	
	$scope.$on('$locationChangeStart', function() {
	    console.log("Changing Location: " + $location.path());
	});
	
	$scope.$on('$locationChangeSuccess', function() {
	    console.log("New Location: " + $location.path());
	});
	
    $rootScope.auth_user = Auth.getUser();

    console.log("Auth user is : " + $rootScope.auth_user);
	
	$scope.hideDrawer = function () {
	    console.log(document.getElementsByClassName('mdl-layout__drawer'));
	    console.log(document.getElementsByClassName('mdl-layout__obfuscator'));
	    removeClass(document.getElementsByClassName('mdl-layout__drawer')[0],'is-visible');
	    removeClass(document.getElementsByClassName('mdl-layout__obfuscator')[0], 'is-visible');
	}
});

angular.module("overwatch").config(["$routeProvider", "$locationProvider",
  function($routeProvider, $locationProvider){
    $routeProvider.when("/", {
        templateUrl: "/html/partials/index_tmp.html"
    }).when("/home", {
      templateUrl: "/html/partials/home_tmp.html"
    }).when("/statistics", {
      templateUrl: "/html/partials/statistics_tmp.html"
    }).when("/sensors", {
      templateUrl: "/html/partials/sensors_tmp.html"
    }).when("/social", {
      templateUrl: "/html/partials/social_tmp.html"
    }).otherwise( {
        redirectTo: '/'
    });
    $locationProvider.html5Mode(true);
}]);
