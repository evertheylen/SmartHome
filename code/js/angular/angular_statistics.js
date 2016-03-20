angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.page_title = "- Statistics";
    componentHandler.upgradeDom();
});
