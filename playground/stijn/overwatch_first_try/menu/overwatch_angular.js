var app = angular.module("overwatch", ["ngRoute"]);

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
});

app.config(["$routeProvider", "$locationProvider",
  function($routeProvider, $locationProvider){
    $routeProvider.when('/', {
      templateUrl: "index.html",
    }).when("/home", {
      templateUrl: "partials/home.html"
    }).when("/statistics", {
      templateUrl: "partials/statistics.html"
    }).when("/sensors", {
      templateUrl: "partials/sensors.html"
    }).when("/social", {
      templateUrl: "partials/social.html"
    })
    $locationProvider.html5Mode(true);
}]);
