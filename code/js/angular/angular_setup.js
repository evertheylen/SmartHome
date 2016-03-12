angular.module("overwatch", ['ngRoute', 'ngTagsInput', 'ngMessages', 'ngAnimate', 'ngCookies'])
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

angular.module("overwatch").directive('afterRender', ['$timeout', function ($timeout) {
    var def = {
        restrict: 'A',
        terminal: true,
        transclude: false,
        link: function (scope, element, attrs) {
            $timeout(scope.$eval(attrs.afterRender), 0);  //Calling a scoped method
        }
    };
    return def;
}]);

angular.module("overwatch").run(function($rootScope, $location, Auth) {
    $rootScope.$on('$routeChangeStart', function(event) {
        //console.log(Auth.getUser());
        console.log(Auth.isLoggedIn());
        if (!Auth.isLoggedIn() && $location.path() != '/') {
            event.preventDefault();
            console.log("YOU SHALL NOT PASS");
            $location.path('/');
        } else if ($location.path() != '/') {
            console.log("Pass :)");
        }  
    });  
});

angular.module("overwatch").factory('Auth', function($cookies, $rootScope) {
    var user;
    /*return {
        setUser : function(aUser) {
            user = aUser;
            $cookies.put("username", user);
            $rootScope.$broadcast("login_change");
        },
        getUser : function() {
            return $cookies.get("username");
        },
        isLoggedIn : function() {
            return ($cookies.get("username")) ? $cookies.get("username") : false;
        },
        clearCookies: function() {
            $cookies.remove("username");
        }
    };*/
    return {
        isLoggedIn : function() {
            return (getCookie("session") != "");
        }
    }
});

angular.module("overwatch").controller("mainCtrl", function($scope, $rootScope, $location, Auth) {
    $scope.language = 0;
    $scope.i18n = function(input) {
        return html_strings[input][$scope.language];
    };
   // $scope.$on("login_change", function() {
     //   $rootScope.auth_user = Auth.getUser();
       // $rootScope.logged_in = Auth.isLoggedIn();    
    //});
    //$rootScope.auth_user = Auth.getUser();
    $rootScope.logged_in = Auth.isLoggedIn();
    $scope.logout = function() {
        console.log("logging Out");
        //Auth.clearCookies();
        setCookie("session", "", 1);
        $rootScope.logged_in = Auth.isLoggedIn();
        //$rootScope.auth_user = Auth.getUser();
        $location.path("/");
    }
    
    //$rootScope.user = Auth.getUser();
    
    //TODO DEVELOPMENT CODE DELETE THIS!!!!!!
//    $location.path("/sensors");
    //$rootScope.logged_in = true;
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
