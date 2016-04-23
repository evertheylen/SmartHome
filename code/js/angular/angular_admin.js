angular.module("overwatch").controller("adminController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.tab = "adminlink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();
  	componentHandler.upgradeDom();
    
    $scope.enter_command = function() {
      
      document.getElementById('output').innerHTML += document.getElementById("terminal_input").innerHTML;
      document.getElementById("terminal_input").innerHTML = "";
    }
});	
