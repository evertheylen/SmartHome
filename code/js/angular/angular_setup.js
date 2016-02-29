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
    $location.path("/sensors");
    $rootScope.logged_in = true;
    $scope.$on("ngRepeatFinished", function(ngRepeatFinishedEvent) {
        componentHandler.upgradeDom();
    });
});

angular.module("overwatch").config(["$routeProvider", "$locationProvider",
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
