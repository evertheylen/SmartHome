var app = angular.module("overwatch", []);

app.controller("mainCtrl", function($scope) {
  $scope.user = {first_name: "Stijn", last_name: "Janssens"};
  $scope.html_strings = {
    "home": ["Home ", "Start "], "contact": ["Contact ", "Contact "], "about": ["About ", "Over "], "language": ["Language", "Taal"],
    "register": ["Register", "Registreer"], "login": ["Login", "Inloggen"], "homepage_welcome": ["Welcome to", "Welkom bij "],
    "username": ["Username", "Gebruikersnaam"], "password": ["Password", "Paswoord"]};
  $scope.language = 0;
  
  $scope.i18n = function(input) {
    return $scope.html_strings[input][$scope.language];
  };
});
