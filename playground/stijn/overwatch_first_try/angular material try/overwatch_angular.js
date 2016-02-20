var app = angular.module("overwatch", ["ngRoute", "ngMaterial"]);

app.controller("mainCtrl", function($scope) {
  $scope.user = {first_name: "Stijn", last_name: "Janssens"};
  $scope.html_strings = {
    "home": ["Home ", "Start "], "contact": ["Contact ", "Contacteer "], "about": ["About ", "Over "], "language": ["Language", "Taal"],
    "register": ["Register", "Registreer"], "login": ["Login", "Inloggen"], "homepage_welcome": ["Welcome to", "Welkom bij "],
    "username": ["Username", "Gebruikersnaam"], "password": ["Password", "Paswoord"]};
  $scope.language = 0;
  
  $scope.i18n = function(input) {
    return $scope.html_strings[input][$scope.language];
  };
  $scope.selectedIndex = 0;

  $scope.$watch('selectedIndex', function(current, old) {
    switch(current) {
      case 0: $location.url("/view1"); break;
      case 1: $location.url("/view2"); break;
      case 2: $location.url("/view3"); break;

    }
  });
});

app.config(["$routeProvider", "$locationProvider",
  function($routeProvider, $locationProvider){
    /*$routeProvider.when('/', {
      templateUrl: "index.html",
    }).when("/home", {
      templateUrl: "partials/home.html"
    }).when("/statistics", {
      templateUrl: "partials/statistics.html"
    }).when("/sensors", {
      templateUrl: "partials/sensors.html"
    }).when("/social", {
      templateUrl: "partials/social.html"
    })*/
    $routeProvider.when("/view1", {templateUrl: "partials/view1.html"});
    $routeProvider.when("/view2", {templateUrl: "partials/view2.html"});
    $routeProvider.when("/view3", {templateUrl: "partials/view3.html"});
    $routeProvider.otherwise({redirectTo: "/view1"});
    $locationProvider.html5Mode(true);
}]);