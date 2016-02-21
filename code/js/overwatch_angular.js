var app = angular.module("overwatch", ['ngRoute', 'ngMessages']);
var database = [];

app.controller("mainCtrl", function($scope, $rootScope) {
  $scope.html_strings = {
    "home": ["Home ", "Start "], "contact": ["Contact ", "Contacteer "], "about": ["About ", "Over "], "language": ["Language", "Taal"],
    "register": ["Signup", "Registreer"], "login": ["Login", "Inloggen"], "logout": ["Logout", "Afmelden"], "homepage_welcome": ["Welcome to", "Welkom bij"],
    "username": ["Username", "Gebruikersnaam"], "password": ["Password", "Paswoord"], "privacy": ["Privacy & Terms", "Privacy & Condities"], 
    "required_field": ["This field is required", "Dit veld is verplicht"], "login_error": ["Wrong username or password!", "Foute gebruikersnaam of paswoord!"],
    "back": ["Back", "Terug"], "invalid_email": ["Please input a valid email address", "Gelieve een geldig emailadres in te geven"], 
    "invalid_password": ["Password must contain at least 8 characters", "Paswoord moet minstens 8 tekens bevatten"]};
  $scope.language = 0;
  
  $scope.i18n = function(input) {
    return $scope.html_strings[input][$scope.language];
  };
  $rootScope.auth_user = null;
  $rootScope.logged_in = false;
});

app.controller("loginCtrl", function($scope, $rootScope) {
  $scope.wrong_login = false;
  $scope.login = function() {
    if ($scope.login_form.$valid) {
      for (var i = 0; i < database.length; i++) {
        console.log(database[i]);
        if ($scope.username === database[i].user_name && $scope.password === database[i].password) {
          $rootScope.auth_user = database[i];
          $rootScope.logged_in = true;
          document.getElementById('dlgLogin').close();
          $scope.wrong_login = false;
          return;
        }
      }
      $scope.wrong_login = true;
    }
  };
});

app.controller("signupCtrl", function($scope) {
  $scope.auth_user = null;
  $scope.signup = function() {
    if($scope.signup_form.$valid) {
      database.push({
				  user_name: $scope.username,
				  email: $scope.email,
				  password: $scope.password
				});
      document.getElementById('dlgSignup').close();
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
