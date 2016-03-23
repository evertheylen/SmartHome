angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    componentHandler.upgradeDom();
});
