angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth) {
$rootScope.auth_user = Auth.getUser();
    componentHandler.upgradeDom();
});
