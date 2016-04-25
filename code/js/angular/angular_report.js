angular.module("overwatch").controller("reportController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.tab = "reportlink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();
    $rootScope.simple_css = true;
  	componentHandler.upgradeDom();
});	
