angular.module("overwatch", ['ngRoute', 'ngTagsInput', 'ngMessages', 'ngAnimate'])
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

angular.module("overwatch").controller("mainCtrl", function($scope, $rootScope, $location) {
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
//    $location.path("/sensors");
    $rootScope.logged_in = true;
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
    })
    $locationProvider.html5Mode(true);
}]);
