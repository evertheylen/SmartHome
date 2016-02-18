var app = angular.module("overwatch", ['ngRoute', 'ngMessages']);

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
  
  // Temporary database that is maintained in the javascript (yuck!)
  $scope.logged_in = false;
  database = [];
  $scope.auth_user = null;
  $scope.signup = function() {
    if($scope.signup_form.$valid) {
      database.push({user_name: $scope.username, email: $scope.email, password: $scope.password});
      document.getElementById('dlgSignup').close();
      //console.log(database[database.length-1]);
    }
  };
  $scope.wrong_login = false;
  $scope.login = function() {
    if ($scope.login_form.$valid) {
      for (var i = 0; i < database.length; i++) {
        if ($scope.username === database[i].user_name && $scope.password === database[i].password) {
          $scope.auth_user = database[i];
          $scope.logged_in = true;
          document.getElementById('dlgLogin').close();
          $scope.wrong_login = false;
          return;
        }
      }
      $scope.wrong_login = true;
    }
  };
});

app.config(["$routeProvider", "$locationProvider",
  function($routeProvider, $locationProvider){
    $routeProvider.when('/', {
      templateUrl: "partials/home.html",
    }).when("/contact", {
      templateUrl: "partials/contact.html"
    }).when("/about", {
      templateUrl: "partials/about.html"
    }).when("/register", {
      templateUrl: "partials/register.html"
    }).otherwise({
      redirectTo: "/"
    })
    $locationProvider.html5Mode(true);
}]);